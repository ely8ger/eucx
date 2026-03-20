"use client";

import { useState, useEffect } from "react";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const KEY  = "eucx_cookie_consent";

interface Prefs { necessary: true; comfort: boolean; analytics: boolean; marketing: boolean }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex", alignItems: "center", flexShrink: 0,
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        backgroundColor: checked ? BLUE : "#ccc", transition: "background .2s",
        padding: 2,
      }}
    >
      <span style={{
        display: "block", width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff",
        transform: checked ? "translateX(20px)" : "translateX(0)",
        transition: "transform .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

export function CookieBanner() {
  const [visible,    setVisible]    = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ necessary: true, comfort: false, analytics: false, marketing: false });

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  function save(p: Prefs) {
    localStorage.setItem(KEY, JSON.stringify(p));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: "rgba(0,0,0,.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F, padding: "20px 16px",
    }}>
      <div style={{
        backgroundColor: "#fff", maxWidth: 780, width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,.25)",
        display: "flex", flexDirection: "column",
      }}>
        {/* ── Kopf ─────────────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid #e8e8e8", padding: "24px 28px 20px" }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#0d1b2a", margin: "0 0 16px" }}>
            Ihre Cookie-Einstellungen
          </p>
          <p style={{
            fontSize: 13, lineHeight: 1.7, color: "#444",
            margin: 0,
            maxHeight: showDetail ? "none" : 80,
            overflow: showDetail ? "visible" : "hidden",
          }}>
            Neben technisch notwendigen Cookies verwenden wir und unsere hier aufgelisteten Empfänger
            auch Einwilligungs-bedürftige Cookies und ähnliche Technologien. Indem Sie auf die
            Schaltfläche „Alle optionalen Cookies zulassen" klicken, stimmen Sie dem Setzen der
            optionalen Cookies selbst sowie der weiteren Verarbeitung – inklusive Übermittlung –
            Ihrer personenbezogenen Daten zu Zwecken der Verbesserung Ihres Komforts und der
            Berücksichtigung von Präferenzen durch Personalisierung, Analyse des Nutzerverhaltens
            sowie der Durchführung und Überprüfung von Werbemaßnahmen zu. Alternativ können Sie auch
            einzelne Kategorien von Cookies auswählen und deren Verwendung zustimmen, indem Sie auf
            die Schaltfläche „Auswahl speichern" klicken. Ihre Einwilligung umfasst dabei stets die
            Verarbeitung in unsicheren Drittländern. Wir weisen auf ein nicht mit der EU
            vergleichbares Datenschutzniveau bei solchen Ländern hin. Es besteht u.a. das Risiko,
            dass dortige Behörden auf die verarbeiteten Daten zugreifen können und Ihre
            Datenschutzrechte eingeschränkt sind. Weitere Erklärungen zu den verwendeten Cookies und
            ähnlichen Technologien sowie zur Verarbeitung Ihrer personenbezogenen Daten, z.B. zu den
            verarbeiteten Daten, den Speicherdauern und den Datenempfängern, können Sie durch
            Anklicken von „Details zeigen" oder durch Aufrufen unserer Datenschutzerklärung, die am
            Ende der Webseite verlinkt ist, wählen und finden. Je nach den von Ihnen gewählten
            Einstellungen oder wenn Sie die Schaltfläche „Alle optionalen Cookies ablehnen" wählen,
            stehen Ihnen möglicherweise einige Funktionen der Website nicht mehr zur Verfügung. Sie
            können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft in unserer
            Datenschutzerklärung oder durch Anklicken des Links „Cookie-Einstellungen" am Ende der
            Seite widerrufen.
          </p>
        </div>

        {/* ── Toggle-Zeile ──────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
          padding: "16px 28px", borderBottom: "1px solid #e8e8e8", backgroundColor: "#fafafa",
        }}>
          {/* Notwendig — immer an */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "default" }}>
            <Toggle checked={true} onChange={() => {}} />
            <span>Notwendig</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "pointer" }}>
            <Toggle checked={prefs.comfort} onChange={(v) => setPrefs(p => ({ ...p, comfort: v }))} />
            <span>Komfort und Personalisierung</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "pointer" }}>
            <Toggle checked={prefs.analytics} onChange={(v) => setPrefs(p => ({ ...p, analytics: v }))} />
            <span>Analyse</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#333", cursor: "pointer" }}>
            <Toggle checked={prefs.marketing} onChange={(v) => setPrefs(p => ({ ...p, marketing: v }))} />
            <span>Marketing</span>
          </label>

          <button
            onClick={() => setShowDetail(d => !d)}
            style={{ marginLeft: "auto", fontSize: 13, color: BLUE, fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            Details {showDetail ? "verbergen" : "zeigen"} <span>{showDetail ? "↑" : "→"}</span>
          </button>
        </div>

        {/* ── Buttons ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "20px 28px" }}>
          <button
            onClick={() => save({ necessary: true, comfort: true, analytics: true, marketing: true })}
            style={{
              width: "100%", height: 48, backgroundColor: BLUE, color: "#fff",
              border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: F,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLUE)}
          >
            Alle optionalen Cookies zulassen
          </button>
          <button
            onClick={() => save(prefs)}
            style={{
              width: "100%", height: 44, backgroundColor: "#fff", color: BLUE,
              border: `1.5px solid ${BLUE}`, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: F,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0f4fb")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            Auswahl speichern
          </button>
          <button
            onClick={() => save({ necessary: true, comfort: false, analytics: false, marketing: false })}
            style={{
              width: "100%", height: 44, backgroundColor: "#fff", color: "#555",
              border: "1.5px solid #ccc", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: F,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            Alle optionalen Cookies ablehnen
          </button>
        </div>

        {/* ── Fußzeile ─────────────────────────────────────── */}
        <div style={{ padding: "0 28px 20px", display: "flex", gap: 16 }}>
          <a href="/datenschutz" style={{ fontSize: 12, color: "#888", textDecoration: "underline" }}>Datenschutzerklärung</a>
          <a href="/impressum"   style={{ fontSize: 12, color: "#888", textDecoration: "underline" }}>Impressum</a>
        </div>
      </div>
    </div>
  );
}
