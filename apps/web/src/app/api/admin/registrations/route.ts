/**
 * GET /api/admin/registrations
 *
 * Alle Registrierungsanfragen geordnet nach Status:
 *   offen     → status=PENDING (E-Mail bestätigt, wartet auf Admin)
 *   geprüft   → status=ACTIVE
 *   abgelehnt → status=REJECTED
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
    const users = await db.user.findMany({
      where: {
        role: { in: ["BUYER", "SELLER", "BROKER"] },
      },
      orderBy: [
        // PENDING zuerst
        { status: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id:               true,
        email:            true,
        role:             true,
        status:           true,
        emailVerified:    true,
        rejectionReason:  true,
        createdAt:        true,
        organization: {
          select: {
            id:    true,
            name:  true,
            taxId: true,
            country: true,
            city:    true,
          },
        },
      },
    });

    const offen     = users.filter((u) => u.status === "PENDING");
    const geprueft  = users.filter((u) => u.status === "ACTIVE");
    const abgelehnt = users.filter((u) => u.status === "REJECTED");

    return NextResponse.json({
      offen:     offen.length,
      geprueft:  geprueft.length,
      abgelehnt: abgelehnt.length,
      users:     users.map((u) => ({
        id:              u.id,
        email:           u.email,
        role:            u.role,
        status:          u.status,
        emailVerified:   u.emailVerified,
        rejectionReason: u.rejectionReason ?? null,
        createdAt:       u.createdAt.toISOString(),
        orgName:         u.organization?.name  ?? "—",
        orgTaxId:        u.organization?.taxId ?? "—",
        orgCountry:      u.organization?.country ?? "—",
        orgCity:         u.organization?.city    ?? "—",
      })),
    });
  } catch (err) {
    console.error("[GET /api/admin/registrations]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
