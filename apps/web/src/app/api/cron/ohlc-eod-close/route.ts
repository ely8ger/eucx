/**
 * GET /api/cron/ohlc-eod-close
 *
 * Tages-OHLC-Finalisierung: berechnet die definitive ONE_DAY-Kerze für den
 * gestrigen Handelstag (festes Zeitfenster [gestern 00:00 UTC, heute 00:00 UTC)).
 *
 * Unterschied zum rolling /api/cron/market-candles:
 *   market-candles: 2-Tage-Lookback, rollt vorwärts (aktuelle Kerze immer offen)
 *   ohlc-eod-close: exaktes Vortags-Fenster → unveränderlicher Tagesschlusskurs
 *
 * Schedule: "5 0 * * *" (täglich 00:05 UTC — alle Trades des Vortages vollständig)
 * Auth: CRON_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { computeOhlc } from "@/lib/market/ohlc-queries";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const start = Date.now();

  // ── Zeitfenster: gestern 00:00 UTC bis heute 00:00 UTC ───────────────────────
  const today     = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 3_600_000);

  // ── Produkte mit Deals gestern laden ─────────────────────────────────────────
  type ProductRow = { product_id: string };
  const rows = await db.$queryRaw<ProductRow[]>`
    SELECT DISTINCT product_id
    FROM deals
    WHERE status NOT IN ('CANCELLED', 'DISPUTED')
      AND created_at >= ${yesterday}
      AND created_at <  ${today}
  `;

  if (rows.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "Keine Deals gestern — keine EOD-Kerzen zu schreiben",
      date: yesterday.toISOString().slice(0, 10),
      durationMs: Date.now() - start,
    });
  }

  let written  = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const { product_id } of rows) {
    try {
      const ohlcRows = await computeOhlc(product_id, "ONE_DAY", yesterday, today);

      if (ohlcRows.length === 0) {
        skipped++;
        continue;
      }

      // Es gibt genau eine Tageskerze pro Produkt pro Tag
      const row = ohlcRows[0]!;

      await db.marketCandle.upsert({
        where: {
          productId_interval_periodStart: {
            productId:   product_id,
            interval:    "ONE_DAY",
            periodStart: row.periodStart,
          },
        },
        create: {
          productId:   product_id,
          interval:    "ONE_DAY",
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
      });

      written++;
    } catch {
      errors++;
    }
  }

  console.info(
    `[ohlc-eod-close] ${yesterday.toISOString().slice(0, 10)}: ` +
    `${written} Kerzen geschrieben, ${skipped} übersprungen, ${errors} Fehler`
  );

  return NextResponse.json({
    ok:         true,
    date:       yesterday.toISOString().slice(0, 10),
    products:   rows.length,
    written,
    skipped,
    errors,
    durationMs: Date.now() - start,
  });
}
