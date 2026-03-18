"use client";

/**
 * useOrderForm — Formular-Hook für Order-Eingabe
 *
 * Verantwortlichkeiten:
 *   1. Formular-State: direction, price, qty
 *   2. Zod-Validierung (onBlur + onSubmit), Fehler pro Feld
 *   3. API-Aufruf POST /api/orders mit Retry-Schutz via isSubmitting
 *   4. Optimistic UI: temp-Order sofort ins Orderbuch, Rollback bei Fehler
 *   5. Toast-Feedback: Erfolg / Fehler / Info via useToast
 *
 * Nutzung:
 *   const form = useOrderForm({ sessionId, productId, dispatch });
 *   // form.price, form.setPrice, form.errors.price, form.submit(), ...
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import Decimal                                        from "decimal.js";
import { orderSchema, LARGE_ORDER_EUR }               from "@/lib/validation/order-schema";
import { useToast }                                   from "@/components/ui/toast";
import { makeOptimisticEntry }                        from "@/hooks/useTrading";
import type { TradingAction }                         from "@/hooks/useTrading";

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface UseOrderFormOptions {
  sessionId:  string | null;
  productId:  string;
  dispatch:   React.Dispatch<TradingAction>;
}

type FieldName = "price" | "qty";

interface FieldErrors { price: string | null; qty: string | null }
interface FieldTouched { price: boolean; qty: boolean }

interface OrderApiResponse {
  orderId?:         string;
  error?:           string;
  deals?:           { quantity: string; pricePerUnit: string }[];
  totalMatchedQty?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrderForm({ sessionId, productId, dispatch }: UseOrderFormOptions) {
  const toast = useToast();

  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice]         = useState("542.00");
  const [qty, setQty]             = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors,  setErrors]  = useState<FieldErrors>({ price: null, qty: null });
  const [touched, setTouched] = useState<FieldTouched>({ price: false, qty: false });

  // ── Validierung (nur für berührte Felder) ────────────────────────────────
  useEffect(() => {
    const result = orderSchema.safeParse({ direction, price, qty });

    if (result.success) {
      setErrors({ price: null, qty: null });
      return;
    }

    const next: FieldErrors = { price: null, qty: null };
    for (const issue of result.error.issues) {
      const field = issue.path[0] as FieldName;
      if (!next[field] && touched[field]) {
        next[field] = issue.message;
      }
    }
    setErrors(next);
  }, [direction, price, qty, touched]);

  // ── Berechnete Werte ─────────────────────────────────────────────────────
  const totalEur = useMemo(() => {
    try {
      const p = new Decimal(price);
      const q = new Decimal(qty);
      if (p.lte(0) || q.lte(0)) return null;
      return p.times(q);
    } catch { return null; }
  }, [price, qty]);

  const isFormValid = useMemo(
    () => orderSchema.safeParse({ direction, price, qty }).success,
    [direction, price, qty],
  );

  const needsConfirm = useMemo(
    () => totalEur !== null && totalEur.gte(LARGE_ORDER_EUR),
    [totalEur],
  );

  // ── Einzelnes Feld als berührt markieren (onBlur) ────────────────────────
  const touchField = useCallback((field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // ── Auftrag einreichen ───────────────────────────────────────────────────
  const submitOrder = useCallback(async (): Promise<boolean> => {
    // Alle Felder als berührt markieren → zeigt alle Fehler
    setTouched({ price: true, qty: true });

    const parsed = orderSchema.safeParse({ direction, price, qty });
    if (!parsed.success) {
      const errs: FieldErrors = { price: null, qty: null };
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!errs[field]) errs[field] = issue.message;
      }
      setErrors(errs);
      return false;
    }

    if (!sessionId) {
      toast.warning("Keine aktive Sitzung", "Bitte wählen Sie eine Handelssitzung aus.");
      return false;
    }

    const token =
      document.cookie.match(/access_token=([^;]+)/)?.[1] ??
      localStorage.getItem("access_token");

    if (!token) {
      toast.error("Nicht authentifiziert", "Bitte melden Sie sich erneut an.");
      return false;
    }

    // Optimistic UI
    const tempId = `temp-${crypto.randomUUID()}`;
    dispatch({
      type:      "OPTIMISTIC_ORDER",
      direction,
      entry:     makeOptimisticEntry(tempId, price, qty),
    });

    setIsSubmitting(true);

    try {
      const res  = await fetch("/api/orders", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          productId,
          direction,
          pricePerUnit:   parseFloat(price),
          quantityTons:   parseFloat(qty),
          currency:       "EUR",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const data = (await res.json()) as OrderApiResponse;

      if (res.ok) {
        dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });

        if (data.deals?.length) {
          const d = data.deals[0]!;
          toast.success(
            "Handel abgeschlossen!",
            `${data.totalMatchedQty} t × ${d.pricePerUnit} EUR/t`,
          );
        } else {
          toast.info(
            "Auftrag eingestellt",
            `Auftrag ${data.orderId?.slice(0, 8)}… ist aktiv im Orderbuch.`,
          );
        }
        return true;
      } else {
        dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
        toast.error("Auftrag abgelehnt", data.error ?? "Unbekannter Serverfehler");
        return false;
      }
    } catch {
      dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
      toast.error("Netzwerkfehler", "Die Verbindung zum Server ist unterbrochen.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, productId, direction, price, qty, dispatch, toast]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPrice("");
    setQty("");
    setDirection("BUY");
    setErrors({ price: null, qty: null });
    setTouched({ price: false, qty: false });
  }, []);

  return {
    // State
    direction, setDirection,
    price,     setPrice,
    qty,       setQty,

    // Validation
    errors,
    isFormValid,
    touchField,

    // Computed
    totalEur,
    needsConfirm,

    // Actions
    submitOrder,
    reset,
    isSubmitting,
  };
}
