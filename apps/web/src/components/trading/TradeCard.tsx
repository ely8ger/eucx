"use client";

/**
 * TradeCard - Order-Eingabe mit vollständiger UX
 *
 * Features:
 *   - BUY/SELL-Toggle
 *   - Preis-Eingabe mit Quick-Step-Buttons (±0.5 / ±1 / ±2 / ±5 €/t)
 *   - Mengen-Eingabe mit Feldvalidierung (Zod, onBlur)
 *   - Inline-Feldfehlermeldungen
 *   - Marktpreis-Warnung: "Ihr Preis überschreitet den besten Ask um X €"
 *   - Gesamtwert-Anzeige in Echtzeit
 *   - ConfirmOrderModal bei Auftragsvolumen ≥ 500.000 €
 *   - Toast-Feedback nach Einreichung (via useOrderForm + useToast)
 *
 * Varianten:
 *   "light" - Commerzbank-Hell-Design (für TradingRoom)
 *   "dark"  - Terminal-Dark-Design (für TradingTerminal)
 */

import { useState, useCallback, useEffect } from "react";
import Decimal                   from "decimal.js";
import { cn }                    from "@/lib/utils";
import { useOrderForm }          from "@/hooks/useOrderForm";
import { ConfirmOrderModal }     from "@/components/trading/ConfirmOrderModal";
import { PRICE_STEPS }           from "@/lib/validation/order-schema";
import type { TradingAction }    from "@/hooks/useTrading";

// ─── Typen ────────────────────────────────────────────────────────────────────

interface TradeCardProps {
  sessionId:  string | null;
  productId:  string;
  dispatch:   React.Dispatch<TradingAction>;
  symbol?:    string;
  variant?:   "light" | "dark";
  /** Bestes Verkaufsangebot - für Marktpreis-Warnung */
  bestAsk?:   string | null;
  /** Bestes Kaufgebot - für Marktpreis-Warnung */
  bestBid?:   string | null;
  /**
   * Überschreibt Preis + Richtung von außen (Klick im Orderbuch).
   * `key` muss bei jedem Klick inkrementiert werden - auch bei gleichem Preis.
   */
  priceOverride?: { price: string; direction: "BUY" | "SELL"; key: number };
}

// ─── Marktpreis-Warnung ───────────────────────────────────────────────────────

function MarketWarning({ message, dark }: { message: string; dark: boolean }) {
  return (
    <div className={cn(
      "flex items-start gap-1.5 px-2.5 py-2 rounded text-xs",
      dark
        ? "bg-amber-900/20 border border-amber-700/40 text-amber-400"
        : "bg-amber-50 border border-amber-200 text-amber-700",
    )}>
      <span className="shrink-0 mt-0.5">⚠</span>
      <span>{message}</span>
    </div>
  );
}

// ─── Field-Error ──────────────────────────────────────────────────────────────

