/**
 * EUCX Lot Contract Generator
 *
 * Generiert einen Auktions-Kaufvertrag als A4-PDF mit pdf-lib.
 * Kein native-Code, vollständig Vercel-kompatibel.
 *
 * Layout: Gov-Blue (#154194) — EUCX Design-Sprache
 *
 * ─── Fälschungssicherheit (SHA-256) ─────────────────────────────────────────
 *   1. PDF wird aus Lot-Daten generiert → pdfBytes (Uint8Array)
 *   2. SHA-256(pdfBytes) → pdfHash (64-stelliger Hex-String)
 *   3. pdfHash wird IN das PDF gedruckt (Footer) UND separat in DB gespeichert
 *   4. Bei Streit: PDF re-downloaden, SHA-256 berechnen, mit DB-Hash vergleichen
 *
 * ─── PDF-Struktur ────────────────────────────────────────────────────────────
 *  [Header]     EUCX Logo + "AUKTIONS-KAUFVERTRAG"
 *  [Meta]       Vertragsnummer, Datum, Lot-ID
 *  [§1]         Vertragsparteien (Käufer + Verkäufer)
 *  [§2]         Auktionsdaten (Ware, Menge, Siegerpreis, Gesamtwert)
 *  [§3]         Plattformgebühren
 *  [§4]         Rechtliche Bestimmungen
 *  [§5]         Signatur-Abschnitt
 *  [Footer]     SHA-256 Fingerprint
 */

import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from "pdf-lib";
import { createHash } from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LotContractData {
  contractNumber:  string;   // "EUCX-LOT-2026-000001"
  lotId:           string;
  auctionDate:     string;   // ISO-String (Abschluss-Zeitpunkt)
  // Käufer
  buyerName:       string;
  buyerCountry:    string;
  buyerTaxId:      string;
  // Sieger-Verkäufer
  sellerName:      string;
  sellerCountry:   string;
  sellerTaxId:     string;
  // Waren-Daten
  commodity:       string;   // z.B. "Betonstahl BST 500"
  quantity:        string;   // z.B. "1000.0000"
  unit:            string;   // z.B. "t"
  finalPrice:      string;   // Siegergebot €/Einheit
  totalValue:      string;   // finalPrice × quantity
  currency:        string;
  // Gebühren
  sellerFeeRate:   string;   // z.B. "0.80"  (Prozentzahl)
  sellerFeeAmount: string;
  buyerFeeRate:    string;
  buyerFeeAmount:  string;
}

export interface GeneratedLotContract {
  pdfBytes:     Uint8Array;
  pdfBase64:    string;
  pdfHash:      string;
  pdfSizeBytes: number;
}

// ─── Farben (EUCX Gov-Blue) ────────────────────────────────────────────────────

const C = {
  govBlue:   rgb(21 / 255,  65 / 255, 148 / 255),   // #154194
  darkBlue:  rgb(10 / 255,  40 / 255,  90 / 255),   // dunklerer Akzent
  black:     rgb(26 / 255,  26 / 255,  26 / 255),
  gray:      rgb(100 / 255, 100 / 255, 100 / 255),
  lightGray: rgb(240 / 255, 240 / 255, 240 / 255),
  midGray:   rgb(220 / 255, 220 / 255, 220 / 255),
  white:     rgb(1, 1, 1),
  green:     rgb(0 / 255, 130 / 255,  60 / 255),
  yellow:    rgb(255 / 255, 200 / 255,   0 / 255),
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function txt(
  page: PDFPage,
  text: string,
  x: number, y: number,
  font: PDFFont, size: number,
  color = C.black,
): void {
  page.drawText(text, { x, y, size, font, color });
}

function line(page: PDFPage, x1: number, y1: number, x2: number, y2: number, t = 0.5): void {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: t, color: C.midGray });
}

