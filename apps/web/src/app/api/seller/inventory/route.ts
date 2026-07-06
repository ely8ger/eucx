/**
 * GET  /api/seller/inventory  — Alle Chargen des eingeloggten Verkäufers
 * POST /api/seller/inventory  — Neue Charge anlegen
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ChargeStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  schmelzNr:         z.string().max(64).optional(),
  material:          z.string().min(1).max(200),
  spec:              z.string().max(200).optional(),
  quantity:          z.number().positive(),
  unit:              z.string().max(10).default("TON"),
  warehouseLocation: z.string().max(200).optional(),
  co2PerTonne:       z.number().nonnegative().optional(),
  countryOfOrigin:   z.string().max(100).optional(),
  productionSiteId:  z.string().max(100).optional(),
  incoterms:         z.string().max(10).optional(),
  certificate31:     z.string().optional(),
  cbamCertificate:   z.string().optional(),
  notes:             z.string().max(2000).optional(),
});

async function authenticate(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const token = await verifyAccessToken(auth.slice(7));
    return token;
  } catch {
    return null;
  }
}

// ── GET ────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = await authenticate(req);
  if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  if (token.role !== "SELLER" && token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Nur Verkäufer" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") as ChargeStatus | null;

  try {
    const charges = await db.sellerCharge.findMany({
      where: {
        sellerId: token.userId,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        lot: { select: { id: true, commodity: true, phase: true } },
      },
    });
    return NextResponse.json(charges);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[seller/inventory GET]", msg);
    return NextResponse.json({ error: "Datenbankfehler", details: msg }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = await authenticate(req);
  if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  if (token.role !== "SELLER" && token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Nur Verkäufer" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  try {
    const charge = await db.sellerCharge.create({
      data: {
        sellerId:          token.userId,
        schmelzNr:         d.schmelzNr,
        material:          d.material,
        spec:              d.spec,
        quantity:          d.quantity,
        unit:              d.unit,
        warehouseLocation: d.warehouseLocation,
        co2PerTonne:       d.co2PerTonne,
        countryOfOrigin:   d.countryOfOrigin,
        productionSiteId:  d.productionSiteId,
        incoterms:         d.incoterms,
        certificate31:     d.certificate31,
        cbamCertificate:   d.cbamCertificate,
        notes:             d.notes,
      },
    });
    return NextResponse.json(charge, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[seller/inventory POST]", msg);
    return NextResponse.json({ error: "Datenbankfehler", details: msg }, { status: 500 });
  }
}
