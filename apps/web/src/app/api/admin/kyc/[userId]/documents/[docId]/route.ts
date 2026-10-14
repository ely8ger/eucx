/**
 * PATCH /api/admin/kyc/[userId]/documents/[docId]
 *
 * Genehmigt oder lehnt ein KYC-Dokument ab.
 * Auth: SUPER_ADMIN oder COMPLIANCE_OFFICER
 *
 * Body: { action: "approve" | "reject", adminNote?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  action:    z.enum(["approve", "reject"]),
  adminNote: z.string().max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; docId: string }> },
) {
  try {
    const token            = await requireAuth(req);
    const { userId, docId } = await params;

    if (token.role !== "SUPER_ADMIN" && token.role !== "COMPLIANCE_OFFICER") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const doc = await db.kycDocument.findUnique({
      where: { id: docId },
    });

    if (!doc || doc.userId !== userId) {
      return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });
    }

    const newStatus    = parsed.data.action === "approve" ? "APPROVED" : "REJECTED";
    const auditAction  = parsed.data.action === "approve"
      ? "KYC_DOCUMENT_APPROVED" as const
      : "KYC_DOCUMENT_REJECTED" as const;

    const updated = await db.kycDocument.update({
      where: { id: docId },
      data:  {
        status:     newStatus,
        adminNote:  parsed.data.adminNote ?? null,
        reviewedAt: new Date(),
      },
    });

    await audit({
      userId:     token.userId,
      action:     auditAction,
      entityType: "KycDocument",
      entityId:   docId,
      meta:       {
        targetUserId: userId,
        docType:      doc.type,
        adminNote:    parsed.data.adminNote,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/kyc/[userId]/documents/[docId]]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
