/**
 * POST /api/seller/wallet/withdrawal-request
 *
 * Wallet-Inhaber (Seller/Buyer/Broker) beantragt eine Auszahlung.
 * Erstellt einen WithdrawalRequest (PENDING), kein Wallet-Debit hier.
 * Admin bestätigt oder lehnt via PATCH /api/admin/wallet/withdrawal-requests/[id] ab.
 *
 * Body: { amount: string, iban: string, bic: string, beneficiaryName: string, reference?: string }
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { requireAuth }               from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { z }                         from "zod";
import Decimal                       from "decimal.js";

export const dynamic = "force-dynamic";

// Einfache IBAN-Grundprüfung: 15–34 alphanumerische Zeichen nach Länderkürzel
const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
const bicRegex  = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

const bodySchema = z.object({
  amount:          z.string().regex(/^\d+(\.\d{1,8})?$/, "Ungültiger Betrag"),
  iban:            z.string().regex(ibanRegex, "Ungültige IBAN (Format: DE123... ohne Leerzeichen)"),
  bic:             z.string().regex(bicRegex, "Ungültiger BIC"),
  beneficiaryName: z.string().min(2).max(140),
  reference:       z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
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

  const { amount, iban, bic, beneficiaryName, reference } = parsed.data;
  const amt = new Decimal(amount);

  if (amt.lte(0)) {
    return NextResponse.json({ error: "Betrag muss positiv sein" }, { status: 422 });
  }

  // Wallet laden
  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: { id: true, balance: true, reservedBalance: true, currency: true, organizationId: true },
  });

  if (!wallet) {
    return NextResponse.json({ error: "Kein Wallet vorhanden" }, { status: 404 });
  }

  // Verfügbares Guthaben prüfen
  const balance   = new Decimal(wallet.balance.toString());
  const reserved  = new Decimal(wallet.reservedBalance.toString());
  const available = balance.minus(reserved);

  if (amt.gt(available)) {
    return NextResponse.json({
      error:     "Unzureichendes verfügbares Guthaben",
      available: available.toFixed(2),
      requested: amt.toFixed(2),
    }, { status: 422 });
  }

  const request = await db.withdrawalRequest.create({
    data: {
      organizationId:  wallet.organizationId,
      walletId:        wallet.id,
      amount:          amt.toFixed(8),
      currency:        wallet.currency,
      iban,
      bic,
      beneficiaryName,
      reference:       reference ?? null,
      status:          "PENDING",
    },
    select: { id: true, status: true, amount: true, currency: true, createdAt: true },
  });

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Organization",
    entityId:   wallet.organizationId,
    meta: {
      event:      "WITHDRAWAL_REQUESTED",
      requestId:  request.id,
      walletId:   wallet.id,
      amount,
      iban:       iban.slice(0, 6) + "****",  // IBAN maskiert im Log
    },
  });

  return NextResponse.json({
    ok:                  true,
    requestId:           request.id,
    status:              "PENDING",
    amount:              new Decimal(request.amount.toString()).toFixed(2),
    currency:            request.currency,
    estimatedProcessing: "1-2 Werktage",
    message:             `Ihr Auszahlungsantrag über ${amt.toFixed(2)} EUR wurde eingereicht und wird von unserem Team geprüft.`,
  });
}
