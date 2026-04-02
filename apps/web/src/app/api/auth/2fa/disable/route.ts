/**
 * POST /api/auth/2fa/disable
 *
 * Deaktiviert TOTP-2FA für den aktuellen Nutzer.
 * Löscht totpSecret und setzt totpEnabled = false.
 */
import { NextRequest, NextResponse } from "next/server";
import { verify as totpVerify }      from "otplib";
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

  // TOTP-Code prüfen
  let body: { code?: string } = {};
  try { body = await req.json() as { code?: string }; } catch { /* code optional */ }

  const user = await db.user.findUnique({ where: { id: tokenPayload.userId }, select: { totpSecret: true, totpEnabled: true } });
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
