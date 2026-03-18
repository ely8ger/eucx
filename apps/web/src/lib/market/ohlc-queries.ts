/**
 * EUCX OHLC-Queries - PostgreSQL Raw-SQL für Time-Series-Aggregation
 *
 * Warum Raw-SQL statt Prisma-ORM:
 *   OHLC braucht FIRST/LAST-Wert eines geordneten Fensters.
 *   PostgreSQL unterstützt das nativ via ROW_NUMBER()-Window-Functions -
 *   Prisma ORM kann keine Window-Functions ausdrücken.
 *
 * ─── OHLC-Algorithmus ────────────────────────────────────────────────────────
 *
 *   Zeitfenster (z.B. 1 Stunde):
 *     periodStart = date_trunc('hour', deal.createdAt)
 *
 *   Innerhalb jedes Fensters:
 *     OPEN  = price_per_unit des zeitlich ERSTEN Trades (ROW_NUMBER ASC = 1)
 *     HIGH  = MAX(price_per_unit)  ← einfaches Aggregat
 *     LOW   = MIN(price_per_unit)  ← einfaches Aggregat
 *     CLOSE = price_per_unit des zeitlich LETZTEN Trades (ROW_NUMBER DESC = 1)
 *     VOLUME = SUM(quantity)       ← Handelsmenge
 *     TURNOVER = SUM(total_value)  ← Handelsvolumen in EUR
 *
 * ─── Performance ─────────────────────────────────────────────────────────────
 *
 *   Index auf (product_id, created_at) reicht für diesen Query vollständig.
 *   Für Produktion: Materialized View über diesen Query + pg_cron für Refresh.
 *   Für MVP: Cache-Tabelle market_candles + NestJS @Cron() Refresh.
 *
 * ─── Referenz ────────────────────────────────────────────────────────────────
 *
 *   PostgreSQL OHLC Pattern:
 *     https://wiki.postgresql.org/wiki/First/last_(aggregate)
 *     DISTINCT ON als Alternative zu ROW_NUMBER() für FIRST/LAST
 */

import { db } from "@/lib/db/client";
import type { CandleInterval } from "@prisma/client";
import Decimal from "decimal.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OhlcRow {
  periodStart: Date;
  open:        string;  // Decimal-String
  high:        string;
  low:         string;
  close:       string;
  volume:      string;
  turnover:    string;
  tradeCount:  number;
}

/** Lightweight-Charts-kompatibles Candlestick-Datum */
export interface CandleData {
  time:   number;   // Unix-Timestamp (Sekunden) - Lightweight Charts erwartet das
  open:   number;
  high:   number;
  low:    number;
  close:  number;
}

/** Lightweight-Charts-kompatibles Volume-Histogramm */
export interface VolumeBarData {
  time:  number;
  value: number;
  color: string;   // grün wenn close>=open, rot sonst
}

// ─── Intervall → PostgreSQL date_trunc-String ─────────────────────────────────

const INTERVAL_TRUNC: Record<CandleInterval, string> = {
  ONE_MIN:     "minute",
  FIFTEEN_MIN: "minute",  // wird manuell gerundet (floor to 15-min)
  ONE_HOUR:    "hour",
  ONE_DAY:     "day",
};

/**
 * Berechnet OHLC-Kerzen für ein Produkt direkt aus der deals-Tabelle.
 *
 * Wird vom NestJS MarketDataService aufgerufen und in market_candles gecacht.
 * Direktaufruf (z.B. für letzte 24h ohne Cache) ist ebenfalls möglich.
 */
export async function computeOhlc(
  productId: string,
  interval:  CandleInterval,
  since:     Date,
  until:     Date = new Date(),
): Promise<OhlcRow[]> {
  // ── Fenster-Ausdruck für PostgreSQL ──────────────────────────────────────
  // FIFTEEN_MIN braucht floor(extract(minute)/15)*15 - etwas aufwändiger
  const periodExpr =
    interval === "FIFTEEN_MIN"
      ? `date_trunc('hour', d.created_at) + INTERVAL '1 minute' * (floor(extract(minute FROM d.created_at) / 15) * 15)`
      : `date_trunc('${INTERVAL_TRUNC[interval]}', d.created_at)`;

  /*
   * Strategie: ROW_NUMBER()-Window-Functions für OPEN/CLOSE.
   *
   *   rn_asc  = 1 → erster Trade im Fenster  → OPEN-Preis
   *   rn_desc = 1 → letzter Trade im Fenster → CLOSE-Preis
   *
   * MAX/MIN für HIGH/LOW sind einfache Aggregate.
   * SUM(quantity) für Volume, SUM(total_value) für Turnover.
   *
   * Gesamtstruktur:
   *   1. CTE "ordered" - alle relevanten Deals mit period_start + Zeilennummern
   *   2. Hauptquery - aggregiert über period_start
   */
  type RawRow = {
    period_start: Date;
    open:         unknown;  // Decimal aus Postgres → string/bigint je nach Treiber
    high:         unknown;
    low:          unknown;
    close:        unknown;
    volume:       unknown;
    turnover:     unknown;
    trade_count:  bigint | number;
  };

  const rows = await db.$queryRaw<RawRow[]>`
    WITH ordered AS (
      SELECT
        d.price_per_unit,
        d.quantity,
        d.total_value,
        d.created_at,
        (${periodExpr})::timestamptz            AS period_start,
        ROW_NUMBER() OVER (
          PARTITION BY (${periodExpr})
          ORDER BY d.created_at ASC
        )                                        AS rn_asc,
        ROW_NUMBER() OVER (
          PARTITION BY (${periodExpr})
          ORDER BY d.created_at DESC
        )                                        AS rn_desc
      FROM deals d
      WHERE d.product_id   = ${productId}
        AND d.status       NOT IN ('CANCELLED', 'DISPUTED')
        AND d.created_at   >= ${since}
        AND d.created_at   <  ${until}
    )
    SELECT
      period_start,
      MAX(CASE WHEN rn_asc  = 1 THEN price_per_unit END) AS open,
      MAX(price_per_unit)                                  AS high,
      MIN(price_per_unit)                                  AS low,
      MAX(CASE WHEN rn_desc = 1 THEN price_per_unit END) AS close,
      SUM(quantity)                                        AS volume,
      SUM(total_value)                                     AS turnover,
      COUNT(*)::int                                        AS trade_count
    FROM ordered
    GROUP BY period_start
    ORDER BY period_start ASC
  `;

  return rows.map((r) => ({
    periodStart: r.period_start,
    open:        String(r.open),
    high:        String(r.high),
    low:         String(r.low),
    close:       String(r.close),
    volume:      String(r.volume),
    turnover:    String(r.turnover),
    tradeCount:  typeof r.trade_count === "bigint"
      ? Number(r.trade_count)
      : r.trade_count as number,
  }));
}

