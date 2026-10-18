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
import { notifyAuctionStart } from "@/lib/notifications/notification-service";
import { getNextTradingSlotEnd } from "@/lib/auction/trading-hours";
import { pingCronHealthcheck }  from "@/lib/monitoring/healthcheck";

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
    select: { id: true, buyerId: true, commodity: true, startPrice: true },
    take: 50, // max 50 pro Cron-Lauf (verhindert Timeout)
  });

  if (lots.length === 0) {
    return NextResponse.json({ started: 0, lotIds: [] });
  }

  const auctionEnd = getNextTradingSlotEnd(now);
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
      notifyAuctionStart(
        lot.id,
        lot.commodity,
        lot.startPrice?.toString() ?? "0",
        auctionEnd.toISOString(),
      ).catch(console.error);
    }
  }

  pingCronHealthcheck("lot-phase-auto-start");
  return NextResponse.json({ started: started.length, lotIds: started });
}
