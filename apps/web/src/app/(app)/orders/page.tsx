"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type OrderStatus = "OFFEN" | "ANGENOMMEN" | "ABGELAUFEN" | "STORNIERT" | "ABGESCHLOSSEN";
interface Order {
  id: string; sessionDate: string; sessionNo: string;
  direction: "KAUF" | "VERKAUF"; category: string; commodity: string;
  spec: string; qty: number; unit: string; pricePerUnit: number;
  currency: string; total: number; delivery: string;
  status: OrderStatus; submittedAt: string;
}

const ORDERS: Order[] = [
  { id: "A-2026-0041", sessionDate: "18.03.2026", sessionNo: "M-2026-041", direction: "VERKAUF", category: "Metalle", commodity: "Walzdraht",   spec: "5,5 mm · SAE 1006",  qty: 120, unit: "t",  pricePerUnit: 680,  currency: "EUR", total: 81600,  delivery: "Franko Lager, Hamburg", status: "OFFEN",         submittedAt: "18.03.2026 08:14" },
  { id: "A-2026-0038", sessionDate: "17.03.2026", sessionNo: "M-2026-038", direction: "KAUF",    category: "Metalle", commodity: "Betonstahl",  spec: "Ø 16 mm · B500B",    qty: 80,  unit: "t",  pricePerUnit: 710,  currency: "EUR", total: 56800,  delivery: "Franko Lager, Berlin",  status: "ANGENOMMEN",    submittedAt: "17.03.2026 09:02" },
  { id: "A-2026-0035", sessionDate: "15.03.2026", sessionNo: "M-2026-035", direction: "VERKAUF", category: "Metalle", commodity: "Träger HEA",  spec: "HEA 160 · S235JR",   qty: 45,  unit: "t",  pricePerUnit: 740,  currency: "EUR", total: 33300,  delivery: "DAP München",           status: "ABGESCHLOSSEN", submittedAt: "15.03.2026 07:55" },
  { id: "A-2026-0031", sessionDate: "12.03.2026", sessionNo: "M-2026-031", direction: "KAUF",    category: "Schrott", commodity: "Shredder",    spec: "ISRI 210",            qty: 200, unit: "t",  pricePerUnit: 320,  currency: "EUR", total: 64000,  delivery: "Franko Lager, Duisburg",status: "ABGELAUFEN",    submittedAt: "12.03.2026 10:30" },
  { id: "A-2026-0027", sessionDate: "10.03.2026", sessionNo: "M-2026-027", direction: "VERKAUF", category: "Holz",    commodity: "Fichte rund", spec: "2b-Qualität",         qty: 300, unit: "m³", pricePerUnit: 110,  currency: "EUR", total: 33000,  delivery: "Franko Forst",          status: "STORNIERT",     submittedAt: "10.03.2026 11:15" },
];

const F = "'IBM Plex Sans', Arial, sans-serif";

