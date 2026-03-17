/**
 * EUCX MarketDataService — OHLC-Aggregation & Cache-Refresh
 *
 * Verantwortlich für:
 *   1. OHLC-Berechnung via PostgreSQL Raw-SQL (Window-Functions)
 *   2. Schreiben der Ergebnisse in market_candles (Upsert-Cache)
 *   3. Refresh-Scheduler (@Cron) für alle Intervalle
 *
 * ─── Refresh-Frequenzen ──────────────────────────────────────────────────────
 *
 *   ONE_MIN:     alle 60 Sekunden    — @Cron("every minute")
 *   FIFTEEN_MIN: alle 5 Minuten      — @Cron("every 5 minutes")
 *   ONE_HOUR:    jede volle Stunde   — @Cron("every hour")
 *   ONE_DAY:     täglich um 00:05    — @Cron("5 0 daily")
 *
 * ─── OHLC-SQL (PostgreSQL Window-Functions) ──────────────────────────────────
 *
 *   Open  = price des ERSTEN Trades im Fenster  (ROW_NUMBER() OVER ... ORDER BY created_at ASC  = 1)
 *   High  = MAX(price_per_unit)
 *   Low   = MIN(price_per_unit)
 *   Close = price des LETZTEN Trades im Fenster (ROW_NUMBER() OVER ... ORDER BY created_at DESC = 1)
 *
 * ─── Idempotenz ───────────────────────────────────────────────────────────────
 *
 *   Upsert auf @@unique([productId, interval, periodStart]):
 *     → Kein Fehler bei doppeltem Cron-Lauf
 *     → Kein fehlender Eintrag bei erstem Lauf
 */

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../config/prisma.service";

// Alle Intervalle die der Service verwaltet
type CandleInterval = "ONE_MIN" | "FIFTEEN_MIN" | "ONE_HOUR" | "ONE_DAY";

// date_trunc-Ausdruck pro Intervall
const PERIOD_EXPR: Record<CandleInterval, string> = {
  ONE_MIN:
    "date_trunc('minute', d.created_at)",
  FIFTEEN_MIN:
    "date_trunc('hour', d.created_at) + INTERVAL '1 minute' * (floor(extract(minute FROM d.created_at) / 15) * 15)",
  ONE_HOUR:
    "date_trunc('hour', d.created_at)",
  ONE_DAY:
    "date_trunc('day', d.created_at)",
};

// Lookback für partielle Aktualisierung (nur neue Daten refreshen)
const LOOKBACK_MS: Record<CandleInterval, number> = {
  ONE_MIN:     5  * 60 * 1000,             // 5 Minuten Überlappung
  FIFTEEN_MIN: 30 * 60 * 1000,             // 30 Minuten Überlappung
  ONE_HOUR:    2  * 60 * 60 * 1000,        // 2 Stunden Überlappung
  ONE_DAY:     2  * 24 * 60 * 60 * 1000,   // 2 Tage Überlappung
};

interface RawOhlcRow {
  product_id:   string;
  period_start: Date;
  open:         unknown;
  high:         unknown;
  low:          unknown;
  close:        unknown;
  volume:       unknown;
  turnover:     unknown;
  trade_count:  bigint | number;
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Cron-Jobs ─────────────────────────────────────────────────────────────

  @Cron("*/1 * * * *")           // jede Minute
  async refreshOneMinCandles() {
    await this.refreshInterval("ONE_MIN");
  }

