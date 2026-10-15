/**
 * EUCX Auction Fee Engine
 *
 * Berechnet Plattformgebühren nach Auktionsabschluss.
 *
 * Priorität:
 *   1. FeeOverride (User-spezifische Rate, Admin konfigurierbar)
 *   2. FeeTier HIGH_VOLUME (wenn Jahresumsatz > Schwelle)
 *   3. FeeTier STANDARD
 *   4. Hardcoded Fallback (falls DB-Abfrage scheitert)
 *
 * High-Volume-Schwelle: Summe aller gewonnenen/abgegebenen LotContract.totalValue
 * für diesen User in den letzten 12 Monaten.
 */

import Decimal from "decimal.js";
import { db } from "@/lib/db/client";

// Fallback-Werte (greift wenn FeeTier nicht in DB vorhanden)
const FALLBACK = {
  SELLER_STANDARD:    new Decimal("0.008"),
  SELLER_HIGH_VOLUME: new Decimal("0.005"),
  BUYER_STANDARD:     new Decimal("0.003"),
  BUYER_HIGH_VOLUME:  new Decimal("0.0015"),
  HIGH_VOLUME_THRESHOLD: new Decimal("500000"),
} as const;

export interface FeeResult {
  rate:         InstanceType<typeof Decimal>;
  amount:       InstanceType<typeof Decimal>;
  isHighVolume: boolean;
  source:       "override" | "high_volume" | "standard"; // Nachvollziehbarkeit
}

/**
 * Lädt FeeTier-Konfiguration aus DB mit Fallback.
 */
async function loadTiers(): Promise<{
  standard:   { sellerRate: InstanceType<typeof Decimal>; buyerRate: InstanceType<typeof Decimal> };
  highVolume: { sellerRate: InstanceType<typeof Decimal>; buyerRate: InstanceType<typeof Decimal>; threshold: InstanceType<typeof Decimal> };
}> {
  try {
    const tiers = await db.feeTier.findMany({ select: { name: true, sellerRate: true, buyerRate: true, volumeThreshold: true } });
    const std = tiers.find((t) => t.name === "STANDARD");
    const hv  = tiers.find((t) => t.name === "HIGH_VOLUME");
    return {
      standard:   {
        sellerRate: new Decimal(std?.sellerRate?.toString() ?? FALLBACK.SELLER_STANDARD.toString()),
        buyerRate:  new Decimal(std?.buyerRate?.toString()  ?? FALLBACK.BUYER_STANDARD.toString()),
      },
      highVolume: {
        sellerRate: new Decimal(hv?.sellerRate?.toString() ?? FALLBACK.SELLER_HIGH_VOLUME.toString()),
        buyerRate:  new Decimal(hv?.buyerRate?.toString()  ?? FALLBACK.BUYER_HIGH_VOLUME.toString()),
        threshold:  new Decimal(hv?.volumeThreshold?.toString() ?? FALLBACK.HIGH_VOLUME_THRESHOLD.toString()),
      },
    };
  } catch {
    return {
      standard:   { sellerRate: FALLBACK.SELLER_STANDARD,    buyerRate: FALLBACK.BUYER_STANDARD },
      highVolume: { sellerRate: FALLBACK.SELLER_HIGH_VOLUME, buyerRate: FALLBACK.BUYER_HIGH_VOLUME, threshold: FALLBACK.HIGH_VOLUME_THRESHOLD },
    };
  }
}

/**
 * Berechnet die Verkäufer-Gebühr für ein Lot.
 */
export async function calcSellerFee(sellerId: string, totalValue: InstanceType<typeof Decimal>): Promise<FeeResult> {
  const [override, tiers, isHighVolume] = await Promise.all([
    db.feeOverride.findUnique({ where: { userId: sellerId }, select: { sellerRate: true, expiresAt: true } }),
    loadTiers(),
    checkHighVolume(sellerId, "seller"),
  ]);

  // 1. Aktiver Override hat höchste Priorität
  if (override?.sellerRate != null && (override.expiresAt == null || override.expiresAt > new Date())) {
    const rate = new Decimal(override.sellerRate.toString());
    return { rate, amount: totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP), isHighVolume, source: "override" };
  }

  // 2. High-Volume-Rabatt
  if (isHighVolume) {
    const rate = tiers.highVolume.sellerRate;
    return { rate, amount: totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP), isHighVolume, source: "high_volume" };
  }

  // 3. Standard
  const rate = tiers.standard.sellerRate;
  return { rate, amount: totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP), isHighVolume, source: "standard" };
}

/**
 * Berechnet die Käufer-Gebühr für ein Lot.
 */
export async function calcBuyerFee(buyerId: string, totalValue: InstanceType<typeof Decimal>): Promise<FeeResult> {
  const [override, tiers, isHighVolume] = await Promise.all([
    db.feeOverride.findUnique({ where: { userId: buyerId }, select: { buyerRate: true, expiresAt: true } }),
    loadTiers(),
    checkHighVolume(buyerId, "buyer"),
  ]);

  if (override?.buyerRate != null && (override.expiresAt == null || override.expiresAt > new Date())) {
    const rate = new Decimal(override.buyerRate.toString());
    return { rate, amount: totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP), isHighVolume, source: "override" };
  }

  if (isHighVolume) {
    const rate = tiers.highVolume.buyerRate;
    return { rate, amount: totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP), isHighVolume, source: "high_volume" };
  }

  const rate = tiers.standard.buyerRate;
  return { rate, amount: totalValue.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP), isHighVolume, source: "standard" };
}

/**
 * Prüft ob ein User High-Volume-Status hat.
 */
async function checkHighVolume(userId: string, role: "seller" | "buyer"): Promise<boolean> {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  try {
    const tiers = await db.feeTier.findUnique({ where: { name: "HIGH_VOLUME" }, select: { volumeThreshold: true } });
    const threshold = new Decimal(tiers?.volumeThreshold?.toString() ?? FALLBACK.HIGH_VOLUME_THRESHOLD.toString());

    const result = await db.lotContract.aggregate({
      _sum:  { totalValue: true },
      where: {
        ...(role === "seller" ? { sellerId: userId } : { buyerId: userId }),
        createdAt: { gte: since },
      },
    });

    const cumulative = new Decimal(result._sum.totalValue?.toString() ?? "0");
    return cumulative.gte(threshold);
  } catch {
    return false;
  }
}

/**
 * Gibt die Rate als lesbaren Prozentwert zurück. z.B. 0.008 → "0,80%"
 */
export function formatRate(rate: InstanceType<typeof Decimal>): string {
  return rate.times(100).toFixed(2).replace(".", ",") + " %";
}
