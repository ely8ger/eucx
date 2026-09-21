"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams }     from "next/navigation";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const TEXT   = "#0d1b2a";
const BORDER = "#d4d8e0";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!token) setError("Kein Reset-Token gefunden. Bitte fordern Sie einen neuen Link an.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== password2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Fehler beim Zurücksetzen des Passworts.");
        return;
      }
      setDone(true);
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f4f6fb", fontFamily: F, padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: BLUE, letterSpacing: "0.08em" }}>EUCX</span>
            <span style={{ fontSize: 11, color: "#8a9ab8", fontWeight: 300 }}>European Union Commodity Exchange</span>
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "36px 40px" }}>

          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: "#f0fdf4",
                border: "2px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: TEXT }}>Passwort zurückgesetzt</h2>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt anmelden.
              </p>
              <button
                onClick={() => router.push("/login")}
                style={{
                  width: "100%", padding: "11px 0", background: BLUE, color: "#fff",
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                  letterSpacing: "0.04em", fontFamily: F,
                }}
              >
                Zur Anmeldung
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: TEXT }}>Neues Passwort setzen</h2>
              <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                Bitte wählen Sie ein neues Passwort (mindestens 8 Zeichen).
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6, letterSpacing: "0.04em" }}>
                    NEUES PASSWORT
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                    disabled={!token}
                    style={{
                      width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`,
                      fontSize: 14, color: TEXT, fontFamily: F, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6, letterSpacing: "0.04em" }}>
                    PASSWORT BESTÄTIGEN
                  </label>
                  <input
                    type="password"
                    required
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    placeholder="Passwort wiederholen"
                    disabled={!token}
                    style={{
                      width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`,
                      fontSize: 14, color: TEXT, fontFamily: F, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", borderLeft: "3px solid #dc2626", padding: "10px 12px", marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token || !password || !password2}
                  style={{
                    width: "100%", padding: "11px 0",
                    background: loading || !token || !password || !password2 ? "#8fa3cc" : BLUE,
                    color: "#fff", border: "none",
                    cursor: loading || !token || !password || !password2 ? "default" : "pointer",
                    fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", fontFamily: F,
                  }}
                >
                  {loading ? "Wird gespeichert…" : "Passwort speichern"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
