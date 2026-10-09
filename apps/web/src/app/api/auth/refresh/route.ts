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
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/auth/cookie-names";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { logSecurityEvent }          from "@/lib/audit/log-event";
import { getClientIp }               from "@/lib/net/get-client-ip";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip           = getClientIp(req);
  const refreshToken = req.cookies.get(COOKIE_REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Kein Refresh-Token" }, { status: 401 });
  }

  // 1. JWT-Signatur prüfen
  let payload: { userId: string; sessionStart: number };
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Ungültiger Refresh-Token" }, { status: 401 });
  }

  // Absolute Sitzungsobergrenze: 90 Tage ab erstem Login
  const MAX_SESSION_MS = 90 * 24 * 60 * 60 * 1000;
  if (Date.now() - payload.sessionStart > MAX_SESSION_MS) {
    return NextResponse.json({ error: "Sitzung abgelaufen. Bitte erneut anmelden." }, { status: 401 });
  }

  // 2. In DB suchen + Revokations-Check
  const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
  const stored = await db.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored) {
    return NextResponse.json({ error: "Refresh-Token unbekannt" }, { status: 401 });
  }

  // Reuse-Detection: bereits widerrufener Token wurde erneut eingereicht
  // → klares Zeichen für Token-Diebstahl → alle Sessions des Users sofort invalidieren
  if (stored.revoked) {
    await db.refreshToken.updateMany({
      where: { userId: stored.userId, revoked: false },
      data:  { revoked: true },
    });
    logSecurityEvent({
      event:  "AUTH_TOKEN_REUSE_DETECTED",
      ip,
      userId: stored.userId,
      detail: "Bereits revozierter Refresh-Token wurde erneut eingereicht — alle Sessions invalidiert",
    });
    sendAuctionMail({
      to:       stored.userId, // wird unten durch echte Email ersetzt wenn User geladen
      subject:  "EUCX Sicherheitswarnung: Verdächtige Anmeldeaktivität",
      template: "account_locked",
      data:     { email: "" },
    }).catch(() => {});
    // User-Email für die Mail nachladen (async, Fehler ignorieren)
    void db.user.findUnique({ where: { id: stored.userId }, select: { email: true } })
      .then(u => u && sendAuctionMail({
        to:       u.email,
        subject:  "EUCX Sicherheitswarnung: Alle Sitzungen wurden beendet",
        template: "account_locked",
        data:     { email: u.email },
      })).catch(() => {});
    return NextResponse.json({ error: "Sicherheitsvorfall erkannt. Bitte erneut anmelden." }, { status: 401 });
  }

  if (stored.expiresAt < new Date()) {
    return NextResponse.json({ error: "Refresh-Token abgelaufen" }, { status: 401 });
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
  // sessionStart aus altem Token weitervererben → Sitzungsursprung bleibt erhalten
  const newRefresh = await signRefreshToken(user.id, payload.sessionStart);
  const newHash    = createHash("sha256").update(newRefresh).digest("hex");

  await db.refreshToken.create({
    data: {
      userId:    user.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? "unbekannt",
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

  res.cookies.set(COOKIE_ACCESS_TOKEN, newAccess, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   900,
    path:     "/",
  });

  res.cookies.set(COOKIE_REFRESH_TOKEN, newRefresh, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   30 * 24 * 60 * 60,
    path:     "/api/auth/refresh",
  });

  return res;
}
