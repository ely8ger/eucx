"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type DeliveryStatus =
  | "MATCHED"
  | "AWAITING_PAYMENT"
  | "READY_FOR_PICKUP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED";

interface FeeInfo {
  type:   string;
  rate:   string;
  amount: string;
  status: "UNPAID" | "PAID";
}

interface ContractRow {
  id:              string;
  contractNumber:  string;
  lotId:           string;
  commodity:       string;
  quantity:        string;
  unit:            string;
  finalPrice:      string;
  totalValue:      string;
  deliveryStatus:  DeliveryStatus;
  myRole:          "buyer" | "seller" | "admin";
  counterpartyName: string;
  myFee:           FeeInfo | null;
  createdAt:       string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  MATCHED:          { label: "Vertrag generiert",  color: "#374151", bg: "#f3f4f6" },
  AWAITING_PAYMENT: { label: "Zahlung ausstehend", color: "#fff",    bg: "#154194" },
  READY_FOR_PICKUP: { label: "Abholbereit",        color: "#fff",    bg: "#d97706" },
  IN_TRANSIT:       { label: "In Transport",       color: "#fff",    bg: "#2563eb" },
  DELIVERED:        { label: "Geliefert",          color: "#fff",    bg: "#16a34a" },
  COMPLETED:        { label: "Abgeschlossen",      color: "#fff",    bg: "#7c3aed" },
};

