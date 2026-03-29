"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuctionStream } from "@/lib/auction/use-auction-stream";
import type { AuctionNotification } from "@/lib/auction/use-auction-stream";
import { KycStatusBadge } from "@/components/KycStatusBadge";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lot {
  id: string; commodity: string; quantity: string; unit: string;
  phase: string; startPrice: string | null; currentBest: string | null;
  auctionEnd: string | null; description: string | null;
}

interface Bid {
  id: string; bieter: string; price: string; isWinner: boolean; createdAt: string;
}

interface KycInfo {
  verificationStatus: "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  isYoungCompany: boolean;
  walletBalance: string;
}

interface Props { lot: Lot; initialBids: Bid[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtEur = (v: string | null | number) =>
  v == null || v === "" ? "—"
  : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtPct = (pct: number) =>
  new Intl.NumberFormat("de-DE", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(pct / 100);

function useCountdown(endIso: string | null) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!endIso) return;
    const tick = () => setMs(Math.max(0, new Date(endIso).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endIso]);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return {
    label: ms === 0 ? "Abgelaufen" : `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`,
    isUrgent: ms > 0 && ms < 10 * 60_000,
    ms,
  };
}

const PHASE_LABEL: Record<string, string> = {
  COLLECTION: "Registrierungsphase",
  PROPOSAL:   "Erstgebote",
  REDUCTION:  "Auktion läuft",
  CONCLUSION: "Abgeschlossen",
};
const PHASE_COLOR: Record<string, string> = {
  COLLECTION: "#6b7280",
  PROPOSAL:   "#2563eb",
  REDUCTION:  "#16a34a",
  CONCLUSION: "#9ca3af",
};

// ── Main Component ────────────────────────────────────────────────────────────

export function BuyerAuctionClient({ lot, initialBids }: Props) {
  const [token,      setToken]      = useState("");
  const [bids,       setBids]       = useState<Bid[]>(initialBids);
  const [kyc,        setKyc]        = useState<KycInfo | null>(null);
  const [flashBest,  setFlashBest]  = useState(false);
  const [sidebarOpen, setSidebar]   = useState(true);
  const prevBest = useRef<string | null>(lot.currentBest);

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => { setToken(localStorage.getItem("accessToken") ?? ""); }, []);

