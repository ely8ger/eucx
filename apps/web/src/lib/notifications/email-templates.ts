/**
 * EUCX E-Mail-Templates
 *
 * Stil: "Förderdatenbank-Look" — viel Weißraum, klare blaue Buttons, kein Schnickschnack.
 * Farben: #154194 (Gov-Blue), #f8f9fa (Hintergrund), #1a1a1a (Text)
 * Font-Stack: -apple-system, Helvetica Neue, Arial (E-Mail-safe)
 *
 * Templates:
 *   outbid               — Überboten-Warnung (Verkäufer)
 *   auction_won          — Sieger-Bestätigung (Verkäufer)
 *   auction_lost         — Auktion verloren (Verkäufer)
 *   auction_closed_buyer — Abschluss-Bestätigung (Käufer)
 *   email_verification   — Bestätigungscode bei Registrierung
 *   password_reset       — Passwort-Reset (auf Wunsch oder nach Sperre)
 *   account_locked       — Hinweis: Account nach 5 Fehlversuchen gesperrt
 *   registration_approved — Admin hat Registrierung freigeschalten
 *   registration_rejected — Admin hat Registrierung abgelehnt
 */

export function buildEmailHtml(template: string, data: Record<string, string>): string {
  const content = TEMPLATES[template]?.(data) ?? fallback(template, data);
  return wrapLayout(content);
}

// ─── Layout-Wrapper ───────────────────────────────────────────────────────────

function wrapLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EUCX</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,Helvetica Neue,Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#154194;padding:24px 40px;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">EUCX</span>
              <span style="font-size:11px;color:rgba(255,255,255,0.65);margin-left:12px;font-weight:300;">European Union Commodity Exchange</span>
            </td>
          </tr>

          <!-- Akzentlinie -->
          <tr><td style="height:3px;background:#e8b400;"></td></tr>

          <!-- Inhalt -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f3f9;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                Diese Nachricht wurde automatisch von der EUCX-Handelsplattform generiert.<br>
                Bitte antworten Sie nicht auf diese E-Mail.
                <br><br>
                <a href="https://eucx.eu/dashboard/settings/notifications" style="color:#154194;text-decoration:none;">
                  Benachrichtigungseinstellungen ändern
                </a>
                &nbsp;·&nbsp;
                <a href="https://eucx.eu" style="color:#154194;text-decoration:none;">eucx.eu</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Buttons & Elemente ────────────────────────────────────────────────────────

function primaryBtn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#154194;color:#ffffff;padding:12px 28px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.04em;margin-top:24px;">${label}</a>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#6b7280;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1a1a1a;">${value}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;margin-top:20px;border-top:2px solid #154194;">${rows}</table>`;
}

