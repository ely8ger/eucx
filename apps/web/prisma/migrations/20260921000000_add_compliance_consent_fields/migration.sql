-- Compliance-Nachweise (GwG + DSGVO) auf dem User-Modell
-- Alle Felder nullable — bestehende Nutzer behalten NULL (vor der Pflicht registriert)

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "pepDeclarationAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "uboDeclarationAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "termsAcceptedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "registrationIp"    TEXT;
