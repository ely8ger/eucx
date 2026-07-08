/**
 * GET /api/auction/lots/[lotId]/contract
 *
 * Liefert den Kaufvertrag (PDF) für ein abgeschlossenes Lot als Download.
 *
 * Zugriffskontrolle:
 *   - Nur der Käufer oder der Sieger-Verkäufer dieses Lots können den Vertrag abrufen.
 *   - ADMIN/COMPLIANCE_OFFICER haben ebenfalls Zugriff.
 *
 * Response: application/pdf mit Content-Disposition: attachment
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  // Auth
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { lotId } = await params;

  // Vertrag laden
  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: {
      id:             true,
      contractNumber: true,
      buyerId:        true,
      sellerId:       true,
      pdfBase64:      true,
      pdfHash:        true,
    },
  });

  if (!contract) {
    const lot = await db.lot.findUnique({
      where:  { id: lotId },
      select: { phase: true, winnerId: true },
    });

    if (lot?.phase !== "CONCLUSION") {
      return NextResponse.json({ error: "Die Auktion ist noch nicht abgeschlossen." }, { status: 404 });
    }
    if (!lot.winnerId) {
      return NextResponse.json(
        { error: "Für diese Auktion wurden keine Gebote abgegeben. Es wird kein Kaufvertrag erstellt." },
        { status: 404 },
      );
    }

    // Abgeschlossen mit Winner, aber kein Vertrag → Post-Trade synchron ausführen
    // (Serverless: void/fire-and-forget wird mit der Function terminiert)
    try {
      const { processLotConclusion } = await import("@/lib/auction/post-trade");
      await processLotConclusion(lotId);
    } catch (err) {
      console.error("[ContractRoute] processLotConclusion fehlgeschlagen:", err);
      return NextResponse.json(
        { error: "Kaufvertrag konnte nicht generiert werden. Bitte Support kontaktieren." },
        { status: 500 },
      );
    }

    // Vertrag nach Generierung laden
    const generated = await db.lotContract.findUnique({
      where:  { lotId },
      select: { id: true, contractNumber: true, buyerId: true, sellerId: true, pdfBase64: true, pdfHash: true },
    });
    if (!generated) {
      return NextResponse.json({ error: "Kaufvertrag konnte nicht geladen werden." }, { status: 500 });
    }

    // Zugriffscheck
    const userCheck = await db.user.findUnique({ where: { id: token.userId }, select: { role: true } });
    const isPartyGen = generated.buyerId === token.userId || generated.sellerId === token.userId;
    const isAdminGen = ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_OFFICER"].includes(userCheck?.role ?? "");
    if (!isPartyGen && !isAdminGen) {
      return NextResponse.json({ error: "Kein Zugriff auf diesen Vertrag" }, { status: 403 });
    }

    const pdfBytesGen = Buffer.from(generated.pdfBase64, "base64");
    return new Response(pdfBytesGen, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${generated.contractNumber}.pdf"`,
        "Content-Length":      String(pdfBytesGen.length),
        "X-PDF-Hash":          generated.pdfHash,
        "Cache-Control":       "private, no-store",
      },
    });
  }

  // Berechtigungsprüfung: nur Käufer, Sieger-Verkäufer oder Admin
  const user = await db.user.findUnique({
    where:  { id: token.userId },
    select: { role: true },
  });

  const isParty = contract.buyerId === token.userId || contract.sellerId === token.userId;
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_OFFICER"].includes(user?.role ?? "");

  if (!isParty && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff auf diesen Vertrag" }, { status: 403 });
  }

  // PDF aus Base64 dekodieren
  const pdfBytes = Buffer.from(contract.pdfBase64, "base64");

  return new Response(pdfBytes, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${contract.contractNumber}.pdf"`,
      "Content-Length":      String(pdfBytes.length),
      "X-PDF-Hash":          contract.pdfHash,
      "Cache-Control":       "private, no-store",
    },
  });
}
