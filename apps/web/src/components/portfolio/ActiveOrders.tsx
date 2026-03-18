"use client";

/**
 * ActiveOrders — Tabelle der offenen Aufträge mit Stornierungsfunktion
 *
 * Features:
 *   - Live-Polling (30s) + sofortige Invalidierung nach Stornierung
 *   - Optimistic UI: Auftrag verschwindet sofort aus der Liste
 *   - Inline-Bestätigung: zweistufiger Stornierungsprozess (kein Modal)
 *   - Fortschrittsbalken für teilgefüllte Aufträge
 *   - Empty State mit CTA zum Handelsraum
 *   - Skeleton-Loader beim ersten Laden
 */

import { useState, useCallback }      from "react";
import Link                           from "next/link";
import Decimal                        from "decimal.js";
import { cn }                         from "@/lib/utils";
import { Card, CardTitle }            from "@/components/ui/Card";
import { Button }                     from "@/components/ui/Button";
import { Badge }                      from "@/components/ui/Badge";
import { EmptyState }                 from "@/components/portfolio/EmptyState";
import { useActiveOrdersQuery, useCancelOrder } from "@/hooks/usePortfolio";
import { useToast }                   from "@/components/ui/Toast";
import type { PortfolioOrder }        from "@/hooks/usePortfolio";

// ─── Status-Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PortfolioOrder["status"] }) {
  if (status === "PARTIALLY_FILLED") {
    return <Badge variant="warning" dot>Teil</Badge>;
  }
  return <Badge variant="success" dot>Aktiv</Badge>;
}

// ─── Einzelne Tabellenzeile ───────────────────────────────────────────────────

function OrderRow({
  order,
  onCancelRequest,
  confirmId,
  onCancelConfirm,
  onCancelAbort,
  isCancelling,
}: {
  order:           PortfolioOrder;
  onCancelRequest: (id: string) => void;
  confirmId:       string | null;
  onCancelConfirm: (id: string) => void;
  onCancelAbort:   ()           => void;
  isCancelling:    boolean;
}) {
  const isBuy    = order.direction === "BUY";
  const isConfirm = confirmId === order.id;

  const price  = new Decimal(order.pricePerUnit);
  const qty    = new Decimal(order.quantity);
  const filled = new Decimal(order.filledQuantity);

  const fmtPrice = price.toFixed(2);
  const fmtQty   = qty.toFixed(0);
  const fmtFilled= filled.toFixed(0);
  const fmtTotal = new Decimal(order.totalValue).toNumber()
    .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtTime  = new Date(order.createdAt).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <tr className="border-b border-cb-gray-100 hover:bg-cb-gray-50 transition-colors group">
      {/* Zeit */}
      <td className="px-4 py-3 text-xs text-cb-gray-500 font-mono whitespace-nowrap">
        {fmtTime}
      </td>

      {/* Richtung */}
      <td className="px-4 py-3">
        <span className={cn(
          "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded",
          isBuy
            ? "bg-green-50 text-cb-success border border-green-200"
            : "bg-red-50 text-cb-error border border-red-200",
        )}>
          {isBuy ? "KAUF" : "VERK."}
        </span>
      </td>

      {/* Preis */}
      <td className="px-4 py-3 font-mono text-sm font-semibold text-cb-petrol tabular-nums">
        {fmtPrice} <span className="text-cb-gray-400 font-normal text-xs">€/t</span>
      </td>

      {/* Menge + Fortschritt */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tabular-nums text-cb-gray-700">
            {fmtFilled}/{fmtQty} t
          </span>
          {order.filledPct > 0 && (
            <div className="w-16 h-1.5 bg-cb-gray-100 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-cb-petrol rounded-full transition-all"
                style={{ width: `${order.filledPct}%` }}
              />
            </div>
          )}
        </div>
      </td>

      {/* Gesamtwert */}
      <td className="px-4 py-3 font-mono text-sm text-cb-gray-600 tabular-nums">
        {fmtTotal} €
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>

      {/* Stornieren */}
      <td className="px-4 py-3 text-right">
        {isConfirm ? (
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xs text-cb-gray-500 mr-1">Sicher?</span>
            <Button
              variant="danger"
              size="sm"
              loading={isCancelling}
              onClick={() => onCancelConfirm(order.id)}
            >
              Ja, stornieren
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelAbort}
              disabled={isCancelling}
            >
              Nein
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-cb-gray-500 hover:text-cb-error hover:bg-red-50"
            onClick={() => onCancelRequest(order.id)}
          >
            Stornieren
          </Button>
        )}
      </td>
    </tr>
  );
}

// ─── Skeleton-Zeile ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-cb-gray-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-cb-gray-100 rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function ActiveOrders() {
  const toast                                    = useToast();
  const { data: orders, isLoading, isFetching }  = useActiveOrdersQuery();
  const cancelMutation                           = useCancelOrder();
  const [confirmId, setConfirmId]                = useState<string | null>(null);

  const handleCancelRequest = useCallback((id: string) => {
    setConfirmId(id);
  }, []);

  const handleCancelAbort = useCallback(() => {
    setConfirmId(null);
  }, []);

  const handleCancelConfirm = useCallback(async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setConfirmId(null);
      toast.success("Auftrag storniert", "Der Auftrag wurde erfolgreich zurückgezogen.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      toast.error("Stornierung fehlgeschlagen", msg);
      setConfirmId(null);
    }
  }, [cancelMutation, toast]);

  const header = (
    <div className="flex items-center justify-between w-full">
      <CardTitle>Offene Aufträge</CardTitle>
      <div className="flex items-center gap-2">
        {isFetching && !isLoading && (
          <span className="text-xs text-cb-gray-400 animate-pulse">↺</span>
        )}
        {orders && orders.length > 0 && (
          <Badge variant="blue">{orders.length}</Badge>
        )}
      </div>
    </div>
  );

  return (
    <Card header={header} padding="none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-cb-gray-200 bg-cb-gray-50">
              {["Zeit", "Richt.", "Preis", "Menge / Ausgeführt", "Wert", "Status", ""].map((h) => (
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
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {!isLoading && orders && orders.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon="◷"
                    title="Keine offenen Aufträge"
                    description="Alle Ihre Aufträge wurden ausgeführt oder storniert."
                    action={
                      <Link href="/trading">
                        <Button variant="outline" size="sm">
                          Zum Handelsraum
                        </Button>
                      </Link>
                    }
                    size="md"
                  />
                </td>
              </tr>
            )}

            {!isLoading && orders?.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onCancelRequest={handleCancelRequest}
                confirmId={confirmId}
                onCancelConfirm={handleCancelConfirm}
                onCancelAbort={handleCancelAbort}
                isCancelling={cancelMutation.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
