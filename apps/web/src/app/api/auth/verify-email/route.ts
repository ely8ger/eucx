/**
 * POST /api/auth/verify-email
 *
 * Bestätigt die E-Mail-Adresse mit dem 6-stelligen Code aus der Registrierungsmail.
 * Nach erfolgreicher Prüfung: emailVerified=true, Nutzer kann sich einloggen (sobald Admin freischaltet).
 *
 * Body: { userId: string, code: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { userId?: string; code?: string };

    if (!body.userId || !body.code) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "userId und code sind erforderlich." },
        { status: 400 },
      );
    }

    const { userId, code } = body;

    // Gültigste (neueste, noch nicht verwendete) Verification suchen
    const verification = await db.emailVerification.findFirst({
      where: {
        userId,
        code,
        usedAt:    null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { code: "INVALID_CODE", message: "Der Code ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Code an." },
        { status: 400 },
      );
    }

    // Code als verwendet markieren + User als verifiziert und sofort aktiv setzen
    await db.$transaction([
      db.emailVerification.update({
        where: { id: verification.id },
        data:  { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: userId },
        data:  { emailVerified: true, status: "ACTIVE" },
      }),
    ]);

    return NextResponse.json({
      data: { message: "E-Mail-Adresse bestätigt. Sie können sich jetzt anmelden." },
    });
  } catch (err) {
    console.error("[auth/verify-email]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}

/**
 * PATCH /api/auth/verify-email/change-email
 * E-Mail-Adresse vor der Bestätigung korrigieren.
 * Body: { userId: string, newEmail: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { userId?: string; newEmail?: string };
    if (!body.userId || !body.newEmail) {
      return NextResponse.json({ code: "VALIDATION_ERROR", message: "userId und newEmail sind erforderlich." }, { status: 400 });
    }

    const newEmail = body.newEmail.toLowerCase().trim();

    // Basis-Format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ code: "INVALID_EMAIL", message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 422 });
    }

    // Freie / Wegwerf-Anbieter ablehnen
    const freeDomains = new Set(["gmail.com","yahoo.com","yahoo.de","hotmail.com","hotmail.de","outlook.com","outlook.de","live.com","live.de","gmx.de","gmx.net","gmx.at","gmx.com","web.de","t-online.de","icloud.com","me.com","mac.com","aol.com","protonmail.com","proton.me","mailbox.org","posteo.de","tutanota.com"]);
    const domain = newEmail.split("@")[1] ?? "";
    if (freeDomains.has(domain)) {
      return NextResponse.json({ code: "FREE_EMAIL", message: "Bitte verwenden Sie Ihre Geschäfts-E-Mail-Adresse (keine privaten Anbieter wie Gmail, GMX etc.)." }, { status: 422 });
    }

    // User muss existieren und noch unverifiziert sein
    const user = await db.user.findUnique({ where: { id: body.userId }, select: { id: true, email: true, emailVerified: true } });
    if (!user) return NextResponse.json({ code: "NOT_FOUND", message: "Benutzer nicht gefunden." }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ code: "ALREADY_VERIFIED", message: "Die E-Mail-Adresse wurde bereits bestätigt." }, { status: 409 });

    // Neue E-Mail nicht bereits vergeben
    const existing = await db.user.findUnique({ where: { email: newEmail }, select: { id: true } });
    if (existing && existing.id !== body.userId) {
      return NextResponse.json({ code: "EMAIL_TAKEN", message: "Diese E-Mail-Adresse ist bereits registriert." }, { status: 409 });
    }

    const code      = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.$transaction([
      db.user.update({ where: { id: body.userId }, data: { email: newEmail } }),
      db.emailVerification.create({ data: { userId: body.userId, email: newEmail, code, expiresAt } }),
    ]);

    const { sendAuctionMail } = await import("@/lib/notifications/mailer");
    await sendAuctionMail({ to: newEmail, subject: "EUCX - Bestätigungscode", template: "email_verification", data: { code } });

    return NextResponse.json({ data: { email: newEmail, message: "E-Mail-Adresse aktualisiert. Neuer Code wurde gesendet." } });
  } catch (err) {
    console.error("[auth/verify-email change]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}

/**
 * POST /api/auth/verify-email/resend - Code erneut senden
 * Body: { userId: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as { userId?: string };
    if (!body.userId) {
      return NextResponse.json({ code: "VALIDATION_ERROR", message: "userId erforderlich." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: body.userId } });
    if (!user || user.emailVerified) {
      return NextResponse.json(
        { data: { message: "Falls Ihre E-Mail noch nicht bestätigt ist, erhalten Sie in Kürze einen neuen Code." } },
      );
    }

    // Rate-Limit: max 1 neuer Code pro Minute
    const recent = await db.emailVerification.findFirst({
      where:   { userId: body.userId, createdAt: { gt: new Date(Date.now() - 60_000) } },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      return NextResponse.json(
        { code: "RATE_LIMIT", message: "Bitte warten Sie eine Minute, bevor Sie einen neuen Code anfordern." },
        { status: 429 },
      );
    }

    const code      = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.emailVerification.create({
      data: { userId: user.id, email: user.email, code, expiresAt },
    });

    const { sendAuctionMail } = await import("@/lib/notifications/mailer");
    await sendAuctionMail({
      to:       user.email,
      subject:  "EUCX - Neuer Bestätigungscode",
      template: "email_verification",
      data:     { code },
    });

    return NextResponse.json({ data: { message: "Ein neuer Code wurde an Ihre E-Mail gesendet." } });
  } catch (err) {
    console.error("[auth/verify-email resend]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