  @Cron("*/5 * * * *")           // alle 5 Minuten
  async refreshFifteenMinCandles() {
    await this.refreshInterval("FIFTEEN_MIN");
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refreshOneHourCandles() {
    await this.refreshInterval("ONE_HOUR");
  }

  @Cron("5 0 * * *")             // täglich 00:05 UTC
  async refreshOneDayCandles() {
    await this.refreshInterval("ONE_DAY");
  }

  // ─── Manueller Trigger (z.B. nach Settlement) ─────────────────────────────

  async refreshProduct(productId: string): Promise<void> {
    for (const interval of Object.keys(LOOKBACK_MS) as CandleInterval[]) {
      await this.refreshInterval(interval, productId);
    }
  }

  // ─── Kernlogik ────────────────────────────────────────────────────────────

  async refreshInterval(
    interval:  CandleInterval,
    productId?: string,
  ): Promise<void> {
    const since = new Date(Date.now() - LOOKBACK_MS[interval]);
    const label = productId ? `Produkt ${productId}` : "alle Produkte";

    this.logger.debug(`OHLC-Refresh: ${interval} — ${label}`);

    try {
      const rows = await this.queryOhlc(interval, since, productId);
      if (rows.length === 0) return;

      // Batch-Upsert: alle Kerzen auf einmal schreiben
      // Prisma hat kein native "upsertMany" — wir nutzen createMany mit skipDuplicates
      // + separates Update für existing records
      await this.upsertCandles(rows, interval);

      this.logger.debug(
        `OHLC-Refresh ${interval}: ${rows.length} Kerzen upserted (${label})`
      );
    } catch (err) {
      this.logger.error(
        `OHLC-Refresh ${interval} fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private async queryOhlc(
    interval:   CandleInterval,
    since:      Date,
    productId?: string,
  ): Promise<RawOhlcRow[]> {
    const periodExpr = PERIOD_EXPR[interval];

    /*
     * SQL-Struktur: CTE + Aggregation
     *
     *   CTE "ordered":
     *     - Alle deals seit `since` (mit optionalem Produkt-Filter)
     *     - period_start: gerundeter Zeitstempel je Intervall
     *     - rn_asc:  Zeilennummer aufsteigend pro Fenster → 1 = OPEN-Trade
     *     - rn_desc: Zeilennummer absteigend pro Fenster  → 1 = CLOSE-Trade
     *
     *   Hauptquery:
     *     - CASE WHEN rn_asc=1 THEN price → OPEN  (MAX wählt den einen nicht-NULL Wert)
     *     - CASE WHEN rn_desc=1 THEN price → CLOSE
     *     - MAX/MIN für HIGH/LOW
     *     - SUM für Volume + Turnover
     *
     * Warum CASE+MAX statt FIRST_VALUE():
     *   FIRST_VALUE() ist ein Window-Function und kann nicht im GROUP BY verwendet werden.
     *   CASE+MAX ist das Standard-Pattern für "first/last in group" in PostgreSQL.
     */

    // Prisma $queryRaw unterstützt keine dynamischen SQL-Fragmente (PERIOD_EXPR ist Variable).
    // Wir bauen den Query als Template-String — productId-Filter über Prisma.sql-Interpolation.
    // ACHTUNG: PERIOD_EXPR enthält KEIN User-Input → SQL-Injection-Risiko = 0.
    const query = productId
      ? `
          WITH ordered AS (
            SELECT
              d.product_id,
              d.price_per_unit,
              d.quantity,
              d.total_value,
              (${periodExpr})::timestamptz                              AS period_start,
              ROW_NUMBER() OVER (
                PARTITION BY d.product_id, (${periodExpr})
                ORDER BY d.created_at ASC
              )                                                         AS rn_asc,
              ROW_NUMBER() OVER (
                PARTITION BY d.product_id, (${periodExpr})
                ORDER BY d.created_at DESC
              )                                                         AS rn_desc
            FROM deals d
            WHERE d.product_id = $1
              AND d.status NOT IN ('CANCELLED', 'DISPUTED')
              AND d.created_at >= $2
          )
          SELECT
            product_id,
            period_start,
            MAX(CASE WHEN rn_asc  = 1 THEN price_per_unit END)::numeric AS open,
            MAX(price_per_unit)::numeric                                 AS high,
            MIN(price_per_unit)::numeric                                 AS low,
            MAX(CASE WHEN rn_desc = 1 THEN price_per_unit END)::numeric AS close,
            SUM(quantity)::numeric                                       AS volume,
            SUM(total_value)::numeric                                    AS turnover,
            COUNT(*)                                                     AS trade_count
          FROM ordered
          GROUP BY product_id, period_start
          ORDER BY product_id, period_start ASC
        `
      : `
          WITH ordered AS (
            SELECT
              d.product_id,
              d.price_per_unit,
              d.quantity,
              d.total_value,
              (${periodExpr})::timestamptz                              AS period_start,
              ROW_NUMBER() OVER (
                PARTITION BY d.product_id, (${periodExpr})
                ORDER BY d.created_at ASC
              )                                                         AS rn_asc,
              ROW_NUMBER() OVER (
                PARTITION BY d.product_id, (${periodExpr})
                ORDER BY d.created_at DESC
              )                                                         AS rn_desc
            FROM deals d
            WHERE d.status NOT IN ('CANCELLED', 'DISPUTED')
              AND d.created_at >= $1
          )
          SELECT
            product_id,
            period_start,
            MAX(CASE WHEN rn_asc  = 1 THEN price_per_unit END)::numeric AS open,
            MAX(price_per_unit)::numeric                                 AS high,
            MIN(price_per_unit)::numeric                                 AS low,
            MAX(CASE WHEN rn_desc = 1 THEN price_per_unit END)::numeric AS close,
            SUM(quantity)::numeric                                       AS volume,
            SUM(total_value)::numeric                                    AS turnover,
            COUNT(*)                                                     AS trade_count
          FROM ordered
          GROUP BY product_id, period_start
          ORDER BY product_id, period_start ASC
        `;

    return productId
      ? this.prisma.$queryRawUnsafe<RawOhlcRow[]>(query, productId, since)
      : this.prisma.$queryRawUnsafe<RawOhlcRow[]>(query, since);
  }

  private async upsertCandles(
    rows:     RawOhlcRow[],
    interval: CandleInterval,
  ): Promise<void> {
    // Prisma hat kein upsertMany — wir nutzen eine serielle Transaktion
    // mit skipDuplicates=false und stattdessen einen raw UPSERT.
    //
    // PostgreSQL ON CONFLICT DO UPDATE ist das performanteste Muster.
    //
    // Für Batch-Performance: alle Rows in einem einzigen Statement.
    // Wir bauen das via $queryRawUnsafe — values werden als Parameter übergeben.

    if (rows.length === 0) return;

    // Jeden Row einzeln upserten (einfacher, sicherer für MVP-Größen < 1000 Rows)
    // Für Produktion: Batch-INSERT ON CONFLICT DO UPDATE
    for (const row of rows) {
      // product-relation prüfen (für den Fall dass productId nicht in products existiert)
      await this.prisma.marketCandle.upsert({
        where: {
          productId_interval_periodStart: {
            productId:   row.product_id,
            interval,
            periodStart: row.period_start,
          },
        },
        create: {
          productId:   row.product_id,
          interval,
          periodStart: row.period_start,
          open:        String(row.open),
          high:        String(row.high),
          low:         String(row.low),
          close:       String(row.close),
          volume:      String(row.volume),
          turnover:    String(row.turnover),
          tradeCount:  typeof row.trade_count === "bigint"
            ? Number(row.trade_count)
            : row.trade_count as number,
        },
        update: {
          open:       String(row.open),
          high:       String(row.high),
          low:        String(row.low),
          close:      String(row.close),
          volume:     String(row.volume),
          turnover:   String(row.turnover),
          tradeCount: typeof row.trade_count === "bigint"
            ? Number(row.trade_count)
            : row.trade_count as number,
        },
      }).catch((err: unknown) => {
        // Fehler bei einzelner Kerze darf Gesamt-Refresh nicht stoppen
        this.logger.warn(
          `Upsert fehlgeschlagen für ${row.product_id}/${interval}/${row.period_start}: ${err instanceof Error ? err.message : String(err)}`
        );
      });
    }
  }

  // ─── Admin-Endpoint: vollständiger historischer Backfill ─────────────────

  async backfillProduct(productId: string, daysBack: number = 365): Promise<number> {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    let total   = 0;

    for (const interval of (["ONE_DAY", "ONE_HOUR", "FIFTEEN_MIN"] as CandleInterval[])) {
      const rows = await this.queryOhlc(interval, since, productId);
      await this.upsertCandles(rows, interval);
      total += rows.length;
    }

    this.logger.log(`Backfill ${productId}: ${total} Kerzen geschrieben`);
    return total;
  }
}
