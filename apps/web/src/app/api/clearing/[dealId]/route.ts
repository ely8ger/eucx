/**
 * POST /api/clearing/[dealId] - Settlement eines signierten Deals auslösen
 * GET  /api/clearing/[dealId] - Settlement-Status abfragen
 *
 * Aufruf-Zeitpunkt:
 *   Automatisch nach erfolgreicher Signatur (POST /api/contracts/[id])
 *   oder manuell durch Admin.
 *
 * Sicherheit:
 *   - Nur der Käufer oder Verkäufer des Deals darf Settlement auslösen
 *   - Deal muss Status CONTRACT_SIGNED haben
 *   - Idempotenz: erneuter Aufruf bei COMPLETED gibt 200 zurück, führt aber nichts aus
 */

import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { runSettlement }             from "@/lib/clearing/clearing-service";

export const dynamic = "force-dynamic";

// ─── POST /api/clearing/[dealId] - Settlement auslösen ───────────────────────

export async function POST(
  req:     NextRequest,
  context: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await context.params;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: { userId: string };
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  try {
    // ── Deal laden + Berechtigung prüfen ──────────────────────────────────
    const deal = await db.deal.findUnique({
      where:   { id: dealId },
      include: {
        buyOrder:   { select: { userId: true } },
        sellOrder:  { select: { userId: true } },
        settlement: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal nicht gefunden" }, { status: 404 });
    }

    const isParty =
      deal.buyOrder.userId  === tokenPayload.userId ||
      deal.sellOrder.userId === tokenPayload.userId;
    if (!isParty) {
      return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
    }

    // ── Idempotenz: bereits abgeschlossen? ────────────────────────────────
    if (deal.settlement?.status === "COMPLETED") {
      return NextResponse.json({
        status:      "COMPLETED",
        settlementId: deal.settlement.id,
        message:     "Settlement bereits abgeschlossen",
      });
    }

    // ── Status-Prüfung ────────────────────────────────────────────────────
    if (deal.status !== "CONTRACT_SIGNED") {
      return NextResponse.json(
        {
          error:  `Settlement nicht möglich - Deal hat Status: ${deal.status}`,
          detail: "Nur CONTRACT_SIGNED Deals können gecleart werden.",
        },
        { status: 409 }
      );
    }

    // ── Settlement ausführen ──────────────────────────────────────────────
    const result = await runSettlement(dealId);

    // ── Audit Log ─────────────────────────────────────────────────────────
    await audit({
      userId:     tokenPayload.userId,
      action:     "SETTLEMENT_COMPLETED",
      entityType: "Settlement",
      entityId:   result.settlementId,
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta: {
        dealId,
        grossAmount:      result.grossAmount,
        platformFee:      result.platformFee,
        vatAmount:        result.vatAmount,
        netToSeller:      result.netToSeller,
        isReverseCharge:  result.isReverseCharge,
        buyerInvoiceId:   result.buyerInvoiceId,
        sellerCreditId:   result.sellerCreditId,
        ledgerEntryCount: result.ledgerEntryCount,
      },
    });

    return NextResponse.json({
      status:           "COMPLETED",
      settlementId:     result.settlementId,
      grossAmount:      result.grossAmount,
      platformFee:      result.platformFee,
      vatAmount:        result.vatAmount,
      netToSeller:      result.netToSeller,
      isReverseCharge:  result.isReverseCharge,
      buyerInvoiceId:   result.buyerInvoiceId,
      sellerCreditId:   result.sellerCreditId,
      ledgerEntryCount: result.ledgerEntryCount,
      message:          "Settlement erfolgreich abgeschlossen",
    }, { status: 201 });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error(`[POST /api/clearing/${dealId}]`, err);

    await audit({
      userId:     tokenPayload.userId,
      action:     "SETTLEMENT_FAILED",
      entityType: "Settlement",
      entityId:   dealId,
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta:       { error: message },
    }).catch(() => {});  // Audit darf nie den Hauptfehler überdecken

    return NextResponse.json(
      { error: "Settlement fehlgeschlagen", detail: message },
      { status: 500 }
    );
  }
}

// ─── GET /api/clearing/[dealId] - Status abfragen ────────────────────────────

export async function GET(
  req:     NextRequest,
  context: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  const settlement = await db.settlement.findUnique({
    where:   { dealId },
    include: {
      deal: {
        include: {
          invoices: {
            select: {
              id:            true,
              invoiceNumber: true,
              type:          true,
              status:        true,
              netPayable:    true,
              issuedAt:      true,
            },
          },
        },
      },
    },
  });

  if (!settlement) {
    return NextResponse.json({ error: "Kein Settlement gefunden" }, { status: 404 });
  }

  return NextResponse.json({
    settlementId:  settlement.id,
    dealId:        settlement.dealId,
    status:        settlement.status,
    grossAmount:   settlement.grossAmount,
    platformFee:   settlement.platformFee,
    vatAmount:     settlement.vatAmount,
    netToSeller:   settlement.netToSeller,
    currency:      settlement.currency,
    processedAt:   settlement.processedAt,
    errorMessage:  settlement.errorMessage,
    invoices:      settlement.deal.invoices,
  });
}
