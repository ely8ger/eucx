/**
 * orderSchema — Zod-Validierung für das Order-Eingabeformular
 *
 * Strategie: String-Eingaben + Decimal.js-Refinements.
 *   Warum String statt z.coerce.number()? Weil "542.0" und "542,0" in Trader-
 *   Eingaben auftreten. Decimal.js ist toleranter und präziser als Number.
 *
 * Chained .refine() mit try/catch-Guard:
 *   Spätere Refinements geben `true` zurück wenn Decimal-Parsing fehlschlägt —
 *   das frühere Refinement hat den Fehler bereits gefangen. So sieht der Nutzer
 *   nur eine Fehlermeldung pro Feld.
 */

import { z }       from "zod";
import Decimal     from "decimal.js";

// ─── Hilfsfunktion ────────────────────────────────────────────────────────────

function safeD(v: string) {
  try {
    const d = new Decimal(v.replace(",", "."));
    return d.isFinite() ? d : null;
  } catch { return null; }
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  direction: z.enum(["BUY", "SELL"]),

  price: z.string()
    .min(1, "Preis ist erforderlich")
    .refine(
      (v) => safeD(v) !== null && safeD(v)!.gt(0),
      "Ungültiger Preis — muss eine positive Zahl sein",
    )
    .refine(
      (v) => { const d = safeD(v); return d === null || d.gte("1"); },
      "Mindestpreis: 1,00 €/t",
    )
    .refine(
      (v) => { const d = safeD(v); return d === null || d.lte("10000"); },
      "Maximalpreis: 10.000 €/t",
    )
    .refine(
      (v) => { const d = safeD(v); return d === null || d.decimalPlaces() <= 2; },
      "Max. 2 Dezimalstellen erlaubt",
    ),

  qty: z.string()
    .min(1, "Menge ist erforderlich")
    .refine(
      (v) => safeD(v) !== null && safeD(v)!.gt(0),
      "Ungültige Menge — muss eine positive Zahl sein",
    )
    .refine(
      (v) => { const d = safeD(v); return d === null || d.gte(1); },
      "Mindestmenge: 1 t",
    )
    .refine(
      (v) => { const d = safeD(v); return d === null || d.lte(50_000); },
      "Maximalmenge: 50.000 t",
    )
    .refine(
      (v) => { const d = safeD(v); return d === null || d.isInteger(); },
      "Menge muss ganzzahlig sein (keine Dezimalstellen)",
    ),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

// ─── Konstanten ───────────────────────────────────────────────────────────────

/** Gesamtwert (EUR) ab dem der Bestätigungsdialog erscheint */
export const LARGE_ORDER_EUR = 500_000;

/** Preisstufen für die Quick-Adjust-Buttons */
export const PRICE_STEPS = [0.5, 1, 2, 5] as const;
