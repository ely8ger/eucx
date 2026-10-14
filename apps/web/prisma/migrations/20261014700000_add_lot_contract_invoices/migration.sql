-- Sprint: Invoice-Erweiterung für LotContract-basierte Settlements
-- dealId wird optional, neues lotContractId-Feld + Relation zu lot_contracts

-- 1. dealId nullable machen (idempotent)
DO $$ BEGIN
  ALTER TABLE "invoices" ALTER COLUMN "deal_id" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

-- 2. Neues lotContractId-Feld hinzufügen (idempotent)
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "lot_contract_id" TEXT;

-- 3. Index auf lotContractId
CREATE INDEX IF NOT EXISTS "invoices_lot_contract_id_idx" ON "invoices"("lot_contract_id");

-- 4. Foreign Key von invoices zu lot_contracts (idempotent)
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_lot_contract_id_fkey"
    FOREIGN KEY ("lot_contract_id") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
