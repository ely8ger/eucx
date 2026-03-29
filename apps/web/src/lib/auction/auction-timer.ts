/**
 * AuctionTimer — Phasen-Übergänge zeitgesteuert ausführen
 *
 * Wird von /api/auction/cron (CRON_SECRET geschützt) aufgerufen.
 * Empfohlenes Intervall: jede Minute.
 *
 * Ablauf:
 *   1. Lots in Phase PROPOSAL/REDUCTION mit abgelaufenem auctionEnd → concludeLot()
 *   2. Lots mit auctionEnd in 9–11 Minuten → URGENCY_10M-Notification
 *   3. Lots mit auctionEnd in 4–6 Minuten → URGENCY_5M-Notification
 *   4. Nach CONCLUSION: PostTrade + AUCTION_CLOSED Notifications
 */

import { db } from "@/lib/db/client";
import { concludeLot } from "./price-engine";
import { processLotConclusion } from "./post-trade";
import {
  notifyUrgency10m,
  notifyUrgency5m,
  notifyAuctionClosed,
} from "@/lib/notifications/notification-service";

export async function runAuctionTimer(): Promise<{
  processed:  number;
  concluded:  string[];
  urgency10m: string[];
  urgency5m:  string[];
  errors:     Array<{ lotId: string; error: string }>;
}> {
  const now = new Date();

  // ── 1. Fällige Lots abschließen ────────────────────────────────────────────
  const dueLots = await db.lot.findMany({
    where: {
      phase:      { in: ["PROPOSAL", "REDUCTION"] },
      auctionEnd: { lte: now },
      lockedAt:   null,
    },
    select: {
      id:      true,
      buyerId: true,
      winnerId: true,
      commodity: true,
      currentBest: true,
      lotContract: { select: { contractNumber: true } },
    },
  });

  const concluded: string[] = [];
  const errors: Array<{ lotId: string; error: string }> = [];

  for (const lot of dueLots) {
    try {
      const result = await concludeLot(lot.id);
      if (result.ok) {
        concluded.push(lot.id);

        // Post-Trade: PDF + LotContract + Gebühren (async)
        processLotConclusion(lot.id)
          .then(async () => {
            // Notification nach Post-Trade (contractNumber bekannt)
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
                lot.currentBest?.toString() ?? "—",
                contract.contractNumber,
              ).catch(console.error);
            }
          })
          .catch((err) => {
            console.error(`[AuctionTimer] PostTrade fehlgeschlagen für Lot ${lot.id}:`, err);
          });
      }
    } catch (err) {
      errors.push({ lotId: lot.id, error: String(err) });
    }
  }

  // ── 2. URGENCY_10M: Lots die in 9–11 Minuten enden ────────────────────────
  const t10min = new Date(now.getTime() + 9 * 60_000);
  const t10max = new Date(now.getTime() + 11 * 60_000);

  const urgencyLots10 = await db.lot.findMany({
    where: {
      phase:      { in: ["PROPOSAL", "REDUCTION"] },
      auctionEnd: { gte: t10min, lte: t10max },
      lockedAt:   null,
    },
    select: { id: true },
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
  });

  const urgency5m: string[] = [];
  for (const { id } of urgencyLots5) {
    notifyUrgency5m(id).catch(console.error);
    urgency5m.push(id);
  }

  return { processed: dueLots.length, concluded, urgency10m, urgency5m, errors };
}
