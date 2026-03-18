/**
 * EUCX ClearingService - Double-Entry Buchführung & Financial Settlement
 *
 * Wird aufgerufen wenn ein Deal STATUS = CONTRACT_SIGNED erreicht.
 *
 * ─── Buchungsplan (4 Buchungssätze, 8 LedgerEntries) ────────────────────────
 *
 *   Schritt 1: Käufer überweist Bruttobetrag
 *     DEBIT  buyer_wallet   (Abgang beim Käufer)
 *     CREDIT escrow         (Treuhandkonto empfängt)
 *
 *   Schritt 2: EUCX zieht Plattformgebühr
 *     DEBIT  escrow         (Fee-Abzug)
 *     CREDIT eucx_revenue   (EUCX-Konto empfängt)
 *
 *   Schritt 3: MwSt. wird abgeführt (nur bei Inland, sonst 0 → kein Eintrag)
 *     DEBIT  escrow         (MwSt.-Abzug)
 *     CREDIT vat_payable    (Finanzamt-Verbindlichkeit)
 *
 *   Schritt 4: Verkäufer erhält Nettoerlös
 *     DEBIT  escrow         (Auszahlung)
 *     CREDIT seller_wallet  (Zugang beim Verkäufer)
 *
 * ─── Idempotenz-Schutz ──────────────────────────────────────────────────────
 *
 *   Jeder LedgerEntry bekommt einen eindeutigen idempotencyKey:
 *     "deal:{dealId}:{schritt}:{DEBIT|CREDIT}"
 *   → @unique in DB garantiert: kein Retry erzeugt Doppelbuchung
 *
 * ─── Atomizität ─────────────────────────────────────────────────────────────
 *
 *   Gesamter Settlement in EINER Prisma-Transaktion (serializable isolation).
 *   Schlägt irgendein Schritt fehl → vollständiger Rollback.
 */

