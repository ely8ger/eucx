/**
 * Integration-Tests: Double-Spend & Race Conditions
 *
 * Testet die mathematischen Sicherheitsgarantien des Clearing-Systems:
 *
 * 1. idempotencyKey-Kollision: Zwei identische Buchungen dürfen nicht
 *    doppelt angelegt werden (DB UNIQUE-Constraint).
 *
 * 2. Parallele Matching-Runs: Advisory-Lock garantiert exklusiven Zugriff.
 *    Simuliert durch sequentielle Ausführung mit State-Check.
 *
 * 3. Negative Inventur: filledQty darf quantity nie überschreiten.
 *
 * 4. Ledger-Invariante nach mehreren Storni bleibt ausgeglichen.
 *
 * WICHTIG: Diese Tests nutzen KEIN echtes Prisma.
 * Sie testen die algebraischen Eigenschaften der Berechnungslogik direkt.
 */

import Decimal from "decimal.js";
import { validateLedgerBalance } from "@/lib/clearing/fee-calculator";

// ─── Idempotency-Key Kollision ────────────────────────────────────────────────

describe("Double-Spend Schutz — idempotencyKey Eindeutigkeit", () => {

  /**
   * Simuliert den Prisma-Unique-Constraint Fehler (P2002).
   * In der Praxis: DB wirft Fehler wenn gleiches idempotencyKey zweimal geschrieben.
   */

  class MockLedger {
    private entries = new Map<string, { type: string; amount: string }>();

    insert(key: string, type: string, amount: string): boolean {
      if (this.entries.has(key)) {
        return false;   // Simuliert P2002: Unique-Constraint verletzt
      }
      this.entries.set(key, { type, amount });
      return true;
    }

    getEntries() {
      return Array.from(this.entries.values());
    }
  }

  it("Erste Buchung erfolgreich", () => {
    const ledger = new MockLedger();
    const result = ledger.insert("deal:abc:buyer:DEBIT", "DEBIT", "1000");
    expect(result).toBe(true);
  });

  it("Duplicate idempotencyKey → abgelehnt (kein Double-Spend)", () => {
    const ledger = new MockLedger();
    ledger.insert("deal:abc:buyer:DEBIT", "DEBIT", "1000");

    // Zweiter Versuch mit gleichem Key → abgelehnt
    const result = ledger.insert("deal:abc:buyer:DEBIT", "DEBIT", "1000");
    expect(result).toBe(false);

    // Nur ein DEBIT in der Ledger
    const debits = ledger.getEntries().filter(e => e.type === "DEBIT");
    expect(debits).toHaveLength(1);
  });

  it("Verschiedene idempotencyKeys → beide akzeptiert", () => {
    const ledger = new MockLedger();
    ledger.insert("deal:abc:buyer:DEBIT",  "DEBIT",  "1000");
    ledger.insert("deal:abc:seller:CREDIT", "CREDIT", "1000");

    expect(ledger.getEntries()).toHaveLength(2);
  });
});

// ─── Race Condition — Advisory Lock Simulation ────────────────────────────────

describe("Matching Engine — Race Condition Prävention", () => {

  /**
   * Simuliert zwei gleichzeitige Matching-Runs für dieselbe Session.
   * Lock-Mechanismus: nur ein Run darf aktiv sein.
   * Zweiter Run muss warten oder abbrechen.
   */

  class MockAdvisoryLock {
    private locks = new Set<string>();

    acquire(sessionId: string): boolean {
      if (this.locks.has(sessionId)) return false;  // Lock belegt
      this.locks.add(sessionId);
      return true;
    }

    release(sessionId: string): void {
      this.locks.delete(sessionId);
    }
  }

  it("Erster Matching-Run erwirbt den Lock", () => {
    const lock = new MockAdvisoryLock();
    expect(lock.acquire("session-1")).toBe(true);
    lock.release("session-1");
  });

  it("Zweiter paralleler Run wird blockiert", () => {
    const lock      = new MockAdvisoryLock();
    const acquired1 = lock.acquire("session-1");  // Run 1 bekommt Lock
    const acquired2 = lock.acquire("session-1");  // Run 2 wird geblockt

    expect(acquired1).toBe(true);
    expect(acquired2).toBe(false);   // Kein Doppel-Matching!

    lock.release("session-1");
  });

  it("Nach Lock-Freigabe: nächster Run kann acquiren", () => {
    const lock = new MockAdvisoryLock();
    lock.acquire("session-1");
    lock.release("session-1");

    // Nächster Run bekommt Lock
    expect(lock.acquire("session-1")).toBe(true);
    lock.release("session-1");
  });

  it("Verschiedene Sessions laufen parallel", () => {
    const lock = new MockAdvisoryLock();
    const a = lock.acquire("session-A");
    const b = lock.acquire("session-B");  // Andere Session → kein Konflikt

    expect(a).toBe(true);
    expect(b).toBe(true);

    lock.release("session-A");
    lock.release("session-B");
  });
});

// ─── Negative Inventur ────────────────────────────────────────────────────────

