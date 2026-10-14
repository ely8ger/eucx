-- Sprint A: Settlement-Bridge für LotContracts
-- Prisma ohne @map → camelCase-Spaltennamen in DB (dealId, lotContractId)
-- DB bereits im Soll-Zustand via prisma db push → alle Schritte idempotent

DO $$ BEGIN
  ALTER TABLE "settlements" ALTER COLUMN "dealId" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "lotContractId" TEXT;

DO $$ BEGIN
  ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lotContractId_key" UNIQUE ("lotContractId");
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lotContractId_fkey"
    FOREIGN KEY ("lotContractId") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;
