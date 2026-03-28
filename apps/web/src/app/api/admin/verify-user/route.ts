/**
 * PATCH /api/admin/verify-user
 *
 * Admin-Override: Nutzer manuell freischalten oder ablehnen.
 * Setzt verificationStatus und optional isYoungCompany.
 *
 * Nur für ADMIN, COMPLIANCE_OFFICER, SUPER_ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { audit } from "@/lib/audit/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"];

const bodySchema = z.object({
  userId:             z.string().min(1),
  verificationStatus: z.enum(["VERIFIED", "REJECTED", "PENDING_VERIFICATION", "GUEST", "SUSPENDED"]),
  isYoungCompany:     z.boolean().optional(),
  companyFoundedAt:   z.string().datetime().optional(),  // ISO 8601
  adminNote:          z.string().max(2000).optional(),   // Ablehnungsgrund
  // KYC-Dokument optional mitgenehmigen
  kycDocumentId:      z.string().optional(),
  kycDocStatus:       z.enum(["APPROVED", "REJECTED"]).optional(),
});

export async function PATCH(req: NextRequest) {
  // ── Auth + Rolle ──────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  let admin;
  try {
    admin = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(admin.role)) {
    return NextResponse.json({ error: "Nur Administratoren" }, { status: 403 });
  }

  // ── Body ──────────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const {
    userId, verificationStatus, isYoungCompany, companyFoundedAt,
    adminNote, kycDocumentId, kycDocStatus,
  } = parsed.data;

  // ── Target-User laden ─────────────────────────────────────────────
  const target = await db.user.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, verificationStatus: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
  }

  // ── Transaktion: User + optional KycDocument updaten ─────────────
  await db.$transaction(async (tx) => {
    const userUpdateData: Record<string, unknown> = { verificationStatus };
    if (isYoungCompany !== undefined) userUpdateData.isYoungCompany = isYoungCompany;
    if (companyFoundedAt)             userUpdateData.companyFoundedAt = new Date(companyFoundedAt);

    await tx.user.update({ where: { id: userId }, data: userUpdateData });

    if (kycDocumentId && kycDocStatus) {
      await tx.kycDocument.update({
        where: { id: kycDocumentId },
        data: {
          status:     kycDocStatus,
          adminNote:  adminNote ?? null,
          reviewedAt: new Date(),
        },
      });
    }
  });

  // ── Audit-Log ─────────────────────────────────────────────────────
  await audit({
    userId:     admin.userId,
    action:     "ADMIN_ACTION",
    entityType: "User",
    entityId:   userId,
    meta:       { newStatus: verificationStatus, isYoungCompany, adminNote },
  });

  return NextResponse.json({
    ok:                 true,
    userId,
    verificationStatus,
  });
}
