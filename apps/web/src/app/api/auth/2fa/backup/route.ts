/**
 * POST /api/auth/2fa/backup
 *
 * Login-Fallback wenn Authenticator nicht verfügbar.
 * Akzeptiert einen Backup-Code (Format: XXXX-XXXX) statt TOTP.
 * userId kommt aus dem HttpOnly pending_2fa Cookie — kein IDOR möglich.
 *
 * Jeder Code ist einmalig (usedAt wird gesetzt).
 * Rate-Limit: 5 Versuche/Minute pro User (gleich wie 2fa/validate).
 *
 * body: { code: string }  — Format: "A1B2-C3D4"
 */
import { NextRequest, NextResponse }         from "next/server";
import { createHash }                        from "crypto";
import { db }                                from "@/lib/db/client";
import { signAccessToken, signRefreshToken, verifyPending2faToken } from "@/lib/auth/jwt";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, COOKIE_PENDING_2FA } from "@/lib/auth/cookie-names";
import { checkRateLimit, rateLimitHeaders }  from "@/lib/rate-limit";
import { getClientIp }                       from "@/lib/net/get-client-ip";
import { logSecurityEvent, persistAuditLog } from "@/lib/audit/log-event";
import { sendAuctionMail }                   from "@/lib/notifications/mailer";
import { z }                                 from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  code: z.string()
    .regex(/^[A-F0-9]{4}-[A-F0-9]{4}$/i, "Ungültiges Backup-Code-Format (XXXX-XXXX)"),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. pending_2fa Cookie lesen und verifizieren
  const pending2fa = req.cookies.get(COOKIE_PENDING_2FA)?.value;
  if (!pending2fa) {
    return NextResponse.json(
      { error: "Kein aktiver Login-Vorgang. Bitte erneut anmelden." },
      { status: 401 },
    );
  }

  let userId: string;
  try {
    const p = await verifyPending2faToken(pending2fa);
    userId = p.userId;
  } catch {
    return NextResponse.json(
      { error: "Abgelaufener Login-Vorgang. Bitte erneut anmelden." },
      { status: 401 },
    );
  }

  // 2. Body validieren
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Code ungültig" },
      { status: 422 },
    );
  }

  // 3. Rate-Limit: 5 Versuche/Minute pro User
  const rl = await checkRateLimit(`2fa:backup:${userId}`, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte versuchen Sie es in einer Minute erneut." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  // 4. User laden
  const user = await db.user.findUnique({
    where:   { id: userId },
    include: { organization: { select: { id: true, name: true } } },
  });

  if (!user || !user.totpEnabled) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  if (user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }

  // 5. Backup-Code-Hash prüfen und atomar als verbraucht markieren
  // updateMany statt findFirst+update verhindert Race Condition:
  // Zwei simultane Requests würden sonst beide den Code als gültig sehen,
  // bevor einer ihn markiert — und beide eine Session erhalten.
  const codeNormalized = parsed.data.code.toUpperCase();
  const codeHash       = createHash("sha256").update(codeNormalized).digest("hex");

  const marked = await db.backupCode.updateMany({
    where: { userId, codeHash, usedAt: null },
    data:  { usedAt: new Date() },
  });

  if (marked.count === 0) {
    return NextResponse.json(
      { error: "Backup-Code ungültig oder bereits verwendet." },
      { status: 400 },
    );
  }

  // 7. Vollständige Login-Session ausstellen
  const expiresAt    = Date.now() + 15 * 60 * 1000;
  const accessToken  = await signAccessToken({
    userId: user.id,
    orgId:  user.organizationId,
    role:   user.role,
    email:  user.email,
  });
  const refreshToken = await signRefreshToken(user.id);
  const tokenHash    = createHash("sha256").update(refreshToken).digest("hex");

  await db.refreshToken.create({
    data: {
      userId:    user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? "unbekannt",
    },
  });

  // Audit-Log + Sicherheitsmail: Backup-Code-Nutzung ist ein sicherheitsrelevantes Ereignis
  logSecurityEvent({ event: "AUTH_BACKUP_CODE_USED", ip, userId });
  void persistAuditLog({
    action: "AUTH_BACKUP_CODE_USED", userId, entityType: "user", entityId: userId,
    ipAddress: ip, userAgent: req.headers.get("user-agent") ?? undefined,
    meta: { codeHash },
  });
  sendAuctionMail({
    to:       user.email,
    subject:  "EUCX – Backup-Code für Login verwendet",
    template: "account_locked",
    data:     { email: user.email },
  }).catch(() => {});

  // Verbleibende Backup-Code-Anzahl für Warnung
  const remaining = await db.backupCode.count({
    where: { userId, usedAt: null },
  });

  const res = NextResponse.json({
    data: {
      accessToken,
      expiresAt,
      backupCodesRemaining: remaining,
      user: {
        id:                 user.id,
        email:              user.email,
        role:               user.role,
        orgId:              user.organizationId,
        orgName:            user.organization.name,
        verificationStatus: user.verificationStatus,
      },
    },
  });

  res.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   900,
    path:     "/",
  });

  res.cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   30 * 24 * 60 * 60,
    path:     "/api/auth/refresh",
  });

  // pending_2fa Cookie löschen (Login vollständig)
  res.cookies.set(COOKIE_PENDING_2FA, "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   0,
    path:     "/",
  });

  return res;
}
