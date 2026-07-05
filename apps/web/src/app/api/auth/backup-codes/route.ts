/**
 * GET  /api/auth/backup-codes  — prüft ob Codes vorhanden sind
 * POST /api/auth/backup-codes  — generiert 8 neue Backup-Codes (löscht alte)
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash }   from "crypto";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

async function auth(req: NextRequest) {
  const header = req.headers.get("authorization");
  return verifyAccessToken(header?.slice(7) ?? "");
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
  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try { payload = await auth(req); } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
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

  return NextResponse.json({ codes });
}
