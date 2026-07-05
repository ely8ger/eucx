/**
 * PATCH  /api/seller/inventory/[id]  — Charge aktualisieren (Status, Daten)
 * DELETE /api/seller/inventory/[id]  — Charge löschen (nur wenn AVAILABLE)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ChargeStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  schmelzNr:         z.string().max(64).optional(),
  material:          z.string().min(1).max(200).optional(),
  spec:              z.string().max(200).optional(),
  quantity:          z.number().positive().optional(),
  unit:              z.string().max(10).optional(),
  warehouseLocation: z.string().max(200).optional(),
  co2PerTonne:       z.number().nonnegative().optional().nullable(),
  countryOfOrigin:   z.string().length(2).toUpperCase().optional().nullable(),
  productionSiteId:  z.string().max(100).optional().nullable(),
  incoterms:         z.string().max(10).optional(),
  status:            z.enum(["AVAILABLE", "RESERVED", "SOLD", "CANCELLED"]).optional(),
  certificate31:     z.string().optional().nullable(),
  cbamCertificate:   z.string().optional().nullable(),
  reservedForLotId:  z.string().optional().nullable(),
  notes:             z.string().max(2000).optional().nullable(),
});

async function authenticate(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try { return await verifyAccessToken(auth.slice(7)); }
  catch { return null; }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await authenticate(req);
  if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { id } = await params;

  const charge = await db.sellerCharge.findUnique({ where: { id } });
  if (!charge) return NextResponse.json({ error: "Charge nicht gefunden" }, { status: 404 });

  // Nur Eigentümer oder Admin darf bearbeiten
  const isOwner = charge.sellerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(token.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await db.sellerCharge.update({
    where: { id },
    data: parsed.data as Partial<typeof charge>,
  });

  return NextResponse.json(updated);
}

// ── DELETE ─────────────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await authenticate(req);
  if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { id } = await params;

  const charge = await db.sellerCharge.findUnique({ where: { id } });
  if (!charge) return NextResponse.json({ error: "Charge nicht gefunden" }, { status: 404 });

  const isOwner = charge.sellerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(token.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  // Reservierte oder verkaufte Chargen dürfen nicht gelöscht werden
  if (charge.status !== ChargeStatus.AVAILABLE && charge.status !== ChargeStatus.CANCELLED) {
    return NextResponse.json(
      { error: `Charge im Status '${charge.status}' kann nicht gelöscht werden` },
      { status: 409 }
    );
  }

  await db.sellerCharge.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
