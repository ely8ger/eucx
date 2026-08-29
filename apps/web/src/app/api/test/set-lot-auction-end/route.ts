/**
 * PATCH /api/test/set-lot-auction-end
 *
 * Setzt auctionEnd eines Lots direkt in der Datenbank.
 * Nur in Dev/Test — in Production immer 403.
 *
 * Body: { lotId: string, auctionEnd: string (ISO-8601) }
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nicht verfügbar" }, { status: 403 });
  }

  const { lotId, auctionEnd } = await req.json() as { lotId?: string; auctionEnd?: string };
  if (!lotId || !auctionEnd) {
    return NextResponse.json({ error: "lotId und auctionEnd erforderlich" }, { status: 400 });
  }

  const updated = await db.lot.update({
    where: { id: lotId },
    data:  { auctionEnd: new Date(auctionEnd) },
    select: { id: true, auctionEnd: true, phase: true },
  });

  return NextResponse.json({ ok: true, lot: updated });
}
