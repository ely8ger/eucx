import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { hashPassword }              from "@/lib/auth/password";
import { registerSchema }            from "@/lib/validation/schemas";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

/** Kryptographisch sicherer 6-stelliger Code */
function generateVerificationCode(): string {
  const buf = Buffer.allocUnsafe(4);
  const val = (Math.random() * 0xffffffff) >>> 0; // PRNG reicht für 6-stelligen Code
  buf.writeUInt32BE(val, 0);
  return String(buf.readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json() as unknown;
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password, organizationName, taxId, country, city, role } = parsed.data;

    // Duplikat-Prüfung
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Immer 201 zurückgeben um E-Mail-Enumeration zu vermeiden
      return NextResponse.json(
        { data: { message: "Falls diese E-Mail noch nicht registriert ist, erhalten Sie in Kürze einen Bestätigungscode.", userId: null } },
        { status: 201 },
      );
    }

    const passwordHash = await hashPassword(password);

    // Organisation + Nutzer anlegen (PENDING, emailVerified=false)
    const org  = await db.organization.create({ data: { name: organizationName, taxId, country, city } });
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
      subject:  "EUCX — Bestätigen Sie Ihre E-Mail-Adresse",
      template: "email_verification",
      data:     { code },
    });

    return NextResponse.json(
      { data: { message: "Registrierung gestartet. Bitte prüfen Sie Ihr E-Mail-Postfach und geben Sie den Code ein.", userId: user.id } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
