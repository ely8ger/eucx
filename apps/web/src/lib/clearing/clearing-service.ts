/**
 * EUCX ClearingService - Settlement & EUCX-interne Gebührenbuchung
 *
 * Wird aufgerufen wenn ein Deal STATUS = CONTRACT_SIGNED erreicht.
 *
 * EUCX hält KEINE Kundengelder (ZAG-Lizenz nicht erforderlich).
 * Käufer und Verkäufer zahlen/empfangen direkt per Banküberweisung.
 * Clearing = Vertragsabschluss + EUCX-Gebührenerfassung für eigene Bücher.
 *
 * ─── Buchungsplan (EUCX-interne Buchführung) ────────────────────────────────
 *
 *   Schritt 1: EUCX-Plattformgebühr erfassen
 *     CREDIT eucx_fee_revenue  (Gebühreneinnahme EUCX)
 *
 *   Schritt 2: MwSt.-Verbindlichkeit (nur Inland, sonst Reverse Charge)
 *     CREDIT vat_payable       (Finanzamt-Verbindlichkeit)
 *
 * ─── Idempotenz-Schutz ──────────────────────────────────────────────────────
 *
 *   idempotencyKey-Format: "deal:{dealId}:{schritt}"
 *   → @unique in DB → kein Retry erzeugt Doppelbuchung
 *
 * ─── Atomizität ─────────────────────────────────────────────────────────────
 *
 *   Settlement in EINER Prisma-Transaktion (Serializable Isolation).
 */

import Decimal    from "decimal.js";
import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import { calculateFees } from "./fee-calculator";
import { withSerializableRetry }               from "./serializable-retry";
import { audit }                               from "@/lib/audit/logger";
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
  try {
    return await _runSettlement(dealId);
  } catch (err) {
    // L8-Fix: Audit-Log bei Settlement-Fehler für Compliance und Nachvollziehbarkeit
    void audit({
      userId:     "system",
      action:     "ADMIN_ACTION",
      entityType: "Deal",
      entityId:   dealId,
      meta: {
        type:    "SETTLEMENT_FAILED",
        error:   err instanceof Error ? err.message : String(err),
        dealId,
      },
    });
    throw err;
  }
}

async function _runSettlement(dealId: string): Promise<SettlementResult> {
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

  // ── Rechnungsnummer generieren (UUID-basiert, keine Race Condition) ─────────
  const year = new Date().getFullYear();
  const uid  = () => randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const buyerInvoiceNumber  = `EUCX-INV-${year}-${uid()}`;
  const sellerCreditNumber  = `EUCX-GUT-${year}-${uid()}`;

  // ── PENDING-Record AUSSERHALB der TX ──────────────────────────────────────
  // Schlägt die TX fehl, bleibt dieser Record stehen → settlement-retry-Cron greift.
  // Der COMPLETED-Check oben stellt sicher, dass kein gültiger Record überschrieben wird.
  const pendingSettlement = await db.settlement.upsert({
    where:  { dealId },
    create: {
      dealId,
      status:      "PENDING",
      grossAmount: fees.grossAmount,
      platformFee: fees.platformFee,
      vatAmount:   fees.vatAmount,
      netToSeller: fees.netToSeller,
      currency:    deal.currency,
    },
    update: {
      status: "PENDING",
    },
    select: { id: true },
  });

  // ── Atomare Transaktion ────────────────────────────────────────────────────
  // L4-Fix: withSerializableRetry fängt P2034 (Serialization Failure) ab.
  const result = await withSerializableRetry(() => db.$transaction(async (tx) => {
    // 1. Settlement auf PROCESSING setzen (Record existiert bereits als PENDING)
    await tx.settlement.update({
      where: { id: pendingSettlement.id },
      data:  { status: "PROCESSING" },
    });

    // 2. EUCX-interne Gebührenbuchung (kein Kundengeldhaltung)
    const feeEntries = buildFeeEntries(dealId, fees, deal.currency);
    await tx.ledgerEntry.createMany({ data: feeEntries, skipDuplicates: true });

    // 3. Käufer-Rechnung erstellen (BUYER_INVOICE)
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
      where: { id: pendingSettlement.id },
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
      settlementId:     pendingSettlement.id,
      buyerInvoiceId:   buyerInvoice.id,
      sellerCreditId:   sellerCredit.id,
      ledgerEntryCount: feeEntries.length,
    };
  }, {
    // SERIALIZABLE: verhindert Phantom Reads bei parallelen Settlement-Jobs
    isolationLevel: "Serializable",
    maxWait: 10_000,
    timeout: 30_000,
  }));

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

function buildFeeEntries(dealId: string, fees: FeeCalculationResult, currency: Currency) {
  const { platformFee, vatAmount } = fees;
  const hasVat = new Decimal(vatAmount).gt(0);

  const entries: Array<{
    correlationId:  string;
    walletId:       null;
    accountType:    "EUCX_FEE_REVENUE" | "VAT_PAYABLE";
    entryType:      "CREDIT";
    amount:         string;
    currency:       Currency;
    description:    string;
    dealId:         string;
    idempotencyKey: string;
  }> = [];

  entries.push({
    correlationId:  `${dealId}:platform-fee`,
    walletId:       null,
    accountType:    "EUCX_FEE_REVENUE",
    entryType:      "CREDIT",
    amount:         platformFee,
    currency,
    description:    `Deal ${dealId}: EUCX-Gebühr ${fees.feeRatePct}`,
    dealId,
    idempotencyKey: `deal:${dealId}:platform-fee:CREDIT`,
  });

  if (hasVat) {
    entries.push({
      correlationId:  `${dealId}:vat`,
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

  return entries;
}
