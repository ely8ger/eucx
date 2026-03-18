/**
 * GET  /api/settings/api-keys - Liste aller API-Keys der Organisation
 * POST /api/settings/api-keys - Neuen API-Key erstellen
 *
 * Key-Format: eucx_live_{prefix6}_{random32}
 * Gespeichert: prefix (eindeutig) + bcrypt-Hash des Full-Keys
 *
 * Der Full-Key wird nur bei Erstellung einmalig zurückgegeben.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes }               from "crypto";
import bcrypt                        from "bcryptjs";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:        z.string().min(1).max(100),
  scopes:      z.array(z.enum(["market:read", "trade:write", "wallet:read", "admin:read"])).min(1),
  expiresAt:   z.string().datetime().optional(),
  ipWhitelist: z.array(z.string()).max(20).optional(),
});

async function getTokenPayload(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return verifyAccessToken(authHeader?.slice(7) ?? "");
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await getTokenPayload(req);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const keys = await db.apiKey.findMany({
    where:   { organizationId: user.organizationId },
    select: {
      id:             true,
      prefix:         true,
      name:           true,
      scopes:         true,
      isActive:       true,
      expiresAt:      true,
      lastUsedAt:     true,
      ipWhitelist:    true,
      createdAt:      true,
      createdByUserId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: keys });
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await getTokenPayload(req);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, { status: 422 });
  }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  // Limit: max 10 aktive Keys pro Organisation
  const activeCount = await db.apiKey.count({
    where: { organizationId: user.organizationId, isActive: true },
  });
  if (activeCount >= 10) {
    return NextResponse.json({ error: "Maximal 10 aktive API-Keys erlaubt" }, { status: 409 });
  }

  // Key generieren
  const prefixRaw = randomBytes(4).toString("base64url").slice(0, 6);
  const prefix    = `eucx_live_${prefixRaw}`;
  const secret    = randomBytes(24).toString("base64url"); // 32 url-safe chars
  const fullKey   = `${prefix}_${secret}`;
  const secretHash = await bcrypt.hash(fullKey, 10);

  const apiKey = await db.apiKey.create({
    data: {
      organizationId:  user.organizationId,
      createdByUserId: tokenPayload.userId,
      prefix,
      secretHash,
      name:        parsed.data.name,
      scopes:      parsed.data.scopes,
      expiresAt:   parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      ipWhitelist: parsed.data.ipWhitelist ?? [],
    },
    select: {
      id:          true,
      prefix:      true,
      name:        true,
      scopes:      true,
      isActive:    true,
      expiresAt:   true,
      ipWhitelist: true,
      createdAt:   true,
    },
  });

  // fullKey nur einmalig zurückgeben
  return NextResponse.json({ data: { ...apiKey, fullKey } }, { status: 201 });
}
