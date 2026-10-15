/**
 * GET /api/market/stats
 *
 * Öffentliche Marktstatistiken — KEIN Preis, KEIN Bid/Ask.
 * Nur Aktivitätszähler und aggregiertes Volumen (EUR), da EUCX ein
 * reines Auktionsmodell betreibt: Preise werden durch Gebote gesetzt,
 * nicht vorab veröffentlicht.
 *
 * Felder:
 *   activeAuctions    - Lots in PROPOSAL-Phase (aktive Ausschreibungen)
 *   completedToday    - Lots mit phase=CONCLUSION, die heute abgeschlossen wurden
 *   volume7d          - Summe LotContract.totalValue der letzten 7 Tage (EUR-String)
 *   tradeCount7d      - Anzahl LotContracts der letzten 7 Tage
 *   categoryActivity  - Aktive Lots je Kategorie { [categoryLabel]: count }
 *   marketStatus      - "OPEN" | "CLOSED" | "HALT"
 *
 * Auth: keine — öffentlich zugänglich
 * Cache: public, 60s
 */

import { NextResponse } from "next/server";
import { db }           from "@/lib/db/client";
import Decimal          from "decimal.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now      = new Date();
    const today0   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const since7d  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeAuctions,
      completedToday,
      volumeAgg,
      tradeCount7d,
      activeLotsByCategory,
      activeHalt,
    ] = await Promise.all([
      // Aktive Ausschreibungen
      db.lot.count({ where: { phase: "PROPOSAL", isDraft: false } }),

      // Heute abgeschlossene Auktionen
      db.lot.count({
        where: {
          phase:    "CONCLUSION",
          lockedAt: { gte: today0 },
        },
      }),

      // Handelsvolumen letzte 7 Tage
      db.lotContract.aggregate({
        _sum:  { totalValue: true },
        where: { createdAt: { gte: since7d } },
      }),

      // Transaktionsanzahl letzte 7 Tage
      db.lotContract.count({ where: { createdAt: { gte: since7d } } }),

      // Aktive Lots je CBAM-Kategorie-Gruppe
      db.lot.findMany({
        where:  { phase: "PROPOSAL", isDraft: false },
        select: { cbamCategory: true },
      }),

      // Aktiver Markt-Halt
      db.tradingHalt.findFirst({
        where: { liftedAt: null },
        select: { id: true, expiresAt: true },
      }),
    ]);

    // Kategorie-Aggregation aus CbamCategory
    const categoryActivity: Record<string, number> = {};
    for (const lot of activeLotsByCategory) {
      const cat = lot.cbamCategory ?? null;
      const label = cat?.startsWith("STEEL_")      ? "Metalle & Stahl"
                  : cat?.startsWith("ALUMINIUM_")  ? "Aluminium"
                  : cat?.startsWith("FERTILIZER_") ? "Dünger"
                  : cat?.startsWith("CEMENT_")     ? "Zement"
                  : cat === "HYDROGEN"              ? "Wasserstoff"
                  : "Sonstige";
      categoryActivity[label] = (categoryActivity[label] ?? 0) + 1;
    }

    // Markt-Status
    let marketStatus: "OPEN" | "CLOSED" | "HALT" = "OPEN";
    if (activeHalt) {
      if (!activeHalt.expiresAt || activeHalt.expiresAt > now) {
        marketStatus = "HALT";
      }
    }
    // Außerhalb Handelszeiten (Mo–Fr 08:00–18:00 CET)
    const dayOfWeek = now.getUTCDay(); // 0=So, 6=Sa
    const hourCET   = (now.getUTCHours() + 1) % 24; // CET=UTC+1 (vereinfacht)
    if (dayOfWeek === 0 || dayOfWeek === 6 || hourCET < 8 || hourCET >= 18) {
      if (marketStatus === "OPEN") marketStatus = "CLOSED";
    }

    // Volumen formatieren
    const totalValue = new Decimal(volumeAgg._sum.totalValue?.toString() ?? "0");
    const volume7dStr = totalValue.gte(1_000_000)
      ? `${totalValue.div(1_000_000).toDecimalPlaces(1).toString()} Mio. €`
      : totalValue.gt(0)
      ? `${totalValue.toDecimalPlaces(0).toString()} €`
      : "0 €";

    return NextResponse.json(
      {
        activeAuctions,
        completedToday,
        volume7d:         volume7dStr,
        volume7dRaw:      totalValue.toDecimalPlaces(2).toString(),
        tradeCount7d,
        categoryActivity,
        marketStatus,
        generatedAt:      now.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/market/stats]", err);
    return NextResponse.json(
      { error: "Marktstatistiken nicht verfügbar" },
      { status: 503 },
    );
  }
}
