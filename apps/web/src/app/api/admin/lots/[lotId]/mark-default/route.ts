/**
 * POST /api/admin/lots/[lotId]/mark-default
 *
 * Stellt Verkäufer-Ausfall fest (EUCX-Mechanismus 4: Default & Penalty).
 *
 * Voraussetzungen:
 *   - Admin (ADMIN / SUPER_ADMIN / COMPLIANCE_OFFICER)
 *   - LotContract.deliveryStatus ∈ {MATCHED, AWAITING_PAYMENT, READY_FOR_PICKUP, IN_TRANSIT}
 *
 * Wirkung:
 *   1. LotContract.deliveryStatus → DEFAULTED
 *   2. LotContract.defaultedAt = now()
 *   3. Pönale = 2 % × totalValue → LotContract.penaltyAmount gespeichert
 *   4. Verkäufer-Account: status → SUSPENDED (KYC-Tier-Sperrung)
 *   5. AuditLog: SETTLEMENT_FAILED (für Reporting) + ADMIN_ACTION (für Compliance-Protokoll)
 *
 * Body: { reason?: string }  — optionaler Admin-Kommentar (max 500 Zeichen)
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { DeliveryStatus, UserStatus } from "@prisma/client";
import { z }                          from "zod";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"];

// Nur diese Status können eskalieren → DEFAULTED
const DEFAULTABLE_STATUSES: DeliveryStatus[] = [
  DeliveryStatus.MATCHED,
  DeliveryStatus.AWAITING_PAYMENT,
  DeliveryStatus.READY_FOR_PICKUP,
  DeliveryStatus.IN_TRANSIT,
];

const PENALTY_RATE = 0.02; // 2 % Konventionalstrafe (§280 BGB / Verkäufer-AGB EUCX)

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  // Auth: nur Admins
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  if (!ADMIN_ROLES.includes(token.role)) {
    return NextResponse.json({ error: "Nur Administratoren" }, { status: 403 });
  }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: { id: true, sellerId: true, buyerId: true, deliveryStatus: true, totalValue: true, defaultedAt: true },
  });
  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  if (!DEFAULTABLE_STATUSES.includes(contract.deliveryStatus)) {
    return NextResponse.json(
      { error: `Status '${contract.deliveryStatus}' kann nicht als Ausfall markiert werden.` },
      { status: 409 }
    );
  }

  if (contract.defaultedAt) {
    return NextResponse.json({ error: "Ausfall bereits festgestellt." }, { status: 409 });
  }

  let body: unknown;
  try { body = await req.json().catch(() => ({})); }
  catch { body = {}; }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", details: parsed.error.flatten() }, { status: 422 });
  }

  const adminReason = parsed.data.reason ?? "Verkäufer-Ausfall nach 48h-Nachfrist";
  const now = new Date();

  // Pönale: 2 % des Vertragswerts, kaufmännisch gerundet auf 2 Dezimalstellen
  const totalValue    = parseFloat(String(contract.totalValue));
  const penaltyAmount = Math.round(totalValue * PENALTY_RATE * 100) / 100;

  // Atomische Transaktion
  await db.$transaction([
    // Kontrakt: DEFAULTED
    db.lotContract.update({
      where: { id: contract.id },
      data: {
        deliveryStatus: DeliveryStatus.DEFAULTED,
        defaultedAt:    now,
        penaltyAmount:  penaltyAmount,
        penaltyPaid:    false,
      },
    }),
    // Verkäufer: KYC-Tier-Sperrung (Account SUSPENDED)
    db.user.update({
      where: { id: contract.sellerId },
      data:  { status: UserStatus.SUSPENDED },
    }),
  ]);

  const ip = req.headers.get("x-forwarded-for")?.split(",").at(0)?.trim() ?? undefined;

  // Audit 1: Settlement fehlgeschlagen (für Finanz-Reporting)
  void audit({
    userId:     token.userId,
    action:     "SETTLEMENT_FAILED",
    entityType: "Settlement",
    entityId:   contract.id,
    ipAddress:  ip,
    meta: {
      lotId,
      sellerId:      contract.sellerId,
      totalValue,
      penaltyAmount,
      reason:        adminReason,
    },
  });

  // Audit 2: Admin-Aktion (Compliance-Protokoll)
  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "User",
    entityId:   contract.sellerId,
    ipAddress:  ip,
    meta: {
      action:        "SELLER_SUSPENDED_DEFAULT",
      lotId,
      penaltyAmount,
      reason:        adminReason,
    },
  });

  return NextResponse.json({
    ok:            true,
    lotId,
    penaltyAmount,
    penaltyRate:   "2 %",
    sellerSuspended: true,
    defaultedAt:   now.toISOString(),
  });
}
