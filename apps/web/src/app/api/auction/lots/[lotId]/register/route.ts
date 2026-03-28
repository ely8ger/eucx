/**
 * POST /api/auction/lots/[lotId]/register
 *
 * Verkäufer meldet sich für eine Auktion an.
 * Nur in Phase COLLECTION möglich.
 *
 * Auth: Bearer JWT (role === SELLER oder BROKER)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { lotId: string } }
) {
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // ── User + Lot prüfen ─────────────────────────────────────────────
  const [user, lot] = await Promise.all([
    db.user.findUnique({
      where:  { id: token.userId },
      select: { id: true, role: true, status: true, verificationStatus: true },
    }),
    db.lot.findUnique({
      where:  { id: params.lotId },
      select: { id: true, phase: true, buyerId: true },
    }),
  ]);

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }
  if (!["SELLER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Nur Verkäufer können sich registrieren" }, { status: 403 });
  }
  if (user.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "KYC-Verifizierung erforderlich" }, { status: 403 });
  }
  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }
  if (lot.buyerId === token.userId) {
    return NextResponse.json({ error: "Käufer kann sich nicht als Verkäufer registrieren" }, { status: 409 });
  }
  if (lot.phase !== "COLLECTION") {
    return NextResponse.json({ error: "Registrierung nur in Phase COLLECTION möglich" }, { status: 409 });
  }

  // ── Registrierung (idempotent) ────────────────────────────────────
  const reg = await db.lotRegistration.upsert({
    where:  { lotId_sellerId: { lotId: params.lotId, sellerId: token.userId } },
    create: { lotId: params.lotId, sellerId: token.userId },
    update: {},
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({ registrationId: reg.id, registered: true });
}
