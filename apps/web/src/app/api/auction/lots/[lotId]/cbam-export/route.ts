/**
 * GET /api/auction/lots/[lotId]/cbam-export
 * Standard → PDF | ?format=xml → maschinenlesbares XML
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { PDFDocument, rgb, StandardFonts, type PDFFont } from "pdf-lib";

export const dynamic = "force-dynamic";

const W = 595.28;
const H = 841.89;
const ML = 52;
const MR = 52;
const CW = W - ML - MR;

const C = {
  blue:     rgb(21/255,  65/255, 148/255),
  blueLt:   rgb(234/255, 241/255, 255/255),
  black:    rgb(26/255,  26/255,  26/255),
  muted:    rgb(118/255, 134/255, 156/255),
  gray:     rgb(198/255, 206/255, 215/255),
  bgRow:    rgb(249/255, 250/255, 251/255),
  green:    rgb(21/255,  128/255,  61/255),
  greenBg:  rgb(240/255, 253/255, 244/255),
  greenBdr: rgb(187/255, 247/255, 208/255),
  red:      rgb(185/255,  28/255,  28/255),
  amber:    rgb(161/255,  84/255,   0/255),
  amberBg:  rgb(255/255, 251/255, 235/255),
};

function wrapText(text: string, maxW: number, font: PDFFont, size: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    font.widthOfTextAtSize(test, size) <= maxW ? (cur = test) : (out.push(cur), cur = w);
  }
  if (cur) out.push(cur);
  return out;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
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
      buyerId: true, winnerId: true, phase: true, lockedAt: true,
      co2PerTonne: true, co2DirectPerTonne: true, co2IndirectPerTonne: true,
      countryOfOrigin: true, countryOfExport: true,
      productionSiteId: true, incoterms: true,
      hsCode: true, qualityGrade: true,
      cbamCategory: true, currentBest: true, carbonPricePaid: true,
      deliveryLocation: true, vatTreatment: true, description: true,
      buyer: {
        select: {
          organization: {
            select: {
              name: true, taxId: true, country: true, city: true,
              street: true, postalCode: true, hrb: true, lei: true,
              contactName: true, contactPosition: true, legalForm: true,
              eoriNumber: true, cbamAccountNumber: true,
            },
          },
        },
      },
    },
  });
  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  if (token.role === "BUYER" && lot.buyerId !== token.userId)
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });

  const winnerBid = lot.winnerId ? await db.bid.findFirst({
    where:  { lotId, isWinner: true },
    select: {
      cbamCountryOfOrigin: true, cbamCountryOfExport: true, cbamProductionSiteId: true,
      cbamCo2DirectPerTonne: true, cbamCo2IndirectPerTonne: true,
      cbamCarbonPricePaid: true, cbamVerificationRef: true,
    },
  }) : null;

  const now      = new Date();
  const reportId = `EUCX-CBAM-${lot.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const qty      = parseFloat(lot.quantity.toString());
  const org      = lot.buyer.organization;

  const qtr      = Math.ceil((now.getMonth() + 1) / 3);
  const qtrLabel = `${qtr}. Quartal ${now.getFullYear()}`;
  const todayFmt = now.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin",
  });

  const originCountry      = winnerBid?.cbamCountryOfOrigin    ?? lot.countryOfOrigin  ?? null;
  const exportCountry      = winnerBid?.cbamCountryOfExport    ?? lot.countryOfExport  ?? null;
  const productionSite     = winnerBid?.cbamProductionSiteId   ?? lot.productionSiteId ?? null;
  const carbonPricePaid    = winnerBid?.cbamCarbonPricePaid    ?? lot.carbonPricePaid  ?? null;
  const verificationRef    = winnerBid?.cbamVerificationRef    ?? null;
  const co2Direct          = winnerBid?.cbamCo2DirectPerTonne
    ? parseFloat(winnerBid.cbamCo2DirectPerTonne.toString())
    : (lot.co2DirectPerTonne ? parseFloat(lot.co2DirectPerTonne.toString()) : null);
  const co2Indirect        = winnerBid?.cbamCo2IndirectPerTonne
    ? parseFloat(winnerBid.cbamCo2IndirectPerTonne.toString())
    : (lot.co2IndirectPerTonne ? parseFloat(lot.co2IndirectPerTonne.toString()) : null);
  const co2Unit            = co2Direct !== null
    ? (co2Indirect !== null ? co2Direct + co2Indirect : co2Direct)
    : (lot.co2PerTonne ? parseFloat(lot.co2PerTonne.toString()) : null);
  const co2Total           = co2Unit !== null ? qty * co2Unit : null;
  const carbonPricePaidNum = carbonPricePaid ? parseFloat(carbonPricePaid.toString()) : null;

  const fmtDate = (d: Date) => d.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
  });
  const fmtNum = (n: number, dec = 2) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // ── XML ──────────────────────────────────────────────────────────
  if (req.nextUrl.searchParams.get("format") === "xml") {
    const x = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMDeclaration xmlns="urn:eucx:cbam:1.0" reportId="${reportId}" generatedAt="${now.toISOString()}" version="1.1">
  <Declarant>
    <Name>${x(org.name)}</Name>
    <TaxId>${x(org.taxId ?? "")}</TaxId>
    <Country>${x(org.country ?? "DE")}</Country>
    ${org.eoriNumber ? `<EORINumber>${x(org.eoriNumber)}</EORINumber>` : ""}
    ${org.cbamAccountNumber ? `<CBAMAccountNumber>${x(org.cbamAccountNumber)}</CBAMAccountNumber>` : ""}
  </Declarant>
  <Goods>
    <Description>${x(lot.commodity)}</Description>
    <Quantity unit="${lot.unit}">${qty.toFixed(4)}</Quantity>
    <CountryOfOrigin>${x(originCountry ?? "")}</CountryOfOrigin>
    ${exportCountry ? `<CountryOfExport>${x(exportCountry)}</CountryOfExport>` : ""}
    ${productionSite ? `<ProductionSiteId>${x(productionSite)}</ProductionSiteId>` : ""}
    ${lot.hsCode ? `<CNCode>${x(lot.hsCode)}</CNCode>` : ""}
    <IncotermsCode>${x(lot.incoterms ?? "DAP")}</IncotermsCode>
  </Goods>
  <EmbeddedEmissions>
    ${co2Unit !== null ? `
    <Co2PerUnit unit="kg_CO2eq_per_tonne">${co2Unit.toFixed(4)}</Co2PerUnit>
    ${co2Direct !== null ? `<Co2Direct>${co2Direct.toFixed(4)}</Co2Direct>` : ""}
    ${co2Indirect !== null ? `<Co2Indirect>${co2Indirect.toFixed(4)}</Co2Indirect>` : ""}
    <Co2Total unit="kg_CO2eq">${co2Total!.toFixed(4)}</Co2Total>
    <EmissionDataSource>${winnerBid ? "SELLER_VERIFIED" : "BUYER_ESTIMATE"}</EmissionDataSource>
    ${verificationRef ? `<VerificationRef>${x(verificationRef)}</VerificationRef>` : ""}
    ${carbonPricePaidNum !== null ? `<CarbonPricePaid unit="EUR_per_tonne">${carbonPricePaidNum.toFixed(4)}</CarbonPricePaid>` : ""}
    ` : "<!-- Keine CO2-Daten -->"}
  </EmbeddedEmissions>
  <ReportingPeriod quarter="${qtr}" year="${now.getFullYear()}" />`+`
</CBAMDeclaration>`;
    return new NextResponse(Buffer.from(xml, "utf8"), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="EUCX-CBAM-${lot.id.slice(0,8).toUpperCase()}.xml"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // ── PDF ───────────────────────────────────────────────────────────
  const doc  = await PDFDocument.create();
  const reg  = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Layout-Konstanten
  const FOOT_Y = 64;   // Footer-Reservierung am Seitenende (2 Zeilen)
  const ROW_H  = 17;
  const KEY_W  = 162;
  const GAP    = 16;
  const INNER  = CW - 20; // nutzbare Breite innerhalb von Boxen

  let pg      = doc.addPage([W, H]);
  let y       = H - 46;
  let pageNum = 1;

  // Zeichenfunktionen als Closures über pg
  const dt = (text: string, x: number, yp: number, f: PDFFont, s: number, c = C.black) =>
    pg.drawText(text, { x, y: yp, size: s, font: f, color: c });
  const dr = (x: number, yp: number, w: number, h: number, c: ReturnType<typeof rgb>, op = 1) =>
    pg.drawRectangle({ x, y: yp, width: w, height: h, color: c, opacity: op });
  const dl = (x1: number, y1: number, x2: number, y2: number, c = C.gray, th = 0.5) =>
    pg.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: th, color: c });

  // Zweizeiliger Footer: Zeile 1 = Bericht-ID + Seite, Zeile 2 = EUCX-Brand
  const drawFooter = () => {
    dl(ML, FOOT_Y + 14, W - MR, FOOT_Y + 14);
    const rid = `Bericht-ID: ${reportId}`;
    dt(rid, ML, FOOT_Y + 3, reg, 6.5, C.muted);
    const pn = `Seite ${pageNum}`;
    dt(pn, W - MR - reg.widthOfTextAtSize(pn, 6.5), FOOT_Y + 3, reg, 6.5, C.muted);
    // Zeile 2 (6pt damit die lange Zeile passt)
    dt("EUCX — European Union Commodity Exchange · eucx.eu · BaFin-regulierte Handelsplattform · MiFID II OTF",
      ML, FOOT_Y - 9, reg, 6, C.muted);
  };

  const newPage = () => {
    drawFooter();
    pg = doc.addPage([W, H]);
    pageNum++;
    y = H - 44;
  };

  const ensure = (space: number) => {
    if (y - space < FOOT_Y + 16) newPage();
  };

  const sHdr = (label: string) => {
    ensure(90);
    dl(ML, y, W - MR, y, C.blue, 0.75);
    dr(ML, y - 20, CW, 20, C.blueLt);
    dt(label, ML + 7, y - 14, bold, 8, C.blue);
    y -= 28;
  };

  const rowFn = (key: string, value: string, even: boolean, vc = C.black) => {
    ensure(ROW_H + 14);
    if (even) dr(ML, y - ROW_H + 2, CW, ROW_H, C.bgRow);
    dt(key, ML + 7, y - 11, reg, 8, C.muted);
    const ws = wrapText(value, CW - KEY_W - 14, bold, 8.5);
    ws.forEach((ln, i) => dt(ln, ML + KEY_W, y - 11 - i * 11, bold, 8.5, vc));
    y -= ROW_H + (ws.length - 1) * 11;
  };

  // ── Header ───────────────────────────────────────────────────────
  dt("EUCX", ML, y, bold, 20, C.blue);
  const titleStr = "CBAM-Zollerklarung";
  dt(titleStr, W - MR - bold.widthOfTextAtSize(titleStr, 13), y, bold, 13, C.blue);
  y -= 17;
  dt("EUROPEAN UNION COMMODITY EXCHANGE", ML, y, reg, 7, C.muted);
  dt(reportId, W - MR - reg.widthOfTextAtSize(reportId, 7.5), y, reg, 7.5, C.muted);
  y -= 11;
  const createdStr = `Erstellt: ${fmtDate(now)}`;
  dt(createdStr, W - MR - reg.widthOfTextAtSize(createdStr, 7.5), y, reg, 7.5, C.muted);
  y -= 9;
  dr(ML, y - 2, CW, 2.5, C.blue);
  y -= 16;

  // ── Rechtsgrundlagen-Banner (3 Zeilen, alle innerhalb der Box) ────
  // Zeile 1 = Label + Verordnung; Zeile 2 = Quartal + Pflicht; Zeile 3 = Hinweis
  const b1reg  = "EU-Verordnung 2023/956 (CBAM) i.V.m. DVO (EU) 2023/1773";
  const b2      = `Berichtszeitraum: ${qtrLabel}  ·  Meldepflicht ab 01.01.2026`;
  const b3      = "Automatische Systemgenerierung — ersetzt nicht die Meldepflicht im EU-CBAM-Register.";
  const bannerH = 56;
  dr(ML, y - bannerH, CW, bannerH, C.blueLt);
  pg.drawRectangle({ x: ML, y: y - bannerH, width: 3.5, height: bannerH, color: C.blue });
  dt("Rechtsgrundlage:", ML + 9, y - 12, bold, 7.5, C.blue);
  dt(b1reg, ML + 9 + bold.widthOfTextAtSize("Rechtsgrundlage: ", 7.5), y - 12, reg, 7.5, C.blue);
  dt(b2, ML + 9, y - 25, reg, 7.5, C.blue);
  dt(b3, ML + 9, y - 38, reg, 6.5, C.muted);
  y -= bannerH + 18;

  // ── 1. Anmelder / Importeur ───────────────────────────────────────
  sHdr("1. ANMELDER / IMPORTEUR");
  const anmelderRows: [string, string, ReturnType<typeof rgb>?][] = [
    ["Unternehmensname",   `${org.name}${org.legalForm ? ` (${org.legalForm})` : ""}`],
    ["Anschrift",          [org.street, org.postalCode && org.city ? `${org.postalCode} ${org.city}` : org.city, org.country].filter(Boolean).join(", ") || "—"],
    ["USt-IdNr.",          org.taxId ?? "—"],
    ["EORI-Nummer",        org.eoriNumber ?? "— Nicht hinterlegt (Pflicht ab 2026)", org.eoriNumber ? undefined : C.red],
    ["CBAM-Kontonummer",   org.cbamAccountNumber ?? "— Nicht hinterlegt", org.cbamAccountNumber ? undefined : C.amber],
    ...(org.hrb         ? [["Handelsregisternr.", org.hrb]                                                                        as [string, string]] : []),
    ...(org.lei         ? [["LEI",                org.lei]                                                                        as [string, string]] : []),
    ...(org.contactName ? [["Ansprechpartner",    `${org.contactName}${org.contactPosition ? ` · ${org.contactPosition}` : ""}`] as [string, string]] : []),
    ["Rolle",              "EU-Importeur (CBAM-Anmelder)"],
    ["Handelsplattform",   "EUCX — eucx.eu (MiFID II OTF)"],
    ["Los-ID",             lot.id],
  ];
  anmelderRows.forEach(([k, v, vc], i) => rowFn(k, v, i % 2 === 0, vc));
  y -= GAP;

  // ── 2. Ware / Handelsgut ─────────────────────────────────────────
  sHdr("2. WARE / HANDELSGUT");
  const wareRows: [string, string, ReturnType<typeof rgb>?][] = [
    ["Warenbezeichnung",           lot.commodity],
    ...(lot.qualityGrade           ? [["Gute / Qualitatsnorm",        lot.qualityGrade]     as [string, string]] : []),
    ...(lot.hsCode                 ? [["CN-Code (8-stellig)",          lot.hsCode]          as [string, string]] : []),
    ...(lot.cbamCategory           ? [["CBAM-Warengruppe (Anhang I)",  lot.cbamCategory]    as [string, string]] : []),
    ["Menge",                        `${fmtNum(qty)} ${lot.unit}`],
    ["Herstellungsland",             originCountry ?? "— Fehlt", originCountry ? undefined : C.red],
    ...(exportCountry && exportCountry !== originCountry ? [["Ausfuhrland", exportCountry] as [string, string]] : []),
    ...(productionSite             ? [["Produktionsstatte (CBAM-ID)", productionSite]       as [string, string]] : []),
    ["Lieferbedingung",              lot.incoterms ?? "DAP"],
    ...(lot.deliveryLocation       ? [["Lieferort",                    lot.deliveryLocation] as [string, string]] : []),
    ...(lot.vatTreatment           ? [["USt.-Behandlung",              lot.vatTreatment]    as [string, string]] : []),
    ...(lot.currentBest            ? [["Transaktionswert",             `${fmtNum(parseFloat(lot.currentBest.toString()))} EUR / ${lot.unit}`] as [string, string]] : []),
    ["Abschluss der Auktion",        lot.lockedAt ? fmtDate(lot.lockedAt) : "—"],
    ["Emissionsdatenquelle",         winnerBid ? "Verkaeuferdeklaration (verifizierte Lieferantendaten)" : "Kauferschatzung"],
    ...(verificationRef            ? [["Prufbescheinigung",            verificationRef]      as [string, string]] : []),
  ];
  wareRows.forEach(([k, v, vc], i) => rowFn(k, v, i % 2 === 0, vc));
  y -= GAP;

  // ── 3. Eingebettete Emissionen ────────────────────────────────────
  sHdr("3. EINGEBETTETE EMISSIONEN (CO2-AQUIVALENTE)");

  if (co2Unit !== null && co2Total !== null) {
    const certCount = Math.ceil(co2Total / 1000);
    const certCost  = certCount * 75;

    ensure(82);
    const boxH = 70;
    dr(ML, y - boxH, CW, boxH, C.greenBg);
    pg.drawRectangle({ x: ML, y: y - boxH, width: CW, height: boxH, borderColor: C.greenBdr, borderWidth: 0.75 });
    dt("CO2-BILANZ DIESES LOTS", ML + 9, y - 11, bold, 7, C.green);
    const colW = CW / 3;
    dl(ML + colW,     y - 17, ML + colW,     y - boxH + 7, C.greenBdr, 0.75);
    dl(ML + 2 * colW, y - 17, ML + 2 * colW, y - boxH + 7, C.greenBdr, 0.75);
    const kpiCols: [string, string, string][] = [
      [fmtNum(co2Unit, 1),         "kg CO2-Aq./t",     "Gesamtemissionsfaktor"],
      [fmtNum(co2Total / 1000, 2), "t CO2-Aq.",        `Gesamt (${fmtNum(qty, 0)} ${lot.unit})`],
      [`${certCount}`,              "CBAM-Zertifikate", `ca. ${fmtNum(certCost, 0)} EUR (a 75 EUR/t)`],
    ];
    kpiCols.forEach(([num, sub1, sub2], i) => {
      const cx = ML + i * colW + colW / 2;
      dt(num,  cx - bold.widthOfTextAtSize(num, 19) / 2,  y - 34, bold, 19, C.green);
      dt(sub1, cx - reg.widthOfTextAtSize(sub1, 7)   / 2, y - 48, reg,   7, C.muted);
      dt(sub2, cx - reg.widthOfTextAtSize(sub2, 6.5) / 2, y - 57, reg, 6.5, C.muted);
    });
    y -= boxH + 10;

    const co2Rows: [string, string][] = [
      ...(co2Direct   !== null ? [["Direkte Emissionen",       `${fmtNum(co2Direct, 4)} kg CO2-Aq./t`]   as [string, string]] : []),
      ...(co2Indirect !== null ? [["Indirekte Emissionen",     `${fmtNum(co2Indirect, 4)} kg CO2-Aq./t`] as [string, string]] : []),
      ["Gesamtemissionsfaktor",   `${fmtNum(co2Unit, 4)} kg CO2-Aq./t`],
      ["Gesamtemissionen (Lot)",  `${fmtNum(co2Total, 2)} kg CO2-Aq. (= ${fmtNum(co2Total / 1000, 4)} t CO2-Aq.)`],
      ["CBAM-Zertifikate (Anz.)", `${certCount} Zertifikate (je 1 t CO2-Aq.)`],
      ...(carbonPricePaidNum !== null ? [
        ["CO2-Preis gezahlt (Art. 9)", `${fmtNum(carbonPricePaidNum, 2)} EUR/t`],
        ["Verbleib. CBAM-Kosten",      `ca. ${fmtNum(((co2Total/1000)*75) - ((co2Total/1000)*carbonPricePaidNum), 0)} EUR (nach Abzug)`],
      ] as [string, string][] : []),
      ["Messmethode", "Gemäß Anhang III EU-DVO 2023/1773"],
    ];
    co2Rows.forEach(([k, v], i) => rowFn(k, v, i % 2 === 0));
  } else {
    ensure(40);
    dr(ML, y - 34, CW, 34, C.amberBg);
    pg.drawRectangle({ x: ML, y: y - 34, width: 3.5, height: 34, color: C.amber });
    dt("Keine CO2-Daten hinterlegt.", ML + 9, y - 12, bold, 8, C.amber);
    dt("EU-Standardreferenzwert gemäß Art. 7 Abs. 2 EU-VO 2023/956 ist anzuwenden.", ML + 9, y - 24, reg, 7.5, C.amber);
    y -= 42;
  }
  y -= GAP;

  // ── 4. Rechtliche Erklärung (Text mit wrapText — kein Überlauf möglich) ──
  const declParas: { text: string; isBold: boolean }[] = [
    { isBold: true,  text: "Wahrheits- und Vollständigkeitserklärung gemäß Art. 3 EU-DVO 2023/1773" },
    { isBold: false, text: "Ich erkläre hiermit, dass alle in diesem Bericht enthaltenen Angaben nach bestem Wissen und Gewissen korrekt und vollständig sind. Mir ist bekannt, dass unrichtige Angaben im CBAM-Verfahren zu Sanktionen gemäß Art. 26 EU-VO 2023/956 führen können." },
    { isBold: false, text: "Dieser Bericht ist eine automatische Systemgenerierung der EUCX-Handelsplattform (eucx.eu). Er ersetzt nicht die Meldepflicht im EU-CBAM-Register und gegenüber dem zuständigen nationalen CBAM-Beauftragten." },
  ];

  // Alle Zeilen berechnen (mit wrapText) um Boxhöhe vorauszuberechnen
  type DeclLine = { text: string; isBold: boolean };
  const declAllLines: DeclLine[] = [];
  declParas.forEach((para, pi) => {
    if (pi > 0) declAllLines.push({ text: "", isBold: false });
    const wrapped = wrapText(para.text, INNER, para.isBold ? bold : reg, para.isBold ? 8 : 7.5);
    wrapped.forEach(ln => declAllLines.push({ text: ln, isBold: para.isBold }));
  });
  const declH = declAllLines.length * 12 + 26;

  ensure(28 + declH + 90);
  sHdr("4. RECHTLICHE ERKLARUNG");
  dr(ML, y - declH, CW, declH, C.bgRow);
  pg.drawRectangle({ x: ML, y: y - declH, width: CW, height: declH, borderColor: C.blue, borderWidth: 0.75 });
  let dy = y - 15;
  for (const ln of declAllLines) {
    if (ln.text !== "") {
      dt(ln.text, ML + 10, dy, ln.isBold ? bold : reg, ln.isBold ? 8 : 7.5, ln.isBold ? C.blue : C.black);
    }
    dy -= 12;
  }
  y -= declH + 28;

  // ── Signatur (mit ausreichend Unterschriften-Raum) ────────────────
  ensure(90);
  y -= 44;  // Leerraum für die Unterschrift
  const sigW = (CW - 32) / 3;
  ["Ort, Datum", "Unterschrift, Stempel", "Name in Druckbuchstaben"].forEach((lbl, i) => {
    const sx = ML + i * (sigW + 16);
    dl(sx, y, sx + sigW, y, C.muted, 0.75);
    dt(lbl, sx, y - 11, reg, 7, C.muted);
  });
  const sigDate = org.city ? `${org.city}, ${todayFmt}` : todayFmt;
  dt(sigDate, ML, y - 23, reg, 8);
  if (org.contactName) dt(org.contactName, ML + (sigW + 16) * 2, y - 23, reg, 8);

  drawFooter();

  const pdfBytes = await doc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="EUCX-CBAM-${lot.id.slice(0,8).toUpperCase()}.pdf"`,
      "Cache-Control":       "no-store",
    },
  });
}
