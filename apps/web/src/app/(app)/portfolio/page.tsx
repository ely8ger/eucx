"use client";

/**
 * Portfolio-Seite — /portfolio
 *
 * Drei-Spalten-Layout:
 *   Links  (col 4): BalanceCard + Quick-Links
 *   Rechts (col 8): ActiveOrders + DealHistory (übereinander)
 *
 * Private WebSocket-Events:
 *   - order:filled / order:partially_filled → Orders + Balance invalidieren + Toast
 *   - order:cancelled                       → Orders invalidieren
 *   - balance:updated                       → Balance invalidieren
 *   - deal:matched_user                     → DealHistory invalidieren + Toast
 */

import type { Metadata }      from "next";
import Link                   from "next/link";
import { useQueryClient }     from "@tanstack/react-query";
import { Badge }              from "@/components/ui/badge";
import { Button }             from "@/components/ui/button";
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

// Next.js Metadata kann bei "use client" nicht exportiert werden —
// daher im Wrapper-Segment (layout.tsx oder separater Server-Component)
// Hier direkt den Titel via document.title setzen wäre alternativ möglich.

// ─── Haupt-Seite ──────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const toast       = useToast();

  // ── Private WebSocket Events ──────────────────────────────────────────────
  usePrivateSocket({

    onOrderFilled: (e: OrderFilledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("filled") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      const qty   = parseFloat(e.filledQuantity).toLocaleString("de-DE");
      const price = parseFloat(e.pricePerUnit).toLocaleString("de-DE", {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      });
      toast.success(
        "Auftrag vollständig ausgeführt",
        `${qty} t × ${price} €/t · ${e.currency}`,
      );
    },

    onOrderPartiallyFilled: (e: OrderPartiallyFilledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      const qty = parseFloat(e.filledQuantity).toLocaleString("de-DE");
      toast.info(
        "Teilausführung",
        `${qty} t ausgeführt — ${parseFloat(e.remainingQuantity).toLocaleString("de-DE")} t verbleiben`,
      );
    },

    onOrderCancelled: (e: OrderCancelledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      if (e.reason !== "USER_REQUEST") {
        toast.warning("Auftrag storniert", `Grund: ${e.reason}`);
      }
    },

    onBalanceUpdated: (_e: BalanceUpdatedEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
    },

    onDealMatchedUser: (e: DealMatchedUserEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("filled") });
      const qty   = parseFloat(e.quantity).toLocaleString("de-DE");
      const price = parseFloat(e.pricePerUnit).toLocaleString("de-DE", {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      });
      toast.success(
        "Handel abgeschlossen",
        `${qty} t × ${price} €/t`,
      );
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-screen-2xl">

      {/* ── Seitenkopf ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cb-petrol">Portfolio</h1>
          <p className="text-sm text-cb-gray-500 mt-0.5">
            Kontostand, offene Aufträge und Handelshistorie
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/deals">
            <Button variant="outline" size="sm">Alle Abschlüsse</Button>
          </Link>
          <Link href="/trading">
            <Button variant="primary" size="sm">Handelsraum</Button>
          </Link>
        </div>
      </div>

      {/* ── Hauptlayout: 4 + 8 Spalten ─────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5 items-start">

        {/* ── Links: Balance + Quick-Links ─────────────────────────────────── */}
        <div className="col-span-4 flex flex-col gap-4">
          <BalanceCard />

          {/* Quick-Links */}
          <div className="bg-cb-white rounded border border-cb-gray-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-cb-gray-500 uppercase tracking-wider mb-3">
              Schnellzugriff
            </p>
            {[
              { href: "/trading",          label: "Handelsraum",      icon: "⚡", badge: null       },
              { href: "/trading/terminal", label: "Pro Terminal",      icon: "▦", badge: "NEU"      },
              { href: "/deals",            label: "Alle Abschlüsse",   icon: "✓", badge: null       },
              { href: "/reports",          label: "Handelsberichte",   icon: "▤", badge: null       },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-cb-gray-700 hover:bg-cb-gray-50 hover:text-cb-petrol transition-colors"
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="blue">{item.badge}</Badge>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Rechts: Aufträge + Historie ──────────────────────────────────── */}
        <div className="col-span-8 flex flex-col gap-5">
          <ActiveOrders />
          <DealHistory />
        </div>

      </div>
    </div>
  );
}
