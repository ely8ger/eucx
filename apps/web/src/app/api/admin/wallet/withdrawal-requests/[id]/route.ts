/**
 * PATCH /api/admin/wallet/withdrawal-requests/[id]
 *
 * Admin genehmigt oder lehnt einen Auszahlungsantrag ab.
 *
 * APPROVE: Serializable TX → Wallet-Debit + LedgerEntry DEBIT (verhindert negative Salden)
 * REJECT:  Status-Update + adminNote, kein Wallet-Effekt
 *
 * Berechtigt: ADMIN, SUPER_ADMIN
 * Body: { action: "APPROVE" | "REJECT", adminNote?: string }
 */
import { NextRequest, NextResponse }  from "next/server";
import { db }                         from "@/lib/db/client";
import { requireAuth }                from "@/lib/auth/jwt";
import { audit }                      from "@/lib/audit/logger";
import { withSerializableRetry }      from "@/lib/clearing/serializable-retry";
import { sendAuctionMail }            from "@/lib/notifications/mailer";
import { z }                          from "zod";
import Decimal                        from "decimal.js";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

const bodySchema = z.object({
  action:    z.enum(["APPROVE", "REJECT"]),
  adminNote: z.string().max(500).optional(),
});

export async function PATCH(
  req:     NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  if (!(ADMIN_ROLES as readonly string[]).includes(token.role as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { action, adminNote } = parsed.data;

  const request = await db.withdrawalRequest.findUnique({
    where:  { id },
    select: {
      id:             true,
      status:         true,
      amount:         true,
      currency:       true,
      walletId:       true,
      organizationId: true,
      beneficiaryName: true,
      iban:           true,
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Auszahlungsantrag nicht gefunden" }, { status: 404 });
  }
  if (request.status !== "PENDING" && request.status !== "PROCESSING") {
    return NextResponse.json(
      { error: `Antrag ist bereits ${request.status} — keine weitere Aktion möglich` },
      { status: 409 },
    );
  }

  const now = new Date();

  if (action === "REJECT") {
    await db.withdrawalRequest.update({
      where: { id },
      data: {
        status:      "REJECTED",
        adminNote:   adminNote ?? null,
        processedBy: token.userId,
        processedAt: now,
      },
    });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "Organization",
      entityId:   request.organizationId,
      meta: {
        event:     "WITHDRAWAL_REJECTED",
        requestId: id,
        adminNote: adminNote ?? null,
      },
    });

    // E-Mail an Antragsteller
    void (async () => {
      try {
        const user = await db.user.findFirst({
          where:  { organizationId: request.organizationId },
          select: { email: true },
          orderBy: { createdAt: "asc" },
        });
        const wallet = await db.wallet.findUnique({
          where:  { id: request.walletId },
          select: { balance: true },
        });
        if (user?.email) {
          await sendAuctionMail({
            to:       user.email,
            subject:  "EUCX: Ihr Auszahlungsantrag wurde abgelehnt",
            template: "withdrawal_rejected",
            data: {
              amount:    new Decimal(request.amount.toString()).toFixed(2),
              balance:   wallet ? new Decimal(wallet.balance.toString()).toFixed(2) : "-",
              adminNote: adminNote ?? "",
              date:      now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
            },
          });
        }
      } catch (err) {
        console.error("[Withdrawal Reject E-Mail] Fehler:", err);
      }
    })();

    return NextResponse.json({ ok: true, requestId: id, status: "REJECTED" });
  }

  // APPROVE: Serializable TX — Wallet-Debit + LedgerEntry
  const amt             = new Decimal(request.amount.toString());
  const idempotencyKey  = `withdrawal:${id}`;

  // Doppelbuchungs-Check
  const existing = await db.ledgerEntry.findUnique({
    where:  { idempotencyKey },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Auszahlung wurde bereits verbucht (idempotent)" },
      { status: 409 },
    );
  }

  let ledgerEntryId: string;
  let newBalance:    string;

  try {
    await withSerializableRetry(() =>
      db.$transaction(async (tx) => {
        // Status auf PROCESSING setzen
        await tx.withdrawalRequest.update({
          where: { id },
          data: { status: "PROCESSING" },
        });

        // Wallet atomisch debitieren — verhindert negative Salden durch WHERE-Bedingung
        const updated = await tx.wallet.updateMany({
          where: {
            id:      request.walletId,
            balance: { gte: amt.toFixed(8) },
          },
          data: { balance: { decrement: amt.toFixed(8) } },
        });

        if (updated.count === 0) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        // Neuen Balance-Wert lesen
        const wallet = await tx.wallet.findUnique({
          where:  { id: request.walletId },
          select: { balance: true },
        });
        newBalance = new Decimal(wallet!.balance.toString()).toFixed(2);

        // LedgerEntry
        const entry = await tx.ledgerEntry.create({
          data: {
            correlationId:  `withdrawal:${id}`,
            walletId:       request.walletId,
            accountType:    "TRADER_WALLET",
            entryType:      "DEBIT",
            amount:         amt.toFixed(8),
            currency:       request.currency,
            description:    `Auszahlung an ${request.beneficiaryName} (IBAN: ${request.iban.slice(0, 6)}****)`,
            idempotencyKey,
          },
          select: { id: true },
        });
        ledgerEntryId = entry.id;

        // WithdrawalRequest als COMPLETED markieren
        await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status:      "COMPLETED",
            adminNote:   adminNote ?? null,
            processedBy: token.userId,
            processedAt: now,
          },
        });
      }, { isolationLevel: "Serializable" }),
    );
  } catch (err) {
    if ((err as Error).message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "Unzureichendes Wallet-Guthaben für diese Auszahlung" },
        { status: 422 },
      );
    }
    throw err;
  }

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Organization",
    entityId:   request.organizationId,
    meta: {
      event:         "WITHDRAWAL_APPROVED",
      requestId:     id,
      walletId:      request.walletId,
      amount:        amt.toFixed(2),
      ledgerEntryId: ledgerEntryId!,
      newBalance:    newBalance!,
      adminNote:     adminNote ?? null,
    },
  });

  // E-Mail an Antragsteller
  void (async () => {
    try {
      const user = await db.user.findFirst({
        where:  { organizationId: request.organizationId },
        select: { email: true },
        orderBy: { createdAt: "asc" },
      });
      if (user?.email) {
        await sendAuctionMail({
          to:       user.email,
          subject:  `EUCX: Auszahlung von ${amt.toFixed(2)} EUR genehmigt`,
          template: "withdrawal_approved",
          data: {
            amount:          amt.toFixed(2),
            beneficiaryName: request.beneficiaryName,
            iban:            request.iban.slice(0, 6) + "****" + request.iban.slice(-4),
            newBalance:      newBalance!,
            date:            now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
          },
        });
      }
    } catch (err) {
      console.error("[Withdrawal Approve E-Mail] Fehler:", err);
    }
  })();

  return NextResponse.json({
    ok:            true,
    requestId:     id,
    status:        "COMPLETED",
    amount:        amt.toFixed(2),
    newBalance:    newBalance!,
    ledgerEntryId: ledgerEntryId!,
  });
}
