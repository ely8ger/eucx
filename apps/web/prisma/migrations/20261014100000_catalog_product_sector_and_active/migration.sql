-- CatalogProduct: sector-Feld + isActive für Sektor-Filterung und Admin-Verwaltung
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "sector"   TEXT    NOT NULL DEFAULT 'STEEL';
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS "catalog_products_sector_idx" ON "catalog_products"("sector");
