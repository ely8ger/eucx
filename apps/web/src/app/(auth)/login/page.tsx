"use client";

/**
 * Login-Seite — Dark Mode (Commerzbank Premium Dark)
 *
 * Ablauf:
 *   Step 1 (password): E-Mail + Passwort → Server prüft
 *     - totpRequired: true → Step 2
 *     - totpRequired: false → accessToken → /dashboard
 *   Step 2 (totp): 6-stelliger Code → /api/auth/2fa/validate → /dashboard
 */

import { useState, useRef, useEffect } from "react";
import { useRouter }                    from "next/navigation";
import { useAuthStore, scheduleAutoLogout } from "@/store/authStore";
import type { AuthUser }               from "@/store/authStore";

type Step = "password" | "totp";

interface FieldErrors { email?: string; password?: string; code?: string }

// ── SVG Logo-Mark ──────────────────────────────────────────────────────────────
// Drei horizontale Balken (stilisiertes "E" + Commodity-Chart-Metapher)
const EucxMark = () => (
  <svg width="36" height="30" viewBox="0 0 36 30" fill="none" aria-hidden="true">
    {/* Top bar — volle Breite */}
    <rect x="0" y="0"  width="36" height="6.5" rx="3.25" fill="#FBB809" />
    {/* Mittlerer Balken — kürzer (Handels-Level / Mid-Price) */}
    <rect x="0" y="11.75" width="24" height="6.5" rx="3.25" fill="#FBB809" />
    {/* Unterer Balken — volle Breite */}
    <rect x="0" y="23.5" width="36" height="6.5" rx="3.25" fill="#FBB809" />
  </svg>
);

