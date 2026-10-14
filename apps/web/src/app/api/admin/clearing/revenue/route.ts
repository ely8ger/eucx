/**
 * GET /api/admin/clearing/revenue?month=2026-10
 * GET /api/admin/clearing/revenue?year=2026
 *
 * Aggregiert vereinnahmte Plattformgebühren aus LedgerEntries.
 *
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 *
 * Query-Parameter:
 *   month: YYYY-MM — Monatsübersicht (Default: aktueller Monat)
 *   year:  YYYY    — Jahresübersicht mit monatlicher Aufschlüsselung (hat Vorrang)
 *
 * Antwort:
 *   Monat: { period, totalRevenue, vatCollected, netRevenue, tradeCount, lotCount, currency }
 *   Jahr:  { period, totalRevenue, vatCollected, netRevenue, tradeCount, lotCount, currency, breakdown[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

// Hilfsfunktion: Aggregation für einen Zeitraum
async function aggregatePeriod(start: Date, end: Date) {
  const [revenueAgg, vatAgg, tradeCount, lotCount] = await Promise.all([
    db.ledgerEntry.aggregate({
      _sum:   { amount: true },
      _count: { id: true },
      where: {
        accountType: "EUCX_FEE_REVENUE",
        entryType:   "CREDIT",
        createdAt:   { gte: start, lt: end },
      },
    }),
    db.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        accountType: "VAT_PAYABLE",
        entryType:   "CREDIT",
        createdAt:   { gte: start, lt: end },
      },
    }),
    db.settlement.count({
      where: {
        dealId:      { not: null },
        status:      "COMPLETED",
        processedAt: { gte: start, lt: end },
      },
    }),
    db.settlement.count({
      where: {
        lotContractId: { not: null },
        status:        "COMPLETED",
        processedAt:   { gte: start, lt: end },
      },
    }),
  ]);

  const totalRevenue = new Decimal(revenueAgg._sum.amount?.toString() ?? "0");
  const vatCollected = new Decimal(vatAgg._sum.amount?.toString() ?? "0");
  const netRevenue   = totalRevenue.minus(vatCollected);

  return { totalRevenue, vatCollected, netRevenue, tradeCount, lotCount };
}

export async function GET(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam  = searchParams.get("year");
  const monthParam = searchParams.get("month");

  // ── Jahresübersicht ───────────────────────────────────────────────────────────
  if (yearParam && /^\d{4}$/.test(yearParam)) {
    const year       = parseInt(yearParam, 10);
    const yearStart  = new Date(Date.UTC(year,     0, 1));
    const yearEnd    = new Date(Date.UTC(year + 1, 0, 1));

    // 12 Monate parallel aggregieren
    const monthPromises = Array.from({ length: 12 }, (_, i) => {
      const mStart = new Date(Date.UTC(year, i,     1));
      const mEnd   = new Date(Date.UTC(year, i + 1, 1));
      return aggregatePeriod(mStart, mEnd).then((data) => ({
        month:        `${year}-${String(i + 1).padStart(2, "0")}`,
        revenue:      data.totalRevenue.toFixed(2),
        vat:          data.vatCollected.toFixed(2),
        netRevenue:   data.netRevenue.toFixed(2),
        trades:       data.tradeCount,
        lots:         data.lotCount,
      }));
    });

    const [breakdown, yearTotals] = await Promise.all([
      Promise.all(monthPromises),
      aggregatePeriod(yearStart, yearEnd),
    ]);

    return NextResponse.json({
      period: {
        year,
        start: yearStart.toISOString(),
        end:   yearEnd.toISOString(),
      },
      currency:          "EUR",
      totalRevenue:      yearTotals.totalRevenue.toFixed(2),
      vatCollected:      yearTotals.vatCollected.toFixed(2),
      netRevenue:        yearTotals.netRevenue.toFixed(2),
      tradeCount:        yearTotals.tradeCount,
      lotCount:          yearTotals.lotCount,
      totalTransactions: yearTotals.tradeCount + yearTotals.lotCount,
      breakdown,
    });
  }

  // ── Monatsübersicht (Standard) ────────────────────────────────────────────────
  let periodStart: Date;
  let periodEnd:   Date;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number) as [number, number];
    periodStart = new Date(Date.UTC(year, month - 1, 1));
    periodEnd   = new Date(Date.UTC(year, month, 1));
  } else {
    const now = new Date();
    periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    periodEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  }

  const { totalRevenue, vatCollected, netRevenue, tradeCount, lotCount } =
    await aggregatePeriod(periodStart, periodEnd);

  return NextResponse.json({
    period: {
      month:      monthParam ?? new Date().toISOString().slice(0, 7),
      start:      periodStart.toISOString(),
      end:        periodEnd.toISOString(),
    },
    currency:          "EUR",
    totalRevenue:      totalRevenue.toFixed(2),
    vatCollected:      vatCollected.toFixed(2),
    netRevenue:        netRevenue.toFixed(2),
    tradeCount,
    lotCount,
    totalTransactions: tradeCount + lotCount,
  });
}
