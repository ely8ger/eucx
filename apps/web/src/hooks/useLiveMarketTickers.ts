"use client";

/**
 * useLiveMarketTickers - Client-Hook für alle aktiven Produkt-Ticker
 *
 * Pollt GET /api/market/tickers alle 30s.
 * Ergebnis: Array aller Produkte mit aktuellem Preis, 24h-Änderung, Volumen.
 *
 * Verwendung:
 *   const { tickers, loading, lastUpdated } = useLiveMarketTickers();
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Typ (spiegelt ohlc-queries.MarketTicker) ─────────────────────────────────

export interface LiveTicker {
  productId:     string;
  productName:   string;
  lastPrice:     string;
  priceChange:   string;   // z.B. "+5.23" oder "-1.10"
  changePct:     string;   // z.B. "+0.75%"
  volume24h:     string;
  turnover24h:   string;
  tradeCount24h: number;
}

interface State {
  tickers:     LiveTicker[];
  loading:     boolean;
  error:       string | null;
  lastUpdated: number;
}

const POLL_MS = 30_000;

export function useLiveMarketTickers(): State {
  const [state, setState] = useState<State>({
    tickers:     [],
    loading:     true,
    error:       null,
    lastUpdated: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch30s = useCallback(async () => {
    try {
      const res = await fetch("/api/market/tickers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        tickers: LiveTicker[];
        updatedAt: number;
      };
      setState({
        tickers:     json.tickers,
        loading:     false,
        error:       null,
        lastUpdated: json.updatedAt,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:   err instanceof Error ? err.message : "Ladefehler",
      }));
    }
  }, []);

  useEffect(() => {
    void fetch30s();
    timerRef.current = setInterval(() => void fetch30s(), POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch30s]);

  return state;
}
