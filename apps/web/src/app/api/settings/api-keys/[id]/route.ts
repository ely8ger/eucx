/**
 * DELETE /api/settings/api-keys/[id] - API-Key widerrufen (isActive = false)
 *
 * Soft-delete: Key bleibt in DB für Audit-Trail, wird aber deaktiviert.
 * Nur Keys der eigenen Organisation können widerrufen werden.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let tokenPayload;
  try { tokenPayload = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const apiKey = await db.apiKey.findUnique({
    where:  { id },
    select: { organizationId: true, isActive: true },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Key nicht gefunden" }, { status: 404 });
  }

  if (apiKey.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
  }

  if (!apiKey.isActive) {
    return NextResponse.json({ error: "Key ist bereits widerrufen" }, { status: 409 });
  }

  await db.apiKey.update({
    where: { id },
    data:  { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
