import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes }   from "crypto";
import { db }                        from "@/lib/db/client";
import { verifyPassword }            from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { loginSchema }               from "@/lib/validation/schemas";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

const MAX_FAILED_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json() as unknown;
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where:   { email },
      include: { organization: true },
    });

    // Kein Nutzer → generische Fehlermeldung (kein User-Enumeration)
    if (!user) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "E-Mail oder Passwort falsch" },
        { status: 401 },
      );
    }

    // E-Mail noch nicht bestätigt
    if (!user.emailVerified) {
      return NextResponse.json(
        { code: "EMAIL_NOT_VERIFIED", message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse." },
        { status: 403 },
      );
    }

    // Account gesperrt (Brute-Force-Schutz)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        {
          code:    "ACCOUNT_LOCKED",
          message: "Ihr Konto ist gesperrt. Bitte setzen Sie Ihr Passwort per E-Mail zurück.",
        },
        { status: 423 },
      );
    }

    // Passwort prüfen
    const passwordOk = await verifyPassword(password, user.passwordHash);

    if (!passwordOk) {
      const newCount = user.failedLoginCount + 1;

      if (newCount >= MAX_FAILED_ATTEMPTS) {
        // Account sperren + Reset-Token generieren + Mail senden
        const rawToken  = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde

        await db.$transaction([
          db.user.update({
            where: { id: user.id },
            data:  { failedLoginCount: newCount, lockedUntil: expiresAt },
          }),
          db.passwordResetToken.create({
            data: { userId: user.id, tokenHash, expiresAt, reason: "BRUTE_FORCE_LOCK" },
          }),
        ]);

        await sendAuctionMail({
          to:       user.email,
          subject:  "EUCX — Konto gesperrt: Bitte Passwort zurücksetzen",
          template: "password_reset",
          data:     { token: rawToken, reason: "BRUTE_FORCE_LOCK", email: user.email },
        });

        return NextResponse.json(
          {
            code:    "ACCOUNT_LOCKED",
            message: `Zu viele Fehlversuche. Ihr Konto wurde gesperrt. Eine E-Mail mit einem Reset-Link wurde an ${user.email} gesendet.`,
          },
          { status: 423 },
        );
      }

      // Fehlversuch zählen, noch nicht gesperrt
      await db.user.update({
        where: { id: user.id },
        data:  { failedLoginCount: newCount },
      });

      const remaining = MAX_FAILED_ATTEMPTS - newCount;
      return NextResponse.json(
        {
          code:    "INVALID_CREDENTIALS",
          message: `E-Mail oder Passwort falsch. Noch ${remaining} Versuch${remaining === 1 ? "" : "e"} vor der Kontosperrung.`,
        },
        { status: 401 },
      );
    }

    // Passwort korrekt — Fehlzähler zurücksetzen
    if (user.failedLoginCount > 0 || user.lockedUntil) {
      await db.user.update({
        where: { id: user.id },
        data:  { failedLoginCount: 0, lockedUntil: null },
      });
    }

    // Account-Status prüfen
    if (user.status === "PENDING") {
      return NextResponse.json(
        { code: "ACCOUNT_PENDING", message: "Ihr Konto wird noch geprüft. Sie erhalten eine E-Mail sobald es freigeschaltet wurde." },
        { status: 403 },
      );
    }
    if (user.status === "REJECTED") {
      return NextResponse.json(
        { code: "ACCOUNT_REJECTED", message: "Ihre Registrierung wurde abgelehnt. Bitte wenden Sie sich an support@eucx.eu." },
        { status: 403 },
      );
    }
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { code: "ACCOUNT_INACTIVE", message: "Konto nicht aktiv. Bitte wenden Sie sich an den Support." },
        { status: 403 },
      );
    }

    // 2FA erforderlich?
    if (user.totpEnabled) {
      return NextResponse.json({ totpRequired: true }, { status: 200 });
    }

    // Tokens erstellen
    const accessToken  = await signAccessToken({
      userId: user.id,
      orgId:  user.organizationId,
      role:   user.role,
      email:  user.email,
    });
    const refreshToken = await signRefreshToken(user.id);
    const tokenHash    = createHash("sha256").update(refreshToken).digest("hex");

    await db.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    await db.auditLog.create({
      data: {
        userId:     user.id,
        action:     "LOGIN",
        entityType: "user",
        entityId:   user.id,
        ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
        userAgent:  req.headers.get("user-agent"),
      },
    });

    const response = NextResponse.json({
      data: {
        accessToken,
        user: {
          id:           user.id,
          email:        user.email,
          role:         user.role,
          organization: { id: user.organization.id, name: user.organization.name },
        },
      },
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   7 * 24 * 60 * 60,
      path:     "/api/auth/refresh",
    });

    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