  // ── KYC ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setKyc({ verificationStatus: d.verificationStatus ?? "GUEST", isYoungCompany: d.isYoungCompany ?? false, walletBalance: d.walletBalance ?? "0" });
      })
      .catch(() => {});
  }, [token]);

  // ── SSE + Notifications ───────────────────────────────────────────
  const { state, connected, notifications, clearNotifications } = useAuctionStream(lot.id, token);

  // Notification-Queue → Toasts für Käufer
  useEffect(() => {
    if (!notifications.length) return;
    for (const n of notifications) {
      showBuyerNotificationToast(n);
    }
    clearNotifications();
  }, [notifications, clearNotifications]);

  function showBuyerNotificationToast(n: AuctionNotification) {
    switch (n.type) {
      case "URGENCY_10M":
        toast(n.title, {
          description: n.message,
          duration:    10000,
          style: { background: "#fffbeb", border: "1px solid #d97706", color: "#92400e" },
        });
        break;
      case "URGENCY_5M":
        toast.error(n.title, {
          description: n.message,
          duration:    15000,
          style: { background: "#fef2f2", border: "2px solid #dc2626", color: "#7f1d1d" },
        });
        break;
      case "CLOSED_BUYER":
        toast.success(n.title, {
          description: n.message,
          duration:    12000,
          style: { background: "#f0f4ff", border: "2px solid #154194", color: "#1e3a8a" },
        });
        break;
      default:
        toast(n.title, { description: n.message, duration: 5000 });
    }
  }
  const livePhase = state?.phase              ?? lot.phase;
  const liveBest  = state?.currentBest        ?? lot.currentBest;
  const liveEnd   = state?.auctionEnd         ?? lot.auctionEnd;
  const liveCnt   = state?.bidCount           ?? bids.length;
  const liveActive = state?.activeBidderCount ?? 0;
  const { label: countdown, isUrgent } = useCountdown(liveEnd);

  // Auto-compact sidebar in REDUCTION
  useEffect(() => {
    if (livePhase === "REDUCTION") setSidebar(false);
  }, [livePhase]);

  // ── Bids laden ───────────────────────────────────────────────────
  const loadBids = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`/api/auction/lots/${lot.id}/bids`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const d = await r.json();
      setBids(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d.bids ?? []).map((b: any) => ({
          id:        b.id,
          bieter:    b.sellerId as string,
          price:     b.price,
          isWinner:  b.isWinner,
          createdAt: b.createdAt,
        }))
      );
    } catch { /* ignore */ }
  }, [lot.id, token]);

  useEffect(() => { if (token) loadBids(); }, [token, loadBids]);

  useEffect(() => {
    if (!state || state.currentBest === prevBest.current) return;
    prevBest.current = state.currentBest;
    setFlashBest(true);
    loadBids();
    setTimeout(() => setFlashBest(false), 1400);
  }, [state?.currentBest, loadBids]);

  // ── Savings berechnen ────────────────────────────────────────────
  const startNum = lot.startPrice ? Number(lot.startPrice) : null;
  const bestNum  = liveBest       ? Number(liveBest)       : null;
  const savings     = startNum && bestNum ? startNum - bestNum : null;
  const savingsPct  = savings && startNum ? (savings / startNum) * 100 : null;

  // Preisreduktions-History: bids nach Zeit sortiert, jeder Schritt mit Δ
  const chronoBids = [...bids].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const reductionLog = chronoBids.map((bid, idx) => {
    const prev  = chronoBids[idx - 1];
    const delta = prev ? Number(bid.price) - Number(prev.price) : null;
    return { ...bid, delta };
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *,*::before,*::after { box-sizing:border-box; }

        .b-root { font-family:'IBM Plex Sans',Arial,sans-serif; background:#f0f2f5; min-height:100vh; color:#0d1b2a; }

        /* Header */
        .b-hdr { background:#0d1b2a; height:56px; padding:0 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:0; z-index:50; }
        .b-hdr-logo { font-size:14px; font-weight:700; color:#fff; letter-spacing:.04em; white-space:nowrap; }
        .b-hdr-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .b-hdr-link { font-size:12px; color:rgba(255,255,255,.75); text-decoration:none; padding:4px 10px; border:1px solid rgba(255,255,255,.25); transition:background .15s; white-space:nowrap; }
        .b-hdr-link:hover { background:rgba(255,255,255,.12); }
        .b-dot { width:8px; height:8px; border-radius:50%; background:#16a34a; display:inline-block; animation:bdot 2s infinite; }
        .b-dot.off { background:#6b7280; animation:none; }
        @keyframes bdot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .b-conn { font-size:11px; color:#9ca3af; white-space:nowrap; }

        /* Layout */
        .b-body { max-width:1200px; margin:0 auto; padding:24px 16px; display:grid; grid-template-columns:300px 1fr; gap:20px; align-items:start; }
        .b-body.compact { grid-template-columns:1fr; }
        @media (max-width:800px) { .b-body { grid-template-columns:1fr; padding:16px 12px; } }

        /* Sidebar toggle strip */
        .b-toggle { background:none; border:1px solid #e5e7eb; padding:8px 16px; font-size:12px; color:#6b7280; cursor:pointer; width:100%; text-align:left; transition:background .15s; margin-bottom:4px; }
        .b-toggle:hover { background:#f9fafb; }

        /* Sidebar */
        .b-sidebar { display:flex; flex-direction:column; gap:16px; }
        .b-lot-card { background:#fff; border:1px solid #e5e7eb; padding:20px; }
        .b-lot-phase { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; font-size:10px; font-weight:700; letter-spacing:.06em; color:#fff; margin-bottom:10px; }
        .b-lot-name { font-size:16px; font-weight:700; line-height:1.3; margin-bottom:6px; }
        .b-lot-meta { font-size:12px; color:#6b7280; line-height:1.7; }
        .b-lot-limit { font-size:13px; font-weight:700; color:#0d1b2a; margin-top:8px; }

        /* KPI cards */
        .b-kpi { background:#fff; border:1px solid #e5e7eb; padding:20px; }
        .b-kpi-label { font-size:10px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px; }
        .b-kpi-val { font-family:'IBM Plex Mono',monospace; font-size:28px; font-weight:600; line-height:1; }
        .b-kpi-sub { font-size:11px; color:#6b7280; margin-top:4px; }

        /* Main */
        .b-main { display:flex; flex-direction:column; gap:20px; }

        /* Savings Card — the star of the show */
        .b-savings { background:#fff; border:2px solid #16a34a; padding:28px 32px; display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center; }
        .b-savings.no-data { border-color:#e5e7eb; }
        .b-savings-left {}
        .b-savings-kpi-label { font-size:11px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; margin-bottom:8px; }
        .b-savings-amount { font-family:'IBM Plex Mono',monospace; font-size:52px; font-weight:600; color:#16a34a; line-height:1; }
        .b-savings-amount.flash { animation:bsavingsflash 1.4s ease-out; }
        @keyframes bsavingsflash { 0%{transform:scale(1.04)} 100%{transform:scale(1)} }
        .b-savings-pct { font-family:'IBM Plex Mono',monospace; font-size:20px; font-weight:600; color:#14532d; margin-top:4px; }
        .b-savings-hint { font-size:12px; color:#6b7280; margin-top:8px; }
        .b-savings-right { text-align:right; }
        .b-savings-best-label { font-size:11px; color:#9ca3af; margin-bottom:4px; }
        .b-savings-best { font-family:'IBM Plex Mono',monospace; font-size:28px; font-weight:600; color:#0d1b2a; }
        @media (max-width:640px) { .b-savings { grid-template-columns:1fr; } .b-savings-right { text-align:left; } .b-savings-amount { font-size:38px; } }

        /* Activity Indicator */
        .b-activity { background:#fff; border:1px solid #e5e7eb; padding:20px 24px; display:flex; align-items:center; gap:16px; }
        .b-activity-pulse { width:14px; height:14px; border-radius:50%; background:#16a34a; flex-shrink:0; animation:bpulse 1.5s infinite; }
        .b-activity-pulse.idle { background:#6b7280; animation:none; }
        @keyframes bpulse { 0%{box-shadow:0 0 0 0 rgba(22,163,74,.4)} 70%{box-shadow:0 0 0 10px rgba(22,163,74,0)} 100%{box-shadow:0 0 0 0 rgba(22,163,74,0)} }
        .b-activity-text { flex:1; }
        .b-activity-headline { font-size:16px; font-weight:700; color:#0d1b2a; }
        .b-activity-headline span { color:#16a34a; }
        .b-activity-sub { font-size:12px; color:#6b7280; margin-top:2px; }
        .b-activity-cnt { font-family:'IBM Plex Mono',monospace; font-size:32px; font-weight:600; color:#0d1b2a; flex-shrink:0; }

        /* KPI grid */
        .b-kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media (max-width:640px) { .b-kpi-grid { grid-template-columns:1fr; } }

        /* History log */
        .b-history { background:#fff; border:1px solid #e5e7eb; }
        .b-history-hdr { padding:14px 20px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; }
        .b-history-title { font-size:13px; font-weight:700; }
        .b-history-cnt { font-size:11px; color:#9ca3af; }
        .b-history-empty { padding:40px; text-align:center; color:#9ca3af; font-size:13px; }

        /* Table */
        table.b-tbl { width:100%; border-collapse:collapse; }
        table.b-tbl th { padding:9px 18px; font-size:10px; font-weight:700; letter-spacing:.06em; color:#9ca3af; text-align:left; border-bottom:1px solid #e5e7eb; background:#fafafa; white-space:nowrap; }
        table.b-tbl td { padding:11px 18px; font-size:13px; border-bottom:1px solid #f3f4f6; }
        table.b-tbl tr:last-child td { border-bottom:none; }
        table.b-tbl tr.b-row-best td { background:#f0fdf4; }
        table.b-tbl tr.b-row-winner td { background:#f0fdf4; }
        .b-rank-1 { font-family:'IBM Plex Mono',monospace; font-weight:600; color:#16a34a; }
        .b-price-cell { font-family:'IBM Plex Mono',monospace; font-weight:600; }
        .b-delta-neg { font-size:11px; font-weight:700; color:#16a34a; }
        .b-delta-none { font-size:11px; color:#9ca3af; }
      `}</style>

      <div className="b-root">

        {/* ── Header ── */}
        <div className="b-hdr">
          <a href="/dashboard/buyer" className="b-hdr-logo" style={{ textDecoration: "none" }}>← EUCX Käufer</a>
          <div className="b-hdr-right">
            {kyc && (
              <KycStatusBadge status={kyc.verificationStatus} isYoungCompany={kyc.isYoungCompany} walletBalance={kyc.walletBalance} />
            )}
            <a href="/dashboard/contracts" className="b-hdr-link">Verträge</a>
            {token && <NotificationBell token={token} />}
            <span className="b-conn">
              <span className={`b-dot${connected ? "" : " off"}`} />{" "}
              {connected ? "Live" : "…"}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={`b-body${sidebarOpen ? "" : " compact"}`}>

          {/* ── Sidebar ── */}
          {sidebarOpen && (
            <aside className="b-sidebar">
              <div className="b-lot-card">
                <div
                  className="b-lot-phase"
                  style={{ backgroundColor: PHASE_COLOR[livePhase] ?? "#6b7280" }}
                >
                  {PHASE_LABEL[livePhase] ?? livePhase}
                </div>
                <div className="b-lot-name">{lot.commodity}</div>
                <div className="b-lot-meta">
                  Menge: {lot.quantity} {lot.unit}
                  {lot.description && <><br />{lot.description}</>}
                </div>
                {lot.startPrice && (
                  <div className="b-lot-limit">Limit: {fmtEur(lot.startPrice)}</div>
                )}
              </div>

              {/* Timer */}
              <div className="b-kpi">
                <div className="b-kpi-label">Verbleibend</div>
                <div className="b-kpi-val" style={{ color: isUrgent ? "#dc2626" : "#0d1b2a" }}>
                  {liveEnd ? countdown : "—"}
                </div>
                <div className="b-kpi-sub">
                  {livePhase === "COLLECTION" && "Auktion noch nicht gestartet"}
                  {livePhase === "CONCLUSION" && "Auktion beendet"}
                </div>
              </div>

              {/* Gesamt Gebote */}
              <div className="b-kpi">
                <div className="b-kpi-label">Eingegangene Gebote</div>
                <div className="b-kpi-val">{liveCnt}</div>
                <div className="b-kpi-sub">Von {liveActive} aktiven Bieter{liveActive !== 1 ? "n" : ""}</div>
              </div>
            </aside>
          )}

          {/* ── Main Content ── */}
          <main className="b-main">

            {/* Sidebar toggle */}
            {!sidebarOpen && (
              <button className="b-toggle" onClick={() => setSidebar(true)}>
                ▶ Details einblenden — {lot.commodity} · {PHASE_LABEL[livePhase]}
              </button>
            )}
            {sidebarOpen && livePhase === "REDUCTION" && (
              <button className="b-toggle" onClick={() => setSidebar(false)}>
                ◀ Sidebar einklappen (maximale Sicht auf Gebote)
              </button>
            )}

            {/* ── Savings Card ── */}
            <div className={`b-savings${savings === null ? " no-data" : ""}`}>
              <div className="b-savings-left">
                <div className="b-savings-kpi-label">Aktuelle Ersparnis gegenüber Ihrem Limit</div>
                {savings !== null ? (
                  <>
                    <div className={`b-savings-amount${flashBest ? " flash" : ""}`}>
                      +{fmtEur(String(savings))}
                    </div>
                    {savingsPct !== null && (
                      <div className="b-savings-pct">−{fmtPct(savingsPct)} unter Ihrem Maximalpreis</div>
                    )}
                    <div className="b-savings-hint">
                      Jede weitere Preissenkung erhöht Ihre Einsparung direkt.
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 16, color: "#9ca3af", marginTop: 8 }}>
                    {lot.startPrice
                      ? "Warten auf erstes Gebot …"
                      : "Kein Maximalpreis hinterlegt — Ersparnis kann nicht berechnet werden."}
                  </div>
                )}
              </div>
              <div className="b-savings-right">
                <div className="b-savings-best-label">Aktuell bestes Gebot</div>
                <div className="b-savings-best">{fmtEur(liveBest)}</div>
              </div>
            </div>

            {/* ── Bieter-Aktivität ── */}
            <div className="b-activity">
              <div className={`b-activity-pulse${liveActive === 0 ? " idle" : ""}`} />
              <div className="b-activity-text">
                <div className="b-activity-headline">
                  {liveActive > 0 ? (
                    <><span>{liveActive} aktive Bieter</span> kämpfen um Ihren Auftrag</>
                  ) : livePhase === "COLLECTION" ? (
                    "Wartet auf registrierte Verkäufer"
                  ) : (
                    "Noch keine Gebote eingegangen"
                  )}
                </div>
                <div className="b-activity-sub">
                  {state?.registrationCount ?? 0} Verkäufer angemeldet · {liveCnt} Gebote insgesamt
                </div>
              </div>
              <div className="b-activity-cnt">{liveActive > 0 ? liveActive : "—"}</div>
            </div>

            {/* ── KPI-Grid ── */}
            <div className="b-kpi-grid">
              <div className="b-kpi" style={{ borderLeft: "3px solid #16a34a" }}>
                <div className="b-kpi-label">Bestes Gebot</div>
                <div className="b-kpi-val" style={{ color: "#16a34a" }}>{fmtEur(liveBest)}</div>
                <div className="b-kpi-sub">{lot.startPrice ? `Limit: ${fmtEur(lot.startPrice)}` : "Kein Limit"}</div>
              </div>
              <div className="b-kpi" style={{ borderLeft: `3px solid ${isUrgent ? "#dc2626" : "#6b7280"}` }}>
                <div className="b-kpi-label">Verbleibend</div>
                <div className="b-kpi-val" style={{ color: isUrgent ? "#dc2626" : "#0d1b2a" }}>
                  {liveEnd ? countdown : "—"}
                </div>
                <div className="b-kpi-sub">
                  {livePhase === "CONCLUSION" ? "Auktion beendet" : `Phase: ${PHASE_LABEL[livePhase]}`}
                </div>
              </div>
            </div>

            {/* ── Preisreduktions-Log ── */}
            <div className="b-history">
              <div className="b-history-hdr">
                <span className="b-history-title">Preisreduktions-Log</span>
                <span className="b-history-cnt">{bids.length} Preisstufen</span>
              </div>
              {reductionLog.length === 0 ? (
                <div className="b-history-empty">
                  Sobald Verkäufer Gebote abgeben, erscheinen alle Preisschritte hier.
                </div>
              ) : (
                <table className="b-tbl">
                  <thead>
                    <tr>
                      <th>Zeit</th>
                      <th>Bieter</th>
                      <th>Preis</th>
                      <th>Reduktion</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...reductionLog].reverse().map((bid, idx) => {
                      const isFirst = idx === reductionLog.length - 1;
                      const isBest  = idx === 0 && !bid.isWinner;
                      return (
                        <tr key={bid.id} className={bid.isWinner ? "b-row-winner" : isBest ? "b-row-best" : ""}>
                          <td style={{ color: "#6b7280", fontSize: 12 }}>
                            {new Date(bid.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </td>
                          <td>{bid.bieter}</td>
                          <td className="b-price-cell">{fmtEur(bid.price)}</td>
                          <td>
                            {isFirst || bid.delta === null ? (
                              <span className="b-delta-none">Erstgebot</span>
                            ) : (
                              <span className="b-delta-neg">
                                −{fmtEur(String(Math.abs(bid.delta ?? 0)))}
                              </span>
                            )}
                          </td>
                          <td>
                            {bid.isWinner ? (
                              <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 11 }}>SIEGER</span>
                            ) : isBest && livePhase !== "CONCLUSION" ? (
                              <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 11 }}>FÜHREND</span>
                            ) : (
                              <span style={{ color: "#9ca3af", fontSize: 11 }}>Überboten</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Kaufvertrag Download (nur nach CONCLUSION) ── */}
            {livePhase === "CONCLUSION" && (
              <div style={{
                margin: "20px 0 0",
                padding: "20px 24px",
                background: "#f0f4ff",
                borderLeft: "4px solid #154194",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#154194", marginBottom: 6, letterSpacing: "0.04em" }}>
                  AUKTION ABGESCHLOSSEN
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 14 }}>
                  Der Kaufvertrag wurde automatisch generiert. Laden Sie das signierbare PDF herunter.
                </div>
                <button
                  style={{
                    padding: "9px 20px",
                    background: "#154194",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    fetch(`/api/auction/lots/${lot.id}/contract`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                      .then(async (r) => {
                        if (!r.ok) { alert("Kaufvertrag noch nicht verfügbar. Bitte in wenigen Sekunden erneut versuchen."); return; }
                        const blob = await r.blob();
                        const url  = URL.createObjectURL(blob);
                        const a    = document.createElement("a");
                        a.href     = url;
                        a.download = `EUCX-Kaufvertrag-${lot.id.slice(0, 8)}.pdf`;
                        a.click();
                        URL.revokeObjectURL(url);
                      })
                      .catch(() => alert("Download fehlgeschlagen."));
                  }}
                >
                  Kaufvertrag herunterladen (PDF)
                </button>
                <span style={{ marginLeft: 16, fontSize: 11, color: "#9ca3af" }}>
                  SHA-256 gesichert · EUCX EDS
                </span>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
