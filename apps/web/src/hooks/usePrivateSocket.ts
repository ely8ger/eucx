"use client";

/**
 * usePrivateSocket - Privater WebSocket-Listener für benutzerspezifische Events
 *
 * Nutzt den globalen SocketProvider (Single Connection). Abonniert nach dem
 * Connect den privaten Channel "subscribe:private" - der Server identifiziert
 * den Nutzer am JWT und leitet folgende Events weiter:
 *
 *   order:filled          - Auftrag vollständig ausgeführt
 *   order:partially_filled - Teilausführung
 *   order:cancelled        - Stornierung (Admin/Session-Ende)
 *   balance:updated        - Kontostand geändert (nach Settlement)
 *   deal:matched_user      - Privater Abschluss (inkl. Gegenpartei-Details)
 *
 * Callbacks werden nicht im Reducer gespeichert - Aufrufer entscheidet selbst,
 * was mit dem Event passiert (z.B. TanStack Query invalidieren oder Toast zeigen).
 *
 * Nutzung:
 *   usePrivateSocket({
 *     onOrderFilled:    (e) => { queryClient.invalidateQueries(...); toast.success(...); },
 *     onBalanceUpdated: (e) => { queryClient.invalidateQueries(...); },
 *   });
 */

import { useEffect, useRef } from "react";
import { useSocket }         from "@/providers/SocketProvider";

// ─── Event-Typen ──────────────────────────────────────────────────────────────

export interface OrderFilledEvent {
  orderId:        string;
  direction:      "BUY" | "SELL";
  pricePerUnit:   string;
  filledQuantity: string;
  totalValue:     string;
  currency:       string;
}

export interface OrderPartiallyFilledEvent extends OrderFilledEvent {
  remainingQuantity: string;
}

export interface OrderCancelledEvent {
  orderId:    string;
  reason:     string;   // "USER_REQUEST" | "SESSION_CLOSED" | "ADMIN"
  cancelledAt: string;
}

export interface BalanceUpdatedEvent {
  currency:        string;
  newBalance:      string;
  newReserved:     string;
  changeAmount:    string;   // positiv = Eingang, negativ = Ausgang
  reason:          string;   // "DEAL_SETTLED" | "ORDER_RESERVED" | "ORDER_RELEASED"
}

export interface DealMatchedUserEvent {
  dealId:       string;
  direction:    "BUY" | "SELL";
  pricePerUnit: string;
  quantity:     string;
  totalValue:   string;
  currency:     string;
  matchedAt:    string;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface UsePrivateSocketOptions {
  onOrderFilled?:          (e: OrderFilledEvent)          => void;
  onOrderPartiallyFilled?: (e: OrderPartiallyFilledEvent) => void;
  onOrderCancelled?:       (e: OrderCancelledEvent)       => void;
  onBalanceUpdated?:       (e: BalanceUpdatedEvent)       => void;
  onDealMatchedUser?:      (e: DealMatchedUserEvent)      => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePrivateSocket(options: UsePrivateSocketOptions): void {
  const { socket, connected } = useSocket();

  // Callbacks als Ref - damit useEffect nicht bei jedem Render neu läuft
  const cbRef = useRef(options);
  cbRef.current = options;

  useEffect(() => {
    if (!socket || !connected) return;

    // Privaten Channel abonnieren (Server liest User-ID aus JWT)
    socket.emit("subscribe:private");

    const handleFilled = (e: OrderFilledEvent) =>
      cbRef.current.onOrderFilled?.(e);

    const handlePartial = (e: OrderPartiallyFilledEvent) =>
      cbRef.current.onOrderPartiallyFilled?.(e);

    const handleCancelled = (e: OrderCancelledEvent) =>
      cbRef.current.onOrderCancelled?.(e);

    const handleBalance = (e: BalanceUpdatedEvent) =>
      cbRef.current.onBalanceUpdated?.(e);

    const handleDeal = (e: DealMatchedUserEvent) =>
      cbRef.current.onDealMatchedUser?.(e);

    socket.on("order:filled",           handleFilled);
    socket.on("order:partially_filled", handlePartial);
    socket.on("order:cancelled",        handleCancelled);
    socket.on("balance:updated",        handleBalance);
    socket.on("deal:matched_user",      handleDeal);

    return () => {
      socket.emit("unsubscribe:private");
      socket.off("order:filled",           handleFilled);
      socket.off("order:partially_filled", handlePartial);
      socket.off("order:cancelled",        handleCancelled);
      socket.off("balance:updated",        handleBalance);
      socket.off("deal:matched_user",      handleDeal);
    };
  }, [socket, connected]);
}
