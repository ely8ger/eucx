/**
 * GET /api/admin/wallet/withdrawal-requests?status=PENDING&page=1
 *
 * Admin-Übersicht aller Auszahlungsanträge.
 * Berechtigt: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const ADMIN_ROLES  = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;
const VALID_STATUS = ["PENDING", "PROCESSING", "COMPLETED", "REJECTED"] as const;

export async function GET(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

  const statusFilter = statusParam && (VALID_STATUS as readonly string[]).includes(statusParam)
    ? statusParam as (typeof VALID_STATUS)[number]
    : undefined;

  const whereClause = statusFilter ? { status: statusFilter } : {};

  const [requests, total] = await Promise.all([
    db.withdrawalRequest.findMany({
      where:   whereClause,
      orderBy: { createdAt: "asc" },
      take:    limit,
      skip:    (page - 1) * limit,
      include: {
        organization: { select: { id: true, name: true, taxId: true } },
        wallet:       { select: { id: true, balance: true, currency: true } },
      },
    }),
    db.withdrawalRequest.count({ where: whereClause }),
  ]);

  const result = requests.map((r) => ({
    id:              r.id,
    organizationId:  r.organizationId,
    organizationName: r.organization.name,
    organizationTaxId: r.organization.taxId,
    walletId:        r.walletId,
    walletBalance:   Number(r.wallet.balance).toFixed(2),
    amount:          Number(r.amount).toFixed(2),
    currency:        r.currency,
    iban:            r.iban,
    bic:             r.bic,
    beneficiaryName: r.beneficiaryName,
    reference:       r.reference,
    status:          r.status,
    adminNote:       r.adminNote,
    processedBy:     r.processedBy,
    processedAt:     r.processedAt?.toISOString() ?? null,
    createdAt:       r.createdAt.toISOString(),
  }));

  return NextResponse.json({
    requests: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
