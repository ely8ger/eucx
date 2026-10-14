/**
 * GET    /api/admin/catalog/products/[productId]
 * PATCH  /api/admin/catalog/products/[productId]
 * DELETE /api/admin/catalog/products/[productId]  → Soft-Delete (isActive = false)
 *
 * Auth: SUPER_ADMIN
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const VALID_SECTORS = ["STEEL", "ENERGY", "AGRAR", "CHEMICALS", "FERTILIZER", "SCRAP", "NON_FERROUS"] as const;

const patchSchema = z.object({
  nameEn:   z.string().min(2).max(200).optional(),
  nameDe:   z.string().max(200).optional(),
  nameRu:   z.string().max(200).optional(),
  norm:     z.string().max(200).optional(),
  sector:   z.enum(VALID_SECTORS).optional(),
  isActive: z.boolean().optional(),
  slug:     z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
});

async function requireAdmin(req: NextRequest) {
  const token = await requireAuth(req);
  if (token.role !== "SUPER_ADMIN") throw new ApiError(403, "Zugriff verweigert");
  return token;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin(req);
    const { productId } = await params;

    const product = await db.catalogProduct.findUnique({
      where:   { id: productId },
      include: { sizes: { orderBy: [{ sortKey: { sort: "asc", nulls: "last" } }, { value: "asc" }] } },
    });
    if (!product) return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin(req);
    const { productId } = await params;

    const body   = await req.json() as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Keine Felder zum Aktualisieren" }, { status: 422 });
    }

    const existing = await db.catalogProduct.findUnique({ where: { id: productId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });

    if (parsed.data.slug) {
      const slugConflict = await db.catalogProduct.findFirst({
        where: { slug: parsed.data.slug, id: { not: productId } },
        select: { id: true },
      });
      if (slugConflict) return NextResponse.json({ error: "Slug bereits vergeben" }, { status: 409 });
    }

    const updated = await db.catalogProduct.update({
      where: { id: productId },
      data:  parsed.data,
    });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin(req);
    const { productId } = await params;

    const existing = await db.catalogProduct.findUnique({ where: { id: productId }, select: { id: true, isActive: true } });
    if (!existing) return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    if (!existing.isActive) return NextResponse.json({ error: "Produkt ist bereits deaktiviert" }, { status: 409 });

    await db.catalogProduct.update({ where: { id: productId }, data: { isActive: false } });
    return NextResponse.json({ ok: true, action: "deactivated" });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
