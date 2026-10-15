/**
 * GET /api/market/tickers
 *
 * Dünner Proxy zum NestJS-Endpoint GET /api/v1/public/ticker.
 * NestJS ist kanonisch: Redis-Cache (30s TTL) + Invalidierung nach Settlement.
 * Keine eigene DB-Logik — eliminiert Divergenz zwischen beiden Implementierungen.
 */
import { NextRequest, NextResponse } from "next/server";
import type { LiveTicker } from "@/hooks/useLiveMarketTickers";
import { getMarketTickers } from "@/lib/market/ohlc-queries";
import { requireAuth, ApiError } from "@/lib/auth/jwt";

const API_URL = process.env.NESTJS_INTERNAL_URL ?? "http://localhost:3001";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Preise nur für authentifizierte Nutzer — kein öffentlicher Preiszugang
  try {
    await requireAuth(req);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
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
    console.warn("[GET /api/market/tickers] NestJS nicht erreichbar — DB-Fallback:", err instanceof Error ? err.message : err);
    try {
      const tickers = await getMarketTickers();
      return NextResponse.json(
        { tickers, updatedAt: Date.now(), count: tickers.length, source: "db-fallback" },
        { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } },
      );
    } catch (dbErr) {
      console.error("[GET /api/market/tickers] DB-Fallback fehlgeschlagen:", dbErr);
      return NextResponse.json(
        { error: "Marktdaten nicht verfügbar" },
        { status: 503 },
      );
    }
  }
}
