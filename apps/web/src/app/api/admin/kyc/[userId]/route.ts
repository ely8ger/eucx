/**
 * GET  /api/admin/kyc/[userId] — vollständige KYC-Übersicht
 * PATCH /api/admin/kyc/[userId] — verificationStatus ändern (approve/reject/suspend)
 *
 * Auth: SUPER_ADMIN oder COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { calculateRiskScore }        from "@/lib/compliance/risk-scorer";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const token    = await requireAuth(req);
    const { userId } = await params;

    if (token.role !== "SUPER_ADMIN" && token.role !== "COMPLIANCE_OFFICER") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where:   { id: userId },
      select: {
        id:                  true,
        email:               true,
        role:                true,
        status:              true,
        verificationStatus:  true,
        riskScore:           true,
        riskFlags:           true,
        riskScoredAt:        true,
        inquiryDeadlineAt:   true,
        failedLoginCount:    true,
        lockedUntil:         true,
        emailVerified:       true,
        phoneVerified:       true,
        totpEnabled:         true,
        pepDeclarationAt:    true,
        uboDeclarationAt:    true,
        rejectionReason:     true,
        registrationIp:      true,
        createdAt:           true,
        organization: {
          select: {
            id:          true,
            name:        true,
            taxId:       true,
            lei:         true,
            country:     true,
            city:        true,
            legalForm:   true,
            foundedAt:   true,
            naceCode:    true,
            isVerified:  true,
            memberId:    true,
          },
        },
        kycDocuments: {
          select: {
            id:         true,
            name:       true,
            type:       true,
            sizeMb:     true,
            status:     true,
            adminNote:  true,
            reviewedAt: true,
            createdAt:  true,
            url:        true,
          },
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          where: {
            action: {
              in: ["KYC_SUBMITTED", "KYC_APPROVED", "KYC_REJECTED", "KYC_SUSPENDED", "KYC_INQUIRY_SENT", "SANCTIONS_HIT"],
            },
          },
          select: {
            action:    true,
            createdAt: true,
            ipAddress: true,
            meta:      true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/kyc/[userId] GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

const patchSchema = z.object({
  action:       z.enum(["approve", "reject", "suspend"]),
  reason:       z.string().max(2000).optional(),
  forceApprove: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const token      = await requireAuth(req);
    const { userId } = await params;

    if (token.role !== "SUPER_ADMIN" && token.role !== "COMPLIANCE_OFFICER") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const user = await db.user.findUnique({
      where:  { id: userId },
      select: {
        email:              true,
        riskScore:          true,
        verificationStatus: true,
        organizationId:     true,
        organization: { select: { name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    const { action, reason, forceApprove } = parsed.data;

    // ── Idempotenz: bereits verarbeitete Status nicht doppelt setzen ────────
    if (action === "approve" && user.verificationStatus === "VERIFIED") {
      return NextResponse.json({ error: "Nutzer ist bereits verifiziert" }, { status: 409 });
    }
    if (action === "reject" && user.verificationStatus === "REJECTED") {
      return NextResponse.json({ error: "Nutzer ist bereits abgelehnt" }, { status: 409 });
    }
    if (action === "suspend" && user.verificationStatus === "SUSPENDED") {
      return NextResponse.json({ error: "Nutzer ist bereits gesperrt" }, { status: 409 });
    }

    // ── HIGH_RISK Guard beim Genehmigen ─────────────────────────────────────
    if (action === "approve" && user.riskScore >= 70 && !forceApprove) {
      return NextResponse.json(
        {
          code:    "HIGH_RISK_BLOCK",
          message: `Risk-Score ${user.riskScore}/100 (CRITICAL) — Genehmigung erfordert explizite Bestätigung. Bitte mit forceApprove: true wiederholen.`,
          riskScore: user.riskScore,
        },
        { status: 422 },
      );
    }

    if (action === "approve") {
      await db.user.update({
        where: { id: userId },
        data:  {
          verificationStatus: "VERIFIED",
          status:             "ACTIVE",
          rejectionReason:    null,
        },
      });
      await db.organization.update({
        where: { id: user.organizationId },
        data:  { isVerified: true },
      });

      // Risk-Score nach Genehmigung neu berechnen (fire-and-forget)
      calculateRiskScore(userId).catch(() => {});

      await audit({
        userId:     token.userId,
        action:     "KYC_APPROVED",
        entityType: "User",
        entityId:   userId,
        meta:       { targetEmail: user.email, forceApprove: forceApprove ?? false },
      });

      sendAuctionMail({
        to:       user.email,
        subject:  "EUCX — Ihr Konto wurde verifiziert",
        template: "registration_approved",
        data:     { orgName: user.organization?.name ?? "" },
      }).catch(() => {});

    } else if (action === "reject") {
      await db.user.update({
        where: { id: userId },
        data:  {
          verificationStatus: "REJECTED",
          rejectionReason:    reason ?? null,
        },
      });

      await audit({
        userId:     token.userId,
        action:     "KYC_REJECTED",
        entityType: "User",
        entityId:   userId,
        meta:       { targetEmail: user.email, reason },
      });

      sendAuctionMail({
        to:       user.email,
        subject:  "EUCX — Ihr KYC-Antrag wurde abgelehnt",
        template: "registration_rejected",
        data:     { rejectionReason: reason ?? "Keine Begründung angegeben." },
      }).catch(() => {});

    } else {
      // suspend
      await db.user.update({
        where: { id: userId },
        data:  {
          verificationStatus: "SUSPENDED",
          status:             "SUSPENDED",
          rejectionReason:    reason ?? null,
        },
      });

      await audit({
        userId:     token.userId,
        action:     "KYC_SUSPENDED",
        entityType: "User",
        entityId:   userId,
        meta:       { targetEmail: user.email, reason },
      });
    }

    return NextResponse.json({ ok: true, action });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/kyc/[userId] PATCH]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
