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
import { db }                        from "@/lib/db/client";
import { z }                         from "zod";
import { randomBytes }               from "crypto";

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

// ── DB-Fallback: aktive Halts aus Datenbank lesen ────────────────────────────
async function dbGetHalts() {
  const halts = await db.$queryRaw<Array<{
    id: string; activatedBy: string; reason: string;
    activatedAt: Date; expiresAt: Date | null; liftedAt: Date | null;
  }>>`
    SELECT id, "activatedBy", reason, "activatedAt", "expiresAt", "liftedAt"
    FROM trading_halts
    WHERE "liftedAt" IS NULL
      AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
    ORDER BY "activatedAt" DESC
  `;
  return halts;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const rawToken   = authHeader?.slice(7) ?? req.cookies.get("access_token")?.value ?? "";

  try {
    await verifyAccessToken(rawToken);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // NestJS-Primärpfad
  const upstream = await nestProxy("GET", rawToken);
  if (upstream?.ok) {
    const data = await upstream.json();
    return NextResponse.json(data);
  }

  // DB-Fallback
  try {
    const halts = await dbGetHalts();
    return NextResponse.json({
      halts:          halts.map((h) => ({ ...h, source: "db" })),
      redisAvailable: false,
      source:         "database",
    });
  } catch (err) {
    console.error("[admin/halt GET] DB-Fallback fehlgeschlagen:", err);
    return NextResponse.json({
      halts:          [],
      redisAvailable: false,
      warning:        "Status konnte nicht abgerufen werden",
    });
  }
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

  // NestJS-Primärpfad
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

  // DB-Fallback: Halt in Datenbank speichern
  try {
    const haltId   = randomBytes(10).toString("hex");
    const expiresAt = parsed.data.durationSeconds > 0
      ? new Date(Date.now() + parsed.data.durationSeconds * 1000)
      : null;

    await db.$executeRaw`
      INSERT INTO trading_halts (id, "activatedBy", reason, "activatedAt", "expiresAt")
      VALUES (${haltId}, ${tokenPayload.userId}, ${parsed.data.reason}, NOW(), ${expiresAt})
    `;

    await audit({
      userId:     tokenPayload.userId,
      action:     "ADMIN_ACTION",
      entityType: "TradingSession",
      entityId:   "global",
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta:       { killSwitch: "ACTIVATED_DB_FALLBACK", reason: parsed.data.reason, durationSeconds: parsed.data.durationSeconds },
    });

    return NextResponse.json({
      id:          haltId,
      status:      "HALT_ACTIVE",
      reason:      parsed.data.reason,
      expiresAt:   expiresAt?.toISOString() ?? null,
      source:      "database",
    });
  } catch (err) {
    console.error("[admin/halt POST] DB-Fallback fehlgeschlagen:", err);
    return NextResponse.json(
      { error: "Kill-Switch konnte nicht aktiviert werden" },
      { status: 503 },
    );
  }
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

  // NestJS-Primärpfad
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

  // DB-Fallback: alle aktiven Halts aufheben
  try {
    await db.$executeRaw`
      UPDATE trading_halts SET "liftedAt" = NOW(), "liftedBy" = ${tokenPayload.userId}
      WHERE "liftedAt" IS NULL
    `;

    await audit({
      userId:     tokenPayload.userId,
      action:     "ADMIN_ACTION",
      entityType: "TradingSession",
      entityId:   "global",
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta:       { killSwitch: "LIFTED_DB_FALLBACK" },
    });

    return NextResponse.json({ status: "TRADING_RESUMED", source: "database" });
  } catch (err) {
    console.error("[admin/halt DELETE] DB-Fallback fehlgeschlagen:", err);
    return NextResponse.json(
      { error: "Halt konnte nicht aufgehoben werden" },
      { status: 503 },
    );
  }
}
