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

  // Marktdaten je Warengruppe aus allen geladenen Lots
  const COMMODITY_SHORT: Record<string, string> = {
    "Betonstahl BST 500 (Rebar)":                    "Betonstahl B500",
    "Betonstahl BST 500S (seismisch)":               "Betonstahl B500S",
    "Walzdraht (Wire Rod) SAE 1008":                 "Walzdraht SAE1008",
    "Warmgewalzter Stahl S235JR (Blech / Coil)":    "S235JR Blech",
    "Feinkornbaustahl S355JR (Blech)":               "S355JR Feinblech",
    "HEA / HEB Stahlträger S235 / S355":            "HEA/HEB Träger",
    "Nahtgeschweißte Hohlprofile S235JRH":          "Hohlprofile",
    "Kupferkathoden Grade A":                        "Cu-CATH Grade A",
    "Aluminiumbarren (Primär) EN AW-1050A":         "Al 1050A Barren",
    "Stahlschrott HMS 1/2 (Heavy Melting Scrap)":   "HMS 1/2 Schrott",
  };
  interface MarketCard {
    key: string; label: string; lotCount: number; totalQty: number; unit: string;
    avgStart: number; bestBid: number | null; regs: number;
    isActive: boolean; bidPct: number;
  }
  const mmap = new Map<string, { lots: LotRow[] }>();
  for (const l of lots) {
    const k = l.commodity;
    const e = mmap.get(k) ?? { lots: [] };
    e.lots.push(l);
    mmap.set(k, e);
  }
  const marketCards: MarketCard[] = [...mmap.entries()].map(([k, { lots: ls }]) => {
    const label    = COMMODITY_SHORT[k] ?? k.slice(0, 20);
    const unit     = ls[0]?.unit ?? "TON";
    const totalQty = ls.reduce((s, l) => s + Number(l.quantity), 0);
    const withStart = ls.filter(l => l.startPrice);
    const avgStart  = withStart.length > 0
      ? withStart.reduce((s, l) => s + Number(l.startPrice), 0) / withStart.length
      : 0;
    const bids    = ls.flatMap(l => l.currentBest ? [Number(l.currentBest)] : []);
    const bestBid = bids.length > 0 ? Math.min(...bids) : null;
    const regs    = ls.reduce((s, l) => s + l._count.registrations, 0);
    const isActive = ls.some(l => l.phase === "PROPOSAL" || l.phase === "REDUCTION");
    // bidPct: wie weit das beste Gebot unter dem Startpreis liegt (0–100%)
    const bidPct = bestBid && avgStart > 0
      ? Math.max(0, Math.min(100, ((avgStart - bestBid) / avgStart) * 100))
      : 0;
    return { key: k, label, lotCount: ls.length, totalQty, unit, avgStart, bestBid, regs, isActive, bidPct };
  }).sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

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
        .sl-page { max-width:1100px; margin:0 auto; padding:32px 24px 80px; }

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

        /* Markt-Panel */
        .sl-market { margin-bottom:28px; }
        .sl-market-head { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .sl-market-title { font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#d97706; }
        .sl-market-line  { flex:1; height:1px; background:#e5e7eb; }
        .sl-market-hint  { font-size:10.5px; color:#9ca3af; }
        .sl-market-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        @media(max-width:900px){.sl-market-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:540px){.sl-market-grid{grid-template-columns:1fr;}}
        .sl-mc { background:#0d1b2a; border:1px solid #1e3a5f; padding:18px 18px 14px; position:relative; overflow:hidden; }
        .sl-mc::before { content:""; position:absolute; top:0; left:0; right:0; height:2px; background:#d97706; }
        .sl-mc-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
        .sl-mc-com { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#7ca4d4; }
        .sl-mc-qty { font-size:11px; color:#4a6a8a; font-family:"IBM Plex Mono",monospace; }
        .sl-mc-prices { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:12px; }
        .sl-mc-cell { background:#0a1628; padding:8px 10px; }
        .sl-mc-cell-lbl { font-size:9.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#4a6a8a; margin-bottom:4px; }
        .sl-mc-cell-val { font-family:"IBM Plex Mono",monospace; font-size:15px; font-weight:700; color:#e2e8f0; font-variant-numeric:tabular-nums; white-space:nowrap; }
        .sl-mc-cell-val.amber { color:#fbbf24; }
        .sl-mc-cell-val.green { color:#34d399; }
        .sl-mc-bar-wrap { margin-bottom:10px; }
        .sl-mc-bar-lbl { display:flex; justify-content:space-between; font-size:9.5px; color:#4a6a8a; margin-bottom:4px; font-family:"IBM Plex Mono",monospace; }
        .sl-mc-bar-track { height:4px; background:#0f2038; position:relative; }
        .sl-mc-bar-fill  { position:absolute; top:0; left:0; height:4px; background:linear-gradient(90deg,#34d399,#d97706); transition:width .4s ease; }
        .sl-mc-foot { display:flex; align-items:center; gap:10px; }
        .sl-mc-status { display:flex; align-items:center; gap:5px; font-size:10.5px; color:#4a6a8a; }
        .sl-mc-dot { width:6px; height:6px; border-radius:50%; }
        .sl-mc-comp { margin-left:auto; font-size:10px; color:#4a6a8a; font-family:"IBM Plex Mono",monospace; }
        .sl-mc-comp strong { color:#7ca4d4; }
        .sl-market-empty { background:#0d1b2a; border:1px solid #1e3a5f; padding:24px; text-align:center; font-size:12px; color:#4a6a8a; }
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
                { num: lots.length,                                                                                     label: "Verfügbare Lots",       sub: "Offene Ausschreibungen" },
                { num: lots.filter(l => l.phase === "COLLECTION").length,                                              label: "Registrierungsphase",   sub: "Jetzt registrieren" },
                { num: lots.filter(l => l.isRegistered).length,                                                        label: "Meine Registrierungen", sub: "Gebote möglich" },
                { num: lots.filter(l => (l.phase === "PROPOSAL" || l.phase === "REDUCTION") && l.isRegistered).length, label: "Aktive Auktionen",      sub: "Gebote laufen" },
              ].map(s => {
                const highlight = s.label === "Aktive Auktionen" && s.num > 0;
                return (
                  <div key={s.label} className="sl-stat" style={{ borderTop: `3px solid ${highlight ? "#dc2626" : "#e5e7eb"}` }}>
                    <div className="sl-stat-num" style={{ color: highlight ? "#dc2626" : "#111827" }}>{s.num}</div>
                    <div className="sl-stat-label">{s.label}</div>
                    <div className="sl-stat-sub">{s.sub}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Markt-Panel */}
          {!loading && (
            <div className="sl-market">
              <div className="sl-market-head">
                <span className="sl-market-title">Marktlage</span>
                <div className="sl-market-line" />
                <span className="sl-market-hint">Startlimit · Bestes Gebot · Biettiefe</span>
              </div>

              {marketCards.length === 0 ? (
                <div className="sl-market-empty">
                  Keine Marktdaten verfügbar — Ausschreibungen erscheinen hier sobald sie geladen sind.
                </div>
              ) : (
                <div className="sl-market-grid">
                  {marketCards.map((c) => {
                    const fmtM = (n: number) =>
                      n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
                    return (
                      <div key={c.key} className="sl-mc">
                        {/* Kopfzeile */}
                        <div className="sl-mc-top">
                          <div>
                            <div className="sl-mc-com">{c.label}</div>
                            <div className="sl-mc-qty">
                              {c.totalQty.toLocaleString("de-DE")} {c.unit} · {c.lotCount} Lot{c.lotCount !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <div className="sl-mc-status">
                            <span className="sl-mc-dot" style={{ background: c.isActive ? "#34d399" : "#4a6a8a" }} />
                            <span style={{ color: c.isActive ? "#34d399" : "#4a6a8a" }}>
                              {c.isActive ? "Aktiv" : "Sammlung"}
                            </span>
                          </div>
                        </div>

                        {/* Preiszellen */}
                        <div className="sl-mc-prices">
                          <div className="sl-mc-cell">
                            <div className="sl-mc-cell-lbl">Startlimit €/t</div>
                            <div className="sl-mc-cell-val amber">
                              {c.avgStart > 0 ? fmtM(c.avgStart) : "—"}
                            </div>
                          </div>
                          <div className="sl-mc-cell">
                            <div className="sl-mc-cell-lbl">Bestes Gebot €/t</div>
                            <div className="sl-mc-cell-val green">
                              {c.bestBid !== null ? fmtM(c.bestBid) : "—"}
                            </div>
                          </div>
                        </div>

                        {/* Biettiefe-Balken */}
                        <div className="sl-mc-bar-wrap">
                          <div className="sl-mc-bar-lbl">
                            <span>Startlimit</span>
                            <span>
                              {c.bidPct > 0
                                ? `−${c.bidPct.toFixed(1)}% unter Limit`
                                : c.bestBid !== null ? "Gebot = Limit" : "Noch kein Gebot"}
                            </span>
                          </div>
                          <div className="sl-mc-bar-track">
                            <div className="sl-mc-bar-fill" style={{ width: `${Math.max(4, 100 - c.bidPct)}%` }} />
                          </div>
                        </div>

                        {/* Fußzeile */}
                        <div className="sl-mc-foot">
                          <div className="sl-mc-status" style={{ fontSize: 10 }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <circle cx="5" cy="5" r="4" stroke="#4a6a8a" strokeWidth="1.2"/>
                              <path d="M5 3v2l1.2 1.2" stroke="#4a6a8a" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            <span>Offene Auktion</span>
                          </div>
                          <div className="sl-mc-comp">
                            <strong>{c.regs}</strong> Bieter registriert
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
