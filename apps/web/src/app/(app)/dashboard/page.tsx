"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Activity, Users, BarChart3,
  ArrowRight, Package, Trees, Wheat, Building2, FlaskConical,
  Flame, ChevronRight, Clock, Zap,
} from "lucide-react";
import { MarketSparkline } from "@/components/dashboard/MarketSparkline";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";

const KPI = [
  { label: "Aktive Sitzungen",  value: "20",          sub: "in 8 Warengruppen",  trend: "+2 heute",  up: true,  Icon: Activity  },
  { label: "Tagesumsatz",       value: "€ 48,2 Mio.", sub: "vs. gestern",        trend: "+4,7 %",    up: true,  Icon: TrendingUp },
  { label: "Teilnehmer",        value: "1.240",        sub: "in 31 EU-Ländern",   trend: "+12 neu",   up: true,  Icon: Users      },
  { label: "Abschlüsse heute",  value: "843",          sub: "Ø 57 t / Deal",      trend: "+63 vs. Ø", up: true,  Icon: BarChart3  },
];

const CATEGORIES = [
  { id: "METALS",       label: "Metallprodukte",        sub: "Stahl · Alu · Kupfer",          sessions: 4, volumeNum: 12400, volume: "12.400 t",  change: "+2,3 %", up: true,  Icon: Package      },
  { id: "SCRAP",        label: "Schrott & Sekundär",    sub: "Eisenschrott · NE-Metalle",      sessions: 2, volumeNum: 5800,  volume: "5.800 t",   change: "−0,8 %", up: false, Icon: Zap          },
  { id: "TIMBER",       label: "Holz & Forst",          sub: "Rundholz · Schnittholz",         sessions: 3, volumeNum: 3200,  volume: "3.200 m³",  change: "+1,1 %", up: true,  Icon: Trees        },
  { id: "AGRICULTURE",  label: "Agrar & Lebensmittel",  sub: "Getreide · Öle",                 sessions: 5, volumeNum: 8600,  volume: "8.600 t",   change: "+0,4 %", up: true,  Icon: Wheat        },
  { id: "CHEMICALS",    label: "Chemie & Petrochem.",   sub: "Polymere · Düngemittel",         sessions: 2, volumeNum: 1900,  volume: "1.900 t",   change: "−1,2 %", up: false, Icon: FlaskConical },
  { id: "ENERGY",       label: "Energie & Brennstoffe", sub: "Koks · Kohle · Pellets",         sessions: 1, volumeNum: 4200,  volume: "4.200 t",   change: "+3,1 %", up: true,  Icon: Flame        },
  { id: "CONSTRUCTION", label: "Baustoffe",             sub: "Zement · Splitt · Ziegel",       sessions: 2, volumeNum: 6700,  volume: "6.700 t",   change: "+0,9 %", up: true,  Icon: Building2    },
  { id: "INDUSTRIALS",  label: "Industriegüter",        sub: "Maschinen · Kabel · Elektronik", sessions: 1, volumeNum: 240,   volume: "240 Stk",   change: "—",      up: null,  Icon: BarChart3    },
];

const ACTIVE_SESSIONS = [
  { id: "247", name: "Bewehrungsstahl A1 Ø12mm", cat: "Metalle", time: "14:00–16:30", orders: 34, volume: "420 t",   status: "OFFEN"      },
  { id: "248", name: "Kupfer Cu-ETP Walzdraht",  cat: "Metalle", time: "14:00–16:30", orders: 18, volume: "85 t",    status: "OFFEN"      },
  { id: "249", name: "Weizenmehl Type 550",       cat: "Agrar",   time: "10:00–12:00", orders: 22, volume: "1.200 t", status: "NUR_VERKAUF"},
  { id: "250", name: "Fichtenstammholz I/II",     cat: "Holz",    time: "09:00–11:00", orders: 11, volume: "340 m³",  status: "OFFEN"      },
  { id: "251", name: "Aluminiumschrott 6061",     cat: "Schrott", time: "13:00–15:00", orders: 9,  volume: "60 t",    status: "OFFEN"      },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  OFFEN:       { label: "Offen",       color: "#166534", bg: "#f0fdf4" },
  NUR_VERKAUF: { label: "Nur Verkauf", color: "#92400e", bg: "#fffbeb" },
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: BLUE, margin: "0 0 10px" }}>
    {children}
  </p>
);

