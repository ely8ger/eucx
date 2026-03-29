/**
 * PATCH /api/admin/registrations/[id]
 *
 * Registrierungsanfrage genehmigen oder ablehnen.
 *
 * Body:
 *   { action: "APPROVE" }
 *   { action: "REJECT", reason: string }
 *
 * Bei APPROVE: status → ACTIVE, E-Mail "Freigeschalten" senden
 * Bei REJECT:  status → REJECTED, rejectionReason setzen, E-Mail senden
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"];

const ROLE_LABEL: Record<string, string> = {
  BUYER:  "Käufer",
  SELLER: "Verkäufer",
  BROKER: "Broker",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(token.role)) {
    return NextResponse.json({ error: "Nur Administratoren" }, { status: 403 });
  }

  try {
    const body        = await req.json() as { action?: string; reason?: string };
    const { id: userId } = await params;

    if (!body.action || !["APPROVE", "REJECT"].includes(body.action)) {
      return NextResponse.json(
        { error: "action muss APPROVE oder REJECT sein." },
        { status: 400 },
      );
    }
    if (body.action === "REJECT" && !body.reason?.trim()) {
      return NextResponse.json(
        { error: "Bei Ablehnung ist eine Begründung erforderlich." },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where:  { id: userId },
      select: { id: true, email: true, role: true, status: true, organization: { select: { name: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
    }
    if (user.status !== "PENDING") {
      return NextResponse.json(
        { error: "Nur ausstehende Registrierungen können bearbeitet werden." },
        { status: 409 },
      );
    }

    if (body.action === "APPROVE") {
      await db.user.update({
        where: { id: userId },
        data:  { status: "ACTIVE" },
      });

      await sendAuctionMail({
        to:       user.email,
        subject:  "EUCX — Ihr Konto wurde freigeschaltet",
        template: "registration_approved",
        data:     {
          email:   user.email,
          orgName: user.organization?.name ?? "—",
          role:    ROLE_LABEL[user.role] ?? user.role,
        },
      });

      return NextResponse.json({ data: { message: "Registrierung genehmigt. Nutzer wurde benachrichtigt." } });
    }

    // REJECT
    await db.user.update({
      where: { id: userId },
      data:  { status: "REJECTED", rejectionReason: body.reason },
    });

    await sendAuctionMail({
      to:       user.email,
      subject:  "EUCX — Ihre Registrierung wurde abgelehnt",
      template: "registration_rejected",
      data:     { email: user.email, reason: body.reason ?? "" },
    });

    return NextResponse.json({ data: { message: "Registrierung abgelehnt. Nutzer wurde benachrichtigt." } });
  } catch (err) {
    console.error("[PATCH /api/admin/registrations/[id]]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
