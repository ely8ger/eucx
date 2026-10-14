/**
 * GET /api/admin/clearing/revenue?month=2026-10
 *
 * Aggregiert vereinnahmte Plattformgebühren aus LedgerEntries für einen Monat.
 *
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 *
 * Query-Parameter:
 *   month: YYYY-MM (Default: aktueller Monat)
 *
 * Antwort:
 *   { period, totalRevenue, vatCollected, netRevenue, tradeCount, lotCount, currency }
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month");

  // Monatsgrenzen berechnen
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

  // Plattformgebühren aggregieren
  const revenueAgg = await db.ledgerEntry.aggregate({
    _sum:   { amount: true },
    _count: { id: true },
    where: {
      accountType: "EUCX_FEE_REVENUE",
      entryType:   "CREDIT",
      createdAt:   { gte: periodStart, lt: periodEnd },
    },
  });

  // MwSt. aggregieren
  const vatAgg = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      accountType: "VAT_PAYABLE",
      entryType:   "CREDIT",
      createdAt:   { gte: periodStart, lt: periodEnd },
    },
  });

  // Anzahl Deals und LotContracts im Zeitraum
  const [tradeCount, lotCount] = await Promise.all([
    db.settlement.count({
      where: {
        dealId:      { not: null },
        status:      "COMPLETED",
        processedAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    db.settlement.count({
      where: {
        lotContractId: { not: null },
        status:        "COMPLETED",
        processedAt:   { gte: periodStart, lt: periodEnd },
      },
    }),
  ]);

  const totalRevenue = new Decimal(revenueAgg._sum.amount?.toString() ?? "0");
  const vatCollected = new Decimal(vatAgg._sum.amount?.toString() ?? "0");
  const netRevenue   = totalRevenue.minus(vatCollected);

  return NextResponse.json({
    period: {
      month:      monthParam ?? new Date().toISOString().slice(0, 7),
      start:      periodStart.toISOString(),
      end:        periodEnd.toISOString(),
    },
    currency:     "EUR",
    totalRevenue: totalRevenue.toFixed(2),
    vatCollected: vatCollected.toFixed(2),
    netRevenue:   netRevenue.toFixed(2),
    tradeCount,
    lotCount,
    totalTransactions: tradeCount + lotCount,
  });
}
