/**
 * useAuctionStream — SSE-Hook für Live-Lot-Updates + Realtime-Notifications
 *
 * Verbindet sich mit /api/auction/lots/[lotId]/stream und gibt:
 *   state        → aktueller Lot-Status (Phase, Preis, Timer, Bieter-Anzahl)
 *   connected    → Verbindungsstatus
 *   notifications → neue Notification-Events (Toast-Queue, wird nach Konsum geleert)
 *
 * Reconnect-Logik mit exponentiellem Backoff bei Verbindungsabbruch.
 *
 * Notification-Event-Handling:
 *   Der Hook empfängt `event: notification` SSE-Events.
 *   Neue werden in `notifications` (State) gesammelt.
 *   Der Consumer (Dashboard) zeigt Toasts + leert die Queue mit clearNotifications().
 *   Dedup via shownIds (sessionStorage) verhindert doppelte Toasts bei Reconnect.
 */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface AuctionState {
  phase:              "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";
  currentBest:        string | null;
  auctionEnd:         string | null;
  bidCount:           number;
  registrationCount:  number;
  activeBidderCount:  number;
  updatedAt:          string;
}

export interface AuctionNotification {
  id:        string;
  type:      "OUTBID" | "LEADING" | "URGENCY_10M" | "URGENCY_5M" | "WON" | "LOST" | "CLOSED_BUYER" | "DEPOSIT_WARN";
  title:     string;
  message:   string;
  createdAt: string;
}

interface UseAuctionStreamResult {
  state:              AuctionState | null;
  connected:          boolean;
  notifications:      AuctionNotification[];
  clearNotifications: () => void;
}

const SHOWN_KEY = "eucx_shown_notifs";

function getShownIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SHOWN_KEY);
    return new Set(raw ? JSON.parse(raw) as string[] : []);
  } catch { return new Set(); }
}

function addShownId(id: string): void {
  try {
    const ids = getShownIds();
    ids.add(id);
    // Auf max. 200 begrenzen (älteste raus)
    const arr = Array.from(ids).slice(-200);
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
}

export function useAuctionStream(lotId: string, token: string): UseAuctionStreamResult {
  const [state,         setState]         = useState<AuctionState | null>(null);
  const [connected,     setConnected]     = useState(false);
  const [notifications, setNotifications] = useState<AuctionNotification[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  useEffect(() => {
    if (!lotId || !token) return;

    let retryTimeout: ReturnType<typeof setTimeout>;
    let retryCount = 0;

    function connect() {
      const url = `/api/auction/lots/${lotId}/stream?token=${encodeURIComponent(token)}`;
      const es   = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        retryCount = 0;
      };

      // Default-Event (unnamed): Lot-Status
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data.error) {
            setState(data as AuctionState);
          }
        } catch { /* ignore malformed */ }
      };

      // Typed Event: Benachrichtigung
      es.addEventListener("notification", (event) => {
        try {
          const notif = JSON.parse((event as MessageEvent).data) as AuctionNotification;
          const shownIds = getShownIds();

          // Dedup: bereits angezeigte Notifications überspringen
          if (shownIds.has(notif.id)) return;

          addShownId(notif.id);
          setNotifications((prev) => {
            // Max. 10 in der Queue
            const next = [...prev, notif].slice(-10);
            return next;
          });
        } catch { /* ignore malformed */ }
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
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

  return { state, connected, notifications, clearNotifications };
}
