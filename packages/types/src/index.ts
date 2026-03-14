// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderDirection = "buy" | "sell";

export type OrderStatus =
  | "active"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "expired";

export type SessionStatus =
  | "scheduled"
  | "pre_trading"
  | "trading_1"
  | "correction_1"
  | "trading_2"
  | "correction_2"
  | "final"
  | "closed";

export type DealStatus = "matched" | "confirmed" | "cancelled" | "disputed";

export type UserRole = "admin" | "seller" | "buyer" | "observer";

export type SteelForm = "rebar" | "wire_rod" | "beam" | "pipe" | "sheet" | "coil";

export type SteelStandard =
  | "EN_10080"
  | "ASTM_A615"
  | "GOST_5781"
  | "DIN_488"
  | "BS_4449";

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  taxId: string;
  country: string;
  city: string;
  isVerified: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended" | "pending";
  totpEnabled: boolean;
  createdAt: string;
}

export interface SteelProduct {
  id: string;
  organizationId: string;
  form: SteelForm;
  grade: string;
  diameter?: number;
  standard: SteelStandard;
  quantityTons: number;
  minLotTons: number;
  originCountry: string;
  productionYear: number;
  warehouseLocation: string;
  hasCertificate: boolean;
}

export interface Order {
  id: string;
  sessionId: string;
  userId: string;
  organizationId: string;
  productId: string;
  direction: OrderDirection;
  pricePerUnit: number;
  currency: "EUR" | "PLN" | "USD";
  quantityTons: number;
  filledQuantity: number;
  status: OrderStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  sessionId: string;
  sellOrderId: string;
  buyOrderId: string;
  sellerOrgId: string;
  buyerOrgId: string;
  productId: string;
  quantityTons: number;
  pricePerUnit: number;
  totalValue: number;
  currency: "EUR" | "PLN" | "USD";
  status: DealStatus;
  createdAt: string;
}

export interface TradingSession {
  id: string;
  productId: string;
  currentStatus: SessionStatus;
  scheduledStart: string;
  endedAt?: string;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export type WsEventType =
  | "session_period_changed"
  | "order_submitted"
  | "order_updated"
  | "order_cancelled"
  | "deal_matched"
  | "price_update"
  | "error";

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
  timestamp: string;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

export interface OrderBook {
  sessionId: string;
  bids: OrderBookLevel[];  // sortiert: höchster Preis zuerst
  asks: OrderBookLevel[];  // sortiert: niedrigster Preis zuerst
  lastUpdated: string;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
