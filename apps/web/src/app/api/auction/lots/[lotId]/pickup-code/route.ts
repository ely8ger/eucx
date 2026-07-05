/**
 * GET /api/auction/lots/[lotId]/pickup-code
 *
 * Gibt den Abholcode (6-stellig) für einen Kontrakt zurück.
 * Falls noch kein Code existiert und Status READY_FOR_PICKUP: wird generiert.
 *
 * Auth: Bearer JWT — Seller (Eigentümer), Buyer des Lots, oder Admin
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { DeliveryStatus } from "@prisma/client";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
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
    where:  { lotId },
    select: { id: true, sellerId: true, buyerId: true, deliveryStatus: true, pickupCode: true },
  });
  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  const isParty = contract.sellerId === token.userId || contract.buyerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"].includes(token.role);
  if (!isParty && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  // Code noch nicht generiert: nur generieren wenn Status bereits READY_FOR_PICKUP
  if (!contract.pickupCode) {
    if (contract.deliveryStatus !== DeliveryStatus.READY_FOR_PICKUP) {
      return NextResponse.json(
        { error: `Abholcode noch nicht verfügbar. Status: '${contract.deliveryStatus}'` },
        { status: 409 }
      );
    }
    const code = crypto.randomInt(100000, 999999).toString();
    await db.lotContract.update({ where: { id: contract.id }, data: { pickupCode: code } });
    return NextResponse.json({ pickupCode: code, lotId });
  }

  return NextResponse.json({ pickupCode: contract.pickupCode, lotId });
}
