/**
 * POST /api/auth/2fa/validate
 *
 * Validiert den TOTP-Code beim Login (nach Passwort-Check).
 * Kein auth-Header nötig — nutzt pendingUserId aus temporärem Cookie.
 *
 * body: { email: string; code: string }
 *
 * Bei Erfolg: vollständiges Login-Response wie POST /api/auth/login
 */
import { NextRequest, NextResponse } from "next/server";
import { verify as totpVerify }      from "otplib";
import { createHash }                from "crypto";
import { db }                        from "@/lib/db/client";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
  code:  z.string().length(6, "Code muss 6-stellig sein"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Code ungültig" }, { status: 422 });
  }

  const user = await db.user.findUnique({
    where:   { email: parsed.data.email },
    include: { organization: { select: { id: true, name: true } } },
    // select is not used — include returns all user fields
  });

  if (!user || !user.totpSecret || !user.totpEnabled) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  if (user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }

  const isValid = await totpVerify({ token: parsed.data.code, secret: user.totpSecret });
  if (!isValid) {
    return NextResponse.json({ error: "Code ungültig. Bitte Authenticator-App prüfen." }, { status: 400 });
  }

  // Vollständige Login-Session ausstellen
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60,
    path:     "/api/auth/refresh",
  });

  return res;
}
