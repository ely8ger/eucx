"use client";

/**
 * /dashboard/seller — Seller Hub
 *
 * Zeigt alle offenen Lots, erlaubt Registrierung in COLLECTION-Phase,
 * verlinkt auf Auktionsseite in PROPOSAL/REDUCTION.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface LotRow {
  id:               string;
  commodity:        string;
  quantity:         string;
  unit:             string;
  phase:            "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";
  startPrice:       string | null;
  currentBest:      string | null;
  auctionEnd:       string | null;
  createdAt:        string;
  isRegistered:     boolean;
  _count:           { bids: number; registrations: number };
  co2PerTonne?:     string | null;
  countryOfOrigin?: string | null;
  incoterms?:       string | null;
}

interface KycInfo {
  verificationStatus: "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  walletBalance:      string;
  role:               string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtEur = (v: string | null) =>
  v == null ? "—"
  : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const PHASE_LABEL: Record<string, string> = {
  COLLECTION: "Registrierung",
  PROPOSAL:   "Angebote",
  REDUCTION:  "Reduktion",
  CONCLUSION: "Abgeschlossen",
};

const PHASE_COLOR: Record<string, string> = {
  COLLECTION: "#154194",
  PROPOSAL:   "#d97706",
  REDUCTION:  "#dc2626",
  CONCLUSION: "#6b7280",
};

const PHASE_TOOLTIP: Record<string, string> = {
  COLLECTION: "Sammelphase — Jetzt registrieren, um in der Angebotsphase mitzubieten",
  PROPOSAL:   "Angebotsphase — Registrierte Verkäufer können Gebote abgeben",
  REDUCTION:  "Reduktionsphase — Beste Gebote werden verglichen und optimiert",
  CONCLUSION: "Abgeschlossen — Auktion beendet, Ergebnis festgestellt",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function SellerLotsClient({ initialFilter = "all" }: { initialFilter?: "all" | "mine" | "active" }) {
  const router = useRouter();
  const [token,        setToken]        = useState("");
  const [hydrated,     setHydrated]     = useState(false);
  const [lots,         setLots]         = useState<LotRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [kyc,          setKyc]          = useState<KycInfo | null>(null);
  const [registering,  setRegistering]  = useState<string | null>(null);
  const [filter,       setFilter]       = useState<"all" | "mine" | "active">(initialFilter);

  // ── Token + Auth-Redirect ──────────────────────────────────────────
  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    setHydrated(true);
    if (!tkn) router.replace("/login");
  }, [router]);

  // ── KYC-Status ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setKyc({ verificationStatus: d.verificationStatus ?? "GUEST", walletBalance: d.walletBalance ?? "0", role: d.role ?? "" }); })
      .catch(() => {});
  }, [token]);

  // ── Lots laden ────────────────────────────────────────────────────
  const loadLots = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auction/lots", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const d = await r.json();
      setLots(d.lots ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadLots(); }, [loadLots]);

  // ── Registrierung ────────────────────────────────────────────────
  async function registerForLot(lotId: string) {
    if (!token || registering) return;
    setRegistering(lotId);
    try {
      const r = await fetch(`/api/auction/lots/${lotId}/register`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok) {
        toast.success("Registrierung erfolgreich", {
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
        setLots((prev) => prev.map((l) => l.id === lotId ? { ...l, isRegistered: true } : l));
      } else {
        toast.error(d.error ?? "Registrierung fehlgeschlagen", {
          style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
        });
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setRegistering(null);
    }
  }

  // ── Filter ────────────────────────────────────────────────────────
  const displayed = lots.filter((l) => {
    if (filter === "mine")   return l.isRegistered;
    if (filter === "active") return l.phase === "PROPOSAL" || l.phase === "REDUCTION";
    return true;
  });

  const hasCbam    = displayed.some(l => l.co2PerTonne);
  const isVerified = kyc?.verificationStatus === "VERIFIED";

  return (
    <>
      <style>{`
        .sl-root { font-family:"IBM Plex Sans",Helvetica Neue,Arial,sans-serif; min-height:100vh; background:#f9fafb; color:#1a1a1a; }

        /* Header */
        .sl-hdr { background:#154194; height:56px; padding:0 28px; display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:0; z-index:50; }
        .sl-logo { font-size:15px; font-weight:700; color:#fff; letter-spacing:.06em; }
        .sl-logo-sub { font-size:11px; font-weight:300; color:rgba(255,255,255,.6); margin-left:8px; }
        .sl-hdr-right { display:flex; align-items:center; gap:10px; }
        .sl-hdr-link { font-size:12px; color:rgba(255,255,255,.8); text-decoration:none; padding:5px 10px; border:1px solid rgba(255,255,255,.3); transition:background .15s; }
        .sl-hdr-link:hover { background:rgba(255,255,255,.15); }

        /* Page */
        .sl-page { max-width:1080px; margin:0 auto; padding:32px 24px 80px; }

        /* KYC Banner */
        .sl-kyc-warn { background:#fffbeb; border:1px solid #fcd34d; padding:14px 20px; margin-bottom:24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .sl-kyc-warn-text { font-size:13px; color:#92400e; flex:1; }
        .sl-kyc-warn-link { padding:8px 16px; background:#d97706; color:#fff; font-size:12px; font-weight:700; text-decoration:none; white-space:nowrap; transition:background .15s; }
        .sl-kyc-warn-link:hover { background:#b45309; }

        /* Heading */
        .sl-heading { font-size:22px; font-weight:700; color:#111827; margin-bottom:4px; }
        .sl-sub { font-size:13px; color:#6b7280; margin-bottom:24px; }

        /* Filters */
        .sl-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .sl-ftab { padding:7px 16px; border:1px solid #d1d5db; background:#fff; font-size:12.5px; color:#374151; cursor:pointer; font-weight:500; transition:all .15s; }
        .sl-ftab.active { background:#d97706; color:#fff; border-color:#d97706; }
        .sl-ftab:hover:not(.active) { background:#fff7ed; }

        /* Table */
        .sl-table-wrap { overflow-x:auto; }
        .sl-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .sl-table th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#9ca3af; border-bottom:2px solid #d97706; background:#fff; white-space:nowrap; }
        .sl-table td { padding:14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .sl-table tr:last-child td { border-bottom:none; }
        .sl-table tr:hover td { background:#fffbf5; }

        /* Phase badge */
        .sl-phase { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#fff; }

        /* Action button */
        .sl-btn-reg { padding:7px 14px; background:#d97706; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; white-space:nowrap; transition:background .15s,transform .1s; }
        .sl-btn-reg:hover:not(:disabled) { background:#b45309; }
        .sl-btn-reg:active:not(:disabled) { transform:scale(.97); }
        .sl-btn-reg:disabled { opacity:.4; cursor:not-allowed; }
        .sl-btn-goto { padding:7px 14px; background:#fff; color:#d97706; font-size:12px; font-weight:700; border:1.5px solid #d97706; text-decoration:none; display:inline-block; white-space:nowrap; transition:all .15s; }
        .sl-btn-goto:hover { background:#d97706; color:#fff; }
        .sl-badge-reg { display:inline-flex; align-items:center; gap:5px; padding:5px 10px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; font-size:11.5px; font-weight:600; }

        /* Empty */
        .sl-empty { padding:60px 24px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }

        /* Stats */
        .sl-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
        @media(max-width:640px){.sl-stats{grid-template-columns:repeat(2,1fr);}}
        .sl-stat { background:#fff; border:1px solid #e5e7eb; padding:16px 18px; }
        .sl-stat-num { font-family:"IBM Plex Mono",monospace; font-size:28px; font-weight:700; line-height:1; }
        .sl-stat-label { font-size:11px; font-weight:700; letter-spacing:.06em; color:#9ca3af; text-transform:uppercase; margin-top:6px; }
        .sl-stat-sub { font-size:10.5px; color:#c4c9d4; margin-top:4px; }

        /* Closed-registration badge */
        .sl-badge-closed { display:inline-block; padding:4px 9px; background:#fffbeb; border:1px solid #fde68a; font-size:11px; color:#92400e; font-weight:500; }

        /* Loading */
        .sl-loading { color:#9ca3af; font-size:13px; padding:40px 24px; text-align:center; }
      `}</style>

      <div className="sl-root">
        <EucxHeader />

        {/* Verkäufer-Identitätsstreifen */}
        <div style={{
          background: "linear-gradient(90deg, #78350f 0%, #92400e 100%)",
          borderBottom: "1px solid #b45309",
          padding: "0 28px", height: 36,
          display: "flex", alignItems: "center",
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
        }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#fde68a", background: "rgba(255,255,255,.12)",
              padding: "3px 10px",
            }}>
              VERKÄUFER-PORTAL
            </span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)", letterSpacing: "0.02em" }}>
              Ausschreibungen einsehen · Gebote abgeben · Umsatz generieren
            </span>
          </div>
        </div>

        <div className="sl-page">

          {/* KYC-Warnung */}
          {kyc && !isVerified && (
            <div className="sl-kyc-warn">
              <div className="sl-kyc-warn-text">
                {kyc.verificationStatus === "GUEST" && "Identitätsprüfung noch nicht gestartet — Gebote sind erst nach KYC-Verifizierung möglich."}
                {kyc.verificationStatus === "PENDING_VERIFICATION" && "KYC-Dokumente eingereicht — Prüfung läuft (in der Regel unter 24h). Lots können Sie bereits einsehen."}
                {kyc.verificationStatus === "REJECTED" && "KYC abgelehnt — bitte kontaktieren Sie den Support oder laden Sie neue Dokumente hoch."}
                {kyc.verificationStatus === "SUSPENDED" && "Konto gesperrt — bitte kontaktieren Sie den Support."}
              </div>
              {(kyc.verificationStatus === "GUEST" || kyc.verificationStatus === "REJECTED") && (
                <a href="/dashboard/settings/verification" className="sl-kyc-warn-link">
                  Jetzt verifizieren →
                </a>
              )}
            </div>
          )}

          {/* KPI-Statistiken */}
          {!loading && (
            <div className="sl-stats">
              {[
                { num: lots.length,                                                                      label: "Verfügbare Lots",       color: "#0d1b2a", sub: "Offene Ausschreibungen" },
                { num: lots.filter(l => l.phase === "COLLECTION").length,                                label: "Registrierungsphase",   color: "#154194", sub: "Jetzt registrieren" },
                { num: lots.filter(l => l.isRegistered).length,                                          label: "Meine Registrierungen", color: "#d97706", sub: "Gebote möglich" },
                { num: lots.filter(l => (l.phase === "PROPOSAL" || l.phase === "REDUCTION") && l.isRegistered).length, label: "Aktive Auktionen", color: "#dc2626", sub: "Gebote laufen" },
              ].map(s => (
                <div key={s.label} className="sl-stat" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div className="sl-stat-num" style={{ color: s.color }}>{s.num}</div>
                  <div className="sl-stat-label">{s.label}</div>
                  <div className="sl-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          <div className="sl-heading">Verfügbare Ausschreibungen</div>
          <div className="sl-sub">Registrieren Sie sich für Auktionen in der Sammelphase und geben Sie Angebote ab.</div>

          {/* Filter-Tabs */}
          <div className="sl-filters">
            {(["all", "active", "mine"] as const).map((f) => (
              <button
                key={f}
                className={`sl-ftab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all"    && `Alle (${lots.length})`}
                {f === "active" && `Aktiv (${lots.filter((l) => l.phase === "PROPOSAL" || l.phase === "REDUCTION").length})`}
                {f === "mine"   && `Meine Registrierungen (${lots.filter((l) => l.isRegistered).length})`}
              </button>
            ))}
            <button
              className="sl-ftab"
              onClick={loadLots}
              style={{ marginLeft: "auto", color: "#d97706", borderColor: "#d97706" }}
            >
              ↻ Aktualisieren
            </button>
          </div>

          {/* Tabelle */}
          {loading ? (
            <div className="sl-loading">Wird geladen…</div>
          ) : displayed.length === 0 ? (
            <div className="sl-empty">
              {filter === "mine"
                ? "Sie sind noch bei keiner Auktion registriert."
                : filter === "active"
                ? "Aktuell keine aktiven Auktionen."
                : "Keine offenen Ausschreibungen vorhanden."}
            </div>
          ) : (
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Ware</th>
                    <th>Menge</th>
                    <th>Phase</th>
                    <th>Limit / Bestes</th>
                    {hasCbam && <th>CBAM</th>}
                    <th>Auktionsende</th>
                    <th>Bieter</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((lot) => {
                    const canRegister   = lot.phase === "COLLECTION" && !lot.isRegistered && isVerified;
                    const canGoToAction = (lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && lot.isRegistered;
                    const phaseColor    = PHASE_COLOR[lot.phase] ?? "#6b7280";

                    return (
                      <tr key={lot.id}>
                        <td style={{ fontWeight: 600, color: "#111827" }}>{lot.commodity}</td>
                        <td style={{ color: "#374151" }}>
                          {Number(lot.quantity).toLocaleString("de-DE")} {lot.unit}
                        </td>
                        <td>
                          <span className="sl-phase" style={{ background: phaseColor }} title={PHASE_TOOLTIP[lot.phase]}>
                            {PHASE_LABEL[lot.phase]}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
                          {lot.currentBest ? (
                            <><strong>{fmtEur(lot.currentBest)}</strong></>
                          ) : lot.startPrice ? (
                            <span style={{ color: "#6b7280" }}>{fmtEur(lot.startPrice)}</span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        {hasCbam && (
                          <td style={{ fontSize: 11.5, color: "#374151", whiteSpace: "nowrap" }}>
                            {lot.co2PerTonne ? (
                              <div>
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "#15803d" }}>
                                  {parseFloat(lot.co2PerTonne).toLocaleString("de-DE", { maximumFractionDigits: 1 })}
                                </span>
                                <span style={{ color: "#6b7280", fontSize: 10.5 }}> kg/t</span>
                                {lot.countryOfOrigin && (
                                  <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{lot.countryOfOrigin} · {lot.incoterms ?? "DAP"}</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "#d1d5db", fontSize: 11 }}>—</span>
                            )}
                          </td>
                        )}
                        <td style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {lot.auctionEnd
                            ? new Date(lot.auctionEnd).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                          {lot._count.bids}
                        </td>
                        <td>
                          {lot.isRegistered && (lot.phase === "COLLECTION") && (
                            <span className="sl-badge-reg">✓ Registriert</span>
                          )}
                          {canGoToAction && (
                            <a href={`/dashboard/seller/auction/${lot.id}`} className="sl-btn-goto">
                              Zur Auktion →
                            </a>
                          )}
                          {canRegister && (
                            <button
                              className="sl-btn-reg"
                              disabled={registering === lot.id}
                              onClick={() => registerForLot(lot.id)}
                            >
                              {registering === lot.id ? "…" : "Registrieren"}
                            </button>
                          )}
                          {!canRegister && !canGoToAction && !lot.isRegistered && lot.phase === "COLLECTION" && !isVerified && (
                            <span style={{ fontSize: 11.5, color: "#9ca3af" }}>KYC erforderlich</span>
                          )}
                          {(lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && !lot.isRegistered && (
                            <span className="sl-badge-closed" title="Registrierungsphase bereits abgeschlossen — Teilnahme an dieser Auktion nicht mehr möglich">
                              Registrierung geschlossen
                            </span>
                          )}
                          {lot.phase === "CONCLUSION" && lot.isRegistered && (
                            <a href={`/dashboard/seller/auction/${lot.id}`} className="sl-btn-goto" style={{ opacity: .7 }}>
                              Ergebnis →
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
