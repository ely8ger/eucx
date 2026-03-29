"use client";

/**
 * SecuritySettingsClient — /dashboard/settings/security
 *
 * Sicherheitsübersicht mit:
 *   - 2FA-Status & Aktivierung / Deaktivierung
 *   - Aktive Sessions / Token-Verwaltung
 *   - Passwort ändern
 *   - Letzte Login-Aktivität
 *
 * Design: EUCX-Standard (IBM Plex Sans, #154194, border-radius 0)
 */

import { useState, useEffect } from "react";
import { useRouter }            from "next/navigation";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const YELLOW = "#e8b400";
const RED    = "#dc2626";
const GREEN  = "#16a34a";
const TEXT   = "#0d1b2a";
const MUTED  = "#7a8aa0";
const BORDER = "#d4d8e0";
const BG     = "#f7f9fc";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    localStorage.getItem("accessToken") ?? ""
  );
}

interface MeData {
  email:              string;
  verificationStatus: string;
  totpEnabled?:       boolean;
}

// ─── Hilfselemente ────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, marginBottom: 16 }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "16px 24px" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: F }}>{title}</p>
        {subtitle && <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED, fontFamily: F }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "20px 24px" }}>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ active, labelOn, labelOff }: { active: boolean; labelOn: string; labelOff: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", fontSize: 12, fontWeight: 600, fontFamily: F,
      background: active ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${active ? "#bbf7d0" : "#fecaca"}`,
      color: active ? GREEN : RED,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? GREEN : RED, display: "inline-block" }} />
      {active ? labelOn : labelOff}
    </span>
  );
}

function Row({ label, value, action }: { label: string; value?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>{label}</p>
        {value && <div style={{ marginTop: 3 }}>{value}</div>}
      </div>
      {action && <div style={{ flexShrink: 0, marginLeft: 16 }}>{action}</div>}
    </div>
  );
}

function Btn({ label, onClick, variant = "primary", disabled }: {
  label: string; onClick?: () => void;
  variant?: "primary" | "outline" | "danger"; disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: BLUE, color: "#fff", border: "none" },
    outline: { background: "#fff", color: TEXT, border: `1px solid ${BORDER}` },
    danger:  { background: "#fff", color: RED,  border: `1px solid #fecaca` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 36, padding: "0 16px", borderRadius: 0, cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: 600, fontFamily: F, opacity: disabled ? 0.5 : 1,
        transition: "opacity 150ms", ...styles[variant],
      }}
    >
      {label}
    </button>
  );
}

// ─── Hauptkomponente ───────────────────────────────────────────────────────────

