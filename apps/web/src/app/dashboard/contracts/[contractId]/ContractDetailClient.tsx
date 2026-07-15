"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface ContractDetail {
  id:             string;
  contractNumber: string;
  lotId:          string;
  myRole:         "buyer" | "seller" | "admin";
  deliveryStatus: DeliveryStatus;
  pickupCode:     string | null;
  cmrUploadedAt:  string | null;
  paymentSentAt:  string | null;
  deliveredAt:    string | null;
  signedAtBuyer:  string | null;
  signedAtSeller: string | null;
  createdAt:      string;
  finalPrice:     string;
  totalValue:     string;
  lot: {
    id:               string;
    commodity:        string;
    quantity:         string;
    unit:             string;
    deliveryLocation: string | null;
    deliveryPeriod:   string | null;
    vatTreatment:     string | null;
    hsCode:           string | null;
    qualityGrade:     string | null;
    paymentTerms:     string | null;
    incoterms:        string | null;
    auctionEnd:       string | null;
  };
  counterparty: {
    id:      string;
    email:   string;
    name:    string;
    phone:   string | null;
    city:    string | null;
    country: string | null;
  };
  certificates: { has31: boolean; hasCbam: boolean };
  myFees: Array<{ type: string; rate: string; amount: string; status: string }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS: { key: DeliveryStatus; label: string; hint: string }[] = [
  { key: "MATCHED",           label: "Vertrag generiert",   hint: "Kaufvertrag automatisch nach Auktionsabschluss — beide Parteien können PDF herunterladen" },
  { key: "AWAITING_PAYMENT",  label: "Zahlung ausstehend",  hint: "Käufer überweist direkt an Verkäufer · Käufer meldet Zahlung angewiesen · Verkäufer bestätigt Eingang" },
  { key: "READY_FOR_PICKUP",  label: "Bereit zur Abholung", hint: "Abholcode aktiv — Verkäufer übergibt Code an Spediteur" },
  { key: "IN_TRANSIT",        label: "In Transport",        hint: "CMR hochgeladen · Käufer bestätigt Wareneingang bei Lieferung" },
  { key: "DELIVERED",         label: "Geliefert",           hint: "Empfangsbestätigung durch Käufer erfolgt — Verkäufer exportiert CBAM-Dokument" },
  { key: "COMPLETED",         label: "Abgeschlossen",       hint: "Vorgang vollständig abgeschlossen" },
];

const STATUS_IDX: Record<DeliveryStatus, number> = {
  MATCHED: 0, AWAITING_PAYMENT: 1, READY_FOR_PICKUP: 2, IN_TRANSIT: 3, DELIVERED: 4, COMPLETED: 5,
};

const NEXT_STATUS: Record<DeliveryStatus, DeliveryStatus | null> = {
  MATCHED:          "AWAITING_PAYMENT",
  AWAITING_PAYMENT: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "IN_TRANSIT",
  IN_TRANSIT:       "DELIVERED",
  DELIVERED:        "COMPLETED",
  COMPLETED:        null,
};

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  MATCHED:          "#6b7280",
  AWAITING_PAYMENT: "#154194",
  READY_FOR_PICKUP: "#d97706",
  IN_TRANSIT:       "#2563eb",
  DELIVERED:        "#16a34a",
  COMPLETED:        "#7c3aed",
};

