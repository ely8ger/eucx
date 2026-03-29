"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const BLUE2  = "#0f3070";
const RED    = "#dc2626";
const GREEN  = "#16a34a";
const TEXT   = "#0d1b2a";
const MUTED  = "#7a8aa0";
const BORDER = "#d4d8e0";
const BG     = "#f7f9fc";

// Corporate-only domains - free providers are rejected
const FREE_DOMAINS = [
  "gmail.com","yahoo.com","yahoo.de","hotmail.com","hotmail.de",
  "outlook.com","outlook.de","gmx.de","gmx.net","gmx.at","gmx.ch",
  "web.de","t-online.de","icloud.com","me.com","mac.com",
  "protonmail.com","proton.me","mailbox.org","posteo.de",
];

const EU_COUNTRIES: { code: string; name: string }[] = [
  { code: "DE", name: "Deutschland" },
  { code: "AT", name: "Österreich" },
  { code: "BE", name: "Belgien" },
  { code: "BG", name: "Bulgarien" },
  { code: "CY", name: "Zypern" },
  { code: "CZ", name: "Tschechien" },
  { code: "DK", name: "Dänemark" },
  { code: "EE", name: "Estland" },
  { code: "ES", name: "Spanien" },
  { code: "FI", name: "Finnland" },
  { code: "FR", name: "Frankreich" },
  { code: "GR", name: "Griechenland" },
  { code: "HR", name: "Kroatien" },
  { code: "HU", name: "Ungarn" },
  { code: "IE", name: "Irland" },
  { code: "IT", name: "Italien" },
  { code: "LT", name: "Litauen" },
  { code: "LU", name: "Luxemburg" },
  { code: "LV", name: "Lettland" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Niederlande" },
  { code: "PL", name: "Polen" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Rumanien" },
  { code: "SE", name: "Schweden" },
  { code: "SI", name: "Slowenien" },
  { code: "SK", name: "Slowakei" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type VatStatus = "idle" | "loading" | "valid" | "invalid";
type HrbStatus = "idle" | "loading" | "found" | "notfound";

interface CompanyData {
  name?:       string | null;
  street?:     string | null;
  postalCode?: string | null;
  city?:       string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parst VIES-Adressstring z.B. "MUSTERSTR. 42\n10115 BERLIN" in Felder */
function parseViesAddress(raw: string): { street?: string; postalCode?: string; city?: string } {
  const lines = raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  if (lines.length < 1) return {};
  const firstLine = lines[0];
  if (!firstLine) return {};
  const street = toTitleCase(firstLine);
  if (lines.length >= 2) {
    const last  = lines[lines.length - 1] ?? "";
    const match = last.match(/^(\d{4,5})\s+(.+)$/);
    if (match?.[1] && match[2]) return { street, postalCode: match[1], city: toTitleCase(match[2]) };
    return { street, city: toTitleCase(last) };
  }
  return { street };
}

function isFreeEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return FREE_DOMAINS.includes(domain);
}

// ── Section Heading ───────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 8, marginBottom: 16 }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase" as const, color: MUTED, fontFamily: F,
      }}>
        {children}
      </span>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
interface FieldProps {
  id?:         string;
  label:       string;
  name:        string;
  type?:       string;
  placeholder?: string;
  hint?:       string;
  required?:   boolean;
  error?:      string;
  success?:    string;
  value?:      string;
  onChange?:   (v: string) => void;
  onBlur?:     () => void;
  readOnly?:   boolean;
  maxLength?:  number;
}

function Field({
  id, label, name, type = "text", placeholder, hint, required,
  error, success, value, onChange, onBlur, readOnly, maxLength,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const eid = id ?? name;

  const borderColor = error ? RED : success ? GREEN : focused ? BLUE : BORDER;
  const shadow = error   ? "0 0 0 3px rgba(220,38,38,.1)"
    : success  ? "0 0 0 3px rgba(22,163,74,.1)"
    : focused  ? "0 0 0 3px rgba(21,65,148,.12)"
    : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor={eid} style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        {label}
        {required && <span style={{ color: RED, marginLeft: 3 }} aria-hidden="true">*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={eid} name={name} type={type} placeholder={placeholder}
          required={required} readOnly={readOnly} value={value}
          maxLength={maxLength}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            height: 42, borderRadius: 0,
            border: `1px solid ${borderColor}`,
            boxShadow: shadow,
            backgroundColor: readOnly ? BG : "#fff",
            padding: "0 12px",
            paddingRight: (success || error) ? 38 : 12,
            fontSize: 14, color: TEXT, fontFamily: F,
            outline: "none",
            transition: "border-color 150ms, box-shadow 150ms",
            width: "100%", boxSizing: "border-box",
          }}
        />
        {success && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ position: "absolute", right: 11, top: 13, color: GREEN, pointerEvents: "none" }}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {error && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ position: "absolute", right: 11, top: 13, color: RED, pointerEvents: "none" }}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <line x1="8" y1="5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.8" fill="currentColor"/>
          </svg>
        )}
      </div>
      {error   && <p style={{ fontSize: 11, color: RED,   fontFamily: F, margin: 0 }}>{error}</p>}
      {!error && success && <p style={{ fontSize: 11, color: GREEN, fontFamily: F, margin: 0 }}>{success}</p>}
      {!error && !success && hint && <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>{hint}</p>}
    </div>
  );
}

