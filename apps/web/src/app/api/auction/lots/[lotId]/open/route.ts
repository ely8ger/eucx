/**
 * POST /api/auction/lots/[lotId]/open
 *
 * Käufer öffnet das Auktionsfenster (COLLECTION → PROPOSAL).
 * auctionEnd wird server-seitig auf das Ende der nächsten Handelssitzung gesetzt:
 *   Mo–Fr 14:00–16:00 Europe/Berlin
 *
 * Auth: Bearer JWT (muss Lot-Besitzer sein)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// [TESTMODE-03] Slot temporär auf 19:00–22:00 Berlin (Testbetrieb 06.07.26)
// Original: SLOT_END_HOUR = 16, SLOT_START_HOUR = 14
const SLOT_END_HOUR   = 22; // 22:00 Berlin
const SLOT_START_HOUR = 19; // 19:00 Berlin

/** UTC-Zeitpunkt für 16:00 Europe/Berlin an einem bestimmten Berliner Kalendertag */
function berlinSlotEnd(year: number, month: number, day: number): Date {
  // Offset: wie viele Stunden ist Berlin vor UTC (1 = CET, 2 = CEST)?
  const midnightUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const berlinHourAtMidnight = parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin", hour: "2-digit", hour12: false,
    }).format(midnightUTC),
    10,
  );
  const utcHour = SLOT_END_HOUR - berlinHourAtMidnight;
  return new Date(Date.UTC(year, month, day, utcHour, 0, 0));
}

/** Gibt das UTC-Ende der nächsten offenen Handelssitzung zurück */
function getNextSlotEnd(now: Date): Date {
  for (let d = 0; d < 7; d++) {
    const candidate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
      weekday: "long",
    });
    const parts = fmt.formatToParts(candidate);
    const get   = (t: string) => parts.find((p) => p.type === t)?.value ?? "";

    const weekday = get("weekday");
    if (weekday === "Saturday" || weekday === "Sunday") continue;

    const year  = parseInt(get("year"),  10);
    const month = parseInt(get("month"), 10) - 1;
    const day   = parseInt(get("day"),   10);
    const berlinHour = parseInt(get("hour"), 10);

    // Slot noch nicht beendet heute?
    const isToday = d === 0;
    if (isToday && berlinHour >= SLOT_END_HOUR) continue; // Sitzung vorbei

    const slotEnd = berlinSlotEnd(year, month, day);
    if (slotEnd.getTime() > now.getTime() + 60_000) return slotEnd;
  }

  // Fallback (sollte nie eintreten)
  return new Date(now.getTime() + 2 * 60 * 60 * 1000);
}

/** Gibt true zurück wenn jetzt eine Handelssitzung aktiv ist */
function isSessionActive(now: Date): boolean {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit", minute: "2-digit", hour12: false,
    weekday: "long",
  });
  const parts  = fmt.formatToParts(now);
  const get    = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const wd     = get("weekday");
  const hour   = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  const mins   = hour * 60 + minute;

  if (wd === "Saturday" || wd === "Sunday") return false;
  return mins >= SLOT_START_HOUR * 60 && mins < SLOT_END_HOUR * 60;
}

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

  // ── Lot laden ─────────────────────────────────────────────────────
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: { id: true, buyerId: true, phase: true },
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
  const auctionEnd = getNextSlotEnd(now);
  const sessionNow = isSessionActive(now);

  // ── Phase-Übergang ────────────────────────────────────────────────
  const updated = await db.lot.update({
    where:  { id: lotId },
    data:   { phase: "PROPOSAL", auctionStart: now, auctionEnd },
    select: { id: true, phase: true, auctionStart: true, auctionEnd: true },
  });

  return NextResponse.json({ ...updated, sessionActive: sessionNow });
}
