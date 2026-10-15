/**
 * GET  /api/admin/fees/tiers   — Alle FeeTiers lesen
 * PATCH /api/admin/fees/tiers  — FeeTier aktualisieren (per name-Key)
 *
 * Auth: ADMIN, SUPER_ADMIN (COMPLIANCE_OFFICER nur lesen)
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const ADMIN_ROLES  = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;
const WRITE_ROLES  = ["ADMIN", "SUPER_ADMIN"] as const;

const patchSchema = z.object({
  name:            z.enum(["STANDARD", "HIGH_VOLUME"]),
  sellerRate:      z.number().min(0).max(0.1),   // max 10%
  buyerRate:       z.number().min(0).max(0.1),
  volumeThreshold: z.number().min(0).nullable().optional(),
  description:     z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const tiers = await db.feeTier.findMany({ orderBy: { name: "asc" } });

    return NextResponse.json({ tiers });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/fees/tiers GET]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    if (!(WRITE_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Daten", details: parsed.error.flatten() }, { status: 422 });
    }

    const { name, sellerRate, buyerRate, volumeThreshold, description } = parsed.data;

    const existing = await db.feeTier.findUnique({ where: { name } });
    if (!existing) {
      return NextResponse.json({ error: `FeeTier '${name}' nicht gefunden` }, { status: 404 });
    }

    const updated = await db.feeTier.update({
      where: { name },
      data: {
        sellerRate:      sellerRate,
        buyerRate:       buyerRate,
        volumeThreshold: volumeThreshold ?? existing.volumeThreshold,
        description:     description ?? existing.description,
        updatedBy:       token.userId,
      },
    });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "LotFee",
      entityId:   updated.id,
      ipAddress:  req.headers.get("x-forwarded-for") ?? undefined,
      meta: {
        event:          "FEE_TIER_UPDATED",
        tierName:       name,
        newSellerRate:  sellerRate,
        newBuyerRate:   buyerRate,
        volumeThreshold,
      },
    });

    return NextResponse.json({ ok: true, tier: updated });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/fees/tiers PATCH]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
