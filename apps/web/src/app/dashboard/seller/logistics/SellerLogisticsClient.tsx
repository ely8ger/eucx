"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const A = "#d97706";

// Status-Stufen (Incoterms-basiert)
type DeliveryStatus = "VERTRAG_SIGNIERT" | "BEREIT_ABHOLUNG" | "IN_TRANSPORT" | "GELIEFERT" | "ABGESCHLOSSEN";

interface Delivery {
  id:              string;
  contractNumber:  string;
  commodity:       string;
  quantity:        string;
  unit:            string;
  incoterms:       string;
  buyerOrg:        string;
  destination:     string;
  status:          DeliveryStatus;
  updatedAt:       string;
  totalValue:      string;
}

const DEMO_DELIVERIES: Delivery[] = [
  {
    id: "DEL-001",
    contractNumber: "EUCX-LOT-2026-000001",
    commodity: "Betonstahl BST 500S — 12mm",
    quantity: "250",
    unit: "TON",
    incoterms: "DAP",
    buyerOrg: "Musterbau AG",
    destination: "Frankfurt am Main",
    status: "IN_TRANSPORT",
    updatedAt: "2026-07-04T10:30:00Z",
    totalValue: "2375000",
  },
  {
    id: "DEL-002",
    contractNumber: "EUCX-LOT-2026-000002",
    commodity: "Walzdraht 6,5mm",
    quantity: "150",
    unit: "TON",
    incoterms: "FCA",
    buyerOrg: "DrahtTech GmbH",
    destination: "Hamburg",
    status: "BEREIT_ABHOLUNG",
    updatedAt: "2026-07-03T14:00:00Z",
    totalValue: "1230000",
  },
  {
    id: "DEL-003",
    contractNumber: "EUCX-LOT-2026-000003",
    commodity: "Betonstahl BST 500S — 16mm",
    quantity: "320",
    unit: "TON",
    incoterms: "DAP",
    buyerOrg: "Stadtwerke Köln",
    destination: "Köln",
    status: "ABGESCHLOSSEN",
    updatedAt: "2026-06-28T09:00:00Z",
    totalValue: "3040000",
  },
];

const STEPS: { key: DeliveryStatus; label: string; hint: string }[] = [
  { key: "VERTRAG_SIGNIERT",  label: "Vertrag signiert",      hint: "Kaufvertrag beidseitig unterzeichnet" },
  { key: "BEREIT_ABHOLUNG",  label: "Bereit zur Abholung",   hint: "Ware bereit im Lager / am Werk" },
  { key: "IN_TRANSPORT",     label: "In Transport",           hint: "Ware unterwegs — Lieferschein aktiv" },
  { key: "GELIEFERT",        label: "Geliefert",              hint: "Empfangsbestätigung beim Käufer" },
  { key: "ABGESCHLOSSEN",    label: "Abgeschlossen",          hint: "CBAM-Zollquittung erhalten, Rechnung bezahlt" },
];

const STATUS_IDX: Record<DeliveryStatus, number> = {
  VERTRAG_SIGNIERT: 0, BEREIT_ABHOLUNG: 1, IN_TRANSPORT: 2, GELIEFERT: 3, ABGESCHLOSSEN: 4,
};

const fmtEur = (v: string) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

