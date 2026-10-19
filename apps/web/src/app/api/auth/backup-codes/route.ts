/**
 * GET  /api/auth/backup-codes  - prüft ob Codes vorhanden sind
 * POST /api/auth/backup-codes  - generiert 8 neue Backup-Codes (löscht alte)
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash }   from "crypto";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getClientIp }               from "@/lib/net/get-client-ip";
import { logSecurityEvent, persistAuditLog } from "@/lib/audit/log-event";

export const dynamic = "force-dynamic";

async function auth(req: NextRequest) {
  return requireAuth(req);
}

function generateCode(): string {
  // Format: XXXX-XXXX (8 hex chars)
  const raw = randomBytes(4).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export async function GET(req: NextRequest) {
  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try { payload = await auth(req); } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const count = await db.backupCode.count({
    where: { userId: payload.userId, usedAt: null },
  });

  return NextResponse.json({ remaining: count });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try { payload = await auth(req); } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Rate-Limit: max 5 Neugenerierungen pro Stunde
  const rl = await checkRateLimit(`backup-codes:generate:${payload.userId}`, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte versuchen Sie es später erneut." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  // Alte Codes löschen
  await db.backupCode.deleteMany({ where: { userId: payload.userId } });

  // 8 neue Codes generieren
  const codes: string[] = [];
  const records = [];

  for (let i = 0; i < 8; i++) {
    const code     = generateCode();
    const codeHash = createHash("sha256").update(code).digest("hex");
    codes.push(code);
    records.push({ userId: payload.userId, codeHash });
  }

  await db.backupCode.createMany({ data: records });

  logSecurityEvent({ event: "AUTH_BACKUP_CODES_GENERATED", ip, userId: payload.userId });
  void persistAuditLog({
    action:     "AUTH_BACKUP_CODES_GENERATED",
    userId:     payload.userId,
    entityType: "user",
    entityId:   payload.userId,
    ipAddress:  ip,
    userAgent:  req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ codes });
}
