/**
 * GET /api/market/[productId]/ticker
 *
 * Einzelner Echtzeit-Ticker für ein Produkt.
 * Ersetzt den fehlenden /api/v1/public/ticker/{symbol} Endpunkt.
 *
 * Datenquelle: market_candles ONE_DAY (letzten 2 Tage).
 * Öffentlich - kein Auth erforderlich.
 *
 * Response: MarketTicker-kompatibles Objekt für useMarketTicker REST-Fallback.
 * Cache-Control: s-maxage=30, stale-while-revalidate=60
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import Decimal                       from "decimal.js";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

async function _GET(
  _req:    NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const { productId } = await context.params;

  const candles = await db.marketCandle.findMany({
    where: {
      productId,
      interval:    "ONE_DAY",
      periodStart: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { periodStart: "desc" },
    take:    2,
    include: { product: { select: { name: true, unit: true, category: { select: { slug: true } } } } },
  });

  if (candles.length === 0) {
    return NextResponse.json({ error: "Keine Marktdaten verfügbar" }, { status: 404 });
  }

  const latest   = candles[0]!;
  const prev     = candles[1];

  const lastPrice = new Decimal(latest.close.toString());
  const prevClose = prev
    ? new Decimal(prev.close.toString())
    : new Decimal(latest.open.toString());

  const change    = lastPrice.minus(prevClose);
  const changePct = prevClose.gt(0) ? change.div(prevClose).times(100) : new Decimal(0);
  const sign      = change.gte(0) ? "+" : "";

  return NextResponse.json({
    symbol:            productId,
    price:             lastPrice.toFixed(2),
    prevClose:         prevClose.toFixed(2),
    change24h:         `${sign}${change.toFixed(2)}`,
    changePercent24h:  changePct.toFixed(2),
    high24h:           new Decimal(latest.high.toString()).toFixed(2),
    low24h:            new Decimal(latest.low.toString()).toFixed(2),
    volume24h:         new Decimal(latest.volume.toString()).toFixed(3),
    currency:          "EUR",
    productName:       latest.product.name,
    unit:              latest.product.unit,
    categorySlug:      latest.product.category.slug,
    lastUpdated:       latest.periodStart.getTime(),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export const GET = apiRoute(_GET);
