import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Handelssitzungen - EUCX" };

const BLUE  = "#154194";
const GREEN = "#166534";
const RED   = "#dc2626";
const SANS  = "'IBM Plex Sans', Arial, sans-serif";
const MONO  = "'IBM Plex Mono', monospace";

type SessionStage = "OFFEN" | "NUR_VERKAUF" | "GESCHLOSSEN" | "ABGESCHLOSSEN";

interface Session {
  id: string; no: string; date: string; time: string;
  category: string; name: string; stage: SessionStage;
  buyOrders: number; sellOrders: number; deals: number; volume: string;
  participants: number;
}

const SESSIONS: Session[] = [
  { id: "ses-041", no: "M-2026-041", date: "18.03.2026", time: "09:00–14:00", category: "Metalle",  name: "Betonstahl / Walzdraht Spotmarkt",  stage: "OFFEN",        buyOrders: 12, sellOrders: 18, deals: 4,  volume: "620 t",    participants: 9  },
  { id: "ses-040", no: "M-2026-040", date: "18.03.2026", time: "10:30–15:00", category: "Metalle",  name: "Träger & Profile — Export",          stage: "NUR_VERKAUF",  buyOrders: 0,  sellOrders: 9,  deals: 0,  volume: "—",        participants: 5  },
  { id: "ses-039", no: "S-2026-039", date: "18.03.2026", time: "08:00–12:00", category: "Schrott",  name: "Eisenschrott ISRI 210/211 Inland",  stage: "OFFEN",        buyOrders: 6,  sellOrders: 14, deals: 2,  volume: "480 t",    participants: 7  },
  { id: "ses-038", no: "H-2026-038", date: "17.03.2026", time: "09:00–13:00", category: "Holz",     name: "Fichten-Rundholz 2b-Qualität",      stage: "ABGESCHLOSSEN",buyOrders: 8,  sellOrders: 11, deals: 7,  volume: "1.200 m³", participants: 12 },
  { id: "ses-037", no: "A-2026-037", date: "17.03.2026", time: "11:00–16:00", category: "Agrar",    name: "Weizen A-Qualität Ernte 2025",      stage: "ABGESCHLOSSEN",buyOrders: 14, sellOrders: 22, deals: 11, volume: "4.400 t",  participants: 18 },
  { id: "ses-036", no: "M-2026-036", date: "17.03.2026", time: "08:30–13:30", category: "Metalle",  name: "Aluminium-Walzbarren 1050A",        stage: "GESCHLOSSEN",  buyOrders: 5,  sellOrders: 5,  deals: 0,  volume: "—",        participants: 4  },
];

