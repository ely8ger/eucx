/**
 * GET /api/seller/deliveries
 *
 * Gibt alle LotContracts des eingeloggten Verkäufers zurück,
 * angereichert mit Lot-Daten (Ware, Menge, Incoterms) für das Logistics-Dashboard.
 *
 * Auth: Bearer JWT - Seller oder Admin
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

async function _GET(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

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
      paymentSentAt:  true,
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

export const GET = apiRoute(_GET);
