"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OrderStatus = "OFFEN" | "ANGENOMMEN" | "ABGELAUFEN" | "STORNIERT" | "ABGESCHLOSSEN";
interface Order {
  id: string; sessionDate: string; sessionNo: string;
  direction: "KAUF" | "VERKAUF"; category: string; commodity: string;
  spec: string; qty: number; unit: string; pricePerUnit: number;
  currency: string; total: number; delivery: string;
  status: OrderStatus; submittedAt: string;
}

const ORDERS: Order[] = [
  { id: "A-2026-0041", sessionDate: "18.03.2026", sessionNo: "M-2026-041", direction: "VERKAUF", category: "Metalle", commodity: "Walzdraht", spec: "5,5 mm · SAE 1006", qty: 120, unit: "t", pricePerUnit: 680, currency: "EUR", total: 81600, delivery: "Franko Lager, Hamburg", status: "OFFEN", submittedAt: "18.03.2026 08:14" },
  { id: "A-2026-0038", sessionDate: "17.03.2026", sessionNo: "M-2026-038", direction: "KAUF", category: "Metalle", commodity: "Betonstahl", spec: "Ø 16 mm · B500B", qty: 80, unit: "t", pricePerUnit: 710, currency: "EUR", total: 56800, delivery: "Franko Lager, Berlin", status: "ANGENOMMEN", submittedAt: "17.03.2026 09:02" },
  { id: "A-2026-0035", sessionDate: "15.03.2026", sessionNo: "M-2026-035", direction: "VERKAUF", category: "Metalle", commodity: "Träger HEA", spec: "HEA 160 · S235JR", qty: 45, unit: "t", pricePerUnit: 740, currency: "EUR", total: 33300, delivery: "DAP München", status: "ABGESCHLOSSEN", submittedAt: "15.03.2026 07:55" },
  { id: "A-2026-0031", sessionDate: "12.03.2026", sessionNo: "M-2026-031", direction: "KAUF", category: "Schrott", commodity: "Shredder", spec: "ISRI 210", qty: 200, unit: "t", pricePerUnit: 320, currency: "EUR", total: 64000, delivery: "Franko Lager, Duisburg", status: "ABGELAUFEN", submittedAt: "12.03.2026 10:30" },
  { id: "A-2026-0027", sessionDate: "10.03.2026", sessionNo: "M-2026-027", direction: "VERKAUF", category: "Holz", commodity: "Fichte rund", spec: "2b-Qualität", qty: 300, unit: "m³", pricePerUnit: 110, currency: "EUR", total: 33000, delivery: "Franko Forst", status: "STORNIERT", submittedAt: "10.03.2026 11:15" },
];

const STATUS_MAP: Record<OrderStatus, { label: string; cls: string }> = {
  OFFEN:          { label: "Offen",          cls: "bg-blue-50 text-blue-700 border-blue-200" },
  ANGENOMMEN:     { label: "Angenommen",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ABGESCHLOSSEN:  { label: "Abgeschlossen",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ABGELAUFEN:     { label: "Abgelaufen",     cls: "bg-amber-50 text-amber-700 border-amber-200" },
  STORNIERT:      { label: "Storniert",      cls: "bg-red-50 text-red-700 border-red-200" },
};

export default function OrdersPage() {
  const [tab, setTab] = useState("alle");

  const filtered = ORDERS.filter((o) => {
    if (tab === "offen")     return o.status === "OFFEN";
    if (tab === "aktiv")     return o.status === "ANGENOMMEN";
    if (tab === "archiv")    return ["ABGELAUFEN", "STORNIERT", "ABGESCHLOSSEN"].includes(o.status);
    return true;
  });

  const totalValue = ORDERS.filter(o => o.status === "OFFEN").reduce((a, o) => a + o.total, 0);
  const openCount = ORDERS.filter(o => o.status === "OFFEN").length;
  const acceptedCount = ORDERS.filter(o => o.status === "ANGENOMMEN").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Aufträge</h1>
          <p className="text-sm text-gray-500 mt-1">Alle eingereichten Kauf- und Verkaufsaufträge</p>
        </div>
        <Link href="/orders/new" className="inline-flex items-center gap-2 h-9 px-4 bg-[#154194] text-white text-sm font-semibold rounded-md hover:bg-[#0E2D6B] transition-colors">
          <Plus size={15} />
          Neuer Auftrag
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Offene Aufträge</p>
            <p className="text-2xl font-bold text-gray-900">{openCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Angenommen</p>
            <p className="text-2xl font-bold text-emerald-600">{acceptedCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Offenes Volumen</p>
            <p className="text-2xl font-bold text-gray-900">€ {(totalValue / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">Auftragsübersicht</CardTitle>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 h-8 px-3 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter size={13} /> Filter
              </button>
              <button className="inline-flex items-center gap-1.5 h-8 px-3 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={13} /> Export
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-9 bg-gray-100/70 mb-4">
              <TabsTrigger value="alle" className="text-xs">Alle ({ORDERS.length})</TabsTrigger>
              <TabsTrigger value="offen" className="text-xs">Offen ({openCount})</TabsTrigger>
              <TabsTrigger value="aktiv" className="text-xs">Angenommen ({acceptedCount})</TabsTrigger>
              <TabsTrigger value="archiv" className="text-xs">Archiv</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 pl-0">Auftrags-Nr.</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">Richtung</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ware</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Menge</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Gesamtwert</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sitzung</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Status</TableHead>
                    <TableHead className="pr-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const s = STATUS_MAP[o.status];
                    return (
                      <TableRow key={o.id} className="border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="pl-0">
                          <span className="text-xs font-mono font-semibold text-[#154194]">{o.id}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${o.direction === "KAUF" ? "text-emerald-600" : "text-red-500"}`}>
                            {o.direction === "KAUF" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {o.direction}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-gray-900">{o.commodity}</p>
                          <p className="text-xs text-gray-400">{o.spec}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono text-gray-700">{o.qty.toLocaleString("de-DE")} {o.unit}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono font-semibold text-gray-900">{o.total.toLocaleString("de-DE")} €</span>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-gray-600">{o.sessionDate}</p>
                          <p className="text-xs text-gray-400">{o.sessionNo}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
                            {s.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-0">
                          <button className="text-xs text-[#154194] hover:text-[#0E2D6B] font-medium">Details</button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">Keine Aufträge in dieser Kategorie.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
