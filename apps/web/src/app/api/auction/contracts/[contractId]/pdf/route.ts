/**
 * GET /api/auction/contracts/[contractId]/pdf
 *
 * PDF-Download via contractId (Alias für /api/auction/lots/[lotId]/contract).
 * Zugriff: Käufer, Sieger-Verkäufer, Admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> },
) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { contractId } = await params;

  const contract = await db.lotContract.findUnique({
    where:  { id: contractId },
    select: { id: true, contractNumber: true, buyerId: true, sellerId: true, pdfBase64: true, pdfHash: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 });
  }

  if (!contract.pdfBase64) {
    return NextResponse.json({ error: "PDF noch nicht verfügbar. Bitte kurz warten und erneut versuchen." }, { status: 503 });
  }

  const user = await db.user.findUnique({
    where:  { id: token.userId },
    select: { role: true },
  });

  const isParty = contract.buyerId === token.userId || contract.sellerId === token.userId;
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_OFFICER"].includes(user?.role ?? "");

  if (!isParty && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff auf diesen Vertrag" }, { status: 403 });
  }

  const pdfBytes = Buffer.from(contract.pdfBase64, "base64");

  return new Response(pdfBytes, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${contract.contractNumber}.pdf"`,
      "Content-Length":      String(pdfBytes.length),
      "X-PDF-Hash":          contract.pdfHash ?? "",
      "Cache-Control":       "private, no-store",
    },
  });
}
