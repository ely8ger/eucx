"use client";

/**
 * DealHistory — Tabelle der abgeschlossenen Aufträge (FILLED)
 *
 * Features:
 *   - Sortiert nach Ausführungszeit (neueste zuerst)
 *   - P&L-Indikator: Richtung (KAUF=grün / VERKAUF=rot) visuell hervorgehoben
 *   - Gesamtumsatz-Summe in der Footer-Zeile
 *   - Empty State für neue Nutzer ohne Handelshistorie
 *   - Skeleton beim ersten Laden
 */

import Decimal                 from "decimal.js";
import Link                    from "next/link";
import { cn }                  from "@/lib/utils";
import { Card, CardTitle }     from "@/components/ui/Card";
import { Button }              from "@/components/ui/Button";
import { Badge }               from "@/components/ui/Badge";
import { EmptyState }          from "@/components/portfolio/EmptyState";
import { useUserDealsQuery }   from "@/hooks/usePortfolio";
import type { PortfolioOrder } from "@/hooks/usePortfolio";

// ─── Einzelne Tabellenzeile ───────────────────────────────────────────────────

function DealRow({ order }: { order: PortfolioOrder }) {
  const isBuy  = order.direction === "BUY";
  const price  = new Decimal(order.pricePerUnit);
  const qty    = new Decimal(order.filledQuantity);
  const total  = new Decimal(order.totalValue);

  const fmtPrice = price.toFixed(2);
  const fmtQty   = qty.toFixed(0);
  const fmtTotal = total.toNumber()
    .toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtTime  = new Date(order.createdAt).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <tr className="border-b border-cb-gray-100 hover:bg-cb-gray-50 transition-colors">
      {/* Zeit */}
      <td className="px-4 py-3 text-xs text-cb-gray-500 font-mono whitespace-nowrap">
        {fmtTime}
      </td>

      {/* Richtung */}
      <td className="px-4 py-3">
        <span className={cn(
          "inline-flex items-center text-xs font-bold px-2 py-0.5 rounded",
          isBuy
            ? "bg-green-50 text-cb-success border border-green-200"
            : "bg-red-50 text-cb-error border border-red-200",
        )}>
          {isBuy ? "KAUF" : "VERKAUF"}
        </span>
      </td>

      {/* Preis */}
      <td className="px-4 py-3 font-mono text-sm font-semibold text-cb-petrol tabular-nums">
        {fmtPrice}
        <span className="text-cb-gray-400 font-normal text-xs"> €/t</span>
      </td>

      {/* Menge */}
      <td className="px-4 py-3 font-mono text-sm text-cb-gray-700 tabular-nums">
        {fmtQty} t
      </td>

      {/* Gesamtwert */}
      <td className={cn(
        "px-4 py-3 font-mono text-sm font-semibold tabular-nums",
        isBuy ? "text-cb-success" : "text-cb-error",
      )}>
        {isBuy ? "" : ""}{fmtTotal} €
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge variant="petrol">Ausgeführt</Badge>
      </td>
    </tr>
  );
}

// ─── Skeleton-Zeile ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-cb-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-cb-gray-100 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function DealHistory() {
  const { data: deals, isLoading, isFetching } = useUserDealsQuery();

  // Gesamtumsatz berechnen
  const totalVolume = deals?.reduce(
    (sum, d) => sum.plus(d.totalValue),
    new Decimal(0),
  );

  const header = (
    <div className="flex items-center justify-between w-full">
      <CardTitle>Handelshistorie</CardTitle>
      <div className="flex items-center gap-2">
        {isFetching && !isLoading && (
          <span className="text-xs text-cb-gray-400 animate-pulse">↺</span>
        )}
        {deals && deals.length > 0 && (
          <Badge variant="gray">{deals.length} Abschl.</Badge>
        )}
      </div>
    </div>
  );

  const footer = totalVolume && !totalVolume.isZero() ? (
    <div className="flex items-center justify-between text-sm">
      <span className="text-cb-gray-500">Gesamtumsatz</span>
      <span className="font-semibold font-mono text-cb-petrol tabular-nums">
        {totalVolume.toNumber().toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} €
      </span>
    </div>
  ) : undefined;

  return (
    <Card header={header} padding="none" footer={footer}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-cb-gray-200 bg-cb-gray-50">
              {["Zeit", "Richtung", "Preis", "Menge", "Wert", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-cb-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {!isLoading && deals && deals.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="◈"
                    title="Noch keine Abschlüsse"
                    description="Ihre ausgeführten Aufträge erscheinen hier sobald ein Handel zustande gekommen ist."
                    action={
                      <Link href="/trading">
                        <Button variant="outline" size="sm">
                          Jetzt handeln
                        </Button>
                      </Link>
                    }
                    size="md"
                  />
                </td>
              </tr>
            )}

            {!isLoading && deals?.map((deal) => (
              <DealRow key={deal.id} order={deal} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
