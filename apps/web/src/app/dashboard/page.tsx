import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard — EUCX" };

const CATEGORIES = [
  {
    id:       "METALS",
    label:    "Metalle",
    icon:     "⚙",
    sub:      "Stahl, Aluminium, Kupfer, Zink, Blei",
    sessions: 4,
    volume:   "12.400 t",
    change:   "+2,3%",
    up:       true,
  },
  {
    id:       "SCRAP",
    label:    "Schrott & Sekundär",
    icon:     "♻",
    sub:      "Eisenschrott, NE-Schrott, Späne",
    sessions: 2,
    volume:   "5.800 t",
    change:   "-0,8%",
    up:       false,
  },
  {
    id:       "TIMBER",
    label:    "Holz & Forst",
    icon:     "🌲",
    sub:      "Rundholz, Schnittholz, Pellets, Platten",
    sessions: 3,
    volume:   "3.200 m³",
    change:   "+1,1%",
    up:       true,
  },
  {
    id:       "AGRICULTURE",
    label:    "Agrar & Lebensmittel",
    icon:     "🌾",
    sub:      "Getreide, Milchpulver, Öle, Saaten",
    sessions: 5,
    volume:   "8.600 t",
    change:   "+0,4%",
    up:       true,
  },
  {
    id:       "CHEMICALS",
    label:    "Chemie & Petrochemie",
    icon:     "⚗",
    sub:      "Polymere, Düngemittel, Lösungsmittel",
    sessions: 2,
    volume:   "1.900 t",
    change:   "-1,2%",
    up:       false,
  },
  {
    id:       "ENERGY",
    label:    "Energie & Brennstoffe",
    icon:     "⚡",
    sub:      "Koks, Kohle, Pellets, Briketts",
    sessions: 1,
    volume:   "4.200 t",
    change:   "+3,1%",
    up:       true,
  },
  {
    id:       "CONSTRUCTION",
    label:    "Baustoffe",
    icon:     "🏗",
    sub:      "Zement, Splitt, Ziegel, Beton",
    sessions: 2,
    volume:   "6.700 t",
    change:   "+0,9%",
    up:       true,
  },
  {
    id:       "INDUSTRIALS",
    label:    "Industriegüter",
    icon:     "🔧",
    sub:      "Maschinen, Fahrzeuge, Kabel, Elektronik",
    sessions: 1,
    volume:   "240 Stk",
    change:   "—",
    up:       null,
  },
];

const STATS = [
  { label: "Aktive Sitzungen",  value: "20",         sub: "in 8 Warengruppen" },
  { label: "Tagesumsatz",       value: "€ 48,2 Mio", sub: "+4,7% vs. gestern" },
  { label: "Registrierte Mitglieder", value: "1.240", sub: "31 Länder" },
  { label: "Abschlüsse heute",  value: "843",         sub: "∅ 57 t / Abschluss" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-screen-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cb-petrol">
            European Union Commodity Exchange
          </h1>
          <p className="text-sm text-cb-gray-500 mt-0.5">
            Spot-Markt für Waren aller Kategorien · B2B · Anonymous Trading
          </p>
        </div>
        <Badge variant="success" dot>Börse geöffnet</Badge>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} highlighted padding="sm">
            <p className="text-xs text-cb-gray-500 font-medium uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-cb-petrol mt-1">{s.value}</p>
            <p className="text-sm text-cb-gray-500">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Warengruppen */}
      <div>
        <h2 className="text-sm font-semibold text-cb-gray-400 uppercase tracking-wider mb-3">
          Warengruppen
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/trading?category=${cat.id}`}>
              <Card
                padding="md"
                className="hover:shadow-md hover:border-cb-yellow/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <Badge variant={cat.sessions > 0 ? "success" : "gray"} dot>
                    {cat.sessions} Sitzungen
                  </Badge>
                </div>
                <p className="font-semibold text-cb-petrol group-hover:text-cb-yellow transition-colors">
                  {cat.label}
                </p>
                <p className="text-xs text-cb-gray-500 mt-0.5 mb-3">{cat.sub}</p>
                <div className="flex items-center justify-between border-t border-cb-gray-100 pt-2">
                  <span className="text-xs text-cb-gray-500 font-mono">{cat.volume}</span>
                  <span className={`text-xs font-semibold ${
                    cat.up === true  ? "text-cb-success" :
                    cat.up === false ? "text-red-500" :
                    "text-cb-gray-400"
                  }`}>
                    {cat.change}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
