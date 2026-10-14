/**
 * GET  /api/admin/catalog/products?sector=STEEL&q=...&page=1
 * POST /api/admin/catalog/products
 *
 * Auth: SUPER_ADMIN
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const VALID_SECTORS = ["STEEL", "ENERGY", "AGRAR", "CHEMICALS", "FERTILIZER", "SCRAP", "NON_FERROUS"] as const;
type Sector = typeof VALID_SECTORS[number];

const createSchema = z.object({
  nr:      z.number().int().positive(),
  slug:    z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nameEn:  z.string().min(2).max(200),
  nameDe:  z.string().max(200).optional(),
  nameRu:  z.string().max(200).default(""),
  norm:    z.string().max(200).optional(),
  sector:  z.enum(VALID_SECTORS).default("STEEL"),
});

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    if (token.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const sectorRaw = sp.get("sector")?.toUpperCase();
    const sector    = sectorRaw && VALID_SECTORS.includes(sectorRaw as Sector) ? (sectorRaw as Sector) : undefined;
    const q         = sp.get("q")?.trim() ?? "";
    const page      = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const limit     = 50;
    const skip      = (page - 1) * limit;
    const activeRaw = sp.get("active");
    const activeFilter = activeRaw === "true" ? true : activeRaw === "false" ? false : undefined;

    const where = {
      ...(sector ? { sector } : {}),
      ...(activeFilter !== undefined ? { isActive: activeFilter } : {}),
      ...(q.length >= 1 ? {
        OR: [
          { nameEn: { contains: q, mode: "insensitive" as const } },
          { nameDe: { contains: q, mode: "insensitive" as const } },
          { slug:   { contains: q, mode: "insensitive" as const } },
        ],
      } : {}),
    };

    const [total, products] = await Promise.all([
      db.catalogProduct.count({ where }),
      db.catalogProduct.findMany({
        where,
        select: {
          id: true, nr: true, slug: true, nameDe: true, nameEn: true,
          nameRu: true, norm: true, sector: true, isActive: true,
          _count: { select: { sizes: true } },
        },
        orderBy: { nr: "asc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: products, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[admin/catalog/products GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    if (token.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const existing = await db.catalogProduct.findFirst({
      where: { OR: [{ nr: parsed.data.nr }, { slug: parsed.data.slug }] },
      select: { id: true, nr: true, slug: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Produkt mit nr=${existing.nr} oder slug='${existing.slug}' existiert bereits` },
        { status: 409 },
      );
    }

    const product = await db.catalogProduct.create({ data: parsed.data });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[admin/catalog/products POST]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
