-- Säule 4: Lot-Phase-Auto-Start + Lot-Dokumente
-- scheduledStart: Optionaler geplanter Auktionsstart (Cron prüft alle 5 min)
-- LotDocument:    Spezifikationen, Zertifikate, Zeichnungen pro Lot (Vercel Blob)

-- 1. scheduledStart Feld zum Lot-Modell hinzufügen
ALTER TABLE "lots"
  ADD COLUMN IF NOT EXISTS "scheduledStart" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "lots_scheduledStart_phase_idx"
  ON "lots"("scheduledStart", "phase");

-- 2. LotDocType Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LotDocType') THEN
    CREATE TYPE "LotDocType" AS ENUM (
      'SPECIFICATION',
      'CERTIFICATE',
      'DRAWING',
      'QUALITY_REPORT',
      'OTHER'
    );
  END IF;
END $$;

-- 3. LotDocument Tabelle
CREATE TABLE IF NOT EXISTS "lot_documents" (
  "id"         TEXT         NOT NULL,
  "lotId"      TEXT         NOT NULL,
  "uploaderId" TEXT         NOT NULL,
  "docType"    "LotDocType" NOT NULL DEFAULT 'OTHER',
  "url"        TEXT         NOT NULL,
  "name"       TEXT         NOT NULL,
  "sizeBytes"  INTEGER      NOT NULL,
  "mimeType"   TEXT         NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "lot_documents_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lot_documents_lotId_fkey'
  ) THEN
    ALTER TABLE "lot_documents"
      ADD CONSTRAINT "lot_documents_lotId_fkey"
        FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lot_documents_uploaderId_fkey'
  ) THEN
    ALTER TABLE "lot_documents"
      ADD CONSTRAINT "lot_documents_uploaderId_fkey"
        FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "lot_documents_lotId_idx"      ON "lot_documents"("lotId");
CREATE INDEX IF NOT EXISTS "lot_documents_uploaderId_idx" ON "lot_documents"("uploaderId");
