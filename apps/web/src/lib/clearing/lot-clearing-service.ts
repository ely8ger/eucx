/**
 * EUCX Lot-Clearing-Service — EUCX-interne Gebührenbuchung für Lot-Auktionen
 *
 * EUCX hält KEINE Kundengelder (ZAG-Lizenz nicht erforderlich).
 * Käufer und Verkäufer zahlen/empfangen direkt per Banküberweisung.
 *
 * lockEscrowForLot() — kein Escrow mehr, no-op
 * settleEscrowForLot() — bucht nur EUCX-Gebühren + MwSt. in eigene Bücher
 */

import Decimal                   from "decimal.js";
import { randomUUID }            from "crypto";
import { db }                    from "@/lib/db/client";
import { calculateFees }         from "./fee-calculator";
import { withSerializableRetry } from "./serializable-retry";
import type { Currency }         from "@prisma/client";

// ─── Phase 1: kein Escrow mehr ────────────────────────────────────────────────

export async function lockEscrowForLot(_lotContractId: string): Promise<void> {
  // ZAG: keine Kundengeldhaltung — kein Escrow, kein Wallet-Debit
  return;
}

// ─── Phase 2: Gebührenerfassung bei Lieferbestätigung ────────────────────────

export interface LotSettlementResult {
  platformFee:      string;
  vatAmount:        string;
  netToSeller:      string;
  isReverseCharge:  boolean;
  ledgerEntryCount: number;
  buyerInvoiceId:   string;
  sellerCreditId:   string;
}

