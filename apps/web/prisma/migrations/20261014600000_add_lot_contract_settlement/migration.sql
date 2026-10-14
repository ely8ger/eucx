-- Sprint A: Settlement-Bridge für LotContracts
-- dealId wird optional, neues lotContractId Feld, neue Relation

-- 1. dealId nullable machen
ALTER TABLE "settlements" ALTER COLUMN "deal_id" DROP NOT NULL;

-- 2. Neues lotContractId Feld hinzufügen
ALTER TABLE "settlements" ADD COLUMN "lot_contract_id" TEXT;

-- 3. Unique Constraint auf lotContractId
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lot_contract_id_key" UNIQUE ("lot_contract_id");

-- 4. Foreign Key von settlements zu lot_contracts
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_lot_contract_id_fkey" 
  FOREIGN KEY ("lot_contract_id") REFERENCES "lot_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
