"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { KycStatusBadge } from "@/components/KycStatusBadge";
import { EucxHeader } from "@/components/layout/EucxHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type DocType =
  | "TRADE_REGISTER"
  | "VAT_CONFIRMATION"
  | "ID_DOCUMENT"
  | "UBO_DOCUMENT"
  | "SOLVENCY_PROOF"
  | "POWER_OF_ATTORNEY"
  | "EORI_CERTIFICATE"
  | "ISO_CERTIFICATE"
  | "CBAM_REGISTRATION"
  | "OTHER";

type VerificationStatus = "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
type CheckStatus       = "missing" | "pending" | "approved" | "rejected";

const DOC_TYPE_LABELS: Record<DocType, string> = {
  TRADE_REGISTER:    "Handelsregisterauszug",
  VAT_CONFIRMATION:  "USt-IdNr.-Bestätigung",
  ID_DOCUMENT:       "Personalausweis / Reisepass",
  UBO_DOCUMENT:      "Gesellschafterliste / Transparenzregister",
  SOLVENCY_PROOF:    "Bonitätsnachweis / Bankauskunft",
  POWER_OF_ATTORNEY: "Handlungsvollmacht",
  EORI_CERTIFICATE:  "EORI-Registrierungsnachweis",
  ISO_CERTIFICATE:   "ISO 9001 / EN ISO 3834 Zertifikat",
  CBAM_REGISTRATION: "CBAM-Registrierungsnachweis",
  OTHER:             "Sonstiges",
};

const DOC_TYPE_HELP: Record<DocType, string> = {
  TRADE_REGISTER:    "Erhältlich unter handelsregister.de - nicht älter als 3 Monate, ca. 12 €",
  VAT_CONFIRMATION:  "Kostenlose Bestätigung vom Bundeszentralamt für Steuern (eop.bff-online.de)",
  ID_DOCUMENT:       "Vorder- und Rückseite des Personalausweises oder Hauptseite des Reisepasses",
  UBO_DOCUMENT:      "Gesellschafterliste mit Anteilseignern >25 % oder Transparenzregister-Auszug (§ 19 GwG) - Pflicht für alle Marktteilnehmer",
  SOLVENCY_PROOF:    "Aktuelle Bankauskunft oder Bonitätszertifikat (Creditreform, Schufa) - nicht älter als 3 Monate",
  POWER_OF_ATTORNEY: "Von der Geschäftsführung unterzeichnete Vollmacht, die Ihre Berechtigung zum Abschluss von Warentermingeschäften auf EUCX ausdrücklich beinhaltet",
  EORI_CERTIFICATE:  "EORI-Registrierungsnachweis für grenzüberschreitenden Warenverkehr in der EU (zoll.de)",
  ISO_CERTIFICATE:   "ISO 9001 Qualitätsmanagementsystem oder EN ISO 3834 Schweißqualitätsnorm - sofern vorhanden",
  CBAM_REGISTRATION: "CBAM-Registrierungsnachweis gemäß EU-Verordnung 2023/956 - erforderlich bei Import von Stahl aus Nicht-EU-Ländern",
  OTHER:             "Weitere relevante Unterlagen, z. B. Gesellschaftsvertrag oder Vollmacht",
};

// Role-specific doc config - evaluated at render time
const REQUIRED_BASE: DocType[] = ["TRADE_REGISTER", "VAT_CONFIRMATION", "ID_DOCUMENT", "UBO_DOCUMENT"];
const BUYER_REQUIRED_EXTRA: DocType[] = ["SOLVENCY_PROOF"];
const SELLER_OPTIONAL: DocType[] = ["EORI_CERTIFICATE", "ISO_CERTIFICATE", "CBAM_REGISTRATION"];

