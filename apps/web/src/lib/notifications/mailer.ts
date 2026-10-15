/**
 * EUCX Mailer - E-Mail-Versand via Resend
 *
 * Setzt RESEND_API_KEY in .env.local voraus.
 * Wenn kein API-Key gesetzt: Stub-Modus (nur console.log).
 *
 * Retry: 3 Versuche mit Exponential Backoff (1s, 2s, 4s) bei 5xx.
 * 4xx (z.B. 422 ungültige Adresse) werden sofort aufgegeben — kein Retry.
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

const MAX_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendAuctionMail(params: MailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Mailer STUB] An: ${params.to} | Betreff: ${params.subject}`);
    return;
  }

  const html = buildEmailHtml(params.template, params.data);

  let lastStatus = 0;
  let lastDetail = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method:  "POST",
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

    if (res.ok) return; // Erfolg

    lastStatus = res.status;
    lastDetail = await res.text().catch(() => "");

    // 4xx → sofort aufgeben (keine Wiederholung bei Client-Fehlern)
    if (res.status >= 400 && res.status < 500) break;

    // 5xx → Backoff vor nächstem Versuch
    if (attempt < MAX_ATTEMPTS) {
      await sleep(1000 * Math.pow(2, attempt - 1)); // 1s, 2s
    }
  }

  console.error(
    `[Mailer] Endgültig fehlgeschlagen nach ${MAX_ATTEMPTS} Versuchen` +
    ` | An: ${params.to} | Status: ${lastStatus} | Detail: ${lastDetail.slice(0, 200)}`
  );
}
