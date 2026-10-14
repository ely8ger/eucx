/**
 * POST /api/admin/kyc/[userId]/inquiry
 *
 * Sendet eine Rückfrage-E-Mail an den Nutzer mit 14-Tage-Frist.
 * Setzt inquiryDeadlineAt auf now + 14 Tage.
 * Auth: SUPER_ADMIN oder COMPLIANCE_OFFICER
 *
 * Body: { message: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  message: z.string().min(10).max(2000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const token    = await requireAuth(req);
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
      select: { email: true, verificationStatus: true, organization: { select: { name: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    if (user.verificationStatus === "VERIFIED") {
      return NextResponse.json({ error: "Nutzer ist bereits verifiziert — Rückfrage nicht möglich" }, { status: 409 });
    }

    const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { id: userId },
      data:  { inquiryDeadlineAt: deadline },
    });

    sendAuctionMail({
      to:       user.email,
      subject:  "EUCX — KYC-Rückfrage: Bitte antworten Sie bis zum " + deadline.toLocaleDateString("de-DE"),
      template: "kyc_inquiry",
      data:     {
        orgName:      user.organization.name,
        message:      parsed.data.message,
        deadline:     deadline.toLocaleDateString("de-DE"),
      },
    }).catch((err: unknown) => console.error("[kyc/inquiry] Mailer-Fehler:", err));

    await audit({
      userId:     token.userId,
      action:     "KYC_INQUIRY_SENT",
      entityType: "User",
      entityId:   userId,
      meta:       { targetEmail: user.email, deadline: deadline.toISOString() },
    });

    return NextResponse.json({
      data: { ok: true, deadline: deadline.toISOString() },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/kyc/[userId]/inquiry]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
