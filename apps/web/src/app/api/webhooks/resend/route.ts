/**
 * POST /api/webhooks/resend
 *
 * Empfängt Resend-Delivery-Events und protokolliert sie im AuditLog.
 *
 * Events:
 *   email.sent           → Zugestellt (kein AuditLog nötig)
 *   email.delivered      → Vom Empfänger-MX angenommen
 *   email.bounced        → Bounce → AuditLog + Admin-Alert
 *   email.complained     → Spam-Beschwerde → AuditLog + Admin-Alert
 *   email.opened         → Geöffnet (nur Tracking-Metrik)
 *
 * Signatur-Verifikation: Resend sendet `svix-signature` Header.
 * RESEND_WEBHOOK_SECRET muss in Vercel-Env gesetzt sein.
 *
 * Docs: https://resend.com/docs/dashboard/webhooks/introduction
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { sendAuctionMail }           from "@/lib/notifications/mailer";
import crypto                        from "crypto";

export const dynamic = "force-dynamic";

// ── Resend Webhook-Typen ─────────────────────────────────────────────────────

interface ResendWebhookPayload {
  type: string;
  data: {
    email_id:   string;
    from:       string;
    to:         string[];
    subject?:   string;
    bounce?:    { message?: string };
    complaint?: { feedback_type?: string };
    created_at: string;
  };
}

// ── Signatur-Verifikation ────────────────────────────────────────────────────

function verifySignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // Kein Secret konfiguriert → Webhook akzeptieren (Dev-Modus)

  const msgId        = headers.get("svix-id")        ?? "";
  const msgTimestamp = headers.get("svix-timestamp")  ?? "";
  const msgSignature = headers.get("svix-signature")  ?? "";

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Timestamp-Toleranz: ±5 Minuten (verhindert Replay-Angriffe)
  const ts = parseInt(msgTimestamp, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const toSign   = `${msgId}.${msgTimestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(toSign).digest("base64");

  // Resend sendet mehrere Signaturen, durch Leerzeichen getrennt
  return msgSignature.split(" ").some((sig) => {
    const bare = sig.startsWith("v1,") ? sig.slice(3) : sig;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(bare));
  });
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req.headers)) {
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const { type, data } = payload;
  const recipient = data.to?.[0] ?? "unknown";

  switch (type) {

    case "email.bounced": {
      const bounceMsg = data.bounce?.message ?? "Keine Details";
      console.warn(`[Resend] Bounce: ${recipient} | ${data.subject ?? ""} | ${bounceMsg}`);

      await db.auditLog.create({
        data: {
          action:     "EMAIL_BOUNCED",
          entityType: "EmailDelivery",
          entityId:   data.email_id,
          meta: {
            recipient,
            subject:    data.subject ?? "",
            bounceMsg:  bounceMsg.slice(0, 500),
            occurredAt: data.created_at,
          },
        },
      }).catch(console.error);

      // Admin-Alert bei Bounce
      const adminEmail = process.env.EUCX_COMPLIANCE_EMAIL ?? "admin@eucx.eu";
      sendAuctionMail({
        to:       adminEmail,
        subject:  `[EUCX Alert] E-Mail-Bounce: ${recipient}`,
        template: "email_bounce_alert",
        data: {
          recipient,
          subject:   data.subject ?? "-",
          bounceMsg: bounceMsg.slice(0, 200),
          emailId:   data.email_id,
        },
      }).catch(console.error);
      break;
    }

    case "email.complained": {
      const feedbackType = data.complaint?.feedback_type ?? "abuse";
      console.warn(`[Resend] Spam-Beschwerde: ${recipient} | ${feedbackType}`);

      await db.auditLog.create({
        data: {
          action:     "EMAIL_COMPLAINED",
          entityType: "EmailDelivery",
          entityId:   data.email_id,
          meta: {
            recipient,
            subject:      data.subject ?? "",
            feedbackType,
            occurredAt:   data.created_at,
          },
        },
      }).catch(console.error);
      break;
    }

    case "email.delivered":
      // Kein AuditLog für Erfolg — Logs sauber halten
      break;

    // email.sent, email.opened, email.clicked: ignorieren
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
