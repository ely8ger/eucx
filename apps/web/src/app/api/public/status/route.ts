/**
 * GET /api/public/status
 *
 * Plattform-Status und Health-Check.
 * Für öffentliche Status-Seiten, Monitoring und API-Nutzer.
 *
 * Response:
 *   platform      - "operational" | "degraded" | "maintenance"
 *   market        - "OPEN" | "CLOSED" | "HALT"
 *   haltReason    - string | null (nur bei HALT)
 *   haltUntil     - ISO-String | null
 *   maintenance   - boolean
 *   timestamp     - ISO-String
 *
 * Auth: keine — öffentlich
 * Cache: public, 30s
 */

import { NextResponse } from "next/server";
import { db }           from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const activeHalt = await db.tradingHalt.findFirst({
      where:  { liftedAt: null },
      select: { reason: true, expiresAt: true, activatedAt: true },
      orderBy: { activatedAt: "desc" },
    });

    let market:     "OPEN" | "CLOSED" | "HALT" = "OPEN";
    let haltReason: string | null = null;
    let haltUntil:  string | null = null;

    if (activeHalt) {
      const stillActive = !activeHalt.expiresAt || activeHalt.expiresAt > now;
      if (stillActive) {
        market     = "HALT";
        haltReason = activeHalt.reason;
        haltUntil  = activeHalt.expiresAt?.toISOString() ?? null;
      }
    }

    // Außerhalb Handelszeiten Mo–Fr 08:00–18:00 CET (UTC+1)
    const dayOfWeek = now.getUTCDay();
    const hourCET   = (now.getUTCHours() + 1) % 24;
    if (market === "OPEN" && (dayOfWeek === 0 || dayOfWeek === 6 || hourCET < 8 || hourCET >= 18)) {
      market = "CLOSED";
    }

    const platform = market === "HALT" ? "degraded" : "operational";

    return NextResponse.json(
      {
        platform,
        market,
        haltReason,
        haltUntil,
        maintenance: false,
        timestamp:   now.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/public/status]", err);
    return NextResponse.json(
      {
        platform:    "degraded",
        market:      "UNKNOWN",
        haltReason:  null,
        haltUntil:   null,
        maintenance: false,
        timestamp:   new Date().toISOString(),
        error:       "Status konnte nicht geladen werden",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
