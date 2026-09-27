"use client";

/**
 * useNotificationStream - Private SSE-Events als WebSocket-Fallback
 *
 * Verbindet sich mit /api/notifications/stream und liefert dieselben
 * Events wie usePrivateSocket - wird automatisch aktiv wenn kein WebSocket.
 *
 * Kompatibel mit den Typen aus usePrivateSocket:
 *   OrderFilledEvent, OrderPartiallyFilledEvent, OrderCancelledEvent,
 *   BalanceUpdatedEvent, DealMatchedUserEvent
 *
 * Reconnect: exponentielles Backoff (1s → 2s → 4s → ... → 30s max).
 * Last-Event-ID: jede Reconnection startet ab letztem bekanntem Event.
 */

import { useEffect, useRef } from "react";
import type {
  OrderFilledEvent,
  OrderPartiallyFilledEvent,
  OrderCancelledEvent,
  BalanceUpdatedEvent,
  DealMatchedUserEvent,
  UsePrivateSocketOptions,
} from "./usePrivateSocket";

export type { UsePrivateSocketOptions };

export function useNotificationStream(
  options:  UsePrivateSocketOptions,
  enabled:  boolean = true,
): void {
  const cbRef  = useRef(options);
  cbRef.current = options;

  const esRef     = useRef<EventSource | null>(null);
  const lastIdRef = useRef<string>("0");

  useEffect(() => {
    if (!enabled) return;

    let retryCount    = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let mounted       = true;

    function connect() {
      if (!mounted) return;

      // Last-Event-ID als Query-Param (EventSource sendet beim manuellen Reconnect kein Header)
      // Cookie wird vom Browser automatisch mitgesendet - kein Token in der URL nötig
      const lastId = lastIdRef.current;
      const url = `/api/notifications/stream${
        lastId && lastId !== "0" ? `?lastEventId=${encodeURIComponent(lastId)}` : ""
      }`;
      const es  = new EventSource(url);
      esRef.current = es;

      es.addEventListener("connected", () => {
        retryCount = 0;
      });

      es.addEventListener("order_filled", (e: Event) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as OrderFilledEvent;
          if ((e as MessageEvent).lastEventId) lastIdRef.current = (e as MessageEvent).lastEventId;
          cbRef.current.onOrderFilled?.(data);
        } catch { /* malformed */ }
      });

      es.addEventListener("order_partially_filled", (e: Event) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as OrderPartiallyFilledEvent;
          if ((e as MessageEvent).lastEventId) lastIdRef.current = (e as MessageEvent).lastEventId;
          cbRef.current.onOrderPartiallyFilled?.(data);
        } catch { /* malformed */ }
      });

      es.addEventListener("order_cancelled", (e: Event) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as OrderCancelledEvent;
          if ((e as MessageEvent).lastEventId) lastIdRef.current = (e as MessageEvent).lastEventId;
          cbRef.current.onOrderCancelled?.(data);
        } catch { /* malformed */ }
      });

      es.addEventListener("balance_updated", (e: Event) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as BalanceUpdatedEvent;
          if ((e as MessageEvent).lastEventId) lastIdRef.current = (e as MessageEvent).lastEventId;
          cbRef.current.onBalanceUpdated?.(data);
        } catch { /* malformed */ }
      });

      es.addEventListener("deal_matched", (e: Event) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as DealMatchedUserEvent;
          if ((e as MessageEvent).lastEventId) lastIdRef.current = (e as MessageEvent).lastEventId;
          cbRef.current.onDealMatchedUser?.(data);
        } catch { /* malformed */ }
      });

      es.onerror = () => {
        es.close();
        if (!mounted) return;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30_000);
        retryCount++;
        retryTimeout = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      mounted = false;
      retryTimeout && clearTimeout(retryTimeout);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled]);
}
