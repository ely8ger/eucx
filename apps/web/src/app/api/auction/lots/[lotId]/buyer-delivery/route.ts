/**
 * POST /api/auction/lots/[lotId]/buyer-delivery
 *
 * Käufer bestätigt Wareneingang: IN_TRANSIT → DELIVERED
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { sendAuctionMail } from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  let token: { userId: string };
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { lotId } = await params;
  const userId = token.userId;

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: { id: true, buyerId: true, sellerId: true, deliveryStatus: true, contractNumber: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 });
  }
  if (contract.buyerId !== userId) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }
  if (contract.deliveryStatus !== "IN_TRANSIT") {
    return NextResponse.json(
      { error: `Status-Übergang nicht möglich (aktuell: ${contract.deliveryStatus})` },
      { status: 409 },
    );
  }

  const updated = await db.lotContract.update({
    where: { id: contract.id },
    data: {
      deliveryStatus: "DELIVERED",
      deliveredAt:    new Date(),
    },
    select: { deliveryStatus: true, deliveredAt: true },
  });

  // Verkäufer über bestätigte Lieferung informieren
  const seller = await db.user.findUnique({
    where:  { id: contract.sellerId },
    select: { email: true },
  });
  if (seller?.email) {
    sendAuctionMail({
      to:       seller.email,
      subject:  `Wareneingang bestätigt — Kontrakt ${contract.contractNumber ?? contract.id}`,
      template: "delivery_confirmed",
      data: {
        contractNumber: contract.contractNumber ?? contract.id,
        lotId,
        deliveredAt: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),
      },
    }).catch((err: unknown) => console.error("[buyer-delivery] Mailer-Fehler:", err));
  }

  return NextResponse.json({
    deliveryStatus: updated.deliveryStatus,
    deliveredAt:    updated.deliveredAt?.toISOString() ?? null,
  });
}
