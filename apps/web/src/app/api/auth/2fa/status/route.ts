/**
 * GET /api/auth/2fa/status
 *
 * Gibt den 2FA-Status des aktuellen Nutzers zurück.
 * { totpEnabled: boolean; email: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    const authHeader = req.headers.get("authorization");
    tokenPayload = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { totpEnabled: true, email: true },
  });

  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  return NextResponse.json({ totpEnabled: user.totpEnabled, email: user.email });
}
