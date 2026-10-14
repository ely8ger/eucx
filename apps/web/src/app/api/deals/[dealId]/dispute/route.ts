/**
 * POST /api/deals/[dealId]/dispute
 *
 * Eröffnet einen Streitfall auf einem Deal (kontinuierliches Trading).
 * Berechtigt: Käufer oder Verkäufer des Deals.
 *
 * Wirkung:
 *   1. TradeDispute-Eintrag erstellt
 *   2. Deal.status → DISPUTED (Settlement eingefroren)
 *   3. AuditLog: DEAL_DISPUTED
 *   4. Compliance-Benachrichtigung
 *
 * Nur möglich wenn Deal.status in [CONTRACT_SIGNED] und noch kein Dispute existiert.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason:       z.string().min(10).max(2000),
  evidenceUrls: z.array(z.string().url()).max(10).optional().default([]),
});

export async function POST(
  req:     NextRequest,
  { params }: { params: Promise<{ dealId: string }> },
) {
  const { dealId } = await params;

  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const deal = await db.deal.findUnique({
    where:  { id: dealId },
    select: {
      id:          true,
      status:      true,
      sellerOrgId: true,
      buyerOrgId:  true,
      dispute:     { select: { id: true } },
      buyOrder:    { select: { userId: true } },
      sellOrder:   { select: { userId: true } },
    },
  });

  if (!deal) return NextResponse.json({ error: "Deal nicht gefunden" }, { status: 404 });

  const isParty = deal.buyOrder.userId === token.userId || deal.sellOrder.userId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"].includes(token.role);
  if (!isParty && !isAdmin) {
    return NextResponse.json({ error: "Keine Berechtigung — nur Käufer, Verkäufer oder Admin" }, { status: 403 });
  }

  if (!["CONTRACT_SIGNED"].includes(deal.status)) {
    return NextResponse.json(
      { error: `Deal im Status '${deal.status}' kann nicht angefochten werden.` },
      { status: 409 },
    );
  }

  if (deal.dispute) {
    return NextResponse.json({ error: "Für diesen Deal besteht bereits ein offener Streitfall." }, { status: 409 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const { reason, evidenceUrls } = parsed.data;

  const dispute = await db.$transaction(async (tx) => {
    const d = await tx.tradeDispute.create({
      data: {
        dealId,
        raisedById:   token.userId,
        reason,
        evidenceUrls,
      },
    });
    await tx.deal.update({
      where: { id: dealId },
      data:  { status: "DISPUTED" },
    });
    return d;
  });

  void audit({
    userId:     token.userId,
    action:     "DEAL_DISPUTED",
    entityType: "Deal",
    entityId:   dealId,
    ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
    meta:       { reason: reason.slice(0, 100), evidenceCount: evidenceUrls.length },
  });

  const raisedByRole = deal.buyOrder.userId === token.userId ? "Käufer" : "Verkäufer";
  const complianceEmail = process.env.COMPLIANCE_EMAIL ?? "compliance@eucx.eu";
  sendAuctionMail({
    to:       complianceEmail,
    subject:  `[EUCX Compliance] Streitfall eröffnet — Deal ${dealId}`,
    template: "dispute_opened_admin",
    data: { disputeId: dispute.id, contractId: dealId, lotId: dealId, raisedByRole, reason: reason.slice(0, 300), openedAt: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) },
  }).catch(console.error);

  return NextResponse.json({ ok: true, disputeId: dispute.id }, { status: 201 });
}
