"use client";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 860, margin: "0 auto", padding: "0 40px" },
  label:     { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 8, display: "block" },
  h2:        { fontSize: 22, fontWeight: 600, color: "#1a1a1a", margin: "0 0 12px" },
  h3:        { fontSize: 15, fontWeight: 700, color: "#1a1a1a", margin: "24px 0 6px" },
  p:         { fontSize: 15, color: "#505050", lineHeight: 1.75, margin: "0 0 12px" },
  li:        { fontSize: 15, color: "#505050", lineHeight: 1.75, marginBottom: 6 },
};

interface CookieEntry {
  name: string;
  zweck: string;
  typ: "notwendig" | "komfort" | "analyse" | "marketing";
  anbieter: string;
  dauer: string;
  art: "HTTP-Cookie" | "LocalStorage";
}

const COOKIES: CookieEntry[] = [
  {
    name: "eucx_cookie_consent",
    zweck: "Speichert Ihre Cookie-Einwilligungsentscheidungen (welche Kategorien Sie akzeptiert oder abgelehnt haben).",
    typ: "notwendig",
    anbieter: "EUCX GmbH (Erstanbieter)",
    dauer: "1 Jahr",
    art: "LocalStorage",
  },
  {
    name: "access_token",
    zweck: "Authentifizierungs-Token für eingeloggte Nutzer. Ermöglicht den sicheren Zugriff auf Ihr Konto und die Plattform ohne wiederholte Anmeldung innerhalb einer Sitzung.",
    typ: "notwendig",
    anbieter: "EUCX GmbH (Erstanbieter)",
    dauer: "15 Minuten",
    art: "HTTP-Cookie",
  },
  {
    name: "refresh_token",
    zweck: "Ermöglicht die automatische Erneuerung Ihrer Sitzung, ohne dass Sie sich erneut anmelden müssen, solange Sie aktiv sind.",
    typ: "notwendig",
    anbieter: "EUCX GmbH (Erstanbieter)",
    dauer: "30 Tage",
    art: "HTTP-Cookie",
  },
  {
    name: "pending_2fa",
    zweck: "Temporärer Cookie während der Zwei-Faktor-Authentifizierung. Verbindet den Passwortschritt mit dem TOTP-Eingabeschritt.",
    typ: "notwendig",
    anbieter: "EUCX GmbH (Erstanbieter)",
    dauer: "5 Minuten",
    art: "HTTP-Cookie",
  },
];

const TYP_LABEL: Record<CookieEntry["typ"], string> = {
  notwendig:  "Notwendig",
  komfort:    "Komfort & Personalisierung",
  analyse:    "Analyse",
  marketing:  "Marketing",
};

const TYP_COLOR: Record<CookieEntry["typ"], string> = {
  notwendig:  "#154194",
  komfort:    "#0f6e3d",
  analyse:    "#7c3aed",
  marketing:  "#b45309",
};

