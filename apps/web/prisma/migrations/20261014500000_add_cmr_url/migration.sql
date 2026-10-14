-- CMR: Blob-URL Feld für lot_contracts
-- cmrDocument (Base64) bleibt für Altdaten, cmrUrl ist der neue Weg.
ALTER TABLE "lot_contracts"
  ADD COLUMN IF NOT EXISTS "cmrUrl" TEXT;
