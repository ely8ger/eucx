/**
 * GET /api/cron/kyc-deadline-check
 *
 * Täglicher Cron (07:30 UTC) — prüft abgelaufene KYC-Rückfrage-Fristen.
 * Nutzer mit `inquiryDeadlineAt < now` erhalten eine Eskalations-E-Mail
 * an das Compliance-Team. Danach wird `inquiryDeadlineAt` auf null gesetzt.
 *
 * Auth: Authorization: Bearer {CRON_SECRET}
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { pingCronHealthcheck }       from "@/lib/monitoring/healthcheck";

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

  const now = new Date();

  const overdueUsers = await db.user.findMany({
    where: {
      inquiryDeadlineAt: { lte: now },
      status:            { notIn: ["SUSPENDED"] },
    },
    select: {
      id:               true,
      email:            true,
      inquiryDeadlineAt: true,
      organization:     { select: { name: true, memberId: true } },
    },
    take: 100,
  });

  let escalated = 0;
  const escalationEmail = process.env.COMPLIANCE_ESCALATION_EMAIL ?? process.env.ADMIN_EMAIL ?? "";

  for (const user of overdueUsers) {
    if (escalationEmail) {
      await sendAuctionMail({
        to:       escalationEmail,
        subject:  `EUCX Compliance — KYC-Frist abgelaufen: ${user.organization.name}`,
        template: "inquiry_deadline_expired",
        data:     {
          orgName:   user.organization.name,
          memberId:  user.organization.memberId ?? "—",
          email:     user.email,
          deadline:  user.inquiryDeadlineAt!.toLocaleDateString("de-DE"),
        },
      }).catch(() => {});
    }

    await db.user.update({
      where: { id: user.id },
      data:  { inquiryDeadlineAt: null },
    });

    escalated++;
  }

  pingCronHealthcheck("kyc-deadline-check");
  return NextResponse.json({
    ok:        true,
    escalated,
    checkedAt: now.toISOString(),
  });
}
