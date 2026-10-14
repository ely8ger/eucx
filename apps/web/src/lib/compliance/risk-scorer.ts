/**
 * Risk Scorer — Compliance Risk Score 0–100
 *
 * Berechnet einen numerischen Risikowert für einen User basierend auf:
 *   - Land (Embargo → sofortige Blockade, FATF Grey-List → +30)
 *   - Unternehmensalter (< 2 Jahre → +20)
 *   - Fehlgeschlagene Login-Versuche (+5 pro Versuch, max +25)
 *   - KYC-Dokumentenstatus (jede Ablehnung +10)
 *   - Verifikationsstatus (REJECTED +20, SUSPENDED +30)
 *   - Fehlende Pflichtfelder (PEP/UBO-Erklärung, E-Mail unbestätigt → je +10)
 *
 * Score ≥ 70 → CRITICAL (eskaliert an Compliance-Team)
 * Score 50–69 → HIGH
 * Score 25–49 → MEDIUM
 * Score 0–24 → LOW
 */
import { db }                    from "@/lib/db/client";
import { Prisma }                from "@prisma/client";
import { EMBARGOED_COUNTRIES, FATF_GREYLIST } from "@/lib/compliance/sanctions";
import { audit }                 from "@/lib/audit/logger";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskFlag {
  code:    string;
  label:   string;
  points:  number;
  category: "country" | "identity" | "behavior" | "documents";
}

export interface RiskScoreResult {
  score:  number;
  level:  RiskLevel;
  flags:  RiskFlag[];
}

function riskLevel(score: number): RiskLevel {
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

function isYoungCompany(foundedAt: Date): boolean {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  return foundedAt > twoYearsAgo;
}

export async function calculateRiskScore(userId: string): Promise<RiskScoreResult> {
  const user = await db.user.findUniqueOrThrow({
    where:   { id: userId },
    include: {
      organization:  true,
      kycDocuments:  { select: { status: true } },
    },
  });

  const org   = user.organization;
  const flags: RiskFlag[] = [];
  let score = 0;

  const add = (code: string, label: string, points: number, category: RiskFlag["category"]) => {
    flags.push({ code, label, points, category });
    score = Math.min(100, score + points);
  };

  // ─── Land
  const country = org.country.toUpperCase();
  if (EMBARGOED_COUNTRIES.has(country)) {
    add("EMBARGOED_COUNTRY", `Embargo-Land: ${country}`, 100, "country");
  } else if (FATF_GREYLIST.has(country)) {
    add("FATF_GREY", `FATF Grey-List: ${country}`, 30, "country");
  }

  // ─── Unternehmensalter
  const foundedAt = org.foundedAt ?? user.companyFoundedAt;
  if (foundedAt && isYoungCompany(foundedAt)) {
    add("YOUNG_COMPANY", "Unternehmen < 2 Jahre alt", 20, "identity");
  }

  // ─── Fehlgeschlagene Logins (max +25)
  if (user.failedLoginCount > 0) {
    const loginPts = Math.min(25, user.failedLoginCount * 5);
    add("FAILED_LOGINS", `${user.failedLoginCount} fehlgeschlagene Anmeldeversuche`, loginPts, "behavior");
  }

  // ─── Gesperrter Account
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    add("ACCOUNT_LOCKED", "Account aktuell gesperrt", 20, "behavior");
  }

  // ─── KYC-Dokument-Ablehnungen
  const rejected = user.kycDocuments.filter(d => d.status === "REJECTED").length;
  if (rejected > 0) {
    add("KYC_DOCS_REJECTED", `${rejected} KYC-Dokument(e) abgelehnt`, rejected * 10, "documents");
  }

  // ─── Verifikationsstatus
  if (user.verificationStatus === "REJECTED") {
    add("VERIFICATION_REJECTED", "KYC-Antrag abgelehnt", 20, "identity");
  } else if (user.verificationStatus === "SUSPENDED") {
    add("VERIFICATION_SUSPENDED", "Account gesperrt (Compliance)", 30, "identity");
  }

  // ─── Fehlende Compliance-Nachweise
  if (!user.pepDeclarationAt) {
    add("MISSING_PEP", "PEP-Selbstauskunft fehlt", 10, "identity");
  }
  if (!user.uboDeclarationAt) {
    add("MISSING_UBO", "UBO-Erklärung fehlt", 10, "identity");
  }
  if (!user.emailVerified) {
    add("EMAIL_UNVERIFIED", "E-Mail-Adresse nicht bestätigt", 10, "identity");
  }

  const result: RiskScoreResult = { score, level: riskLevel(score), flags };

  // Score in DB persistieren
  await db.user.update({
    where: { id: userId },
    data:  {
      riskScore:    score,
      riskFlags:    flags as unknown as Prisma.InputJsonValue,
      riskScoredAt: new Date(),
    },
  });

  await audit({
    userId,
    action:     "RISK_SCORE_CALCULATED",
    entityType: "User",
    entityId:   userId,
    meta:       { score, level: result.level, flagCount: flags.length },
  });

  return result;
}
