/**
 * GET /api/cron/settlement-retry
 *
 * Verarbeitet alle PENDING und FAILED Settlements (retryCount < 5).
 *
 * Zwei Pfade:
 *   dealId gesetzt        → runSettlement(dealId)        [Deal-basiert]
 *   lotContractId gesetzt → settleEscrowForLot(id)       [Auktions-basiert]
 *
 * Nach 5 Fehlversuchen: errorMessage setzen, Status = FAILED (kein weiterer Retry).
 *
 * Schedule: "* /10 * * * *" (alle 10 Minuten)
 * Auth: CRON_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { runSettlement }             from "@/lib/clearing/clearing-service";
import { settleEscrowForLot }        from "@/lib/clearing/lot-clearing-service";
import { SETTLEMENT_ENABLED }        from "@/lib/feature-flags";
import { pingCronHealthcheck }       from "@/lib/monitoring/healthcheck";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 60;

const MAX_RETRIES = 5;
const BATCH_SIZE  = 20;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const start = Date.now();

  if (!SETTLEMENT_ENABLED) {
    return NextResponse.json({ ok: true, processed: 0, skipped: "settlement_disabled", durationMs: 0 });
  }

  const pending = await db.settlement.findMany({
    where: {
      status:     { in: ["PENDING", "FAILED"] },
      retryCount: { lt: MAX_RETRIES },
    },
    select: {
      id:             true,
      dealId:         true,
      lotContractId:  true,
      retryCount:     true,
    },
    take:    BATCH_SIZE,
    orderBy: { retryCount: "asc" },
  });

  if (pending.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, durationMs: Date.now() - start });
  }

  let succeeded = 0;
  let failed    = 0;

  for (const s of pending) {
    try {
      if (s.dealId) {
        await runSettlement(s.dealId);
      } else if (s.lotContractId) {
        await settleEscrowForLot(s.lotContractId);
      } else {
        throw new Error("Settlement ohne dealId und lotContractId");
      }
      succeeded++;
    } catch (err) {
      failed++;
      const nextRetry = s.retryCount + 1;
      const isFinal   = nextRetry >= MAX_RETRIES;
      await db.settlement.update({
        where: { id: s.id },
        data: {
          status:       isFinal ? "FAILED" : "PENDING",
          retryCount:   nextRetry,
          errorMessage: err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500),
        },
      }).catch(console.error);
      console.error(`[settlement-retry] Settlement ${s.id} fehlgeschlagen (Versuch ${nextRetry}):`, err);
    }
  }

  console.info(`[settlement-retry] ${succeeded} erfolgreich, ${failed} fehlgeschlagen, ${Date.now() - start}ms`);

  pingCronHealthcheck("settlement-retry");
  return NextResponse.json({
    ok:         true,
    processed:  pending.length,
    succeeded,
    failed,
    durationMs: Date.now() - start,
  });
}
