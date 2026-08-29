/**
 * POST /api/test/rate-limit-check
 *
 * Test-only Endpunkt. Prüft direkt den In-Memory-Rate-Limiter für einen
 * gegebenen IP/Bucket und gibt das Ergebnis zurück.
 *
 * Bypasses Middleware-Ratenlimitierung (öffentlicher Endpunkt über PUBLIC_PREFIXES).
 * In Production immer 403.
 *
 * Body: { ip: string, bucket: "auth" | "bid" | "api" }
 * Response: { allowed: boolean, remaining: number, reset: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nicht verfügbar" }, { status: 403 });
  }

  const { ip, bucket } = await req.json() as { ip: string; bucket: "auth" | "bid" | "api" };
  if (!ip || !bucket) {
    return NextResponse.json({ error: "ip und bucket erforderlich" }, { status: 400 });
  }

  const result = await checkRateLimit(ip, bucket);
  return NextResponse.json(result);
}
