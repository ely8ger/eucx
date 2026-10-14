/**
 * GET /api/admin/clearing/revenue/export?year=2026
 * GET /api/admin/clearing/revenue/export?month=2026-10
 *
 * CSV-Export der Umsatzdaten für Steuerberater.
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 *
 * Jahres-Export:   12-Zeilen-CSV (eine Zeile pro Monat)
 * Monats-Export:   Detail-CSV der einzelnen LedgerEntries im Zeitraum
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(...cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsv).join(",");
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

  // ── Jahres-CSV ────────────────────────────────────────────────────────────────
  if (yearParam && /^\d{4}$/.test(yearParam)) {
    const year = parseInt(yearParam, 10);
    const lines: string[] = [
      row("Monat", "Umsatz_EUR", "MwSt_EUR", "Nettoumsatz_EUR", "Deals", "Lots", "Gesamt_Transaktionen"),
    ];

    for (let m = 0; m < 12; m++) {
      const start = new Date(Date.UTC(year, m, 1));
      const end   = new Date(Date.UTC(year, m + 1, 1));
      const label = `${year}-${String(m + 1).padStart(2, "0")}`;

      const [rev, vat, trades, lots] = await Promise.all([
        db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { accountType: "EUCX_FEE_REVENUE", entryType: "CREDIT", createdAt: { gte: start, lt: end } } }),
        db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { accountType: "VAT_PAYABLE",      entryType: "CREDIT", createdAt: { gte: start, lt: end } } }),
        db.settlement.count({ where: { dealId: { not: null }, status: "COMPLETED", processedAt: { gte: start, lt: end } } }),
        db.settlement.count({ where: { lotContractId: { not: null }, status: "COMPLETED", processedAt: { gte: start, lt: end } } }),
      ]);

      const total  = new Decimal(rev._sum.amount?.toString() ?? "0");
      const vatAmt = new Decimal(vat._sum.amount?.toString() ?? "0");
      lines.push(row(label, total.toFixed(2), vatAmt.toFixed(2), total.minus(vatAmt).toFixed(2), trades, lots, trades + lots));
    }

    const csv      = lines.join("\n");
    const filename = `EUCX_Umsatz_${year}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // ── Monats-CSV (LedgerEntry-Detail) ──────────────────────────────────────────
  let periodStart: Date;
  let periodEnd:   Date;
  let periodLabel: string;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number) as [number, number];
    periodStart  = new Date(Date.UTC(y, m - 1, 1));
    periodEnd    = new Date(Date.UTC(y, m, 1));
    periodLabel  = monthParam;
  } else {
    const now    = new Date();
    periodStart  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    periodEnd    = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    periodLabel  = now.toISOString().slice(0, 7);
  }

  const entries = await db.ledgerEntry.findMany({
    where: {
      accountType: { in: ["EUCX_FEE_REVENUE", "VAT_PAYABLE"] },
      entryType:   "CREDIT",
      createdAt:   { gte: periodStart, lt: periodEnd },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id:            true,
      correlationId: true,
      accountType:   true,
      amount:        true,
      currency:      true,
      description:   true,
      dealId:        true,
      lotContractId: true,
      createdAt:     true,
    },
  });

  const lines: string[] = [
    row("Datum", "ID", "Buchungsart", "Betrag_EUR", "Währung", "Beschreibung", "Deal_ID", "LotContract_ID", "Korrelations_ID"),
  ];

  for (const e of entries) {
    lines.push(row(
      e.createdAt.toISOString(),
      e.id,
      e.accountType,
      new Decimal(e.amount.toString()).toFixed(2),
      e.currency,
      e.description,
      e.dealId ?? "",
      e.lotContractId ?? "",
      e.correlationId,
    ));
  }

  const csv      = lines.join("\n");
  const filename = `EUCX_Umsatz_Detail_${periodLabel}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
