/**
 * EUCX Lot-Clearing-Service - 2-Phasen-Escrow für Lot-Auktionen
 *
 * ─── Buchungsplan ────────────────────────────────────────────────────────────
 *
 * PHASE 1 - lockEscrowForLot() - aufgerufen von post-trade.ts bei CONCLUSION
 *
 *   Schritt 1a: Käufer-Wallet → Escrow
 *     DEBIT  buyer_wallet   (reservedBalance ↑)
 *     CREDIT ESCROW
 *
 * PHASE 2 - settleEscrowForLot() - aufgerufen bei COMPLETED
 *
 *   2a: EUCX-Gebühr
 *     DEBIT  ESCROW → CREDIT EUCX_FEE_REVENUE
 *
 *   2b: MwSt. (nur Inlandsgeschäft)
 *     DEBIT  ESCROW → CREDIT VAT_PAYABLE
 *
 *   2c: Netto an Verkäufer
 *     DEBIT  ESCROW → CREDIT seller_wallet
 *
 *   2d: reservedBalance Käufer auflösen
 *
 *   2e: Käufer-Rechnung (BUYER_INVOICE) + Verkäufer-Gutschrift (SELLER_CREDIT) erstellen
 *
 * ─── Idempotenz ──────────────────────────────────────────────────────────────
 *
 *   idempotencyKey-Format:
 *     Phase 1: "lot:{contractId}:p1:{DEBIT|CREDIT}"
 *     Phase 2: "lot:{contractId}:p2:{step}:{DEBIT|CREDIT}"
 *
 * ─── Atomizität ──────────────────────────────────────────────────────────────
 *
 *   Jede Phase läuft in einer einzigen Prisma-Transaktion (Serializable).
 *   PENDING-Record wird VOR der TX erstellt → Retry-Cron greift bei TX-Fehler.
 */

import Decimal                       from "decimal.js";
import { randomUUID }                from "crypto";
import { db }                        from "@/lib/db/client";
import { calculateFees }             from "./fee-calculator";
import { validateLedgerBalance }     from "./fee-calculator";
import { withSerializableRetry }     from "./serializable-retry";
import type { Currency, Prisma }     from "@prisma/client";

// ─── Phase 1: Escrow-Sperre bei Zuschlag ─────────────────────────────────────

export async function lockEscrowForLot(lotContractId: string): Promise<void> {
  // Idempotenz: bereits gebucht?
  const existing = await db.ledgerEntry.findFirst({
    where: { lotContractId, idempotencyKey: { startsWith: `lot:${lotContractId}:p1:` } },
    select: { id: true },
  });
  if (existing) return;

  const contract = await db.lotContract.findUnique({
    where:  { id: lotContractId },
    select: {
      id:         true,
      buyerId:    true,
      totalValue: true,
      buyer: { select: { organizationId: true } },
    },
  });
  if (!contract) throw new Error(`LotContract ${lotContractId} nicht gefunden`);

  const gross       = new Decimal(contract.totalValue.toString());
  const buyerWallet = await getOrCreateWalletByUser(contract.buyerId, contract.buyer.organizationId, "EUR");

  const correlationId = `lot:${lotContractId}:escrow-lock`;

  const entries = [
    {
      correlationId,
      walletId:       buyerWallet.id,
      accountType:    "TRADER_WALLET" as const,
      entryType:      "DEBIT" as const,
      amount:         gross.toFixed(8),
      currency:       "EUR" as Currency,
      description:    `Lot-Vertrag ${lotContractId}: Escrow-Sperre Käufer`,
      lotContractId,
      idempotencyKey: `lot:${lotContractId}:p1:DEBIT`,
    },
    {
      correlationId,
      walletId:       null,
      accountType:    "ESCROW" as const,
      entryType:      "CREDIT" as const,
      amount:         gross.toFixed(8),
      currency:       "EUR" as Currency,
      description:    `Lot-Vertrag ${lotContractId}: Eingang Treuhandkonto`,
      lotContractId,
      idempotencyKey: `lot:${lotContractId}:p1:CREDIT`,
    },
  ];

  if (!validateLedgerBalance(entries.map((e) => ({ entryType: e.entryType, amount: e.amount })))) {
    throw new Error(`[LotClearing] Bilanzierungsfehler Phase 1 für ${lotContractId}`);
  }

  // L2-Fix: Deckungsprüfung INNERHALB der Serializable-Transaktion —
  // verhindert TOCTOU zwischen Balance-Check und Wallet-Update.
  await withSerializableRetry(() =>
    db.$transaction(async (tx) => {
      const wallet  = await tx.wallet.findUniqueOrThrow({ where: { id: buyerWallet.id } });
      const avail   = new Decimal(wallet.balance.toString())
        .minus(new Decimal(wallet.reservedBalance.toString()));
      if (avail.lt(gross)) {
        throw new Error(
          `Unzureichendes Wallet-Guthaben: verfügbar ${avail.toFixed(2)} EUR, ` +
          `benötigt ${gross.toFixed(2)} EUR (LotContract ${lotContractId})`
        );
      }
      await tx.ledgerEntry.createMany({ data: entries, skipDuplicates: true });
      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data:  { reservedBalance: { increment: gross.toFixed(8) } },
      });
    }, { isolationLevel: "Serializable", maxWait: 8_000, timeout: 20_000 })
  );
}

