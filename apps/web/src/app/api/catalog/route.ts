/**
 * GET /api/catalog?q=wire          → Produktsuche (max 12 Treffer)
 * GET /api/catalog?slug=provoloka  → Einzelprodukt mit allen Größen
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const slug = req.nextUrl.searchParams.get("slug")?.trim() ?? "";

  // ── Einzelprodukt mit Größen ────────────────────────────────────────
  if (slug) {
    const product = await db.catalogProduct.findUnique({
      where: { slug },
      include: { sizes: { select: { value: true }, orderBy: { value: "asc" } } },
    });
    if (!product) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    return NextResponse.json(product);
  }

  // ── Suche ───────────────────────────────────────────────────────────
  if (q.length < 2) return NextResponse.json({ products: [] });

  const products = await db.catalogProduct.findMany({
    where: {
      OR: [
        { nameEn: { contains: q, mode: "insensitive" } },
        { nameRu: { contains: q, mode: "insensitive" } },
        { norm:   { contains: q, mode: "insensitive" } },
        { slug:   { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, nr: true, slug: true, nameEn: true, nameRu: true, norm: true, _count: { select: { sizes: true } } },
    orderBy: { nr: "asc" },
    take: 12,
  });

  return NextResponse.json({ products });
}
