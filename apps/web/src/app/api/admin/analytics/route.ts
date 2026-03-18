/**
 * GET /api/admin/analytics
 *
 * Tägliches Handelsvolumen und Plattform-Gebühren der letzten 30 Tage.
 * Aggregiert aus der Deal-Tabelle und LedgerEntry (EUCX_FEE_REVENUE).
 *
 * Response:
 *   { days: DailyStats[], totals: { volume, fees, dealCount } }
 */
import { NextResponse } from "next/server";
import { db }           from "@/lib/db/client";
import Decimal          from "decimal.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    // ── Deals der letzten 30 Tage ─────────────────────────────────────────
    const deals = await db.deal.findMany({
      where:   { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select:  { id: true, totalValue: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // ── Plattform-Gebühren (LedgerEntry EUCX_FEE_REVENUE) ────────────────
    let feeEntries: { amount: unknown; createdAt: Date }[] = [];
    try {
      feeEntries = await db.ledgerEntry.findMany({
        where: {
          accountType: "EUCX_FEE_REVENUE",
          entryType:   "CREDIT",
          createdAt:   { gte: since },
        },
        select:  { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });
    } catch {
      // LedgerEntry noch nicht befüllt - ignorieren
    }

    // ── Aggregation nach Tag ──────────────────────────────────────────────
    type DayAccum = { date: string; volume: InstanceType<typeof Decimal>; fees: InstanceType<typeof Decimal>; dealCount: number };
    const dayMap: Record<string, DayAccum> = {};

    // Alle 30 Tage vorinitialisieren (kein Datenlücken-Problem in Charts)
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key, volume: new Decimal(0), fees: new Decimal(0), dealCount: 0 };
    }

    for (const deal of deals) {
      const key = deal.createdAt.toISOString().slice(0, 10);
      if (!dayMap[key]) continue;
      dayMap[key].volume = dayMap[key].volume.plus(new Decimal(deal.totalValue.toString()));
      dayMap[key].dealCount++;
    }

    for (const fee of feeEntries) {
      const key = fee.createdAt.toISOString().slice(0, 10);
      if (!dayMap[key]) continue;
      dayMap[key].fees = dayMap[key].fees.plus(new Decimal(String(fee.amount)));
    }

    const days = Object.values(dayMap).map((d) => ({
      date:       d.date,
      volume:     d.volume.toFixed(2),
      fees:       d.fees.toFixed(2),
      dealCount:  d.dealCount,
    }));

    const totals = days.reduce(
      (acc, d) => ({
        volume:     new Decimal(acc.volume).plus(d.volume).toFixed(2),
        fees:       new Decimal(acc.fees).plus(d.fees).toFixed(2),
        dealCount:  acc.dealCount + d.dealCount,
      }),
      { volume: "0", fees: "0", dealCount: 0 },
    );

    return NextResponse.json({ days, totals });
  } catch (err) {
    console.error("[GET /api/admin/analytics]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