// ─── Cache-Tabelle lesen ─────────────────────────────────────────────────────

/**
 * Liest OHLC-Kerzen aus dem market_candles Cache.
 * Deutlich schneller als computeOhlc() - nutzt den gecachten Index.
 */
export async function getCachedCandles(
  productId: string,
  interval:  CandleInterval,
  limit:     number = 500,
): Promise<CandleData[]> {
  const candles = await db.marketCandle.findMany({
    where:   { productId, interval },
    orderBy: { periodStart: "asc" },
    take:    limit,
    select: {
      periodStart: true,
      open:        true,
      high:        true,
      low:         true,
      close:       true,
    },
  });

  return candles.map((c) => ({
    time:  Math.floor(c.periodStart.getTime() / 1000),
    open:  new Decimal(c.open.toString()).toNumber(),
    high:  new Decimal(c.high.toString()).toNumber(),
    low:   new Decimal(c.low.toString()).toNumber(),
    close: new Decimal(c.close.toString()).toNumber(),
  }));
}

/**
 * Volume-Balken für das Volume-Histogramm unter dem Chart.
 * Farbe: grün wenn close >= open, rot sonst.
 */
export async function getCachedVolume(
  productId: string,
  interval:  CandleInterval,
  limit:     number = 500,
): Promise<VolumeBarData[]> {
  const candles = await db.marketCandle.findMany({
    where:   { productId, interval },
    orderBy: { periodStart: "asc" },
    take:    limit,
    select: {
      periodStart: true,
      open:        true,
      close:       true,
      volume:      true,
    },
  });

  return candles.map((c) => {
    const open  = new Decimal(c.open.toString());
    const close = new Decimal(c.close.toString());
    return {
      time:  Math.floor(c.periodStart.getTime() / 1000),
      value: new Decimal(c.volume.toString()).toNumber(),
      color: close.gte(open) ? "rgba(0, 150, 136, 0.5)" : "rgba(255, 82, 82, 0.5)",
    };
  });
}

// ─── Marktübersicht: letzter Preis + 24h-Change ──────────────────────────────

export interface MarketTicker {
  productId:    string;
  productName:  string;
  lastPrice:    string;
  priceChange:  string;   // absolut
  changePct:    string;   // prozentual, z.B. "+2.45%" oder "-1.12%"
  volume24h:    string;   // Handelsmenge letzte 24h
  turnover24h:  string;   // Handelsvolumen EUR letzte 24h
  tradeCount24h: number;
}

export async function getMarketTickers(productIds?: string[]): Promise<MarketTicker[]> {
  const candles = await db.marketCandle.findMany({
    where: {
      interval: "ONE_DAY",
      ...(productIds ? { productId: { in: productIds } } : {}),
      periodStart: {
        gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),  // letzte 2 Tage
      },
    },
    orderBy: { periodStart: "desc" },
    include: {
      product: { select: { name: true } },
    },
  });

  // Neueste Kerze pro Produkt
  const latestMap = new Map<string, typeof candles[0]>();
  const prevMap   = new Map<string, typeof candles[0]>();

  for (const c of candles) {
    const pid = c.productId;
    if (!latestMap.has(pid)) {
      latestMap.set(pid, c);
    } else if (!prevMap.has(pid)) {
      prevMap.set(pid, c);
    }
  }

  return Array.from(latestMap.entries()).map(([pid, latest]) => {
    const prev       = prevMap.get(pid);
    const lastPrice  = new Decimal(latest.close.toString());
    const openPrice  = prev
      ? new Decimal(prev.open.toString())
      : new Decimal(latest.open.toString());

    const change     = lastPrice.minus(openPrice);
    const changePct  = openPrice.gt(0)
      ? change.div(openPrice).times(100)
      : new Decimal(0);

    const sign = change.gte(0) ? "+" : "";

    return {
      productId:     pid,
      productName:   latest.product.name,
      lastPrice:     lastPrice.toFixed(2),
      priceChange:   `${sign}${change.toFixed(2)}`,
      changePct:     `${sign}${changePct.toFixed(2)}%`,
      volume24h:     new Decimal(latest.volume.toString()).toFixed(3),
      turnover24h:   new Decimal(latest.turnover.toString()).toFixed(2),
      tradeCount24h: latest.tradeCount,
    };
  });
}
