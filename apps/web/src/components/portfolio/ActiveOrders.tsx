"use client";

import { useState, useCallback }      from "react";
import Link                           from "next/link";
import Decimal                        from "decimal.js";
import { Card, CardTitle }            from "@/components/ui/card";
import { Button }                     from "@/components/ui/button";
import { EmptyState }                 from "@/components/portfolio/EmptyState";
import { useActiveOrdersQuery, useCancelOrder } from "@/hooks/usePortfolio";
import { DEMO_ORDERS } from "@/components/portfolio/demoData";
import { useToast }                   from "@/components/ui/toast";
import { useI18n }                    from "@/lib/i18n/context";
import type { PortfolioOrder }        from "@/hooks/usePortfolio";

const BLUE = "#154194";
const RED  = "#dc2626";
const LOCALE_BCP: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES", pl: "pl-PL", ru: "ru-RU" };

function OrderRow({
  order, onCancelRequest, confirmId, onCancelConfirm, onCancelAbort, isCancelling,
}: {
  order: PortfolioOrder; onCancelRequest: (id: string) => void;
  confirmId: string | null; onCancelConfirm: (id: string) => void;
  onCancelAbort: () => void; isCancelling: boolean;
}) {
  const { t, locale } = useI18n();
  const bcp = LOCALE_BCP[locale] ?? "de-DE";

  const isBuy     = order.direction === "BUY";
  const isConfirm = confirmId === order.id;
  const isPartial = order.status === "PARTIALLY_FILLED";

  const fmtPrice  = new Decimal(order.pricePerUnit).toFixed(2);
  const fmtQty    = new Decimal(order.quantity).toFixed(0);
  const fmtFilled = new Decimal(order.filledQuantity).toFixed(0);
  const fmtTotal  = new Decimal(order.totalValue).toNumber().toLocaleString(bcp, { maximumFractionDigits: 0 });
  const fmtTime   = new Date(order.createdAt).toLocaleString(bcp, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <tr style={{ borderBottom: "1px solid #f7f7f7" }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>{fmtTime}</td>
      <td style={{ padding: "10px 16px" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: isBuy ? "#166534" : RED, backgroundColor: isBuy ? "#f0fdf4" : "#fff1f1", padding: "2px 8px" }}>
          {isBuy ? t("portfolio_dir_buy") : t("portfolio_dir_sell_short")}
        </span>
      </td>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: BLUE }}>
        {fmtPrice} <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>€/t</span>
      </td>
      <td style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#505050" }}>{fmtFilled}/{fmtQty} t</span>
          {order.filledPct > 0 && (
            <div style={{ width: 56, height: 3, backgroundColor: "#f0f0f0", flexShrink: 0 }}>
              <div style={{ height: "100%", backgroundColor: BLUE, width: `${order.filledPct}%` }} />
            </div>
          )}
          {isPartial && <span style={{ fontSize: 10, fontWeight: 600, color: "#92400e", backgroundColor: "#fffbeb", padding: "1px 6px" }}>{t("portfolio_status_partial")}</span>}
        </div>
      </td>
      <td style={{ padding: "10px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#505050" }}>{fmtTotal} €</td>
      <td style={{ padding: "10px 16px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#166534", backgroundColor: "#f0fdf4", padding: "2px 8px" }}>{t("portfolio_status_active")}</span>
      </td>
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        {isConfirm ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, color: "#888" }}>{t("portfolio_cancel_confirm")}</span>
            <Button variant="danger" size="sm" loading={isCancelling} onClick={() => onCancelConfirm(order.id)}>{t("portfolio_cancel_yes")}</Button>
            <Button variant="ghost" size="sm" onClick={onCancelAbort} disabled={isCancelling}>{t("portfolio_cancel_no")}</Button>
          </div>
        ) : (
          <button onClick={() => onCancelRequest(order.id)}
            style={{ fontSize: 12, color: "#aaa", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.color = RED)}
            onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}>
            {t("portfolio_cancel_btn")}
          </button>
        )}
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid #f7f7f7" }}>
      {[70, 50, 80, 100, 70, 60, 40].map((w, i) => (
        <td key={i} style={{ padding: "10px 16px" }}>
          <div style={{ height: 12, backgroundColor: "#f0f0f0", width: w, animation: "pulse 1.5s infinite" }} />
        </td>
      ))}
    </tr>
  );
}

export function ActiveOrders() {
  const { t }                                   = useI18n();
  const toast                                   = useToast();
  const { data: rawOrders, isLoading, isFetching } = useActiveOrdersQuery();
  const orders = rawOrders ?? DEMO_ORDERS;
  const cancelMutation                          = useCancelOrder();
  const [confirmId, setConfirmId]               = useState<string | null>(null);

  const handleCancelRequest = useCallback((id: string) => setConfirmId(id), []);
  const handleCancelAbort   = useCallback(() => setConfirmId(null), []);
  const handleCancelConfirm = useCallback(async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setConfirmId(null);
      toast.success(t("portfolio_cancelled_success"), t("portfolio_cancelled_success_desc"));
    } catch (err) {
      toast.error(t("portfolio_cancel_failed"), err instanceof Error ? err.message : "Fehler");
      setConfirmId(null);
    }
  }, [cancelMutation, toast, t]);

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <CardTitle>{t("portfolio_orders_title")}</CardTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isFetching && !isLoading && <span style={{ fontSize: 12, color: "#aaa" }}>↺</span>}
        {orders.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 8px" }}>{orders.length}</span>
        )}
      </div>
    </div>
  );

  return (
    <Card header={header} padding="none">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
              {[t("portfolio_col_time"), t("portfolio_col_direction_short"), t("portfolio_col_price"), t("portfolio_col_filled"), t("portfolio_col_value"), "Status", ""].map((h, i) => (
                <th key={i} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            {!isLoading && orders.length === 0 && (
              <tr><td colSpan={7}>
                <EmptyState icon="◷" title={t("portfolio_orders_empty_title")} description={t("portfolio_orders_empty_desc")}
                  action={<Link href="/trading"><Button variant="outline" size="sm">{t("portfolio_goto_trading")}</Button></Link>} size="md" />
              </td></tr>
            )}
            {!isLoading && orders.map((order) => (
              <OrderRow key={order.id} order={order} onCancelRequest={handleCancelRequest}
                confirmId={confirmId} onCancelConfirm={handleCancelConfirm}
                onCancelAbort={handleCancelAbort} isCancelling={cancelMutation.isPending} />
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </Card>
  );
}
