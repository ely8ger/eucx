/**
 * GET /api/seller/stats
 *
 * KPI-Aggregation für das Seller Control Center.
 * Gibt zurück:
 *  - monthlyRevenue:   Umsatz aus gewonnenen Kontrakten (laufender Kalendermonat)
 *  - monthlyFees:      Plattformgebühren diesen Monat
 *  - activeBids:       Anzahl offener Gebote (Lot in PROPOSAL/REDUCTION)
 *  - leadingBids:      Davon in Führung (mein Gebot === lot.currentBest)
 *  - avgCo2:           Durchschnittlicher CO₂-Fußabdruck der Lots, für die ich biete
 *  - wonDeals:         Gewonnene Deals diesen Monat
 *  - recentContracts:  Letzte 5 gewonnene Kontrakte
 *  - activeLotPositions: Position in aktiven Auktionen
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import Decimal from "decimal.js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const userId = token.userId;

  // Monatsbeginn (1. des laufenden Monats, 00:00 UTC)
  const now        = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  // ── Parallele DB-Abfragen ─────────────────────────────────────────────────────
  const [contracts, activeBids, activeLots] = await Promise.all([

    // Gewonnene Kontrakte diesen Monat
    db.lotContract.findMany({
      where: {
        sellerId:  userId,
        createdAt: { gte: monthStart },
      },
      select: {
        id:          true,
        contractNumber: true,
        finalPrice:  true,
        totalValue:  true,
        createdAt:   true,
        fees: {
          where: { userId, type: "SELLER_FEE" },
          select: { amount: true },
        },
        lot: {
          select: { commodity: true, quantity: true, unit: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Meine aktiven Gebote
    db.bid.findMany({
      where: {
        sellerId: userId,
        lot: { phase: { in: ["PROPOSAL", "REDUCTION"] } },
      },
      select: {
        id:    true,
        price: true,
        lot: {
          select: {
            id:          true,
            commodity:   true,
            quantity:    true,
            unit:        true,
            phase:       true,
            currentBest: true,
            auctionEnd:  true,
            co2PerTonne: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Alle Lots mit meinen Geboten (für CO₂-Score)
    db.lot.findMany({
      where: {
        bids: { some: { sellerId: userId } },
        phase: { in: ["PROPOSAL", "REDUCTION"] },
        co2PerTonne: { not: null },
      },
      select: { co2PerTonne: true },
    }),
  ]);

  // ── Berechnungen ──────────────────────────────────────────────────────────────

  // Monatsumsatz + Gebühren
  let monthlyRevenue = new Decimal(0);
  let monthlyFees    = new Decimal(0);
  for (const c of contracts) {
    monthlyRevenue = monthlyRevenue.plus(c.totalValue.toString());
    for (const f of c.fees) {
      monthlyFees = monthlyFees.plus(f.amount.toString());
    }
  }

  // Aktive Gebote: Wie viele davon in Führung?
  const deduped = new Map<string, typeof activeBids[number]>();
  for (const bid of activeBids) {
    const existing = deduped.get(bid.lot.id);
    // Niedrigstes Gebot eines Sellers pro Lot behalten (reverse auction)
    if (!existing || new Decimal(bid.price.toString()).lt(existing.price.toString())) {
      deduped.set(bid.lot.id, bid);
    }
  }
  const uniqueBids = [...deduped.values()];

  const activeBidCount = uniqueBids.length;
  const leadingBidCount = uniqueBids.filter((b) =>
    b.lot.currentBest !== null &&
    new Decimal(b.price.toString()).lte(b.lot.currentBest.toString())
  ).length;

  // CBAM-Score: Ø CO₂/t der Lots in aktiven Auktionen
  const co2Values = activeLots
    .filter((l) => l.co2PerTonne !== null)
    .map((l) => parseFloat(l.co2PerTonne!.toString()));
  const avgCo2 = co2Values.length > 0
    ? co2Values.reduce((a, b) => a + b, 0) / co2Values.length
    : null;

  // Position-Details für jedes aktive Lot
  const positions = uniqueBids.map((bid) => {
    const myPrice   = new Decimal(bid.price.toString());
    const bestPrice = bid.lot.currentBest ? new Decimal(bid.lot.currentBest.toString()) : null;
    const isLeading = bestPrice !== null && myPrice.lte(bestPrice);
    const diffToBest = bestPrice && !isLeading
      ? myPrice.minus(bestPrice).toDecimalPlaces(2).toString()
      : null;

    return {
      lotId:       bid.lot.id,
      commodity:   bid.lot.commodity,
      quantity:    bid.lot.quantity.toString(),
      unit:        bid.lot.unit,
      phase:       bid.lot.phase,
      auctionEnd:  bid.lot.auctionEnd,
      myPrice:     myPrice.toString(),
      bestPrice:   bestPrice?.toString() ?? null,
      isLeading,
      diffToBest,
    };
  }).sort((a, b) => (a.isLeading ? 1 : 0) - (b.isLeading ? 1 : 0)); // Gefährdete zuerst

  // Recent Contracts aufbereiten
  const recentContracts = contracts.map((c) => ({
    id:             c.id,
    contractNumber: c.contractNumber,
    commodity:      c.lot.commodity,
    quantity:       c.lot.quantity.toString(),
    unit:           c.lot.unit,
    totalValue:     c.totalValue.toString(),
    feeAmount:      c.fees[0]?.amount.toString() ?? "0",
    createdAt:      c.createdAt.toISOString(),
  }));

  return NextResponse.json({
    monthlyRevenue:  monthlyRevenue.toString(),
    monthlyFees:     monthlyFees.toString(),
    monthlyNet:      monthlyRevenue.minus(monthlyFees).toString(),
    activeBidCount,
    leadingBidCount,
    avgCo2,
    wonDeals:        contracts.length,
    positions,
    recentContracts,
  });
}
