-- Invoice-Erweiterung für LotContract-basierte Settlements
-- HINWEIS: Prisma nutzt @map nicht → Spaltennamen sind camelCase in der DB

-- 1. dealId nullable machen
DO $$ BEGIN
  ALTER TABLE "invoices" ALTER COLUMN "dealId" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

-- 2. Neues lotContractId-Feld (IF NOT EXISTS für Idempotenz)
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "lotContractId" TEXT;

-- 3. Index auf lotContractId
CREATE INDEX IF NOT EXISTS "invoices_lotContractId_idx" ON "invoices"("lotContractId");

-- 4. Foreign Key von invoices zu lot_contracts
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_lotContractId_fkey"
    FOREIGN KEY ("lotContractId") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
