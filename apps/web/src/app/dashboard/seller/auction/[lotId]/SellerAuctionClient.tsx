"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuctionStream } from "@/lib/auction/use-auction-stream";
import type { AuctionNotification } from "@/lib/auction/use-auction-stream";
import { KycStatusBadge } from "@/components/KycStatusBadge";
import { NotificationBell } from "@/components/NotificationBell";
import Link from "next/link";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lot {
  id: string; commodity: string; quantity: string; unit: string;
  phase: string; startPrice: string | null; currentBest: string | null;
  auctionEnd: string | null; description: string | null;
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
  const [sidebarOpen, setSidebar]     = useState(true);

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

  // Auto-collapse sidebar in REDUCTION phase on tablet
  useEffect(() => {
    if (livePhase === "REDUCTION") setSidebar(false);
  }, [livePhase]);

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
  const canBid      = livePhase === "PROPOSAL" || livePhase === "REDUCTION";
  const isVerified  = kyc?.verificationStatus === "VERIFIED";
  const hasDeposit  = !kyc?.isYoungCompany || !depositReq;
  const bestNum     = liveBest ? Number(liveBest) : null;
  const quickSteps  = [50, 100, 250, 500];
  const isLeading   = myRank === 1;

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

        *,*::before,*::after { box-sizing: border-box; }

        .s-root { font-family:'IBM Plex Sans',Arial,sans-serif; background:#f0f2f5; min-height:100vh; color:#0d1b2a; padding-bottom:120px; }

        /* ── Header ── */
        .s-hdr { background:#0d1b2a; height:56px; padding:0 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:0; z-index:50; }
        .s-hdr-logo { font-size:14px; font-weight:700; color:#fff; letter-spacing:.04em; white-space:nowrap; }
        .s-hdr-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .s-dot { width:8px; height:8px; border-radius:50%; background:#16a34a; display:inline-block; animation:sdot 2s infinite; }
        .s-dot.off { background:#6b7280; animation:none; }
        @keyframes sdot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .s-conn { font-size:11px; color:#9ca3af; white-space:nowrap; }

        /* ── Layout ── */
        .s-body { max-width:1080px; margin:0 auto; padding:24px 16px; display:grid; grid-template-columns:260px 1fr; gap:20px; align-items:start; }
        .s-body.compact { grid-template-columns:1fr; }
        @media (max-width:760px) { .s-body { grid-template-columns:1fr; padding:16px 12px; } }

        /* ── Sidebar ── */
        .s-sidebar { display:flex; flex-direction:column; gap:16px; }
        .s-lot-card { background:#fff; border:1px solid #e5e7eb; padding:18px; }
        .s-lot-name { font-size:16px; font-weight:700; line-height:1.3; margin-bottom:6px; }
        .s-lot-meta { font-size:12px; color:#6b7280; line-height:1.6; }
        .s-sidebar-toggle { background:none; border:1px solid #e5e7eb; padding:7px 14px; font-size:12px; color:#6b7280; cursor:pointer; width:100%; text-align:left; transition:background .15s; }
        .s-sidebar-toggle:hover { background:#f9fafb; }

        .s-kpi-card { background:#fff; border:1px solid #e5e7eb; padding:20px; }
        .s-kpi-label { font-size:10px; font-weight:700; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px; }
        .s-kpi-val { font-family:'IBM Plex Mono',monospace; font-size:26px; font-weight:600; line-height:1; }
        .s-kpi-sub { font-size:11px; color:#6b7280; margin-top:4px; }

        /* ── Main ── */
        .s-main { display:flex; flex-direction:column; gap:20px; }

        /* ── Winning State ── */
        .s-win { padding:24px 28px; display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
        .s-win.lead { background:#f0fdf4; border:2px solid #16a34a; }
        .s-win.trail{ background:#fef2f2; border:2px solid #dc2626; animation:sshake .5s; }
        .s-win.idle { background:#f9fafb; border:1px solid #e5e7eb; }
        @keyframes sshake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }
        .s-win-icon { font-size:36px; line-height:1; flex-shrink:0; }
        .s-win-text { flex:1; min-width:200px; }
        .s-win-title { font-size:18px; font-weight:700; }
        .s-win-title.lead { color:#14532d; }
        .s-win-title.trail { color:#7f1d1d; }
        .s-win-sub { font-size:13px; margin-top:4px; }
        .s-win-sub.lead { color:#166534; }
        .s-win-sub.trail { color:#991b1b; }
        .s-win-price { font-family:'IBM Plex Mono',monospace; font-size:40px; font-weight:600; transition:color .3s; }
        .s-win-price.flash-good { color:#16a34a; }
        .s-win-price.flash-bad  { color:#dc2626; }
        .s-win-price.neutral    { color:#0d1b2a; }

        /* ── Deposit/KYC Banner ── */
        .s-deposit { background:#fffbeb; border:1px solid #fcd34d; padding:12px 18px; font-size:13px; color:#92400e; }

        /* ── Competitor Feed ── */
        .s-comp { background:#fff; border:1px solid #e5e7eb; }
        .s-comp-hdr { padding:14px 18px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; }
        .s-comp-title { font-size:13px; font-weight:700; }
        .s-comp-cnt { font-size:11px; color:#9ca3af; }
        .s-comp-empty { padding:32px; text-align:center; color:#9ca3af; font-size:13px; }
        .s-comp-row { padding:11px 18px; display:grid; grid-template-columns:80px 1fr auto auto; gap:8px; align-items:center; border-bottom:1px solid #f3f4f6; font-size:13px; transition:background .1s; }
        .s-comp-row:last-child { border-bottom:none; }
        .s-comp-row.own { background:#eff4ff; }
        .s-comp-row:hover { background:#f9fafb; }
        .s-comp-row.own:hover { background:#e8f0fe; }
        .s-comp-time { font-size:11px; color:#9ca3af; }
        .s-comp-who  { font-size:12px; color:#6b7280; }
        .s-comp-price { font-family:'IBM Plex Mono',monospace; font-weight:600; }
        .s-comp-delta { font-size:11px; font-weight:700; text-align:right; white-space:nowrap; }
        .s-comp-delta.down { color:#16a34a; }
        .s-comp-delta.none { color:#9ca3af; }

        /* ── Bid Area ── */
        .s-bid-box { background:#fff; border:1px solid #e5e7eb; padding:22px; position:relative; overflow:hidden; }
        .s-bid-title { font-size:14px; font-weight:700; margin-bottom:16px; }
        .s-bid-row { display:flex; gap:10px; margin-bottom:12px; }
        .s-bid-input { flex:1; height:52px; border:1px solid #d1d5db; padding:0 16px; font-size:18px; font-family:'IBM Plex Mono',monospace; outline:none; transition:border-color .15s; min-width:0; }
        .s-bid-input:focus { border-color:#154194; }
        .s-bid-btn { height:52px; padding:0 22px; background:#154194; color:#fff; font-size:14px; font-weight:700; border:none; cursor:pointer; white-space:nowrap; transition:background .15s,transform .1s; }
        .s-bid-btn:hover:not(:disabled) { background:#1a52c2; }
        .s-bid-btn:active:not(:disabled) { transform:scale(.97); }
        .s-bid-btn:disabled { opacity:.5; cursor:not-allowed; }
        .s-bid-hint { font-size:11px; color:#9ca3af; margin-top:8px; }

        /* Overlay */
        .s-overlay { position:absolute; inset:0; background:rgba(255,255,255,.95); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; z-index:10; padding:24px; text-align:center; }
        .s-overlay-title { font-size:15px; font-weight:700; }
        .s-overlay-desc  { font-size:13px; color:#6b7280; max-width:320px; line-height:1.6; }
        .s-overlay-link  { padding:10px 22px; background:#154194; color:#fff; font-size:13px; font-weight:700; text-decoration:none; display:inline-block; transition:background .15s; }
        .s-overlay-link:hover { background:#1a52c2; }

        /* ── Sticky Quick-Bid Footer ── */
        .s-sticky { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:2px solid #e5e7eb; padding:12px 20px; z-index:100; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 -4px 16px rgba(0,0,0,.08); }
        .s-sticky-label { font-size:11px; font-weight:700; color:#6b7280; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
        .s-qbtn { padding:10px 16px; border:1.5px solid #154194; background:#fff; color:#154194; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; min-height:44px; touch-action:manipulation; }
        .s-qbtn:hover:not(:disabled) { background:#154194; color:#fff; transform:translateY(-2px); box-shadow:0 4px 12px rgba(21,65,148,.25); }
        .s-qbtn:active:not(:disabled) { transform:scale(.95); }
        .s-qbtn:disabled { opacity:.35; cursor:not-allowed; border-color:#d1d5db; color:#9ca3af; }
        .s-sticky-best { font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700; color:#0d1b2a; margin-left:auto; white-space:nowrap; }

        /* ── My bid history (in sidebar) ── */
        .s-mybids { background:#fff; border:1px solid #e5e7eb; }
        .s-mybids-hdr { padding:12px 16px; border-bottom:1px solid #e5e7eb; font-size:12px; font-weight:700; }
        .s-mybids-item { padding:10px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f3f4f6; font-size:12px; }
        .s-mybids-item:last-child { border-bottom:none; }
        .s-mybids-price { font-family:'IBM Plex Mono',monospace; font-weight:600; }
        .s-mybids-empty { padding:20px 16px; text-align:center; color:#9ca3af; font-size:12px; }
      `}</style>

      <div className="s-root">

        {/* ── Header ── */}
        <div className="s-hdr">
          <span className="s-hdr-logo">EUCX — Verkäufer</span>
          <div className="s-hdr-right">
            {kyc && (
              <KycStatusBadge
                status={kyc.verificationStatus}
                isYoungCompany={kyc.isYoungCompany}
                walletBalance={kyc.walletBalance}
                depositRequired={depositReq ?? undefined}
              />
            )}
            {token && <NotificationBell token={token} />}
            <span className="s-conn">
              <span className={`s-dot${connected ? "" : " off"}`} />{" "}
              {connected ? "Live" : "…"}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={`s-body${sidebarOpen ? "" : " compact"}`}>

          {/* ── Sidebar ── */}
          {sidebarOpen && (
            <aside className="s-sidebar">
              <div className="s-lot-card">
                <div className="s-lot-name">{lot.commodity}</div>
                <div className="s-lot-meta">
                  {lot.quantity} {lot.unit}
                  {lot.startPrice && <><br />Limit: {fmtEur(lot.startPrice)}</>}
                  {lot.description && <><br />{lot.description}</>}
                </div>
              </div>

              {/* Timer */}
              <div className="s-kpi-card">
                <div className="s-kpi-label">Verbleibend</div>
                <div className="s-kpi-val" style={{ color: isUrgent ? "#dc2626" : "#0d1b2a" }}>
                  {liveEnd ? countdown : "—"}
                </div>
                <div className="s-kpi-sub">
                  {livePhase === "COLLECTION" && "Noch nicht gestartet"}
                  {livePhase === "REDUCTION"  && "Auktion läuft"}
                  {livePhase === "CONCLUSION" && "Abgeschlossen"}
                </div>
              </div>

              {/* Mein bestes Gebot */}
              <div className="s-kpi-card">
                <div className="s-kpi-label">Mein bestes Gebot</div>
                <div className="s-kpi-val">{myBids.length > 0 ? fmtEur(myBids[0]!.price) : "—"}</div>
                <div className="s-kpi-sub">{myBids.length} Gebot{myBids.length !== 1 ? "e" : ""} abgegeben</div>
              </div>

              {/* Meine Gebotshistorie */}
              <div className="s-mybids">
                <div className="s-mybids-hdr">Meine Gebote</div>
                {myBids.length === 0
                  ? <div className="s-mybids-empty">Noch keine Gebote</div>
                  : myBids.map((b, i) => (
                    <div key={i} className="s-mybids-item">
                      <span className="s-mybids-price">{fmtEur(b.price)}</span>
                      <span style={{ color: "#9ca3af" }}>
                        #{b.rank} · {new Date(b.createdAt).toLocaleTimeString("de-DE")}
                      </span>
                    </div>
                  ))
                }
              </div>
            </aside>
          )}

          {/* ── Main Content ── */}
          <main className="s-main">

            {/* Sidebar toggle (nur wenn collapsed) */}
            {!sidebarOpen && (
              <button className="s-sidebar-toggle" onClick={() => setSidebar(true)}>
                ▶ Details einblenden — {lot.commodity} · {lot.quantity} {lot.unit}
              </button>
            )}
            {sidebarOpen && livePhase === "REDUCTION" && (
              <button className="s-sidebar-toggle" onClick={() => setSidebar(false)}>
                ◀ Sidebar einklappen (mehr Platz für Gebote)
              </button>
            )}

            {/* ── Winning State Card ── */}
            {canBid && (
              <div className={`s-win${isLeading ? " lead" : myRank !== null ? " trail" : " idle"}`}>
                <div className="s-win-icon">
                  {isLeading ? "✓" : myRank !== null ? "!" : "○"}
                </div>
                <div className="s-win-text">
                  <div className={`s-win-title${isLeading ? " lead" : myRank !== null ? " trail" : ""}`}>
                    {isLeading
                      ? "Sie halten aktuell das beste Angebot"
                      : myRank !== null
                        ? `Sie wurden überboten! Handeln Sie jetzt. (Rang #${myRank})`
                        : "Noch kein Gebot abgegeben"}
                  </div>
                  <div className={`s-win-sub${isLeading ? " lead" : myRank !== null ? " trail" : ""}`}>
                    {isLeading
                      ? `Ihr Gebot: ${fmtEur(myBids[0]?.price ?? null)} — Halten Sie die Position!`
                      : myRank !== null
                        ? `Bestes Angebot aktuell: ${fmtEur(liveBest)} — Quick-Bid nutzen ↓`
                        : "Geben Sie unten Ihr erstes Gebot ab"}
                  </div>
                </div>
                <div className={`s-win-price${flash === "good" ? " flash-good" : flash === "bad" ? " flash-bad" : " neutral"}`}>
                  {fmtEur(liveBest)}
                </div>
              </div>
            )}

            {livePhase === "CONCLUSION" && (
              <div className={`s-win${isLeading ? " lead" : " idle"}`}>
                <div className="s-win-icon">{isLeading ? "🏆" : "○"}</div>
                <div className="s-win-text">
                  <div className={`s-win-title${isLeading ? " lead" : ""}`}>
                    {isLeading ? "Auktion gewonnen!" : `Auktion beendet — Rang #${myRank ?? "—"}`}
                  </div>
                  <div className="s-win-sub lead">
                    {isLeading ? `Ihr Siegergebot: ${fmtEur(myBids[0]?.price ?? null)}` : `Siegergebot: ${fmtEur(liveBest)}`}
                  </div>
                  {isLeading && (
                    <a
                      href={`/api/auction/lots/${lot.id}/contract`}
                      download
                      style={{
                        display: "inline-block",
                        marginTop: 10,
                        padding: "7px 16px",
                        background: "#154194",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        fetch(`/api/auction/lots/${lot.id}/contract`, {
                          headers: { Authorization: `Bearer ${token}` },
                        })
                          .then(async (r) => {
                            if (!r.ok) { alert("Vertrag noch nicht verfügbar."); return; }
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
                    </a>
                  )}
                </div>
                <div className="s-win-price neutral">{fmtEur(liveBest)}</div>
              </div>
            )}

            {/* Depot-Banner */}
            {kyc?.isYoungCompany && depositReq && canBid && (
              <div className="s-deposit">
                Sicherheitsleistung (5%) erforderlich — fehlend:{" "}
                <strong style={{ color: "#dc2626" }}>{Number(depositReq).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
                {" "}· Aktuelles Depot: <strong>{Number(kyc.walletBalance).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
              </div>
            )}

            {/* ── Gebot abgeben ── */}
            {canBid && (
              <div className="s-bid-box">
                {(!isVerified || !hasDeposit) && (
                  <div className="s-overlay">
                    <div className="s-overlay-title">
                      {!isVerified ? "Auktion nur für verifizierte Mitglieder" : "Sicherheitsleistung unvollständig"}
                    </div>
                    <div className="s-overlay-desc">
                      {!isVerified
                        ? "Laden Sie Ihren Handelsregisterauszug und USt-IdNr.-Bestätigung hoch. Prüfung in der Regel unter 24h."
                        : `Fehlende Sicherheitsleistung: ${depositReq ? Number(depositReq).toLocaleString("de-DE", { minimumFractionDigits: 2 }) : "—"} €`}
                    </div>
                    <Link href="/dashboard/settings/verification" className="s-overlay-link">
                      {!isVerified ? "Jetzt Dokumente hochladen →" : "Depot aufladen →"}
                    </Link>
                  </div>
                )}
                <div className="s-bid-title">Manueller Preis</div>
                <div className="s-bid-row">
                  <input
                    className="s-bid-input"
                    type="number" step="0.01" min="0"
                    placeholder={bestNum ? `Unter ${fmtEur(String(bestNum))}` : "€/Einheit"}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && priceInput && submitBid(Number(priceInput))}
                    disabled={submitting}
                  />
                  <button
                    className="s-bid-btn"
                    disabled={!priceInput || submitting}
                    onClick={() => submitBid(Number(priceInput))}
                  >
                    {submitting ? "…" : "Abgeben"}
                  </button>
                </div>
                <div className="s-bid-hint">
                  Gebot muss unter aktuellem Bestgebot liegen.{" "}
                  {livePhase === "PROPOSAL" && "Erste Phase: setzt die Basisreferenz."}
                </div>
              </div>
            )}

            {/* ── Competitor Feed ── */}
            <div className="s-comp">
              <div className="s-comp-hdr">
                <span className="s-comp-title">Gebotsübersicht — alle Teilnehmer</span>
                <span className="s-comp-cnt">{allBids.length} Gebote · {state?.activeBidderCount ?? "—"} aktive Bieter</span>
              </div>
              {competitorWithDelta.length === 0 ? (
                <div className="s-comp-empty">Noch keine Gebote in dieser Auktion.</div>
              ) : (
                competitorWithDelta.map((bid) => (
                  <div key={bid.id} className={`s-comp-row${bid.isOwn ? " own" : ""}`}>
                    <span className="s-comp-time">
                      {new Date(bid.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="s-comp-who">
                      {bid.isOwn ? <strong style={{ color: "#154194" }}>Sie</strong> : bid.sellerId}
                    </span>
                    <span className="s-comp-price" style={{ color: bid.rank === 1 ? "#16a34a" : "#0d1b2a" }}>
                      {fmtEur(bid.price)}
                    </span>
                    <span className={`s-comp-delta${bid.delta < 0 ? " down" : " none"}`}>
                      {bid.delta !== 0 ? fmtDelta(bid.delta) : "Erstgebot"}
                    </span>
                  </div>
                ))
              )}
            </div>

          </main>
        </div>

        {/* ── Sticky Quick-Bid Footer (immer sichtbar wenn canBid) ── */}
        {canBid && (
          <div className="s-sticky">
            <span className="s-sticky-label">Quick-Bid:</span>
            {quickSteps.map((step) => {
              const qp = bestNum ? bestNum - step : 0;
              return (
                <button
                  key={step}
                  className="s-qbtn"
                  disabled={!bestNum || qp <= 0 || submitting || !isVerified || !hasDeposit}
                  onClick={() => submitBid(qp)}
                  title={qp > 0 ? `Gebot: ${fmtEur(String(qp))}` : undefined}
                >
                  −{step} € {qp > 0 ? `→ ${fmtEur(String(qp))}` : ""}
                </button>
              );
            })}
            {bestNum && (
              <span className="s-sticky-best">Best: {fmtEur(liveBest)}</span>
            )}
          </div>
        )}

      </div>
    </>
  );
}