// ─── Phase 2: Finale Auszahlung bei Lieferbestätigung ────────────────────────

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
  // Idempotenz: Phase 2 bereits abgeschlossen?
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
    update: {
      status: "PENDING",
    },
  });

  const contract = await db.lotContract.findUnique({
    where:  { id: lotContractId },
    select: {
      id:         true,
      buyerId:    true,
      sellerId:   true,
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

  const gross      = new Decimal(fees.grossAmount);
  const feeAmt     = new Decimal(fees.platformFee);
  const vatAmt     = new Decimal(fees.vatAmount);
  const netSeller  = new Decimal(fees.netToSeller);
  const hasVat     = vatAmt.gt(0);

  const [buyerWallet, sellerWallet] = await Promise.all([
    getOrCreateWalletByUser(contract.buyerId,  contract.buyer.organizationId,  "EUR"),
    getOrCreateWalletByUser(contract.sellerId, contract.seller.organizationId, "EUR"),
  ]);

  // Rechnungsnummer UUID-basiert (keine Race Condition)
  const year = new Date().getFullYear();
  const uid  = () => randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const buyerInvoiceNumber = `EUCX-INV-${year}-${uid()}`;
  const sellerCreditNumber = `EUCX-GUT-${year}-${uid()}`;

  const corrFee    = `lot:${lotContractId}:fee`;
  const corrVat    = `lot:${lotContractId}:vat`;
  const corrPayout = `lot:${lotContractId}:payout`;

  const entries: Prisma.LedgerEntryCreateManyInput[] = [];

  // 2a: Plattformgebühr
  entries.push(
    { correlationId: corrFee, walletId: null,            accountType: "ESCROW",           entryType: "DEBIT",  amount: feeAmt.toFixed(8),    currency: "EUR", description: `Lot-Vertrag ${lotContractId}: EUCX-Gebühr ${fees.feeRatePct}`, lotContractId, idempotencyKey: `lot:${lotContractId}:p2:fee:DEBIT`  },
    { correlationId: corrFee, walletId: null,            accountType: "EUCX_FEE_REVENUE", entryType: "CREDIT", amount: feeAmt.toFixed(8),    currency: "EUR", description: `Lot-Vertrag ${lotContractId}: EUCX-Gebührenkonto`,              lotContractId, idempotencyKey: `lot:${lotContractId}:p2:fee:CREDIT` },
  );

  // 2b: MwSt. (nur Inlandsgeschäft)
  if (hasVat) {
    entries.push(
      { correlationId: corrVat, walletId: null, accountType: "ESCROW",      entryType: "DEBIT",  amount: vatAmt.toFixed(8), currency: "EUR", description: `Lot-Vertrag ${lotContractId}: MwSt. ${fees.vatRate}%`,  lotContractId, idempotencyKey: `lot:${lotContractId}:p2:vat:DEBIT`  },
      { correlationId: corrVat, walletId: null, accountType: "VAT_PAYABLE", entryType: "CREDIT", amount: vatAmt.toFixed(8), currency: "EUR", description: `Lot-Vertrag ${lotContractId}: MwSt. ${fees.taxNote}`,    lotContractId, idempotencyKey: `lot:${lotContractId}:p2:vat:CREDIT` },
    );
  }

  // 2c: Netto-Auszahlung an Verkäufer
  entries.push(
    { correlationId: corrPayout, walletId: null,             accountType: "ESCROW",        entryType: "DEBIT",  amount: netSeller.toFixed(8), currency: "EUR", description: `Lot-Vertrag ${lotContractId}: Auszahlung Verkäufer`,     lotContractId, idempotencyKey: `lot:${lotContractId}:p2:payout:DEBIT`  },
    { correlationId: corrPayout, walletId: sellerWallet.id,  accountType: "TRADER_WALLET", entryType: "CREDIT", amount: netSeller.toFixed(8), currency: "EUR", description: `Lot-Vertrag ${lotContractId}: Nettogutschrift Verkäufer`, lotContractId, idempotencyKey: `lot:${lotContractId}:p2:payout:CREDIT` },
  );

  // L1-Fix: ESCROW-Invariante — Phase 2 muss exakt den Phase-1-Eingang verteilen.
  const escrowDistribution = feeAmt.plus(vatAmt).plus(netSeller);
  if (!escrowDistribution.equals(gross)) {
    throw new Error(
      `[LotClearing] ESCROW-Invariante verletzt: fee(${feeAmt.toFixed(8)}) + ` +
      `vat(${vatAmt.toFixed(8)}) + net(${netSeller.toFixed(8)}) = ` +
      `${escrowDistribution.toFixed(8)} ≠ gross(${gross.toFixed(8)})`
    );
  }

  if (!validateLedgerBalance(entries.map((e) => ({ entryType: e.entryType as "DEBIT" | "CREDIT", amount: String(e.amount) })))) {
    throw new Error(`[LotClearing] Bilanzierungsfehler Phase 2 für ${lotContractId}`);
  }

  const txResult = await withSerializableRetry(() =>
    db.$transaction(async (tx) => {
      // LedgerEntries buchen
      await tx.ledgerEntry.createMany({ data: entries, skipDuplicates: true });

      // Verkäufer erhält Netto
      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data:  { balance: { increment: netSeller.toFixed(8) } },
      });

      // Käufer: Escrow-Reserve auflösen
      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data:  { reservedBalance: { decrement: gross.toFixed(8) } },
      });

      // LotFees auf PAID setzen
      await tx.lotFee.updateMany({
        where: { contract: { id: lotContractId } },
        data:  { status: "PAID" },
      });

      // Settlement PENDING → COMPLETED
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

      // Käufer-Rechnung (BUYER_INVOICE) — Verkäufer stellt aus
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

      // Verkäufer-Gutschrift (SELLER_CREDIT) — Käufer stellt aus
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

// ─── Hilfsfunktion ────────────────────────────────────────────────────────────

async function getOrCreateWalletByUser(
  _userId:        string,
  organizationId: string,
  currency:       string,
) {
  return db.wallet.upsert({
    where:  { organizationId },
    create: { organizationId, currency: currency as Currency, balance: "0", reservedBalance: "0" },
    update: {},
    select: { id: true, balance: true, reservedBalance: true },
  });
}
