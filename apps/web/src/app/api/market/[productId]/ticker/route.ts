/**
 * GET /api/market/[productId]/ticker
 *
 * Dünner Proxy zum NestJS-Endpoint GET /api/v1/public/ticker/:productId.
 * useMarketTicker ruft NestJS direkt über NEXT_PUBLIC_API_URL auf — dieser
 * Endpoint dient als BFF-Fallback falls der direkte NestJS-Zugriff nicht
 * möglich ist (z.B. interne Netzwerk-Restriktionen).
 */
import { NextRequest, NextResponse } from "next/server";
import { apiRoute }                  from "@/lib/api/route-handler";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

const API_URL = process.env.NESTJS_INTERNAL_URL ?? "http://localhost:3001";

async function _GET(
  req:     NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  // Preise nur für authentifizierte Nutzer
  try {
    await requireAuth(req);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { productId } = await context.params;

  const upstream = await fetch(
    `${API_URL}/api/v1/public/ticker/${encodeURIComponent(productId)}`,
    {
      headers: { Accept: "application/json" },
      cache:   "no-store",
    },
  );

  if (!upstream.ok) {
    const status = upstream.status === 404 ? 404 : 503;
    return NextResponse.json(
      { error: "Keine Marktdaten verfügbar" },
      { status },
    );
  }

  const data = await upstream.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=28, stale-while-revalidate=60",
    },
  });
}

export const GET = apiRoute(_GET);
