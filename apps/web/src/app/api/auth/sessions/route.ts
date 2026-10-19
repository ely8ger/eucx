/**
 * GET  /api/auth/sessions  - aktive Sessions des Nutzers
 * DELETE /api/auth/sessions - alle Sessions beenden inkl. der aktuellen (vollständiger Logout)
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

async function auth(req: NextRequest) {
  return requireAuth(req);
}

export async function GET(req: NextRequest) {
  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try { payload = await auth(req); } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const sessions = await db.refreshToken.findMany({
    where:   { userId: payload.userId, revoked: false, expiresAt: { gt: new Date() } },
    select:  { id: true, ipAddress: true, userAgent: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take:    10,
  });

  return NextResponse.json({ sessions });
}

export async function DELETE(req: NextRequest) {
  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try { payload = await auth(req); } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Alle aktiven Sessions widerrufen (inkl. der aktuellen — vollständiger Abmelde-Vorgang)
  await db.refreshToken.updateMany({
    where: { userId: payload.userId, revoked: false },
    data:  { revoked: true },
  });

  return NextResponse.json({ ok: true });
}
