-- Fügt Handelsdaten-Felder zu catalog_products hinzu.
-- CatalogProduct wird zur einzigen Quelle für Trading-Parameter — kein data.ts zur Laufzeit.
ALTER TABLE "catalog_products"
  ADD COLUMN IF NOT EXISTS "katId"      TEXT,
  ADD COLUMN IF NOT EXISTS "werkstoff"  TEXT,
  ADD COLUMN IF NOT EXISTS "unit"       TEXT,
  ADD COLUMN IF NOT EXISTS "minLotSize" FLOAT,
  ADD COLUMN IF NOT EXISTS "lotStep"    FLOAT,
  ADD COLUMN IF NOT EXISTS "inco"       TEXT,
  ADD COLUMN IF NOT EXISTS "vat"        TEXT,
  ADD COLUMN IF NOT EXISTS "hsCode"     TEXT,
  ADD COLUMN IF NOT EXISTS "cbam"       TEXT,
  ADD COLUMN IF NOT EXISTS "tradeDesc"  TEXT;

CREATE INDEX IF NOT EXISTS "catalog_products_unit_idx" ON "catalog_products"("unit");
