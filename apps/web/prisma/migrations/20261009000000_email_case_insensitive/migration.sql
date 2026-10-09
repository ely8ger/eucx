-- Migration: E-Mail case-insensitive Eindeutigkeit
--
-- Problem: Postgres unique constraint auf "email" ist case-sensitiv.
-- "User@x.com" und "user@x.com" wären zwei separate Accounts.
-- Browser-Autofill kapitalisiert oft den ersten Buchstaben → Login schlägt fehl.
--
-- Lösung:
-- 1. Alle bestehenden E-Mails auf Lowercase normalisieren
-- 2. Funktionalen Unique-Index auf LOWER(email) setzen
-- 3. Bestehenden case-sensitiven Index entfernen (wird durch neuen ersetzt)

-- Schritt 1: Bestehende E-Mails normalisieren
UPDATE "User"
SET email = LOWER(email)
WHERE email != LOWER(email);

-- Schritt 2: Case-insensitiven Unique-Index erstellen
-- Dieser Index erzwingt Eindeutigkeit auf Basis von LOWER(email),
-- sodass keine zwei Nutzer dieselbe E-Mail in beliebiger Schreibweise haben.
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_lower_key"
  ON "User" (LOWER(email));
