import type { WalletBalance, PortfolioOrder } from "@/hooks/usePortfolio";

export const DEMO_WALLET: WalletBalance = {
  currency:        "EUR",
  balance:         "125000.00",
  reservedBalance: "18500.00",
  total:           "143500.00",
  lastUpdated:     new Date().toISOString(),
};

const O = (o: Omit<PortfolioOrder, "currency" | "remainingQty">): PortfolioOrder => ({
  ...o,
  currency:     "EUR",
  remainingQty: String(parseFloat(o.quantity) - parseFloat(o.filledQuantity)),
});

export const DEMO_ORDERS: PortfolioOrder[] = [
  O({ id: "ord-001", direction: "BUY",  status: "ACTIVE",           pricePerUnit: "485.00", quantity: "20", filledQuantity: "0",  totalValue: "9700.00",  filledPct: 0,  createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString() }),
  O({ id: "ord-002", direction: "SELL", status: "PARTIALLY_FILLED", pricePerUnit: "512.50", quantity: "50", filledQuantity: "18", totalValue: "25625.00", filledPct: 36, createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString() }),
  O({ id: "ord-003", direction: "BUY",  status: "ACTIVE",           pricePerUnit: "498.00", quantity: "15", filledQuantity: "0",  totalValue: "7470.00",  filledPct: 0,  createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString() }),
];

export const DEMO_DEALS: PortfolioOrder[] = [
  O({ id: "dea-011", direction: "BUY",  status: "FILLED", pricePerUnit: "476.00", quantity: "30", filledQuantity: "30", totalValue: "14280.00", filledPct: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }),
  O({ id: "dea-010", direction: "SELL", status: "FILLED", pricePerUnit: "521.00", quantity: "25", filledQuantity: "25", totalValue: "13025.00", filledPct: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() }),
  O({ id: "dea-009", direction: "BUY",  status: "FILLED", pricePerUnit: "493.50", quantity: "40", filledQuantity: "40", totalValue: "19740.00", filledPct: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() }),
  O({ id: "dea-008", direction: "SELL", status: "FILLED", pricePerUnit: "508.00", quantity: "60", filledQuantity: "60", totalValue: "30480.00", filledPct: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }),
  O({ id: "dea-007", direction: "BUY",  status: "FILLED", pricePerUnit: "467.00", quantity: "80", filledQuantity: "80", totalValue: "37360.00", filledPct: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() }),
];
