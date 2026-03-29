/**
 * GET /api/admin/users
 *
 * Alle Nutzer des Systems mit Account- und KYC-Status.
 * Sortierung: PENDING zuerst, dann nach Registrierungsdatum (neueste zuerst).
 *
 * Optional-Filter via Query-Params:
 *   ?status=PENDING|ACTIVE|SUSPENDED|REJECTED
 *   ?role=BUYER|SELLER|BROKER|ADMIN|COMPLIANCE_OFFICER|SUPER_ADMIN
 *   ?q=Suchbegriff (Name, E-Mail, Org)
 *
 * Nur ADMIN/COMPLIANCE_OFFICER/SUPER_ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"];

export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") ?? undefined;
    const roleFilter   = searchParams.get("role")   ?? undefined;
    const q            = searchParams.get("q")?.toLowerCase().trim() ?? "";

    const users = await db.user.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter as never } : {}),
        ...(roleFilter   ? { role:   roleFilter   as never } : {}),
      },
      orderBy: [
        { status: "asc" },      // ACTIVE < PENDING < REJECTED < SUSPENDED alphabetisch
        { createdAt: "desc" },
      ],
      select: {
        id:                 true,
        email:              true,
        role:               true,
        status:             true,
        verificationStatus: true,
        emailVerified:      true,
        failedLoginCount:   true,
        lockedUntil:        true,
        rejectionReason:    true,
        createdAt:          true,
        updatedAt:          true,
        organization: {
          select: { id: true, name: true, country: true, city: true, isVerified: true },
        },
      },
      take: 500,
    });

    // Client-seitiger Textfilter (Org-Name, E-Mail)
    const filtered = q
      ? users.filter(
          (u) =>
            u.email.toLowerCase().includes(q) ||
            (u.organization?.name ?? "").toLowerCase().includes(q),
        )
      : users;

    // Zähler für Statusübersicht
    const counts = {
      total:      users.length,
      active:     users.filter((u) => u.status === "ACTIVE").length,
      pending:    users.filter((u) => u.status === "PENDING").length,
      suspended:  users.filter((u) => u.status === "SUSPENDED").length,
      rejected:   users.filter((u) => u.status === "REJECTED").length,
      verified:   users.filter((u) => u.verificationStatus === "VERIFIED").length,
      locked:     users.filter((u) => u.lockedUntil && u.lockedUntil > new Date()).length,
    };

    return NextResponse.json({
      counts,
      users: filtered.map((u) => ({
        id:                 u.id,
        email:              u.email,
        role:               u.role,
        status:             u.status,
        verificationStatus: u.verificationStatus,
        emailVerified:      u.emailVerified,
        failedLoginCount:   u.failedLoginCount,
        isLocked:           !!(u.lockedUntil && u.lockedUntil > new Date()),
        lockedUntil:        u.lockedUntil?.toISOString() ?? null,
        rejectionReason:    u.rejectionReason ?? null,
        createdAt:          u.createdAt.toISOString(),
        updatedAt:          u.updatedAt.toISOString(),
        orgId:              u.organization?.id      ?? null,
        orgName:            u.organization?.name    ?? "—",
        orgCountry:         u.organization?.country ?? "—",
        orgCity:            u.organization?.city    ?? "—",
        orgVerified:        u.organization?.isVerified ?? false,
      })),
    });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
