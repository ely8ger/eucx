/**
 * POST /api/auction/lots/[lotId]/open
 *
 * Käufer öffnet das Auktionsfenster (COLLECTION → PROPOSAL).
 * auctionStart = jetzt, auctionEnd = jetzt + 2h (konfigurierbar).
 *
 * Auth: Bearer JWT (muss Lot-Besitzer sein)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const AUCTION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 Stunden

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

  // ── Phase-Übergang ────────────────────────────────────────────────
  const now          = new Date();
  const auctionEnd   = new Date(now.getTime() + AUCTION_DURATION_MS);

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
