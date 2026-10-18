/**
 * POST /api/auction/lots/[lotId]/register
 *
 * Verkäufer meldet sich für eine Auktion an.
 * Nur in Phase COLLECTION möglich.
 *
 * Auth: Bearer JWT (role === SELLER oder BROKER)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";
import { isInTradingSlot, getNextTradingSlotEnd } from "@/lib/auction/trading-hours";

export const dynamic = "force-dynamic";

async function _POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  // ── Auth ──────────────────────────────────────────────────────────
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  // ── User + Lot prüfen ─────────────────────────────────────────────
  const [user, lot] = await Promise.all([
    db.user.findUnique({
      where:  { id: token.userId },
      select: { id: true, role: true, status: true, verificationStatus: true, organizationId: true },
    }),
    db.lot.findUnique({
      where:  { id: lotId },
      select: {
        id: true, phase: true, buyerId: true, buyerIp: true,
        buyer: { select: { organizationId: true } },
      },
    }),
  ]);

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }
  if (!["SELLER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Nur Verkäufer können sich registrieren" }, { status: 403 });
  }
  if (user.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "KYC-Verifizierung erforderlich" }, { status: 403 });
  }
  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }
  if (lot.buyerId === token.userId) {
    return NextResponse.json({ error: "Käufer kann sich nicht als Verkäufer registrieren" }, { status: 409 });
  }

  // ── Organisations-Konflikt: Käufer und Verkäufer dürfen nicht zur selben Organisation gehören ──
  if (user.organizationId && lot.buyer?.organizationId && user.organizationId === lot.buyer.organizationId) {
    return NextResponse.json(
      { error: "Registrierung nicht möglich: Käufer und Verkäufer gehören zur selben Organisation (Interessenkonflikt)" },
      { status: 409 }
    );
  }
  if (lot.phase !== "COLLECTION") {
    return NextResponse.json({ error: "Registrierung nur in Phase COLLECTION möglich" }, { status: 409 });
  }

  // ── Registrierung (idempotent) ────────────────────────────────────
  const reg = await db.lotRegistration.upsert({
    where:  { lotId_sellerId: { lotId: lotId, sellerId: token.userId } },
    create: { lotId: lotId, sellerId: token.userId },
    update: {},
    select: { id: true, createdAt: true },
  });

  // ── Auto-Start: Handelssitzung 13:00-15:00 Mo-Fr Berlin aktiv? ───
  const now = new Date();
  let autoStarted = false;

  if (lot.phase === "COLLECTION" && isInTradingSlot(now)) {
    const auctionEnd = getNextTradingSlotEnd(now);
    const affected = await db.lot.updateMany({
      where: { id: lotId, phase: "COLLECTION" }, // atomischer Guard gegen Race
      data:  { phase: "PROPOSAL", auctionStart: now, auctionEnd },
    });
    autoStarted = affected.count > 0;
  }

  return NextResponse.json({ registrationId: reg.id, registered: true, autoStarted });
}


export const POST = apiRoute(_POST);
