/**
 * GET /api/admin/kyc
 *
 * KYC-Queue: Alle Nutzer mit ausstehender oder laufender Verifizierung.
 *
 * Query-Parameter:
 *   status=PENDING_VERIFICATION|UNDER_REVIEW|ALL  (Default: PENDING_VERIFICATION)
 *   page=1  limit=20
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") ?? "PENDING_VERIFICATION";
    const page        = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit       = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip        = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let verificationFilter: any;
    if (statusParam === "ALL") {
      verificationFilter = { in: ["PENDING_VERIFICATION", "UNDER_REVIEW", "REJECTED", "SUSPENDED"] };
    } else if (statusParam === "UNDER_REVIEW") {
      verificationFilter = "UNDER_REVIEW";
    } else {
      verificationFilter = "PENDING_VERIFICATION";
    }

    const where = { verificationStatus: verificationFilter };

    const [queue, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id:                 true,
          email:              true,
          role:               true,
          status:             true,
          verificationStatus: true,
          riskScore:          true,
          inquiryDeadlineAt:  true,
          createdAt:          true,
          organization: {
            select: { name: true, country: true, isVerified: true, taxId: true },
          },
          kycDocuments: {
            select: { type: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take:    3,
          },
        },
        orderBy: [
          { riskScore: "desc" },
          { createdAt: "asc" },
        ],
        take: limit,
        skip,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      queue,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/kyc GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
