/**
 * POST /api/auth/2fa/verify
 *
 * Bestätigt den 2FA-Setup mit dem ersten TOTP-Code.
 * Aktiviert 2FA auf dem Konto (totpEnabled = true).
 *
 * body: { code: string }  - 6-stelliger TOTP-Code
 */
import { NextRequest, NextResponse } from "next/server";
import { verify as totpVerify }      from "otplib";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  code: z.string().length(6, "Code muss 6-stellig sein"),
});

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Code ungültig", details: parsed.error.flatten() }, { status: 422 });
  }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user || !user.totpSecret) {
    return NextResponse.json({ error: "Kein 2FA-Secret gefunden. Bitte Setup erneut starten." }, { status: 400 });
  }

  // TOTP-Code prüfen
  const isValid = await totpVerify({ token: parsed.data.code, secret: user.totpSecret });

  if (!isValid) {
    return NextResponse.json({ error: "Code ungültig. Bitte erneut versuchen." }, { status: 400 });
  }

  // 2FA aktivieren
  await db.user.update({
    where: { id: tokenPayload.userId },
    data:  { totpEnabled: true },
  });

  return NextResponse.json({ ok: true, message: "2FA erfolgreich aktiviert" });
}
