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
import { verifyAccessToken } from "@/lib/auth/jwt";
import { placeBid } from "@/lib/auction/price-engine";
import { checkBidEligibility } from "@/lib/auction/kyc-guard";
import { notifyOutbid, notifyLeading } from "@/lib/notifications/notification-service";
import { db } from "@/lib/db/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bidSchema = z.object({
  price: z.number().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // ── Validation ────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  // ── KYC + Deposit-Check ───────────────────────────────────────────
  const kycCheck = await checkBidEligibility(token.userId, lotId);
  if (!kycCheck.ok) {
    return NextResponse.json(
      { error: kycCheck.error, code: kycCheck.code, kycRequired: kycCheck.kycRequired, depositRequired: kycCheck.depositRequired },
      { status: kycCheck.code }
    );
  }

  // ── PriceEngine ───────────────────────────────────────────────────
  // Vor dem Gebot: wer ist aktuell Führender? (für OUTBID-Benachrichtigung)
  const prevLeader = await db.bid.findFirst({
    where:   { lotId: lotId },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
    select:  { sellerId: true, price: true },
  });

  const result = await placeBid(lotId, token.userId, parsed.data.price);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }

  // ── Notifications (fire-and-forget) ──────────────────────────────
  // Führender benachrichtigen: Neues Gebot ist besser → er wurde überboten
  if (prevLeader && prevLeader.sellerId !== token.userId) {
    notifyOutbid(prevLeader.sellerId, lotId, result.newBest, 1).catch(console.error);
  }
  // Neuer Bieter: er führt jetzt
  notifyLeading(token.userId, lotId, result.newBest).catch(console.error);

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
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

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
    select:  { id: true, sellerId: true, price: true, isWinner: true, createdAt: true },
  });

  const isBuyer = lot.buyerId === token.userId;

  // Seller-Anonymisierung: Eindeutige IDs durch numerische Platzhalter ersetzen
  const sellerMap = new Map<string, string>();
  let counter = 1;
  const anonymized = bids.map((bid) => {
    if (!sellerMap.has(bid.sellerId)) {
      sellerMap.set(bid.sellerId, `Anbieter-${counter++}`);
    }
    return {
      id:       bid.id,
      // Käufer sieht anonymisiert, Verkäufer sieht eigene ID klar, fremde anonymisiert
      sellerId: isBuyer
        ? sellerMap.get(bid.sellerId)
        : bid.sellerId === token.userId
          ? "Sie"
          : sellerMap.get(bid.sellerId),
      price:    bid.price.toString(),
      isWinner: bid.isWinner,
      isOwn:    bid.sellerId === token.userId,
      rank:     bids.indexOf(bid) + 1,
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
