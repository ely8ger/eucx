/**
 * GET /api/admin/analytics/funnel
 *
 * Funnel-Metriken aus dem AuditLog (letzte 30 Tage):
 *   - Käufer-Funnel: Registrierung → KYC → Lot → Abschluss
 *   - Verkäufer-Funnel: Registrierung → KYC → Charge → Gebot
 *   - CBAM-Blocker-Events
 *   - Top-Suchanfragen ohne Ergebnis
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"];

export async function GET(req: NextRequest) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(token.role)) {
    return NextResponse.json({ error: "Nur Administratoren" }, { status: 403 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  // ── Action-Counts aggregieren ──────────────────────────────────────
  const FUNNEL_ACTIONS = [
    "USER_REGISTER",
    "KYC_SUBMITTED",
    "LOT_CREATED",
    "INVENTORY_CHARGE_CREATED",
    "BID_SUBMITTED",
    "BID_BLOCKED_DEAL_LIMIT",
    "DEAL_CONFIRMED",
    "CONTRACT_SIGNED",
  ] as const;

  const countRows = await db.auditLog.groupBy({
    by:     ["action"],
    _count: { id: true },
    where:  {
      action:    { in: [...FUNNEL_ACTIONS] },
      createdAt: { gte: since },
    },
  });

  const counts: Record<string, number> = {};
  for (const row of countRows) {
    counts[row.action] = row._count.id;
  }

  const get = (a: string) => counts[a] ?? 0;

  // ── Top-Suchanfragen ohne Ergebnis (via Raw SQL, JSON-Feld) ────────
  type SearchRow = { query: string; cnt: bigint };
  let topSearches: { query: string; count: number }[] = [];
  try {
    const rows = await db.$queryRaw<SearchRow[]>`
      SELECT
        meta->>'query'  AS query,
        COUNT(*)::bigint AS cnt
      FROM audit_log
      WHERE action = 'CATALOG_SEARCH_NO_RESULT'
        AND created_at >= ${since}
        AND meta->>'query' IS NOT NULL
        AND meta->>'query' <> ''
      GROUP BY meta->>'query'
      ORDER BY cnt DESC
      LIMIT 15
    `;
    topSearches = rows.map((r) => ({ query: r.query, count: Number(r.cnt) }));
  } catch {
    // Falls Meta-Abfrage fehlschlägt (z.B. kein Event noch) — leer zurückgeben
  }

  return NextResponse.json({
    period: "30d",
    buyerFunnel: [
      { step: "Registrierung",   action: "USER_REGISTER",   count: get("USER_REGISTER") },
      { step: "KYC eingereicht", action: "KYC_SUBMITTED",   count: get("KYC_SUBMITTED") },
      { step: "Lot erstellt",    action: "LOT_CREATED",     count: get("LOT_CREATED") },
      { step: "Deal bestätigt",  action: "DEAL_CONFIRMED",  count: get("DEAL_CONFIRMED") },
    ],
    sellerFunnel: [
      { step: "Registrierung",      action: "USER_REGISTER",            count: get("USER_REGISTER") },
      { step: "KYC eingereicht",    action: "KYC_SUBMITTED",            count: get("KYC_SUBMITTED") },
      { step: "Charge angelegt",    action: "INVENTORY_CHARGE_CREATED", count: get("INVENTORY_CHARGE_CREATED") },
      { step: "Gebot abgegeben",    action: "BID_SUBMITTED",            count: get("BID_SUBMITTED") },
    ],
    cbamBlocked:  get("BID_BLOCKED_DEAL_LIMIT"),
    contractsSigned: get("CONTRACT_SIGNED"),
    topSearchesNoResult: topSearches,
  });
}
