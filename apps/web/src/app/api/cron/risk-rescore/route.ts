/**
 * GET /api/cron/risk-rescore
 *
 * Täglicher Cron (02:00 UTC) — berechnet Risk-Scores für alle aktiven Nutzer,
 * deren Score älter als 7 Tage ist oder noch nie berechnet wurde.
 * Verarbeitet bis zu 50 User pro Lauf (Vercel 60s Limit).
 * Sendet eine Zusammenfassungs-E-Mail für CRITICAL-Fälle (Score ≥ 70).
 *
 * Auth: Authorization: Bearer {CRON_SECRET}
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { calculateRiskScore }        from "@/lib/compliance/risk-scorer";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth   = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const users = await db.user.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { riskScoredAt: null },
        { riskScoredAt: { lt: sevenDaysAgo } },
      ],
    },
    select: { id: true, email: true, organization: { select: { name: true, memberId: true } } },
    take: 50,
  });

  const criticalCases: string[] = [];
  let processed = 0;
  let errors    = 0;

  for (const user of users) {
    try {
      const result = await calculateRiskScore(user.id);
      processed++;

      if (result.level === "CRITICAL") {
        criticalCases.push(
          `${user.organization?.name ?? user.email} (${user.organization?.memberId ?? "—"}) — Score: ${result.score}/100`,
        );
      }
    } catch {
      errors++;
    }
  }

  // Eskalations-E-Mail wenn CRITICAL-Fälle vorhanden
  if (criticalCases.length > 0) {
    const escalationEmail = process.env.COMPLIANCE_ESCALATION_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
    if (escalationEmail) {
      await sendAuctionMail({
        to:       escalationEmail,
        subject:  `EUCX Compliance — ${criticalCases.length} CRITICAL Risk-Score(s)`,
        template: "compliance_risk_critical",
        data:     {
          count:   String(criticalCases.length),
          summary: criticalCases.join("\n"),
        },
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    ok:        true,
    processed,
    critical:  criticalCases.length,
    errors,
    checkedAt: new Date().toISOString(),
  });
}
