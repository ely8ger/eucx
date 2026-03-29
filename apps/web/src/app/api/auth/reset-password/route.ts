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
import { db }                        from "@/lib/db/client";
import { hashPassword }              from "@/lib/auth/password";

export const dynamic = "force-dynamic";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { token?: string; newPassword?: string };

    if (!body.token || !body.newPassword) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Token und neues Passwort sind erforderlich." },
        { status: 400 },
      );
    }

    if (body.newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.` },
        { status: 400 },
      );
    }

    const tokenHash = createHash("sha256").update(body.token).digest("hex");

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

    const newPasswordHash = await hashPassword(body.newPassword);

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
