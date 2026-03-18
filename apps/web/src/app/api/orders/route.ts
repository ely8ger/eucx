/**
 * POST /api/orders
 *
 * Skill #2: Complex Data Validation (Zod Türsteher)
 * Skill #3: Event Sourcing (jeder Order wird im AuditLog gespeichert)
 * Skill #4: Financial Math (Decimal.js)
 * Skill #5: Security-First (JWT auth, idempotency key)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { submitOrderSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/audit/logger";
import { runMatchingCycle } from "@/lib/trading/matching-engine";
import Decimal from "decimal.js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload;
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  // ── 2. Zod Validation ──────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const result = submitOrderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error:   "Validierungsfehler",
        details: result.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }
  const input = result.data;

  // ── 3. Business Logic ──────────────────────────────────────────────
  try {
    const user = await db.user.findUnique({
      where: { id: tokenPayload.sub },
      select: { id: true, organizationId: true, status: true, role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Benutzer inaktiv oder nicht gefunden" }, { status: 403 });
    }

    // Validate session is in tradeable state
    const session = await db.tradingSession.findUnique({
      where: { id: input.sessionId },
      select: { currentStatus: true },
    });
    if (!session || !["TRADING_1", "TRADING_2"].includes(session.currentStatus)) {
      return NextResponse.json(
        { error: "Handelssitzung ist nicht aktiv" },
        { status: 409 }
      );
    }

    // ── 4. Financial Math: use Decimal for all price calculations ──
    const priceDecimal = new Decimal(input.pricePerUnit);
    const qtyDecimal   = new Decimal(input.quantity);
    const totalValue   = priceDecimal.times(qtyDecimal).toDecimalPlaces(2);

    // Sanity checks
    if (priceDecimal.lte(0) || qtyDecimal.lte(0)) {
      return NextResponse.json({ error: "Preis und Menge müssen positiv sein" }, { status: 422 });
    }
    if (totalValue.gt(new Decimal("100000000"))) {
      return NextResponse.json({ error: "Auftragswert überschreitet Maximum" }, { status: 422 });
    }

    // ── 5. Create Order (idempotent) ───────────────────────────────
    const order = await db.order.upsert({
      where:  { idempotencyKey: input.idempotencyKey },
      update: {}, // noop - idempotent
      create: {
        sessionId:      input.sessionId,
        userId:         user.id,
        organizationId: user.organizationId,
        productId:      input.productId,
        direction:      input.direction,
        pricePerUnit:   priceDecimal.toFixed(2),
        currency:       input.currency,
        quantity:   qtyDecimal.toFixed(3),
        idempotencyKey: input.idempotencyKey,
      },
    });

    // ── 6. Audit Log ───────────────────────────────────────────────
    await audit({
      userId:     user.id,
      action:     "ORDER_SUBMITTED",
      entityType: "Order",
      entityId:   order.id,
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta: {
        direction: input.direction,
        price:     priceDecimal.toString(),
        qty:       qtyDecimal.toString(),
        total:     totalValue.toString(),
        currency:  input.currency,
      },
    });

    // ── 7. Matching Engine ─────────────────────────────────────────
    // Läuft nur wenn es sich um eine neue Order handelt (nicht idempotent-duplicate)
    let matchResult = { deals: [] as ReturnType<typeof Array.prototype.map>, totalMatchedQty: "0" };
    if (order.status === "ACTIVE") {
      try {
        matchResult = await runMatchingCycle(input.sessionId);
      } catch (err) {
        // Matching-Fehler darf Order-Erstellung nicht rückgängig machen
        console.error("[POST /api/orders] Matching-Fehler:", err);
      }
    }

    return NextResponse.json(
      {
        orderId:    order.id,
        status:     order.status,
        pricePerUnit: order.pricePerUnit.toString(),
        quantity: order.quantity.toString(),
        totalValue:   totalValue.toString(),
        currency:   order.currency,
        createdAt:  order.createdAt,
        deals:      matchResult.deals,
        totalMatchedQty: matchResult.totalMatchedQty,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

// GET /api/orders - eigene Aufträge des eingeloggten Nutzers
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload;
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");

  try {
    const orders = await db.order.findMany({
      where: {
        userId: tokenPayload.sub,
        ...(sessionId ? { sessionId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id:             true,
        direction:      true,
        pricePerUnit:   true,
        quantity:   true,
        filledQuantity: true,
        status:         true,
        currency:       true,
        createdAt:      true,
      },
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        pricePerUnit:   o.pricePerUnit.toString(),
        quantity:   o.quantity.toString(),
        filledQuantity: o.filledQuantity.toString(),
      })),
    });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
