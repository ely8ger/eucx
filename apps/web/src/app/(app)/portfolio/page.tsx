"use client";

import Link                              from "next/link";
import { useQueryClient }                from "@tanstack/react-query";
import { BalanceCard }                   from "@/components/portfolio/BalanceCard";
import { ActiveOrders }                  from "@/components/portfolio/ActiveOrders";
import { DealHistory }                   from "@/components/portfolio/DealHistory";
import { PortfolioAllocationChart }      from "@/components/portfolio/PortfolioAllocationChart";
import { usePrivateSocket }              from "@/hooks/usePrivateSocket";
import { useToast }                      from "@/components/ui/toast";
import { PORTFOLIO_KEYS, useBalanceQuery, useActiveOrdersQuery, useUserDealsQuery } from "@/hooks/usePortfolio";
import { DEMO_WALLET, DEMO_ORDERS, DEMO_DEALS } from "@/components/portfolio/demoData";
import Decimal                           from "decimal.js";
import { useI18n }                       from "@/lib/i18n/context";
import type {
  OrderFilledEvent,
  OrderPartiallyFilledEvent,
  OrderCancelledEvent,
  BalanceUpdatedEvent,
  DealMatchedUserEvent,
} from "@/hooks/usePrivateSocket";

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 14, backgroundColor: BLUE }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#505050" }}>
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

const LOCALE_BCP: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES", pl: "pl-PL", ru: "ru-RU" };

export default function PortfolioPage() {
  const { t, locale } = useI18n();
  const bcp = LOCALE_BCP[locale] ?? "de-DE";
  const queryClient = useQueryClient();
  const toast       = useToast();

  const { data: balance } = useBalanceQuery();
  const { data: orders  } = useActiveOrdersQuery();
  const { data: deals   } = useUserDealsQuery();

  usePrivateSocket({
    onOrderFilled: (e: OrderFilledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("filled") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      const qty   = parseFloat(e.filledQuantity).toLocaleString(bcp);
      const price = parseFloat(e.pricePerUnit).toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      toast.success(t("portfolio_toast_filled"), `${qty} t × ${price} €/t · ${e.currency}`);
    },
    onOrderPartiallyFilled: (e: OrderPartiallyFilledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      const qty = parseFloat(e.filledQuantity).toLocaleString(bcp);
      toast.info(t("portfolio_toast_partial"), `${qty} ${t("portfolio_toast_partial_msg")} ${parseFloat(e.remainingQuantity).toLocaleString(bcp)} ${t("portfolio_toast_partial_remain")}`);
    },
    onOrderCancelled: (e: OrderCancelledEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("active") });
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
      if (e.reason !== "USER_REQUEST") toast.warning(t("portfolio_toast_cancelled"), `${t("portfolio_toast_cancelled_reason")} ${e.reason}`);
    },
    onBalanceUpdated: (_e: BalanceUpdatedEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.balance() });
    },
    onDealMatchedUser: (e: DealMatchedUserEvent) => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.orders("filled") });
      const qty   = parseFloat(e.quantity).toLocaleString(bcp);
      const price = parseFloat(e.pricePerUnit).toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      toast.success(t("portfolio_toast_deal"), `${qty} t × ${price} €/t`);
    },
  });

  /* ── Aggregate KPIs ──────────────────────────────────────────────────── */
  const wallet       = balance?.wallets[0] ?? DEMO_WALLET;
  const totalBalance = new Decimal(wallet.total);
  const openOrders   = (orders ?? DEMO_ORDERS).length;
  const allDeals     = deals ?? DEMO_DEALS;
  const totalDeals   = allDeals.length;
  const totalVolume  = allDeals.reduce((s, d) => s.plus(d.totalValue), new Decimal(0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, fontFamily: SANS }}>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 20, borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ borderLeft: `4px solid ${BLUE}`, paddingLeft: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>{t("portfolio_title")}</h1>
          <p style={{ fontSize: 12, color: "#999", marginTop: 6, fontFamily: MONO }}>
            {t("portfolio_subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/deals" style={{
            display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px",
            border: `1px solid ${BLUE}`, color: BLUE, fontSize: 12, fontWeight: 600,
            textDecoration: "none", backgroundColor: "#fff", letterSpacing: "0.02em",
          }}>
            {t("portfolio_btn_deals")}
          </Link>
          <Link href="/trading" style={{
            display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px",
            backgroundColor: BLUE, color: "#fff", fontSize: 12, fontWeight: 600,
            textDecoration: "none", letterSpacing: "0.02em",
          }}>
            {t("portfolio_btn_trading")}
          </Link>
        </div>
      </div>

      {/* ── KPI-Zeile ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, backgroundColor: "#dde1e8" }}>
        {[
          {
            label: t("portfolio_kpi_capital"),
            value: totalBalance.toNumber().toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €",
            sub: t("portfolio_kpi_capital_sub"),
            accent: BLUE,
          },
          {
            label: t("portfolio_kpi_orders"),
            value: openOrders.toString(),
            sub: t("portfolio_kpi_orders_sub"),
            accent: openOrders > 0 ? "#d97706" : BLUE,
          },
          {
            label: t("portfolio_kpi_deals"),
            value: totalDeals.toString(),
            sub: t("portfolio_kpi_deals_sub"),
            accent: BLUE,
          },
          {
            label: t("portfolio_kpi_volume"),
            value: totalVolume.toNumber().toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €",
            sub: t("portfolio_kpi_volume_sub"),
            accent: BLUE,
          },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} style={{ backgroundColor: "#fff", padding: "18px 22px", borderTop: `2px solid ${accent}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: "0 0 12px" }}>
              {label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 300, color: "#0d1b2a", margin: 0, fontFamily: MONO, letterSpacing: "-0.5px", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Hauptbereich ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── Linke Spalte ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Kapitalverteilung (Donut) */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <SectionHeader title={t("portfolio_section_allocation")} />
            </div>
            <div style={{ padding: "16px 20px" }}>
              <PortfolioAllocationChart />
            </div>
          </div>

          {/* Kontostand */}
          <BalanceCard />

          {/* Schnellzugriff */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <SectionHeader title={t("portfolio_section_quicklinks")} />
            </div>
            {[
              { href: "/trading",          label: t("portfolio_link_trading"),  desc: t("portfolio_link_trading_desc")  },
              { href: "/trading/terminal", label: t("portfolio_link_terminal"), desc: t("portfolio_link_terminal_desc"), badge: "NEU" },
              { href: "/deals",            label: t("portfolio_link_deals"),    desc: t("portfolio_link_deals_desc")    },
              { href: "/reports",          label: t("portfolio_link_reports"),  desc: t("portfolio_link_reports_desc")  },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #f7f7f7" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafbff")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0d1b2a", margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{item.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {item.badge && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 6px", letterSpacing: "0.06em" }}>
                        {item.badge}
                      </span>
                    )}
                    <span style={{ fontSize: 14, color: "#ccc" }}>›</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Rechte Spalte ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ActiveOrders />
          <DealHistory />
        </div>

      </div>
    </div>
  );
}
