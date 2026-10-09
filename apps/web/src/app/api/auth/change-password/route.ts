import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { isPwnedPassword }           from "@/lib/auth/pwned-password";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import { blacklistJti }              from "@/lib/auth/token-blacklist";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string()
    .min(10, "Mindestens 10 Zeichen erforderlich")
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe erforderlich")
    .regex(/[0-9]/, "Mindestens eine Zahl erforderlich")
    .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen erforderlich"),
});

export async function POST(req: NextRequest) {
  let payload;
  try { payload = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" }, { status: 422 });
  }

  const user = await db.user.findUnique({ where: { id: payload.userId }, select: { passwordHash: true, email: true } });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Aktuelles Passwort ist falsch." }, { status: 400 });

  const pwned = await isPwnedPassword(parsed.data.newPassword);
  if (pwned) {
    return NextResponse.json(
      { error: "Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wählen Sie ein anderes." },
      { status: 422 },
    );
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  // Alle anderen Sessions invalidieren + aktuellen Access Token blacklisten
  await Promise.all([
    db.user.update({
      where: { id: payload.userId },
      data:  { passwordHash: newHash, failedLoginCount: 0, lockedUntil: null },
    }),
    db.refreshToken.deleteMany({ where: { userId: payload.userId } }),
    payload.jti && payload.exp
      ? blacklistJti(payload.jti, payload.exp * 1000)
      : Promise.resolve(),
  ]);

  // Sicherheitsbenachrichtigung an User
  sendAuctionMail({
    to:       user.email,
    subject:  "Ihr EUCX-Passwort wurde geändert",
    template: "password_changed",
    data: {
      changedAt: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "—",
    },
  }).catch((err: unknown) => console.error("[change-password] Mailer-Fehler:", err));

  const res = NextResponse.json({ ok: true });
  // HttpOnly-Cookies serverseitig löschen — Client muss sich neu einloggen
  res.cookies.set("access_token",  "", { httpOnly: true, path: "/",                  maxAge: 0 });
  res.cookies.set("refresh_token", "", { httpOnly: true, path: "/api/auth/refresh",  maxAge: 0 });
  return res;
}
