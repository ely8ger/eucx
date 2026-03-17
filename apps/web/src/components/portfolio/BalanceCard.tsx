"use client";

/**
 * BalanceCard — Wallet-Kontostand-Anzeige
 *
 * Zeigt verfügbares Guthaben, reserviertes Guthaben und Gesamtkapital
 * für jede Währung (typischerweise EUR).
 *
 * Live-Update: Aufrufer kann queryClient.invalidateQueries nach
 * BalanceUpdatedEvent aufrufen — diese Komponente re-rendert automatisch.
 */

import Decimal                        from "decimal.js";
import { Card, CardTitle }            from "@/components/ui/Card";
import { Badge }                      from "@/components/ui/Badge";
import { EmptyState }                 from "@/components/portfolio/EmptyState";
import { useBalanceQuery }            from "@/hooks/usePortfolio";
import type { WalletBalance }         from "@/hooks/usePortfolio";

// ─── Einzelne Währungs-Zeile ──────────────────────────────────────────────────

function BalanceRow({ w }: { w: WalletBalance }) {
  const balance  = new Decimal(w.balance);
  const reserved = new Decimal(w.reservedBalance);
  const total    = new Decimal(w.total);

  const fmt = (d: InstanceType<typeof Decimal>) =>
    d.toNumber().toLocaleString("de-DE", {
      minimumFractionDigits:  2,
      maximumFractionDigits:  2,
    });

  const reservedPct = total.isZero()
    ? 0
    : reserved.div(total).times(100).toDecimalPlaces(1).toNumber();

  return (
    <div className="space-y-4">
      {/* Hauptbetrag */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-cb-gray-500 font-medium uppercase tracking-wide mb-0.5">
            Verfügbar
          </p>
          <p className="text-3xl font-bold text-cb-petrol font-mono tabular-nums">
            {fmt(balance)}
          </p>
          <p className="text-sm text-cb-gray-500 font-mono">{w.currency}</p>
        </div>

        {w.lastUpdated && (
          <p className="text-xs text-cb-gray-400 pb-1">
            Stand {new Date(w.lastUpdated).toLocaleTimeString("de-DE")}
          </p>
        )}
      </div>

      {/* Fortschrittsbalken: verfügbar vs. reserviert */}
      {!total.isZero() && (
        <div>
          <div className="flex justify-between text-xs text-cb-gray-500 mb-1">
            <span>Kapitalaufteilung</span>
            <span>{reservedPct}% reserviert</span>
          </div>
          <div className="h-2 bg-cb-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-cb-petrol rounded-full transition-all duration-500"
              style={{ width: `${100 - reservedPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Kennzahlen-Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cb-gray-50 rounded p-3 border border-cb-gray-100">
          <p className="text-xs text-cb-gray-500 uppercase tracking-wide mb-0.5">Gesamt</p>
          <p className="text-base font-semibold text-cb-petrol font-mono tabular-nums">
            {fmt(total)}
          </p>
        </div>
        <div className="bg-orange-50 rounded p-3 border border-orange-100">
          <p className="text-xs text-orange-600 uppercase tracking-wide mb-0.5">Reserviert</p>
          <p className="text-base font-semibold text-orange-700 font-mono tabular-nums">
            {fmt(reserved)}
          </p>
          <p className="text-[10px] text-orange-500 mt-0.5">offene Aufträge</p>
        </div>
      </div>
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function BalanceCard() {
  const { data, isLoading, isError, isFetching } = useBalanceQuery();

  const header = (
    <div className="flex items-center justify-between w-full">
      <CardTitle>Kontostand</CardTitle>
      <div className="flex items-center gap-2">
        {isFetching && !isLoading && (
          <span className="text-xs text-cb-gray-400 animate-pulse">↺</span>
        )}
        <Badge variant="petrol">EUR-Konto</Badge>
      </div>
    </div>
  );

  return (
    <Card header={header} padding="md" highlighted>
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-9 bg-cb-gray-100 rounded w-2/3" />
          <div className="h-2 bg-cb-gray-100 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-cb-gray-100 rounded" />
            <div className="h-16 bg-cb-gray-100 rounded" />
          </div>
        </div>
      )}

      {isError && (
        <EmptyState
          icon="⚠"
          title="Kontostand nicht verfügbar"
          description="Die Verbindung zur Datenbank konnte nicht hergestellt werden."
          size="sm"
        />
      )}

      {data && data.wallets.map((w) => (
        <BalanceRow key={w.currency} w={w} />
      ))}
    </Card>
  );
}
