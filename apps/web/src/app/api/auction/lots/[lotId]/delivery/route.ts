/**
 * PATCH /api/auction/lots/[lotId]/delivery
 *
 * Aktualisiert den Lieferstatus eines abgeschlossenen Kontrakts.
 * Übergänge: MATCHED → AWAITING_PAYMENT → READY_FOR_PICKUP → IN_TRANSIT → DELIVERED → COMPLETED
 *
 * Bei READY_FOR_PICKUP: pickupCode wird automatisch generiert (6-stellig numerisch).
 * Bei DELIVERED: deliveredAt wird gesetzt.
 *
 * Auth: Bearer JWT — Seller (Eigentümer) oder Admin
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { DeliveryStatus } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

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

export async function PATCH(
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

  const contract = await db.lotContract.findUnique({
    where: { lotId },
    select: { id: true, sellerId: true, deliveryStatus: true },
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

  // Automatisch: pickupCode generieren wenn READY_FOR_PICKUP
  const extraData: Record<string, unknown> = {};
  if (newStatus === DeliveryStatus.READY_FOR_PICKUP) {
    extraData.pickupCode = crypto.randomInt(100000, 999999).toString();
  }
  if (newStatus === DeliveryStatus.DELIVERED) {
    extraData.deliveredAt = new Date();
  }

  const updated = await db.lotContract.update({
    where: { id: contract.id },
    data:  { deliveryStatus: newStatus, ...extraData },
    select: {
      id:             true,
      lotId:          true,
      deliveryStatus: true,
      pickupCode:     true,
      deliveredAt:    true,
      cmrUploadedAt:  true,
    },
  });

  return NextResponse.json(updated);
}
