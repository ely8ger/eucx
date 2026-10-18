/**
 * GET /api/buyer/wallet
 *
 * Gibt Wallet-Informationen für den eingeloggten Käufer zurück.
 * Nur BUYER-Rolle erlaubt — alle anderen Rollen erhalten 403.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { db }                        from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const payload = await requireAuth(req);

    if (payload.role !== "BUYER") {
      return NextResponse.json(
        { error: "Nur Käufer können auf das Handelskonto zugreifen." },
        { status: 403 }
      );
    }

    const org = await db.organization.findUnique({
      where:  { id: payload.orgId },
      select: {
        id:       true,
        name:     true,
        country:  true,
        wallet: {
          select: {
            id:        true,
            currency:  true,
            updatedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      orgId:    payload.orgId,
      orgName:  org?.name ?? null,
      currency: org?.wallet?.currency ?? "EUR",
      walletId: org?.wallet?.id ?? null,
      note:     "EUCX verwahrt kein Kundenguthaben. Zahlungen erfolgen direkt zwischen den Parteien.",
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
