"use client";

import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import { useAuthStore }        from "@/store/authStore";

export const dynamic = "force-dynamic";

type Tab = "profile" | "security";

interface TwoFaStatus { totpEnabled: boolean; email: string; }

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const RED  = "#dc2626";

export default function SettingsPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [tab,           setTab          ] = useState<Tab>("profile");
  const [tfaStatus,     setTfaStatus    ] = useState<TwoFaStatus | null>(null);
  const [tfaLoading,    setTfaLoad      ] = useState(true);
  const [disabling,     setDisabling    ] = useState(false);
  const [disableConfirm,setDisableConfirm] = useState(false);
  const [error,         setError        ] = useState("");

  useEffect(() => {
    if (tab !== "security") return;
    const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
    fetch("/api/auth/2fa/status", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json() as Promise<TwoFaStatus & { error?: string }>)
      .then((d) => { if (!d.error) setTfaStatus(d); })
      .catch(() => {})
      .finally(() => setTfaLoad(false));
  }, [tab]);

  async function handleDisable2FA() {
    setDisabling(true); setError("");
    try {
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
      const res   = await fetch("/api/auth/2fa/disable", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Fehler beim Deaktivieren"); return; }
      setTfaStatus((prev) => prev ? { ...prev, totpEnabled: false } : null);
      setDisableConfirm(false);
    } catch { setError("Verbindungsfehler."); }
    finally  { setDisabling(false); }
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: 640, fontFamily: F }}>

      {/* ── Seitenkopf ── */}
      <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: "0 0 24px" }}>Einstellungen</h1>

      {/* ── Tab-Navigation ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: 24 }}>
        {(["profile", "security"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 20px", fontSize: 13,
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? BLUE : "#505050",
            borderBottom: tab === t ? `2px solid ${BLUE}` : "2px solid transparent",
            background: "none", border: "none",
            borderBottomStyle: "solid",
            borderBottomWidth: 2,
            borderBottomColor: tab === t ? BLUE : "transparent",
            cursor: "pointer", fontFamily: F,
            marginBottom: -1,
          }}>
            {t === "profile" ? "Profil" : "Sicherheit"}
          </button>
        ))}
      </div>

      {/* ── Profil ── */}
      {tab === "profile" && (
        <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: "0 0 16px" }}>Kontoinformationen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <InfoRow label="E-Mail"       value={user.email}   />
              <InfoRow label="Rolle"        value={user.role}    />
              <InfoRow label="Organisation" value={user.orgName} />
              <InfoRow label="Nutzer-ID"    value={user.id} mono />
            </div>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: "0 0 12px" }}>Verknüpfte API-Keys</h2>
            <a href="/settings/api" style={{ fontSize: 13, color: BLUE, fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
              API-Keys verwalten →
            </a>
          </div>
        </div>
      )}

      {/* ── Sicherheit ── */}
      {tab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e8e8e8" }}>

          {/* 2FA-Karte */}
          <div style={{ backgroundColor: "#fff", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>
                  Zwei-Faktor-Authentifizierung (2FA)
                </h2>
                <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  Schützt Ihr Konto durch einen zweiten Faktor beim Login (TOTP).
                </p>
              </div>
              {tfaLoading ? (
                <div style={{ width: 18, height: 18, border: `2px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", flexShrink: 0 }} />
              ) : (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", flexShrink: 0,
                  color:           tfaStatus?.totpEnabled ? "#166534" : "#505050",
                  backgroundColor: tfaStatus?.totpEnabled ? "#f0fdf4" : "#f5f5f5",
                }}>
                  {tfaStatus?.totpEnabled ? "Aktiviert" : "Deaktiviert"}
                </span>
              )}
            </div>

            {!tfaLoading && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                {tfaStatus?.totpEnabled ? (
                  disableConfirm ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <p style={{ fontSize: 13, color: "#505050", margin: 0 }}>
                        Sind Sie sicher? Ihr Konto wird dadurch weniger geschützt.
                      </p>
                      {error && <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => void handleDisable2FA()} disabled={disabling}
                          style={{ height: 34, padding: "0 16px", backgroundColor: RED, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F, opacity: disabling ? 0.6 : 1 }}>
                          {disabling ? "Wird deaktiviert…" : "Ja, 2FA deaktivieren"}
                        </button>
                        <button onClick={() => { setDisableConfirm(false); setError(""); }}
                          style={{ height: 34, padding: "0 16px", border: "1px solid #d0d0d0", backgroundColor: "#fff", fontSize: 13, color: "#505050", cursor: "pointer", fontFamily: F }}>
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setDisableConfirm(true)}
                      style={{ fontSize: 13, color: RED, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: F }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                      2FA deaktivieren
                    </button>
                  )
                ) : (
                  <button onClick={() => router.push("/2fa-setup")}
                    style={{ height: 34, padding: "0 16px", backgroundColor: BLUE, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLUE)}>
                    2FA einrichten
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Session-Karte */}
          <div style={{ backgroundColor: "#fff", padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: "0 0 8px" }}>Aktive Session</h2>
            <p style={{ fontSize: 12, color: "#888", margin: 0, lineHeight: 1.7 }}>
              Ihre Session läuft nach 15 Minuten Inaktivität ab und wird automatisch erneuert,
              sofern Sie im Browser aktiv sind. Bei Verdacht auf unbefugten Zugriff klicken Sie auf Abmelden.
            </p>
            <button onClick={() => {
              const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
              void fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
                .finally(() => { useAuthStore.getState().logout(); });
            }}
              style={{ marginTop: 12, fontSize: 13, color: RED, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: F }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
              Jetzt abmelden
            </button>
          </div>

        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <dt style={{ fontSize: 12, color: "#888", width: 120, flexShrink: 0 }}>{label}</dt>
      <dd style={{ fontSize: 13, color: "#0d1b2a", fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined, margin: 0 }}>
        {value}
      </dd>
    </div>
  );
}
