"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuctionStream } from "@/lib/auction/use-auction-stream";

interface Lot {
  id: string; commodity: string; quantity: string; unit: string;
  phase: string; startPrice: string | null; currentBest: string | null;
  auctionEnd: string | null; description: string | null;
}

interface Bid {
  id: string; bieter: string; price: string; isWinner: boolean; createdAt: string;
}

interface Props { lot: Lot; initialBids: Bid[]; }

function fmt(price: string | null): string {
  if (!price) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(price));
}

function useCountdown(endIso: string | null) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!endIso) return;
    const tick = () => setRemaining(Math.max(0, new Date(endIso).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endIso]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 10 * 60 * 1000 && remaining > 0;
  const label = remaining === 0
    ? "Abgelaufen"
    : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return { label, isUrgent, remaining };
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

export function BuyerAuctionClient({ lot, initialBids }: Props) {
  // Token aus localStorage (gesetzt beim Login)
  const [token, setToken] = useState("");
  const [bids, setBids]   = useState<Bid[]>(initialBids);
  const prevBestRef = useRef<string | null>(lot.currentBest);
  const [flashBest, setFlashBest] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("accessToken") ?? "");
  }, []);

  const { state, connected } = useAuctionStream(lot.id, token);

  // Bids bei jedem SSE-Update neu laden
  const fetchBids = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/auction/lots/${lot.id}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      // Re-anonymisieren: Buyer-View (alle Bieter als "Bieter N")
      setBids(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.bids.map((b: any) => ({
          id:        b.id,
          bieter:    b.sellerId as string,
          price:     b.price,
          isWinner:  b.isWinner,
          createdAt: b.createdAt,
        }))
      );
    } catch { /* ignore */ }
  }, [lot.id, token]);

  // Flash-Effekt wenn neues Bestgebot eingeht
  useEffect(() => {
    if (!state) return;
    if (state.currentBest !== prevBestRef.current) {
      prevBestRef.current = state.currentBest;
      setFlashBest(true);
      fetchBids();
      setTimeout(() => setFlashBest(false), 1200);
    }
  }, [state?.currentBest, fetchBids]);

  const livePhase  = state?.phase       ?? lot.phase;
  const liveBest   = state?.currentBest ?? lot.currentBest;
  const liveEnd    = state?.auctionEnd  ?? lot.auctionEnd;
  const liveBidCnt = state?.bidCount    ?? bids.length;

  const { label: countdown, isUrgent } = useCountdown(liveEnd);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

        .bac-root { font-family: 'IBM Plex Sans', Arial, sans-serif; background: #f0f2f5; min-height: 100vh; color: #0d1b2a; }
        .bac-header { background: #0d1b2a; padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .bac-header-logo { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.04em; }
        .bac-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; display: inline-block; margin-right: 6px; animation: pulse 2s infinite; }
        .bac-header-dot.offline { background: #6b7280; animation: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .bac-header-status { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 6px; }

        .bac-main { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

        .bac-top { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start; margin-bottom: 28px; }
        .bac-commodity { font-size: 26px; font-weight: 300; color: #0d1b2a; }
        .bac-commodity strong { font-weight: 700; }
        .bac-meta { font-size: 13px; color: #6b7280; margin-top: 6px; }
        .bac-phase-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 2px; color: #fff; }

        .bac-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        @media (max-width: 760px) { .bac-grid { grid-template-columns: 1fr 1fr; } .bac-top { grid-template-columns: 1fr; } }

        .bac-card { background: #fff; border: 1px solid #e5e7eb; padding: 24px; }
        .bac-card-label { font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 8px; }
        .bac-card-value { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 600; color: #0d1b2a; }
        .bac-card-value.green { color: #16a34a; }
        .bac-card-value.red   { color: #dc2626; }
        .bac-card-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }

        .bac-flash { animation: flashGreen 1.2s ease-out; }
        @keyframes flashGreen { 0%{background:#dcfce7} 100%{background:#fff} }

        .bac-table-wrap { background: #fff; border: 1px solid #e5e7eb; }
        .bac-table-head { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; }
        .bac-table-title { font-size: 14px; font-weight: 600; color: #0d1b2a; }
        .bac-table-cnt   { font-size: 12px; color: #9ca3af; }
        table.bac-table  { width: 100%; border-collapse: collapse; }
        table.bac-table th { padding: 10px 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #9ca3af; text-align: left; border-bottom: 1px solid #e5e7eb; background: #fafafa; }
        table.bac-table td { padding: 12px 20px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        table.bac-table tr:last-child td { border-bottom: none; }
        table.bac-table tr.winner td { background: #f0fdf4; }
        .bac-rank-1 { font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: #16a34a; }

        .bac-empty { padding: 48px 20px; text-align: center; color: #9ca3af; font-size: 14px; }
      `}</style>

      <div className="bac-root">
        {/* Header */}
        <div className="bac-header">
          <span className="bac-header-logo">EUCX — Käufer-Dashboard</span>
          <span className="bac-header-status">
            <span className={`bac-header-dot${connected ? "" : " offline"}`} />
            {connected ? "Echtzeit verbunden" : "Verbindung wird hergestellt..."}
          </span>
        </div>

        <div className="bac-main">
          {/* Lot-Titel + Phase */}
          <div className="bac-top">
            <div>
              <div className="bac-commodity">
                <strong>{lot.commodity}</strong>
              </div>
              <div className="bac-meta">
                {lot.quantity} {lot.unit} — Lot #{lot.id.slice(-8).toUpperCase()}
                {lot.description && ` — ${lot.description}`}
              </div>
            </div>
            <div>
              <span
                className="bac-phase-badge"
                style={{ backgroundColor: PHASE_COLOR[livePhase] ?? "#6b7280" }}
              >
                {PHASE_LABEL[livePhase] ?? livePhase}
              </span>
            </div>
          </div>

          {/* KPI-Karten */}
          <div className="bac-grid">
            {/* Bestes Gebot */}
            <div className={`bac-card${flashBest ? " bac-flash" : ""}`}>
              <div className="bac-card-label">Aktuell bestes Gebot</div>
              <div className="bac-card-value green">
                {fmt(liveBest)}
              </div>
              <div className="bac-card-sub">
                {lot.startPrice ? `Maximalpreis: ${fmt(lot.startPrice)}` : "Kein Maximalpreis gesetzt"}
              </div>
            </div>

            {/* Countdown */}
            <div className="bac-card">
              <div className="bac-card-label">Verbleibende Zeit</div>
              <div className={`bac-card-value${isUrgent ? " red" : ""}`}>
                {liveEnd ? countdown : "—"}
              </div>
              <div className="bac-card-sub">
                {livePhase === "COLLECTION" && "Auktion noch nicht gestartet"}
                {livePhase === "CONCLUSION" && "Auktion beendet"}
              </div>
            </div>

            {/* Gebote */}
            <div className="bac-card">
              <div className="bac-card-label">Eingegangene Gebote</div>
              <div className="bac-card-value">{liveBidCnt}</div>
              <div className="bac-card-sub">Anonymisiert — Phase: {PHASE_LABEL[livePhase]}</div>
            </div>
          </div>

          {/* Gebots-Tabelle */}
          <div className="bac-table-wrap">
            <div className="bac-table-head">
              <span className="bac-table-title">Gebotshistorie</span>
              <span className="bac-table-cnt">{bids.length} Gebote</span>
            </div>
            {bids.length === 0 ? (
              <div className="bac-empty">Noch keine Gebote eingegangen.</div>
            ) : (
              <table className="bac-table">
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Bieter</th>
                    <th>Gebot</th>
                    <th>Uhrzeit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, idx) => (
                    <tr key={bid.id} className={bid.isWinner ? "winner" : ""}>
                      <td className={idx === 0 ? "bac-rank-1" : ""}>
                        {idx === 0 ? "🏆 #1" : `#${idx + 1}`}
                      </td>
                      <td>{bid.bieter}</td>
                      <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {fmt(bid.price)}
                      </td>
                      <td style={{ color: "#6b7280" }}>
                        {new Date(bid.createdAt).toLocaleTimeString("de-DE")}
                      </td>
                      <td>
                        {bid.isWinner ? (
                          <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 12 }}>SIEGER</span>
                        ) : idx === 0 && livePhase !== "CONCLUSION" ? (
                          <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 12 }}>FÜHREND</span>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>Überboten</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
