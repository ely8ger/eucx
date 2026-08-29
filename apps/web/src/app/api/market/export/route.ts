/**
 * GET /api/market/export
 *
 * Exportiert die eigenen abgeschlossenen Trades als CSV oder Excel (XLSX).
 *
 * Query-Parameter:
 *   format     - "csv" | "xlsx" (Default: "csv")
 *   from       - ISO-Datum, z.B. "2026-01-01"
 *   to         - ISO-Datum, z.B. "2026-03-31"
 *   productId  - optional, Filter auf ein Produkt
 *
 * Zweck: Händler exportieren ihre Trades für die interne Buchhaltung.
 * Spalten:
 *   Deal-ID | Datum | Produkt | Kategorie | Richtung | Menge | Einheit |
 *   Preis/Einheit | Gesamtwert | Plattformgebühr | MwSt | Nettobetrag | Status
 *
 * Sicherheit:
 *   - Nur eigene Deals (Org des eingeloggten Users)
 *   - Kein Zugriff auf Deals anderer Organisationen
 */

import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import ExcelJS                       from "exceljs";

export const dynamic = "force-dynamic";

// ─── Spalten-Definitionen ─────────────────────────────────────────────────────

const HEADERS = [
  "Deal-ID",
  "Datum",
  "Produkt",
  "Kategorie",
  "Richtung",
  "Menge",
  "Einheit",
  "Preis/Einheit (EUR)",
  "Gesamtwert (EUR)",
  "EUCX-Gebühr (EUR)",
  "MwSt. (EUR)",
  "Nettobetrag (EUR)",
  "Gegenseite (Org)",
  "Status",
  "Rechnungsnummer",
];

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: { userId: string };
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  // ── User + Org laden ──────────────────────────────────────────────────────
  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { organizationId: true, organization: { select: { name: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
  }

  const params    = req.nextUrl.searchParams;
  const format    = params.get("format") ?? "csv";
  const productId = params.get("productId") ?? undefined;

  // Datums-Filter mit Validation
  let fromDate: Date | undefined;
  let toDate:   Date | undefined;

  const fromStr = params.get("from");
  const toStr   = params.get("to");

  if (fromStr) {
    fromDate = new Date(fromStr);
    if (isNaN(fromDate.getTime())) {
      return NextResponse.json({ error: "Ungültiges 'from'-Datum (ISO 8601 erwartet)" }, { status: 400 });
    }
  }
  if (toStr) {
    toDate = new Date(toStr);
    toDate.setHours(23, 59, 59, 999);  // bis Ende des Tages
    if (isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Ungültiges 'to'-Datum (ISO 8601 erwartet)" }, { status: 400 });
    }
  }

  // ── Deals laden (nur eigene Organisation) ────────────────────────────────
  const deals = await db.deal.findMany({
    where: {
      OR: [
        { sellerOrgId: user.organizationId },
        { buyerOrgId:  user.organizationId },
      ],
      status:    { notIn: ["CANCELLED", "DISPUTED"] },
      productId,
      createdAt: {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate   ? { lte: toDate   } : {}),
      },
    },
    include: {
      product:   { include: { category: { select: { label: true } } } },
      sellerOrg: { select: { name: true } },
      buyerOrg:  { select: { name: true } },
      invoices: {
        where: {
          OR: [
            { issuerId:    user.organizationId },
            { recipientId: user.organizationId },
          ],
        },
        select: {
          invoiceNumber: true,
          platformFee:   true,
          vatAmount:     true,
          netPayable:    true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
    take:    10_000,   // Sicherheitslimit
  });

  if (deals.length === 0) {
    return NextResponse.json(
      { message: "Keine Trades im gewählten Zeitraum" },
      { status: 204 }
    );
  }

  // ── Daten aufbereiten ─────────────────────────────────────────────────────
  const myOrgId = user.organizationId;

  const rows = deals.map((deal) => {
    const isSeller     = deal.sellerOrgId === myOrgId;
    const direction    = isSeller ? "VERKAUF" : "KAUF";
    const counterparty = isSeller ? deal.buyerOrg.name : deal.sellerOrg.name;
    const invoice      = deal.invoices[0];

    return [
      deal.id,
      deal.createdAt.toISOString().replace("T", " ").slice(0, 19),
      deal.product.name,
      deal.product.category.label,
      direction,
      deal.quantity.toString(),
      deal.product.unit,
      deal.pricePerUnit.toString(),
      deal.totalValue.toString(),
      invoice?.platformFee?.toString()  ?? "",
      invoice?.vatAmount?.toString()    ?? "",
      invoice?.netPayable?.toString()   ?? "",
      counterparty,
      deal.status,
      invoice?.invoiceNumber ?? "",
    ];
  });

  const filename = `eucx-trades-${user.organization.name.replace(/\s/g, "-")}-${new Date().toISOString().slice(0, 10)}`;

  // ── CSV-Format ────────────────────────────────────────────────────────────
  if (format === "csv") {
    const lines = [
      HEADERS.join(";"),
      ...rows.map((r) =>
        r.map((cell) => {
          const s = String(cell ?? "");
          // CSV-Injection-Schutz: Werte mit Sonderzeichen in Quotes einschließen
          return s.includes(";") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        }).join(";")
      ),
    ];

    // BOM für korrekte Darstellung in Excel (Windows)
    const bom     = "\uFEFF";
    const csvText = bom + lines.join("\r\n");

    return new Response(csvText, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control":       "no-store",
      },
    });
  }

  // ── XLSX-Format ───────────────────────────────────────────────────────────
  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    wb.creator  = "EUCX";
    wb.created  = new Date();

    const ws = wb.addWorksheet("EUCX Trades");

    // Spaltenbreiten und Header
    ws.columns = [
      { header: HEADERS[0],  key: "c0",  width: 38 },
      { header: HEADERS[1],  key: "c1",  width: 20 },
      { header: HEADERS[2],  key: "c2",  width: 30 },
      { header: HEADERS[3],  key: "c3",  width: 18 },
      { header: HEADERS[4],  key: "c4",  width: 10 },
      { header: HEADERS[5],  key: "c5",  width: 12 },
      { header: HEADERS[6],  key: "c6",  width: 8  },
      { header: HEADERS[7],  key: "c7",  width: 18 },
      { header: HEADERS[8],  key: "c8",  width: 18 },
      { header: HEADERS[9],  key: "c9",  width: 18 },
      { header: HEADERS[10], key: "c10", width: 14 },
      { header: HEADERS[11], key: "c11", width: 18 },
      { header: HEADERS[12], key: "c12", width: 30 },
      { header: HEADERS[13], key: "c13", width: 18 },
      { header: HEADERS[14], key: "c14", width: 22 },
    ];

    // Header-Zeile fett
    ws.getRow(1).font = { bold: true };

    // Daten einfügen
    rows.forEach((row) => ws.addRow(row));

    // Metadaten-Sheet
    const meta = wb.addWorksheet("Export-Info");
    meta.addRows([
      ["Export erstellt am:", new Date().toLocaleString("de-DE")],
      ["Organisation:",       user.organization.name],
      ["Zeitraum von:",       fromDate?.toLocaleDateString("de-DE") ?? "-"],
      ["Zeitraum bis:",       toDate?.toLocaleDateString("de-DE")   ?? "-"],
      ["Anzahl Trades:",      deals.length],
    ]);

    const buffer = await wb.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        "Cache-Control":       "no-store",
      },
    });
  }

  return NextResponse.json(
    { error: "Ungültiges Format. Erlaubt: csv, xlsx" },
    { status: 400 }
  );
}
