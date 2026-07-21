"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const A = "#d97706";

type DeliveryStatus = "MATCHED" | "AWAITING_PAYMENT" | "READY_FOR_PICKUP" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED";

interface Delivery {
  id:             string;
  lotId:          string;
  contractNumber: string;
  totalValue:     string;
  deliveryStatus: DeliveryStatus;
  pickupCode:     string | null;
  cmrUploadedAt:  string | null;
  paymentSentAt:  string | null;
  deliveredAt:    string | null;
  updatedAt:      string;
  buyer: {
    organization: { name: string; city: string } | null;
  } | null;
  lot: {
    commodity:  string;
    quantity:   string;
    unit:       string;
    incoterms:  string | null;
  } | null;
}

const STEPS: { key: DeliveryStatus; label: string; hint: string }[] = [
  { key: "MATCHED",           label: "Vertrag generiert",    hint: "Kaufvertrag automatisch nach Auktionsabschluss" },
  { key: "AWAITING_PAYMENT", label: "Zahlung ausstehend",   hint: "Käufer überweist — meldet Zahlung angewiesen, dann Verkäufer bestätigt Eingang" },
  { key: "READY_FOR_PICKUP", label: "Bereit zur Abholung",  hint: "Abholcode aktiv, Ware bereit für Spediteur" },
  { key: "IN_TRANSIT",       label: "In Transport",          hint: "CMR hochgeladen — Wareneingang wird vom Käufer bestätigt" },
  { key: "DELIVERED",        label: "Geliefert",             hint: "Empfangsbestätigung durch Käufer erfolgt" },
  { key: "COMPLETED",        label: "Abgeschlossen",         hint: "CBAM-Zollquittung exportieren und Vorgang abschließen" },
];

const STATUS_IDX: Record<DeliveryStatus, number> = {
  MATCHED: 0, AWAITING_PAYMENT: 1, READY_FOR_PICKUP: 2, IN_TRANSIT: 3, DELIVERED: 4, COMPLETED: 5,
};

const NEXT_STATUS: Record<DeliveryStatus, DeliveryStatus | null> = {
  MATCHED:           "AWAITING_PAYMENT",
  AWAITING_PAYMENT:  "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "IN_TRANSIT",
  IN_TRANSIT:       "DELIVERED",
  DELIVERED:        "COMPLETED",
  COMPLETED:        null,
};

const fmtEur = (v: string) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

