/**
 * POST /api/auction/lots/[lotId]/payment-sent
 *
 * Käufer meldet: Zahlung wurde angewiesen (Überweisung veranlasst).
 * Setzt paymentSentAt - ändert keinen deliveryStatus.
 * Nur der Käufer des Kontrakts kann diesen Endpunkt aufrufen.
 * Status muss AWAITING_PAYMENT sein.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";
import { sendAuctionMail } from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

async function _POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token: { userId: string };
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: { id: true, buyerId: true, deliveryStatus: true, paymentSentAt: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  if (contract.buyerId !== token.userId) {
    return NextResponse.json({ error: "Nur der Käufer kann die Zahlung melden" }, { status: 403 });
  }

  if (contract.deliveryStatus !== "AWAITING_PAYMENT") {
    return NextResponse.json(
      { error: `Zahlung kann nur im Status AWAITING_PAYMENT gemeldet werden. Aktuell: ${contract.deliveryStatus}` },
      { status: 409 }
    );
  }

  if (contract.paymentSentAt) {
    return NextResponse.json({ error: "Zahlung wurde bereits gemeldet" }, { status: 409 });
  }

  const updated = await db.lotContract.update({
    where:  { id: contract.id },
    data:   { paymentSentAt: new Date() },
    select: { id: true, lotId: true, deliveryStatus: true, paymentSentAt: true, contractNumber: true, totalValue: true, sellerId: true },
  });

  // Verkäufer per E-Mail informieren
  const seller = await db.user.findUnique({
    where:  { id: updated.sellerId },
    select: { email: true },
  });
  if (seller?.email) {
    sendAuctionMail({
      to:       seller.email,
      subject:  `Zahlungseingang gemeldet — Kontrakt ${updated.contractNumber ?? updated.id}`,
      template: "payment_reported",
      data: {
        contractNumber: updated.contractNumber ?? updated.id,
        lotId,
        totalValue:     updated.totalValue?.toString() ?? "—",
        reportedAt:     new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
    }).catch((err: unknown) => console.error("[payment-sent] Mailer-Fehler:", err));
  }

  return NextResponse.json(updated);
}

export const POST = apiRoute(_POST);
