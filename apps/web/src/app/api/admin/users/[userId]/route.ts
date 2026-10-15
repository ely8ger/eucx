/**
 * PATCH /api/admin/users/[userId]
 *
 * Ändert den Status eines Nutzers (ACTIVE ↔ SUSPENDED).
 * Für vollständiges Einfrieren: POST /api/admin/kyc/[userId]/freeze
 *
 * Auth: SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  reason: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const token      = await requireAuth(req);
    const { userId } = await params;

    if (token.role !== "SUPER_ADMIN" && token.role !== "COMPLIANCE_OFFICER") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const user = await db.user.findUnique({
      where:  { id: userId },
      select: { email: true, status: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    const { status, reason } = parsed.data;

    if (user.status === status) {
      return NextResponse.json({ ok: true, userId, status, changed: false });
    }

    await db.user.update({ where: { id: userId }, data: { status } });

    void audit({
      userId:     token.userId,
      action:     status === "SUSPENDED" ? "ACCOUNT_FROZEN" : "ACCOUNT_UNFROZEN",
      entityType: "User",
      entityId:   userId,
      meta:       {
        event:          "USER_STATUS_CHANGED",
        targetEmail:    user.email,
        previousStatus: user.status,
        newStatus:      status,
        reason:         reason ?? null,
      },
    });

    return NextResponse.json({ ok: true, userId, status, changed: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/users/[userId] PATCH]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
