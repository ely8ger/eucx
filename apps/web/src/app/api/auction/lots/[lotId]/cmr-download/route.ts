/**
 * GET /api/auction/lots/[lotId]/cmr-download
 *
 * Liefert das CMR-Frachtbrief-Dokument als Download.
 * Zugänglich für Käufer, Verkäufer und Admins des jeweiligen Kontrakts.
 * Gibt 404 zurück wenn kein CMR hochgeladen wurde.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token: { userId: string; role?: string };
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: {
      id:           true,
      buyerId:      true,
      sellerId:     true,
      cmrDocument:  true,
      contractNumber: true,
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  const isAdmin  = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"].includes(token.role ?? "");
  const isBuyer  = contract.buyerId  === token.userId;
  const isSeller = contract.sellerId === token.userId;

  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  if (!contract.cmrDocument) {
    return NextResponse.json({ error: "Kein CMR-Dokument vorhanden" }, { status: 404 });
  }

  // cmrDocument format: "data:<mimeType>;base64,<data>"
  const match = contract.cmrDocument.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) {
    return NextResponse.json({ error: "CMR-Dokument ungültig" }, { status: 500 });
  }

  const mimeType = match[1];
  const buffer   = Buffer.from(match[2], "base64");

  const ext = mimeType === "application/pdf" ? "pdf"
    : mimeType === "image/jpeg" ? "jpg"
    : mimeType === "image/png"  ? "png"
    : "bin";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":        mimeType,
      "Content-Disposition": `attachment; filename="CMR-${contract.contractNumber}.${ext}"`,
      "Cache-Control":       "private, no-cache",
    },
  });
}
