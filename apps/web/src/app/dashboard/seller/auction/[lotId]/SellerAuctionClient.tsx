"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuctionStream } from "@/lib/auction/use-auction-stream";
import type { AuctionNotification } from "@/lib/auction/use-auction-stream";
import { EucxHeader } from "@/components/layout/EucxHeader";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lot {
  id: string; commodity: string; quantity: string; unit: string;
  phase: string; startPrice: string | null; currentBest: string | null;
  auctionEnd: string | null; auctionStart: string | null;
  createdAt: string; description: string | null;
  incoterms: string | null; countryOfOrigin: string | null;
  co2PerTonne: string | null; productionSiteId: string | null;
  hsCode: string | null; qualityGrade: string | null;
  deliveryPeriod: string | null; paymentTerms: string | null;
  vatTreatment: string | null;
}

interface MyBid   { price: string; rank: number; createdAt: string; }
interface AllBid  { id: string; sellerId: string; price: string; isOwn: boolean; rank: number; createdAt: string; }

interface KycInfo {
  verificationStatus: "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  isYoungCompany:     boolean;
  walletBalance:      string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtEur = (v: string | null | number) =>
  v == null || v === "" ? "—"
  : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDelta = (delta: number) =>
  delta === 0 ? "±0 €"
  : (delta > 0 ? "+" : "") +
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(delta);

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
    label:    ms === 0 ? (endIso ? "Abgelaufen" : "—") : `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`,
    isUrgent: ms > 0 && ms < 10 * 60_000,
    ms,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SellerAuctionClient({ lot }: { lot: Lot }) {
  const [token,       setToken]       = useState("");
  const [priceInput,  setPriceInput]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [myBids,      setMyBids]      = useState<MyBid[]>([]);
  const [allBids,     setAllBids]     = useState<AllBid[]>([]);
  const [myRank,      setMyRank]      = useState<number | null>(null);
  const [kyc,         setKyc]         = useState<KycInfo | null>(null);
  const [depositReq,  setDepositReq]  = useState<string | null>(null);
  const [flash,       setFlash]       = useState<"good" | "bad" | null>(null);

  const prevBest = useRef<string | null>(lot.currentBest);

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => { setToken(localStorage.getItem("accessToken") ?? ""); }, []);

