/**
 * /dashboard/seller/auction/[lotId]
 *
 * Server Component: lädt Lot initial.
 * SellerAuctionClient übernimmt Gebote + Echtzeit.
 */
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { SellerAuctionClient } from "./SellerAuctionClient";

export const dynamic = "force-dynamic";

export default async function SellerAuctionPage({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const { lotId } = await params;
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
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
    },
  });

  if (!lot) notFound();

  return (
    <SellerAuctionClient
      lot={{
        id:          lot.id,
        commodity:   lot.commodity,
        quantity:    lot.quantity.toString(),
        unit:        lot.unit,
        phase:       lot.phase,
        startPrice:  lot.startPrice?.toString()  ?? null,
        currentBest: lot.currentBest?.toString() ?? null,
        auctionEnd:  lot.auctionEnd?.toISOString() ?? null,
        description: lot.description ?? null,
      }}
    />
  );
}
