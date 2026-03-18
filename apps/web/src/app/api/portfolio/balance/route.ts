/**
 * GET /api/portfolio/balance
 *
 * Gibt Wallet-Guthaben des eingeloggten Nutzers zurück.
 * Liest aus der Wallet-Tabelle (Double-Entry-Buchhaltung via Clearing Service).
 *
 * Wenn noch kein Wallet existiert (noch keine Settlements), werden Nullwerte
 * zurückgegeben - graceful empty state statt 404.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  try {
    // ── 2. OrganizationId des Nutzers ────────────────────────────────────
    const user = await db.user.findUnique({
      where:  { id: tokenPayload.sub },
      select: { organizationId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // ── 3. Wallet-Daten laden ────────────────────────────────────────────
    const wallets = await db.wallet.findMany({
      where:  { organizationId: user.organizationId },
      select: {
        currency:        true,
        balance:         true,
        reservedBalance: true,
        updatedAt:       true,
      },
    });

    // Nullwerte wenn kein Wallet → empty state
    if (wallets.length === 0) {
      return NextResponse.json({
        wallets: [{
          currency:        "EUR",
          balance:         "0.00",
          reservedBalance: "0.00",
          total:           "0.00",
          lastUpdated:     null,
        }],
      });
    }

    return NextResponse.json({
      wallets: wallets.map((w) => {
        const bal = Number(w.balance);
        const res = Number(w.reservedBalance);
        return {
          currency:        w.currency,
          balance:         bal.toFixed(2),
          reservedBalance: res.toFixed(2),
          total:           (bal + res).toFixed(2),
          lastUpdated:     w.updatedAt.toISOString(),
        };
      }),
    });
  } catch (err) {
    console.error("[GET /api/portfolio/balance]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
