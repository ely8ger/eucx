-- WithdrawalRequest: Auszahlungsantrag für Wallet-Inhaber
-- Prisma ohne @map auf Feldern → camelCase-Spaltennamen in DB
-- DB bereits im Soll-Zustand via prisma db push → alle Schritte idempotent

DO $$ BEGIN
  CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');
EXCEPTION WHEN others THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "withdrawal_requests" (
  "id"              TEXT NOT NULL,
  "organizationId"  TEXT NOT NULL,
  "walletId"        TEXT NOT NULL,
  "amount"          DECIMAL(18,8) NOT NULL,
  "currency"        "Currency" NOT NULL DEFAULT 'EUR',
  "iban"            TEXT NOT NULL,
  "bic"             TEXT NOT NULL,
  "beneficiaryName" TEXT NOT NULL,
  "reference"       TEXT,
  "status"          "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote"       TEXT,
  "processedBy"     TEXT,
  "processedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "wallets"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "withdrawal_requests_organizationId_idx" ON "withdrawal_requests"("organizationId");
CREATE INDEX IF NOT EXISTS "withdrawal_requests_status_idx"         ON "withdrawal_requests"("status");
