"use client";

import { useState, useEffect } from "react";
import { EucxHeader } from "@/components/layout/EucxHeader";

export function PhoneSettingsClient() {
  const [token, setToken]           = useState("");
  const [phone, setPhone]           = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (tkn) load(tkn);
  }, []);

  const load = async (tkn: string) => {
    try {
      const r = await fetch("/api/settings/phone", { headers: { Authorization: `Bearer ${tkn}` } });
      if (!r.ok) return;
      const d = await r.json();
      setPhone(d.phone ?? "");
      setPhoneVerified(d.phoneVerified ?? false);
    } catch { /* ignore */ }
  };

  const save = async () => {
    if (!phone.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/settings/phone", {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: phone.trim() }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg({ type: "err", text: d.error ?? `Fehler ${r.status}` });
      } else {
        setPhoneVerified(true);
        setMsg({ type: "ok", text: "Telefonnummer gespeichert und verifiziert." });
      }
    } catch {
      setMsg({ type: "err", text: "Netzwerkfehler" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');

        .ph-root { font-family: 'IBM Plex Sans', Arial, sans-serif; background: #f0f2f5; min-height: 100vh; color: #0d1b2a; }
        .ph-main { max-width: 560px; margin: 0 auto; padding: 40px 16px; }
        .ph-title { font-size: 26px; font-weight: 300; margin-bottom: 6px; }
        .ph-title strong { font-weight: 700; }
        .ph-sub { font-size: 14px; color: #6b7280; margin-bottom: 32px; line-height: 1.6; }

        .ph-card { background: #fff; border: 1px solid #e5e7eb; padding: 28px 24px; }

        .ph-label { font-size: 13px; font-weight: 600; margin-bottom: 8px; display: block; }
        .ph-input { width: 100%; height: 44px; border: 1px solid #d1d5db; padding: 0 14px; font-size: 15px;
                    font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .ph-input:focus { border-color: #154194; }

        .ph-hint { font-size: 12px; color: #9ca3af; margin-top: 6px; margin-bottom: 20px; }

        .ph-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
                     padding: 8px 14px; margin-bottom: 20px; }
        .ph-status.ok  { background: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
        .ph-status.nok { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }

        .ph-btn { height: 48px; background: #154194; color: #fff; font-size: 14px; font-weight: 700;
                  border: none; cursor: pointer; padding: 0 28px; letter-spacing: 0.04em; transition: background 0.15s; }
        .ph-btn:hover:not(:disabled) { background: #1a52c2; }
        .ph-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ph-msg-ok  { font-size: 13px; color: #15803d; background: #f0fdf4; border: 1px solid #86efac; padding: 12px 16px; margin-top: 16px; }
        .ph-msg-err { font-size: 13px; color: #b91c1c; background: #fef2f2; border: 1px solid #fca5a5; padding: 12px 16px; margin-top: 16px; }

        .ph-back { font-size: 13px; color: #154194; text-decoration: none; display: inline-block; margin-top: 24px; }
        .ph-back:hover { text-decoration: underline; }
      `}</style>

      <div className="ph-root">
        <EucxHeader />
        <div className="ph-main">
          <h1 className="ph-title">Firmen-<strong>Telefonnummer</strong></h1>
          <p className="ph-sub">
            Geben Sie die offizielle Telefonnummer Ihres Unternehmens ein.
            Die Nummer wird für die Handelsberechtigungsprüfung benötigt.
          </p>

          <div className="ph-card">
            <div className={`ph-status ${phoneVerified ? "ok" : "nok"}`}>
              <span>{phoneVerified ? "✓" : "✕"}</span>
              <span>{phoneVerified ? "Telefonnummer verifiziert" : "Noch nicht verifiziert"}</span>
            </div>

            <label className="ph-label">Telefonnummer (mit Landesvorwahl)</label>
            <input
              className="ph-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 30 12345678"
            />
            <div className="ph-hint">Format: +49 30 12345678 oder +49-30-12345678</div>

            <button className="ph-btn" onClick={save} disabled={saving || !phone.trim()}>
              {saving ? "Wird gespeichert …" : "Speichern und verifizieren →"}
            </button>

            {msg && (
              <div className={msg.type === "ok" ? "ph-msg-ok" : "ph-msg-err"}>
                {msg.text}
              </div>
            )}
          </div>

          <a href="/dashboard/buyer" className="ph-back">← Zurück zum Dashboard</a>
        </div>
      </div>
    </>
  );
}
