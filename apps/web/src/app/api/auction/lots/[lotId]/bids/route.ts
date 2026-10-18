/**
 * POST /api/auction/lots/[lotId]/bids
 *
 * Verkäufer gibt ein Gebot ab (ruft PriceEngine auf).
 * Race Condition Protected: Row-Level-Lock in price-engine.ts.
 *
 * GET: Anonymisierte Gebotshistorie für Buyer-View
 *
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { placeBid, type BidCbamData } from "@/lib/auction/price-engine";
import { checkBidEligibility } from "@/lib/auction/kyc-guard";
import { notifyOutbid, notifyLeading } from "@/lib/notifications/notification-service";
import { db } from "@/lib/db/client";
import { z } from "zod";
import Decimal from "decimal.js";
import { audit } from "@/lib/audit/logger";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { publishEvent } from "@/lib/realtime/event-bus";

export const dynamic = "force-dynamic";

const bidSchema = z.object({
  price:    z.number().positive(),
  chargeId: z.string().optional(),
  cbam: z.object({
    cbamCountryOfOrigin:     z.string().length(2).optional(),
    cbamCountryOfExport:     z.string().length(2).optional(),
    cbamProductionSiteId:    z.string().optional(),
    cbamCo2DirectPerTonne:   z.number().nonnegative().optional(),
    cbamCo2IndirectPerTonne: z.number().nonnegative().optional(),
    cbamCarbonPricePaid:     z.number().nonnegative().optional(),
    cbamVerificationRef:     z.string().optional(),
  }).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  try {
    return await _handlePost(req, params);
  } catch (err) {
    console.error("[POST /bids] unhandled error:", err);
    return NextResponse.json(
      { error: "Interner Fehler", detail: String(err) },
      { status: 500 }
    );
  }
}

async function _handlePost(
  req: NextRequest,
  params: Promise<{ lotId: string }>
) {
  const { lotId } = await params;

  // ── Rate Limit ────────────────────────────────────────────────────
  const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? req.headers.get("x-real-ip")
            ?? "127.0.0.1";
  const rl  = await checkRateLimit(ip, "bid");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Zu viele Gebote - bitte warten Sie einen Moment." },
      { status: 429, headers: { ...rateLimitHeaders(rl), "Retry-After": "60" } }
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  // ── Validation ────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  // ── Role-Check: nur SELLER darf Gebote abgeben ───────────────────
  const BIDDER_ROLES = ["SELLER", "BROKER", "ADMIN", "SUPER_ADMIN"] as const;
  if (!BIDDER_ROLES.includes(token.role as typeof BIDDER_ROLES[number])) {
    return NextResponse.json({ error: "Nur Verkäufer können Gebote abgeben" }, { status: 403 });
  }

  // ── KYC + Deposit-Check ───────────────────────────────────────────
  const eligibility = await checkBidEligibility(token.userId, lotId);
  if (!eligibility.ok) {
    return NextResponse.json(
      { error: eligibility.error, kycRequired: eligibility.kycRequired, depositRequired: eligibility.depositRequired },
      { status: eligibility.code }
    );
  }

  // ── Lot laden (für CBAM + Plattform-Hartlimit) ───────────────────
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      quantity:         true,
      co2PerTonne:      true,
      phase:            true,
      buyerId:          true,
      buyer:            { select: { organizationId: true } },
      auctionEnd:       true,
      extendedCount:    true,
      maxExtensions:    true,
      extensionMinutes: true,
    },
  });
  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });

  // ── Interessenkonflikt-Sperre: Käufer darf nicht gleichzeitig bieten ──
  if (lot.buyerId === token.userId) {
    return NextResponse.json(
      { error: "Käufer dieses Lots kann kein Verkaufsgebot abgeben" },
      { status: 409 }
    );
  }

  // ── Organisations-Sperre: Käufer und Verkäufer dürfen nicht zur selben Org gehören ──
  const seller = await db.user.findUnique({
    where:  { id: token.userId },
    select: { organizationId: true },
  });
  if (seller?.organizationId && lot.buyer?.organizationId &&
      seller.organizationId === lot.buyer.organizationId) {
    return NextResponse.json(
      { error: "Gebot nicht möglich: Käufer und Verkäufer gehören zur selben Organisation (Interessenkonflikt)" },
      { status: 409 }
    );
  }

  // ── CBAM-Precheck: CBAM-Lots erfordern SellerCharge mit CO₂-Daten ───
  if (lot.co2PerTonne !== null) {
    if (!parsed.data.chargeId) {
      return NextResponse.json(
        { error: "CBAM-Pflicht: Bitte eine Lagercharge mit CO₂-Daten auswählen (chargeId erforderlich)." },
        { status: 422 }
      );
    }
    const validCharge = await db.sellerCharge.findFirst({
      where: {
        id:          parsed.data.chargeId,
        sellerId:    token.userId,
        co2PerTonne: { not: null },
        OR: [
          { status: "AVAILABLE" },
          { status: "RESERVED", reservedForLotId: lotId },
        ],
      },
      select: { id: true },
    });
    if (!validCharge) {
      return NextResponse.json(
        { error: "CBAM-Pflicht: Gewählte SellerCharge nicht gefunden, nicht Ihnen zugeordnet, ohne CO₂-Daten oder für ein anderes Lot reserviert." },
        { status: 422 }
      );
    }
  }

  // ── Plattform-Hartlimit (deal-size cap, unabhängig von Wallet) ────
  const dealValue  = new Decimal(parsed.data.price).times(lot.quantity.toString());
  const HARD_LIMIT = new Decimal("5000000");

  if (dealValue.gt(HARD_LIMIT)) {
    return NextResponse.json(
      { error: "Deal-Volumen übersteigt das Plattformlimit von 5.000.000 €. Bitte wenden Sie sich an den EUCX-Compliance-Support." },
      { status: 403 }
    );
  }

  // ── PriceEngine ───────────────────────────────────────────────────
  // Vor dem Gebot: wer ist aktuell Führender? (für OUTBID-Benachrichtigung)
  const prevLeader = await db.bid.findFirst({
    where:   { lotId: lotId },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
    select:  { sellerId: true, price: true },
  });

  let result;
  try {
    result = await placeBid(lotId, token.userId, parsed.data.price, parsed.data.cbam as BidCbamData | undefined, parsed.data.chargeId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bids/route] placeBid threw:", msg.slice(0, 200));

    // Neon Serverless: zu viele gleichzeitige Transaktionen → 503 (keine Race Condition)
    if (msg.includes("Unable to start a transaction") || msg.includes("Transaction API error")) {
      return NextResponse.json(
        { error: "Das System ist momentan überlastet - bitte in wenigen Sekunden erneut versuchen." },
        { status: 503, headers: { "Retry-After": "2" } }
      );
    }
    return NextResponse.json(
      { error: "Interner Fehler beim Gebotsspeichern" },
      { status: 500 }
    );
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }

  // ── Anti-Sniping: Last-Minute-Gebot → Auktion verlängern ─────────
  // Wenn Gebot < extensionMinutes vor auctionEnd eingeht UND maxExtensions noch nicht erreicht:
  // auctionEnd um extensionMinutes verlängern (verhindert Sniping in den letzten Sekunden).
  try {
    const ANTI_SNIPING_TRIGGER_SEC = lot.extensionMinutes * 60;
    const now = Date.now();

    if (
      lot.auctionEnd &&
      lot.phase === "PROPOSAL" &&
      lot.extendedCount < lot.maxExtensions
    ) {
      const secsToEnd = (lot.auctionEnd.getTime() - now) / 1000;
      if (secsToEnd > 0 && secsToEnd <= ANTI_SNIPING_TRIGGER_SEC) {
        const newEnd = new Date(lot.auctionEnd.getTime() + lot.extensionMinutes * 60 * 1000);
        await db.lot.update({
          where: { id: lotId },
          data: {
            auctionEnd:    newEnd,
            extendedCount: { increment: 1 },
          },
        });
        void audit({
          userId:     token.userId,
          action:     "BID_SUBMITTED",
          entityType: "Lot",
          entityId:   lotId,
          meta: {
            event:        "ANTI_SNIPING_EXTENSION",
            extendedCount: lot.extendedCount + 1,
            newAuctionEnd: newEnd.toISOString(),
            extensionMinutes: lot.extensionMinutes,
          },
        });
        void publishEvent("lot", lotId, "lot:update", {
          auctionEnd:       newEnd.toISOString(),
          extendedCount:    lot.extendedCount + 1,
          extended:         true,
          extensionMinutes: lot.extensionMinutes,
        });
      }
    }
  } catch (err) {
    // Anti-Sniping-Fehler darf Gebot nicht blockieren
    console.error("[bids/route] Anti-Sniping Fehler:", err);
  }

  // ── Notifications (fire-and-forget) ──────────────────────────────
  if (prevLeader && prevLeader.sellerId !== token.userId) {
    notifyOutbid(prevLeader.sellerId, lotId, result.newBest, 1).catch(console.error);
  }
  notifyLeading(token.userId, lotId, result.newBest).catch(console.error);

  void audit({
    userId:     token.userId,
    action:     "BID_SUBMITTED",
    entityType: "Bid",
    entityId:   result.bidId,
    meta:       { lotId, price: parsed.data.price, hasCbam: !!parsed.data.cbam, chargeId: parsed.data.chargeId ?? null },
  });

  return NextResponse.json({ bidId: result.bidId, newBest: result.newBest }, { status: 201 });
}

/**
 * GET /api/auction/lots/[lotId]/bids
 *
 * Anonymisierte Gebotshistorie.
 * - Verkäufer sehen nur ihre eigenen Gebote mit Ranking-Position
 * - Käufer sehen alle Gebote, aber sellerId anonymisiert (Seller-1, Seller-2 etc.)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: { id: true, buyerId: true, phase: true, currentBest: true, auctionEnd: true, winnerId: true },
  });
  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }

  const bids = await db.bid.findMany({
    where:   { lotId: lotId },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
    select:  {
      id: true, sellerId: true, price: true, isWinner: true, createdAt: true,
      seller: { select: { organization: { select: { memberSeq: true, memberId: true } } } },
    },
  });

  const isBuyer = lot.buyerId === token.userId;

  const anonymized = bids.map((bid) => {
    const seq    = bid.seller.organization.memberSeq;
    const seqStr = seq.toString().padStart(4, "0");
    const label  = `Bieter #${seqStr}`;
    return {
      id:        bid.id,
      // Käufer und fremde Verkäufer: stabile Bieter-#XXXX-Kennung
      sellerId:  bid.sellerId === token.userId ? "Sie" : label,
      memberSeq: seq,
      price:     bid.price.toString(),
      isWinner:  bid.isWinner,
      isOwn:     bid.sellerId === token.userId,
      rank:      bids.indexOf(bid) + 1,
      createdAt: bid.createdAt,
    };
  });

  return NextResponse.json({
    lot: {
      phase:       lot.phase,
      currentBest: lot.currentBest?.toString(),
      auctionEnd:  lot.auctionEnd,
      winnerId:    lot.phase === "CONCLUSION" ? lot.winnerId : undefined,
    },
    bids: anonymized,
    myBestRank: anonymized.find((b) => b.isOwn)?.rank ?? null,
  });
}
