/**
 * POST /api/auction/lots/[lotId]/open
 *
 * Käufer öffnet das Auktionsfenster (COLLECTION → PROPOSAL).
 * auctionEnd wird server-seitig auf das Ende der nächsten Handelssitzung gesetzt:
 *   Mo-Fr 13:00-15:00 Europe/Berlin
 *
 * Auth: Bearer JWT (muss Lot-Besitzer sein)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";
import { getNextTradingSlotEnd, isInTradingSlot } from "@/lib/auction/trading-hours";

async function _POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  // ── Auth ──────────────────────────────────────────────────────────
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  // ── Lot laden ─────────────────────────────────────────────────────
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      id:         true,
      buyerId:    true,
      phase:      true,
      quantity:   true,
      startPrice: true,
      buyer:      { select: { organizationId: true } },
    },
  });
  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  if (lot.buyerId !== token.userId) return NextResponse.json({ error: "Nicht Ihr Lot" }, { status: 403 });
  if (lot.phase !== "COLLECTION") {
    return NextResponse.json({ error: "Auktion bereits gestartet oder abgeschlossen" }, { status: 409 });
  }

  const regCount = await db.lotRegistration.count({ where: { lotId } });
  if (regCount === 0) {
    return NextResponse.json(
      { error: "Keine Verkäufer registriert. Die Auktion kann erst gestartet werden, wenn sich mindestens ein Verkäufer registriert hat." },
      { status: 422 },
    );
  }

  // ── Slot-Ende berechnen ───────────────────────────────────────────
  const now        = new Date();
  const auctionEnd = getNextTradingSlotEnd(now);
  const sessionNow = isInTradingSlot(now);

  // ── Phase-Übergang ────────────────────────────────────────────────
  const updated = await db.lot.update({
    where:  { id: lotId },
    data:   { phase: "PROPOSAL", auctionStart: now, auctionEnd },
    select: { id: true, phase: true, auctionStart: true, auctionEnd: true },
  });

  return NextResponse.json({ ...updated, sessionActive: sessionNow });
}

export const POST = apiRoute(_POST);
