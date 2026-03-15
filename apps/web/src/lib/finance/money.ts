/**
 * Financial math utilities using Decimal.js.
 * NEVER use native float arithmetic for money — 0.1 + 0.2 ≠ 0.3.
 */
import Decimal from "decimal.js";

type D = InstanceType<typeof Decimal>;

/** Multiply price × quantity, return rounded to 2 decimal places */
export function calcTotal(pricePerUnit: string | number, quantityTons: string | number): D {
  return new Decimal(pricePerUnit).times(new Decimal(quantityTons)).toDecimalPlaces(2);
}

/** Format a Decimal as EUR string: "54.200,00 €" */
export function formatEur(amount: D | string | number): string {
  const d = new Decimal(amount);
  return (
    d.toNumber().toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

/** Format quantity as "1.840,000 t" */
export function formatTons(qty: D | string | number): string {
  return (
    new Decimal(qty).toNumber().toLocaleString("de-DE", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }) + " t"
  );
}

/** Calculate bid-ask spread */
export function calcSpread(
  bestAsk: string,
  bestBid: string
): { abs: D; pct: D } {
  const ask = new Decimal(bestAsk);
  const bid = new Decimal(bestBid);
  const abs = ask.minus(bid).toDecimalPlaces(2);
  const pct = abs.dividedBy(ask).times(100).toDecimalPlaces(2);
  return { abs, pct };
}

/** Store price as integer cents to avoid any float storage issues */
export function toCents(price: string | number): number {
  return Math.round(new Decimal(price).times(100).toNumber());
}

export function fromCents(cents: number): D {
  return new Decimal(cents).dividedBy(100);
}

export { Decimal };