  // ── KYC ──────────────────────────────────────────────────────────
  const loadKyc = useCallback(async (tkn: string) => {
    try {
      const r = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } });
      if (!r.ok) return;
      const d = await r.json();
      setKyc({ verificationStatus: d.verificationStatus ?? "GUEST", isYoungCompany: d.isYoungCompany ?? false, walletBalance: d.walletBalance ?? "0" });
      if (d.isYoungCompany) {
        const p = lot.currentBest ?? lot.startPrice;
        if (p) {
          const req  = Math.ceil(Number(lot.quantity) * Number(p) * 0.05 * 100) / 100;
          const miss = Math.max(0, req - Number(d.walletBalance ?? 0));
          setDepositReq(miss > 0 ? miss.toFixed(2) : null);
        }
      }
    } catch { /* ignore */ }
  }, [lot.quantity, lot.currentBest, lot.startPrice]);

  useEffect(() => { if (token) loadKyc(token); }, [token, loadKyc]);

  // ── SSE + Notifications ───────────────────────────────────────────
  const { state, connected, notifications, clearNotifications } = useAuctionStream(lot.id, token);

  // Notification-Queue verarbeiten → Toasts + Vibration
  useEffect(() => {
    if (!notifications.length) return;
    for (const n of notifications) {
      showNotificationToast(n);
    }
    clearNotifications();
  }, [notifications, clearNotifications]);
  const livePhase = state?.phase       ?? lot.phase;
  const liveBest  = state?.currentBest ?? lot.currentBest;
  const liveEnd   = state?.auctionEnd  ?? lot.auctionEnd;
  const { label: countdown, isUrgent } = useCountdown(liveEnd);

  // ── Bids laden ───────────────────────────────────────────────────
  const loadBids = useCallback(async (tkn: string) => {
    if (!tkn) return;
    try {
      const r = await fetch(`/api/auction/lots/${lot.id}/bids`, { headers: { Authorization: `Bearer ${tkn}` } });
      if (!r.ok) return;
      const d = await r.json();
      setAllBids(d.bids ?? []);
      const mine = (d.bids ?? []).filter((b: AllBid) => b.isOwn);
      setMyBids(mine.map((b: AllBid) => ({ price: b.price, rank: b.rank, createdAt: b.createdAt })));
      setMyRank(d.myBestRank ?? null);
    } catch { /* ignore */ }
  }, [lot.id]);

  useEffect(() => { if (token) loadBids(token); }, [token, loadBids]);

  // SSE-Trigger: Preis geändert → Bids neu laden
  useEffect(() => {
    if (!state || state.currentBest === prevBest.current) return;
    prevBest.current = state.currentBest;
    loadBids(token);
  }, [state?.currentBest, token, loadBids]);

  // ── Gebot abgeben ────────────────────────────────────────────────
  const submitBid = async (price: number) => {
    if (!token || submitting || price <= 0) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/auction/lots/${lot.id}/bids`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.kycRequired) {
          toast.error("Aktion verweigert: KYC-Profil abschließen", {
            action: { label: "Jetzt verifizieren", onClick: () => { window.location.href = "/dashboard/settings/verification"; } },
            style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
            duration: 8000,
          });
        } else {
          toast.error(d.error ?? "Gebot abgelehnt", {
            style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
          });
        }
        setFlash("bad");
        setTimeout(() => setFlash(null), 1500);
      } else {
        toast.success("Gebot abgegeben", { description: `Neues Bestgebot: ${fmtEur(d.newBest)}` });
        setPriceInput("");
        setFlash("good");
        setTimeout(() => setFlash(null), 1500);
        await loadBids(token);
      }
    } catch { toast.error("Netzwerkfehler"); }
    finally { setSubmitting(false); }
  };

  // ── Derived state ────────────────────────────────────────────────
  const canBid    = livePhase === "PROPOSAL" || livePhase === "REDUCTION";
  const bestNum   = liveBest ? Number(liveBest) : null;
  const isLeading = myRank === 1;

  // ── Notification → Toast + Vibrate ──────────────────────────────
  function showNotificationToast(n: AuctionNotification) {
    const vibrate = (pattern: number[]) => {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    };

    switch (n.type) {
      case "OUTBID":
        vibrate([200, 100, 200]);
        toast.error(n.title, {
          description: n.message,
          duration:    8000,
          style: { background: "#fef2f2", border: "2px solid #dc2626", color: "#7f1d1d" },
        });
        break;
      case "LEADING":
        toast.success(n.title, {
          description: n.message,
          duration:    4000,
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
        break;
      case "URGENCY_10M":
        vibrate([100]);
        toast(n.title, {
          description: n.message,
          duration:    10000,
          style: { background: "#fffbeb", border: "1px solid #d97706", color: "#92400e" },
        });
        break;
      case "URGENCY_5M":
        vibrate([300, 100, 300, 100, 300]);
        toast.error(n.title, {
          description: n.message,
          duration:    15000,
          style: { background: "#fef2f2", border: "2px solid #dc2626", color: "#7f1d1d" },
        });
        break;
      case "WON":
        vibrate([100, 50, 100]);
        toast.success(n.title, {
          description: n.message,
          duration:    10000,
          style: { background: "#f0fdf4", border: "2px solid #16a34a", color: "#14532d" },
        });
        break;
      case "DEPOSIT_WARN":
        vibrate([100]);
        toast(n.title, {
          description: n.message,
          duration:    10000,
          style: { background: "#fffbeb", border: "1px solid #d97706", color: "#92400e" },
        });
        break;
      default:
        toast(n.title, { description: n.message, duration: 5000 });
    }
  }

  // Competitor-Analyse: alle Gebote sortiert nach Zeit DESC, mit Delta
  const competitorBids = [...allBids].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const competitorWithDelta = competitorBids.map((bid, idx) => {
    const next  = competitorBids[idx + 1]; // vorheriges Gebot (zeitlich älter)
    const delta = next ? Number(bid.price) - Number(next.price) : 0;
    return { ...bid, delta };
  });

  const downloadContract = () => {
    fetch(`/api/auction/lots/${lot.id}/contract`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) { alert("Vertrag noch nicht verfügbar."); return; }
        const blob = await r.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `EUCX-Kaufvertrag-${lot.id.slice(0,8)}.pdf`;
        a.click(); URL.revokeObjectURL(url);
      }).catch(() => alert("Download fehlgeschlagen."));
  };

  const PHASE_LABEL: Record<string, string> = {
    COLLECTION: "Sammelphase", PROPOSAL: "Erstgebote", REDUCTION: "Auktion läuft", CONCLUSION: "Abgeschlossen",
  };
  const PHASE_COLOR: Record<string, string> = {
    COLLECTION: "#6b7280", PROPOSAL: "#d97706", REDUCTION: "#154194", CONCLUSION: "#16a34a",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *,*::before,*::after { box-sizing:border-box; }

        @keyframes sa-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes sa-flash { 0%{transform:scale(1.03)} 100%{transform:scale(1)} }

        .sa-root { font-family:'IBM Plex Sans',Arial,sans-serif; background:#f5f7fb; min-height:100vh; color:#0d1b2a; }

        .sa-page { max-width:1080px; margin:0 auto; padding:28px 24px 64px; }
        .sa-page-hdr { display:flex; align-items:center; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
        .sa-page-title { font-size:20px; font-weight:700; color:#111827; }
        .sa-page-sub { font-size:13px; color:#6b7280; }
        .sa-chip { display:inline-block; padding:3px 9px; font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#fff; }
        .sa-dot { width:8px; height:8px; border-radius:50%; background:#16a34a; display:inline-block; animation:sa-dot 2s infinite; }
        .sa-dot.off { background:#9ca3af; animation:none; }

        .sa-grid { display:grid; grid-template-columns:260px 1fr; gap:20px; align-items:start; }
        @media(max-width:800px) { .sa-grid { grid-template-columns:1fr; } }

        .sa-sidebar { display:flex; flex-direction:column; gap:14px; }

        .sa-card { background:#fff; border:1px solid #e5e7eb; }

        .sa-lot-card { padding:20px; }
        .sa-lot-label { font-size:10px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px; }
        .sa-lot-name { font-size:16px; font-weight:700; line-height:1.3; margin-bottom:12px; }
        .sa-lot-row { display:flex; justify-content:space-between; font-size:12px; padding:5px 0; border-bottom:1px solid #f3f4f6; }
        .sa-lot-row:last-child { border-bottom:none; }
        .sa-lot-key { color:#9ca3af; }
        .sa-lot-val { font-family:'IBM Plex Mono',monospace; font-weight:600; color:#374151; }

        .sa-kpi { padding:20px; }
        .sa-kpi-label { font-size:10px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px; }
        .sa-kpi-val { font-family:'IBM Plex Mono',monospace; font-size:28px; font-weight:600; line-height:1; color:#0d1b2a; }
        .sa-kpi-val.urgent { color:#dc2626; }
        .sa-kpi-sub { font-size:11px; color:#6b7280; margin-top:4px; }

        .sa-hist-hdr { padding:12px 18px; border-bottom:1px solid #f3f4f6; font-size:10px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; }
        .sa-hist-row { padding:10px 18px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f9fafb; font-size:12px; }
        .sa-hist-row:last-child { border-bottom:none; }
        .sa-hist-price { font-family:'IBM Plex Mono',monospace; font-weight:600; }
        .sa-hist-meta { color:#9ca3af; }
        .sa-hist-empty { padding:18px; text-align:center; color:#9ca3af; font-size:12px; }

        .sa-main { display:flex; flex-direction:column; gap:16px; }

        .sa-status { padding:24px 28px; display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center; }
        .sa-status.leading  { background:#f0fdf4; border:2px solid #16a34a; }
        .sa-status.trailing { background:#fffbeb; border:2px solid #d97706; }
        .sa-status.idle     { background:#fff; border:1px solid #e5e7eb; border-left:4px solid #154194; }
        .sa-status-left {}
        .sa-status-kpi-label { font-size:11px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px; }
        .sa-status-title { font-size:17px; font-weight:700; margin-bottom:4px; color:#111827; }
        .sa-status-title.leading  { color:#14532d; }
        .sa-status-title.trailing { color:#92400e; }
        .sa-status-sub { font-size:12px; color:#6b7280; }
        .sa-status-sub.leading  { color:#166534; }
        .sa-status-sub.trailing { color:#b45309; }
        .sa-status-price { font-family:'IBM Plex Mono',monospace; font-size:48px; font-weight:600; color:#0d1b2a; text-align:right; white-space:nowrap; line-height:1; }
        .sa-status-price.leading  { color:#16a34a; }
        .sa-status-price.trailing { color:#d97706; }
        .sa-status-price.none { color:#9ca3af; }
        .sa-status-price.flash { animation:sa-flash .7s ease-out; }
        @media(max-width:640px) { .sa-status { grid-template-columns:1fr; } .sa-status-price { font-size:32px; text-align:left; } }

        .sa-bid-card { padding:22px 24px; }
        .sa-bid-title { font-size:13px; font-weight:700; color:#374151; margin-bottom:14px; }
        .sa-bid-row { display:flex; gap:8px; }
        .sa-bid-input { flex:1; height:46px; border:1px solid #d1d5db; padding:0 14px; font-size:18px; font-family:'IBM Plex Mono',monospace; font-weight:600; outline:none; transition:border-color .15s; min-width:0; color:#0d1b2a; }
        .sa-bid-input:focus { border-color:#154194; }
        .sa-bid-input::placeholder { font-weight:300; font-size:15px; color:#d1d5db; }
        .sa-bid-input:disabled { background:#f9fafb; }
        .sa-bid-btn { height:46px; padding:0 22px; background:#154194; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; white-space:nowrap; letter-spacing:.03em; }
        .sa-bid-btn:hover:not(:disabled) { background:#0f3070; }
        .sa-bid-btn:disabled { background:#9ca3af; cursor:not-allowed; }
        .sa-bid-hint { margin-top:8px; font-size:11px; color:#9ca3af; line-height:1.5; }

        .sa-feed-hdr { padding:14px 20px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; }
        .sa-feed-title { font-size:13px; font-weight:700; display:flex; align-items:center; gap:8px; }
        .sa-feed-meta { font-size:11px; color:#9ca3af; }
        .sa-feed-empty { padding:40px; text-align:center; color:#9ca3af; font-size:13px; }
        table.sa-tbl { width:100%; border-collapse:collapse; }
        table.sa-tbl th { padding:9px 18px; font-size:10px; font-weight:700; letter-spacing:.06em; color:#9ca3af; text-align:left; border-bottom:1px solid #e5e7eb; background:#fafafa; white-space:nowrap; text-transform:uppercase; }
        table.sa-tbl td { padding:11px 18px; font-size:13px; border-bottom:1px solid #f3f4f6; }
        table.sa-tbl tr:last-child td { border-bottom:none; }
        table.sa-tbl tr.own td { background:#f0f4ff; }
        table.sa-tbl tr:hover td { background:#f9fafb; }
        table.sa-tbl tr.own:hover td { background:#e8edf8; }
        .sa-mono { font-family:'IBM Plex Mono',monospace; font-weight:600; }
        .sa-price-best { font-family:'IBM Plex Mono',monospace; font-weight:600; color:#16a34a; }
        .sa-delta-neg { font-size:11px; font-weight:700; color:#16a34a; }
        .sa-delta-none { font-size:11px; color:#9ca3af; }

        .sa-conclusion { padding:32px; text-align:center; }
        .sa-conclusion.won { background:#f0fdf4; border:2px solid #16a34a; }
        .sa-conclusion.lost { background:#fff; border:1px solid #e5e7eb; }
        .sa-conclusion-title { font-size:20px; font-weight:700; margin-bottom:6px; }
        .sa-conclusion-title.won { color:#14532d; }
        .sa-conclusion-title.lost { color:#374151; }
        .sa-conclusion-price { font-family:'IBM Plex Mono',monospace; font-size:40px; font-weight:600; margin:12px 0; }
        .sa-conclusion-price.won { color:#16a34a; }
        .sa-conclusion-price.lost { color:#6b7280; }
        .sa-conclusion-sub { font-size:13px; color:#6b7280; margin-bottom:20px; line-height:1.6; }
        .sa-dl-btn { display:inline-block; padding:10px 24px; background:#154194; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; letter-spacing:.03em; transition:background .15s; }
        .sa-dl-btn:hover { background:#0f3070; }
      `}</style>

      <div className="sa-root">
        <EucxHeader />

        {/* Verkäufer-Identitätsstreifen */}
        <div style={{
          background: "linear-gradient(90deg,#78350f 0%,#92400e 100%)",
          borderBottom: "1px solid #b45309",
          padding: "0 28px", height: 36,
          display: "flex", alignItems: "center",
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
        }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fde68a", background: "rgba(255,255,255,.12)", padding: "3px 10px" }}>
              HANDELSSITZUNG
            </span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)", letterSpacing: "0.02em" }}>
              Ref. {lot.id.slice(0, 8).toUpperCase()} · {lot.commodity} · {lot.quantity} {lot.unit}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`sa-dot${connected ? "" : " off"}`} />
              <span style={{ fontSize: 11, color: "rgba(253,230,138,.6)" }}>{connected ? "Live" : "Verbinde…"}</span>
            </div>
          </div>
        </div>

        <div className="sa-page">

          {/* Page Heading */}
          <div className="sa-page-hdr">
            <div>
              <div className="sa-page-title">{lot.commodity}</div>
              <div className="sa-page-sub">{lot.quantity} {lot.unit}{lot.startPrice ? ` · Limit ${fmtEur(lot.startPrice)}` : ""}</div>
            </div>
            <span className="sa-chip" style={{ background: PHASE_COLOR[livePhase] ?? "#6b7280" }}>
              {PHASE_LABEL[livePhase] ?? livePhase}
            </span>
          </div>

          <div className="sa-grid">

            {/* ── Sidebar ── */}
            <aside className="sa-sidebar">

              {/* Lot Details */}
              <div className="sa-card sa-lot-card">
                <div className="sa-lot-label">Ausschreibung</div>
                <div className="sa-lot-name">{lot.commodity}</div>

                {/* Ware */}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#9ca3af", textTransform: "uppercase", margin: "12px 0 6px" }}>Ware</div>
                {[
                  ["Bezeichnung", lot.commodity],
                  ["Menge",       `${lot.quantity} ${lot.unit}`],
                  ...(lot.description ? [["Beschreibung", lot.description]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="sa-lot-row">
                    <span className="sa-lot-key">{k}</span>
                    <span className="sa-lot-val" style={{ maxWidth: 120, textAlign: "right", wordBreak: "break-word" }}>{v}</span>
                  </div>
                ))}

                {/* Preisrahmen */}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#9ca3af", textTransform: "uppercase", margin: "12px 0 6px" }}>Preisrahmen</div>
                <div className="sa-lot-row">
                  <span className="sa-lot-key">Währung</span>
                  <span className="sa-lot-val" style={{ color: "#154194", fontWeight: 700 }}>EUR (€)</span>
                </div>
                <div className="sa-lot-row">
                  <span className="sa-lot-key">Käufer-Limit (EUR/Einheit)</span>
                  <span className="sa-lot-val" style={{ color: "#154194" }}>{lot.startPrice ? fmtEur(lot.startPrice) : "—"}</span>
                </div>
                <div className="sa-lot-row">
                  <span className="sa-lot-key">Aktuell bestes Gebot</span>
                  <span className="sa-lot-val" style={{ color: liveBest ? "#16a34a" : "#9ca3af", fontWeight: 700 }}>
                    {liveBest ? fmtEur(liveBest) : "Noch kein Gebot"}
                  </span>
                </div>
                {liveBest && lot.startPrice && (
                  <div className="sa-lot-row">
                    <span className="sa-lot-key">Ersparnis ggü. Limit</span>
                    <span className="sa-lot-val" style={{ color: "#16a34a" }}>
                      {((1 - Number(liveBest) / Number(lot.startPrice)) * 100).toFixed(1)} %
                    </span>
                  </div>
                )}
                <div className="sa-lot-row">
                  <span className="sa-lot-key">Gebote / Bieter</span>
                  <span className="sa-lot-val">{allBids.length} / {state?.activeBidderCount ?? "—"}</span>
                </div>

                {/* Qualität */}
                {lot.qualityGrade && <>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#9ca3af", textTransform: "uppercase", margin: "12px 0 6px" }}>Qualität</div>
                  <div className="sa-lot-row">
                    <span className="sa-lot-key">Güte / Norm</span>
                    <span className="sa-lot-val" style={{ maxWidth: 130, textAlign: "right", wordBreak: "break-word" }}>{lot.qualityGrade}</span>
                  </div>
                  {lot.hsCode && <div className="sa-lot-row">
                    <span className="sa-lot-key">HS-Code</span>
                    <span className="sa-lot-val">{lot.hsCode}</span>
                  </div>}
                </>}

                {/* Lieferung */}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#9ca3af", textTransform: "uppercase", margin: "12px 0 6px" }}>Lieferung</div>
                {[
                  ["Incoterms",     lot.incoterms       ?? "DAP"],
                  ["Herkunftsland", lot.countryOfOrigin ?? "—"],
                  ...(lot.hsCode && !lot.qualityGrade ? [["HS-Code", lot.hsCode]] : []),
                  ...(lot.co2PerTonne       ? [["CO₂-Äq.",          `${lot.co2PerTonne} kg/t`]] : []),
                  ...(lot.productionSiteId  ? [["CBAM-Stätten-ID",   lot.productionSiteId]]      : []),
                  ...(lot.deliveryPeriod    ? [["Lieferzeitraum",     lot.deliveryPeriod]]        : []),
                ].map(([k, v]) => (
                  <div key={k} className="sa-lot-row">
                    <span className="sa-lot-key">{k}</span>
                    <span className="sa-lot-val" style={{ maxWidth: 130, textAlign: "right", wordBreak: "break-word" }}>{v}</span>
                  </div>
                ))}

                {/* Vertrag */}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#9ca3af", textTransform: "uppercase", margin: "12px 0 6px" }}>Vertrag</div>
                <div className="sa-lot-row">
                  <span className="sa-lot-key">Währung</span>
                  <span className="sa-lot-val">EUR (Euro)</span>
                </div>
                {lot.paymentTerms && <div className="sa-lot-row">
                  <span className="sa-lot-key">Zahlungsbedingungen</span>
                  <span className="sa-lot-val" style={{ maxWidth: 130, textAlign: "right", wordBreak: "break-word" }}>{lot.paymentTerms}</span>
                </div>}
                {lot.vatTreatment && <div className="sa-lot-row">
                  <span className="sa-lot-key">USt.-Behandlung</span>
                  <span className="sa-lot-val" style={{ maxWidth: 130, textAlign: "right", wordBreak: "break-word", fontSize: 10 }}>{lot.vatTreatment}</span>
                </div>}
                {!lot.paymentTerms && !lot.vatTreatment && (
                  <div className="sa-lot-row">
                    <span className="sa-lot-key" style={{ color: "#d97706" }}>Zahlungsbedingungen</span>
                    <span style={{ fontSize: 10, color: "#d97706" }}>nicht angegeben</span>
                  </div>
                )}

                {/* Zeitrahmen */}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#9ca3af", textTransform: "uppercase", margin: "12px 0 6px" }}>Zeitrahmen</div>
                {[
                  ["Veröffentlicht", new Date(lot.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })],
                  ...(lot.auctionStart ? [["Auktionsstart", new Date(lot.auctionStart).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })]] : []),
                  ...(lot.auctionEnd   ? [["Auktionsende",  new Date(lot.auctionEnd).toLocaleString("de-DE",   { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="sa-lot-row">
                    <span className="sa-lot-key">{k}</span>
                    <span className="sa-lot-val">{v}</span>
                  </div>
                ))}

                {/* Referenz */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 10, color: "#d1d5db", fontFamily: "'IBM Plex Mono',monospace" }}>
                    Ref. {lot.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="sa-card sa-kpi">
                <div className="sa-kpi-label">Verbleibend</div>
                <div className={`sa-kpi-val${isUrgent ? " urgent" : ""}`}>{liveEnd ? countdown : "—"}</div>
                <div className="sa-kpi-sub">
                  {livePhase === "PROPOSAL"   && "Erstgebote laufen"}
                  {livePhase === "REDUCTION"  && "Bieterwettbewerb aktiv"}
                  {livePhase === "CONCLUSION" && "Auktion beendet"}
                  {livePhase === "COLLECTION" && "Noch nicht gestartet"}
                </div>
              </div>

              {/* Mein bestes Gebot */}
              {myBids.length > 0 && (
                <div className="sa-card sa-kpi">
                  <div className="sa-kpi-label">Mein bestes Gebot</div>
                  <div className="sa-kpi-val" style={{ color: "#154194" }}>{fmtEur(myBids[0]!.price)}</div>
                  <div className="sa-kpi-sub">
                    {myRank === 1
                      ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Rang 1 — Führend</span>
                      : <span style={{ color: "#d97706", fontWeight: 600 }}>Rang #{myRank} — Überboten</span>
                    }
                  </div>
                </div>
              )}

              {/* Meine Gebotshistorie */}
              <div className="sa-card">
                <div className="sa-hist-hdr">Meine Gebote ({myBids.length})</div>
                {myBids.length === 0
                  ? <div className="sa-hist-empty">Noch keine Gebote abgegeben</div>
                  : myBids.map((b, i) => (
                    <div key={i} className="sa-hist-row">
                      <span className="sa-hist-price">{fmtEur(b.price)}</span>
                      <span className="sa-hist-meta">#{b.rank} · {new Date(b.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  ))
                }
              </div>

            </aside>

            {/* ── Main ── */}
            <main className="sa-main">

              {/* Status */}
              {canBid && (
                <div className={`sa-card sa-status${isLeading ? " leading" : myRank !== null ? " trailing" : " idle"}`}>
                  <div className="sa-status-left">
                    <div className="sa-status-kpi-label">Ihr Status</div>
                    <div className={`sa-status-title${isLeading ? " leading" : myRank !== null ? " trailing" : ""}`}>
                      {isLeading
                        ? "Sie halten das beste Angebot"
                        : myRank !== null
                          ? `Überboten — Rang #${myRank}`
                          : "Noch kein Gebot abgegeben"}
                    </div>
                    <div className={`sa-status-sub${isLeading ? " leading" : myRank !== null ? " trailing" : ""}`}>
                      {isLeading
                        ? `Ihr Gebot ${fmtEur(myBids[0]?.price ?? null)} führt aktuell — halten Sie die Position`
                        : myRank !== null
                          ? `Bestes Angebot liegt bei ${fmtEur(liveBest)} — geben Sie ein besseres Gebot ab`
                          : `Geben Sie Ihr erstes Angebot ab. Käufer-Limit: ${fmtEur(lot.startPrice)}`}
                    </div>
                  </div>
                  <div className={`sa-status-price${isLeading ? " leading" : myRank !== null ? " trailing" : " none"}${flash ? " flash" : ""}`}>
                    {fmtEur(liveBest)}
                  </div>
                </div>
              )}

              {/* Abschluss */}
              {livePhase === "CONCLUSION" && (
                <div className={`sa-card sa-conclusion${isLeading ? " won" : " lost"}`}>
                  <div className={`sa-conclusion-title${isLeading ? " won" : " lost"}`}>
                    {isLeading ? "Auktion gewonnen" : "Auktion beendet"}
                  </div>
                  <div className={`sa-conclusion-price${isLeading ? " won" : " lost"}`}>
                    {isLeading ? fmtEur(myBids[0]?.price ?? null) : fmtEur(liveBest)}
                  </div>
                  <div className="sa-conclusion-sub">
                    {isLeading
                      ? "Ihr Siegergebot wurde akzeptiert. Kaufvertrag steht zum Download bereit."
                      : `Siegergebot: ${fmtEur(liveBest)} — Kein Zuschlag erhalten.`}
                  </div>
                  {isLeading && (
                    <button className="sa-dl-btn" onClick={downloadContract}>
                      Kaufvertrag herunterladen (PDF)
                    </button>
                  )}
                </div>
              )}

              {/* Depot-Banner */}
              {kyc?.isYoungCompany && depositReq && canBid && (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", padding: "12px 18px", fontSize: 13, color: "#92400e" }}>
                  Sicherheitsleistung (5%) erforderlich — fehlend:{" "}
                  <strong style={{ color: "#dc2626" }}>{Number(depositReq).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
                </div>
              )}

              {/* Gebot abgeben */}
              {canBid && (
                <div className="sa-card sa-bid-card">
                  {/* [TESTMODE-05] KYC-Overlay deaktiviert */}
                  <div className="sa-bid-title">
                    Angebot abgeben
                    {bestNum && <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 8, fontSize: 11 }}>
                      — muss unter {fmtEur(liveBest)} liegen
                    </span>}
                  </div>
                  <div className="sa-bid-row">
                    <input
                      className="sa-bid-input"
                      type="number" step="0.01" min="0"
                      placeholder={bestNum ? String(Math.floor(bestNum - 1)) : "€ / Einheit"}
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && priceInput && submitBid(Number(priceInput))}
                      disabled={submitting}
                    />
                    <button
                      className="sa-bid-btn"
                      disabled={!priceInput || submitting}
                      onClick={() => submitBid(Number(priceInput))}
                    >
                      {submitting ? "Wird übermittelt…" : "Gebot abgeben"}
                    </button>
                  </div>
                  <div className="sa-bid-hint">
                    Preis in <strong style={{ color: "#154194" }}>EUR (€)</strong> pro {lot.unit} — alle Beträge in Euro.
                    {lot.startPrice && <> Käufer-Limit: <strong style={{ color: "#374151" }}>{fmtEur(lot.startPrice)}</strong>.</>}
                    {" "}Enter oder Button zum Bestätigen.
                  </div>
                </div>
              )}

              {/* Gebots-Feed */}
              <div className="sa-card">
                <div className="sa-feed-hdr">
                  <div className="sa-feed-title">
                    <span className="sa-dot" style={connected ? {} : { background: "#9ca3af", animation: "none" }} />
                    Gebotsübersicht
                  </div>
                  <span className="sa-feed-meta">
                    {allBids.length} Gebot{allBids.length !== 1 ? "e" : ""} · {state?.activeBidderCount ?? "—"} Teilnehmer
                  </span>
                </div>
                {competitorWithDelta.length === 0 ? (
                  <div className="sa-feed-empty">Noch keine Gebote in dieser Auktion.</div>
                ) : (
                  <table className="sa-tbl">
                    <thead>
                      <tr>
                        <th>Zeit</th>
                        <th>Teilnehmer</th>
                        <th>Preis</th>
                        <th>Veränderung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorWithDelta.map((bid) => (
                        <tr key={bid.id} className={bid.isOwn ? "own" : ""}>
                          <td style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }}>
                            {new Date(bid.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </td>
                          <td style={{ color: bid.isOwn ? "#154194" : "#6b7280", fontWeight: bid.isOwn ? 700 : 400, fontSize: 12 }}>
                            {bid.isOwn ? "Sie" : bid.sellerId}
                          </td>
                          <td className={bid.rank === 1 ? "sa-price-best" : "sa-mono"}>
                            {fmtEur(bid.price)}
                          </td>
                          <td>
                            {bid.delta < 0
                              ? <span className="sa-delta-neg">{fmtDelta(bid.delta)}</span>
                              : <span className="sa-delta-none">Erstgebot</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </main>
          </div>
        </div>
      </div>
    </>
  );
}