export function SellerLogisticsClient() {
  const router   = useRouter();
  const [token,     setToken]     = useState("");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch("/api/seller/deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json() as Delivery[];
        setDeliveries(data);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const sel = deliveries.find((d) => d.id === selected);

  async function advanceStatus(delivery: Delivery) {
    const next = NEXT_STATUS[delivery.deliveryStatus];
    if (!next) return;
    // CMR-Upload via separaten Button; DELIVERED nur über Käufer-Bestätigung
    if (next === "IN_TRANSIT" || next === "DELIVERED") return;
    setAdvancing(true);
    setError("");
    try {
      const r = await fetch(`/api/auction/lots/${delivery.lotId}/delivery`, {
        method:  "PATCH",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: next }),
      });
      if (r.ok) {
        await load();
      } else {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "Fehler beim Statuswechsel.");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setAdvancing(false);
    }
  }

  async function uploadCmr(lotId: string) {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await fetch(`/api/auction/lots/${lotId}/cmr-upload`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      if (r.ok) {
        if (fileRef.current) fileRef.current.value = "";
        await load();
      } else {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "Fehler beim CMR-Upload.");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setUploading(false);
    }
  }

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
        .log-layout { display:grid; grid-template-columns:1fr 360px; gap:20px; }
        @media(max-width:768px){ .log-layout { grid-template-columns:1fr; } }
        .log-table-wrap { overflow-x:auto; }
        .log-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .log-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; border-bottom:2px solid ${A}; white-space:nowrap; }
        .log-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; cursor:pointer; }
        .log-table tr:last-child td { border-bottom:none; }
        .log-table tr:hover td { background:#fffbf5; }
        .log-table tr.selected td { background:#fffbeb; }
        .log-status { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; color:#fff; white-space:nowrap; }
        .log-detail { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:20px; position:sticky; top:20px; }
        .log-detail-title { font-size:13px; font-weight:700; color:#111827; margin-bottom:16px; }
        .log-step { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
        .log-step-dot { width:20px; height:20px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-top:1px; }
        .log-step-dot.done    { background:${A}; color:#fff; }
        .log-step-dot.current { background:#154194; color:#fff; }
        .log-step-dot.future  { background:#e5e7eb; color:#9ca3af; }
        .log-step-body { flex:1; }
        .log-step-label { font-size:13px; font-weight:600; color:#111827; }
        .log-step-label.future { color:#9ca3af; font-weight:400; }
        .log-step-hint { font-size:11px; color:#6b7280; margin-top:2px; }
        .log-connector { width:2px; height:14px; margin-left:9px; }
        .log-connector.done   { background:${A}; }
        .log-connector.future { background:#e5e7eb; }
        .log-meta { margin-top:16px; padding-top:16px; border-top:1px solid #f3f4f6; }
        .log-meta-row { display:flex; justify-content:space-between; padding:6px 0; font-size:12.5px; }
        .log-meta-label { color:#6b7280; }
        .log-meta-val { font-weight:600; color:#111827; }
        .log-btn { display:block; text-align:center; margin-top:12px; padding:9px; font-size:12.5px; font-weight:700; border:none; cursor:pointer; width:100%; transition:background .15s; }
        .log-btn-primary { background:${A}; color:#fff; }
        .log-btn-primary:hover { background:#b45309; }
        .log-btn-primary:disabled { background:#d1d5db; cursor:not-allowed; }
        .log-btn-outline { background:#fff; color:#374151; border:1px solid #d1d5db; margin-top:8px; }
        .log-btn-outline:hover { background:#f9fafb; }
        .log-empty-detail { color:#9ca3af; font-size:12.5px; padding:20px; text-align:center; }
        .log-pickup-box { background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; margin-top:12px; text-align:center; }
        .log-pickup-code { font-family:"IBM Plex Mono",monospace; font-size:28px; font-weight:700; color:#16a34a; letter-spacing:.15em; }
        .log-pickup-label { font-size:10.5px; color:#6b7280; margin-top:4px; font-weight:600; text-transform:uppercase; }
        .log-cmr-section { margin-top:14px; padding:14px; background:#f8f9fa; border:1px solid #e5e7eb; }
        .log-cmr-title { font-size:12px; font-weight:700; color:#374151; margin-bottom:8px; }
        .log-file-input { width:100%; font-size:12px; margin-bottom:8px; }
        .log-err { background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; margin-bottom:14px; font-size:12.5px; color:#dc2626; }
        .log-empty { padding:40px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .log-loading { padding:40px; text-align:center; color:#9ca3af; font-size:13px; }
      `}</style>

      <div className="log">
        <EucxHeader />
        <div className="log-stripe">
          <div className="log-stripe-inner">
            <span className="log-badge">LOGISTIK</span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)" }}>
              Lieferungen verfolgen · Incoterms · CBAM-Zollquittung · CMR-Upload
            </span>
          </div>
        </div>

        <div className="log-page">
          <div className="log-title">Liefer-Cockpit</div>
          <div className="log-sub">
            Vertrag generiert → Zahlung → Abholung → Transport → Lieferung → Abschluss
          </div>

          {error && <div className="log-err">{error}</div>}

          <div className="log-layout">
            {/* Tabelle */}
            <div>
              {loading ? (
                <div className="log-loading">Lieferungen werden geladen…</div>
              ) : deliveries.length === 0 ? (
                <div className="log-empty">
                  Noch keine abgeschlossenen Kontrakte. Sobald eine Auktion endet und Sie gewonnen haben, erscheinen die Lieferungen hier.
                </div>
              ) : (
                <div className="log-table-wrap">
                  <table className="log-table">
                    <thead>
                      <tr>
                        <th>Kontrakt</th>
                        <th>Ware</th>
                        <th>Käufer / Ort</th>
                        <th>Wert</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((d) => {
                        const idx    = STATUS_IDX[d.deliveryStatus];
                        const colors = ["#6b7280", "#154194", "#d97706", "#2563eb", "#16a34a", "#9333ea"];
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
                              <div style={{ fontWeight: 600 }}>{d.lot?.commodity ?? "—"}</div>
                              <div style={{ fontSize: 11.5, color: "#6b7280" }}>
                                {d.lot?.quantity ? parseFloat(d.lot.quantity).toLocaleString("de-DE") : "—"} {d.lot?.unit ?? ""} · {d.lot?.incoterms ?? "—"}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12.5 }}>{d.buyer?.organization?.name ?? "—"}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.buyer?.organization?.city ?? "—"}</div>
                            </td>
                            <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
                              {fmtEur(d.totalValue)}
                            </td>
                            <td>
                              <span className="log-status eucx-badge" style={{ background: colors[idx] ?? "#6b7280" }}>
                                {STEPS[idx]?.label ?? d.deliveryStatus}
                              </span>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <a
                                href={`/dashboard/contracts/${d.id}`}
                                style={{ fontSize: 11.5, fontWeight: 700, color: "#154194", textDecoration: "none", whiteSpace: "nowrap" }}
                              >
                                Details →
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

            {/* Detail-Panel */}
            <div className="log-detail">
              {!sel ? (
                <div className="log-empty-detail">
                  Lieferung aus der Tabelle auswählen um den Status-Tracker anzuzeigen.
                </div>
              ) : (
                <>
                  <div className="log-detail-title">{sel.lot?.commodity ?? "Lieferung"}</div>

                  {/* Stepper */}
                  {STEPS.map((step, i) => {
                    const current   = STATUS_IDX[sel.deliveryStatus];
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

                  {/* Abholcode-Box */}
                  {sel.pickupCode && (
                    <div className="log-pickup-box">
                      <div className="log-pickup-code">{sel.pickupCode}</div>
                      <div className="log-pickup-label">Abholcode — für Käufer sichtbar</div>
                    </div>
                  )}

                  {/* CMR-Upload-Bereich */}
                  {(sel.deliveryStatus === "READY_FOR_PICKUP" || sel.deliveryStatus === "IN_TRANSIT") && (
                    <div className="log-cmr-section">
                      <div className="log-cmr-title">
                        {sel.cmrUploadedAt ? `CMR hochgeladen (${fmtDate(sel.cmrUploadedAt)})` : "CMR-Frachtbrief hochladen"}
                      </div>
                      {!sel.cmrUploadedAt && (
                        <>
                          <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,image/jpeg,image/png"
                            className="log-file-input"
                          />
                          <button
                            className="log-btn log-btn-primary"
                            disabled={uploading}
                            onClick={() => void uploadCmr(sel.lotId)}
                          >
                            {uploading ? "Wird hochgeladen…" : "CMR hochladen → IN_TRANSIT"}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Zahlungsstatus-Hinweis für AWAITING_PAYMENT */}
                  {sel.deliveryStatus === "AWAITING_PAYMENT" && (
                    <div style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: sel.paymentSentAt ? "#f0fdf4" : "#fffbeb",
                      border: `1px solid ${sel.paymentSentAt ? "#bbf7d0" : "#fde68a"}`,
                      fontSize: 12,
                      color: sel.paymentSentAt ? "#14532d" : "#92400e",
                    }}>
                      {sel.paymentSentAt
                        ? `Käufer hat Zahlung gemeldet: ${fmtDate(sel.paymentSentAt)}`
                        : "Warten auf Zahlungsmeldung des Käufers…"}
                    </div>
                  )}

                  {/* Nächster Status Button */}
                  {(() => {
                    const next = NEXT_STATUS[sel.deliveryStatus];
                    // IN_TRANSIT via CMR-Upload; DELIVERED nur über Käufer
                    if (!next || next === "IN_TRANSIT" || next === "DELIVERED") return null;
                    // READY_FOR_PICKUP nur freischalten wenn Käufer Zahlung gemeldet hat
                    const waitingForPayment = next === "READY_FOR_PICKUP" && !sel.paymentSentAt;
                    const label = sel.deliveryStatus === "MATCHED"
                      ? "Zahlung einfordern →"
                      : sel.deliveryStatus === "AWAITING_PAYMENT"
                        ? "Zahlungseingang bestätigen →"
                        : sel.deliveryStatus === "DELIVERED"
                          ? "Abschluss bestätigen →"
                          : `→ ${STEPS[STATUS_IDX[next]]?.label ?? next}`;
                    return (
                      <button
                        className="log-btn log-btn-primary"
                        disabled={advancing || waitingForPayment}
                        onClick={() => void advanceStatus(sel)}
                        style={{ marginTop: 14 }}
                        title={waitingForPayment ? "Käufer muss zuerst Zahlung melden" : undefined}
                      >
                        {advancing ? "Wird aktualisiert…" : label}
                      </button>
                    );
                  })()}

                  {/* Meta */}
                  <div className="log-meta">
                    {[
                      ["Kontrakt",    sel.contractNumber],
                      ["Käufer",      sel.buyer?.organization?.name ?? "—"],
                      ["Lieferort",   sel.buyer?.organization?.city ?? "—"],
                      ["Incoterms",   sel.lot?.incoterms ?? "—"],
                      ["Menge",       sel.lot ? `${parseFloat(sel.lot.quantity).toLocaleString("de-DE")} ${sel.lot.unit}` : "—"],
                      ["Gesamtwert",  fmtEur(sel.totalValue)],
                      ["Aktualisiert", fmtDate(sel.updatedAt)],
                    ].map(([l, v]) => (
                      <div className="log-meta-row" key={l}>
                        <span className="log-meta-label">{l}</span>
                        <span className="log-meta-val" style={{
                          fontFamily: l === "Kontrakt" || l === "Incoterms" ? "'IBM Plex Mono',monospace" : "inherit",
                          fontSize:   l === "Kontrakt" ? 11 : 13,
                        }}>
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(sel.deliveryStatus === "DELIVERED" || sel.deliveryStatus === "COMPLETED") && (
                    <button
                      className="log-btn log-btn-outline"
                      onClick={() => window.open(`/api/auction/lots/${sel.lotId}/cbam-export?token=${token}`, "_blank")}
                    >
                      CBAM-Zollquittung exportieren →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
