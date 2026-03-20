import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Handelssitzungen - EUCX" };

type SessionStage = "OFFEN" | "NUR_VERKAUF" | "GESCHLOSSEN" | "ABGESCHLOSSEN";

interface Session {
  id: string; no: string; date: string; time: string;
  category: string; name: string; stage: SessionStage;
  buyOrders: number; sellOrders: number; deals: number; volume: string;
}

const SESSIONS: Session[] = [
  { id: "ses-041", no: "M-2026-041", date: "18.03.2026", time: "09:00–14:00", category: "Metalle",  name: "Betonstahl / Walzdraht Spotmarkt",  stage: "OFFEN",        buyOrders: 12, sellOrders: 18, deals: 4,  volume: "620 t"    },
  { id: "ses-040", no: "M-2026-040", date: "18.03.2026", time: "10:30–15:00", category: "Metalle",  name: "Träger & Profile - Export",         stage: "NUR_VERKAUF",  buyOrders: 0,  sellOrders: 9,  deals: 0,  volume: "-"        },
  { id: "ses-039", no: "S-2026-039", date: "18.03.2026", time: "08:00–12:00", category: "Schrott",  name: "Eisenschrott ISRI 210/211 Inland",  stage: "OFFEN",        buyOrders: 6,  sellOrders: 14, deals: 2,  volume: "480 t"    },
  { id: "ses-038", no: "H-2026-038", date: "17.03.2026", time: "09:00–13:00", category: "Holz",     name: "Fichten-Rundholz 2b-Qualität",      stage: "ABGESCHLOSSEN",buyOrders: 8,  sellOrders: 11, deals: 7,  volume: "1.200 m³" },
  { id: "ses-037", no: "A-2026-037", date: "17.03.2026", time: "11:00–16:00", category: "Agrar",    name: "Weizen A-Qualität Ernte 2025",      stage: "ABGESCHLOSSEN",buyOrders: 14, sellOrders: 22, deals: 11, volume: "4.400 t"  },
  { id: "ses-036", no: "M-2026-036", date: "17.03.2026", time: "08:30–13:30", category: "Metalle",  name: "Aluminium-Walzbarren 1050A",        stage: "GESCHLOSSEN",  buyOrders: 5,  sellOrders: 5,  deals: 0,  volume: "-"        },
];

const STAGE_CFG: Record<SessionStage, { label: string; color: string; bg: string }> = {
  OFFEN:         { label: "Offen – Aufträge möglich", color: "#166534", bg: "#f0fdf4" },
  NUR_VERKAUF:   { label: "Nur Verkaufsaufträge",     color: "#92400e", bg: "#fffbeb" },
  GESCHLOSSEN:   { label: "Geschlossen",              color: "#505050", bg: "#f5f5f5" },
  ABGESCHLOSSEN: { label: "Abgeschlossen",            color: "#154194", bg: "#eef2fb" },
};

const F = "'IBM Plex Sans', Arial, sans-serif";

export default function TradingPage() {
  const open   = SESSIONS.filter((s) => s.stage === "OFFEN" || s.stage === "NUR_VERKAUF");
  const closed = SESSIONS.filter((s) => s.stage === "GESCHLOSSEN" || s.stage === "ABGESCHLOSSEN");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: F }}>

      {/* ── Seitenkopf ── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Handelssitzungen</h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          Laufende und abgeschlossene Sitzungen — Kauf- &amp; Verkaufsaufträge einreichen
        </p>
      </div>

      {/* ── Aktive Sitzungen ── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, backgroundColor: "#22c55e", display: "inline-block" }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>
            Aktive Sitzungen ({open.length})
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e8e8e8" }}>
          {open.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>

      {/* ── Abgeschlossene Sitzungen ── */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#888", margin: "0 0 12px" }}>
          Abgeschlossene Sitzungen ({closed.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e8e8e8" }}>
          {closed.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>

    </div>
  );
}

function SessionCard({ session: s }: { session: Session }) {
  const cfg      = STAGE_CFG[s.stage];
  const isActive = s.stage === "OFFEN" || s.stage === "NUR_VERKAUF";

  return (
    <div style={{
      backgroundColor: "#fff",
      padding: "16px 20px",
      borderLeft: isActive ? "3px solid #154194" : "3px solid transparent",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta-Zeile */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#888" }}>{s.no}</span>
            <span style={{ color: "#ccc" }}>·</span>
            <span style={{ fontSize: 11, color: "#888" }}>{s.date}, {s.time} Uhr</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#154194", backgroundColor: "#eef2fb", padding: "1px 8px" }}>
              {s.category}
            </span>
          </div>

          {/* Sitzungsname */}
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{s.name}</p>

          {/* Statistiken */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#505050" }}>
              <span style={{ fontWeight: 700, color: "#166534" }}>{s.buyOrders}</span> Kaufaufträge
            </span>
            <span style={{ fontSize: 12, color: "#505050" }}>
              <span style={{ fontWeight: 700, color: "#dc2626" }}>{s.sellOrders}</span> Verkaufsaufträge
            </span>
            <span style={{ fontSize: 12, color: "#505050" }}>
              <span style={{ fontWeight: 700, color: "#0d1b2a" }}>{s.deals}</span> Abschlüsse
            </span>
            {s.volume !== "-" && (
              <span style={{ fontSize: 12, color: "#505050" }}>
                Volumen: <span style={{ fontWeight: 700, color: "#0d1b2a" }}>{s.volume}</span>
              </span>
            )}
          </div>
        </div>

        {/* Status + Aktion */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg, padding: "3px 10px", whiteSpace: "nowrap" }}>
            {cfg.label}
          </span>
          {isActive && (
            <Link href={`/trading/session/${s.id}`} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              height: 34, padding: "0 16px",
              backgroundColor: "#154194", color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#154194")}
            >
              Teilnehmen →
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
