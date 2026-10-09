/**
 * PATCH /api/profile/cbam
 *
 * Speichert EORI-Nummer und CBAM-Kontonummer der Organisation.
 * Beide Felder sind selbst einzutragen (nicht aus Handelsregister ableitbar).
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { db } from "@/lib/db/client";
import { z } from "zod";
import { apiRoute } from "@/lib/api/route-handler";

const schema = z.object({
  eoriNumber:        z.string().regex(/^[A-Z]{2}[A-Z0-9]{1,15}$/, "Ungültiges EORI-Format (z.B. DE123456789012345)").nullable().optional(),
  cbamAccountNumber: z.string().min(1).nullable().optional(),
});

async function _PATCH(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors ?? "Validierungsfehler" }, { status: 422 });
  }

  const user = await db.user.findUnique({
    where:  { id: token.userId },
    select: { organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  await db.organization.update({
    where: { id: user.organizationId },
    data: {
      ...(parsed.data.eoriNumber        !== undefined ? { eoriNumber:        parsed.data.eoriNumber }        : {}),
      ...(parsed.data.cbamAccountNumber !== undefined ? { cbamAccountNumber: parsed.data.cbamAccountNumber } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export const PATCH = apiRoute(_PATCH);
