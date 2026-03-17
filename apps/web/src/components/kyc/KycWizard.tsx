"use client";

/**
 * KycWizard — KYC Multi-Step Onboarding
 *
 * 3 Schritte mit framer-motion Slide-Übergängen:
 *   1. Unternehmensinfo bestätigen (aus Auth-Token)
 *   2. Dokumente hochladen (react-dropzone, max 5 MB, PDF/Bilder)
 *   3. Zusammenfassung + Absenden
 *
 * Custom Stepper (Tailwind) ohne externe Bibliothek.
 */

import { useState, useCallback }      from "react";
import { useRouter }                  from "next/navigation";
import { motion, AnimatePresence }    from "framer-motion";
import { useDropzone }                from "react-dropzone";
import { Button }                     from "@/components/ui/Button";
import { Input }                      from "@/components/ui/Input";
import { useAuthStore }               from "@/store/authStore";
import { cn }                         from "@/lib/utils";

// ─── Konstanten ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES   = { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };
const STEPS            = ["Unternehmensdaten", "Dokumente hochladen", "Bestätigung & Absenden"];

// ─── Typen ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  file:     File;
  preview:  string;
  sizeStr:  string;
  error?:   string;
}

// ─── Schritt-Indikator ────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        const isLast  = i === total - 1;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Kreis */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                done   ? "bg-cb-petrol border-cb-petrol text-white" :
                active ? "bg-cb-yellow border-cb-yellow text-cb-gray-900" :
                         "bg-white border-cb-gray-300 text-cb-gray-400",
              )}>
                {done ? "✓" : i + 1}
              </div>
              <p className={cn(
                "text-xs font-medium whitespace-nowrap hidden sm:block",
                active ? "text-cb-petrol" : done ? "text-cb-petrol/70" : "text-cb-gray-400",
              )}>
                {label}
              </p>
            </div>

            {/* Verbindungslinie */}
            {!isLast && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 mt-[-1.25rem] sm:mt-[-1.25rem] transition-all",
                i < current ? "bg-cb-petrol" : "bg-cb-gray-200",
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Dropzone-Komponente ──────────────────────────────────────────────────────

function DocumentDropzone({ files, setFiles }: {
  files:    UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}) {
  const onDrop = useCallback((accepted: File[]) => {
    const enriched: UploadedFile[] = accepted.map((file) => {
      const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
      const error   = file.size > MAX_FILE_SIZE_MB * 1024 * 1024
        ? `Datei überschreitet ${MAX_FILE_SIZE_MB} MB`
        : undefined;
      return { file, preview, sizeStr, error };
    });
    setFiles((prev) => [...prev, ...enriched].slice(0, 10));
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept:      ACCEPTED_TYPES,
    maxSize:     MAX_FILE_SIZE_MB * 1024 * 1024,
    maxFiles:    10 - files.length,
  });

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = [...prev];
      if (next[idx]?.preview) URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop-Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-cb-yellow bg-cb-yellow/5"
            : "border-cb-gray-300 hover:border-cb-petrol hover:bg-cb-gray-50",
        )}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3 opacity-40 select-none">
          {isDragActive ? "📂" : "📄"}
        </div>
        {isDragActive ? (
          <p className="text-sm font-semibold text-cb-petrol">Dateien hier ablegen…</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-cb-gray-700 mb-1">
              Dateien hierher ziehen oder <span className="text-cb-petrol underline">durchsuchen</span>
            </p>
            <p className="text-xs text-cb-gray-400">
              PDF, JPG, PNG · Max. {MAX_FILE_SIZE_MB} MB pro Datei
            </p>
          </>
        )}
      </div>

      {/* Abgelehnte Dateien */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name} className="text-xs text-red-700">
              <strong>{file.name}</strong>: {errors.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {/* Hochgeladene Dateien */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded border",
                f.error ? "border-red-300 bg-red-50" : "border-cb-gray-200 bg-cb-gray-50",
              )}
            >
              {/* Vorschau */}
              {f.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.preview} alt={f.file.name} className="w-10 h-10 object-cover rounded" />
              ) : (
                <div className="w-10 h-10 bg-cb-petrol/10 rounded flex items-center justify-center text-lg">
                  📄
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cb-gray-700 truncate">{f.file.name}</p>
                <p className="text-xs text-cb-gray-400">{f.sizeStr}</p>
                {f.error && <p className="text-xs text-red-600">{f.error}</p>}
              </div>

              {/* Entfernen */}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-cb-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Slide-Animation ──────────────────────────────────────────────────────────

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

// ─── Haupt-Wizard ─────────────────────────────────────────────────────────────

export function KycWizard() {
  const router      = useRouter();
  const user        = useAuthStore((s) => s.user);
  const [step,    setStep   ] = useState(0);
  const [dir,     setDir    ] = useState(1);
  const [files,   setFiles  ] = useState<UploadedFile[]>([]);
  const [notes,   setNotes  ] = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone   ] = useState(false);
  const [error,   setError  ] = useState("");

  const navigate = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  // ── Step 0: Unternehmensinfo ───────────────────────────────────────────────
  const Step0 = () => (
    <div className="space-y-4">
      <p className="text-sm text-cb-gray-500">
        Bitte bestätigen Sie Ihre Unternehmensdaten. Diese werden für die KYC-Prüfung verwendet.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Organisation" value={user?.orgName ?? ""} disabled />
        <Input label="Nutzerrolle" value={user?.role ?? ""} disabled />
        <Input label="E-Mail" value={user?.email ?? ""} disabled className="col-span-2" />
      </div>
      <div className="bg-cb-yellow/10 border border-cb-yellow/30 rounded p-3 text-sm text-cb-gray-700">
        Sollten diese Daten nicht korrekt sein, kontaktieren Sie bitte{" "}
        <a href="mailto:support@eucx.eu" className="text-cb-petrol underline">support@eucx.eu</a>.
      </div>
    </div>
  );

  // ── Step 1: Dokumente ──────────────────────────────────────────────────────
  const Step1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-cb-gray-500">
        Laden Sie folgende Dokumente hoch:
      </p>
      <ul className="list-disc list-inside text-sm text-cb-gray-600 space-y-1 mb-4">
        <li>Gewerbeanmeldung oder Handelsregisterauszug</li>
        <li>Umsatzsteuer-Identifikationsnummer (USt-IdNr.)</li>
        <li>Personalausweis / Reisepass des Geschäftsführers</li>
      </ul>
      <DocumentDropzone files={files} setFiles={setFiles} />
    </div>
  );

  // ── Step 2: Bestätigung ────────────────────────────────────────────────────
  const Step2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-cb-gray-500">
        Überprüfen Sie Ihren Antrag bevor Sie ihn absenden.
      </p>

      {/* Zusammenfassung */}
      <div className="bg-cb-gray-50 rounded border border-cb-gray-200 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-cb-gray-500">Organisation</span>
          <span className="font-medium text-cb-petrol">{user?.orgName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-gray-500">Dokumente</span>
          <span className="font-medium">{files.filter((f) => !f.error).length} Datei(en)</span>
        </div>
      </div>

      {/* Dokument-Liste */}
      {files.filter((f) => !f.error).map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="text-cb-success">✓</span>
          <span className="text-cb-gray-700 truncate">{f.file.name}</span>
          <span className="text-cb-gray-400 shrink-0">{f.sizeStr}</span>
        </div>
      ))}

      {/* Anmerkungen */}
      <div>
        <label className="block text-sm font-semibold text-cb-gray-700 mb-1.5">
          Anmerkungen (optional)
        </label>
        <textarea
          className="w-full border border-cb-gray-300 rounded p-2.5 text-sm resize-none focus:outline-none focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20"
          rows={3}
          placeholder="Zusätzliche Informationen für das KYC-Team…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Einverständnis */}
      <div className="bg-cb-petrol/5 border border-cb-petrol/20 rounded p-3 text-xs text-cb-gray-600">
        Mit dem Absenden bestätigen Sie, dass alle angegebenen Informationen korrekt und vollständig sind.
        Die Prüfung dauert in der Regel 1–3 Werktage.
      </div>

      {error && (
        <p className="text-sm text-cb-error bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}
    </div>
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
      const res   = await fetch("/api/kyc/submit", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({
          documents: files.filter((f) => !f.error).map((f) => ({
            name:   f.file.name,
            type:   f.file.type,
            sizeMb: f.file.size / 1024 / 1024,
          })),
          notes: notes || undefined,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Fehler beim Absenden"); return; }
      setDone(true);
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-cb-petrol mb-2">Antrag eingereicht</h2>
        <p className="text-cb-gray-500 text-sm mb-6">
          Ihr KYC-Antrag wurde erfolgreich übermittelt. Wir prüfen Ihre Unterlagen und benachrichtigen Sie per E-Mail.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Zum Dashboard
        </Button>
      </div>
    );
  }

  const steps = [<Step0 key={0} />, <Step1 key={1} />, <Step2 key={2} />];

  const canProceed0 = true;
  const canProceed1 = files.filter((f) => !f.error).length > 0;
  const canProceed  = step === 0 ? canProceed0 : canProceed1;

  return (
    <div>
      <StepIndicator current={step} total={STEPS.length} />

      {/* Animierter Schritt-Inhalt */}
      <div className="min-h-[280px] relative overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <h3 className="text-base font-semibold text-cb-petrol mb-4">
              {STEPS[step]}
            </h3>
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-cb-gray-200">
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate(step - 1)}
          disabled={step === 0 || loading}
        >
          ← Zurück
        </Button>

        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(step + 1)}
              disabled={!canProceed}
            >
              Weiter →
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              loading={loading}
              disabled={files.filter((f) => !f.error).length === 0}
              onClick={() => { void handleSubmit(); }}
            >
              Antrag absenden
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
