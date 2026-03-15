import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId erforderlich" }, { status: 400 });

  try {
    const [asks, bids, deals] = await Promise.all([
      db.order.findMany({
        where: { sessionId, direction: "SELL", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
        orderBy: { pricePerUnit: "asc" },
        take: 10,
        include: { organization: { select: { name: true, country: true } } },
      }),
      db.order.findMany({
        where: { sessionId, direction: "BUY", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
        orderBy: { pricePerUnit: "desc" },
        take: 10,
        include: { organization: { select: { name: true, country: true } } },
      }),
      db.deal.findMany({
        where: { sessionId, status: { in: ["MATCHED", "CONFIRMED"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { sellOrder: { select: { direction: true } } },
      }),
    ]);

    const s = (o: typeof asks[0]) => ({
      id:        o.id,
      price:     o.pricePerUnit.toString(),
      qty:       o.quantity.toString(),
      remaining: o.quantity.minus(o.filledQuantity).toString(),
      org:       o.organization.name,
      country:   o.organization.country,
    });

    return NextResponse.json({
      asks:  asks.map(s),
      bids:  bids.map(s),
      deals: deals.map((d) => ({
        id:        d.id,
        price:     d.pricePerUnit.toString(),
        qty:       d.quantity.toString(),
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
