/**
 * GET /api/admin/audit-log
 *
 * Admin-seitige Suche über alle AuditLog-Einträge.
 *
 * Query-Parameter (alle optional):
 *   userId=<uuid>
 *   action=ADMIN_ACTION|KYC_APPROVED|...
 *   entityType=User|Lot|Deal|...
 *   from=YYYY-MM-DD  to=YYYY-MM-DD
 *   page=1  limit=50
 *   export=csv  → CSV-Download statt JSON
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(...cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsv).join(",");
}

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId     = searchParams.get("userId")     ?? "";
    const action     = searchParams.get("action")     ?? "";
    const entityType = searchParams.get("entityType") ?? "";
    const fromParam  = searchParams.get("from")       ?? "";
    const toParam    = searchParams.get("to")         ?? "";
    const exportCsv  = searchParams.get("export") === "csv";
    const page       = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit      = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const skip       = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (userId)     where.userId     = userId;
    if (action)     where.action     = action;
    if (entityType) where.entityType = entityType;

    if (fromParam || toParam) {
      where.createdAt = {};
      if (fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam)) {
        where.createdAt.gte = new Date(`${fromParam}T00:00:00.000Z`);
      }
      if (toParam && /^\d{4}-\d{2}-\d{2}$/.test(toParam)) {
        // bis Ende des angegebenen Tages
        where.createdAt.lt = new Date(`${toParam}T23:59:59.999Z`);
      }
    }

    // CSV-Export: alle Einträge im Zeitraum (max 5000)
    if (exportCsv) {
      const logs = await db.auditLog.findMany({
        where,
        select: {
          id:         true,
          action:     true,
          entityType: true,
          entityId:   true,
          userId:     true,
          ipAddress:  true,
          createdAt:  true,
          meta:       true,
        },
        orderBy: { createdAt: "desc" },
        take:    5000,
      });

      const lines = [
        csvRow("id", "action", "entityType", "entityId", "userId", "ipAddress", "createdAt", "meta"),
        ...logs.map((l) =>
          csvRow(
            l.id,
            l.action,
            l.entityType ?? "",
            l.entityId ?? "",
            l.userId ?? "",
            l.ipAddress ?? "",
            l.createdAt.toISOString(),
            l.meta != null ? JSON.stringify(l.meta) : "",
          ),
        ),
      ];

      const fromLabel = fromParam || "all";
      const toLabel   = toParam   || "now";
      const filename  = `EUCX_AuditLog_${fromLabel}_${toLabel}.csv`;

      return new NextResponse(lines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type":        "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // JSON-Response mit Paginierung
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        select: {
          id:         true,
          action:     true,
          entityType: true,
          entityId:   true,
          userId:     true,
          ipAddress:  true,
          userAgent:  true,
          createdAt:  true,
          meta:       true,
        },
        orderBy: { createdAt: "desc" },
        take:    limit,
        skip,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/audit-log GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
