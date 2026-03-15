"use client";

/**
 * TradingRoom — Handelsraum-Orchestrator
 *
 * Dieser Komponente delegiert:
 *   - Daten-Anbindung      → useTrading (throttled WebSocket/SSE Hook)
 *   - Orderbuch-Rendering  → <OrderBook> (React.memo'd Zeilen)
 *   - Abschluss-Anzeige    → <TradeHistory> (Flash-Animation)
 *
 * TradingRoom selbst kümmert sich nur um:
 *   - Order-Formular (BUY/SELL, Preis, Menge)
 *   - Optimistic UI (temp-Order sofort anzeigen)
 *   - Deal-Toast (Glückwunsch-Benachrichtigung)
 *   - Connection-Guard (Warnung bei Verbindungsverlust)
 *   - Preisband (Letzter Preis, Spread, Volumen)
 */

import { useEffect, useState, useCallback } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calcTotal, formatEur } from "@/lib/finance/money";
import Decimal from "decimal.js";
import { useTrading, makeOptimisticEntry } from "@/hooks/useTrading";
import OrderBook from "@/components/trading/OrderBook";
import TradeHistory from "@/components/trading/TradeHistory";

export default function TradingRoom() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ── Daten-Anbindung (Hook enthält Socket.io/SSE + Throttle-Logik) ─────────
  const { state, transport, dispatch } = useTrading(sessionId);

  // ── Formular-State ────────────────────────────────────────────────────────
  const [direction, setDirection]   = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice]           = useState("542.00");
  const [qty, setQty]               = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [dealToast, setDealToast]   = useState<{ qty: string; price: string; currency: string } | null>(null);
  const [clock, setClock]           = useState("");

  // ── Uhr ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString("de-DE"));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Aktive Session laden ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then((d: { session?: { id: string } }) => {
        if (d.session?.id) setSessionId(d.session.id);
      })
      .catch(() => {});
  }, []);

  // ── Berechnete Werte ──────────────────────────────────────────────────────
  let totalValue = "—";
  try {
    totalValue = formatEur(calcTotal(price || "0", qty || "0"));
  } catch { /* ungültige Eingabe */ }

  const lastDeal = state.deals[0];
  const bestAsk  = state.asks[0];
  const bestBid  = state.bids[0];

  const dailyVolume = state.deals
    .reduce((s, d) => s.plus(d.qty), new Decimal(0))
    .toFixed(0);

  // ── Preisklick im Orderbuch → Formular füllen ─────────────────────────────
  const handlePriceClick = useCallback((p: string, dir: "BUY" | "SELL") => {
    setPrice(new Decimal(p).toFixed(2));
    setDirection(dir);
  }, []);

  // ── Auftrag erteilen ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!sessionId) {
      setSubmitMsg({ ok: false, text: "Keine aktive Handelssitzung" });
      return;
    }
    const token =
      document.cookie.match(/access_token=([^;]+)/)?.[1] ??
      localStorage.getItem("access_token");

    if (!token) {
      setSubmitMsg({ ok: false, text: "Bitte einloggen" });
      return;
    }

    // Optimistic UI: sofort in Orderbuch anzeigen
    const tempId = `temp-${crypto.randomUUID()}`;
    dispatch({
      type:      "OPTIMISTIC_ORDER",
      direction,
      entry:     makeOptimisticEntry(tempId, price, qty),
    });

    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          productId:      "00000000-0000-0000-0000-000000000001",
          direction,
          pricePerUnit:   parseFloat(price),
          quantityTons:   parseFloat(qty),
          currency:       "EUR",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const data = await res.json() as {
        orderId?:        string;
        error?:          string;
        deals?:          Array<{ quantity: string; pricePerUnit: string; currency: string }>;
        totalMatchedQty?: string;
      };

      if (res.ok) {
        dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });

        if (data.deals && data.deals.length > 0) {
          const d = data.deals[0]!;
          setDealToast({ qty: data.totalMatchedQty ?? d.quantity, price: d.pricePerUnit, currency: d.currency });
          setSubmitMsg({
            ok:   true,
            text: `Handel abgeschlossen: ${data.totalMatchedQty} t @ ${d.pricePerUnit} ${d.currency}`,
          });
          setTimeout(() => setDealToast(null), 6000);
        } else {
          setSubmitMsg({ ok: true, text: `Auftrag ${data.orderId?.slice(0, 8)}… erteilt` });
        }
      } else {
        dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
        setSubmitMsg({ ok: false, text: data.error ?? "Fehler beim Erteilen" });
      }
    } catch {
      dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
      setSubmitMsg({ ok: false, text: "Netzwerkfehler" });
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, direction, price, qty, dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-screen-2xl">

      {/* ── Connection-Guard: Warnung bei Verbindungsabbruch ── */}
      {!state.connected && transport !== "mock" && (
        <div className="connection-warning flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-sm font-medium">
          <span className="text-base">⚠</span>
          <span>
            <strong>Live-Daten unterbrochen</strong> — Die angezeigten Preise sind möglicherweise
            nicht aktuell. Bitte erteilen Sie keine Aufträge bis die Verbindung wiederhergestellt ist.
          </span>
        </div>
      )}

      {/* ── Deal-Toast: Glückwunsch nach erfolgreichem Abschluss ── */}
      {dealToast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-cb-petrol text-white rounded-xl shadow-xl px-6 py-4 flex items-start gap-4 max-w-sm">
            <div className="text-xl font-bold">✓</div>
            <div>
              <p className="font-bold text-base">Handel abgeschlossen!</p>
              <p className="text-sm mt-0.5 opacity-90">
                {dealToast.qty} t ×{" "}
                {parseFloat(dealToast.price).toLocaleString("de-DE", {
                  style: "currency", currency: dealToast.currency,
                })}
              </p>
              <p className="text-xs mt-1 opacity-70">
                Gesamtwert:{" "}
                {(parseFloat(dealToast.qty) * parseFloat(dealToast.price)).toLocaleString("de-DE", {
                  style: "currency", currency: dealToast.currency,
                })}
              </p>
            </div>
            <button
              onClick={() => setDealToast(null)}
              className="ml-auto text-white/60 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
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
            value: dailyVolume + " t",
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

      {/* ── Hauptbereich: Orderbuch | Formular | Abschlüsse ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Orderbuch (col 5) — React.memo'd Komponente */}
        <div className="col-span-5">
          <OrderBook
            asks={state.asks}
            bids={state.bids}
            onPriceClick={handlePriceClick}
          />
        </div>

        {/* Order-Formular (col 3) */}
        <div className="col-span-3">
          <Card header={<CardTitle>Auftrag erteilen</CardTitle>} padding="md">
            <div className="grid grid-cols-2 gap-1 mb-4 bg-cb-gray-100 p-1 rounded">
              <button
                onClick={() => setDirection("BUY")}
                className={`py-2 text-sm font-semibold rounded transition-all ${
                  direction === "BUY"
                    ? "bg-cb-yellow text-cb-gray-900"
                    : "text-cb-gray-500 hover:bg-cb-gray-200"
                }`}
              >
                Kaufen
              </button>
              <button
                onClick={() => setDirection("SELL")}
                className={`py-2 text-sm font-semibold rounded transition-all ${
                  direction === "SELL"
                    ? "bg-cb-petrol text-white"
                    : "text-cb-gray-500 hover:bg-cb-gray-200"
                }`}
              >
                Verkaufen
              </button>
            </div>

            <div className="space-y-3">
              <Input
                label="Preis"
                suffix="€/t"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.50"
                required
              />
              <Input
                label="Menge"
                suffix="t"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                min="1"
                required
              />

              <div className="bg-cb-gray-50 rounded border border-cb-gray-200 p-3">
                <p className="text-xs text-cb-gray-500 mb-0.5">Gesamtwert</p>
                <p className="text-lg font-bold text-cb-petrol">{totalValue}</p>
                <p className="text-xs text-cb-gray-400">zzgl. MwSt.</p>
              </div>

              {submitMsg && (
                <div className={`text-sm px-3 py-2 rounded ${
                  submitMsg.ok
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {submitMsg.text}
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Wird erteilt…"
                  : direction === "BUY"
                    ? "Kaufauftrag erteilen"
                    : "Verkaufsauftrag erteilen"
                }
              </Button>
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                onClick={() => { setPrice(""); setQty(""); setSubmitMsg(null); }}
              >
                Zurücksetzen
              </Button>
            </div>
          </Card>
        </div>

        {/* Abschlüsse + Session-Verlauf (col 4) */}
        <div className="col-span-4 flex flex-col gap-4">

          {/* TradeHistory — React.memo'd mit Flash-Animation */}
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
                    p.done         ? "bg-cb-success" :
                    (p as { active?: boolean }).active ? "bg-cb-yellow animate-pulse" :
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
