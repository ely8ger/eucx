-- AlterTable: Handels- und Vertragsangaben für Lot
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "hsCode"         TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "qualityGrade"   TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "deliveryPeriod" TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "paymentTerms"   TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "vatTreatment"   TEXT;
