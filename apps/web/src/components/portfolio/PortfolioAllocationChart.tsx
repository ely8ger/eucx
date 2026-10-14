"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useBalanceQuery } from "@/hooks/usePortfolio";
import { useI18n }         from "@/lib/i18n/context";

const BLUE   = "#154194";
const AMBER  = "#d97706";
const MONO   = "'IBM Plex Mono', monospace";
const SANS   = "'IBM Plex Sans', Arial, sans-serif";
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { pct: number } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  if (!p) return null;
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", padding: "8px 12px", fontFamily: SANS, boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.name}</p>
      <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: "#0d1b2a", fontFamily: MONO }}>
        {p.value} %
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa", fontFamily: MONO }}>{p.payload.pct} %</p>
    </div>
  );
}

export function PortfolioAllocationChart() {
  const { t } = useI18n();
  const { data, isLoading } = useBalanceQuery();

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: "#f0f0f0", animation: "pulse 1.5s infinite" }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    );
  }

  if (!data?.wallets?.length) return null;

  // Wallet-Konten vorhanden aber kein Saldo (ZAG: keine Kundengeldhaltung)
  const chartData = [
    { name: t("portfolio_available"), value: 1, pct: 100, color: BLUE },
  ];

  return (
    <div style={{ fontFamily: SANS }}>
      {/* Donut */}
      <div style={{ position: "relative", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              dataKey="value"
              strokeWidth={0}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <p style={{ fontSize: 10, color: "#aaa", margin: 0, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Konten</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#0d1b2a", margin: "4px 0 0", fontFamily: MONO, lineHeight: 1 }}>
            {data?.wallets?.length ?? 0}
          </p>
          <p style={{ fontSize: 10, color: "#aaa", margin: "3px 0 0" }}>aktiv</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {chartData.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, backgroundColor: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#555" }}>{d.name}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0d1b2a", fontFamily: MONO }}>
                {d.pct} %
              </span>
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: 6, fontFamily: MONO }}>{d.pct} %</span>
            </div>
          </div>
        ))}
        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "#f0f0f0", margin: "4px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("portfolio_total")}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, fontFamily: MONO }}>
            {data?.wallets?.length ?? 0} Konto(en)
          </span>
        </div>
      </div>
    </div>
  );
}
