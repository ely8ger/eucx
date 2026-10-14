/**
 * POST /api/auth/reset-password
 *
 * Setzt das Passwort zurück anhand eines gültigen Reset-Tokens.
 * Hebt auch die Account-Sperre auf (lockedUntil, failedLoginCount).
 *
 * Body: { token: string, newPassword: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash }                from "crypto";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { hashPassword }              from "@/lib/auth/password";
import { isPwnedPassword }           from "@/lib/auth/pwned-password";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token:       z.string().min(1, "Token erforderlich"),
  newPassword: z.string()
    .min(10, "Mindestens 10 Zeichen erforderlich")
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe erforderlich")
    .regex(/[0-9]/, "Mindestens eine Zahl erforderlich")
    .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen erforderlich"),
});

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Ungültiger Body." },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
        { status: 422 },
      );
    }

    const { token, newPassword } = parsed.data;

    // Token zuerst validieren — HIBP danach.
    // Sonst kann ein Angreifer ohne gültigen Token beliebige Passwörter
    // gegen HIBP testen und damit EUCX als kostenlosen HIBP-Proxy nutzen.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { code: "INVALID_TOKEN", message: "Der Reset-Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an." },
        { status: 400 },
      );
    }

    const pwned = await isPwnedPassword(newPassword);
    if (pwned) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wählen Sie ein anderes." },
        { status: 422 },
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.$transaction([
      // Token verbrauchen
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data:  { usedAt: new Date() },
      }),
      // Passwort setzen + Sperre aufheben + alle Refresh-Tokens invalidieren
      db.user.update({
        where: { id: resetToken.userId },
        data:  {
          passwordHash:     newPasswordHash,
          failedLoginCount: 0,
          lockedUntil:      null,
        },
      }),
      db.refreshToken.updateMany({
        where: { userId: resetToken.userId, revoked: false },
        data:  { revoked: true },
      }),
    ]);

    return NextResponse.json({
      data: { message: "Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden." },
    });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
