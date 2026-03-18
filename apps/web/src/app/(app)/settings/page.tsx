"use client";

/**
 * Einstellungen - /settings
 *
 * Tabs:
 *   - Profil: Anzeige der Kontodaten (read-only)
 *   - Sicherheit: 2FA-Status + Toggle (aktivieren/deaktivieren)
 */

import { useState, useEffect }     from "react";
import { useRouter }               from "next/navigation";
import { useAuthStore }            from "@/store/authStore";

export const dynamic = "force-dynamic";

type Tab = "profile" | "security";

interface TwoFaStatus {
  totpEnabled: boolean;
  email:       string;
}

export default function SettingsPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [tab,       setTab      ] = useState<Tab>("profile");
  const [tfaStatus, setTfaStatus] = useState<TwoFaStatus | null>(null);
  const [tfaLoading,setTfaLoad  ] = useState(true);
  const [disabling, setDisabling] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(false);
  const [error,     setError    ] = useState("");

  // 2FA-Status laden
  useEffect(() => {
    if (tab !== "security") return;

    const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
    fetch("/api/auth/2fa/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<TwoFaStatus & { error?: string }>)
      .then((d) => {
        if (!d.error) setTfaStatus(d);
      })
      .catch(() => {/* ignorieren - zeige Fallback */})
      .finally(() => setTfaLoad(false));
  }, [tab]);

  async function handleDisable2FA() {
    setDisabling(true);
    setError("");
    try {
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
      const res   = await fetch("/api/auth/2fa/disable", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Fehler beim Deaktivieren"); return; }
      setTfaStatus((prev) => prev ? { ...prev, totpEnabled: false } : null);
      setDisableConfirm(false);
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setDisabling(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-cb-petrol mb-6">Einstellungen</h1>

      {/* Tab-Navigation */}
      <div className="flex gap-0 border-b border-cb-gray-200 mb-6">
        {(["profile", "security"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-cb-petrol text-cb-petrol"
                : "border-transparent text-cb-gray-500 hover:text-cb-gray-700"
            }`}
          >
            {t === "profile" ? "Profil" : "Sicherheit"}
          </button>
        ))}
      </div>

      {/* ── Profil ─────────────────────────────────────────────────────── */}
      {tab === "profile" && (
        <div className="bg-cb-white border border-cb-gray-200 rounded-lg divide-y divide-cb-gray-100">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-cb-gray-700 mb-4">Kontoinformationen</h2>
            <dl className="space-y-3">
              <InfoRow label="E-Mail"        value={user.email}   />
              <InfoRow label="Rolle"         value={user.role}    />
              <InfoRow label="Organisation"  value={user.orgName} />
              <InfoRow label="Nutzer-ID"     value={user.id} mono />
            </dl>
          </div>
          <div className="p-5">
            <h2 className="text-sm font-semibold text-cb-gray-700 mb-4">Verknüpfte API-Keys</h2>
            <a
              href="/settings/api"
              className="inline-flex items-center gap-2 text-sm text-cb-petrol hover:text-cb-yellow-dark font-medium"
            >
              API-Keys verwalten →
            </a>
          </div>
        </div>
      )}

      {/* ── Sicherheit ─────────────────────────────────────────────────── */}
      {tab === "security" && (
        <div className="space-y-4">
          {/* 2FA-Karte */}
          <div className="bg-cb-white border border-cb-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-cb-gray-700">
                  Zwei-Faktor-Authentifizierung (2FA)
                </h2>
                <p className="text-xs text-cb-gray-500 mt-1">
                  Schützt Ihr Konto durch einen zweiten Faktor beim Login (TOTP).
                </p>
              </div>
              {tfaLoading ? (
                <div className="w-5 h-5 border-2 border-cb-yellow border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
              ) : (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                  tfaStatus?.totpEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-cb-gray-100 text-cb-gray-500"
                }`}>
                  {tfaStatus?.totpEnabled ? "Aktiviert" : "Deaktiviert"}
                </span>
              )}
            </div>

            {!tfaLoading && (
              <div className="mt-4 pt-4 border-t border-cb-gray-100">
                {tfaStatus?.totpEnabled ? (
                  disableConfirm ? (
                    <div className="space-y-3">
                      <p className="text-sm text-cb-gray-600">
                        Sind Sie sicher? Ihr Konto wird dadurch weniger geschützt.
                      </p>
                      {error && (
                        <p className="text-xs text-cb-error">{error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleDisable2FA()}
                          disabled={disabling}
                          className="px-4 py-2 text-sm bg-cb-error text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {disabling ? "Wird deaktiviert..." : "Ja, 2FA deaktivieren"}
                        </button>
                        <button
                          onClick={() => { setDisableConfirm(false); setError(""); }}
                          className="px-4 py-2 text-sm border border-cb-gray-300 rounded text-cb-gray-600 hover:bg-cb-gray-50 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDisableConfirm(true)}
                      className="text-sm text-cb-error hover:underline"
                    >
                      2FA deaktivieren
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => router.push("/2fa-setup")}
                    className="px-4 py-2 text-sm bg-cb-petrol text-white rounded font-medium hover:bg-cb-petrol-dark transition-colors"
                  >
                    2FA einrichten
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Session-Hinweis */}
          <div className="bg-cb-white border border-cb-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-cb-gray-700 mb-3">Aktive Session</h2>
            <p className="text-xs text-cb-gray-500">
              Ihre Session läuft nach 15 Minuten Inaktivität ab und wird automatisch erneuert,
              sofern Sie im Browser aktiv sind. Bei Verdacht auf unbefugten Zugriff klicken Sie
              auf Abmelden.
            </p>
            <button
              onClick={() => {
                const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
                void fetch("/api/auth/logout", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  credentials: "include",
                }).finally(() => {
                  useAuthStore.getState().logout();
                });
              }}
              className="mt-3 text-sm text-cb-error hover:underline"
            >
              Jetzt abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <dt className="text-xs text-cb-gray-500 w-32 flex-shrink-0">{label}</dt>
      <dd className={`text-sm text-cb-gray-800 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
