/**
 * POST /api/buyer/wallet/topup-request
 *
 * Käufer meldet eine geplante Banküberweisung für Wallet-Aufladung.
 * Schreibt einen AuditLog-Eintrag, kein Geld wird sofort gebucht.
 * Admin muss den Eingang manuell bestätigen (über /api/admin/wallet/topup/confirm).
 *
 * Body: { amount: number, reference?: string }
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { db }                        from "@/lib/db/client";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount:    z.number().positive().max(10_000_000),
  reference: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { amount, reference } = parsed.data;

  // Überweisungsreferenz: USER-ID + Timestamp (für Bank-Verwendungszweck)
  const transferRef = reference ?? `EUCX-${token.userId.slice(-6).toUpperCase()}-${Date.now()}`;

  // Wallet ermitteln
  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: { id: true },
  });

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Organization",
    entityId:   wallet?.id ?? "unknown",
    meta: {
      type:         "TOPUP_REQUEST",
      amount:       amount,
      transferRef,
      walletId:     wallet?.id,
      requestedAt:  new Date().toISOString(),
    },
  });

  return NextResponse.json({
    ok:           true,
    transferRef,
    amount,
    iban:         "DE89 3704 0044 0532 0130 00",
    bic:          "COBADEFFXXX",
    beneficiary:  "EUCX GmbH",
    purpose:      transferRef,
    message:      `Bitte überweisen Sie ${amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} mit dem Verwendungszweck "${transferRef}". Ihr Guthaben wird nach Zahlungseingang (1–3 Werktage) gutgeschrieben.`,
  });
}