const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
  approved: "Genehmigt",
  pending:  "In Prüfung",
  rejected: "Abgelehnt",
  missing:  "Ausstehend",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectType(filename: string): DocType {
  const n = filename.toLowerCase();
  if (n.includes("handelsregister") || n.includes("hreg") || n.includes("hr-auszug")) return "TRADE_REGISTER";
  if (n.includes("ust") || n.includes("vat") || n.includes("steuer") || n.includes("ustid")) return "VAT_CONFIRMATION";
  if (n.includes("ausweis") || n.includes("passport") || n.includes("reisepass") || n.includes("personalausweis")) return "ID_DOCUMENT";
  if (n.includes("vollmacht") || n.includes("power_of_attorney") || n.includes("poa") || n.includes("handlungsvollmacht")) return "POWER_OF_ATTORNEY";
  if (n.includes("ubo") || n.includes("gesellschafter") || n.includes("transparenz") || n.includes("wirtschaftlich")) return "UBO_DOCUMENT";
  if (n.includes("bonit") || n.includes("bank") || n.includes("auskunft") || n.includes("creditreform") || n.includes("schufa")) return "SOLVENCY_PROOF";
  if (n.includes("eori")) return "EORI_CERTIFICATE";
  if (n.includes("iso") || n.includes("en3834") || n.includes("en10204")) return "ISO_CERTIFICATE";
  if (n.includes("cbam")) return "CBAM_REGISTRATION";
  return "OTHER";
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ExistingDoc {
  id:        string;
  name:      string;
  type:      string;
  status:    string;
  adminNote: string | null;
  createdAt: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VerificationClient() {
  const [token,               setToken]               = useState("");
  const [userEmail,           setUserEmail]           = useState("");
  const [userRole,            setUserRole]            = useState<"BUYER" | "SELLER">("BUYER");
  const [isGeschaeftsfuehrer, setIsGeschaeftsfuehrer] = useState<boolean | null>(null);
  const [kycStatus,    setKycStatus]    = useState<VerificationStatus>("GUEST");
  const [existingDocs, setExistingDocs] = useState<ExistingDoc[]>([]);
  const [perDocFiles,  setPerDocFiles]  = useState<Partial<Record<DocType, File>>>({});
  const [activeDrag,   setActiveDrag]   = useState<DocType | null>(null);
  const [notes,        setNotes]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const fileInputRefs = useRef<Partial<Record<DocType, HTMLInputElement>>>({});

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (tkn) void loadStatus(tkn);
  }, []);

  async function loadStatus(tkn: string) {
    try {
      const res  = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } });
      if (!res.ok) return;
      const data = await res.json() as { email?: string; role?: string; verificationStatus?: VerificationStatus; organization?: { isGeschaeftsfuehrer?: boolean | null } };
      setUserEmail(data.email ?? "");
      setUserRole(data.role === "SELLER" ? "SELLER" : "BUYER");
      setIsGeschaeftsfuehrer(data.organization?.isGeschaeftsfuehrer ?? null);
      setKycStatus(data.verificationStatus ?? "GUEST");
      const docsRes = await fetch("/api/kyc/documents", { headers: { Authorization: `Bearer ${tkn}` } });
      if (docsRes.ok) {
        const docsData = await docsRes.json() as { documents?: ExistingDoc[] };
        setExistingDocs(docsData.documents ?? []);
      }
    } catch { /* ignore */ }
  }

  function queueFile(type: DocType, file: File) {
    if (file.size > 15 * 1024 * 1024) { toast.error("Maximale Dateigröße: 15 MB"); return; }
    setPerDocFiles((prev) => ({ ...prev, [type]: file }));
  }

  function removeDocFile(type: DocType) {
    setPerDocFiles((prev) => { const n = { ...prev }; delete n[type]; return n; });
  }

  async function handleSubmit() {
    const queued = Object.entries(perDocFiles) as [DocType, File][];
    if (!token || queued.length === 0) return;
    setSubmitting(true);
    try {
      const documents = queued.map(([type, file]) => ({
        name:   file.name,
        type,
        sizeMb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
        url:    null,
      }));
      const res  = await fetch("/api/kyc/submit", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ documents, notes: notes || undefined }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Fehler beim Einreichen");
      } else {
        setPerDocFiles({});
        setNotes("");
        setSubmitted(true);
        setKycStatus("PENDING_VERIFICATION");
        await loadStatus(token);
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  function docStatusForType(type: DocType): CheckStatus {
    const matches = existingDocs.filter((d) => d.type === type);
    if (matches.length === 0) return "missing";
    if (matches.some((d) => d.status === "APPROVED")) return "approved";
    if (matches.some((d) => d.status === "REJECTED")) return "rejected";
    return "pending";
  }

  const rejectedDocs = existingDocs.filter((d) => d.status === "REJECTED");
  const hasRejected  = rejectedDocs.length > 0 && kycStatus !== "VERIFIED";

  const DOC_STATUS_STYLE: Record<string, { color: string; label: string }> = {
    PENDING:  { color: "#92400e", label: "In Prüfung" },
    APPROVED: { color: "#14532d", label: "Genehmigt"  },
    REJECTED: { color: "#7f1d1d", label: "Abgelehnt"  },
  };

  const unlockItems = userRole === "SELLER"
    ? ["An Ausschreibungen registrieren", "Wettbewerbsfähige Gebote abgeben", "Kaufverträge abschließen", "Lieferaufträge verwalten"]
    : ["Ausschreibungen erstellen", "Angebote von Verkäufern empfangen", "Kaufverträge abschließen", "Abwicklungsstatus verfolgen"];

  const requiredTypes: DocType[] = [
    ...REQUIRED_BASE,
    ...(userRole === "BUYER" ? BUYER_REQUIRED_EXTRA : []),
    ...(isGeschaeftsfuehrer === false ? (["POWER_OF_ATTORNEY"] as DocType[]) : []),
  ];

  const optionalTypes: DocType[] = userRole === "SELLER" ? SELLER_OPTIONAL : [];

  const canUpload = kycStatus !== "VERIFIED";

  function renderChecklist(types: DocType[], optional: boolean) {
    const dotContent: Record<CheckStatus, string> = { approved: "✓", rejected: "✗", pending: "⋯", missing: "–" };
    return (
      <div className="ver-cl">
        <div className="ver-cl-head" style={optional ? { color: "#64748b" } : undefined}>
          {optional
            ? "Optionale Unterlagen — Verkäufer"
            : `Pflichtunterlagen (${types.filter((t) => docStatusForType(t) === "approved").length}/${types.length} genehmigt)`}
        </div>
        {types.map((type) => {
          const st     = docStatusForType(type);
          const rejDoc = existingDocs.find((d) => d.type === type && d.status === "REJECTED");
          const queued = perDocFiles[type];
          const canAdd = (st === "missing" || st === "rejected") && canUpload;
          const ext    = queued ? queued.name.split(".").pop()?.toUpperCase() ?? "DOC" : "";
          return (
            <div key={type}>
              {/* versteckter File-Input pro Dokumenttyp */}
              {canAdd && (
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ display: "none" }}
                  ref={(el) => { if (el) fileInputRefs.current[type] = el; }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) queueFile(type, f);
                    e.target.value = "";
                  }}
                />
              )}
              <div className="ver-cl-row">
                <div className={`ver-cl-dot ${queued ? "approved" : st}`}>
                  {queued ? "✓" : dotContent[st]}
                </div>
                <div className="ver-cl-info">
                  <div className="ver-cl-label" style={optional ? { color: "#374151" } : undefined}>
                    {DOC_TYPE_LABELS[type]}
                  </div>
                  <div className="ver-cl-help">{DOC_TYPE_HELP[type]}</div>
                  {rejDoc?.adminNote && (
                    <div className="ver-cl-note">Prüfer-Hinweis: {rejDoc.adminNote}</div>
                  )}
                </div>
                <div className="ver-cl-right">
                  {(st !== "missing" || !optional) && !queued && (
                    <span className={`ver-cl-status ${st}`}>{CHECK_STATUS_LABEL[st]}</span>
                  )}
                </div>
              </div>
              {/* Inline-Dropzone — immer sichtbar wenn uploadfähig und noch keine Datei */}
              {canAdd && !queued && (
                <div
                  className={`ver-inline-drop${activeDrag === type ? " drag" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setActiveDrag(type); }}
                  onDragLeave={() => setActiveDrag(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setActiveDrag(null);
                    const f = e.dataTransfer.files[0];
                    if (f) queueFile(type, f);
                  }}
                  onClick={() => fileInputRefs.current[type]?.click()}
                >
                  <div className="ver-inline-drop-icon">
                    {/* Büroklammer-SVG */}
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M11.5 6L6.5 11C5.12 12.38 2.88 12.38 1.5 11C.12 9.62.12 7.38 1.5 6L6 1.5C6.97.53 8.53.53 9.5 1.5C10.47 2.47 10.47 4.03 9.5 5L5 9.5C4.45 10.05 3.55 10.05 3 9.5C2.45 8.95 2.45 8.05 3 7.5L7 3.5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="ver-inline-drop-body">
                    <span className="ver-inline-drop-text">
                      {activeDrag === type ? "Datei loslassen …" : "Datei hier ablegen oder klicken zum Auswählen"}
                    </span>
                    <span className="ver-inline-drop-hint">PDF, JPG, PNG, WEBP · max. 15 MB pro Datei</span>
                  </div>
                </div>
              )}
              {/* Bestätigungszeile nach Auswahl */}
              {queued && (
                <div className="ver-queued">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6.5" stroke="#16a34a" strokeWidth="1.3"/>
                    <path d="M5 8l2.2 2.2L11 6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ver-queued-name">{queued.name}</span>
                  <span className="ver-queued-size">{(queued.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button className="ver-queued-rm" title="Entfernen" onClick={() => removeDocFile(type)}>×</button>
                </div>
              )}
            </div>
          );
        })}
        {optional && (
          <div className="ver-cl-seller-note">
            Diese Dokumente beschleunigen die Lot-Freigabe. CBAM-Nachweis und EN 10204 3.1 Werkszeugnis sind beim ersten Lot mit Nicht-EU-Ware Pflicht.
          </div>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .ver { font-family:"IBM Plex Sans",Arial,sans-serif; background:#f0f2f5; min-height:100vh; color:#0d1b2a; }
        .ver-main { max-width:760px; margin:0 auto; padding:32px 16px 64px; }
        .ver-title { font-size:26px; font-weight:300; margin-bottom:6px; }
        .ver-title strong { font-weight:700; }
        .ver-sub { font-size:14px; color:#6b7280; margin-bottom:24px; line-height:1.6; }

        /* Status */
        .ver-status { background:#fff; border:1px solid #e5e7eb; padding:16px 24px; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }

        /* Alerts */
        .ver-alert { padding:16px 20px; margin-bottom:16px; }
        .ver-alert.red    { background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; }
        .ver-alert.yellow { background:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; }
        .ver-alert.green  { background:#f0fdf4; border:1px solid #86efac; border-left:4px solid #16a34a; }
        .ver-alert-title { font-size:13.5px; font-weight:700; margin-bottom:5px; }
        .ver-alert.red    .ver-alert-title { color:#7f1d1d; }
        .ver-alert.yellow .ver-alert-title { color:#92400e; }
        .ver-alert.green  .ver-alert-title { color:#14532d; }
        .ver-alert-body { font-size:13px; line-height:1.6; }
        .ver-alert.red    .ver-alert-body { color:#991b1b; }
        .ver-alert.yellow .ver-alert-body { color:#78350f; }
        .ver-alert.green  .ver-alert-body { color:#166534; }

        /* Unlock box */
        .ver-unlock { background:#f0f4ff; border:1px solid #c7d7fc; padding:16px 20px; margin-bottom:18px; }
        .ver-unlock-title { font-size:11.5px; font-weight:700; color:#1e3a8a; margin-bottom:10px; text-transform:uppercase; letter-spacing:.06em; }
        .ver-unlock-grid  { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
        @media(max-width:480px){ .ver-unlock-grid { grid-template-columns:1fr; } }
        .ver-unlock-item  { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#1e3a8a; }
        .ver-unlock-dot   { width:6px; height:6px; border-radius:50%; background:#154194; flex-shrink:0; margin-top:5px; }

        /* Checklist */
        .ver-cl { background:#fff; border:1px solid #e5e7eb; margin-bottom:18px; }
        .ver-cl-head { padding:12px 20px; border-bottom:1px solid #f3f4f6; font-size:11.5px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
        .ver-cl-row  { display:flex; align-items:flex-start; gap:14px; padding:13px 20px; border-bottom:1px solid #f9fafb; }
        .ver-cl-row:last-child { border-bottom:none; }
        .ver-cl-dot  { width:24px; height:24px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; margin-top:1px; }
        .ver-cl-dot.approved { background:#dcfce7; color:#16a34a; }
        .ver-cl-dot.pending  { background:#fef9c3; color:#92400e; }
        .ver-cl-dot.rejected { background:#fee2e2; color:#dc2626; }
        .ver-cl-dot.missing  { background:#f3f4f6; color:#9ca3af; }
        .ver-cl-info  { flex:1; min-width:0; }
        .ver-cl-label { font-size:13.5px; font-weight:600; color:#111827; }
        .ver-cl-help  { font-size:12px; color:#6b7280; margin-top:2px; line-height:1.4; }
        .ver-cl-note  { font-size:12px; color:#dc2626; margin-top:4px; }
        .ver-cl-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
        .ver-cl-status { font-size:11.5px; font-weight:700; white-space:nowrap; }
        .ver-cl-status.approved { color:#16a34a; }
        .ver-cl-status.pending  { color:#d97706; }
        .ver-cl-status.rejected { color:#dc2626; }
        .ver-cl-status.missing  { color:#9ca3af; }
        .ver-cl-seller-note { padding:11px 20px; background:#f8fafc; border-top:1px solid #f3f4f6; font-size:12px; color:#64748b; line-height:1.5; }

        /* Inline-Dropzone unter jedem Dokument */
        .ver-inline-drop { display:flex; align-items:center; gap:10px; padding:10px 20px 10px 20px; background:#fafafa; border-top:1px dashed #d1d5db; cursor:pointer; transition:background .12s, border-color .12s; }
        .ver-inline-drop:hover, .ver-inline-drop.drag { background:#eff4ff; border-top-color:#93c5fd; }
        .ver-inline-drop-icon { width:28px; height:28px; background:#f3f4f6; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .12s, border-color .12s; }
        .ver-inline-drop:hover .ver-inline-drop-icon, .ver-inline-drop.drag .ver-inline-drop-icon { background:#dbeafe; border-color:#93c5fd; }
        .ver-inline-drop-body { flex:1; min-width:0; }
        .ver-inline-drop-text { font-size:12px; font-weight:500; color:#374151; display:block; line-height:1.4; }
        .ver-inline-drop:hover .ver-inline-drop-text, .ver-inline-drop.drag .ver-inline-drop-text { color:#154194; }
        .ver-inline-drop-hint { font-size:11px; color:#9ca3af; display:block; margin-top:1px; letter-spacing:.01em; }

        /* Hochgeladene Datei — Bestätigungszeile */
        .ver-queued { display:flex; align-items:center; gap:10px; padding:10px 20px; background:#f0fdf4; border-top:1px solid #bbf7d0; }
        .ver-queued-name { font-size:12.5px; font-weight:500; color:#14532d; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ver-queued-size { font-size:11px; color:#6b7280; white-space:nowrap; font-variant-numeric:tabular-nums; }
        .ver-queued-rm   { background:none; border:none; color:#9ca3af; font-size:16px; cursor:pointer; padding:0 2px; line-height:1; flex-shrink:0; transition:color .1s; }
        .ver-queued-rm:hover { color:#dc2626; }

        /* Notes */
        .ver-notes-lbl { font-size:13px; font-weight:600; color:#0d1b2a; margin:14px 0 6px; display:block; }
        .ver-notes-inp { width:100%; border:1px solid #d1d5db; padding:12px; font-size:13px; font-family:inherit; resize:vertical; min-height:76px; outline:none; box-sizing:border-box; transition:border-color .15s; }
        .ver-notes-inp:focus { border-color:#154194; }

        /* Submit */
        .ver-btn { width:100%; height:50px; background:#154194; color:#fff; font-size:14.5px; font-weight:700; border:none; cursor:pointer; margin-top:16px; letter-spacing:.04em; transition:background .15s; }
        .ver-btn:hover:not(:disabled) { background:#0f3073; }
        .ver-btn:disabled { opacity:.5; cursor:not-allowed; }

        /* Existing docs */
        .ver-sect { font-size:12px; font-weight:700; color:#6b7280; margin:24px 0 10px; text-transform:uppercase; letter-spacing:.06em; }
        .ver-doc  { background:#fff; border:1px solid #e5e7eb; padding:13px 16px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .ver-doc-info { flex:1; min-width:0; }
        .ver-doc-name { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ver-doc-date { font-size:11.5px; color:#9ca3af; margin-top:2px; }
        .ver-doc-type { font-size:12px; color:#6b7280; margin-top:2px; }
        .ver-doc-note { font-size:12px; color:#dc2626; margin-top:5px; }
        .ver-doc-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }

        @media(max-width:600px){
          .ver-main  { padding:16px 12px 48px; }
          .ver-title { font-size:22px; }
          .ver-drop  { padding:30px 16px; }
        }
      `}</style>

      <div className="ver">
        <EucxHeader />

        <div className="ver-main">
          <h1 className="ver-title">Identitätsprüfung</h1>
          <p className="ver-sub">
            {userRole === "SELLER"
              ? "Reichen Sie Ihre Unterlagen ein, um als verifizierter Verkäufer Gebote abgeben zu können. Die Prüfung dauert in der Regel unter 24 Stunden."
              : "Reichen Sie Ihre Unterlagen ein, um als verifizierter Käufer Ausschreibungen erstellen zu können. Die Prüfung dauert in der Regel unter 24 Stunden."}
          </p>

          {/* Aktueller Status */}
          <div className="ver-status">
            <span style={{ fontSize: 14, fontWeight: 600 }}>Ihr Verifizierungsstatus:</span>
            <KycStatusBadge status={kycStatus} />
          </div>

          {/* REJECTED - prominenter Alert oben */}
          {hasRejected && (
            <div className="ver-alert red">
              <div className="ver-alert-title">
                {rejectedDocs.length === 1 ? "Dokument abgelehnt" : `${rejectedDocs.length} Dokumente abgelehnt`} - Bitte neu einreichen
              </div>
              <div className="ver-alert-body">
                {rejectedDocs.map((d) => (
                  <div key={d.id}>
                    <strong>„{d.name}"</strong>
                    {d.adminNote && <> - Prüfer-Hinweis: <em>{d.adminNote}</em></>}
                  </div>
                ))}
                <div style={{ marginTop: 6 }}>Klicken Sie bei dem betroffenen Dokument auf „Erneut einreichen".</div>
              </div>
            </div>
          )}

          {/* PENDING - Info-Box */}
          {kycStatus === "PENDING_VERIFICATION" && !submitted && !hasRejected && (
            <div className="ver-alert yellow">
              <div className="ver-alert-title">Dokumente in Prüfung</div>
              <div className="ver-alert-body">
                Ihre Unterlagen wurden eingereicht und werden von unserem Compliance-Team geprüft.
                Sie erhalten eine E-Mail an <strong>{userEmail}</strong>, sobald die Prüfung abgeschlossen ist.
                Prüfungszeit: in der Regel unter 24 Stunden.
              </div>
            </div>
          )}

          {/* Bestätigung nach Einreichung */}
          {submitted && (
            <div className="ver-alert green">
              <div className="ver-alert-title">Dokumente erfolgreich eingereicht</div>
              <div className="ver-alert-body">
                Wir benachrichtigen Sie per E-Mail an <strong>{userEmail}</strong>, sobald die Prüfung abgeschlossen ist - in der Regel unter 24 Stunden.
                <br />
                {userRole === "SELLER"
                  ? "Nach erfolgreicher Verifikation können Sie sich für Ausschreibungen registrieren und Gebote abgeben."
                  : "Nach erfolgreicher Verifikation können Sie Ausschreibungen erstellen und Angebote von Verkäufern empfangen."}
              </div>
            </div>
          )}

          {/* Was wird freigeschaltet */}
          {kycStatus !== "VERIFIED" && (
            <div className="ver-unlock">
              <div className="ver-unlock-title">
                Nach Verifikation als {userRole === "SELLER" ? "Verkäufer" : "Käufer"} freigeschaltet:
              </div>
              <div className="ver-unlock-grid">
                {unlockItems.map((item) => (
                  <div className="ver-unlock-item" key={item}>
                    <div className="ver-unlock-dot" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dokument-Checkliste - Pflichtunterlagen */}
          {renderChecklist(requiredTypes, false)}

          {/* Optionale Unterlagen - nur Verkäufer */}
          {optionalTypes.length > 0 && renderChecklist(optionalTypes, true)}

          {/* VERIFIED */}
          {kycStatus === "VERIFIED" && (
            <div className="ver-alert green" style={{ marginBottom: 18 }}>
              <div className="ver-alert-title">Konto vollständig verifiziert</div>
              <div className="ver-alert-body">
                {userRole === "SELLER"
                  ? "Sie können sich für Ausschreibungen registrieren und Gebote abgeben."
                  : "Sie können Ausschreibungen erstellen und Angebote von Verkäufern empfangen."}
              </div>
            </div>
          )}

          {/* Submit-Bereich — erscheint sobald mindestens eine Datei ausgewählt */}
          {canUpload && Object.keys(perDocFiles).length > 0 && (
            <>
              <label className="ver-notes-lbl">Optionale Notiz an den Prüfer:</label>
              <textarea
                className="ver-notes-inp"
                placeholder="z. B. 'Unternehmen wurde 2024 gegründet, Handelsregister noch in Bearbeitung'"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
              />
              <button
                className="ver-btn"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? "Wird eingereicht …"
                  : `${Object.keys(perDocFiles).length} Dokument${Object.keys(perDocFiles).length > 1 ? "e" : ""} einreichen`}
              </button>
            </>
          )}

          {/* Eingereichte Dokumente mit Datum */}
          {existingDocs.length > 0 && (
            <>
              <div className="ver-sect">Eingereichte Dokumente ({existingDocs.length})</div>
              {existingDocs.map((doc) => {
                const st = DOC_STATUS_STYLE[doc.status] ?? { color: "#6b7280", label: doc.status };
                return (
                  <div className="ver-doc" key={doc.id}>
                    <div className="ver-doc-info">
                      <div className="ver-doc-name">{doc.name}</div>
                      <div className="ver-doc-date">Eingereicht am {fmtDate(doc.createdAt)}</div>
                      <div className="ver-doc-type">{DOC_TYPE_LABELS[doc.type as DocType] ?? doc.type}</div>
                      {doc.adminNote && (
                        <div className="ver-doc-note">Prüfer-Hinweis: {doc.adminNote}</div>
                      )}
                    </div>
                    <div className="ver-doc-right">
                      <span style={{ fontSize: 12, fontWeight: 700, color: st.color, padding: "3px 10px", background: `${st.color}18`, whiteSpace: "nowrap" }}>
                        {st.label}
                      </span>
                      {doc.status === "REJECTED" && canUpload && (
                        <button
                          className="ver-upbtn"
                          onClick={() => fileInputRefs.current[doc.type as DocType]?.click()}
                        >
                          Erneut einreichen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
