"use client";

/**
 * GlobalOrdersTable - Systemweite Live-Orders-Übersicht
 *
 * Zeigt alle aktiven Orders aller Organisationen.
 * Anomalie-Markierungen:
 *   LARGE_ORDER - Menge > 10.000 t (oranges Dreieck)
 *   ORG_FLOOD   - Selbe Org mit > 5 aktiven Orders (rotes Ausrufezeichen)
 */

import { useState }         from "react";
import { useQuery }         from "@tanstack/react-query";
import { cn }               from "@/lib/utils";
import { Card, CardTitle }  from "@/components/ui/card";
import { Button }           from "@/components/ui/button";
import { Badge }            from "@/components/ui/badge";
import { EmptyState }       from "@/components/portfolio/EmptyState";

// ─── Typen ────────────────────────────────────────────────────────────────────

interface SystemOrder {
  id:          string;
  direction:   "BUY" | "SELL";
  pricePerUnit: string;
  quantity:    string;
  filledQty:   string;
  totalValue:  string;
  status:      string;
  currency:    string;
  createdAt:   string;
  orgName:     string;
  country:     string;
  productName: string;
  sessionId:   string | null;
  anomalies:   string[];
}

interface AdminOrdersResponse {
  orders:       SystemOrder[];
  totalActive:  number;
  anomalyCount: number;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/access_token=([^;]+)/)?.[1] ?? localStorage.getItem("access_token") ?? "";
}

async function fetchSystemOrders(): Promise<AdminOrdersResponse> {
  const res = await fetch("/api/admin/orders", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Systemaufträge konnten nicht geladen werden");
  return res.json() as Promise<AdminOrdersResponse>;
}

// ─── Anomalie-Icons ───────────────────────────────────────────────────────────

function AnomalyBadges({ anomalies }: { anomalies: string[] }) {
  if (anomalies.length === 0) return null;
  return (
    <div className="flex gap-1">
      {anomalies.includes("LARGE_ORDER") && (
        <span title="Großorder (>10.000 t)" className="text-orange-500 text-sm">▲</span>
      )}
      {anomalies.includes("ORG_FLOOD") && (
        <span title="Org-Flooding (>5 aktive Orders)" className="text-red-500 text-sm font-bold">!</span>
      )}
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function GlobalOrdersTable() {
  const [dirFilter, setDirFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey:        ["admin", "orders"],
    queryFn:         fetchSystemOrders,
    staleTime:       10_000,
    refetchInterval: 15_000,   // Live-Refresh alle 15s
  });

  const filtered = (data?.orders ?? []).filter(
    (o) => dirFilter === "ALL" || o.direction === dirFilter,
  );

  const header = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <CardTitle>Live-Orders - Gesamtsystem</CardTitle>
        {data && (
          <Badge variant="info">{data.totalActive} aktiv</Badge>
        )}
        {data && data.anomalyCount > 0 && (
          <Badge variant="error" dot>{data.anomalyCount} Anomalien</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isFetching && !isLoading && (
          <span className="text-xs text-cb-gray-400 animate-pulse">↺</span>
        )}
        <div className="flex gap-1 bg-cb-gray-100 rounded p-0.5">
          {(["ALL", "BUY", "SELL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDirFilter(f)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                dirFilter === f
                  ? "bg-cb-white text-cb-petrol shadow-sm"
                  : "text-cb-gray-500 hover:text-cb-gray-700",
              )}
            >
              {f === "ALL" ? "Alle" : f === "BUY" ? "Käufe" : "Verkäufe"}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => void refetch()}>
          Aktualisieren
        </Button>
      </div>
    </div>
  );

  return (
    <Card header={header} padding="none">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-cb-gray-200 bg-cb-gray-50">
              {["", "Zeit", "Organisation", "Produkt", "Richt.", "Preis", "Menge", "Wert", "Status"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-cb-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-cb-gray-100">
                {Array.from({ length: 9 }).map((__, j) => (
                  <td key={j} className="px-3 py-3">
                    <div className="h-3.5 bg-cb-gray-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}

            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9}>
                <EmptyState icon="◷" title="Keine aktiven Orders" description="Aktuell sind keine Orders im System aktiv." size="sm" />
              </td></tr>
            )}

            {!isLoading && filtered.map((order) => {
              const isBuy     = order.direction === "BUY";
              const hasAnomaly = order.anomalies.length > 0;

              return (
                <tr
                  key={order.id}
                  className={cn(
                    "border-b border-cb-gray-100 hover:bg-cb-gray-50 transition-colors",
                    hasAnomaly && "bg-red-50/30",
                  )}
                >
                  {/* Anomalie-Indikator */}
                  <td className="px-3 py-2.5 w-8">
                    <AnomalyBadges anomalies={order.anomalies} />
                  </td>

                  <td className="px-3 py-2.5 text-xs text-cb-gray-500 font-mono whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleTimeString("de-DE")}
                  </td>

                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-cb-petrol">{order.orgName}</p>
                    <p className="text-xs text-cb-gray-400">{order.country}</p>
                  </td>

                  <td className="px-3 py-2.5 text-sm text-cb-gray-600 max-w-[120px] truncate">
                    {order.productName}
                  </td>

                  <td className="px-3 py-2.5">
                    <span className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded",
                      isBuy
                        ? "bg-green-50 text-cb-success border border-green-200"
                        : "bg-red-50 text-cb-error border border-red-200",
                    )}>
                      {isBuy ? "KAUF" : "VERK."}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-sm font-semibold text-cb-petrol tabular-nums">
                    {parseFloat(order.pricePerUnit).toFixed(2)}
                    <span className="text-cb-gray-400 font-normal text-xs"> €/t</span>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-sm tabular-nums">
                    {parseFloat(order.quantity).toLocaleString("de-DE", { maximumFractionDigits: 0 })} t
                  </td>

                  <td className="px-3 py-2.5 font-mono text-sm tabular-nums text-cb-gray-600">
                    {parseFloat(order.totalValue).toLocaleString("de-DE", {
                      minimumFractionDigits: 0, maximumFractionDigits: 0,
                    })} €
                  </td>

                  <td className="px-3 py-2.5">
                    <Badge variant={order.status === "ACTIVE" ? "success" : "warning"} dot>
                      {order.status === "ACTIVE" ? "Aktiv" : "Teil"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legende */}
      {data && data.anomalyCount > 0 && (
        <div className="px-4 py-2 border-t border-cb-gray-200 bg-red-50 flex items-center gap-4 text-xs text-cb-gray-500">
          <span><span className="text-orange-500">▲</span> Großorder (&gt;10.000 t)</span>
          <span><span className="text-red-500 font-bold">!</span> Org-Flooding (&gt;5 aktive Orders)</span>
        </div>
      )}
    </Card>
  );
}
