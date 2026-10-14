-- Add KYC risk score and inquiry deadline fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "risk_score" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "risk_flags" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "risk_scored_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "inquiry_deadline_at" TIMESTAMP(3);
