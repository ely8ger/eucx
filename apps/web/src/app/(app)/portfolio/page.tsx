"use client";

import Link                   from "next/link";
import { useQueryClient }     from "@tanstack/react-query";
import { BalanceCard }        from "@/components/portfolio/BalanceCard";
import { ActiveOrders }       from "@/components/portfolio/ActiveOrders";
import { DealHistory }        from "@/components/portfolio/DealHistory";
import { usePrivateSocket }   from "@/hooks/usePrivateSocket";
import { useToast }           from "@/components/ui/toast";
import { PORTFOLIO_KEYS }     from "@/hooks/usePortfolio";
import type {
  OrderFilledEvent,
  OrderPartiallyFilledEvent,
  OrderCancelledEvent,
  BalanceUpdatedEvent,
  DealMatchedUserEvent,
} from "@/hooks/usePrivateSocket";

const F = "'IBM Plex Sans', Arial, sans-serif";

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const toast       = useToast();

  usePrivateSocket({
    onOrderFilled: (e: OrderFilledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("filled") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      const qty   = parseFloat(e.filledQuantity).toLocaleString("de-DE");
      const price = parseFloat(e.pricePerUnit).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      toast.success("Auftrag vollständig ausgeführt", `${qty} t × ${price} €/t · ${e.currency}`);
    },
    onOrderPartiallyFilled: (e: OrderPartiallyFilledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      const qty = parseFloat(e.filledQuantity).toLocaleString("de-DE");
      toast.info("Teilausführung", `${qty} t ausgeführt - ${parseFloat(e.remainingQuantity).toLocaleString("de-DE")} t verbleiben`);
    },
    onOrderCancelled: (e: OrderCancelledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      if (e.reason !== "USER_REQUEST") toast.warning("Auftrag storniert", `Grund: ${e.reason}`);
    },
    onBalanceUpdated: (_e: BalanceUpdatedEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
    },
    onDealMatchedUser: (e: DealMatchedUserEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("filled") });
      const qty   = parseFloat(e.quantity).toLocaleString("de-DE");
      const price = parseFloat(e.pricePerUnit).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      toast.success("Handel abgeschlossen", `${qty} t × ${price} €/t`);
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: F }}>

      {/* ── Seitenkopf ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Portfolio</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Kontostand, offene Aufträge und Handelshistorie</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/deals" style={{
            display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px",
            border: "1px solid #154194", color: "#154194", fontSize: 13, fontWeight: 600,
            textDecoration: "none", backgroundColor: "#fff",
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0f4fb")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
            Alle Abschlüsse
          </Link>
          <Link href="/trading" style={{
            display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px",
            backgroundColor: "#154194", color: "#fff", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
            Handelsraum
          </Link>
        </div>
      </div>

      {/* ── 4 + 8 Layout ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "start" }}>

        {/* Links: Balance + Schnellzugriff */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BalanceCard />
          <div style={{ backgroundColor: "#fff", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", fontWeight: 500, margin: "0 0 12px" }}>Schnellzugriff</p>
            {[
              { href: "/trading",          label: "Handelsraum"    },
              { href: "/trading/terminal", label: "Pro Terminal",   badge: "NEU" },
              { href: "/deals",            label: "Alle Abschlüsse" },
              { href: "/reports",          label: "Handelsberichte" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <span style={{ fontSize: 13, color: "#333" }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#154194", backgroundColor: "#eef2fb", padding: "2px 6px" }}>{item.badge}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Rechts: Aufträge + Historie */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ActiveOrders />
          <DealHistory />
        </div>

      </div>
    </div>
  );
}
