"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const B  = "#154194";
const B2 = "#0f3070";

interface WalletData {
  balance:         string;
  reservedBalance: string;
  available:       string;
  currency:        string;
  updatedAt:       string | null;
  topUps: Array<{
    amount:        string;
    description:   string | null;
    createdAt:     string;
    correlationId: string;
  }>;
}

interface PofResult {
  ok:        boolean;
  requestId: string;
  status:    string;
  message:   string;
}

const DOC_TYPES = [
  { value: "Bankgarantie",    label: "Bankgarantie", hint: "Schreiben Ihrer Bank über einen garantierten Kreditrahmen" },
  { value: "Kontoauszug",     label: "Kontoauszug", hint: "Aktueller Kontoauszug (nicht älter als 30 Tage)" },
  { value: "Kapitalnachweis", label: "Kapitalnachweis", hint: "Bestätigung über verfügbare Liquidität von Ihrer Bank" },
  { value: "Sonstiges",       label: "Sonstiges Dokument", hint: "Andere Belege nach Absprache mit EUCX-Compliance" },
];

const fmtEur = (v: string | number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function WalletClient() {
  const router = useRouter();
  const [token,   setToken]   = useState("");
  const [wallet,  setWallet]  = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const [pofOpen,   setPofOpen]   = useState(false);
  const [docType,   setDocType]   = useState("Bankgarantie");
  const [limit,     setLimit]     = useState("");
  const [file,      setFile]      = useState<File | null>(null);
  const [submitting,setSubmitting] = useState(false);
  const [result,    setResult]    = useState<PofResult | null>(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch("/api/buyer/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setWallet(await r.json() as WalletData);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function submitPof() {
    const amt = parseFloat(limit.replace(",", "."));
    if (isNaN(amt) || amt < 10_000) {
      setError("Mindest-Trading-Limit: 10.000 €");
      return;
    }
    if (!file) {
      setError("Bitte wählen Sie ein Dokument aus.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file",    file);
      fd.append("amount",  String(amt));
      fd.append("docType", docType);

      const r = await fetch("/api/buyer/wallet/proof-of-funds", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      if (r.ok) {
        const data = await r.json() as PofResult;
        setResult(data);
        setPofOpen(false);
        setFile(null);
        setLimit("");
      } else {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "Fehler beim Einreichen.");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setSubmitting(false);
    }
  }

  const maxDeal = wallet ? (Number(wallet.available) * 20).toFixed(0) : "0";

  return (
    <>
      <style>{`
        .wlt { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }
        .wlt-stripe { background:linear-gradient(90deg,${B},${B2}); border-bottom:1px solid ${B2}; height:36px; padding:0 28px; display:flex; align-items:center; }
        .wlt-stripe-inner { max-width:1000px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .wlt-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#bfdbfe; background:rgba(255,255,255,.12); padding:3px 10px; }
        .wlt-page { max-width:1000px; margin:0 auto; padding:28px 24px 80px; }
        .wlt-title { font-size:20px; font-weight:700; color:#111827; margin-bottom:4px; }
        .wlt-sub { font-size:12.5px; color:#6b7280; margin-bottom:24px; }

        .wlt-kpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px; }
        @media(max-width:600px){ .wlt-kpi-row { grid-template-columns:1fr; } }
        .wlt-kpi { background:#fff; border:1px solid #e5e7eb; padding:16px 20px; }
        .wlt-kpi-val { font-size:26px; font-weight:800; color:#111827; font-family:"IBM Plex Mono",monospace; line-height:1; }
        .wlt-kpi-val.available { color:${B}; }
        .wlt-kpi-val.reserved  { color:#d97706; }
        .wlt-kpi-label { font-size:11px; color:#6b7280; margin-top:6px; text-transform:uppercase; letter-spacing:.06em; font-weight:600; }
        .wlt-kpi-sub   { font-size:11px; color:#9ca3af; margin-top:3px; }

        /* Leverage */
        .wlt-leverage { background:#fff; border:1px solid #e5e7eb; padding:14px 18px; margin-bottom:24px; display:flex; align-items:flex-start; gap:12px; }
        .wlt-leverage-text { font-size:12.5px; color:#374151; line-height:1.6; }
        .wlt-leverage-val  { font-weight:800; color:${B}; font-family:"IBM Plex Mono",monospace; }

        /* Sicherheitsleistung */
        .wlt-pof { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${B}; padding:22px; margin-bottom:24px; }
        .wlt-pof-title { font-size:14px; font-weight:700; color:#111827; margin-bottom:6px; }
        .wlt-pof-hint  { font-size:12.5px; color:#6b7280; margin-bottom:16px; line-height:1.6; }

        /* Prozess-Schritte */
        .wlt-steps { display:flex; gap:0; margin-bottom:20px; }
        .wlt-step  { flex:1; padding:10px 14px; font-size:11.5px; text-align:center; background:#f3f4f6; border:1px solid #e5e7eb; position:relative; }
        .wlt-step:not(:last-child)::after { content:"→"; position:absolute; right:-10px; top:50%; transform:translateY(-50%); font-size:12px; color:#9ca3af; z-index:1; }
        .wlt-step-num  { font-size:18px; font-weight:800; color:${B}; line-height:1; }
        .wlt-step-text { font-size:10.5px; color:#6b7280; margin-top:3px; }
        @media(max-width:600px){ .wlt-steps { flex-direction:column; gap:6px; } .wlt-step::after { display:none; } }

        /* Formular */
        .wlt-btn { padding:9px 20px; font-size:13px; font-weight:700; border:none; cursor:pointer; display:inline-block; }
        .wlt-btn-primary { background:${B}; color:#fff; }
        .wlt-btn-primary:hover { background:${B2}; }
        .wlt-btn-primary:disabled { background:#d1d5db; cursor:not-allowed; }
        .wlt-btn-outline { background:#fff; color:#374151; border:1px solid #d1d5db; }
        .wlt-btn-outline:hover { background:#f9fafb; }

        .wlt-form-label { font-size:11.5px; font-weight:700; color:#374151; margin-bottom:4px; display:block; }
        .wlt-form-hint  { font-size:11px; color:#6b7280; margin-bottom:7px; }
        .wlt-form-input { width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #d1d5db; font-size:13px; font-family:"IBM Plex Sans",sans-serif; margin-bottom:14px; }
        .wlt-form-input:focus { outline:none; border-color:${B}; }
        .wlt-doctype-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
        @media(max-width:480px){ .wlt-doctype-grid { grid-template-columns:1fr; } }
        .wlt-doctype-card { padding:10px 12px; border:2px solid #e5e7eb; cursor:pointer; transition:border-color .12s; }
        .wlt-doctype-card.sel { border-color:${B}; background:#f0f4ff; }
        .wlt-doctype-card-label { font-size:12.5px; font-weight:700; color:#374151; margin-bottom:2px; }
        .wlt-doctype-card-hint  { font-size:10.5px; color:#9ca3af; }
        .wlt-doctype-card.sel .wlt-doctype-card-label { color:${B}; }
        .wlt-file-zone { border:2px dashed #d1d5db; padding:20px; text-align:center; cursor:pointer; margin-bottom:14px; }
        .wlt-file-zone:hover { border-color:${B}; background:#f8faff; }
        .wlt-file-zone.has-file { border-color:#16a34a; background:#f0fdf4; }
        .wlt-file-name  { font-size:12.5px; font-weight:600; color:#16a34a; margin-top:6px; }
        .wlt-file-label { font-size:12px; color:#6b7280; }
        .wlt-form-actions { display:flex; gap:10px; }
        .wlt-err { background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; margin-bottom:12px; font-size:12.5px; color:#dc2626; }

        /* Ergebnis */
        .wlt-result { background:#f0fdf4; border:1px solid #bbf7d0; border-left:3px solid #16a34a; padding:16px 20px; margin-top:16px; }
        .wlt-result-title { font-size:13px; font-weight:700; color:#15803d; margin-bottom:6px; }
        .wlt-result-ref   { font-family:"IBM Plex Mono",monospace; font-size:12px; color:#14532d; background:#dcfce7; padding:4px 10px; display:inline-block; margin-bottom:8px; }
        .wlt-result-msg   { font-size:12.5px; color:#374151; line-height:1.6; }

        /* Verlauf */
        .wlt-history { background:#fff; border:1px solid #e5e7eb; }
        .wlt-history-title { padding:14px 20px; border-bottom:1px solid #f3f4f6; font-size:13px; font-weight:700; color:#111827; }
        .wlt-history-row   { display:flex; justify-content:space-between; align-items:center; padding:11px 20px; border-bottom:1px solid #f3f4f6; font-size:12.5px; }
        .wlt-history-row:last-child { border-bottom:none; }
        .wlt-history-empty { padding:28px 20px; text-align:center; color:#9ca3af; font-size:12.5px; }
        .wlt-loading { padding:48px; text-align:center; color:#9ca3af; font-size:13px; }

        /* Disclaimer */
        .wlt-disclaimer { background:#fffbeb; border:1px solid #fde68a; padding:12px 16px; margin-bottom:24px; font-size:11.5px; color:#92400e; line-height:1.6; }
        .wlt-disclaimer strong { color:#78350f; }
      `}</style>

      <div className="wlt">
        <EucxHeader />
        <div className="wlt-stripe">
          <div className="wlt-stripe-inner">
            <span className="wlt-badge">WALLET</span>
            <span style={{ fontSize: 11, color: "rgba(191,219,254,.8)" }}>
              Trading-Limit · Escrow-Reserve · Sicherheitsleistung hinterlegen
            </span>
          </div>
        </div>

        <div className="wlt-page">
          <div className="wlt-title">Wallet & Trading-Limit</div>
          <div className="wlt-sub">
            Ihr freigegebenes Guthaben bestimmt Ihr maximales Transaktionsvolumen auf EUCX (20× Leverage).
          </div>

          {/* Rechtlicher Hinweis */}
          <div className="wlt-disclaimer">
            <strong>Hinweis:</strong> EUCX verwahrt kein Bankguthaben. Ihr &quot;Wallet&quot; repräsentiert ein freigegebenes Trading-Limit, das durch eine Sicherheitsleistung (Bankgarantie, Kapitalnachweis) unterlegt ist. Zahlungen erfolgen direkt zwischen Käufer und Verkäufer (Peer-to-Peer). EUCX ist kein Zahlungsdienstleister.
          </div>

          {loading ? (
            <div className="wlt-loading">Wallet wird geladen…</div>
          ) : (
            <>
              {/* KPI-Kacheln */}
              <div className="wlt-kpi-row">
                <div className="wlt-kpi">
                  <div className="wlt-kpi-val available">{wallet ? fmtEur(wallet.available) : "—"}</div>
                  <div className="wlt-kpi-label">Verfügbares Limit</div>
                  <div className="wlt-kpi-sub">Für neue Transaktionen freigegeben</div>
                </div>
                <div className="wlt-kpi">
                  <div className="wlt-kpi-val reserved">{wallet ? fmtEur(wallet.reservedBalance) : "—"}</div>
                  <div className="wlt-kpi-label">Escrow-Reserve</div>
                  <div className="wlt-kpi-sub">Gesperrt für laufende Kontrakte</div>
                </div>
                <div className="wlt-kpi">
                  <div className="wlt-kpi-val">{wallet ? fmtEur(wallet.balance) : "—"}</div>
                  <div className="wlt-kpi-label">Gesamtlimit</div>
                  <div className="wlt-kpi-sub">
                    {wallet?.updatedAt ? `Stand: ${fmtDate(wallet.updatedAt)}` : "Noch nicht freigegeben"}
                  </div>
                </div>
              </div>

              {/* Leverage */}
              <div className="wlt-leverage">
                <div style={{ fontSize: 20, flexShrink: 0 }}>⚡</div>
                <div className="wlt-leverage-text">
                  Mit Ihrem verfügbaren Limit können Sie Transaktionen bis{" "}
                  <span className="wlt-leverage-val">{fmtEur(maxDeal)}</span>{" "}
                  absichern (20× Leverage-Faktor). Höheres Limit → größere Lots.
                </div>
              </div>

              {/* Sicherheitsleistung */}
              <div className="wlt-pof">
                <div className="wlt-pof-title">Sicherheitsleistung hinterlegen</div>
                <div className="wlt-pof-hint">
                  Um Ihr Trading-Limit auf EUCX zu erhöhen, laden Sie einen Finanznachweis hoch. Das EUCX-Compliance-Team prüft das Dokument und gibt das beantragte Limit in der Regel innerhalb von 1–2 Werktagen frei.
                </div>

                {/* Prozess-Visualisierung */}
                <div className="wlt-steps">
                  {[
                    { n: "01", t: "Dokument hochladen" },
                    { n: "02", t: "Compliance-Prüfung (1–2 Werktage)" },
                    { n: "03", t: "Limit freigegeben" },
                  ].map((s) => (
                    <div className="wlt-step" key={s.n}>
                      <div className="wlt-step-num">{s.n}</div>
                      <div className="wlt-step-text">{s.t}</div>
                    </div>
                  ))}
                </div>

                {!pofOpen && !result && (
                  <button
                    className="wlt-btn wlt-btn-primary"
                    onClick={() => { setPofOpen(true); setError(""); }}
                  >
                    Sicherheitsnachweis einreichen →
                  </button>
                )}

                {/* Formular */}
                {pofOpen && (
                  <div>
                    {/* Dokument-Typ */}
                    <label className="wlt-form-label">Art des Nachweises</label>
                    <div className="wlt-doctype-grid">
                      {DOC_TYPES.map((dt) => (
                        <div
                          key={dt.value}
                          className={`wlt-doctype-card${docType === dt.value ? " sel" : ""}`}
                          onClick={() => setDocType(dt.value)}
                        >
                          <div className="wlt-doctype-card-label">{dt.label}</div>
                          <div className="wlt-doctype-card-hint">{dt.hint}</div>
                        </div>
                      ))}
                    </div>

                    {/* Gewünschtes Limit */}
                    <label className="wlt-form-label">Gewünschtes Trading-Limit (EUR) *</label>
                    <div className="wlt-form-hint">Mindestens 10.000 € · wir geben das nachgewiesene Volumen frei</div>
                    <input
                      className="wlt-form-input"
                      type="number"
                      min="10000"
                      step="1000"
                      placeholder="z.B. 500000"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                    />

                    {/* Datei-Upload */}
                    <label className="wlt-form-label">Dokument hochladen *</label>
                    <div className="wlt-form-hint">PDF, JPG oder PNG · max. 10 MB · Bankstempel/Signatur sichtbar</div>
                    <label className={`wlt-file-zone${file ? " has-file" : ""}`}>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png"
                        style={{ display: "none" }}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                      {file ? (
                        <>
                          <div style={{ fontSize: 24 }}>✓</div>
                          <div className="wlt-file-name">{file.name}</div>
                          <div style={{ fontSize: 10.5, color: "#6b7280", marginTop: 2 }}>
                            {(file.size / 1024).toFixed(0)} KB — Anderes Dokument wählen
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 24, color: "#9ca3af" }}>📄</div>
                          <div className="wlt-file-label">Datei hier ablegen oder klicken zum Auswählen</div>
                        </>
                      )}
                    </label>

                    {error && <div className="wlt-err">{error}</div>}

                    <div className="wlt-form-actions">
                      <button
                        className="wlt-btn wlt-btn-outline"
                        onClick={() => { setPofOpen(false); setFile(null); setLimit(""); setError(""); }}
                      >
                        Abbrechen
                      </button>
                      <button
                        className="wlt-btn wlt-btn-primary"
                        disabled={submitting || !file || !limit}
                        onClick={() => void submitPof()}
                      >
                        {submitting ? "Wird eingereicht…" : "Zur Prüfung einreichen →"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Ergebnis */}
                {result && (
                  <div className="wlt-result">
                    <div className="wlt-result-title">Dokument eingereicht</div>
                    <div className="wlt-result-ref">{result.requestId}</div>
                    <div className="wlt-result-msg">{result.message}</div>
                    <button
                      className="wlt-btn wlt-btn-outline"
                      style={{ marginTop: 14, width: "100%", textAlign: "center" }}
                      onClick={() => { setResult(null); setPofOpen(true); }}
                    >
                      Weiteres Dokument einreichen
                    </button>
                  </div>
                )}
              </div>

              {/* Aktivierungs-Verlauf */}
              <div className="wlt-history">
                <div className="wlt-history-title">Limit-Aktivierungen durch Admin</div>
                {!wallet || wallet.topUps.length === 0 ? (
                  <div className="wlt-history-empty">
                    Noch keine Freigaben. Ihr Limit erscheint hier, sobald das Compliance-Team Ihren Nachweis geprüft hat.
                  </div>
                ) : (
                  wallet.topUps.map((t) => (
                    <div className="wlt-history-row" key={t.correlationId}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.description ?? "Limit-Freigabe"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{fmtDate(t.createdAt)}</div>
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: "#16a34a", fontSize: 14 }}>
                        +{fmtEur(t.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