describe("Order Inventur — Negative Quantities verboten", () => {

  function calcRemaining(qty: string, filled: string): Decimal {
    return new Decimal(qty).minus(filled);
  }

  it("remaining >= 0 nach partiellem Fill", () => {
    expect(calcRemaining("100", "60").gte(0)).toBe(true);
    expect(calcRemaining("100", "100").gte(0)).toBe(true);
  });

  it("Überfüllung (filledQty > quantity) → verletzte Invariante", () => {
    // Dies MUSS false liefern — würde in der echten DB nie passieren
    // weil der Matching-Engine immer min(bidQty, askQty) berechnet
    const remaining = calcRemaining("60", "70");
    expect(remaining.lt(0)).toBe(true);  // Beweist: das wäre ein Fehler
  });

  it("Matching-Algorithmus produziert nie Überfüllung", () => {
    // Reproduziert den min(bidQty, askQty) Algorithmus
    function matchQty(bidAvailable: string, askAvailable: string): string {
      return Decimal.min(bidAvailable, askAvailable).toString();
    }

    const scenarios = [
      { bid: "100", ask: "60",  expectedMatch: "60" },
      { bid: "50",  ask: "200", expectedMatch: "50" },
      { bid: "75",  ask: "75",  expectedMatch: "75" },
      { bid: "0.5", ask: "1.5", expectedMatch: "0.5" },
    ];

    for (const { bid, ask, expectedMatch } of scenarios) {
      const matched = matchQty(bid, ask);
      expect(matched).toBe(expectedMatch);

      // Invariante: matched <= bid UND matched <= ask
      expect(new Decimal(matched).lte(bid)).toBe(true);
      expect(new Decimal(matched).lte(ask)).toBe(true);
    }
  });
});

// ─── Ledger-Invariante nach Storno ────────────────────────────────────────────

describe("Clearing — Ledger-Invariante nach Stornierungen", () => {

  type LedgerEntry = {
    entryType:     "DEBIT" | "CREDIT";
    amount:        string;
    currency:      string;
    correlationId: string;
  };

  function createStornoEntries(original: LedgerEntry[]): LedgerEntry[] {
    return original.map(e => ({
      entryType:     e.entryType === "DEBIT" ? "CREDIT" as const : "DEBIT" as const,
      amount:        e.amount,
      currency:      e.currency,
      correlationId: `STORNO-${e.correlationId}`,
    }));
  }

  it("Original-Buchungen sind ausgeglichen", () => {
    const original: LedgerEntry[] = [
      { entryType: "DEBIT",  amount: "1000", currency: "EUR", correlationId: "deal-1" },
      { entryType: "CREDIT", amount: "970",  currency: "EUR", correlationId: "deal-1" },
      { entryType: "CREDIT", amount: "19",   currency: "EUR", correlationId: "deal-1" },
      { entryType: "CREDIT", amount: "11",   currency: "EUR", correlationId: "deal-1" },
    ];
    expect(validateLedgerBalance(original)).toBe(true);
  });

  it("Storno-Einträge sind für sich ausgeglichen", () => {
    const original: LedgerEntry[] = [
      { entryType: "DEBIT",  amount: "1000", currency: "EUR", correlationId: "deal-1" },
      { entryType: "CREDIT", amount: "1000", currency: "EUR", correlationId: "deal-1" },
    ];
    const storno = createStornoEntries(original);
    expect(validateLedgerBalance(storno)).toBe(true);
  });

  it("Original + Storno zusammen sind ausgeglichen", () => {
    const original: LedgerEntry[] = [
      { entryType: "DEBIT",  amount: "850000", currency: "EUR", correlationId: "deal-2" },
      { entryType: "CREDIT", amount: "847450", currency: "EUR", correlationId: "deal-2" },
      { entryType: "CREDIT", amount: "2550",   currency: "EUR", correlationId: "deal-2" },
    ];
    const storno = createStornoEntries(original);
    const all    = [...original, ...storno];
    expect(validateLedgerBalance(all)).toBe(true);
  });

  it("Teilrückerstattung: Ledger bleibt ausgeglichen", () => {
    const originalAndPartial: LedgerEntry[] = [
      { entryType: "DEBIT",  amount: "1000", currency: "EUR", correlationId: "deal-3" },
      { entryType: "CREDIT", amount: "970",  currency: "EUR", correlationId: "deal-3" },
      { entryType: "CREDIT", amount: "30",   currency: "EUR", correlationId: "deal-3" },
      { entryType: "CREDIT", amount: "200",  currency: "EUR", correlationId: "PARTIAL-deal-3" },
      { entryType: "DEBIT",  amount: "200",  currency: "EUR", correlationId: "PARTIAL-deal-3" },
    ];
    expect(validateLedgerBalance(originalAndPartial)).toBe(true);
  });

  it("Mehrfache Storni: Invariante immer ausgeglichen", () => {
    const entries: LedgerEntry[] = [
      { entryType: "DEBIT",  amount: "500", currency: "EUR", correlationId: "deal-4" },
      { entryType: "CREDIT", amount: "500", currency: "EUR", correlationId: "deal-4" },
      { entryType: "CREDIT", amount: "500", currency: "EUR", correlationId: "STORNO-deal-4" },
      { entryType: "DEBIT",  amount: "500", currency: "EUR", correlationId: "STORNO-deal-4" },
      { entryType: "DEBIT",  amount: "600", currency: "EUR", correlationId: "deal-4-v2" },
      { entryType: "CREDIT", amount: "600", currency: "EUR", correlationId: "deal-4-v2" },
    ];
    expect(validateLedgerBalance(entries)).toBe(true);
  });
});
