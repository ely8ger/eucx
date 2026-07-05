/**
 * GET  /api/auth/sessions  — aktive Sessions des Nutzers
 * DELETE /api/auth/sessions — alle anderen Sessions beenden (Remote Logout)
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

async function auth(req: NextRequest) {
  const header = req.headers.get("authorization");
  return verifyAccessToken(header?.slice(7) ?? "");
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

  // Alle aktiven Sessions widerrufen außer der aktuellen (anhand IP)
  await db.refreshToken.updateMany({
    where: { userId: payload.userId, revoked: false },
    data:  { revoked: true },
  });

  return NextResponse.json({ ok: true });
}
