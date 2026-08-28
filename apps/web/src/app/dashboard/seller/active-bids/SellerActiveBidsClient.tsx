"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const A  = "#d97706";
const B  = "#154194";

type Phase = "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";

interface BidRow {
  lotId:           string;
  commodity:       string;
  quantity:        string;
  unit:            string;
  phase:           Phase;
  currentBest:     string | null;
  auctionEnd:      string | null;
  incoterms:       string | null;
  deliveryLocation:string | null;
  hasCbam:         boolean;
  totalBids:       number;
  myBestPrice:     string | null;
  rank:            number | null;
  isLeading:       boolean;
  isWinner:        boolean;
  lastBidAt:       string;
}

const PHASE_LABEL: Record<Phase, string> = {
  COLLECTION: "Registrierung",
  PROPOSAL:   "Angebotsphase",
  REDUCTION:  "Reduktion",
  CONCLUSION: "Abgeschlossen",
};

const PHASE_COLOR: Record<Phase, string> = {
  COLLECTION: B,
  PROPOSAL:   A,
  REDUCTION:  "#dc2626",
  CONCLUSION: "#6b7280",
};

const fmtEur = (v: string | null) =>
  v == null ? "—" :
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtQty = (qty: string, unit: string) =>
  `${parseFloat(qty).toLocaleString("de-DE")} ${unit}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function useCountdown(isoEnd: string | null): string {
  const [label, setLabel] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isoEnd) { setLabel("—"); return; }
    const calc = () => {
      const diff = new Date(isoEnd).getTime() - Date.now();
      if (diff <= 0) { setLabel("Abgelaufen"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 0) setLabel(`${h}h ${m}m`);
      else if (m > 0) setLabel(`${m}m ${s}s`);
      else setLabel(`${s}s`);
    };
    calc();
    timerRef.current = setInterval(calc, 1_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isoEnd]);

  return label;
}

function CountdownCell({ isoEnd, phase }: { isoEnd: string | null; phase: Phase }) {
  const label = useCountdown(isoEnd);
  if (phase === "CONCLUSION") return <span style={{ color: "#9ca3af" }}>—</span>;
  const urgent = isoEnd ? new Date(isoEnd).getTime() - Date.now() < 10 * 60_000 : false;
  return <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: urgent ? "#dc2626" : "#374151", fontWeight: urgent ? 700 : 400 }}>{label}</span>;
}

function RankBadge({ row }: { row: BidRow }) {
  if (row.isWinner) {
    return <span style={{ display: "inline-block", padding: "3px 9px", fontSize: 10.5, fontWeight: 700, background: "#16a34a", color: "#fff" }}>GEWONNEN</span>;
  }
  if (row.phase === "CONCLUSION" && !row.isWinner) {
    return <span style={{ display: "inline-block", padding: "3px 9px", fontSize: 10.5, fontWeight: 700, background: "#6b7280", color: "#fff" }}>Nicht gewonnen</span>;
  }
  if (row.isLeading) {
    return <span style={{ display: "inline-block", padding: "3px 9px", fontSize: 10.5, fontWeight: 700, background: A, color: "#fff" }}>#1 Führend</span>;
  }
  if (row.rank != null) {
    return <span style={{ display: "inline-block", padding: "3px 9px", fontSize: 10.5, fontWeight: 700, background: "#e5e7eb", color: "#374151" }}>#{row.rank} von {row.totalBids}</span>;
  }
  return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
}

export function SellerActiveBidsClient() {
  const router = useRouter();
  const [token, setToken]   = useState("");
  const [bids,  setBids]    = useState<BidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"active" | "all">("active");

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch("/api/seller/bids", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setBids(await r.json() as BidRow[]);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const displayed = filter === "active"
    ? bids.filter((b) => b.phase !== "CONCLUSION")
    : bids;

  const leading  = bids.filter((b) => b.isLeading && b.phase !== "CONCLUSION").length;
  const outbid   = bids.filter((b) => !b.isLeading && b.phase !== "CONCLUSION").length;
  const won      = bids.filter((b) => b.isWinner).length;
  const active   = bids.filter((b) => b.phase !== "CONCLUSION").length;

  return (
    <>
      <style>{`
        .ab { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }
        .ab-stripe { background:linear-gradient(90deg,#78350f,#92400e); border-bottom:1px solid #b45309; height:36px; padding:0 28px; display:flex; align-items:center; }
        .ab-stripe-inner { max-width:1100px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .ab-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; background:rgba(255,255,255,.12); padding:3px 10px; }
        .ab-page { max-width:1100px; margin:0 auto; padding:28px 24px 80px; }
        .ab-title { font-size:20px; font-weight:700; color:#111827; margin-bottom:4px; }
        .ab-sub { font-size:12.5px; color:#6b7280; margin-bottom:20px; }

        .ab-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
        @media(max-width:640px){ .ab-kpi-row { grid-template-columns:repeat(2,1fr); } }
        .ab-kpi { background:#fff; border:1px solid #e5e7eb; padding:14px 16px; }
        .ab-kpi-val { font-size:26px; font-weight:800; color:#111827; line-height:1; }
        .ab-kpi-val.green { color:#16a34a; }
        .ab-kpi-val.amber { color:${A}; }
        .ab-kpi-val.red   { color:#dc2626; }
        .ab-kpi-label { font-size:11px; color:#6b7280; margin-top:5px; text-transform:uppercase; letter-spacing:.06em; font-weight:600; }

        .ab-filter { display:flex; gap:8px; margin-bottom:16px; }
        .ab-filter-btn { padding:6px 16px; font-size:12px; font-weight:700; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
        .ab-filter-btn.active { background:${A}; color:#fff; border-color:${A}; }

        .ab-table-wrap { overflow-x:auto; }
        .ab-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .ab-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; border-bottom:2px solid ${A}; white-space:nowrap; }
        .ab-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .ab-table tr:last-child td { border-bottom:none; }
        .ab-table tr:hover td { background:#fffbf5; }
        .ab-cbam { display:inline-block; padding:2px 7px; font-size:9px; font-weight:800; letter-spacing:.08em; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; text-transform:uppercase; margin-left:6px; }
        .ab-link { font-size:11.5px; font-weight:700; color:${B}; text-decoration:none; white-space:nowrap; }
        .ab-link:hover { text-decoration:underline; }
        .ab-empty { padding:48px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .ab-loading { padding:48px; text-align:center; color:#9ca3af; font-size:13px; }
        .ab-diff { font-size:11px; margin-top:2px; }
        .ab-diff.better { color:#16a34a; }
        .ab-diff.worse  { color:#dc2626; }
      `}</style>

      <div className="ab">
        <EucxHeader />
        <div className="ab-stripe">
          <div className="ab-stripe-inner">
            <span className="ab-badge">MEINE GEBOTE</span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)" }}>
              Gebotsübersicht · Rang · Auktionsdeadline · CBAM-Status
            </span>
          </div>
        </div>

        <div className="ab-page">
          <div className="ab-title">Aktive Gebote</div>
          <div className="ab-sub">
            Alle Lots auf die Sie ein Gebot abgegeben haben — mit aktuellem Rang und Preisentwicklung.
          </div>

          {/* KPI-Kacheln */}
          <div className="ab-kpi-row">
            <div className="ab-kpi">
              <div className={`ab-kpi-val${leading > 0 ? " green" : ""}`}>{leading}</div>
              <div className="ab-kpi-label">Führend (#1)</div>
            </div>
            <div className="ab-kpi">
              <div className={`ab-kpi-val${outbid > 0 ? " red" : ""}`}>{outbid}</div>
              <div className="ab-kpi-label">Überboten</div>
            </div>
            <div className="ab-kpi">
              <div className="ab-kpi-val amber">{active}</div>
              <div className="ab-kpi-label">Aktive Auktionen</div>
            </div>
            <div className="ab-kpi">
              <div className={`ab-kpi-val${won > 0 ? " green" : ""}`}>{won}</div>
              <div className="ab-kpi-label">Gewonnen</div>
            </div>
          </div>

          {/* Filter */}
          <div className="ab-filter">
            <button
              className={`ab-filter-btn${filter === "active" ? " active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Aktive Auktionen
            </button>
            <button
              className={`ab-filter-btn${filter === "all" ? " active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Alle inkl. Abgeschlossene
            </button>
          </div>

          {/* Tabelle */}
          {loading ? (
            <div className="ab-loading">Gebote werden geladen…</div>
          ) : displayed.length === 0 ? (
            <div className="ab-empty">
              {filter === "active"
                ? "Keine aktiven Gebote. Jetzt in der Auktionsübersicht ein Gebot abgeben."
                : "Noch keine Gebote abgegeben."}
            </div>
          ) : (
            <div className="ab-table-wrap">
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>Ware / Lot</th>
                    <th>Menge</th>
                    <th>Mein bestes Gebot</th>
                    <th>Bestes Marktgebot</th>
                    <th>Rang</th>
                    <th>Phase</th>
                    <th>Endet in</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((row) => {
                    const priceDiff = row.myBestPrice && row.currentBest
                      ? Number(row.myBestPrice) - Number(row.currentBest)
                      : null;
                    return (
                      <tr key={row.lotId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {row.commodity}
                            {row.hasCbam && <span className="ab-cbam">CBAM</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                            {row.incoterms ?? ""}{row.deliveryLocation ? ` · ${row.deliveryLocation}` : ""}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {fmtQty(row.quantity, row.unit)}
                        </td>
                        <td>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13 }}>
                            {fmtEur(row.myBestPrice)}
                          </div>
                          <div style={{ fontSize: 10.5, color: "#6b7280" }}>
                            Letztes Gebot: {fmtDate(row.lastBidAt)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 13 }}>
                            {fmtEur(row.currentBest)}
                          </div>
                          {priceDiff !== null && (
                            <div className={`ab-diff ${priceDiff === 0 ? "better" : priceDiff > 0 ? "worse" : "better"}`}>
                              {priceDiff === 0 ? "= Sie führen" : priceDiff > 0 ? `+${priceDiff.toFixed(2)} € über Markt` : `${priceDiff.toFixed(2)} € unter Markt`}
                            </div>
                          )}
                        </td>
                        <td><RankBadge row={row} /></td>
                        <td>
                          <span style={{
                            display: "inline-block", padding: "3px 9px",
                            fontSize: 10.5, fontWeight: 700,
                            background: PHASE_COLOR[row.phase], color: "#fff",
                          }}>
                            {PHASE_LABEL[row.phase]}
                          </span>
                        </td>
                        <td>
                          <CountdownCell isoEnd={row.auctionEnd} phase={row.phase} />
                        </td>
                        <td>
                          <a
                            className="ab-link"
                            href={`/dashboard/seller/auction/${row.lotId}`}
                          >
                            Bieten →
                          </a>
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
