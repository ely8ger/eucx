/**
 * GET /api/catalog?q=wire          → Produktsuche (max 20 Treffer, ab 1 Zeichen)
 * GET /api/catalog?browse=1        → Alle Produkte für Dropdown-Browse (top 25)
 * GET /api/catalog?slug=provoloka  → Einzelprodukt mit allen Größen
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const SELECT = { id: true, nr: true, slug: true, nameDe: true, nameEn: true, nameRu: true, norm: true, _count: { select: { sizes: true } } } as const;

export async function GET(req: NextRequest) {
  const q      = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const slug   = req.nextUrl.searchParams.get("slug")?.trim() ?? "";
  const browse = req.nextUrl.searchParams.get("browse") === "1";

  // ── Einzelprodukt mit Größen ────────────────────────────────────────
  if (slug) {
    const product = await db.catalogProduct.findUnique({
      where: { slug },
      include: { sizes: { select: { value: true }, orderBy: { value: "asc" } } },
    });
    if (!product) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    return NextResponse.json(product);
  }

  // ── Browse-Modus: Alle Produkte (Dropdown-Pfeil ohne Sucheingabe) ───
  if (browse) {
    const products = await db.catalogProduct.findMany({
      select: SELECT,
      orderBy: { nr: "asc" },
      take: 25,
    });
    return NextResponse.json({ products, browse: true });
  }

  // ── Suche (ab 1 Zeichen) ───────────────────────────────────────────
  if (q.length < 1) return NextResponse.json({ products: [] });

  const products = await db.catalogProduct.findMany({
    where: {
      OR: [
        { nameDe: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
        { nameRu: { contains: q, mode: "insensitive" } },
        { norm:   { contains: q, mode: "insensitive" } },
        { slug:   { contains: q, mode: "insensitive" } },
      ],
    },
    select: SELECT,
    orderBy: { nr: "asc" },
    take: 20,
  });

  return NextResponse.json({ products });
}
