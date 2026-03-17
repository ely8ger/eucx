"use client";

/**
 * TradingTerminalWrapper — Client-Wrapper für den Trading-Terminal
 *
 * Kapselt das interaktive Trading-UI (Orderbuch, Chart, Order-Form) als
 * Client-Komponente, damit die übergeordnete SSR-Seite (trading/[symbol]/page.tsx)
 * crawler-freundlich bleibt.
 */

import { useRouter } from "next/navigation";

interface Props {
  productId:   string;
  productName: string;
  sku:         string;
}

export function TradingTerminalWrapper({ productId, productName, sku }: Props) {
  const router = useRouter();

  return (
    <div className="bg-cb-white border border-cb-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-cb-petrol">Handelsterminal</h2>
        <button
          onClick={() => router.push(`/trading/terminal?product=${sku}`)}
          className="px-4 py-2 bg-cb-petrol text-white text-sm rounded font-medium hover:bg-cb-petrol-dark transition-colors"
        >
          Terminal öffnen
        </button>
      </div>
      <p className="text-sm text-cb-gray-500">
        Vollständiges Orderbuch, Chart und Order-Eingabe für{" "}
        <span className="font-medium text-cb-petrol">{productName}</span> im Trading-Terminal verfügbar.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-cb-gray-500">
        <div className="bg-cb-gray-50 rounded p-3">
          <div className="font-semibold text-cb-gray-700 mb-1">Produkt-ID</div>
          <div className="font-mono text-cb-gray-500">{productId.slice(0, 8)}…</div>
        </div>
        <div className="bg-cb-gray-50 rounded p-3">
          <div className="font-semibold text-cb-gray-700 mb-1">SKU</div>
          <div className="font-mono text-cb-petrol">{sku}</div>
        </div>
      </div>
    </div>
  );
}
