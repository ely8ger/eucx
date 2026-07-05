/**
 * GET /api/seller/deliveries
 *
 * Gibt alle LotContracts des eingeloggten Verkäufers zurück,
 * angereichert mit Lot-Daten (Ware, Menge, Incoterms) für das Logistics-Dashboard.
 *
 * Auth: Bearer JWT — Seller oder Admin
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  if (token.role !== "SELLER" && token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Nur Verkäufer" }, { status: 403 });
  }

  const contracts = await db.lotContract.findMany({
    where:   { sellerId: token.userId },
    orderBy: { createdAt: "desc" },
    select:  {
      id:             true,
      lotId:          true,
      contractNumber: true,
      totalValue:     true,
      deliveryStatus: true,
      pickupCode:     true,
      cmrUploadedAt:  true,
      deliveredAt:    true,
      createdAt:      true,
      updatedAt:      true,
      buyer: {
        select: {
          organization: { select: { name: true, city: true } },
        },
      },
      lot: {
        select: {
          commodity:   true,
          quantity:    true,
          unit:        true,
          incoterms:   true,
        },
      },
    },
  });

  return NextResponse.json(contracts);
}
