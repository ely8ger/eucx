import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { hashPassword }              from "@/lib/auth/password";
import { registerSchema }            from "@/lib/validation/schemas";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { generateEucxMemberId }      from "@/lib/members/eucx-id";
import { isPwnedPassword }           from "@/lib/auth/pwned-password";
import { checkRateLimit }            from "@/lib/rate-limit";
import { getClientIp }               from "@/lib/net/get-client-ip";
import { checkSanctions }            from "@/lib/compliance/sanctions";
import { audit }                     from "@/lib/audit/logger";
import { checkVatId }                from "@/lib/vies/checker";

export const dynamic = "force-dynamic";

/** Kryptographisch sicherer 6-stelliger Code via crypto.randomInt */
import { randomInt } from "crypto";
function generateVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

// Generische Erfolgsmeldung - identisch für neue und bereits existierende E-Mails
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
    const now = new Date();

    // Sanktionsscreening — Embargo-Länder blockiert (EU/OFAC/UN)
    const sanctionResult = checkSanctions(country);
    if (sanctionResult.blocked) {
      await audit({
        action:     "SANCTIONS_HIT",
        entityType: "Organization",
        ipAddress:  ip,
        meta:       { country, reason: sanctionResult.reason, email },
      });
      return NextResponse.json(
        { code: "SANCTIONS_BLOCKED", message: sanctionResult.reason },
        { status: 403 },
      );
    }

    // VIES-Validierung: EU-USt-IdNr. prüfen (nur wenn gesetzt, EU-Land)
    if (taxId) {
      const viesResult = await checkVatId(country, taxId);
      if (!viesResult.valid && !viesResult.unchecked) {
        return NextResponse.json(
          { code: "INVALID_VAT_ID", message: "Die angegebene USt-IdNr. konnte nicht bei VIES (EU-Kommission) verifiziert werden. Bitte prüfen Sie Ihre Angabe." },
          { status: 422 },
        );
      }
    }

    // HaveIBeenPwned - Passwort gegen bekannte Leaks prüfen
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

    // Duplikat-Prüfung - gleiche Antwort wie bei neuer Registrierung (kein User-Enumeration-Leak)
    const existing = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
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
      data: {
        email, passwordHash, role, organizationId: org.id,
        status: "PENDING", emailVerified: false,
        pepDeclarationAt:  now,
        uboDeclarationAt:  now,
        termsAcceptedAt:   now,
        privacyAcceptedAt: now,
        registrationIp:    ip,
      },
    });

    // E-Mail-Bestätigungscode generieren (gültig 15 Min.)
    const code      = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.emailVerification.create({
      data: { userId: user.id, email, code, expiresAt },
    });

    // Dev-Hilfe: Code in Konsole loggen, damit Tester ohne echte E-Mail-Zustellung testen können
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[DEV] E-Mail-Verifikation\n  userId: ${user.id}\n  code:   ${code}\n  POST /api/auth/verify-email  { "userId": "${user.id}", "code": "${code}" }\n`);
    }

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
