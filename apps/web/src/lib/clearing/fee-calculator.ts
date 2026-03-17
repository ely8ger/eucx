/**
 * EUCX Fee Calculator — Gebühren & Steuerberechnung
 *
 * Alle Berechnungen mit Decimal.js — NIEMALS native float für Geldbeträge.
 * Warum: 0.1 + 0.2 === 0.30000000000000004 in IEEE 754 → Katastrophe in der Buchhaltung.
 *
 * ─── Gebührenstruktur ────────────────────────────────────────────────────────
 *
 *   EUCX-Plattformgebühr: 0.50% des Bruttohandelswertes
 *   (Anpassbar via FEE_RATE_BPS in .env — Default: 50 Basispunkte)
 *
 *   Staffelung (Volumen-Rabatt):
 *     < 100.000 EUR  →  0.50% (Standardsatz)
 *     < 500.000 EUR  →  0.40%
 *     < 1.000.000 EUR → 0.30%
 *     ≥ 1.000.000 EUR → 0.20% (Enterprise)
 *
 * ─── MwSt.-Logik (EU) ────────────────────────────────────────────────────────
 *
 *   Fall 1: Inlandsgeschäft (DE → DE)
 *     → Standard-MwSt. 19% auf Nettowarenwert + Plattformgebühr
 *
 *   Fall 2: EU B2B Cross-Border (DE → PL, mit gültiger USt-IdNr.)
 *     → Reverse Charge: Käufer schuldet MwSt. in eigenem Land
 *     → Rechnung ohne MwSt., Vermerk "Steuerschuldnerschaft geht über"
 *     → vatRate = 0, vatAmount = 0
 *
 *   Fall 3: EU B2C oder Drittland
 *     → Volle MwSt. des Lieferlandes (vereinfacht: immer 19% für DE)
 *
 * ─── Beispielrechnung ────────────────────────────────────────────────────────
 *
 *   100t Kupfer @ 8.500 EUR/t = 850.000 EUR Brutto
 *   Gebühr:     850.000 × 0.30% =    2.550,00 EUR  (Staffel 500k-1M)
 *   Netto:      850.000 - 2.550 =  847.450,00 EUR  (Verkäufer erhält)
 *   MwSt.:      bei Reverse Charge = 0,00 EUR
 */

import Decimal from "decimal.js";

// ─── Konstanten ───────────────────────────────────────────────────────────────

// Gebühren-Staffel: [max Volumen in EUR, Rate in Basispunkten]
// Basispunkte (BPS): 1 BPS = 0.01%  → 50 BPS = 0.50%
const FEE_TIERS: [number, number][] = [
  [100_000,   50],  // < 100k EUR    → 0.50%
  [500_000,   40],  // < 500k EUR    → 0.40%
  [1_000_000, 30],  // < 1M EUR      → 0.30%
  [Infinity,  20],  // ≥ 1M EUR      → 0.20%
];

// EU-Länderliste für Reverse-Charge-Prüfung
const EU_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI",
  "FR","GR","HR","HU","IE","IT","LT","LU","LV","MT",
  "NL","PL","PT","RO","SE","SI","SK",
]);

