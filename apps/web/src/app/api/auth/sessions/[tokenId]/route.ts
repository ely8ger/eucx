/**
 * DELETE /api/auth/sessions/[tokenId]
 *
 * Widerruft eine einzelne Session anhand ihrer Refresh-Token-ID.
 * Ownership-Check: Session muss dem authentifizierten User gehören.
 * Ermöglicht "andere Geräte abmelden" aus der Session-Verwaltung.
 */
import { NextRequest, NextResponse }         from "next/server";
import { db }                                from "@/lib/db/client";
import { requireAuth }                       from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ tokenId: string }> },
) {
  let payload;
  try { payload = await requireAuth(req); }
  catch { return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 }); }

  const { tokenId } = await context.params;

  const session = await db.refreshToken.findUnique({
    where:  { id: tokenId },
    select: { userId: true, revoked: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  }

  // Ownership-Check: nur die eigene Session darf widerrufen werden
  if (session.userId !== payload.userId) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
  }

  if (session.revoked) {
    return NextResponse.json({ error: "Session bereits widerrufen" }, { status: 409 });
  }

  await db.refreshToken.update({
    where: { id: tokenId },
    data:  { revoked: true },
  });

  return NextResponse.json({ ok: true });
}
