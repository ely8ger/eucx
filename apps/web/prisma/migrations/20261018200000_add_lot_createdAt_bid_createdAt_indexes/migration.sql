-- Fehlende Indizes für Performance-Optimierung
-- Spalten sind camelCase (Prisma ohne @map-Konvention)
-- lots: zeitlich sortierte Listing-Queries (ORDER BY "createdAt")
-- bids: chronologische Bid-History pro Lot (WHERE "lotId" ORDER BY "createdAt")

CREATE INDEX IF NOT EXISTS "lots_createdAt_idx"
  ON "lots" ("createdAt");

CREATE INDEX IF NOT EXISTS "bids_lotId_createdAt_idx"
  ON "bids" ("lotId", "createdAt");
