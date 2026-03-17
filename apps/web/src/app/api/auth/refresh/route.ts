/**
 * POST /api/auth/refresh
 *
 * Erneuert den Access Token mit dem HttpOnly Refresh-Token Cookie.
 * Refresh-Token wird nach Verwendung rotiert (Token-Rotation Pattern).
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash }                from "crypto";
import { db }                        from "@/lib/db/client";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Kein Refresh-Token" }, { status: 401 });
  }

  // 1. JWT-Signatur prüfen
  let payload: { userId: string };
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Ungültiger Refresh-Token" }, { status: 401 });
  }

  // 2. In DB suchen + Revokations-Check
  const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
  const stored = await db.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return NextResponse.json({ error: "Refresh-Token abgelaufen oder widerrufen" }, { status: 401 });
  }

  // 3. User laden
  const user = await db.user.findUnique({
    where:   { id: payload.userId },
    include: { organization: { select: { id: true, name: true } } },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }

  // 4. Token-Rotation: alten revozieren, neuen ausstellen
  await db.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });

  const newAccess  = await signAccessToken({
    userId: user.id,
    orgId:  user.organizationId,
    role:   user.role,
    email:  user.email,
  });
  const newRefresh = await signRefreshToken(user.id);
  const newHash    = createHash("sha256").update(newRefresh).digest("hex");

  await db.refreshToken.create({
    data: {
      userId:    user.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const expiresAt = Date.now() + 15 * 60 * 1000;   // 15 Minuten

  const res = NextResponse.json({
    accessToken: newAccess,
    expiresAt,
    user: {
      id:                 user.id,
      email:              user.email,
      role:               user.role,
      orgId:              user.organizationId,
      orgName:            user.organization.name,
      verificationStatus: user.verificationStatus,
    },
  });

  res.cookies.set("refresh_token", newRefresh, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60,
    path:     "/api/auth/refresh",
  });

  return res;
}
