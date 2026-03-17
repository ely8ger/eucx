/**
 * GET /api/admin/kyc
 *
 * Gibt alle Organisationen zurück (nach isVerified sortiert).
 * Nur ADMIN/COMPLIANCE/SUPER_ADMIN (via Middleware geschützt).
 */
import { NextResponse } from "next/server";
import { db }           from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orgs = await db.organization.findMany({
      orderBy: [
        { isVerified: "asc" },   // nicht verifizierte zuerst
        { createdAt: "asc" },
      ],
      select: {
        id:         true,
        name:       true,
        taxId:      true,
        country:    true,
        city:       true,
        isVerified: true,
        createdAt:  true,
      },
    });

    return NextResponse.json({
      organizations: orgs.map((o) => ({
        id:                 o.id,
        name:               o.name,
        taxId:              o.taxId,
        country:            o.country,
        city:               o.city,
        // Abbildung: isVerified → status für UI
        verificationStatus: o.isVerified ? "APPROVED" : "PENDING",
        createdAt:          o.createdAt.toISOString(),
        rejectionReason:    null,
        documents:          [] as unknown[],
        userCount:          0,
      })),
    });
  } catch (err) {
    console.error("[GET /api/admin/kyc]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
