/**
 * POST /api/dev/reset-lot-end/[lotId]
 *
 * [TESTMODE] Setzt auctionEnd des Lots auf heute 22:00 Berlin.
 * Nur für Testbetrieb — VOR PRODUKTIONSSTART ENTFERNEN.
 *
 * Auth: Bearer JWT (Lot-Besitzer)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

function berlinSlotEnd22(now: Date): Date {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin", year: "numeric", month: "2-digit",
    day: "2-digit", hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get   = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const year  = parseInt(get("year"),  10);
  const month = parseInt(get("month"), 10) - 1;
  const day   = parseInt(get("day"),   10);

  const midnightUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const berlinHourAtMidnight = parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin", hour: "2-digit", hour12: false,
    }).format(midnightUTC), 10,
  );
  const utcHour = 22 - berlinHourAtMidnight;
  return new Date(Date.UTC(year, month, day, utcHour, 0, 0));
}

export async function POST(
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
    select: { buyerId: true, phase: true },
  });
  if (!lot)                       return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (lot.buyerId !== token.userId) return NextResponse.json({ error: "Nicht Ihr Lot" }, { status: 403 });
  if (lot.phase === "CONCLUSION") return NextResponse.json({ error: "Lot bereits abgeschlossen" }, { status: 409 });

  const newEnd = berlinSlotEnd22(new Date());
  await db.lot.update({
    where: { id: lotId },
    data:  { auctionEnd: newEnd },
  });

  return NextResponse.json({ ok: true, auctionEnd: newEnd.toISOString() });
}
