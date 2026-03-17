/**
 * Unit-Tests: FeeCalculator
 *
 * Alle Erwartungen basieren auf der tatsächlichen Implementierung:
 *   - validateLedgerBalance()  erwartet  { entryType, amount }  (nicht "type")
 *   - grossAmount / platformFee / vatAmount   → toFixed(8)-Strings
 *   - vatRate                                 → toFixed(2)-String ("19.00")
 *   - taxNote bei Reverse Charge              → enthält "Steuerschuldnerschaft"
 *   - MwSt.-Bemessungsgrundlage               → gross (nicht platformFee)
 */

import {
  calculateFees,
  validateLedgerBalance,
  type FeeCalculationInput,
  type FeeCalculationResult,
} from "@/lib/clearing/fee-calculator";
import Decimal from "decimal.js";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function calc(
  gross:       string,
  buyer:       string,
  seller:      string,
  buyerTaxId?: string,
): FeeCalculationResult {
  return calculateFees({
    grossAmount:  gross,
    currency:     "EUR",
    buyerCountry: buyer,
    sellerCountry: seller,
    buyerTaxId,
    sellerTaxId:  "DE123456789",
  });
}

/** Parst einen Decimal-String aus einer Ergebnis-Eigenschaft */
function d(val: string) { return new Decimal(val); }

// ─── Gebühren-Staffel ─────────────────────────────────────────────────────────

describe("FeeCalculator — Gebühren-Staffel", () => {

  it("unter 100.000 EUR → 50 BPS (0.50%)", () => {
    const r = calc("50000", "DE", "DE");
    expect(r.feeRateBps).toBe(50);
    expect(r.feeRatePct).toBe("0.50%");
    // 50.000 × 0.005 = 250,00
    expect(d(r.platformFee).toFixed(2)).toBe("250.00");
  });

  it("genau 100.000 EUR → 40 BPS (Stufe 2: >= 100k)", () => {
    const r = calc("100000", "DE", "DE");
    expect(r.feeRateBps).toBe(40);
    // 100.000 × 0.004 = 400,00
    expect(d(r.platformFee).toFixed(2)).toBe("400.00");
  });

  it("99.999,99 EUR → noch 50 BPS", () => {
    const r = calc("99999.99", "DE", "DE");
    expect(r.feeRateBps).toBe(50);
    // 99.999,99 × 0.005 = 499.9999500
    expect(d(r.platformFee).toFixed(7)).toBe("499.9999500");
  });

  it("500.000 EUR → 30 BPS (Stufe 3: >= 500k)", () => {
    const r = calc("500000", "DE", "DE");
    expect(r.feeRateBps).toBe(30);
    // 500.000 × 0.003 = 1.500,00
    expect(d(r.platformFee).toFixed(2)).toBe("1500.00");
  });

  it("1.000.000 EUR → 20 BPS (Enterprise: >= 1M)", () => {
    const r = calc("1000000", "DE", "DE");
    expect(r.feeRateBps).toBe(20);
    // 1.000.000 × 0.002 = 2.000,00
    expect(d(r.platformFee).toFixed(2)).toBe("2000.00");
  });

  it("5.000.000 EUR → 20 BPS (Enterprise-Deckel)", () => {
    const r = calc("5000000", "DE", "DE");
    expect(r.feeRateBps).toBe(20);
    // 5.000.000 × 0.002 = 10.000,00
    expect(d(r.platformFee).toFixed(2)).toBe("10000.00");
  });

  it("100t Kupfer @ 8.500 EUR/t = 850.000 EUR → 30 BPS (aus Spec-Dokument)", () => {
    const gross = new Decimal("8500").times("100").toString();   // "850000"
    const r     = calc(gross, "DE", "DE");

    expect(r.feeRateBps).toBe(30);
    // 850.000 × 0.003 = 2.550,00
    expect(d(r.platformFee).toFixed(2)).toBe("2550.00");
    // Verkäufer erhält: 850.000 - 2.550 = 847.450
    expect(d(r.netToSeller).toFixed(2)).toBe("847450.00");
    // grossAmount wird unverändert zurückgegeben (toFixed(8))
    expect(d(r.grossAmount).toFixed(2)).toBe("850000.00");
  });

  it("Grenzwert-Exaktheit: braucht grossNum < max (nicht <=)", () => {
    // 499.999,99 sollte noch in Stufe 2 (< 500k → 40 BPS) liegen
    const r = calc("499999.99", "DE", "DE");
    expect(r.feeRateBps).toBe(40);

    // 500.000,00 → Stufe 3 (< 1M → 30 BPS)
    const r2 = calc("500000.00", "DE", "DE");
    expect(r2.feeRateBps).toBe(30);
  });
});

