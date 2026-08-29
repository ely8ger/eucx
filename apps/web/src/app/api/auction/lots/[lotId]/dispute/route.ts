/**
 * POST /api/auction/lots/[lotId]/dispute
 *
 * Eröffnet einen Streitfall auf einem LotContract.
 * Berechtigt: Käufer (buyerId) oder Verkäufer (sellerId) des Kontrakts.
 *
 * Wirkung:
 *   1. LotDispute-Eintrag erstellt
 *   2. LotContract.deliveryStatus → DISPUTED (Escrow eingefroren)
 *   3. LotContract.disputedAt = now()
 *   4. AuditLog: DEAL_DISPUTED
 *
 * Zeitfenster: nur solange deliveryStatus < COMPLETED und kein offener Dispute.
 * Typischer Fall: Käufer stellt Qualitätsmangel innerhalb 48h nach DELIVERED fest.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { DeliveryStatus }            from "@prisma/client";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const TERMINAL_STATUSES: DeliveryStatus[] = [
  DeliveryStatus.COMPLETED,
  DeliveryStatus.DISPUTED,
  DeliveryStatus.DEFAULTED,
];

const bodySchema = z.object({
  reason:       z.string().min(10).max(2000),
  evidenceUrls: z.array(z.string().url()).max(10).optional().default([]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  let contract;
  try {
    contract = await db.lotContract.findUnique({
      where:  { lotId },
      select: { id: true, buyerId: true, sellerId: true, deliveryStatus: true, totalValue: true, dispute: { select: { id: true } } },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[dispute/route] DB-Fehler:", msg);
    return NextResponse.json(
      { error: "Dispute-System vorübergehend nicht verfügbar. Bitte wenden Sie sich an den Support." },
      { status: 503 }
    );
  }
  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  const isParty = contract.buyerId === token.userId || contract.sellerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"].includes(token.role);
  if (!isParty && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff — nur Käufer, Verkäufer oder Admin" }, { status: 403 });
  }

  if (TERMINAL_STATUSES.includes(contract.deliveryStatus)) {
    return NextResponse.json(
      { error: `Kontrakt im Status '${contract.deliveryStatus}' kann nicht angefochten werden.` },
      { status: 409 }
    );
  }

  if (contract.dispute) {
    return NextResponse.json({ error: "Für diesen Kontrakt besteht bereits ein offener Streitfall." }, { status: 409 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const { reason, evidenceUrls } = parsed.data;
  const now = new Date();

  // Atomische Transaktion: Dispute erstellen + LotContract einfrieren
  const dispute = await db.$transaction(async (tx) => {
    const d = await tx.lotDispute.create({
      data: {
        contractId:   contract.id,
        raisedById:   token.userId,
        reason,
        evidenceUrls,
      },
    });
    await tx.lotContract.update({
      where: { id: contract.id },
      data:  { deliveryStatus: DeliveryStatus.DISPUTED, disputedAt: now },
    });
    return d;
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",").at(0)?.trim() ?? undefined;
  void audit({
    userId:     token.userId,
    action:     "DEAL_DISPUTED",
    entityType: "Deal",
    entityId:   contract.id,
    ipAddress:  ip,
    meta:       { lotId, reason: reason.slice(0, 100), evidenceCount: evidenceUrls.length },
  });

  return NextResponse.json({ ok: true, disputeId: dispute.id }, { status: 201 });
}
