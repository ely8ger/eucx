/**
 * POST /api/auction/lots/[lotId]/open
 *
 * Käufer öffnet das Auktionsfenster (COLLECTION → PROPOSAL).
 * auctionStart = jetzt
 * auctionEnd   = Body.auctionEnd (ISO-String) falls angegeben,
 *                sonst jetzt + 2h (Default).
 *
 * Constraints:
 *   - auctionEnd muss mindestens 15 Minuten in der Zukunft liegen
 *   - auctionEnd darf höchstens 14 Tage in der Zukunft liegen
 *
 * Auth: Bearer JWT (muss Lot-Besitzer sein)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;   // 2 Stunden
const MIN_DURATION_MS     = 15 * 60 * 1000;         // 15 Minuten
const MAX_DURATION_MS     = 14 * 24 * 60 * 60 * 1000; // 14 Tage

export async function POST(
  req: NextRequest,
  { params }: { params: { lotId: string } }
) {
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // ── Body (optional) ───────────────────────────────────────────────
  let bodyAuctionEnd: string | null = null;
  try {
    const body = await req.json() as { auctionEnd?: string };
    bodyAuctionEnd = body.auctionEnd ?? null;
  } catch { /* kein Body → Default verwenden */ }

  // ── Lot laden ─────────────────────────────────────────────────────
  const lot = await db.lot.findUnique({
    where:  { id: params.lotId },
    select: { id: true, buyerId: true, phase: true },
  });
  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }
  if (lot.buyerId !== token.userId) {
    return NextResponse.json({ error: "Nicht Ihr Lot" }, { status: 403 });
  }
  if (lot.phase !== "COLLECTION") {
    return NextResponse.json({ error: "Auktion bereits gestartet oder abgeschlossen" }, { status: 409 });
  }

  // Mindestens einen registrierten Verkäufer verlangen
  const regCount = await db.lotRegistration.count({ where: { lotId: params.lotId } });
  if (regCount === 0) {
    return NextResponse.json(
      { error: "Keine Verkäufer registriert. Die Auktion kann erst gestartet werden, wenn sich mindestens ein Verkäufer registriert hat." },
      { status: 422 },
    );
  }

  // ── Endzeitpunkt berechnen & validieren ───────────────────────────
  const now = new Date();

  let auctionEnd: Date;
  if (bodyAuctionEnd) {
    auctionEnd = new Date(bodyAuctionEnd);
    if (isNaN(auctionEnd.getTime())) {
      return NextResponse.json({ error: "Ungültiges Datum für auctionEnd" }, { status: 422 });
    }
    const diff = auctionEnd.getTime() - now.getTime();
    if (diff < MIN_DURATION_MS) {
      return NextResponse.json({ error: "Auktionsende muss mindestens 15 Minuten in der Zukunft liegen" }, { status: 422 });
    }
    if (diff > MAX_DURATION_MS) {
      return NextResponse.json({ error: "Auktionsende darf höchstens 14 Tage in der Zukunft liegen" }, { status: 422 });
    }
  } else {
    auctionEnd = new Date(now.getTime() + DEFAULT_DURATION_MS);
  }

  // ── Phase-Übergang ────────────────────────────────────────────────
  const updated = await db.lot.update({
    where: { id: params.lotId },
    data: {
      phase:        "PROPOSAL",
      auctionStart: now,
      auctionEnd,
    },
    select: { id: true, phase: true, auctionStart: true, auctionEnd: true },
  });

  return NextResponse.json(updated);
}
