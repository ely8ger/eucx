/**
 * GET /api/cron/session-lifecycle
 *
 * Automatische Session-Verwaltung für alle aktiven Produkte:
 *
 *  1. VORBEREITUNG (07:00–12:59 Berlin, Mo–Fr):
 *     Erstellt SCHEDULED Sessions für Produkte, die heute noch keine haben.
 *     scheduledStart = heute 13:00:00 Europe/Berlin
 *
 *  2. ÖFFNEN (13:00 Berlin, Mo–Fr):
 *     SCHEDULED Sessions mit scheduledStart ≤ now → TRADING_1
 *
 *  3. SCHLIESSEN (≥ 15:00 Berlin, Mo–Fr):
 *     Aktive Sessions (TRADING_1 / CORRECTION_1 / TRADING_2 / CORRECTION_2) → FINAL
 *
 * Schedule: "* /5 * * * *" (alle 5 Minuten)
 * Auth: CRON_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 30;

const OPEN_HOUR  = 13;
const CLOSE_HOUR = 15;

function berlinerStunde(now: Date): { hour: number; weekday: number; berlinDateStr: string } {
  const f = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "numeric", minute: "numeric", weekday: "long", hour12: false,
  });
  const parts = f.formatToParts(now);
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? "0", 10);
  const wdMap: Record<string, number> = {
    Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4, Freitag: 5, Samstag: 6, Sonntag: 0,
  };
  const berlinDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
  return {
    hour:         get("hour"),
    weekday:      wdMap[parts.find(p => p.type === "weekday")?.value ?? ""] ?? 0,
    berlinDateStr,
  };
}

function isTradingDay(weekday: number) {
  return weekday >= 1 && weekday <= 5;
}

/** Berlin-Offset in ms: berechnet den UTC-Zeitpunkt für eine Berlin-Ortszeit */
function berlinToUtc(dateStr: string, hour: number): Date {
  const berlinMs    = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00`).getTime();
  const offsetProxy = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const offsetMs    = Date.now() - offsetProxy.getTime();
  return new Date(berlinMs + offsetMs);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const start = Date.now();
  const now   = new Date();
  const { hour, weekday, berlinDateStr } = berlinerStunde(now);
  const isTrading = isTradingDay(weekday);

  let opened     = 0;
  let closed     = 0;
  let prepared   = 0;

  // ── 1. ÖFFNEN: SCHEDULED → TRADING_1 ──────────────────────────────────────
  if (isTrading && hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
    const result = await db.tradingSession.updateMany({
      where: {
        currentStatus: "SCHEDULED",
        scheduledStart: { lte: now },
      },
      data: { currentStatus: "TRADING_1" },
    });
    opened = result.count;
  }

  // ── 2. SCHLIESSEN: aktive Sessions → FINAL ────────────────────────────────
  if (isTrading && hour >= CLOSE_HOUR) {
    const result = await db.tradingSession.updateMany({
      where: {
        currentStatus: { in: ["TRADING_1", "CORRECTION_1", "TRADING_2", "CORRECTION_2"] },
        endedAt: null,
      },
      data: { currentStatus: "FINAL", endedAt: now },
    });
    closed = result.count;
  }

  // ── 3. VORBEREITUNG: heutige Sessions für aktive Produkte anlegen ─────────
  if (isTrading && hour >= 7 && hour < OPEN_HOUR) {
    const scheduledStart = berlinToUtc(berlinDateStr, OPEN_HOUR);

    // Bereits vorhandene Sessions für heute laden
    const existing = await db.tradingSession.findMany({
      where: {
        scheduledStart: {
          gte: new Date(`${berlinDateStr}T00:00:00Z`),
          lt:  new Date(`${berlinDateStr}T23:59:59Z`),
        },
      },
      select: { productId: true },
    });
    const coveredIds = new Set(existing.map(s => s.productId));

    // Alle aktiven Produkte ohne heutige Session
    const products = await db.product.findMany({
      where: { isActive: true, id: { notIn: Array.from(coveredIds) } },
      select: { id: true },
    });

    if (products.length > 0) {
      await db.tradingSession.createMany({
        data: products.map(p => ({
          productId:    p.id,
          currentStatus: "SCHEDULED",
          scheduledStart,
        })),
        skipDuplicates: true,
      });
      prepared = products.length;
    }
  }

  console.info(
    `[session-lifecycle] Berlin ${hour}:xx Wochentag=${weekday}: ` +
    `geöffnet=${opened} geschlossen=${closed} vorbereitet=${prepared}`,
  );

  return NextResponse.json({
    ok:         true,
    berlinHour: hour,
    weekday,
    isTrading,
    opened,
    closed,
    prepared,
    durationMs: Date.now() - start,
  });
}
