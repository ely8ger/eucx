import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard — EUCX" };

/**
 * Dashboard — Förderdatenbank.de Layout-Pattern
 * Aufbau:
 *   1. Seiten-Header (Titel + Liveindikator)
 *   2. Suchleiste (ISIN / Rohstoffname)
 *   3. KPI-Zeile (4 Kennzahlen)
 *   4. Warengruppen-Kacheln (8 Kategorien)
 *   5. Aktive Sitzungen (Liste)
 */

const STATS = [
  { label: "Aktive Sitzungen",  value: "20",         sub: "in 8 Warengruppen",  trend: "+2",     up: true  },
  { label: "Tagesumsatz",       value: "€ 48,2 Mio", sub: "+4,7 % vs. gestern", trend: "+4,7 %", up: true  },
  { label: "Registrierte Mitglieder", value: "1.240", sub: "31 Länder",         trend: "+12",    up: true  },
  { label: "Abschlüsse heute",  value: "843",         sub: "∅ 57 t / Abschluss", trend: "+63",   up: true  },
];

const CATEGORIES = [
  { id: "METALS",       label: "Metalle",               sub: "Stahl, Aluminium, Kupfer, Zink",  sessions: 4, volume: "12.400 t",  change: "+2,3 %", up: true  },
  { id: "SCRAP",        label: "Schrott & Sekundär",    sub: "Eisenschrott, NE-Schrott, Späne", sessions: 2, volume: "5.800 t",   change: "−0,8 %", up: false },
  { id: "TIMBER",       label: "Holz & Forst",           sub: "Rundholz, Schnittholz, Pellets",  sessions: 3, volume: "3.200 m³",  change: "+1,1 %", up: true  },
  { id: "AGRICULTURE",  label: "Agrar & Lebensmittel",   sub: "Getreide, Milchpulver, Öle",      sessions: 5, volume: "8.600 t",   change: "+0,4 %", up: true  },
  { id: "CHEMICALS",    label: "Chemie & Petrochemie",   sub: "Polymere, Düngemittel",           sessions: 2, volume: "1.900 t",   change: "−1,2 %", up: false },
  { id: "ENERGY",       label: "Energie & Brennstoffe",  sub: "Koks, Kohle, Pellets, Briketts",  sessions: 1, volume: "4.200 t",   change: "+3,1 %", up: true  },
  { id: "CONSTRUCTION", label: "Baustoffe",              sub: "Zement, Splitt, Ziegel",          sessions: 2, volume: "6.700 t",   change: "+0,9 %", up: true  },
  { id: "INDUSTRIALS",  label: "Industriegüter",         sub: "Maschinen, Kabel, Elektronik",    sessions: 1, volume: "240 Stk",   change: "—",      up: null  },
];

