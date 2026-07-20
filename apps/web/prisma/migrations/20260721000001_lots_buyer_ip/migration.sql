-- IP-Adresse des Käufers bei Lot-Erstellung (Betrugsschutz: Buyer ≠ Seller IP)
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "buyerIp" TEXT;