import Decimal from "decimal.js";
import { db } from "@/lib/db/client";
import { calculateFees, validateLedgerBalance } from "./fee-calculator";
import type { FeeCalculationResult } from "./fee-calculator";
import type { Currency } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SettlementResult {
  settlementId:  string;
  dealId:        string;
  grossAmount:   string;
  platformFee:   string;
  vatAmount:     string;
  netToSeller:   string;
  isReverseCharge: boolean;
  buyerInvoiceId:  string;
  sellerCreditId:  string;
  ledgerEntryCount: number;
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export async function runSettlement(dealId: string): Promise<SettlementResult> {
  // ── Deal laden ─────────────────────────────────────────────────────────────
  const deal = await db.deal.findUnique({
    where:   { id: dealId },
    include: {
      sellerOrg: true,
      buyerOrg:  true,
      settlement: true,
    },
  });

  if (!deal) {
    throw new Error(`Deal ${dealId} nicht gefunden`);
  }

  if (deal.status !== "CONTRACT_SIGNED") {
    throw new Error(
      `Deal ${dealId} hat Status ${deal.status} - nur CONTRACT_SIGNED kann gecleart werden`
    );
  }

  // ── Idempotenz: Settlement bereits abgeschlossen? ──────────────────────────
  if (deal.settlement?.status === "COMPLETED") {
    throw new Error(`Settlement für Deal ${dealId} bereits abgeschlossen`);
  }

  // ── Gebühren berechnen ─────────────────────────────────────────────────────
  const fees = calculateFees({
    grossAmount:   deal.totalValue.toString(),
    currency:      deal.currency,
    buyerCountry:  deal.buyerOrg.country,
    sellerCountry: deal.sellerOrg.country,
    buyerTaxId:    deal.buyerOrg.taxId,
    sellerTaxId:   deal.sellerOrg.taxId,
  });

  // ── Wallets holen / erstellen ──────────────────────────────────────────────
  const [buyerWallet, sellerWallet] = await Promise.all([
    getOrCreateWallet(deal.buyerOrgId,  deal.currency),
    getOrCreateWallet(deal.sellerOrgId, deal.currency),
  ]);

  // ── Rechnungsnummer generieren ─────────────────────────────────────────────
  const year = new Date().getFullYear();
  const invoiceCount = await db.invoice.count();
  const seq = String(invoiceCount + 1).padStart(6, "0");
  const buyerInvoiceNumber  = `EUCX-INV-${year}-${seq}`;
  const sellerCreditNumber  = `EUCX-GUT-${year}-${seq}`;

  // ── Atomare Transaktion ────────────────────────────────────────────────────
  const result = await db.$transaction(async (tx) => {
    // 1. Settlement-Datensatz anlegen / auf PROCESSING setzen
    const settlement = await tx.settlement.upsert({
      where:  { dealId },
      create: {
        dealId,
        status:       "PROCESSING",
        grossAmount:  fees.grossAmount,
        platformFee:  fees.platformFee,
        vatAmount:    fees.vatAmount,
        netToSeller:  fees.netToSeller,
        currency:     deal.currency,
      },
      update: {
        status: "PROCESSING",
      },
    });

    // 2. LedgerEntries - 4 Buchungssätze (8 Einträge)
    const entries = buildLedgerEntries(
      dealId,
      settlement.id,
      fees,
      deal.currency,
      buyerWallet.id,
      sellerWallet.id,
    );

    await tx.ledgerEntry.createMany({
      data:          entries,
      skipDuplicates: true,  // Idempotenz: @unique(idempotencyKey) schlägt fehlt, skip
    });

    // Bilanzprüfung - DEBIT == CREDIT Invariante
    const balance = validateLedgerBalance(entries.map((e) => ({
      entryType: e.entryType,
      amount:    e.amount,
    })));
    if (!balance) {
      throw new Error("Bilanzierungsfehler: DEBIT ≠ CREDIT - Transaktion abgebrochen");
    }

    // 3. Wallet-Salden aktualisieren
    const grossDec = new Decimal(fees.grossAmount);
    const feeDec   = new Decimal(fees.platformFee);
    const netDec   = new Decimal(fees.netToSeller);

    await tx.wallet.update({
      where: { id: buyerWallet.id },
      data:  { balance: { decrement: grossDec.toFixed(8) } },
    });

    await tx.wallet.update({
      where: { id: sellerWallet.id },
      data:  { balance: { increment: netDec.toFixed(8) } },
    });

    // 4. Käufer-Rechnung erstellen (BUYER_INVOICE)
    const now      = new Date();
    const dueAt    = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // +30 Tage

    const buyerInvoice = await tx.invoice.create({
      data: {
        invoiceNumber:  buyerInvoiceNumber,
        type:           "BUYER_INVOICE",
        status:         "ISSUED",
        dealId,
        issuerId:       deal.sellerOrgId,   // Verkäufer stellt Rechnung aus
        recipientId:    deal.buyerOrgId,
        grossAmount:    fees.grossAmount,
        platformFee:    fees.platformFee,
        vatAmount:      fees.vatAmount,
        vatRate:        fees.vatRate,
        netPayable:     fees.netPayable,
        currency:       deal.currency,
        isReverseCharge: fees.isReverseCharge,
        buyerTaxId:     deal.buyerOrg.taxId,
        sellerTaxId:    deal.sellerOrg.taxId,
        buyerCountry:   deal.buyerOrg.country,
        sellerCountry:  deal.sellerOrg.country,
        issuedAt:       now,
        dueAt,
      },
    });

    // 5. Verkäufer-Gutschrift erstellen (SELLER_CREDIT)
    const sellerCredit = await tx.invoice.create({
      data: {
        invoiceNumber:  sellerCreditNumber,
        type:           "SELLER_CREDIT",
        status:         "ISSUED",
        dealId,
        issuerId:       deal.buyerOrgId,    // Käufer stellt Gutschrift aus
        recipientId:    deal.sellerOrgId,
        grossAmount:    fees.grossAmount,
        platformFee:    fees.platformFee,
        vatAmount:      fees.vatAmount,
        vatRate:        fees.vatRate,
        netPayable:     fees.netToSeller,   // Verkäufer erhält Netto
        currency:       deal.currency,
        isReverseCharge: fees.isReverseCharge,
        buyerTaxId:     deal.buyerOrg.taxId,
        sellerTaxId:    deal.sellerOrg.taxId,
        buyerCountry:   deal.buyerOrg.country,
        sellerCountry:  deal.sellerOrg.country,
        issuedAt:       now,
      },
    });

    // 6. Settlement abschließen
    await tx.settlement.update({
      where: { id: settlement.id },
      data:  {
        status:      "COMPLETED",
        processedAt: now,
      },
    });

    // 7. Deal-Status: SETTLEMENT_COMPLETE
    await tx.deal.update({
      where: { id: dealId },
      data:  { status: "SETTLEMENT_COMPLETE" },
    });

    return {
      settlementId:     settlement.id,
      buyerInvoiceId:   buyerInvoice.id,
      sellerCreditId:   sellerCredit.id,
      ledgerEntryCount: entries.length,
    };
  }, {
    // SERIALIZABLE: verhindert Phantom Reads bei parallelen Settlement-Jobs
    isolationLevel: "Serializable",
    maxWait: 10_000,
    timeout: 30_000,
  });

  return {
    settlementId:      result.settlementId,
    dealId,
    grossAmount:       fees.grossAmount,
    platformFee:       fees.platformFee,
    vatAmount:         fees.vatAmount,
    netToSeller:       fees.netToSeller,
    isReverseCharge:   fees.isReverseCharge,
    buyerInvoiceId:    result.buyerInvoiceId,
    sellerCreditId:    result.sellerCreditId,
    ledgerEntryCount:  result.ledgerEntryCount,
  };
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

async function getOrCreateWallet(organizationId: string, currency: Currency) {
  return db.wallet.upsert({
    where:  { organizationId },
    create: { organizationId, currency, balance: "0", reservedBalance: "0" },
    update: {},
  });
}

/**
 * Erstellt alle 8 LedgerEntries für einen Settlement-Zyklus.
 *
 * Buchungssatz-Struktur:
 *   correlationId = shared UUID pro Buchungssatz (DEBIT + CREDIT teilen sich eine)
 *   idempotencyKey = eindeutig pro Entry → @unique verhindert Doppelbuchung
 */
function buildLedgerEntries(
  dealId:       string,
  settlementId: string,
  fees:         FeeCalculationResult,
  currency:     Currency,
  buyerWalletId:  string,
  sellerWalletId: string,
) {
  const { grossAmount, platformFee, vatAmount, netToSeller } = fees;

  // Korrelations-IDs für die 4 Buchungssätze
  const corrBuyer   = `${dealId}:buyer-payment`;
  const corrFee     = `${dealId}:platform-fee`;
  const corrVat     = `${dealId}:vat`;
  const corrSeller  = `${dealId}:seller-payout`;

  const vatDec = new Decimal(vatAmount);
  const hasVat = vatDec.gt(0);

  const entries: Array<{
    correlationId:  string;
    walletId:       string | null;
    accountType:    "TRADER_WALLET" | "ESCROW" | "EUCX_FEE_REVENUE" | "VAT_PAYABLE";
    entryType:      "DEBIT" | "CREDIT";
    amount:         string;
    currency:       Currency;
    description:    string;
    dealId:         string;
    idempotencyKey: string;
  }> = [];

  // ── Schritt 1: Käufer zahlt Brutto ────────────────────────────────────────
  entries.push({
    correlationId:  corrBuyer,
    walletId:       buyerWalletId,
    accountType:    "TRADER_WALLET",
    entryType:      "DEBIT",
    amount:         grossAmount,
    currency,
    description:    `Deal ${dealId}: Bruttobetrag Käufer`,
    dealId,
    idempotencyKey: `deal:${dealId}:buyer-payment:DEBIT`,
  });
  entries.push({
    correlationId:  corrBuyer,
    walletId:       null,
    accountType:    "ESCROW",
    entryType:      "CREDIT",
    amount:         grossAmount,
    currency,
    description:    `Deal ${dealId}: Eingang Treuhandkonto`,
    dealId,
    idempotencyKey: `deal:${dealId}:buyer-payment:CREDIT`,
  });

  // ── Schritt 2: EUCX-Plattformgebühr ───────────────────────────────────────
  entries.push({
    correlationId:  corrFee,
    walletId:       null,
    accountType:    "ESCROW",
    entryType:      "DEBIT",
    amount:         platformFee,
    currency,
    description:    `Deal ${dealId}: EUCX-Gebühr ${fees.feeRatePct}`,
    dealId,
    idempotencyKey: `deal:${dealId}:platform-fee:DEBIT`,
  });
  entries.push({
    correlationId:  corrFee,
    walletId:       null,
    accountType:    "EUCX_FEE_REVENUE",
    entryType:      "CREDIT",
    amount:         platformFee,
    currency,
    description:    `Deal ${dealId}: EUCX-Gebührenkonto`,
    dealId,
    idempotencyKey: `deal:${dealId}:platform-fee:CREDIT`,
  });

  // ── Schritt 3: MwSt. (nur wenn nicht Reverse Charge) ──────────────────────
  if (hasVat) {
    entries.push({
      correlationId:  corrVat,
      walletId:       null,
      accountType:    "ESCROW",
      entryType:      "DEBIT",
      amount:         vatAmount,
      currency,
      description:    `Deal ${dealId}: MwSt. ${fees.vatRate}%`,
      dealId,
      idempotencyKey: `deal:${dealId}:vat:DEBIT`,
    });
    entries.push({
      correlationId:  corrVat,
      walletId:       null,
      accountType:    "VAT_PAYABLE",
      entryType:      "CREDIT",
      amount:         vatAmount,
      currency,
      description:    `Deal ${dealId}: MwSt.-Verbindlichkeit ${fees.taxNote}`,
      dealId,
      idempotencyKey: `deal:${dealId}:vat:CREDIT`,
    });
  }

  // ── Schritt 4: Verkäufer erhält Nettobetrag ────────────────────────────────
  entries.push({
    correlationId:  corrSeller,
    walletId:       null,
    accountType:    "ESCROW",
    entryType:      "DEBIT",
    amount:         netToSeller,
    currency,
    description:    `Deal ${dealId}: Auszahlung an Verkäufer`,
    dealId,
    idempotencyKey: `deal:${dealId}:seller-payout:DEBIT`,
  });
  entries.push({
    correlationId:  corrSeller,
    walletId:       sellerWalletId,
    accountType:    "TRADER_WALLET",
    entryType:      "CREDIT",
    amount:         netToSeller,
    currency,
    description:    `Deal ${dealId}: Nettogutschrift Verkäufer`,
    dealId,
    idempotencyKey: `deal:${dealId}:seller-payout:CREDIT`,
  });

  return entries;
}
