/**
 * GET /api/market/[productId]/candles
 *
 * Liefert OHLC-Kerzendaten für TradingView Lightweight Charts.
 *
 * Query-Parameter:
 *   interval  — ONE_MIN | FIFTEEN_MIN | ONE_HOUR | ONE_DAY (Default: ONE_HOUR)
 *   limit     — Anzahl Kerzen (Default: 500, Max: 1000)
 *   live      — "true" → direkte DB-Berechnung statt Cache (für Echtzeit-Updates)
 *
 * Response-Format (Lightweight-Charts-kompatibel):
 *   {
 *     productId, productName, interval,
 *     candles: [{ time, open, high, low, close }],
 *     volume:  [{ time, value, color }],
 *     ticker:  { lastPrice, changePct, volume24h }
 *   }
 *
 * Performance:
 *   - Default: liest aus market_candles Cache (Index-Scan, < 5ms)
 *   - ?live=true: direkte OHLC-Berechnung aus deals-Tabelle (langsamer, für Admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import {
  getCachedCandles,
  getCachedVolume,
  computeOhlc,
} from "@/lib/market/ohlc-queries";
import type { CandleInterval } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_INTERVALS = new Set<CandleInterval>([
  "ONE_MIN", "FIFTEEN_MIN", "ONE_HOUR", "ONE_DAY",
]);

// Lookback-Fenster für "live"-Berechnung je Intervall
const LIVE_LOOKBACK_MS: Record<CandleInterval, number> = {
  ONE_MIN:     60  * 60 * 1000,          // 1h rückwärts
  FIFTEEN_MIN: 24  * 60 * 60 * 1000,     // 1d rückwärts
  ONE_HOUR:    7   * 24 * 60 * 60 * 1000, // 7d rückwärts
  ONE_DAY:     365 * 24 * 60 * 60 * 1000, // 1 Jahr rückwärts
};

export async function GET(
  req:     NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  const params = req.nextUrl.searchParams;

  const rawInterval = (params.get("interval") ?? "ONE_HOUR") as CandleInterval;
  const limit       = Math.min(parseInt(params.get("limit") ?? "500", 10), 1000);
  const live        = params.get("live") === "true";

  if (!VALID_INTERVALS.has(rawInterval)) {
    return NextResponse.json(
      { error: `Ungültiges Intervall. Erlaubt: ${[...VALID_INTERVALS].join(", ")}` },
      { status: 400 }
    );
  }

  // ── Produkt prüfen ──────────────────────────────────────────────────────
  const product = await db.product.findUnique({
    where:  { id: productId },
    select: { id: true, name: true, unit: true, category: { select: { slug: true, label: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
  }

  try {
    let candles;
    let volume;

    if (live) {
      // ── Direkte OHLC-Berechnung (für Admin / Echtzeit) ─────────────────
      const since = new Date(Date.now() - LIVE_LOOKBACK_MS[rawInterval]);
      const rows  = await computeOhlc(productId, rawInterval, since);

      candles = rows.map((r) => ({
        time:  Math.floor(r.periodStart.getTime() / 1000),
        open:  parseFloat(r.open),
        high:  parseFloat(r.high),
        low:   parseFloat(r.low),
        close: parseFloat(r.close),
      }));

      volume = rows.map((r) => {
        const isUp = parseFloat(r.close) >= parseFloat(r.open);
        return {
          time:  Math.floor(r.periodStart.getTime() / 1000),
          value: parseFloat(r.volume),
          color: isUp ? "rgba(0, 150, 136, 0.5)" : "rgba(255, 82, 82, 0.5)",
        };
      });
    } else {
      // ── Cache lesen (Standard-Pfad — schnell) ──────────────────────────
      [candles, volume] = await Promise.all([
        getCachedCandles(productId, rawInterval, limit),
        getCachedVolume(productId, rawInterval, limit),
      ]);
    }

    // ── Ticker-Daten (letzter Preis + 24h-Änderung) ─────────────────────
    const lastCandle = candles.at(-1);
    const firstCandle = candles.find(
      (c) => c.time >= (Date.now() / 1000 - 86_400)
    ) ?? candles[0];

    const lastPrice  = lastCandle?.close ?? 0;
    const openPrice  = firstCandle?.open ?? lastPrice;
    const change     = lastPrice - openPrice;
    const changePct  = openPrice > 0 ? (change / openPrice) * 100 : 0;
    const totalVol   = volume.reduce((s, v) => s + v.value, 0);

    return NextResponse.json({
      productId,
      productName:  product.name,
      categorySlug: product.category.slug,
      categoryLabel: product.category.label,
      unit:         product.unit,
      interval:     rawInterval,
      candleCount:  candles.length,
      candles,
      volume,
      ticker: {
        lastPrice:  lastPrice.toFixed(2),
        change:     `${change >= 0 ? "+" : ""}${change.toFixed(2)}`,
        changePct:  `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
        isUp:       change >= 0,
        volume24h:  totalVol.toFixed(3),
      },
    }, {
      headers: {
        // 30 Sekunden Cache für CDN — bei Live-Daten kein Cache
        "Cache-Control": live ? "no-store" : "public, s-maxage=30, stale-while-revalidate=60",
      },
    });

  } catch (err) {
    console.error(`[GET /api/market/${productId}/candles]`, err);
    return NextResponse.json({ error: "Analysefehler" }, { status: 500 });
  }
}
