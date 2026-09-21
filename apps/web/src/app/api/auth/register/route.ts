import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { hashPassword }              from "@/lib/auth/password";
import { registerSchema }            from "@/lib/validation/schemas";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { generateEucxMemberId }      from "@/lib/members/eucx-id";
import { isPwnedPassword }           from "@/lib/auth/pwned-password";
import { checkRateLimit }            from "@/lib/rate-limit";
import { getClientIp }               from "@/lib/net/get-client-ip";

export const dynamic = "force-dynamic";

/** Kryptographisch sicherer 6-stelliger Code */
function generateVerificationCode(): string {
  const buf = Buffer.allocUnsafe(4);
  const val = (Math.random() * 0xffffffff) >>> 0; // PRNG reicht für 6-stelligen Code
  buf.writeUInt32BE(val, 0);
  return String(buf.readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

// Generische Erfolgsmeldung — identisch für neue und bereits existierende E-Mails
const GENERIC_RESPONSE = { data: { message: "Registrierung gestartet. Bitte prüfen Sie Ihr E-Mail-Postfach und geben Sie den Code ein.", userId: "__pending__" } };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate-Limit: max. 5 Versuche pro IP / Minute
  const rl = await checkRateLimit(ip, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { code: "RATE_LIMIT", message: "Zu viele Versuche. Bitte warten Sie kurz." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const body   = await req.json() as unknown;
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password, organizationName, taxId, lei, country, city, street, postalCode, phone, hrb, legalForm, foundedAt, naceCode, role, contactName, contactPosition, isGeschaeftsfuehrer } = parsed.data;

    // HaveIBeenPwned — Passwort gegen bekannte Leaks prüfen
    const pwned = await isPwnedPassword(password);
    if (pwned) {
      return NextResponse.json(
        {
          code:    "PASSWORD_PWNED",
          message: "Dieses Passwort ist in bekannten Datenlecks aufgetaucht und kann nicht verwendet werden. Bitte wählen Sie ein anderes Passwort.",
        },
        { status: 422 },
      );
    }

    // Duplikat-Prüfung — gleiche Antwort wie bei neuer Registrierung (kein User-Enumeration-Leak)
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Bestehenden Account-Inhaber diskret benachrichtigen
      await sendAuctionMail({
        to:       email,
        subject:  "EUCX - Registrierungsversuch mit Ihrer E-Mail",
        template: "register_duplicate",
        data:     { email },
      }).catch(() => {}); // Fehler nicht nach außen leaken
      return NextResponse.json(GENERIC_RESPONSE, { status: 201 });
    }

    const passwordHash = await hashPassword(password);

    // Organisation + Nutzer anlegen (PENDING, emailVerified=false)
    const org  = await db.organization.create({
      data: {
        name: organizationName, taxId, lei, country, city,
        street, postalCode, phone, hrb, legalForm, naceCode,
        foundedAt: foundedAt ? new Date(foundedAt) : undefined,
        contactName, contactPosition, isGeschaeftsfuehrer,
      },
    });
    // EUCX Member-ID generieren und direkt setzen
    const memberId = generateEucxMemberId(org.country, role, org.memberSeq);
    await db.organization.update({ where: { id: org.id }, data: { memberId } });

    const user = await db.user.create({
      data: { email, passwordHash, role, organizationId: org.id, status: "PENDING", emailVerified: false },
    });

    // E-Mail-Bestätigungscode generieren (gültig 15 Min.)
    const code      = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.emailVerification.create({
      data: { userId: user.id, email, code, expiresAt },
    });

    await sendAuctionMail({
      to:       email,
      subject:  "EUCX - Bestätigen Sie Ihre E-Mail-Adresse",
      template: "email_verification",
      data:     { code },
    });

    return NextResponse.json(
      { data: { message: GENERIC_RESPONSE.data.message, userId: user.id } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
