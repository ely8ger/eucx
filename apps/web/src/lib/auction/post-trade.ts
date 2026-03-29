/**
 * Post-Trade Engine — Wird nach CONCLUSION eines Lots aufgerufen.
 *
 * Ablauf:
 *   1. Lot + Sieger-Bid + Parteien aus DB laden
 *   2. Plattformgebühren berechnen (FeeEngine)
 *   3. PDF generieren (LotContractGenerator)
 *   4. LotContract + LotFees in DB schreiben (idempotent — @unique lotId)
 *   5. Bestätigungs-E-Mail an Käufer und Verkäufer senden
 *
 * Idempotenz: Wenn für lotId bereits ein LotContract existiert, wird die
 * Funktion ohne Fehler beendet (kein Duplikat).
 */

import Decimal from "decimal.js";
import { db } from "@/lib/db/client";
import { calcSellerFee, calcBuyerFee } from "./fee-engine";
import { generateLotContract } from "./lot-contract-generator";

// ─── Kontrakt-Nummer Generator ────────────────────────────────────────────────

async function generateContractNumber(): Promise<string> {
  const count = await db.lotContract.count();
  const seq   = String(count + 1).padStart(6, "0");
  const year  = new Date().getFullYear();
  return `EUCX-LOT-${year}-${seq}`;
}

// ─── E-Mail Stub ─────────────────────────────────────────────────────────────
// Kein SMTP-Paket installiert — Stub loggt und kann später mit Resend/Nodemailer
// vervollständigt werden. Struktur bleibt stabil.