// ─── MwSt. & EU Reverse Charge ────────────────────────────────────────────────

describe("FeeCalculator — MwSt. & EU Reverse Charge", () => {

  it("Inland DE → DE: MwSt. 19% wird berechnet (positiver Betrag)", () => {
    const r = calc("100000", "DE", "DE");
    expect(r.isReverseCharge).toBe(false);
    expect(r.vatRate).toBe("19.00");
    // 100.000 × 19% = 19.000
    expect(d(r.vatAmount).toFixed(2)).toBe("19000.00");
  });

  it("EU cross-border DE → PL mit USt-IdNr: Reverse Charge", () => {
    const r = calc("100000", "DE", "PL", "PL1234567890");
    expect(r.isReverseCharge).toBe(true);
    expect(r.vatRate).toBe("0.00");
    expect(d(r.vatAmount).toFixed(8)).toBe("0.00000000");
    // taxNote enthält gesetzliche Grundlage
    expect(r.taxNote).toContain("Steuerschuldnerschaft");
  });

  it("EU cross-border OHNE USt-IdNr: kein Reverse Charge (B2C-Annahme)", () => {
    const r = calc("100000", "DE", "PL");   // kein buyerTaxId
    expect(r.isReverseCharge).toBe(false);
    expect(d(r.vatAmount).gt(0)).toBe(true);
  });

  it("Drittland CH → DE: kein EU Reverse Charge (CH kein EU-Mitglied)", () => {
    const r = calc("100000", "CH", "DE", "CHE-123.456.789");
    expect(r.isReverseCharge).toBe(false);
  });

  it("Gleiche Land DE → DE: kein Reverse Charge, auch mit TaxId", () => {
    // Reverse Charge gilt nur cross-border
    const r = calc("100000", "DE", "DE", "DE123456789");
    expect(r.isReverseCharge).toBe(false);
  });

  it("MwSt. wird auf Bruttowarenwert (gross) berechnet, nicht auf Fee", () => {
    // Beispiel: 10.000 EUR Brutto, DE → DE, 19%
    const r    = calc("10000", "DE", "DE");
    const gross = d(r.grossAmount);   // 10.000
    const vat   = gross.times("0.19");
    // MwSt. = 10.000 × 19% = 1.900
    expect(d(r.vatAmount).toFixed(2)).toBe(vat.toFixed(2));
    expect(d(r.vatAmount).toFixed(2)).toBe("1900.00");
  });

  it("netPayable = grossAmount + vatAmount (was der Käufer zahlt)", () => {
    const r        = calc("50000", "DE", "DE");
    const expected = d(r.grossAmount).plus(r.vatAmount);
    expect(d(r.netPayable).toFixed(8)).toBe(expected.toFixed(8));
  });

  it("netPayable == grossAmount wenn Reverse Charge (keine MwSt.)", () => {
    const r = calc("50000", "DE", "PL", "PL1234567890");
    expect(d(r.netPayable).toFixed(8)).toBe(d(r.grossAmount).toFixed(8));
  });

  it("verschiedene EU-Länder als Verkäufer: DE→AT, vatRate = 20%", () => {
    // AT hat 20% MwSt. — aber Reverse Charge gilt für cross-border B2B
    // Mit taxId → Reverse Charge, vatRate=0
    const r = calc("100000", "DE", "AT", "ATU12345678");
    expect(r.isReverseCharge).toBe(true);
    expect(r.vatRate).toBe("0.00");
  });
});

// ─── Decimal-Präzision & Sicherheit ──────────────────────────────────────────

describe("FeeCalculator — Decimal-Präzision", () => {

  it("Kein IEEE 754-Fehler: 0.1 + 0.2 = exakt 0.3 mit Decimal.js", () => {
    // Native float: 0.1 + 0.2 === 0.30000000000000004 → FALSCH
    // Decimal.js: exakt korrekt
    expect(new Decimal("0.1").plus("0.2").toString()).toBe("0.3");
  });

  it("Kein Rundungsfehler: 1/3 × 3 = 1.000... (nicht 0.999...)", () => {
    const third = new Decimal(1).div(3);
    expect(third.times(3).toFixed(10)).toBe("1.0000000000");
  });

  it("Sehr großer Trade (100M EUR) → kein Overflow, 20 BPS Enterprise", () => {
    const r = calc("100000000", "DE", "DE");
    expect(r.feeRateBps).toBe(20);
    // 100.000.000 × 0.002 = 200.000
    expect(d(r.platformFee).toFixed(2)).toBe("200000.00");
    // netToSeller = 100.000.000 - 200.000 = 99.800.000
    expect(d(r.netToSeller).toFixed(2)).toBe("99800000.00");
  });

  it("Minimale Menge (0.00000001 EUR): kein Exponentialformat", () => {
    const r = calc("0.00000001", "DE", "DE");
    expect(r.platformFee).not.toContain("e");
    expect(r.grossAmount).not.toContain("e");
    expect(d(r.platformFee).gte(0)).toBe(true);
  });

  it("netToSeller ist nie negativ (für alle gültigen Inputs)", () => {
    for (const gross of ["0.01", "1", "1000", "1000000", "50000000"]) {
      const r = calc(gross, "DE", "DE");
      expect(d(r.netToSeller).gte(0)).toBe(true);
    }
  });

  it("grossAmount wird unverändert zurückgegeben (Identität)", () => {
    // 8 Dezimalstellen bleiben erhalten
    const r = calc("12345.67890123", "DE", "DE");
    expect(d(r.grossAmount).toFixed(8)).toBe("12345.67890123");
  });

  it("platformFee hat genau 8 Dezimalstellen", () => {
    const r = calc("99999.99", "DE", "DE");
    const parts = r.platformFee.split(".");
    expect(parts[1]).toHaveLength(8);
  });
});

