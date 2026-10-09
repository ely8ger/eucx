/**
 * PATCH /api/auction/lots/[lotId]/publish
 * Privaten Entwurf (isDraft=true) veröffentlichen → isDraft=false, COLLECTION bleibt.
 * Danach sehen Verkäufer das Lot und können sich registrieren.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

async function _PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

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

export const PATCH = apiRoute(_PATCH);
