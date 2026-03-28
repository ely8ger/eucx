/**
 * /dashboard/buyer/auction/[lotId]
 *
 * Server Component: lädt Lot + Bid-History initial vom Server.
 * Client Component (BuyerAuctionClient) übernimmt Echtzeit.
 */
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { BuyerAuctionClient } from "./BuyerAuctionClient";

export const dynamic = "force-dynamic";

export default async function BuyerAuctionPage({
  params,
}: {
  params: { lotId: string };
}) {
  const lot = await db.lot.findUnique({
    where:  { id: params.lotId },
    select: {
      id:          true,
      commodity:   true,
      quantity:    true,
      unit:        true,
      phase:       true,
      startPrice:  true,
      currentBest: true,
      auctionEnd:  true,
      description: true,
      buyer: { select: { id: true } },
    },
  });

  if (!lot) notFound();

  const bids = await db.bid.findMany({
    where:   { lotId: params.lotId },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
    select:  { id: true, sellerId: true, price: true, isWinner: true, createdAt: true },
  });

  // Verkäufer anonymisieren: stabile Nummerierung nach erster Erscheinung
  const sellerMap = new Map<string, string>();
  let counter = 1;
  const anonymizedBids = bids.map((bid) => {
    if (!sellerMap.has(bid.sellerId)) {
      sellerMap.set(bid.sellerId, `Bieter ${counter++}`);
    }
    return {
      id:        bid.id,
      bieter:    sellerMap.get(bid.sellerId)!,
      price:     bid.price.toString(),
      isWinner:  bid.isWinner,
      createdAt: bid.createdAt.toISOString(),
    };
  });

  const serialized = {
    id:          lot.id,
    commodity:   lot.commodity,
    quantity:    lot.quantity.toString(),
    unit:        lot.unit,
    phase:       lot.phase,
    startPrice:  lot.startPrice?.toString() ?? null,
    currentBest: lot.currentBest?.toString() ?? null,
    auctionEnd:  lot.auctionEnd?.toISOString() ?? null,
    description: lot.description ?? null,
  };

  return <BuyerAuctionClient lot={serialized} initialBids={anonymizedBids} />;
}
