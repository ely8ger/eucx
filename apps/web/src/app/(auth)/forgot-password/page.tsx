"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const TEXT   = "#0d1b2a";
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
      setDone(true);
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 480, fontFamily: F }}>

      {/* Card */}
      <div style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        padding: "40px 44px",
      }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#f0fdf4", border: "2px solid #16a34a",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: TEXT }}>
              E-Mail gesendet
            </h2>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
              Falls ein Konto mit dieser E-Mail-Adresse existiert,
              erhalten Sie in Kürze einen Reset-Link.
              Der Link ist <strong>1 Stunde</strong> gültig.
            </p>
            <button onClick={() => router.push("/login")} style={{
              width: "100%", padding: "12px 0",
              background: BLUE, color: "#fff", border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              letterSpacing: "0.04em", fontFamily: F,
            }}>
              Zurück zur Anmeldung
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: TEXT }}>
              Passwort zurücksetzen
            </h2>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
              Geben Sie Ihre registrierte E-Mail-Adresse ein.
              Sie erhalten einen Link zum Zurücksetzen Ihres Passworts.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 600,
                  color: "#374151", marginBottom: 6, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@unternehmen.de"
                  style={{
                    width: "100%", padding: "11px 13px",
                    border: `1px solid ${BORDER}`, borderRadius: 0,
                    fontSize: 14, color: TEXT, fontFamily: F,
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                />
              </div>

              {error && (
                <div style={{
                  background: "#fef2f2", borderLeft: "3px solid #dc2626",
                  padding: "10px 14px", marginBottom: 16,
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%", padding: "12px 0",
                  background: loading || !email.trim() ? "#8fa3cc" : BLUE,
                  color: "#fff", border: "none",
                  cursor: loading || !email.trim() ? "default" : "pointer",
                  fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", fontFamily: F,
                }}
              >
                {loading ? "Wird gesendet…" : "Reset-Link anfordern"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <a href="/login" style={{
                fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 500,
              }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
              >
                ← Zurück zur Anmeldung
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
