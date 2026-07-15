"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const BLUE  = "#154194";
const BLUE2 = "#0f3070";
const DARK  = "#0d1b2a";
const GREEN = "#16a34a";
const F     = "'IBM Plex Sans', Arial, sans-serif";

interface Contract {
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
  myFee:          { type: string; rate: string; amount: string; status: string } | null;
  createdAt:      string;
}

interface Lot {
  id:          string;
  startPrice:  string;
  currentBest: string | null;
  co2PerTonne: string | null;
  quantity:    string;
}

interface Enriched {
  contract:    Contract;
  lot:         Lot | null;
  savings:     number;
  co2Exposure: number;
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

const COMMODITY_LABELS: Record<string, string> = {
  REBAR_B500B: "Betonstahl B500B",
  WIRE_ROD:   "Walzdraht",
  HRC:        "Warmbreitband",
  PLATE:      "Grobblech",
};
const commodityLabel = (c: string) => COMMODITY_LABELS[c] ?? c.replace(/_/g, " ");

export function PortfolioClient() {
  const router = useRouter();
  const [token,    setToken]    = useState("");
  const [data,     setData]     = useState<Enriched[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [exporting,setExporting]= useState(false);
  const [filter,   setFilter]   = useState<"all" | string>("all");

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const hdrs = { Authorization: `Bearer ${token}` };

      const [cRes, lRes] = await Promise.all([
        fetch("/api/auction/contracts", { headers: hdrs }),
        fetch("/api/auction/lots?mine=true&phase=CONCLUSION", { headers: hdrs }),
      ]);

      const cJson = (await cRes.json()) as { contracts?: Contract[] };
      const lJson = (await lRes.json()) as { lots?: Lot[] };

      const contracts = cJson.contracts ?? [];
      const lotsMap   = new Map<string, Lot>((lJson.lots ?? []).map((l) => [l.id, l]));

      const enriched: Enriched[] = contracts.map((c) => {
        const lot = lotsMap.get(c.lotId) ?? null;
        const qty = Number(c.quantity);
        const sp  = lot ? Number(lot.startPrice) : 0;
        const fp  = Number(c.finalPrice);
        const co2 = lot?.co2PerTonne ? Number(lot.co2PerTonne) * qty : 0;
        return {
          contract:    c,
          lot,
          savings:     Math.max(0, (sp - fp) * qty),
          co2Exposure: co2,
        };
      });

      setData(enriched);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function exportCsv() {
    setExporting(true);
    try {
      const r = await fetch("/api/market/export?format=csv", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `eucx-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  }

  const commodities = [...new Set(data.map((d) => d.contract.commodity))];

  const filtered = filter === "all"
    ? data
    : data.filter((d) => d.contract.commodity === filter);

  const totalValue     = filtered.reduce((s, d) => s + Number(d.contract.totalValue), 0);
  const totalSavings   = filtered.reduce((s, d) => s + d.savings, 0);
  const totalCo2       = filtered.reduce((s, d) => s + d.co2Exposure, 0);
  const totalFees      = filtered.reduce((s, d) => s + Number(d.contract.myFee?.amount ?? 0), 0);
  const hasCo2         = filtered.some((d) => d.co2Exposure > 0);

  return (
    <>
      <style>{`
        .pf-root { font-family:${F}; min-height:100vh; background:#f7f9fc; color:${DARK}; }
        .pf-page { max-width:1100px; margin:0 auto; padding:36px 24px 80px; }

        /* Header row */
        .pf-hrow { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:8px; flex-wrap:wrap; }
        .pf-title { font-size:22px; font-weight:700; color:#111827; margin:0; }
        .pf-sub   { font-size:13px; color:#6b7280; margin:4px 0 24px; }

        /* KPI cards */
        .pf-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1px; background:#e5e7eb; border:1px solid #e5e7eb; margin-bottom:28px; }
        .pf-kpi  { background:#fff; padding:20px 20px 16px; }
        .pf-kpi-num   { font-size:26px; font-weight:700; color:${BLUE}; font-variant-numeric:tabular-nums; line-height:1; margin-bottom:6px; }
        .pf-kpi-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#9ca3af; }
        .pf-kpi-sub   { font-size:11.5px; color:#6b7280; margin-top:3px; }

        /* Filter bar */
        .pf-filter { display:flex; align-items:center; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
        .pf-filter-label { font-size:12px; color:#6b7280; margin-right:4px; }
        .pf-chip { padding:6px 14px; font-size:12px; font-family:${F}; border:1px solid #e5e7eb; background:#fff; cursor:pointer; transition:all .15s; color:#374151; }
        .pf-chip.active { background:${BLUE}; color:#fff; border-color:${BLUE}; font-weight:700; }
        .pf-chip:hover:not(.active) { border-color:${BLUE}; color:${BLUE}; }

        /* Table */
        .pf-table-wrap { overflow-x:auto; }
        .pf-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:12.5px; }
        .pf-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#9ca3af; border-bottom:2px solid ${BLUE}; white-space:nowrap; background:#fff; }
        .pf-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .pf-table tr:last-child td { border-bottom:none; }
        .pf-table tr:hover td { background:#fafafa; }
        .pf-table tfoot td { padding:12px 14px; font-weight:700; color:#111827; border-top:2px solid #e5e7eb; background:#f9fafb; font-size:13px; font-variant-numeric:tabular-nums; }

        /* Cells */
        .pf-contract { font-family:"IBM Plex Mono",monospace; font-size:11px; color:#6b7280; letter-spacing:.04em; }
        .pf-savings  { color:${GREEN}; font-weight:700; }
        .pf-fee      { font-size:11.5px; color:#9ca3af; }
        .pf-cbam-val { font-family:"IBM Plex Mono",monospace; font-size:12.5px; font-weight:700; color:#1e3a8a; }

        /* Actions */
        .pf-btn-export { padding:10px 18px; background:#fff; color:${BLUE}; font-size:12.5px; font-weight:700; border:1.5px solid ${BLUE}; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .pf-btn-export:hover:not(:disabled) { background:${BLUE}; color:#fff; }
        .pf-btn-export:disabled { opacity:.5; cursor:not-allowed; }

        /* Empty / loading */
        .pf-empty   { padding:72px 24px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .pf-loading { padding:56px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }

        /* CBAM Banner */
        .pf-cbam-banner { margin-top:24px; background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid ${BLUE}; padding:18px 22px; }
        .pf-cbam-title  { font-size:13px; font-weight:700; color:#1e3a8a; margin-bottom:6px; }
        .pf-cbam-text   { font-size:12px; color:#3b82f6; line-height:1.65; }
        .pf-cbam-grid   { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; margin-top:14px; }
        .pf-cbam-item   { background:#fff; border:1px solid #bfdbfe; padding:14px 16px; }
        .pf-cbam-num    { font-size:20px; font-weight:700; color:#1e3a8a; font-variant-numeric:tabular-nums; font-family:"IBM Plex Mono",monospace; }
        .pf-cbam-lbl    { font-size:11px; color:#6b7280; margin-top:3px; }
      `}</style>

      <div className="pf-root">
        <EucxHeader />

        <div className="pf-page">

          {/* Header */}
          <div className="pf-hrow">
            <div>
              <h1 className="pf-title">Käufer-Portfolio</h1>
              <p className="pf-sub">Überblick über Ihre abgeschlossenen Einkäufe, Kosteneinsparungen und CO₂-Exposition</p>
            </div>
            <button
              className="pf-btn-export"
              disabled={exporting || data.length === 0}
              onClick={() => void exportCsv()}
            >
              {exporting ? "Wird exportiert…" : "CSV exportieren"}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="pf-kpis">
            <div className="pf-kpi" style={{ borderTop: `3px solid ${BLUE}` }}>
              <div className="pf-kpi-num">{filtered.length}</div>
              <div className="pf-kpi-label">Abschlüsse gesamt</div>
              <div className="pf-kpi-sub">vollständig abgewickelt</div>
            </div>
            <div className="pf-kpi" style={{ borderTop: `3px solid ${BLUE}` }}>
              <div className="pf-kpi-num" style={{ fontSize: totalValue > 999999 ? 20 : 26 }}>
                {fmtEur(totalValue)}
              </div>
              <div className="pf-kpi-label">Gesamtvolumen</div>
              <div className="pf-kpi-sub">inkl. aller Positionen</div>
            </div>
            <div className="pf-kpi" style={{ borderTop: `3px solid ${GREEN}` }}>
              <div className="pf-kpi-num" style={{ color: GREEN, fontSize: totalSavings > 999999 ? 20 : 26 }}>
                {totalSavings > 0 ? `−${fmtEur(totalSavings)}` : "—"}
              </div>
              <div className="pf-kpi-label">Einsparung ggü. Startpreis</div>
              <div className="pf-kpi-sub">vs. ursprünglicher Ausschreibungspreis</div>
            </div>
            <div className="pf-kpi" style={{ borderTop: `3px solid #e5e7eb` }}>
              <div className="pf-kpi-num" style={{ color: "#374151", fontSize: 20 }}>
                {totalFees > 0 ? fmtEur(totalFees) : "—"}
              </div>
              <div className="pf-kpi-label">EUCX-Gebühren</div>
              <div className="pf-kpi-sub">Transaktionsgebühren gesamt</div>
            </div>
            {hasCo2 && (
              <div className="pf-kpi" style={{ borderTop: `3px solid #3b82f6` }}>
                <div className="pf-kpi-num" style={{ color: "#1e3a8a", fontSize: 22 }}>
                  {totalCo2.toLocaleString("de-DE", { maximumFractionDigits: 1 })} t
                </div>
                <div className="pf-kpi-label">CO₂-Exposition</div>
                <div className="pf-kpi-sub">Gesamte CO₂-Tonnage (CBAM)</div>
              </div>
            )}
          </div>

          {/* Filter-Chips */}
          {commodities.length > 1 && (
            <div className="pf-filter">
              <span className="pf-filter-label">Filter:</span>
              <button
                className={`pf-chip${filter === "all" ? " active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Alle ({data.length})
              </button>
              {commodities.map((c) => {
                const count = data.filter((d) => d.contract.commodity === c).length;
                return (
                  <button
                    key={c}
                    className={`pf-chip${filter === c ? " active" : ""}`}
                    onClick={() => setFilter(c)}
                  >
                    {commodityLabel(c)} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="pf-loading">Portfolio wird geladen…</div>
          ) : filtered.length === 0 ? (
            <div className="pf-empty">
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              Noch keine abgeschlossenen Käufe vorhanden.
              <div style={{ marginTop: 8, fontSize: 12, color: "#d1d5db" }}>
                Abgeschlossene Handelssitzungen erscheinen hier automatisch nach Vertragsunterzeichnung.
              </div>
            </div>
          ) : (
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Vertragsnr.</th>
                    <th>Ware</th>
                    <th style={{ textAlign: "right" }}>Menge</th>
                    <th style={{ textAlign: "right" }}>Finalpreis / t</th>
                    <th style={{ textAlign: "right" }}>Gesamtwert</th>
                    <th style={{ textAlign: "right" }}>Einsparung</th>
                    <th style={{ textAlign: "right" }}>EUCX-Gebühr</th>
                    {hasCo2 && <th style={{ textAlign: "right" }}>CO₂-Tonnen</th>}
                    <th>Verkäufer</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ contract: c, savings, co2Exposure }) => (
                    <tr key={c.id}>
                      <td>
                        <div className="pf-contract">{c.contractNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{commodityLabel(c.commodity)}</div>
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                        {Number(c.quantity).toLocaleString("de-DE")} {c.unit}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {fmtEur(Number(c.finalPrice))}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                        {fmtEur(Number(c.totalValue))}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {savings > 0 ? (
                          <span className="pf-savings">−{fmtEur(savings)}</span>
                        ) : (
                          <span style={{ color: "#d1d5db" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {c.myFee ? (
                          <span className="pf-fee">{fmtEur(Number(c.myFee.amount))}</span>
                        ) : (
                          <span style={{ color: "#d1d5db" }}>—</span>
                        )}
                      </td>
                      {hasCo2 && (
                        <td style={{ textAlign: "right" }}>
                          {co2Exposure > 0 ? (
                            <span className="pf-cbam-val">
                              {co2Exposure.toLocaleString("de-DE", { maximumFractionDigits: 1 })} t
                            </span>
                          ) : (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          )}
                        </td>
                      )}
                      <td style={{ color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.sellerName}
                      </td>
                      <td style={{ color: "#9ca3af", whiteSpace: "nowrap" }}>
                        {fmtDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Summenzeile */}
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ color: "#6b7280", fontSize: 11.5, fontWeight: 400 }}>
                      {filtered.length} Abschlüsse
                    </td>
                    <td style={{ textAlign: "right" }} />
                    <td style={{ textAlign: "right" }} />
                    <td style={{ textAlign: "right", color: BLUE }}>{fmtEur(totalValue)}</td>
                    <td style={{ textAlign: "right", color: GREEN }}>{totalSavings > 0 ? `−${fmtEur(totalSavings)}` : "—"}</td>
                    <td style={{ textAlign: "right", color: "#374151" }}>{totalFees > 0 ? fmtEur(totalFees) : "—"}</td>
                    {hasCo2 && (
                      <td style={{ textAlign: "right", color: "#1e3a8a" }}>
                        {totalCo2.toLocaleString("de-DE", { maximumFractionDigits: 1 })} t
                      </td>
                    )}
                    <td />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* CBAM-Infobox */}
          {!loading && hasCo2 && (
            <div className="pf-cbam-banner">
              <div className="pf-cbam-title">EU-CBAM — CO₂-Zertifikatskosten (Schätzung)</div>
              <p className="pf-cbam-text">
                Für CBAM-pflichtige Waren (EU-Verordnung 2023/956) sind CO₂-Zertifikate erforderlich.
                Die Schätzung basiert auf dem aktuellen EU-ETS-Referenzpreis von <strong>75 €/t CO₂</strong>.
              </p>
              <div className="pf-cbam-grid">
                <div className="pf-cbam-item">
                  <div className="pf-cbam-num">
                    ~{fmtEur(totalCo2 * 75)}
                  </div>
                  <div className="pf-cbam-lbl">Geschätzte Zertifikatkosten gesamt</div>
                </div>
                <div className="pf-cbam-item">
                  <div className="pf-cbam-num">
                    {totalCo2.toLocaleString("de-DE", { maximumFractionDigits: 2 })} t
                  </div>
                  <div className="pf-cbam-lbl">CO₂ insgesamt (CBAM-pflichtig)</div>
                </div>
                <div className="pf-cbam-item">
                  <div className="pf-cbam-num">75 €</div>
                  <div className="pf-cbam-lbl">Referenzpreis EU-ETS / Tonne CO₂</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#93c5fd", marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
                Hinweis: Diese Berechnung ist unverbindlich. Maßgebend sind die offiziellen
                EU-ETS-Preise zum Zeitpunkt der Einfuhr. Bitte konsultieren Sie Ihren Zollberater.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
