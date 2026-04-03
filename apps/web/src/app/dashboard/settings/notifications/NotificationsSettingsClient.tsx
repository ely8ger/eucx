"use client";

/**
 * /dashboard/settings/notifications
 *
 * Toggle-Schalter für E-Mail-Benachrichtigungen.
 * Gov-Blue EUCX Design, inline CSS.
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EucxHeader } from "@/components/layout/EucxHeader";

interface Prefs {
  emailOnOutbid:       boolean;
  emailOnAuctionEnd:   boolean;
  emailOnAuctionStart: boolean;
}

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
      .then((d) => { if (d) setPrefs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function save(patch: Partial<Prefs>) {
    if (!token || !prefs) return;
    const updated = { ...prefs, ...patch };
    setPrefs(updated);
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
        .ns-root {
          font-family: "IBM Plex Sans", Helvetica Neue, Arial, sans-serif;
          min-height: 100vh;
          background: #f9fafb;
          color: #1a1a1a;
        }
        .ns-hdr {
          background: #154194;
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ns-logo { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: .08em; }
        .ns-logo-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,0.6); }

        .ns-page {
          max-width: 640px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .ns-back {
          display: inline-block;
          margin-bottom: 24px;
          font-size: 12.5px;
          color: #154194;
          cursor: pointer;
          letter-spacing: .02em;
          background: none;
          border: none;
          padding: 0;
        }
        .ns-back:hover { text-decoration: underline; }
        .ns-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        .ns-sub {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 32px;
        }
        .ns-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          margin-bottom: 16px;
        }
        .ns-card-hdr {
          padding: 16px 20px;
          border-bottom: 2px solid #154194;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #154194;
        }
        .ns-row {
          padding: 16px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #f3f4f6;
        }
        .ns-row:last-child { border-bottom: none; }
        .ns-row-text { flex: 1; }
        .ns-row-label {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .ns-row-desc { font-size: 12px; color: #6b7280; line-height: 1.5; }

        /* Toggle-Switch */
        .ns-toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .ns-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        .ns-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #d1d5db;
          transition: background .2s;
          border-radius: 24px;
        }
        .ns-slider::before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          left: 3px;
          top: 3px;
          background: #fff;
          transition: transform .2s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        input:checked + .ns-slider { background: #154194; }
        input:checked + .ns-slider::before { transform: translateX(20px); }
        .ns-toggle:has(input:disabled) .ns-slider { opacity: .5; cursor: not-allowed; }
      `}</style>

      <div className="ns-root">
        <EucxHeader />

        <div className="ns-page">
          <button className="ns-back" onClick={() => window.history.back()}>← Zurück</button>

          <div className="ns-title">Benachrichtigungen</div>
          <div className="ns-sub">Steuern Sie, wann und wie Sie von EUCX benachrichtigt werden.</div>

          {loading && (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>Wird geladen…</div>
          )}

          {!loading && prefs && (
            <>
              {/* E-Mail-Benachrichtigungen */}
              <div className="ns-card">
                <div className="ns-card-hdr">E-Mail</div>

                <div className="ns-row">
                  <div className="ns-row-text">
                    <div className="ns-row-label">Überbietung</div>
                    <div className="ns-row-desc">
                      Erhalten Sie eine E-Mail, wenn ein anderer Bieter Ihr Angebot unterschreitet.
                      Sofortige Benachrichtigung — wichtig für aktive Auktionen.
                    </div>
                  </div>
                  <label className="ns-toggle">
                    <input
                      type="checkbox"
                      checked={prefs.emailOnOutbid}
                      disabled={saving}
                      onChange={(e) => save({ emailOnOutbid: e.target.checked })}
                    />
                    <span className="ns-slider" />
                  </label>
                </div>

                <div className="ns-row">
                  <div className="ns-row-text">
                    <div className="ns-row-label">Auktionsabschluss</div>
                    <div className="ns-row-desc">
                      E-Mail beim Abschluss einer Auktion — Ergebnis, Siegergebot und Link
                      zum Kaufvertrag (PDF).
                    </div>
                  </div>
                  <label className="ns-toggle">
                    <input
                      type="checkbox"
                      checked={prefs.emailOnAuctionEnd}
                      disabled={saving}
                      onChange={(e) => save({ emailOnAuctionEnd: e.target.checked })}
                    />
                    <span className="ns-slider" />
                  </label>
                </div>

                <div className="ns-row">
                  <div className="ns-row-text">
                    <div className="ns-row-label">Auktionsstart</div>
                    <div className="ns-row-desc">
                      E-Mail wenn eine Auktion, für die Sie registriert sind, in die
                      Angebotsphase (PROPOSAL) übergeht.
                    </div>
                  </div>
                  <label className="ns-toggle">
                    <input
                      type="checkbox"
                      checked={prefs.emailOnAuctionStart}
                      disabled={saving}
                      onChange={(e) => save({ emailOnAuctionStart: e.target.checked })}
                    />
                    <span className="ns-slider" />
                  </label>
                </div>
              </div>

              {/* In-App-Infos */}
              <div className="ns-card">
                <div className="ns-card-hdr">In-App (immer aktiv)</div>
                <div className="ns-row">
                  <div className="ns-row-text">
                    <div className="ns-row-label">Echtzeit-Toasts</div>
                    <div className="ns-row-desc">
                      Sofortige Benachrichtigungen im Dashboard: Überboten (rot), Führend (grün),
                      10-Minuten-Warnung (gelb), 5-Minuten-Alarm (rot). Immer aktiv.
                    </div>
                  </div>
                  <label className="ns-toggle">
                    <input type="checkbox" checked disabled />
                    <span className="ns-slider" />
                  </label>
                </div>
                <div className="ns-row">
                  <div className="ns-row-text">
                    <div className="ns-row-label">Vibration (Mobile)</div>
                    <div className="ns-row-desc">
                      Haptisches Feedback auf Smartphones bei Überbietung und Zeitalarmen.
                      Nur auf unterstützten Geräten. Immer aktiv.
                    </div>
                  </div>
                  <label className="ns-toggle">
                    <input type="checkbox" checked disabled />
                    <span className="ns-slider" />
                  </label>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
                In-App-Benachrichtigungen sind stets aktiv und können nicht deaktiviert werden.
                Die Glocke im Header zeigt alle ungelesenen Ereignisse der letzten 7 Tage.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
