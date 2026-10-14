/**
 * GET /api/market/tickers
 *
 * Dünner Proxy zum NestJS-Endpoint GET /api/v1/public/ticker.
 * NestJS ist kanonisch: Redis-Cache (30s TTL) + Invalidierung nach Settlement.
 * Keine eigene DB-Logik — eliminiert Divergenz zwischen beiden Implementierungen.
 */
import { NextResponse } from "next/server";
import type { LiveTicker } from "@/hooks/useLiveMarketTickers";

const API_URL = process.env.NESTJS_INTERNAL_URL ?? "http://localhost:3001";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const upstream = await fetch(`${API_URL}/api/v1/public/ticker`, {
      headers: { Accept: "application/json" },
      cache:   "no-store",  // Redis in NestJS ist zuständig — kein Next.js-Fetch-Cache
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Marktdaten vorübergehend nicht verfügbar" },
        { status: upstream.status },
      );
    }

    const data = await upstream.json() as {
      tickers:     LiveTicker[];
      count:       number;
      generatedAt: string;
    };

    return NextResponse.json(
      { tickers: data.tickers, updatedAt: Date.now(), count: data.count },
      { headers: { "Cache-Control": "public, s-maxage=28, stale-while-revalidate=60" } },
    );
  } catch (err) {
    console.error("[GET /api/market/tickers] Proxy-Fehler:", err);
    return NextResponse.json(
      { error: "Marktdaten nicht verfügbar" },
      { status: 503 },
    );
  }
}
