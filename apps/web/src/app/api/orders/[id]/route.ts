/**
 * PATCH /api/orders/[id]  — Auftrag stornieren
 *
 * Erlaubte Transitionen: ACTIVE | PARTIALLY_FILLED → CANCELLED
 * Nur der Eigentümer des Auftrags darf stornieren.
 * Session-Phase wird NICHT geprüft — Stornierung ist immer möglich.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req:     NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  const { id } = await params;

  // ── 2. Order laden & Besitz prüfen ───────────────────────────────────────
  const order = await db.order.findUnique({
    where:  { id },
    select: { id: true, userId: true, status: true, pricePerUnit: true, quantity: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
  }
  if (order.userId !== tokenPayload.sub) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  // ── 3. Status-Übergang validieren ────────────────────────────────────────
  const cancellable = ["ACTIVE", "PARTIALLY_FILLED"];
  if (!cancellable.includes(order.status)) {
    return NextResponse.json(
      { error: `Auftrag kann nicht storniert werden (Status: ${order.status})` },
      { status: 409 },
    );
  }

  // ── 4. Stornierung durchführen ───────────────────────────────────────────
  const updated = await db.order.update({
    where: { id },
    data:  { status: "CANCELLED" },
    select: {
      id:             true,
      status:         true,
      direction:      true,
      pricePerUnit:   true,
      quantity:       true,
      filledQuantity: true,
      currency:       true,
      createdAt:      true,
    },
  });

  // ── 5. Audit ─────────────────────────────────────────────────────────────
  await audit({
    userId:     tokenPayload.sub,
    action:     "ORDER_CANCELLED",
    entityType: "Order",
    entityId:   id,
    ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
    userAgent:  req.headers.get("user-agent") ?? "",
    meta:       { previousStatus: order.status },
  });

  return NextResponse.json({
    ...updated,
    pricePerUnit:   updated.pricePerUnit.toString(),
    quantity:       updated.quantity.toString(),
    filledQuantity: updated.filledQuantity.toString(),
  });
}
