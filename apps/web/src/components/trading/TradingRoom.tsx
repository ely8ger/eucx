"use client";

/**
 * TradingRoom — Live Handelsraum
 *
 * Transport-Strategie (Fallback-Kette):
 *   1. Socket.io  → NestJS WebSocket Gateway (< 50ms, bidirektional)
 *   2. SSE        → Next.js /api/orderbook/stream (Fallback bei fehlendem NestJS)
 *   3. Mock-Daten → Demo-Modus (kein Backend)
 *
 * Optimistic UI:
 *   Eigene Order erscheint sofort lokal bevor DB-Bestätigung kommt.
 *   Bei Server-Fehler wird die temporäre Order entfernt (Rollback).
 */
import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calcTotal, formatEur, calcSpread } from "@/lib/finance/money";
import Decimal from "decimal.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderEntry {
  id:        string;
  price:     string;
  qty:       string;
  remaining: string;
  org:       string;
  country:   string;
}

interface DealEntry {
  id:        string;
  price:     string;
  qty:       string;
  currency:  string;
  direction: string;
  time:      string;
}

interface OrderbookState {
  asks:      OrderEntry[];
  bids:      OrderEntry[];
  deals:     DealEntry[];
  connected: boolean;
  lastTs:    number;
}

type Action =
  | { type: "ORDERBOOK"; asks: OrderEntry[]; bids: OrderEntry[]; deals: DealEntry[]; ts: number }
  | { type: "NEW_BID";   bid: OrderEntry }
  | { type: "NEW_DEAL";  deal: DealEntry }
  | { type: "OPTIMISTIC_ORDER"; entry: OrderEntry; direction: "BUY" | "SELL" }
  | { type: "ROLLBACK_OPTIMISTIC"; tempId: string }
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" };

function reducer(state: OrderbookState, action: Action): OrderbookState {
  switch (action.type) {
    case "ORDERBOOK":
      return { ...state, asks: action.asks, bids: action.bids, deals: action.deals, lastTs: action.ts, connected: true };

    // Optimistic UI: neue Order sofort anzeigen (vor DB-Bestätigung)
    case "OPTIMISTIC_ORDER":
      return action.direction === "SELL"
        ? { ...state, asks: [action.entry, ...state.asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)) }
        : { ...state, bids: [action.entry, ...state.bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)) };

    // Rollback: temporäre Order entfernen wenn DB-Fehler
    case "ROLLBACK_OPTIMISTIC":
      return {
        ...state,
        asks: state.asks.filter((o) => o.id !== action.tempId),
        bids: state.bids.filter((o) => o.id !== action.tempId),
      };

    // Neues Gebot von anderem Händler via Socket.io
    case "NEW_BID":
      return action.bid.id.startsWith("temp-")
        ? state
        : { ...state };  // Orderbuch-Snapshot wird separat aktualisiert

    // Neuer Deal
    case "NEW_DEAL":
      return { ...state, deals: [action.deal, ...state.deals].slice(0, 20) };

    case "CONNECTED":
      return { ...state, connected: true };
    case "DISCONNECTED":
      return { ...state, connected: false };
    default:
      return state;
  }
}

// ─── Mock fallback (wenn kein sessionId) ─────────────────────────────────────

