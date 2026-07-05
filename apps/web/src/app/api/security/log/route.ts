/**
 * GET /api/security/log — letzte 15 sicherheitsrelevante Aktionen des Nutzers
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const SECURITY_ACTIONS = new Set([
  "LOGIN", "LOGOUT",
  "PASSWORD_CHANGED", "PASSWORD_RESET",
  "2FA_ENABLED", "2FA_DISABLED",
  "BACKUP_CODES_GENERATED",
  "SESSION_REVOKED",
  "ADMIN_ACTION",
  "ACCOUNT_LOCKED",
]);

export async function GET(req: NextRequest) {
  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    const header = req.headers.get("authorization");
    payload = await verifyAccessToken(header?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const logs = await db.auditLog.findMany({
    where: {
      userId: payload.userId,
      action: { in: [...SECURITY_ACTIONS] },
    },
    select:  { id: true, action: true, ipAddress: true, userAgent: true, createdAt: true, meta: true },
    orderBy: { createdAt: "desc" },
    take:    15,
  });

  return NextResponse.json({ logs });
}
