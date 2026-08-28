/**
 * GET /api/seller/bids
 *
 * Liefert alle Lots, auf die der eingeloggte Verkäufer mindestens ein Gebot abgegeben hat.
 * Enthält aktuellen Rank, bestes Gebot des Sellers, Auktionsdeadline, CBAM-Flag.
 *
 * Auth: Bearer JWT (Rolle: SELLER / BROKER / ADMIN)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { db }                        from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // Alle Lots laden, auf die der Seller geboten hat
  const myBids = await db.bid.findMany({
    where:   { sellerId: token.userId },
    orderBy: { createdAt: "desc" },
    distinct: ["lotId"],
    select: {
      id:        true,
      price:     true,
      createdAt: true,
      lot: {
        select: {
          id:            true,
          commodity:     true,
          quantity:      true,
          unit:          true,
          phase:         true,
          currentBest:   true,
          auctionEnd:    true,
          winnerId:      true,
          co2PerTonne:   true,
          incoterms:     true,
          deliveryLocation: true,
          _count: { select: { bids: true } },
        },
      },
    },
  });

  // Für jeden Lot: alle Gebote laden um Rank zu berechnen
  const enriched = await Promise.all(
    myBids.map(async (b) => {
      if (!b.lot) return null;

      // Alle Gebote für diesen Lot (sorted asc = niedrigster Preis = bestes Gebot)
      const allBids = await db.bid.findMany({
        where:   { lotId: b.lot.id },
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
        select:  { sellerId: true, price: true },
      });

      // Bestes eigenes Gebot (niedrigster Preis)
      const myBestBid = allBids
        .filter((x) => x.sellerId === token.userId)
        .at(0);

      // Rank: Position des besten eigenen Gebots im Gesamtranking
      const rank = myBestBid
        ? allBids.findIndex((x) => x.sellerId === token.userId && x.price.toString() === myBestBid.price.toString()) + 1
        : null;

      const isLeading = rank === 1;
      const isWinner  = b.lot.winnerId === token.userId;

      return {
        lotId:        b.lot.id,
        commodity:    b.lot.commodity,
        quantity:     b.lot.quantity.toString(),
        unit:         b.lot.unit,
        phase:        b.lot.phase,
        currentBest:  b.lot.currentBest?.toString() ?? null,
        auctionEnd:   b.lot.auctionEnd?.toISOString() ?? null,
        incoterms:    b.lot.incoterms,
        deliveryLocation: b.lot.deliveryLocation,
        hasCbam:      b.lot.co2PerTonne !== null,
        totalBids:    b.lot._count.bids,
        myBestPrice:  myBestBid?.price.toString() ?? null,
        rank,
        isLeading,
        isWinner,
        lastBidAt:    b.createdAt.toISOString(),
      };
    })
  );

  return NextResponse.json(enriched.filter(Boolean));
}
