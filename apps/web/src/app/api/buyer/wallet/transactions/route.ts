/**
 * GET /api/buyer/wallet/transactions?page=1&limit=20&type=CREDIT|DEBIT
 *
 * Paginierte Ledger-History für das Wallet des eingeloggten Nutzers.
 * Auth: Bearer JWT (alle Wallet-Inhaber)
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);

  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const typeParam = searchParams.get("type");  // CREDIT | DEBIT | null (alle)

  const validTypes = ["CREDIT", "DEBIT"] as const;
  const entryTypeFilter = typeParam && (validTypes as readonly string[]).includes(typeParam)
    ? typeParam as "CREDIT" | "DEBIT"
    : undefined;

  // Wallet via organizationId des Nutzers ermitteln
  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: { id: true, currency: true },
  });

  if (!wallet) {
    return NextResponse.json({
      transactions: [],
      pagination:   { page, limit, total: 0, totalPages: 0 },
    });
  }

  const whereClause = {
    walletId:  wallet.id,
    ...(entryTypeFilter ? { entryType: entryTypeFilter } : {}),
  };

  const [entries, total] = await Promise.all([
    db.ledgerEntry.findMany({
      where:   whereClause,
      orderBy: { createdAt: "desc" },
      take:    limit,
      skip:    (page - 1) * limit,
      select: {
        id:             true,
        entryType:      true,
        accountType:    true,
        amount:         true,
        currency:       true,
        description:    true,
        correlationId:  true,
        dealId:         true,
        lotContractId:  true,
        createdAt:      true,
      },
    }),
    db.ledgerEntry.count({ where: whereClause }),
  ]);

  const transactions = entries.map((e) => ({
    id:            e.id,
    entryType:     e.entryType,
    accountType:   e.accountType,
    amount:        Number(e.amount).toFixed(2),
    currency:      e.currency,
    description:   e.description,
    correlationId: e.correlationId,
    dealId:        e.dealId,
    lotContractId: e.lotContractId,
    createdAt:     e.createdAt.toISOString(),
  }));

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
