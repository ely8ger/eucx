/**
 * candle-refresh - Sofortiger OHLC-Candle-Refresh für ein einzelnes Produkt.
 *
 * Wird aufgerufen:
 *   - Von matching-engine.ts nach jedem Deal (fire-and-forget)
 *   - Von /api/cron/market-candles (Vercel Cron, jede Minute)
 *
 * Strategie: nur das ONE_MIN-Intervall sofort; längere Intervalle laufen
 * über den Cron-Job (zu teuer für jedes Event).
 */

import { db }          from "@/lib/db/client";
import { computeOhlc } from "@/lib/market/ohlc-queries";
import type { CandleInterval } from "@prisma/client";

// Lookback je Intervall für Cron-Refresh
export const CRON_LOOKBACK_MS: Record<CandleInterval, number> = {
  ONE_MIN:     5  * 60 * 1000,
  FIFTEEN_MIN: 30 * 60 * 1000,
  ONE_HOUR:    2  * 60 * 60 * 1000,
  ONE_DAY:     2  * 24 * 60 * 60 * 1000,
};

/**
 * Sofortiger ONE_MIN-Candle-Refresh für ein Produkt.
 * Fire-and-forget - wirft nie (Fehler werden geloggt).
 */
export async function refreshProductCandlesNow(productId: string): Promise<void> {
  try {
    const since = new Date(Date.now() - CRON_LOOKBACK_MS.ONE_MIN);
    const rows  = await computeOhlc(productId, "ONE_MIN", since);
    await upsertCandles(productId, "ONE_MIN", rows);
  } catch (err) {
    console.error("[candle-refresh] Sofort-Refresh fehlgeschlagen:", productId, err);
  }
}

/**
 * Vollständiger Cron-Refresh: alle Intervalle, alle aktiven Produkte.
 * Aufgerufen von /api/cron/market-candles.
 */
export async function refreshAllCandles(): Promise<{ refreshed: number; errors: number }> {
  const products = await db.product.findMany({
    where:  { isActive: true },
    select: { id: true },
  });

  const intervals: CandleInterval[] = ["ONE_MIN", "FIFTEEN_MIN", "ONE_HOUR", "ONE_DAY"];
  let refreshed = 0;
  let errors    = 0;

  // Serielle Ausführung (Vercel Hobby: max 60s Cron-Route, kein paralleles Overload)
  for (const interval of intervals) {
    const since = new Date(Date.now() - CRON_LOOKBACK_MS[interval]);
    for (const product of products) {
      try {
        const rows = await computeOhlc(product.id, interval, since);
        if (rows.length > 0) {
          await upsertCandles(product.id, interval, rows);
          refreshed += rows.length;
        }
      } catch {
        errors++;
      }
    }
  }

  return { refreshed, errors };
}

// ─── Upsert-Hilfsfunktion ─────────────────────────────────────────────────────

interface OhlcRow {
  periodStart: Date;
  open:        string;
  high:        string;
  low:         string;
  close:       string;
  volume:      string;
  turnover:    string;
  tradeCount:  number;
}

async function upsertCandles(
  productId: string,
  interval:  CandleInterval,
  rows:      OhlcRow[],
): Promise<void> {
  await Promise.all(rows.map((row) =>
    db.marketCandle.upsert({
      where: {
        productId_interval_periodStart: { productId, interval, periodStart: row.periodStart },
      },
      create: {
        productId,
        interval,
        periodStart: row.periodStart,
        open:        row.open,
        high:        row.high,
        low:         row.low,
        close:       row.close,
        volume:      row.volume,
        turnover:    row.turnover,
        tradeCount:  row.tradeCount,
      },
      update: {
        open:       row.open,
        high:       row.high,
        low:        row.low,
        close:      row.close,
        volume:     row.volume,
        turnover:   row.turnover,
        tradeCount: row.tradeCount,
      },
    }).catch(() => { /* einzelne Kerze darf Batch nicht stoppen */ }),
  ));
}
