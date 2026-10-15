/**
 * GET /api/admin/fees/overview
 *
 * Aktuelle Gebühren-Übersicht: Aggregation nach Typ und Status.
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const [grouped, recent] = await Promise.all([
      // Aggregation: Summe + Anzahl je Typ × Status
      db.lotFee.groupBy({
        by:     ["type", "status"],
        _sum:   { amount: true },
        _count: { id:     true },
      }),

      // Letzte 15 Gebühren mit Kontext
      db.lotFee.findMany({
        orderBy: { createdAt: "desc" },
        take:    15,
        select: {
          id:         true,
          type:       true,
          status:     true,
          amount:     true,
          rate:       true,
          createdAt:  true,
          contractId: true,
          userId:     true,
        },
      }),
    ]);

    // Zusammenfassung strukturieren
    type FeeType   = "SELLER_FEE" | "BUYER_FEE";
    type FeeStatus = "UNPAID" | "PAID" | "WAIVED";

    const summary: Record<FeeType, Record<FeeStatus, { count: number; total: string }>> = {
      SELLER_FEE: {
        UNPAID: { count: 0, total: "0.00" },
        PAID:   { count: 0, total: "0.00" },
        WAIVED: { count: 0, total: "0.00" },
      },
      BUYER_FEE: {
        UNPAID: { count: 0, total: "0.00" },
        PAID:   { count: 0, total: "0.00" },
        WAIVED: { count: 0, total: "0.00" },
      },
    };

    for (const g of grouped) {
      const feeType   = g.type   as FeeType;
      const feeStatus = g.status as FeeStatus;
      if (summary[feeType] && summary[feeType][feeStatus] !== undefined) {
        summary[feeType][feeStatus] = {
          count: g._count.id,
          total: new Decimal(g._sum.amount?.toString() ?? "0").toFixed(2),
        };
      }
    }

    // Gesamtsumme UNPAID (offene Forderungen)
    const totalUnpaid = grouped
      .filter((g) => g.status === "UNPAID")
      .reduce((acc, g) => acc.plus(new Decimal(g._sum.amount?.toString() ?? "0")), new Decimal(0));

    return NextResponse.json({
      summary,
      totalUnpaidEUR: totalUnpaid.toFixed(2),
      recent: recent.map((f) => ({
        ...f,
        amount: f.amount.toString(),
        rate:   f.rate.toString(),
      })),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/fees/overview GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
