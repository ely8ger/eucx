/**
 * PATCH /api/admin/lots/[lotId]/dispute
 * GET   /api/admin/lots/[lotId]/dispute
 *
 * Admin-Verwaltung von LotDisputes.
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 *
 * PATCH — Status-Transition:
 *   OPEN → UNDER_REVIEW   (Prüfung beginnt)
 *   OPEN | UNDER_REVIEW → RESOLVED   (Streit beigelegt → Lieferung wird fortgesetzt)
 *   OPEN | UNDER_REVIEW → CANCELLED  (Auftrag storniert → Escrow zurück an Käufer)
 *
 * Bei RESOLVED: LotContract.deliveryStatus → zurück zu AWAITING_PAYMENT
 * Bei CANCELLED: Escrow-Rückbuchung an Käufer (Wallet-Gutschrift)
 *
 * GET — Streitfall laden
 */
import { NextRequest, NextResponse }      from "next/server";
import { db }                             from "@/lib/db/client";
import { requireAuth }                    from "@/lib/auth/jwt";
import { audit }                          from "@/lib/audit/logger";
import { z }                              from "zod";
import Decimal                            from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

const patchSchema = z.object({
  // RESOLVED wird NUR über diesen Admin-Endpoint gesetzt (mit Wallet-Release bei CANCELLED)
  status:       z.enum(["UNDER_REVIEW", "RESOLVED", "CANCELLED"]),
  adminComment: z.string().max(2000).optional(),
  // Bei CANCELLED: optionaler Teilrückerstattungs-Betrag (Default: volle Summe)
  refundAmount: z.string().optional(),
});

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  req:     NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { lotId } = await params;

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: {
      id:             true,
      contractNumber: true,
      totalValue:     true,
      deliveryStatus: true,
      dispute: {
        select: {
          id:                true,
          status:            true,
          reason:            true,
          evidenceUrls:      true,
          adminComment:      true,
          manualRefundAmount: true,
          createdAt:         true,
          updatedAt:         true,
          resolvedAt:        true,
          raisedBy: { select: { id: true, email: true, role: true } },
          reviewedBy: { select: { id: true, email: true } },
        },
      },
    },
  });

  if (!contract) return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  if (!contract.dispute) return NextResponse.json({ error: "Kein Streitfall vorhanden" }, { status: 404 });

  return NextResponse.json({ contract, dispute: contract.dispute });
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(
  req:     NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { lotId } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const { status, adminComment, refundAmount } = parsed.data;

  // Contract + Dispute laden
  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: {
      id:             true,
      buyerId:        true,
      totalValue:     true,
      deliveryStatus: true,
      buyer: { select: { organizationId: true } },
      dispute: { select: { id: true, status: true } },
    },
  });

  if (!contract) return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  if (!contract.dispute) return NextResponse.json({ error: "Kein Streitfall vorhanden" }, { status: 404 });

  const current = contract.dispute.status;
  if (current === "RESOLVED" || current === "CANCELLED") {
    return NextResponse.json({ error: `Streitfall bereits abgeschlossen (${current})` }, { status: 409 });
  }

  const now = new Date();

  // Transaktion: Dispute-Update + optionale Wallet-Aktionen
  await db.$transaction(async (tx) => {
    // 1. Dispute-Status setzen
    await tx.lotDispute.update({
      where: { id: contract.dispute!.id },
      data: {
        status:      status,
        adminComment: adminComment ?? undefined,
        reviewedById: token.userId,
        resolvedAt:  status === "RESOLVED" || status === "CANCELLED" ? now : undefined,
        manualRefundAmount: refundAmount ? new Decimal(refundAmount).toFixed(2) : undefined,
      },
    });

    if (status === "RESOLVED") {
      // Lieferung kann wieder fortgesetzt werden
      await tx.lotContract.update({
        where: { id: contract.id },
        data:  { deliveryStatus: "AWAITING_PAYMENT", disputedAt: null },
      });

    } else if (status === "CANCELLED") {
      // ZAG: keine Wallet-Rückbuchung — Rückerstattung direkt per Banküberweisung

      // LotContract auf DEFAULTED setzen
      await tx.lotContract.update({
        where: { id: contract.id },
        data:  { deliveryStatus: "DEFAULTED", defaultedAt: now },
      });
    }
  });

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Deal",
    entityId:   contract.id,
    ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
    meta:       { event: "LOT_DISPUTE_RESOLVED", lotId, newStatus: status, adminComment },
  });

  return NextResponse.json({ ok: true, disputeId: contract.dispute.id, newStatus: status });
}