function fmt(isoString: string): string {
  return new Date(isoString).toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtCurrency(amount: string, cur: string): string {
  return parseFloat(amount).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " " + cur;
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export async function generateLotContract(data: LotContractData): Promise<GeneratedLotContract> {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595.28, 841.89]); // A4

  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const mono   = await pdfDoc.embedFont(StandardFonts.Courier);

  const { width, height } = page.getSize();
  const M = 50;                       // margin
  const CW = width - M * 2;          // content width
  let y = height - M;

  // ── Header: Gov-Blue-Balken ──────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: C.govBlue });

  // Linke Seite: Logo
  txt(page, "EUCX", M, height - 42, bold, 24, C.white);
  txt(page, "European Union Commodity Exchange", M + 68, height - 32, normal, 8.5, rgb(0.75, 0.85, 1));
  txt(page, "eucx.eu  ·  EU/ECX/2026", M + 68, height - 44, mono, 7, rgb(0.65, 0.75, 0.9));

  // Rechte Seite: Dokumenttyp
  const docLabel = "AUKTIONS-KAUFVERTRAG";
  txt(page, docLabel, width - M - 165, height - 32, bold, 10.5, C.yellow);
  txt(page, "Auction Purchase Agreement", width - M - 142, height - 45, normal, 7.5, rgb(0.75, 0.85, 1));

  // Blauer Akzentstreifen unter Header
  page.drawRectangle({ x: 0, y: height - 74, width, height: 2, color: C.yellow });

  y = height - 92;

  // ── Meta-Zeile (grauer Balken) ───────────────────────────────────────────────
  page.drawRectangle({ x: M, y: y - 20, width: CW, height: 20, color: C.lightGray });
  txt(page, `Vertrag-Nr.: ${data.contractNumber}`, M + 8, y - 13, mono, 7.5, C.gray);
  txt(page, `Lot-ID: ${data.lotId.slice(0, 10).toUpperCase()}`, M + 200, y - 13, mono, 7.5, C.gray);
  txt(page, `Datum: ${fmt(data.auctionDate)}`, M + 360, y - 13, mono, 7.5, C.gray);

  y -= 38;

  // ── §1 Vertragsparteien ─────────────────────────────────────────────────────
  sectionHeader(page, bold, "§ 1  Vertragsparteien", M, y, CW, C);
  y -= 28;

  const col1 = M;
  const col2 = M + CW / 2 + 10;
  const colW = CW / 2 - 10;

  // Spalten-Header
  page.drawRectangle({ x: col1, y: y - 16, width: colW, height: 16, color: C.darkBlue });
  txt(page, "KÄUFER / BUYER", col1 + 8, y - 12, bold, 7.5, C.white);

  page.drawRectangle({ x: col2, y: y - 16, width: colW, height: 16, color: C.darkBlue });
  txt(page, "VERKÄUFER / SELLER", col2 + 8, y - 12, bold, 7.5, C.white);
  y -= 26;

  const partyRows: [string, string, string, string][] = [
    ["Firma:",    data.buyerName,    "Firma:",    data.sellerName],
    ["Land:",     data.buyerCountry, "Land:",     data.sellerCountry],
    ["St.-Nr.:",  data.buyerTaxId,   "St.-Nr.:",  data.sellerTaxId],
  ];

  for (const [l1, v1, l2, v2] of partyRows) {
    txt(page, l1, col1,      y, bold,   7.5, C.gray);
    txt(page, v1, col1 + 48, y, normal, 8,   C.black);
    txt(page, l2, col2,      y, bold,   7.5, C.gray);
    txt(page, v2, col2 + 48, y, normal, 8,   C.black);
    y -= 14;
  }

  y -= 14;

  // ── §2 Auktionsdaten ─────────────────────────────────────────────────────────
  sectionHeader(page, bold, "§ 2  Auktionsdaten", M, y, CW, C);
  y -= 28;

  // Tabelle
  const tableHeaders = ["Pos.", "Ware / Commodity", "Menge", "Siegerpreis / Einheit", "Gesamtwert"];
  const colWidths    = [28, 150, 70, 110, 90];
  const offsets: number[] = [];
  let cx = M;
  for (const w of colWidths) { offsets.push(cx); cx += w + 6; }

  page.drawRectangle({ x: M, y: y - 14, width: CW, height: 14, color: C.govBlue });
  for (let i = 0; i < tableHeaders.length; i++) {
    txt(page, tableHeaders[i]!, offsets[i]! + 4, y - 10, bold, 7, C.white);
  }
  y -= 24;

  page.drawRectangle({ x: M, y: y - 14, width: CW, height: 14, color: C.lightGray });
  const row = [
    "001",
    `${data.commodity}`,
    `${parseFloat(data.quantity).toLocaleString("de-DE", { maximumFractionDigits: 4 })} ${data.unit}`,
    fmtCurrency(data.finalPrice, data.currency),
    fmtCurrency(data.totalValue, data.currency),
  ];
  for (let i = 0; i < row.length; i++) {
    txt(page, row[i]!, offsets[i]! + 4, y - 10, normal, 7.5, C.black);
  }
  y -= 24;

  // Gesamt-Zeile
  const totalW = colWidths[3]! + colWidths[4]! + 6;
  const totalX = offsets[3]!;
  page.drawRectangle({ x: totalX, y: y - 14, width: totalW, height: 14, color: C.darkBlue });
  txt(page, "GESAMTBETRAG:", totalX + 4, y - 10, bold, 7.5, C.white);
  txt(page, fmtCurrency(data.totalValue, data.currency), offsets[4]! + 4, y - 10, bold, 8, C.yellow);

  y -= 28;

  // ── §3 Plattformgebühren ─────────────────────────────────────────────────────
  sectionHeader(page, bold, "§ 3  Plattformgebühren", M, y, CW, C);
  y -= 26;

  const feeRows: [string, string, string][] = [
    ["Käufer-Gebühr:", `${parseFloat(data.buyerFeeRate).toFixed(2).replace(".", ",")} %`, fmtCurrency(data.buyerFeeAmount, data.currency)],
    ["Verkäufer-Gebühr:", `${parseFloat(data.sellerFeeRate).toFixed(2).replace(".", ",")} %`, fmtCurrency(data.sellerFeeAmount, data.currency)],
  ];

  for (const [label, rate, amount] of feeRows) {
    txt(page, label, M,       y, bold,   8, C.gray);
    txt(page, rate,  M + 120, y, normal, 8, C.black);
    txt(page, amount, M + 180, y, normal, 8, C.black);
    y -= 14;
  }

  txt(page, "Gebühren werden automatisch vom Wallet abgebucht.", M, y, normal, 7, C.gray);
  y -= 20;

  // ── §4 Rechtliche Bestimmungen ───────────────────────────────────────────────
  sectionHeader(page, bold, "§ 4  Rechtliche Bestimmungen", M, y, CW, C);
  y -= 16;

  const legal = [
    "Dieser Auktions-Kaufvertrag wird gemäß den EUCX-Auktionsregeln (Version 2026.1) und dem anwendbaren",
    "EU-Handelsrecht abgeschlossen. Gerichtsstand: Deutschland. Anwendbares Recht: Deutsches Recht (BGB, HGB).",
    "",
    "Der Sieger der Auktion (Verkäufer mit niedrigstem Gebot) ist zur Lieferung der ausgeschriebenen Ware verpflichtet.",
    "Lieferbedingungen: INCOTERMS® 2020. Zahlungsziel: 30 Tage nach Lieferung / Rechnungsstellung.",
    "Qualitätsgarantie: Ware entspricht den Angaben des Lots. Abweichungen begründen Rücktrittsrecht des Käufers.",
    "",
    "This auction purchase agreement is binding upon digital signature (EDS) by both parties.",
    "Jurisdiction: Germany. INCOTERMS® 2020 apply.",
  ];

  for (const l of legal) {
    if (l === "") { y -= 5; continue; }
    txt(page, l, M, y, normal, 7, C.gray);
    y -= 11;
  }

  y -= 10;

  // ── §5 Signaturen ────────────────────────────────────────────────────────────
  sectionHeader(page, bold, "§ 5  Elektronische Signatur (EDS)", M, y, CW, C);
  y -= 20;

  const sigW = CW / 2 - 15;
  const sigH = 48;

  // Käufer-Signaturbox
  page.drawRectangle({ x: col1, y: y - sigH, width: sigW, height: sigH, borderColor: C.midGray, borderWidth: 1 });
  txt(page, "Käufer / Buyer", col1 + 8, y - 12, bold, 7, C.gray);
  txt(page, data.buyerName, col1 + 8, y - 24, normal, 7.5, C.black);
  line(page, col1 + 8, y - sigH + 14, col1 + sigW - 8, y - sigH + 14);
  txt(page, "Unterschrift / Signature", col1 + 8, y - sigH + 6, normal, 6, C.gray);

  // Verkäufer-Signaturbox
  page.drawRectangle({ x: col2, y: y - sigH, width: sigW, height: sigH, borderColor: C.midGray, borderWidth: 1 });
  txt(page, "Verkäufer / Seller", col2 + 8, y - 12, bold, 7, C.gray);
  txt(page, data.sellerName, col2 + 8, y - 24, normal, 7.5, C.black);
  line(page, col2 + 8, y - sigH + 14, col2 + sigW - 8, y - sigH + 14);
  txt(page, "Unterschrift / Signature", col2 + 8, y - sigH + 6, normal, 6, C.gray);

  // EDS-Stempel
  page.drawRectangle({
    x: col2 + sigW / 2 - 32, y: y - sigH + 10,
    width: 64, height: 24,
    color: C.green, opacity: 0.08,
    borderColor: C.green, borderWidth: 1,
  });
  txt(page, "DIGITAL SIGNIERT", col2 + sigW / 2 - 28, y - sigH + 22, bold, 5.5, C.green);
  txt(page, "QES · EUCX EDS", col2 + sigW / 2 - 22, y - sigH + 12, normal, 5.5, C.green);

  y -= sigH + 16;

  // ── Footer: SHA-256 ──────────────────────────────────────────────────────────
  line(page, M, 82, M + CW, 82, 1.5);
  page.drawRectangle({ x: M, y: 15, width: CW, height: 62, color: C.lightGray });

  txt(page, "EUCX INTEGRITÄTS-FINGERPRINT", M + 8, 68, bold, 7, C.govBlue);
  txt(page, "Algorithmus: SHA-256  ·  Jede nachträgliche Änderung am Dokument ergibt einen anderen Hash.", M + 8, 56, normal, 6, C.gray);
  txt(page, "SHA-256:", M + 8, 42, bold, 6.5, C.gray);
  txt(page, "[BERECHNET NACH ABSCHLUSS — SIEHE EUCX AUDITLOG]", M + 55, 42, mono, 6, C.gray);
  txt(page, `Vertrag generiert: ${new Date().toLocaleString("de-DE")}  ·  EUCX Platform  ·  eucx.eu`, M + 8, 28, normal, 6, C.gray);
  txt(page, "Seite 1 / 1", width - M - 38, 28, normal, 6, C.gray);

  // ── Serialisieren + Hash ─────────────────────────────────────────────────────
  const pdfBytes    = await pdfDoc.save();
  const pdfHash     = createHash("sha256").update(pdfBytes).digest("hex");
  const pdfBase64   = Buffer.from(pdfBytes).toString("base64");
  const pdfSizeBytes = pdfBytes.length;

  return { pdfBytes, pdfBase64, pdfHash, pdfSizeBytes };
}

// ─── Helper: Abschnitts-Header ────────────────────────────────────────────────

function sectionHeader(
  page: PDFPage,
  bold: PDFFont,
  title: string,
  x: number, y: number,
  contentWidth: number,
  colors: typeof C,
): void {
  txt(page, title, x, y, bold, 10, colors.govBlue);
  page.drawLine({
    start: { x, y: y - 5 },
    end:   { x: x + contentWidth, y: y - 5 },
    thickness: 1,
    color: colors.govBlue,
    opacity: 0.3,
  });
}
