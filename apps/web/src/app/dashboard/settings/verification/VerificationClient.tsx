"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
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
  TRADE_REGISTER:    "Erhältlich unter handelsregister.de — nicht älter als 3 Monate, ca. 12 €",
  VAT_CONFIRMATION:  "Kostenlose Bestätigung vom Bundeszentralamt für Steuern (eop.bff-online.de)",
  ID_DOCUMENT:       "Vorder- und Rückseite des Personalausweises oder Hauptseite des Reisepasses",
  UBO_DOCUMENT:      "Gesellschafterliste mit Anteilseignern >25 % oder Transparenzregister-Auszug (§ 19 GwG) — Pflicht für alle Marktteilnehmer",
  SOLVENCY_PROOF:    "Aktuelle Bankauskunft oder Bonitätszertifikat (Creditreform, Schufa) — nicht älter als 3 Monate",
  POWER_OF_ATTORNEY: "Von der Geschäftsführung unterzeichnete Vollmacht, die Ihre Berechtigung zum Abschluss von Warentermingeschäften auf EUCX ausdrücklich beinhaltet",
  EORI_CERTIFICATE:  "EORI-Registrierungsnachweis für grenzüberschreitenden Warenverkehr in der EU (zoll.de)",
  ISO_CERTIFICATE:   "ISO 9001 Qualitätsmanagementsystem oder EN ISO 3834 Schweißqualitätsnorm — sofern vorhanden",
  CBAM_REGISTRATION: "CBAM-Registrierungsnachweis gemäß EU-Verordnung 2023/956 — erforderlich bei Import von Stahl aus Nicht-EU-Ländern",
  OTHER:             "Weitere relevante Unterlagen, z. B. Gesellschaftsvertrag oder Vollmacht",
};

// Role-specific doc config — evaluated at render time
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

function readPreview(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve((e.target?.result as string) ?? null);
    reader.onerror = ()  => resolve(null);
    reader.readAsDataURL(file);
  });
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

// ── Interfaces ────────────────────────────────────────────────────────────────

