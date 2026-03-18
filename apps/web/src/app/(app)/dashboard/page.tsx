import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Activity, Users, BarChart3,
  ArrowRight, Package, Trees, Wheat, Building2, FlaskConical,
  Flame, ChevronRight, Clock, Zap, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketSparkline } from "@/components/dashboard/MarketSparkline";

export const metadata: Metadata = { title: "Dashboard — EUCX" };

const KPI = [
  {
    label: "Aktive Sitzungen",
    value: "20",
    sub: "in 8 Warengruppen",
    trend: "+2 heute",
    up: true,
    Icon: Activity,
    accent: "#2563EB",
    accentBg: "#EFF6FF",
  },
  {
    label: "Tagesumsatz",
    value: "€ 48,2 Mio.",
    sub: "vs. gestern",
    trend: "+4,7 %",
    up: true,
    Icon: TrendingUp,
    accent: "#059669",
    accentBg: "#ECFDF5",
  },
  {
    label: "Teilnehmer",
    value: "1.240",
    sub: "in 31 EU-Ländern",
    trend: "+12 neu",
    up: true,
    Icon: Users,
    accent: "#7C3AED",
    accentBg: "#F5F3FF",
  },
  {
    label: "Abschlüsse heute",
    value: "843",
    sub: "Ø 57 t / Deal",
    trend: "+63 vs. Ø",
    up: true,
    Icon: BarChart3,
    accent: "#D97706",
    accentBg: "#FFFBEB",
  },
];

const CATEGORIES = [
  { id: "METALS",       label: "Metallprodukte",      sub: "Stahl · Alu · Kupfer",        sessions: 4, volume: "12.400 t", change: "+2,3 %", up: true,  Icon: Package,      color: "#2563EB", bg: "#EFF6FF" },
  { id: "SCRAP",        label: "Schrott & Sekundär",  sub: "Eisenschrott · NE",            sessions: 2, volume: "5.800 t",  change: "−0,8 %", up: false, Icon: Zap,          color: "#64748B", bg: "#F1F5F9" },
  { id: "TIMBER",       label: "Holz & Forst",        sub: "Rundholz · Schnittholz",       sessions: 3, volume: "3.200 m³", change: "+1,1 %", up: true,  Icon: Trees,        color: "#059669", bg: "#ECFDF5" },
  { id: "AGRICULTURE",  label: "Agrar & Lebensmittel",sub: "Getreide · Milch · Öle",       sessions: 5, volume: "8.600 t",  change: "+0,4 %", up: true,  Icon: Wheat,        color: "#D97706", bg: "#FFFBEB" },
  { id: "CHEMICALS",    label: "Chemie & Petrochem.", sub: "Polymere · Düngemittel",       sessions: 2, volume: "1.900 t",  change: "−1,2 %", up: false, Icon: FlaskConical, color: "#7C3AED", bg: "#F5F3FF" },
  { id: "ENERGY",       label: "Energie & Brennstoffe",sub: "Koks · Kohle · Pellets",     sessions: 1, volume: "4.200 t",  change: "+3,1 %", up: true,  Icon: Flame,        color: "#EA580C", bg: "#FFF7ED" },
  { id: "CONSTRUCTION", label: "Baustoffe",           sub: "Zement · Splitt · Ziegel",    sessions: 2, volume: "6.700 t",  change: "+0,9 %", up: true,  Icon: Building2,    color: "#0284C7", bg: "#F0F9FF" },
  { id: "INDUSTRIALS",  label: "Industriegüter",      sub: "Maschinen · Kabel · Elektronik",sessions: 1, volume: "240 Stk",change: "—",      up: null,  Icon: BarChart3,    color: "#94A3B8", bg: "#F8FAFC" },
];

const ACTIVE_SESSIONS = [
  { id: "247", name: "Bewehrungsstahl A1 Ø12mm",   cat: "Metalle", time: "14:00–16:30", orders: 34, volume: "420 t",   status: "OFFEN" },
  { id: "248", name: "Kupfer Cu-ETP Walzdraht",    cat: "Metalle", time: "14:00–16:30", orders: 18, volume: "85 t",    status: "OFFEN" },
  { id: "249", name: "Weizenmehl Type 550",        cat: "Agrar",   time: "10:00–12:00", orders: 22, volume: "1.200 t", status: "NUR_VERKAUF" },
  { id: "250", name: "Fichtenstammholz I/II",      cat: "Holz",    time: "09:00–11:00", orders: 11, volume: "340 m³",  status: "OFFEN" },
  { id: "251", name: "Aluminiumschrott 6061",      cat: "Schrott", time: "13:00–15:00", orders: 9,  volume: "60 t",    status: "OFFEN" },
];

