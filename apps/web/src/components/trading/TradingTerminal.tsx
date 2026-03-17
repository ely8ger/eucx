"use client";

/**
 * TradingTerminal — Dark-Mode Professional Trading Interface
 *
 * Layout (3 Spalten, volles Viewport):
 *   Links  (col 3): TradeCard (dark) + Session-Timeline
 *   Mitte  (col 6): MarketChart (oben, flex-1) + OrderBook dark (unten, 42%)
 *   Rechts (col 3): Ticker-Stats (useMarketTicker) + letzte Abschlüsse
 *
 * Design: Bloomberg/Refinitiv-Stil.
 *   Hintergrund: #0D0F14 / Panel: #141720 / Trennlinie: #1E2330
 *   Preise: text-red-400 (Ask) / text-emerald-400 (Bid)
 *   Akzent:  #FBB809 (EUCX-Gelb)
 *
 * Wrapper-Klasse "terminal" aktiviert Dark-Flash-Animationen aus globals.css.
 * Order-Formular-Logik + Validierung → TradeCard (dark variant).
 */

import { useEffect, useState, useCallback, useRef, memo } from "react";
import Decimal                                             from "decimal.js";
import { cn }                                             from "@/lib/utils";
import { useTrading, type DealEntry }                     from "@/hooks/useTrading";
import { useMarketTicker }                                from "@/hooks/useMarketTicker";
import OrderBook                                          from "@/components/trading/OrderBook";
import MarketChart                                        from "@/components/trading/MarketChart";
import { TradeCard }                                      from "@/components/trading/TradeCard";

// ─── Konstanten ───────────────────────────────────────────────────────────────

const SYMBOL     = "REBAR-EU";
const PRODUCT_ID = "00000000-0000-0000-0000-000000000001";

// ─── Dark Trade History ───────────────────────────────────────────────────────

const DarkDealRow = memo(function DarkDealRow({ deal }: { deal: DealEntry }) {
  const isBuy = deal.direction === "BUY";
  return (
    <tr className="border-b border-[#1E2330] hover:bg-[#141720]/60">
      <td className="py-1 px-2 font-mono text-[11px] text-[#4A5A7A]">
        {new Date(deal.time).toLocaleTimeString("de-DE")}
      </td>
      <td className={cn(
        "py-1 px-2 font-mono text-[11px] font-semibold",
        isBuy ? "text-emerald-400" : "text-red-400",
      )}>
        {new Decimal(deal.price).toFixed(2)}
      </td>
      <td className="py-1 px-2 font-mono text-[11px] text-[#8A9ABB]">
        {new Decimal(deal.qty).toFixed(0)} t
      </td>
      <td className={cn(
        "py-1 px-2 text-[11px] font-bold",
        isBuy ? "text-emerald-400" : "text-red-400",
      )}>
        {isBuy ? "K" : "V"}
      </td>
    </tr>
  );
}, (prev, next) => prev.deal.id === next.deal.id);

// ─── Ticker-Kennzahl ──────────────────────────────────────────────────────────

