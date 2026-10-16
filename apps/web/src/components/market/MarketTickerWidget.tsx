"use client";

import { useLiveMarketTickers } from "@/hooks/useLiveMarketTickers";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";

export function MarketTickerWidget() {
  const { tickers, loading, error, lastUpdated } = useLiveMarketTickers();

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      fontFamily: F,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px 8px",
        borderBottom: "2px solid " + BLUE,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: BLUE,
                      textTransform: "uppercase", letterSpacing: ".08em" }}>
          Marktpreise · Live
        </div>
        {lastUpdated > 0 && (
          <div style={{ fontSize: 10, color: "#9ca3af" }}>
            {new Date(lastUpdated).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 0" }}>
        {loading && (
          <div style={{ padding: "10px 14px", fontSize: 12, color: "#9ca3af" }}>
            Lade Marktdaten…
          </div>
        )}

        {error && (
          <div style={{ padding: "10px 14px", fontSize: 12, color: "#dc2626" }}>
            Nicht verfügbar
          </div>
        )}

        {!loading && !error && tickers.length === 0 && (
          <div style={{ padding: "10px 14px", fontSize: 12, color: "#9ca3af" }}>
            Keine aktiven Produkte
          </div>
        )}

        {tickers.map((t, idx) => {
          const price  = parseFloat(t.lastPrice);
          const change = parseFloat((t.changePct ?? "0").replace("%", ""));
          const isPos  = change > 0;
          const isNeg  = change < 0;
          return (
            <div
              key={t.productId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 14px",
                borderBottom: idx < tickers.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                  {t.sku}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>
                  {t.productName}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  fontVariantNumeric: "tabular-nums", color: "#111827",
                }}>
                  {isNaN(price) ? "—" : price.toLocaleString("de-DE", {
                    minimumFractionDigits: 2, maximumFractionDigits: 2,
                  })} €
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, marginTop: 1,
                  color: isPos ? "#16a34a" : isNeg ? "#dc2626" : "#6b7280",
                }}>
                  {isPos ? "+" : ""}{isNaN(change) ? "—" : change.toFixed(2)} %
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: "6px 14px",
        borderTop: "1px solid #f3f4f6",
        fontSize: 10,
        color: "#9ca3af",
      }}>
        Aktualisierung alle 30 s · Nur für verifizierte Nutzer
      </div>
    </div>
  );
}
