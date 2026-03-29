/**
 * PATCH /api/admin/users/[id]
 *
 * Setzt UserStatus und/oder VerificationStatus eines Nutzers.
 * Hebt auch die Login-Sperre auf (wenn status → ACTIVE gesetzt wird).
 * Sendet E-Mail bei Statusänderung.
 *
 * Body:
 *   { status?: UserStatus, verificationStatus?: VerificationStatus, note?: string }
 *
 * Nur ADMIN/COMPLIANCE_OFFICER/SUPER_ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { sendAuctionMail }           from "@/lib/notifications/mailer";

export const dynamic = "force-dynamic";

const ADMIN_ROLES         = ["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"];
const VALID_STATUS        = ["ACTIVE", "SUSPENDED", "PENDING", "REJECTED"];
const VALID_VERIFICATION  = ["GUEST", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"];

const ROLE_LABEL: Record<string, string> = {
  BUYER:  "Käufer",
  SELLER: "Verkäufer",
  BROKER: "Broker",
  ADMIN:  "Administrator",
  COMPLIANCE_OFFICER: "Compliance Officer",
  SUPER_ADMIN: "Super Administrator",
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
    const { id: userId } = await params;
    const body = await req.json() as {
      status?:             string;
      verificationStatus?: string;
      note?:               string;
    };

    if (!body.status && !body.verificationStatus) {
      return NextResponse.json(
        { error: "Mindestens status oder verificationStatus muss angegeben werden." },
        { status: 400 },
      );
    }
    if (body.status && !VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "Ungültiger status-Wert." }, { status: 400 });
    }
    if (body.verificationStatus && !VALID_VERIFICATION.includes(body.verificationStatus)) {
      return NextResponse.json({ error: "Ungültiger verificationStatus-Wert." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where:  { id: userId },
      select: {
        id:                 true,
        email:              true,
        role:               true,
        status:             true,
        verificationStatus: true,
        organization:       { select: { name: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
    }

    // Daten für Update zusammenstellen
    const updateData: Record<string, unknown> = {};
    if (body.status)             updateData.status             = body.status;
    if (body.verificationStatus) updateData.verificationStatus = body.verificationStatus;

    // Login-Sperre aufheben wenn Account aktiviert wird
    if (body.status === "ACTIVE") {
      updateData.failedLoginCount = 0;
      updateData.lockedUntil      = null;
    }

    await db.$transaction([
      db.user.update({ where: { id: userId }, data: updateData }),
      db.auditLog.create({
        data: {
          userId:     token.userId,
          action:     "ADMIN_STATUS_CHANGE",
          entityType: "user",
          entityId:   userId,
          ipAddress:  "admin-action",
          userAgent:  JSON.stringify({ before: { status: user.status, verificationStatus: user.verificationStatus }, after: updateData, note: body.note }),
        },
      }),
    ]);

    // E-Mail bei relevanten Statusänderungen
    if (body.status === "ACTIVE" && user.status !== "ACTIVE") {
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
    } else if (body.status === "SUSPENDED" && user.status !== "SUSPENDED") {
      await sendAuctionMail({
        to:       user.email,
        subject:  "EUCX — Ihr Konto wurde gesperrt",
        template: "account_locked",
        data:     { email: user.email },
      });
    }

    return NextResponse.json({
      data: {
        userId,
        status:             (body.status             ?? user.status)             as string,
        verificationStatus: (body.verificationStatus ?? user.verificationStatus) as string,
      },
    });
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
