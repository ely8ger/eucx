"use client";

import { useLiveMarketTickers } from "@/hooks/useLiveMarketTickers";
import { cn }                   from "@/lib/utils";

function ChangeCell({ pct }: { pct: string }) {
  const n = parseFloat(pct);
  if (isNaN(n)) return <span className="text-gray-400">-</span>;
  const up = n > 0;
  return (
    <span className={cn("font-mono text-xs font-semibold", up ? "text-emerald-600" : n < 0 ? "text-red-600" : "text-gray-500")}>
      {up ? "+" : ""}{n.toFixed(2)} %
    </span>
  );
}

export default function MarketOverviewWidget() {
  const { tickers, loading, error, lastUpdated } = useLiveMarketTickers();

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">Marktdaten nicht verfügbar: {error}</p>
    );
  }

  if (tickers.length === 0) {
    return <p className="text-sm text-gray-400">Keine Marktdaten vorhanden.</p>;
  }

  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Produkt</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Preis</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">24h Δ</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Volumen</th>
          </tr>
        </thead>
        <tbody>
          {tickers.map((t) => (
            <tr key={t.productId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-2.5 px-3 font-medium text-gray-800">{t.productName}</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">
                {(() => { const p = parseFloat(t.lastPrice); return isNaN(p) ? "-" : p.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; })()}
              </td>
              <td className="py-2.5 px-3 text-right">
                <ChangeCell pct={(t.changePct ?? "0").replace("%", "")} />
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-xs text-gray-500">
                {parseFloat(t.volume24h).toLocaleString("de-DE", { maximumFractionDigits: 0 })} t
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {lastUpdated > 0 && (
        <p className="text-[10px] text-gray-400 mt-2 text-right">
          Aktualisiert: {new Date(lastUpdated).toLocaleTimeString("de-DE")}
        </p>
      )}
    </div>
  );
}
