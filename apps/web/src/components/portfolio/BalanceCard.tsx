"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { useBalanceQuery } from "@/hooks/usePortfolio";
import { useI18n }         from "@/lib/i18n/context";

const BLUE = "#154194";

export function BalanceCard() {
  const { t } = useI18n();
  const { data, isLoading, isFetching } = useBalanceQuery();

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <CardTitle>{t("portfolio_balance_title")}</CardTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isFetching && !isLoading && <span style={{ fontSize: 12, color: "#aaa", animation: "spin .8s linear infinite", display: "inline-block" }}>↺</span>}
        <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 8px" }}>{t("portfolio_eur_account")}</span>
      </div>
    </div>
  );

  return (
    <Card header={header} highlighted>
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[120, "100%"].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? 40 : 8, backgroundColor: "#f0f0f0", width: w, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          {(data?.wallets ?? []).length > 0
            ? `${(data?.wallets ?? []).length} Handelskonto(en) eingerichtet`
            : "Kein Handelskonto — Banküberweisung direkt an Handelspartner"}
        </p>
      )}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </Card>
  );
}