async function sendContractEmail(params: {
  to:             string;
  recipientName:  string;
  contractNumber: string;
  lotId:          string;
  commodity:      string;
  totalValue:     string;
  feeAmount:      string;
  role:           "buyer" | "seller";
}): Promise<void> {
  // TODO: Echte E-Mail-Implementierung (z.B. Resend, Nodemailer, AWS SES)
  // Beispiel mit Resend:
  //   await resend.emails.send({
  //     from: "noreply@eucx.eu",
  //     to: params.to,
  //     subject: `Kaufvertrag ${params.contractNumber} — EUCX`,
  //     html: buildEmailHtml(params),
  //   });
  console.log(`[PostTrade] E-Mail würde gesendet an ${params.to}`, {
    contractNumber: params.contractNumber,
    role: params.role,
    totalValue: params.totalValue,
  });
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export async function processLotConclusion(lotId: string): Promise<void> {
  // Idempotenz-Check: bereits verarbeitet?
  const existing = await db.lotContract.findUnique({ where: { lotId } });
  if (existing) return;

  // Lot + Sieger + Parteien laden
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      id:          true,
      commodity:   true,
      quantity:    true,
      unit:        true,
      currentBest: true,
      lockedAt:    true,
      winnerId:    true,
      buyer: {
        select: {
          id:    true,
          email: true,
          organization: {
            select: { name: true, taxId: true, country: true },
          },
        },
      },
      winner: {
        select: {
          id:    true,
          email: true,
          organization: {
            select: { name: true, taxId: true, country: true },
          },
        },
      },
    },
  });

  if (!lot) throw new Error(`Lot ${lotId} nicht gefunden`);

  // Keine Gebote eingegangen — kein Vertrag, Käufer benachrichtigen und sauber beenden
  if (!lot.winner || !lot.currentBest) {
    console.log(`[PostTrade] Lot ${lotId}: keine Gebote eingegangen — kein Vertrag erstellt.`);
    await db.notification.create({
      data: {
        userId:  lot.buyer.id,
        lotId,
        type:    "CLOSED_BUYER",
        title:   `Auktion ohne Ergebnis: ${lot.commodity}`,
        message: "Die Auktion wurde beendet. Es sind keine Gebote eingegangen — kein Kaufvertrag wird erstellt.",
      },
    });
    return;
  }

  const finalPrice = new Decimal(lot.currentBest.toString());
  const quantity   = new Decimal(lot.quantity.toString());
  const totalValue = finalPrice.times(quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  // Gebühren berechnen
  const [sellerFee, buyerFee] = await Promise.all([
    calcSellerFee(lot.winner.id, totalValue),
    calcBuyerFee(lot.buyer.id,   totalValue),
  ]);

  const auctionDate = lot.lockedAt?.toISOString() ?? new Date().toISOString();

  // PDF generieren
  const contractNumber = await generateContractNumber();

  const { pdfBase64, pdfHash, pdfSizeBytes } = await generateLotContract({
    contractNumber,
    lotId:           lot.id,
    auctionDate,
    // Käufer
    buyerName:       lot.buyer.organization.name,
    buyerCountry:    lot.buyer.organization.country,
    buyerTaxId:      lot.buyer.organization.taxId,
    // Verkäufer
    sellerName:      lot.winner.organization.name,
    sellerCountry:   lot.winner.organization.country,
    sellerTaxId:     lot.winner.organization.taxId,
    // Ware
    commodity:       lot.commodity,
    quantity:        lot.quantity.toString(),
    unit:            lot.unit,
    finalPrice:      finalPrice.toString(),
    totalValue:      totalValue.toString(),
    currency:        "EUR",
    // Gebühren (als Prozentzahl für PDF-Anzeige: 0.008 → "0.80")
    sellerFeeRate:   sellerFee.rate.times(100).toFixed(2),
    sellerFeeAmount: sellerFee.amount.toString(),
    buyerFeeRate:    buyerFee.rate.times(100).toFixed(2),
    buyerFeeAmount:  buyerFee.amount.toString(),
  });

  // DB schreiben: LotContract + LotFees in einer Transaktion
  await db.$transaction(async (tx) => {
    const contract = await tx.lotContract.create({
      data: {
        lotId,
        buyerId:        lot.buyer.id,
        sellerId:       lot.winner!.id,
        contractNumber,
        finalPrice:     finalPrice.toString(),
        totalValue:     totalValue.toString(),
        pdfBase64,
        pdfHash,
        pdfSizeBytes,
      },
    });

    await tx.lotFee.createMany({
      data: [
        {
          contractId: contract.id,
          userId:     lot.winner!.id,
          type:       "SELLER_FEE",
          rate:       sellerFee.rate.toString(),
          amount:     sellerFee.amount.toString(),
          status:     "UNPAID",
        },
        {
          contractId: contract.id,
          userId:     lot.buyer.id,
          type:       "BUYER_FEE",
          rate:       buyerFee.rate.toString(),
          amount:     buyerFee.amount.toString(),
          status:     "UNPAID",
        },
      ],
    });

    // AuditLog
    await tx.auditLog.create({
      data: {
        action:     "LOT_CONTRACT_GENERATED",
        entityType: "LotContract",
        entityId:   contract.id,
        meta: {
          lotId,
          contractNumber,
          totalValue:      totalValue.toString(),
          sellerFeeAmount: sellerFee.amount.toString(),
          buyerFeeAmount:  buyerFee.amount.toString(),
        },
      },
    });
  });

  // E-Mails senden (fire-and-forget — kein await um Haupt-Flow nicht zu blockieren)
  const tv = totalValue.toLocaleString();

  sendContractEmail({
    to:             lot.buyer.email,
    recipientName:  lot.buyer.organization.name,
    contractNumber,
    lotId,
    commodity:      lot.commodity,
    totalValue:     tv,
    feeAmount:      buyerFee.amount.toString(),
    role:           "buyer",
  }).catch(console.error);

  sendContractEmail({
    to:             lot.winner.email,
    recipientName:  lot.winner.organization.name,
    contractNumber,
    lotId,
    commodity:      lot.commodity,
    totalValue:     tv,
    feeAmount:      sellerFee.amount.toString(),
    role:           "seller",
  }).catch(console.error);
}
