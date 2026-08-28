/**
 * POST /api/track/event
 *
 * Leichtgewichtiger Client-seitiger Tracking-Endpunkt.
 * Erlaubte Actions: KYC_STEP_COMPLETED, KYC_SUBMITTED, CATALOG_SEARCH_NO_RESULT
 * Auth: optional Bearer JWT (userId wird ggf. aus Token gelesen)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit, type AuditAction }   from "@/lib/audit/logger";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const ALLOWED: AuditAction[] = [
  "KYC_STEP_COMPLETED",
  "KYC_SUBMITTED",
  "CATALOG_SEARCH_NO_RESULT",
];

const schema = z.object({
  action: z.enum(["KYC_STEP_COMPLETED", "KYC_SUBMITTED", "CATALOG_SEARCH_NO_RESULT"] as const),
  meta:   z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try   { body = await req.json(); }
  catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });

  const { action, meta } = parsed.data;
  if (!ALLOWED.includes(action)) return NextResponse.json({ ok: false }, { status: 422 });

  // userId aus optionalem Token
  let userId: string | undefined;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const token = await verifyAccessToken(auth.slice(7));
      userId = token.userId;
    } catch { /* kein gültiges Token — userId bleibt undefined */ }
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",").at(0)?.trim()
          ?? req.headers.get("x-real-ip")
          ?? undefined;

  void audit({
    userId,
    action,
    entityType: action === "CATALOG_SEARCH_NO_RESULT" ? "Organization" : "User",
    ipAddress:  ip,
    meta:       meta as Record<string, unknown> | undefined,
  });

  return NextResponse.json({ ok: true });
}
