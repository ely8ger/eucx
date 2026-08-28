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

interface TopUpResult {
  ok:          boolean;
  transferRef: string;
  amount:      number;
  iban:        string;
  bic:         string;
  beneficiary: string;
  purpose:     string;
  message:     string;
}

const fmtEur = (v: string | number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function WalletClient() {
  const router = useRouter();
  const [token,    setToken]    = useState("");
  const [wallet,   setWallet]   = useState<WalletData | null>(null);
  const [loading,  setLoading]  = useState(true);

  const [topUpOpen,   setTopUpOpen]   = useState(false);
  const [topUpAmt,    setTopUpAmt]    = useState("");
  const [topUpRef,    setTopUpRef]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState<TopUpResult | null>(null);
  const [error,       setError]       = useState("");

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

  async function submitTopUp() {
    const amount = parseFloat(topUpAmt.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      setError("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch("/api/buyer/wallet/topup-request", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ amount, reference: topUpRef.trim() || undefined }),
      });
      if (r.ok) {
        const data = await r.json() as TopUpResult;
        setResult(data);
        setTopUpOpen(false);
        setTopUpAmt("");
        setTopUpRef("");
      } else {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "Fehler beim Einreichen der Aufladeanfrage.");
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

        /* KPI-Kacheln */
        .wlt-kpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px; }
        @media(max-width:600px){ .wlt-kpi-row { grid-template-columns:1fr; } }
        .wlt-kpi { background:#fff; border:1px solid #e5e7eb; padding:16px 20px; }
        .wlt-kpi-val { font-size:28px; font-weight:800; color:#111827; font-family:"IBM Plex Mono",monospace; line-height:1; }
        .wlt-kpi-val.available { color:${B}; }
        .wlt-kpi-val.reserved  { color:#d97706; }
        .wlt-kpi-label { font-size:11px; color:#6b7280; margin-top:6px; text-transform:uppercase; letter-spacing:.06em; font-weight:600; }
        .wlt-kpi-sub { font-size:11px; color:#9ca3af; margin-top:3px; }

        /* Auflade-Bereich */
        .wlt-topup-section { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${B}; padding:20px; margin-bottom:24px; }
        .wlt-topup-title { font-size:14px; font-weight:700; color:#111827; margin-bottom:6px; }
        .wlt-topup-hint { font-size:12.5px; color:#6b7280; margin-bottom:14px; line-height:1.5; }
        .wlt-btn { padding:9px 20px; font-size:13px; font-weight:700; border:none; cursor:pointer; display:inline-block; }
        .wlt-btn-primary { background:${B}; color:#fff; }
        .wlt-btn-primary:hover { background:${B2}; }
        .wlt-btn-primary:disabled { background:#d1d5db; cursor:not-allowed; }
        .wlt-btn-outline { background:#fff; color:#374151; border:1px solid #d1d5db; }
        .wlt-btn-outline:hover { background:#f9fafb; }

        /* Überweisungs-Ergebnis-Box */
        .wlt-transfer-box { background:#f0f7ff; border:1px solid #bfdbfe; padding:16px 20px; margin-top:16px; }
        .wlt-transfer-title { font-size:13px; font-weight:700; color:${B}; margin-bottom:10px; }
        .wlt-transfer-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #dbeafe; font-size:12.5px; }
        .wlt-transfer-row:last-child { border-bottom:none; }
        .wlt-transfer-label { color:#6b7280; }
        .wlt-transfer-val { font-weight:600; color:#111827; font-family:"IBM Plex Mono",monospace; font-size:12px; word-break:break-all; text-align:right; max-width:60%; }
        .wlt-transfer-msg { margin-top:12px; padding:10px 14px; background:#fffbeb; border:1px solid #fde68a; font-size:12px; color:#92400e; line-height:1.5; }

        /* Top-Up-Formular */
        .wlt-form { margin-top:16px; }
        .wlt-form-label { font-size:11.5px; font-weight:700; color:#374151; margin-bottom:5px; display:block; }
        .wlt-form-hint  { font-size:11px; color:#6b7280; margin-bottom:8px; }
        .wlt-form-input { width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #d1d5db; font-size:13px; font-family:"IBM Plex Sans",sans-serif; margin-bottom:12px; }
        .wlt-form-input:focus { outline:none; border-color:${B}; }
        .wlt-form-actions { display:flex; gap:10px; }
        .wlt-err { background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; margin-top:10px; font-size:12.5px; color:#dc2626; }

        /* Verlauf */
        .wlt-history { background:#fff; border:1px solid #e5e7eb; }
        .wlt-history-title { padding:14px 20px; border-bottom:1px solid #f3f4f6; font-size:13px; font-weight:700; color:#111827; }
        .wlt-history-row { display:flex; justify-content:space-between; align-items:center; padding:11px 20px; border-bottom:1px solid #f3f4f6; font-size:12.5px; }
        .wlt-history-row:last-child { border-bottom:none; }
        .wlt-history-empty { padding:28px 20px; text-align:center; color:#9ca3af; font-size:12.5px; }
        .wlt-loading { padding:48px; text-align:center; color:#9ca3af; font-size:13px; }

        /* Leverage-Info */
        .wlt-leverage { background:#fff; border:1px solid #e5e7eb; padding:16px 20px; margin-bottom:24px; display:flex; align-items:flex-start; gap:14px; }
        .wlt-leverage-icon { font-size:20px; flex-shrink:0; }
        .wlt-leverage-text { font-size:12.5px; color:#374151; line-height:1.6; }
        .wlt-leverage-val { font-weight:800; color:${B}; font-family:"IBM Plex Mono",monospace; }
      `}</style>

      <div className="wlt">
        <EucxHeader />
        <div className="wlt-stripe">
          <div className="wlt-stripe-inner">
            <span className="wlt-badge">WALLET</span>
            <span style={{ fontSize: 11, color: "rgba(191,219,254,.8)" }}>
              Guthaben · Escrow-Reserve · Aufladung per Überweisung
            </span>
          </div>
        </div>

        <div className="wlt-page">
          <div className="wlt-title">Wallet & Guthaben</div>
          <div className="wlt-sub">
            Ihr Guthaben wird als Sicherheitsleistung für Auktionskäufe verwendet. Alle Beträge in EUR.
          </div>

          {loading ? (
            <div className="wlt-loading">Wallet wird geladen…</div>
          ) : (
            <>
              {/* KPI-Kacheln */}
              <div className="wlt-kpi-row">
                <div className="wlt-kpi">
                  <div className="wlt-kpi-val">
                    {wallet ? fmtEur(wallet.balance) : "—"}
                  </div>
                  <div className="wlt-kpi-label">Gesamtguthaben</div>
                  <div className="wlt-kpi-sub">
                    {wallet?.updatedAt ? `Stand: ${fmtDate(wallet.updatedAt)}` : ""}
                  </div>
                </div>
                <div className="wlt-kpi">
                  <div className="wlt-kpi-val reserved">
                    {wallet ? fmtEur(wallet.reservedBalance) : "—"}
                  </div>
                  <div className="wlt-kpi-label">Escrow-Reserve</div>
                  <div className="wlt-kpi-sub">Gesperrt für laufende Kontrakte</div>
                </div>
                <div className="wlt-kpi">
                  <div className="wlt-kpi-val available">
                    {wallet ? fmtEur(wallet.available) : "—"}
                  </div>
                  <div className="wlt-kpi-label">Verfügbar</div>
                  <div className="wlt-kpi-sub">Frei für neue Gebote</div>
                </div>
              </div>

              {/* Leverage-Info */}
              <div className="wlt-leverage">
                <div className="wlt-leverage-icon">⚡</div>
                <div className="wlt-leverage-text">
                  Mit Ihrem verfügbaren Guthaben können Sie Transaktionen bis{" "}
                  <span className="wlt-leverage-val">
                    {fmtEur(maxDeal)}
                  </span>{" "}
                  absichern (20× Leverage). Je höher Ihr Wallet-Guthaben, desto größere Lots können Sie gewinnen.
                </div>
              </div>

              {/* Auflade-Bereich */}
              <div className="wlt-topup-section">
                <div className="wlt-topup-title">Guthaben aufladen</div>
                <div className="wlt-topup-hint">
                  Aufladen per Banküberweisung (SEPA). Nach Ihrer Anfrage erhalten Sie Überweisungsdaten mit Verwendungszweck. Ihr Guthaben wird nach Zahlungseingang (1–3 Werktage) gutgeschrieben.
                </div>

                {!topUpOpen && !result && (
                  <button
                    className="wlt-btn wlt-btn-primary"
                    onClick={() => { setTopUpOpen(true); setError(""); }}
                  >
                    Aufladung beantragen →
                  </button>
                )}

                {topUpOpen && (
                  <div className="wlt-form">
                    <label className="wlt-form-label">Betrag (EUR) *</label>
                    <div className="wlt-form-hint">Mindestbetrag: 1.000 € | Maximum: 10.000.000 €</div>
                    <input
                      className="wlt-form-input"
                      type="number"
                      min="1000"
                      max="10000000"
                      step="500"
                      placeholder="z.B. 50000"
                      value={topUpAmt}
                      onChange={(e) => setTopUpAmt(e.target.value)}
                    />
                    <label className="wlt-form-label">Eigene Referenz (optional)</label>
                    <div className="wlt-form-hint">Wird als Verwendungszweck-Präfix genutzt (max. 100 Zeichen)</div>
                    <input
                      className="wlt-form-input"
                      type="text"
                      maxLength={100}
                      placeholder="z.B. TOPUP-2026-Q3"
                      value={topUpRef}
                      onChange={(e) => setTopUpRef(e.target.value)}
                    />
                    {error && <div className="wlt-err">{error}</div>}
                    <div className="wlt-form-actions">
                      <button
                        className="wlt-btn wlt-btn-outline"
                        onClick={() => { setTopUpOpen(false); setTopUpAmt(""); setTopUpRef(""); setError(""); }}
                      >
                        Abbrechen
                      </button>
                      <button
                        className="wlt-btn wlt-btn-primary"
                        disabled={submitting || !topUpAmt}
                        onClick={() => void submitTopUp()}
                      >
                        {submitting ? "Wird bearbeitet…" : "Überweisungsdaten anfordern →"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Überweisungs-Ergebnis */}
                {result && (
                  <div className="wlt-transfer-box">
                    <div className="wlt-transfer-title">Überweisungsdaten</div>
                    {[
                      ["Empfänger",          result.beneficiary],
                      ["IBAN",               result.iban],
                      ["BIC",                result.bic],
                      ["Betrag",             fmtEur(result.amount)],
                      ["Verwendungszweck",   result.purpose],
                    ].map(([l, v]) => (
                      <div className="wlt-transfer-row" key={l}>
                        <span className="wlt-transfer-label">{l}</span>
                        <span className="wlt-transfer-val">{v}</span>
                      </div>
                    ))}
                    <div className="wlt-transfer-msg">
                      {result.message}
                    </div>
                    <button
                      className="wlt-btn wlt-btn-outline"
                      style={{ marginTop: 14, width: "100%", textAlign: "center" }}
                      onClick={() => { setResult(null); setTopUpOpen(true); }}
                    >
                      Weiteren Betrag anfordern
                    </button>
                  </div>
                )}
              </div>

              {/* Auflade-Verlauf */}
              <div className="wlt-history">
                <div className="wlt-history-title">Auflade-Verlauf</div>
                {!wallet || wallet.topUps.length === 0 ? (
                  <div className="wlt-history-empty">
                    Noch keine Aufladungen. Guthaben wird nach Zahlungseingang hier angezeigt.
                  </div>
                ) : (
                  wallet.topUps.map((t) => (
                    <div className="wlt-history-row" key={t.correlationId}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.description ?? "Wallet-Aufladung"}</div>
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
