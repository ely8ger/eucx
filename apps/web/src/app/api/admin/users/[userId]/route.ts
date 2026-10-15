/**
 * GET   /api/admin/users/[userId]  — Vollständiges Admin-Profil eines Nutzers
 * PATCH /api/admin/users/[userId]  — Status ändern (ACTIVE ↔ SUSPENDED)
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const token      = await requireAuth(req);
    const { userId } = await params;

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id:                 true,
        email:              true,
        role:               true,
        status:             true,
        verificationStatus: true,
        riskScore:          true,
        riskFlags:          true,
        riskScoredAt:       true,
        createdAt:          true,
        updatedAt:          true,
        feeOverride:        true,
        organization: {
          select: {
            id:         true,
            name:       true,
            country:    true,
            isVerified: true,
            taxId:      true,
            memberId:   true,
            wallet: {
              select: { id: true, currency: true },
            },
          },
        },
        kycDocuments: {
          orderBy: { createdAt: "desc" },
          take:    10,
          select:  { id: true, type: true, status: true, name: true, createdAt: true },
        },
        adminNotes: {
          orderBy: { createdAt: "desc" },
          take:    20,
          select: {
            id:        true,
            content:   true,
            isFlag:    true,
            createdAt: true,
            author:    { select: { email: true, role: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    // Letzte 20 Audit-Einträge dieses Users
    const auditLogs = await db.auditLog.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    20,
      select:  { id: true, action: true, entityType: true, entityId: true, createdAt: true, meta: true },
    });

    // Offene Disputes als Kläger oder Beklagter
    const disputes = await db.lotDispute.findMany({
      where: {
        OR: [
          { contract: { buyerId:  userId } },
          { contract: { sellerId: userId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  { id: true, status: true, reason: true, createdAt: true, contract: { select: { id: true } } },
    });

    return NextResponse.json({ user, auditLogs, disputes });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/users/[userId] GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

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
