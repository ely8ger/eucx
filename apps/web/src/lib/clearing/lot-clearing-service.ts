/**
 * EUCX Lot-Clearing-Service — 2-Phasen-Escrow für Lot-Auktionen
 *
 * Nutzt dieselbe Double-Entry-Infrastruktur wie clearing-service.ts,
 * aber ist an LotContract (Reverse-Auction-System) gebunden, nicht Deal.
 *
 * ─── Buchungsplan ────────────────────────────────────────────────────────────
 *
 * PHASE 1 — lockEscrowForLot() — aufgerufen von post-trade.ts bei CONCLUSION
 *
 *   Schritt 1a: Käufer-Wallet → Escrow (Bruttobetrag wird gesperrt)
 *     DEBIT  buyer_wallet   (Abgang; reservedBalance ↑)
 *     CREDIT ESCROW         (Eingang Treuhandkonto)
 *
 * PHASE 2 — settleEscrowForLot() — aufgerufen von delivery/route.ts bei COMPLETED
 *
 *   Schritt 2a: EUCX-Plattformgebühr
 *     DEBIT  ESCROW         (Fee-Abzug)
 *     CREDIT EUCX_FEE_REVENUE
 *
 *   Schritt 2b: MwSt. (nur wenn nicht Reverse Charge)
 *     DEBIT  ESCROW
 *     CREDIT VAT_PAYABLE
 *
 *   Schritt 2c: Netto an Verkäufer
 *     DEBIT  ESCROW
 *     CREDIT seller_wallet  (Zugang beim Verkäufer)
 *
 *   Schritt 2d: reservedBalance beim Käufer zurücksetzen
 *     → wallet.reservedBalance -= grossAmount
 *
 * ─── Idempotenz ──────────────────────────────────────────────────────────────
 *
 *   idempotencyKey-Format:
 *     Phase 1: "lot:{contractId}:p1:{DEBIT|CREDIT}"
 *     Phase 2: "lot:{contractId}:p2:{step}:{DEBIT|CREDIT}"
 *   → @unique auf LedgerEntry.idempotencyKey verhindert Doppelbuchung bei Retry
 *
 * ─── Atomizität ──────────────────────────────────────────────────────────────
 *
 *   Jede Phase läuft in einer einzigen Prisma-Transaktion (Serializable).
 *   Schlägt ein Schritt fehl → vollständiger Rollback der gesamten Phase.
 */

import Decimal                       from "decimal.js";
import { db }                        from "@/lib/db/client";
import { calculateFees }             from "./fee-calculator";
import { validateLedgerBalance }     from "./fee-calculator";
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

  // Deckungsprüfung: verfügbares Guthaben = balance - reservedBalance
  const available = new Decimal(buyerWallet.balance.toString())
    .minus(new Decimal(buyerWallet.reservedBalance.toString()));
  if (available.lt(gross)) {
    throw new Error(
      `Unzureichendes Wallet-Guthaben: verfügbar ${available.toFixed(2)} EUR, ` +
      `benötigt ${gross.toFixed(2)} EUR (LotContract ${lotContractId})`
    );
  }

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

  await db.$transaction(async (tx) => {
    await tx.ledgerEntry.createMany({ data: entries, skipDuplicates: true });
    await tx.wallet.update({
      where: { id: buyerWallet.id },
      data:  { reservedBalance: { increment: gross.toFixed(8) } },
    });
  }, { isolationLevel: "Serializable", maxWait: 8_000, timeout: 20_000 });
}

// ─── Phase 2: Finale Auszahlung bei Lieferbestätigung ────────────────────────

export interface LotSettlementResult {
  platformFee:     string;
  vatAmount:       string;
  netToSeller:     string;
  isReverseCharge: boolean;
  ledgerEntryCount: number;
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
    { correlationId: corrPayout, walletId: null,             accountType: "ESCROW",        entryType: "DEBIT",  amount: netSeller.toFixed(8), currency: "EUR", description: `Lot-Vertrag ${lotContractId}: Auszahlung Verkäufer`,  lotContractId, idempotencyKey: `lot:${lotContractId}:p2:payout:DEBIT`  },
    { correlationId: corrPayout, walletId: sellerWallet.id,  accountType: "TRADER_WALLET", entryType: "CREDIT", amount: netSeller.toFixed(8), currency: "EUR", description: `Lot-Vertrag ${lotContractId}: Nettogutschrift Verkäufer`, lotContractId, idempotencyKey: `lot:${lotContractId}:p2:payout:CREDIT` },
  );

  // Invariante prüfen: Phase 2 DEBIT == Phase 2 CREDIT
  // (ESCROW aus Phase 1 war gross; Phase 2 verteilt: fee + vat + net = gross)
  if (!validateLedgerBalance(entries.map((e) => ({ entryType: e.entryType as "DEBIT" | "CREDIT", amount: String(e.amount) })))) {
    throw new Error(`[LotClearing] Bilanzierungsfehler Phase 2 für ${lotContractId}`);
  }

  await db.$transaction(async (tx) => {
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
      where:  { contract: { id: lotContractId } },
      data:   { status: "PAID" },
    });
  }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 });

  return {
    platformFee:      fees.platformFee,
    vatAmount:        fees.vatAmount,
    netToSeller:      fees.netToSeller,
    isReverseCharge:  fees.isReverseCharge,
    ledgerEntryCount: entries.length,
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
