"use client";

import Decimal               from "decimal.js";
import Link                  from "next/link";
import { Card, CardTitle }   from "@/components/ui/card";
import { Button }            from "@/components/ui/button";
import { EmptyState }        from "@/components/portfolio/EmptyState";
import { useUserDealsQuery } from "@/hooks/usePortfolio";
import { DEMO_DEALS } from "@/components/portfolio/demoData";
import { useI18n }           from "@/lib/i18n/context";
import type { PortfolioOrder } from "@/hooks/usePortfolio";

const BLUE = "#154194";
const LOCALE_BCP: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES", pl: "pl-PL", ru: "ru-RU" };

function DealRow({ order }: { order: PortfolioOrder }) {
  const { t, locale } = useI18n();
  const bcp = LOCALE_BCP[locale] ?? "de-DE";

  const isBuy = order.direction === "BUY";
  const fmtPrice  = new Decimal(order.pricePerUnit).toFixed(2);
  const fmtQty    = new Decimal(order.filledQuantity).toFixed(0);
  const fmtTotal  = new Decimal(order.totalValue).toNumber().toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtTime   = new Date(order.createdAt).toLocaleString(bcp, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <tr style={{ borderBottom: "1px solid #f7f7f7" }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>{fmtTime}</td>
      <td style={{ padding: "10px 16px" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: isBuy ? "#166534" : "#dc2626", backgroundColor: isBuy ? "#f0fdf4" : "#fff1f1", padding: "2px 8px" }}>
          {isBuy ? t("portfolio_dir_buy") : t("portfolio_dir_sell_full")}
        </span>
      </td>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: BLUE }}>
        {fmtPrice}<span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}> €/t</span>
      </td>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#505050" }}>{fmtQty} t</td>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: isBuy ? "#166534" : "#dc2626" }}>{fmtTotal} €</td>
      <td style={{ padding: "10px 16px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 8px" }}>{t("portfolio_status_executed")}</span>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid #f7f7f7" }}>
      {[70, 50, 80, 60, 90, 60].map((w, i) => (
        <td key={i} style={{ padding: "10px 16px" }}>
          <div style={{ height: 12, backgroundColor: "#f0f0f0", width: w, animation: "pulse 1.5s infinite" }} />
        </td>
      ))}
    </tr>
  );
}

export function DealHistory() {
  const { t, locale } = useI18n();
  const bcp = LOCALE_BCP[locale] ?? "de-DE";

  const { data: rawDeals, isLoading, isFetching } = useUserDealsQuery();
  const deals = rawDeals ?? DEMO_DEALS;

  const totalVolume = deals.reduce((sum, d) => sum.plus(d.totalValue), new Decimal(0));

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <CardTitle>{t("portfolio_history_title")}</CardTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isFetching && !isLoading && <span style={{ fontSize: 12, color: "#aaa" }}>↺</span>}
        {deals.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#505050", backgroundColor: "#f5f5f5", padding: "2px 8px" }}>{deals.length} {t("portfolio_abschl")}</span>
        )}
      </div>
    </div>
  );

  const footer = totalVolume && !totalVolume.isZero() ? (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, width: "100%" }}>
      <span style={{ color: "#888" }}>{t("portfolio_total_volume")}</span>
      <span style={{ fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: BLUE }}>
        {totalVolume.toNumber().toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </span>
    </div>
  ) : undefined;

  return (
    <Card header={header} padding="none" footer={footer}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
              {[t("portfolio_col_time"), t("portfolio_col_direction_full"), t("portfolio_col_price"), t("portfolio_col_qty"), t("portfolio_col_value"), "Status"].map((h, i) => (
                <th key={i} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            {!isLoading && deals.length === 0 && (
              <tr><td colSpan={6}>
                <EmptyState icon="◈" title={t("portfolio_deals_empty_title")} description={t("portfolio_deals_empty_desc")}
                  action={<Link href="/trading"><Button variant="outline" size="sm">{t("portfolio_trade_now")}</Button></Link>} size="md" />
              </td></tr>
            )}
            {!isLoading && deals.map((deal) => <DealRow key={deal.id} order={deal} />)}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </Card>
  );
}
