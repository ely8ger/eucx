/**
 * /dashboard/seller/auction/[lotId]
 *
 * Server Component: lädt Lot initial.
 * SellerAuctionClient übernimmt Gebote + Echtzeit.
 */
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { SellerAuctionClient } from "./SellerAuctionClient";

export const metadata = { title: "Auktion | EUCX", robots: { index: false, follow: false } };
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
      id:              true,
      commodity:       true,
      quantity:        true,
      unit:            true,
      phase:           true,
      startPrice:      true,
      currentBest:     true,
      auctionEnd:      true,
      auctionStart:    true,
      createdAt:       true,
      description:     true,
      incoterms:       true,
      countryOfOrigin: true,
      co2PerTonne:     true,
      productionSiteId: true,
      hsCode:           true,
      qualityGrade:     true,
      deliveryPeriod:   true,
      paymentTerms:     true,
      vatTreatment:     true,
    },
  });

  if (!lot) notFound();

  return (
    <SellerAuctionClient
      lot={{
        id:              lot.id,
        commodity:       lot.commodity,
        quantity:        lot.quantity.toString(),
        unit:            lot.unit,
        phase:           lot.phase,
        startPrice:      lot.startPrice?.toString()  ?? null,
        currentBest:     lot.currentBest?.toString() ?? null,
        auctionEnd:      lot.auctionEnd?.toISOString()   ?? null,
        auctionStart:    lot.auctionStart?.toISOString() ?? null,
        createdAt:       lot.createdAt.toISOString(),
        description:     lot.description     ?? null,
        incoterms:        lot.incoterms        ?? null,
        countryOfOrigin:  lot.countryOfOrigin  ?? null,
        co2PerTonne:      lot.co2PerTonne?.toString()  ?? null,
        productionSiteId: lot.productionSiteId ?? null,
        hsCode:           lot.hsCode           ?? null,
        qualityGrade:     lot.qualityGrade     ?? null,
        deliveryPeriod:   lot.deliveryPeriod   ?? null,
        paymentTerms:     lot.paymentTerms     ?? null,
        vatTreatment:     lot.vatTreatment     ?? null,
      }}
    />
  );
}
