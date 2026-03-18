"use client";

/**
 * TradeHistory — Liste der letzten Abschlüsse mit Flash-Animation
 *
 * Flash-Mechanik:
 *   Wenn ein neuer Deal in die Liste kommt, bekommt seine Zeile die
 *   CSS-Klasse "flash-deal-buy" oder "flash-deal-sell".
 *   Nach 700ms wird die Klasse wieder entfernt — der Browser führt
 *   die Keyframe-Animation genau einmal aus.
 *
 *   Vorteil gegenüber key-Trick: Kein Unmount/Remount, keine Layout-Shifts.
 *   React.memo auf DealRow: Re-render nur wenn sich Daten der Zeile ändern.
 *   (Abschlüsse sind immutable — passiert nie nach dem ersten Render.)
 */

import React, { useEffect, useRef, useState, memo } from "react";
import Decimal from "decimal.js";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DealEntry } from "@/hooks/useTrading";

// ─── Memoized Deal-Zeile ──────────────────────────────────────────────────────

interface DealRowProps {
  deal:  DealEntry;
  flash: boolean; // true für max. 700ms nach Erscheinen
}

const DealRow = memo(function DealRow({ deal, flash }: DealRowProps) {
  const flashClass = flash
    ? deal.direction === "BUY" ? "flash-deal-buy" : "flash-deal-sell"
    : "";

  return (
    <tr className={flashClass}>
      <td className="font-mono text-xs text-cb-gray-400">
        {new Date(deal.time).toLocaleTimeString("de-DE")}
      </td>
      <td className={`font-mono font-semibold ${
        deal.direction === "BUY" ? "price-up" : "price-down"
      }`}>
        {new Decimal(deal.price).toFixed(2).replace(".", ",")}
      </td>
      <td className="font-mono text-cb-gray-700">
        {new Decimal(deal.qty).toFixed(0)}
      </td>
      <td>
        <Badge
          variant={deal.direction === "BUY" ? "success" : "error"}
          dot
        >
          {deal.direction === "BUY" ? "K" : "V"}
        </Badge>
      </td>
    </tr>
  );
}, (prev, next) =>
  prev.deal.id === next.deal.id &&
  prev.flash   === next.flash
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface TradeHistoryProps {
  deals: DealEntry[];
}

const TradeHistory = memo(function TradeHistory({ deals }: TradeHistoryProps) {
  // Set von Deal-IDs, die gerade "neu" sind (Flash-Animation aktiv)
  const [flashIds, setFlashIds] = useState<ReadonlySet<string>>(new Set());
  const prevDealIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prevIds = prevDealIdsRef.current;
    const newIds  = deals.map((d) => d.id).filter((id) => !prevIds.has(id));

    prevDealIdsRef.current = new Set(deals.map((d) => d.id));

    if (newIds.length === 0) return;
    setFlashIds(new Set(newIds));
    const timer = setTimeout(() => setFlashIds(new Set()), 700);
    return () => clearTimeout(timer);
  }, [deals]);

  return (
    <Card header={<CardTitle>Letzte Abschlüsse</CardTitle>} padding="none">
      <table>
        <thead>
          <tr>
            <th>Zeit</th>
            <th>Preis</th>
            <th>Menge</th>
            <th>Dir.</th>
          </tr>
        </thead>
        <tbody>
          {deals.slice(0, 12).map((deal) => (
            <DealRow
              key={deal.id}
              deal={deal}
              flash={flashIds.has(deal.id)}
            />
          ))}
          {deals.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-cb-gray-400 text-sm py-6">
                Noch keine Abschlüsse
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
});

export default TradeHistory;
