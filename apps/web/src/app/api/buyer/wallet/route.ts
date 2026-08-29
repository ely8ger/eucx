/**
 * GET /api/buyer/wallet
 *
 * Gibt den aktuellen Wallet-Stand des eingeloggten Käufers zurück.
 * Inkl. reserviertes Guthaben (gesperrte Escrow-Beträge) und verfügbares Guthaben.
 *
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { db }                        from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const BUYER_ROLES = ["BUYER", "BROKER", "ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"];
  if (!BUYER_ROLES.includes(token.role)) {
    return NextResponse.json({ error: "Wallet-Zugriff nur für Käufer" }, { status: 403 });
  }

  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: {
      id:              true,
      balance:         true,
      reservedBalance: true,
      currency:        true,
      updatedAt:       true,
    },
  });

  if (!wallet) {
    return NextResponse.json({
      balance:          "0",
      reservedBalance:  "0",
      available:        "0",
      currency:         "EUR",
      updatedAt:        null,
    });
  }

  const balance   = Number(wallet.balance);
  const reserved  = Number(wallet.reservedBalance);
  const available = balance - reserved;

  // Letzte Top-Up-Einträge aus LedgerEntry (CREDIT-Buchungen von Admin)
  const topUps = await db.ledgerEntry.findMany({
    where: {
      walletId:  wallet.id,
      entryType: "CREDIT",
      description: { contains: "Top-Up" },
    },
    orderBy: { createdAt: "desc" },
    take:    10,
    select:  { amount: true, description: true, createdAt: true, correlationId: true },
  });

  return NextResponse.json({
    balance:         balance.toFixed(2),
    reservedBalance: reserved.toFixed(2),
    available:       available.toFixed(2),
    currency:        wallet.currency,
    updatedAt:       wallet.updatedAt.toISOString(),
    topUps: topUps.map((t) => ({
      amount:        Number(t.amount).toFixed(2),
      description:   t.description,
      createdAt:     t.createdAt.toISOString(),
      correlationId: t.correlationId,
    })),
  });
}
