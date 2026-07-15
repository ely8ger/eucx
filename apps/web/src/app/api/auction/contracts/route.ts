/**
 * GET /api/auction/contracts
 *
 * Gibt alle LotContracts zurück, an denen der eingeloggte User beteiligt ist
 * (als Käufer oder als Sieger-Verkäufer).
 *
 * Admin sieht alle Verträge.
 *
 * Response:
 *   { contracts: ContractSummary[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where:  { id: token.userId },
    select: { role: true },
  });

  const isAdmin = ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_OFFICER"].includes(user?.role ?? "");

  const contracts = await db.lotContract.findMany({
    where: isAdmin ? {} : {
      OR: [
        { buyerId:  token.userId },
        { sellerId: token.userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id:             true,
      contractNumber: true,
      finalPrice:     true,
      totalValue:     true,
      deliveryStatus: true,
      buyerId:        true,
      sellerId:       true,
      createdAt:      true,
      lot: {
        select: {
          id:        true,
          commodity: true,
          quantity:  true,
          unit:      true,
        },
      },
      buyer: {
        select: {
          organization: { select: { name: true } },
        },
      },
      seller: {
        select: {
          organization: { select: { name: true } },
        },
      },
      fees: {
        where: { userId: token.userId },
        select: { type: true, rate: true, amount: true, status: true },
      },
    },
  });

  return NextResponse.json({
    contracts: contracts.map((c) => {
      const myRole = c.buyerId === token.userId ? "buyer"
        : c.sellerId === token.userId ? "seller"
        : "admin";
      const counterpartyName = myRole === "buyer"
        ? (c.seller.organization?.name ?? "—")
        : myRole === "seller"
          ? (c.buyer.organization?.name ?? "—")
          : `${c.buyer.organization?.name ?? "—"} / ${c.seller.organization?.name ?? "—"}`;
      return {
        id:              c.id,
        contractNumber:  c.contractNumber,
        lotId:           c.lot.id,
        commodity:       c.lot.commodity,
        quantity:        c.lot.quantity.toString(),
        unit:            c.lot.unit,
        finalPrice:      c.finalPrice.toString(),
        totalValue:      c.totalValue.toString(),
        deliveryStatus:  c.deliveryStatus,
        myRole,
        counterpartyName,
        myFee:           c.fees[0] ?? null,
        createdAt:       c.createdAt.toISOString(),
      };
    }),
  });
}
