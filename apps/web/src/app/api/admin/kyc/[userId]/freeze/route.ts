/**
 * POST /api/admin/kyc/[userId]/freeze
 *
 * Friert einen Account temporär ein (operativ) oder hebt die Sperre auf.
 * Unterschied zu PATCH suspend: Freeze ist reversibel ohne neuen KYC-Antrag.
 *
 * Body: { action: "freeze" | "unfreeze", reason?: string }
 * Auth: SUPER_ADMIN oder COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["freeze", "unfreeze"]),
  reason: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const token      = await requireAuth(req);
    const { userId } = await params;

    if (token.role !== "SUPER_ADMIN" && token.role !== "COMPLIANCE_OFFICER") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const user = await db.user.findUnique({
      where:  { id: userId },
      select: { email: true, status: true, verificationStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    const { action, reason } = parsed.data;

    if (action === "freeze") {
      if (user.status === "SUSPENDED") {
        return NextResponse.json({ error: "Account ist bereits gesperrt" }, { status: 409 });
      }

      await db.user.update({
        where: { id: userId },
        data:  { status: "SUSPENDED" },
      });

      await audit({
        userId:     token.userId,
        action:     "ACCOUNT_FROZEN",
        entityType: "User",
        entityId:   userId,
        meta:       { targetEmail: user.email, reason, previousStatus: user.status },
      });
    } else {
      if (user.status !== "SUSPENDED") {
        return NextResponse.json({ error: "Account ist nicht gesperrt" }, { status: 409 });
      }

      // Status wiederherstellen: VERIFIED → ACTIVE, sonst → PENDING
      const restoreStatus = user.verificationStatus === "VERIFIED" ? "ACTIVE" : "PENDING";
      await db.user.update({
        where: { id: userId },
        data:  { status: restoreStatus },
      });

      await audit({
        userId:     token.userId,
        action:     "ACCOUNT_UNFROZEN",
        entityType: "User",
        entityId:   userId,
        meta:       { targetEmail: user.email, reason },
      });
    }

    return NextResponse.json({ ok: true, action });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/kyc/[userId]/freeze]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
