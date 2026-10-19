/**
 * POST /api/auth/2fa/disable
 *
 * Deaktiviert TOTP-2FA für den aktuellen Nutzer.
 * Löscht totpSecret und setzt totpEnabled = false.
 */
import { NextRequest, NextResponse } from "next/server";
import { verify as totpVerify }      from "otplib";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getClientIp }               from "@/lib/net/get-client-ip";
import { logSecurityEvent, persistAuditLog } from "@/lib/audit/log-event";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  let tokenPayload;
  try { tokenPayload = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  // Rate-Limit: 5 Versuche/Minute — verhindert Brute-Force auf 2FA-Deaktivierung
  const rl = await checkRateLimit(`2fa:setup:${tokenPayload.userId}`, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte versuchen Sie es in einer Minute erneut." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  // TOTP-Code prüfen
  let body: { code?: string } = {};
  try { body = await req.json() as { code?: string }; } catch { /* code optional */ }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { totpSecret: true, totpEnabled: true, email: true },
  });
  if (user?.totpEnabled && user.totpSecret) {
    if (!body.code || body.code.length !== 6) {
      return NextResponse.json({ error: "Bitte 6-stelligen Code eingeben." }, { status: 422 });
    }
    const valid = await totpVerify({ token: body.code, secret: user.totpSecret });
    if (!valid) {
      return NextResponse.json({ error: "Code ungültig." }, { status: 400 });
    }
  }

  await db.user.update({
    where: { id: tokenPayload.userId },
    data:  { totpEnabled: false, totpSecret: null },
  });

  logSecurityEvent({ event: "AUTH_2FA_DISABLED", ip, userId: tokenPayload.userId });
  void persistAuditLog({
    action:     "AUTH_2FA_DISABLED",
    userId:     tokenPayload.userId,
    entityType: "user",
    entityId:   tokenPayload.userId,
    ipAddress:  ip,
    userAgent:  req.headers.get("user-agent") ?? undefined,
  });

  if (user?.email) {
    sendAuctionMail({
      to:       user.email,
      subject:  "EUCX – Zwei-Faktor-Authentifizierung deaktiviert",
      template: "account_locked",
      data:     { email: user.email },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