function FieldError({ message, dark }: { message: string; dark: boolean }) {
  return (
    <p className={cn(
      "text-xs flex items-center gap-1 mt-1",
      dark ? "text-red-400" : "text-[#E30613]",
    )}>
      <span>⚠</span> {message}
    </p>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function TradeCard({
  sessionId,
  productId,
  dispatch,
  symbol = "REBAR-EU",
  variant = "light",
  bestAsk,
  bestBid,
  priceOverride,
}: TradeCardProps) {
  const dark = variant === "dark";
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useOrderForm({ sessionId, productId, dispatch });

  // Preis/Richtung von außen übernehmen (Klick im Orderbuch)
  const overrideKey = priceOverride?.key ?? -1;
  useEffect(() => {
    if (!priceOverride) return;
    form.setPrice(priceOverride.price);
    form.setDirection(priceOverride.direction);
  // key-basierter Trigger - kein vollständiges Dep-Array gewünscht
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideKey]);

  // ── Preisschritte ────────────────────────────────────────────────────────
  const adjustPrice = useCallback((delta: number) => {
    try {
      const current = new Decimal(form.price || "0");
      form.setPrice(current.plus(delta).toFixed(2));
    } catch {
      form.setPrice(new Decimal(delta > 0 ? delta : 0).toFixed(2));
    }
  }, [form]);

  // ── Submit-Flow: mit Bestätigungsdialog wenn nötig ───────────────────────
  const handleSubmitClick = useCallback(async () => {
    if (form.needsConfirm) {
      setShowConfirm(true);
    } else {
      await form.submitOrder();
    }
  }, [form]);

  const handleConfirm = useCallback(async () => {
    setShowConfirm(false);
    await form.submitOrder();
  }, [form]);

  // ── Marktpreis-Warnung berechnen ─────────────────────────────────────────
  let marketWarning: string | null = null;
  try {
    const p = new Decimal(form.price || "0");
    if (form.direction === "BUY" && bestAsk) {
      const ask = new Decimal(bestAsk);
      if (p.gt(ask)) {
        marketWarning = `Kaufpreis liegt ${p.minus(ask).toFixed(2)} €/t über dem besten Angebot`;
      }
    }
    if (form.direction === "SELL" && bestBid) {
      const bid = new Decimal(bestBid);
      if (p.lt(bid)) {
        marketWarning = `Verkaufspreis liegt ${bid.minus(p).toFixed(2)} €/t unter dem besten Gebot`;
      }
    }
  } catch { /* ungültige Eingabe */ }

  // ── Styling-Helfer ───────────────────────────────────────────────────────
  const wrapCls = dark
    ? "flex flex-col gap-3"
    : "flex flex-col gap-3";

  const labelCls = dark
    ? "block text-[10px] text-[#4A5A7A] uppercase tracking-wider mb-1"
    : "block text-sm font-semibold text-cb-gray-700 mb-1";

  const inputWrapCls = (hasError: boolean) => dark
    ? cn(
        "flex items-center bg-[#080A0E] border rounded transition-colors",
        hasError ? "border-red-500/70" : "border-[#1E2330] focus-within:border-[#FBB809]/50",
      )
    : cn(
        "relative flex items-center",
        hasError
          ? "ring-2 ring-cb-error/20 rounded"
          : "",
      );

  const inputCls = dark
    ? "flex-1 bg-transparent px-2 py-1.5 font-mono text-sm text-[#B8C8E8] focus:outline-none"
    : "w-full h-10 rounded border border-cb-gray-300 bg-white px-3 text-sm text-cb-gray-900 " +
      "focus:outline-none focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20 " +
      "disabled:bg-cb-gray-100 font-mono";

  const suffixCls = dark
    ? "px-2 text-[10px] text-[#4A5A7A]"
    : "absolute right-3 text-sm text-cb-gray-500 select-none pointer-events-none";

  const isBuy = form.direction === "BUY";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className={wrapCls}>

        {/* BUY / SELL Toggle */}
        <div className={cn(
          "grid grid-cols-2 gap-1 rounded p-1",
          dark ? "bg-[#080A0E]" : "bg-cb-gray-100",
        )}>
          {(["BUY", "SELL"] as const).map((dir) => {
            const active = form.direction === dir;
            const isBuyBtn = dir === "BUY";
            return (
              <button
                key={dir}
                onClick={() => form.setDirection(dir)}
                className={cn(
                  "py-2 text-sm font-bold rounded transition-all",
                  dark
                    ? active
                      ? isBuyBtn ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                      : "text-[#4A5A7A] hover:" + (isBuyBtn ? "text-emerald-400" : "text-red-400")
                    : active
                      ? isBuyBtn ? "bg-cb-yellow text-cb-gray-900" : "bg-cb-petrol text-white"
                      : "text-cb-gray-500 hover:bg-cb-gray-200",
                )}
              >
                {isBuyBtn ? "Kaufen" : "Verkaufen"}
              </button>
            );
          })}
        </div>

        {/* Preis-Eingabe */}
        <div>
          <label className={labelCls}>Preis (EUR/t)</label>

          {/* Quick-Step-Buttons */}
          <div className="flex gap-1 mb-1.5">
            {PRICE_STEPS.map((step) => (
              <button
                key={`-${step}`}
                onClick={() => adjustPrice(-step)}
                className={cn(
                  "flex-1 h-6 text-[10px] font-mono rounded transition-colors",
                  dark
                    ? "bg-[#1E2330] text-red-400 hover:bg-red-900/30"
                    : "bg-cb-gray-100 text-cb-error hover:bg-red-50 border border-cb-gray-200",
                )}
              >
                -{step}
              </button>
            ))}
            {PRICE_STEPS.map((step) => (
              <button
                key={`+${step}`}
                onClick={() => adjustPrice(step)}
                className={cn(
                  "flex-1 h-6 text-[10px] font-mono rounded transition-colors",
                  dark
                    ? "bg-[#1E2330] text-emerald-400 hover:bg-emerald-900/30"
                    : "bg-cb-gray-100 text-cb-success hover:bg-green-50 border border-cb-gray-200",
                )}
              >
                +{step}
              </button>
            ))}
          </div>

          <div className={inputWrapCls(!!form.errors.price)}>
            <input
              type="number"
              step="0.50"
              value={form.price}
              onChange={(e) => form.setPrice(e.target.value)}
              onBlur={() => form.touchField("price")}
              className={dark ? inputCls : cn(inputCls, form.errors.price && "border-cb-error focus:border-cb-error focus:ring-cb-error/20")}
              placeholder="0.00"
              aria-invalid={!!form.errors.price}
            />
            <span className={suffixCls}>€/t</span>
          </div>
          {form.errors.price && (
            <FieldError message={form.errors.price} dark={dark} />
          )}
        </div>

        {/* Mengen-Eingabe */}
        <div>
          <label className={labelCls}>Menge (t)</label>
          <div className={inputWrapCls(!!form.errors.qty)}>
            <input
              type="number"
              min="1"
              step="1"
              value={form.qty}
              onChange={(e) => form.setQty(e.target.value)}
              onBlur={() => form.touchField("qty")}
              className={dark ? inputCls : cn(inputCls, form.errors.qty && "border-cb-error focus:border-cb-error focus:ring-cb-error/20")}
              placeholder="0"
              aria-invalid={!!form.errors.qty}
            />
            <span className={suffixCls}>t</span>
          </div>
          {form.errors.qty && (
            <FieldError message={form.errors.qty} dark={dark} />
          )}
        </div>

        {/* Marktpreis-Warnung */}
        {marketWarning && <MarketWarning message={marketWarning} dark={dark} />}

        {/* Gesamtwert */}
        <div className={cn(
          "rounded p-3",
          dark
            ? "bg-[#080A0E] border border-[#1E2330]"
            : "bg-cb-gray-50 border border-cb-gray-200",
        )}>
          <div className="flex items-baseline justify-between">
            <p className={cn("text-xs", dark ? "text-[#4A5A7A]" : "text-cb-gray-500")}>
              Gesamtwert
            </p>
            {form.needsConfirm && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                dark
                  ? "bg-amber-900/30 text-amber-400 border border-amber-700/40"
                  : "bg-amber-100 text-amber-700 border border-amber-300",
              )}>
                Bestätigung erforderlich
              </span>
            )}
          </div>
          <p className={cn(
            "text-lg font-bold font-mono mt-0.5",
            dark ? "text-[#FBB809]" : "text-cb-petrol",
          )}>
            {form.totalEur
              ? form.totalEur.toNumber().toLocaleString("de-DE", {
                  style: "currency", currency: "EUR",
                })
              : "-"
            }
          </p>
          <p className={cn("text-xs mt-0.5", dark ? "text-[#4A5A7A]" : "text-cb-gray-400")}>
            zzgl. MwSt. und EUCX-Gebühr
          </p>
        </div>

        {/* Submit-Button */}
        <button
          onClick={handleSubmitClick}
          disabled={form.isSubmitting}
          className={cn(
            "w-full rounded font-bold text-sm transition-all",
            dark ? "py-2.5" : "h-12",
            dark
              ? isBuy
                ? "bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-emerald-900/30 disabled:text-emerald-800"
                : "bg-red-600 hover:bg-red-500 text-white disabled:bg-red-900/30 disabled:text-red-800"
              : isBuy
                ? "bg-cb-yellow hover:bg-cb-yellow-hover text-cb-gray-900 disabled:opacity-50"
                : "bg-cb-petrol hover:bg-cb-petrol-dark text-white disabled:opacity-50",
          )}
        >
          {form.isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Wird erteilt…
            </span>
          ) : (
            isBuy ? "Kaufauftrag erteilen" : "Verkaufsauftrag erteilen"
          )}
        </button>

        {/* Reset */}
        <button
          onClick={form.reset}
          className={cn(
            "w-full text-xs transition-colors",
            dark
              ? "text-[#4A5A7A] hover:text-[#B8C8E8] py-1"
              : "text-cb-gray-400 hover:text-cb-gray-700 py-1.5",
          )}
        >
          Formular zurücksetzen
        </button>
      </div>

      {/* Bestätigungsdialog */}
      <ConfirmOrderModal
        isOpen={showConfirm}
        direction={form.direction}
        price={form.price}
        qty={form.qty}
        symbol={symbol}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
