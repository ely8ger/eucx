import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Handelssitzungen — EUCX" };

type SessionStage = "OFFEN" | "NUR_VERKAUF" | "GESCHLOSSEN" | "ABGESCHLOSSEN";

interface Session {
  id: string;
  no: string;
  date: string;
  time: string;
  category: string;
  name: string;
  stage: SessionStage;
  buyOrders: number;
  sellOrders: number;
  deals: number;
  volume: string;
}

const SESSIONS: Session[] = [
  { id: "ses-041", no: "M-2026-041", date: "18.03.2026", time: "09:00–14:00", category: "Metalle",  name: "Betonstahl / Walzdraht Spotmarkt",       stage: "OFFEN",        buyOrders: 12, sellOrders: 18, deals: 4,  volume: "620 t"    },
  { id: "ses-040", no: "M-2026-040", date: "18.03.2026", time: "10:30–15:00", category: "Metalle",  name: "Träger & Profile — Export",              stage: "NUR_VERKAUF",  buyOrders: 0,  sellOrders: 9,  deals: 0,  volume: "—"        },
  { id: "ses-039", no: "S-2026-039", date: "18.03.2026", time: "08:00–12:00", category: "Schrott",  name: "Eisenschrott ISRI 210/211 Inland",       stage: "OFFEN",        buyOrders: 6,  sellOrders: 14, deals: 2,  volume: "480 t"    },
  { id: "ses-038", no: "H-2026-038", date: "17.03.2026", time: "09:00–13:00", category: "Holz",     name: "Fichten-Rundholz 2b-Qualität",           stage: "ABGESCHLOSSEN",buyOrders: 8,  sellOrders: 11, deals: 7,  volume: "1.200 m³" },
  { id: "ses-037", no: "A-2026-037", date: "17.03.2026", time: "11:00–16:00", category: "Agrar",    name: "Weizen A-Qualität Ernte 2025",           stage: "ABGESCHLOSSEN",buyOrders: 14, sellOrders: 22, deals: 11, volume: "4.400 t"  },
  { id: "ses-036", no: "M-2026-036", date: "17.03.2026", time: "08:30–13:30", category: "Metalle",  name: "Aluminium-Walzbarren 1050A",             stage: "GESCHLOSSEN",  buyOrders: 5,  sellOrders: 5,  deals: 0,  volume: "—"        },
];

const STAGE_CFG: Record<SessionStage, { label: string; variant: "blue" | "success" | "warning" | "gray" }> = {
  OFFEN:         { label: "Offen — Aufträge möglich",  variant: "success" },
  NUR_VERKAUF:   { label: "Nur Verkaufsaufträge",      variant: "warning" },
  GESCHLOSSEN:   { label: "Geschlossen",               variant: "gray"    },
  ABGESCHLOSSEN: { label: "Abgeschlossen",             variant: "blue"    },
};

export default function TradingPage() {
  const open   = SESSIONS.filter((s) => s.stage === "OFFEN" || s.stage === "NUR_VERKAUF");
  const closed = SESSIONS.filter((s) => s.stage === "GESCHLOSSEN" || s.stage === "ABGESCHLOSSEN");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gov-text">Handelssitzungen</h1>
        <p className="text-sm text-gov-text-muted mt-1">
          Laufende und abgeschlossene Sitzungen — Kauf- &amp; Verkaufsaufträge einreichen
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-gov-text mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gov-success inline-block" />
          Aktive Sitzungen ({open.length})
        </h2>
        <div className="flex flex-col gap-3">
          {open.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gov-text-muted mb-3">
          Abgeschlossene Sitzungen ({closed.length})
        </h2>
        <div className="flex flex-col gap-2">
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
    <div className={"bg-gov-white border rounded-sm p-4 " + (isActive ? "border-gov-border shadow-sm" : "border-gov-border-light")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gov-text-muted">{s.no}</span>
            <span className="text-xs text-gov-text-muted">·</span>
            <span className="text-xs text-gov-text-muted">{s.date}, {s.time} Uhr</span>
            <span className="text-xs font-medium text-gov-blue bg-gov-blue-light px-2 py-0.5 rounded-sm">{s.category}</span>
          </div>
          <p className="font-semibold text-gov-text">{s.name}</p>
          <div className="flex items-center gap-5 mt-2 text-xs text-gov-text-muted">
            <span><span className="text-gov-success font-semibold">{s.buyOrders}</span> Kaufaufträge</span>
            <span><span className="text-gov-error font-semibold">{s.sellOrders}</span> Verkaufsaufträge</span>
            <span><span className="font-semibold text-gov-text">{s.deals}</span> Abschlüsse</span>
            {s.volume !== "—" && <span>Volumen: <span className="font-semibold text-gov-text">{s.volume}</span></span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
          {isActive && (
            <Link
              href={`/trading/session/${s.id}`}
              className="inline-flex items-center gap-1 h-9 px-4 rounded-sm bg-gov-blue text-white text-sm font-semibold hover:bg-gov-blue-dark transition-colors"
            >
              Teilnehmen →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
