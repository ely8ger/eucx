"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter }                    from "next/navigation";
import { useAuthStore, scheduleAutoLogout } from "@/store/authStore";
import type { AuthUser }               from "@/store/authStore";
import { EucxLogo }                    from "@/components/logo/EucxLogo";
import { useI18n }                     from "@/lib/i18n/context";

const F = "'IBM Plex Sans', Arial, sans-serif";
const BLUE  = "#154194";
const BLUE2 = "#0f3070";
const RED   = "#dc2626";
const TEXT  = "#0d1b2a";
const MUTED = "#888";
const BORDER = "#d4d8e0";

type Step = "password" | "totp";
interface FieldErrors { email?: string; password?: string; code?: string }

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
  id:            string;
  label:         string;
  type:          string;
  value:         string;
  onChange:      (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?:  string;
  error?:        string;
  autoComplete?: string;
  autoFocus?:    boolean;
  required?:     boolean;
  inputRef?:     React.RefObject<HTMLInputElement | null>;
  inputMode?:    React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?:      string;
  maxLength?:    number;
  mono?:         boolean;
}

function Field({ id, label, type, value, onChange, placeholder, error, autoComplete, autoFocus, required, inputRef, inputMode, pattern, maxLength, mono }: InputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? RED : focused ? BLUE : BORDER;
  const shadow      = error
    ? "0 0 0 3px rgba(220,38,38,.12)"
    : focused ? "0 0 0 3px rgba(21,65,148,.12)" : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>
        {label}{required && <span style={{ color: RED, marginLeft: 3 }} aria-hidden="true">*</span>}
      </label>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 44, border: `1px solid ${borderColor}`,
          boxShadow: shadow, outline: "none", padding: "0 12px",
          fontSize: 14, fontFamily: mono ? "'IBM Plex Mono', monospace" : F,
          color: TEXT, backgroundColor: "#fff", boxSizing: "border-box",
          textAlign: mono ? "center" : undefined,
          letterSpacing: mono ? "0.4em" : undefined,
          transition: "border-color .15s, box-shadow .15s",
        }}
      />
      {error && (
        <p id={`${id}-err`} role="alert" style={{ fontSize: 12, color: RED, display: "flex", alignItems: "flex-start", gap: 5, margin: 0, fontFamily: F }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke={RED} strokeWidth="1.4"/>
            <line x1="7" y1="4.5" x2="7" y2="7.5" stroke={RED} strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="7" cy="9.5" r="0.7" fill={RED}/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
function PrimaryBtn({ label, loading, disabled, loadingLabel }: { label: string; loading: boolean; disabled?: boolean; loadingLabel?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={disabled ?? loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 44, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: (disabled ?? loading) ? "#7a9cd0" : hovered ? BLUE2 : BLUE,
        color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: F,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "background-color .15s",
      }}
    >
      {loading ? (
        <>
          <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {loadingLabel ?? label}
        </>
      ) : label}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t }   = useI18n();

  const [step,     setStep    ] = useState<Step>("password");
  const [email,    setEmail   ] = useState("");
  const [password, setPassword] = useState("");
  const [code,     setCode    ] = useState("");
  const [errors,   setErrors  ] = useState<FieldErrors>({});
  const [loading,  setLoading ] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "totp") codeRef.current?.focus();
  }, [step]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fe: FieldErrors = {};
    if (!email)    fe.email    = "Bitte geben Sie Ihre E-Mail-Adresse ein.";
    if (!password) fe.password = "Bitte geben Sie Ihr Passwort ein.";
    if (Object.keys(fe).length) { setErrors(fe); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as {
        data?: { accessToken: string; expiresAt?: number; user?: AuthUser };
        totpRequired?: boolean; code?: string; message?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          const next = attempts + 1;
          setAttempts(next);
          const remaining = Math.max(0, 5 - next);
          setErrors({ password: remaining > 0
            ? t("login_attempts").replace("{n}", String(remaining))
            : t("login_locked_desc") });
        } else {
          setErrors({ email: data.message ?? t("login_err_conn") });
        }
        return;
      }
      if (data.totpRequired) { setStep("totp"); return; }
      if (data.data?.accessToken) {
        const expiresAt = data.data.expiresAt ?? Date.now() + 15 * 60 * 1000;
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${
          typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : ""}`;
        if (data.data.user) setAuth(data.data.user, expiresAt);
        scheduleAutoLogout(expiresAt);
        if (typeof window !== "undefined") localStorage.setItem("eucx_prev_login", new Date().toISOString());
        router.push("/dashboard");
      }
    } catch {
      setErrors({ email: t("login_err_conn") });
    } finally { setLoading(false); }
  }

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setErrors({ code: "Bitte geben Sie einen 6-stelligen Code ein." }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/2fa/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json() as {
        data?: { accessToken: string; expiresAt?: number; user?: AuthUser }; error?: string;
      };
      if (!res.ok) { setErrors({ code: data.error ?? t("login_err_invalid") }); setCode(""); return; }
      if (data.data?.accessToken) {
        const expiresAt = data.data.expiresAt ?? Date.now() + 15 * 60 * 1000;
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${
          typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : ""}`;
        if (data.data.user) setAuth(data.data.user, expiresAt);
        scheduleAutoLogout(expiresAt);
        if (typeof window !== "undefined") localStorage.setItem("eucx_prev_login", new Date().toISOString());
        router.push("/dashboard");
      }
    } catch { setErrors({ code: t("login_err_conn") }); }
    finally  { setLoading(false); }
  }

  const locked = attempts >= 5;

  return (
    <>
      {/* Spin-Keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ width: "100%", maxWidth: 440, fontFamily: F }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <EucxLogo size="md" showTagline />
        </div>

        {/* ── Karte ── */}
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderTop: `4px solid ${BLUE}`, boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>

          {/* Kopf */}
          <div style={{ padding: "24px 32px 0" }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: TEXT, margin: 0, fontFamily: F }}>
              {step === "password" ? t("login_title") : t("login_2fa_title")}
            </h1>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 6, marginBottom: 0, lineHeight: 1.5, fontFamily: F }}>
              {step === "password"
                ? t("login_sub")
                : t("login_2fa_desc")}
            </p>
          </div>

          {/* Formular */}
          <div style={{ padding: "20px 32px 28px" }}>

            {/* ── Step 1: Passwort ── */}
            {step === "password" && (
              <form onSubmit={(e) => { void handlePasswordSubmit(e); }} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  <Field id="email" label={t("login_email")} type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@unternehmen.de" error={errors.email}
                    autoComplete="email" autoFocus required />

                  <div>
                    <Field id="password" label={t("login_password")} type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password} autoComplete="current-password" required />
                    <div style={{ textAlign: "right", marginTop: 6 }}>
                      <a href="mailto:support@eucx.eu?subject=Passwort%20zur%C3%BCcksetzen"
                        style={{ fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 500, fontFamily: F }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                        {t("login_forgot")}
                      </a>
                    </div>
                  </div>

                  {/* 2FA-Hinweis */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", backgroundColor: "#eef2fb", borderLeft: `3px solid ${BLUE}` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2, color: BLUE }} aria-hidden="true">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                      <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>
                    </svg>
                    <p style={{ fontSize: 12, color: BLUE, margin: 0, lineHeight: 1.6, fontFamily: F }}>
                      {t("login_2fa_desc")}
                    </p>
                  </div>

                  {/* Lockout-Warnung */}
                  {locked && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", backgroundColor: "#fff5f5", borderLeft: `3px solid ${RED}` }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2, color: RED }} aria-hidden="true">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                        <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <circle cx="7" cy="10" r="0.7" fill="currentColor"/>
                      </svg>
                      <p style={{ fontSize: 12, color: RED, margin: 0, lineHeight: 1.6, fontFamily: F }}>
                        {t("login_locked_title")}{" "}
                        <a href="mailto:support@eucx.eu" style={{ color: RED, fontWeight: 600 }}>support@eucx.eu</a>.
                      </p>
                    </div>
                  )}

                  <PrimaryBtn label={t("login_btn")} loading={loading} disabled={locked} loadingLabel={t("login_loading")} />

                </div>
              </form>
            )}

            {/* ── Step 2: TOTP ── */}
            {step === "totp" && (
              <form onSubmit={(e) => { void handleTotpSubmit(e); }} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Info-Box */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", backgroundColor: "#eef2fb", borderLeft: `3px solid ${BLUE}` }}>
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ flexShrink: 0, color: BLUE, marginTop: 1 }} aria-hidden="true">
                      <path d="M9 1L17 4.5v7c0 4-3 7.5-8 8.5C4 19 1 15.5 1 11.5v-7L9 1Z" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M6 10.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p style={{ fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6, fontFamily: F }}>
                      Öffnen Sie Ihre Authenticator-App und geben Sie den 6-stelligen Code für <strong>{email}</strong> ein.
                    </p>
                  </div>

                  <Field id="totp-code" label="Einmal-Code" type="text" value={code}
                    inputRef={codeRef}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000" error={errors.code}
                    autoComplete="one-time-code" required
                    inputMode="numeric" pattern="[0-9]{6}" maxLength={6} mono />

                  <PrimaryBtn label={t("login_btn")} loading={loading} disabled={loading || code.length !== 6} loadingLabel={t("login_loading")} />

                  <button type="button"
                    onClick={() => { setStep("password"); setCode(""); setErrors({}); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: BLUE, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "4px 0" }}
                    onMouseEnter={e => (e.currentTarget.style.color = BLUE2)}
                    onMouseLeave={e => (e.currentTarget.style.color = BLUE)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t("register_back")}
                  </button>

                </div>
              </form>
            )}
          </div>

          {/* ── Trust-Zeichen ── */}
          <div style={{ borderTop: "1px solid #eef0f4", backgroundColor: "#fafbfd", padding: "14px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
              {[
                {
                  icon: <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
                    <rect x="1" y="9" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5.5 9V6a3.5 3.5 0 017 0v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="9" cy="13.5" r="1.5" fill="currentColor"/>
                    <line x1="9" y1="15" x2="9" y2="16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>,
                  label: "TLS 1.3\nverschlüsselt",
                },
                {
                  icon: <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
                    <path d="M9 1L17 4.5v7c0 4-3 7.5-8 8.5C4 19 1 15.5 1 11.5v-7L9 1Z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="9" cy="7.5" r="0.85" fill="currentColor"/>
                    <circle cx="12" cy="9.5" r="0.85" fill="currentColor"/>
                    <circle cx="11" cy="13" r="0.85" fill="currentColor"/>
                    <circle cx="7" cy="13" r="0.85" fill="currentColor"/>
                    <circle cx="6" cy="9.5" r="0.85" fill="currentColor"/>
                  </svg>,
                  label: "DSGVO-konform",
                },
                {
                  icon: <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ color: BLUE }}>
                    <rect x="1" y="16" width="16" height="2" rx="0.5" fill="currentColor" opacity="0.85"/>
                    <rect x="1" y="6"  width="16" height="2" rx="0.5" fill="currentColor" opacity="0.85"/>
                    <rect x="3" y="8"  width="2"  height="8" fill="currentColor" opacity="0.65"/>
                    <rect x="8" y="8"  width="2"  height="8" fill="currentColor" opacity="0.65"/>
                    <rect x="13" y="8" width="2"  height="8" fill="currentColor" opacity="0.65"/>
                    <path d="M1 6L9 1.5l8 4.5H1Z" fill="currentColor" opacity="0.45"/>
                  </svg>,
                  label: "BaFin-regulierter\nMarkt",
                },
              ].map(({ icon, label }, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "8px 6px",
                  borderLeft: i > 0 ? "1px solid #eef0f4" : undefined,
                }}>
                  {icon}
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#555", textAlign: "center", fontFamily: F, lineHeight: 1.4, whiteSpace: "pre-line" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Registrierungs-Link ── */}
        {step === "password" && (
          <div style={{ marginTop: 10, backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, color: MUTED, margin: 0, fontFamily: F }}>{t("login_no_account")}</p>
            <a href="/register"
              style={{ fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontFamily: F }}
              onMouseEnter={e => (e.currentTarget.style.color = BLUE2)}
              onMouseLeave={e => (e.currentTarget.style.color = BLUE)}>
              {t("login_register_link")}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        )}

      </div>
    </>
  );
}
