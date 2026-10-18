-- AlterTable: add chargeId to bids
ALTER TABLE "bids" ADD COLUMN "chargeId" TEXT;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_chargeId_fkey"
  FOREIGN KEY ("chargeId") REFERENCES "seller_charges"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
