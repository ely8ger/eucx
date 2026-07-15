"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EucxHeader } from "@/components/layout/EucxHeader";

interface Prefs {
  emailOnOutbid:       boolean;
  emailOnAuctionEnd:   boolean;
  emailOnAuctionStart: boolean;
}

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";

const IN_APP_TYPES = [
  {
    code: "OUTBID",
    label: "Überboten",
    desc:  "Erscheint sofort, wenn ein Mitbieter Ihr aktuelles Gebot unterbietet. Rot hervorgehoben.",
    moment: "Sekunden nach Eingabe eines neuen Gebots",
  },
  {
    code: "LEADING",
    label: "Führendes Gebot",
    desc:  "Bestätigung: Sie halten aktuell das niedrigste Angebot und führen die Auktion.",
    moment: "Nach erfolgreicher Gebotsannahme",
  },
  {
    code: "URGENCY_10M",
    label: "10-Minuten-Warnung",
    desc:  "Erinnerung, wenn die Angebotsphase noch 10 Minuten läuft und Sie registriert sind.",
    moment: "Automatisch T−10 min vor Angebotsschluss",
  },
  {
    code: "URGENCY_5M",
    label: "5-Minuten-Alarm",
    desc:  "Kritische Warnung (rot) bei 5 Minuten Restlaufzeit. Mit Vibration auf Mobilgeräten.",
    moment: "Automatisch T−5 min vor Angebotsschluss",
  },
  {
    code: "WON",
    label: "Auktion gewonnen",
    desc:  "Bestätigung des Zuschlags, Vertragsnummer und Link zum unterzeichneten PDF-Dokument.",
    moment: "Sofort nach Auktionsabschluss",
  },
  {
    code: "LOST",
    label: "Nicht erhalten",
    desc:  "Benachrichtigung, dass ein anderer Bieter den Zuschlag erhalten hat.",
    moment: "Sofort nach Auktionsabschluss",
  },
  {
    code: "DEPOSIT_WARN",
    label: "Kaution niedrig",
    desc:  "Warnung, wenn Ihre Sicherheitsleistung unter den Mindestbetrag für laufende Positionen sinkt.",
    moment: "Wenn Kontostand unter Schwellwert fällt",
  },
];

