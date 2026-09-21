"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const TEXT = "#0d1b2a";
const BORDER = "#d4d8e0";

export default function ForgotPasswordPage() {
  const router  = useRouter();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Immer success zeigen (kein User-Enumeration)
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
            <>
              {/* Erfolg */}
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
                <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: TEXT }}>E-Mail gesendet</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                  Falls ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie in Kürze einen Reset-Link.
                  Der Link ist <strong>1 Stunde</strong> gültig.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    width: "100%", padding: "11px 0", background: BLUE, color: "#fff",
                    border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                    letterSpacing: "0.04em", fontFamily: F,
                  }}
                >
                  Zurück zur Anmeldung
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: TEXT }}>Passwort zurücksetzen</h2>
              <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen Ihres Passworts.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6, letterSpacing: "0.04em" }}>
                    E-MAIL-ADRESSE
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@unternehmen.de"
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
                  disabled={loading || !email.trim()}
                  style={{
                    width: "100%", padding: "11px 0",
                    background: loading || !email.trim() ? "#8fa3cc" : BLUE,
                    color: "#fff", border: "none",
                    cursor: loading || !email.trim() ? "default" : "pointer",
                    fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", fontFamily: F,
                  }}
                >
                  {loading ? "Wird gesendet…" : "Reset-Link senden"}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: "center" }}>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, color: BLUE, fontFamily: F, fontWeight: 500,
                  }}
                >
                  ← Zurück zur Anmeldung
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
