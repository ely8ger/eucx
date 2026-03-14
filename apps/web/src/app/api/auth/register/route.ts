import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, organizationName, taxId, country, city, role } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ code: "EMAIL_TAKEN", message: "E-Mail bereits registriert" }, { status: 409 });
    }
    const passwordHash = await hashPassword(password);
    const org  = await db.organization.create({ data: { name: organizationName, taxId, country, city } });
    const user = await db.user.create({ data: { email, passwordHash, role, organizationId: org.id, status: "PENDING" } });
    return NextResponse.json({ data: { message: "Registrierung erfolgreich. Konto wird geprüft.", userId: user.id } }, { status: 201 });
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
