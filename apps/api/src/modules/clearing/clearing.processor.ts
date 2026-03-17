/**
 * EUCX ClearingProcessor — BullMQ Worker für INVOICE_GENERATION
 *
 * Läuft im NestJS-Backend (VPS / Docker), verarbeitet Jobs asynchron.
 *
 * Job-Typen:
 *   INVOICE_GENERATION — vollständiges Settlement für einen CONTRACT_SIGNED Deal
 *
 * Fehlerbehandlung:
 *   BullMQ führt automatisch 3 Retries mit exponential backoff durch.
 *   Bei permanentem Fehler → Settlement.status = FAILED + Fehlermeldung in DB.
 *
 * Idempotenz:
 *   LedgerEntry.idempotencyKey @unique — Retry führt nie zur Doppelbuchung.
 *   Settlement.status COMPLETED → frühzeitiger Abbruch ohne Fehler.
 */

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger }                 from "@nestjs/common";
import { Job }                    from "bullmq";
import { PrismaService }          from "../../config/prisma.service";
import { AuditService }           from "../audit/audit.service";
import Decimal                    from "decimal.js";

export const INVOICE_GENERATION_QUEUE = "INVOICE_GENERATION";

interface InvoiceGenerationJobData {
  dealId:     string;
  triggeredBy: string;   // userId der den Job ausgelöst hat
  triggeredAt: string;   // ISO timestamp
}

