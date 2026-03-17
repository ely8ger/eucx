"use client";

/**
 * usePortfolio — TanStack Query Hooks für Portfolio-Daten
 *
 * Hooks:
 *   useBalanceQuery()       — GET /api/portfolio/balance
 *   useActiveOrdersQuery()  — GET /api/orders (ACTIVE + PARTIALLY_FILLED)
 *   useUserDealsQuery()     — GET /api/orders (FILLED — abgeschlossene Aufträge)
 *   useCancelOrder()        — PATCH /api/orders/{id} → CANCELLED
 *
 * Query-Key-Struktur:
 *   ["portfolio", "balance"]        — Kontostand
 *   ["portfolio", "orders", status] — Aufträge nach Status
 *
 * Invalidierung:
 *   Nach Stornierung werden "balance" und "orders" invalidiert.
 *   usePrivateSocket-Callbacks invalidieren ebenfalls (von Aufrufer gesteuert).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import Decimal from "decimal.js";

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface WalletBalance {
  currency:        string;
  balance:         string;   // verfügbar
  reservedBalance: string;   // für offene Orders blockiert
  total:           string;   // balance + reserved
  lastUpdated:     string | null;
}

export interface BalanceResponse {
  wallets: WalletBalance[];
}

export type OrderStatus = "ACTIVE" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED" | "EXPIRED";

export interface PortfolioOrder {
  id:             string;
  direction:      "BUY" | "SELL";
  pricePerUnit:   string;
  quantity:       string;
  filledQuantity: string;
  status:         OrderStatus;
  currency:       string;
  createdAt:      string;
  // Computed client-side
  remainingQty:   string;
  totalValue:     string;
  filledPct:      number;   // 0–100
}

export interface OrdersResponse {
  orders: Omit<PortfolioOrder, "remainingQty" | "totalValue" | "filledPct">[];
}

// ─── Auth-Token ───────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    localStorage.getItem("access_token")
  );
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Query-Keys ───────────────────────────────────────────────────────────────

export const PORTFOLIO_KEYS = {
  all:     ()               => ["portfolio"] as const,
  balance: ()               => ["portfolio", "balance"] as const,
  orders:  (status: string) => ["portfolio", "orders", status] as const,
};

// ─── Computed Felder berechnen ────────────────────────────────────────────────

function enrichOrder(o: OrdersResponse["orders"][number]): PortfolioOrder {
  const price  = new Decimal(o.pricePerUnit);
  const qty    = new Decimal(o.quantity);
  const filled = new Decimal(o.filledQuantity);

  const totalValue    = price.times(qty).toFixed(2);
  const remainingQty  = qty.minus(filled).toFixed(3);
  const filledPct     = qty.isZero()
    ? 0
    : filled.div(qty).times(100).toDecimalPlaces(1).toNumber();

  return { ...o, totalValue, remainingQty, filledPct };
}

// ─── Fetch-Funktionen ─────────────────────────────────────────────────────────

async function fetchBalance(): Promise<BalanceResponse> {
  const res = await fetch("/api/portfolio/balance", {
    headers: authHeaders(),
    cache:   "no-store",
  });
  if (!res.ok) throw new Error(`Balance-Fetch fehlgeschlagen: HTTP ${res.status}`);
  return res.json() as Promise<BalanceResponse>;
}

async function fetchOrders(statuses: OrderStatus[]): Promise<PortfolioOrder[]> {
  const params = new URLSearchParams();
  statuses.forEach((s) => params.append("status", s));

  const res = await fetch(`/api/orders?${params.toString()}`, {
    headers: authHeaders(),
    cache:   "no-store",
  });
  if (!res.ok) throw new Error(`Orders-Fetch fehlgeschlagen: HTTP ${res.status}`);

  const data = (await res.json()) as OrdersResponse;
  return data.orders.map(enrichOrder);
}

async function cancelOrder(orderId: string): Promise<void> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body:    JSON.stringify({ status: "CANCELLED" }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Stornierung fehlgeschlagen: HTTP ${res.status}${text ? ` — ${text}` : ""}`);
  }
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useBalanceQuery(): UseQueryResult<BalanceResponse, Error> {
  return useQuery({
    queryKey:   PORTFOLIO_KEYS.balance(),
    queryFn:    fetchBalance,
    staleTime:  15_000,   // 15s — Kontostand ändern sich selten, aber wichtig aktuell
    gcTime:     120_000,
    retry:      2,
    refetchOnWindowFocus: true,   // Bei Tab-Rückkehr aktualisieren
  });
}

export function useActiveOrdersQuery(): UseQueryResult<PortfolioOrder[], Error> {
  return useQuery({
    queryKey:        PORTFOLIO_KEYS.orders("active"),
    queryFn:         () => fetchOrders(["ACTIVE", "PARTIALLY_FILLED"]),
    staleTime:       10_000,   // 10s — offene Orders können sich schnell ändern
    gcTime:          60_000,
    refetchInterval: 30_000,   // Background-Refresh alle 30s
    retry:           2,
  });
}

export function useUserDealsQuery(): UseQueryResult<PortfolioOrder[], Error> {
  return useQuery({
    queryKey:  PORTFOLIO_KEYS.orders("filled"),
    queryFn:   () => fetchOrders(["FILLED"]),
    staleTime: 60_000,   // Abgeschlossene Deals ändern sich nicht
    gcTime:    300_000,
    retry:     2,
  });
}

// ─── Mutation: Auftrag stornieren ─────────────────────────────────────────────

export function useCancelOrder(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,

    // Optimistic Update: sofort aus der Liste entfernen
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });

      const previous = queryClient.getQueryData<PortfolioOrder[]>(
        PORTFOLIO_KEYS.orders("active"),
      );
      queryClient.setQueryData<PortfolioOrder[]>(
        PORTFOLIO_KEYS.orders("active"),
        (old) => old?.filter((o) => o.id !== orderId) ?? [],
      );

      return { previous };
    },

    // Rollback bei Fehler
    onError: (_err, _orderId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PORTFOLIO_KEYS.orders("active"), context.previous);
      }
    },

    // Nach Erfolg: Balance ebenfalls invalidieren (reservedBalance ändert sich)
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
    },
  });
}
