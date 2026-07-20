-- AlterTable: Organization — EORI + CBAM-Kontonummer
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "eoriNumber"        TEXT,
  ADD COLUMN IF NOT EXISTS "cbamAccountNumber" TEXT;

-- AlterTable: Lot — Ausfuhrland + direkte/indirekte CO₂ + CO₂-Preis Ursprungsland
ALTER TABLE "lots"
  ADD COLUMN IF NOT EXISTS "countryOfExport"     TEXT,
  ADD COLUMN IF NOT EXISTS "co2DirectPerTonne"   DECIMAL(12,4),
  ADD COLUMN IF NOT EXISTS "co2IndirectPerTonne" DECIMAL(12,4),
  ADD COLUMN IF NOT EXISTS "carbonPricePaid"     DECIMAL(12,4);

-- AlterTable: Bid — CBAM-Angaben des Verkäufers
ALTER TABLE "bids"
  ADD COLUMN IF NOT EXISTS "cbamCountryOfOrigin"     TEXT,
  ADD COLUMN IF NOT EXISTS "cbamCountryOfExport"     TEXT,
  ADD COLUMN IF NOT EXISTS "cbamProductionSiteId"    TEXT,
  ADD COLUMN IF NOT EXISTS "cbamCo2DirectPerTonne"   DECIMAL(12,4),
  ADD COLUMN IF NOT EXISTS "cbamCo2IndirectPerTonne" DECIMAL(12,4),
  ADD COLUMN IF NOT EXISTS "cbamCarbonPricePaid"     DECIMAL(12,4),
  ADD COLUMN IF NOT EXISTS "cbamVerificationRef"     TEXT;
