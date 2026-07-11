/**
 * POST /api/auction/lots/[lotId]/buyer-delivery
 *
 * Käufer bestätigt Wareneingang: IN_TRANSIT → DELIVERED
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

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
    select: { id: true, buyerId: true, deliveryStatus: true },
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

  return NextResponse.json({
    deliveryStatus: updated.deliveryStatus,
    deliveredAt:    updated.deliveredAt?.toISOString() ?? null,
  });
}
