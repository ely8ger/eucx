"use client";

/**
 * ConfirmOrderModal - Bestätigungsdialog für große Aufträge
 *
 * Wird angezeigt wenn der Gesamtwert ≥ LARGE_ORDER_EUR (500.000 €).
 * Zeigt eine vollständige Auftragsübersicht inkl. Gebührenschätzung bevor
 * der Auftrag tatsächlich an den Server gesendet wird.
 *
 * Tastatur-Shortcuts:
 *   Enter   → Bestätigen
 *   Escape  → Abbrechen
 */

import { useEffect, useCallback } from "react";
import Decimal                    from "decimal.js";
import { cn }                     from "@/lib/utils";
import { calculateFees }          from "@/lib/clearing/fee-calculator";

// ─── Typen ────────────────────────────────────────────────────────────────────

interface ConfirmOrderModalProps {
  isOpen:    boolean;
  direction: "BUY" | "SELL";
  price:     string;
  qty:       string;
  symbol?:   string;
  onConfirm: () => void;
  onCancel:  () => void;
}

// ─── Hilfsfunktion: Gebührenschätzung ────────────────────────────────────────

function estimateFee(priceStr: string, qtyStr: string) {
  try {
    const gross = new Decimal(priceStr).times(new Decimal(qtyStr)).toFixed(2);
    return calculateFees({
      grossAmount:   gross,
      currency:      "EUR",
      buyerCountry:  "DE",
      sellerCountry: "DE",
      // Ohne USt-IdNr → Inlandsgeschäft (ungünstigster Fall für Schätzung)
    });
  } catch {
    return null;
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ConfirmOrderModal({
  isOpen,
  direction,
  price,
  qty,
  symbol = "REBAR-EU",
  onConfirm,
  onCancel,
}: ConfirmOrderModalProps) {
  // Keyboard-Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter")  { e.preventDefault(); onConfirm(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel();  }
  }, [onConfirm, onCancel]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isBuy   = direction === "BUY";
  const feeCalc = estimateFee(price, qty);
  const total   = feeCalc
    ? new Decimal(feeCalc.grossAmount).toLocaleString()
    : "-";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal
        aria-labelledby="confirm-modal-title"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className={cn(
            "px-6 py-4 rounded-t-xl flex items-center gap-3 border-b border-gray-100",
            isBuy ? "bg-green-50" : "bg-red-50",
          )}>
            <span className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
              isBuy ? "bg-green-600" : "bg-red-600",
            )}>
              {isBuy ? "K" : "V"}
            </span>
            <div>
              <h2 id="confirm-modal-title" className="text-base font-bold text-gray-900">
                Großauftrag bestätigen
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Auftragsvolumen überschreitet 500.000 € - bitte prüfen
              </p>
            </div>
          </div>

          {/* Auftrags-Details */}
          <div className="px-6 py-4 space-y-0">
            {[
              { label: "Instrument",  value: symbol },
              {
                label: "Richtung",
                value: isBuy ? "KAUF" : "VERKAUF",
                accent: isBuy ? "text-green-700 font-bold" : "text-red-700 font-bold",
              },
              { label: "Preis",     value: `${new Decimal(price).toFixed(2).replace(".", ",")} €/t` },
              { label: "Menge",     value: `${new Decimal(qty).toFixed(0)} t` },
              { label: "Bruttowert", value: feeCalc
                ? new Decimal(feeCalc.grossAmount).toNumber().toLocaleString("de-DE", {
                    style: "currency", currency: "EUR",
                  })
                : "-",
                highlight: true,
              },
              { label: "EUCX-Gebühr", value: feeCalc
                ? `${new Decimal(feeCalc.platformFee).toNumber().toLocaleString("de-DE", {
                    style: "currency", currency: "EUR",
                  })} (${feeCalc.feeRatePct})`
                : "-",
              },
              { label: "MwSt.-Hinweis", value: feeCalc?.taxNote ?? "-", small: true },
            ].map(({ label, value, accent, highlight, small }) => (
              <div key={label} className="flex justify-between items-baseline py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={cn(
                  small ? "text-xs" : "text-sm",
                  highlight ? "font-bold text-gray-900" : "font-medium text-gray-700",
                  accent,
                )}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Warnung */}
          <div className="mx-6 mb-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Hinweis:</strong> Gebühr und MwSt. sind Schätzungen (DE→DE, ohne USt-IdNr.).
              Endabrechnung erfolgt nach Matching. Aufträge können nach Erteilung nicht zurückgezogen werden.
            </p>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Abbrechen <span className="text-gray-400 font-normal text-xs">(Esc)</span>
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "flex-1 h-11 rounded-lg text-sm font-bold text-white transition-all",
                isBuy
                  ? "bg-green-600 hover:bg-green-500 active:bg-green-700"
                  : "bg-red-600 hover:bg-red-500 active:bg-red-700",
              )}
            >
              {isBuy ? "Kaufauftrag erteilen" : "Verkaufsauftrag erteilen"}
              <span className="text-white/60 font-normal text-xs ml-1">(Enter)</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