const MOCK_ASKS: OrderEntry[] = [
  { id: "1", price: "545.00", qty: "120.000", remaining: "120.000", org: "Stahlwerk Polska",  country: "PL" },
  { id: "2", price: "548.50", qty: "200.000", remaining: "200.000", org: "CMC Poland S.A.",   country: "PL" },
  { id: "3", price: "550.00", qty: "85.000",  remaining: "85.000",  org: "Celsa Huta",        country: "PL" },
];
const MOCK_BIDS: OrderEntry[] = [
  { id: "4", price: "542.00", qty: "100.000", remaining: "100.000", org: "Bauträger GmbH",    country: "DE" },
  { id: "5", price: "540.00", qty: "250.000", remaining: "250.000", org: "Beton AG",           country: "DE" },
  { id: "6", price: "538.50", qty: "60.000",  remaining: "60.000",  org: "Stahlhandel Wien",  country: "AT" },
];
const MOCK_DEALS: DealEntry[] = [
  { id: "1", price: "543.00", qty: "50.000",  currency: "EUR", direction: "BUY",  time: new Date().toISOString() },
  { id: "2", price: "545.00", qty: "120.000", currency: "EUR", direction: "SELL", time: new Date(Date.now() - 73000).toISOString() },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TradingRoom() {
  const [state, dispatch] = useReducer(reducer, {
    asks:      MOCK_ASKS,
    bids:      MOCK_BIDS,
    deals:     MOCK_DEALS,
    connected: false,
    lastTs:    0,
  });

  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [direction, setDirection]     = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice]             = useState("542.00");
  const [qty, setQty]                 = useState("100");
  const [clock, setClock]             = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitMsg, setSubmitMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [transport, setTransport]     = useState<"socket.io" | "sse" | "mock">("mock");
  const eventSourceRef                = useRef<EventSource | null>(null);
  const socketRef                     = useRef<Socket | null>(null);

  // ── Clock ────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString("de-DE"));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Active session from API ───────────────────────────────────────
  useEffect(() => {
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then((d) => {
        if (d.session?.id) setSessionId(d.session.id);
      })
      .catch(() => {});
  }, []);

  // ── Transport: Socket.io → SSE → Mock ────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const apiUrl    = process.env.NEXT_PUBLIC_API_URL;
    const token     = document.cookie.match(/access_token=([^;]+)/)?.[1];

    // ── Versuch 1: Socket.io (NestJS Backend) ─────────────────────
    if (apiUrl && token) {
      const socket = io(`${apiUrl}/trading`, {
        auth:       { token },
        transports: ["websocket", "polling"],
        timeout:    3000,
      });

      socket.on("connect", () => {
        dispatch({ type: "CONNECTED" });
        setTransport("socket.io");
        socket.emit("join_session", { sessionId });
      });

      socket.on("connect_error", () => {
        socket.disconnect();
        startSseFallback();
      });

      socket.on("new_bid", (e: { payload: OrderEntry }) => {
        dispatch({ type: "NEW_BID", bid: e.payload });
      });

      socket.on("orderbook_update", (e: { payload: { asks: OrderEntry[]; bids: OrderEntry[]; deals: DealEntry[]; ts: number } }) => {
        dispatch({ type: "ORDERBOOK", asks: e.payload.asks, bids: e.payload.bids, deals: e.payload.deals, ts: e.payload.ts });
      });

      socket.on("deal_matched", (e: { payload: DealEntry }) => {
        dispatch({ type: "NEW_DEAL", deal: e.payload });
      });

      socket.on("disconnect", () => dispatch({ type: "DISCONNECTED" }));

      socketRef.current = socket;
      return () => { socket.disconnect(); };
    }

    // ── Versuch 2: SSE Fallback ────────────────────────────────────
    startSseFallback();

    function startSseFallback() {
      const es = new EventSource(`/api/orderbook/stream?sessionId=${sessionId}`);
      eventSourceRef.current = es;
      setTransport("sse");

      es.addEventListener("connected", () => dispatch({ type: "CONNECTED" }));
      es.addEventListener("orderbook", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as { asks: OrderEntry[]; bids: OrderEntry[]; deals: DealEntry[]; ts: number };
          dispatch({ type: "ORDERBOOK", asks: data.asks, bids: data.bids, deals: data.deals, ts: data.ts });
        } catch {/* ignore */}
      });
      es.onerror = () => dispatch({ type: "DISCONNECTED" });
    }

    return () => {
      eventSourceRef.current?.close();
    };
  }, [sessionId]);

  // ── Calculated total ─────────────────────────────────────────────
  let totalValue = "—";
  try {
    const total = calcTotal(price || "0", qty || "0");
    totalValue = formatEur(total);
  } catch {/* invalid input */}

  // ── Spread ───────────────────────────────────────────────────────
  let spreadAbs = "—";
  let spreadPct = "";
  if (state.asks.length > 0 && state.bids.length > 0) {
    try {
      const { abs, pct } = calcSpread(state.asks[0]!.price, state.bids[0]!.price);
      spreadAbs = abs.toString().replace(".", ",") + " €";
      spreadPct = "· " + pct.toString().replace(".", ",") + "%";
    } catch {/* skip */}
  }

  // ── Last price / best ask / best bid ─────────────────────────────
  const lastDeal  = state.deals[0];
  const bestAsk   = state.asks[0];
  const bestBid   = state.bids[0];

  // ── Submit order (mit Optimistic UI) ─────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!sessionId) {
      setSubmitMsg({ ok: false, text: "Keine aktive Handelssitzung" });
      return;
    }
    const token = document.cookie.match(/access_token=([^;]+)/)?.[1]
      ?? localStorage.getItem("access_token");

    if (!token) {
      setSubmitMsg({ ok: false, text: "Bitte einloggen" });
      return;
    }

    // ── Optimistic UI: sofort anzeigen ────────────────────────────
    const tempId = `temp-${crypto.randomUUID()}`;
    dispatch({
      type:      "OPTIMISTIC_ORDER",
      direction,
      entry: {
        id:        tempId,
        price,
        qty,
        remaining: qty,
        org:       "Mein Auftrag",
        country:   "DE",
      },
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
          productId:      "00000000-0000-0000-0000-000000000001", // wird durch aktive Session gesetzt
          direction,
          pricePerUnit:   parseFloat(price),
          quantityTons:   parseFloat(qty),
          currency:       "EUR",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const data = await res.json() as { orderId?: string; error?: string };
      if (res.ok) {
        // Optimistischen Eintrag durch echte Order-ID ersetzen
        dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
        setSubmitMsg({ ok: true, text: `Auftrag ${data.orderId?.slice(0, 8)}… erteilt` });
      } else {
        // Rollback: temporäre Order entfernen
        dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
        setSubmitMsg({ ok: false, text: data.error ?? "Fehler beim Erteilen" });
      }
    } catch {
      dispatch({ type: "ROLLBACK_OPTIMISTIC", tempId });
      setSubmitMsg({ ok: false, text: "Netzwerkfehler" });
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, direction, price, qty]);

  // ── Price click in orderbook ──────────────────────────────────────
  const fillPrice = (p: string, dir: "BUY" | "SELL") => {
    setPrice(new Decimal(p).toFixed(2));
    setDirection(dir);
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-screen-2xl">

      {/* Header */}
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

      {/* Preisband */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label:  "Letzter Preis",
            value:  lastDeal ? formatEur(lastDeal.price) : "—",
            sub:    lastDeal?.direction === "BUY" ? "▲ Kauf" : lastDeal ? "▼ Verkauf" : "",
            up:     lastDeal?.direction === "BUY" ? true : lastDeal ? false : null,
          },
          {
            label:  "Bestes Angebot",
            value:  bestAsk ? formatEur(bestAsk.price) : "—",
            sub:    bestAsk ? bestAsk.remaining + " t" : "—",
            up:     null,
          },
          {
            label:  "Bestes Gebot",
            value:  bestBid ? formatEur(bestBid.price) : "—",
            sub:    bestBid ? bestBid.remaining + " t" : "—",
            up:     null,
          },
          {
            label:  "Tagesvolumen",
            value:  state.deals.length > 0
              ? state.deals.reduce((s: InstanceType<typeof Decimal>, d) => s.plus(d.qty), new Decimal(0)).toFixed(0) + " t"
              : "0 t",
            sub:    state.deals.length + " Abschlüsse",
            up:     null,
          },
        ].map((stat) => (
          <Card key={stat.label} highlighted padding="sm">
            <p className="text-xs text-cb-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-cb-petrol mt-1">{stat.value}</p>
            <p className={
              stat.up === true  ? "price-up text-sm" :
              stat.up === false ? "price-down text-sm" :
              "text-sm text-cb-gray-500"
            }>
              {stat.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Hauptbereich */}
      <div className="grid grid-cols-12 gap-4">

        {/* Orderbook */}
        <div className="col-span-5">
          <Card header={<CardTitle>Auftragsbuch</CardTitle>} padding="none">
            <div className="p-3 pb-1">
              <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
                Angebote (Verkauf)
              </p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Preis (€/t)</th>
                  <th>Menge (t)</th>
                  <th>Anbieter</th>
                </tr>
              </thead>
              <tbody>
                {state.asks.map((ask) => (
                  <tr
                    key={ask.id}
                    className="cursor-pointer hover:bg-red-50 transition-colors"
                    onClick={() => fillPrice(ask.price, "BUY")}
                  >
                    <td className="price-down font-mono font-semibold">
                      {new Decimal(ask.price).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="text-cb-gray-700 font-mono">{new Decimal(ask.remaining).toFixed(0)}</td>
                    <td className="text-cb-gray-500 text-xs">{ask.org}</td>
                  </tr>
                ))}
                {state.asks.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-cb-gray-400 text-sm py-4">Keine Angebote</td></tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center gap-3 px-4 py-2 bg-cb-yellow/10 border-y border-cb-yellow/30">
              <span className="text-xs text-cb-gray-500">Spread</span>
              <span className="font-bold text-cb-petrol font-mono">{spreadAbs}</span>
              <span className="text-xs text-cb-gray-400">{spreadPct}</span>
            </div>

            <div className="p-3 pb-1 pt-2">
              <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
                Gebote (Kauf)
              </p>
            </div>
            <table>
              <tbody>
                {state.bids.map((bid) => (
                  <tr
                    key={bid.id}
                    className="cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => fillPrice(bid.price, "SELL")}
                  >
                    <td className="price-up font-mono font-semibold">
                      {new Decimal(bid.price).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="text-cb-gray-700 font-mono">{new Decimal(bid.remaining).toFixed(0)}</td>
                    <td className="text-cb-gray-500 text-xs">{bid.org}</td>
                  </tr>
                ))}
                {state.bids.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-cb-gray-400 text-sm py-4">Keine Gebote</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Order-Formular */}
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
                <p className="text-xs text-cb-gray-500 mb-0.5">Gesamtwert (Decimal.js)</p>
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
                Auftrag zurücksetzen
              </Button>
            </div>
          </Card>
        </div>

        {/* Letzte Abschlüsse */}
        <div className="col-span-4">
          <Card header={<CardTitle>Letzte Abschlüsse</CardTitle>} padding="none">
            <table>
              <thead>
                <tr>
                  <th>Zeit</th>
                  <th>Preis</th>
                  <th>Menge</th>
                  <th>Dir.</th>
                </tr>
              </thead>
              <tbody>
                {state.deals.slice(0, 12).map((deal) => (
                  <tr key={deal.id}>
                    <td className="font-mono text-xs text-cb-gray-400">
                      {new Date(deal.time).toLocaleTimeString("de-DE")}
                    </td>
                    <td className={`font-mono font-semibold ${
                      deal.direction === "BUY" ? "price-up" : "price-down"
                    }`}>
                      {new Decimal(deal.price).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="font-mono text-cb-gray-700">
                      {new Decimal(deal.qty).toFixed(0)}
                    </td>
                    <td>
                      <Badge
                        variant={deal.direction === "BUY" ? "success" : "error"}
                        dot
                      >
                        {deal.direction === "BUY" ? "K" : "V"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {state.deals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-cb-gray-400 text-sm py-6">
                      Noch keine Abschlüsse
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {/* Session-Timeline */}
          <Card className="mt-4" padding="sm">
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
                    p.done   ? "bg-cb-success" :
                    p.active ? "bg-cb-yellow animate-pulse" :
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
