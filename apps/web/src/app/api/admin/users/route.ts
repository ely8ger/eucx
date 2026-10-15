/**
 * GET /api/admin/users
 *
 * Admin-Übersicht aller Nutzer mit Status, Rolle, Risiko-Score.
 *
 * Query-Parameter (alle optional):
 *   status=ACTIVE|PENDING|SUSPENDED|REJECTED
 *   role=BUYER|SELLER|BROKER|ADMIN|SUPER_ADMIN|COMPLIANCE_OFFICER
 *   search=<email-Teilstring>
 *   page=1  limit=25
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

const VALID_STATUS = ["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"] as const;
const VALID_ROLES  = ["BUYER", "SELLER", "BROKER", "ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const roleParam   = searchParams.get("role");
    const search      = searchParams.get("search")?.trim() ?? "";
    const page        = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit       = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
    const skip        = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (statusParam && (VALID_STATUS as readonly string[]).includes(statusParam)) {
      where.status = statusParam;
    }
    if (roleParam && (VALID_ROLES as readonly string[]).includes(roleParam)) {
      where.role = roleParam;
    }
    if (search.length >= 3) {
      where.email = { contains: search, mode: "insensitive" };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id:                 true,
          email:              true,
          role:               true,
          status:             true,
          verificationStatus: true,
          riskScore:          true,
          riskScoredAt:       true,
          emailVerified:      true,
          createdAt:          true,
          organization: {
            select: { name: true, country: true, isVerified: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take:    limit,
        skip,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
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
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