const STAGE_CFG: Record<SessionStage, { label: string; color: string; bg: string; border: string }> = {
  OFFEN:         { label: "Offen",        color: GREEN,   bg: "#f0fdf4", border: "#bbf7d0" },
  NUR_VERKAUF:   { label: "Nur Verkauf",  color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  GESCHLOSSEN:   { label: "Geschlossen", color: "#505050", bg: "#f5f5f5", border: "#e5e5e5" },
  ABGESCHLOSSEN: { label: "Abgeschlossen", color: BLUE,   bg: "#eef2fb", border: "#c7d7f0" },
};

/* ── Aggregate stats ─────────────────────────────────────────────────── */
const totalBuy   = SESSIONS.reduce((s, x) => s + x.buyOrders, 0);
const totalSell  = SESSIONS.reduce((s, x) => s + x.sellOrders, 0);
const totalDeals = SESSIONS.reduce((s, x) => s + x.deals, 0);
const openCount  = SESSIONS.filter((s) => s.stage === "OFFEN" || s.stage === "NUR_VERKAUF").length;

export default function TradingPage() {
  const open   = SESSIONS.filter((s) => s.stage === "OFFEN" || s.stage === "NUR_VERKAUF");
  const closed  = SESSIONS.filter((s) => s.stage === "GESCHLOSSEN" || s.stage === "ABGESCHLOSSEN");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: SANS }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 20, borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ borderLeft: `4px solid ${BLUE}`, paddingLeft: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Handelssitzungen</h1>
          <p style={{ fontSize: 12, color: "#999", marginTop: 6, fontFamily: MONO }}>
            Laufende und abgeschlossene Sitzungen · Kauf- & Verkaufsaufträge
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/orders/new" style={{
            display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 18px",
            backgroundColor: BLUE, color: "#fff", fontSize: 12, fontWeight: 700,
            textDecoration: "none", letterSpacing: "0.02em",
          }}>
            + Neuen Auftrag erstellen
          </Link>
          <Link href="/trading/terminal" style={{
            display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
            backgroundColor: "transparent", color: BLUE, fontSize: 12, fontWeight: 600,
            textDecoration: "none", letterSpacing: "0.02em", border: `1px solid ${BLUE}`,
          }}>
            Pro Terminal →
          </Link>
        </div>
      </div>

      {/* ── Statistik-Leiste ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, backgroundColor: "#dde1e8" }}>
        {[
          { label: "Aktive Sitzungen",  value: openCount.toString(),  accent: "#22c55e" },
          { label: "Kaufaufträge",      value: totalBuy.toString(),   accent: GREEN     },
          { label: "Verkaufsaufträge",  value: totalSell.toString(),  accent: RED       },
          { label: "Abschlüsse heute",  value: totalDeals.toString(), accent: BLUE      },
          { label: "Sitzungen gesamt",  value: SESSIONS.length.toString(), accent: "#888" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ backgroundColor: "#fff", padding: "14px 20px", borderTop: `2px solid ${accent}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: "0 0 8px" }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 300, color: "#0d1b2a", margin: 0, fontFamily: MONO }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Aktive Sitzungen ─────────────────────────────────────────────── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 8, height: 8, backgroundColor: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,.15)" }} />
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a", margin: 0, letterSpacing: "0.02em" }}>
            Aktive Sitzungen ({open.length})
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#dde1e8" }}>
          {open.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>

      {/* ── Abgeschlossene Sitzungen ─────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#aaa", margin: "0 0 14px", letterSpacing: "0.02em" }}>
          Abgeschlossene Sitzungen ({closed.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#dde1e8" }}>
          {closed.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>
    </div>
  );
}

function SessionCard({ session: s }: { session: Session }) {
  const cfg      = STAGE_CFG[s.stage];
  const isActive = s.stage === "OFFEN" || s.stage === "NUR_VERKAUF";
  const total    = s.buyOrders + s.sellOrders;
  const buyPct   = total > 0 ? Math.round((s.buyOrders / total) * 100) : 0;
  const sellPct  = total > 0 ? 100 - buyPct : 0;

  return (
    <div style={{
      backgroundColor: "#fff",
      padding: "18px 24px",
      borderLeft: isActive ? `3px solid ${BLUE}` : "3px solid transparent",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>

        {/* Left: Meta + Name + Stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "#aaa", letterSpacing: "0.04em" }}>{s.no}</span>
            <span style={{ color: "#ddd" }}>·</span>
            <span style={{ fontSize: 11, color: "#999" }}>{s.date}, {s.time} Uhr</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, backgroundColor: "#eef2fb", padding: "1px 8px", letterSpacing: "0.04em" }}>
              {s.category}
            </span>
            <span style={{ fontSize: 11, color: "#bbb" }}>{s.participants} Teilnehmer</span>
          </div>

          {/* Name */}
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{s.name}</p>

          {/* Kauf/Verkauf Balance + Stats */}
          <div style={{ marginTop: 12 }}>
            {/* Order balance bar */}
            {total > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 4, fontFamily: MONO }}>
                  <span style={{ color: GREEN, fontWeight: 700 }}>Kauf {buyPct} %</span>
                  <span style={{ color: RED, fontWeight: 700 }}>Verkauf {sellPct} %</span>
                </div>
                <div style={{ height: 4, backgroundColor: "#fee2e2", display: "flex" }}>
                  <div style={{ width: `${buyPct}%`, backgroundColor: "#22c55e", height: "100%", transition: "width .5s" }} />
                </div>
              </div>
            )}

            {/* Stats row */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#505050" }}>
                <span style={{ fontWeight: 700, color: GREEN, fontFamily: MONO }}>{s.buyOrders}</span>
                <span style={{ color: "#aaa" }}> Kaufaufträge</span>
              </span>
              <span style={{ fontSize: 12, color: "#505050" }}>
                <span style={{ fontWeight: 700, color: RED, fontFamily: MONO }}>{s.sellOrders}</span>
                <span style={{ color: "#aaa" }}> Verkaufsaufträge</span>
              </span>
              <span style={{ fontSize: 12, color: "#505050" }}>
                <span style={{ fontWeight: 700, color: "#0d1b2a", fontFamily: MONO }}>{s.deals}</span>
                <span style={{ color: "#aaa" }}> Abschlüsse</span>
              </span>
              {s.volume !== "—" && (
                <span style={{ fontSize: 12, color: "#aaa" }}>
                  Volumen: <span style={{ fontWeight: 700, color: "#0d1b2a", fontFamily: MONO }}>{s.volume}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status + CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, padding: "4px 12px",
          }}>
            {cfg.label}
          </span>
          {isActive && (
            <Link href={`/trading/session/${s.id}`} style={{
              display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 18px",
              backgroundColor: BLUE, color: "#fff", fontSize: 12, fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.04em",
            }}>
              Teilnehmen →
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
