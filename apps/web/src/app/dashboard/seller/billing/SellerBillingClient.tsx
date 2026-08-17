"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const A  = "#d97706";
const A2 = "#b45309";

interface Contract {
  id:             string;
  contractNumber: string;
  commodity:      string;
  quantity:       string;
  unit:           string;
  totalValue:     string;
  feeAmount:      string;
  createdAt:      string;
  buyerOrg?:      string;
}

const fmtEur = (v: string | number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

const FEE_TIERS = [
  { min: 0,           max: 500_000,    rate: 0.012, label: "1,20 %" },
  { min: 500_000,     max: 2_000_000,  rate: 0.008, label: "0,80 %" },
  { min: 2_000_000,   max: 10_000_000, rate: 0.005, label: "0,50 %" },
  { min: 10_000_000,  max: Infinity,   rate: 0.003, label: "0,30 %" },
];

function getFeeRate(volume: number): number {
  return FEE_TIERS.find((t) => volume >= t.min && volume < t.max)?.rate ?? 0.003;
}

function getActiveTierIdx(volume: number): number {
  return FEE_TIERS.findIndex((t) => volume >= t.min && volume < t.max);
}

export function SellerBillingClient() {
  const router = useRouter();
  const [token,     setToken]     = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch("/api/seller/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        setContracts(d.recentContracts ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const totalRev  = contracts.reduce((s, c) => s + Number(c.totalValue), 0);
  const totalFees = contracts.reduce((s, c) => s + Number(c.feeAmount), 0);
  const totalNet  = totalRev - totalFees;

  // Demo-Ledger-Einträge (zeigt das Double-Entry-Prinzip)
  const ledger = contracts.flatMap((c) => [
    {
      date:  c.createdAt,
      desc:  `Umsatz - ${c.commodity} (${c.contractNumber})`,
      debit: Number(c.totalValue),
      credit: 0,
      type:  "revenue",
    },
    {
      date:  c.createdAt,
      desc:  `EUCX-Plattformgebühr (0,80%) - ${c.contractNumber}`,
      debit: 0,
      credit: Number(c.feeAmount),
      type:  "fee",
    },
  ]).concat(
    // Demo-Einträge wenn keine echten Kontrakte
    contracts.length === 0 ? (() => {
      const demoRev  = 3_040_000;
      const demoRate = getFeeRate(demoRev);
      const demoFee  = Math.round(demoRev * demoRate * 100) / 100;
      const demoPct  = (demoRate * 100).toFixed(2).replace(".", ",");
      return [
        { date: "2026-06-28T09:00:00Z", desc: "Umsatz - Betonstahl 320t (EUCX-LOT-2026-000001)", debit: demoRev, credit: 0, type: "revenue" },
        { date: "2026-06-28T09:00:00Z", desc: `EUCX-Plattformgebühr (${demoPct} %) - EUCX-LOT-2026-000001`, debit: 0, credit: demoFee, type: "fee" },
      ];
    })() : []
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const demoTotalRev  = ledger.filter((e) => e.type === "revenue").reduce((s, e) => s + e.debit, 0);
  const demoTotalFees = ledger.filter((e) => e.type === "fee").reduce((s, e) => s + e.credit, 0);
  const displayRev    = demoTotalRev || totalRev;
  const displayFees   = demoTotalFees || totalFees;
  const activeTierIdx = getActiveTierIdx(displayRev);

  return (
    <>
      <style>{`
        .bil { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }
        .bil-stripe { background:linear-gradient(90deg,#78350f,#92400e); border-bottom:1px solid #b45309; height:36px; padding:0 28px; display:flex; align-items:center; }
        .bil-stripe-inner { max-width:1100px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .bil-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; background:rgba(255,255,255,.12); padding:3px 10px; }
        .bil-page { max-width:1100px; margin:0 auto; padding:28px 24px 80px; }
        .bil-title { font-size:20px; font-weight:700; margin-bottom:4px; }
        .bil-sub { font-size:12.5px; color:#6b7280; margin-bottom:24px; }
        .bil-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
        @media(max-width:700px){.bil-kpi{grid-template-columns:1fr 1fr;}}
        .bil-kpi-card { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:16px 18px; }
        .bil-kpi-num { font-family:"IBM Plex Mono",monospace; font-size:20px; font-weight:700; line-height:1; }
        .bil-kpi-label { font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; font-weight:700; margin-top:5px; }
        .bil-section { margin-bottom:32px; }
        .bil-section-title { font-size:14px; font-weight:700; margin-bottom:14px; color:#111827; }
        .bil-ledger { background:#fff; border:1px solid #e5e7eb; }
        .bil-ledger-hd { display:grid; grid-template-columns:120px 1fr 170px 160px; gap:0; padding:10px 16px; border-bottom:2px solid ${A}; }
        .bil-ledger-hd span { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; }
        .bil-ledger-row { display:grid; grid-template-columns:120px 1fr 170px 160px; gap:0; padding:12px 16px; border-bottom:1px solid #f3f4f6; align-items:center; }
        .bil-ledger-row:last-child { border-bottom:none; }
        .bil-ledger-row:hover { background:#fffbf5; }
        .bil-ledger-date { font-size:12px; color:#6b7280; }
        .bil-ledger-desc { font-size:13px; color:#111827; }
        .bil-ledger-desc.fee { color:#6b7280; font-style:italic; }
        .bil-ledger-debit { font-family:"IBM Plex Mono",monospace; font-size:13px; font-weight:700; color:#16a34a; text-align:right; white-space:nowrap; }
        .bil-ledger-credit { font-family:"IBM Plex Mono",monospace; font-size:13px; font-weight:700; color:#dc2626; text-align:right; white-space:nowrap; padding-left:16px; border-left:1px solid #e5e7eb; }
        .bil-ledger-total { display:grid; grid-template-columns:120px 1fr 170px 160px; gap:0; padding:12px 16px; background:#f9fafb; border-top:2px solid #e5e7eb; font-weight:700; }
        .bil-vat-box { background:#fff; border:1px solid #e5e7eb; border-left:4px solid #154194; padding:20px 24px; margin-bottom:24px; }
        .bil-vat-title { font-size:13px; font-weight:700; color:#154194; margin-bottom:8px; }
        .bil-vat-text { font-size:12.5px; color:#374151; line-height:1.6; }
        .bil-fee-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; margin-bottom:24px; }
        .bil-fee-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; border-bottom:2px solid ${A}; }
        .bil-fee-table td { padding:11px 14px; border-bottom:1px solid #f3f4f6; }
        .bil-fee-table tr:last-child td { border-bottom:none; }
        .bil-cbam-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:${A}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; margin-top:12px; }
        .bil-cbam-btn:hover { background:${A2}; }
      `}</style>

      <div className="bil">
        <EucxHeader />
        <div className="bil-stripe">
          <div className="bil-stripe-inner">
            <span className="bil-badge">ABRECHNUNG</span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)" }}>
              Umsatz · Gebühren · EU Reverse Charge · CBAM-Reporting
            </span>
          </div>
        </div>

        <div className="bil-page">
          <div className="bil-title">Abrechnung & CBAM-Reporting</div>
          <div className="bil-sub">Transaktionsgebühren, Ledger und EU-Konformitäts-Export</div>

          {/* KPIs */}
          <div className="bil-kpi">
            <div className="bil-kpi-card">
              <div className="bil-kpi-num" style={{ color: "#16a34a" }}>
                {fmtEur(displayRev)}
              </div>
              <div className="bil-kpi-label">Brutto-Umsatz</div>
            </div>
            <div className="bil-kpi-card">
              <div className="bil-kpi-num" style={{ color: "#dc2626" }}>
                −{fmtEur(displayFees)}
              </div>
              <div className="bil-kpi-label">EUCX-Gebühren (netto)</div>
            </div>
            <div className="bil-kpi-card">
              <div className="bil-kpi-num" style={{ color: A }}>
                {fmtEur(displayRev - displayFees)}
              </div>
              <div className="bil-kpi-label">Netto-Erlös</div>
            </div>
            <div className="bil-kpi-card">
              <div className="bil-kpi-num">
                {ledger.filter((e) => e.type === "revenue").length}
              </div>
              <div className="bil-kpi-label">Transaktionen</div>
            </div>
          </div>

          {/* Gebühren-Staffel */}
          <div className="bil-section">
            <div className="bil-section-title">Gebührenstruktur (gestaffelt nach Volumen)</div>
            <table className="bil-fee-table">
              <thead>
                <tr>
                  <th>Monats-Handelsvolumen</th>
                  <th>Verkäufer-Gebühr</th>
                  <th>Ihr aktueller Satz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0 – 500.000 €",             "1,20 %", 0],
                  ["500.000 – 2.000.000 €",     "0,80 %", 1],
                  ["2.000.000 – 10.000.000 €",  "0,50 %", 2],
                  ["Über 10.000.000 €",          "0,30 %", 3],
                ].map(([range, rate, idx]) => {
                  const isActive = idx === activeTierIdx;
                  return (
                    <tr key={range as string} style={{ background: isActive ? "#fffbeb" : undefined }}>
                      <td style={{ color: "#374151" }}>{range}</td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>{rate}</td>
                      <td>
                        {isActive && (
                          <span style={{ display: "inline-block", padding: "2px 8px", background: A, color: "#fff", fontSize: 10.5, fontWeight: 700 }}>
                            Ihr Satz
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* EU Reverse Charge Hinweis */}
          <div className="bil-vat-box">
            <div className="bil-vat-title">EU Reverse Charge VAT - Automatisierte Netto-Rechnungsstellung</div>
            <div className="bil-vat-text">
              Da EUCX als B2B-Plattform ausschließlich umsatzsteuerlich registrierte Unternehmen zulässt
              (KYC-Pflicht mit USt-IdNr.), gilt bei grenzüberschreitenden EU-Transaktionen das
              <strong> Reverse-Charge-Verfahren</strong> (§ 13b UStG / Art. 196 MwStSystRL).
              Alle Rechnungen werden automatisch als Netto-Rechnungen mit dem Hinweis
              „Steuerschuldnerschaft des Leistungsempfängers" generiert.
              Die EUCX-Plattformgebühren unterliegen der deutschen Umsatzsteuer (19 %)
              und werden monatlich als Sammelrechnung ausgestellt.
            </div>
          </div>

          {/* Double-Entry Ledger */}
          <div className="bil-section">
            <div className="bil-section-title">Transaktions-Ledger</div>
            <div className="bil-ledger">
              <div className="bil-ledger-hd">
                <span>Datum</span>
                <span>Buchungstext</span>
                <span style={{ textAlign: "right" }}>Einnahme</span>
                <span style={{ textAlign: "right" }}>Gebühr</span>
              </div>
              {ledger.map((e, i) => (
                <div key={i} className="bil-ledger-row">
                  <span className="bil-ledger-date">{fmtDate(e.date)}</span>
                  <span className={`bil-ledger-desc ${e.type === "fee" ? "fee" : ""}`}>{e.desc}</span>
                  <span className="bil-ledger-debit">
                    {e.debit > 0 ? `+${fmtEur(e.debit)}` : ""}
                  </span>
                  <span className="bil-ledger-credit">
                    {e.credit > 0 ? `−${fmtEur(e.credit)}` : ""}
                  </span>
                </div>
              ))}
              <div className="bil-ledger-total">
                <span style={{ color: "#9ca3af", fontSize: 11 }}>Summe</span>
                <span />
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#16a34a", textAlign: "right" }}>
                  +{fmtEur(displayRev)}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#dc2626", textAlign: "right" }}>
                  −{fmtEur(displayFees)}
                </span>
              </div>
              <div className="bil-ledger-total" style={{ background: "#f0fdf4", borderTop: "2px solid #16a34a" }}>
                <span style={{ color: "#14532d", fontSize: 11, fontWeight: 700 }}>Netto-Erlös</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>nach Plattformgebühr (netto, ohne USt)</span>
                <span />
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#14532d", textAlign: "right", fontSize: 14, whiteSpace: "nowrap", paddingLeft: 16, borderLeft: "2px solid #16a34a" }}>
                  {fmtEur(displayRev - displayFees)}
                </span>
              </div>
            </div>
          </div>

          {/* CBAM-Report */}
          <div className="bil-section">
            <div className="bil-section-title">CBAM-Daten-Export (Jahreserklärung 2026)</div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "18px 22px" }}>
              <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, lineHeight: 1.6 }}>
                Seit 01.01.2026 gilt das definitive CBAM-Regime (EU-VO 2023/956).
                Die erste Jahreserklärung für das Referenzjahr 2026 ist bis 31.05.2027 über das{" "}
                <strong>CBAM-Register der EU-Kommission</strong> durch den autorisierten CBAM-Anmelder einzureichen.
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                Dieser Export enthält Ihre Transaktions- und Emissionsdaten (eingebettete CO₂-Emissionen pro Lot)
                zur internen Vorbereitung der CBAM-Erklärung. Die Datei ist kein offizielles Einreichungsformat.
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="bil-cbam-btn">
                  CBAM-Daten 2026 exportieren →
                </button>
                <button
                  style={{ padding: "10px 18px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", fontSize: 13, cursor: "pointer" }}
                  onClick={() => {}}
                >
                  Alle Perioden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