// ── Country Select ────────────────────────────────────────────────────────────
function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const { t } = useI18n();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor="country" style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        {t("register_country")}<span style={{ color: RED, marginLeft: 3 }} aria-hidden="true">*</span>
      </label>
      <select
        id="country" name="country" required value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 42, borderRadius: 0,
          border: `1px solid ${focused ? BLUE : BORDER}`,
          boxShadow: focused ? "0 0 0 3px rgba(21,65,148,.12)" : "none",
          backgroundColor: "#fff", padding: "0 12px",
          fontSize: 14, color: TEXT, fontFamily: F,
          outline: "none", transition: "border-color 150ms, box-shadow 150ms",
          width: "100%", boxSizing: "border-box", cursor: "pointer",
        }}
      >
        {EU_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

// ── VAT Field with VIES Validation ────────────────────────────────────────────
function VatField({
  country, onValidated,
}: {
  country:     string;
  onValidated: (data: CompanyData | null) => void;
}) {
  const [value,    setValue]    = useState("");
  const [status,   setStatus]   = useState<VatStatus>("idle");
  const [verified, setVerified] = useState<string | null>(null);
  const { t } = useI18n();

  async function validate() {
    const val = value.trim();
    if (!val || !country) return;
    setStatus("loading");
    try {
      const res  = await fetch(`/api/validate-vat?country=${country}&vat=${encodeURIComponent(val)}`);
      const data = await res.json() as { valid: boolean; name?: string | null; address?: string | null };
      if (data.valid) {
        setStatus("valid");
        setVerified(data.name ?? null);
        const addrParsed = data.address ? parseViesAddress(data.address) : {};
        onValidated({ name: data.name ?? null, ...addrParsed });
      } else {
        setStatus("invalid");
        setVerified(null);
        onValidated(null);
      }
    } catch {
      setStatus("idle");
    }
  }

  const borderColor = status === "valid" ? GREEN : status === "invalid" ? RED : BORDER;
  const shadow = status === "valid"   ? "0 0 0 3px rgba(22,163,74,.1)"
    : status === "invalid" ? "0 0 0 3px rgba(220,38,38,.1)"
    : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor="taxId" style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        {t("register_vat")}<span style={{ color: RED, marginLeft: 3 }} aria-hidden="true">*</span>
      </label>
      <div style={{ position: "relative" }}>
        <input
          id="taxId" name="taxId" type="text"
          placeholder={`${country}123456789`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            if (status !== "idle") { setStatus("idle"); setVerified(null); }
          }}
          onBlur={() => void validate()}
          required
          style={{
            height: 42, borderRadius: 0,
            border: `1px solid ${borderColor}`,
            boxShadow: shadow,
            backgroundColor: "#fff", padding: "0 12px", paddingRight: 38,
            fontSize: 14, color: TEXT, fontFamily: F,
            outline: "none", width: "100%", boxSizing: "border-box",
            transition: "border-color 150ms, box-shadow 150ms",
            textTransform: "uppercase" as const,
          }}
        />

        {/* Spinner */}
        {status === "loading" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ position: "absolute", right: 11, top: 13, animation: "spin 1s linear infinite", color: BLUE, pointerEvents: "none" }}>
            <circle cx="12" cy="12" r="10" stroke="rgba(21,65,148,.25)" strokeWidth="3"/>
            <path fill={BLUE} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}

        {/* Valid */}
        {status === "valid" && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ position: "absolute", right: 11, top: 13, color: GREEN, pointerEvents: "none" }}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}

        {/* Invalid */}
        {status === "invalid" && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ position: "absolute", right: 11, top: 13, color: RED, pointerEvents: "none" }}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <line x1="8" y1="5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.8" fill="currentColor"/>
          </svg>
        )}
      </div>

      {status === "valid" && verified && (
        <p style={{ fontSize: 11, color: GREEN, fontFamily: F, margin: 0 }}>
          {t("register_vies_valid")} — {verified}
        </p>
      )}
      {status === "valid" && !verified && (
        <p style={{ fontSize: 11, color: GREEN, fontFamily: F, margin: 0 }}>
          {t("register_vies_valid")}
        </p>
      )}
      {status === "invalid" && (
        <p style={{ fontSize: 11, color: RED, fontFamily: F, margin: 0 }}>
          {t("register_vies_invalid")}
        </p>
      )}
      {status === "idle" && (
        <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>
          {country}123456789 — {t("register_vies_hint")}
        </p>
      )}
    </div>
  );
}

