-- Invoice-Erweiterung für LotContract-basierte Settlements
-- Prisma ohne @map → camelCase-Spaltennamen in DB (dealId, lotContractId)
-- DB bereits im Soll-Zustand via prisma db push → alle Schritte idempotent

DO $$ BEGIN
  ALTER TABLE "invoices" ALTER COLUMN "dealId" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "lotContractId" TEXT;

CREATE INDEX IF NOT EXISTS "invoices_lotContractId_idx" ON "invoices"("lotContractId");

DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_lotContractId_fkey"
    FOREIGN KEY ("lotContractId") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;
