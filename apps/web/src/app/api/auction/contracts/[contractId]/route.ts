/**
 * GET /api/auction/contracts/[contractId]
 *
 * Vollständige Vertragsdetails für Käufer, Verkäufer oder Admin.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> },
) {
  let token: { userId: string };
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { contractId } = await params;
  const userId = token.userId;

  const [contract, user] = await Promise.all([
    db.lotContract.findUnique({
      where: { id: contractId },
      select: {
        id:             true,
        contractNumber: true,
        lotId:          true,
        buyerId:        true,
        sellerId:       true,
        finalPrice:     true,
        totalValue:     true,
        deliveryStatus: true,
        pickupCode:     true,
        cmrUploadedAt:  true,
        deliveredAt:    true,
        signedAtBuyer:  true,
        signedAtSeller: true,
        createdAt:      true,
        lot: {
          select: {
            id:               true,
            commodity:        true,
            quantity:         true,
            unit:             true,
            deliveryLocation: true,
            deliveryPeriod:   true,
            vatTreatment:     true,
            hsCode:           true,
            qualityGrade:     true,
            paymentTerms:     true,
            incoterms:        true,
            auctionEnd:       true,
            charges: {
              select: { certificate31: true, cbamCertificate: true },
              take:   1,
            },
          },
        },
        buyer: {
          select: {
            id:    true,
            email: true,
            organization: {
              select: { name: true, phone: true, city: true, country: true },
            },
          },
        },
        seller: {
          select: {
            id:    true,
            email: true,
            organization: {
              select: { name: true, phone: true, city: true, country: true },
            },
          },
        },
        fees: {
          where:  { userId },
          select: { type: true, rate: true, amount: true, status: true },
        },
      },
    }),
    db.user.findUnique({
      where:  { id: userId },
      select: { role: true },
    }),
  ]);

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 });
  }

  const isAdmin  = ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_OFFICER"].includes(user?.role ?? "");
  const isBuyer  = contract.buyerId  === userId;
  const isSeller = contract.sellerId === userId;

  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  const myRole       = isBuyer ? "buyer" : isSeller ? "seller" : "admin";
  const counterparty = isBuyer ? contract.seller : contract.buyer;
  const charge       = contract.lot.charges[0] ?? null;

  return NextResponse.json({
    id:             contract.id,
    contractNumber: contract.contractNumber,
    lotId:          contract.lotId,
    myRole,
    deliveryStatus: contract.deliveryStatus,
    pickupCode:     contract.pickupCode,
    cmrUploadedAt:  contract.cmrUploadedAt?.toISOString()  ?? null,
    deliveredAt:    contract.deliveredAt?.toISOString()    ?? null,
    signedAtBuyer:  contract.signedAtBuyer?.toISOString()  ?? null,
    signedAtSeller: contract.signedAtSeller?.toISOString() ?? null,
    createdAt:      contract.createdAt.toISOString(),
    finalPrice:     contract.finalPrice.toString(),
    totalValue:     contract.totalValue.toString(),
    lot: {
      id:               contract.lot.id,
      commodity:        contract.lot.commodity,
      quantity:         contract.lot.quantity.toString(),
      unit:             contract.lot.unit,
      deliveryLocation: contract.lot.deliveryLocation,
      deliveryPeriod:   contract.lot.deliveryPeriod,
      vatTreatment:     contract.lot.vatTreatment,
      hsCode:           contract.lot.hsCode,
      qualityGrade:     contract.lot.qualityGrade,
      paymentTerms:     contract.lot.paymentTerms,
      incoterms:        contract.lot.incoterms,
      auctionEnd:       contract.lot.auctionEnd?.toISOString() ?? null,
    },
    counterparty: {
      id:      counterparty.id,
      email:   counterparty.email,
      name:    counterparty.organization?.name    ?? "—",
      phone:   counterparty.organization?.phone   ?? null,
      city:    counterparty.organization?.city    ?? null,
      country: counterparty.organization?.country ?? null,
    },
    certificates: {
      has31:   !!charge?.certificate31,
      hasCbam: !!charge?.cbamCertificate,
    },
    myFees: contract.fees.map((f) => ({
      type:   f.type,
      rate:   f.rate.toString(),
      amount: f.amount.toString(),
      status: f.status,
    })),
  });
}
