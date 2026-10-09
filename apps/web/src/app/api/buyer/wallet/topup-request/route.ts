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
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { db }                        from "@/lib/db/client";
import { z }                         from "zod";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount:    z.number().positive().max(10_000_000),
  reference: z.string().max(100).optional(),
});

async function _POST(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

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

  // A9 — IBAN/BIC aus Umgebungsvariablen, nicht hardcodiert
  const iban        = process.env.EUCX_BANK_IBAN ?? "";
  const bic         = process.env.EUCX_BANK_BIC  ?? "";
  const beneficiary = process.env.EUCX_BANK_NAME ?? "EUCX GmbH";

  return NextResponse.json({
    ok:           true,
    transferRef,
    amount,
    iban,
    bic,
    beneficiary,
    purpose:      transferRef,
    message:      `Bitte überweisen Sie ${amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} mit dem Verwendungszweck "${transferRef}". Ihr Guthaben wird nach Zahlungseingang (1-3 Werktage) gutgeschrieben.`,
  });
}

export const POST = apiRoute(_POST);
