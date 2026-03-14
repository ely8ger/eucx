export type OrderDirection = "buy" | "sell";
export type OrderStatus = "active" | "partially_filled" | "filled" | "cancelled" | "expired";
export type SessionStatus = "scheduled" | "pre_trading" | "trading_1" | "correction_1" | "trading_2" | "correction_2" | "final" | "closed";
export type DealStatus = "matched" | "confirmed" | "cancelled" | "disputed";
export type UserRole = "admin" | "seller" | "buyer" | "observer";
export type SteelForm = "rebar" | "wire_rod" | "beam" | "pipe" | "sheet" | "coil";

export interface Order {
  id: string;
  direction: OrderDirection;
  pricePerUnit: number;
  currency: "EUR" | "PLN" | "USD";
  quantityTons: number;
  filledQuantity: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Deal {
  id: string;
  quantityTons: number;
  pricePerUnit: number;
  totalValue: number;
  currency: "EUR" | "PLN" | "USD";
  status: DealStatus;
  createdAt: string;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

export interface OrderBook {
  sessionId: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdated: string;
}

export interface WsEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
