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
      // ZAG: keine Wallet-Rückbuchung — Käufer/Verkäufer regeln direkt per Banküberweisung
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

    } else if (resolution === "PARTIAL_REFUND" && refundAmount) {
      // Teilrückerstattung — Deal als abgeschlossen markieren
      // ZAG: keine Wallet-Rückbuchung — Rückerstattung erfolgt direkt per Banküberweisung
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
