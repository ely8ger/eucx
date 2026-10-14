/**
 * POST /api/admin/wallet/[walletId]/topup
 *
 * Admin bestätigt eine eingegangene Überweisung und bucht den Betrag ins Wallet.
 * Serializable TX: wallet.balance INCREMENT + LedgerEntry CREDIT (idempotent via reference).
 * Berechtigt: ADMIN, SUPER_ADMIN
 *
 * Body: { amount: string, reference: string, note?: string }
 */
import { NextRequest, NextResponse }            from "next/server";
import { db }                                   from "@/lib/db/client";
import { requireAuth }                          from "@/lib/auth/jwt";
import { audit }                                from "@/lib/audit/logger";
import { withSerializableRetry }               from "@/lib/clearing/serializable-retry";
import { sendAuctionMail }                      from "@/lib/notifications/mailer";
import { z }                                    from "zod";
import Decimal                                  from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

const bodySchema = z.object({
  amount:    z.string().regex(/^\d+(\.\d{1,8})?$/, "Ungültiger Betrag"),
  reference: z.string().min(1).max(100),
  note:      z.string().max(500).optional(),
});

export async function POST(
  req:     NextRequest,
  { params }: { params: Promise<{ walletId: string }> },
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { walletId } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { amount, reference, note } = parsed.data;
  const amt = new Decimal(amount);

  if (amt.lte(0)) {
    return NextResponse.json({ error: "Betrag muss positiv sein" }, { status: 422 });
  }
  if (amt.gt(10_000_000)) {
    return NextResponse.json({ error: "Maximalbetrag 10.000.000 EUR überschritten" }, { status: 422 });
  }

  // Wallet prüfen
  const wallet = await db.wallet.findUnique({
    where:  { id: walletId },
    select: { id: true, balance: true, currency: true, organizationId: true },
  });
  if (!wallet) {
    return NextResponse.json({ error: "Wallet nicht gefunden" }, { status: 404 });
  }

  const idempotencyKey = `admin-topup:${reference}`;

  // Prüfen ob dieser Reference bereits gebucht wurde
  const existing = await db.ledgerEntry.findUnique({
    where:  { idempotencyKey },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Referenz '${reference}' wurde bereits gebucht (idempotent)` },
      { status: 409 },
    );
  }

  let ledgerEntryId: string;
  let newBalance:    string;

  await withSerializableRetry(() =>
    db.$transaction(async (tx) => {
      // Wallet-Balance erhöhen
      const updated = await tx.wallet.update({
        where: { id: walletId },
        data:  { balance: { increment: amt.toFixed(8) } },
        select: { balance: true },
      });
      newBalance = new Decimal(updated.balance.toString()).toFixed(2);

      // LedgerEntry (Doppelbuchung: ESCROW DEBIT + TRADER_WALLET CREDIT)
      const correlationId = `topup:${walletId}:${Date.now()}`;
      const description   = note
        ? `Admin-Einzahlung: ${reference} — ${note}`
        : `Admin-Einzahlung: ${reference}`;

      const entry = await tx.ledgerEntry.create({
        data: {
          correlationId,
          walletId,
          accountType:    "TRADER_WALLET",
          entryType:      "CREDIT",
          amount:         amt.toFixed(8),
          currency:       wallet.currency,
          description,
          idempotencyKey,
        },
        select: { id: true },
      });
      ledgerEntryId = entry.id;
    }, { isolationLevel: "Serializable" }),
  );

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Organization",
    entityId:   wallet.organizationId,
    meta: {
      event:         "TOPUP_CONFIRMED",
      walletId,
      amount,
      reference,
      note:          note ?? null,
      ledgerEntryId: ledgerEntryId!,
    },
  });

  // E-Mail an Wallet-Inhaber senden
  void (async () => {
    try {
      const user = await db.user.findFirst({
        where:  { organizationId: wallet.organizationId },
        select: { email: true },
        orderBy: { createdAt: "asc" },
      });
      if (user?.email) {
        await sendAuctionMail({
          to:       user.email,
          subject:  `EUCX: Wallet aufgeladen — ${amt.toFixed(2)} EUR gutgeschrieben`,
          template: "topup_confirmed",
          data: {
            amount:     amt.toFixed(2),
            newBalance: newBalance!,
            reference,
            date:       new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
          },
        });
      }
    } catch (err) {
      console.error("[Topup E-Mail] Fehler:", err);
    }
  })();

  return NextResponse.json({
    ok:           true,
    walletId,
    newBalance:   newBalance!,
    ledgerEntryId: ledgerEntryId!,
    reference,
    amount,
  });
}
