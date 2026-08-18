/**
 * GET /api/auction/lots/[lotId]
 *
 * Einzelnes Lot abrufen (für REST-Clients / mobile).
 * Enthält isRegistered für den anfragenden User.
 *
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: { userId: string };
  try { tokenPayload = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const userId = tokenPayload.userId;
  const { lotId } = await params;

  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      id:               true,
      commodity:        true,
      quantity:         true,
      unit:             true,
      phase:            true,
      startPrice:       true,
      currentBest:      true,
      auctionEnd:       true,
      auctionStart:     true,
      description:      true,
      createdAt:        true,
      winnerId:         true,
      lockedAt:         true,
      buyerId:          true,
      // CBAM-Felder
      cbamCategory:     true,
      co2PerTonne:      true,
      co2DirectPerTonne: true,
      co2IndirectPerTonne: true,
      countryOfOrigin:  true,
      countryOfExport:  true,
      productionSiteId: true,
      carbonPricePaid:  true,
      greenSteel:       true,
      // Handels- und Vertragsangaben
      incoterms:        true,
      hsCode:           true,
      qualityGrade:     true,
      deliveryPeriod:   true,
      deliveryLocation: true,
      paymentTerms:     true,
      vatTreatment:     true,
      buyer: {
        select: { id: true, organizationId: true },
      },
      lotContract: {
        select: { id: true, deliveryStatus: true, contractNumber: true },
      },
      _count: {
        select: { bids: true, registrations: true },
      },
      registrations: {
        where:  { sellerId: userId },
        select: { id: true },
      },
    },
  });

  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }

  const { registrations, lotContract, ...rest } = lot;
  return NextResponse.json({
    lot: {
      ...rest,
      isRegistered: registrations.length > 0,
      contractId:   lotContract?.id ?? null,
      deliveryStatus: lotContract?.deliveryStatus ?? null,
      contractNumber: lotContract?.contractNumber ?? null,
    },
  });
}
