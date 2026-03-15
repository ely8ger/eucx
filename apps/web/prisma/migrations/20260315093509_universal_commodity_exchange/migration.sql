/*
  Warnings:

  - You are about to drop the column `quantityTons` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `quantityTons` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `alloy_compositions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mechanical_properties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `steel_products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `deals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommodityCategory" AS ENUM ('METALS', 'SCRAP', 'TIMBER', 'AGRICULTURE', 'CHEMICALS', 'ENERGY', 'CONSTRUCTION', 'INDUSTRIALS');

-- CreateEnum
CREATE TYPE "CommodityUnit" AS ENUM ('TON', 'KG', 'CBM', 'LITER', 'PIECE', 'SQM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Currency" ADD VALUE 'GBP';
ALTER TYPE "Currency" ADD VALUE 'CZK';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'BROKER';

-- DropForeignKey
ALTER TABLE "alloy_compositions" DROP CONSTRAINT "alloy_compositions_productId_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_productId_fkey";

-- DropForeignKey
ALTER TABLE "mechanical_properties" DROP CONSTRAINT "mechanical_properties_productId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_productId_fkey";

-- DropForeignKey
ALTER TABLE "steel_products" DROP CONSTRAINT "steel_products_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "trading_sessions" DROP CONSTRAINT "trading_sessions_productId_fkey";

-- AlterTable
ALTER TABLE "deals" DROP COLUMN "quantityTons",
ADD COLUMN     "quantity" DECIMAL(12,3) NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "quantityTons",
ADD COLUMN     "quantity" DECIMAL(12,3) NOT NULL,
ALTER COLUMN "filledQuantity" SET DATA TYPE DECIMAL(12,3);

-- DropTable
DROP TABLE "alloy_compositions";

-- DropTable
DROP TABLE "mechanical_properties";

-- DropTable
DROP TABLE "steel_products";

-- DropEnum
DROP TYPE "SteelForm";

-- DropEnum
DROP TYPE "SteelStandard";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "category" "CommodityCategory" NOT NULL,
    "subcategory" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" "CommodityUnit" NOT NULL DEFAULT 'TON',
    "quantity" DECIMAL(12,3) NOT NULL,
    "minLotQuantity" DECIMAL(12,3) NOT NULL DEFAULT 1.0,
    "originCountry" CHAR(2) NOT NULL,
    "warehouseLocation" TEXT NOT NULL,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
    "certificateNumber" TEXT,
    "specifications" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_organizationId_idx" ON "products"("organizationId");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_sessions" ADD CONSTRAINT "trading_sessions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
