/**
 * GET /api/admin/compliance/risk-overview
 *
 * Übersicht aller Nutzer mit erhöhtem Risiko-Score.
 *
 * Query-Parameter:
 *   level=CRITICAL|HIGH|MEDIUM|ALL  (Default: CRITICAL)
 *   page=1  limit=25
 *
 * Schwellenwerte:
 *   CRITICAL: score >= 70
 *   HIGH:     score >= 50
 *   MEDIUM:   score >= 25
 *   ALL:      score >= 1
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

const THRESHOLDS: Record<string, number> = {
  CRITICAL: 70,
  HIGH:     50,
  MEDIUM:   25,
  ALL:       1,
};

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const level     = (searchParams.get("level") ?? "CRITICAL").toUpperCase();
    const page      = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit     = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
    const skip      = (page - 1) * limit;
    const threshold = THRESHOLDS[level] ?? THRESHOLDS.CRITICAL;

    const where = { riskScore: { gte: threshold } };

    const [users, total, summary] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id:                 true,
          email:              true,
          role:               true,
          status:             true,
          verificationStatus: true,
          riskScore:          true,
          riskFlags:          true,
          riskScoredAt:       true,
          createdAt:          true,
          organization: {
            select: { name: true, country: true },
          },
        },
        orderBy: { riskScore: "desc" },
        take:    limit,
        skip,
      }),
      db.user.count({ where }),
      // Zusammenfassung aller Level parallel berechnen
      Promise.all([
        db.user.count({ where: { riskScore: { gte: 70 } } }),
        db.user.count({ where: { riskScore: { gte: 50, lt: 70 } } }),
        db.user.count({ where: { riskScore: { gte: 25, lt: 50 } } }),
      ]),
    ]);

    const [criticalCount, highCount, mediumCount] = summary;

    return NextResponse.json({
      overview: {
        CRITICAL: criticalCount,
        HIGH:     highCount,
        MEDIUM:   mediumCount,
        total:    criticalCount + highCount + mediumCount,
      },
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
    console.error("[admin/compliance/risk-overview GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
