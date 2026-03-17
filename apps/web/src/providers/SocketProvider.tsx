"use client";

/**
 * SocketProvider — Globale WebSocket-Verbindung (Single Connection Pattern)
 *
 * Warum ein globaler Provider?
 *   Ohne Provider erstellt jede Komponente/Hook ihre eigene Socket-Verbindung.
 *   Bei 5 aktiven Komponenten: 5 Verbindungen, 5× Server-Load, Race Conditions.
 *   Mit Provider: genau 1 Verbindung, geteilt über React Context.
 *
 * Auto-Reconnect:
 *   Exponentielles Backoff: 1s → 2s → 4s → 8s → 16s (max 5 Versuche).
 *   Nach 5 fehlgeschlagenen Versuchen: kein weiterer Reconnect (verhindert
 *   Flood bei dauerhaftem Server-Ausfall). User muss Seite neu laden.
 *
 * JWT-Authentifizierung:
 *   Socket.io übergibt { auth: { token } } beim Handshake. Das Token wird
 *   beim Connect-Zeitpunkt aus dem Cookie oder localStorage gelesen —
 *   nicht gecacht, damit Token-Rotation funktioniert.
 *
 * Nutzung:
 *   // App-Root:
 *   <SocketProvider apiUrl="https://api.eucx.exchange">
 *     <App />
 *   </SocketProvider>
 *
 *   // Irgendwo in der App:
 *   const { socket, connected, transport } = useSocket();
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type Transport = "socket.io" | "disconnected";

export interface SocketContextValue {
  socket:            Socket | null;
  connected:         boolean;
  transport:         Transport;
  reconnectAttempt:  number;
  /** Manuell neu verbinden (nach max. Versuchen oder für expliziten Reset) */
  reconnect:         () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket:           null,
  connected:        false,
  transport:        "disconnected",
  reconnectAttempt: 0,
  reconnect:        () => {},
});

// ─── Exponentielles Backoff ───────────────────────────────────────────────────

const BACKOFF_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000] as const;
const MAX_ATTEMPTS      = BACKOFF_DELAYS_MS.length;

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    (typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null)
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface SocketProviderProps {
  children:   ReactNode;
  /** NestJS API URL — defaults to NEXT_PUBLIC_API_URL */
  apiUrl?:    string;
  namespace?: string;
}

export function SocketProvider({
  children,
  apiUrl,
  namespace = "/trading",
}: SocketProviderProps) {
  const [connected,        setConnected]        = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const socketRef        = useRef<Socket | null>(null);
  const reconnectTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef       = useRef(0);
  const unmountedRef     = useRef(false);

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const connect = useCallback(() => {
    const url    = apiUrl ?? process.env.NEXT_PUBLIC_API_URL;
    const token  = getToken();

    if (!url || !token) return;

    // Bestehende Verbindung sauber trennen
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket: Socket = io(`${url}${namespace}`, {
      auth:              { token },
      transports:        ["websocket", "polling"],
      timeout:           5_000,
      // Socket.io's eigenes Reconnect deaktivieren — wir steuern das selbst
      reconnection:      false,
      forceNew:          true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (unmountedRef.current) return;
      attemptRef.current = 0;
      setReconnectAttempt(0);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      if (unmountedRef.current) return;
      setConnected(false);

      // Nicht reconnecten bei expliziten Trennungen
      if (reason === "io client disconnect" || reason === "io server disconnect") return;

      scheduleReconnect();
    });

    socket.on("connect_error", () => {
      if (unmountedRef.current) return;
      setConnected(false);
      scheduleReconnect();
    });
  }, [apiUrl, namespace]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimer();

    if (attemptRef.current >= MAX_ATTEMPTS) return; // Aufgeben nach max. Versuchen

    const delay = BACKOFF_DELAYS_MS[attemptRef.current] ?? 16_000;
    attemptRef.current++;
    setReconnectAttempt(attemptRef.current);

    reconnectTimer.current = setTimeout(() => {
      if (!unmountedRef.current) connect();
    }, delay);
  }, [connect]);

  /** Expliziter Reconnect — setzt Backoff zurück */
  const reconnect = useCallback(() => {
    attemptRef.current = 0;
    setReconnectAttempt(0);
    clearReconnectTimer();
    connect();
  }, [connect]);

  // Initialer Connect
  useEffect(() => {
    unmountedRef.current = false;

    // Warten bis hydration abgeschlossen (Token ist im Browser verfügbar)
    const initTimer = setTimeout(connect, 100);

    return () => {
      unmountedRef.current = true;
      clearTimeout(initTimer);
      clearReconnectTimer();
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket:           socketRef.current,
      connected,
      transport:        connected ? "socket.io" : "disconnected",
      reconnectAttempt,
      reconnect,
    }),
    // socketRef.current ist kein reaktiver Wert — connected/reconnectAttempt sind es
    [connected, reconnectAttempt, reconnect] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// ─── Consumer Hook ────────────────────────────────────────────────────────────

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
