/**
 * PATCH /api/auction/lots/[lotId]/delivery
 *
 * Aktualisiert den Lieferstatus eines abgeschlossenen Kontrakts.
 * Übergänge: MATCHED → AWAITING_PAYMENT → READY_FOR_PICKUP → IN_TRANSIT → DELIVERED → COMPLETED
 *
 * Bei READY_FOR_PICKUP: pickupCode wird automatisch generiert (6-stellig numerisch).
 * Bei DELIVERED: deliveredAt wird gesetzt.
 *
 * Auth: Bearer JWT - Seller (Eigentümer) oder Admin
 */
import { NextRequest, NextResponse }    from "next/server";
import { db }                           from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { DeliveryStatus }               from "@prisma/client";
import { settleEscrowForLot }           from "@/lib/clearing/lot-clearing-service";
import { audit }                        from "@/lib/audit/logger";
import { z } from "zod";
import crypto from "crypto";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

const DELIVERY_ORDER: DeliveryStatus[] = [
  DeliveryStatus.MATCHED,
  DeliveryStatus.AWAITING_PAYMENT,
  DeliveryStatus.READY_FOR_PICKUP,
  DeliveryStatus.IN_TRANSIT,
  DeliveryStatus.DELIVERED,
  DeliveryStatus.COMPLETED,
];

const patchSchema = z.object({
  status: z.enum(["MATCHED", "AWAITING_PAYMENT", "READY_FOR_PICKUP", "IN_TRANSIT", "DELIVERED", "COMPLETED"]),
});

async function _PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: { id: true, sellerId: true, deliveryStatus: true, paymentSentAt: true },
  });
  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  const isOwner = contract.sellerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"].includes(token.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const newStatus    = parsed.data.status as DeliveryStatus;
  const currentIdx   = DELIVERY_ORDER.indexOf(contract.deliveryStatus);
  const newIdx       = DELIVERY_ORDER.indexOf(newStatus);

  // Nur vorwärts erlaubt (kein Status-Rollback)
  if (newIdx <= currentIdx) {
    return NextResponse.json(
      { error: `Statusübergang von '${contract.deliveryStatus}' zu '${newStatus}' ist nicht erlaubt.` },
      { status: 409 }
    );
  }
  // Nur nächster Status erlaubt (kein Überspringen)
  if (newIdx !== currentIdx + 1) {
    return NextResponse.json(
      { error: `Status muss schrittweise erhöht werden. Nächster erlaubter Status: '${DELIVERY_ORDER[currentIdx + 1]}'.` },
      { status: 409 }
    );
  }

  // IN_TRANSIT → DELIVERED: nur Käufer (via buyer-delivery-Endpunkt), nicht Verkäufer
  if (newStatus === DeliveryStatus.DELIVERED && !isAdmin) {
    return NextResponse.json(
      { error: "Wareneingang kann nur vom Käufer bestätigt werden." },
      { status: 403 }
    );
  }

  // AWAITING_PAYMENT → READY_FOR_PICKUP: Käufer muss zuerst Zahlung gemeldet haben
  if (newStatus === DeliveryStatus.READY_FOR_PICKUP && !contract.paymentSentAt && !isAdmin) {
    return NextResponse.json(
      { error: "Käufer hat die Zahlung noch nicht gemeldet. Bitte warten Sie, bis der Käufer die Überweisung bestätigt hat." },
      { status: 409 }
    );
  }

  // Automatisch: pickupCode generieren wenn READY_FOR_PICKUP
  const extraData: Record<string, unknown> = {};
  if (newStatus === DeliveryStatus.READY_FOR_PICKUP) {
    extraData.pickupCode = crypto.randomInt(100000, 999999).toString();
  }
  if (newStatus === DeliveryStatus.DELIVERED) {
    extraData.deliveredAt = new Date();
  }

  // Alle Übergänge atomar: WHERE currentStatus verhindert Race Condition bei parallelen Requests.
  // COMPLETED: WHERE DELIVERED — Settlement darf nicht doppelt ausgelöst werden.
  // Alle anderen: WHERE contract.deliveryStatus — verhindert doppeltes Setzen desselben Zustands.
  const SELECT = { id: true, lotId: true, deliveryStatus: true, pickupCode: true, deliveredAt: true, cmrUploadedAt: true } as const;

  const atomicResult = await db.lotContract.updateMany({
    where: { id: contract.id, deliveryStatus: contract.deliveryStatus },
    data:  { deliveryStatus: newStatus, ...extraData },
  });
  if (atomicResult.count === 0) {
    return NextResponse.json(
      { error: "Status wurde zwischenzeitlich geändert — bitte Seite neu laden." },
      { status: 409 },
    );
  }

  const updated = await db.lotContract.findUniqueOrThrow({ where: { id: contract.id }, select: SELECT });

  // Phase 2 Settlement: COMPLETED → Escrow auflösen und Verkäufer auszahlen
  if (newStatus === DeliveryStatus.COMPLETED) {
    settleEscrowForLot(contract.id)
      .then((res) => {
        void audit({
          userId:     token.userId,
          action:     "SETTLEMENT_COMPLETED",
          entityType: "Settlement",
          entityId:   contract.id,
          meta: {
            lotId,
            netToSeller:     res.netToSeller,
            platformFee:     res.platformFee,
            vatAmount:       res.vatAmount,
            isReverseCharge: res.isReverseCharge,
            ledgerEntries:   res.ledgerEntryCount,
          },
        });
      })
      .catch((err) => {
        console.error(`[Delivery] Settlement fehlgeschlagen für ${contract.id}:`, err);
        void audit({
          userId:     token.userId,
          action:     "SETTLEMENT_FAILED",
          entityType: "Settlement",
          entityId:   contract.id,
          meta: { lotId, error: String(err) },
        });
      });
  }

  return NextResponse.json(updated);
}

export const PATCH = apiRoute(_PATCH);