export function SecuritySettingsClient() {
  const router = useRouter();
  const [me,           setMe          ] = useState<MeData | null>(null);
  const [totpEnabled,  setTotpEnabled ] = useState(false);
  const [disabling,    setDisabling   ] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(false);
  const [disableCode,  setDisableCode ] = useState("");
  const [disableError, setDisableError] = useState("");
  const [pwSection,    setPwSection   ] = useState(false);
  const [pw,           setPw          ] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading,    setPwLoading   ] = useState(false);
  const [pwMsg,        setPwMsg       ] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json() as Promise<MeData & { totpEnabled?: boolean }>)
      .then((d) => {
        setMe(d);
        setTotpEnabled(d.totpEnabled ?? false);
      })
      .catch(() => {});
  }, []);

  async function handleDisable2fa() {
    if (disableCode.length !== 6) { setDisableError("Bitte 6-stelligen Code eingeben."); return; }
    setDisabling(true);
    setDisableError("");
    try {
      const res  = await fetch("/api/auth/2fa/disable", {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ code: disableCode }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setDisableError(data.error ?? "Code ungültig."); return; }
      setTotpEnabled(false);
      setDisableConfirm(false);
      setDisableCode("");
    } catch {
      setDisableError("Verbindungsfehler.");
    } finally {
      setDisabling(false);
    }
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) { setPwMsg("Passwörter stimmen nicht überein."); return; }
    if (pw.next.length < 8)     { setPwMsg("Mindestens 8 Zeichen erforderlich."); return; }
    setPwLoading(true);
    setPwMsg("");
    try {
      const res  = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) { setPwMsg(data.error ?? "Fehler beim Ändern."); return; }
      setPwMsg("✓ Passwort erfolgreich geändert.");
      setPw({ current: "", next: "", confirm: "" });
      setPwSection(false);
    } catch {
      setPwMsg("Verbindungsfehler.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 680, fontFamily: F }}>

      {/* ── Titel ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: TEXT }}>Sicherheit</h1>
        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
          Verwalten Sie Ihre Anmeldemethoden und schützen Sie Ihr Handelskonto.
        </p>
      </div>

      {/* ── Sicherheits-Score ─────────────────────────────────────────────── */}
      {me && (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ background: BLUE, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Sicherheitsstatus</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,.6)" }}>
                Erfüllen Sie alle Kriterien für maximalen Schutz.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: totpEnabled ? YELLOW : "rgba(255,255,255,.4)" }}>
                {totpEnabled ? "●●●" : "●●○"}
              </span>
            </div>
          </div>
          <div style={{ height: 3, background: YELLOW }} />
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "E-Mail bestätigt",            ok: true },
              { label: "Zwei-Faktor-Authentifizierung", ok: totpEnabled },
              { label: "KYC-Verifizierung",            ok: me.verificationStatus === "VERIFIED" },
            ].map(({ label, ok }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  background: ok ? GREEN : BORDER,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {ok && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: ok ? TEXT : MUTED, fontWeight: ok ? 600 : 400 }}>{label}</span>
                {!ok && (
                  <span style={{ fontSize: 11, color: "#d97706", marginLeft: "auto", fontWeight: 600 }}>
                    Empfohlen
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2FA ───────────────────────────────────────────────────────────── */}
      <SectionCard
        title="Zwei-Faktor-Authentifizierung (2FA)"
        subtitle="Schützt Ihr Konto auch wenn Ihr Passwort kompromittiert wurde."
      >
        <Row
          label="TOTP Authenticator"
          value={<StatusPill active={totpEnabled} labelOn="Aktiv" labelOff="Nicht aktiv" />}
          action={
            totpEnabled
              ? <Btn label="Deaktivieren" variant="danger" onClick={() => setDisableConfirm((v) => !v)} />
              : <Btn label="Jetzt einrichten →" onClick={() => router.push("/2fa-setup")} />
          }
        />

        {/* Empfehlung + App-Links */}
        {!totpEnabled && (
          <div style={{ marginTop: 16, background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${BLUE}`, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: TEXT }}>
              Wir empfehlen eine Authenticator-App
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
              Authenticator-Apps generieren einmalige 6-stellige Codes, die nur 30 Sekunden gültig sind — unabhängig von Ihrer Internetverbindung.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { name: "Google Authenticator", ios: "https://apps.apple.com/de/app/google-authenticator/id388497605", android: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" },
                { name: "Microsoft Authenticator", ios: "https://apps.apple.com/de/app/microsoft-authenticator/id983156458", android: "https://play.google.com/store/apps/details?id=com.azure.authenticator" },
                { name: "Authy", ios: "https://apps.apple.com/de/app/twilio-authy/id494168017", android: "https://play.google.com/store/apps/details?id=com.authy.authy" },
              ].map(({ name, ios, android }) => (
                <div key={name} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "10px 14px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: TEXT }}>{name}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={ios}     target="_blank" rel="noreferrer" style={{ fontSize: 11, color: BLUE, textDecoration: "none" }}>App Store →</a>
                    <a href={android} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: BLUE, textDecoration: "none" }}>Google Play →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deaktivierungs-Formular */}
        {disableConfirm && (
          <div style={{ marginTop: 16, background: "#fef2f2", border: `1px solid #fecaca`, borderLeft: `3px solid ${RED}`, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: RED }}>
              ⚠ 2FA deaktivieren
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: MUTED }}>
              Geben Sie Ihren aktuellen Authenticator-Code ein, um zu bestätigen.
            </p>
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={disableCode}
              onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, "")); setDisableError(""); }}
              placeholder="000000"
              style={{
                width: "100%", height: 44, borderRadius: 0, boxSizing: "border-box",
                border: `1px solid ${disableError ? RED : BORDER}`,
                textAlign: "center", fontSize: 22, fontWeight: 700, letterSpacing: "0.3em",
                fontFamily: "monospace", outline: "none", marginBottom: 8,
              }}
            />
            {disableError && <p style={{ margin: "0 0 8px", fontSize: 12, color: RED }}>{disableError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn label={disabling ? "Wird deaktiviert…" : "Deaktivierung bestätigen"} variant="danger" onClick={() => void handleDisable2fa()} disabled={disabling} />
              <Btn label="Abbrechen" variant="outline" onClick={() => { setDisableConfirm(false); setDisableCode(""); setDisableError(""); }} />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Passwort ──────────────────────────────────────────────────────── */}
      <SectionCard title="Passwort" subtitle="Ändern Sie regelmäßig Ihr Passwort für mehr Sicherheit.">
        <Row
          label="Aktuelles Passwort"
          value={<span style={{ fontSize: 12, color: MUTED }}>Zuletzt geändert: unbekannt</span>}
          action={<Btn label={pwSection ? "Abbrechen" : "Passwort ändern"} variant={pwSection ? "outline" : "primary"} onClick={() => { setPwSection((v) => !v); setPwMsg(""); }} />}
        />
        {pwSection && (
          <form onSubmit={(e) => { void handleChangePw(e); }} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { id: "current",  label: "Aktuelles Passwort", key: "current" as const  },
              { id: "next",     label: "Neues Passwort",     key: "next"    as const  },
              { id: "confirm",  label: "Wiederholen",        key: "confirm" as const  },
            ].map(({ id, label, key }) => (
              <div key={id}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 5, fontFamily: F }}>{label}</label>
                <input
                  type="password" id={id} value={pw[key]}
                  onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                  required
                  style={{
                    width: "100%", height: 40, borderRadius: 0, border: `1px solid ${BORDER}`,
                    padding: "0 12px", fontSize: 14, fontFamily: F, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            {pwMsg && (
              <p style={{ margin: 0, fontSize: 12, color: pwMsg.startsWith("✓") ? GREEN : RED, fontFamily: F }}>{pwMsg}</p>
            )}
            <Btn label={pwLoading ? "Wird gespeichert…" : "Passwort speichern"} disabled={pwLoading} />
          </form>
        )}
      </SectionCard>

      {/* ── Passwort vergessen ────────────────────────────────────────────── */}
      <SectionCard title="Konto gesperrt?" subtitle="Wenn Sie Ihr Passwort vergessen haben oder Ihr Konto gesperrt ist.">
        <Row
          label="Passwort zurücksetzen"
          value={<span style={{ fontSize: 12, color: MUTED }}>Eine E-Mail mit Reset-Link wird an Ihre registrierte Adresse gesendet.</span>}
          action={<Btn label="Reset-E-Mail anfordern" variant="outline" onClick={() => {
            if (me?.email) {
              void fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: me.email }) });
            }
          }} />}
        />
      </SectionCard>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginBottom: 8 }}>
          {[
            { label: "Impressum",   href: "/impressum" },
            { label: "Datenschutz", href: "/datenschutz" },
            { label: "AGB",         href: "/agb" },
            { label: "Compliance",  href: "/insights/regulatorik" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{ fontSize: 11, color: MUTED, textDecoration: "none", fontFamily: F }}
              onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
              {label}
            </a>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "#aab0bb", fontFamily: F }}>
          © 2026 EUCX GmbH · Frankfurt am Main · Reguliert durch die BaFin · MiFID II OTF-Zulassung
        </p>
      </footer>
    </div>
  );
}
