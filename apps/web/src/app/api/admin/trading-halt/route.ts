/**
 * GET    /api/admin/trading-halt       — aktiver Halt-Status
 * POST   /api/admin/trading-halt       — Kill-Switch aktivieren
 * DELETE /api/admin/trading-halt?id=  — Halt aufheben
 *
 * Auth: SUPER_ADMIN (nur diese Rolle!)
 * Die NestJS-Seite (TradingHaltController) verwaltet Redis-Keys separat.
 * Diese Route steuert die DB-Persistenz (TradingHalt-Modell) für Audit-Trail.
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  reason:          z.string().min(5).max(500),
  durationMinutes: z.number().int().min(1).max(1440).optional(), // max 24h
});

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (token.role !== "SUPER_ADMIN" && token.role !== "COMPLIANCE_OFFICER") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const halt = await db.tradingHalt.findFirst({
      where:   { liftedAt: null },
      orderBy: { activatedAt: "desc" },
      select: {
        id:          true,
        reason:      true,
        activatedBy: true,
        activatedAt: true,
        expiresAt:   true,
      },
    });

    return NextResponse.json({ active: halt !== null, halt: halt ?? null });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/trading-halt GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (token.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Nur SUPER_ADMIN darf den Handel stoppen" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { reason, durationMinutes } = parsed.data;
    const expiresAt = durationMinutes
      ? new Date(Date.now() + durationMinutes * 60 * 1000)
      : null;

    const halt = await db.tradingHalt.create({
      data: {
        activatedBy: token.userId,
        reason,
        expiresAt:   expiresAt ?? undefined,
      },
      select: { id: true, reason: true, activatedAt: true, expiresAt: true },
    });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "TradingHalt",
      entityId:   halt.id,
      meta:       {
        event:           "TRADING_HALT_ACTIVATED",
        reason,
        durationMinutes: durationMinutes ?? null,
        expiresAt:       expiresAt?.toISOString() ?? "unbegrenzt",
      },
    });

    return NextResponse.json({ ok: true, halt });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/trading-halt POST]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (token.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Nur SUPER_ADMIN darf den Handel freigeben" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const haltId = searchParams.get("id");

    if (!haltId) {
      return NextResponse.json({ error: "id-Parameter fehlt" }, { status: 422 });
    }

    const halt = await db.tradingHalt.findUnique({
      where:  { id: haltId },
      select: { id: true, liftedAt: true, reason: true },
    });

    if (!halt) {
      return NextResponse.json({ error: "Halt nicht gefunden" }, { status: 404 });
    }
    if (halt.liftedAt !== null) {
      return NextResponse.json({ error: "Halt wurde bereits aufgehoben" }, { status: 409 });
    }

    await db.tradingHalt.update({
      where: { id: haltId },
      data:  { liftedAt: new Date(), liftedBy: token.userId },
    });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "TradingHalt",
      entityId:   haltId,
      meta:       { event: "TRADING_HALT_LIFTED", originalReason: halt.reason },
    });

    return NextResponse.json({ ok: true, haltId });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/trading-halt DELETE]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
