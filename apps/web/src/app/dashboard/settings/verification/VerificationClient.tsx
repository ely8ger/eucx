"use client";

/**
 * VerificationClient — KYC-Dokument-Upload
 *
 * Drag & Drop Zone (oder Tap-to-Browse auf iPad/Mobile)
 * Unterstützte Dokumente:
 *   - Handelsregisterauszug (TRADE_REGISTER)
 *   - USt-IdNr.-Bestätigung (VAT_CONFIRMATION)
 *
 * Flow:
 *   1. Dateien auswählen (drag/drop oder file picker)
 *   2. Typ zuweisen (Dropdown pro Datei)
 *   3. Submit → POST /api/kyc/submit
 *   4. Status zeigen
 */

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { KycStatusBadge } from "@/components/KycStatusBadge";
import Link from "next/link";

type DocType = "TRADE_REGISTER" | "VAT_CONFIRMATION" | "ID_DOCUMENT" | "OTHER";

const DOC_TYPE_LABELS: Record<DocType, string> = {
  TRADE_REGISTER:    "Handelsregisterauszug",
  VAT_CONFIRMATION:  "USt-IdNr.-Bestätigung",
  ID_DOCUMENT:       "Personalausweis / Reisepass",
  OTHER:             "Sonstiges",
};

interface UploadFile {
  file:    File;
  type:    DocType;
  preview: string;
}

