/**
 * POST /api/auth/logout
 *
 * 1. Refresh-Token aus DB revozieren
 * 2. Access-Token JTI in Blacklist eintragen (sofortige Revokation, max. 15 Min.)
 * 3. Alle Auth-Cookies löschen
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash }                from "crypto";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { blacklistJti }              from "@/lib/auth/token-blacklist";
import { logSecurityEvent, persistAuditLog } from "@/lib/audit/log-event";
import { getClientIp }               from "@/lib/net/get-client-ip";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip           = getClientIp(req);
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // Refresh-Token aus DB revozieren
  if (refreshToken) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    await db.refreshToken
      .updateMany({ where: { tokenHash, revoked: false }, data: { revoked: true } })
      .catch(() => undefined);
  }

  // Access-Token JTI sofort sperren (Bearer oder Cookie)
  const authHeader  = req.headers.get("authorization");
  const cookieToken = req.cookies.get("access_token")?.value;
  const rawToken    = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  let userId: string | undefined;

  if (rawToken) {
    try {
      const payload = await verifyAccessToken(rawToken);
      userId = payload.userId;
      if (payload.jti && payload.exp) {
        await blacklistJti(payload.jti, payload.exp * 1000);
      }
    } catch {
      // Abgelaufenes oder ungültiges Token — kein Blacklist-Eintrag nötig
    }
  }

  logSecurityEvent({ event: "AUTH_LOGOUT", ip, userId });
  void persistAuditLog({
    action:     "AUTH_LOGOUT",
    userId,
    entityType: "user",
    entityId:   userId,
    ipAddress:  ip,
    userAgent:  req.headers.get("user-agent") ?? undefined,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token",  "", { maxAge: 0, path: "/" });
  res.cookies.set("refresh_token", "", { maxAge: 0, path: "/api/auth/refresh" });
  return res;
}
