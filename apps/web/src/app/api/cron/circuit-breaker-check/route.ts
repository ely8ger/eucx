/**
 * GET /api/cron/circuit-breaker-check
 *
 * Automatischer Circuit-Breaker: prüft alle aktiven Auktionslots auf abnormale
 * Preisschwankungen (Reverse-Auction: Verkäufer bieten Preis HERUNTER).
 *
 * Auslösebedingung:
 *   currentBest < startPrice × (1 − CB_THRESHOLD)
 *   Default-Schwellenwert: 20% (CB_THRESHOLD = 0.20)
 *
 * Aktion bei Auslösung:
 *   - TradingHalt-Eintrag in DB (liftedAt=null → aktiv, expiresAt=+15min)
 *   - AuditLog-Eintrag
 *   - In-App-Benachrichtigung an den Lot-Käufer
 *
 * Schedule: "* /5 * * * *" (alle 5 Minuten)
 * Auth: CRON_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import Decimal                    from "decimal.js";
import { pingCronHealthcheck }   from "@/lib/monitoring/healthcheck";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 30;

const CB_THRESHOLD   = 0.20;   // 20% Preisrückgang triggert den CB
const CB_HALT_MINS   = 15;     // Halt läuft nach 15 Minuten automatisch ab
const MAX_LOTS       = 50;     // Sicherheitsnetz: max Lots pro Lauf

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const start = Date.now();

  // ── Aktive Lots mit gesetztem Startpreis und aktuellem Gebot laden ──────────
  const lots = await db.lot.findMany({
    where: {
      phase:        { in: ["PROPOSAL", "REDUCTION"] },
      isDraft:      false,
      startPrice:   { not: null },
      currentBest:  { not: null },
      lockedAt:     null,
    },
    select: {
      id:          true,
      buyerId:     true,
      commodity:   true,
      startPrice:  true,
      currentBest: true,
    },
    take: MAX_LOTS,
  });

  if (lots.length === 0) {
    return NextResponse.json({
      ok: true,
      checked: 0,
      triggered: [],
      durationMs: Date.now() - start,
    });
  }

  const triggered: string[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CB_HALT_MINS * 60_000);

  for (const lot of lots) {
    const startP = new Decimal(lot.startPrice!.toString());
    const bestP  = new Decimal(lot.currentBest!.toString());

    // Reverse Auction: Preis sinkt — CB wenn Abfall > Schwellenwert
    if (startP.lte(0)) continue;

    const dropFraction = startP.minus(bestP).div(startP);

    if (dropFraction.gte(CB_THRESHOLD)) {
      triggered.push(lot.id);

      // TradingHalt in DB schreiben (lot-spezifisch via reason)
      void db.tradingHalt.create({
        data: {
          activatedBy: "system",
          reason:      `CB: Lot ${lot.id} (${lot.commodity}) — Preissturz ${dropFraction.times(100).toFixed(1)}% über Schwellenwert ${CB_THRESHOLD * 100}%`,
          expiresAt,
        },
      }).catch((err: unknown) =>
        console.error("[CB] TradingHalt-Schreiben fehlgeschlagen:", err)
      );

      // In-App-Benachrichtigung an den Käufer
      void db.notification.create({
        data: {
          userId:  lot.buyerId,
          lotId:   lot.id,
          type:    "DEPOSIT_WARN",
          title:   "Circuit Breaker ausgelöst",
          message: `Lot "${lot.commodity}": Preissturz ${dropFraction.times(100).toFixed(1)}% — automatischer Sicherheitscheck aktiv.`,
        },
      }).catch((err: unknown) =>
        console.error("[CB] Notification-Schreiben fehlgeschlagen:", err)
      );

      console.warn(
        `[circuit-breaker] Lot ${lot.id} — ${lot.commodity}: ` +
        `startPrice=${startP.toFixed(2)} currentBest=${bestP.toFixed(2)} ` +
        `drop=${dropFraction.times(100).toFixed(1)}%`
      );
    }
  }

  pingCronHealthcheck("circuit-breaker-check");
  return NextResponse.json({
    ok:        true,
    checked:   lots.length,
    triggered,
    threshold: `${CB_THRESHOLD * 100}%`,
    durationMs: Date.now() - start,
  });
}