// ── Input-Feld (Dark Mode) ─────────────────────────────────────────────────────
interface DarkInputProps {
  id:            string;
  label:         string;
  type:          string;
  value:         string;
  onChange:      (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?:  string;
  error?:        string;
  autoComplete?: string;
  autoFocus?:    boolean;
}

const DarkInput = ({ id, label, type, value, onChange, placeholder, error, autoComplete, autoFocus }: DarkInputProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-dm-muted">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      className={[
        "w-full h-12 rounded-sm border bg-dm-input",
        "text-sm text-dm-text placeholder:text-dm-muted-2",
        "transition-all duration-200 px-4",
        "focus:outline-none",
        error
          ? "border-dm-error focus:border-dm-error focus:ring-1 focus:ring-dm-error/30"
          : "border-dm-border focus:border-dm-gold focus:ring-1 focus:ring-dm-gold/25",
      ].join(" ")}
    />
    {error && (
      <p className="text-xs text-dm-error flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M6 1L11 10H1L6 1Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="6" cy="9" r="0.6" fill="currentColor"/>
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ── Trennlinie ─────────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-dm-border" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-dm-surface px-3 text-xs text-dm-muted-2 uppercase tracking-widest">
        Sicherer Zugang
      </span>
    </div>
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

  // ── Step 1: Passwort-Login ─────────────────────────────────────────────────
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fe: FieldErrors = {};
    if (!email)    fe.email    = "E-Mail ist erforderlich";
    if (!password) fe.password = "Passwort ist erforderlich";
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
          setErrors({ password: data.message ?? "E-Mail oder Passwort falsch" });
        } else {
          setErrors({ email: data.message ?? "Anmeldung fehlgeschlagen" });
        }
        return;
      }

      if (data.totpRequired) { setStep("totp"); return; }

      if (data.data?.accessToken) {
        const expiresAt = data.data.expiresAt ?? Date.now() + 15 * 60 * 1000;
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${
          location.protocol === "https:" ? "; secure" : ""
        }`;
        if (data.data.user) setAuth(data.data.user, expiresAt);
        scheduleAutoLogout(expiresAt);
        router.push("/dashboard");
      }
    } catch {
      setErrors({ email: "Verbindungsfehler. Bitte erneut versuchen." });
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: TOTP-Validierung ───────────────────────────────────────────────
  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setErrors({ code: "Bitte 6-stelligen Code eingeben" }); return; }
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
        setErrors({ code: data.error ?? "Code ungültig. Bitte erneut versuchen." });
        setCode("");
        return;
      }

      if (data.data?.accessToken) {
        const expiresAt = data.data.expiresAt ?? Date.now() + 15 * 60 * 1000;
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${
          location.protocol === "https:" ? "; secure" : ""
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
    <div className="w-full max-w-[420px] mx-auto">

      {/* ── Logo & Wordmark ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-4 mb-4">
          <EucxMark />
          <div>
            <h1 className="text-3xl font-bold text-dm-text tracking-tight leading-none">
              EUCX
            </h1>
            <div className="h-[2px] w-full bg-dm-gold mt-1 rounded-full" />
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-dm-muted">
          European Union Commodity Exchange
        </p>
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        className="w-full bg-dm-surface rounded-sm border border-dm-border relative overflow-hidden"
        style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,184,9,0.06)" }}
      >
        {/* Gold-Akzentlinie oben */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-dm-gold" />

        <div className="p-8 pt-9">

          {/* ── Step 1: Passwort ────────────────────────────────────────── */}
          {step === "password" && (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-dm-text">Anmelden</h2>
                <p className="text-sm text-dm-muted mt-1">
                  Zugang zur institutionellen Handelsplattform
                </p>
              </div>

              <form onSubmit={(e) => { void handlePasswordSubmit(e); }} className="space-y-5">
                <DarkInput
                  id="email"
                  label="E-Mail-Adresse"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@unternehmen.de"
                  error={errors.email}
                  autoComplete="email"
                  autoFocus
                />
                <DarkInput
                  id="password"
                  label="Passwort"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  error={errors.password}
                  autoComplete="current-password"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    "w-full h-12 rounded-sm font-semibold text-sm tracking-wide",
                    "bg-dm-gold text-[#06090F]",
                    "transition-all duration-200",
                    "hover:bg-dm-gold-hover active:scale-[0.99]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-gold/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2.5",
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
                  ) : (
                    <>
                      Anmelden
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Trust-Indikatoren */}
              <Divider />
              <div className="flex items-center justify-center gap-5 text-[10px] uppercase tracking-widest text-dm-muted-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                    <rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  TLS 1.3
                </span>
                <span className="text-dm-border">|</span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                    <path d="M1 5.5L4 8.5L11 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  2FA verfügbar
                </span>
                <span className="text-dm-border">|</span>
                <span>DSGVO</span>
              </div>

              <p className="text-center text-sm text-dm-muted mt-6">
                Noch kein Konto?{" "}
                <a href="/register" className="text-dm-gold font-medium hover:text-dm-gold-hover transition-colors">
                  Jetzt registrieren
                </a>
              </p>
            </>
          )}

          {/* ── Step 2: 2FA Code ─────────────────────────────────────────── */}
          {step === "totp" && (
            <>
              <div className="text-center mb-7">
                {/* Schild-Icon */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-sm border border-dm-border bg-dm-surface-2 flex items-center justify-center">
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true">
                    <path d="M12 1L2 5v9c0 6 5 11 10 13 5-2 10-7 10-13V5L12 1Z"
                      stroke="#FBB809" strokeWidth="1.5" fill="rgba(251,184,9,0.08)"/>
                    <path d="M8 14l3 3 5-5" stroke="#FBB809" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-dm-text">Zwei-Faktor-Authentifizierung</h2>
                <p className="text-sm text-dm-muted mt-1.5">
                  Code aus Ihrer Authenticator-App eingeben
                </p>
              </div>

              <form onSubmit={(e) => { void handleTotpSubmit(e); }} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="totp-code" className="text-xs font-semibold uppercase tracking-widest text-dm-muted">
                    6-stelliger Code
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
                    placeholder="000 000"
                    autoComplete="one-time-code"
                    className={[
                      "w-full h-16 rounded-sm border bg-dm-input",
                      "text-center text-2xl font-mono font-bold tracking-[0.6em]",
                      "text-dm-text placeholder:text-dm-muted-2 placeholder:tracking-[0.3em]",
                      "transition-all duration-200",
                      "focus:outline-none",
                      errors.code
                        ? "border-dm-error focus:border-dm-error focus:ring-1 focus:ring-dm-error/30"
                        : "border-dm-border focus:border-dm-gold focus:ring-1 focus:ring-dm-gold/25",
                    ].join(" ")}
                  />
                  {errors.code && (
                    <p className="text-xs text-dm-error flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1L11 10H1L6 1Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="6" cy="9" r="0.6" fill="currentColor"/>
                      </svg>
                      {errors.code}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className={[
                    "w-full h-12 rounded-sm font-semibold text-sm tracking-wide",
                    "bg-dm-gold text-[#06090F]",
                    "transition-all duration-200",
                    "hover:bg-dm-gold-hover active:scale-[0.99]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-gold/50",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2.5",
                  ].join(" ")}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Wird geprüft…
                    </>
                  ) : "Bestätigen"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setStep("password"); setCode(""); setErrors({}); }}
                className="w-full text-center text-sm text-dm-muted-2 mt-5 hover:text-dm-muted transition-colors flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Zurück zur Anmeldung
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <p className="text-center text-[10px] uppercase tracking-widest text-dm-muted-2 mt-8 font-medium">
        © 2026 EUCX GmbH &nbsp;·&nbsp; eucx.eu &nbsp;·&nbsp; Frankfurt am Main
      </p>
    </div>
  );
}
