"use client";

/**
 * OrderBook — Hochperformante Orderbuch-Darstellung
 *
 * Performance-Strategie:
 *   - React.memo auf Zeilen-Ebene: AskRow und BidRow re-rendern nur
 *     wenn sich price, remaining oder org für DIESE Zeile geändert hat.
 *   - useMemo für Spread-Berechnung: nur bei Änderung von asks[0]/bids[0]
 *   - Gesamte Komponente ist React.memo: re-rendert nur wenn asks/bids arrays
 *     eine neue Referenz haben (kommt vom Throttle-Flush im useTrading Hook)
 *
 * Sortierung:
 *   Asks: Preis ASC  (niedrigstes Angebot zuerst — am nächsten zur Mitte)
 *   Bids: Preis DESC (höchstes Gebot zuerst — am nächsten zur Mitte)
 *   Server liefert bereits sortiert; useMemo ist defensiver Guard.
 */

import React, { useMemo, memo, useCallback } from "react";
import Decimal from "decimal.js";
import { Card, CardTitle } from "@/components/ui/Card";
import { calcSpread } from "@/lib/finance/money";
import type { OrderEntry } from "@/hooks/useTrading";

// ─── Memoized Row Components ──────────────────────────────────────────────────

interface AskRowProps {
  ask:     OrderEntry;
  onClick: (price: string, direction: "BUY") => void;
}

const AskRow = memo(function AskRow({ ask, onClick }: AskRowProps) {
  const handleClick = useCallback(() => onClick(ask.price, "BUY"), [ask.price, onClick]);

  return (
    <tr
      className="cursor-pointer hover:bg-red-50 transition-colors"
      onClick={handleClick}
    >
      <td className="price-down font-mono font-semibold">
        {new Decimal(ask.price).toFixed(2).replace(".", ",")}
      </td>
      <td className="text-cb-gray-700 font-mono">
        {new Decimal(ask.remaining).toFixed(0)}
      </td>
      <td className="text-cb-gray-500 text-xs">
        <span className="font-medium">{ask.org}</span>
        {ask.country && (
          <span className="ml-1 opacity-60">[{ask.country}]</span>
        )}
      </td>
    </tr>
  );
}, (prev, next) =>
  prev.ask.price     === next.ask.price &&
  prev.ask.remaining === next.ask.remaining &&
  prev.ask.org       === next.ask.org
);

interface BidRowProps {
  bid:     OrderEntry;
  onClick: (price: string, direction: "SELL") => void;
}

const BidRow = memo(function BidRow({ bid, onClick }: BidRowProps) {
  const handleClick = useCallback(() => onClick(bid.price, "SELL"), [bid.price, onClick]);

  return (
    <tr
      className="cursor-pointer hover:bg-green-50 transition-colors"
      onClick={handleClick}
    >
      <td className="price-up font-mono font-semibold">
        {new Decimal(bid.price).toFixed(2).replace(".", ",")}
      </td>
      <td className="text-cb-gray-700 font-mono">
        {new Decimal(bid.remaining).toFixed(0)}
      </td>
      <td className="text-cb-gray-500 text-xs">
        <span className="font-medium">{bid.org}</span>
        {bid.country && (
          <span className="ml-1 opacity-60">[{bid.country}]</span>
        )}
      </td>
    </tr>
  );
}, (prev, next) =>
  prev.bid.price     === next.bid.price &&
  prev.bid.remaining === next.bid.remaining &&
  prev.bid.org       === next.bid.org
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface OrderBookProps {
  asks:         OrderEntry[];
  bids:         OrderEntry[];
  onPriceClick: (price: string, direction: "BUY" | "SELL") => void;
}

const OrderBook = memo(function OrderBook({ asks, bids, onPriceClick }: OrderBookProps) {
  // Defensive sort — Server liefert bereits sortiert, aber bei Optimistic UI
  // können unsortierte Einträge entstehen
  const sortedAsks = useMemo(
    () => [...asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
    [asks]
  );
  const sortedBids = useMemo(
    () => [...bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
    [bids]
  );

  // Spread: nur neu berechnen wenn beste Preise sich ändern
  const spread = useMemo(() => {
    if (sortedAsks.length === 0 || sortedBids.length === 0) return null;
    try {
      return calcSpread(sortedAsks[0]!.price, sortedBids[0]!.price);
    } catch {
      return null;
    }
  }, [sortedAsks[0]?.price, sortedBids[0]?.price]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAskClick = useCallback(
    (price: string, direction: "BUY") => onPriceClick(price, direction),
    [onPriceClick]
  );
  const handleBidClick = useCallback(
    (price: string, direction: "SELL") => onPriceClick(price, direction),
    [onPriceClick]
  );

  return (
    <Card header={<CardTitle>Auftragsbuch</CardTitle>} padding="none">

      {/* ── Angebote (Asks / Verkauf) ── */}
      <div className="p-3 pb-1">
        <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
          Angebote (Verkauf)
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Preis (€/t)</th>
            <th>Rest (t)</th>
            <th>Anbieter</th>
          </tr>
        </thead>
        <tbody>
          {sortedAsks.map((ask) => (
            <AskRow key={ask.id} ask={ask} onClick={handleAskClick} />
          ))}
          {sortedAsks.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-cb-gray-400 text-sm py-4">
                Keine Angebote
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Spread-Zeile ── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-cb-yellow/10 border-y border-cb-yellow/30">
        <span className="text-xs text-cb-gray-500">Spread</span>
        {spread ? (
          <>
            <span className="font-bold text-cb-petrol font-mono">
              {spread.abs.toString().replace(".", ",")} €
            </span>
            <span className="text-xs text-cb-gray-400">
              · {spread.pct.toString().replace(".", ",")}%
            </span>
          </>
        ) : (
          <span className="font-bold text-cb-gray-400 font-mono">—</span>
        )}
      </div>

      {/* ── Gebote (Bids / Kauf) ── */}
      <div className="p-3 pb-1 pt-2">
        <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
          Gebote (Kauf)
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Preis (€/t)</th>
            <th>Rest (t)</th>
            <th>Bieter</th>
          </tr>
        </thead>
        <tbody>
          {sortedBids.map((bid) => (
            <BidRow key={bid.id} bid={bid} onClick={handleBidClick} />
          ))}
          {sortedBids.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-cb-gray-400 text-sm py-4">
                Keine Gebote
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
});

export default OrderBook;
