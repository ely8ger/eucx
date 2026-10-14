/**
 * GET /api/admin/kyc/[userId]
 *
 * Gibt vollständige KYC-Übersicht eines Nutzers zurück.
 * Auth: SUPER_ADMIN oder COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

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
    console.error("[admin/kyc/[userId]]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
