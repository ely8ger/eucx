/**
 * PATCH /api/admin/kyc/[id]
 *
 * Genehmigt oder lehnt eine Organisation ab.
 * body: { action: "APPROVE" | "REJECT"; reason?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().max(2000).optional(),
});

export async function PATCH(
  req:     NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authHeader = req.headers.get("authorization");
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, { status: 422 });
  }
  const { action, reason } = parsed.data;

  if (action === "REJECT" && !reason) {
    return NextResponse.json({ error: "Begründung ist bei Ablehnung erforderlich" }, { status: 422 });
  }

  try {
    const org = await db.organization.findUnique({
      where:  { id },
      select: { isVerified: true },
    });
    if (!org) return NextResponse.json({ error: "Organisation nicht gefunden" }, { status: 404 });

    const updated = await db.organization.update({
      where: { id },
      data:  { isVerified: action === "APPROVE" },
      select: { id: true, name: true, isVerified: true },
    });

    await audit({
      userId:     tokenPayload.userId,
      action:     "ADMIN_ACTION",
      entityType: "Organization",
      entityId:   id,
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta:       {
        kycAction:       action,
        previousStatus:  org.isVerified ? "APPROVED" : "PENDING",
        reason:          reason ?? null,
      },
    });

    return NextResponse.json({
      ...updated,
      verificationStatus: updated.isVerified ? "APPROVED" : "REJECTED",
    });
  } catch (err) {
    console.error("[PATCH /api/admin/kyc/[id]]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
