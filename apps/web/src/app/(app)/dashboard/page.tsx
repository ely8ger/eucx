"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, Trees, Wheat, Building2, FlaskConical,
  Flame, Zap, BarChart3,
} from "lucide-react";
import { MarketSparkline } from "@/components/dashboard/MarketSparkline";
import { useI18n } from "@/lib/i18n/context";

const BLUE   = "#154194";
const MONO   = "'IBM Plex Mono', monospace";
const SANS   = "'IBM Plex Sans', Arial, sans-serif";
const GREEN  = "#166534";
const RED    = "#dc2626";
const BGGREEN= "#f0fdf4";
const BGRED  = "#fff1f1";

/* ─── Static Data (keine UI-Labels) ─────────────────────────────────── */

const CATEGORIES = [
  { id: "METALS",       labelKey: "dash_cat_metals",        subKey: "dash_cat_metals_sub",        sessions: 4, volumeNum: 12400, volume: "12.400 t", change: "+2,3 %", up: true,  Icon: Package      },
  { id: "SCRAP",        labelKey: "dash_cat_scrap",         subKey: "dash_cat_scrap_sub",          sessions: 2, volumeNum: 5800,  volume: "5.800 t",  change: "−0,8 %", up: false, Icon: Zap          },
  { id: "TIMBER",       labelKey: "dash_cat_timber",        subKey: "dash_cat_timber_sub",         sessions: 3, volumeNum: 3200,  volume: "3.200 m³", change: "+1,1 %", up: true,  Icon: Trees        },
  { id: "AGRICULTURE",  labelKey: "dash_cat_agri",          subKey: "dash_cat_agri_sub",           sessions: 5, volumeNum: 8600,  volume: "8.600 t",  change: "+0,4 %", up: true,  Icon: Wheat        },
  { id: "CHEMICALS",    labelKey: "dash_cat_chem",          subKey: "dash_cat_chem_sub",           sessions: 2, volumeNum: 1900,  volume: "1.900 t",  change: "−1,2 %", up: false, Icon: FlaskConical },
  { id: "ENERGY",       labelKey: "dash_cat_energy",        subKey: "dash_cat_energy_sub",         sessions: 1, volumeNum: 4200,  volume: "4.200 t",  change: "+3,1 %", up: true,  Icon: Flame        },
  { id: "CONSTRUCTION", labelKey: "dash_cat_construction",  subKey: "dash_cat_construction_sub",   sessions: 2, volumeNum: 6700,  volume: "6.700 t",  change: "+0,9 %", up: true,  Icon: Building2    },
  { id: "INDUSTRIALS",  labelKey: "dash_cat_industrials",   subKey: "dash_cat_industrials_sub",    sessions: 1, volumeNum: 240,   volume: "240 Stk",  change: "—",      up: null,  Icon: BarChart3    },
] as const;

const ACTIVE_SESSIONS = [
  { id: "247", nameKey: "session_bewehrungsstahl", catKey: "cat_badge_metalle", time: "14:00–16:30", orders: 34, volume: "420 t",   status: "OFFEN"       },
  { id: "248", nameKey: "session_kupfer_walzdraht",catKey: "cat_badge_metalle", time: "14:00–16:30", orders: 18, volume: "85 t",    status: "OFFEN"       },
  { id: "249", nameKey: "session_weizenmehl",      catKey: "cat_badge_agrar",   time: "10:00–12:00", orders: 22, volume: "1.200 t", status: "NUR_VERKAUF" },
  { id: "250", nameKey: "session_fichtenstammholz",catKey: "cat_badge_holz",    time: "09:00–11:00", orders: 11, volume: "340 m³",  status: "OFFEN"       },
  { id: "251", nameKey: "session_aluminiumschrott",catKey: "cat_badge_schrott", time: "13:00–15:00", orders:  9, volume: "60 t",    status: "OFFEN"       },
];

/* ─── Sub-components ─────────────────────────────────────────────────── */

