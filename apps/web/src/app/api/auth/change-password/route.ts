import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, "Mindestens 8 Zeichen erforderlich"),
});

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    payload = await verifyAccessToken(auth?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe" }, { status: 422 });
  }

  const user = await db.user.findUnique({ where: { id: payload.userId }, select: { passwordHash: true } });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Aktuelles Passwort ist falsch." }, { status: 400 });

  const newHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({ where: { id: payload.userId }, data: { passwordHash: newHash } });

  return NextResponse.json({ ok: true });
}
