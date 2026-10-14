-- ZAG-Compliance: EUCX hält keine Kundengelder
-- Entfernt: withdrawal_requests-Tabelle, WithdrawalStatus-Enum, balance/reservedBalance-Spalten

-- 1. withdrawal_requests-Tabelle löschen (mit FK-Constraints)
DROP TABLE IF EXISTS "withdrawal_requests";

-- 2. WithdrawalStatus-Enum löschen
DROP TYPE IF EXISTS "WithdrawalStatus";

-- 3. balance und reservedBalance aus wallets entfernen
ALTER TABLE "wallets" DROP COLUMN IF EXISTS "balance";
ALTER TABLE "wallets" DROP COLUMN IF EXISTS "reservedBalance";
