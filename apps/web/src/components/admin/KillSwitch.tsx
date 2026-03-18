"use client";

/**
 * KillSwitch - Emergency Console (Redis-Handelsstopp)
 *
 * Doppelte Bestätigung:
 *   Schritt 1: Klick auf "HANDEL EINFRIEREN" → Formular mit Begründung
 *   Schritt 2: Eingabe "EINFRIEREN" als Tipp-Bestätigung → Ausführen
 *
 * Visuell:
 *   - Inaktiv: dezent roter Rahmen, Text "Handel läuft normal"
 *   - Aktiv:   pulsierendes rotes Glühen, Text "HANDEL EINGEFROREN"
 *   - Aufheben: separater gelber Button mit einfacher Bestätigung
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn }                           from "@/lib/utils";
import { Card, CardTitle }             from "@/components/ui/card";
import { Button }                      from "@/components/ui/button";
import { useToast }                    from "@/components/ui/toast";

// ─── Konstanten ───────────────────────────────────────────────────────────────

const CONFIRM_WORD     = "EINFRIEREN";
const DEFAULT_DURATION = 3600; // 1 Stunde

// ─── Typen ────────────────────────────────────────────────────────────────────

interface HaltEntry {
  key:   string;
  scope: string;
  ttl:   number;   // Sekunden bis Ablauf (-1 = kein TTL)
  meta:  string | null;
}

interface HaltStatus {
  halts:          HaltEntry[];
  redisAvailable: boolean;
  warning?:       string;
}

// ─── Fetch / Mutations ────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/access_token=([^;]+)/)?.[1] ?? localStorage.getItem("access_token") ?? "";
}

async function fetchHaltStatus(): Promise<HaltStatus> {
  const res = await fetch("/api/admin/halt", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Halt-Status konnte nicht geladen werden");
  return res.json() as Promise<HaltStatus>;
}

async function activateHalt(payload: { reason: string; durationSeconds: number }): Promise<void> {
  const res = await fetch("/api/admin/halt", {
    method:  "POST",
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Aktivierung fehlgeschlagen");
  }
}

async function releaseHalt(): Promise<void> {
  const res = await fetch("/api/admin/halt", {
    method:  "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Aufhebung fehlgeschlagen");
  }
}

// ─── TTL-Countdown ────────────────────────────────────────────────────────────

function TtlCountdown({ ttl }: { ttl: number }) {
  const [remaining, setRemaining] = useState(ttl);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (ttl < 0) return;
    setRemaining(ttl);
    ref.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [ttl]);

  if (ttl < 0) return <span className="font-mono text-red-300">∞ (dauerhaft)</span>;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const fmt = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return <span className="font-mono text-red-300 tabular-nums">{fmt}</span>;
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function KillSwitch() {
  const toast         = useToast();
  const queryClient   = useQueryClient();

  const [step,          setStep         ] = useState<"idle" | "confirm1" | "confirm2" | "releasing">("idle");
  const [reason,        setReason       ] = useState("");
  const [confirmInput,  setConfirmInput ] = useState("");
  const [duration,      setDuration     ] = useState(DEFAULT_DURATION);

  const { data, isLoading, refetch } = useQuery({
    queryKey:        ["admin", "halt"],
    queryFn:         fetchHaltStatus,
    staleTime:       10_000,
    refetchInterval: 15_000,
  });

  const isHalted = (data?.halts ?? []).some((h) => h.scope === "all");
  const globalHalt = (data?.halts ?? []).find((h) => h.scope === "all");

  const activateMutation = useMutation({
    mutationFn: activateHalt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "halt"] });
      setStep("idle");
      setReason("");
      setConfirmInput("");
      toast.error("HANDEL EINGEFROREN", "Der globale Handelsstopp ist jetzt aktiv. Alle Sitzungen wurden eingefroren.");
    },
    onError: (err) => {
      toast.error("Aktivierung fehlgeschlagen", err instanceof Error ? err.message : "Unbekannter Fehler");
      setStep("idle");
    },
  });

  const releaseMutation = useMutation({
    mutationFn: releaseHalt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "halt"] });
      void refetch();
      setStep("idle");
      toast.success("Handelsstopp aufgehoben", "Der Handel wurde wieder freigegeben.");
    },
    onError: (err) => {
      toast.error("Aufhebung fehlgeschlagen", err instanceof Error ? err.message : "Unbekannter Fehler");
    },
  });

  const handleActivate = () => {
    if (confirmInput !== CONFIRM_WORD) return;
    activateMutation.mutate({ reason: reason.trim(), durationSeconds: duration });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Card
      padding="md"
      className={cn(
        "border-2 transition-all duration-500",
        isHalted
          ? "border-red-500 shadow-[0_0_32px_rgba(239,68,68,0.35)] animate-pulse-slow"
          : "border-red-200",
      )}
    >
      {/* Status-Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <CardTitle className={cn(isHalted ? "text-red-600" : "text-cb-petrol")}>
            Emergency Console
          </CardTitle>
          <p className="text-xs text-cb-gray-500 mt-0.5">
            Redis Kill-Switch · Globaler Handelsstopp
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm",
          isHalted
            ? "bg-red-100 border-red-400 text-red-700"
            : "bg-green-50 border-green-300 text-cb-success",
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            isHalted ? "bg-red-500 animate-pulse" : "bg-cb-success",
          )} />
          {isLoading ? "…" : isHalted ? "EINGEFROREN" : "Handel aktiv"}
        </div>
      </div>

      {/* Aktiver Halt: Details + Aufheben */}
      {isHalted && globalHalt && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-red-600 font-semibold mb-1">Ablauf in</p>
              <TtlCountdown ttl={globalHalt.ttl} />
            </div>
            {globalHalt.meta && (() => {
              try {
                const m = JSON.parse(globalHalt.meta) as { reason?: string };
                return m.reason ? (
                  <div>
                    <p className="text-xs text-red-600 font-semibold mb-1">Begründung</p>
                    <p className="text-sm text-red-700">{m.reason}</p>
                  </div>
                ) : null;
              } catch { return null; }
            })()}
          </div>

          {step === "releasing" ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-red-700">Wirklich freigeben?</p>
              <Button
                variant="secondary"
                size="sm"
                loading={releaseMutation.isPending}
                className="bg-cb-success border-cb-success"
                onClick={() => releaseMutation.mutate()}
              >
                Ja, Handel freigeben
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep("idle")}>Abbrechen</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("releasing")}
              className="border-orange-400 text-orange-600 hover:bg-orange-50"
            >
              Handelsstopp aufheben
            </Button>
          )}
        </div>
      )}

      {/* Inaktiv: Kill-Switch aktivieren */}
      {!isHalted && (
        <>
          {step === "idle" && (
            <div className="space-y-4">
              <p className="text-sm text-cb-gray-500">
                Aktiviert einen sofortigen globalen Handelsstopp für alle Produkte und Sitzungen.
                Alle aktiven Orders werden eingefroren. Neue Orders werden mit HTTP 503 abgelehnt.
              </p>
              <Button
                variant="danger"
                size="lg"
                className="w-full text-base font-bold tracking-wider shadow-lg hover:shadow-red-300/50"
                onClick={() => setStep("confirm1")}
              >
                ⚠ HANDEL EINFRIEREN
              </Button>
            </div>
          )}

          {step === "confirm1" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">Schritt 1 von 2 - Begründung</p>
                <p className="text-xs text-red-600 mb-3">
                  Geben Sie die Begründung für den Handelsstopp ein. Diese wird im Audit-Log gespeichert.
                </p>
                <textarea
                  className="w-full border border-red-200 rounded p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 bg-cb-white"
                  rows={3}
                  placeholder="z.B. Verdacht auf Marktmanipulation - Untersuchung eingeleitet"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Dauer */}
              <div>
                <p className="text-xs text-cb-gray-500 mb-2 font-medium">Dauer des Stopps</p>
                <div className="flex gap-2">
                  {[
                    { label: "30 min",  val: 1800  },
                    { label: "1 Std",   val: 3600  },
                    { label: "4 Std",   val: 14400 },
                    { label: "Dauerhaft", val: 0   },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setDuration(opt.val)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded border font-medium transition-all",
                        duration === opt.val
                          ? "bg-red-100 border-red-400 text-red-700"
                          : "border-cb-gray-200 text-cb-gray-600 hover:border-red-300",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="md"
                  disabled={reason.trim().length < 10}
                  onClick={() => setStep("confirm2")}
                  className="flex-1"
                >
                  Weiter zur Bestätigung →
                </Button>
                <Button variant="ghost" size="md" onClick={() => { setStep("idle"); setReason(""); }}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}

          {step === "confirm2" && (
            <div className="space-y-4">
              <div className="bg-red-100 border-2 border-red-400 rounded p-4">
                <p className="text-sm font-bold text-red-800 mb-3">
                  Schritt 2 von 2 - Letzte Bestätigung
                </p>
                <p className="text-sm text-red-700 mb-4">
                  Tippen Sie <strong className="font-mono">{CONFIRM_WORD}</strong> ein, um den Handelsstopp zu aktivieren:
                </p>
                <input
                  type="text"
                  className="w-full border-2 border-red-300 rounded p-2.5 text-sm font-mono focus:outline-none focus:border-red-500 bg-cb-white text-center tracking-widest font-bold text-red-800 uppercase"
                  placeholder={CONFIRM_WORD}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  loading={activateMutation.isPending}
                  disabled={confirmInput !== CONFIRM_WORD}
                  onClick={handleActivate}
                  className="font-bold tracking-wider shadow-xl"
                >
                  JETZT EINFRIEREN
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStep("idle"); setReason(""); setConfirmInput(""); }}
                className="w-full"
              >
                Abbrechen - zurück zur Übersicht
              </Button>
            </div>
          )}
        </>
      )}

      {/* Redis-Status */}
      {data && !data.redisAvailable && (
        <div className="mt-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
          ⚠ Redis nicht erreichbar - Kill-Switch Status unbekannt
          {data.warning && <span className="ml-1">({data.warning})</span>}
        </div>
      )}
    </Card>
  );
}
