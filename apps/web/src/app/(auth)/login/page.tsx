"use client";

/**
 * Login-Seite — erweitert mit 2FA-Step
 *
 * Ablauf:
 *   Step 1 (password): E-Mail + Passwort → Server prüft
 *     - totpRequired: true → Step 2
 *     - totpRequired: false → accessToken → /dashboard
 *   Step 2 (totp): 6-stelliger Code → /api/auth/2fa/validate → /dashboard
 *
 * Inline-Feldvalidierung, Auto-Focus auf Code-Eingabe in Step 2.
 */

import { useState, useRef, useEffect } from "react";
import { useRouter }                    from "next/navigation";
import { Button }                       from "@/components/ui/Button";
import { Input }                        from "@/components/ui/Input";
import { useAuthStore, scheduleAutoLogout } from "@/store/authStore";
import type { AuthUser }               from "@/store/authStore";

type Step = "password" | "totp";

interface FieldErrors { email?: string; password?: string; code?: string }

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
        data?:            { accessToken: string; expiresAt?: number; user?: AuthUser };
        totpRequired?:    boolean;
        code?:            string;
        message?:         string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ password: data.message ?? "E-Mail oder Passwort falsch" });
        } else {
          setErrors({ email: data.message ?? "Anmeldung fehlgeschlagen" });
        }
        return;
      }

      // Server verlangt 2FA-Code
      if (data.totpRequired) {
        setStep("totp");
        return;
      }

      // Erfolg ohne 2FA
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
        data?:    { accessToken: string; expiresAt?: number; user?: AuthUser };
        error?:   string;
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

  // ── Logo ───────────────────────────────────────────────────────────────────
  const Logo = () => (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-8 bg-cb-yellow rounded-sm" />
        <div className="w-1.5 h-5 bg-cb-yellow-light rounded-sm opacity-80" />
        <div className="w-1.5 h-7 bg-cb-yellow rounded-sm opacity-90" />
      </div>
      <h1 className="text-2xl font-bold text-cb-petrol">EUCX</h1>
      <p className="text-sm text-cb-gray-500 mt-1">EU Commodity Exchange</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm">
      <Logo />

      <div className="bg-cb-white border border-cb-gray-200 rounded shadow-sm p-6">

        {/* ── Step 1: Passwort ──────────────────────────────────────────── */}
        {step === "password" && (
          <>
            <h2 className="text-lg font-semibold text-cb-petrol mb-5">Anmelden</h2>
            <form onSubmit={(e) => { void handlePasswordSubmit(e); }} className="space-y-4">
              <Input
                label="E-Mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@unternehmen.de"
                error={errors.email}
                autoComplete="email"
                autoFocus
              />
              <Input
                label="Passwort"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                error={errors.password}
                autoComplete="current-password"
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Anmelden
              </Button>
            </form>
            <p className="text-center text-sm text-cb-gray-500 mt-4">
              Noch kein Konto?{" "}
              <a href="/register" className="text-cb-petrol font-medium hover:text-cb-yellow-dark">
                Jetzt registrieren
              </a>
            </p>
          </>
        )}

        {/* ── Step 2: 2FA Code ──────────────────────────────────────────── */}
        {step === "totp" && (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-cb-petrol/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-cb-petrol">🔐</span>
              </div>
              <h2 className="text-lg font-semibold text-cb-petrol">Zwei-Faktor-Authentifizierung</h2>
              <p className="text-sm text-cb-gray-500 mt-1">
                Code aus Ihrer Authenticator-App eingeben
              </p>
            </div>

            <form onSubmit={(e) => { void handleTotpSubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cb-gray-700 mb-1.5">
                  6-stelliger Code
                </label>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={`w-full h-14 rounded border text-center text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none transition-all
                    ${errors.code
                      ? "border-cb-error focus:border-cb-error focus:ring-2 focus:ring-cb-error/20"
                      : "border-cb-gray-300 focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20"
                    }`}
                  autoComplete="one-time-code"
                />
                {errors.code && (
                  <p className="text-xs text-cb-error flex items-center gap-1 mt-1.5">
                    <span>⚠</span> {errors.code}
                  </p>
                )}
              </div>
              <Button type="submit" fullWidth size="lg" loading={loading} disabled={code.length !== 6}>
                Bestätigen
              </Button>
            </form>

            <button
              type="button"
              onClick={() => { setStep("password"); setCode(""); setErrors({}); }}
              className="w-full text-center text-sm text-cb-gray-400 mt-4 hover:text-cb-gray-600 transition-colors"
            >
              ← Zurück zur Anmeldung
            </button>
          </>
        )}
      </div>

      <p className="text-center text-xs text-cb-gray-400 mt-6">
        © 2026 EUCX GmbH · eucx.eu
      </p>
    </div>
  );
}
