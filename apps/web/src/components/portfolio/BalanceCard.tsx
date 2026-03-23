"use client";

import Decimal             from "decimal.js";
import { Card, CardTitle } from "@/components/ui/card";
import { useBalanceQuery } from "@/hooks/usePortfolio";
import { useI18n }         from "@/lib/i18n/context";
import { fmtEUR }          from "@/lib/fmt";
import type { WalletBalance } from "@/hooks/usePortfolio";
import { DEMO_WALLET } from "@/components/portfolio/demoData";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";
const LOCALE_BCP: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES", pl: "pl-PL", ru: "ru-RU" };

function BalanceRow({ w }: { w: WalletBalance }) {
  const { t, locale } = useI18n();
  const bcp = LOCALE_BCP[locale] ?? "de-DE";

  const balance  = new Decimal(w.balance);
  const reserved = new Decimal(w.reservedBalance);
  const total    = new Decimal(w.total);

  const fmt = (d: InstanceType<typeof Decimal>) => fmtEUR(d.toNumber());

  const reservedPct = total.isZero()
    ? 0
    : reserved.div(total).times(100).toDecimalPlaces(1).toNumber();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hauptbetrag */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", margin: "0 0 4px" }}>{t("portfolio_available")}</p>
          <p style={{ fontSize: 32, fontWeight: 300, color: BLUE, fontFamily: "'IBM Plex Mono', monospace", margin: 0, lineHeight: 1 }}>
            {fmt(balance)}
          </p>
          <p style={{ fontSize: 12, color: "#888", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>{w.currency}</p>
        </div>
        {w.lastUpdated && (
          <p style={{ fontSize: 11, color: "#aaa", fontFamily: F }}>
            {t("portfolio_timestamp")} {new Date(w.lastUpdated).toLocaleTimeString(bcp)}
          </p>
        )}
      </div>

      {/* Fortschrittsbalken */}
      {!total.isZero() && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 6 }}>
            <span>{t("portfolio_allocation_label")}</span>
            <span>{reservedPct}{t("portfolio_reserved_pct")}</span>
          </div>
          <div style={{ height: 4, backgroundColor: "#f0f0f0" }}>
            <div style={{ height: "100%", backgroundColor: BLUE, width: `${100 - reservedPct}%`, transition: "width .5s" }} />
          </div>
        </div>
      )}

      {/* Kennzahlen-Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, backgroundColor: "#e8e8e8" }}>
        <div style={{ backgroundColor: "#f7f9fc", padding: "12px 14px" }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", margin: "0 0 4px" }}>{t("portfolio_total")}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: BLUE, fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{fmt(total)}</p>
        </div>
        <div style={{ backgroundColor: "#fffbeb", padding: "12px 14px" }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#92400e", margin: "0 0 4px" }}>{t("portfolio_reserved")}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#92400e", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{fmt(reserved)}</p>
          <p style={{ fontSize: 10, color: "#b45309", marginTop: 3 }}>{t("portfolio_open_orders_sub")}</p>
        </div>
      </div>
    </div>
  );
}

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
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[120, "100%", 60].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? 40 : 8, backgroundColor: "#f0f0f0", width: w, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      )}
      {!isLoading && (data?.wallets ?? [DEMO_WALLET]).map((w) => <BalanceRow key={w.currency} w={w} />)}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </Card>
  );
}
