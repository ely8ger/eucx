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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── Animations ── */
        @keyframes pulse-red   { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes pulse-dot   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.7} }
        @keyframes flash-green { 0%{background:#dcfce7;color:#14532d} 100%{background:transparent;color:inherit} }
        @keyframes flash-red   { 0%{background:#fee2e2;color:#7f1d1d} 100%{background:transparent;color:inherit} }
        @keyframes shake       { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-green  { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.3)} 50%{box-shadow:0 0 0 8px rgba(22,163,74,0)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes price-tick  { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }

        .sa-root { font-family:'IBM Plex Sans',Arial,sans-serif; background:#f0f2f5; min-height:100vh; color:#0d1b2a; padding-bottom:84px; }

        /* ── Top Bar ── */
        .sa-topbar {
          background:linear-gradient(135deg,#0d1b2a 0%,#152d4e 100%);
          border-bottom:1px solid rgba(255,255,255,.08);
          padding:0 24px; height:60px;
          display:flex; align-items:center; justify-content:space-between; gap:16px;
          position:sticky; top:0; z-index:50;
        }
        .sa-topbar-left { display:flex; align-items:center; gap:16px; min-width:0; }
        .sa-topbar-brand { font-size:13px; font-weight:700; color:rgba(255,255,255,.5); letter-spacing:.06em; flex-shrink:0; }
        .sa-topbar-sep { color:rgba(255,255,255,.2); }
        .sa-topbar-lot { font-size:15px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sa-topbar-qty { font-size:12px; color:rgba(255,255,255,.5); white-space:nowrap; }
        .sa-topbar-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }
        .sa-live-dot { width:8px; height:8px; border-radius:50%; background:#16a34a; animation:pulse-dot 2s infinite; flex-shrink:0; }
        .sa-live-dot.off { background:#6b7280; animation:none; }
        .sa-live-label { font-size:11px; color:rgba(255,255,255,.5); }
        .sa-phase-chip {
          padding:3px 10px; font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
          border-radius:2px;
        }
        .sa-phase-chip.proposal { background:rgba(217,119,6,.2); color:#fbbf24; border:1px solid rgba(217,119,6,.3); }
        .sa-phase-chip.reduction { background:rgba(22,163,74,.2); color:#4ade80; border:1px solid rgba(22,163,74,.3); }
        .sa-phase-chip.conclusion { background:rgba(107,114,128,.2); color:#9ca3af; border:1px solid rgba(107,114,128,.3); }

        /* ── Page Grid ── */
        .sa-grid {
          max-width:1140px; margin:0 auto; padding:24px 20px;
          display:grid; grid-template-columns:280px 1fr; gap:20px; align-items:start;
        }
        @media(max-width:800px) { .sa-grid { grid-template-columns:1fr; } }

        /* ── Sidebar ── */
        .sa-sidebar { display:flex; flex-direction:column; gap:14px; position:sticky; top:80px; }

        .sa-card { background:#fff; border:1px solid #e5e7eb; }

        /* Lot info card */
        .sa-lot-card { padding:20px; }
        .sa-lot-label { font-size:9px; font-weight:700; letter-spacing:.1em; color:#9ca3af; text-transform:uppercase; margin-bottom:4px; }
        .sa-lot-name { font-size:18px; font-weight:700; color:#0d1b2a; line-height:1.2; margin-bottom:8px; }
        .sa-lot-row { display:flex; justify-content:space-between; font-size:12px; padding:4px 0; border-bottom:1px solid #f3f4f6; }
        .sa-lot-row:last-child { border-bottom:none; }
        .sa-lot-key { color:#9ca3af; font-weight:600; }
        .sa-lot-val { color:#374151; font-weight:600; font-family:'IBM Plex Mono',monospace; }

        /* Timer card */
        .sa-timer-card { padding:20px; border-left:3px solid #154194; }
        .sa-timer-card.urgent { border-left-color:#dc2626; animation:pulse-red 1.5s infinite; }
        .sa-timer-label { font-size:9px; font-weight:700; letter-spacing:.1em; color:#9ca3af; text-transform:uppercase; margin-bottom:8px; }
        .sa-timer-val {
          font-family:'IBM Plex Mono',monospace; font-size:36px; font-weight:700; line-height:1;
          color:#0d1b2a; letter-spacing:.04em;
        }
        .sa-timer-val.urgent { color:#dc2626; }
        .sa-timer-sub { font-size:11px; color:#6b7280; margin-top:6px; }

        /* My best card */
        .sa-my-card { padding:18px; }
        .sa-my-label { font-size:9px; font-weight:700; letter-spacing:.1em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px; }
        .sa-my-price { font-family:'IBM Plex Mono',monospace; font-size:24px; font-weight:700; color:#154194; }
        .sa-my-rank { margin-top:4px; font-size:11px; }
        .sa-rank-chip { display:inline-block; padding:2px 8px; font-size:10px; font-weight:700; border-radius:2px; }
        .sa-rank-chip.first { background:#dcfce7; color:#14532d; }
        .sa-rank-chip.other { background:#fef3c7; color:#92400e; }

        /* Bid history in sidebar */
        .sa-hist { }
        .sa-hist-hdr { padding:12px 18px; border-bottom:1px solid #f3f4f6; font-size:10px; font-weight:700; letter-spacing:.08em; color:#6b7280; text-transform:uppercase; }
        .sa-hist-row { padding:10px 18px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f9fafb; animation:fadeUp .3s ease; }
        .sa-hist-row:last-child { border-bottom:none; }
        .sa-hist-price { font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:700; color:#0d1b2a; }
        .sa-hist-meta { font-size:11px; color:#9ca3af; }
        .sa-hist-empty { padding:20px 18px; text-align:center; color:#d1d5db; font-size:12px; }

        /* ── Main Column ── */
        .sa-main { display:flex; flex-direction:column; gap:16px; }

        /* ── Status Banner ── */
        .sa-status-banner {
          padding:22px 28px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;
          border-left:4px solid;
        }
        .sa-status-banner.idle     { background:#fff; border-color:#e5e7eb; border:1px solid #e5e7eb; border-left:4px solid #154194; }
        .sa-status-banner.leading  { background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%); border-color:#16a34a; border:2px solid #16a34a; animation:glow-green 3s infinite; }
        .sa-status-banner.trailing { background:linear-gradient(135deg,#fff5f5 0%,#fee2e2 100%); border-color:#dc2626; border:2px solid #dc2626; animation:shake .4s; }
        .sa-status-icon { font-size:32px; line-height:1; flex-shrink:0; }
        .sa-status-text { flex:1; min-width:180px; }
        .sa-status-title { font-size:18px; font-weight:700; line-height:1.2; }
        .sa-status-title.idle     { color:#374151; }
        .sa-status-title.leading  { color:#14532d; }
        .sa-status-title.trailing { color:#7f1d1d; }
        .sa-status-sub { font-size:13px; margin-top:5px; color:#6b7280; }
        .sa-status-sub.leading  { color:#166534; }
        .sa-status-sub.trailing { color:#b91c1c; }
        .sa-status-price {
          font-family:'IBM Plex Mono',monospace; font-size:42px; font-weight:700; line-height:1;
          transition:color .4s;
        }
        .sa-status-price.idle     { color:#9ca3af; }
        .sa-status-price.leading  { color:#16a34a; }
        .sa-status-price.trailing { color:#dc2626; }
        .sa-status-price.flash-g  { animation:flash-green .6s forwards; }
        .sa-status-price.flash-r  { animation:flash-red .6s forwards; }

        /* ── Bid Box ── */
        .sa-bid-box { background:#fff; border:1px solid #e5e7eb; border-top:3px solid #154194; padding:24px; }
        .sa-bid-box-title { font-size:13px; font-weight:700; color:#374151; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .sa-bid-box-title-hint { font-size:11px; font-weight:400; color:#9ca3af; }
        .sa-bid-row { display:flex; gap:10px; }
        .sa-bid-input {
          flex:1; height:56px; border:2px solid #e5e7eb; padding:0 20px;
          font-size:22px; font-family:'IBM Plex Mono',monospace; font-weight:600;
          outline:none; transition:border-color .15s, box-shadow .15s; min-width:0;
          color:#0d1b2a;
        }
        .sa-bid-input:focus { border-color:#154194; box-shadow:0 0 0 3px rgba(21,65,148,.1); }
        .sa-bid-input::placeholder { color:#d1d5db; font-weight:400; font-size:16px; }
        .sa-bid-btn {
          height:56px; padding:0 32px; background:#154194; color:#fff;
          font-size:15px; font-weight:700; border:none; cursor:pointer; white-space:nowrap;
          letter-spacing:.04em; transition:background .15s, transform .1s, box-shadow .15s;
        }
        .sa-bid-btn:hover:not(:disabled) { background:#1a52c2; box-shadow:0 4px 16px rgba(21,65,148,.3); transform:translateY(-1px); }
        .sa-bid-btn:active:not(:disabled) { transform:scale(.97); }
        .sa-bid-btn:disabled { background:#93a3be; cursor:not-allowed; }
        .sa-bid-btn.submitting { position:relative; }
        .sa-bid-hint { font-size:11px; color:#9ca3af; margin-top:10px; line-height:1.5; }
        .sa-bid-limit { color:#374151; font-weight:600; }

        /* ── Live Feed ── */
        .sa-feed { background:#fff; border:1px solid #e5e7eb; }
        .sa-feed-hdr {
          padding:14px 20px; border-bottom:2px solid #154194;
          display:flex; align-items:center; justify-content:space-between;
        }
        .sa-feed-title { font-size:13px; font-weight:700; color:#0d1b2a; display:flex; align-items:center; gap:8px; }
        .sa-feed-dot { width:6px; height:6px; border-radius:50%; background:#16a34a; animation:pulse-dot 1.5s infinite; }
        .sa-feed-meta { font-size:11px; color:#9ca3af; }
        .sa-feed-empty { padding:40px 24px; text-align:center; }
        .sa-feed-empty-icon { font-size:28px; margin-bottom:8px; opacity:.4; }
        .sa-feed-empty-text { font-size:13px; color:#9ca3af; }
        .sa-feed-row {
          padding:12px 20px;
          display:grid; grid-template-columns:64px 1fr 1fr auto;
          gap:10px; align-items:center;
          border-bottom:1px solid #f3f4f6; font-size:13px;
          transition:background .15s;
          animation:fadeUp .25s ease;
        }
        .sa-feed-row:last-child { border-bottom:none; }
        .sa-feed-row.own { background:#eff6ff; }
        .sa-feed-row:hover { background:#f9fafb; }
        .sa-feed-row.own:hover { background:#dbeafe; }
        .sa-feed-time { font-size:11px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; }
        .sa-feed-who { font-size:12px; color:#6b7280; }
        .sa-feed-who strong { color:#154194; }
        .sa-feed-price { font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:14px; }
        .sa-feed-price.best { color:#16a34a; }
        .sa-feed-price.other { color:#374151; }
        .sa-feed-delta { font-size:11px; font-weight:700; text-align:right; padding:2px 7px; border-radius:2px; white-space:nowrap; }
        .sa-feed-delta.down { background:#dcfce7; color:#14532d; }
        .sa-feed-delta.first { background:#dbeafe; color:#1d4ed8; }
        .sa-feed-delta.none { color:#d1d5db; }

        /* ── Conclusion Card ── */
        .sa-conclusion { padding:32px; text-align:center; }
        .sa-conclusion.won { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:2px solid #16a34a; }
        .sa-conclusion.lost { background:#fafafa; border:1px solid #e5e7eb; }
        .sa-conclusion-icon { font-size:48px; margin-bottom:12px; }
        .sa-conclusion-title { font-size:22px; font-weight:700; margin-bottom:6px; }
        .sa-conclusion-title.won { color:#14532d; }
        .sa-conclusion-title.lost { color:#374151; }
        .sa-conclusion-price { font-family:'IBM Plex Mono',monospace; font-size:36px; font-weight:700; margin:12px 0; }
        .sa-conclusion-price.won { color:#16a34a; }
        .sa-conclusion-price.lost { color:#6b7280; }
        .sa-conclusion-sub { font-size:13px; color:#6b7280; margin-bottom:20px; }
        .sa-dl-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 28px; background:#154194; color:#fff;
          font-size:13px; font-weight:700; border:none; cursor:pointer;
          text-decoration:none; letter-spacing:.04em;
          transition:background .15s, transform .1s;
        }
        .sa-dl-btn:hover { background:#1a52c2; transform:translateY(-1px); }

        /* ── Sticky Quick-Bid ── */
        .sa-sticky {
          position:fixed; bottom:0; left:0; right:0;
          background:linear-gradient(135deg,#0d1b2a 0%,#152d4e 100%);
          border-top:1px solid rgba(255,255,255,.1);
          padding:10px 24px; z-index:100;
          display:flex; align-items:center; gap:10px; flex-wrap:wrap;
          box-shadow:0 -8px 32px rgba(0,0,0,.2);
        }
        .sa-sticky-label { font-size:10px; font-weight:700; color:rgba(255,255,255,.4); letter-spacing:.1em; text-transform:uppercase; white-space:nowrap; flex-shrink:0; }
        .sa-qbtn {
          padding:8px 16px; border:1.5px solid rgba(255,255,255,.25);
          background:transparent; color:#fff;
          font-size:13px; font-weight:700; cursor:pointer;
          transition:all .15s; white-space:nowrap; min-height:40px;
          font-family:'IBM Plex Mono',monospace;
        }
        .sa-qbtn:hover:not(:disabled) { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.6); transform:translateY(-2px); }
        .sa-qbtn:active:not(:disabled) { transform:scale(.95); }
        .sa-qbtn:disabled { opacity:.25; cursor:not-allowed; }
        .sa-sticky-best { margin-left:auto; display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0; }
        .sa-sticky-best-label { font-size:9px; color:rgba(255,255,255,.4); letter-spacing:.1em; text-transform:uppercase; }
        .sa-sticky-best-val { font-family:'IBM Plex Mono',monospace; font-size:16px; font-weight:700; color:#4ade80; }
      `}</style>

      <div className="sa-root">

        {/* ── Top Bar ── */}
        <div className="sa-topbar">
          <div className="sa-topbar-left">
            <span className="sa-topbar-brand">EUCX</span>
            <span className="sa-topbar-sep">›</span>
            <span className="sa-topbar-lot">{lot.commodity}</span>
            <span className="sa-topbar-qty">{lot.quantity} {lot.unit}</span>
            <span className={`sa-phase-chip ${livePhase === "PROPOSAL" ? "proposal" : livePhase === "REDUCTION" ? "reduction" : "conclusion"}`}>
              {livePhase === "PROPOSAL" ? "Erstgebote" : livePhase === "REDUCTION" ? "Auktion läuft" : "Abgeschlossen"}
            </span>
          </div>
          <div className="sa-topbar-right">
            {kyc && (
              <KycStatusBadge
                status={kyc.verificationStatus}
                isYoungCompany={kyc.isYoungCompany}
                walletBalance={kyc.walletBalance}
                depositRequired={depositReq ?? undefined}
              />
            )}
            {token && <NotificationBell token={token} />}
            <span className={`sa-live-dot${connected ? "" : " off"}`} />
            <span className="sa-live-label">{connected ? "Live" : "Verbinde…"}</span>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="sa-grid">

          {/* ── Sidebar ── */}
          <aside className="sa-sidebar">

            {/* Lot Info */}
            <div className="sa-card sa-lot-card">
              <div className="sa-lot-label">Ausschreibung</div>
              <div className="sa-lot-name">{lot.commodity}</div>
              {[
                ["Menge",   `${lot.quantity} ${lot.unit}`],
                ["Limit",   lot.startPrice ? fmtEur(lot.startPrice) : "Offen"],
                ...(lot.description ? [["Notiz", lot.description]] : []),
              ].map(([k, v]) => (
                <div key={k} className="sa-lot-row">
                  <span className="sa-lot-key">{k}</span>
                  <span className="sa-lot-val">{v}</span>
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className={`sa-card sa-timer-card${isUrgent ? " urgent" : ""}`}>
              <div className="sa-timer-label">Verbleibende Zeit</div>
              <div className={`sa-timer-val${isUrgent ? " urgent" : ""}`}>{liveEnd ? countdown : "—"}</div>
              <div className="sa-timer-sub">
                {livePhase === "PROPOSAL"   && "Angebotsphase läuft"}
                {livePhase === "REDUCTION"  && "Bieterwettbewerb aktiv"}
                {livePhase === "CONCLUSION" && "Auktion beendet"}
              </div>
            </div>

            {/* Mein bestes Gebot */}
            {myBids.length > 0 && (
              <div className="sa-card sa-my-card">
                <div className="sa-my-label">Mein bestes Gebot</div>
                <div className="sa-my-price">{fmtEur(myBids[0]!.price)}</div>
                <div className="sa-my-rank" style={{ marginTop: 6 }}>
                  {myRank === 1
                    ? <span className="sa-rank-chip first">Nr. 1 — Führend</span>
                    : <span className="sa-rank-chip other">Rang #{myRank} — Überboten</span>
                  }
                </div>
              </div>
            )}

            {/* Meine Gebote */}
            <div className="sa-card sa-hist">
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

            {/* Status Banner */}
            {canBid && (
              <div className={`sa-status-banner${isLeading ? " leading" : myRank !== null ? " trailing" : " idle"}`}>
                <div className="sa-status-icon">
                  {isLeading ? "✓" : myRank !== null ? "↑" : "◎"}
                </div>
                <div className="sa-status-text">
                  <div className={`sa-status-title${isLeading ? " leading" : myRank !== null ? " trailing" : " idle"}`}>
                    {isLeading
                      ? "Sie halten das beste Angebot"
                      : myRank !== null
                        ? `Überboten — Rang #${myRank}. Jetzt handeln!`
                        : "Bereit zum Bieten"}
                  </div>
                  <div className={`sa-status-sub${isLeading ? " leading" : myRank !== null ? " trailing" : ""}`}>
                    {isLeading
                      ? `Ihr Gebot ${fmtEur(myBids[0]?.price ?? null)} ist aktuell führend — halten Sie die Position`
                      : myRank !== null
                        ? `Aktuelles Bestgebot: ${fmtEur(liveBest)} — Quick-Bid nutzen ↓`
                        : "Geben Sie Ihr erstes Angebot ab — Limit des Käufers: " + fmtEur(lot.startPrice)}
                  </div>
                </div>
                <div className={`sa-status-price${isLeading ? " leading" : myRank !== null ? " trailing" : " idle"}${flash === "good" ? " flash-g" : flash === "bad" ? " flash-r" : ""}`}>
                  {fmtEur(liveBest)}
                </div>
              </div>
            )}

            {/* Conclusion */}
            {livePhase === "CONCLUSION" && (
              <div className={`sa-card sa-conclusion${isLeading ? " won" : " lost"}`}>
                <div className="sa-conclusion-icon">{isLeading ? "🏆" : "📋"}</div>
                <div className={`sa-conclusion-title${isLeading ? " won" : " lost"}`}>
                  {isLeading ? "Auktion gewonnen!" : "Auktion beendet"}
                </div>
                <div className={`sa-conclusion-price${isLeading ? " won" : " lost"}`}>
                  {isLeading ? fmtEur(myBids[0]?.price ?? null) : fmtEur(liveBest)}
                </div>
                <div className="sa-conclusion-sub">
                  {isLeading
                    ? "Ihr Siegergebot wurde akzeptiert. Laden Sie jetzt den Kaufvertrag herunter."
                    : `Siegergebot: ${fmtEur(liveBest)} — Kein Zuschlag erhalten.`}
                </div>
                {isLeading && (
                  <button className="sa-dl-btn" onClick={downloadContract}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Kaufvertrag herunterladen (PDF)
                  </button>
                )}
              </div>
            )}

            {/* Deposit-Banner */}
            {kyc?.isYoungCompany && depositReq && canBid && (
              <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", padding:"12px 18px", fontSize:13, color:"#92400e" }}>
                Sicherheitsleistung (5%) erforderlich — fehlend: <strong style={{ color:"#dc2626" }}>{Number(depositReq).toLocaleString("de-DE", { minimumFractionDigits:2 })} €</strong>
              </div>
            )}

            {/* ── Gebot abgeben ── */}
            {canBid && (
              <div className="sa-bid-box">
                {/* [TESTMODE-05] KYC-Overlay deaktiviert */}
                <div className="sa-bid-box-title">
                  Angebot abgeben
                  <span className="sa-bid-box-title-hint">
                    {bestNum ? `— unter ${fmtEur(liveBest)} bleiben` : "— Erste Phase: Basisreferenz setzen"}
                  </span>
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
                    className={`sa-bid-btn${submitting ? " submitting" : ""}`}
                    disabled={!priceInput || submitting}
                    onClick={() => submitBid(Number(priceInput))}
                  >
                    {submitting
                      ? <svg style={{ animation:"spin 1s linear infinite", width:16, height:16 }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : "Abgeben →"}
                  </button>
                </div>
                <div className="sa-bid-hint">
                  Preis in € pro Einheit eingeben.{" "}
                  {lot.startPrice && <span className="sa-bid-limit">Käufer-Limit: {fmtEur(lot.startPrice)}</span>}
                  {" "}· Enter-Taste oder Button zum Abgeben.
                </div>
              </div>
            )}

            {/* ── Live Feed ── */}
            <div className="sa-card sa-feed">
              <div className="sa-feed-hdr">
                <div className="sa-feed-title">
                  <span className="sa-feed-dot" />
                  Gebots-Feed — alle Teilnehmer
                </div>
                <span className="sa-feed-meta">
                  {allBids.length} Gebot{allBids.length !== 1 ? "e" : ""} · {state?.activeBidderCount ?? "—"} aktive Bieter
                </span>
              </div>
              {competitorWithDelta.length === 0 ? (
                <div className="sa-feed-empty">
                  <div className="sa-feed-empty-icon">◎</div>
                  <div className="sa-feed-empty-text">Noch keine Gebote in dieser Auktion</div>
                </div>
              ) : (
                competitorWithDelta.map((bid) => (
                  <div key={bid.id} className={`sa-feed-row${bid.isOwn ? " own" : ""}`}>
                    <span className="sa-feed-time">{new Date(bid.createdAt).toLocaleTimeString("de-DE", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}</span>
                    <span className="sa-feed-who">{bid.isOwn ? <strong>Sie</strong> : bid.sellerId}</span>
                    <span className={`sa-feed-price${bid.rank === 1 ? " best" : " other"}`}>{fmtEur(bid.price)}</span>
                    <span className={`sa-feed-delta${bid.delta < 0 ? " down" : bid.delta === 0 ? " first" : " none"}`}>
                      {bid.delta < 0 ? fmtDelta(bid.delta) : "Erstgebot"}
                    </span>
                  </div>
                ))
              )}
            </div>

          </main>
        </div>

        {/* ── Sticky Quick-Bid ── */}
        {canBid && (
          <div className="sa-sticky">
            <span className="sa-sticky-label">Quick-Bid</span>
            {quickSteps.map((step) => {
              const qp = bestNum ? bestNum - step : 0;
              return (
                <button
                  key={step}
                  className="sa-qbtn"
                  disabled={!bestNum || qp <= 0 || submitting}
                  onClick={() => submitBid(qp)}
                  title={qp > 0 ? `Gebot: ${fmtEur(String(qp))}` : undefined}
                >
                  −{step} €{qp > 0 ? ` → ${fmtEur(String(qp))}` : ""}
                </button>
              );
            })}
            {bestNum && (
              <div className="sa-sticky-best">
                <span className="sa-sticky-best-label">Bestgebot</span>
                <span className="sa-sticky-best-val">{fmtEur(liveBest)}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
