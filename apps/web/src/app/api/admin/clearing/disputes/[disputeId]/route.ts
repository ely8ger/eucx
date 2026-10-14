/**
 * GET  /api/admin/clearing/disputes/[disputeId]  — Streitfall laden
 * PATCH /api/admin/clearing/disputes/[disputeId] — Deal-Dispute auflösen
 *
 * Admin-Verwaltung von TradeDisputes (Deal-basiert, kontinuierliches Trading).
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 *
 * Status-Transitionen:
 *   OPEN → UNDER_REVIEW     (Prüfung beginnt, kein Wallet-Effekt)
 *   * → TRADE_UPHELD        (Käufer unterliegt — Deal → CONTRACT_SIGNED, Settlement fortsetzen)
 *   * → TRADE_REVERSED      (Storno — Deal → CANCELLED, Settlement → FAILED, Wallet-Gutschrift)
 *   * → PARTIAL_REFUND      (Teilrückerstattung — manualRefundAmount an Käufer)
 */
import { NextRequest, NextResponse }  from "next/server";
import { db }                         from "@/lib/db/client";
import { requireAuth }                from "@/lib/auth/jwt";
import { audit }                      from "@/lib/audit/logger";
import { z }                          from "zod";
import Decimal                        from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

const patchSchema = z.object({
  // UNDER_REVIEW: Prüfung beginnt
  // RESOLVED: TRADE_UPHELD oder PARTIAL_REFUND (Trade gilt)
  // CANCELLED: TRADE_REVERSED (Trade storniert)
  status:       z.enum(["UNDER_REVIEW", "RESOLVED", "CANCELLED"]),
  resolution:   z.enum(["TRADE_UPHELD", "TRADE_REVERSED", "PARTIAL_REFUND"]).optional(),
  adminComment: z.string().max(2000).optional(),
  refundAmount: z.string().optional(),  // nur bei PARTIAL_REFUND
});

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  req:     NextRequest,
  { params }: { params: Promise<{ disputeId: string }> },
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { disputeId } = await params;

  const dispute = await db.tradeDispute.findUnique({
    where: { id: disputeId },
    include: {
      raisedBy:   { select: { id: true, email: true, role: true } },
      reviewedBy: { select: { id: true, email: true } },
      deal: {
        select: {
          id:         true,
          status:     true,
          totalValue: true,
          currency:   true,
          buyOrder:   { select: { userId: true } },
          sellOrder:  { select: { userId: true } },
          settlement: { select: { id: true, status: true } },
        },
      },
    },
  });

  if (!dispute) return NextResponse.json({ error: "Streitfall nicht gefunden" }, { status: 404 });

  return NextResponse.json(dispute);
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(
  req:     NextRequest,
  { params }: { params: Promise<{ disputeId: string }> },
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { disputeId } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const { status, resolution, adminComment, refundAmount } = parsed.data;

  // Validierung: RESOLVED erfordert resolution
  if (status === "RESOLVED" && !resolution) {
    return NextResponse.json({ error: "Bei RESOLVED muss 'resolution' angegeben werden" }, { status: 422 });
  }
  if (resolution === "PARTIAL_REFUND" && !refundAmount) {
    return NextResponse.json({ error: "Bei PARTIAL_REFUND muss 'refundAmount' angegeben werden" }, { status: 422 });
  }

  const dispute = await db.tradeDispute.findUnique({
    where: { id: disputeId },
    select: {
      id:         true,
      status:     true,
      resolvedAt: true,
      deal: {
        select: {
          id:         true,
          totalValue: true,
          currency:   true,
          buyOrder: { select: { userId: true } },
          buyerOrg: { select: { id: true } },
          settlement: { select: { id: true, status: true } },
        },
      },
    },
  });

  if (!dispute) return NextResponse.json({ error: "Streitfall nicht gefunden" }, { status: 404 });
  if (dispute.resolvedAt) {
    return NextResponse.json({ error: "Streitfall bereits abgeschlossen" }, { status: 409 });
  }

  const now    = new Date();
  const dealId = dispute.deal.id;

  await db.$transaction(async (tx) => {
    // 1. Dispute-Status aktualisieren
    await tx.tradeDispute.update({
      where: { id: disputeId },
      data: {
        status:            status,
        resolution:        resolution ?? undefined,
        adminComment:      adminComment ?? undefined,
        reviewedById:      token.userId,
        resolvedAt:        (status === "RESOLVED" || status === "CANCELLED") ? now : undefined,
        manualRefundAmount: resolution === "PARTIAL_REFUND" && refundAmount
          ? new Decimal(refundAmount).toFixed(8)
          : undefined,
      },
    });

    if (status === "UNDER_REVIEW") return;  // Nur Status-Update, keine Wallet-Aktion

    if (resolution === "TRADE_UPHELD") {
      // Käufer unterliegt — Deal zurück zu CONTRACT_SIGNED, Settlement kann fortgesetzt werden
      await tx.deal.update({
        where: { id: dealId },
        data:  { status: "CONTRACT_SIGNED" },
      });
      if (dispute.deal.settlement && dispute.deal.settlement.status === "FAILED") {
        await tx.settlement.update({
          where: { id: dispute.deal.settlement.id },
          data:  { status: "PENDING", retryCount: 0, errorMessage: null },
        });
      }

    } else if (resolution === "TRADE_REVERSED") {
      // Storno — Deal CANCELLED, Settlement FAILED (kein weiterer Retry)
      await tx.deal.update({
        where: { id: dealId },
        data:  { status: "CANCELLED" },
      });
      if (dispute.deal.settlement) {
        await tx.settlement.update({
          where: { id: dispute.deal.settlement.id },
          data:  { status: "FAILED", errorMessage: "Streitfall-Storno durch Admin" },
        });
      }
      // Wallet-Rückbuchung: Käufer erhält Bruttobetrag zurück (sofern noch im Escrow)
      const buyerOrg = dispute.deal.buyerOrg;
      if (buyerOrg) {
        const wallet = await tx.wallet.findUnique({ where: { organizationId: buyerOrg.id } });
        if (wallet) {
          const gross = new Decimal(dispute.deal.totalValue.toString());
          const corrId = `deal:${dealId}:trade-reversed`;
          await tx.ledgerEntry.createMany({
            skipDuplicates: true,
            data: [
              {
                correlationId:  corrId,
                walletId:       null,
                accountType:    "ESCROW",
                entryType:      "DEBIT",
                amount:         gross.toFixed(8),
                currency:       dispute.deal.currency,
                description:    `Streitfall-Storno Deal ${dealId}`,
                dealId,
                idempotencyKey: `deal:${dealId}:reversed:DEBIT`,
              },
              {
                correlationId:  corrId,
                walletId:       wallet.id,
                accountType:    "TRADER_WALLET",
                entryType:      "CREDIT",
                amount:         gross.toFixed(8),
                currency:       dispute.deal.currency,
                description:    `Streitfall-Rückbuchung Deal ${dealId} an Käufer`,
                dealId,
                idempotencyKey: `deal:${dealId}:reversed:CREDIT`,
              },
            ],
          });
          await tx.wallet.update({
            where: { id: wallet.id },
            data:  { balance: { increment: gross.toFixed(8) } },
          });
        }
      }

    } else if (resolution === "PARTIAL_REFUND" && refundAmount) {
      // Teilrückerstattung — refundAmount an Käufer
      const buyerOrg = dispute.deal.buyerOrg;
      if (buyerOrg) {
        const wallet = await tx.wallet.findUnique({ where: { organizationId: buyerOrg.id } });
        if (wallet) {
          const refund = new Decimal(refundAmount);
          const corrId = `deal:${dealId}:partial-refund`;
          await tx.ledgerEntry.createMany({
            skipDuplicates: true,
            data: [
              {
                correlationId:  corrId,
                walletId:       null,
                accountType:    "ESCROW",
                entryType:      "DEBIT",
                amount:         refund.toFixed(8),
                currency:       dispute.deal.currency,
                description:    `Teilrückerstattung Streitfall Deal ${dealId}`,
                dealId,
                idempotencyKey: `deal:${dealId}:partial-refund:DEBIT`,
              },
              {
                correlationId:  corrId,
                walletId:       wallet.id,
                accountType:    "TRADER_WALLET",
                entryType:      "CREDIT",
                amount:         refund.toFixed(8),
                currency:       dispute.deal.currency,
                description:    `Teilrückerstattung Deal ${dealId} an Käufer`,
                dealId,
                idempotencyKey: `deal:${dealId}:partial-refund:CREDIT`,
              },
            ],
          });
          await tx.wallet.update({
            where: { id: wallet.id },
            data:  { balance: { increment: refund.toFixed(8) } },
          });
        }
      }
      // Deal bleibt CONTRACT_SIGNED (Trade gilt als abgeschlossen mit Teilrückerstattung)
      await tx.deal.update({ where: { id: dealId }, data: { status: "SETTLEMENT_COMPLETE" } });
    }
  });

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Deal",
    entityId:   dealId,
    meta:       { event: "TRADE_DISPUTE_RESOLVED", disputeId, newStatus: status, resolution, adminComment },
  });

  return NextResponse.json({ ok: true, disputeId, newStatus: status, resolution: resolution ?? null });
}
