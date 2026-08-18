/**
 * GET /api/seller/billing
 *
 * Abrechnungsübersicht des eingeloggten Verkäufers:
 *   - Abgeschlossene LotContracts mit Gebührendetails
 *   - Offene vs. bezahlte Gebühren
 *   - Gesamt-Umsatz und Gesamt-Gebühren
 *
 * Query-Parameter:
 *   ?page=1&limit=20    Paginierung (default: Seite 1, 20 Einträge)
 *   ?year=2026          Nur Einträge dieses Jahres
 *
 * Auth: Bearer JWT (role === SELLER oder BROKER)
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const rawToken   = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!rawToken) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  let token;
  try { token = await verifyAccessToken(rawToken); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const year  = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;

  const dateFilter = year
    ? { gte: new Date(`${year}-01-01T00:00:00.000Z`), lt: new Date(`${year + 1}-01-01T00:00:00.000Z`) }
    : undefined;

  const [contracts, totalCount] = await Promise.all([
    db.lotContract.findMany({
      where: {
        sellerId:  token.userId,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      select:  {
        id:             true,
        contractNumber: true,
        createdAt:      true,
        finalPrice:     true,
        totalValue:     true,
        deliveryStatus: true,
        deliveredAt:    true,
        paymentSentAt:  true,
        fees: {
          where:  { userId: token.userId },
          select: { id: true, type: true, rate: true, amount: true, status: true },
        },
        lot: {
          select: {
            commodity:        true,
            quantity:         true,
            unit:             true,
            hsCode:           true,
            deliveryLocation: true,
          },
        },
        buyer: {
          select: {
            organization: { select: { name: true, taxId: true, country: true } },
          },
        },
      },
    }),
    db.lotContract.count({
      where: {
        sellerId: token.userId,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
  ]);

  // Aggregierte Summen
  const allFees = await db.lotFee.findMany({
    where: {
      userId:   token.userId,
      contract: {
        sellerId: token.userId,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    },
    select: { amount: true, status: true },
  });

  const totalRevenue = contracts.reduce((sum, c) => sum + parseFloat(c.totalValue.toString()), 0);
  const totalFees    = allFees.reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0);
  const unpaidFees   = allFees
    .filter((f) => f.status === "UNPAID")
    .reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0);

  const items = contracts.map((c) => ({
    id:             c.id,
    contractNumber: c.contractNumber,
    createdAt:      c.createdAt,
    commodity:      c.lot.commodity,
    quantity:       c.lot.quantity,
    unit:           c.lot.unit,
    hsCode:         c.lot.hsCode,
    deliveryLocation: c.lot.deliveryLocation,
    finalPrice:     c.finalPrice,
    totalValue:     c.totalValue,
    deliveryStatus: c.deliveryStatus,
    deliveredAt:    c.deliveredAt,
    paymentSentAt:  c.paymentSentAt,
    buyer: {
      name:    c.buyer.organization?.name ?? null,
      taxId:   c.buyer.organization?.taxId ?? null,
      country: c.buyer.organization?.country ?? null,
    },
    fees: c.fees,
  }));

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total:      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    summary: {
      totalRevenue:  totalRevenue.toFixed(2),
      totalFees:     totalFees.toFixed(2),
      unpaidFees:    unpaidFees.toFixed(2),
      contractCount: totalCount,
    },
  });
}
