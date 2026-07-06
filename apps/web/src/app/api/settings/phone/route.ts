/**
 * GET  /api/settings/phone  — Aktuelle Telefonnummer der Organisation
 * PUT  /api/settings/phone  — Telefonnummer speichern + phoneVerified setzen
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function authenticate(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try { return await verifyAccessToken(auth.slice(7)); }
  catch { return null; }
}

export async function GET(req: NextRequest) {
  const token = await authenticate(req);
  if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: token.userId },
    select: {
      phoneVerified: true,
      organization: { select: { phone: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  return NextResponse.json({
    phone:         user.organization?.phone ?? null,
    phoneVerified: user.phoneVerified,
  });
}

const updateSchema = z.object({
  phone: z.string().min(6).max(30),
});

export async function PUT(req: NextRequest) {
  const token = await authenticate(req);
  if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Telefonnummer", details: parsed.error.flatten() }, { status: 422 });
  }

  const user = await db.user.findUnique({
    where: { id: token.userId },
    select: { organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  await db.organization.update({
    where: { id: user.organizationId },
    data:  { phone: parsed.data.phone },
  });

  await db.user.update({
    where: { id: token.userId },
    data:  { phoneVerified: true },
  });

  return NextResponse.json({ success: true, phone: parsed.data.phone, phoneVerified: true });
}
