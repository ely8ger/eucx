/**
 * AuctionTimer — Phasen-Übergänge zeitgesteuert ausführen
 *
 * Wird von /api/auction/cron (CRON_SECRET geschützt) aufgerufen.
 * Empfohlenes Intervall: jede Minute.
 *
 * Ablauf:
 *   1. Alle Lots in Phase PROPOSAL oder REDUCTION mit abgelaufenem auctionEnd suchen
 *   2. Für jeden → concludeLot() aufrufen
 *   3. Ergebnisse zurückgeben (für Logging/Monitoring)
 */

import { db } from "@/lib/db/client";
import { concludeLot } from "./price-engine";

export async function runAuctionTimer(): Promise<{
  processed: number;
  concluded: string[];
  errors: Array<{ lotId: string; error: string }>;
}> {
  const now = new Date();

  // Alle fälligen Lots (auctionEnd in der Vergangenheit, noch nicht CONCLUSION)
  const dueLots = await db.lot.findMany({
    where: {
      phase:      { in: ["PROPOSAL", "REDUCTION"] },
      auctionEnd: { lte: now },
      lockedAt:   null,
    },
    select: { id: true },
  });

  const concluded: string[] = [];
  const errors: Array<{ lotId: string; error: string }> = [];

  for (const { id } of dueLots) {
    try {
      const result = await concludeLot(id);
      if (result.ok) {
        concluded.push(id);
      }
    } catch (err) {
      errors.push({ lotId: id, error: String(err) });
    }
  }

  return { processed: dueLots.length, concluded, errors };
}