function Divider() {
  return <div style={{ height: 1, backgroundColor: "#eaeaea", margin: "4px 0" }} />;
}

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 14, backgroundColor: BLUE }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#505050", fontFamily: SANS }}>
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { t, locale } = useI18n();

  const LOCALE_BCP: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES", pl: "pl-PL", ru: "ru-RU" };
  const bcp = LOCALE_BCP[locale] ?? "de-DE";

  const now = new Date().toLocaleDateString(bcp, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = new Date().toLocaleTimeString(bcp, { hour: "2-digit", minute: "2-digit" });

  const KPI = [
    { label: t("dash_kpi_sessions"), value: "20",          sub: t("dash_kpi_sub_groups"),  delta: "+2 heute",  sign: 1  },
    { label: t("dash_kpi_volume"),   value: "€ 48,2 Mio.", sub: t("dash_kpi_sub_vol"),     delta: "+4,7 %",    sign: 1  },
    { label: t("dash_kpi_members"),  value: "1.240",        sub: t("dash_kpi_sub_members"), delta: "+12 neu",   sign: 1  },
    { label: t("dash_kpi_deals"),    value: "843",          sub: t("dash_kpi_sub_deals"),   delta: "+63 vs. Ø", sign: 1  },
  ];

  const topCategories = [...CATEGORIES].sort((a, b) => b.volumeNum - a.volumeNum).slice(0, 5);
  const maxVol = topCategories[0]?.volumeNum ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, fontFamily: SANS }}>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 20, borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ borderLeft: `4px solid ${BLUE}`, paddingLeft: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: "#0d1b2a", margin: 0, letterSpacing: "-0.3px" }}>
            {t("dash_title")}
          </h1>
          <p style={{ fontSize: 12, color: "#999", marginTop: 6, fontFamily: MONO }}>
            {now} · Frankfurt am Main · {timeStr}{t("lbl_uhr") ? " " + t("lbl_uhr") : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#bbb", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("dash_trade_phase")}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, justifyContent: "flex-end" }}>
              <span style={{ width: 7, height: 7, backgroundColor: "#22c55e", display: "inline-block", borderRadius: "50%", boxShadow: "0 0 0 2px rgba(34,197,94,.2)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#166534", fontFamily: MONO }}>{t("dash_open")}</span>
            </div>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: "#e8e8e8" }} />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#bbb", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("dash_session_end")}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: "4px 0 0", fontFamily: MONO }}>18:00{t("lbl_uhr") ? " " + t("lbl_uhr") : ""}</p>
          </div>
        </div>
      </div>

      {/* ── KPI-Zeile ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader title={t("dash_market_today")} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, backgroundColor: "#dde1e8" }}>
          {KPI.map(({ label, value, sub, delta, sign }) => (
            <div key={label} style={{ backgroundColor: "#fff", padding: "20px 24px", borderTop: `2px solid ${sign > 0 ? BLUE : RED}`, position: "relative" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: "0 0 14px", fontFamily: SANS }}>
                {label}
              </p>
              <p style={{ fontSize: 30, fontWeight: 300, color: "#0d1b2a", lineHeight: 1, margin: 0, fontFamily: MONO, letterSpacing: "-0.5px" }}>
                {value}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <span style={{ fontSize: 11, color: "#aaa", fontFamily: SANS }}>{sub}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: sign > 0 ? GREEN : RED, fontFamily: MONO }}>
                  {delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart + Top-Sektionen ──────────────────────────────────── */}
      <div>
        <SectionHeader title={t("dash_trade_history")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 1, backgroundColor: "#dde1e8" }}>

          {/* Chart */}
          <div style={{ backgroundColor: "#fff", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{t("dash_daily_chart")}</p>
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontFamily: MONO }}>{t("dash_spotmarket")}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: BLUE, border: `1px solid #c7d7f0`, padding: "3px 10px", fontFamily: SANS }}>EUR</span>
              </div>
            </div>
            <MarketSparkline />
          </div>

          {/* Top-Sektionen */}
          <div style={{ backgroundColor: "#fff", padding: "20px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{t("dash_top_sections")}</p>
              <span style={{ fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("dash_by_volume")}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
              {topCategories.map(({ id, labelKey, volume, change, up, volumeNum }, idx) => (
                <Link key={id} href={`/trading?category=${id}`} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "9px 0", borderBottom: idx < topCategories.length - 1 ? "1px solid #f5f5f5" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafbff")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#ccc", fontFamily: MONO, width: 14 }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 12, color: "#333", flex: 1, fontWeight: 500 }}>{t(labelKey as any)}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a", fontFamily: MONO }}>{volume}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: up === true ? GREEN : up === false ? RED : "#888", fontFamily: MONO, minWidth: 48, textAlign: "right" }}>
                        {change}
                      </span>
                    </div>
                    <div style={{ marginLeft: 22, height: 2, backgroundColor: "#f0f0f0" }}>
                      <div style={{ height: "100%", backgroundColor: up === false ? "#fca5a5" : BLUE, width: `${Math.round((volumeNum / maxVol) * 100)}%`, opacity: 0.6 }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/trading" style={{
              textDecoration: "none", borderTop: "1px solid #f0f0f0", marginTop: 12, paddingTop: 10,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {t("dash_all_groups")}
            </Link>
          </div>

        </div>
      </div>

      {/* ── Warensektionen ─────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title={t("dash_sections")}
          right={
            <span style={{ fontSize: 11, color: "#aaa", fontFamily: MONO }}>
              {CATEGORIES.length} · {CATEGORIES.reduce((a, c) => a + c.sessions, 0)} {t("dash_sitz")}
            </span>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, backgroundColor: "#dde1e8" }}>
          {CATEGORIES.map(({ id, labelKey, subKey, sessions, change, up, volume, Icon }) => (
            <Link key={id} href={`/trading?category=${id}`} style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "#fff", padding: "16px 20px", cursor: "pointer", height: "100%", boxSizing: "border-box" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafc")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <Icon size={15} style={{ color: "#aaa" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: up === true ? GREEN : up === false ? RED : "#888" }}>
                    {change}
                  </span>
                </div>

                <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{t(labelKey as any)}</p>
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{t(subKey as any)}</p>

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontFamily: MONO, color: "#505050", fontWeight: 600 }}>{volume}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, backgroundColor: "#22c55e", display: "inline-block", borderRadius: "50%" }} />
                    <span style={{ fontSize: 10, color: "#aaa" }}>{sessions} {t("dash_sitz")}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Aktive Handelssitzungen ────────────────────────────────── */}
      <div>
        <SectionHeader
          title={t("dash_active_sessions")}
          right={
            <Link href="/trading" style={{ fontSize: 11, color: BLUE, fontWeight: 700, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {t("dash_show_all")}
            </Link>
          }
        />
        <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #eaeaea" }}>
                {[
                  { label: t("dash_th_session"), align: "left"   },
                  { label: t("dash_th_section"), align: "left"   },
                  { label: t("dash_th_time"),    align: "left"   },
                  { label: t("dash_th_orders"),  align: "right"  },
                  { label: t("dash_th_volume"),  align: "right"  },
                  { label: t("dash_th_status"),  align: "center" },
                  { label: "",                   align: "right"  },
                ].map(({ label, align }, i) => (
                  <th key={i} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", textAlign: align as React.CSSProperties["textAlign"], whiteSpace: "nowrap" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_SESSIONS.map((s, i) => {
                const isOpen    = s.status === "OFFEN";
                const isSell    = s.status === "NUR_VERKAUF";
                const stColor   = isOpen ? GREEN : isSell ? "#92400e" : "#505050";
                const stBg      = isOpen ? BGGREEN : isSell ? "#fffbeb" : "#f5f5f5";
                const stLabel   = isOpen ? t("trading_stage_open") : isSell ? t("trading_stage_sell_only") : s.status;
                const last      = i === ACTIVE_SESSIONS.length - 1;

                return (
                  <tr key={s.id}
                    style={{ borderBottom: last ? "none" : "1px solid #f5f5f5", borderLeft: `3px solid ${isOpen ? BLUE : "transparent"}` }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafbff")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#0d1b2a", margin: 0 }}>{t(s.nameKey as any)}</p>
                      <p style={{ fontSize: 10, color: "#bbb", marginTop: 2, fontFamily: MONO }}>SIT-{s.id}</p>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 8px" }}>{t(s.catKey as any)}</span>
                    </td>

                    <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: MONO, color: "#505050", whiteSpace: "nowrap" }}>
                      {s.time}{t("lbl_uhr") ? " " + t("lbl_uhr") : ""}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0d1b2a", fontFamily: MONO }}>
                      {s.orders}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontFamily: MONO, color: "#505050", whiteSpace: "nowrap" }}>
                      {s.volume}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: stColor, backgroundColor: stBg, padding: "3px 10px" }}>
                        {stLabel}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {isOpen || isSell ? (
                        <Link href={`/trading/session/${s.id}`} style={{
                          display: "inline-block", fontSize: 11, fontWeight: 700, color: "#fff",
                          backgroundColor: BLUE, padding: "5px 14px", textDecoration: "none",
                          letterSpacing: "0.04em", whiteSpace: "nowrap",
                        }}>
                          {t("dash_join")}
                        </Link>
                      ) : (
                        <span style={{ fontSize: 11, color: "#ccc" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }`}</style>
    </div>
  );
}
