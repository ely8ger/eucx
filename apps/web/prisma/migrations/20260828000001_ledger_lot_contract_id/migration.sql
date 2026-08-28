-- Migration: ledger_lot_contract_id
-- Fügt lotContractId-Referenz zur LedgerEntry-Tabelle hinzu,
-- damit Lot-Auktions-Buchungen von Deal-Buchungen unterscheidbar sind.

ALTER TABLE "ledger_entries" ADD COLUMN IF NOT EXISTS "lotContractId" TEXT;

CREATE INDEX IF NOT EXISTS "ledger_entries_lotContractId_idx" ON "ledger_entries"("lotContractId");
