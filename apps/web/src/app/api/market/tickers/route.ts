/**
 * GET /api/market/tickers
 *
 * Marktübersicht: Ticker für alle aktiven Produkte.
 * Öffentlich - kein Auth erforderlich.
 *
 * Datenquelle: market_candles ONE_DAY (letzten 2 Tage).
 * Cache-Control: s-maxage=30, stale-while-revalidate=60
 *
 * Response:
 *   { tickers: MarketTickerRow[], updatedAt: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { getMarketTickers }          from "@/lib/market/ohlc-queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const tickers = await getMarketTickers();

    return NextResponse.json({
      tickers,
      updatedAt: Date.now(),
      count:     tickers.length,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[GET /api/market/tickers]", err);
    return NextResponse.json({ error: "Marktdaten nicht verfügbar" }, { status: 500 });
  }
}
