"use client";

/**
 * useTrading - WebSocket/SSE State Management Hook
 *
 * Kern-Mechanik:
 *   1. Transport-Chain: Socket.io → SSE → Mock
 *   2. Throttled UI-Updates: Orderbook-Snapshots werden max. 1x pro 100ms
 *      an den Reducer weitergegeben. Bei 200 Events/s friert der Browser
 *      nicht ein - der Renderer sieht nur ca. 10 Updates/s.
 *   3. Deal & Bid Events werden SOFORT dispatcht (selten, wichtig für UX).
 *
 * Throttle-Mechanismus (pendingSnapshot Pattern):
 *   Jeder "orderbook_update" Event schreibt nur in pendingSnapshot.current.
 *   Ein setInterval(100ms) flusht den letzten Snapshot in den Reducer.
 *   Zwischenzeitliche Updates werden verworfen (letzter Stand gewinnt).
 *
 * Clean State:
 *   Gefüllte Orders (status FILLED) sind im Orderbuch-Snapshot nicht
 *   enthalten - der Server filtert bereits status IN [ACTIVE, PARTIALLY_FILLED].
 *   Beim ORDERBOOK-Dispatch werden alte Einträge komplett ersetzt, nicht gemerged.
 */

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface OrderEntry {
  id:        string;
  price:     string;
  qty:       string;
  remaining: string;
  org:       string;
  country:   string;
}

export interface DealEntry {
  id:        string;
  price:     string;
  qty:       string;
  currency:  string;
  direction: string;
  time:      string;
}

export interface OrderbookState {
  asks:      OrderEntry[];
  bids:      OrderEntry[];
  deals:     DealEntry[];
  connected: boolean;
  lastTs:    number;
}

export type Transport = "socket.io" | "sse" | "mock";

