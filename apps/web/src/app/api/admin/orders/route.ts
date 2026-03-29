/**
 * GET /api/admin/orders
 *
 * Alle aktiven Orders im gesamten System (keine userId-Filterung).
 * Inkl. Anomalie-Erkennung:
 *   - LARGE_ORDER: qty > 10.000 t
 *   - FLOOD: selbe Organisation mit > 5 aktiven Orders
 *
 * Nur ADMIN/COMPLIANCE/SUPER_ADMIN (via Middleware geschützt).
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES     = ["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"];
const LARGE_ORDER_QTY = 10_000;
const FLOOD_THRESHOLD = 5;

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(token.role)) {
    return NextResponse.json({ error: "Nur Administratoren" }, { status: 403 });
  }
  try {
    const orders = await db.order.findMany({
      where:   { status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
      orderBy: { createdAt: "desc" },
      take:    500,
      select: {
        id:             true,
        direction:      true,
        pricePerUnit:   true,
        quantity:       true,
        filledQuantity: true,
        status:         true,
        currency:       true,
        createdAt:      true,
        organizationId: true,
        organization:   { select: { name: true, country: true } },
        product:        { select: { name: true } },
        session:        { select: { id: true } },
      },
    });

    // Anzahl aktiver Orders pro Organisation (für Flood-Erkennung)
    const orgCounts: Record<string, number> = {};
    for (const o of orders) {
      orgCounts[o.organizationId] = (orgCounts[o.organizationId] ?? 0) + 1;
    }

    const enriched = orders.map((o) => {
      const qty         = new Decimal(o.quantity.toString());
      const price       = new Decimal(o.pricePerUnit.toString());
      const totalValue  = price.times(qty).toFixed(2);
      const isLarge     = qty.gt(LARGE_ORDER_QTY);
      const isFlood     = (orgCounts[o.organizationId] ?? 0) > FLOOD_THRESHOLD;

      const anomalies: string[] = [];
      if (isLarge) anomalies.push("LARGE_ORDER");
      if (isFlood) anomalies.push("ORG_FLOOD");

      return {
        id:           o.id,
        direction:    o.direction,
        pricePerUnit: price.toFixed(2),
        quantity:     qty.toFixed(0),
        filledQty:    new Decimal(o.filledQuantity.toString()).toFixed(0),
        totalValue,
        status:       o.status,
        currency:     o.currency,
        createdAt:    o.createdAt.toISOString(),
        orgName:      o.organization?.name ?? "-",
        country:      o.organization?.country ?? "-",
        productName:  o.product?.name ?? "-",
        sessionId:    o.session?.id ?? null,
        anomalies,
      };
    });

    const anomalyCount = enriched.filter((o) => o.anomalies.length > 0).length;

    return NextResponse.json({
      orders:       enriched,
      totalActive:  enriched.length,
      anomalyCount,
    });
  } catch (err) {
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
