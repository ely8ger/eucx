/**
 * QStash Worker — Post-Trade-Verarbeitung nach Auktionsende
 *
 * Wird von der QStash-Queue aufgerufen nachdem der Cronjob
 * einen Lot via concludeLot() in die CONCLUSION-Phase versetzt hat.
 *
 * Auth:
 *   Production  — Upstash-Signatur (QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY)
 *   Dev / Test  — CRON_SECRET Bearer (gleiche Route, direkt aufrufbar)
 *
 * QStash wiederholt den Aufruf bei non-2xx Antwort automatisch (konfiguriert: 5×).
 * processLotConclusion ist idempotent — Mehrfachaufrufe sind sicher.
 */

import { NextRequest, NextResponse } from "next/server";
import { Receiver }                  from "@upstash/qstash";
import { processLotConclusion }      from "@/lib/auction/post-trade";
import { notifyAuctionClosed }       from "@/lib/notifications/notification-service";
import { db }                        from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized(req: NextRequest, rawBody: string): Promise<boolean> {
  const sig = req.headers.get("upstash-signature");

  if (sig) {
    const cur  = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const next = process.env.QSTASH_NEXT_SIGNING_KEY;
    if (!cur || !next) return false;
    const receiver = new Receiver({ currentSigningKey: cur, nextSigningKey: next });
    try {
      await receiver.verify({ signature: sig, body: rawBody });
      return true;
    } catch {
      return false;
    }
  }

  // Dev-Fallback: direkt mit CRON_SECRET aufrufbar
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!(await authorized(req, rawBody))) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { lotId?: unknown };
  try {
    body = JSON.parse(rawBody) as { lotId?: unknown };
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const lotId = body.lotId;
  if (typeof lotId !== "string" || !lotId) {
    return NextResponse.json({ code: "MISSING_LOT_ID" }, { status: 400 });
  }

  try {
    await processLotConclusion(lotId);

    // Notification nach erfolgreichem Post-Trade (Contract-Nummer liegt nun in DB vor)
    const [lot, contract] = await Promise.all([
      db.lot.findUnique({
        where:  { id: lotId },
        select: { buyerId: true, winnerId: true, commodity: true, currentBest: true },
      }),
      db.lotContract.findUnique({
        where:  { lotId },
        select: { contractNumber: true },
      }),
    ]);

    if (lot?.winnerId && lot?.buyerId && contract) {
      notifyAuctionClosed(
        lotId,
        lot.winnerId,
        lot.buyerId,
        lot.commodity,
        lot.currentBest?.toString() ?? "-",
        contract.contractNumber,
      ).catch(console.error);
    }

    return NextResponse.json({ ok: true, lotId });
  } catch (err) {
    console.error(`[Worker/lot-conclusion] Lot ${lotId} fehlgeschlagen:`, err);
    // 500 → QStash löst automatischen Retry aus
    return NextResponse.json({ code: "PROCESSING_ERROR", lotId }, { status: 500 });
  }
}
