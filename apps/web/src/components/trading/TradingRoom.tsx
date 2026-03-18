"use client";

/**
 * TradingRoom — Handelsraum (Light / Commerzbank-Design)
 *
 * Orchestriert:
 *   - Daten-Anbindung      → useTrading (throttled WebSocket/SSE Hook)
 *   - Orderbuch-Rendering  → <OrderBook> (React.memo'd Zeilen)
 *   - Abschluss-Anzeige    → <TradeHistory> (Flash-Animation)
 *   - Order-Formular       → <TradeCard variant="light"> (Zod + Toast-Feedback)
 *
 * TradingRoom selbst kümmert sich um:
 *   - Session-Loading
 *   - Preisband (Letzter Preis, Spread, Volumen)
 *   - Connection-Guard
 *   - Preis-Klick → TradeCard via priceOverride
 */

import { useEffect, useState, useCallback, useRef } from "react";
import Decimal                                       from "decimal.js";
import { Card, CardTitle }                           from "@/components/ui/card";
import { Badge }                                     from "@/components/ui/badge";
import { formatEur }                                 from "@/lib/finance/money";
import { useTrading }                                from "@/hooks/useTrading";
import OrderBook                                     from "@/components/trading/OrderBook";
import TradeHistory                                  from "@/components/trading/TradeHistory";
import { TradeCard }                                 from "@/components/trading/TradeCard";

const PRODUCT_ID = "00000000-0000-0000-0000-000000000001";

export default function TradingRoom() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { state, transport, dispatch } = useTrading(sessionId);
  const [clock, setClock] = useState("");

  // priceOverride: Klick im Orderbuch → TradeCard befüllen
  const overrideKeyRef = useRef(0);
  const [priceOverride, setPriceOverride] = useState<{
    price: string; direction: "BUY" | "SELL"; key: number;
  } | undefined>(undefined);

  // Uhr
  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString("de-DE"));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Aktive Session laden
  useEffect(() => {
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then((d: { session?: { id: string } }) => {
        if (d.session?.id) setSessionId(d.session.id);
      })
      .catch(() => {});
  }, []);

  // Preis-Klick aus OrderBook → TradeCard befüllen
  const handlePriceClick = useCallback((price: string, dir: "BUY" | "SELL") => {
    overrideKeyRef.current += 1;
    setPriceOverride({
      price:     new Decimal(price).toFixed(2),
      direction: dir,
      key:       overrideKeyRef.current,
    });
  }, []);

  // Berechnete Werte für Preisband
  const lastDeal   = state.deals[0];
  const bestAsk    = state.asks[0];
  const bestBid    = state.bids[0];
  const dailyVol   = state.deals.reduce((s, d) => s.plus(d.qty), new Decimal(0)).toFixed(0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-screen-2xl">

      {/* ── Connection-Guard ── */}
      {!state.connected && transport !== "mock" && (
        <div className="connection-warning flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-sm font-medium">
          <span className="text-base">⚠</span>
          <span>
            <strong>Live-Daten unterbrochen</strong> — Die angezeigten Preise sind möglicherweise
            nicht aktuell. Bitte erteilen Sie keine Aufträge bis die Verbindung wiederhergestellt ist.
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cb-petrol">Handelsraum</h1>
          <p className="text-sm text-cb-gray-500 mt-0.5">
            Rebar BSt 500S · EN 10080 · Ø 12mm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={state.connected ? "success" : "warning"} dot>
            {state.connected
              ? transport === "socket.io" ? "Live · Socket.io"
              : transport === "sse"       ? "Live · SSE"
              : "Demo-Modus"
              : "Verbinde…"}
          </Badge>
          <span className="text-sm text-cb-gray-500 font-mono">{clock}</span>
        </div>
      </div>

      {/* ── Preisband ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Letzter Preis",
            value: lastDeal ? formatEur(lastDeal.price) : "—",
            sub:   lastDeal?.direction === "BUY" ? "▲ Kauf" : lastDeal ? "▼ Verkauf" : "",
            up:    lastDeal?.direction === "BUY" ? true : lastDeal ? false : null,
          },
          {
            label: "Bestes Angebot",
            value: bestAsk ? formatEur(bestAsk.price) : "—",
            sub:   bestAsk ? bestAsk.remaining + " t verfügbar" : "—",
            up:    null,
          },
          {
            label: "Bestes Gebot",
            value: bestBid ? formatEur(bestBid.price) : "—",
            sub:   bestBid ? bestBid.remaining + " t gesucht" : "—",
            up:    null,
          },
          {
            label: "Tagesvolumen",
            value: dailyVol + " t",
            sub:   state.deals.length + " Abschlüsse",
            up:    null,
          },
        ].map((stat) => (
          <Card key={stat.label} highlighted padding="sm">
            <p className="text-xs text-cb-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-cb-petrol mt-1">{stat.value}</p>
            <p className={
              stat.up === true  ? "price-up text-sm"   :
              stat.up === false ? "price-down text-sm" :
              "text-sm text-cb-gray-500"
            }>
              {stat.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Hauptbereich ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Orderbuch (col 5) */}
        <div className="col-span-5">
          <OrderBook
            asks={state.asks}
            bids={state.bids}
            onPriceClick={handlePriceClick}
            variant="light"
          />
        </div>

        {/* TradeCard light (col 3) */}
        <div className="col-span-3">
          <Card header={<CardTitle>Auftrag erteilen</CardTitle>} padding="md">
            <TradeCard
              sessionId={sessionId}
              productId={PRODUCT_ID}
              dispatch={dispatch}
              variant="light"
              bestAsk={bestAsk?.price ?? null}
              bestBid={bestBid?.price ?? null}
              priceOverride={priceOverride}
            />
          </Card>
        </div>

        {/* Abschlüsse + Session-Verlauf (col 4) */}
        <div className="col-span-4 flex flex-col gap-4">

          <TradeHistory deals={state.deals} />

          {/* Session-Timeline */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
              Sitzungsverlauf
            </p>
            <div className="flex items-center gap-1">
              {[
                { label: "Vor-Hdl.", done: true   },
                { label: "Hdl. 1",  active: true  },
                { label: "Korr. 1", done: false   },
                { label: "Hdl. 2",  done: false   },
                { label: "Korr. 2", done: false   },
                { label: "Schluss", done: false   },
              ].map((p, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`h-1.5 rounded-full mb-1 ${
                    p.done                              ? "bg-cb-success"              :
                    (p as { active?: boolean }).active  ? "bg-cb-yellow animate-pulse" :
                    "bg-cb-gray-200"
                  }`} />
                  <span className="text-2xs text-cb-gray-400 block">{p.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
