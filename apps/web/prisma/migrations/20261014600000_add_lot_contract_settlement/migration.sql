-- Sprint A: Settlement-Bridge für LotContracts
-- HINWEIS: Prisma nutzt @map nicht → Spaltennamen sind camelCase in der DB

-- 1. dealId nullable machen
DO $$ BEGIN
  ALTER TABLE "settlements" ALTER COLUMN "dealId" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

-- 2. Neues lotContractId Feld (IF NOT EXISTS für Idempotenz)
ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "lotContractId" TEXT;

-- 3. Unique Constraint auf lotContractId
DO $$ BEGIN
  ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lotContractId_key" UNIQUE ("lotContractId");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Foreign Key von settlements zu lot_contracts
DO $$ BEGIN
  ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lotContractId_fkey"
    FOREIGN KEY ("lotContractId") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
