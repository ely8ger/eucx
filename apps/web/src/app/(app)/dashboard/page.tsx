import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard — EUCX" };

const STATS = [
  {
    label: "Aktive Sitzungen",
    value: "20",
    sub:   "in 8 Warengruppen",
    trend: "+2",
    up:    true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Tagesumsatz",
    value: "€ 48,2 Mio",
    sub:   "+4,7% vs. gestern",
    trend: "+4,7%",
    up:    true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <polyline points="2,14 6,9 9,11 13,5 18,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 3h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Mitglieder",
    value: "1.240",
    sub:   "31 Länder",
    trend: "+12",
    up:    true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8"  cy="6"  r="3"   stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="14" cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 11c2.2.5 4 2.5 4 5"          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Abschlüsse heute",
    value: "843",
    sub:   "∅ 57 t / Abschluss",
    trend: "+63",
    up:    true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 14L7 9.5l3.5 3.5 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="16" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

const CATEGORIES = [
  { id: "METALS",       label: "Metalle",              sub: "Stahl, Aluminium, Kupfer, Zink",  sessions: 4, volume: "12.400 t",  change: "+2,3%", up: true  },
  { id: "SCRAP",        label: "Schrott & Sekundär",   sub: "Eisenschrott, NE-Schrott, Späne", sessions: 2, volume: "5.800 t",   change: "-0,8%", up: false },
  { id: "TIMBER",       label: "Holz & Forst",          sub: "Rundholz, Schnittholz, Pellets",  sessions: 3, volume: "3.200 m³",  change: "+1,1%", up: true  },
  { id: "AGRICULTURE",  label: "Agrar & Lebensmittel",  sub: "Getreide, Milchpulver, Öle",      sessions: 5, volume: "8.600 t",   change: "+0,4%", up: true  },
  { id: "CHEMICALS",    label: "Chemie & Petrochemie",  sub: "Polymere, Düngemittel",            sessions: 2, volume: "1.900 t",   change: "-1,2%", up: false },
  { id: "ENERGY",       label: "Energie & Brennstoffe", sub: "Koks, Kohle, Pellets, Briketts",  sessions: 1, volume: "4.200 t",   change: "+3,1%", up: true  },
  { id: "CONSTRUCTION", label: "Baustoffe",             sub: "Zement, Splitt, Ziegel",          sessions: 2, volume: "6.700 t",   change: "+0,9%", up: true  },
  { id: "INDUSTRIALS",  label: "Industriegüter",        sub: "Maschinen, Kabel, Elektronik",    sessions: 1, volume: "240 Stk",   change: "—",     up: null  },
];

function CatIcon({ id }: { id: string }) {
  const map: Record<string, React.ReactNode> = {
    METALS:       <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16 6v6l-7 4L2 12V6L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 6l7 4m0 0l7-4m-7 4v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    SCRAP:        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="7" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M6 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="9" y1="10" x2="9" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    TIMBER:       <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M5 7l4-5 4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 11c1.5-1.2 3-1.8 5-1.8s3.5.6 5 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    AGRICULTURE:  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M9 8C9 5 6.5 3 3.5 3.5 3.5 6.5 5.5 9 9 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 8c0-3 2.5-5 5.5-4.5-.5 3-2.5 5-5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    CHEMICALS:    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 2h4M9 2v5L14 15H4L9 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="11" cy="11" r="0.8" fill="currentColor"/></svg>,
    ENERGY:       <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 2L6.5 10H11L7.5 16 14 8H9.5L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    CONSTRUCTION: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="9" width="14" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5 9V6l4-4 4 4v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    INDUSTRIALS:  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="5" cy="13" r="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3 13V8l4-6h4l4 6v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return <span className="text-cb-petrol/50">{map[id]}</span>;
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-7 max-w-screen-2xl">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.375rem] font-bold text-cb-petrol tracking-tight">
            European Union Commodity Exchange
          </h1>
          <p className="text-sm text-cb-gray-500 mt-0.5">
            Spot-Markt · B2B · Anonymous Trading · Frankfurt am Main
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-sm px-3 py-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-cb-success" style={{ animation: "pulse 2s ease-in-out infinite" }} />
          <span className="text-xs font-semibold text-cb-success tracking-wide">Börse geöffnet</span>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-cb-white border border-cb-gray-200 rounded-sm overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,61,107,0.07)" }}
          >
            <div className="h-[3px] bg-gradient-to-r from-cb-yellow to-cb-yellow-light" />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-cb-gray-400">
                  {s.label}
                </p>
                <span className="text-cb-petrol/30">{s.icon}</span>
              </div>
              <p className="text-[1.6rem] font-bold text-cb-petrol leading-none mb-2">{s.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-cb-gray-500">{s.sub}</p>
                <span className={`text-xs font-semibold ${s.up ? "text-cb-success" : "text-cb-error"}`}>
                  {s.up ? "↑" : "↓"} {s.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Warengruppen ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-cb-gray-400">
            Warengruppen
          </h2>
          <div className="flex-1 h-px bg-cb-gray-200" />
          <span className="text-[10px] text-cb-gray-400 font-medium">{CATEGORIES.length} Kategorien</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/trading?category=${cat.id}`}>
              <div
                className="bg-cb-white border border-cb-gray-200 rounded-sm p-4 h-full
                  cursor-pointer group transition-all duration-200
                  hover:border-cb-yellow hover:shadow-md"
                style={{ boxShadow: "0 1px 3px rgba(0,61,107,0.05)" }}
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <CatIcon id={cat.id} />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cb-success" />
                    <span className="text-[10px] font-medium text-cb-gray-400">
                      {cat.sessions} aktiv
                    </span>
                  </div>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-cb-petrol leading-snug mb-1
                  group-hover:text-cb-yellow-dark transition-colors">
                  {cat.label}
                </p>
                <p className="text-xs text-cb-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {cat.sub}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-cb-gray-100">
                  <span className="text-xs font-mono font-medium text-cb-gray-600">{cat.volume}</span>
                  <span className={`text-xs font-bold ${
                    cat.up === true  ? "text-cb-success" :
                    cat.up === false ? "text-cb-error"   :
                    "text-cb-gray-400"
                  }`}>{cat.change}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
