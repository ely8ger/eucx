/**
 * POST /api/auth/2fa/validate
 *
 * Validiert den TOTP-Code beim Login (nach Passwort-Check).
 * userId kommt aus dem HttpOnly pending_2fa Cookie (kein IDOR möglich).
 * Replay-Schutz: bereits verwendete Codes werden 90s geblockt.
 *
 * body: { code: string }
 */
import { NextRequest, NextResponse }         from "next/server";
import { verifySync }                        from "otplib";
import { createHash }                        from "crypto";
import { db }                                from "@/lib/db/client";
import { signAccessToken, signRefreshToken, verifyPending2faToken } from "@/lib/auth/jwt";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, COOKIE_PENDING_2FA } from "@/lib/auth/cookie-names";
import { checkRateLimit, rateLimitHeaders }  from "@/lib/rate-limit";
import { isTotpCodeUsed, markTotpCodeUsed }  from "@/lib/auth/totp-replay";
import { getClientIp }                       from "@/lib/net/get-client-ip";
import { z }                                 from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  code: z.string().length(6, "Code muss 6-stellig sein").regex(/^\d{6}$/, "Nur Ziffern erlaubt"),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. pending_2fa Cookie lesen und verifizieren
  const pending2fa = req.cookies.get(COOKIE_PENDING_2FA)?.value;
  if (!pending2fa) {
    return NextResponse.json({ error: "Kein aktiver Login-Vorgang. Bitte erneut anmelden." }, { status: 401 });
  }

  let userId: string;
  try {
    const p = await verifyPending2faToken(pending2fa);
    userId = p.userId;
  } catch {
    return NextResponse.json({ error: "Abgelaufener Login-Vorgang. Bitte erneut anmelden." }, { status: 401 });
  }

  // 2. Body validieren
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Code ungültig" }, { status: 422 });
  }

  // 3. Brute-Force-Schutz: 5 Versuche/Minute pro User
  const rl = await checkRateLimit(`2fa:${userId}`, "auth");
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

  if (!user || !user.totpSecret || !user.totpEnabled) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  if (user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }

  // 5. TOTP prüfen
  const isValid = verifySync({ secret: user.totpSecret, token: parsed.data.code, epochTolerance: 30 }).valid;
  if (!isValid) {
    return NextResponse.json({ error: "Code ungültig. Bitte Authenticator-App prüfen." }, { status: 400 });
  }

  // 6. Replay-Schutz: Code für 90s sperren
  const alreadyUsed = await isTotpCodeUsed(userId, parsed.data.code);
  if (alreadyUsed) {
    return NextResponse.json({ error: "Dieser Code wurde bereits verwendet. Bitte warten Sie auf den nächsten Code." }, { status: 400 });
  }
  await markTotpCodeUsed(userId, parsed.data.code);

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

  const res = NextResponse.json({
    data: {
      accessToken,
      expiresAt,
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
    path:     "/api/auth/2fa",
  });

  return res;
}