interface UploadFile {
  file:    File;
  type:    DocType;
  preview: string | null;
}

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
  const [token,                setToken]                = useState("");
  const [userEmail,            setUserEmail]            = useState("");
  const [userRole,             setUserRole]             = useState<"BUYER" | "SELLER">("BUYER");
  const [isGeschaeftsfuehrer,  setIsGeschaeftsfuehrer]  = useState<boolean | null>(null);
  const [kycStatus,    setKycStatus]    = useState<VerificationStatus>("GUEST");
  const [existingDocs, setExistingDocs] = useState<ExistingDoc[]>([]);
  const [files,        setFiles]        = useState<UploadFile[]>([]);
  const [notes,        setNotes]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [resubmitType, setResubmitType] = useState<DocType | null>(null);

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

      const docsRes  = await fetch("/api/kyc/documents", { headers: { Authorization: `Bearer ${tkn}` } });
      if (docsRes.ok) {
        const docsData = await docsRes.json() as { documents?: ExistingDoc[] };
        setExistingDocs(docsData.documents ?? []);
      }
    } catch { /* ignore */ }
  }

  const onDrop = useCallback(async (accepted: File[]) => {
    const newFiles = await Promise.all(
      accepted.map(async (f) => ({
        file:    f,
        type:    resubmitType ?? detectType(f.name),
        preview: await readPreview(f),
      }))
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, [resubmitType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg":      [".jpg", ".jpeg"],
      "image/png":       [".png"],
      "image/webp":      [".webp"],
    },
    maxSize:  15 * 1024 * 1024,
    multiple: true,
  });

  const setFileType = (idx: number, type: DocType) =>
    setFiles((prev) => prev.map((f, i) => i === idx ? { ...f, type } : f));

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  async function handleSubmit() {
    if (!token || files.length === 0) return;
    setSubmitting(true);
    try {
      const documents = files.map((f) => ({
        name:   f.file.name,
        type:   f.type,
        sizeMb: parseFloat((f.file.size / 1024 / 1024).toFixed(2)),
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
        setFiles([]);
        setNotes("");
        setSubmitted(true);
        setResubmitType(null);
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

        /* Resubmit btn */
        .ver-rsub { font-size:11.5px; font-weight:700; color:#154194; background:none; border:1px solid #154194; padding:4px 10px; cursor:pointer; white-space:nowrap; transition:all .12s; }
        .ver-rsub:hover  { background:#f0f4ff; }
        .ver-rsub.active { background:#154194; color:#fff; }

        /* Resubmit target hint */
        .ver-rsub-hint { padding:10px 14px; background:#f0f4ff; border:1px solid #c7d7fc; margin-bottom:10px; font-size:13px; color:#1e3a8a; display:flex; align-items:center; justify-content:space-between; }

        /* Dropzone */
        .ver-drop { border:2px dashed #d1d5db; padding:42px 24px; text-align:center; cursor:pointer; transition:all .15s; background:#fff; margin-bottom:14px; }
        .ver-drop.drag  { border-color:#154194; background:#eff4ff; }
        .ver-drop:hover { border-color:#9ca3af; }
        .ver-drop.rsub  { border-color:#154194; border-style:solid; background:#f0f4ff; }
        .ver-drop-icon  { font-size:34px; margin-bottom:8px; }
        .ver-drop-text  { font-size:14px; font-weight:600; color:#0d1b2a; margin-bottom:4px; }
        .ver-drop-hint  { font-size:12.5px; color:#9ca3af; }
        .ver-drop-types { font-size:12px; color:#6b7280; margin-top:5px; }

        /* File list */
        .ver-file { background:#fff; border:1px solid #e5e7eb; padding:11px 14px; margin-bottom:8px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .ver-file-thumb { width:38px; height:38px; object-fit:cover; border:1px solid #e5e7eb; flex-shrink:0; }
        .ver-file-pdf   { width:38px; height:38px; background:#fee2e2; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#dc2626; flex-shrink:0; letter-spacing:.03em; }
        .ver-file-name  { font-size:13px; font-weight:600; flex:1; min-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ver-file-size  { font-size:12px; color:#9ca3af; white-space:nowrap; }
        .ver-file-sel   { border:1px solid #d1d5db; padding:6px 10px; font-size:12.5px; font-family:inherit; outline:none; cursor:pointer; }
        .ver-file-rm    { background:none; border:none; color:#dc2626; font-size:20px; cursor:pointer; padding:0 4px; line-height:1; flex-shrink:0; }

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
          <h1 className="ver-title">Identitäts-<strong>prüfung</strong></h1>
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

          {/* REJECTED — prominenter Alert oben */}
          {hasRejected && (
            <div className="ver-alert red">
              <div className="ver-alert-title">
                {rejectedDocs.length === 1 ? "Dokument abgelehnt" : `${rejectedDocs.length} Dokumente abgelehnt`} — Bitte neu einreichen
              </div>
              <div className="ver-alert-body">
                {rejectedDocs.map((d) => (
                  <div key={d.id}>
                    <strong>„{d.name}"</strong>
                    {d.adminNote && <> — Prüfer-Hinweis: <em>{d.adminNote}</em></>}
                  </div>
                ))}
                <div style={{ marginTop: 6 }}>Klicken Sie bei dem betroffenen Dokument auf „Erneut einreichen".</div>
              </div>
            </div>
          )}

          {/* PENDING — Info-Box */}
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
                Wir benachrichtigen Sie per E-Mail an <strong>{userEmail}</strong>, sobald die Prüfung abgeschlossen ist — in der Regel unter 24 Stunden.
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

          {/* Dokument-Checkliste — Pflichtunterlagen */}
          <div className="ver-cl">
            <div className="ver-cl-head">
              Pflichtunterlagen ({requiredTypes.filter((t) => docStatusForType(t) === "approved").length}/{requiredTypes.length} genehmigt)
            </div>
            {requiredTypes.map((type) => {
              const st     = docStatusForType(type);
              const rejDoc = existingDocs.find((d) => d.type === type && d.status === "REJECTED");
              const dotContent: Record<CheckStatus, string> = { approved: "✓", rejected: "✗", pending: "⋯", missing: "–" };
              return (
                <div className="ver-cl-row" key={type}>
                  <div className={`ver-cl-dot ${st}`}>{dotContent[st]}</div>
                  <div className="ver-cl-info">
                    <div className="ver-cl-label">{DOC_TYPE_LABELS[type]}</div>
                    <div className="ver-cl-help">{DOC_TYPE_HELP[type]}</div>
                    {rejDoc?.adminNote && (
                      <div className="ver-cl-note">Prüfer-Hinweis: {rejDoc.adminNote}</div>
                    )}
                  </div>
                  <div className="ver-cl-right">
                    <span className={`ver-cl-status ${st}`}>{CHECK_STATUS_LABEL[st]}</span>
                    {(st === "missing" || st === "rejected") && canUpload && (
                      <button
                        className={`ver-rsub${resubmitType === type ? " active" : ""}`}
                        onClick={() => setResubmitType(resubmitType === type ? null : type)}
                      >
                        {st === "rejected" ? "Erneut einreichen" : "Hochladen"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optionale Unterlagen — nur Verkäufer */}
          {optionalTypes.length > 0 && (
            <div className="ver-cl">
              <div className="ver-cl-head" style={{ color: "#64748b" }}>
                Optionale Unterlagen — Verkäufer
              </div>
              {optionalTypes.map((type) => {
                const st     = docStatusForType(type);
                const rejDoc = existingDocs.find((d) => d.type === type && d.status === "REJECTED");
                const dotContent: Record<CheckStatus, string> = { approved: "✓", rejected: "✗", pending: "⋯", missing: "–" };
                return (
                  <div className="ver-cl-row" key={type}>
                    <div className={`ver-cl-dot ${st}`}>{dotContent[st]}</div>
                    <div className="ver-cl-info">
                      <div className="ver-cl-label" style={{ color: "#374151" }}>{DOC_TYPE_LABELS[type]}</div>
                      <div className="ver-cl-help">{DOC_TYPE_HELP[type]}</div>
                      {rejDoc?.adminNote && (
                        <div className="ver-cl-note">Prüfer-Hinweis: {rejDoc.adminNote}</div>
                      )}
                    </div>
                    <div className="ver-cl-right">
                      {st !== "missing" && (
                        <span className={`ver-cl-status ${st}`}>{CHECK_STATUS_LABEL[st]}</span>
                      )}
                      {(st === "missing" || st === "rejected") && canUpload && (
                        <button
                          className={`ver-rsub${resubmitType === type ? " active" : ""}`}
                          onClick={() => setResubmitType(resubmitType === type ? null : type)}
                        >
                          {st === "rejected" ? "Erneut einreichen" : "Jetzt einreichen"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="ver-cl-seller-note">
                Diese Dokumente beschleunigen die Lot-Freigabe. CBAM-Nachweis und EN 10204 3.1 Werkszeugnis sind beim ersten Lot mit Nicht-EU-Ware Pflicht.
              </div>
            </div>
          )}

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

          {/* Upload-Bereich */}
          {canUpload && (
            <>
              {resubmitType && (
                <div className="ver-rsub-hint">
                  <span>Neues Dokument für: <strong>{DOC_TYPE_LABELS[resubmitType]}</strong></span>
                  <button
                    style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                    onClick={() => setResubmitType(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              <div
                {...getRootProps()}
                className={`ver-drop${isDragActive ? " drag" : ""}${resubmitType ? " rsub" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="ver-drop-icon">📎</div>
                <div className="ver-drop-text">
                  {isDragActive ? "Dateien loslassen …" : "Dateien hier ablegen oder tippen zum Auswählen"}
                </div>
                <div className="ver-drop-hint">Typ wird automatisch erkannt · Auch auf dem iPad: Foto direkt aus Kamera</div>
                <div className="ver-drop-types">PDF, JPG, PNG, WEBP — max. 15 MB pro Datei</div>
              </div>

              {files.length > 0 && (
                <>
                  {files.map((f, idx) => (
                    <div className="ver-file" key={idx}>
                      {f.preview
                        ? <img src={f.preview} className="ver-file-thumb" alt="" />
                        : <div className="ver-file-pdf">PDF</div>
                      }
                      <span className="ver-file-name">{f.file.name}</span>
                      <span className="ver-file-size">{(f.file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <select
                        className="ver-file-sel"
                        value={f.type}
                        onChange={(e) => setFileType(idx, e.target.value as DocType)}
                      >
                        {(Object.entries(DOC_TYPE_LABELS) as [DocType, string][]).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <button className="ver-file-rm" onClick={() => removeFile(idx)}>×</button>
                    </div>
                  ))}

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
                    disabled={submitting || files.length === 0}
                    onClick={handleSubmit}
                  >
                    {submitting ? "Wird eingereicht …" : `${files.length} Dokument${files.length > 1 ? "e" : ""} einreichen →`}
                  </button>
                </>
              )}
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
                          className={`ver-rsub${resubmitType === doc.type ? " active" : ""}`}
                          onClick={() => setResubmitType(resubmitType === doc.type as DocType ? null : doc.type as DocType)}
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
