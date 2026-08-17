/**
 * GET /api/seller/cbam-export?year=2026
 * CSV-Export aller CBAM-relevanten Lots des eingeloggten Verkäufers für ein Referenzjahr.
 * Dient als Datenhilfe zur Vorbereitung der CBAM-Jahreserklärung.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const rawToken   = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!rawToken) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  let token;
  try { token = await verifyAccessToken(rawToken); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const year    = parseInt(req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));
  const from    = new Date(`${year}-01-01T00:00:00.000Z`);
  const to      = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  // Alle abgeschlossenen Lots des Verkäufers im Referenzjahr
  const lots = await db.lot.findMany({
    where: {
      registrations: { some: { sellerId: token.userId } },
      winnerId: { not: null },
      lockedAt: { gte: from, lt: to },
    },
    select: {
      id:                  true,
      commodity:           true,
      quantity:            true,
      unit:                true,
      currentBest:         true,
      lockedAt:            true,
      cbamCategory:        true,
      co2PerTonne:         true,
      co2DirectPerTonne:   true,
      co2IndirectPerTonne: true,
      countryOfOrigin:     true,
      countryOfExport:     true,
      productionSiteId:    true,
      incoterms:           true,
      hsCode:              true,
      carbonPricePaid:     true,
      lotContract: {
        select: {
          contractNumber: true,
          totalValue:     true,
          buyer: {
            select: {
              organization: {
                select: { name: true, taxId: true, country: true, eoriNumber: true }
              }
            }
          }
        }
      }
    },
    orderBy: { lockedAt: "asc" },
  });

  const fmtNum = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    return parseFloat(String(v)).toLocaleString("de-DE", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const fmtDate = (d: Date | null): string =>
    d ? d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const headers = [
    "Vertrags-Nr.",
    "Auktionsdatum",
    "Warenbezeichnung",
    "Menge",
    "Einheit",
    "Transaktionswert (EUR)",
    "CBAM-Warengruppe",
    "CN-Code (HS)",
    "Herkunftsland",
    "Ausfuhrland",
    "Produktionsstatte-ID",
    "Incoterms",
    "CO2 gesamt (kg/t)",
    "CO2 direkt (kg/t)",
    "CO2 indirekt (kg/t)",
    "CO2 gesamt (t)",
    "Kohlenstoffpreis gezahlt (EUR/t)",
    "Kaeufer-Organisation",
    "Kaeufer-USt-IdNr.",
    "Kaeufer-Land",
    "Kaeufer-EORI",
  ];

  const rows = lots.map((l) => {
    const qty        = parseFloat(String(l.quantity));
    const co2Direct  = l.co2DirectPerTonne  ? parseFloat(String(l.co2DirectPerTonne))  : null;
    const co2Indir   = l.co2IndirectPerTonne ? parseFloat(String(l.co2IndirectPerTonne)) : null;
    const co2Unit    = co2Direct !== null
      ? (co2Indir !== null ? co2Direct + co2Indir : co2Direct)
      : (l.co2PerTonne ? parseFloat(String(l.co2PerTonne)) : null);
    const co2Total   = co2Unit !== null ? qty * co2Unit : null;
    const contract   = l.lotContract;
    const org        = contract?.buyer?.organization;

    return [
      contract?.contractNumber ?? l.id,
      fmtDate(l.lockedAt),
      l.commodity,
      String(qty),
      l.unit,
      contract?.totalValue ? parseFloat(String(contract.totalValue)).toLocaleString("de-DE", { minimumFractionDigits: 2 }) : "",
      l.cbamCategory ?? "",
      l.hsCode ?? "",
      l.countryOfOrigin ?? "",
      l.countryOfExport ?? "",
      l.productionSiteId ?? "",
      l.incoterms ?? "",
      fmtNum(co2Unit),
      fmtNum(co2Direct),
      fmtNum(co2Indir),
      co2Total !== null ? fmtNum(co2Total / 1000) : "",
      l.carbonPricePaid ? fmtNum(l.carbonPricePaid) : "",
      org?.name ?? "",
      org?.taxId ?? "",
      org?.country ?? "",
      org?.eoriNumber ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";");
  });

  const bom = "﻿"; // UTF-8 BOM für Excel-Kompatibilität
  const csv = bom + [headers.map((h) => `"${h}"`).join(";"), ...rows].join("\r\n");

  return new NextResponse(Buffer.from(csv, "utf8"), {
    status: 200,
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="EUCX-CBAM-${year}.csv"`,
      "Cache-Control":       "no-store",
    },
  });
}