export default function CookieRichtliniePage() {
  return (
    <div style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" }}>
      <SiteNav />

      <section style={{ backgroundColor: "#0b1e36", padding: "56px 0 48px" }}>
        <div style={S.container}>
          <span style={{ ...S.label, color: "rgba(255,255,255,.35)" }}>Datenschutz</span>
          <h1 style={{ fontSize: 38, fontWeight: 300, color: "#fff", lineHeight: 1.15, margin: "0 0 14px" }}>
            Cookie-Richtlinie
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: 0 }}>
            Informationen gemäß Art. 13 DSGVO zu den auf dieser Website eingesetzten Cookies
          </p>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div style={S.container}>

          <div style={{ marginBottom: 40 }}>
            <span style={S.label}>Allgemeines</span>
            <h2 style={S.h2}>Was sind Cookies?</h2>
            <p style={S.p}>
              Cookies sind kleine Textdateien oder Einträge im lokalen Speicher Ihres Browsers, die beim Besuch einer
              Website auf Ihrem Endgerät gespeichert werden. Sie ermöglichen es, Ihren Browser beim nächsten Besuch
              wiederzuerkennen und bestimmte Einstellungen oder Sitzungsinformationen zu erhalten.
            </p>
            <p style={S.p}>
              Die EUCX GmbH setzt ausschließlich technisch notwendige Cookies ein, die für den sicheren Betrieb der
              Plattform und die Authentifizierung erforderlich sind. Es werden keine Analyse-, Marketing- oder
              Tracking-Cookies von Drittanbietern eingesetzt.
            </p>
            <p style={S.p}>
              Weitere Informationen zur Datenverarbeitung finden Sie in unserer{" "}
              <Link href="/datenschutz" style={{ color: "#154194", fontWeight: 600, textDecoration: "none" }}>
                Datenschutzerklärung
              </Link>.
            </p>
          </div>

          <div style={{ marginBottom: 40 }}>
            <span style={S.label}>Kategorien</span>
            <h2 style={S.h2}>Verwendete Cookie-Kategorien</h2>
            <p style={S.p}>
              Beim Besuch der EUCX-Plattform werden folgende Cookies eingesetzt:
            </p>

            {/* Notwendig Badge Erklärung */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0 24px" }}>
              {(Object.entries(TYP_LABEL) as [CookieEntry["typ"], string][]).map(([typ, label]) => (
                <span key={typ} style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 10px",
                  backgroundColor: TYP_COLOR[typ] + "14",
                  color: TYP_COLOR[typ],
                  border: `1px solid ${TYP_COLOR[typ]}33`,
                }}>
                  {label}
                </span>
              ))}
            </div>

            {/* Cookie-Tabelle */}
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: 13, color: "#333",
                border: "1px solid #e8e8e8",
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f4f7ff" }}>
                    {["Name", "Zweck", "Kategorie", "Anbieter", "Speicherdauer", "Art"].map(h => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left" as const,
                        fontWeight: 600, fontSize: 12, color: "#154194",
                        borderBottom: "2px solid #e0e7ff",
                        letterSpacing: "0.04em", textTransform: "uppercase" as const,
                        whiteSpace: "nowrap" as const,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c, i) => (
                    <tr key={c.name} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbfe" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#1a1a1a", fontWeight: 600, whiteSpace: "nowrap" as const, borderBottom: "1px solid #f0f0f0" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "12px 14px", lineHeight: 1.6, borderBottom: "1px solid #f0f0f0", maxWidth: 280 }}>
                        {c.zweck}
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" as const }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 8px",
                          backgroundColor: TYP_COLOR[c.typ] + "14",
                          color: TYP_COLOR[c.typ],
                        }}>
                          {TYP_LABEL[c.typ]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" as const }}>{c.anbieter}</td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" as const }}>{c.dauer}</td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" as const, fontFamily: "monospace", fontSize: 11 }}>{c.art}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <span style={S.label}>Rechtsgrundlage</span>
            <h2 style={S.h2}>Rechtliche Grundlagen</h2>
            <p style={S.p}>
              Technisch notwendige Cookies werden auf Grundlage von <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes
              Interesse an einem sicheren und funktionsfähigen Plattformbetrieb) sowie <strong>§ 25 Abs. 2 Nr. 2 TDDDG</strong>
              (unbedingt erforderlich für die Erbringung des Dienstes) eingesetzt. Eine Einwilligung ist für diese Cookies
              nicht erforderlich.
            </p>
            <p style={S.p}>
              Da die EUCX GmbH ausschließlich technisch notwendige Cookies einsetzt, besteht für die
              aktuell verwendeten Cookies keine Einwilligungspflicht. Das Cookie-Einwilligungs-Banner dient der
              Transparenz und der Vorbereitung für etwaige zukünftige optionale Dienste.
            </p>
          </div>

          <div style={{ marginBottom: 40 }}>
            <span style={S.label}>Ihre Rechte</span>
            <h2 style={S.h2}>Kontrolle über Cookies</h2>
            <p style={S.p}>
              Sie können Cookies in Ihrem Browser jederzeit löschen oder deren Speicherung verhindern. Die genaue
              Vorgehensweise entnehmen Sie der Hilfe-Funktion Ihres Browsers:
            </p>
            <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
              {[
                "Chrome: chrome://settings/cookies",
                "Firefox: about:preferences#privacy",
                "Safari: Einstellungen → Datenschutz",
                "Edge: edge://settings/privacy",
              ].map(b => <li key={b} style={S.li}>{b}</li>)}
            </ul>
            <p style={S.p}>
              Hinweis: Wenn Sie notwendige Cookies deaktivieren, kann die Plattform möglicherweise nicht
              ordnungsgemäß funktionieren. Insbesondere die Anmeldung und der Zugriff auf Ihr Konto sind
              von den Authentifizierungs-Cookies abhängig.
            </p>
          </div>

          <div style={{ backgroundColor: "#f0f4ff", padding: "24px 28px", borderLeft: "3px solid #154194", marginBottom: 40 }}>
            <h3 style={{ ...S.h3, marginTop: 0 }}>Kontakt bei Datenschutzfragen</h3>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Für Fragen zur Cookie-Nutzung oder zur Datenverarbeitung wenden Sie sich bitte an:{" "}
              <a href="mailto:datenschutz@eucx.eu" style={{ color: "#154194", textDecoration: "none", fontWeight: 600 }}>
                datenschutz@eucx.eu
              </a>.
              Weitere Informationen finden Sie in unserer{" "}
              <Link href="/datenschutz" style={{ color: "#154194", fontWeight: 600, textDecoration: "none" }}>
                Datenschutzerklärung
              </Link>.
            </p>
          </div>

          <p style={{ fontSize: 13, color: "#888", borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
            Stand: Oktober 2026 | Diese Cookie-Richtlinie wird bei Änderungen der eingesetzten Cookies aktualisiert.
          </p>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
