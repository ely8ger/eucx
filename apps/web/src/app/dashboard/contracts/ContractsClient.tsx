"use client";

import { useState, useEffect } from "react";
import { EucxHeader } from "@/components/layout/EucxHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeeInfo {
  type:   "SELLER_FEE" | "BUYER_FEE";
  rate:   string;
  amount: string;
  status: "UNPAID" | "PAID";
}

interface ContractRow {
  id:             string;
  contractNumber: string;
  lotId:          string;
  commodity:      string;
  quantity:       string;
  unit:           string;
  finalPrice:     string;
  totalValue:     string;
  buyerName:      string;
  sellerName:     string;
  myFee:          FeeInfo | null;
  createdAt:      string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtEur = (v: string) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

// ── Main Component ────────────────────────────────────────────────────────────

export function ContractsClient() {
  const [token,     setToken]     = useState("");
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Token aus localStorage
  useEffect(() => { setToken(localStorage.getItem("accessToken") ?? ""); }, []);

  // Verträge laden
  useEffect(() => {
    if (!token) return;
    fetch("/api/auction/contracts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => { setContracts(d.contracts ?? []); setLoading(false); })
      .catch(() => { setError("Verträge konnten nicht geladen werden."); setLoading(false); });
  }, [token]);

  // PDF herunterladen
  async function downloadPdf(lotId: string, contractNumber: string) {
    setDownloading(contractNumber);
    try {
      const r = await fetch(`/api/auction/lots/${lotId}/contract`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { alert("PDF nicht verfügbar."); return; }
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${contractNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download fehlgeschlagen.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <style>{`
        .cx-root {
          font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
          min-height: 100vh;
          background: #f9fafb;
          color: #1a1a1a;
        }
        .cx-header {
          background: #154194;
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cx-logo {
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.08em;
        }
        .cx-logo-sub {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
        }
        .cx-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }
        .cx-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 6px;
        }
        .cx-sub {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 28px;
        }
        .cx-empty {
          text-align: center;
          padding: 64px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .cx-table-wrap {
          overflow-x: auto;
        }
        .cx-tbl {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .cx-tbl th {
          text-align: left;
          padding: 10px 12px;
          background: #154194;
          color: #fff;
          font-weight: 600;
          font-size: 11.5px;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .cx-tbl td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        .cx-tbl tr:hover td {
          background: #f0f4ff;
        }
        .cx-contract-nr {
          font-family: "IBM Plex Mono", "Courier New", monospace;
          font-size: 12px;
          color: #374151;
        }
        .cx-commodity {
          font-weight: 600;
          color: #111827;
        }
        .cx-amount {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: #154194;
        }
        .cx-fee-unpaid {
          font-size: 11px;
          color: #dc2626;
          font-weight: 600;
        }
        .cx-fee-paid {
          font-size: 11px;
          color: #16a34a;
          font-weight: 600;
        }
        .cx-btn-dl {
          padding: 6px 14px;
          background: #154194;
          color: #fff;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.04em;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .cx-btn-dl:hover { background: #0f3073; }
        .cx-btn-dl:disabled { background: #9ca3af; cursor: default; }
        .cx-back {
          display: inline-block;
          margin-bottom: 20px;
          font-size: 12.5px;
          color: #154194;
          cursor: pointer;
          letter-spacing: 0.02em;
        }
        .cx-back:hover { text-decoration: underline; }
      `}</style>

      <div className="cx-root">
        <EucxHeader />

        <div className="cx-page">
          <button className="cx-back" onClick={() => window.history.back()}>
            ← Zurück
          </button>

          <div className="cx-title">Vertragsarchiv</div>
          <div className="cx-sub">Alle Kaufverträge aus abgeschlossenen Auktionen</div>

          {loading && (
            <div className="cx-empty">Wird geladen…</div>
          )}

          {error && (
            <div className="cx-empty" style={{ color: "#dc2626" }}>{error}</div>
          )}

          {!loading && !error && contracts.length === 0 && (
            <div className="cx-empty">
              Noch keine Kaufverträge vorhanden.
            </div>
          )}

          {!loading && !error && contracts.length > 0 && (
            <div className="cx-table-wrap">
              <table className="cx-tbl">
                <thead>
                  <tr>
                    <th>Vertrag-Nr.</th>
                    <th>Datum</th>
                    <th>Ware</th>
                    <th>Menge</th>
                    <th>Endpreis / Einheit</th>
                    <th>Gesamtwert</th>
                    <th>Käufer</th>
                    <th>Verkäufer</th>
                    <th>Meine Gebühr</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td><span className="cx-contract-nr">{c.contractNumber}</span></td>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>{fmtDate(c.createdAt)}</td>
                      <td className="cx-commodity">{c.commodity}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>
                        {parseFloat(c.quantity).toLocaleString("de-DE", { maximumFractionDigits: 4 })} {c.unit}
                      </td>
                      <td className="cx-amount">{fmtEur(c.finalPrice)}</td>
                      <td className="cx-amount">{fmtEur(c.totalValue)}</td>
                      <td style={{ fontSize: 12 }}>{c.buyerName}</td>
                      <td style={{ fontSize: 12 }}>{c.sellerName}</td>
                      <td>
                        {c.myFee ? (
                          <div>
                            <div style={{ fontSize: 12 }}>
                              {fmtEur(c.myFee.amount)} ({(parseFloat(c.myFee.rate) * 100).toFixed(2).replace(".", ",")} %)
                            </div>
                            <div className={c.myFee.status === "PAID" ? "cx-fee-paid" : "cx-fee-unpaid"}>
                              {c.myFee.status === "PAID" ? "Bezahlt" : "Offen"}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="cx-btn-dl"
                          disabled={downloading === c.contractNumber}
                          onClick={() => downloadPdf(c.lotId, c.contractNumber)}
                        >
                          {downloading === c.contractNumber ? "…" : "PDF"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
