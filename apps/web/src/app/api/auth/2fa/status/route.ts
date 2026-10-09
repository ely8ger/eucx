/**
 * GET /api/auth/2fa/status
 *
 * Gibt den 2FA-Status des aktuellen Nutzers zurück.
 * { totpEnabled: boolean; email: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let tokenPayload;
  try { tokenPayload = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { totpEnabled: true, email: true },
  });

  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  return NextResponse.json({ totpEnabled: user.totpEnabled, email: user.email });
}
