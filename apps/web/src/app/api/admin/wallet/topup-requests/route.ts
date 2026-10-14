/**
 * GET /api/admin/wallet/topup-requests
 *
 * Listet alle Topup-Anträge aus dem AuditLog (meta.type = "TOPUP_REQUEST").
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 *
 * Query: ?status=PENDING|CONFIRMED, ?orgId=
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

export async function GET(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");   // PENDING | CONFIRMED | null (alle)
  const orgIdFilter  = searchParams.get("orgId");

  const entries = await db.auditLog.findMany({
    where: {
      ...(orgIdFilter ? { entityId: orgIdFilter } : {}),
      meta: {
        path:   ["type"],
        equals: "TOPUP_REQUEST",
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id:        true,
      userId:    true,
      entityId:  true,  // walletId
      meta:      true,
      createdAt: true,
    },
  });

  // Meta-Felder extrahieren + optionaler Status-Filter
  const requests = entries
    .map((e) => {
      const m = e.meta as Record<string, unknown>;
      return {
        requestId:   e.id,
        userId:      e.userId,
        walletId:    m["walletId"] as string | null,
        amount:      m["amount"] as number,
        transferRef: m["transferRef"] as string,
        requestedAt: (m["requestedAt"] as string) ?? e.createdAt.toISOString(),
        status:      (m["status"] as string) ?? "PENDING",
      };
    })
    .filter((r) => !statusFilter || r.status === statusFilter);

  return NextResponse.json({ count: requests.length, requests });
}
