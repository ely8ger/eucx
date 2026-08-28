-- Migration: add_lot_dispute_and_penalty
-- Adds: DISPUTED + DEFAULTED to delivery_status enum
--       disputedAt, defaultedAt, penaltyAmount, penaltyPaid to lot_contracts
--       lot_disputes table

-- 1. Enum-Erweiterung (PostgreSQL erlaubt nur ADD VALUE, nicht RENAME/REMOVE)
ALTER TYPE "delivery_status" ADD VALUE IF NOT EXISTS 'DISPUTED';
ALTER TYPE "delivery_status" ADD VALUE IF NOT EXISTS 'DEFAULTED';

-- 2. Neue Felder in lot_contracts
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "disputedAt"    TIMESTAMP(3);
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "defaultedAt"   TIMESTAMP(3);
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "penaltyAmount" DECIMAL(18,2);
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "penaltyPaid"   BOOLEAN NOT NULL DEFAULT false;

-- 3. LotDispute-Tabelle
CREATE TABLE IF NOT EXISTS "lot_disputes" (
    "id"                 TEXT                NOT NULL,
    "contractId"         TEXT                NOT NULL,
    "raisedById"         TEXT                NOT NULL,
    "reviewedById"       TEXT,
    "status"             "DisputeStatus"     NOT NULL DEFAULT 'OPEN',
    "reason"             TEXT                NOT NULL,
    "evidenceUrls"       TEXT[]              NOT NULL DEFAULT '{}',
    "adminComment"       TEXT,
    "manualRefundAmount" DECIMAL(18,2),
    "createdAt"          TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt"         TIMESTAMP(3),

    CONSTRAINT "lot_disputes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lot_disputes_contractId_key" ON "lot_disputes"("contractId");
CREATE INDEX IF NOT EXISTS "lot_disputes_status_idx"     ON "lot_disputes"("status");
CREATE INDEX IF NOT EXISTS "lot_disputes_raisedById_idx" ON "lot_disputes"("raisedById");

ALTER TABLE "lot_disputes"
    ADD CONSTRAINT IF NOT EXISTS "lot_disputes_contractId_fkey"
    FOREIGN KEY ("contractId")
    REFERENCES "lot_contracts"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lot_disputes"
    ADD CONSTRAINT IF NOT EXISTS "lot_disputes_raisedById_fkey"
    FOREIGN KEY ("raisedById")
    REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lot_disputes"
    ADD CONSTRAINT IF NOT EXISTS "lot_disputes_reviewedById_fkey"
    FOREIGN KEY ("reviewedById")
    REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
