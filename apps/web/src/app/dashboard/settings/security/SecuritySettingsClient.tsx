"use client";

import { useState, useEffect } from "react";
import { EucxLogo }            from "@/components/logo/EucxLogo";
import { LanguageSwitcher }    from "@/components/LanguageSwitcher";
import { NotificationBell }   from "@/components/NotificationBell";
import { QRCodeSVG }           from "qrcode.react";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const BLUE2  = "#0f3070";
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

interface Session {
  id:        string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface SecurityLogEntry {
  id:        string;
  action:    string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  meta?:     Record<string, unknown>;
}

// ─── Sub-Komponenten ──────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderTop: `3px solid ${BLUE}`, marginBottom: 16 }}>
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
  const base: React.CSSProperties = {
    height: 36, padding: "0 16px", borderRadius: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13, fontWeight: 600, fontFamily: F,
    opacity: disabled ? 0.5 : 1,
    transition: "background 150ms, color 150ms, border-color 150ms, transform 150ms, box-shadow 150ms",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: BLUE,  color: "#fff", border: "none" },
    outline: { background: "#fff", color: TEXT,  border: `1px solid ${BORDER}` },
    danger:  { background: "#fff", color: RED,   border: `1px solid #fecaca` },
  };
  const hover: Record<string, Partial<React.CSSProperties>> = {
    primary: { background: BLUE2, transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(21,65,148,.25)" },
    outline: { background: BG,    transform: "translateY(-2px)", boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
    danger:  { background: "#fef2f2", borderColor: RED, transform: "translateY(-2px)", boxShadow: "0 2px 8px rgba(220,38,38,.15)" },
  };

  const [hovered, setHovered] = useState(false);
  const style = {
    ...base,
    ...styles[variant],
    ...(hovered && !disabled ? hover[variant] : {}),
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}

// ─── 2FA Setup Inline ─────────────────────────────────────────────────────────

function TotpSetup({ token, onActivated }: { token: string; onActivated: (generatedCodes: string[]) => void }) {
  const [step,      setStep]      = useState<"loading" | "scan" | "verify" | "done">("loading");
  const [qrUrl,     setQrUrl]     = useState("");
  const [secret,    setSecret]    = useState("");
  const [code,      setCode]      = useState("");
  const [error,     setError]     = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<{ otpAuthUrl?: string; secret?: string; error?: string }>)
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setQrUrl(d.otpAuthUrl ?? "");
        setSecret(d.secret ?? "");
        setStep("scan");
      })
      .catch(() => setError("Verbindungsfehler."));
  }, [token]);

  async function verify() {
    if (code.length !== 6) { setError("Bitte 6-stelligen Code eingeben."); return; }
    setVerifying(true); setError("");
    try {
      const res  = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Code ungültig."); return; }

      // Auto-generate backup codes on first 2FA activation
      let generatedCodes: string[] = [];
      try {
        const bcRes  = await fetch("/api/auth/backup-codes", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const bcData = await bcRes.json() as { codes?: string[] };
        generatedCodes = bcData.codes ?? [];
      } catch { /* ignore */ }

      setStep("done");
      setTimeout(() => onActivated(generatedCodes), 800);
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setVerifying(false);
    }
  }

  if (step === "loading") return (
    <div style={{ padding: "20px 0", color: MUTED, fontSize: 13 }}>QR-Code wird generiert…</div>
  );

  if (step === "done") return (
    <div style={{ padding: "14px 16px", background: "#f0fdf4", border: `1px solid #bbf7d0`, display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>2FA erfolgreich aktiviert.</span>
    </div>
  );

  return (
    <div style={{ marginTop: 16, background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${BLUE}`, padding: "20px 20px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: TEXT }}>2FA einrichten</p>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
        Scannen Sie den QR-Code mit Ihrer Authenticator-App (Google Authenticator, Authy etc.) und geben Sie anschließend den 6-stelligen Code ein.
      </p>

      {step === "scan" && (
        <>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ background: "#fff", padding: 12, border: `1px solid ${BORDER}`, display: "inline-block" }}>
              {qrUrl && <QRCodeSVG value={qrUrl} size={160} />}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: TEXT }}>Manueller Schlüssel</p>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
                Falls Sie den QR-Code nicht scannen können, geben Sie diesen Schlüssel manuell in Ihre App ein:
              </p>
              <code style={{
                display: "block", background: "#fff", border: `1px solid ${BORDER}`,
                padding: "8px 12px", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em",
                wordBreak: "break-all", color: BLUE, fontFamily: "monospace",
              }}>
                {secret}
              </code>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6, fontFamily: F }}>
              Code aus Ihrer App eingeben
            </label>
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
              placeholder="000000"
              style={{
                width: "100%", maxWidth: 200, height: 44, borderRadius: 0, boxSizing: "border-box",
                border: `1px solid ${error ? RED : BORDER}`,
                textAlign: "center", fontSize: 22, fontWeight: 700, letterSpacing: "0.3em",
                fontFamily: "monospace", outline: "none",
              }}
            />
          </div>
          {error && <p style={{ margin: "0 0 8px", fontSize: 12, color: RED }}>{error}</p>}
          <Btn
            label={verifying ? "Wird geprüft…" : "Code bestätigen & 2FA aktivieren"}
            onClick={() => void verify()}
            disabled={verifying || code.length !== 6}
          />
        </>
      )}
    </div>
  );
}

// ─── Hauptkomponente ───────────────────────────────────────────────────────────

export function SecuritySettingsClient() {
  const [token,          setToken]          = useState("");
  const [me,             setMe]             = useState<MeData | null>(null);
  const [totpEnabled,    setTotpEnabled]    = useState(false);
  const [showSetup,      setShowSetup]      = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(false);
  const [disabling,      setDisabling]      = useState(false);
  const [disableCode,    setDisableCode]    = useState("");
  const [disableError,   setDisableError]   = useState("");
  const [pwSection,      setPwSection]      = useState(false);
  const [pw,             setPw]             = useState({ current: "", next: "", confirm: "" });
  const [pwLoading,      setPwLoading]      = useState(false);
  const [pwMsg,          setPwMsg]          = useState("");
  const [resetMsg,       setResetMsg]       = useState("");

  // Backup Codes
  const [backupCount,   setBackupCount]   = useState<number | null>(null);
  const [backupCodes,   setBackupCodes]   = useState<string[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupCopied,  setBackupCopied]  = useState(false);

  // Sessions
  const [sessions,        setSessions]        = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokeLoading,   setRevokeLoading]   = useState(false);
  const [revokeMsg,       setRevokeMsg]       = useState("");

  // Security Log
  const [secLog,        setSecLog]        = useState<SecurityLogEntry[]>([]);
  const [secLogLoading, setSecLogLoading] = useState(false);

  useEffect(() => {
    const tkn = getToken();
    setToken(tkn);
    if (!tkn) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json() as Promise<MeData & { totpEnabled?: boolean }>)
      .then((d) => { setMe(d); setTotpEnabled(d.totpEnabled ?? false); })
      .catch(() => {});

    // Load sessions
    setSessionsLoading(true);
    fetch("/api/auth/sessions", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json() as Promise<{ sessions?: Session[] }>)
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));

    // Load security log
    setSecLogLoading(true);
    fetch("/api/security/log", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json() as Promise<{ logs?: SecurityLogEntry[] }>)
      .then((d) => setSecLog(d.logs ?? []))
      .catch(() => {})
      .finally(() => setSecLogLoading(false));
  }, []);

  // Load backup code count when totpEnabled changes
  useEffect(() => {
    if (!token || !totpEnabled) return;
    fetch("/api/auth/backup-codes", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json() as Promise<{ remaining?: number }>)
      .then((d) => setBackupCount(d.remaining ?? 0))
      .catch(() => {});
  }, [token, totpEnabled]);

  async function handleDisable2fa() {
    if (disableCode.length !== 6) { setDisableError("Bitte 6-stelligen Code eingeben."); return; }
    setDisabling(true); setDisableError("");
    try {
      const res  = await fetch("/api/auth/2fa/disable", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ code: disableCode }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setDisableError(data.error ?? "Code ungültig."); return; }
      setTotpEnabled(false);
      setDisableConfirm(false);
      setDisableCode("");
      setBackupCount(null);
      setBackupCodes([]);
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
    setPwLoading(true); setPwMsg("");
    try {
      const res  = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
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

  async function handleResetEmail() {
    if (!me?.email) return;
    setResetMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: me.email }),
      });
      if (res.ok) {
        setResetMsg(`✓ Reset-E-Mail wurde an ${me.email} gesendet.`);
      } else {
        setResetMsg("Fehler beim Senden. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setResetMsg("Verbindungsfehler.");
    }
  }

  async function handleGenerateBackupCodes() {
    setBackupLoading(true); setBackupCopied(false);
    try {
      const res  = await fetch("/api/auth/backup-codes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { codes?: string[] };
      if (data.codes) {
        setBackupCodes(data.codes);
        setBackupCount(data.codes.length);
      }
    } catch { /* ignore */ }
    finally { setBackupLoading(false); }
  }

  function handleCopyBackupCodes() {
    void navigator.clipboard.writeText(backupCodes.join("\n")).then(() => {
      setBackupCopied(true);
      setTimeout(() => setBackupCopied(false), 2000);
    });
  }

  async function handleRevokeSessions() {
    setRevokeLoading(true); setRevokeMsg("");
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRevokeMsg("✓ Alle anderen Sitzungen wurden beendet.");
        setSessions([]);
      } else {
        setRevokeMsg("Fehler beim Beenden der Sitzungen.");
      }
    } catch {
      setRevokeMsg("Verbindungsfehler.");
    } finally {
      setRevokeLoading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function parseUA(ua: string): string {
    if (!ua || ua === "unbekannt") return "Unbekanntes Gerät";
    if (/iPhone|iPad/.test(ua))    return "iPhone / iPad";
    if (/Android/.test(ua))        return "Android";
    if (/Windows/.test(ua))        return "Windows";
    if (/Macintosh|Mac OS/.test(ua)) return "Mac";
    if (/Linux/.test(ua))          return "Linux";
    return "Browser";
  }

  const ACTION_LABELS: Record<string, string> = {
    LOGIN:                   "Anmeldung",
    LOGOUT:                  "Abmeldung",
    PASSWORD_CHANGED:        "Passwort geändert",
    PASSWORD_RESET:          "Passwort zurückgesetzt",
    "2FA_ENABLED":           "2FA aktiviert",
    "2FA_DISABLED":          "2FA deaktiviert",
    BACKUP_CODES_GENERATED:  "Backup-Codes generiert",
    SESSION_REVOKED:         "Sitzung beendet",
    ADMIN_ACTION:            "Admin-Aktion",
    ACCOUNT_LOCKED:          "Konto gesperrt",
  };

  return (
    <>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{
        background: "#154194", height: 56, padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, fontFamily: F,
      }}>
        <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <EucxLogo variant="dark" size="md" />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSwitcher dark />
          {token && <NotificationBell token={token} />}
          <a href="/dashboard/buyer"
            style={{ fontSize: 12, color: "rgba(255,255,255,.8)", textDecoration: "none", padding: "5px 10px", border: "1px solid rgba(255,255,255,.3)", transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            ← Dashboard
          </a>
        </div>
      </header>

      {/* ── Seiteninhalt ──────────────────────────────────────────────────── */}
      <div style={{ minHeight: "calc(100vh - 56px)", background: BG }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 80px", fontFamily: F }}>

        {/* Titel */}
        <div style={{ marginBottom: 24, borderLeft: `4px solid ${BLUE}`, paddingLeft: 16 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 300, color: TEXT }}>Sicherheit</h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            Verwalten Sie Ihre Anmeldemethoden und schützen Sie Ihr Handelskonto.
          </p>
        </div>

        {/* Sicherheits-Score */}
        {me && (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, marginBottom: 20 }}>
            <div style={{ background: BLUE, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Sicherheitsstatus</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,.6)" }}>
                  Erfüllen Sie alle Kriterien für maximalen Schutz.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { ok: true },
                  { ok: totpEnabled },
                  { ok: me.verificationStatus === "VERIFIED" },
                ].map(({ ok }, i) => (
                  <div key={i} style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: ok ? "#22c55e" : "rgba(255,255,255,.25)",
                    border: ok ? "none" : "1px solid rgba(255,255,255,.4)",
                  }} />
                ))}
              </div>
            </div>
            <div style={{ height: 3, background: BLUE2 }} />
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "E-Mail bestätigt",              ok: true,                                href: null },
                { label: "Zwei-Faktor-Authentifizierung", ok: totpEnabled,                         href: null },
                { label: "KYC-Verifizierung",             ok: me.verificationStatus === "VERIFIED", href: "/dashboard/settings/verification" },
              ].map(({ label, ok, href }) => (
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
                  {!ok && href && (
                    <a href={href} style={{ fontSize: 11, color: "#d97706", marginLeft: "auto", fontWeight: 600, textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                      Jetzt einrichten →
                    </a>
                  )}
                  {!ok && !href && (
                    <span style={{ fontSize: 11, color: "#d97706", marginLeft: "auto", fontWeight: 600 }}>Empfohlen</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2FA */}
        <SectionCard
          title="Zwei-Faktor-Authentifizierung (2FA)"
          subtitle="Schützt Ihr Konto auch wenn Ihr Passwort kompromittiert wurde."
        >
          <Row
            label="TOTP Authenticator"
            value={<StatusPill active={totpEnabled} labelOn="Aktiv" labelOff="Nicht aktiv" />}
            action={
              totpEnabled
                ? <Btn label="Deaktivieren" variant="danger" onClick={() => { setDisableConfirm((v) => !v); setShowSetup(false); }} />
                : <Btn label={showSetup ? "Abbrechen" : "Jetzt einrichten →"} variant={showSetup ? "outline" : "primary"} onClick={() => { setShowSetup((v) => !v); setDisableConfirm(false); }} />
            }
          />

          {/* App-Empfehlung wenn nicht aktiv und kein Setup offen */}
          {!totpEnabled && !showSetup && (
            <div style={{ marginTop: 16, background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${BLUE}`, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: TEXT }}>
                Wir empfehlen eine Authenticator-App
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                Authenticator-Apps generieren einmalige 6-stellige Codes, die nur 30 Sekunden gültig sind — unabhängig von Ihrer Internetverbindung.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { name: "Google Authenticator", ios: "https://apps.apple.com/de/app/google-authenticator/id388497605",     android: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" },
                  { name: "Microsoft Authenticator", ios: "https://apps.apple.com/de/app/microsoft-authenticator/id983156458", android: "https://play.google.com/store/apps/details?id=com.azure.authenticator" },
                  { name: "Authy",                  ios: "https://apps.apple.com/de/app/twilio-authy/id494168017",            android: "https://play.google.com/store/apps/details?id=com.authy.authy" },
                ].map(({ name, ios, android }) => (
                  <div key={name} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "10px 14px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: TEXT }}>{name}</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <a href={ios}     target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: BLUE, textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                        App Store →
                      </a>
                      <a href={android} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: BLUE, textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                        Google Play →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2FA Setup Inline */}
          {showSetup && token && (
            <TotpSetup
              token={token}
              onActivated={(codes) => {
                setTotpEnabled(true);
                setShowSetup(false);
                if (codes.length > 0) {
                  setBackupCodes(codes);
                  setBackupCount(codes.length);
                }
              }}
            />
          )}

          {/* Deaktivierungs-Formular */}
          {disableConfirm && (
            <div style={{ marginTop: 16, background: "#fef2f2", border: `1px solid #fecaca`, borderLeft: `3px solid ${RED}`, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: RED }}>2FA deaktivieren</p>
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
                <Btn label={disabling ? "Wird deaktiviert…" : "Bestätigen"} variant="danger" onClick={() => void handleDisable2fa()} disabled={disabling} />
                <Btn label="Abbrechen" variant="outline" onClick={() => { setDisableConfirm(false); setDisableCode(""); setDisableError(""); }} />
              </div>
            </div>
          )}
        </SectionCard>

        {/* Backup-Codes (nur wenn 2FA aktiv) */}
        {totpEnabled && (
          <SectionCard
            title="Backup-Codes"
            subtitle="Einmalcodes für den Notfallzugang wenn Ihre Authenticator-App nicht verfügbar ist."
          >
            <Row
              label="Verbleibende Codes"
              value={
                <span style={{ fontSize: 12, color: MUTED }}>
                  {backupCount === null ? "Wird geladen…" : `${backupCount} von 8 Codes noch verfügbar`}
                </span>
              }
              action={
                <Btn
                  label={backupLoading ? "Generiert…" : "Neue Codes generieren"}
                  variant="outline"
                  onClick={() => void handleGenerateBackupCodes()}
                  disabled={backupLoading}
                />
              }
            />

            {backupCodes.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid #d97706`, padding: "14px 16px", marginBottom: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#92400e" }}>
                    Wichtig: Speichern Sie diese Codes sicher
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                    Diese Codes werden nur einmal angezeigt. Speichern Sie sie an einem sicheren Ort — z. B. in einem Passwort-Manager.
                  </p>
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                  background: "#fff", border: `1px solid ${BORDER}`, padding: "16px",
                  marginBottom: 12,
                }}>
                  {backupCodes.map((c) => (
                    <code key={c} style={{
                      fontSize: 14, fontWeight: 700, letterSpacing: "0.15em",
                      fontFamily: "monospace", color: TEXT, padding: "6px 8px",
                      background: BG, border: `1px solid ${BORDER}`, textAlign: "center",
                    }}>
                      {c}
                    </code>
                  ))}
                </div>
                <Btn
                  label={backupCopied ? "✓ Kopiert" : "Alle Codes kopieren"}
                  variant="outline"
                  onClick={handleCopyBackupCodes}
                />
              </div>
            )}
          </SectionCard>
        )}

        {/* Passwort */}
        <SectionCard title="Passwort" subtitle="Ändern Sie regelmäßig Ihr Passwort für mehr Sicherheit.">
          <Row
            label="Passwort ändern"
            value={<span style={{ fontSize: 12, color: MUTED }}>Mindestens 8 Zeichen, inkl. Groß-/Kleinbuchstaben.</span>}
            action={<Btn label={pwSection ? "Abbrechen" : "Passwort ändern"} variant={pwSection ? "outline" : "primary"} onClick={() => { setPwSection((v) => !v); setPwMsg(""); }} />}
          />
          {pwMsg && !pwSection && (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: pwMsg.startsWith("✓") ? GREEN : RED, fontFamily: F }}>{pwMsg}</p>
          )}
          <Row
            label="Passwort vergessen?"
            value={<span style={{ fontSize: 12, color: MUTED }}>Eine Reset-E-Mail an Ihre registrierte Adresse senden.</span>}
            action={<Btn label="Reset-E-Mail anfordern" variant="outline" onClick={() => void handleResetEmail()} />}
          />
          {resetMsg && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: resetMsg.startsWith("✓") ? GREEN : RED, fontFamily: F }}>
              {resetMsg}
            </p>
          )}
          {pwSection && (
            <form onSubmit={(e) => { void handleChangePw(e); }} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { id: "current", label: "Aktuelles Passwort", key: "current" as const },
                { id: "next",    label: "Neues Passwort",     key: "next"    as const },
                { id: "confirm", label: "Wiederholen",        key: "confirm" as const },
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
                      transition: "border-color .15s",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                    onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                  />
                </div>
              ))}
              {pwMsg && (
                <p style={{ margin: 0, fontSize: 12, color: pwMsg.startsWith("✓") ? GREEN : RED, fontFamily: F }}>{pwMsg}</p>
              )}
              <div>
                <Btn label={pwLoading ? "Wird gespeichert…" : "Passwort speichern"} disabled={pwLoading} />
              </div>
            </form>
          )}
        </SectionCard>

        {/* Sitzungsmanagement */}
        <SectionCard
          title="Aktive Sitzungen"
          subtitle="Alle Geräte und Browser, auf denen Sie aktuell angemeldet sind."
        >
          {sessionsLoading ? (
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Wird geladen…</p>
          ) : sessions.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Keine weiteren aktiven Sitzungen gefunden.</p>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {sessions.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 0",
                  borderBottom: i < sessions.length - 1 ? `1px solid ${BORDER}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, background: BG, border: `1px solid ${BORDER}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT }}>{parseUA(s.userAgent)}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>
                        {s.ipAddress} · {formatDate(s.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <Btn
              label={revokeLoading ? "Wird beendet…" : "Alle anderen Sitzungen beenden"}
              variant="danger"
              onClick={() => void handleRevokeSessions()}
              disabled={revokeLoading || sessions.length === 0}
            />
            {revokeMsg && (
              <p style={{ margin: 0, fontSize: 12, color: revokeMsg.startsWith("✓") ? GREEN : RED }}>{revokeMsg}</p>
            )}
          </div>
        </SectionCard>

        {/* Sicherheitsprotokoll */}
        <SectionCard
          title="Sicherheitsprotokoll"
          subtitle="Die letzten 15 sicherheitsrelevanten Aktionen auf Ihrem Konto."
        >
          {secLogLoading ? (
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Wird geladen…</p>
          ) : secLog.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Noch keine Sicherheitsereignisse vorhanden.</p>
          ) : (
            <div>
              {secLog.map((entry, i) => (
                <div key={entry.id} style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  padding: "11px 0",
                  borderBottom: i < secLog.length - 1 ? `1px solid ${BORDER}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                      background: entry.action.includes("DISABLED") || entry.action === "ACCOUNT_LOCKED"
                        ? RED : entry.action === "LOGIN" ? GREEN : BLUE,
                    }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT }}>
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>
                        {entry.ipAddress} · {parseUA(entry.userAgent)}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: MUTED, flexShrink: 0, marginLeft: 12, marginTop: 1 }}>
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Footer */}
        <footer style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginBottom: 8 }}>
            {[
              { label: "Impressum",         href: "/impressum" },
              { label: "Datenschutz",       href: "/datenschutz" },
              { label: "AGB",               href: "/agb" },
              { label: "Compliance",        href: "/insights/regulatorik" },
              { label: "Passwort vergessen", href: "/login?reset=1" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                style={{ fontSize: 11, color: MUTED, textDecoration: "none", fontFamily: F }}
                onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                {label}
              </a>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#aab0bb", fontFamily: F }}>
            © 2026 EUCX GmbH · Frankfurt am Main · Reguliert durch die BaFin · MiFID II OTF-Zulassung
          </p>
        </footer>
      </div>
      </div>
    </>
  );
}
