/**
 * PATCH /api/auction/lots/[lotId]/publish
 * Privaten Entwurf (isDraft=true) veröffentlichen → isDraft=false, COLLECTION bleibt.
 * Danach sehen Verkäufer das Lot und können sich registrieren.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token: { userId: string };
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const { lotId } = await params;

  const lot = await db.lot.findUnique({
    where: { id: lotId },
    select: { buyerId: true, isDraft: true, phase: true },
  });

  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  if (lot.buyerId !== token.userId) return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  if (!lot.isDraft) return NextResponse.json({ error: "Lot ist bereits veröffentlicht" }, { status: 409 });
  if (lot.phase !== "COLLECTION") return NextResponse.json({ error: "Nur COLLECTION-Lots können veröffentlicht werden" }, { status: 400 });

  await db.lot.update({ where: { id: lotId }, data: { isDraft: false } });

  return NextResponse.json({ ok: true });
}
