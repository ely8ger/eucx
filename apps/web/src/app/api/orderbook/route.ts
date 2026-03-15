/**
 * GET /api/orderbook?sessionId=<uuid>
 * Returns asks (sorted ASC by price) and bids (sorted DESC by price).
 * Financial values are returned as strings (Decimal precision).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId erforderlich" }, { status: 400 });
  }

  try {
    const [asks, bids, deals] = await Promise.all([
      // Sell orders — sorted cheapest first (ask ladder)
      db.order.findMany({
        where: {
          sessionId,
          direction: "SELL",
          status: { in: ["ACTIVE", "PARTIALLY_FILLED"] },
        },
        orderBy: { pricePerUnit: "asc" },
        take: 10,
        select: {
          id:           true,
          pricePerUnit: true,
          quantityTons: true,
          filledQuantity: true,
          organization: { select: { name: true, country: true } },
        },
      }),
      // Buy orders — sorted highest first (bid ladder)
      db.order.findMany({
        where: {
          sessionId,
          direction: "BUY",
          status: { in: ["ACTIVE", "PARTIALLY_FILLED"] },
        },
        orderBy: { pricePerUnit: "desc" },
        take: 10,
        select: {
          id:           true,
          pricePerUnit: true,
          quantityTons: true,
          filledQuantity: true,
          organization: { select: { name: true, country: true } },
        },
      }),
      // Latest 20 deals
      db.deal.findMany({
        where: { sessionId, status: { in: ["MATCHED", "CONFIRMED"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id:          true,
          pricePerUnit: true,
          quantityTons: true,
          currency:    true,
          createdAt:   true,
          sellOrder:   { select: { direction: true } },
        },
      }),
    ]);

    // Serialise Decimal fields as strings (JSON doesn't have Decimal)
    const serialise = (o: typeof asks[0]) => ({
      id:            o.id,
      price:         o.pricePerUnit.toString(),
      qty:           o.quantityTons.toString(),
      filled:        o.filledQuantity.toString(),
      remaining:     o.quantityTons.minus(o.filledQuantity).toString(),
      org:           o.organization.name,
      country:       o.organization.country,
    });

    return NextResponse.json({
      asks:  asks.map(serialise),
      bids:  bids.map(serialise),
      deals: deals.map((d) => ({
        id:        d.id,
        price:     d.pricePerUnit.toString(),
        qty:       d.quantityTons.toString(),
        currency:  d.currency,
        direction: d.sellOrder.direction,
        time:      d.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[/api/orderbook]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