const NEXT_LABELS: Partial<Record<DeliveryStatus, string>> = {
  MATCHED:          "Zahlung einfordern",
  AWAITING_PAYMENT: "Zahlungseingang bestätigen",
  READY_FOR_PICKUP: "CMR hochgeladen — In Transport setzen",
  DELIVERED:        "Abschluss bestätigen (CBAM erhalten)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtEur = (v: string) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

// ── Main Component ────────────────────────────────────────────────────────────

export function ContractDetailClient({ contractId }: { contractId: string }) {
  const router   = useRouter();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [token,     setToken]     = useState("");
  const [contract,  setContract]  = useState<ContractDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [advancing,      setAdvancing]      = useState(false);
  const [confirming,     setConfirming]     = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [actionErr,      setActionErr]      = useState("");

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    if (!tkn) { router.replace("/login"); return; }
    setToken(tkn);
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/auction/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "Fehler beim Laden.");
        return;
      }
      setContract(await r.json() as ContractDetail);
    } catch {
      setError("Netzwerkfehler beim Laden des Vertrags.");
    } finally {
      setLoading(false);
    }
  }, [token, contractId]);

  useEffect(() => { void load(); }, [load]);

  async function sendPaymentConfirmation() {
    if (!contract) return;
    setSendingPayment(true);
    setActionErr("");
    try {
      const r = await fetch(`/api/auction/lots/${contract.lotId}/payment-sent`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) { await load(); }
      else {
        const d = await r.json() as { error?: string };
        setActionErr(d.error ?? "Fehler beim Melden der Zahlung.");
      }
    } catch { setActionErr("Netzwerkfehler."); }
    finally { setSendingPayment(false); }
  }

  async function downloadCmr() {
    if (!contract) return;
    try {
      const r = await fetch(`/api/auction/lots/${contract.lotId}/cmr-download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { alert("CMR nicht verfügbar."); return; }
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `CMR-${contract.contractNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("CMR-Download fehlgeschlagen."); }
  }

  async function advanceSeller() {
    if (!contract) return;
    const next = NEXT_STATUS[contract.deliveryStatus];
    // IN_TRANSIT via CMR-Upload; DELIVERED nur über Käufer-Bestätigung
    if (!next || next === "IN_TRANSIT" || next === "DELIVERED") return;
    setAdvancing(true);
    setActionErr("");
    try {
      const r = await fetch(`/api/auction/lots/${contract.lotId}/delivery`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ status: next }),
      });
      if (r.ok) { await load(); }
      else {
        const d = await r.json() as { error?: string };
        setActionErr(d.error ?? "Fehler beim Statuswechsel.");
      }
    } catch { setActionErr("Netzwerkfehler."); }
    finally { setAdvancing(false); }
  }

  async function uploadCmr() {
    if (!contract) return;
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setActionErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/auction/lots/${contract.lotId}/cmr-upload`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      if (r.ok) {
        if (fileRef.current) fileRef.current.value = "";
        await load();
      } else {
        const d = await r.json() as { error?: string };
        setActionErr(d.error ?? "Fehler beim CMR-Upload.");
      }
    } catch { setActionErr("Netzwerkfehler."); }
    finally { setUploading(false); }
  }

  async function confirmDelivery() {
    if (!contract) return;
    setConfirming(true);
    setActionErr("");
    try {
      const r = await fetch(`/api/auction/lots/${contract.lotId}/buyer-delivery`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) { await load(); }
      else {
        const d = await r.json() as { error?: string };
        setActionErr(d.error ?? "Fehler beim Bestätigen.");
      }
    } catch { setActionErr("Netzwerkfehler."); }
    finally { setConfirming(false); }
  }

  async function downloadPdf() {
    if (!contract) return;
    try {
      const r = await fetch(`/api/auction/lots/${contract.lotId}/contract`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { alert("PDF nicht verfügbar."); return; }
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${contract.contractNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Download fehlgeschlagen."); }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <EucxHeader />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, border: "2px solid #154194", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        </div>
      </>
    );
  }

  if (error || !contract) {
    return (
      <>
        <EucxHeader />
        <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 24px", textAlign: "center", fontFamily: "IBM Plex Sans,sans-serif" }}>
          <div style={{ fontSize: 14, color: "#dc2626" }}>{error ?? "Vertrag nicht gefunden."}</div>
          <button onClick={() => router.back()} style={{ marginTop: 20, padding: "8px 20px", background: "#154194", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
            ← Zurück
          </button>
        </div>
      </>
    );
  }

  const idx    = STATUS_IDX[contract.deliveryStatus];
  const isSeller = contract.myRole === "seller";
  const isBuyer  = contract.myRole === "buyer";

  // Seller: advance button (nicht IN_TRANSIT via CMR-Upload, nicht DELIVERED — nur Käufer)
  const sellerNextStatus = NEXT_STATUS[contract.deliveryStatus];
  const canAdvanceSeller =
    isSeller &&
    sellerNextStatus !== null &&
    sellerNextStatus !== "IN_TRANSIT" &&
    sellerNextStatus !== "DELIVERED";
  // AWAITING_PAYMENT→READY_FOR_PICKUP erst wenn Käufer paymentSentAt gesetzt hat
  const sellerAdvanceBlocked =
    contract.deliveryStatus === "AWAITING_PAYMENT" && !contract.paymentSentAt;

  // Seller CMR: only READY_FOR_PICKUP → IN_TRANSIT
  const showCmrUpload = isSeller && contract.deliveryStatus === "READY_FOR_PICKUP";

  // Buyer: Zahlung anweisen (nur wenn AWAITING_PAYMENT und noch nicht gemeldet)
  const canSendPayment = isBuyer && contract.deliveryStatus === "AWAITING_PAYMENT" && !contract.paymentSentAt;

  // Buyer: CMR herunterladen wenn vorhanden (IN_TRANSIT, DELIVERED, COMPLETED)
  const canDownloadCmr = !!contract.cmrUploadedAt &&
    ["IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(contract.deliveryStatus);

  // Buyer: confirm receipt when IN_TRANSIT
  const canConfirmBuyer = isBuyer && contract.deliveryStatus === "IN_TRANSIT";

  const totalFeeAmount = contract.myFees.reduce((sum, f) => sum + Number(f.amount), 0);
  const feeUnpaid      = contract.myFees.some((f) => f.status === "UNPAID");

  return (
    <>
      <style>{`
        .cd { font-family:"IBM Plex Sans","Helvetica Neue",Arial,sans-serif; min-height:100vh; background:#f5f7fa; color:#1a1a1a; }
        .cd-page { max-width:1100px; margin:0 auto; padding:28px 24px 80px; }
        .cd-back { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:#154194; cursor:pointer; margin-bottom:20px; background:none; border:none; padding:0; }
        .cd-back:hover { text-decoration:underline; }
        .cd-head { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:24px; }
        .cd-head-left { }
        .cd-title { font-size:20px; font-weight:700; color:#111827; }
        .cd-nr { font-family:"IBM Plex Mono","Courier New",monospace; font-size:12px; color:#6b7280; margin-top:3px; }
        .cd-status-chip { display:inline-block; padding:4px 12px; font-size:11.5px; font-weight:700; color:#fff; letter-spacing:.04em; }
        .cd-layout { display:grid; grid-template-columns:1fr 310px; gap:20px; }
        @media(max-width:768px) { .cd-layout { grid-template-columns:1fr; } }
        .cd-card { background:#fff; border:1px solid #e5e7eb; }
        .cd-card-head { padding:14px 18px; border-bottom:1px solid #f3f4f6; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#6b7280; }
        .cd-card-body { padding:18px; }

        /* Timeline */
        .cd-timeline { display:flex; gap:0; margin-bottom:0; }
        .cd-tl-step { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; }
        .cd-tl-step:not(:last-child)::after {
          content:""; position:absolute; top:14px; left:50%; width:100%; height:2px;
          z-index:0;
        }
        .cd-tl-step:not(:last-child).done::after    { background:#154194; }
        .cd-tl-step:not(:last-child).current::after { background:#e5e7eb; }
        .cd-tl-step:not(:last-child).future::after  { background:#e5e7eb; }
        .cd-tl-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; z-index:1; position:relative; flex-shrink:0; }
        .cd-tl-dot.done    { background:#154194; color:#fff; }
        .cd-tl-dot.current { background:#154194; color:#fff; outline:3px solid #c7d7f0; }
        .cd-tl-dot.future  { background:#e5e7eb; color:#9ca3af; }
        .cd-tl-label { font-size:10.5px; text-align:center; margin-top:6px; padding:0 4px; color:#6b7280; line-height:1.3; }
        .cd-tl-label.done    { color:#154194; font-weight:600; }
        .cd-tl-label.current { color:#154194; font-weight:700; }

        /* Action box */
        .cd-action { margin-top:16px; padding:16px; border:1px solid #e5e7eb; background:#f9fafb; }
        .cd-action-title { font-size:12px; font-weight:700; color:#374151; margin-bottom:10px; text-transform:uppercase; letter-spacing:.06em; }
        .cd-pickup-box { background:#f0fdf4; border:1px solid #bbf7d0; padding:14px; text-align:center; margin-bottom:10px; }
        .cd-pickup-code { font-family:"IBM Plex Mono",monospace; font-size:32px; font-weight:700; color:#16a34a; letter-spacing:.15em; }
        .cd-pickup-label { font-size:10px; color:#6b7280; margin-top:4px; font-weight:600; text-transform:uppercase; }
        .cd-cmr-ok { font-size:12px; color:#16a34a; font-weight:600; margin-bottom:8px; }
        .cd-file-input { width:100%; font-size:12px; margin-bottom:8px; }
        .cd-btn { display:block; width:100%; padding:10px; font-size:12.5px; font-weight:700; border:none; cursor:pointer; transition:background .15s; letter-spacing:.03em; }
        .cd-btn-primary { background:#154194; color:#fff; }
        .cd-btn-primary:hover:not(:disabled) { background:#0f3073; }
        .cd-btn-green { background:#16a34a; color:#fff; margin-bottom:8px; }
        .cd-btn-green:hover:not(:disabled) { background:#15803d; }
        .cd-btn:disabled { background:#d1d5db; cursor:not-allowed; }
        .cd-err { background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; margin-bottom:10px; font-size:12.5px; color:#dc2626; }

        /* Lot detail table */
        .cd-dt { width:100%; border-collapse:collapse; font-size:13px; }
        .cd-dt td { padding:8px 0; border-bottom:1px solid #f3f4f6; }
        .cd-dt td:first-child { color:#6b7280; width:45%; }
        .cd-dt td:last-child  { font-weight:500; color:#111827; }
        .cd-dt tr:last-child td { border-bottom:none; }

        /* Contact card */
        .cd-contact-label { font-size:11px; color:#9ca3af; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-bottom:2px; }
        .cd-contact-val   { font-size:13.5px; color:#111827; font-weight:600; margin-bottom:10px; }
        .cd-contact-sub   { font-size:12px; color:#374151; margin-bottom:2px; }

        /* Documents */
        .cd-doc-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:13px; }
        .cd-doc-row:last-child { border-bottom:none; }
        .cd-doc-name { color:#374151; }
        .cd-doc-badge-ok  { font-size:10.5px; font-weight:700; color:#16a34a; }
        .cd-doc-badge-no  { font-size:10.5px; font-weight:700; color:#9ca3af; }

        /* Financial */
        .cd-fin-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; border-bottom:1px solid #f3f4f6; }
        .cd-fin-row:last-child { border-bottom:none; }
        .cd-fin-label { color:#6b7280; }
        .cd-fin-val   { font-weight:600; color:#111827; font-variant-numeric:tabular-nums; }
        .cd-fin-total { font-weight:700; color:#154194; font-size:15px; }
        .cd-fee-unpaid { color:#dc2626; }
        .cd-fee-paid   { color:#16a34a; }

        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      <div className="cd">
        <EucxHeader />

        <div className="cd-page">
          <button className="cd-back" onClick={() => router.back()}>
            ← Zurück
          </button>

          {/* Header */}
          <div className="cd-head">
            <div className="cd-head-left">
              <div className="cd-title">{contract.lot.commodity}</div>
              <div className="cd-nr">{contract.contractNumber} · erstellt {fmtDate(contract.createdAt)}</div>
            </div>
            <span className="cd-status-chip" style={{ background: STATUS_COLORS[contract.deliveryStatus] }}>
              {STEPS[idx]?.label ?? contract.deliveryStatus}
            </span>
          </div>

          <div className="cd-layout">
            {/* Linke Spalte */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Status-Timeline */}
              <div className="cd-card">
                <div className="cd-card-head">Lieferstatus</div>
                <div className="cd-card-body">
                  <div className="cd-timeline">
                    {STEPS.map((step, i) => {
                      const cls = i < idx ? "done" : i === idx ? "current" : "future";
                      return (
                        <div key={step.key} className={`cd-tl-step ${cls}`}>
                          <div className={`cd-tl-dot ${cls}`}>
                            {i < idx ? "✓" : i + 1}
                          </div>
                          <div className={`cd-tl-label ${cls}`}>{step.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Aktueller Schritt — Hinweistext */}
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0f4ff", borderLeft: "3px solid #154194", fontSize: 12.5, color: "#374151" }}>
                    {STEPS[idx]?.hint}
                  </div>

                  {/* Seller: Zahlungsstatus wenn AWAITING_PAYMENT */}
                  {isSeller && contract.deliveryStatus === "AWAITING_PAYMENT" && (
                    <div style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: contract.paymentSentAt ? "#f0fdf4" : "#fffbeb",
                      border: `1px solid ${contract.paymentSentAt ? "#bbf7d0" : "#fde68a"}`,
                      fontSize: 12.5,
                      color: contract.paymentSentAt ? "#14532d" : "#92400e",
                    }}>
                      {contract.paymentSentAt
                        ? `Käufer hat Zahlung gemeldet am ${fmtDateTime(contract.paymentSentAt)} — Sie können jetzt den Zahlungseingang bestätigen.`
                        : "Warten auf Zahlungsmeldung des Käufers. Der Käufer muss zuerst die Überweisung melden."}
                    </div>
                  )}

                  {/* Buyer: Zahlungsinfo wenn AWAITING_PAYMENT */}
                  {isBuyer && contract.deliveryStatus === "AWAITING_PAYMENT" && contract.paymentSentAt && (
                    <div style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      fontSize: 12.5,
                      color: "#14532d",
                    }}>
                      Zahlung gemeldet am {fmtDateTime(contract.paymentSentAt)} — Verkäufer bestätigt den Eingang.
                    </div>
                  )}

                  {/* Aktion */}
                  {(canAdvanceSeller || showCmrUpload || canConfirmBuyer || canSendPayment ||
                    (isBuyer && canDownloadCmr) ||
                    (isSeller && (contract.deliveryStatus === "DELIVERED" || contract.deliveryStatus === "COMPLETED"))) && (
                    <div className="cd-action">
                      {actionErr && <div className="cd-err">{actionErr}</div>}
                      <div className="cd-action-title">
                        {contract.deliveryStatus === "COMPLETED" ? "Dokumente" : "Nächste Aktion"}
                      </div>

                      {/* Pickup-Code anzeigen (Seller + READY_FOR_PICKUP oder IN_TRANSIT) */}
                      {isSeller && contract.pickupCode && (
                        contract.deliveryStatus === "READY_FOR_PICKUP" ||
                        contract.deliveryStatus === "IN_TRANSIT"
                      ) && (
                        <div className="cd-pickup-box">
                          <div className="cd-pickup-code">{contract.pickupCode}</div>
                          <div className="cd-pickup-label">Abholcode — an Spediteur weitergeben</div>
                        </div>
                      )}

                      {/* CMR Upload (Seller, READY_FOR_PICKUP) */}
                      {showCmrUpload && (
                        <div style={{ marginBottom: 10 }}>
                          {contract.cmrUploadedAt ? (
                            <div className="cd-cmr-ok">CMR hochgeladen ({fmtDateTime(contract.cmrUploadedAt)})</div>
                          ) : (
                            <>
                              <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
                                CMR-Frachtbrief hochladen (PDF) — danach wird Status automatisch auf In Transport gesetzt:
                              </div>
                              <input ref={fileRef} type="file" accept=".pdf" className="cd-file-input" />
                              <button className="cd-btn cd-btn-primary" disabled={uploading} onClick={uploadCmr}>
                                {uploading ? "Wird hochgeladen…" : "CMR hochladen & In Transport setzen"}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Seller advance */}
                      {canAdvanceSeller && (
                        <button
                          className="cd-btn cd-btn-primary"
                          disabled={advancing || sellerAdvanceBlocked}
                          onClick={advanceSeller}
                          title={sellerAdvanceBlocked ? "Warten Sie auf die Zahlungsmeldung des Käufers" : undefined}
                        >
                          {advancing ? "Wird gespeichert…" : NEXT_LABELS[contract.deliveryStatus] ?? "Weiter"}
                        </button>
                      )}

                      {/* Seller: CBAM-Export wenn DELIVERED oder COMPLETED */}
                      {isSeller && (contract.deliveryStatus === "DELIVERED" || contract.deliveryStatus === "COMPLETED") && (
                        <button
                          className="cd-btn"
                          style={{ background: "#fff", color: "#374151", border: "1px solid #d1d5db", marginTop: 8 }}
                          onClick={() => window.open(`/api/auction/lots/${contract.lotId}/cbam-export?token=${token}`, "_blank")}
                        >
                          CBAM-Zollquittung exportieren →
                        </button>
                      )}

                      {/* Buyer: Zahlung anweisen */}
                      {canSendPayment && (
                        <button
                          className="cd-btn cd-btn-primary"
                          disabled={sendingPayment}
                          onClick={sendPaymentConfirmation}
                        >
                          {sendingPayment ? "Wird gespeichert…" : "Zahlung angewiesen melden"}
                        </button>
                      )}

                      {/* Buyer: CMR herunterladen */}
                      {isBuyer && canDownloadCmr && (
                        <button
                          className="cd-btn"
                          style={{ background: "#fff", color: "#374151", border: "1px solid #d1d5db", marginTop: 8 }}
                          onClick={downloadCmr}
                        >
                          CMR-Frachtbrief herunterladen
                        </button>
                      )}

                      {/* Buyer: Wareneingang bestätigen */}
                      {canConfirmBuyer && (
                        <button
                          className="cd-btn cd-btn-green"
                          disabled={confirming}
                          onClick={confirmDelivery}
                          style={{ marginTop: 8 }}
                        >
                          {confirming ? "Wird gespeichert…" : "Wareneingang bestätigen"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Zeitstempel */}
                  {(contract.deliveredAt || contract.cmrUploadedAt || contract.paymentSentAt) && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280", display: "flex", flexWrap: "wrap", gap: 16 }}>
                      {contract.paymentSentAt && (
                        <span>Zahlung gemeldet: {fmtDateTime(contract.paymentSentAt)}</span>
                      )}
                      {contract.cmrUploadedAt && (
                        <span>CMR: {fmtDateTime(contract.cmrUploadedAt)}</span>
                      )}
                      {contract.deliveredAt && (
                        <span>Geliefert: {fmtDateTime(contract.deliveredAt)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lot-Details */}
              <div className="cd-card">
                <div className="cd-card-head">Kontraktdetails</div>
                <div className="cd-card-body">
                  <table className="cd-dt">
                    <tbody>
                      <tr>
                        <td>Ware</td>
                        <td style={{ fontWeight: 700 }}>{contract.lot.commodity}</td>
                      </tr>
                      <tr>
                        <td>Menge</td>
                        <td>
                          {parseFloat(contract.lot.quantity).toLocaleString("de-DE", { maximumFractionDigits: 4 })} {contract.lot.unit}
                        </td>
                      </tr>
                      {contract.lot.qualityGrade && (
                        <tr><td>Qualitätsnorm</td><td>{contract.lot.qualityGrade}</td></tr>
                      )}
                      {contract.lot.hsCode && (
                        <tr><td>HS-Code</td><td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{contract.lot.hsCode}</td></tr>
                      )}
                      {contract.lot.incoterms && (
                        <tr><td>Incoterms</td><td>{contract.lot.incoterms}</td></tr>
                      )}
                      {contract.lot.deliveryLocation && (
                        <tr><td>Lieferort</td><td>{contract.lot.deliveryLocation}</td></tr>
                      )}
                      {contract.lot.deliveryPeriod && (
                        <tr><td>Lieferzeitraum</td><td>{contract.lot.deliveryPeriod}</td></tr>
                      )}
                      {contract.lot.paymentTerms && (
                        <tr><td>Zahlungsbedingungen</td><td>{contract.lot.paymentTerms}</td></tr>
                      )}
                      {contract.lot.vatTreatment && (
                        <tr><td>USt.-Behandlung</td><td>{contract.lot.vatTreatment}</td></tr>
                      )}
                      {contract.lot.auctionEnd && (
                        <tr><td>Auktionsende</td><td>{fmtDateTime(contract.lot.auctionEnd)}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dokumente */}
              <div className="cd-card">
                <div className="cd-card-head">Dokumente</div>
                <div className="cd-card-body">
                  <div className="cd-doc-row">
                    <span className="cd-doc-name">Kaufvertrag (PDF)</span>
                    <button
                      onClick={downloadPdf}
                      style={{ padding: "5px 14px", background: "#154194", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Herunterladen
                    </button>
                  </div>
                  <div className="cd-doc-row">
                    <span className="cd-doc-name">EN 10204 3.1 Werkszeugnis</span>
                    <span className={contract.certificates.has31 ? "cd-doc-badge-ok" : "cd-doc-badge-no"}>
                      {contract.certificates.has31 ? "Vorhanden" : "Nicht verfügbar"}
                    </span>
                  </div>
                  <div className="cd-doc-row">
                    <span className="cd-doc-name">CBAM-Registrierungsdokument</span>
                    <span className={contract.certificates.hasCbam ? "cd-doc-badge-ok" : "cd-doc-badge-no"}>
                      {contract.certificates.hasCbam ? "Vorhanden" : "Nicht verfügbar"}
                    </span>
                  </div>
                  {contract.cmrUploadedAt ? (
                    <div className="cd-doc-row">
                      <span className="cd-doc-name">CMR-Frachtbrief</span>
                      <button
                        onClick={downloadCmr}
                        style={{ padding: "4px 12px", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                      >
                        Herunterladen
                      </button>
                    </div>
                  ) : (
                    <div className="cd-doc-row">
                      <span className="cd-doc-name">CMR-Frachtbrief</span>
                      <span className="cd-doc-badge-no">Noch nicht hochgeladen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rechte Spalte */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Gegenpartei */}
              <div className="cd-card">
                <div className="cd-card-head">
                  {contract.myRole === "buyer" ? "Verkäufer" : "Käufer"}
                </div>
                <div className="cd-card-body">
                  <div className="cd-contact-label">Unternehmen</div>
                  <div className="cd-contact-val">{contract.counterparty.name}</div>
                  {contract.counterparty.city && (
                    <>
                      <div className="cd-contact-label">Standort</div>
                      <div className="cd-contact-sub">
                        {contract.counterparty.city}
                        {contract.counterparty.country ? `, ${contract.counterparty.country}` : ""}
                      </div>
                    </>
                  )}
                  {contract.counterparty.phone && (
                    <>
                      <div className="cd-contact-label" style={{ marginTop: 10 }}>Telefon</div>
                      <div className="cd-contact-sub">
                        <a href={`tel:${contract.counterparty.phone}`} style={{ color: "#154194" }}>
                          {contract.counterparty.phone}
                        </a>
                      </div>
                    </>
                  )}
                  <div className="cd-contact-label" style={{ marginTop: 10 }}>E-Mail</div>
                  <div className="cd-contact-sub">
                    <a href={`mailto:${contract.counterparty.email}`} style={{ color: "#154194" }}>
                      {contract.counterparty.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Finanzen */}
              <div className="cd-card">
                <div className="cd-card-head">Finanzen</div>
                <div className="cd-card-body">
                  <div className="cd-fin-row">
                    <span className="cd-fin-label">Endpreis / Einheit</span>
                    <span className="cd-fin-val">{fmtEur(contract.finalPrice)}</span>
                  </div>
                  <div className="cd-fin-row" style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <span className="cd-fin-label">
                      {parseFloat(contract.lot.quantity).toLocaleString("de-DE", { maximumFractionDigits: 0 })} {contract.lot.unit}
                    </span>
                    <span className="cd-fin-val">× Einheitspreis</span>
                  </div>
                  <div className="cd-fin-row" style={{ paddingTop: 12 }}>
                    <span className="cd-fin-label" style={{ fontWeight: 700 }}>Gesamtwert</span>
                    <span className="cd-fin-val cd-fin-total">{fmtEur(contract.totalValue)}</span>
                  </div>
                  {contract.myFees.length > 0 && (
                    <>
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                          Plattform-Gebühr
                        </div>
                        {contract.myFees.map((f, i) => (
                          <div key={i} className="cd-fin-row">
                            <span className="cd-fin-label">
                              {(parseFloat(f.rate) * 100).toFixed(2).replace(".", ",")} %
                            </span>
                            <span className="cd-fin-val">
                              {fmtEur(f.amount)}
                              <span className={f.status === "PAID" ? " cd-fee-paid" : " cd-fee-unpaid"} style={{ marginLeft: 6, fontSize: 10.5 }}>
                                {f.status === "PAID" ? "Bezahlt" : "Offen"}
                              </span>
                            </span>
                          </div>
                        ))}
                        {contract.myFees.length > 1 && (
                          <div className="cd-fin-row" style={{ borderTop: "1px solid #e5e7eb", paddingTop: 6 }}>
                            <span className="cd-fin-label" style={{ fontWeight: 600 }}>Gebühren gesamt</span>
                            <span className="cd-fin-val">
                              {fmtEur(totalFeeAmount.toString())}
                              <span className={feeUnpaid ? " cd-fee-unpaid" : " cd-fee-paid"} style={{ marginLeft: 6, fontSize: 10.5 }}>
                                {feeUnpaid ? "Teilweise offen" : "Alle bezahlt"}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Unterschriften */}
              <div className="cd-card">
                <div className="cd-card-head">Unterschriften</div>
                <div className="cd-card-body">
                  <div className="cd-fin-row">
                    <span className="cd-fin-label">Käufer</span>
                    <span className={contract.signedAtBuyer ? "cd-fee-paid" : "cd-fin-val"} style={{ fontSize: 12 }}>
                      {contract.signedAtBuyer ? fmtDate(contract.signedAtBuyer) : "Ausstehend"}
                    </span>
                  </div>
                  <div className="cd-fin-row">
                    <span className="cd-fin-label">Verkäufer</span>
                    <span className={contract.signedAtSeller ? "cd-fee-paid" : "cd-fin-val"} style={{ fontSize: 12 }}>
                      {contract.signedAtSeller ? fmtDate(contract.signedAtSeller) : "Ausstehend"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