export default function DashboardPage() {
  const now = new Date().toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const [lastLogin, setLastLogin] = useState<string | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("eucx_prev_login");
    if (raw) {
      try {
        const d = new Date(raw);
        setLastLogin(
          d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
          " um " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr"
        );
      } catch { /* ignore */ }
    }
  }, []);

  const topCategories = [...CATEGORIES].sort((a, b) => b.volumeNum - a.volumeNum).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: F }}>

      {/* ── Seitenkopf ── */}
      <div style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Handelsübersicht</h1>
            <p style={{ fontSize: 13, color: "#888", marginTop: 6, display: "flex", alignItems: "center", gap: 6, margin: "6px 0 0" }}>
              <Clock size={12} />
              {now} · Frankfurt am Main
            </p>
            {lastLogin && (
              <p style={{ fontSize: 11, color: "#bbb", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M6 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Letzter Login: {lastLogin}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderLeft: "3px solid #22c55e", backgroundColor: "#f0fdf4" }}>
            <span style={{ width: 7, height: 7, backgroundColor: "#22c55e", display: "inline-block", boxShadow: "0 0 6px rgba(34,197,94,.5)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>Börse geöffnet</span>
          </div>
        </div>
      </div>

      {/* ── KPI-Zeile ── */}
      <div>
        <SectionLabel>Marktübersicht</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, backgroundColor: "#e0e0e0" }}>
          {KPI.map(({ label, value, sub, trend, up, Icon }) => (
            <div key={label} style={{ backgroundColor: "#fff", padding: "20px 24px", borderBottom: `3px solid ${BLUE}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, backgroundColor: "#f0f4fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} style={{ color: BLUE }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: up ? "#166534" : "#dc2626", display: "flex", alignItems: "center", gap: 3 }}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {trend}
                </span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 300, color: "#0d1b2a", lineHeight: 1, margin: 0 }}>{value}</p>
              <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, marginTop: 8, fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart + Top-Sektionen ── */}
      <div>
        <SectionLabel>Handelsverlauf</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, backgroundColor: "#e0e0e0" }}>

          <div style={{ backgroundColor: "#fff", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>Tagesumsatz — Verlauf</p>
                <p style={{ fontSize: 12, color: "#888", marginTop: 3 }}>Heute · stündlich · Frankfurt</p>
              </div>
              <span style={{ fontSize: 11, border: `1px solid #c7d7f0`, color: BLUE, padding: "3px 10px", fontWeight: 600 }}>EUR</span>
            </div>
            <MarketSparkline />
          </div>

          <div style={{ backgroundColor: "#fff", padding: "20px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>Top-Sektionen</p>
              <span style={{ fontSize: 11, color: "#888" }}>nach Volumen</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {topCategories.map(({ id, label, volume, change, up, Icon }, idx) => (
                <Link key={id} href={`/trading?category=${id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
                    borderBottom: idx < topCategories.length - 1 ? "1px solid #f7f7f7" : "none",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <div style={{ width: 28, height: 28, backgroundColor: "#f0f4fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} style={{ color: BLUE }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#333", flex: 1 }}>{label}</span>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{volume}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: up === true ? "#166534" : up === false ? "#dc2626" : "#888", margin: 0 }}>{change}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/trading" style={{
              textDecoration: "none", borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 10,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              fontSize: 12, color: BLUE, fontWeight: 600,
            }}>
              Alle Warengruppen →
            </Link>
          </div>

        </div>
      </div>

      {/* ── Warengruppen ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <SectionLabel>Warensektionen</SectionLabel>
          <span style={{ fontSize: 12, color: "#888" }}>8 Sektionen · {CATEGORIES.reduce((a, c) => a + c.sessions, 0)} aktive Sitzungen</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, backgroundColor: "#e0e0e0" }}>
          {CATEGORIES.map(({ id, label, sub, sessions, change, up, Icon }) => (
            <Link key={id} href={`/trading?category=${id}`} style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "#fff", padding: "18px 20px", display: "flex", flexDirection: "column", height: "100%", cursor: "pointer", boxSizing: "border-box" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, backgroundColor: "#f0f4fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={14} style={{ color: BLUE }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: up === true ? "#166534" : up === false ? "#dc2626" : "#888" }}>{change}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0, lineHeight: 1.3 }}>{label}</p>
                <p style={{ fontSize: 11, color: "#888", marginTop: 4, flex: 1, lineHeight: 1.4 }}>{sub}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                  <span style={{ width: 6, height: 6, backgroundColor: "#22c55e", display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "#888" }}>{sessions} Sitzung{sessions !== 1 ? "en" : ""}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Aktive Handelssitzungen ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <SectionLabel>Aktive Handelssitzungen</SectionLabel>
          <Link href="/trading" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: "none" }}>
            Alle anzeigen <ArrowRight size={12} />
          </Link>
        </div>
        <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  {["Sitzung", "Sektion", "Zeit", "Aufträge", "Volumen", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", textAlign: i >= 3 && i <= 4 ? "right" : i === 5 ? "center" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVE_SESSIONS.map((s, i) => {
                  const st = STATUS_MAP[s.status];
                  return (
                    <tr key={s.id} style={{ borderBottom: i < ACTIVE_SESSIONS.length - 1 ? "1px solid #f7f7f7" : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#0d1b2a", margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>#{s.id}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 8px" }}>{s.cat}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: "#505050" }}>{s.time}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0d1b2a" }}>{s.orders}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: "#505050" }}>{s.volume}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: st?.color, backgroundColor: st?.bg, padding: "2px 8px" }}>{st?.label ?? s.status}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Link href={`/trading/session/${s.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: BLUE, textDecoration: "none" }}>
                          Teilnehmen <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
