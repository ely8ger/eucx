-- AlterTable
ALTER TABLE "audit_log" ADD COLUMN     "meta" JSONB;

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");
