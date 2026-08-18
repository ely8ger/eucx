-- Migration: EUCX Member-ID für alle Organisationen
-- Sequenznummer (auto-increment) + Freitext-Feld für die berechnete EUCX-ID

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "memberSeq" SERIAL NOT NULL;

-- Unique-Constraint nachträglich (SERIAL ist bereits eindeutig, aber explizit besser)
ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_memberSeq_key" UNIQUE ("memberSeq");

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "memberId" TEXT;

ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_memberId_key" UNIQUE ("memberId");
