/**
 * GET /api/cron/lot-phase-auto-start
 *
 * Startet Lots automatisch in Phase PROPOSAL wenn deren scheduledStart abgelaufen ist.
 * Läuft alle 5 Minuten (vercel.json: "* /5 * * * *").
 *
 * Bedingungen:
 *   - phase = COLLECTION
 *   - isDraft = false  (veröffentlicht)
 *   - scheduledStart <= now
 *   - lockedAt = null  (kein Race-Condition-Guard aktiv)
 *
 * Jeder Update ist atomar (updateMany WHERE phase=COLLECTION) — verhindert Doppelstart.
 * auctionEnd = nächstes Handelssitzungs-Ende (Mo-Fr 15:00 Berlin) oder +2h als Fallback.
 *
 * Auth: CRON_SECRET (Vercel setzt Authorization-Header automatisch)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const SLOT_END_HOUR = 15; // 15:00 Berlin

function nextSlotEndUTC(now: Date): Date {
  for (let d = 0; d < 7; d++) {
    const candidate = new Date(now.getTime() + d * 86_400_000);
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
      weekday: "long",
    });
    const parts   = fmt.formatToParts(candidate);
    const get     = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const weekday = get("weekday");
    if (weekday === "Saturday" || weekday === "Sunday") continue;

    const year      = parseInt(get("year"),  10);
    const month     = parseInt(get("month"), 10) - 1;
    const day       = parseInt(get("day"),   10);
    const berlinH   = parseInt(get("hour"),  10);

    if (d === 0 && berlinH >= SLOT_END_HOUR) continue;

    // Berlin-Offset zur UTC-Zeit berechnen
    const midnight     = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const berlinAtMid  = parseInt(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hour12: false })
        .format(midnight), 10,
    );
    const slotEndUTC = new Date(Date.UTC(year, month, day, SLOT_END_HOUR - berlinAtMid, 0, 0));
    if (slotEndUTC.getTime() > now.getTime() + 60_000) return slotEndUTC;
  }
  return new Date(now.getTime() + 2 * 3_600_000); // Fallback +2h
}

export async function GET(req: NextRequest) {
  // ── CRON_SECRET Auth ──────────────────────────────────────────────
  const secret   = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || secret !== expected) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const now = new Date();

  // ── Fällige Lots laden ────────────────────────────────────────────
  const lots = await db.lot.findMany({
    where: {
      phase:          "COLLECTION",
      isDraft:        false,
      scheduledStart: { lte: now },
      lockedAt:       null,
    },
    select: { id: true, buyerId: true, commodity: true },
    take: 50, // max 50 pro Cron-Lauf (verhindert Timeout)
  });

  if (lots.length === 0) {
    return NextResponse.json({ started: 0, lotIds: [] });
  }

  const auctionEnd = nextSlotEndUTC(now);
  const started: string[] = [];

  for (const lot of lots) {
    // Atomarer Update: WHERE phase=COLLECTION verhindert Doppelstart
    const result = await db.lot.updateMany({
      where: { id: lot.id, phase: "COLLECTION", isDraft: false },
      data:  { phase: "PROPOSAL", auctionStart: now, auctionEnd },
    });

    if (result.count > 0) {
      started.push(lot.id);
      void audit({
        userId:     lot.buyerId,
        action:     "LOT_AUTO_STARTED",
        entityType: "Lot",
        entityId:   lot.id,
        meta:       { commodity: lot.commodity, auctionEnd: auctionEnd.toISOString() },
      });
    }
  }

  return NextResponse.json({ started: started.length, lotIds: started });
}
