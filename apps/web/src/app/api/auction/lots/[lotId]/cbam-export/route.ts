/**
 * GET /api/auction/lots/[lotId]/cbam-export
 *
 * Generiert einen CBAM-XML-Bericht für ein Lot gemäß EU DVO 2023/1773.
 * Format: CN-CBAM XML (vereinfacht, für EU-Zollmeldung geeignet).
 *
 * Auth: Bearer JWT (BUYER, BROKER, ADMIN, SUPER_ADMIN — nur eigene Lots für BUYER)
 * Response: application/xml mit Dateidownload
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { lotId: string } },
) {
  // ── Auth ──────────────────────────────────────────────────────────
  // Bearer-Token oder Query-Parameter (für window.open() aus Frontend)
  const authHeader = req.headers.get("authorization");
  const qToken     = req.nextUrl.searchParams.get("token");
  const rawToken   = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : qToken;

  if (!rawToken) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(rawToken); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // ── Lot laden ─────────────────────────────────────────────────────
  const lot = await db.lot.findUnique({
    where:  { id: params.lotId },
    select: {
      id:               true,
      commodity:        true,
      quantity:         true,
      unit:             true,
      buyerId:          true,
      phase:            true,
      lockedAt:         true,
      co2PerTonne:      true,
      countryOfOrigin:  true,
      productionSiteId: true,
      incoterms:        true,
      buyer: {
        select: {
          id: true,
          organization: { select: { name: true, taxId: true, country: true } },
        },
      },
    },
  });

  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }

  // Zugriffscheck: Käufer darf nur eigene Lots exportieren
  if (token.role === "BUYER" && lot.buyerId !== token.userId) {
    return NextResponse.json({ error: "Kein Zugriff auf dieses Lot" }, { status: 403 });
  }

  // ── XML generieren ────────────────────────────────────────────────
  const now      = new Date().toISOString();
  const reportId = `EUCX-CBAM-${lot.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const qty      = parseFloat(lot.quantity.toString());

  const co2Total = lot.co2PerTonne
    ? (qty * parseFloat(lot.co2PerTonne.toString())).toFixed(4)
    : null;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- EUCX CBAM-Deklarationsbericht — EU-Verordnung 2023/956 i.V.m. DVO (EU) 2023/1773 -->
<CBAMDeclaration xmlns="urn:eucx:cbam:1.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 reportId="${reportId}"
                 generatedAt="${now}"
                 version="1.0">

  <Declarant>
    <EconomicOperator>
      <Name>${escapeXml(lot.buyer.organization.name)}</Name>
      <TaxId>${escapeXml(lot.buyer.organization.taxId ?? "")}</TaxId>
      <Country>${escapeXml(lot.buyer.organization.country ?? "DE")}</Country>
      <EUImporterRole>true</EUImporterRole>
    </EconomicOperator>
    <Platform>
      <Name>EUCX — European Union Commodity Exchange</Name>
      <Website>eucx.eu</Website>
      <LotId>${lot.id}</LotId>
    </Platform>
  </Declarant>

  <Goods>
    <GoodItem>
      <Description>${escapeXml(lot.commodity)}</Description>
      <Quantity unit="${lot.unit}">${qty.toFixed(4)}</Quantity>
      <CountryOfOrigin>${escapeXml(lot.countryOfOrigin ?? "")}</CountryOfOrigin>
      ${lot.productionSiteId ? `<ProductionSiteId>${escapeXml(lot.productionSiteId)}</ProductionSiteId>` : "<!-- ProductionSiteId: nicht angegeben -->"}
      <IncotermsCode>${escapeXml(lot.incoterms ?? "DAP")}</IncotermsCode>
    </GoodItem>
  </Goods>

  <EmbeddedEmissions>
    ${lot.co2PerTonne
      ? `<Co2PerUnit unit="kg_CO2eq_per_tonne">${parseFloat(lot.co2PerTonne.toString()).toFixed(4)}</Co2PerUnit>
    <Co2Total unit="kg_CO2eq">${co2Total}</Co2Total>
    <EmissionDataSource>SELLER_DECLARATION</EmissionDataSource>`
      : "<!-- Keine CO₂-Daten vorhanden — Standardwert gemäß EU-Transitwert-Datenbank erforderlich -->"}
  </EmbeddedEmissions>

  <AuctionMeta>
    <AuctionPhase>${lot.phase}</AuctionPhase>
    ${lot.lockedAt ? `<ConcludedAt>${lot.lockedAt.toISOString()}</ConcludedAt>` : ""}
  </AuctionMeta>

  <LegalBasis>
    <Regulation>EU 2023/956 (CBAM-Verordnung)</Regulation>
    <ImplementingRegulation>EU 2023/1773 (Durchführungsverordnung)</ImplementingRegulation>
    <ReportingPeriod>${now.slice(0, 7)}</ReportingPeriod>
    <Declaration>Ich erkläre, dass alle Angaben in diesem Bericht nach bestem Wissen und Gewissen korrekt und vollständig sind.</Declaration>
  </LegalBasis>

</CBAMDeclaration>`;

  const filename = `EUCX-CBAM-${lot.id.slice(0, 8).toUpperCase()}.xml`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type":        "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-store",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}
