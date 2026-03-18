"use client";

/**
 * useOhlcQuery - TanStack Query Hook für OHLC-Kerzendaten
 *
 * Endpunkt: GET /api/market/{productId}/candles?interval={iv}&limit={n}
 * (Next.js Route → liest aus market_candles Cache, < 5ms)
 *
 * Cache-Strategie:
 *   staleTime:      30s  - REST-Cache-TTL des Backends; kein unnötiges Re-Fetch
 *   refetchInterval: 60s - Background-Refresh damit Chart auch ohne WebSocket aktuell bleibt
 *   gcTime:          5m  - Daten im Speicher halten beim Intervall-Wechsel (kein Re-Fetch)
 *
 * Query-Key-Struktur: ["ohlc", productId, interval]
 *   → Intervall-Wechsel → neuer Key → sofortiger Re-Fetch für das neue Intervall
 *   → Produkt-Wechsel  → neuer Key → sofortiger Re-Fetch für das neue Produkt
 *   → Beide alten Daten bleiben im Cache (für schnelles Zurückwechseln)
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type OhlcInterval = "ONE_MIN" | "FIFTEEN_MIN" | "ONE_HOUR" | "ONE_DAY";

export interface OhlcCandle {
  time:  number;   // Unix-Sekunden
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

export interface OhlcVolume {
  time:  number;
  value: number;
  color: string;
}

export interface OhlcTicker {
  lastPrice:  string;
  change:     string;
  changePct:  string;
  isUp:       boolean;
  volume24h:  string;
}

export interface OhlcApiResponse {
  productId:     string;
  productName:   string;
  categorySlug:  string;
  categoryLabel: string;
  unit:          string;
  interval:      OhlcInterval;
  candleCount:   number;
  candles:       OhlcCandle[];
  volume:        OhlcVolume[];
  ticker:        OhlcTicker;
}

// ─── Query-Keys ───────────────────────────────────────────────────────────────

export const OHLC_KEYS = {
  all:     ()                              => ["ohlc"] as const,
  product: (productId: string)             => ["ohlc", productId] as const,
  candles: (productId: string, iv: string) => ["ohlc", productId, iv] as const,
};

// ─── Fetch-Funktion ───────────────────────────────────────────────────────────

async function fetchCandles(
  productId: string,
  interval:  OhlcInterval,
  limit:     number,
): Promise<OhlcApiResponse> {
  const url = `/api/market/${encodeURIComponent(productId)}/candles?interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OHLC-Fetch fehlgeschlagen: HTTP ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json() as Promise<OhlcApiResponse>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOhlcQuery(
  productId: string,
  interval:  OhlcInterval,
  limit = 500,
): UseQueryResult<OhlcApiResponse, Error> {
  return useQuery({
    queryKey:    OHLC_KEYS.candles(productId, interval),
    queryFn:     () => fetchCandles(productId, interval, limit),
    staleTime:   30_000,
    gcTime:      300_000,
    // Background-Refresh: Chart bleibt aktuell auch ohne WebSocket
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: Boolean(productId),
  });
}

// ─── Hilfsfunktion: Intervall → Sekunden ─────────────────────────────────────

export const INTERVAL_SECONDS: Record<OhlcInterval, number> = {
  ONE_MIN:     60,
  FIFTEEN_MIN: 900,
  ONE_HOUR:    3_600,
  ONE_DAY:     86_400,
};
