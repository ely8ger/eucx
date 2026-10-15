-- Migration: B2B Remediation Phase 2
-- IncoTerm enum, Anti-Sniping Felder, ContactRelease Modell

-- IncoTerm Enum
CREATE TYPE "inco_term" AS ENUM ('EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF');

-- Lots: incoterms String → IncoTerm enum + Anti-Sniping Felder
ALTER TABLE "lots"
  ADD COLUMN IF NOT EXISTS "incoterms_new" "inco_term" DEFAULT 'DAP',
  ADD COLUMN IF NOT EXISTS "extendedCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "maxExtensions" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "extensionMinutes" INTEGER NOT NULL DEFAULT 3;

-- Werte migrieren
UPDATE "lots" SET "incoterms_new" = CASE "incoterms"
  WHEN 'EXW' THEN 'EXW'::"inco_term"
  WHEN 'FCA' THEN 'FCA'::"inco_term"
  WHEN 'CPT' THEN 'CPT'::"inco_term"
  WHEN 'CIP' THEN 'CIP'::"inco_term"
  WHEN 'DPU' THEN 'DPU'::"inco_term"
  WHEN 'DDP' THEN 'DDP'::"inco_term"
  WHEN 'FAS' THEN 'FAS'::"inco_term"
  WHEN 'FOB' THEN 'FOB'::"inco_term"
  WHEN 'CFR' THEN 'CFR'::"inco_term"
  WHEN 'CIF' THEN 'CIF'::"inco_term"
  ELSE 'DAP'::"inco_term"
END WHERE "incoterms" IS NOT NULL;

ALTER TABLE "lots" DROP COLUMN IF EXISTS "incoterms";
ALTER TABLE "lots" RENAME COLUMN "incoterms_new" TO "incoterms";

-- SellerCharges: incoterms String → IncoTerm enum
ALTER TABLE "seller_charges"
  ADD COLUMN IF NOT EXISTS "incoterms_new" "inco_term" DEFAULT 'DAP';

UPDATE "seller_charges" SET "incoterms_new" = CASE "incoterms"
  WHEN 'EXW' THEN 'EXW'::"inco_term"
  WHEN 'FCA' THEN 'FCA'::"inco_term"
  WHEN 'CPT' THEN 'CPT'::"inco_term"
  WHEN 'CIP' THEN 'CIP'::"inco_term"
  WHEN 'DPU' THEN 'DPU'::"inco_term"
  WHEN 'DDP' THEN 'DDP'::"inco_term"
  WHEN 'FAS' THEN 'FAS'::"inco_term"
  WHEN 'FOB' THEN 'FOB'::"inco_term"
  WHEN 'CFR' THEN 'CFR'::"inco_term"
  WHEN 'CIF' THEN 'CIF'::"inco_term"
  ELSE 'DAP'::"inco_term"
END WHERE "incoterms" IS NOT NULL;

ALTER TABLE "seller_charges" DROP COLUMN IF EXISTS "incoterms";
ALTER TABLE "seller_charges" RENAME COLUMN "incoterms_new" TO "incoterms";

-- ContactRelease Modell
CREATE TABLE IF NOT EXISTS "contact_releases" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "contractId"   TEXT NOT NULL,
  "buyerName"    TEXT NOT NULL,
  "buyerEmail"   TEXT NOT NULL,
  "buyerPhone"   TEXT,
  "sellerName"   TEXT NOT NULL,
  "sellerEmail"  TEXT NOT NULL,
  "sellerPhone"  TEXT,
  "releasedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt"    TIMESTAMP(3),
  CONSTRAINT "contact_releases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "contact_releases_contractId_key" ON "contact_releases"("contractId");
ALTER TABLE "contact_releases" ADD CONSTRAINT "contact_releases_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "lot_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
