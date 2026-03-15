-- AlterTable
ALTER TABLE "steel_products" ADD COLUMN     "lengthMm" INTEGER;

-- CreateTable
CREATE TABLE "alloy_compositions" (
    "productId" TEXT NOT NULL,
    "carbonPct" DECIMAL(5,4),
    "manganesePct" DECIMAL(5,4),
    "phosphorusPct" DECIMAL(5,4),
    "sulfurPct" DECIMAL(5,4),
    "siliconPct" DECIMAL(5,4),
    "chromiumPct" DECIMAL(5,4),
    "nickelPct" DECIMAL(5,4),
    "vanadiumPct" DECIMAL(5,4),

    CONSTRAINT "alloy_compositions_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "mechanical_properties" (
    "productId" TEXT NOT NULL,
    "yieldStrengthMpa" DECIMAL(7,1),
    "tensileStrengthMpa" DECIMAL(7,1),
    "elongationPct" DECIMAL(5,2),
    "bendTestDiameterMm" DECIMAL(5,1),

    CONSTRAINT "mechanical_properties_pkey" PRIMARY KEY ("productId")
);

-- AddForeignKey
ALTER TABLE "alloy_compositions" ADD CONSTRAINT "alloy_compositions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "steel_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mechanical_properties" ADD CONSTRAINT "mechanical_properties_productId_fkey" FOREIGN KEY ("productId") REFERENCES "steel_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