// Standard-MwSt. pro Land (vereinfacht — in Produktion: vollständige Tabelle)
const VAT_RATES: Record<string, number> = {
  DE: 19, AT: 20, PL: 23, FR: 20, IT: 22, NL: 21,
  ES: 21, BE: 21, SE: 25, DK: 25, CZ: 21, HU: 27,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeeCalculationInput {
  grossAmount:    string;   // Bruttowert (Decimal-String)
  currency:       string;
  buyerCountry:   string;   // 2-Buchstaben ISO
  sellerCountry:  string;
  buyerTaxId?:    string;   // USt-IdNr. — wenn vorhanden: B2B-Geschäft
  sellerTaxId?:   string;
}

export interface FeeCalculationResult {
  grossAmount:    string;   // Bruttowert (unveränderlich)
  platformFee:    string;   // EUCX-Gebühr
  feeRateBps:     number;   // Angewendeter Gebührensatz in BPS
  feeRatePct:     string;   // Lesbar: "0.30%"
  vatRate:        string;   // MwSt.-Satz: "19.00" oder "0.00"
  vatAmount:      string;   // MwSt.-Betrag
  netPayable:     string;   // Käufer zahlt: gross + (vat wenn Inland)
  netToSeller:    string;   // Verkäufer erhält: gross - fee
  isReverseCharge: boolean;
  taxNote:        string;   // Rechnungstext-Hinweis
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export function calculateFees(input: FeeCalculationInput): FeeCalculationResult {
  const gross = new Decimal(input.grossAmount);

  if (gross.lte(0)) throw new Error("Bruttobetrag muss positiv sein");

  // ── Gebührensatz bestimmen (Staffel) ─────────────────────────────────────
  const grossNum = gross.toNumber();
  const feeRateBps = FEE_TIERS.find(([max]) => grossNum < max)![1];
  const feeRate    = new Decimal(feeRateBps).div(10_000);   // BPS → Dezimal
  const platformFee = gross.times(feeRate).toDecimalPlaces(8);

  // ── MwSt.-Logik ─────────────────────────────────────────────────────────
  const isReverseCharge = isEuReverseCharge(
    input.buyerCountry,
    input.sellerCountry,
    input.buyerTaxId,
  );

  let vatRate   = new Decimal(0);
  let vatAmount = new Decimal(0);
  let taxNote   = "";

  if (!isReverseCharge) {
    // Inlandsgeschäft oder B2C: MwSt. des Verkäufer-Landes
    const vatPct = VAT_RATES[input.sellerCountry] ?? 19;
    vatRate      = new Decimal(vatPct);
    vatAmount    = gross.times(vatRate.div(100)).toDecimalPlaces(8);
    taxNote      = `MwSt. ${vatPct}% (${input.sellerCountry})`;
  } else {
    taxNote = "Steuerschuldnerschaft des Leistungsempfängers (§ 13b UStG / Art. 196 MwStSystRL)";
  }

  // ── Settlement-Beträge ────────────────────────────────────────────────────
  // Was der Käufer zahlt: Brutto + MwSt. (bei Inland), Brutto (bei Reverse Charge)
  const netPayable = gross.plus(vatAmount).toDecimalPlaces(8);

  // Was der Verkäufer erhält: Brutto - Plattformgebühr (MwSt. zahlt Käufer)
  const netToSeller = gross.minus(platformFee).toDecimalPlaces(8);

  return {
    grossAmount:    gross.toFixed(8),
    platformFee:    platformFee.toFixed(8),
    feeRateBps,
    feeRatePct:     `${(feeRateBps / 100).toFixed(2)}%`,
    vatRate:        vatRate.toFixed(2),
    vatAmount:      vatAmount.toFixed(8),
    netPayable:     netPayable.toFixed(8),
    netToSeller:    netToSeller.toFixed(8),
    isReverseCharge,
    taxNote,
  };
}

/**
 * Prüft ob EU-Reverse-Charge gilt:
 *   - Beide Länder sind EU-Mitgliedstaaten
 *   - Käufer hat gültige USt-IdNr. (B2B)
 *   - Käufer und Verkäufer sind in VERSCHIEDENEN EU-Ländern
 */
function isEuReverseCharge(
  buyerCountry:  string,
  sellerCountry: string,
  buyerTaxId?:   string,
): boolean {
  return (
    EU_COUNTRIES.has(buyerCountry) &&
    EU_COUNTRIES.has(sellerCountry) &&
    buyerCountry !== sellerCountry &&
    !!buyerTaxId &&
    buyerTaxId.length >= 8  // Grundlegende Länge-Prüfung
  );
}

/**
 * Validiert die Invariante des Double-Entry-Buchungssatzes.
 * Gibt true zurück wenn SUM(DEBIT) === SUM(CREDIT).
 * Muss nach jeder Settlement-Runde aufgerufen werden.
 */
export function validateLedgerBalance(
  entries: Array<{ entryType: "DEBIT" | "CREDIT"; amount: string }>
): boolean {
  const totalDebit  = entries
    .filter((e) => e.entryType === "DEBIT")
    .reduce((s, e) => s.plus(e.amount), new Decimal(0));

  const totalCredit = entries
    .filter((e) => e.entryType === "CREDIT")
    .reduce((s, e) => s.plus(e.amount), new Decimal(0));

  // Toleranz: max 1 Cent Rundungsdifferenz (durch Decimal.js de facto 0)
  return totalDebit.minus(totalCredit).abs().lte(new Decimal("0.00000001"));
}
