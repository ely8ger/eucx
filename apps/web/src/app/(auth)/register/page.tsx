"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const BLUE2  = "#0f3070";
const RED    = "#dc2626";
const TEXT   = "#0d1b2a";
const MUTED  = "#7a8aa0";
const BORDER = "#d4d8e0";
const BG     = "#f7f9fc";

// ── Reusable Field ───────────────────────────────────────────────────────────
interface FieldProps {
  id?:          string;
  label:        string;
  name:         string;
  type?:        string;
  placeholder?: string;
  hint?:        string;
  required?:    boolean;
}

function Field({ id, label, name, type = "text", placeholder, hint, required }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const eid = id ?? name;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor={eid} style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        {label}
        {required && <span style={{ color: RED, marginLeft: 3 }} aria-hidden="true">*</span>}
      </label>
      <input
        id={eid}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 42,
          borderRadius: 0,
          border: `1px solid ${focused ? BLUE : BORDER}`,
          boxShadow: focused ? "0 0 0 3px rgba(21,65,148,.12)" : "none",
          backgroundColor: "#fff",
          padding: "0 12px",
          fontSize: 14,
          color: TEXT,
          fontFamily: F,
          outline: "none",
          transition: "border-color 150ms, box-shadow 150ms",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
      {hint && (
        <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>{hint}</p>
      )}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
function SelectField() {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor="country" style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        Land<span style={{ color: RED, marginLeft: 3 }} aria-hidden="true">*</span>
      </label>
      <select
        name="country"
        id="country"
        required
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 42,
          borderRadius: 0,
          border: `1px solid ${focused ? BLUE : BORDER}`,
          boxShadow: focused ? "0 0 0 3px rgba(21,65,148,.12)" : "none",
          backgroundColor: "#fff",
          padding: "0 12px",
          fontSize: 14,
          color: TEXT,
          fontFamily: F,
          outline: "none",
          transition: "border-color 150ms, box-shadow 150ms",
          width: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
        }}
      >
        <option value="DE">Deutschland</option>
        <option value="AT">Österreich</option>
        <option value="PL">Polen</option>
        <option value="CZ">Tschechien</option>
        <option value="FR">Frankreich</option>
        <option value="NL">Niederlande</option>
        <option value="BE">Belgien</option>
        <option value="IT">Italien</option>
        <option value="ES">Spanien</option>
      </select>
    </div>
  );
}

