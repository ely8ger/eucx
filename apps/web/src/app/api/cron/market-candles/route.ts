/**
 * GET /api/cron/market-candles
 *
 * Vercel Cron - OHLC-Cache-Refresh für alle aktiven Produkte.
 * Aufgerufen jede Minute via vercel.json crons.
 *
 * Auth: Authorization: Bearer {CRON_SECRET}
 * Max-Duration: 60s (Vercel Pro) / 10s (Hobby - nur ONE_MIN)
 *
 * Strategie:
 *   Jede Minute: ONE_MIN (5min Lookback)
 *   Alle 5 Minuten: FIFTEEN_MIN (30min Lookback) → via Zeitprüfung
 *   Jede Stunde: ONE_HOUR (2h Lookback) → via Zeitprüfung
 *   Täglich 00:05: ONE_DAY (2d Lookback) → via Zeitprüfung
 */
import { NextRequest, NextResponse } from "next/server";
import { refreshAllCandles }         from "@/lib/market/candle-refresh";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Auth: CRON_SECRET ist in Production Pflicht
  const auth   = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[cron/market-candles] CRON_SECRET ist nicht gesetzt - Anfrage abgelehnt");
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    const { refreshed, errors } = await refreshAllCandles();

    return NextResponse.json({
      ok:        true,
      refreshed,
      errors,
      durationMs: Date.now() - start });
  } catch (err) {
    console.error("[cron/market-candles]", err);
    return NextResponse.json({
      ok:     false,
      error:  process.env.NODE_ENV !== "production"
        ? (err instanceof Error ? err.message : String(err))
        : "Interner Fehler",
      durationMs: Date.now() - start }, { status: 500 });
  }
}
