"use client";

/**
 * 2FA-Setup-Seite — /2fa-setup
 *
 * Zeigt QR-Code + manuellen Secret für Authenticator-App.
 * Verifikation mit erstem TOTP-Code → 2FA aktiviert → /settings
 */

import { useState, useEffect, useRef } from "react";
import { useRouter }                    from "next/navigation";
import { QRCodeSVG }                    from "qrcode.react";
import { Button }                       from "@/components/ui/button";

interface SetupData { otpAuthUrl: string; secret: string }

export default function TwoFaSetupPage() {
  const router = useRouter();

  const [setup,      setSetup    ] = useState<SetupData | null>(null);
  const [code,       setCode     ] = useState("");
  const [error,      setError    ] = useState("");
  const [success,    setSuccess  ] = useState(false);
  const [loading,    setLoading  ] = useState(false);
  const [initLoading,setInitLoad ] = useState(true);
  const codeRef = useRef<HTMLInputElement>(null);

  // QR-Code generieren
  useEffect(() => {
    const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
    fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<SetupData & { error?: string }>)
      .then((d) => {
        if (d.error) { setError(d.error); }
        else         { setSetup(d); setTimeout(() => codeRef.current?.focus(), 100); }
      })
      .catch(() => setError("Setup konnte nicht gestartet werden."))
      .finally(() => setInitLoad(false));
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError("Bitte 6-stelligen Code eingeben"); return; }
    setError("");
    setLoading(true);

    try {
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
      const res   = await fetch("/api/auth/2fa/verify", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) { setError(data.error ?? "Code ungültig"); setCode(""); return; }

      setSuccess(true);
      setTimeout(() => router.push("/settings"), 2000);
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  }

  const Logo = () => (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-8 bg-cb-yellow rounded-sm" />
        <div className="w-1.5 h-5 bg-cb-yellow-light rounded-sm opacity-80" />
        <div className="w-1.5 h-7 bg-cb-yellow rounded-sm opacity-90" />
      </div>
      <h1 className="text-2xl font-bold text-cb-petrol">EUCX</h1>
    </div>
  );

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <Logo />
        <div className="bg-cb-white border border-cb-gray-200 rounded shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-cb-petrol mb-2">2FA aktiviert</h2>
          <p className="text-cb-gray-500 text-sm">
            Ihr Konto ist jetzt mit Zwei-Faktor-Authentifizierung geschützt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Logo />

      <div className="bg-cb-white border border-cb-gray-200 rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold text-cb-petrol mb-1">
          Zwei-Faktor-Authentifizierung einrichten
        </h2>
        <p className="text-sm text-cb-gray-500 mb-5">
          Scannen Sie den QR-Code mit Google Authenticator, Authy oder einer kompatiblen App.
        </p>

        {initLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-cb-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !setup && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {setup && (
          <>
            {/* QR-Code */}
            <div className="flex justify-center mb-5">
              <div className="p-4 border-2 border-cb-gray-200 rounded-lg bg-white inline-block">
                <QRCodeSVG
                  value={setup.otpAuthUrl}
                  size={200}
                  level="M"
                  marginSize={1}
                />
              </div>
            </div>

            {/* Manueller Secret */}
            <details className="mb-5">
              <summary className="text-xs text-cb-gray-400 cursor-pointer hover:text-cb-gray-600 text-center mb-2">
                QR-Code nicht lesbar? Manuell eingeben
              </summary>
              <div className="bg-cb-gray-50 border border-cb-gray-200 rounded p-3 text-center">
                <code className="text-xs font-mono text-cb-petrol tracking-widest break-all">
                  {setup.secret}
                </code>
              </div>
            </details>

            {/* Code-Eingabe */}
            <form onSubmit={(e) => { void handleVerify(e); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cb-gray-700 mb-1.5">
                  Code zur Bestätigung
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
                    ${error
                      ? "border-cb-error focus:ring-2 focus:ring-cb-error/20"
                      : "border-cb-gray-300 focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20"
                    }`}
                />
                {error && (
                  <p className="text-xs text-cb-error flex items-center gap-1 mt-1.5">
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>
              <Button type="submit" fullWidth size="lg" loading={loading} disabled={code.length !== 6}>
                2FA aktivieren
              </Button>
            </form>
          </>
        )}

        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="w-full text-center text-sm text-cb-gray-400 mt-4 hover:text-cb-gray-600 transition-colors"
        >
          Später einrichten
        </button>
      </div>
    </div>
  );
}