export function SellerLogisticsClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) router.replace("/login");
  }, [router]);

  const sel = DEMO_DELIVERIES.find((d) => d.id === selected);

  return (
    <>
      <style>{`
        .log { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }
        .log-stripe { background:linear-gradient(90deg,#78350f,#92400e); border-bottom:1px solid #b45309; height:36px; padding:0 28px; display:flex; align-items:center; }
        .log-stripe-inner { max-width:1100px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .log-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; background:rgba(255,255,255,.12); padding:3px 10px; }
        .log-page { max-width:1100px; margin:0 auto; padding:28px 24px 80px; }
        .log-title { font-size:20px; font-weight:700; color:#111827; margin-bottom:4px; }
        .log-sub { font-size:12.5px; color:#6b7280; margin-bottom:24px; }
        .log-layout { display:grid; grid-template-columns:1fr 340px; gap:20px; }
        @media(max-width:768px){ .log-layout { grid-template-columns:1fr; } }
        .log-table-wrap { overflow-x:auto; }
        .log-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .log-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; border-bottom:2px solid ${A}; white-space:nowrap; }
        .log-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; cursor:pointer; }
        .log-table tr:last-child td { border-bottom:none; }
        .log-table tr:hover td { background:#fffbf5; }
        .log-table tr.selected td { background:#fffbeb; }
        .log-status { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; color:#fff; }
        .log-detail { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:20px; position:sticky; top:20px; }
        .log-detail-title { font-size:13px; font-weight:700; color:#111827; margin-bottom:16px; }
        .log-step { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
        .log-step-dot { width:20px; height:20px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-top:1px; }
        .log-step-dot.done { background:${A}; color:#fff; }
        .log-step-dot.current { background:#154194; color:#fff; }
        .log-step-dot.future { background:#e5e7eb; color:#9ca3af; }
        .log-step-body { flex:1; }
        .log-step-label { font-size:13px; font-weight:600; color:#111827; }
        .log-step-label.future { color:#9ca3af; font-weight:400; }
        .log-step-hint { font-size:11px; color:#6b7280; margin-top:2px; }
        .log-connector { width:2px; height:14px; margin-left:9px; }
        .log-connector.done { background:${A}; }
        .log-connector.future { background:#e5e7eb; }
        .log-meta { margin-top:16px; padding-top:16px; border-top:1px solid #f3f4f6; }
        .log-meta-row { display:flex; justify-content:space-between; padding:6px 0; font-size:12.5px; }
        .log-meta-label { color:#6b7280; }
        .log-meta-val { font-weight:600; color:#111827; }
        .log-cbam-btn { display:block; text-align:center; margin-top:14px; padding:9px; background:${A}; color:#fff; font-size:12.5px; font-weight:700; border:none; cursor:pointer; width:100%; transition:background .15s; }
        .log-cbam-btn:hover { background:#b45309; }
        .log-empty-detail { color:#9ca3af; font-size:12.5px; padding:20px; text-align:center; }
      `}</style>

      <div className="log">
        <EucxHeader />
        <div className="log-stripe">
          <div className="log-stripe-inner">
            <span className="log-badge">LOGISTIK</span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)" }}>
              Lieferungen verfolgen · Incoterms · CBAM-Zollquittung
            </span>
          </div>
        </div>

        <div className="log-page">
          <div className="log-title">Liefer-Cockpit</div>
          <div className="log-sub">
            Vertrag signiert → Abholung → Transport → Lieferung → Zollabschluss
          </div>

          <div className="log-layout">
            {/* Tabelle */}
            <div>
              <div className="log-table-wrap">
                <table className="log-table">
                  <thead>
                    <tr>
                      <th>Kontrakt</th>
                      <th>Ware</th>
                      <th>Käufer / Ziel</th>
                      <th>Wert</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_DELIVERIES.map((d) => {
                      const idx = STATUS_IDX[d.status];
                      const colors = ["#6b7280", "#d97706", "#2563eb", "#16a34a", "#154194"];
                      return (
                        <tr
                          key={d.id}
                          className={selected === d.id ? "selected" : ""}
                          onClick={() => setSelected(d.id === selected ? null : d.id)}
                        >
                          <td>
                            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9ca3af" }}>
                              {d.contractNumber}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{d.commodity}</div>
                            <div style={{ fontSize: 11.5, color: "#6b7280" }}>
                              {d.quantity} {d.unit} · {d.incoterms}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12.5 }}>{d.buyerOrg}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.destination}</div>
                          </td>
                          <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
                            {fmtEur(d.totalValue)}
                          </td>
                          <td>
                            <span className="log-status" style={{ background: colors[idx] ?? "#6b7280" }}>
                              {STEPS[idx]?.label ?? d.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail-Panel */}
            <div className="log-detail">
              {!sel ? (
                <div className="log-empty-detail">
                  Lieferung aus der Tabelle auswählen um den Status-Tracker anzuzeigen.
                </div>
              ) : (
                <>
                  <div className="log-detail-title">{sel.commodity}</div>

                  {/* Stepper */}
                  {STEPS.map((step, i) => {
                    const current = STATUS_IDX[sel.status];
                    const isDone    = i < current;
                    const isCurrent = i === current;
                    const isFuture  = i > current;
                    return (
                      <div key={step.key}>
                        <div className="log-step">
                          <div className={`log-step-dot ${isDone ? "done" : isCurrent ? "current" : "future"}`}>
                            {isDone ? "✓" : i + 1}
                          </div>
                          <div className="log-step-body">
                            <div className={`log-step-label ${isFuture ? "future" : ""}`}>{step.label}</div>
                            <div className="log-step-hint">{step.hint}</div>
                          </div>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`log-connector ${isDone ? "done" : "future"}`} />
                        )}
                      </div>
                    );
                  })}

                  {/* Meta */}
                  <div className="log-meta">
                    {[
                      ["Kontrakt", sel.contractNumber],
                      ["Käufer", sel.buyerOrg],
                      ["Lieferziel", sel.destination],
                      ["Incoterms", sel.incoterms],
                      ["Menge", `${sel.quantity} ${sel.unit}`],
                      ["Gesamtwert", fmtEur(sel.totalValue)],
                      ["Aktualisiert", fmtDate(sel.updatedAt)],
                    ].map(([l, v]) => (
                      <div className="log-meta-row" key={l}>
                        <span className="log-meta-label">{l}</span>
                        <span className="log-meta-val" style={{ fontFamily: l === "Kontrakt" || l === "Incoterms" ? "'IBM Plex Mono',monospace" : "inherit", fontSize: l === "Kontrakt" ? 11 : 13 }}>
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>

                  {sel.status === "GELIEFERT" || sel.status === "ABGESCHLOSSEN" ? (
                    <button className="log-cbam-btn">
                      CBAM-Zollquittung exportieren →
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
