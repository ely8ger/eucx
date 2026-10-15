/**
 * GET    /api/admin/fees/overrides/[userId]  — FeeOverride eines Users lesen
 * POST   /api/admin/fees/overrides/[userId]  — Override erstellen / ersetzen
 * DELETE /api/admin/fees/overrides/[userId]  — Override löschen
 *
 * Auth: ADMIN, SUPER_ADMIN
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

const postSchema = z.object({
  sellerRate: z.number().min(0).max(0.1).nullable().optional(),
  buyerRate:  z.number().min(0).max(0.1).nullable().optional(),
  reason:     z.string().min(5).max(500),
  expiresAt:  z.string().datetime().nullable().optional(),
});

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const token  = await requireAuth(req);
    const { userId } = await ctx.params;

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const override = await db.feeOverride.findUnique({
      where:  { userId },
      include: { user: { select: { email: true, role: true } } },
    });

    if (!override) {
      return NextResponse.json({ override: null });
    }

    const isActive = !override.expiresAt || override.expiresAt > new Date();

    return NextResponse.json({ override: { ...override, isActive } });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/fees/overrides GET]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const token  = await requireAuth(req);
    const { userId } = await ctx.params;

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Daten", details: parsed.error.flatten() }, { status: 422 });
    }

    if (parsed.data.sellerRate == null && parsed.data.buyerRate == null) {
      return NextResponse.json({ error: "Mindestens sellerRate oder buyerRate muss angegeben werden" }, { status: 422 });
    }

    // User muss existieren
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
    if (!user) {
      return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
    }

    const { sellerRate, buyerRate, reason, expiresAt } = parsed.data;

    const override = await db.feeOverride.upsert({
      where:  { userId },
      create: {
        userId,
        sellerRate: sellerRate ?? null,
        buyerRate:  buyerRate  ?? null,
        reason,
        createdBy:  token.userId,
        expiresAt:  expiresAt ? new Date(expiresAt) : null,
      },
      update: {
        sellerRate: sellerRate ?? null,
        buyerRate:  buyerRate  ?? null,
        reason,
        createdBy:  token.userId,
        expiresAt:  expiresAt ? new Date(expiresAt) : null,
        updatedAt:  new Date(),
      },
    });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "User",
      entityId:   userId,
      ipAddress:  req.headers.get("x-forwarded-for") ?? undefined,
      meta: {
        event:      "FEE_OVERRIDE_SET",
        targetUser: user.email,
        sellerRate,
        buyerRate,
        reason,
        expiresAt,
      },
    });

    return NextResponse.json({ ok: true, override });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/fees/overrides POST]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const token  = await requireAuth(req);
    const { userId } = await ctx.params;

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const existing = await db.feeOverride.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: "Kein Override vorhanden" }, { status: 404 });
    }

    await db.feeOverride.delete({ where: { userId } });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "User",
      entityId:   userId,
      ipAddress:  req.headers.get("x-forwarded-for") ?? undefined,
      meta: { event: "FEE_OVERRIDE_REMOVED" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/fees/overrides DELETE]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