const COUNTERPARTY_LABEL: Record<"buyer" | "seller" | "admin", string> = {
  buyer:  "Verkäufer",
  seller: "Käufer",
  admin:  "Parteien",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtEur = (v: string) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

// ── Main Component ────────────────────────────────────────────────────────────

export function ContractsClient() {
  const router = useRouter();
  const [token,       setToken]       = useState("");
  const [contracts,   setContracts]   = useState<ContractRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => { setToken(localStorage.getItem("accessToken") ?? ""); }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/auction/contracts", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => { setContracts(d.contracts ?? []); setLoading(false); })
      .catch(() => { setError("Verträge konnten nicht geladen werden."); setLoading(false); });
  }, [token]);

  async function downloadPdf(e: React.MouseEvent, lotId: string, contractNumber: string) {
    e.stopPropagation();
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
        .cx-root { font-family:"IBM Plex Sans","Helvetica Neue",Arial,sans-serif; min-height:100vh; background:#f9fafb; color:#1a1a1a; }
        .cx-page { max-width:1100px; margin:0 auto; padding:32px 24px 60px; }
        .cx-back { display:inline-block; margin-bottom:20px; font-size:12.5px; color:#154194; cursor:pointer; letter-spacing:.02em; background:none; border:none; padding:0; }
        .cx-back:hover { text-decoration:underline; }
        .cx-title { font-size:22px; font-weight:700; color:#111827; margin-bottom:6px; }
        .cx-sub   { font-size:13px; color:#6b7280; margin-bottom:28px; }
        .cx-empty { text-align:center; padding:64px 0; color:#9ca3af; font-size:14px; }

        /* Tabelle */
        .cx-table-wrap { overflow-x:auto; }
        .cx-tbl { width:100%; border-collapse:collapse; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .cx-tbl th {
          text-align:left; padding:10px 14px;
          background:#154194; color:#fff;
          font-size:10.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
          white-space:nowrap;
        }
        .cx-tbl td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .cx-tbl tr:last-child td { border-bottom:none; }
        .cx-tbl tbody tr { cursor:pointer; transition:background .1s; }
        .cx-tbl tbody tr:hover td { background:#f0f4ff; }

        /* Zellen */
        .cx-nr   { font-family:"IBM Plex Mono","Courier New",monospace; font-size:11px; color:#374151;
                   white-space:nowrap; max-width:130px; overflow:hidden; text-overflow:ellipsis; display:block; }
        .cx-ware { font-weight:600; color:#111827; white-space:nowrap; }
        .cx-ware-sub { font-size:11.5px; color:#9ca3af; font-weight:400; margin-top:1px; white-space:nowrap; }
        .cx-amt  { font-variant-numeric:tabular-nums; font-weight:600; color:#154194; white-space:nowrap; }
        .cx-cp   { font-size:12.5px; color:#374151; white-space:nowrap; }

        /* Status-Chip */
        .cx-chip { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; letter-spacing:.04em; white-space:nowrap; }

        /* Gebühr */
        .cx-fee { font-size:12px; color:#374151; white-space:nowrap; }
        .cx-fee-badge-unpaid { font-size:10px; font-weight:700; color:#dc2626; display:inline-block; margin-top:2px; }
        .cx-fee-badge-paid   { font-size:10px; font-weight:700; color:#16a34a; display:inline-block; margin-top:2px; }

        /* Aktionen */
        .cx-actions { display:flex; align-items:center; gap:8px; justify-content:flex-end; }
        .cx-btn-pdf {
          padding:5px 12px; background:#fff; color:#374151;
          border:1px solid #d1d5db; font-size:11.5px; font-weight:700;
          cursor:pointer; white-space:nowrap; letter-spacing:.04em; transition:background .12s;
        }
        .cx-btn-pdf:hover { background:#f3f4f6; }
        .cx-btn-pdf:disabled { color:#9ca3af; cursor:default; }
        .cx-btn-detail {
          padding:5px 14px; background:#154194; color:#fff;
          border:none; font-size:11.5px; font-weight:700;
          cursor:pointer; white-space:nowrap; letter-spacing:.03em; transition:background .12s;
          text-decoration:none; display:inline-block;
        }
        .cx-btn-detail:hover { background:#0f3073; }

        /* Aktions-erforderlich Indikator */
        .cx-action-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#dc2626; margin-right:5px; vertical-align:middle; }
      `}</style>

      <div className="cx-root">
        <EucxHeader />

        <div className="cx-page">
          <button className="cx-back" onClick={() => window.history.back()}>← Zurück</button>

          <div className="cx-title">Vertragsarchiv</div>
          <div className="cx-sub">Alle Kaufverträge aus abgeschlossenen Auktionen</div>

          {loading && <div className="cx-empty">Wird geladen…</div>}
          {error   && <div className="cx-empty" style={{ color: "#dc2626" }}>{error}</div>}

          {!loading && !error && contracts.length === 0 && (
            <div className="cx-empty">Noch keine Kaufverträge vorhanden.</div>
          )}

          {!loading && !error && contracts.length > 0 && (
            <div className="cx-table-wrap">
              <table className="cx-tbl">
                <thead>
                  <tr>
                    <th>Vertrag-Nr.</th>
                    <th>Datum</th>
                    <th>Ware / Menge</th>
                    <th>Gesamtwert</th>
                    <th>{contracts[0] ? COUNTERPARTY_LABEL[contracts[0].myRole] : "Gegenpartei"}</th>
                    <th>Lieferstatus</th>
                    <th>Gebühr</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => {
                    const status = STATUS_META[c.deliveryStatus];
                    const needsAction =
                      (c.myRole === "buyer"  && c.deliveryStatus === "AWAITING_PAYMENT") ||
                      (c.myRole === "buyer"  && c.deliveryStatus === "IN_TRANSIT") ||
                      (c.myRole === "seller" && c.deliveryStatus === "MATCHED") ||
                      (c.myRole === "seller" && c.deliveryStatus === "DELIVERED");
                    return (
                      <tr key={c.id} onClick={() => router.push(`/dashboard/contracts/${c.id}`)}>
                        <td><span className="cx-nr">{c.contractNumber}</span></td>
                        <td style={{ color: "#6b7280", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(c.createdAt)}</td>
                        <td>
                          <div className="cx-ware">{c.commodity}</div>
                          <div className="cx-ware-sub">
                            {parseFloat(c.quantity).toLocaleString("de-DE", { maximumFractionDigits: 4 })} {c.unit}
                          </div>
                        </td>
                        <td className="cx-amt">{fmtEur(c.totalValue)}</td>
                        <td className="cx-cp">{c.counterpartyName}</td>
                        <td>
                          <span className="cx-chip" style={{ background: status.bg, color: status.color }}>
                            {needsAction && <span className="cx-action-dot" />}
                            {status.label}
                          </span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {c.myFee ? (
                            <>
                              <div className="cx-fee">{fmtEur(c.myFee.amount)}</div>
                              <div className={c.myFee.status === "PAID" ? "cx-fee-badge-paid" : "cx-fee-badge-unpaid"}>
                                {c.myFee.status === "PAID" ? "Bezahlt" : "Offen"}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="cx-actions">
                            <button
                              className="cx-btn-pdf"
                              disabled={downloading === c.contractNumber}
                              onClick={(e) => void downloadPdf(e, c.lotId, c.contractNumber)}
                            >
                              {downloading === c.contractNumber ? "…" : "PDF"}
                            </button>
                            <a
                              href={`/dashboard/contracts/${c.id}`}
                              className="cx-btn-detail"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Details →
                            </a>
                          </div>
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
