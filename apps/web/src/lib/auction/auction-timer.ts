/**
 * AuctionTimer - Phasen-Übergänge zeitgesteuert ausführen
 *
 * Wird von /api/auction/cron (CRON_SECRET geschützt) aufgerufen.
 * Empfohlenes Intervall: jede Minute.
 *
 * Ablauf:
 *   1. Lots in Phase PROPOSAL/REDUCTION mit abgelaufenem auctionEnd → concludeLot()
 *      Cursor-basiertes Batching (100 pro Iteration) — kein OOM bei 10.000+ Lots.
 *   2. Lots mit auctionEnd in 9–11 Minuten → URGENCY_10M-Notification
 *   3. Lots mit auctionEnd in 4–6 Minuten → URGENCY_5M-Notification
 *   4. Nach CONCLUSION: Event an QStash-Queue (PostTrade + Notifications im Worker)
 *      Fallback ohne QStash: direkt fire-and-forget (Dev/Test)
 *   5. Recovery: CONCLUSION-Lots ohne LotContract → Erneuter QStash-Event
 */

import { db }                    from "@/lib/db/client";
import { concludeLot }           from "./price-engine";
import { processLotConclusion }  from "./post-trade";
import { publishLotConclusion }  from "@/lib/queue/qstash-client";
import {
  notifyUrgency10m,
  notifyUrgency5m,
  notifyAuctionClosed,
} from "@/lib/notifications/notification-service";

const BATCH_SIZE = 100;

export async function runAuctionTimer(): Promise<{
  processed:  number;
  concluded:  string[];
  urgency10m: string[];
  urgency5m:  string[];
  errors:     Array<{ lotId: string; error: string }>;
}> {
  const now = new Date();

  // ── 1. Fällige Lots cursor-weise abschließen ───────────────────────────────
  // Cursor-Pagination verhindert Full-Table-Scan und OOM bei großen Lot-Mengen.
  // Jeder Batch schreibt die CONCLUSION in die DB, dann wird ein QStash-Event
  // für den asynchronen Post-Trade-Worker publiziert.

  const concluded: string[] = [];
  const errors:    Array<{ lotId: string; error: string }> = [];
  let processed = 0;
  let cursor: string | undefined;

  while (true) {
    const batch = await db.lot.findMany({
      where: {
        phase:      { in: ["PROPOSAL", "REDUCTION"] },
        auctionEnd: { lte: now },
        lockedAt:   null,
      },
      take:     BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy:  { id: "asc" },
      select: {
        id:          true,
        buyerId:     true,
        winnerId:    true,
        commodity:   true,
        currentBest: true,
      },
    });

    if (batch.length === 0) break;
    processed += batch.length;

    for (const lot of batch) {
      try {
        const result = await concludeLot(lot.id);
        if (result.ok) {
          concluded.push(lot.id);

          // QStash: zuverlässiger Worker mit automatischem Retry
          const enqueued = await publishLotConclusion(lot.id).catch((err) => {
            console.error(`[AuctionTimer] QStash publish fehlgeschlagen für Lot ${lot.id}:`, err);
            return false;
          });

          if (!enqueued) {
            // Dev/Test-Fallback: fire-and-forget direkt im selben Prozess
            processLotConclusion(lot.id)
              .then(async () => {
                const contract = await db.lotContract.findUnique({
                  where:  { lotId: lot.id },
                  select: { contractNumber: true },
                });
                if (result.winnerId && lot.buyerId && contract) {
                  notifyAuctionClosed(
                    lot.id,
                    result.winnerId,
                    lot.buyerId,
                    lot.commodity,
                    lot.currentBest?.toString() ?? "-",
                    contract.contractNumber,
                  ).catch(console.error);
                }
              })
              .catch((err) => {
                console.error(`[AuctionTimer] PostTrade fehlgeschlagen für Lot ${lot.id}:`, err);
              });
          }
        }
      } catch (err) {
        errors.push({ lotId: lot.id, error: String(err) });
      }
    }

    cursor = batch[batch.length - 1]!.id;
    if (batch.length < BATCH_SIZE) break;
  }

  // ── 2. URGENCY_10M: Lots die in 9–11 Minuten enden ────────────────────────
  const t10min = new Date(now.getTime() +  9 * 60_000);
  const t10max = new Date(now.getTime() + 11 * 60_000);

  const urgencyLots10 = await db.lot.findMany({
    where: {
      phase:      { in: ["PROPOSAL", "REDUCTION"] },
      auctionEnd: { gte: t10min, lte: t10max },
      lockedAt:   null,
    },
    select: { id: true },
    take:   500,
  });

  const urgency10m: string[] = [];
  for (const { id } of urgencyLots10) {
    notifyUrgency10m(id).catch(console.error);
    urgency10m.push(id);
  }

  // ── 3. URGENCY_5M: Lots die in 4–6 Minuten enden ──────────────────────────
  const t5min = new Date(now.getTime() + 4 * 60_000);
  const t5max = new Date(now.getTime() + 6 * 60_000);

  const urgencyLots5 = await db.lot.findMany({
    where: {
      phase:      { in: ["PROPOSAL", "REDUCTION"] },
      auctionEnd: { gte: t5min, lte: t5max },
      lockedAt:   null,
    },
    select: { id: true },
    take:   500,
  });

  const urgency5m: string[] = [];
  for (const { id } of urgencyLots5) {
    notifyUrgency5m(id).catch(console.error);
    urgency5m.push(id);
  }

  // ── 4. Recovery: CONCLUSION-Lots ohne Kaufvertrag ──────────────────────────
  // Catch-all falls der Worker nach mehrmaligem Retry endgültig fehlschlug.
  const unprocessed = await db.lot.findMany({
    where: {
      phase:       "CONCLUSION",
      lockedAt:    { not: null },
      winnerId:    { not: null },
      lotContract: null,
    },
    select: { id: true },
    take:   10,
  });

  for (const { id } of unprocessed) {
    const enqueued = await publishLotConclusion(id).catch(() => false);
    if (!enqueued) {
      processLotConclusion(id).catch((e) => {
        console.error(`[AuctionTimer] Recovery PostTrade fehlgeschlagen ${id}:`, e);
      });
    }
  }

  return { processed, concluded, urgency10m, urgency5m, errors };
}