export async function settleEscrowForLot(
  lotContractId: string,
): Promise<LotSettlementResult> {
  // Idempotenz: bereits abgeschlossen?
  const existingP2 = await db.ledgerEntry.findFirst({
    where: { lotContractId, idempotencyKey: { startsWith: `lot:${lotContractId}:p2:` } },
    select: { id: true },
  });
  if (existingP2) throw new Error(`Settlement für LotContract ${lotContractId} bereits abgeschlossen`);

  // PENDING-Record AUSSERHALB der TX — bei TX-Fehler bleibt PENDING stehen → Retry-Cron greift
  await db.settlement.upsert({
    where:  { lotContractId },
    create: {
      lotContractId,
      status:      "PENDING",
      grossAmount: "0",
      platformFee: "0",
      vatAmount:   "0",
      netToSeller: "0",
      currency:    "EUR",
    },
    update: { status: "PENDING" },
  });

  const contract = await db.lotContract.findUnique({
    where:  { id: lotContractId },
    select: {
      id:         true,
      totalValue: true,
      buyer: {
        select: {
          organizationId: true,
          organization: { select: { country: true, taxId: true } },
        },
      },
      seller: {
        select: {
          organizationId: true,
          organization: { select: { country: true, taxId: true } },
        },
      },
    },
  });
  if (!contract) throw new Error(`LotContract ${lotContractId} nicht gefunden`);

  const buyerOrg  = contract.buyer.organization;
  const sellerOrg = contract.seller.organization;

  const fees = calculateFees({
    grossAmount:   contract.totalValue.toString(),
    currency:      "EUR",
    buyerCountry:  buyerOrg?.country ?? "DE",
    sellerCountry: sellerOrg?.country ?? "DE",
    buyerTaxId:    buyerOrg?.taxId   ?? undefined,
    sellerTaxId:   sellerOrg?.taxId  ?? undefined,
  });

  const feeAmt = new Decimal(fees.platformFee);
  const vatAmt = new Decimal(fees.vatAmount);
  const hasVat = vatAmt.gt(0);

  // Rechnungsnummer UUID-basiert (keine Race Condition)
  const year = new Date().getFullYear();
  const uid  = () => randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const buyerInvoiceNumber = `EUCX-INV-${year}-${uid()}`;
  const sellerCreditNumber = `EUCX-GUT-${year}-${uid()}`;

  // Nur EUCX-interne Gebührenbuchungen
  const entries: Array<{
    correlationId:  string;
    walletId:       null;
    accountType:    "EUCX_FEE_REVENUE" | "VAT_PAYABLE";
    entryType:      "CREDIT";
    amount:         string;
    currency:       Currency;
    description:    string;
    lotContractId:  string;
    idempotencyKey: string;
  }> = [
    {
      correlationId:  `lot:${lotContractId}:fee`,
      walletId:       null,
      accountType:    "EUCX_FEE_REVENUE",
      entryType:      "CREDIT",
      amount:         feeAmt.toFixed(8),
      currency:       "EUR" as Currency,
      description:    `Lot-Vertrag ${lotContractId}: EUCX-Gebühr ${fees.feeRatePct}`,
      lotContractId,
      idempotencyKey: `lot:${lotContractId}:p2:fee:CREDIT`,
    },
  ];

  if (hasVat) {
    entries.push({
      correlationId:  `lot:${lotContractId}:vat`,
      walletId:       null,
      accountType:    "VAT_PAYABLE",
      entryType:      "CREDIT",
      amount:         vatAmt.toFixed(8),
      currency:       "EUR" as Currency,
      description:    `Lot-Vertrag ${lotContractId}: MwSt. ${fees.taxNote}`,
      lotContractId,
      idempotencyKey: `lot:${lotContractId}:p2:vat:CREDIT`,
    });
  }

  const txResult = await withSerializableRetry(() =>
    db.$transaction(async (tx) => {
      await tx.ledgerEntry.createMany({ data: entries, skipDuplicates: true });

      await tx.lotFee.updateMany({
        where: { contract: { id: lotContractId } },
        data:  { status: "PAID" },
      });

      const now   = new Date();
      const dueAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await tx.settlement.update({
        where: { lotContractId },
        data:  {
          status:       "COMPLETED",
          grossAmount:  fees.grossAmount,
          platformFee:  fees.platformFee,
          vatAmount:    fees.vatAmount,
          netToSeller:  fees.netToSeller,
          currency:     "EUR",
          processedAt:  now,
          errorMessage: null,
        },
      });

      const buyerInvoice = await tx.invoice.create({
        data: {
          invoiceNumber:   buyerInvoiceNumber,
          type:            "BUYER_INVOICE",
          status:          "ISSUED",
          lotContractId,
          issuerId:        contract.seller.organizationId,
          recipientId:     contract.buyer.organizationId,
          grossAmount:     fees.grossAmount,
          platformFee:     fees.platformFee,
          vatAmount:       fees.vatAmount,
          vatRate:         fees.vatRate,
          netPayable:      fees.netPayable,
          currency:        "EUR",
          isReverseCharge: fees.isReverseCharge,
          buyerTaxId:      buyerOrg?.taxId    ?? null,
          sellerTaxId:     sellerOrg?.taxId   ?? null,
          buyerCountry:    buyerOrg?.country  ?? null,
          sellerCountry:   sellerOrg?.country ?? null,
          issuedAt:        now,
          dueAt,
        },
      });

      const sellerCredit = await tx.invoice.create({
        data: {
          invoiceNumber:   sellerCreditNumber,
          type:            "SELLER_CREDIT",
          status:          "ISSUED",
          lotContractId,
          issuerId:        contract.buyer.organizationId,
          recipientId:     contract.seller.organizationId,
          grossAmount:     fees.grossAmount,
          platformFee:     fees.platformFee,
          vatAmount:       fees.vatAmount,
          vatRate:         fees.vatRate,
          netPayable:      fees.netToSeller,
          currency:        "EUR",
          isReverseCharge: fees.isReverseCharge,
          buyerTaxId:      buyerOrg?.taxId    ?? null,
          sellerTaxId:     sellerOrg?.taxId   ?? null,
          buyerCountry:    buyerOrg?.country  ?? null,
          sellerCountry:   sellerOrg?.country ?? null,
          issuedAt:        now,
        },
      });

      return { buyerInvoiceId: buyerInvoice.id, sellerCreditId: sellerCredit.id };
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 })
  );

  return {
    platformFee:      fees.platformFee,
    vatAmount:        fees.vatAmount,
    netToSeller:      fees.netToSeller,
    isReverseCharge:  fees.isReverseCharge,
    ledgerEntryCount: entries.length,
    buyerInvoiceId:   txResult.buyerInvoiceId,
    sellerCreditId:   txResult.sellerCreditId,
  };
}
