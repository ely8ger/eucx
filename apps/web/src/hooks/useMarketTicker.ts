"use client";

/**
 * useMarketTicker — Echtzeit-Marktdaten für ein Handelspaar
 *
 * Strategie:
 *   1. WebSocket (bevorzugt): Abonniert "ticker:{symbol}" Events über den
 *      SocketProvider. Latenz ~5–20ms nach Server-Event.
 *
 *   2. REST-Fallback: Wenn Socket nicht verbunden, pollt alle 30s den
 *      öffentlichen Ticker-Endpoint (Cache-Control: s-maxage=30).
 *
 * Flash-Logik:
 *   Vergleicht neuen Preis mit vorherigem. Gibt "up"/"down"/"flat" zurück.
 *   Diese Info steuert die Flash-Animation im UI (grün/rot blinken).
 *
 * Nutzung:
 *   const ticker = useMarketTicker("COPPER-LME");
 *   // ticker.price, ticker.changePercent24h, ticker.direction
 *
 * Symbol-Konvention: productId aus der DB (UUID) oder kurzer Alias
 *   "COPPER-LME", "REBAR-EU", "HRC-EU" — was der Server unter ticker:{x} schickt
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Decimal from "decimal.js";
import { useSocket } from "@/providers/SocketProvider";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type PriceDirection = "up" | "down" | "flat";

export interface MarketTicker {
  symbol:            string;
  price:             string;       // letzter Handelspreis (Decimal-String)
  prevClose:         string;       // Vortages-Schlusskurs
  change24h:         string;       // absolute Änderung in Währung
  changePercent24h:  string;       // prozentuale Änderung ("2.34")
  high24h:           string;       // Tageshoch
  low24h:            string;       // Tagestief
  volume24h:         string;       // Tagesvolumen in Einheiten
  currency:          string;       // "EUR"
  direction:         PriceDirection;
  lastUpdated:       number;       // Unix-ms
  source:            "socket" | "rest" | "initial";
}

const INITIAL_TICKER: MarketTicker = {
  symbol:           "",
  price:            "0",
  prevClose:        "0",
  change24h:        "0",
  changePercent24h: "0.00",
  high24h:          "0",
  low24h:           "0",
  volume24h:        "0",
  currency:         "EUR",
  direction:        "flat",
  lastUpdated:      0,
  source:           "initial",
};

// ─── REST-Fallback ────────────────────────────────────────────────────────────

async function fetchTicker(symbol: string): Promise<Partial<MarketTicker> | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res    = await fetch(`${apiUrl}/api/v1/public/ticker/${encodeURIComponent(symbol)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Partial<MarketTicker>;
  } catch {
    return null;
  }
}

function calcDirection(prev: string, next: string): PriceDirection {
  try {
    const d = new Decimal(next).minus(prev);
    if (d.gt(0)) return "up";
    if (d.lt(0)) return "down";
    return "flat";
  } catch {
    return "flat";
  }
}

function calcChange(price: string, prevClose: string): { change24h: string; changePercent24h: string } {
  try {
    const p    = new Decimal(price);
    const c    = new Decimal(prevClose);
    if (c.isZero()) return { change24h: "0", changePercent24h: "0.00" };
    const abs  = p.minus(c);
    const pct  = abs.div(c).times(100);
    return { change24h: abs.toFixed(2), changePercent24h: pct.toFixed(2) };
  } catch {
    return { change24h: "0", changePercent24h: "0.00" };
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const REST_POLL_INTERVAL_MS = 30_000;

export function useMarketTicker(symbol: string): MarketTicker {
  const { socket, connected } = useSocket();

  const [ticker, setTicker]   = useState<MarketTicker>({ ...INITIAL_TICKER, symbol });
  const prevPriceRef          = useRef<string>("0");
  const pollTimerRef          = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Ticker-Daten aktualisieren (aus beiden Quellen) ───────────────────────
  const updateFromData = useCallback((
    data: Partial<MarketTicker>,
    source: "socket" | "rest",
  ) => {
    setTicker((prev) => {
      const newPrice = data.price ?? prev.price;
      const direction = calcDirection(prevPriceRef.current || prev.price, newPrice);
      prevPriceRef.current = newPrice;

      const prevClose  = data.prevClose ?? prev.prevClose;
      const { change24h, changePercent24h } = (data.change24h && data.changePercent24h)
        ? { change24h: data.change24h, changePercent24h: data.changePercent24h }
        : calcChange(newPrice, prevClose);

      return {
        ...prev,
        ...data,
        symbol,
        change24h,
        changePercent24h,
        direction,
        source,
        lastUpdated: Date.now(),
      };
    });
  }, [symbol]);

  // ── WebSocket: live subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!socket || !connected) return;

    const eventName = `ticker:${symbol}`;

    socket.on(eventName, (data: Partial<MarketTicker>) => {
      updateFromData(data, "socket");
    });

    // Initial-Request: einmal beim Join
    socket.emit("subscribe:ticker", { symbol });

    return () => {
      socket.off(eventName);
      socket.emit("unsubscribe:ticker", { symbol });
    };
  }, [socket, connected, symbol, updateFromData]);

  // ── REST-Fallback: polling wenn kein Socket ───────────────────────────────
  useEffect(() => {
    // Wenn Socket verbunden → kein Polling nötig
    if (connected) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    // Sofortige erste Abfrage
    fetchTicker(symbol).then((d) => {
      if (d) updateFromData(d, "rest");
    });

    // Danach alle 30s
    pollTimerRef.current = setInterval(async () => {
      const d = await fetchTicker(symbol);
      if (d) updateFromData(d, "rest");
    }, REST_POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [connected, symbol, updateFromData]);

  return ticker;
}
