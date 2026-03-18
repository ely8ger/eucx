"use client";

/**
 * OrderBook - Hochperformantes Orderbuch mit Echtzeit-Animationen
 *
 * Performance-Strategie:
 *   - React.memo auf Zeilen-Ebene: AskRow/BidRow re-rendern nur wenn sich
 *     price, remaining, org oder flashVersion für DIESE Zeile geändert hat.
 *   - useMemo für Spread und Tiefenberechnung.
 *   - Heatmap: Maximales Volumen im Buch bestimmt Balkenbreite (CSS width%).
 *     Absolut positionierter hintergrund - Layout wird NICHT verschoben.
 *
 * Flash-Animationen:
 *   1. Menge-Flash (gelb): Wenn `remaining` einer Order sich ändert
 *      (Partial Fill). Gleicher Mechanismus wie TradeHistory-Deal-Flash.
 *   2. Neue Order (grün für Ask, rot für Bid): Wenn eine neue ID erscheint.
 *
 * Varianten:
 *   - variant="light" (Standard): Commerzbank-Helldesign (bestehende TradingRoom-Seite)
 *   - variant="dark":  Dunkles Terminal-Design (neue TradingTerminal-Seite)
 */

import React, {
  useMemo,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Decimal from "decimal.js";
import { cn } from "@/lib/utils";
import type { OrderEntry } from "@/hooks/useTrading";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function calcSpread(askPrice: string, bidPrice: string): { abs: string; pct: string } | null {
  try {
    const ask  = new Decimal(askPrice);
    const bid  = new Decimal(bidPrice);
    if (ask.lte(0) || bid.lte(0)) return null;
    const abs  = ask.minus(bid);
    if (abs.lt(0)) return null;
    const pct  = abs.div(bid).times(100);
    return { abs: abs.toFixed(2), pct: pct.toFixed(2) };
  } catch {
    return null;
  }
}

function maxVolume(orders: OrderEntry[]): number {
  return orders.reduce((m, o) => Math.max(m, parseFloat(o.remaining) || 0), 0.001);
}

// ─── Typen ────────────────────────────────────────────────────────────────────

export type OrderBookVariant = "light" | "dark";

interface RowMeta {
  flashQty: boolean;  // Menge hat sich geändert
  flashNew: boolean;  // Order ist neu
  depth:    number;   // 0–1, wie viel Volumen relativ zum Max
}

interface AskRowProps {
  ask:     OrderEntry;
  meta:    RowMeta;
  onClick: (price: string, direction: "BUY") => void;
  variant: OrderBookVariant;
}

interface BidRowProps {
  bid:     OrderEntry;
  meta:    RowMeta;
  onClick: (price: string, direction: "SELL") => void;
  variant: OrderBookVariant;
}

// ─── Memoized Ask-Zeile ───────────────────────────────────────────────────────

const AskRow = memo(function AskRow({ ask, meta, onClick, variant }: AskRowProps) {
  const handleClick = useCallback(
    () => onClick(ask.price, "BUY"),
    [ask.price, onClick],
  );

  const isDark = variant === "dark";

  return (
    <tr
      className={cn(
        "relative cursor-pointer transition-colors",
        isDark
          ? "hover:bg-[#1E2330]/80"
          : "hover:bg-red-50",
        meta.flashQty && "flash-qty-ask",
        meta.flashNew && "flash-new-ask",
      )}
      onClick={handleClick}
    >
      {/* Heatmap-Tiefe: absolut positionierter Balken im Hintergrund */}
      <td className="relative" colSpan={3} style={{ padding: 0, height: 0 }}>
        <div
          className={cn(
            "absolute inset-y-0 right-0 pointer-events-none transition-all duration-300",
            isDark ? "bg-red-500/10" : "bg-red-100/60",
          )}
          style={{ width: `${meta.depth * 100}%` }}
          aria-hidden
        />
      </td>

      <td className={cn(
        "font-mono font-semibold relative z-10",
        isDark ? "text-red-400" : "text-[#E30613]",
      )}>
        {new Decimal(ask.price).toFixed(2).replace(".", ",")}
      </td>
      <td className={cn(
        "font-mono relative z-10",
        isDark ? "text-slate-300" : "text-[#333333]",
      )}>
        {new Decimal(ask.remaining).toFixed(0)}
      </td>
      <td className={cn(
        "text-xs relative z-10",
        isDark ? "text-slate-500" : "text-[#666666]",
      )}>
        <span className="font-medium">{ask.org}</span>
        {ask.country && (
          <span className={cn("ml-1", isDark ? "opacity-40" : "opacity-60")}>
            [{ask.country}]
          </span>
        )}
      </td>
    </tr>
  );
}, (prev, next) =>
  prev.ask.price     === next.ask.price &&
  prev.ask.remaining === next.ask.remaining &&
  prev.ask.org       === next.ask.org &&
  prev.meta.flashQty === next.meta.flashQty &&
  prev.meta.flashNew === next.meta.flashNew &&
  prev.meta.depth    === next.meta.depth &&
  prev.variant       === next.variant
);

// ─── Memoized Bid-Zeile ───────────────────────────────────────────────────────

const BidRow = memo(function BidRow({ bid, meta, onClick, variant }: BidRowProps) {
  const handleClick = useCallback(
    () => onClick(bid.price, "SELL"),
    [bid.price, onClick],
  );

  const isDark = variant === "dark";

  return (
    <tr
      className={cn(
        "relative cursor-pointer transition-colors",
        isDark
          ? "hover:bg-[#1E2330]/80"
          : "hover:bg-green-50",
        meta.flashQty && "flash-qty-bid",
        meta.flashNew && "flash-new-bid",
      )}
      onClick={handleClick}
    >
      {/* Heatmap-Tiefe */}
      <td className="relative" colSpan={3} style={{ padding: 0, height: 0 }}>
        <div
          className={cn(
            "absolute inset-y-0 right-0 pointer-events-none transition-all duration-300",
            isDark ? "bg-green-500/10" : "bg-green-100/60",
          )}
          style={{ width: `${meta.depth * 100}%` }}
          aria-hidden
        />
      </td>

      <td className={cn(
        "font-mono font-semibold relative z-10",
        isDark ? "text-green-400" : "text-[#00843D]",
      )}>
        {new Decimal(bid.price).toFixed(2).replace(".", ",")}
      </td>
      <td className={cn(
        "font-mono relative z-10",
        isDark ? "text-slate-300" : "text-[#333333]",
      )}>
        {new Decimal(bid.remaining).toFixed(0)}
      </td>
      <td className={cn(
        "text-xs relative z-10",
        isDark ? "text-slate-500" : "text-[#666666]",
      )}>
        <span className="font-medium">{bid.org}</span>
        {bid.country && (
          <span className={cn("ml-1", isDark ? "opacity-40" : "opacity-60")}>
            [{bid.country}]
          </span>
        )}
      </td>
    </tr>
  );
}, (prev, next) =>
  prev.bid.price     === next.bid.price &&
  prev.bid.remaining === next.bid.remaining &&
  prev.bid.org       === next.bid.org &&
  prev.meta.flashQty === next.meta.flashQty &&
  prev.meta.flashNew === next.meta.flashNew &&
  prev.meta.depth    === next.meta.depth &&
  prev.variant       === next.variant
);

// ─── Flash-Tracking-Hook ──────────────────────────────────────────────────────

/**
 * Verfolgt welche Order-IDs gerade "flashen" und warum.
 * Gibt ein Map<id, RowMeta> zurück.
 * Gleicher Ansatz wie TradeHistory: Set von IDs, Timeout für Cleanup.
 */
function useOrderFlash(
  orders: OrderEntry[],
  flashDuration = 600,
): Map<string, { flashQty: boolean; flashNew: boolean }> {
  const prevRemaining = useRef<Map<string, string>>(new Map());
  const prevIds       = useRef<Set<string>>(new Set());

  const [flashQtyIds, setFlashQtyIds] = useState<ReadonlySet<string>>(new Set());
  const [flashNewIds, setFlashNewIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const newQty: string[] = [];
    const newNew: string[] = [];

    for (const order of orders) {
      const prevRem = prevRemaining.current.get(order.id);
      if (prevRem !== undefined && prevRem !== order.remaining) {
        // Menge hat sich geändert (Partial Fill)
        newQty.push(order.id);
      }
      if (!prevIds.current.has(order.id)) {
        // Neue Order erschienen
        newNew.push(order.id);
      }
      prevRemaining.current.set(order.id, order.remaining);
    }

    // Veraltete IDs aus der Map entfernen (Order entfernt)
    const currentIds = new Set(orders.map((o) => o.id));
    for (const id of prevRemaining.current.keys()) {
      if (!currentIds.has(id)) prevRemaining.current.delete(id);
    }
    prevIds.current = currentIds;

    if (newQty.length > 0) {
      setFlashQtyIds(new Set(newQty));
      const t = setTimeout(() => setFlashQtyIds(new Set()), flashDuration);
      return () => clearTimeout(t);
    }
    if (newNew.length > 0) {
      setFlashNewIds(new Set(newNew));
      const t = setTimeout(() => setFlashNewIds(new Set()), flashDuration);
      return () => clearTimeout(t);
    }

    return undefined;
  }, [orders, flashDuration]);

  return useMemo(() => {
    const result = new Map<string, { flashQty: boolean; flashNew: boolean }>();
    for (const order of orders) {
      result.set(order.id, {
        flashQty: flashQtyIds.has(order.id),
        flashNew: flashNewIds.has(order.id),
      });
    }
    return result;
  }, [orders, flashQtyIds, flashNewIds]);
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

interface OrderBookProps {
  asks:         OrderEntry[];
  bids:         OrderEntry[];
  onPriceClick: (price: string, direction: "BUY" | "SELL") => void;
  variant?:     OrderBookVariant;
  /** Max. Zeilen pro Seite (Standard: alle) */
  maxRows?:     number;
}

const OrderBook = memo(function OrderBook({
  asks,
  bids,
  onPriceClick,
  variant = "light",
  maxRows,
}: OrderBookProps) {
  const isDark = variant === "dark";

  // Defensive sort (Server liefert bereits sortiert, Absicherung bei Optimistic UI)
  const sortedAsks = useMemo(
    () => [...asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
    [asks],
  );
  const sortedBids = useMemo(
    () => [...bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
    [bids],
  );

  const displayAsks = maxRows ? sortedAsks.slice(0, maxRows) : sortedAsks;
  const displayBids = maxRows ? sortedBids.slice(0, maxRows) : sortedBids;

  // Flash-Tracking für Asks und Bids
  const askFlashMap = useOrderFlash(sortedAsks);
  const bidFlashMap = useOrderFlash(sortedBids);

  // Tiefenberechnung: relative Balkenbreite pro Zeile
  const askMaxVol = useMemo(() => maxVolume(sortedAsks), [sortedAsks]);
  const bidMaxVol = useMemo(() => maxVolume(sortedBids), [sortedBids]);

  // Spread
  const spread = useMemo(() => {
    if (sortedAsks.length === 0 || sortedBids.length === 0) return null;
    return calcSpread(sortedAsks[0]!.price, sortedBids[0]!.price);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAsks[0]?.price, sortedBids[0]?.price]);

  const handleAskClick = useCallback(
    (price: string, direction: "BUY") => onPriceClick(price, direction),
    [onPriceClick],
  );
  const handleBidClick = useCallback(
    (price: string, direction: "SELL") => onPriceClick(price, direction),
    [onPriceClick],
  );

  // ── Klassen basierend auf Variante ─────────────────────────────────────────
  const wrapCls = cn(
    "rounded overflow-hidden",
    isDark
      ? "bg-[#141720] border border-[#1E2330]"
      : "bg-white border border-[#E0E0E0] shadow-sm",
  );

  const headerCls = cn(
    "px-4 py-2.5 flex items-center justify-between border-b",
    isDark ? "border-[#1E2330]" : "border-[#E0E0E0]",
  );

  const titleCls = cn(
    "text-sm font-semibold",
    isDark ? "text-slate-200" : "text-[#003D6B]",
  );

  const labelCls = cn(
    "text-xs font-semibold uppercase tracking-wider px-4 pt-2 pb-1",
    isDark ? "text-slate-600" : "text-[#999999]",
  );

  const thCls = cn(
    "text-left text-xs font-medium uppercase tracking-wide px-3 py-1.5",
    isDark ? "text-slate-600 border-b border-[#1E2330]" : "text-[#999999] border-b border-[#E0E0E0]",
  );

  const spreadCls = cn(
    "flex items-center gap-3 px-4 py-1.5 border-y text-xs",
    isDark
      ? "bg-yellow-500/5 border-yellow-500/20 text-slate-500"
      : "bg-[#FBB809]/10 border-[#FBB809]/30 text-[#666666]",
  );

  const emptyRowCls = cn(
    "text-center text-sm py-5",
    isDark ? "text-slate-600" : "text-[#999999]",
  );

  return (
    <div className={wrapCls}>
      {/* Header */}
      <div className={headerCls}>
        <span className={titleCls}>Auftragsbuch</span>
        <span className={cn("text-xs", isDark ? "text-slate-600" : "text-[#999999]")}>
          {asks.length} Angebote · {bids.length} Gebote
        </span>
      </div>

      {/* ── Asks (Verkauf) ── */}
      <div className={labelCls}>Angebote (Verkauf)</div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Preis (€/t)</th>
            <th className={thCls}>Rest (t)</th>
            <th className={thCls}>Anbieter</th>
          </tr>
        </thead>
        <tbody>
          {displayAsks.map((ask) => {
            const flash = askFlashMap.get(ask.id) ?? { flashQty: false, flashNew: false };
            const depth = askMaxVol > 0 ? parseFloat(ask.remaining) / askMaxVol : 0;
            return (
              <AskRow
                key={ask.id}
                ask={ask}
                meta={{ ...flash, depth }}
                onClick={handleAskClick}
                variant={variant}
              />
            );
          })}
          {displayAsks.length === 0 && (
            <tr>
              <td colSpan={3} className={emptyRowCls}>Keine Angebote</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Spread ── */}
      <div className={spreadCls}>
        <span>Spread</span>
        {spread ? (
          <>
            <span className={cn("font-bold font-mono", isDark ? "text-yellow-400" : "text-[#003D6B]")}>
              {spread.abs.replace(".", ",")} €
            </span>
            <span className={isDark ? "text-slate-600" : "text-[#999999]"}>
              · {spread.pct.replace(".", ",")} %
            </span>
          </>
        ) : (
          <span className={cn("font-mono", isDark ? "text-slate-600" : "text-[#999999]")}>-</span>
        )}
      </div>

      {/* ── Bids (Kauf) ── */}
      <div className={labelCls}>Gebote (Kauf)</div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Preis (€/t)</th>
            <th className={thCls}>Rest (t)</th>
            <th className={thCls}>Bieter</th>
          </tr>
        </thead>
        <tbody>
          {displayBids.map((bid) => {
            const flash = bidFlashMap.get(bid.id) ?? { flashQty: false, flashNew: false };
            const depth = bidMaxVol > 0 ? parseFloat(bid.remaining) / bidMaxVol : 0;
            return (
              <BidRow
                key={bid.id}
                bid={bid}
                meta={{ ...flash, depth }}
                onClick={handleBidClick}
                variant={variant}
              />
            );
          })}
          {displayBids.length === 0 && (
            <tr>
              <td colSpan={3} className={emptyRowCls}>Keine Gebote</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default OrderBook;