export function NotificationsSettingsClient() {
  const [token,   setToken]   = useState("");
  const [prefs,   setPrefs]   = useState<Prefs | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setToken(localStorage.getItem("accessToken") ?? ""); }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/notifications/preferences", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d: Prefs | null) => { if (d) setPrefs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function save(patch: Partial<Prefs>) {
    if (!token || !prefs) return;
    setPrefs({ ...prefs, ...patch });
    setSaving(true);
    try {
      const r = await fetch("/api/notifications/preferences", {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(patch),
      });
      if (r.ok) {
        toast.success("Gespeichert", {
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
      } else {
        toast.error("Speichern fehlgeschlagen");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .nn-root { font-family:${F}; min-height:100vh; background:#f7f9fc; color:#0d1b2a; }
        .nn-page { max-width:760px; margin:0 auto; padding:36px 24px 80px; }
        .nn-title  { font-size:22px; font-weight:700; color:#111827; margin:0 0 4px; }
        .nn-sub    { font-size:13px; color:#6b7280; margin:0 0 32px; }

        /* Info-Banner */
        .nn-info { background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid ${BLUE}; padding:14px 18px; margin-bottom:28px; font-size:12.5px; color:#1e3a8a; line-height:1.65; }

        /* Sektionkopf */
        .nn-sec-head { font-size:10.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:${BLUE}; padding:12px 20px 10px; border-bottom:2px solid ${BLUE}; background:#fff; border:1px solid #e5e7eb; border-left:3px solid ${BLUE}; margin-bottom:1px; }
        .nn-card     { background:#fff; border:1px solid #e5e7eb; margin-bottom:24px; overflow:hidden; }

        /* Toggle-Zeile */
        .nn-row { padding:18px 20px; display:flex; align-items:flex-start; justify-content:space-between; gap:20px; border-bottom:1px solid #f3f4f6; }
        .nn-row:last-child { border-bottom:none; }
        .nn-row-label { font-size:14px; font-weight:600; color:#111827; margin-bottom:4px; }
        .nn-row-desc  { font-size:12px; color:#6b7280; line-height:1.55; }
        .nn-row-when  { font-size:11px; color:#9ca3af; margin-top:5px; display:flex; align-items:center; gap:4px; }

        /* Toggle */
        .nn-toggle { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
        .nn-toggle input { opacity:0; width:0; height:0; position:absolute; }
        .nn-slider { position:absolute; cursor:pointer; inset:0; background:#d1d5db; transition:background .2s; border-radius:24px; }
        .nn-slider::before { content:""; position:absolute; width:18px; height:18px; left:3px; top:3px; background:#fff; transition:transform .2s; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        input:checked + .nn-slider { background:${BLUE}; }
        input:checked + .nn-slider::before { transform:translateX(20px); }
        .nn-toggle:has(input:disabled) .nn-slider { opacity:.45; cursor:not-allowed; }

        /* In-App Tabelle */
        .nn-app-table { width:100%; border-collapse:collapse; font-size:12.5px; }
        .nn-app-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#9ca3af; border-bottom:1px solid #e5e7eb; background:#fafafa; }
        .nn-app-table td { padding:12px 14px; border-bottom:1px solid #f3f4f6; vertical-align:top; color:#374151; }
        .nn-app-table tr:last-child td { border-bottom:none; }
        .nn-app-table tr:hover td { background:#fafafa; }
        .nn-code { font-family:"IBM Plex Mono",monospace; font-size:10.5px; color:${BLUE}; background:#eff6ff; padding:2px 6px; border:1px solid #bfdbfe; white-space:nowrap; }
        .nn-active-dot { width:7px; height:7px; border-radius:50%; background:#16a34a; display:inline-block; margin-right:5px; }

        /* Hinweis-Box */
        .nn-hint { background:#f9fafb; border:1px solid #e5e7eb; padding:16px 20px; margin-top:24px; display:flex; gap:12px; }
        .nn-hint-text { font-size:12px; color:#6b7280; line-height:1.7; }
      `}</style>

      <div className="nn-root">
        <EucxHeader />
        <div className="nn-page">

          <h1 className="nn-title">Benachrichtigungen</h1>
          <p className="nn-sub">Steuern Sie, wann und auf welchem Kanal Sie von EUCX informiert werden.</p>

          {/* Info-Banner */}
          <div className="nn-info">
            Echtzeit-Benachrichtigungen (In-App) sind systemweit immer aktiv und können nicht deaktiviert werden —
            sie sind für einen sicheren Handelsbetrieb erforderlich.
            E-Mail-Benachrichtigungen können Sie nach Ihren Präferenzen konfigurieren.
          </div>

          {loading && <div style={{ color: "#9ca3af", fontSize: 13 }}>Wird geladen…</div>}

          {!loading && prefs && (
            <>
              {/* ── E-Mail ────────────────────────────────────────────── */}
              <div className="nn-card">
                <div style={{ padding: "14px 20px", borderBottom: `2px solid ${BLUE}`, background: "#fff" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase" as const, color: BLUE }}>
                    E-Mail-Benachrichtigungen
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    Zustellung an Ihre hinterlegte E-Mail-Adresse — auch wenn Sie nicht eingeloggt sind
                  </div>
                </div>

                {/* Überbietung */}
                <div className="nn-row">
                  <div style={{ flex: 1 }}>
                    <div className="nn-row-label">Überbietung</div>
                    <div className="nn-row-desc">
                      E-Mail, wenn ein Mitbieter Ihr aktuelles Angebot unterschreitet.
                      Empfohlen für aktive Handelssitzungen, bei denen Sie nicht dauerhaft im Browser sind.
                    </div>
                    <div className="nn-row-when">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#d1d5db" strokeWidth="1.2"/><path d="M5 3v2.5l1.5 1" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Auslöser: Neues Gebot eines anderen Teilnehmers
                    </div>
                  </div>
                  <label className="nn-toggle" style={{ marginTop: 2 }}>
                    <input type="checkbox" checked={prefs.emailOnOutbid} disabled={saving}
                      onChange={(e) => save({ emailOnOutbid: e.target.checked })} />
                    <span className="nn-slider" />
                  </label>
                </div>

                {/* Auktionsabschluss */}
                <div className="nn-row">
                  <div style={{ flex: 1 }}>
                    <div className="nn-row-label">Auktionsabschluss</div>
                    <div className="nn-row-desc">
                      E-Mail nach Ende der Angebotsphase mit Ergebnis (Siegerpreis, Vertragsnummer)
                      und direktem Link zum unterzeichneten Kaufvertrag als PDF.
                    </div>
                    <div className="nn-row-when">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#d1d5db" strokeWidth="1.2"/><path d="M5 3v2.5l1.5 1" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Auslöser: Statuswechsel der Auktion auf CLOSED
                    </div>
                  </div>
                  <label className="nn-toggle" style={{ marginTop: 2 }}>
                    <input type="checkbox" checked={prefs.emailOnAuctionEnd} disabled={saving}
                      onChange={(e) => save({ emailOnAuctionEnd: e.target.checked })} />
                    <span className="nn-slider" />
                  </label>
                </div>

                {/* Auktionsstart */}
                <div className="nn-row">
                  <div style={{ flex: 1 }}>
                    <div className="nn-row-label">Angebotsphase geöffnet</div>
                    <div className="nn-row-desc">
                      E-Mail, wenn eine Handelssitzung, für die Sie registriert sind,
                      in die Angebotsphase übergeht — mit Startpreis und verbleibender Zeit.
                    </div>
                    <div className="nn-row-when">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#d1d5db" strokeWidth="1.2"/><path d="M5 3v2.5l1.5 1" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Auslöser: Statuswechsel auf PROPOSAL (Angebotsphase)
                    </div>
                  </div>
                  <label className="nn-toggle" style={{ marginTop: 2 }}>
                    <input type="checkbox" checked={prefs.emailOnAuctionStart} disabled={saving}
                      onChange={(e) => save({ emailOnAuctionStart: e.target.checked })} />
                    <span className="nn-slider" />
                  </label>
                </div>
              </div>

              {/* ── In-App (immer aktiv) ──────────────────────────── */}
              <div className="nn-card">
                <div style={{ padding: "14px 20px", borderBottom: `2px solid #059669`, background: "#fff" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase" as const, color: "#059669", display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="nn-active-dot" />
                    In-App-Benachrichtigungen — Immer aktiv
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    Echtzeit-Toasts + Glocken-Symbol im Header · Keine Konfiguration erforderlich
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="nn-app-table">
                    <thead>
                      <tr>
                        <th>Ereignistyp</th>
                        <th>Beschreibung</th>
                        <th>Auslösezeitpunkt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {IN_APP_TYPES.map((t) => (
                        <tr key={t.code}>
                          <td>
                            <span className="nn-code">{t.code}</span>
                            <div style={{ marginTop: 4, fontSize: 11.5, fontWeight: 600, color: "#111827" }}>{t.label}</div>
                          </td>
                          <td style={{ maxWidth: 320 }}>{t.desc}</td>
                          <td style={{ fontSize: 11.5, color: "#9ca3af", whiteSpace: "nowrap" }}>{t.moment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hinweis */}
              <div className="nn-hint">
                <div style={{ fontSize: 18, flexShrink: 0 }}>ℹ</div>
                <div className="nn-hint-text">
                  In-App-Benachrichtigungen werden in der Glocke oben rechts gesammelt und sind
                  7 Tage lang abrufbar. Für dauerhaften Zugriff auf Handelsereignisse
                  empfehlen wir die <a href="/dashboard/settings/api-keys" style={{ color: BLUE, fontWeight: 600 }}>API-Schlüssel-Integration</a> —
                  so können Sie alle Ereignisse in Ihr eigenes System überführen.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
