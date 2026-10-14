-- AddColumn: lots.catalogProductId → FK zu catalog_products
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "catalogProductId" TEXT;
CREATE INDEX IF NOT EXISTS "lots_catalogProductId_idx" ON "lots"("catalogProductId");
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'lots_catalogProductId_fkey'
    AND table_name = 'lots'
  ) THEN
    ALTER TABLE "lots" ADD CONSTRAINT "lots_catalogProductId_fkey"
      FOREIGN KEY ("catalogProductId") REFERENCES "catalog_products"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
