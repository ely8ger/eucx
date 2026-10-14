/**
 * GET /api/auction/lots/[lotId]/cmr-download
 *
 * Liefert das CMR-Frachtbrief-Dokument.
 * Neue Uploads: Redirect zur Vercel Blob URL (cmrUrl).
 * Altdaten: Base64-Decode aus cmrDocument (Backward-Compat).
 *
 * Auth: Bearer JWT (Käufer, Verkäufer oder Admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

async function _GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: {
      id:             true,
      buyerId:        true,
      sellerId:       true,
      cmrUrl:         true,
      cmrDocument:    true,
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

  // ── Neue Uploads: Blob URL (Redirect) ────────────────────────────
  if (contract.cmrUrl) {
    return NextResponse.redirect(contract.cmrUrl, 302);
  }

  // ── Altdaten: Base64-Decode ──────────────────────────────────────
  if (!contract.cmrDocument) {
    return NextResponse.json({ error: "Kein CMR-Dokument vorhanden" }, { status: 404 });
  }

  const match = contract.cmrDocument.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match || !match[1] || !match[2]) {
    return NextResponse.json({ error: "CMR-Dokument ungültig" }, { status: 500 });
  }

  const mimeType = match[1];
  const arrayBuf = Buffer.from(match[2], "base64").buffer as ArrayBuffer;
  const ext      = mimeType === "application/pdf" ? "pdf"
                 : mimeType === "image/jpeg"       ? "jpg"
                 : mimeType === "image/png"        ? "png"
                 : "bin";

  return new NextResponse(arrayBuf, {
    headers: {
      "Content-Type":        mimeType,
      "Content-Disposition": `attachment; filename="CMR-${contract.contractNumber}.${ext}"`,
      "Cache-Control":       "private, no-cache",
    },
  });
}

export const GET = apiRoute(_GET);
