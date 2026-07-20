"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SellerStats {
  monthlyRevenue:  string;
  monthlyFees:     string;
  monthlyNet:      string;
  activeBidCount:  number;
  leadingBidCount: number;
  avgCo2:          number | null;
  wonDeals:        number;
  positions: {
    lotId:      string;
    commodity:  string;
    quantity:   string;
    unit:       string;
    phase:      string;
    auctionEnd: string | null;
    myPrice:    string;
    bestPrice:  string | null;
    isLeading:  boolean;
    diffToBest: string | null;
  }[];
  recentContracts: {
    id:             string;
    contractNumber: string;
    commodity:      string;
    quantity:       string;
    unit:           string;
    totalValue:     string;
    feeAmount:      string;
    createdAt:      string;
  }[];
}

interface TickerEvent {
  id:        string;
  commodity: string;
  quantity:  string;
  unit:      string;
  createdAt: string;
}

interface LotRow {
  id:           string;
  commodity:    string;
  quantity:     string;
  unit:         string;
  phase:        "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";
  startPrice:   string | null;
  currentBest:  string | null;
  auctionEnd:   string | null;
  isRegistered: boolean;
  co2PerTonne?: string | null;
  countryOfOrigin?: string | null;
  incoterms?:   string | null;
  _count: { bids: number; registrations: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const A  = "#d97706";  // amber — seller accent
const A2 = "#b45309";
const A3 = "#92400e";

const fmtEur = (v: string | null | undefined) =>
  v == null ? "—"
  : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v));

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const timeLeft = (iso: string | null): string => {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Abgelaufen";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

const PHASE_COLOR: Record<string, string> = {
  COLLECTION: "#6b7280",
  PROPOSAL:   "#2563eb",
  REDUCTION:  "#dc2626",
  CONCLUSION: "#9ca3af",
};

const PHASE_LABEL: Record<string, string> = {
  COLLECTION: "Registrierung",
  PROPOSAL:   "Angebote",
  REDUCTION:  "Reduktion",
  CONCLUSION: "Abgeschlossen",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function SellerControlCenter() {
  const router = useRouter();

  const [token,       setToken]       = useState("");
  const [stats,       setStats]       = useState<SellerStats | null>(null);
  const [lots,        setLots]        = useState<LotRow[]>([]);
  const [ticker,      setTicker]      = useState<TickerEvent[]>([]);
  const [loadingKpi,  setLoadingKpi]  = useState(true);
  const [loadingLots, setLoadingLots] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [lotFilter,   setLotFilter]   = useState<"all" | "mine">("all");
  const tickerRef                     = useRef<HTMLDivElement>(null);

  // ── Init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  // ── KPIs laden ────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    if (!token) return;
    setLoadingKpi(true);
    try {
      const r = await fetch("/api/seller/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setStats(await r.json());
    } catch { /* ignore */ }
    finally { setLoadingKpi(false); }
  }, [token]);

  // ── Lots laden ────────────────────────────────────────────────────
  const loadLots = useCallback(async () => {
    if (!token) return;
    setLoadingLots(true);
    try {
      const r = await fetch("/api/auction/lots", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setLots((await r.json()).lots ?? []);
    } catch { /* ignore */ }
    finally { setLoadingLots(false); }
  }, [token]);

  useEffect(() => { if (token) { void loadStats(); void loadLots(); } }, [token, loadStats, loadLots]);

  // ── Live-Ticker: SSE auf /api/orderbook/stream ────────────────────
  useEffect(() => {
    if (!token) return;
    // Poll für neue Lots alle 30s (als einfaches Polling, bis echter SSE-Feed verfügbar)
    const poll = async () => {
      try {
        const r = await fetch("/api/auction/lots?phase=COLLECTION", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const d = await r.json();
        const fresh: LotRow[] = d.lots ?? [];
        setLots((prev) => {
          // Neue Lots die vorher nicht in der Liste waren → Ticker-Event
          const prevIds = new Set(prev.map((l) => l.id));
          const newOnes = fresh.filter((l) => !prevIds.has(l.id));
          if (newOnes.length > 0) {
            setTicker((t) => {
              const events: TickerEvent[] = newOnes.map((l) => ({
                id:        l.id,
                commodity: l.commodity,
                quantity:  l.quantity,
                unit:      l.unit,
                createdAt: new Date().toISOString(),
              }));
              const updated = [...events, ...t].slice(0, 10);
              // Scroll Ticker nach oben
              setTimeout(() => tickerRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
              return updated;
            });
            toast(`Neues Gesuch: ${newOnes[0]!.commodity}`, {
              description: `${Number(newOnes[0]!.quantity).toLocaleString("de-DE")} ${newOnes[0]!.unit} — Registrierung offen`,
              style: { background: "#fffbeb", border: `1px solid ${A}`, color: A3 },
            });
          }
          return fresh.length > 0 ? fresh : prev;
        });
      } catch { /* ignore */ }
    };

    void poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [token]);

  // ── Registrierung ────────────────────────────────────────────────
  async function registerForLot(lotId: string) {
    if (!token || registering) return;
    setRegistering(lotId);
    try {
      const r = await fetch(`/api/auction/lots/${lotId}/register`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok) {
        toast.success("Registrierung erfolgreich");
        setLots((prev) => prev.map((l) => l.id === lotId ? { ...l, isRegistered: true } : l));
        void loadStats();
      } else {
        toast.error(d.error ?? "Fehler bei Registrierung");
      }
    } catch { toast.error("Netzwerkfehler"); }
    finally { setRegistering(null); }
  }

  const collectionLots = lots.filter((l) => l.phase === "COLLECTION");
  const displayLots    = lotFilter === "mine"
    ? lots.filter((l) => l.isRegistered && (l.phase === "PROPOSAL" || l.phase === "REDUCTION"))
    : collectionLots;

  return (
    <>
      <style>{`
        .scc { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }

        /* Stripe */
        .scc-stripe { background:linear-gradient(90deg,#78350f,#92400e); border-bottom:1px solid #b45309; padding:0 28px; height:36px; display:flex; align-items:center; }
        .scc-stripe-inner { max-width:1140px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .scc-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; background:rgba(255,255,255,.12); padding:3px 10px; }
        .scc-stripe-sub { font-size:11px; color:rgba(253,230,138,.7); letter-spacing:.02em; }

        /* Page */
        .scc-page { max-width:1140px; margin:0 auto; padding:28px 24px 80px; }

        /* Live-Ticker */
        .scc-ticker { background:#fff; border:1px solid #e5e7eb; border-left:4px solid ${A}; margin-bottom:24px; }
        .scc-ticker-hd { display:flex; align-items:center; gap:10px; padding:10px 16px; border-bottom:1px solid #f3f4f6; }
        .scc-ticker-dot { width:8px; height:8px; border-radius:50%; background:#ef4444; animation:pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
        .scc-ticker-title { font-size:12px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#374151; }
        .scc-ticker-body { max-height:80px; overflow-y:auto; scrollbar-width:thin; }
        .scc-ticker-item { display:flex; align-items:center; gap:10px; padding:9px 16px; border-bottom:1px solid #f9fafb; font-size:12.5px; }
        .scc-ticker-item:last-child { border-bottom:none; }
        .scc-ticker-new { font-size:9px; font-weight:700; padding:2px 6px; background:${A}; color:#fff; letter-spacing:.06em; flex-shrink:0; }
        .scc-ticker-text { flex:1; color:#111827; }
        .scc-ticker-time { font-size:10.5px; color:#9ca3af; flex-shrink:0; }
        .scc-ticker-empty { padding:14px 16px; font-size:12px; color:#9ca3af; }

        /* KPI-Grid */
        .scc-kpi { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
        @media(max-width:700px){ .scc-kpi { grid-template-columns:1fr; } }
        .scc-kpi-card { background:#fff; border:1px solid #e5e7eb; padding:20px 22px; position:relative; overflow:hidden; }
        .scc-kpi-card::before { content:""; position:absolute; top:0; left:0; right:0; height:3px; background:${A}; }
        .scc-kpi-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#9ca3af; margin-bottom:8px; }
        .scc-kpi-num { font-family:"IBM Plex Mono",monospace; font-size:30px; font-weight:700; line-height:1; color:#111827; }
        .scc-kpi-sub { font-size:11.5px; color:#6b7280; margin-top:5px; }
        .scc-kpi-sub strong { color:${A}; }
        .scc-kpi-icon { position:absolute; right:18px; top:18px; font-size:28px; opacity:.12; }

        /* Quick Actions */
        .scc-actions { display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; }
        .scc-btn-primary { padding:11px 22px; background:${A}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; white-space:nowrap; }
        .scc-btn-primary:hover { background:${A2}; }
        .scc-btn-secondary { padding:11px 20px; background:#fff; color:#374151; font-size:13px; font-weight:600; border:1px solid #d1d5db; cursor:pointer; transition:background .15s; white-space:nowrap; text-decoration:none; display:inline-block; }
        .scc-btn-secondary:hover { background:#f9fafb; }

        /* Section */
        .scc-section { margin-bottom:32px; }
        .scc-section-hd { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
        .scc-section-title { font-size:14px; font-weight:700; color:#111827; }
        .scc-section-sub { font-size:12px; color:#6b7280; }

        /* Position-Cards */
        .scc-pos-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr)); gap:12px; }
        .scc-pos-card { background:#fff; border:1px solid #e5e7eb; padding:16px 18px; position:relative; }
        .scc-pos-card.losing { border-left:4px solid #ef4444; }
        .scc-pos-card.leading { border-left:4px solid #16a34a; }
        .scc-pos-commodity { font-size:14px; font-weight:700; color:#111827; margin-bottom:4px; }
        .scc-pos-qty { font-size:12px; color:#6b7280; margin-bottom:12px; }
        .scc-pos-prices { display:flex; gap:16px; margin-bottom:12px; }
        .scc-pos-price-box { flex:1; }
        .scc-pos-price-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; margin-bottom:2px; }
        .scc-pos-price-val { font-family:"IBM Plex Mono",monospace; font-size:16px; font-weight:700; }
        .scc-pos-status { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; font-size:11px; font-weight:700; }
        .scc-pos-status.leading { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
        .scc-pos-status.losing { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .scc-pos-timer { font-size:11px; color:#6b7280; margin-top:8px; }
        .scc-pos-diff { font-size:11px; color:#dc2626; margin-top:4px; }
        .scc-pos-btn { display:block; text-align:center; margin-top:12px; padding:7px; background:${A}; color:#fff; font-size:12px; font-weight:700; text-decoration:none; transition:background .15s; }
        .scc-pos-btn:hover { background:${A2}; }
        .scc-pos-empty { padding:32px 24px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }

        /* Table */
        .scc-table-wrap { overflow-x:auto; }
        .scc-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .scc-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#9ca3af; border-bottom:2px solid ${A}; white-space:nowrap; }
        .scc-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .scc-table tr:last-child td { border-bottom:none; }
        .scc-table tr:hover td { background:#fffbf5; }
        .scc-phase { display:inline-block; padding:3px 8px; font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#fff; white-space:nowrap; }
        .scc-reg-btn { padding:7px 14px; background:${A}; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .scc-reg-btn:hover:not(:disabled) { background:${A2}; }
        .scc-reg-btn:disabled { opacity:.4; cursor:not-allowed; }
        .scc-reg-done { display:inline-flex; align-items:center; gap:5px; padding:5px 10px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; font-size:11.5px; font-weight:600; }

        /* Recent contracts */
        .scc-contracts { background:#fff; border:1px solid #e5e7eb; }
        .scc-contract-row { display:flex; align-items:center; gap:16px; padding:12px 18px; border-bottom:1px solid #f3f4f6; flex-wrap:wrap; }
        .scc-contract-row:last-child { border-bottom:none; }
        .scc-contract-no { font-size:10.5px; font-weight:700; color:#9ca3af; font-family:"IBM Plex Mono",monospace; flex-shrink:0; }
        .scc-contract-ware { font-size:13px; font-weight:600; color:#111827; flex:1; min-width:120px; }
        .scc-contract-val { font-family:"IBM Plex Mono",monospace; font-size:13px; font-weight:700; color:#15803d; flex-shrink:0; }
        .scc-contract-date { font-size:11px; color:#9ca3af; flex-shrink:0; }

        /* Tabs */
        .scc-tabs { display:flex; gap:0; border-bottom:2px solid #e5e7eb; margin-bottom:16px; }
        .scc-tab { padding:8px 18px; font-size:12.5px; font-weight:600; color:#6b7280; background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s; font-family:inherit; }
        .scc-tab.active { color:${A}; border-bottom-color:${A}; }
        .scc-tab:hover:not(.active) { color:#374151; }

        /* CBAM badge */
        .scc-cbam-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; font-size:11px; font-weight:700; font-family:"IBM Plex Mono",monospace; }
      `}</style>

      <div className="scc">
        <EucxHeader />

        {/* Identitätsstreifen */}
        <div className="scc-stripe">
          <div className="scc-stripe-inner">
            <span className="scc-badge">VERKÄUFER-PORTAL</span>
            <span className="scc-stripe-sub">Control Center · Gebote · Inventory · Logistik · Abrechnung</span>
          </div>
        </div>

        <div className="scc-page">

          {/* ── Live-Ticker ──────────────────────────────────────────── */}
          <div className="scc-ticker">
            <div className="scc-ticker-hd">
              <span className="scc-ticker-dot" />
              <span className="scc-ticker-title">Markt-Scanner — Neue Ausschreibungen</span>
              <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                Automatisch · alle 30 Sek.
              </span>
            </div>
            <div className="scc-ticker-body" ref={tickerRef}>
              {ticker.length === 0 ? (
                <div className="scc-ticker-empty">
                  Warten auf neue Ausschreibungen… ({collectionLots.length} aktuell offen)
                </div>
              ) : (
                ticker.map((e) => (
                  <div key={e.id} className="scc-ticker-item">
                    <span className="scc-ticker-new">NEU</span>
                    <span className="scc-ticker-text">
                      <strong>{e.commodity}</strong> —{" "}
                      {Number(e.quantity).toLocaleString("de-DE")} {e.unit} gesucht
                    </span>
                    <span className="scc-ticker-time">{fmtDate(e.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── KPI-Karten ───────────────────────────────────────────── */}
          <div className="scc-kpi">
            {/* Umsatz */}
            <div className="scc-kpi-card">
              <span className="scc-kpi-icon">€</span>
              <div className="scc-kpi-label">Umsatz & Marge — lfd. Monat</div>
              <div className="scc-kpi-num">
                {loadingKpi ? "…" : fmtEur(stats?.monthlyRevenue ?? "0")}
              </div>
              <div className="scc-kpi-sub">
                Marge (nach Gebühren):{" "}
                <strong>{loadingKpi ? "…" : fmtEur(stats?.monthlyNet ?? "0")}</strong>
                {stats && parseFloat(stats.monthlyFees) > 0 && (
                  <span style={{ color: "#9ca3af", marginLeft: 6 }}>
                    −{fmtEur(stats.monthlyFees)} Gebühren
                  </span>
                )}
              </div>
            </div>

            {/* Aktive Gebote */}
            <div className="scc-kpi-card">
              <span className="scc-kpi-icon">⚡</span>
              <div className="scc-kpi-label">Aktive Gebote</div>
              <div className="scc-kpi-num" style={{ color: loadingKpi ? "#9ca3af" : stats?.activeBidCount ? "#d97706" : "#9ca3af" }}>
                {loadingKpi ? "…" : stats?.activeBidCount ?? 0}
              </div>
              <div className="scc-kpi-sub">
                {loadingKpi ? "…" : (
                  <>
                    <strong style={{ color: "#16a34a" }}>{stats?.leadingBidCount ?? 0}× in Führung</strong>
                    {(stats?.activeBidCount ?? 0) - (stats?.leadingBidCount ?? 0) > 0 && (
                      <span style={{ color: "#dc2626", marginLeft: 6 }}>
                        {(stats?.activeBidCount ?? 0) - (stats?.leadingBidCount ?? 0)}× gefährdet
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* CBAM-Score */}
            <div className="scc-kpi-card">
              <span className="scc-kpi-icon">🌿</span>
              <div className="scc-kpi-label">CBAM-Score — Ihr Ø CO₂-Fußabdruck</div>
              <div className="scc-kpi-num" style={{ color: "#16a34a" }}>
                {loadingKpi
                  ? "…"
                  : stats?.avgCo2 != null
                  ? `${stats.avgCo2.toLocaleString("de-DE", { maximumFractionDigits: 2 })} t`
                  : "—"}
              </div>
              <div className="scc-kpi-sub">
                CO₂-Äq. / Tonne Ware{" "}
                {stats?.avgCo2 != null && stats.avgCo2 < 1.5 && (
                  <strong style={{ color: "#16a34a" }}>· Grüner Vorteil</strong>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick-Actions ────────────────────────────────────────── */}
          <div className="scc-actions">
            <button
              className="scc-btn-primary"
              onClick={() => router.push("/dashboard/seller/inventory")}
            >
              + Neue Charge melden
            </button>
            <a href="/dashboard/seller/auctions" className="scc-btn-secondary">
              Alle Ausschreibungen
            </a>
            <a href="/dashboard/seller/logistics" className="scc-btn-secondary">
              Lieferungen verwalten
            </a>
            <a href="/dashboard/seller/billing" className="scc-btn-secondary">
              Abrechnung
            </a>
            <button
              className="scc-btn-secondary"
              onClick={() => { void loadStats(); void loadLots(); }}
              style={{ marginLeft: "auto", color: A, borderColor: A }}
            >
              ↻ Aktualisieren
            </button>
          </div>

          {/* ── Meine Positionen ─────────────────────────────────────── */}
          <div className="scc-section">
            <div className="scc-section-hd">
              <div>
                <div className="scc-section-title">Meine aktiven Positionen</div>
                <div className="scc-section-sub">
                  Laufende Gebote — gefährdet zuerst
                </div>
              </div>
            </div>

            {loadingKpi ? (
              <div className="scc-pos-empty">Wird geladen…</div>
            ) : !stats || stats.positions.length === 0 ? (
              <div className="scc-pos-empty">
                Keine aktiven Gebote — registrieren Sie sich für offene Ausschreibungen.
              </div>
            ) : (
              <div className="scc-pos-grid">
                {stats.positions.map((pos) => (
                  <div key={pos.lotId} className={`scc-pos-card ${pos.isLeading ? "leading" : "losing"}`}>
                    <div className="scc-pos-commodity">{pos.commodity}</div>
                    <div className="scc-pos-qty">
                      {Number(pos.quantity).toLocaleString("de-DE")} {pos.unit}
                      <span style={{ marginLeft: 8 }}>
                        <span className="scc-phase" style={{ background: PHASE_COLOR[pos.phase] ?? "#6b7280", fontSize: 9 }}>
                          {PHASE_LABEL[pos.phase]}
                        </span>
                      </span>
                    </div>
                    <div className="scc-pos-prices">
                      <div className="scc-pos-price-box">
                        <div className="scc-pos-price-label">Mein Gebot</div>
                        <div className="scc-pos-price-val" style={{ color: A }}>
                          {fmtEur(pos.myPrice)} €/t
                        </div>
                      </div>
                      <div className="scc-pos-price-box">
                        <div className="scc-pos-price-label">Bestes Gebot</div>
                        <div className="scc-pos-price-val" style={{ color: pos.isLeading ? "#15803d" : "#dc2626" }}>
                          {pos.bestPrice ? `${fmtEur(pos.bestPrice)} €/t` : "—"}
                        </div>
                      </div>
                    </div>
                    <div className={`scc-pos-status ${pos.isLeading ? "leading" : "losing"}`}>
                      {pos.isLeading ? "✓ In Führung" : "⚠ Unterboten"}
                    </div>
                    {pos.diffToBest && (
                      <div className="scc-pos-diff">
                        +{fmtEur(pos.diffToBest)} über bestem Gebot — Gebot senken?
                      </div>
                    )}
                    <div className="scc-pos-timer">
                      Endet in: <strong>{timeLeft(pos.auctionEnd)}</strong>
                      {pos.auctionEnd && (
                        <span style={{ color: "#9ca3af", marginLeft: 6 }}>({fmtDate(pos.auctionEnd)})</span>
                      )}
                    </div>
                    <a
                      href={`/dashboard/seller/auction/${pos.lotId}`}
                      className="scc-pos-btn"
                    >
                      {pos.isLeading ? "Auktion beobachten →" : "Gebot verbessern →"}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Offene Ausschreibungen ───────────────────────────────── */}
          <div className="scc-section">
            <div className="scc-section-hd">
              <div>
                <div className="scc-section-title">Ausschreibungen</div>
                <div className="scc-section-sub">Registrieren Sie sich in der Sammelphase</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`scc-tab${lotFilter === "all" ? " active" : ""}`}
                  style={{ border: "none", padding: "6px 14px" }}
                  onClick={() => setLotFilter("all")}
                >
                  Offen ({collectionLots.length})
                </button>
                <button
                  className={`scc-tab${lotFilter === "mine" ? " active" : ""}`}
                  style={{ border: "none", padding: "6px 14px" }}
                  onClick={() => setLotFilter("mine")}
                >
                  Meine Auktionen ({lots.filter((l) => l.isRegistered && (l.phase === "PROPOSAL" || l.phase === "REDUCTION")).length})
                </button>
              </div>
            </div>

            {loadingLots ? (
              <div className="scc-pos-empty">Wird geladen…</div>
            ) : displayLots.length === 0 ? (
              <div className="scc-pos-empty">
                {lotFilter === "mine"
                  ? "Sie nehmen an keiner aktiven Auktion teil."
                  : "Keine offenen Ausschreibungen in der Registrierungsphase."}
              </div>
            ) : (
              <div className="scc-table-wrap">
                <table className="scc-table">
                  <thead>
                    <tr>
                      <th>Ware</th>
                      <th>Menge</th>
                      <th>Phase</th>
                      <th>Limit</th>
                      <th>CO₂</th>
                      <th>Endet</th>
                      <th>Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLots.map((lot) => (
                      <tr key={lot.id}>
                        <td style={{ fontWeight: 600, color: "#111827" }}>{lot.commodity}</td>
                        <td style={{ color: "#374151" }}>
                          {Number(lot.quantity).toLocaleString("de-DE")} {lot.unit}
                        </td>
                        <td>
                          <span className="scc-phase" style={{ background: PHASE_COLOR[lot.phase] ?? "#6b7280" }}>
                            {PHASE_LABEL[lot.phase]}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
                          {lot.startPrice
                            ? `${Number(lot.startPrice).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €/t`
                            : <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                        <td>
                          {lot.co2PerTonne ? (
                            <span className="scc-cbam-badge">
                              {parseFloat(lot.co2PerTonne).toLocaleString("de-DE", { maximumFractionDigits: 1 })} kg/t
                            </span>
                          ) : (
                            <span style={{ color: "#d1d5db", fontSize: 11 }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: "#6b7280" }}>
                          {fmtDate(lot.auctionEnd)}
                        </td>
                        <td>
                          {lot.isRegistered && lot.phase === "COLLECTION" && (
                            <span className="scc-reg-done">✓ Registriert</span>
                          )}
                          {lot.isRegistered && (lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && (
                            <a href={`/dashboard/seller/auction/${lot.id}`} style={{ padding: "7px 14px", background: "#fff", color: A, border: `1.5px solid ${A}`, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                              Zur Auktion →
                            </a>
                          )}
                          {!lot.isRegistered && lot.phase === "COLLECTION" && (
                            <button
                              className="scc-reg-btn"
                              disabled={registering === lot.id}
                              onClick={() => registerForLot(lot.id)}
                            >
                              {registering === lot.id ? "…" : "Registrieren"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Gewonnene Deals ──────────────────────────────────────── */}
          {stats && stats.recentContracts.length > 0 && (
            <div className="scc-section">
              <div className="scc-section-hd">
                <div>
                  <div className="scc-section-title">Letzte Abschlüsse</div>
                  <div className="scc-section-sub">Gewonnene Kontrakte diesen Monat</div>
                </div>
                <a href="/dashboard/seller/billing" className="scc-btn-secondary" style={{ fontSize: 12 }}>
                  Alle Kontrakte →
                </a>
              </div>
              <div className="scc-contracts">
                {stats.recentContracts.map((c) => (
                  <div key={c.id} className="scc-contract-row">
                    <span className="scc-contract-no">{c.contractNumber}</span>
                    <span className="scc-contract-ware">
                      {c.commodity}{" "}
                      <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                        {Number(c.quantity).toLocaleString("de-DE")} {c.unit}
                      </span>
                    </span>
                    <span className="scc-contract-val">{fmtEur(c.totalValue)}</span>
                    <span className="scc-contract-date">{fmtDate(c.createdAt)}</span>
                    <a
                      href="/dashboard/seller/billing"
                      style={{ fontSize: 11.5, color: A, fontWeight: 700, textDecoration: "none" }}
                    >
                      Vertrag →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
