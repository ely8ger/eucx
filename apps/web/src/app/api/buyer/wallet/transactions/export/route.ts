/**
 * GET /api/buyer/wallet/transactions/export
 *
 * CSV-Export aller LedgerEntries des eigenen Wallets.
 * Für Steuerberater und persönliche Buchführung.
 * Auth: Bearer JWT (alle Wallet-Inhaber)
 *
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (optional)
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

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

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam   = searchParams.get("to");

  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: { id: true },
  });

  if (!wallet) {
    return new NextResponse("Kein Wallet vorhanden", { status: 404 });
  }

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam)) {
    dateFilter.gte = new Date(fromParam + "T00:00:00Z");
  }
  if (toParam && /^\d{4}-\d{2}-\d{2}$/.test(toParam)) {
    dateFilter.lte = new Date(toParam + "T23:59:59Z");
  }

  const entries = await db.ledgerEntry.findMany({
    where: {
      walletId:  wallet.id,
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id:            true,
      entryType:     true,
      accountType:   true,
      amount:        true,
      currency:      true,
      description:   true,
      correlationId: true,
      dealId:        true,
      lotContractId: true,
      createdAt:     true,
    },
  });

  const lines: string[] = [
    row("Datum", "Buchungsart", "Kontoart", "Betrag_EUR", "Währung", "Beschreibung", "Deal_ID", "LotContract_ID", "ID"),
  ];

  for (const e of entries) {
    // DEBIT negativ, CREDIT positiv für Steuerberater-Konvention
    const sign   = e.entryType === "DEBIT" ? "-" : "";
    lines.push(row(
      e.createdAt.toISOString(),
      e.entryType,
      e.accountType,
      sign + new Decimal(e.amount.toString()).toFixed(2),
      e.currency,
      e.description,
      e.dealId ?? "",
      e.lotContractId ?? "",
      e.id,
    ));
  }

  const csv      = lines.join("\n");
  const dateStr  = new Date().toISOString().slice(0, 10);
  const filename = `EUCX_Kontoauszug_${dateStr}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