const statusStyle: Record<string, { label: string; cls: string }> = {
  OFFEN:       { label: "Offen",      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  NUR_VERKAUF: { label: "Nur Verkauf",cls: "bg-amber-50 text-amber-700 border border-amber-200" },
};

export default function DashboardPage() {
  const now = new Date().toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Handelsübersicht</h1>
          <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Clock size={12} />
            {now} · Frankfurt am Main
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-live" />
          <span className="text-xs font-semibold text-emerald-700">Börse geöffnet</span>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map(({ label, value, sub, trend, up, Icon, accent, accentBg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: accentBg }}
              >
                <Icon size={16} style={{ color: accent }} />
              </div>
              <span
                className="flex items-center gap-0.5 text-xs font-semibold tabular"
                style={{ color: up ? "#059669" : "#DC2626" }}
              >
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1 tabular">{value}</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Bento Grid: Chart + Top-Sektionen ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Chart — 2/3 Breite */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Tagesumsatz — Verlauf</p>
              <p className="text-xs text-slate-400">Heute · stündlich · Frankfurt</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 font-semibold">
              EUR
            </span>
          </div>
          <MarketSparkline />
        </div>

        {/* Top-Sektionen Summary — 1/3 Breite */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-900">Top-Sektionen</p>
            <span className="text-xs text-slate-400">nach Volumen</span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[...CATEGORIES]
              .sort((a, b) => {
                const aV = parseFloat(a.volume.replace(/[^\d]/g, ""));
                const bV = parseFloat(b.volume.replace(/[^\d]/g, ""));
                return bV - aV;
              })
              .slice(0, 5)
              .map(({ id, label, volume, change, up, color, bg, Icon }) => (
                <Link
                  key={id}
                  href={`/trading?category=${id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span className="text-sm text-slate-700 font-medium flex-1 truncate">{label}</span>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-900 tabular">{volume}</p>
                    <p className="text-xs font-semibold tabular" style={{ color: up === true ? "#059669" : up === false ? "#DC2626" : "#94A3B8" }}>
                      {change}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
          <Link
            href="/trading"
            className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Alle Warengruppen <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* ── Warengruppen Bento Grid ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-900">Warengruppen</p>
          <span className="text-xs text-slate-400">
            8 Sektionen · {CATEGORIES.reduce((a, c) => a + c.sessions, 0)} aktive Sitzungen
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {CATEGORIES.map(({ id, label, sub, sessions, change, up, Icon, color, bg }) => (
            <Link key={id} href={`/trading?category=${id}`} className="group">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer h-full flex flex-col">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={15} style={{ color }} />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-tight mb-0.5 line-clamp-2">{label}</p>
                <p className="text-[10px] text-slate-400 mb-auto">{sub}</p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-medium">{sessions}</span>
                  </span>
                  <span
                    className="text-[10px] font-bold tabular"
                    style={{ color: up === true ? "#059669" : up === false ? "#DC2626" : "#94A3B8" }}
                  >
                    {change}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Aktive Handelssitzungen ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Aktive Handelssitzungen</p>
          <Link
            href="/trading"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Alle anzeigen <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left pl-5 pr-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sitzung</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sektion</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Zeit</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Aufträge</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Volumen</th>
                <th className="text-center px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="pr-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {ACTIVE_SESSIONS.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors duration-150"
                  style={{ borderBottomColor: i === ACTIVE_SESSIONS.length - 1 ? "transparent" : undefined }}
                >
                  <td className="pl-5 pr-3 py-3.5">
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 tabular">#{s.id}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="text-sm text-slate-600">{s.cat}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="text-sm font-mono text-slate-500 tabular">{s.time}</span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-900 tabular">{s.orders}</span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="text-sm font-mono text-slate-600 tabular">{s.volume}</span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[s.status]?.cls ?? ""}`}>
                      {statusStyle[s.status]?.label ?? s.status}
                    </span>
                  </td>
                  <td className="pr-5 py-3.5 text-right">
                    <Link
                      href={`/trading/session/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Teilnehmen <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
