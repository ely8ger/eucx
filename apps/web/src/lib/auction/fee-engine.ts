/**
 * EUCX Auction Fee Engine
 *
 * Berechnet Plattformgebühren nach Auktionsabschluss.
 *
 * Gebührentabelle (Basis: Gesamtwert = finalPrice × quantity):
 *   Verkäufer:  Standard 0.8% | High-Volume 0.5%  (> 500.000 € kumulativer Umsatz)
 *   Käufer:     Standard 0.3% | High-Volume 0.15% (> 500.000 € kumulativer Umsatz)
 *
 * High-Volume-Schwelle: Summe aller gewonnenen/abgegebenen LotContract.totalValue
 * für diesen User in den letzten 12 Monaten.
 */

import Decimal from "decimal.js";
import { db } from "@/lib/db/client";

const HIGH_VOLUME_THRESHOLD = new Decimal("500000");  // 500.000 €

const RATES = {
  SELLER_STANDARD:    new Decimal("0.008"),   // 0.8%
  SELLER_HIGH_VOLUME: new Decimal("0.005"),   // 0.5%
  BUYER_STANDARD:     new Decimal("0.003"),   // 0.3%
  BUYER_HIGH_VOLUME:  new Decimal("0.0015"),  // 0.15%
} as const;

export interface FeeResult {
  rate:         InstanceType<typeof Decimal>;
  amount:       InstanceType<typeof Decimal>;
  isHighVolume: boolean;
}

/**
 * Berechnet die Verkäufer-Gebühr für ein Lot.
 * @param sellerId    User-ID des Verkäufers
 * @param totalValue  Gesamtwert des Lots (finalPrice × quantity)
 */
export async function calcSellerFee(sellerId: string, totalValue: InstanceType<typeof Decimal>): Promise<FeeResult> {
  const isHighVolume = await checkHighVolume(sellerId, "seller");
  const rate   = isHighVolume ? RATES.SELLER_HIGH_VOLUME : RATES.SELLER_STANDARD;
  const amount = totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return { rate, amount, isHighVolume };
}

/**
 * Berechnet die Käufer-Gebühr für ein Lot.
 * @param buyerId     User-ID des Käufers
 * @param totalValue  Gesamtwert des Lots (finalPrice × quantity)
 */
export async function calcBuyerFee(buyerId: string, totalValue: InstanceType<typeof Decimal>): Promise<FeeResult> {
  const isHighVolume = await checkHighVolume(buyerId, "buyer");
  const rate   = isHighVolume ? RATES.BUYER_HIGH_VOLUME : RATES.BUYER_STANDARD;
  const amount = totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return { rate, amount, isHighVolume };
}

/**
 * Prüft ob ein User High-Volume-Status hat (> 500.000 € Umsatz letzte 12 Monate).
 */
async function checkHighVolume(userId: string, role: "seller" | "buyer"): Promise<boolean> {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const result = await db.lotContract.aggregate({
    _sum: { totalValue: true },
    where: {
      ...(role === "seller" ? { sellerId: userId } : { buyerId: userId }),
      createdAt: { gte: since },
    },
  });

  const cumulative = new Decimal(result._sum.totalValue?.toString() ?? "0");
  return cumulative.gte(HIGH_VOLUME_THRESHOLD);
}

/**
 * Gibt die Rate als lesbaren Prozentwert zurück. z.B. 0.008 → "0,80%"
 */
export function formatRate(rate: InstanceType<typeof Decimal>): string {
  return rate.times(100).toFixed(2).replace(".", ",") + " %";
}
