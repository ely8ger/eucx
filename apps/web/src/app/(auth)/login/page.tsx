"use client";

/**
 * Login-Seite — Behörden-Portal-Stil
 * Pattern: ELSTER Online Portal / BundID
 * Ablauf:
 *   Step 1: E-Mail + Passwort → Server
 *     - totpRequired: true → Step 2
 *     - totpRequired: false → accessToken → /dashboard
 *   Step 2: 6-stelliger TOTP-Code → /api/auth/2fa/validate → /dashboard
 */

import { useState, useRef, useEffect } from "react";
import { useRouter }                    from "next/navigation";
import { useAuthStore, scheduleAutoLogout } from "@/store/authStore";
import type { AuthUser }               from "@/store/authStore";

type Step = "password" | "totp";
interface FieldErrors { email?: string; password?: string; code?: string }

// ── Gov-Input-Komponente ────────────────────────────────────────────────────
interface GovInputProps {
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
}

const GovInput = ({ id, label, type, value, onChange, placeholder, error, autoComplete, autoFocus, required }: GovInputProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-gov-text">
      {label}
      {required && <span className="text-gov-error ml-1" aria-hidden="true">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={[
        "w-full h-11 rounded-sm border bg-white",
        "text-sm text-gov-text placeholder:text-gov-text-muted",
        "px-3 transition-colors duration-150",
        "focus:outline-none focus:ring-2",
        error
          ? "border-gov-error focus:ring-gov-error/20 focus:border-gov-error"
          : "border-gov-border focus:ring-gov-blue/20 focus:border-gov-blue",
      ].join(" ")}
    />
    {error && (
      <p id={`${id}-error`} role="alert" className="text-sm text-gov-error flex items-start gap-1.5 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="7" cy="9.5" r="0.7" fill="currentColor"/>
        </svg>
        {error}
      </p>
    )}
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step,     setStep    ] = useState<Step>("password");
  const [email,    setEmail   ] = useState("");
  const [password, setPassword] = useState("");
  const [code,     setCode    ] = useState("");
  const [errors,   setErrors  ] = useState<FieldErrors>({});
  const [loading,  setLoading ] = useState(false);
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
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json() as {
        data?:         { accessToken: string; expiresAt?: number; user?: AuthUser };
        totpRequired?: boolean;
        code?:         string;
        message?:      string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ password: "E-Mail-Adresse oder Passwort ist nicht korrekt." });
        } else {
          setErrors({ email: data.message ?? "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut." });
        }
        return;
      }

      if (data.totpRequired) { setStep("totp"); return; }

      if (data.data?.accessToken) {
        const expiresAt = data.data.expiresAt ?? Date.now() + 15 * 60 * 1000;
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${
          typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : ""
        }`;
        if (data.data.user) setAuth(data.data.user, expiresAt);
        scheduleAutoLogout(expiresAt);
        router.push("/dashboard");
      }
    } catch {
      setErrors({ email: "Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung." });
    } finally {
      setLoading(false);
    }
  }

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setErrors({ code: "Bitte geben Sie einen 6-stelligen Code ein." }); return; }
    setErrors({});
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/2fa/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code }),
      });
      const data = await res.json() as {
        data?:  { accessToken: string; expiresAt?: number; user?: AuthUser };
        error?: string;
      };

      if (!res.ok) {
        setErrors({ code: data.error ?? "Der Code ist ungültig oder abgelaufen." });
        setCode("");
        return;
      }

      if (data.data?.accessToken) {
        const expiresAt = data.data.expiresAt ?? Date.now() + 15 * 60 * 1000;
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${
          typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : ""
        }`;
        if (data.data.user) setAuth(data.data.user, expiresAt);
        scheduleAutoLogout(expiresAt);
        router.push("/dashboard");
      }
    } catch {
      setErrors({ code: "Verbindungsfehler." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[460px] mx-auto">

      {/* ── Portal-Bezeichnung über der Karte ──────────────────────────────── */}
      <div className="mb-5 text-center">
        <p className="text-xs uppercase tracking-widest text-gov-text-muted font-medium">
          Gesicherter Zugang · Teilnehmerportal
        </p>
      </div>

      {/* ── Karten-Container ───────────────────────────────────────────────── */}
      <div className="bg-gov-white border border-gov-border rounded-sm shadow-sm overflow-hidden"
           style={{ borderTop: "4px solid #154194" }}>

        <div className="px-8 pt-7 pb-2">
          <h1 className="text-xl font-bold text-gov-text">
            {step === "password" ? "Anmelden" : "Zwei-Faktor-Authentifizierung"}
          </h1>
          <p className="text-sm text-gov-text-muted mt-1">
            {step === "password"
              ? "Melden Sie sich mit Ihren EUCX-Zugangsdaten an."
              : "Geben Sie den Code aus Ihrer Authenticator-App ein."}
          </p>
        </div>

        <div className="px-8 py-6">

          {/* ── Step 1: Passwort ─────────────────────────────────────────── */}
          {step === "password" && (
            <form onSubmit={(e) => { void handlePasswordSubmit(e); }} noValidate>
              <div className="space-y-5">
                <GovInput
                  id="email"
                  label="E-Mail-Adresse"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@unternehmen.de"
                  error={errors.email}
                  autoComplete="email"
                  autoFocus
                  required
                />
                <GovInput
                  id="password"
                  label="Passwort"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  error={errors.password}
                  autoComplete="current-password"
                  required
                />

                <p className="text-xs text-gov-text-muted">
                  Mit <span className="text-gov-error font-medium">*</span> markierte Felder sind Pflichtfelder.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    "w-full h-11 rounded-sm font-semibold text-sm",
                    "bg-gov-blue text-white",
                    "hover:bg-gov-blue-dark transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue/40",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2",
                  ].join(" ")}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Anmelden…
                    </>
                  ) : "Anmelden"}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: TOTP ─────────────────────────────────────────────── */}
          {step === "totp" && (
            <form onSubmit={(e) => { void handleTotpSubmit(e); }} noValidate>
              <div className="space-y-5">

                {/* Hinweiskasten */}
                <div className="flex items-start gap-3 bg-gov-blue-light border border-gov-blue/20 rounded-sm p-4">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className="shrink-0 text-gov-blue mt-0.5">
                    <path d="M9 1L17 4.5v7c0 4-3 7.5-8 8.5C4 19 1 15.5 1 11.5v-7L9 1Z"
                      stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M6 10.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-sm text-gov-text">
                    Öffnen Sie Ihre Authenticator-App und geben Sie den 6-stelligen Code für <strong>{email}</strong> ein.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="totp-code" className="text-sm font-semibold text-gov-text">
                    Einmal-Code <span className="text-gov-error" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={codeRef}
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    className={[
                      "w-full h-14 rounded-sm border bg-white",
                      "text-center text-2xl font-mono font-bold tracking-[0.5em]",
                      "text-gov-text placeholder:text-gov-text-muted",
                      "transition-colors duration-150",
                      "focus:outline-none focus:ring-2",
                      errors.code
                        ? "border-gov-error focus:ring-gov-error/20 focus:border-gov-error"
                        : "border-gov-border focus:ring-gov-blue/20 focus:border-gov-blue",
                    ].join(" ")}
                  />
                  {errors.code && (
                    <p role="alert" className="text-sm text-gov-error flex items-start gap-1.5 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                        <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        <circle cx="7" cy="9.5" r="0.7" fill="currentColor"/>
                      </svg>
                      {errors.code}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className={[
                    "w-full h-11 rounded-sm font-semibold text-sm",
                    "bg-gov-blue text-white",
                    "hover:bg-gov-blue-dark transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue/40",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2",
                  ].join(" ")}
                >
                  {loading ? "Wird geprüft…" : "Bestätigen"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("password"); setCode(""); setErrors({}); }}
                  className="w-full text-center text-sm text-gov-blue hover:text-gov-blue-dark transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Zurück zur Anmeldung
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Vertrauenszeichen ──────────────────────────────────────────────── */}
        <div className="border-t border-gov-border-light px-8 py-4 bg-gov-bg">
          <div className="flex items-center justify-center gap-6 text-xs text-gov-text-muted">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden="true">
                <rect x="1" y="5.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3.5 5.5V3.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              TLS 1.3 verschlüsselt
            </span>
            <span className="text-gov-border-light">|</span>
            <span>DSGVO-konform</span>
            <span className="text-gov-border-light">|</span>
            <span>BaFin-regulierter Markt</span>
          </div>
        </div>
      </div>

      {/* ── Registrierungs-Link ────────────────────────────────────────────── */}
      {step === "password" && (
        <div className="mt-4 bg-gov-white border border-gov-border rounded-sm px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gov-text-muted">Noch kein Konto?</p>
          <a href="/register"
            className="text-sm font-semibold text-gov-blue hover:text-gov-blue-dark transition-colors flex items-center gap-1.5">
            Jetzt registrieren
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      )}

    </div>
  );
}