export default function OrdersPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState("alle");

  const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    OFFEN:         { label: t("orders_status_open"),      color: "#154194", bg: "#eef2fb" },
    ANGENOMMEN:    { label: t("orders_status_accepted"),  color: "#166534", bg: "#f0fdf4" },
    ABGESCHLOSSEN: { label: t("orders_status_done"),      color: "#166534", bg: "#f0fdf4" },
    ABGELAUFEN:    { label: t("orders_status_expired"),   color: "#92400e", bg: "#fffbeb" },
    STORNIERT:     { label: t("orders_status_cancelled"), color: "#991b1b", bg: "#fff1f1" },
  };

  const TABS = [
    { key: "alle",   label: (o: Order[]) => `${t("orders_tab_all")} (${o.length})` },
    { key: "offen",  label: (o: Order[]) => `${t("orders_tab_open")} (${o.filter(x => x.status === "OFFEN").length})` },
    { key: "aktiv",  label: (o: Order[]) => `${t("orders_tab_active")} (${o.filter(x => x.status === "ANGENOMMEN").length})` },
    { key: "archiv", label: () => t("orders_tab_archive") },
  ];

  const filtered = ORDERS.filter((o) => {
    if (tab === "offen")  return o.status === "OFFEN";
    if (tab === "aktiv")  return o.status === "ANGENOMMEN";
    if (tab === "archiv") return ["ABGELAUFEN", "STORNIERT", "ABGESCHLOSSEN"].includes(o.status);
    return true;
  });

  const totalValue  = ORDERS.filter(o => o.status === "OFFEN").reduce((a, o) => a + o.total, 0);
  const openCount   = ORDERS.filter(o => o.status === "OFFEN").length;
  const acceptedCount = ORDERS.filter(o => o.status === "ANGENOMMEN").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: F }}>

      {/* ── Seitenkopf ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>{t("orders_title")}</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{t("orders_subtitle")}</p>
        </div>
        <Link href="/orders/new" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 36, padding: "0 16px", backgroundColor: "#154194", color: "#fff",
          fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
          <Plus size={14} />
          {t("orders_btn_new")}
        </Link>
      </div>

      {/* ── KPI-Zeile ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, backgroundColor: "#e0e0e0" }}>
        {[
          { label: t("orders_kpi_open"),     value: String(openCount),                        color: "#0d1b2a" },
          { label: t("orders_kpi_accepted"), value: String(acceptedCount),                    color: "#166534" },
          { label: t("orders_kpi_volume"),   value: `€ ${(totalValue / 1000).toFixed(0)}k`,  color: "#0d1b2a" },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "#fff", padding: "18px 24px" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", margin: 0, fontWeight: 500 }}>{k.label}</p>
            <p style={{ fontSize: 28, fontWeight: 300, color: k.color, marginTop: 8, lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabellen-Container ──────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>

        {/* Header + Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{t("orders_table_title")}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ Icon: Filter, label: t("orders_btn_filter") }, { Icon: Download, label: t("orders_btn_export") }].map(({ Icon, label }) => (
              <button key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 12px", border: "1px solid #e0e0e0", backgroundColor: "#fff", fontSize: 12, color: "#505050", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", padding: "0 20px" }}>
          {TABS.map(tabItem => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)}
              style={{
                padding: "10px 14px", fontSize: 13, fontWeight: tab === tabItem.key ? 600 : 400,
                color: tab === tabItem.key ? "#154194" : "#505050",
                borderBottom: tab === tabItem.key ? "2px solid #154194" : "2px solid transparent",
                backgroundColor: "transparent", border: "none",
                cursor: "pointer", marginRight: 4,
              }}>
              {tabItem.label(ORDERS)}
            </button>
          ))}
        </div>

        {/* Tabelle */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                {[
                  t("orders_col_id"),
                  t("orders_col_direction"),
                  t("orders_col_commodity"),
                  t("orders_col_qty"),
                  t("orders_col_total"),
                  t("orders_col_session"),
                  t("orders_col_status"),
                  "",
                ].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "#888",
                    textAlign: i === 3 || i === 4 ? "right" : i === 6 ? "center" : "left",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const s = STATUS_MAP[o.status];
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f7f7f7" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#154194" }}>{o.id}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: o.direction === "KAUF" ? "#166534" : "#dc2626" }}>
                        {o.direction === "KAUF" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {o.direction}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#0d1b2a", margin: 0 }}>{o.commodity}</p>
                      <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{o.spec}</p>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontFamily: "monospace", color: "#505050" }}>
                      {o.qty.toLocaleString("de-DE")} {o.unit}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontFamily: "monospace", fontWeight: 600, color: "#0d1b2a" }}>
                      {o.total.toLocaleString("de-DE")} €
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 12, color: "#505050", margin: 0 }}>{o.sessionDate}</p>
                      <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{o.sessionNo}</p>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: s.color, backgroundColor: s.bg, padding: "2px 8px" }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button style={{ fontSize: 12, fontWeight: 600, color: "#154194", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#0f3070")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#154194")}>{t("orders_btn_details")}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", fontSize: 13, color: "#aaa" }}>{t("orders_empty")}</div>
          )}
        </div>
      </div>

    </div>
  );
}
