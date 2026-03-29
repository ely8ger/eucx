/**
 * POST /api/auth/forgot-password
 *
 * Generiert einen Reset-Token und sendet ihn per E-Mail.
 * Immer HTTP 200 zurückgeben — kein User-Enumeration.
 *
 * Body: { email: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes }   from "crypto";
import { db }                        from "@/lib/db/client";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string };
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "E-Mail-Adresse erforderlich." },
        { status: 400 },
      );
    }

    const email = body.email.toLowerCase().trim();

    // Immer dieselbe Antwort — verhindert Nutzer-Enumeration
    const genericResponse = NextResponse.json({
      data: { message: "Falls ein Konto mit dieser E-Mail existiert, erhalten Sie in Kürze eine E-Mail mit einem Reset-Link." },
    });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return genericResponse;

    // Rate-Limit: max 1 Reset-Token pro 5 Minuten
    const recentToken = await db.passwordResetToken.findFirst({
      where:   { userId: user.id, createdAt: { gt: new Date(Date.now() - 5 * 60_000) }, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (recentToken) return genericResponse;

    const rawToken  = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde

    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt, reason: "USER_REQUEST" },
    });

    await sendAuctionMail({
      to:       email,
      subject:  "EUCX — Passwort zurücksetzen",
      template: "password_reset",
      data:     { token: rawToken, reason: "USER_REQUEST", email },
    });

    return genericResponse;
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
