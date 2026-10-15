/**
 * GET  /api/auction/contracts/[contractId]/contact
 *
 * Gibt die freigegebenen Kontaktdaten beider Vertragsparteien zurück.
 * Zugriff: Käufer oder Verkäufer des Vertrags (oder Admin).
 * Gesperrt wenn revokedAt gesetzt.
 *
 * DELETE /api/auction/contracts/[contractId]/contact
 * Widerruft die Kontaktfreigabe (setzt revokedAt).
 */
import { NextRequest, NextResponse }  from "next/server";
import { requireAuth, ApiError }      from "@/lib/auth/jwt";
import { db }                         from "@/lib/db/client";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> },
) {
  try {
    const token      = await requireAuth(req);
    const { contractId } = await params;

    const release = await db.contactRelease.findUnique({
      where:   { contractId },
      include: { contract: { select: { buyerId: true, sellerId: true } } },
    });

    if (!release) {
      return NextResponse.json({ error: "Kontaktfreigabe nicht gefunden" }, { status: 404 });
    }

    const isParty =
      release.contract.buyerId  === token.userId ||
      release.contract.sellerId === token.userId;
    const isAdmin = ADMIN_ROLES.includes(token.role as typeof ADMIN_ROLES[number]);

    if (!isParty && !isAdmin) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    if (release.revokedAt) {
      return NextResponse.json(
        { error: "Kontaktfreigabe wurde widerrufen", revokedAt: release.revokedAt },
        { status: 410 },
      );
    }

    return NextResponse.json({
      contractId,
      releasedAt: release.releasedAt,
      buyer: {
        name:  release.buyerName,
        email: release.buyerEmail,
        phone: release.buyerPhone ?? null,
      },
      seller: {
        name:  release.sellerName,
        email: release.sellerEmail,
        phone: release.sellerPhone ?? null,
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[contact/GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> },
) {
  try {
    const token      = await requireAuth(req);
    const { contractId } = await params;

    const release = await db.contactRelease.findUnique({
      where:   { contractId },
      include: { contract: { select: { buyerId: true, sellerId: true } } },
    });

    if (!release) {
      return NextResponse.json({ error: "Kontaktfreigabe nicht gefunden" }, { status: 404 });
    }

    const isParty =
      release.contract.buyerId  === token.userId ||
      release.contract.sellerId === token.userId;
    const isAdmin = ADMIN_ROLES.includes(token.role as typeof ADMIN_ROLES[number]);

    if (!isParty && !isAdmin) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    if (release.revokedAt) {
      return NextResponse.json({ error: "Bereits widerrufen" }, { status: 409 });
    }

    await db.contactRelease.update({
      where: { contractId },
      data:  { revokedAt: new Date() },
    });

    return NextResponse.json({ ok: true, revokedAt: new Date().toISOString() });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[contact/DELETE]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