function alertBox(text: string, color = "#dc2626"): string {
  return `<div style="background:${color}0d;border-left:4px solid ${color};padding:14px 16px;margin-bottom:20px;">
    <p style="margin:0;font-size:13px;color:${color};font-weight:600;">${text}</p>
  </div>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: Record<string, (data: Record<string, string>) => string> = {

  outbid: (d) => `
    ${alertBox("Sie wurden überboten — Handeln Sie jetzt!")}
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Neues Bestgebot</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Ein anderer Bieter hat Ihr Gebot unterschritten. Um in der Auktion zu bleiben, geben Sie ein neues Gebot ab.
    </p>
    ${infoTable(
      infoRow("Neuer Bestpreis:", d.newBestPrice ?? "—") +
      infoRow("Lot-ID:", (d.lotId ?? "—").slice(0, 12).toUpperCase())
    )}
    ${primaryBtn(`https://eucx.eu/dashboard/seller/auction/${d.lotId ?? ""}`, "Jetzt Gebot abgeben →")}
  `,

  auction_won: (d) => `
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600;">Herzlichen Glückwunsch — Sie haben die Auktion gewonnen!</p>
    </div>
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Zuschlag erteilt</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Ihr Angebot war das niedrigste in dieser Auktion. Der Kaufvertrag wurde automatisch generiert.
    </p>
    ${infoTable(
      infoRow("Ware:", d.commodity ?? "—") +
      infoRow("Siegergebot:", d.finalPrice ?? "—") +
      infoRow("Vertrags-Nr.:", d.contractNumber ?? "—")
    )}
    ${primaryBtn(`https://eucx.eu/dashboard/contracts`, "Kaufvertrag herunterladen →")}
  `,

  auction_lost: (d) => `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Auktion beendet</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Die Auktion wurde abgeschlossen. Ihr Gebot war leider nicht das niedrigste.
    </p>
    ${infoTable(
      infoRow("Ware:", d.commodity ?? "—") +
      infoRow("Siegergebot:", d.finalPrice ?? "—")
    )}
    ${primaryBtn("https://eucx.eu/dashboard/seller/auction/" + (d.lotId ?? ""), "Andere Auktionen ansehen →")}
  `,

  auction_closed_buyer: (d) => `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Auktionsergebnis</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Ihre Ausschreibung wurde erfolgreich abgeschlossen. Der Kaufvertrag wurde generiert und steht zum Download bereit.
    </p>
    ${infoTable(
      infoRow("Ware:", d.commodity ?? "—") +
      infoRow("Siegergebot:", d.finalPrice ?? "—") +
      infoRow("Vertrags-Nr.:", d.contractNumber ?? "—")
    )}
    ${primaryBtn("https://eucx.eu/dashboard/contracts", "Kaufvertrag herunterladen →")}
  `,

  // ─── Auth-Templates ──────────────────────────────────────────────────────────

  email_verification: (d) => `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">E-Mail-Adresse bestätigen</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
      Vielen Dank für Ihre Registrierung bei EUCX. Bitte bestätigen Sie Ihre E-Mail-Adresse mit folgendem Code:
    </p>
    <div style="background:#f1f5fe;border:2px solid #154194;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;">Bestätigungscode</p>
      <p style="margin:0;font-size:40px;font-weight:700;color:#154194;letter-spacing:0.25em;font-family:monospace;">${d.code ?? "——"}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
      Der Code ist <strong>15 Minuten</strong> gültig. Bitte geben Sie ihn auf der Registrierungsseite ein.<br>
      Falls Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.
    </p>
  `,

  password_reset: (d) => `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Passwort zurücksetzen</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      ${d.reason === "BRUTE_FORCE_LOCK"
        ? "Ihr Konto wurde nach zu vielen fehlgeschlagenen Anmeldeversuchen vorübergehend gesperrt. Bitte setzen Sie Ihr Passwort zurück, um den Zugang wiederherzustellen."
        : "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten."}
    </p>
    ${d.reason === "BRUTE_FORCE_LOCK" ? alertBox("Konto gesperrt — zu viele Fehlversuche", "#e67e22") : ""}
    ${primaryBtn(`https://eucx.eu/reset-password?token=${d.token ?? ""}`, "Passwort jetzt zurücksetzen →")}
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
      Dieser Link ist <strong>1 Stunde</strong> gültig. Falls Sie keine Anfrage gestellt haben, ignorieren Sie diese E-Mail.
    </p>
  `,

  account_locked: (d) => `
    ${alertBox("Konto vorübergehend gesperrt", "#e67e22")}
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Zu viele Fehlversuche</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Ihr Konto wurde nach <strong>5 fehlgeschlagenen Anmeldeversuchen</strong> gesperrt. Eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts wurde an diese Adresse gesendet.
    </p>
    ${infoTable(infoRow("Konto:", d.email ?? "—"))}
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
      Falls Sie das nicht waren, empfehlen wir das sofortige Zurücksetzen Ihres Passworts und die Überprüfung Ihrer Zugangsdaten.
    </p>
  `,

  registration_approved: (d) => `
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600;">Ihr Konto wurde freigeschaltet.</p>
    </div>
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Willkommen bei EUCX</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Sehr geehrte Damen und Herren,<br><br>
      Ihre Registrierung bei der European Union Commodity Exchange wurde geprüft und genehmigt.
      Sie können sich ab sofort mit Ihren Zugangsdaten anmelden.
    </p>
    ${infoTable(
      infoRow("Organisation:", d.orgName ?? "—") +
      infoRow("E-Mail:", d.email ?? "—") +
      infoRow("Rolle:", d.role ?? "—")
    )}
    ${primaryBtn("https://eucx.eu/login", "Jetzt anmelden →")}
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
      Nach der Anmeldung können Sie Ihre KYC-Dokumente einreichen, um den Handelszugang zu erhalten.
    </p>
  `,

  registration_rejected: (d) => `
    ${alertBox("Registrierung nicht genehmigt", "#dc2626")}
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Registrierung abgelehnt</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
      Sehr geehrte Damen und Herren,<br><br>
      Ihre Registrierung bei EUCX konnte leider nicht genehmigt werden.
    </p>
    ${d.reason ? infoTable(infoRow("Begründung:", d.reason)) : ""}
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
      Bei Fragen oder für eine erneute Antragstellung wenden Sie sich bitte an
      <a href="mailto:support@eucx.eu" style="color:#154194;">support@eucx.eu</a>.
    </p>
  `,

};

function fallback(template: string, data: Record<string, string>): string {
  return `
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;">Benachrichtigung von EUCX</h2>
    <p style="font-size:14px;color:#4b5563;">${JSON.stringify(data)}</p>
    <p style="font-size:12px;color:#9ca3af;">Template: ${template}</p>
  `;
}
