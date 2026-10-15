-- Säule 9 (10/10): FeeTier + FeeOverride

CREATE TABLE IF NOT EXISTS "fee_tiers" (
  "id"              TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "name"            TEXT         NOT NULL,
  "sellerRate"      DECIMAL(6,4) NOT NULL,
  "buyerRate"       DECIMAL(6,4) NOT NULL,
  "volumeThreshold" DECIMAL(18,2),
  "description"     TEXT         NOT NULL DEFAULT '',
  "updatedBy"       TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fee_tiers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "fee_tiers_name_key" ON "fee_tiers"("name");

CREATE TABLE IF NOT EXISTS "fee_overrides" (
  "id"         TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"     TEXT         NOT NULL,
  "sellerRate" DECIMAL(6,4),
  "buyerRate"  DECIMAL(6,4),
  "reason"     TEXT         NOT NULL,
  "createdBy"  TEXT         NOT NULL,
  "expiresAt"  TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fee_overrides_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "fee_overrides_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "fee_overrides_userId_key" ON "fee_overrides"("userId");
CREATE INDEX        IF NOT EXISTS "fee_overrides_userId_idx" ON "fee_overrides"("userId");

-- Initial-Seed: Standard-Gebühren (entsprechen den hardcodierten Werten der fee-engine)
INSERT INTO "fee_tiers" ("id","name","sellerRate","buyerRate","volumeThreshold","description")
VALUES
  (gen_random_uuid()::text, 'STANDARD',    0.0080, 0.0030, NULL,       'Standard-Tarif für alle Nutzer'),
  (gen_random_uuid()::text, 'HIGH_VOLUME', 0.0050, 0.0015, 500000.00, 'Rabatt bei > 500.000 € Jahresumsatz')
ON CONFLICT ("name") DO NOTHING;