export type TradingAction =
  | { type: "ORDERBOOK"; asks: OrderEntry[]; bids: OrderEntry[]; deals: DealEntry[]; ts: number }
  | { type: "NEW_BID";   bid: OrderEntry }
  | { type: "NEW_DEAL";  deal: DealEntry }
  | { type: "OPTIMISTIC_ORDER"; entry: OrderEntry; direction: "BUY" | "SELL" }
  | { type: "ROLLBACK_OPTIMISTIC"; tempId: string }
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: OrderbookState, action: TradingAction): OrderbookState {
  switch (action.type) {
    case "ORDERBOOK":
      return {
        ...state,
        asks:      action.asks,
        bids:      action.bids,
        deals:     action.deals,
        lastTs:    action.ts,
        connected: true,
      };

    case "OPTIMISTIC_ORDER":
      // Sofort anzeigen - wird bei Server-Bestätigung durch echten Snapshot ersetzt
      return action.direction === "SELL"
        ? { ...state, asks: [action.entry, ...state.asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)) }
        : { ...state, bids: [action.entry, ...state.bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)) };

    case "ROLLBACK_OPTIMISTIC":
      return {
        ...state,
        asks: state.asks.filter((o) => o.id !== action.tempId),
        bids: state.bids.filter((o) => o.id !== action.tempId),
      };

    case "NEW_DEAL":
      return { ...state, deals: [action.deal, ...state.deals].slice(0, 20) };

    case "NEW_BID":
      // Snapshot kommt separat via orderbook_update - hier nur ignorieren
      return state;

    case "CONNECTED":    return { ...state, connected: true };
    case "DISCONNECTED": return { ...state, connected: false };
    default:             return state;
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ASKS: OrderEntry[] = [
  { id: "m1", price: "545.00", qty: "120.000", remaining: "120.000", org: "Stahlwerk Polska", country: "PL" },
  { id: "m2", price: "548.50", qty: "200.000", remaining: "200.000", org: "CMC Poland S.A.",  country: "PL" },
  { id: "m3", price: "550.00", qty: "85.000",  remaining: "85.000",  org: "Celsa Huta",       country: "PL" },
];
const MOCK_BIDS: OrderEntry[] = [
  { id: "m4", price: "542.00", qty: "100.000", remaining: "100.000", org: "Bauträger GmbH",  country: "DE" },
  { id: "m5", price: "540.00", qty: "250.000", remaining: "250.000", org: "Beton AG",         country: "DE" },
  { id: "m6", price: "538.50", qty: "60.000",  remaining: "60.000",  org: "Stahlhandel Wien", country: "AT" },
];
const MOCK_DEALS: DealEntry[] = [
  { id: "md1", price: "543.00", qty: "50.000",  currency: "EUR", direction: "BUY",  time: new Date().toISOString() },
  { id: "md2", price: "545.00", qty: "120.000", currency: "EUR", direction: "SELL", time: new Date(Date.now() - 73000).toISOString() },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTrading(sessionId: string | null): {
  state:     OrderbookState;
  transport: Transport;
  dispatch:  React.Dispatch<TradingAction>;
} {
  const [state, dispatch] = useReducer(reducer, {
    asks:      MOCK_ASKS,
    bids:      MOCK_BIDS,
    deals:     MOCK_DEALS,
    connected: false,
    lastTs:    0,
  });

  const [transport, setTransport] = useState<Transport>("mock");

  // ── Throttle-Buffer: Orderbook-Snapshots werden gesammelt, nicht sofort dispatcht
  const pendingSnapshot = useRef<{
    asks: OrderEntry[];
    bids: OrderEntry[];
    deals: DealEntry[];
    ts: number;
  } | null>(null);

  // Flush alle 100ms - so sieht der React-Renderer max. 10 Renders/s
  useEffect(() => {
    const id = setInterval(() => {
      if (pendingSnapshot.current) {
        dispatch({ type: "ORDERBOOK", ...pendingSnapshot.current });
        pendingSnapshot.current = null;
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  // ── Transport-Setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token  = document.cookie.match(/access_token=([^;]+)/)?.[1];

    // ── Versuch 1: Socket.io (NestJS) ───────────────────────────────────────
    if (apiUrl && token) {
      const socket: Socket = io(`${apiUrl}/trading`, {
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
        startSse();
      });

      // Orderbook-Snapshot → in Buffer schreiben (throttled)
      socket.on("orderbook_update", (e: {
        payload: { asks: OrderEntry[]; bids: OrderEntry[]; deals: DealEntry[]; ts: number };
      }) => {
        pendingSnapshot.current = e.payload;
      });

      // Neue Deals und Gebote → sofort dispatchen (selten, kritisch für UX)
      socket.on("deal_matched", (e: { payload: DealEntry }) => {
        dispatch({ type: "NEW_DEAL", deal: e.payload });
      });

      socket.on("new_bid", (e: { payload: OrderEntry }) => {
        dispatch({ type: "NEW_BID", bid: e.payload });
      });

      socket.on("disconnect", () => dispatch({ type: "DISCONNECTED" }));

      return () => { socket.disconnect(); };
    }

    // ── Versuch 2: SSE Fallback ─────────────────────────────────────────────
    return startSse();

    function startSse(): () => void {
      const es = new EventSource(`/api/orderbook/stream?sessionId=${sessionId}`);
      setTransport("sse");

      es.addEventListener("connected", () => dispatch({ type: "CONNECTED" }));

      es.addEventListener("orderbook", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data as string) as {
            asks: OrderEntry[];
            bids: OrderEntry[];
            deals: DealEntry[];
            ts: number;
          };
          pendingSnapshot.current = data;
        } catch { /* ignore */ }
      });

      es.onerror = () => dispatch({ type: "DISCONNECTED" });

      return () => { es.close(); };
    }
  }, [sessionId]);

  return { state, transport, dispatch };
}

/** Optimistic-Order-Helper - außerhalb des Hooks nutzbar */
export function makeOptimisticEntry(
  tempId: string,
  price: string,
  qty: string,
): OrderEntry {
  return {
    id:        tempId,
    price,
    qty,
    remaining: qty,
    org:       "Mein Auftrag",
    country:   "DE",
  };
}
