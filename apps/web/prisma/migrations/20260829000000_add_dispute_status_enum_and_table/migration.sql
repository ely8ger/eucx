-- Migration: add_dispute_status_enum_and_table
-- Neuauflage der fehlgeschlagenen Migration 20260828000000
-- Behebt: DisputeStatus-Enum fehlte im ursprünglichen SQL
-- Alle Statements mit IF NOT EXISTS / idempotent

-- 1. DisputeStatus-Enum erstellen (fehlte in alter Migration)
DO $$ BEGIN
  CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. delivery_status Enum um DISPUTED + DEFAULTED erweitern
ALTER TYPE "delivery_status" ADD VALUE IF NOT EXISTS 'DISPUTED';
ALTER TYPE "delivery_status" ADD VALUE IF NOT EXISTS 'DEFAULTED';

-- 3. Neue Felder in lot_contracts (idempotent mit IF NOT EXISTS)
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "disputedAt"    TIMESTAMP(3);
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "defaultedAt"   TIMESTAMP(3);
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "penaltyAmount" DECIMAL(18,2);
ALTER TABLE "lot_contracts" ADD COLUMN IF NOT EXISTS "penaltyPaid"   BOOLEAN NOT NULL DEFAULT false;

-- 4. lot_disputes Tabelle anlegen
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

-- 5. Indizes (IF NOT EXISTS ab PG 9.5)
CREATE UNIQUE INDEX IF NOT EXISTS "lot_disputes_contractId_key" ON "lot_disputes"("contractId");
CREATE INDEX        IF NOT EXISTS "lot_disputes_status_idx"     ON "lot_disputes"("status");
CREATE INDEX        IF NOT EXISTS "lot_disputes_raisedById_idx" ON "lot_disputes"("raisedById");

-- 6. Foreign Keys (NOT EXISTS check via DO-Block)
DO $$ BEGIN
  ALTER TABLE "lot_disputes"
    ADD CONSTRAINT "lot_disputes_contractId_fkey"
    FOREIGN KEY ("contractId")
    REFERENCES "lot_contracts"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "lot_disputes"
    ADD CONSTRAINT "lot_disputes_raisedById_fkey"
    FOREIGN KEY ("raisedById")
    REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "lot_disputes"
    ADD CONSTRAINT "lot_disputes_reviewedById_fkey"
    FOREIGN KEY ("reviewedById")
    REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
