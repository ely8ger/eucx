"use client";

/**
 * SignContractModal — Elektronische Signatur (Mock-QES)
 *
 * Workflow im Modal:
 *   [Schritt 1] Deal-Zusammenfassung anzeigen → "Vertrag generieren"
 *   [Schritt 2] PDF wird generiert → 6-stelliger EDS-Token erscheint
 *               (simuliert Authenticator-App / Hardware-Token)
 *   [Schritt 3] User gibt Token ein → "Jetzt rechtsverbindlich unterzeichnen"
 *   [Schritt 4] Erfolg: SHA-256 Hash + Bestätigung
 *
 * Der EDS-Token ist 5 Minuten gültig.
 * Nach Ablauf: neuen Vertrag anfordern.
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DealSummary {
  dealId:       string;
  productName:  string;
  quantity:     string;
  unit:         string;
  pricePerUnit: string;
  totalValue:   string;
  currency:     string;
  buyerName:    string;
  sellerName:   string;
  dealDate:     string;
}

interface SignContractModalProps {
  deal:    DealSummary;
  token:   string;            // JWT Access Token
  onClose: () => void;
  onSigned?: (pdfHash: string) => void;
}

type Step = "summary" | "generating" | "sign" | "signed" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignContractModal({ deal, token, onClose, onSigned }: SignContractModalProps) {
  const [step, setStep]             = useState<Step>("summary");
  const [contractId, setContractId] = useState<string | null>(null);
  const [edsToken, setEdsToken]     = useState<string>("");    // Generierter Token (angezeigt)
  const [edsTokenExp, setEdsTokenExp] = useState<string>("");
  const [edsInput, setEdsInput]     = useState<string>("");    // Nutzereingabe
  const [pdfHash, setPdfHash]       = useState<string>("");
  const [signedAt, setSignedAt]     = useState<string>("");
  const [errorMsg, setErrorMsg]     = useState<string>("");
  const [loading, setLoading]       = useState(false);

  // ── Schritt 1 → 2: Vertrag generieren ───────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setStep("generating");

    try {
      const res = await fetch("/api/contracts", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ dealId: deal.dealId }),
      });

      const data = await res.json() as {
        contractId?: string;
        edsToken?:   string;
        edsTokenExp?: string;
        pdfHash?:    string;
        status?:     string;
        error?:      string;
        message?:    string;
      };

      if (!res.ok) {
        setErrorMsg(data.error ?? "Fehler bei der Vertragsgenerierung");
        setStep("error");
        return;
      }

      // Bereits signiert?
      if (data.status === "SIGNED") {
        setPdfHash(data.pdfHash ?? "");
        setStep("signed");
        return;
      }

      setContractId(data.contractId ?? null);
      setEdsToken(data.edsToken ?? "");
      setEdsTokenExp(data.edsTokenExp ?? "");
      setStep("sign");
    } catch {
      setErrorMsg("Netzwerkfehler — bitte erneut versuchen");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }, [deal.dealId, token]);

  // ── Schritt 2 → 3: Token bestätigen & signieren ─────────────────────────
  const handleSign = useCallback(async () => {
    if (!contractId || edsInput.length !== 6) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ edsToken: edsInput }),
      });

      const data = await res.json() as {
        status?:   string;
        signedAt?: string;
        pdfHash?:  string;
        error?:    string;
      };

      if (!res.ok) {
        setErrorMsg(data.error ?? "Signatur fehlgeschlagen");
        setStep("error");
        return;
      }

      setPdfHash(data.pdfHash ?? "");
      setSignedAt(data.signedAt ?? "");
      setStep("signed");
      onSigned?.(data.pdfHash ?? "");
    } catch {
      setErrorMsg("Netzwerkfehler");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }, [contractId, edsInput, token, onSigned]);

  // ── PDF herunterladen ────────────────────────────────────────────────────
  const handleDownloadPdf = useCallback(() => {
    if (!contractId) return;
    const url = `/api/contracts/${contractId}?action=pdf`;
    const a   = document.createElement("a");
    a.href    = url;
    a.setAttribute("download", `eucx-vertrag-${contractId.slice(0, 8)}.pdf`);
    // Auth-Header geht nicht bei <a download> — separat fetchen
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert("Download fehlgeschlagen"));
  }, [contractId, token]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-cb-petrol px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Elektronische Signatur</h2>
            <p className="text-white/70 text-xs mt-0.5">
              QES-Simulation gemäß EU-eIDAS · EUCX EDS v1
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Progress-Schritte */}
        <div className="flex border-b border-gray-100">
          {[
            { label: "Übersicht",   id: "summary"    },
            { label: "EDS-Token",   id: "sign"       },
            { label: "Unterzeichnet", id: "signed"   },
          ].map((s, i) => {
            const isActive = s.id === step || (step === "generating" && s.id === "sign");
            const isDone   =
              (s.id === "summary" && ["sign", "generating", "signed"].includes(step)) ||
              (s.id === "sign"    && step === "signed");
            return (
              <div key={s.id} className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
                isDone   ? "text-cb-success bg-green-50" :
                isActive ? "text-cb-petrol border-b-2 border-cb-petrol" :
                "text-cb-gray-400"
              }`}>
                <span className="inline-flex items-center gap-1">
                  {isDone ? "✓" : `${i + 1}.`} {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-6">

          {/* ── Schritt 1: Deal-Zusammenfassung ── */}
          {step === "summary" && (
            <div className="space-y-4">
              <div className="bg-cb-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-cb-petrol text-sm">Deal-Zusammenfassung</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-cb-gray-500">Produkt</span>
                  <span className="font-medium text-right">{deal.productName}</span>
                  <span className="text-cb-gray-500">Menge</span>
                  <span className="font-mono text-right">{deal.quantity} {deal.unit}</span>
                  <span className="text-cb-gray-500">Preis/Einheit</span>
                  <span className="font-mono text-right">
                    {parseFloat(deal.pricePerUnit).toLocaleString("de-DE", { minimumFractionDigits: 2 })} {deal.currency}
                  </span>
                  <span className="text-cb-gray-500">Gesamtwert</span>
                  <span className="font-mono font-bold text-cb-petrol text-right">
                    {parseFloat(deal.totalValue).toLocaleString("de-DE", { minimumFractionDigits: 2 })} {deal.currency}
                  </span>
                  <span className="text-cb-gray-500">Käufer</span>
                  <span className="text-right">{deal.buyerName}</span>
                  <span className="text-cb-gray-500">Verkäufer</span>
                  <span className="text-right">{deal.sellerName}</span>
                  <span className="text-cb-gray-500">Datum</span>
                  <span className="text-right text-xs">
                    {new Date(deal.dealDate).toLocaleString("de-DE")}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <strong>Hinweis:</strong> Das generierte PDF erhält einen SHA-256-Prüfwert.
                Jede nachträgliche Änderung am Dokument würde den Hash ungültig machen.
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
              >
                Vertragsdokument generieren
              </Button>
            </div>
          )}

          {/* ── Generierung läuft ── */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-12 h-12 border-4 border-cb-petrol/20 border-t-cb-petrol rounded-full animate-spin" />
              <p className="text-cb-gray-500 text-sm">PDF wird generiert…</p>
              <p className="text-cb-gray-400 text-xs">SHA-256-Hash wird berechnet</p>
            </div>
          )}

          {/* ── Schritt 2: EDS-Token bestätigen ── */}
          {step === "sign" && (
            <div className="space-y-4">
              {/* Token-Anzeige (simuliert Authenticator-App) */}
              <div className="bg-cb-petrol rounded-xl p-5 text-center">
                <p className="text-white/70 text-xs mb-2 uppercase tracking-wider">
                  Ihr EDS-Token (5 Minuten gültig)
                </p>
                <div className="flex justify-center gap-2">
                  {edsToken.split("").map((digit, i) => (
                    <div
                      key={i}
                      className="w-10 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white font-mono text-2xl font-bold"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-3">
                  Simulierter TOTP-Token · In Produktion: Authenticator-App oder Hardware-Token
                </p>
                {edsTokenExp && (
                  <p className="text-cb-yellow text-xs mt-1">
                    Gültig bis: {new Date(edsTokenExp).toLocaleTimeString("de-DE")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cb-gray-700 mb-1">
                  Token eingeben zur Bestätigung
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={edsInput}
                  onChange={(e) => setEdsInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-stelliger Code"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                <strong>Rechtlicher Hinweis:</strong> Durch die Eingabe des Tokens bestätigen Sie
                verbindlich den obenstehenden Handel gemäß EUCX-Handelsregeln und EU-eIDAS.
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSign}
                disabled={loading || edsInput.length !== 6}
              >
                {loading ? "Wird signiert…" : "Jetzt rechtsverbindlich unterzeichnen"}
              </Button>

              <Button variant="ghost" fullWidth size="sm" onClick={() => setStep("summary")}>
                Zurück zur Übersicht
              </Button>
            </div>
          )}

          {/* ── Schritt 3: Erfolgreich signiert ── */}
          {step === "signed" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl text-cb-success">✓</span>
                </div>
                <h3 className="font-bold text-cb-petrol text-lg">Vertrag unterzeichnet</h3>
                <p className="text-cb-gray-500 text-sm mt-1 text-center">
                  Rechtsgültig gemäß EU-eIDAS-Verordnung
                </p>
                {signedAt && (
                  <p className="text-xs text-cb-gray-400 mt-1">
                    Unterzeichnet: {new Date(signedAt).toLocaleString("de-DE")}
                  </p>
                )}
              </div>

              {pdfHash && (
                <div className="bg-cb-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-cb-gray-500 uppercase tracking-wider mb-2">
                    SHA-256 Integritäts-Fingerprint
                  </p>
                  <p className="font-mono text-xs text-cb-gray-700 break-all leading-relaxed">
                    {pdfHash}
                  </p>
                  <p className="text-xs text-cb-gray-400 mt-2">
                    Dieser Hash ist im EUCX-AuditLog unveränderlich gespeichert.
                    Jede PDF-Manipulation ergibt einen anderen Hash.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {contractId && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleDownloadPdf}
                  >
                    PDF herunterladen
                  </Button>
                )}
                <Button variant="primary" fullWidth onClick={onClose}>
                  Fertig
                </Button>
              </div>
            </div>
          )}

          {/* ── Fehler ── */}
          {step === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-medium">{errorMsg}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => { setStep("summary"); setErrorMsg(""); }}>
                  Erneut versuchen
                </Button>
                <Button variant="secondary" fullWidth onClick={onClose}>
                  Schließen
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