// ── HRB Field with Handelsregister Lookup ─────────────────────────────────────
function HrbField({ onFound }: { onFound: (data: CompanyData) => void }) {
  const [value,  setValue]  = useState("");
  const [status, setStatus] = useState<HrbStatus>("idle");

  async function lookup() {
    const val = value.trim();
    if (!val) return;
    setStatus("loading");
    try {
      const res  = await fetch(`/api/lookup-hrb?hrb=${encodeURIComponent(val)}`);
      const data = await res.json() as { found: boolean } & CompanyData;
      if (data.found) {
        setStatus("found");
        onFound({ name: data.name, street: data.street, postalCode: data.postalCode, city: data.city });
      } else {
        setStatus("notfound");
      }
    } catch {
      setStatus("notfound");
    }
  }

  const borderColor = status === "found" ? GREEN : status === "notfound" ? RED : BORDER;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor="hrb" style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        HRB-Nummer
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="hrb" name="hrb" type="text"
          placeholder="HRB 123456 Frankfurt"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (status !== "idle") setStatus("idle"); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void lookup(); } }}
          style={{
            flex: 1, height: 42, borderRadius: 0,
            border: `1px solid ${borderColor}`,
            backgroundColor: "#fff", padding: "0 12px",
            fontSize: 14, color: TEXT, fontFamily: F,
            outline: "none", boxSizing: "border-box",
            transition: "border-color 150ms",
          }}
        />
        <button
          type="button"
          onClick={() => void lookup()}
          disabled={status === "loading" || !value.trim()}
          style={{
            height: 42, padding: "0 16px", borderRadius: 0, flexShrink: 0,
            border: `1px solid ${BLUE}`,
            backgroundColor: status === "loading" || !value.trim() ? "#93a3be" : BLUE,
            color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: F,
            cursor: status === "loading" ? "wait" : !value.trim() ? "default" : "pointer",
            transition: "background-color 150ms",
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "Wird geprüft…" : "Prüfen"}
        </button>
      </div>
      {status === "found"    && <p style={{ fontSize: 11, color: GREEN, fontFamily: F, margin: 0 }}>Unternehmen gefunden — Daten wurden übernommen.</p>}
      {status === "notfound" && <p style={{ fontSize: 11, color: RED,   fontFamily: F, margin: 0 }}>Kein Eintrag gefunden. Bitte manuell ausfüllen.</p>}
      {status === "idle"     && <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>Optional — automatische Datenübernahme aus dem Handelsregister.</p>}
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function ConsentBox({
  name, checked, onChange, error, children,
}: {
  name: string; checked: boolean; onChange: (v: boolean) => void;
  error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox" name={name} checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ marginTop: 2, accentColor: BLUE, width: 15, height: 15, flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: "#444", fontFamily: F, lineHeight: 1.5 }}>
          {children}
        </span>
      </label>
      {error && <p style={{ fontSize: 11, color: RED, fontFamily: F, margin: "0 0 0 25px" }}>{error}</p>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { t }  = useI18n();

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [step,     setStep]     = useState<"form" | "verify" | "done">("form");
  const [userId,   setUserId]   = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [verifyCode,      setVerifyCode]      = useState("");
  const [verifyLoading,   setVerifyLoading]   = useState(false);
  const [verifyError,     setVerifyError]     = useState("");
  const [resendCooldown,  setResendCooldown]  = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [role,     setRole]     = useState("");

  // Country state - needed for VAT field
  const [country, setCountry] = useState("DE");

  // Company data auto-fill from VIES / HRB
  const [orgName,    setOrgName]    = useState("");
  const [street,     setStreet]     = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city,       setCity]       = useState("");

  function applyCompanyData(data: CompanyData) {
    if (data.name       && !orgName)    setOrgName(data.name);
    if (data.street     && !street)     setStreet(data.street);
    if (data.postalCode && !postalCode) setPostalCode(data.postalCode);
    if (data.city       && !city)       setCity(data.city);
  }

  // Field-level errors
  const [emailError, setEmailError] = useState("");
  const [pwError,    setPwError]    = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Consent checkboxes
  const [consentDsgvo, setConsentDsgvo] = useState(false);
  const [consentAgb,   setConsentAgb]   = useState(false);
  const [consentErrors, setConsentErrors] = useState<{ dsgvo?: string; agb?: string }>({});

  function validateEmail(v: string) {
    if (!v) { setEmailError(""); return; }
    if (isFreeEmail(v)) {
      setEmailError(t("register_email_err"));
    } else {
      setEmailError("");
    }
  }

  function validatePassword(v: string) {
    if (!v) { setPwError(""); return; }
    const ok = v.length >= 10 && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
    setPwError(ok ? "" : t("register_pw_err"));
  }

  function validatePhone(v: string) {
    if (!v) { setPhoneError(""); return; }
    const digits = v.replace(/\D/g, "");
    setPhoneError(digits.length >= 7 ? "" : t("register_phone_err"));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validate consents
    const ce: { dsgvo?: string; agb?: string } = {};
    if (!consentDsgvo) ce.dsgvo = t("register_consent_err");
    if (!consentAgb)   ce.agb   = t("register_consent_err");
    if (Object.keys(ce).length > 0) { setConsentErrors(ce); return; }
    setConsentErrors({});

    if (emailError || pwError || phoneError) return;

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
          street:           fd.get("street"),
          postalCode:       fd.get("postalCode"),
          city:             fd.get("city"),
          country:          fd.get("country"),
          taxId:            fd.get("taxId"),
          hrb:              fd.get("hrb"),
          phone:            fd.get("phone"),
          role:             fd.get("role"),
          consentDsgvo:     true,
          consentAgb:       true,
        }),
      });
      const data = await res.json() as { data?: { userId?: string; message?: string }; message?: string };
      if (!res.ok) { setError((data as { message?: string }).message ?? t("register_err_conn")); return; }
      const uid = data.data?.userId ?? "";
      const em  = (fd.get("email") as string) ?? "";
      setUserId(uid);
      setRegEmail(em);
      setStep("verify");
    } catch {
      setError(t("register_err_conn"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setVerifyError("");
    if (verifyCode.length !== 6) { setVerifyError("Bitte den 6-stelligen Code eingeben."); return; }
    setVerifyLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId, code: verifyCode }),
      });
      const data = await res.json() as { code?: string; message?: string };
      if (!res.ok) { setVerifyError(data.message ?? "Ungültiger Code."); return; }
      setStep("done");
    } catch {
      setVerifyError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResend() {
    setResendCooldown(true);
    await fetch("/api/auth/verify-email", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId }),
    });
    setTimeout(() => setResendCooldown(false), 60_000);
  }

  // ── Schritt 2: E-Mail-Bestätigung ────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}>
          <div style={{ backgroundColor: BLUE, padding: "20px 32px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: F, margin: 0 }}>
              E-Mail-Adresse bestätigen
            </h2>
          </div>
          <div style={{ height: 3, backgroundColor: "#e8b400" }} />
          <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontSize: 14, color: "#444", fontFamily: F, lineHeight: 1.6, margin: 0 }}>
              Wir haben einen 6-stelligen Bestätigungscode an <strong>{regEmail}</strong> gesendet.
              Bitte geben Sie ihn hier ein. Der Code ist 15 Minuten gültig.
            </p>

            {/* Code-Eingabe */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
                Bestätigungscode <span style={{ color: RED }}>*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{
                  height: 52, borderRadius: 0, textAlign: "center",
                  border: `2px solid ${verifyError ? RED : BORDER}`,
                  fontSize: 28, fontWeight: 700, letterSpacing: "0.3em",
                  color: TEXT, fontFamily: "'Courier New', monospace",
                  outline: "none", width: "100%", boxSizing: "border-box",
                }}
              />
              {verifyError && (
                <p style={{ fontSize: 12, color: RED, fontFamily: F, margin: 0 }}>{verifyError}</p>
              )}
            </div>

            {/* Bestätigen-Button */}
            <button
              onClick={() => void handleVerify()}
              disabled={verifyLoading || verifyCode.length !== 6}
              style={{
                height: 44, borderRadius: 0, border: "none",
                backgroundColor: verifyLoading || verifyCode.length !== 6 ? "#93a3be" : BLUE,
                color: "#fff", fontSize: 14, fontWeight: 600,
                fontFamily: F, cursor: verifyLoading ? "wait" : "pointer",
                transition: "background-color 150ms",
              }}
            >
              {verifyLoading ? "Wird geprüft…" : "E-Mail bestätigen"}
            </button>

            {/* Neuen Code anfordern */}
            <p style={{ fontSize: 12, color: MUTED, fontFamily: F, margin: 0, textAlign: "center" }}>
              Keinen Code erhalten?{" "}
              <button
                onClick={() => void handleResend()}
                disabled={resendCooldown}
                style={{
                  background: "none", border: "none", padding: 0,
                  color: resendCooldown ? MUTED : BLUE,
                  fontSize: 12, fontFamily: F, cursor: resendCooldown ? "default" : "pointer",
                  textDecoration: "underline",
                }}
              >
                {resendCooldown ? "Code wurde erneut gesendet" : "Neuen Code senden"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Schritt 3: Abgeschlossen ──────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}>
          <div style={{
            backgroundColor: "rgba(34,197,94,.08)",
            borderBottom: "1px solid rgba(34,197,94,.2)",
            padding: "20px 32px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT, fontFamily: F, margin: 0 }}>
              {t("register_success_title")}
            </h2>
          </div>
          <div style={{ padding: "28px 32px" }}>
            <p style={{ fontSize: 14, color: "#444", fontFamily: F, lineHeight: 1.6, marginBottom: 24 }}>
              Ihre E-Mail-Adresse wurde bestätigt. Ihr Konto wird nun von unserem Team geprüft.
              Sie erhalten eine E-Mail sobald Ihr Zugang freigeschaltet wurde.
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{
                height: 38, padding: "0 20px", borderRadius: 0,
                border: `1px solid ${BORDER}`, backgroundColor: "#fff",
                fontSize: 13, fontWeight: 500, color: TEXT, fontFamily: F, cursor: "pointer",
              }}
            >
              {t("register_back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}>

        {/* Kopfzeile */}
        <div style={{ backgroundColor: BLUE, padding: "24px 32px" }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: "#fff", fontFamily: F, margin: 0 }}>
            {t("register_title")}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontFamily: F, marginTop: 4, marginBottom: 0 }}>
            {t("register_sub")}
          </p>
        </div>

        {/* Info-Leiste */}
        <div style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, padding: "10px 32px" }}>
          <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>
            <span style={{ color: RED, fontWeight: 600 }}>*</span> {t("register_required")}
          </p>
        </div>

        {/* Formular */}
        <div style={{ padding: "28px 32px" }}>
          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              {/* ── 1. Zugangsdaten ─────────────────────────────────────── */}
              <div>
                <SectionHead>{t("register_section_access")}</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field
                    label={t("register_email")} name="email" type="email" required
                    placeholder="name@firma.de"
                    error={emailError}
                    onBlur={() => {
                      const el = document.getElementById("email") as HTMLInputElement | null;
                      if (el) validateEmail(el.value);
                    }}
                  />
                  <Field
                    label={t("register_password")} name="password" type="password" required
                    hint={t("register_pw_hint")}
                    error={pwError}
                    onBlur={() => {
                      const el = document.getElementById("password") as HTMLInputElement | null;
                      if (el) validatePassword(el.value);
                    }}
                  />
                  <Field
                    label={t("register_phone")} name="phone"
                    type="tel" required placeholder="+49 30 1234567"
                    hint={t("register_phone_hint")}
                    error={phoneError}
                    onBlur={() => {
                      const el = document.getElementById("phone") as HTMLInputElement | null;
                      if (el) validatePhone(el.value);
                    }}
                  />
                </div>
              </div>

              {/* ── 2. Unternehmensdaten ────────────────────────────────── */}
              <div>
                <SectionHead>{t("register_section_company")}</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Land zuerst - beeinflusst VAT-Format */}
                  <CountrySelect value={country} onChange={setCountry} />

                  {/* VAT-ID mit VIES-Prüfung + Auto-Fill */}
                  <VatField
                    country={country}
                    onValidated={(data) => { if (data) applyCompanyData(data); }}
                  />

                  <Field
                    label={t("register_org")} name="organizationName" required
                    placeholder="Muster Handels GmbH"
                    value={orgName}
                    onChange={setOrgName}
                    hint={t("register_org_hint")}
                  />

                  {/* HRB mit Handelsregister-Prüfung + Auto-Fill */}
                  <HrbField onFound={(data) => applyCompanyData(data)} />

                  {/* Anschrift — auto-fill aus VIES oder HRB */}
                  <Field
                    label={t("register_street")} name="street" required
                    placeholder="Musterstraße 42"
                    value={street}
                    onChange={setStreet}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16 }}>
                    <Field
                      label={t("register_postal")} name="postalCode" required
                      placeholder="10115" maxLength={10}
                      value={postalCode}
                      onChange={setPostalCode}
                    />
                    <Field
                      label={t("register_city")} name="city" required
                      placeholder="Berlin"
                      value={city}
                      onChange={setCity}
                    />
                  </div>

                </div>
              </div>

              {/* ── 3. Marktteilnehmer-Rolle ────────────────────────────── */}
              <div>
                <SectionHead>{t("register_section_role")}</SectionHead>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { value: "SELLER", label: t("register_seller"), desc: t("register_seller_desc") },
                    { value: "BUYER",  label: t("register_buyer"),  desc: t("register_buyer_desc") },
                  ].map((r) => (
                    <label
                      key={r.value}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12, padding: 16,
                        border: `1px solid ${role === r.value ? BLUE : BORDER}`,
                        backgroundColor: role === r.value ? "rgba(21,65,148,.04)" : BG,
                        cursor: "pointer",
                        transition: "border-color 150ms, background-color 150ms",
                      }}
                    >
                      <input
                        type="radio" name="role" value={r.value} required
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

              {/* ── 4. Einwilligungen ───────────────────────────────────── */}
              <div>
                <SectionHead>{t("register_section_consent")}</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <ConsentBox
                    name="consentDsgvo" checked={consentDsgvo}
                    onChange={setConsentDsgvo} error={consentErrors.dsgvo}
                  >
                    {t("register_consent_dsgvo").split("Datenschutzerklärung")[0]}
                    <a href="/datenschutz" target="_blank" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>
                      Datenschutzerklärung
                    </a>
                    {t("register_consent_dsgvo").split("Datenschutzerklärung")[1]}
                  </ConsentBox>
                  <ConsentBox
                    name="consentAgb" checked={consentAgb}
                    onChange={setConsentAgb} error={consentErrors.agb}
                  >
                    {t("register_consent_agb").split("Allgemeinen Geschäftsbedingungen")[0]}
                    <a href="/agb" target="_blank" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>
                      Allgemeinen Geschäftsbedingungen
                    </a>
                    {t("register_consent_agb").split("Allgemeinen Geschäftsbedingungen")[1]}
                  </ConsentBox>
                </div>
              </div>

              {/* ── Fehler ──────────────────────────────────────────────── */}
              {error && (
                <div role="alert" style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  border: "1px solid rgba(220,38,38,.25)",
                  backgroundColor: "#fff5f5", padding: "12px 14px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ color: RED, flexShrink: 0, marginTop: 1 }}>
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="7" cy="10" r="0.7" fill="currentColor"/>
                  </svg>
                  <p style={{ fontSize: 13, color: RED, fontFamily: F, margin: 0 }}>{error}</p>
                </div>
              )}

              {/* ── Absenden ────────────────────────────────────────────── */}
              <button
                type="submit" disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  height: 44, borderRadius: 0, border: "none",
                  backgroundColor: loading ? BLUE : btnHover ? BLUE2 : BLUE,
                  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: F,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background-color 150ms", letterSpacing: "0.02em",
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                      style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="4"/>
                      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {t("register_loading")}
                  </>
                ) : t("register_btn")}
              </button>

            </div>
          </form>

          {/* Link zur Anmeldung */}
          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ fontSize: 13, color: "#555", fontFamily: F, margin: 0 }}>{t("register_have_account")}</p>
            <a href="/login" style={{
              fontSize: 13, fontWeight: 600, color: BLUE, fontFamily: F,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
            }}>
              {t("register_login_link")}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Trust-Zeichen ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 2, backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "14px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 4px" }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
              <rect x="1" y="9" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5.5 9V6a3.5 3.5 0 017 0v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="9" cy="13.5" r="1.5" fill="currentColor"/>
              <line x1="9" y1="15" x2="9" y2="16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#505050", fontFamily: F, textAlign: "center" }}>{t("auth_badge_tls")}</span>
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
            <span style={{ fontSize: 10, fontWeight: 600, color: "#505050", fontFamily: F, textAlign: "center" }}>{t("topbar_dsgvo")}</span>
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
            <span style={{ fontSize: 10, fontWeight: 600, color: "#505050", fontFamily: F, textAlign: "center" }}>{t("auth_badge_bafin")}</span>
          </div>
        </div>
      </div>

      {/* ── Support ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0, fontFamily: F }}>
          {t("register_support")}{" "}
          <a href="mailto:compliance@eucx.eu" style={{ color: BLUE, textDecoration: "none", fontWeight: 500 }}>
            compliance@eucx.eu
          </a>
        </p>
      </div>

    </div>
  );
}
