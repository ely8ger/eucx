import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validation/schemas";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email }, include: { organization: true } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ code: "INVALID_CREDENTIALS", message: "E-Mail oder Passwort falsch" }, { status: 401 });
    }
    if (user.status !== "ACTIVE") {
      return NextResponse.json({ code: "ACCOUNT_INACTIVE", message: "Konto noch nicht freigeschaltet" }, { status: 403 });
    }
    const accessToken  = await signAccessToken({ userId: user.id, orgId: user.organizationId, role: user.role, email: user.email });
    const refreshToken = await signRefreshToken(user.id);
    const tokenHash    = createHash("sha256").update(refreshToken).digest("hex");
    await db.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    await db.auditLog.create({ data: { userId: user.id, action: "LOGIN", entityType: "user", entityId: user.id, ipAddress: req.headers.get("x-forwarded-for") ?? "unknown", userAgent: req.headers.get("user-agent") } });
    const response = NextResponse.json({ data: { accessToken, user: { id: user.id, email: user.email, role: user.role, organization: { id: user.organization.id, name: user.organization.name } } } });
    response.cookies.set("refresh_token", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/api/auth/refresh" });
    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Serverfehler" }, { status: 500 });
  }
}