type VerificationStatus = "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export function VerificationClient() {
  const [token, setToken]       = useState("");
  const [files, setFiles]       = useState<UploadFile[]>([]);
  const [notes, setNotes]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<VerificationStatus>("GUEST");
  const [existingDocs, setExistingDocs] = useState<Array<{ id: string; name: string; type: string; status: string; adminNote: string | null; createdAt: string }>>([]);

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (tkn) loadStatus(tkn);
  }, []);

  const loadStatus = async (tkn: string) => {
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } });
      if (!res.ok) return;
      const data = await res.json();
      setKycStatus(data.verificationStatus ?? "GUEST");

      // Dokumente laden
      const docsRes = await fetch("/api/kyc/documents", { headers: { Authorization: `Bearer ${tkn}` } });
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setExistingDocs(docsData.documents ?? []);
      }
    } catch { /* ignore */ }
  };

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((f) => ({
      file:    f,
      type:    "OTHER" as DocType,
      preview: f.name,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf":  [".pdf"],
      "image/jpeg":       [".jpg", ".jpeg"],
      "image/png":        [".png"],
      "image/webp":       [".webp"],
    },
    maxSize: 15 * 1024 * 1024, // 15 MB
    multiple: true,
  });

  const setFileType = (idx: number, type: DocType) => {
    setFiles((prev) => prev.map((f, i) => i === idx ? { ...f, type } : f));
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!token || files.length === 0) return;
    setSubmitting(true);
    try {
      // Dokumente als Base64-Metadaten (ohne echten Storage) senden
      // In Produktion: vorher Upload zu S3/Supabase, URL übergeben
      const documents = files.map((f) => ({
        name:   f.file.name,
        type:   f.type,
        sizeMb: parseFloat((f.file.size / 1024 / 1024).toFixed(2)),
        url:    null,
      }));

      const res = await fetch("/api/kyc/submit", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ documents, notes: notes || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Fehler beim Einreichen");
      } else {
        toast.success("Dokumente erfolgreich eingereicht!", {
          description: "Ihre Dokumente werden in der Regel innerhalb von 24h geprüft.",
        });
        setFiles([]);
        setNotes("");
        setKycStatus("PENDING_VERIFICATION");
        await loadStatus(token);
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setSubmitting(false);
    }
  };

  const DOC_STATUS_STYLE: Record<string, { color: string; label: string }> = {
    PENDING:  { color: "#92400e", label: "In Prüfung" },
    APPROVED: { color: "#14532d", label: "Genehmigt" },
    REJECTED: { color: "#7f1d1d", label: "Abgelehnt" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');

        .ver-root { font-family: 'IBM Plex Sans', Arial, sans-serif; background: #f0f2f5; min-height: 100vh; color: #0d1b2a; }
        .ver-header { background: #0d1b2a; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .ver-header-logo { font-size: 15px; font-weight: 700; color: #fff; }
        .ver-header-back { font-size: 13px; color: #9ca3af; text-decoration: none; transition: color 0.15s; }
        .ver-header-back:hover { color: #fff; }

        .ver-main { max-width: 760px; margin: 0 auto; padding: 32px 16px; }

        /* Titel-Block */
        .ver-title { font-size: 28px; font-weight: 300; margin-bottom: 6px; }
        .ver-title strong { font-weight: 700; }
        .ver-subtitle { font-size: 14px; color: #6b7280; margin-bottom: 28px; line-height: 1.6; }

        /* Status-Card */
        .ver-status-card { background: #fff; border: 1px solid #e5e7eb; padding: 20px 24px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }

        /* Dropzone */
        .ver-drop { border: 2px dashed #d1d5db; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.15s; background: #fff; margin-bottom: 20px; touch-action: manipulation; }
        .ver-drop.active { border-color: #154194; background: #eff4ff; }
        .ver-drop:hover  { border-color: #9ca3af; }
        .ver-drop-icon  { font-size: 40px; margin-bottom: 12px; }
        .ver-drop-text  { font-size: 15px; font-weight: 600; color: #0d1b2a; margin-bottom: 6px; }
        .ver-drop-hint  { font-size: 13px; color: #9ca3af; }
        .ver-drop-types { font-size: 12px; color: #6b7280; margin-top: 8px; }

        /* File-Liste */
        .ver-file-item { background: #fff; border: 1px solid #e5e7eb; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ver-file-name { font-size: 13px; font-weight: 600; flex: 1; min-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ver-file-size { font-size: 12px; color: #9ca3af; }
        .ver-file-select { border: 1px solid #d1d5db; padding: 7px 10px; font-size: 13px; font-family: inherit; outline: none; cursor: pointer; }
        .ver-file-remove { background: none; border: none; color: #dc2626; font-size: 18px; cursor: pointer; padding: 0 6px; line-height: 1; }

        /* Notes */
        .ver-notes-label { font-size: 13px; font-weight: 600; color: #0d1b2a; margin-bottom: 8px; display: block; }
        .ver-notes-input { width: 100%; border: 1px solid #d1d5db; padding: 12px; font-size: 13px; font-family: inherit; resize: vertical; min-height: 80px; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .ver-notes-input:focus { border-color: #154194; }

        /* Submit */
        .ver-submit { width: 100%; height: 52px; background: #154194; color: #fff; font-size: 15px; font-weight: 700; border: none; cursor: pointer; margin-top: 20px; letter-spacing: 0.04em; transition: background 0.15s; touch-action: manipulation; }
        .ver-submit:hover:not(:disabled) { background: #1a52c2; }
        .ver-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Existing docs */
        .ver-section-title { font-size: 14px; font-weight: 700; color: #0d1b2a; margin: 28px 0 12px; }
        .ver-doc-item { background: #fff; border: 1px solid #e5e7eb; padding: 14px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .ver-doc-info { flex: 1; }
        .ver-doc-name { font-size: 13px; font-weight: 600; }
        .ver-doc-type { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .ver-doc-admin-note { font-size: 12px; color: #dc2626; margin-top: 6px; }

        /* Required docs info */
        .ver-required { background: #f0f4ff; border: 1px solid #c7d7fc; padding: 16px 20px; margin-bottom: 24px; }
        .ver-required-title { font-size: 13px; font-weight: 700; color: #1e3a8a; margin-bottom: 8px; }
        .ver-required li { font-size: 13px; color: #2d4a8a; margin-bottom: 4px; padding-left: 16px; position: relative; }
        .ver-required li::before { content: "→"; position: absolute; left: 0; }

        @media (max-width: 600px) {
          .ver-main { padding: 20px 12px; }
          .ver-title { font-size: 22px; }
          .ver-drop { padding: 32px 16px; }
          .ver-drop-icon { font-size: 32px; }
        }
      `}</style>

      <div className="ver-root">
        {/* Header */}
        <div className="ver-header">
          <span className="ver-header-logo">EUCX — Identitätsprüfung</span>
          <Link href="/dashboard" className="ver-header-back">← Zurück zum Dashboard</Link>
        </div>

        <div className="ver-main">
          <h1 className="ver-title">Identitäts-<strong>prüfung</strong></h1>
          <p className="ver-subtitle">
            Laden Sie Ihre Unterlagen hoch, um als verifizierter Händler an Auktionen teilnehmen zu können.
            Die Prüfung dauert in der Regel unter 24 Stunden.
          </p>

          {/* Aktueller Status */}
          <div className="ver-status-card">
            <span style={{ fontSize: 14, fontWeight: 600 }}>Ihr aktueller Status:</span>
            <KycStatusBadge status={kycStatus} />
          </div>

          {/* Benötigte Dokumente */}
          <div className="ver-required">
            <div className="ver-required-title">Benötigte Dokumente:</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              <li>Handelsregisterauszug (nicht älter als 3 Monate)</li>
              <li>USt-IdNr.-Bestätigung (Bundeszentralamt für Steuern)</li>
              <li>Personalausweis / Reisepass des Geschäftsführers</li>
            </ul>
          </div>

          {kycStatus !== "VERIFIED" && (
            <>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`ver-drop${isDragActive ? " active" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="ver-drop-icon">📎</div>
                <div className="ver-drop-text">
                  {isDragActive ? "Dateien loslassen …" : "Dateien hier ablegen oder tippen zum Auswählen"}
                </div>
                <div className="ver-drop-hint">Auch auf dem iPad: Foto direkt aus der Kamera hochladen</div>
                <div className="ver-drop-types">PDF, JPG, PNG, WEBP — max. 15 MB pro Datei</div>
              </div>

              {/* Ausgewählte Dateien */}
              {files.length > 0 && (
                <>
                  {files.map((f, idx) => (
                    <div className="ver-file-item" key={idx}>
                      <span style={{ fontSize: 20 }}>📄</span>
                      <span className="ver-file-name">{f.file.name}</span>
                      <span className="ver-file-size">{(f.file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <select
                        className="ver-file-select"
                        value={f.type}
                        onChange={(e) => setFileType(idx, e.target.value as DocType)}
                      >
                        {(Object.entries(DOC_TYPE_LABELS) as [DocType, string][]).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <button className="ver-file-remove" onClick={() => removeFile(idx)}>×</button>
                    </div>
                  ))}

                  {/* Optionale Notiz */}
                  <label className="ver-notes-label">
                    Optionale Notiz an den Prüfer:
                  </label>
                  <textarea
                    className="ver-notes-input"
                    placeholder="z. B. 'Unternehmen wurde 2024 gegründet, Handelsregister noch in Bearbeitung'"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={2000}
                  />

                  <button
                    className="ver-submit"
                    disabled={submitting || files.length === 0}
                    onClick={handleSubmit}
                  >
                    {submitting ? "Wird eingereicht …" : `${files.length} Dokument${files.length > 1 ? "e" : ""} einreichen →`}
                  </button>
                </>
              )}
            </>
          )}

          {kycStatus === "VERIFIED" && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #86efac", padding: "20px 24px",
              fontSize: 14, color: "#14532d", fontWeight: 600,
            }}>
              Ihr Konto ist vollständig verifiziert. Sie können an allen Auktionen teilnehmen.
            </div>
          )}

          {/* Eingereichte Dokumente */}
          {existingDocs.length > 0 && (
            <>
              <div className="ver-section-title">Eingereichte Dokumente ({existingDocs.length})</div>
              {existingDocs.map((doc) => {
                const st = DOC_STATUS_STYLE[doc.status] ?? { color: "#6b7280", label: doc.status };
                return (
                  <div className="ver-doc-item" key={doc.id}>
                    <div className="ver-doc-info">
                      <div className="ver-doc-name">{doc.name}</div>
                      <div className="ver-doc-type">{DOC_TYPE_LABELS[doc.type as DocType] ?? doc.type}</div>
                      {doc.adminNote && (
                        <div className="ver-doc-admin-note">Hinweis: {doc.adminNote}</div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: st.color,
                      padding: "3px 10px", background: `${st.color}18`, whiteSpace: "nowrap",
                    }}>
                      {st.label}
                    </span>
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
