"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";
import { toast } from "sonner";

const BLUE  = "#154194";
const BLUE2 = "#0f3070";
const RED   = "#dc2626";
const GREEN = "#16a34a";
const F     = "'IBM Plex Sans', Arial, sans-serif";

const SCOPE_INFO: Record<string, { label: string; desc: string; color: string }> = {
  "market:read":  { label: "Markt lesen",      desc: "Kurse, Orderbuch, Handelssitzungen und OHLC-Kerzendaten abrufen", color: "#154194" },
  "trade:write":  { label: "Handel schreiben", desc: "Ausschreibungen erstellen, Gebote abgeben, Registrierungen verwalten", color: "#16a34a" },
  "wallet:read":  { label: "Konto lesen",      desc: "Kontostand, Gebühren und Transaktionsverlauf abrufen", color: "#7c3aed" },
};

const ALL_SCOPES = Object.keys(SCOPE_INFO) as Array<keyof typeof SCOPE_INFO>;

interface ApiKey {
  id:          string;
  prefix:      string;
  name:        string;
  scopes:      string[];
  isActive:    boolean;
  expiresAt:   string | null;
  lastUsedAt:  string | null;
  ipWhitelist: string[];
  createdAt:   string;
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

const fmtDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export function ApiKeysClient() {
  const router = useRouter();
  const [token,      setToken]      = useState("");
  const [keys,       setKeys]       = useState<ApiKey[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revoking,   setRevoking]   = useState<string | null>(null);
  const [confirmId,  setConfirmId]  = useState<string | null>(null);
  const [newKey,     setNewKey]     = useState<string | null>(null);
  const [copied,     setCopied]     = useState(false);

  // Formular
  const [name,       setName]       = useState("");
  const [scopes,     setScopes]     = useState<string[]>(["market:read"]);
  const [expiryDate, setExpiryDate] = useState("");
  const [ipInput,    setIpInput]    = useState("");
  const [ipList,     setIpList]     = useState<string[]>([]);
  const [creating,   setCreating]   = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch("/api/settings/api-keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json() as { data: ApiKey[] };
        setKeys(d.data ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim())       { setFormError("Name ist erforderlich."); return; }
    if (scopes.length === 0) { setFormError("Mindestens ein Scope muss ausgewählt sein."); return; }

    setCreating(true);
    try {
      const body: Record<string, unknown> = { name: name.trim(), scopes };
      if (expiryDate)       body.expiresAt   = new Date(expiryDate).toISOString();
      if (ipList.length > 0) body.ipWhitelist = ipList;

      const r = await fetch("/api/settings/api-keys", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const d = await r.json() as { data?: { fullKey: string }; error?: string };
      if (!r.ok) { setFormError(d.error ?? "Fehler beim Erstellen."); return; }

      setNewKey(d.data?.fullKey ?? null);
      setShowCreate(false);
      setName(""); setScopes(["market:read"]); setExpiryDate(""); setIpInput(""); setIpList([]);
      await load();
    } catch {
      setFormError("Netzwerkfehler — bitte erneut versuchen.");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    setRevoking(id);
    try {
      const r = await fetch(`/api/settings/api-keys/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        toast.success("API-Schlüssel widerrufen", {
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
        setConfirmId(null);
        await load();
      } else {
        const d = await r.json() as { error?: string };
        toast.error(d.error ?? "Widerruf fehlgeschlagen");
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setRevoking(null);
    }
  }

  function addIp() {
    const v = ipInput.trim();
    if (!v) return;
    if (ipList.includes(v)) { setFormError("Diese IP ist bereits in der Liste."); return; }
    const ipv4  = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    const ipv6  = /^[0-9a-fA-F:]+$/;
    if (!ipv4.test(v) && !ipv6.test(v)) {
      setFormError("Ungültige IP-Adresse oder CIDR-Block (z.B. 85.214.1.0/24).");
      return;
    }
    setIpList(l => [...l, v]);
    setIpInput("");
    setFormError(null);
  }

  const activeKeys = keys.filter(k => k.isActive);

  return (
    <>
      <style>{`
        .ak-root { font-family:${F}; min-height:100vh; background:#f7f9fc; color:#0d1b2a; }
        .ak-page { max-width:1000px; margin:0 auto; padding:36px 24px 80px; }

        /* Security notice */
        .ak-notice { background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid ${BLUE}; padding:16px 20px; margin-bottom:32px; display:flex; gap:14px; align-items:flex-start; }
        .ak-notice-icon { font-size:20px; flex-shrink:0; line-height:1.4; }
        .ak-notice-text { font-size:12.5px; color:#1e3a8a; line-height:1.75; }
        .ak-notice-text strong { font-weight:700; }

        /* Page header */
        .ak-head-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:8px; flex-wrap:wrap; }
        .ak-title { font-size:22px; font-weight:700; color:#0d1b2a; margin:0; }
        .ak-sub   { font-size:13px; color:#6b7280; margin:4px 0 24px; }
        .ak-btn-new { padding:10px 20px; background:${BLUE}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; white-space:nowrap; transition:background .15s; flex-shrink:0; }
        .ak-btn-new:hover:not(:disabled) { background:${BLUE2}; }
        .ak-btn-new:disabled { opacity:.5; cursor:not-allowed; }

        /* Limit bar */
        .ak-limit-bar { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
        .ak-limit-track { flex:1; max-width:200px; height:4px; background:#e5e7eb; }
        .ak-limit-fill  { height:4px; background:${BLUE}; transition:width .3s; }
        .ak-limit-text  { font-size:12px; color:#9ca3af; }
        .ak-limit-text strong { color:${BLUE}; }

        /* Create form */
        .ak-form-wrap { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${BLUE}; padding:28px; margin-bottom:28px; }
        .ak-form-title { font-size:15px; font-weight:700; color:#111827; margin-bottom:24px; }
        .ak-field { margin-bottom:20px; }
        .ak-label { display:block; font-size:12.5px; font-weight:600; color:#374151; margin-bottom:6px; }
        .ak-label-hint { font-size:11.5px; font-weight:400; color:#9ca3af; margin-left:6px; }
        .ak-input { width:100%; box-sizing:border-box; height:40px; border:1px solid #d1d5db; padding:0 12px; font-size:14px; font-family:${F}; outline:none; transition:border-color .15s; }
        .ak-input:focus { border-color:${BLUE}; box-shadow:0 0 0 2px rgba(21,65,148,.08); }

        /* Scopes */
        .ak-scopes { display:flex; flex-direction:column; gap:8px; }
        .ak-scope-item { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border:1px solid #e5e7eb; cursor:pointer; transition:border-color .15s,background .15s; user-select:none; }
        .ak-scope-item.selected { border-color:${BLUE}; background:#eff6ff; }
        .ak-scope-item:hover:not(.selected) { border-color:#93c5fd; background:#f8faff; }
        .ak-scope-cb { width:16px; height:16px; flex-shrink:0; margin-top:2px; accent-color:${BLUE}; }
        .ak-scope-name { font-size:13px; font-weight:700; color:#111827; font-family:"IBM Plex Mono",monospace; margin-bottom:3px; }
        .ak-scope-desc { font-size:12px; color:#6b7280; line-height:1.5; }

        /* IP Whitelist */
        .ak-ip-row  { display:flex; gap:8px; }
        .ak-btn-ip  { padding:0 16px; height:40px; background:#f0f5ff; color:${BLUE}; border:1px solid #c7d7fc; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; transition:background .15s; flex-shrink:0; }
        .ak-btn-ip:hover { background:#dbeafe; }
        .ak-ip-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .ak-ip-chip  { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:#f0f5ff; border:1px solid #c7d7fc; font-size:12px; font-family:"IBM Plex Mono",monospace; color:#1e3a8a; }
        .ak-ip-rm    { background:none; border:none; cursor:pointer; color:#9ca3af; font-size:15px; line-height:1; padding:0 0 0 2px; }
        .ak-ip-rm:hover { color:${RED}; }

        /* Form states */
        .ak-form-err { font-size:12.5px; color:${RED}; padding:10px 14px; background:#fef2f2; border:1px solid #fecaca; margin-bottom:16px; }
        .ak-form-actions { display:flex; gap:10px; margin-top:24px; }
        .ak-btn-submit { padding:10px 24px; background:${BLUE}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .ak-btn-submit:hover:not(:disabled) { background:${BLUE2}; }
        .ak-btn-submit:disabled { opacity:.5; cursor:not-allowed; }
        .ak-btn-cancel { padding:10px 20px; background:#fff; color:#374151; font-size:13px; font-weight:600; border:1px solid #d1d5db; cursor:pointer; }
        .ak-btn-cancel:hover { background:#f9fafb; }

        /* Table */
        .ak-table-wrap { overflow-x:auto; }
        .ak-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .ak-table th { padding:11px 14px; text-align:left; font-size:10.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#9ca3af; border-bottom:2px solid ${BLUE}; white-space:nowrap; }
        .ak-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .ak-table tr:last-child td { border-bottom:none; }
        .ak-table tr:hover td { background:#fafafa; }

        /* Scope badges */
        .ak-sbadge { display:inline-block; padding:2px 8px; font-size:10.5px; font-weight:700; font-family:"IBM Plex Mono",monospace; margin:2px; white-space:nowrap; }

        /* Status */
        .ak-status-on  { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; color:${GREEN}; }
        .ak-status-off { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; color:#9ca3af; }
        .ak-dot { width:7px; height:7px; border-radius:50%; display:inline-block; }

        /* Revoke */
        .ak-btn-revoke   { padding:6px 12px; background:#fff; color:${RED}; font-size:11.5px; font-weight:700; border:1.5px solid #fecaca; cursor:pointer; white-space:nowrap; transition:all .15s; }
        .ak-btn-revoke:hover { background:#fef2f2; border-color:${RED}; }
        .ak-btn-confirm  { padding:6px 12px; background:${RED}; color:#fff; font-size:11.5px; font-weight:700; border:none; cursor:pointer; white-space:nowrap; }
        .ak-btn-confirm:hover:not(:disabled) { background:#b91c1c; }
        .ak-btn-confirm:disabled { opacity:.5; cursor:not-allowed; }
        .ak-btn-abort    { padding:6px 10px; background:#fff; color:#6b7280; font-size:11.5px; border:1px solid #d1d5db; cursor:pointer; margin-left:4px; }

        /* Empty & loading */
        .ak-empty   { padding:60px 24px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .ak-loading { padding:48px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }

        /* New key modal */
        .ak-overlay  { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:600; display:flex; align-items:center; justify-content:center; padding:24px; }
        .ak-modal    { background:#fff; border-top:4px solid ${GREEN}; padding:32px; max-width:580px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,.22); }
        .ak-modal-t  { font-size:17px; font-weight:700; color:#111827; margin-bottom:8px; }
        .ak-modal-w  { font-size:12.5px; color:#92400e; background:#fffbeb; border:1px solid #fde68a; padding:12px 16px; margin-bottom:20px; line-height:1.6; }
        .ak-key-val  { font-family:"IBM Plex Mono",monospace; font-size:13px; background:#f0fdf4; border:1.5px solid #bbf7d0; padding:16px 18px; word-break:break-all; color:#14532d; letter-spacing:.05em; line-height:1.6; margin-bottom:16px; }
        .ak-btn-copy  { width:100%; padding:12px; background:${BLUE}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; margin-bottom:10px; }
        .ak-btn-copy:hover  { background:${BLUE2}; }
        .ak-btn-copy.done   { background:${GREEN}; }
        .ak-btn-close { width:100%; padding:11px; background:#fff; color:#374151; font-size:13px; border:1px solid #d1d5db; cursor:pointer; }
        .ak-btn-close:hover { background:#f9fafb; }

        /* Code block */
        .ak-code { background:#0d1b2a; color:#e2e8f0; padding:16px 20px; font-family:"IBM Plex Mono",monospace; font-size:12px; overflow-x:auto; line-height:1.7; margin-bottom:12px; }
      `}</style>

      <div className="ak-root">
        <EucxHeader />

        <div className="ak-page">

          {/* Security notice */}
          <div className="ak-notice">
            <div className="ak-notice-icon">🔑</div>
            <div className="ak-notice-text">
              <strong>API-Schlüssel ermöglichen programmatischen Zugriff auf die EUCX-Plattform.</strong>{" "}
              Behandeln Sie jeden Schlüssel wie ein Passwort — teilen Sie ihn niemals in Code-Repositories,
              öffentlichen Chats oder unverschlüsselten Konfigurationsdateien. Jeder Schlüssel ist
              einem Scope zugeordnet, der den Zugriff auf bestimmte Ressourcen begrenzt.
              Alle API-Aufrufe werden protokolliert und sind im Sicherheitsprotokoll einsehbar.
            </div>
          </div>

          {/* Header */}
          <div className="ak-head-row">
            <div>
              <h1 className="ak-title">API-Schlüssel</h1>
            </div>
            <button
              className="ak-btn-new"
              disabled={activeKeys.length >= 10 || showCreate}
              onClick={() => { setShowCreate(true); setFormError(null); }}
            >
              + Neuen Schlüssel erstellen
            </button>
          </div>
          <p className="ak-sub">Programmatischer Zugriff auf EUCX-Ressourcen für Ihre eigene Software, ERP- oder Handelsystem-Integration</p>

          {/* Limit bar */}
          <div className="ak-limit-bar">
            <div className="ak-limit-track">
              <div className="ak-limit-fill" style={{ width: `${Math.min((activeKeys.length / 10) * 100, 100)}%` }} />
            </div>
            <span className="ak-limit-text">
              <strong>{activeKeys.length}</strong> / 10 aktive Schlüssel
              {activeKeys.length >= 10 && (
                <span style={{ color: RED, marginLeft: 8, fontWeight: 700 }}>Limit erreicht</span>
              )}
            </span>
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="ak-form-wrap">
              <div className="ak-form-title">Neuen API-Schlüssel erstellen</div>
              <form onSubmit={(e) => { void createKey(e); }}>

                {/* Name */}
                <div className="ak-field">
                  <label className="ak-label">
                    Bezeichnung <span className="ak-label-hint">(intern, zur Identifikation)</span>
                  </label>
                  <input
                    className="ak-input"
                    placeholder="z.B. ERP-Integration · SAP S/4HANA · Produktion"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                {/* Scopes */}
                <div className="ak-field">
                  <label className="ak-label">Berechtigungen (Scopes)</label>
                  <div className="ak-scopes">
                    {ALL_SCOPES.map((scope) => {
                      const info = SCOPE_INFO[scope]!;
                      const sel  = scopes.includes(scope);
                      return (
                        <label key={scope} className={`ak-scope-item${sel ? " selected" : ""}`}>
                          <input
                            type="checkbox"
                            className="ak-scope-cb"
                            checked={sel}
                            onChange={(e) =>
                              setScopes(prev =>
                                e.target.checked ? [...prev, scope] : prev.filter(s => s !== scope)
                              )
                            }
                          />
                          <div>
                            <div className="ak-scope-name">{scope}</div>
                            <div className="ak-scope-desc">
                              <strong>{info.label}</strong> — {info.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Ablaufdatum */}
                <div className="ak-field">
                  <label className="ak-label">
                    Ablaufdatum <span className="ak-label-hint">(optional — leer lassen für unbegrenzten Schlüssel)</span>
                  </label>
                  <input
                    className="ak-input"
                    type="date"
                    style={{ width: 220 }}
                    value={expiryDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                {/* IP-Whitelist */}
                <div className="ak-field">
                  <label className="ak-label">
                    IP-Whitelist <span className="ak-label-hint">(optional — leer = alle IPs erlaubt; max. 20 Einträge)</span>
                  </label>
                  <div className="ak-ip-row">
                    <input
                      className="ak-input"
                      placeholder="IPv4, IPv6 oder CIDR-Block, z.B. 85.214.132.0/24"
                      value={ipInput}
                      onChange={(e) => { setIpInput(e.target.value); setFormError(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIp(); } }}
                    />
                    <button type="button" className="ak-btn-ip" onClick={addIp} disabled={ipList.length >= 20}>
                      + Hinzufügen
                    </button>
                  </div>
                  {ipList.length > 0 && (
                    <div className="ak-ip-chips">
                      {ipList.map((ip) => (
                        <span key={ip} className="ak-ip-chip">
                          {ip}
                          <button
                            type="button"
                            className="ak-ip-rm"
                            onClick={() => setIpList(l => l.filter(x => x !== ip))}
                          >×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {formError && <div className="ak-form-err">{formError}</div>}

                <div className="ak-form-actions">
                  <button className="ak-btn-submit" type="submit" disabled={creating}>
                    {creating ? "Wird erstellt…" : "Schlüssel erstellen"}
                  </button>
                  <button
                    type="button"
                    className="ak-btn-cancel"
                    onClick={() => { setShowCreate(false); setFormError(null); }}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Keys table */}
          {loading ? (
            <div className="ak-loading">API-Schlüssel werden geladen…</div>
          ) : keys.length === 0 ? (
            <div className="ak-empty">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔑</div>
              Noch keine API-Schlüssel vorhanden.
              <div style={{ marginTop: 8, fontSize: 12, color: "#d1d5db" }}>
                Klicken Sie auf „+ Neuen Schlüssel erstellen", um den Zugang für Ihre Applikation einzurichten.
              </div>
            </div>
          ) : (
            <div className="ak-table-wrap">
              <table className="ak-table">
                <thead>
                  <tr>
                    <th>Bezeichnung / Präfix</th>
                    <th>Scopes</th>
                    <th>IP-Whitelist</th>
                    <th>Erstellt</th>
                    <th>Ablauf</th>
                    <th>Zuletzt verwendet</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => {
                    const isExpired = key.expiresAt ? new Date(key.expiresAt) < new Date() : false;
                    const live      = key.isActive && !isExpired;
                    return (
                      <tr key={key.id}>
                        {/* Name + Präfix */}
                        <td>
                          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{key.name}</div>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "#6b7280", letterSpacing: ".04em" }}>
                            {key.prefix}_<span style={{ color: "#d1d5db" }}>••••••••••••</span>
                          </div>
                        </td>
                        {/* Scopes */}
                        <td>
                          {key.scopes.map((s) => {
                            const color = SCOPE_INFO[s]?.color ?? "#6b7280";
                            return (
                              <span
                                key={s}
                                className="ak-sbadge"
                                style={{ background: `${color}1a`, color, border: `1px solid ${color}40` }}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </td>
                        {/* IP-Whitelist */}
                        <td style={{ fontSize: 11.5, maxWidth: 160 }}>
                          {key.ipWhitelist.length > 0 ? (
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#374151" }}>
                              {key.ipWhitelist.slice(0, 2).join(", ")}
                              {key.ipWhitelist.length > 2 && (
                                <span style={{ color: "#9ca3af" }}> +{key.ipWhitelist.length - 2}</span>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>Alle IPs</span>
                          )}
                        </td>
                        {/* Erstellt */}
                        <td style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {fmtDate(key.createdAt)}
                        </td>
                        {/* Ablauf */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          {key.expiresAt ? (
                            <>
                              <span style={{ fontSize: 12, color: isExpired ? RED : "#6b7280" }}>
                                {fmtDate(key.expiresAt)}
                              </span>
                              {isExpired && (
                                <div style={{ fontSize: 10.5, color: RED, fontWeight: 700, marginTop: 2 }}>Abgelaufen</div>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>Kein Ablauf</span>
                          )}
                        </td>
                        {/* Zuletzt verwendet */}
                        <td style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {fmtDateTime(key.lastUsedAt)}
                        </td>
                        {/* Status */}
                        <td>
                          {live ? (
                            <span className="ak-status-on">
                              <span className="ak-dot" style={{ background: GREEN }} />Aktiv
                            </span>
                          ) : (
                            <span className="ak-status-off">
                              <span className="ak-dot" style={{ background: "#9ca3af" }} />
                              {isExpired && key.isActive ? "Abgelaufen" : "Widerrufen"}
                            </span>
                          )}
                        </td>
                        {/* Aktion */}
                        <td>
                          {live && (
                            confirmId === key.id ? (
                              <span style={{ display: "inline-flex", alignItems: "center" }}>
                                <button
                                  className="ak-btn-confirm"
                                  disabled={revoking === key.id}
                                  onClick={() => void revokeKey(key.id)}
                                >
                                  {revoking === key.id ? "…" : "Widerrufen bestätigen"}
                                </button>
                                <button className="ak-btn-abort" onClick={() => setConfirmId(null)}>✕</button>
                              </span>
                            ) : (
                              <button className="ak-btn-revoke" onClick={() => setConfirmId(key.id)}>
                                Widerrufen
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* API-Verwendung */}
          <div style={{ marginTop: 40, background: "#fff", border: "1px solid #e5e7eb", borderLeft: `4px solid ${BLUE}`, padding: "24px 28px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", marginBottom: 6 }}>
              Verwendung der API
            </div>
            <p style={{ fontSize: 13, color: "#374151", margin: "0 0 16px", lineHeight: 1.65 }}>
              Übergeben Sie den API-Schlüssel als Bearer-Token im{" "}
              <code style={{ fontFamily: "monospace", background: "#f3f4f6", padding: "1px 5px", fontSize: 12 }}>Authorization</code>
              -Header jeder Anfrage:
            </p>
            <div className="ak-code">{`curl -H "Authorization: Bearer eucx_live_XXXXX_..." \\
     https://eucx.eu/api/auction/lots`}</div>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px", lineHeight: 1.6 }}>
              Antworten erfolgen im JSON-Format. HTTP-Statuscodes: <code style={{ fontFamily: "monospace" }}>200</code> OK,{" "}
              <code style={{ fontFamily: "monospace" }}>401</code> Nicht autorisiert,{" "}
              <code style={{ fontFamily: "monospace" }}>403</code> Keine Berechtigung (Scope),{" "}
              <code style={{ fontFamily: "monospace" }}>429</code> Rate-Limit überschritten.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href="/regelwerk"
                style={{ fontSize: 12.5, color: BLUE, fontWeight: 600, border: `1px solid ${BLUE}`, padding: "8px 16px", textDecoration: "none", transition: "all .15s" }}
              >
                Regelwerk & Dokumentation →
              </a>
              <a
                href="/dashboard/settings/security"
                style={{ fontSize: 12.5, color: "#6b7280", border: "1px solid #d1d5db", padding: "8px 16px", textDecoration: "none" }}
              >
                Sicherheitsprotokoll →
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Neuer Schlüssel: Einmal-Anzeige */}
      {newKey && (
        <div className="ak-overlay" onClick={() => setNewKey(null)}>
          <div className="ak-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ak-modal-t">✓ API-Schlüssel erstellt</div>
            <div className="ak-modal-w">
              <strong>⚠ Dieser Schlüssel wird nur jetzt einmalig angezeigt</strong> und kann nicht
              erneut abgerufen werden. Kopieren Sie ihn sofort und speichern Sie ihn sicher —
              z.B. in Ihrem Password-Manager, einem Secret-Vault (HashiCorp Vault, AWS Secrets Manager)
              oder Ihrer CI/CD-Umgebung als verschlüsselte Variable.
            </div>
            <div className="ak-key-val">{newKey}</div>
            <button
              className={`ak-btn-copy${copied ? " done" : ""}`}
              onClick={() => {
                void navigator.clipboard.writeText(newKey!);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}
            >
              {copied ? "✓ In Zwischenablage kopiert" : "In Zwischenablage kopieren"}
            </button>
            <button
              className="ak-btn-close"
              onClick={() => { setNewKey(null); setCopied(false); }}
            >
              Ich habe den Schlüssel gespeichert — Fenster schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
