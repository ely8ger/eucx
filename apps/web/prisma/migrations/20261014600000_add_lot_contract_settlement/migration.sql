-- Sprint A: Settlement-Bridge für LotContracts
-- dealId wird optional, neues lotContractId Feld, neue Relation

-- 1. dealId nullable machen (idempotent: nur wenn noch NOT NULL)
DO $$ BEGIN
  ALTER TABLE "settlements" ALTER COLUMN "deal_id" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

-- 2. Neues lotContractId Feld hinzufügen (IF NOT EXISTS)
ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "lot_contract_id" TEXT;

-- 3. Unique Constraint auf lotContractId (IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lot_contract_id_key" UNIQUE ("lot_contract_id");
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

-- 4. Foreign Key von settlements zu lot_contracts (IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lot_contract_id_fkey"
    FOREIGN KEY ("lot_contract_id") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
