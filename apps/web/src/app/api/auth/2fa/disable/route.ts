/**
 * POST /api/auth/2fa/disable
 *
 * Deaktiviert TOTP-2FA für den aktuellen Nutzer.
 * Löscht totpSecret und setzt totpEnabled = false.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    const authHeader = req.headers.get("authorization");
    tokenPayload = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  await db.user.update({
    where: { id: tokenPayload.userId },
    data:  { totpEnabled: false, totpSecret: null },
  });

  await audit({
    userId:     tokenPayload.userId,
    action:     "ADMIN_ACTION",
    entityType: "User",
    entityId:   tokenPayload.userId,
    ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
    userAgent:  req.headers.get("user-agent") ?? "",
    meta:       { twoFaAction: "DISABLED" },
  });

  return NextResponse.json({ ok: true });
}
