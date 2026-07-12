/**
 * GET /api/auction/lots/[lotId]/cbam-export
 *
 * ?format=html  → druckbares HTML (Standard, für Zolldokumentation)
 * ?format=xml   → maschinenlesbares XML (für EU-CBAM-Portal-Import)
 *
 * Auth: Bearer JWT oder ?token= (für window.open())
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const qToken     = req.nextUrl.searchParams.get("token");
  const rawToken   = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : qToken;

  if (!rawToken) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  let token;
  try { token = await verifyAccessToken(rawToken); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const { lotId } = await params;
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      id: true, commodity: true, quantity: true, unit: true,
      buyerId: true, phase: true, lockedAt: true,
      co2PerTonne: true, countryOfOrigin: true,
      productionSiteId: true, incoterms: true,
      hsCode: true, qualityGrade: true,
      cbamCategory: true, currentBest: true,
      deliveryLocation: true, vatTreatment: true,
      description: true,
      buyer: {
        select: {
          organization: {
            select: {
              name: true, taxId: true, country: true, city: true,
              street: true, postalCode: true, hrb: true, lei: true,
              contactName: true, contactPosition: true, legalForm: true,
            },
          },
        },
      },
    },
  });

  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  if (token.role === "BUYER" && lot.buyerId !== token.userId)
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });

  const format   = req.nextUrl.searchParams.get("format") ?? "html";
  const now      = new Date();
  const reportId = `EUCX-CBAM-${lot.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const qty      = parseFloat(lot.quantity.toString());
  const co2Unit  = lot.co2PerTonne ? parseFloat(lot.co2PerTonne.toString()) : null;
  const co2Total = co2Unit ? (qty * co2Unit) : null;
  const period   = now.toISOString().slice(0, 7);
  const org      = lot.buyer.organization;

  // ── XML ──────────────────────────────────────────────────────────
  if (format === "xml") {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- EUCX CBAM-Deklarationsbericht -- EU-Verordnung 2023/956 i.V.m. DVO (EU) 2023/1773 -->\n<CBAMDeclaration xmlns="urn:eucx:cbam:1.0" reportId="${reportId}" generatedAt="${now.toISOString()}" version="1.0">\n  <Declarant>\n    <EconomicOperator>\n      <Name>${x(org.name)}</Name>\n      <TaxId>${x(org.taxId ?? "")}</TaxId>\n      <Country>${x(org.country ?? "DE")}</Country>\n      <EUImporterRole>true</EUImporterRole>\n    </EconomicOperator>\n    <Platform>\n      <Name>EUCX -- European Union Commodity Exchange</Name>\n      <Website>eucx.eu</Website>\n      <LotId>${lot.id}</LotId>\n    </Platform>\n  </Declarant>\n  <Goods>\n    <GoodItem>\n      <Description>${x(lot.commodity)}</Description>\n      <Quantity unit="${lot.unit}">${qty.toFixed(4)}</Quantity>\n      <CountryOfOrigin>${x(lot.countryOfOrigin ?? "")}</CountryOfOrigin>\n      ${lot.productionSiteId ? `<ProductionSiteId>${x(lot.productionSiteId)}</ProductionSiteId>` : ""}\n      <IncotermsCode>${x(lot.incoterms ?? "DAP")}</IncotermsCode>\n    </GoodItem>\n  </Goods>\n  <EmbeddedEmissions>\n    ${co2Unit ? `<Co2PerUnit unit="kg_CO2eq_per_tonne">${co2Unit.toFixed(4)}</Co2PerUnit>\n    <Co2Total unit="kg_CO2eq">${co2Total!.toFixed(4)}</Co2Total>\n    <EmissionDataSource>SELLER_DECLARATION</EmissionDataSource>` : "<!-- Keine CO2-Daten -->"}\n  </EmbeddedEmissions>\n  <AuctionMeta>\n    <AuctionPhase>${lot.phase}</AuctionPhase>\n    ${lot.lockedAt ? `<ConcludedAt>${lot.lockedAt.toISOString()}</ConcludedAt>` : ""}\n  </AuctionMeta>\n  <LegalBasis>\n    <Regulation>EU 2023/956 (CBAM-Verordnung)</Regulation>\n    <ImplementingRegulation>EU 2023/1773 (Durchfuehrungsverordnung)</ImplementingRegulation>\n    <ReportingPeriod>${period}</ReportingPeriod>\n    <Declaration>Ich erklaere, dass alle Angaben in diesem Bericht nach bestem Wissen und Gewissen korrekt und vollstaendig sind.</Declaration>\n  </LegalBasis>\n</CBAMDeclaration>`;

    return new NextResponse(Buffer.from(xml, "utf8"), {
      status: 200,
      headers: {
        "Content-Type":        "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="EUCX-CBAM-${lot.id.slice(0, 8).toUpperCase()}.xml"`,
        "Cache-Control":       "no-store",
      },
    });
  }

  // ── HTML ─────────────────────────────────────────────────────────
  const fmtDate = (d: Date) => d.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
  });

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>CBAM-Zollerklärung ${reportId}</title>
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10pt; color: #1a1a1a; background: #fff; }

    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #154194; padding-bottom: 12px; margin-bottom: 20px; }
    .logo-block { display: flex; flex-direction: column; gap: 2px; }
    .logo-name { font-size: 15pt; font-weight: 700; letter-spacing: 0.06em; color: #154194; }
    .logo-sub { font-size: 7.5pt; color: #7a8aa0; letter-spacing: 0.04em; text-transform: uppercase; }
    .doc-meta { text-align: right; }
    .doc-meta .doc-title { font-size: 10pt; font-weight: 700; color: #154194; margin-bottom: 4px; }
    .doc-meta .doc-id { font-size: 7.5pt; color: #7a8aa0; font-family: monospace; }
    .doc-meta .doc-date { font-size: 8pt; color: #7a8aa0; margin-top: 2px; }

    .reg-banner { background: #eff4ff; border: 1px solid #c7d7f5; border-left: 4px solid #154194; padding: 8px 12px; margin-bottom: 20px; font-size: 8pt; color: #154194; }
    .reg-banner strong { font-weight: 700; }

    h2 { font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #154194; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin: 18px 0 10px; }

    table.info { width: 100%; border-collapse: collapse; }
    table.info td { padding: 5px 8px; font-size: 9.5pt; vertical-align: top; }
    table.info td:first-child { width: 42%; color: #7a8aa0; font-weight: 600; white-space: nowrap; }
    table.info td:last-child { color: #1a1a1a; font-weight: 500; }
    table.info tr:nth-child(even) td { background: #f9fafb; }

    .highlight { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; margin-top: 16px; }
    .highlight .hl-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #16a34a; margin-bottom: 6px; }
    .highlight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 6px; }
    .hl-item { text-align: center; }
    .hl-num { font-size: 14pt; font-weight: 700; color: #15803d; font-family: monospace; }
    .hl-unit { font-size: 7.5pt; color: #6b7280; margin-top: 2px; }

    .no-co2 { background: #fffbeb; border: 1px solid #fcd34d; padding: 8px 12px; font-size: 8.5pt; color: #92400e; margin-top: 10px; }

    .declaration-box { border: 1.5px solid #154194; padding: 12px 14px; margin-top: 20px; font-size: 8.5pt; color: #1a1a1a; line-height: 1.6; }
    .declaration-box .decl-title { font-weight: 700; color: #154194; margin-bottom: 6px; }

    .signature-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 28px; }
    .sig-block { border-top: 1px solid #9ca3af; padding-top: 6px; }
    .sig-label { font-size: 7.5pt; color: #9ca3af; }

    .footer { margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; font-size: 7pt; color: #9ca3af; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }

    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #154194; color: #fff; border: none; padding: 12px 22px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(21,65,148,.3); }
    .print-btn:hover { background: #0f3070; }
  </style>
</head>
<body>

  <button class="print-btn no-print" onclick="window.print()">Drucken / Als PDF speichern</button>

  <div class="header">
    <div class="logo-block">
      <div class="logo-name">EUCX</div>
      <div class="logo-sub">European Union Commodity Exchange</div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">CBAM-Zollerklärung</div>
      <div class="doc-id">${reportId}</div>
      <div class="doc-date">Erstellt: ${fmtDate(now)}</div>
    </div>
  </div>

  <div class="reg-banner">
    <strong>Rechtsgrundlage:</strong> EU-Verordnung 2023/956 (CBAM) i.V.m. Durchführungsverordnung (EU) 2023/1773 ·
    Berichtszeitraum: ${period} · Meldepflicht ab 01.01.2026
  </div>

  <h2>1. Anmelder / Importeur</h2>
  <table class="info">
    <tr><td>Unternehmensname</td><td><strong>${h(org.name)}</strong>${org.legalForm ? ` (${h(org.legalForm)})` : ""}</td></tr>
    <tr><td>Anschrift</td><td>${[org.street, org.postalCode && org.city ? `${org.postalCode} ${org.city}` : (org.city ?? ""), org.country].filter(Boolean).map(s => h(s!)).join(", ") || "—"}</td></tr>
    <tr><td>USt-IdNr.</td><td>${h(org.taxId ?? "—")}</td></tr>
    ${org.hrb ? `<tr><td>Handelsregisternummer</td><td>${h(org.hrb)}</td></tr>` : ""}
    ${org.lei ? `<tr><td>LEI (Legal Entity Identifier)</td><td><span style="font-family:monospace">${h(org.lei)}</span></td></tr>` : ""}
    ${org.contactName ? `<tr><td>Ansprechpartner / Unterzeichner</td><td>${h(org.contactName)}${org.contactPosition ? ` · ${h(org.contactPosition)}` : ""}</td></tr>` : ""}
    <tr><td>Rolle</td><td>EU-Importeur</td></tr>
    <tr><td>Handelsplattform</td><td>EUCX — eucx.eu</td></tr>
    <tr><td>Los-ID</td><td><span style="font-family:monospace;font-size:8.5pt">${lot.id}</span></td></tr>
  </table>

  <h2>2. Ware / Handelsgut</h2>
  <table class="info">
    <tr><td>Warenbezeichnung</td><td><strong>${h(lot.commodity)}</strong></td></tr>
    ${lot.qualityGrade ? `<tr><td>Güte / Qualitätsnorm</td><td>${h(lot.qualityGrade)}</td></tr>` : ""}
    ${lot.hsCode ? `<tr><td>Zolltarifnummer (HS-Code)</td><td>${h(lot.hsCode)}</td></tr>` : ""}
    ${lot.cbamCategory ? `<tr><td>CBAM-Warengruppe (Anhang I EU 2023/956)</td><td>${h(lot.cbamCategory)}</td></tr>` : ""}
    <tr><td>Menge</td><td>${qty.toLocaleString("de-DE", { minimumFractionDigits: 2 })} ${lot.unit}</td></tr>
    <tr><td>Herkunftsland</td><td>${h(lot.countryOfOrigin ?? "—")}</td></tr>
    ${lot.productionSiteId ? `<tr><td>Produktionsstätte (CBAM-Registry-ID)</td><td>${h(lot.productionSiteId)}</td></tr>` : ""}
    <tr><td>Lieferbedingung (INCOTERMS® 2020)</td><td>${h(lot.incoterms ?? "DAP")}</td></tr>
    ${lot.deliveryLocation ? `<tr><td>Lieferort</td><td>${h(lot.deliveryLocation)}</td></tr>` : ""}
    ${lot.vatTreatment ? `<tr><td>USt.-Behandlung</td><td>${h(lot.vatTreatment)}</td></tr>` : ""}
    ${lot.currentBest ? `<tr><td>Transaktionswert (Zuschlagspreis)</td><td><strong>${parseFloat(lot.currentBest.toString()).toLocaleString("de-DE", { style: "currency", currency: "EUR" })} / ${lot.unit}</strong></td></tr>` : ""}
    <tr><td>Abschluss der Auktion</td><td>${lot.lockedAt ? fmtDate(lot.lockedAt) : "—"}</td></tr>
  </table>

  <h2>3. Eingebettete Emissionen (CO₂-Äquivalente)</h2>
  ${co2Unit && co2Total ? `
  <div class="highlight">
    <div class="hl-label">CO₂-Bilanz dieses Lots</div>
    <div class="highlight-grid">
      <div class="hl-item">
        <div class="hl-num">${co2Unit.toLocaleString("de-DE", { maximumFractionDigits: 1 })}</div>
        <div class="hl-unit">kg CO₂-Äq./t<br/>Emissionsfaktor</div>
      </div>
      <div class="hl-item">
        <div class="hl-num">${(co2Total / 1000).toLocaleString("de-DE", { maximumFractionDigits: 2 })}</div>
        <div class="hl-unit">t CO₂-Äq.<br/>Gesamt (${qty.toLocaleString("de-DE")} ${lot.unit})</div>
      </div>
      <div class="hl-item">
        <div class="hl-num">~${((co2Total / 1000) * 75).toLocaleString("de-DE", { maximumFractionDigits: 0 })} €</div>
        <div class="hl-unit">CBAM-Zertifikatkosten<br/>(Basis EU-ETS 75 €/t)</div>
      </div>
    </div>
  </div>
  <table class="info" style="margin-top:10px">
    <tr><td>Emissionsfaktor</td><td>${co2Unit.toFixed(4)} kg CO₂-Äq./t</td></tr>
    <tr><td>Gesamtemissionen</td><td>${co2Total.toFixed(2)} kg CO₂-Äq. (= ${(co2Total / 1000).toFixed(4)} t CO₂-Äq.)</td></tr>
    <tr><td>Datenquelle</td><td>Verkäuferdeklaration (SELLER_DECLARATION)</td></tr>
    <tr><td>Messmethode</td><td>Gemäß Anhang III EU-DVO 2023/1773</td></tr>
  </table>
  ` : `
  <div class="no-co2">
    Keine CO₂-Daten für dieses Lot hinterlegt. Gemäß Art. 7 Abs. 2 EU-VO 2023/956 ist der
    EU-Standardreferenzwert (Transitwert-Datenbank) anzuwenden. Bitte ergänzen Sie den Emissionsfaktor
    in der EUCX-Plattform oder wenden Sie sich an den Verkäufer.
  </div>
  `}

  <h2>4. Rechtliche Erklärung</h2>
  <div class="declaration-box">
    <div class="decl-title">Wahrheits- und Vollständigkeitserklärung gemäß Art. 3 EU-DVO 2023/1773</div>
    Ich erkläre hiermit, dass alle in diesem Bericht enthaltenen Angaben nach bestem Wissen und Gewissen
    korrekt und vollständig sind. Mir ist bekannt, dass unrichtige Angaben im CBAM-Verfahren zu
    Sanktionen gemäß Art. 26 EU-VO 2023/956 führen können.
    <br/><br/>
    Dieser Bericht wurde automatisch durch die EUCX-Handelsplattform (eucx.eu) auf Grundlage der
    im Auktionsverfahren übermittelten Daten erstellt. Er ersetzt nicht die Meldepflicht gegenüber
    dem nationalen CBAM-Beauftragten (Deutschland: Zollverwaltung / DEHST) und dem EU-CBAM-Register.
  </div>

  <div class="signature-row">
    <div class="sig-block">
      <div class="sig-label">Ort, Datum</div>
      <div style="font-size:8.5pt;margin-top:4px;color:#374151">${org.city ? h(org.city) + ", " : ""}________________</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Unterschrift, Stempel</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Name in Druckbuchstaben</div>
      ${org.contactName ? `<div style="font-size:8.5pt;margin-top:4px;color:#374151">${h(org.contactName)}${org.contactPosition ? `<br/><span style="color:#9ca3af">${h(org.contactPosition)}</span>` : ""}</div>` : ""}
    </div>
  </div>

  <div class="footer">
    <span>EUCX — European Union Commodity Exchange · eucx.eu · BaFin-regulierte Handelsplattform · MiFID II OTF</span>
    <span>Bericht-ID: ${reportId}</span>
  </div>

</body>
</html>`;

  return new NextResponse(Buffer.from(html, "utf8"), {
    status: 200,
    headers: {
      "Content-Type":        "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="EUCX-CBAM-${lot.id.slice(0, 8).toUpperCase()}.html"`,
      "Cache-Control":       "no-store",
    },
  });
}

function x(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function h(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
