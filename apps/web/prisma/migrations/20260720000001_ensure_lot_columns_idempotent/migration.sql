-- Sicherheits-Migration: stellt alle Lot-Spalten sicher, die ggf. durch
-- fehlgeschlagene frühere Migrationen (ohne IF NOT EXISTS) fehlen könnten.
-- Vollständig idempotent — kann mehrfach ausgeführt werden.

-- Handels- und Vertragsangaben (20260706000000 — Wiederholung als Absicherung)
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "hsCode"           TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "qualityGrade"     TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "deliveryPeriod"   TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "paymentTerms"     TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "vatTreatment"     TEXT;

-- Lieferort (20260711000000 — fehlte IF NOT EXISTS)
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "deliveryLocation" TEXT;

-- CBAM-Felder (20260712000000)
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "eoriNumber"        TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "cbamAccountNumber" TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "countryOfExport"     TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "co2DirectPerTonne"   DECIMAL(12,4);
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "co2IndirectPerTonne" DECIMAL(12,4);
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "carbonPricePaid"     DECIMAL(12,4);
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamCountryOfOrigin"     TEXT;
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamCountryOfExport"     TEXT;
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamProductionSiteId"    TEXT;
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamCo2DirectPerTonne"   DECIMAL(12,4);
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamCo2IndirectPerTonne" DECIMAL(12,4);
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamCarbonPricePaid"     DECIMAL(12,4);
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "cbamVerificationRef"     TEXT;

-- paymentSentAt (20260715000000)
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "paymentSentAt" TIMESTAMP(3);
