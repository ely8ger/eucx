"use client";

import { useState } from "react";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

type Status = "idle" | "sending" | "success" | "error";

const BETREFF_OPTIONS = [
  "Handelsanfrage",
  "KYC / Compliance",
  "Technischer Support",
  "Partnerschaft",
  "Sonstiges",
];

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", fontFamily: F, fontSize: 14, color: "#1a1a1a",
  border: "1px solid #d0d7e4", backgroundColor: "#fff",
  padding: "11px 14px", outline: "none", boxSizing: "border-box",
  transition: "border-color .15s",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#505050", letterSpacing: "0.04em", marginBottom: 6,
};

export function KontaktForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    anrede:      "",
    vorname:     "",
    nachname:    "",
    unternehmen: "",
    email:       "",
    betreff:     "",
    nachricht:   "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.vorname.trim())     e.vorname     = "Pflichtfeld";
    if (!form.nachname.trim())    e.nachname    = "Pflichtfeld";
    if (!form.unternehmen.trim()) e.unternehmen = "Pflichtfeld";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  e.email       = "Gültige E-Mail erforderlich";
    if (!form.betreff)            e.betreff     = "Bitte wählen";
    if (!form.nachricht.trim() || form.nachricht.trim().length < 20)
                                  e.nachricht   = "Mindestens 20 Zeichen";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
        borderLeft: "4px solid #22c55e",
        padding: "28px 24px", fontFamily: F,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#166534", marginBottom: 8 }}>
          Vielen Dank für Ihre Nachricht.
        </div>
        <p style={{ fontSize: 14, color: "#166534", lineHeight: 1.7, margin: 0 }}>
          Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 1–2 Werktagen bei Ihnen.
          Bei dringenden Angelegenheiten erreichen Sie uns direkt unter{" "}
          <a href="mailto:info@eucx.eu" style={{ color: BLUE }}>info@eucx.eu</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate style={{ fontFamily: F }}>
      {status === "error" && (
        <div style={{
          marginBottom: 20, padding: "12px 16px",
          backgroundColor: "#fef2f2", border: "1px solid #fecaca",
          borderLeft: "4px solid #ef4444",
          fontSize: 13, color: "#b91c1c", lineHeight: 1.6,
        }}>
          Ihre Nachricht konnte nicht übermittelt werden. Bitte versuchen Sie es erneut
          oder schreiben Sie direkt an{" "}
          <a href="mailto:info@eucx.eu" style={{ color: "#b91c1c" }}>info@eucx.eu</a>.
        </div>
      )}

      {/* Anrede */}
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL_STYLE}>Anrede (optional)</label>
        <select
          value={form.anrede}
          onChange={e => set("anrede", e.target.value)}
          style={{ ...INPUT_STYLE, appearance: "none", cursor: "pointer" }}>
          <option value="">— Bitte wählen —</option>
          <option value="Herr">Herr</option>
          <option value="Frau">Frau</option>
          <option value="Divers">Divers</option>
        </select>
      </div>

      {/* Vorname / Nachname */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={LABEL_STYLE}>Vorname *</label>
          <input
            type="text" value={form.vorname}
            onChange={e => set("vorname", e.target.value)}
            style={{ ...INPUT_STYLE, borderColor: errors.vorname ? "#ef4444" : "#d0d7e4" }}
            placeholder="Max"
          />
          {errors.vorname && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.vorname}</span>}
        </div>
        <div>
          <label style={LABEL_STYLE}>Nachname *</label>
          <input
            type="text" value={form.nachname}
            onChange={e => set("nachname", e.target.value)}
            style={{ ...INPUT_STYLE, borderColor: errors.nachname ? "#ef4444" : "#d0d7e4" }}
            placeholder="Mustermann"
          />
          {errors.nachname && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.nachname}</span>}
        </div>
      </div>

      {/* Unternehmen */}
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL_STYLE}>Unternehmen *</label>
        <input
          type="text" value={form.unternehmen}
          onChange={e => set("unternehmen", e.target.value)}
          style={{ ...INPUT_STYLE, borderColor: errors.unternehmen ? "#ef4444" : "#d0d7e4" }}
          placeholder="Muster GmbH"
        />
        {errors.unternehmen && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.unternehmen}</span>}
      </div>

      {/* E-Mail */}
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL_STYLE}>E-Mail-Adresse *</label>
        <input
          type="email" value={form.email}
          onChange={e => set("email", e.target.value)}
          style={{ ...INPUT_STYLE, borderColor: errors.email ? "#ef4444" : "#d0d7e4" }}
          placeholder="max.mustermann@muster-gmbh.de"
        />
        {errors.email && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.email}</span>}
      </div>

      {/* Betreff */}
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL_STYLE}>Betreff *</label>
        <select
          value={form.betreff}
          onChange={e => set("betreff", e.target.value)}
          style={{
            ...INPUT_STYLE, appearance: "none", cursor: "pointer",
            borderColor: errors.betreff ? "#ef4444" : "#d0d7e4",
          }}>
          <option value="">— Bitte wählen —</option>
          {BETREFF_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors.betreff && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.betreff}</span>}
      </div>

      {/* Nachricht */}
      <div style={{ marginBottom: 24 }}>
        <label style={LABEL_STYLE}>Nachricht *</label>
        <textarea
          value={form.nachricht}
          onChange={e => set("nachricht", e.target.value)}
          rows={5}
          style={{
            ...INPUT_STYLE, resize: "vertical", minHeight: 120,
            borderColor: errors.nachricht ? "#ef4444" : "#d0d7e4",
          }}
          placeholder="Beschreiben Sie Ihr Anliegen..."
        />
        {errors.nachricht && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.nachricht}</span>}
        <span style={{ fontSize: 11, color: "#aaa", marginTop: 4, display: "block" }}>
          {form.nachricht.trim().length} / mind. 20 Zeichen
        </span>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          width: "100%", height: 48, backgroundColor: BLUE, color: "#fff",
          border: "none", cursor: status === "sending" ? "wait" : "pointer",
          fontSize: 14, fontWeight: 600, fontFamily: F,
          opacity: status === "sending" ? 0.7 : 1,
          transition: "background-color .15s, opacity .15s",
        }}
        onMouseEnter={e => { if (status !== "sending") e.currentTarget.style.backgroundColor = "#0f3070"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = status === "sending" ? BLUE : BLUE; }}>
        {status === "sending" ? "Wird übermittelt …" : "Nachricht senden"}
      </button>

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 12, lineHeight: 1.6 }}>
        * Pflichtfeld. Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage
        verwendet. Weitere Informationen in unserer{" "}
        <a href="/datenschutz" style={{ color: "#888" }}>Datenschutzerklärung</a>.
      </p>
    </form>
  );
}