function TickerStat({ label, value, accent = null }: {
  label: string;
  value: string;
  accent?: "green" | "red" | null;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#1E2330]">
      <span className="text-[10px] text-[#4A5A7A] uppercase tracking-wider">{label}</span>
      <span className={cn(
        "font-mono text-[12px] font-semibold",
        accent === "green" ? "text-emerald-400" :
        accent === "red"   ? "text-red-400"     :
        "text-[#B8C8E8]",
      )}>
        {value}
      </span>
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function TradingTerminal() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { state, transport, dispatch } = useTrading(sessionId);
  const ticker = useMarketTicker(SYMBOL);
  const [clock, setClock] = useState("");

  // priceOverride: wenn Nutzer im Orderbuch auf einen Preis klickt
  const overrideKeyRef = useRef(0);
  const [priceOverride, setPriceOverride] = useState<{
    price: string; direction: "BUY" | "SELL"; key: number;
  } | undefined>(undefined);

  // Uhr
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("de-DE"));
    tick();
    const id = setInterval(tick, 1_000);
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

  const pricePct  = parseFloat(ticker.changePercent24h);
  const dirCls    =
    ticker.direction === "up"   ? "text-emerald-400" :
    ticker.direction === "down" ? "text-red-400"     :
    "text-[#B8C8E8]";

  const bestAsk = state.asks[0]?.price ?? null;
  const bestBid = state.bids[0]?.price ?? null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="terminal bg-[#0D0F14] text-[#B8C8E8] h-screen flex flex-col -m-6 overflow-hidden">

      {/* ── Header-Bar ── */}
      <header className="flex-none flex items-center justify-between px-4 py-2 bg-[#080A0E] border-b border-[#1E2330]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#FBB809] tracking-[0.2em] uppercase">
            EUCX
          </span>
          <span className="text-[#1E2330]">|</span>
          <span className="text-[12px] font-semibold text-[#B8C8E8]">
            Rebar BSt 500S · EN 10080 · Ø 12mm
          </span>
          <span className="text-[#1E2330]">|</span>
          <span className={cn("text-[14px] font-bold font-mono", dirCls)}>
            {ticker.price !== "0"
              ? new Decimal(ticker.price).toFixed(2)
              : "—"
            } EUR/t
          </span>
          {!isNaN(pricePct) && (
            <span className={cn("text-[11px] font-mono", dirCls)}>
              {pricePct >= 0 ? "+" : ""}{ticker.changePercent24h}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!state.connected && (
            <span className="text-[11px] text-amber-400 animate-pulse">
              ⚠ Verbindung unterbrochen
            </span>
          )}
          <span className={cn(
            "inline-flex items-center gap-1.5 text-[11px]",
            state.connected ? "text-emerald-400" : "text-amber-400",
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full inline-block",
              state.connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse",
            )} />
            {state.connected
              ? transport === "socket.io" ? "Live · WS"
              : transport === "sse"       ? "Live · SSE"
              : "Demo"
              : "Verbinde…"
            }
          </span>
          <span className="text-[11px] font-mono text-[#4A5A7A]">{clock}</span>
        </div>
      </header>

      {/* ── 3-Spalten-Grid ── */}
      <div className="flex-1 grid grid-cols-12 min-h-0">

        {/* ── Links: TradeCard + Session-Timeline (col 3) ── */}
        <aside className="col-span-3 border-r border-[#1E2330] flex flex-col overflow-y-auto bg-[#0D0F14]">

          <div className="px-3 py-2 border-b border-[#1E2330] flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A5A7A]">
              Auftrag
            </span>
            <span className="text-[10px] text-[#4A5A7A]">{SYMBOL}</span>
          </div>

          <div className="p-3 flex-1">
            <TradeCard
              sessionId={sessionId}
              productId={PRODUCT_ID}
              dispatch={dispatch}
              symbol={SYMBOL}
              variant="dark"
              bestAsk={bestAsk}
              bestBid={bestBid}
              priceOverride={priceOverride}
            />
          </div>

          {/* Session-Timeline */}
          <div className="p-3 border-t border-[#1E2330]">
            <p className="text-[10px] text-[#4A5A7A] uppercase tracking-[0.15em] mb-2">
              Sitzungsphase
            </p>
            <div className="flex items-center gap-0.5">
              {[
                { label: "Vor",     done: true   },
                { label: "Hdl. 1", active: true  },
                { label: "Korr.",  done: false   },
                { label: "Hdl. 2", done: false   },
                { label: "Schluss",done: false   },
              ].map((p, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={cn(
                    "h-1 rounded-full mb-1 transition-all",
                    p.done                              ? "bg-emerald-700"             :
                    (p as { active?: boolean }).active  ? "bg-[#FBB809] animate-pulse" :
                    "bg-[#1E2330]",
                  )} />
                  <span className="text-[9px] text-[#4A5A7A] block truncate">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Mitte: Chart + OrderBook (col 6) ── */}
        <main className="col-span-6 border-r border-[#1E2330] flex flex-col min-h-0 bg-[#0D0F14]">
          <div className="flex-1 border-b border-[#1E2330] min-h-0 overflow-hidden">
            <MarketChart productId={PRODUCT_ID} symbol={SYMBOL} />
          </div>
          <div className="h-[42%] overflow-y-auto">
            <OrderBook
              asks={state.asks}
              bids={state.bids}
              onPriceClick={handlePriceClick}
              variant="dark"
              maxRows={6}
            />
          </div>
        </main>

        {/* ── Rechts: Ticker-Stats + Abschlüsse (col 3) ── */}
        <aside className="col-span-3 flex flex-col overflow-hidden bg-[#0D0F14]">

          {/* Ticker-Kennzahlen */}
          <div className="flex-none px-3 pt-3 pb-2 border-b border-[#1E2330]">
            <p className="text-[10px] text-[#4A5A7A] uppercase tracking-[0.15em] mb-2">
              {SYMBOL} · 24h
            </p>
            <TickerStat
              label="Letzter Preis"
              value={ticker.price !== "0" ? `${new Decimal(ticker.price).toFixed(2)} €` : "—"}
              accent={ticker.direction === "up" ? "green" : ticker.direction === "down" ? "red" : null}
            />
            <TickerStat
              label="Änderung"
              value={!isNaN(pricePct)
                ? `${pricePct >= 0 ? "+" : ""}${ticker.changePercent24h}%`
                : "—"
              }
              accent={!isNaN(pricePct) ? (pricePct >= 0 ? "green" : "red") : null}
            />
            <TickerStat
              label="Hoch 24h"
              value={ticker.high24h !== "0" ? `${new Decimal(ticker.high24h).toFixed(2)} €` : "—"}
            />
            <TickerStat
              label="Tief 24h"
              value={ticker.low24h !== "0" ? `${new Decimal(ticker.low24h).toFixed(2)} €` : "—"}
            />
            <TickerStat
              label="Volumen 24h"
              value={ticker.volume24h !== "0" ? `${ticker.volume24h} t` : "—"}
            />
            <TickerStat
              label="Quelle"
              value={ticker.source === "socket" ? "Live WS" : ticker.source === "rest" ? "REST" : "—"}
            />
          </div>

          {/* Letzte Abschlüsse */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-none px-3 py-2 border-b border-[#1E2330]">
              <span className="text-[10px] text-[#4A5A7A] uppercase tracking-[0.15em]">
                Letzte Abschlüsse
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[#0D0F14]">
                  <tr>
                    <th className="px-2 py-1 text-left text-[10px] text-[#4A5A7A] font-medium uppercase tracking-wider">Zeit</th>
                    <th className="px-2 py-1 text-left text-[10px] text-[#4A5A7A] font-medium uppercase tracking-wider">Preis</th>
                    <th className="px-2 py-1 text-left text-[10px] text-[#4A5A7A] font-medium uppercase tracking-wider">Menge</th>
                    <th className="px-2 py-1 text-left text-[10px] text-[#4A5A7A] font-medium uppercase tracking-wider">Dir.</th>
                  </tr>
                </thead>
                <tbody>
                  {state.deals.slice(0, 25).map((deal) => (
                    <DarkDealRow key={deal.id} deal={deal} />
                  ))}
                  {state.deals.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-[11px] text-[#4A5A7A]">
                        Noch keine Abschlüsse
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
