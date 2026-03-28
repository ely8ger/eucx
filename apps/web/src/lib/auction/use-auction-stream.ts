/**
 * useAuctionStream — SSE-Hook für Live-Lot-Updates
 *
 * Verbindet sich mit /api/auction/lots/[lotId]/stream und gibt
 * den aktuellen State zurück. Reconnect-Logik bei Verbindungsabbruch.
 */
"use client";

import { useEffect, useState, useRef } from "react";

export interface AuctionState {
  phase:              "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";
  currentBest:        string | null;
  auctionEnd:         string | null;
  bidCount:           number;
  registrationCount:  number;
  activeBidderCount:  number;
  updatedAt:          string;
}

export function useAuctionStream(lotId: string, token: string) {
  const [state, setState]       = useState<AuctionState | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!lotId || !token) return;

    let retryTimeout: ReturnType<typeof setTimeout>;
    let retryCount = 0;

    function connect() {
      const url = `/api/auction/lots/${lotId}/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        retryCount = 0;
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data.error) {
            setState(data as AuctionState);
          }
        } catch { /* ignore malformed */ }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Exponential backoff: 2s, 4s, 8s, max 30s
        const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);
        retryCount++;
        retryTimeout = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      esRef.current?.close();
      setConnected(false);
    };
  }, [lotId, token]);

  return { state, connected };
}
