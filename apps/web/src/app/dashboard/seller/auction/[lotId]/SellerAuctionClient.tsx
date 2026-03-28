"use client";

import { useState, useEffect, useRef } from "react";
import { useAuctionStream } from "@/lib/auction/use-auction-stream";
import { toast } from "sonner";

interface Lot {
  id: string; commodity: string; quantity: string; unit: string;
  phase: string; startPrice: string | null; currentBest: string | null;
  auctionEnd: string | null; description: string | null;
}

interface MyBid { price: string; rank: number; createdAt: string; }

function fmt(price: string | null | number): string {
  if (price === null || price === undefined || price === "") return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(price));
}

function useCountdown(endIso: string | null) {
  const [remaining, setRemaining] = useState(0);
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
    ? (endIso ? "Abgelaufen" : "—")
    : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { label, isUrgent, remaining };
}

export function SellerAuctionClient({ lot }: { lot: Lot }) {
  const [token, setToken]         = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBids, setMyBids]       = useState<MyBid[]>([]);
  const [myRank, setMyRank]       = useState<number | null>(null);
  const [isLeading, setIsLeading] = useState(false);
  const prevBestRef = useRef<string | null>(lot.currentBest);
  const [flashState, setFlash]    = useState<"good" | "bad" | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("accessToken") ?? "");
  }, []);

  const { state, connected } = useAuctionStream(lot.id, token);

  const livePhase  = state?.phase       ?? lot.phase;
  const liveBest   = state?.currentBest ?? lot.currentBest;
  const liveEnd    = state?.auctionEnd  ?? lot.auctionEnd;
  const { label: countdown, isUrgent } = useCountdown(liveEnd);

  // Fetch eigene Gebote
  const fetchMyBids = async (tkn: string) => {
    if (!tkn) return;
    try {
      const res = await fetch(`/api/auction/lots/${lot.id}/bids`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const mine = data.bids.filter((b: { isOwn: boolean }) => b.isOwn);
      setMyBids(
        mine.map((b: { price: string; rank: number; createdAt: string }) => ({
          price:     b.price,
          rank:      b.rank,
          createdAt: b.createdAt,
        }))
      );
      setMyRank(data.myBestRank);
      setIsLeading(data.myBestRank === 1);
    } catch { /* ignore */ }
  };

  // Token geladen → Gebote holen
  useEffect(() => {
    if (token) fetchMyBids(token);
  }, [token]);

  // SSE-Update → prüfen ob überboten
  useEffect(() => {
    if (!state) return;
    if (state.currentBest !== prevBestRef.current) {
      prevBestRef.current = state.currentBest;
      fetchMyBids(token);
    }
  }, [state?.currentBest, token]);

  // Gebot abgeben
  const submitBid = async (price: number) => {
    if (!token || isSubmitting) return;
    if (price <= 0) { toast.error("Ungültiger Preis"); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/auction/lots/${lot.id}/bids`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ price }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gebot abgelehnt", {
          description: `Fehler ${res.status}`,
          style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
        });
        setFlash("bad");
        setTimeout(() => setFlash(null), 1500);
      } else {
        toast.success("Gebot erfolgreich abgegeben", {
          description: `Neues Bestgebot: ${fmt(data.newBest)}`,
        });
        setPriceInput("");
        setFlash("good");
        setTimeout(() => setFlash(null), 1500);
        await fetchMyBids(token);
      }
    } catch {
      toast.error("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canBid = livePhase === "PROPOSAL" || livePhase === "REDUCTION";
  const currentBestNum = liveBest ? Number(liveBest) : null;

  // Quick-Bid-Schritte
  const quickSteps = [50, 100, 250, 500];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

        .sac-root { font-family: 'IBM Plex Sans', Arial, sans-serif; background: #f0f2f5; min-height: 100vh; color: #0d1b2a; }
        .sac-header { background: #0d1b2a; padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .sac-header-logo { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.04em; }
        .sac-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; display: inline-block; margin-right: 6px; animation: sacpulse 2s infinite; }
        .sac-header-dot.offline { background: #6b7280; animation: none; }
        @keyframes sacpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sac-header-status { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 6px; }

        .sac-main { max-width: 960px; margin: 0 auto; padding: 32px 24px; }

        /* Hero — aktuelles Bestgebot */
        .sac-hero { background: #fff; border: 1px solid #e5e7eb; padding: 40px; text-align: center; margin-bottom: 24px; }
        .sac-hero-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; }
        .sac-hero-price { font-family: 'IBM Plex Mono', monospace; font-size: 64px; font-weight: 600; line-height: 1; margin-bottom: 16px; transition: color 0.3s; }
        .sac-hero-price.neutral { color: #0d1b2a; }
        .sac-hero-price.flash-good { color: #16a34a; }
        .sac-hero-price.flash-bad  { color: #dc2626; }

        .sac-status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; }
        .sac-status-badge.leading  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .sac-status-badge.trailing { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; animation: sacshake 0.4s; }
        .sac-status-badge.inactive { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
        @keyframes sacshake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

        /* Grid */
        .sac-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 640px) { .sac-grid { grid-template-columns: 1fr; } }

        .sac-card { background: #fff; border: 1px solid #e5e7eb; padding: 24px; }
        .sac-card-label { font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 8px; }
        .sac-card-value { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 600; }
        .sac-card-sub   { font-size: 12px; color: #6b7280; margin-top: 4px; }

        /* Bid-Area */
        .sac-bid-area { background: #fff; border: 1px solid #e5e7eb; padding: 28px; margin-bottom: 24px; }
        .sac-bid-title { font-size: 15px; font-weight: 700; margin-bottom: 20px; }
        .sac-bid-row { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
        .sac-bid-input { flex: 1; height: 48px; border: 1px solid #d1d5db; padding: 0 16px; font-size: 16px; font-family: 'IBM Plex Mono', monospace; outline: none; transition: border-color 0.15s; }
        .sac-bid-input:focus { border-color: #154194; }
        .sac-bid-submit { height: 48px; padding: 0 28px; background: #154194; color: #fff; font-size: 14px; font-weight: 700; border: none; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s, transform 0.1s; }
        .sac-bid-submit:hover:not(:disabled) { background: #1a52c2; }
        .sac-bid-submit:active:not(:disabled) { transform: scale(0.98); }
        .sac-bid-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .sac-quick-label { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
        .sac-quick-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .sac-quick-btn { padding: 8px 16px; border: 1px solid #d1d5db; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; color: #154194; }
        .sac-quick-btn:hover:not(:disabled) { background: #154194; color: #fff; border-color: #154194; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(21,65,148,0.2); }
        .sac-quick-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sac-bid-hint { font-size: 12px; color: #9ca3af; margin-top: 12px; }

        /* Eigene Gebote */
        .sac-history { background: #fff; border: 1px solid #e5e7eb; }
        .sac-history-head { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; }
        .sac-history-empty { padding: 32px 20px; text-align: center; color: #9ca3af; font-size: 14px; }
        .sac-history-item { padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; }
        .sac-history-item:last-child { border-bottom: none; }
        .sac-history-price { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 15px; }
      `}</style>

      <div className="sac-root">
        {/* Header */}
        <div className="sac-header">
          <span className="sac-header-logo">EUCX — Verkäufer-Dashboard</span>
          <span className="sac-header-status">
            <span className={`sac-header-dot${connected ? "" : " offline"}`} />
            {connected ? "Echtzeit verbunden" : "Verbindung..."}
          </span>
        </div>

        <div className="sac-main">
          {/* Lot-Info */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a" }}>{lot.commodity}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {lot.quantity} {lot.unit}
              {lot.description ? ` — ${lot.description}` : ""}
            </div>
          </div>

          {/* Hero: aktuelles Bestgebot */}
          <div className="sac-hero">
            <div className="sac-hero-label">Aktuell bestes Gebot</div>
            <div className={`sac-hero-price ${flashState === "good" ? "flash-good" : flashState === "bad" ? "flash-bad" : "neutral"}`}>
              {fmt(liveBest)}
            </div>

            {canBid && (
              <div>
                {myRank === 1 ? (
                  <span className="sac-status-badge leading">Sie sind aktuell Bestbietender</span>
                ) : myRank !== null ? (
                  <span className="sac-status-badge trailing">
                    Sie wurden überboten! (Rang #{myRank})
                  </span>
                ) : (
                  <span className="sac-status-badge inactive">Noch kein Gebot abgegeben</span>
                )}
              </div>
            )}
            {livePhase === "CONCLUSION" && (
              <div>
                {isLeading ? (
                  <span className="sac-status-badge leading">Sie haben gewonnen!</span>
                ) : myRank !== null ? (
                  <span className="sac-status-badge inactive">Auktion beendet — Rang #{myRank}</span>
                ) : (
                  <span className="sac-status-badge inactive">Auktion beendet</span>
                )}
              </div>
            )}
          </div>

          {/* Timer + Eigener Status */}
          <div className="sac-grid">
            <div className="sac-card">
              <div className="sac-card-label">Verbleibende Zeit</div>
              <div className={`sac-card-value${isUrgent ? " sac-urgent" : ""}`}
                style={{ color: isUrgent ? "#dc2626" : "#0d1b2a" }}>
                {liveEnd ? countdown : "—"}
              </div>
              <div className="sac-card-sub">
                {livePhase === "COLLECTION" && "Wartet auf Öffnung durch Käufer"}
                {livePhase === "CONCLUSION" && "Auktion geschlossen"}
              </div>
            </div>

            <div className="sac-card">
              <div className="sac-card-label">Mein bestes Gebot</div>
              <div className="sac-card-value">
                {myBids.length > 0 ? fmt(myBids[0]!.price) : "—"}
              </div>
              <div className="sac-card-sub">
                {myBids.length > 0 ? `${myBids.length} Gebot(e) abgegeben` : "Noch kein Gebot"}
              </div>
            </div>
          </div>

          {/* Gebotsabgabe */}
          {canBid && (
            <div className="sac-bid-area">
              <div className="sac-bid-title">Gebot abgeben</div>

              <div className="sac-bid-row">
                <input
                  className="sac-bid-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={
                    currentBestNum
                      ? `Unter ${fmt(String(currentBestNum))} eingeben`
                      : lot.startPrice
                        ? `Max. ${fmt(lot.startPrice)}`
                        : "Preis in € / Einheit"
                  }
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && priceInput) {
                      submitBid(Number(priceInput));
                    }
                  }}
                  disabled={isSubmitting}
                />
                <button
                  className="sac-bid-submit"
                  disabled={!priceInput || isSubmitting}
                  onClick={() => submitBid(Number(priceInput))}
                >
                  {isSubmitting ? "Wird gesendet..." : "Gebot abgeben"}
                </button>
              </div>

              {/* Quick-Bid-Buttons */}
              {currentBestNum !== null && (
                <>
                  <div className="sac-quick-label">Quick-Bid — unter dem aktuellen Bestgebot:</div>
                  <div className="sac-quick-btns">
                    {quickSteps.map((step) => {
                      const quickPrice = currentBestNum - step;
                      return (
                        <button
                          key={step}
                          className="sac-quick-btn"
                          disabled={quickPrice <= 0 || isSubmitting}
                          onClick={() => submitBid(quickPrice)}
                          title={`Gebot: ${fmt(String(quickPrice))}`}
                        >
                          − {step} € → {fmt(String(quickPrice))}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="sac-bid-hint">
                Preis in €/Einheit. Ihr Gebot muss unter dem aktuellen Bestgebot liegen.
                {livePhase === "PROPOSAL" && " In der Proposals-Phase: erstes Gebot setzt die Basis."}
              </div>
            </div>
          )}

          {/* Eigene Gebotshistorie */}
          <div className="sac-history">
            <div className="sac-history-head">Meine Gebote ({myBids.length})</div>
            {myBids.length === 0 ? (
              <div className="sac-history-empty">
                {canBid ? "Geben Sie oben Ihr erstes Gebot ab." : "Keine Gebote in dieser Auktion."}
              </div>
            ) : (
              myBids.map((bid, idx) => (
                <div key={idx} className="sac-history-item">
                  <span className="sac-history-price">{fmt(bid.price)}</span>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>
                    Rang #{bid.rank} — {new Date(bid.createdAt).toLocaleTimeString("de-DE")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