@Processor(INVOICE_GENERATION_QUEUE)
export class ClearingProcessor extends WorkerHost {
  private readonly logger = new Logger(ClearingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {
    super();
  }

  async process(job: Job<InvoiceGenerationJobData>): Promise<void> {
    const { dealId, triggeredBy } = job.data;

    this.logger.log(`Starte Settlement für Deal ${dealId} (Job-ID: ${job.id})`);

    try {
      await this.runSettlement(dealId, triggeredBy);
      this.logger.log(`Settlement erfolgreich: Deal ${dealId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Settlement fehlgeschlagen: Deal ${dealId} — ${message}`);

      // Fehler in DB persistieren (manuelle Intervention nötig)
      await this.prisma.settlement.upsert({
        where:  { dealId },
        create: {
          dealId,
          status:       "FAILED",
          grossAmount:  "0",
          platformFee:  "0",
          vatAmount:    "0",
          netToSeller:  "0",
          errorMessage: message,
        },
        update: {
          status:       "FAILED",
          errorMessage: message,
          retryCount:   { increment: 1 },
        },
      });

      throw err;  // BullMQ: Job als fehlgeschlagen markieren → Retry
    }
  }

  // ─── Settlement-Logik (Kernbuchung) ────────────────────────────────────────

  private async runSettlement(dealId: string, triggeredBy: string): Promise<void> {
    // ── Deal + Orgs laden ────────────────────────────────────────────────────
    const deal = await this.prisma.deal.findUnique({
      where:   { id: dealId },
      include: {
        sellerOrg:  true,
        buyerOrg:   true,
        settlement: true,
      },
    });

    if (!deal) throw new Error(`Deal ${dealId} nicht gefunden`);

    if (deal.status !== "CONTRACT_SIGNED") {
      if (deal.status === "SETTLEMENT_COMPLETE") {
        this.logger.warn(`Deal ${dealId} bereits abgeschlossen — Job wird übersprungen`);
        return;
      }
      throw new Error(`Ungültiger Deal-Status: ${deal.status}`);
    }

    if (deal.settlement?.status === "COMPLETED") {
      this.logger.warn(`Settlement für ${dealId} bereits COMPLETED — Idempotenz-Skip`);
      return;
    }

    // ── Gebühren berechnen ────────────────────────────────────────────────────
    const fees = this.calculateFees(deal);

    // ── Wallets ───────────────────────────────────────────────────────────────
    const [buyerWallet, sellerWallet] = await Promise.all([
      this.getOrCreateWallet(deal.buyerOrgId,  deal.currency),
      this.getOrCreateWallet(deal.sellerOrgId, deal.currency),
    ]);

    // ── Rechnungsnummer ───────────────────────────────────────────────────────
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const seq   = String(count + 1).padStart(6, "0");
    const buyerInvoiceNumber = `EUCX-INV-${year}-${seq}`;
    const sellerCreditNumber = `EUCX-GUT-${year}-${seq}`;

    // ── Atomare Transaktion ───────────────────────────────────────────────────
    await this.prisma.$transaction(async (tx) => {
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
        update: { status: "PROCESSING" },
      });

      // LedgerEntries
      const entries = this.buildLedgerEntries(
        dealId, fees, deal.currency, buyerWallet.id, sellerWallet.id
      );

      await tx.ledgerEntry.createMany({ data: entries, skipDuplicates: true });

      // Wallet-Salden
      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data:  { balance: { decrement: fees.grossAmount } },
      });
      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data:  { balance: { increment: fees.netToSeller } },
      });

      const now  = new Date();
      const dueAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Buyer Invoice
      await tx.invoice.create({
        data: {
          invoiceNumber:  buyerInvoiceNumber,
          type:           "BUYER_INVOICE",
          status:         "ISSUED",
          dealId,
          issuerId:       deal.sellerOrgId,
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

      // Seller Credit
      await tx.invoice.create({
        data: {
          invoiceNumber:  sellerCreditNumber,
          type:           "SELLER_CREDIT",
          status:         "ISSUED",
          dealId,
          issuerId:       deal.buyerOrgId,
          recipientId:    deal.sellerOrgId,
          grossAmount:    fees.grossAmount,
          platformFee:    fees.platformFee,
          vatAmount:      fees.vatAmount,
          vatRate:        fees.vatRate,
          netPayable:     fees.netToSeller,
          currency:       deal.currency,
          isReverseCharge: fees.isReverseCharge,
          buyerTaxId:     deal.buyerOrg.taxId,
          sellerTaxId:    deal.sellerOrg.taxId,
          buyerCountry:   deal.buyerOrg.country,
          sellerCountry:  deal.sellerOrg.country,
          issuedAt:       now,
        },
      });

      // Settlement abschließen
      await tx.settlement.update({
        where: { id: settlement.id },
        data:  { status: "COMPLETED", processedAt: now },
      });

      // Deal-Status
      await tx.deal.update({
        where: { id: dealId },
        data:  { status: "SETTLEMENT_COMPLETE" },
      });
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 });

    // Audit
    await this.audit.log({
      userId:     triggeredBy,
      action:     "SETTLEMENT_COMPLETED",
      entityType: "Settlement",
      entityId:   dealId,
      meta: {
        dealId,
        grossAmount: fees.grossAmount,
        platformFee: fees.platformFee,
        isReverseCharge: fees.isReverseCharge,
        processedByWorker: true,
      },
    });
  }

  // ─── Gebührenberechnung (vereinfacht — ohne Decimal.js Import-Probleme) ────

  private calculateFees(deal: {
    totalValue:  { toString(): string };
    buyerOrg:    { country: string; taxId: string };
    sellerOrg:   { country: string; taxId: string };
  }) {
    const gross = new Decimal(deal.totalValue.toString());
    const grossNum = gross.toNumber();

    const tiers: [number, number][] = [
      [100_000,   50],
      [500_000,   40],
      [1_000_000, 30],
      [Infinity,  20],
    ];
    const feeRateBps = tiers.find(([max]) => grossNum < max)![1];
    const feeRate    = new Decimal(feeRateBps).div(10_000);
    const platformFee = gross.times(feeRate).toDecimalPlaces(8);

    const isReverseCharge = this.isEuReverseCharge(
      deal.buyerOrg.country,
      deal.sellerOrg.country,
      deal.buyerOrg.taxId,
    );

    const EU_VAT: Record<string, number> = {
      DE: 19, AT: 20, PL: 23, FR: 20, IT: 22, NL: 21,
      ES: 21, BE: 21, SE: 25, DK: 25, CZ: 21, HU: 27,
    };

    let vatRate   = new Decimal(0);
    let vatAmount = new Decimal(0);

    if (!isReverseCharge) {
      const vatPct = EU_VAT[deal.sellerOrg.country] ?? 19;
      vatRate   = new Decimal(vatPct);
      vatAmount = gross.times(vatRate.div(100)).toDecimalPlaces(8);
    }

    const netPayable  = gross.plus(vatAmount).toDecimalPlaces(8);
    const netToSeller = gross.minus(platformFee).toDecimalPlaces(8);

    return {
      grossAmount:     gross.toFixed(8),
      platformFee:     platformFee.toFixed(8),
      feeRateBps,
      feeRatePct:      `${(feeRateBps / 100).toFixed(2)}%`,
      vatRate:         vatRate.toFixed(2),
      vatAmount:       vatAmount.toFixed(8),
      netPayable:      netPayable.toFixed(8),
      netToSeller:     netToSeller.toFixed(8),
      isReverseCharge,
      taxNote: isReverseCharge
        ? "Reverse Charge (§ 13b UStG)"
        : `MwSt. ${vatRate.toFixed(2)}%`,
    };
  }

  private isEuReverseCharge(buyer: string, seller: string, taxId: string): boolean {
    const EU = new Set([
      "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI",
      "FR","GR","HR","HU","IE","IT","LT","LU","LV","MT",
      "NL","PL","PT","RO","SE","SI","SK",
    ]);
    return EU.has(buyer) && EU.has(seller) && buyer !== seller && !!taxId && taxId.length >= 8;
  }

  private async getOrCreateWallet(organizationId: string, currency: string) {
    return this.prisma.wallet.upsert({
      where:  { organizationId },
      create: {
        organizationId,
        currency:        currency as never,
        balance:         "0",
        reservedBalance: "0",
      },
      update: {},
    });
  }

  private buildLedgerEntries(
    dealId:         string,
    fees:           ReturnType<ClearingProcessor["calculateFees"]>,
    currency:       string,
    buyerWalletId:  string,
    sellerWalletId: string,
  ) {
    const vatDec = new Decimal(fees.vatAmount);
    const hasVat = vatDec.gt(0);

    type EntryType = "DEBIT" | "CREDIT";
    type AccountType = "TRADER_WALLET" | "ESCROW" | "EUCX_FEE_REVENUE" | "VAT_PAYABLE";

    const entries: {
      correlationId:  string;
      walletId:       string | null;
      accountType:    AccountType;
      entryType:      EntryType;
      amount:         string;
      currency:       never;
      description:    string;
      dealId:         string;
      idempotencyKey: string;
    }[] = [];

    const cur = currency as never;

    // Schritt 1: Käufer → Escrow
    entries.push(
      { correlationId: `${dealId}:buyer-payment`, walletId: buyerWalletId, accountType: "TRADER_WALLET", entryType: "DEBIT",  amount: fees.grossAmount, currency: cur, description: `Deal ${dealId}: Bruttobetrag Käufer`,   dealId, idempotencyKey: `deal:${dealId}:buyer-payment:DEBIT`  },
      { correlationId: `${dealId}:buyer-payment`, walletId: null,           accountType: "ESCROW",        entryType: "CREDIT", amount: fees.grossAmount, currency: cur, description: `Deal ${dealId}: Eingang Treuhandkonto`, dealId, idempotencyKey: `deal:${dealId}:buyer-payment:CREDIT` },
    );
    // Schritt 2: Escrow → EUCX Fee
    entries.push(
      { correlationId: `${dealId}:platform-fee`, walletId: null, accountType: "ESCROW",          entryType: "DEBIT",  amount: fees.platformFee, currency: cur, description: `Deal ${dealId}: EUCX-Gebühr ${fees.feeRatePct}`, dealId, idempotencyKey: `deal:${dealId}:platform-fee:DEBIT`  },
      { correlationId: `${dealId}:platform-fee`, walletId: null, accountType: "EUCX_FEE_REVENUE", entryType: "CREDIT", amount: fees.platformFee, currency: cur, description: `Deal ${dealId}: EUCX-Gebührenkonto`,            dealId, idempotencyKey: `deal:${dealId}:platform-fee:CREDIT` },
    );
    // Schritt 3: MwSt. (optional)
    if (hasVat) {
      entries.push(
        { correlationId: `${dealId}:vat`, walletId: null, accountType: "ESCROW",      entryType: "DEBIT",  amount: fees.vatAmount, currency: cur, description: `Deal ${dealId}: MwSt. ${fees.vatRate}%`, dealId, idempotencyKey: `deal:${dealId}:vat:DEBIT`  },
        { correlationId: `${dealId}:vat`, walletId: null, accountType: "VAT_PAYABLE", entryType: "CREDIT", amount: fees.vatAmount, currency: cur, description: `Deal ${dealId}: MwSt.-Verbindlichkeit`,    dealId, idempotencyKey: `deal:${dealId}:vat:CREDIT` },
      );
    }
    // Schritt 4: Escrow → Verkäufer
    entries.push(
      { correlationId: `${dealId}:seller-payout`, walletId: null,            accountType: "ESCROW",        entryType: "DEBIT",  amount: fees.netToSeller, currency: cur, description: `Deal ${dealId}: Auszahlung Verkäufer`,   dealId, idempotencyKey: `deal:${dealId}:seller-payout:DEBIT`  },
      { correlationId: `${dealId}:seller-payout`, walletId: sellerWalletId, accountType: "TRADER_WALLET", entryType: "CREDIT", amount: fees.netToSeller, currency: cur, description: `Deal ${dealId}: Nettogutschrift Verkäufer`, dealId, idempotencyKey: `deal:${dealId}:seller-payout:CREDIT` },
    );

    return entries;
  }
}
