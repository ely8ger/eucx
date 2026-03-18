/**
 * POST /api/auth/logout
 *
 * Löscht den Refresh-Token aus DB (Revokation) und löscht alle Auth-Cookies.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash }                from "crypto";
import { db }                        from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // Refresh-Token aus DB revozieren (auch wenn Cookie fehlt - kein Fehler)
  if (refreshToken) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    await db.refreshToken
      .updateMany({ where: { tokenHash, revoked: false }, data: { revoked: true } })
      .catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token",  "", { maxAge: 0, path: "/" });
  res.cookies.set("refresh_token", "", { maxAge: 0, path: "/api/auth/refresh" });
  return res;
}