// ─── validateLedgerBalance — Double-Entry Invariante ─────────────────────────

describe("validateLedgerBalance — Double-Entry Buchführung", () => {
  // WICHTIG: validateLedgerBalance erwartet { entryType, amount } — NICHT "type"

  it("ausgeglichener Satz: SUM(DEBIT) == SUM(CREDIT) → true", () => {
    const entries = [
      { entryType: "DEBIT"  as const, amount: "1000.00" },
      { entryType: "CREDIT" as const, amount: "970.00"  },
      { entryType: "CREDIT" as const, amount: "30.00"   },
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });

  it("unausgeglichener Satz (1 Cent Differenz) → false", () => {
    const entries = [
      { entryType: "DEBIT"  as const, amount: "1000.00" },
      { entryType: "CREDIT" as const, amount: "999.99"  },
    ];
    expect(validateLedgerBalance(entries)).toBe(false);
  });

  it("exakt ausgeglichener Satz mit 8 Dezimalstellen → true", () => {
    const entries = [
      { entryType: "DEBIT"  as const, amount: "100.00000001" },
      { entryType: "CREDIT" as const, amount: "100.00000001" },
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });

  it("leere Einträge → true (kein Fehler, kein falsch-negativ)", () => {
    expect(validateLedgerBalance([])).toBe(true);
  });

  it("typisches Settlement: Käufer-DEBIT, Verkäufer-CREDIT, Fee-CREDIT", () => {
    // 850.000 EUR Brutto: Käufer zahlt, Verkäufer + EUCX erhalten
    const entries = [
      { entryType: "DEBIT"  as const, amount: "850000.00000000" },  // Käufer-Wallet
      { entryType: "CREDIT" as const, amount: "847450.00000000" },  // Verkäufer-Wallet
      { entryType: "CREDIT" as const, amount: "2550.00000000"   },  // EUCX Fee
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });

  it("Storno-Buchungen: Original + Gegenbuchung = ausgeglichen", () => {
    const entries = [
      // Original
      { entryType: "DEBIT"  as const, amount: "1000" },
      { entryType: "CREDIT" as const, amount: "1000" },
      // Storno (DEBIT ↔ CREDIT getauscht, gleicher Betrag)
      { entryType: "CREDIT" as const, amount: "1000" },
      { entryType: "DEBIT"  as const, amount: "1000" },
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });

  it("Teilrückerstattung: Original + Storno-Teilbetrag bleibt ausgeglichen", () => {
    const entries = [
      // Settlement
      { entryType: "DEBIT"  as const, amount: "10000" },
      { entryType: "CREDIT" as const, amount: "9700"  },
      { entryType: "CREDIT" as const, amount: "300"   },
      // Teilrückerstattung 500 EUR
      { entryType: "CREDIT" as const, amount: "500"   },
      { entryType: "DEBIT"  as const, amount: "500"   },
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });

  it("mehrere Storni hintereinander: Invariante bleibt ausgeglichen", () => {
    const entries = [
      // Original Deal
      { entryType: "DEBIT"  as const, amount: "5000" },
      { entryType: "CREDIT" as const, amount: "5000" },
      // Erster Storno
      { entryType: "CREDIT" as const, amount: "5000" },
      { entryType: "DEBIT"  as const, amount: "5000" },
      // Zweiter Neueintrag (Korrektur)
      { entryType: "DEBIT"  as const, amount: "5200" },
      { entryType: "CREDIT" as const, amount: "5200" },
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });

  it("einzelner DEBIT ohne CREDIT → false", () => {
    const entries = [
      { entryType: "DEBIT" as const, amount: "1000" },
    ];
    expect(validateLedgerBalance(entries)).toBe(false);
  });
});
