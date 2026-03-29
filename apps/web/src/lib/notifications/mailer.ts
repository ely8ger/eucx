/**
 * EUCX Mailer — E-Mail-Versand via Resend
 *
 * Setzt RESEND_API_KEY in .env.local voraus.
 * Wenn kein API-Key gesetzt: Stub-Modus (nur console.log).
 *
 * Von-Adresse: noreply@eucx.eu  (muss in Resend verifiziert sein)
 */

import { buildEmailHtml } from "./email-templates";

interface MailParams {
  to:       string;
  subject:  string;
  template: string;
  data:     Record<string, string>;
}

export async function sendAuctionMail(params: MailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Stub-Modus: kein API-Key konfiguriert
    console.log(`[Mailer STUB] An: ${params.to} | Betreff: ${params.subject}`);
    return;
  }

  const html = buildEmailHtml(params.template, params.data);

  // Resend REST API direkt aufrufen (kein SDK-Import nötig für Edge-Kompatibilität)
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from:    "EUCX Plattform <noreply@eucx.eu>",
      to:      [params.to],
      subject: params.subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[Mailer] Fehler beim Senden an ${params.to}: ${res.status} ${detail}`);
  }
}
