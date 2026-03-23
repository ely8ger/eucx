/**
 * Einheitliches Zahlenformat für die gesamte Plattform.
 * Geldbeträge immer im deutschen Buchhaltungsstandard:
 *   81.600,00  (Punkt = Tausender, Komma = Dezimal)
 * Mengen ganzzahlig mit Punkt als Tausender:
 *   1.200 t
 */

export function fmtEUR(value: number): string {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtQty(value: number): string {
  return value.toLocaleString("de-DE", { maximumFractionDigits: 0 });
}
