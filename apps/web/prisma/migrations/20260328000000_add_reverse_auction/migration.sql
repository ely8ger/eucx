-- CreateEnum
CREATE TYPE "AuctionPhase" AS ENUM ('COLLECTION', 'PROPOSAL', 'REDUCTION', 'CONCLUSION');

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit" "CommodityUnit" NOT NULL,
    "phase" "AuctionPhase" NOT NULL DEFAULT 'COLLECTION',
    "description" TEXT,
    "startPrice" DECIMAL(18,2),
    "currentBest" DECIMAL(18,2),
    "winnerId" TEXT,
    "auctionStart" TIMESTAMP(3),
    "auctionEnd" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_registrations" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lot_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lots_buyerId_idx" ON "lots"("buyerId");
CREATE INDEX "lots_phase_idx" ON "lots"("phase");
CREATE INDEX "lots_auctionEnd_phase_idx" ON "lots"("auctionEnd", "phase");
CREATE INDEX "lot_registrations_sellerId_idx" ON "lot_registrations"("sellerId");
CREATE UNIQUE INDEX "lot_registrations_lotId_sellerId_key" ON "lot_registrations"("lotId", "sellerId");
CREATE INDEX "bids_lotId_price_idx" ON "bids"("lotId", "price");
CREATE INDEX "bids_lotId_sellerId_idx" ON "bids"("lotId", "sellerId");

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lots" ADD CONSTRAINT "lots_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lot_registrations" ADD CONSTRAINT "lot_registrations_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lot_registrations" ADD CONSTRAINT "lot_registrations_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bids" ADD CONSTRAINT "bids_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bids" ADD CONSTRAINT "bids_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