// ── Section Heading ──────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 8, marginBottom: 16 }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        color: MUTED,
        fontFamily: F,
      }}>
        {children}
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState("");
  const [success, setSuccess] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [role, setRole] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:            fd.get("email"),
          password:         fd.get("password"),
          organizationName: fd.get("organizationName"),
          taxId:            fd.get("taxId"),
          country:          fd.get("country"),
          city:             fd.get("city"),
          role:             fd.get("role"),
        }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) { setError(data.message ?? "Fehler bei der Registrierung."); return; }
      setSuccess(true);
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}>
          <div style={{
            backgroundColor: "rgba(34,197,94,.08)",
            borderBottom: "1px solid rgba(34,197,94,.2)",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT, fontFamily: F, margin: 0 }}>
              Registrierung eingereicht
            </h2>
          </div>
          <div style={{ padding: "28px 32px" }}>
            <p style={{ fontSize: 14, color: "#444", fontFamily: F, lineHeight: 1.6, marginBottom: 24 }}>
              Ihr Antrag auf Zugang zur EUCX-Handelsplattform wurde erfolgreich übermittelt.
              Sie erhalten eine Bestätigungs-E-Mail, sobald Ihr Konto durch unsere Compliance-Abteilung freigegeben wurde.
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{
                height: 38,
                padding: "0 20px",
                borderRadius: 0,
                border: `1px solid ${BORDER}`,
                backgroundColor: "#fff",
                fontSize: 13,
                fontWeight: 500,
                color: TEXT,
                fontFamily: F,
                cursor: "pointer",
              }}
            >
              Zurück zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ── Formular-Karte ─────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}>

        {/* Kopfzeile */}
        <div style={{ backgroundColor: BLUE, padding: "24px 32px" }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: "#fff", fontFamily: F, margin: 0 }}>
            Zugang beantragen
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontFamily: F, marginTop: 4, marginBottom: 0 }}>
            Institutioneller Zugang zur EUCX-Handelsplattform
          </p>
        </div>

        {/* Pflichtfeld-Hinweis */}
        <div style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, padding: "10px 32px" }}>
          <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>
            Mit <span style={{ color: RED, fontWeight: 600 }}>*</span> markierte Felder sind Pflichtfelder.
          </p>
        </div>

        {/* Formular-Inhalt */}
        <div style={{ padding: "28px 32px" }}>
          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Zugangsdaten */}
              <div>
                <SectionHead>Zugangsdaten</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="E-Mail-Adresse"  name="email"    type="email"    required placeholder="name@firma.de" />
                  <Field label="Passwort"         name="password" type="password" required
                    hint="Mindestens 10 Zeichen, Großbuchstabe, Zahl und Sonderzeichen erforderlich." />
                </div>
              </div>

              {/* Unternehmensdaten */}
              <div>
                <SectionHead>Unternehmensdaten</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Unternehmensname" name="organizationName" required placeholder="Muster Handels GmbH" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Steuernummer / VAT-ID" name="taxId" required placeholder="DE123456789" />
                    <Field label="Stadt"                  name="city"  required placeholder="Berlin" />
                  </div>
                  <SelectField />
                </div>
              </div>

              {/* Marktteilnehmer-Rolle */}
              <div>
                <SectionHead>Marktteilnehmer-Rolle</SectionHead>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { value: "SELLER", label: "Verkäufer", desc: "Waren anbieten und verkaufen" },
                    { value: "BUYER",  label: "Käufer",    desc: "Waren suchen und kaufen"       },
                  ].map((r) => (
                    <label
                      key={r.value}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 16,
                        border: `1px solid ${role === r.value ? BLUE : BORDER}`,
                        backgroundColor: role === r.value ? "rgba(21,65,148,.04)" : BG,
                        cursor: "pointer",
                        transition: "border-color 150ms, background-color 150ms",
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        required
                        onChange={() => setRole(r.value)}
                        style={{ marginTop: 2, accentColor: BLUE }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F, margin: 0 }}>{r.label}</p>
                        <p style={{ fontSize: 11, color: MUTED, fontFamily: F, marginTop: 2, marginBottom: 0 }}>{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fehler */}
              {error && (
                <div role="alert" style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  border: "1px solid rgba(220,38,38,.25)",
                  backgroundColor: "#fff5f5",
                  padding: "12px 14px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ color: RED, flexShrink: 0, marginTop: 1 }}>
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="7" cy="10" r="0.7" fill="currentColor"/>
                  </svg>
                  <p style={{ fontSize: 13, color: RED, fontFamily: F, margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Absenden */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  height: 44,
                  borderRadius: 0,
                  border: "none",
                  backgroundColor: loading ? BLUE : btnHover ? BLUE2 : BLUE,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: F,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background-color 150ms",
                  letterSpacing: "0.02em",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      width="16" height="16" fill="none" viewBox="0 0 24 24"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="4"/>
                      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Antrag wird eingereicht...
                  </>
                ) : "Zugang beantragen"}
              </button>
            </div>
          </form>

          {/* Link zur Anmeldung */}
          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <p style={{ fontSize: 13, color: "#555", fontFamily: F, margin: 0 }}>Bereits registriert?</p>
            <a href="/login" style={{
              fontSize: 13,
              fontWeight: 600,
              color: BLUE,
              fontFamily: F,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              Zur Anmeldung
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Trust-Zeichen ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 2, backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "14px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 4px" }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
              <rect x="1" y="9" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5.5 9V6a3.5 3.5 0 017 0v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="9" cy="13.5" r="1.5" fill="currentColor"/>
              <line x1="9" y1="15" x2="9" y2="16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#505050", fontFamily: F, textAlign: "center" }}>TLS 1.3 verschlüsselt</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 4px", borderLeft: "1px solid #eef0f4", borderRight: "1px solid #eef0f4" }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
              <path d="M9 1L17 4.5v7c0 4-3 7.5-8 8.5C4 19 1 15.5 1 11.5v-7L9 1Z" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="9" cy="7" r="0.85" fill="currentColor"/>
              <circle cx="12" cy="9" r="0.85" fill="currentColor"/>
              <circle cx="11" cy="12.5" r="0.85" fill="currentColor"/>
              <circle cx="7" cy="12.5" r="0.85" fill="currentColor"/>
              <circle cx="6" cy="9" r="0.85" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#505050", fontFamily: F, textAlign: "center" }}>DSGVO-konform</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 4px" }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
              <rect x="1" y="16" width="16" height="2" rx="0.5" fill="currentColor" opacity="0.8"/>
              <rect x="1" y="6" width="16" height="2" rx="0.5" fill="currentColor" opacity="0.8"/>
              <rect x="3" y="8" width="2" height="8" fill="currentColor" opacity="0.6"/>
              <rect x="8" y="8" width="2" height="8" fill="currentColor" opacity="0.6"/>
              <rect x="13" y="8" width="2" height="8" fill="currentColor" opacity="0.6"/>
              <path d="M1 6L9 1l8 5H1Z" fill="currentColor" opacity="0.5"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#505050", fontFamily: F, textAlign: "center" }}>BaFin-reguliert</span>
          </div>
        </div>
      </div>

      {/* ── Support-Kontakt ───────────────────────────────────────────────── */}
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0, fontFamily: F }}>
          Fragen zur Registrierung?{" "}
          <a href="mailto:support@eucx.eu" style={{ color: BLUE, textDecoration: "none", fontWeight: 500 }}>support@eucx.eu</a>
        </p>
      </div>

    </div>
  );
}
