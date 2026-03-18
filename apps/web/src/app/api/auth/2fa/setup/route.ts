/**
 * POST /api/auth/2fa/setup
 *
 * Generiert ein TOTP-Secret für den eingeloggten Nutzer.
 * Das Secret wird NOCH NICHT aktiviert - erst nach Verifikation (2fa/verify).
 *
 * Response: { otpAuthUrl, secret }
 *   otpAuthUrl → direkt als qrcode.react Wert verwendbar
 *   secret     → manuelle Eingabe falls QR nicht scannbar
 */
import { NextRequest, NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import { db }                          from "@/lib/db/client";
import { verifyAccessToken }           from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const APP_NAME = "EUCX";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { email: true, totpEnabled: true },
  });

  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
  if (user.totpEnabled) {
    return NextResponse.json({ error: "2FA ist bereits aktiviert" }, { status: 409 });
  }

  // Neues Secret generieren und provisorisch speichern
  const secret = generateSecret();

  await db.user.update({
    where: { id: tokenPayload.userId },
    data:  { totpSecret: secret },   // noch NICHT totpEnabled=true
  });

  const otpAuthUrl = generateURI({
    label:  user.email,
    secret,
    issuer: APP_NAME,
  });

  return NextResponse.json({ otpAuthUrl, secret });
}
