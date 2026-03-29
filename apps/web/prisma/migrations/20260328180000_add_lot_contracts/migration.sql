-- CreateEnum
CREATE TYPE "LotFeeType" AS ENUM ('SELLER_FEE', 'BUYER_FEE');

-- CreateEnum
CREATE TYPE "LotFeeStatus" AS ENUM ('UNPAID', 'PAID');

-- CreateTable
CREATE TABLE "lot_contracts" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "finalPrice" DECIMAL(18,2) NOT NULL,
    "totalValue" DECIMAL(18,2) NOT NULL,
    "pdfBase64" TEXT NOT NULL,
    "pdfHash" TEXT NOT NULL,
    "pdfSizeBytes" INTEGER NOT NULL,
    "signedAtBuyer" TIMESTAMP(3),
    "signedAtSeller" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_fees" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LotFeeType" NOT NULL,
    "rate" DECIMAL(5,4) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "LotFeeStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lot_contracts_lotId_key" ON "lot_contracts"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "lot_contracts_contractNumber_key" ON "lot_contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "lot_contracts_buyerId_idx" ON "lot_contracts"("buyerId");

-- CreateIndex
CREATE INDEX "lot_contracts_sellerId_idx" ON "lot_contracts"("sellerId");

-- CreateIndex
CREATE INDEX "lot_fees_contractId_idx" ON "lot_fees"("contractId");

-- CreateIndex
CREATE INDEX "lot_fees_userId_idx" ON "lot_fees"("userId");

-- AddForeignKey
ALTER TABLE "lot_contracts" ADD CONSTRAINT "lot_contracts_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_contracts" ADD CONSTRAINT "lot_contracts_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_contracts" ADD CONSTRAINT "lot_contracts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_fees" ADD CONSTRAINT "lot_fees_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "lot_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
