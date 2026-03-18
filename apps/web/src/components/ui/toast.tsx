"use client";

/**
 * Toast — Globales Benachrichtigungssystem
 *
 * Architektur:
 *   ToastProvider  → hält [toasts]-State, stellt Context bereit
 *   useToast()     → Hook für success / error / info / warning
 *   ToastContainer → rendert feste Liste oben-rechts (fixed, z-50)
 *   ToastItem      → einzelne Benachrichtigung mit Auto-Dismiss + Close-Button
 *
 * Verwendung:
 *   // layout.tsx:
 *   <ToastProvider>...</ToastProvider>
 *
 *   // Irgendwo in der App:
 *   const { success, error } = useToast();
 *   success("Gespeichert", "Ihre Änderungen wurden gespeichert.");
 *   error("Fehler", "Server nicht erreichbar.");
 *
 * Auto-Dismiss: 5s (success/info) oder 8s (error/warning).
 * Maximal 4 gleichzeitige Toasts — ältester wird verdrängt.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ─── Typen ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info" | "warning";

interface ToastData {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error:   () => {},
  info:    () => {},
  warning: () => {},
  dismiss: () => {},
});

// ─── Toast-Item ───────────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "i",
  warning: "⚠",
};

const TOAST_DURATION_MS: Record<ToastType, number> = {
  success: 5_000,
  info:    5_000,
  warning: 8_000,
  error:   8_000,
};

const TOAST_STYLES: Record<ToastType, { border: string; icon: string; title: string }> = {
  success: { border: "border-l-emerald-500", icon: "bg-emerald-500 text-white", title: "text-emerald-700" },
  error:   { border: "border-l-red-500",     icon: "bg-red-500 text-white",     title: "text-red-700"     },
  info:    { border: "border-l-blue-500",    icon: "bg-blue-500 text-white",    title: "text-blue-700"    },
  warning: { border: "border-l-amber-500",   icon: "bg-amber-500 text-white",   title: "text-amber-700"   },
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const style = TOAST_STYLES[toast.type];
  const duration = TOAST_DURATION_MS[toast.type];

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    // Trigger reflow für CSS-Animation
    void el.offsetWidth;
    el.style.transition = `width ${duration}ms linear`;
    el.style.width = "0%";
  }, [duration]);

  return (
    <div
      className={cn(
        "toast-item flex items-start gap-3",
        "bg-white rounded-lg shadow-lg border border-l-4",
        "px-4 py-3 w-80 max-w-full pointer-events-auto",
        style.border,
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <span className={cn(
        "flex-none w-5 h-5 rounded-full flex items-center justify-center",
        "text-[11px] font-bold shrink-0 mt-0.5",
        style.icon,
      )}>
        {TOAST_ICONS[toast.type]}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold leading-tight", style.title)}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            {toast.message}
          </p>
        )}
        {/* Fortschrittsbalken */}
        <div className="mt-2 h-0.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gray-300 rounded-full"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Schließen */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-none text-gray-400 hover:text-gray-600 transition-colors text-base leading-none mt-0.5"
        aria-label="Schließen"
      >
        ×
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const MAX_TOASTS = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => {
      const next = [...prev, { id, type, title, message }];
      // Älteste verdrängen wenn Limit überschritten
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });

    const duration = TOAST_DURATION_MS[type];
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const value: ToastContextValue = {
    success: (t, m) => addToast("success", t, m),
    error:   (t, m) => addToast("error",   t, m),
    info:    (t, m) => addToast("info",    t, m),
    warning: (t, m) => addToast("warning", t, m),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container: rendert außerhalb des normalen Layouts */}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-label="Benachrichtigungen"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
