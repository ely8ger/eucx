import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Activity, Users, BarChart3,
  ArrowRight, Zap, Package, Trees, Wheat, Building2,
  FlaskConical, Flame, ChevronRight, Clock, CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MarketSparkline } from "@/components/dashboard/MarketSparkline";

export const metadata: Metadata = { title: "Dashboard — EUCX" };

const KPI = [
  { label: "Aktive Sitzungen", value: "20", sub: "in 8 Warengruppen", trend: "+2 heute", up: true, Icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Tagesumsatz", value: "€ 48,2 Mio.", sub: "gegenüber gestern", trend: "+4,7 %", up: true, Icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Teilnehmer", value: "1.240", sub: "in 31 EU-Ländern", trend: "+12 neu", up: true, Icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Abschlüsse heute", value: "843", sub: "Ø 57 t / Abschluss", trend: "+63 vs. Ø", up: true, Icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
];

const CATEGORIES = [
  { id: "METALS", label: "Metallprodukte", sub: "Stahl · Alu · Kupfer", sessions: 4, volume: "12.400 t", change: "+2,3 %", up: true, Icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "SCRAP", label: "Schrott & Sekundär", sub: "Eisenschrott · NE", sessions: 2, volume: "5.800 t", change: "−0,8 %", up: false, Icon: Zap, color: "text-slate-600", bg: "bg-slate-50" },
  { id: "TIMBER", label: "Holz & Forst", sub: "Rundholz · Schnittholz", sessions: 3, volume: "3.200 m³", change: "+1,1 %", up: true, Icon: Trees, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "AGRICULTURE", label: "Agrar & Lebensmittel", sub: "Getreide · Milch · Öle", sessions: 5, volume: "8.600 t", change: "+0,4 %", up: true, Icon: Wheat, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "CHEMICALS", label: "Chemie & Petrochem.", sub: "Polymere · Düngemittel", sessions: 2, volume: "1.900 t", change: "−1,2 %", up: false, Icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "ENERGY", label: "Energie & Brennstoffe", sub: "Koks · Kohle · Pellets", sessions: 1, volume: "4.200 t", change: "+3,1 %", up: true, Icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "CONSTRUCTION", label: "Baustoffe", sub: "Zement · Splitt · Ziegel", sessions: 2, volume: "6.700 t", change: "+0,9 %", up: true, Icon: Building2, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "INDUSTRIALS", label: "Industriegüter", sub: "Maschinen · Kabel · Elektronik", sessions: 1, volume: "240 Stk", change: "—", up: null, Icon: BarChart3, color: "text-gray-500", bg: "bg-gray-50" },
];

const ACTIVE_SESSIONS = [
  { id: "247", name: "Bewehrungsstahl A1 Ø12mm", cat: "Metalle", time: "14:00–16:30", orders: 34, volume: "420 t", status: "OFFEN" },
  { id: "248", name: "Kupfer Cu-ETP Walzdraht", cat: "Metalle", time: "14:00–16:30", orders: 18, volume: "85 t", status: "OFFEN" },
  { id: "249", name: "Weizenmehl Type 550", cat: "Agrar", time: "10:00–12:00", orders: 22, volume: "1.200 t", status: "NUR_VERKAUF" },
  { id: "250", name: "Fichtenstammholz I/II", cat: "Holz", time: "09:00–11:00", orders: 11, volume: "340 m³", status: "OFFEN" },
  { id: "251", name: "Aluminiumschrott 6061", cat: "Schrott", time: "13:00–15:00", orders: 9, volume: "60 t", status: "OFFEN" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Handelsübersicht</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Clock size={13} />
            Mittwoch, 18. März 2026 · Frankfurt am Main
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <CircleDot size={12} className="text-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Börse geöffnet</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, sub, trend, up, Icon, color, bg }) => (
          <Card key={label} className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className={color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{value}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{sub}</p>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">Tagesumsatz — Verlauf</CardTitle>
            <span className="text-xs text-gray-400">Heute · stündlich</span>
          </div>
        </CardHeader>
        <CardContent>
          <MarketSparkline />
        </CardContent>
      </Card>

      {/* Warengruppen */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Warengruppen</h2>
          <span className="text-xs text-gray-400">8 Sektionen · {CATEGORIES.reduce((a, c) => a + c.sessions, 0)} aktive Sitzungen</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(({ id, label, sub, sessions, volume, change, up, Icon, color, bg }) => (
            <Link key={id} href={`/trading?category=${id}`}>
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                      <Icon size={17} className={color} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-gray-400 font-medium">{sessions}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{label}</p>
                  <p className="text-xs text-gray-400 mb-3">{sub}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-mono font-semibold text-gray-600">{volume}</span>
                    <span className={`text-xs font-bold ${up === true ? "text-emerald-600" : up === false ? "text-red-500" : "text-gray-400"}`}>{change}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Aktive Sitzungen */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">Aktive Handelssitzungen</CardTitle>
            <Link href="/trading" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Alle anzeigen <ArrowRight size={12} />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 pl-0">Sitzung</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sektion</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">Zeit</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Aufträge</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Volumen</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Status</TableHead>
                <TableHead className="pr-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVE_SESSIONS.map((s) => (
                <TableRow key={s.id} className="border-gray-100 hover:bg-gray-50/50">
                  <TableCell className="pl-0">
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">#{s.id}</p>
                  </TableCell>
                  <TableCell><span className="text-sm text-gray-600">{s.cat}</span></TableCell>
                  <TableCell><span className="text-sm font-mono text-gray-600">{s.time}</span></TableCell>
                  <TableCell className="text-right"><span className="text-sm font-semibold text-gray-900">{s.orders}</span></TableCell>
                  <TableCell className="text-right"><span className="text-sm font-mono text-gray-600">{s.volume}</span></TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.status === "OFFEN" ? "default" : "secondary"} className="text-xs">
                      {s.status === "OFFEN" ? "Offen" : "Nur Verkauf"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-0">
                    <Link href={`/trading/session/${s.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                      Teilnehmen <ChevronRight size={12} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
