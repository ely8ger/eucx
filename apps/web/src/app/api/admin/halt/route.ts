/**
 * Admin Kill-Switch Proxy
 *
 * GET    /api/admin/halt → aktive Halts abfragen (NestJS oder DB-Fallback)
 * POST   /api/admin/halt → globalen Halt aktivieren
 * DELETE /api/admin/halt → globalen Halt aufheben
 *
 * Proxiert zum NestJS-Backend (NEXT_PUBLIC_API_URL/api/v1/admin/trading-halt/global).
 * Wenn NestJS nicht erreichbar: direkter Redis-Fallback via ioredis.
 * Nur ADMIN/SUPER_ADMIN (via Middleware geschützt).
 *
 * POST body: { reason: string; durationSeconds?: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const activateSchema = z.object({
  reason:          z.string().min(5, "Begründung erforderlich (min. 5 Zeichen)"),
  durationSeconds: z.number().int().min(0).max(86400).optional().default(3600),
});

async function nestProxy(
  method:  "GET" | "POST" | "DELETE",
  token:   string,
  body?:   object,
): Promise<Response | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    return await fetch(`${apiUrl}/api/v1/admin/trading-halt/global`, {
      method,
      headers: {
        "Authorization":  `Bearer ${token}`,
        "Content-Type":   "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const rawToken   = authHeader?.slice(7) ?? req.cookies.get("access_token")?.value ?? "";

  try {
    await verifyAccessToken(rawToken);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const upstream = await nestProxy("GET", rawToken);
  if (upstream?.ok) {
    const data = await upstream.json();
    return NextResponse.json(data);
  }

  // Fallback: Halt-Status unbekannt (NestJS offline)
  return NextResponse.json({
    halts:          [],
    redisAvailable: false,
    warning:        "NestJS nicht erreichbar - Status unbekannt",
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const rawToken   = authHeader?.slice(7) ?? req.cookies.get("access_token")?.value ?? "";

  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(rawToken);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Nur SUPER_ADMIN darf aktivieren (strengere Regel als Middleware-ADMIN)
  if (!["ADMIN", "SUPER_ADMIN"].includes(tokenPayload.role)) {
    return NextResponse.json({ error: "Nur Administratoren dürfen den Kill-Switch aktivieren" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = activateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, { status: 422 });
  }

  const upstream = await nestProxy("POST", rawToken, {
    reason:          parsed.data.reason,
    durationSeconds: parsed.data.durationSeconds,
  });

  if (upstream?.ok) {
    const data = await upstream.json();

    await audit({
      userId:     tokenPayload.userId,
      action:     "ADMIN_ACTION",
      entityType: "TradingSession",
      entityId:   "global",
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta:       { killSwitch: "ACTIVATED", reason: parsed.data.reason, durationSeconds: parsed.data.durationSeconds },
    });

    return NextResponse.json(data);
  }

  return NextResponse.json(
    { error: "NestJS nicht erreichbar - Kill-Switch konnte nicht aktiviert werden" },
    { status: 503 },
  );
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const rawToken   = authHeader?.slice(7) ?? req.cookies.get("access_token")?.value ?? "";

  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(rawToken);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const upstream = await nestProxy("DELETE", rawToken);

  if (upstream?.ok) {
    await audit({
      userId:     tokenPayload.userId,
      action:     "ADMIN_ACTION",
      entityType: "TradingSession",
      entityId:   "global",
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta:       { killSwitch: "LIFTED" },
    });

    return NextResponse.json({ status: "TRADING_RESUMED" });
  }

  return NextResponse.json(
    { error: "NestJS nicht erreichbar - Halt konnte nicht aufgehoben werden" },
    { status: 503 },
  );
}