// Kategorie-Icons (Outline, BWDS-Stil)
const CAT_ICONS: Record<string, React.ReactNode> = {
  METALS:       <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 6.5v7L10 18 2 13.5v-7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2 6.5L10 11m0 0L18 6.5M10 11v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  SCRAP:        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8V5.5a3 3 0 016 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="11.5" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  TIMBER:       <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2v16M6 7.5l4-5.5 4 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 12.5c2-1.5 3.5-2 5.5-2s3.5.5 5.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  AGRICULTURE:  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 17V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 9C10 5.5 7 3.5 3.5 4 3.5 7.5 6 10.5 10 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 9c0-3.5 3-5.5 6.5-5C16.5 7.5 14 10.5 10 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="6" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  CHEMICALS:    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 2h4M10 2v6L15 17H5L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/><circle cx="12.5" cy="12" r="1" fill="currentColor"/></svg>,
  ENERGY:       <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 2L7 11.5H12.5L8.5 18 16.5 9H11L12.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  CONSTRUCTION: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10.5" width="16" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 10.5V7L10 2.5 14.5 7v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  INDUSTRIALS:  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="5.5" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14.5" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 14.5V9L7 3h6l4 6v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Seiten-Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-text">
            EUCX Handelsplattform
          </h1>
          <p className="text-sm text-gov-text-muted mt-1">
            Spot-Markt · B2B · Anonymous Trading · Frankfurt am Main
          </p>
        </div>
        <div className="flex items-center gap-2 border border-gov-success/30 bg-green-50 rounded-sm px-3 py-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-gov-success" style={{ animation: "pulse 2s ease-in-out infinite" }} />
          <span className="text-xs font-semibold text-gov-success tracking-wide">Börse geöffnet</span>
        </div>
      </div>

      {/* ── Suchleiste (Förderdatenbank-Pattern) ───────────────────────────── */}
      <div className="bg-gov-blue rounded-sm p-6">
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-3">
          Rohstoff oder ISIN suchen
        </p>
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="z. B. Kupfer, Aluminium, ISIN DE000EUCX0001 …"
            className={[
              "flex-1 h-11 rounded-sm border border-white/20 bg-white/10",
              "text-white placeholder:text-white/50 text-sm px-4",
              "focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15",
              "transition-colors duration-150",
            ].join(" ")}
          />
          <button className="h-11 px-6 bg-white text-gov-blue font-semibold text-sm rounded-sm hover:bg-gov-blue-light transition-colors">
            Suchen
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Kupfer", "Aluminium", "Stahl", "Eisenschrott", "Pellets"].map((t) => (
            <span key={t}
              className="text-xs bg-white/10 text-white/70 hover:bg-white/20 hover:text-white cursor-pointer px-2.5 py-1 rounded-sm transition-colors">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── KPI-Zeile ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label}
            className="bg-gov-white border border-gov-border rounded-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gov-text-muted mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-gov-text leading-none mb-1.5">{s.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gov-text-muted">{s.sub}</p>
              <span className={`text-xs font-bold ${s.up ? "text-gov-success" : "text-gov-error"}`}>
                {s.up ? "▲" : "▼"} {s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Warengruppen-Kacheln ───────────────────────────────────────────── */}
      <div>
        {/* Abschnitts-Header (Förderdatenbank-Stil) */}
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-base font-bold text-gov-text">Warengruppen</h2>
          <div className="flex-1 h-px bg-gov-border" />
          <span className="text-xs text-gov-text-muted">{CATEGORIES.length} Kategorien</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/trading?category=${cat.id}`}>
              <div className={[
                "bg-gov-white border border-gov-border rounded-sm p-5 h-full",
                "cursor-pointer transition-all duration-150",
                "hover:border-gov-blue hover:shadow-md hover:shadow-gov-blue/5",
              ].join(" ")}>

                {/* Icon + Sessions */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-gov-blue/60">{CAT_ICONS[cat.id]}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gov-success" />
                    <span className="text-[10px] font-medium text-gov-text-muted">{cat.sessions} aktiv</span>
                  </div>
                </div>

                {/* Titel */}
                <p className="text-sm font-bold text-gov-text leading-snug mb-1 group-hover:text-gov-blue transition-colors">
                  {cat.label}
                </p>
                <p className="text-xs text-gov-text-muted leading-relaxed mb-4 line-clamp-2">{cat.sub}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gov-border-light">
                  <span className="text-xs font-mono font-semibold text-gov-text-2">{cat.volume}</span>
                  <span className={`text-xs font-bold ${
                    cat.up === true  ? "text-gov-success" :
                    cat.up === false ? "text-gov-error"   :
                    "text-gov-text-muted"
                  }`}>{cat.change}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Aktive Handelssitzungen (Listenformat) ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-base font-bold text-gov-text">Aktive Handelssitzungen</h2>
          <div className="flex-1 h-px bg-gov-border" />
          <Link href="/trading"
            className="text-xs text-gov-blue-mid hover:text-gov-blue font-medium flex items-center gap-1 transition-colors">
            Alle anzeigen
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className="bg-gov-white border border-gov-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gov-border">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gov-text-muted bg-gov-bg">Warengruppe</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gov-text-muted bg-gov-bg">Produkt</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gov-text-muted bg-gov-bg">Volumen</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gov-text-muted bg-gov-bg">Änderung</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gov-text-muted bg-gov-bg">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.filter((c) => c.up !== null).slice(0, 5).map((cat, i) => (
                <tr key={cat.id} className={`border-b border-gov-border-light last:border-0 ${i % 2 === 1 ? "bg-gov-bg/50" : ""}`}>
                  <td className="px-5 py-3.5 text-sm font-medium text-gov-text">{cat.label}</td>
                  <td className="px-5 py-3.5 text-sm text-gov-text-2">{cat.sub.split(",")[0]}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-right text-gov-text-2">{cat.volume}</td>
                  <td className={`px-5 py-3.5 text-sm font-bold text-right ${cat.up ? "text-gov-success" : "text-gov-error"}`}>
                    {cat.change}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Link href={`/trading?category=${cat.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gov-blue-mid hover:text-gov-blue transition-colors">
                      Handeln
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
