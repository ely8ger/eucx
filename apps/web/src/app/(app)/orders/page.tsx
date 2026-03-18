"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableWrapper, Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/Table";

// ─── Mock-Daten (später via API) ───────────────────────────────────────────
type OrderStatus = "OFFEN" | "ANGENOMMEN" | "ABGELAUFEN" | "STORNIERT" | "ABGESCHLOSSEN";

interface Order {
  id: string;
  sessionDate: string;
  sessionNo: string;
  direction: "KAUF" | "VERKAUF";
  category: string;
  commodity: string;
  spec: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  total: number;
  delivery: string;
  status: OrderStatus;
  submittedAt: string;
}

const MOCK_ORDERS: Order[] = [
  { id: "A-2026-0041", sessionDate: "18.03.2026", sessionNo: "M-2026-041", direction: "VERKAUF", category: "Metalle", commodity: "Walzdraht", spec: "5,5 mm · SAE 1006", qty: 120, unit: "t", pricePerUnit: 680, currency: "EUR", total: 81600, delivery: "Franko Lager Verkäufer, Hamburg", status: "OFFEN",       submittedAt: "18.03.2026 08:14" },
  { id: "A-2026-0038", sessionDate: "17.03.2026", sessionNo: "M-2026-038", direction: "KAUF",    category: "Metalle", commodity: "Betonstahl",  spec: "Ø 16 mm · B500B",   qty: 80,  unit: "t", pricePerUnit: 710, currency: "EUR", total: 56800, delivery: "Franko Lager Käufer, Berlin",   status: "ANGENOMMEN",  submittedAt: "17.03.2026 09:02" },
  { id: "A-2026-0035", sessionDate: "15.03.2026", sessionNo: "M-2026-035", direction: "VERKAUF", category: "Metalle", commodity: "Träger HEA",  spec: "HEA 160 · S235JR",  qty: 45,  unit: "t", pricePerUnit: 740, currency: "EUR", total: 33300, delivery: "DAP München",                  status: "ABGESCHLOSSEN",submittedAt: "15.03.2026 07:55" },
  { id: "A-2026-0031", sessionDate: "12.03.2026", sessionNo: "M-2026-031", direction: "KAUF",    category: "Schrott", commodity: "Shredder",    spec: "ISRI 210",           qty: 200, unit: "t", pricePerUnit: 320, currency: "EUR", total: 64000, delivery: "Franko Lager Käufer, Duisburg", status: "ABGELAUFEN",  submittedAt: "12.03.2026 10:30" },
  { id: "A-2026-0027", sessionDate: "10.03.2026", sessionNo: "M-2026-027", direction: "VERKAUF", category: "Holz",    commodity: "Fichte rund", spec: "2b-Qualität",        qty: 300, unit: "m³",pricePerUnit: 110, currency: "EUR", total: 33000, delivery: "Franko Forst",                status: "STORNIERT",   submittedAt: "10.03.2026 11:15" },
];

const STATUS_VARIANT: Record<OrderStatus, "blue" | "success" | "error" | "warning" | "gray"> = {
  OFFEN:         "blue",
  ANGENOMMEN:    "success",
  ABGESCHLOSSEN: "success",
  ABGELAUFEN:    "warning",
  STORNIERT:     "error",
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<"ALLE" | "OFFEN" | "ANGENOMMEN" | "ARCHIV">("ALLE");

  const filtered = MOCK_ORDERS.filter((o) => {
    if (filter === "OFFEN")      return o.status === "OFFEN";
    if (filter === "ANGENOMMEN") return o.status === "ANGENOMMEN";
    if (filter === "ARCHIV")     return ["ABGELAUFEN", "STORNIERT", "ABGESCHLOSSEN"].includes(o.status);
    return true;
  });

  return (
    <div className="flex flex-col gap-6">

      {/* ── Seiten-Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-text">Meine Aufträge</h1>
          <p className="text-sm text-gov-text-muted mt-1">
            Alle eingereichten Kauf- und Verkaufsaufträge zu Handelssitzungen
          </p>
        </div>
        <Link href="/orders/new">
          <Button size="md">+ Neuer Auftrag</Button>
        </Link>
      </div>

      {/* ── Filter-Tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-gov-border-light">
        {(["ALLE", "OFFEN", "ANGENOMMEN", "ARCHIV"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors " +
              (filter === f
                ? "border-gov-blue text-gov-blue"
                : "border-transparent text-gov-text-muted hover:text-gov-text hover:border-gov-border")
            }
          >
            {f === "ALLE" ? `Alle (${MOCK_ORDERS.length})` : f}
          </button>
        ))}
      </div>

      {/* ── Tabelle ───────────────────────────────────────────────────────── */}
      <TableWrapper>
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Auftrags-Nr.</TableTh>
              <TableTh>Sitzung</TableTh>
              <TableTh>Richtung</TableTh>
              <TableTh>Warengruppe</TableTh>
              <TableTh>Ware · Spezifikation</TableTh>
              <TableTh className="text-right">Menge</TableTh>
              <TableTh className="text-right">Preis/Einheit</TableTh>
              <TableTh className="text-right">Gesamtwert</TableTh>
              <TableTh>Lieferbedingung</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Eingereicht</TableTh>
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableTd className="font-mono text-xs text-gov-blue">{order.id}</TableTd>
                <TableTd className="text-xs">{order.sessionDate}<br /><span className="text-gov-text-muted">{order.sessionNo}</span></TableTd>
                <TableTd>
                  <span className={"text-xs font-semibold " + (order.direction === "KAUF" ? "text-gov-success" : "text-gov-error")}>
                    {order.direction}
                  </span>
                </TableTd>
                <TableTd className="text-xs">{order.category}</TableTd>
                <TableTd>
                  <span className="font-medium text-gov-text">{order.commodity}</span>
                  <br />
                  <span className="text-xs text-gov-text-muted">{order.spec}</span>
                </TableTd>
                <TableTd className="text-right font-mono">{order.qty.toLocaleString("de-DE")} {order.unit}</TableTd>
                <TableTd className="text-right font-mono">{order.pricePerUnit.toLocaleString("de-DE")} {order.currency}</TableTd>
                <TableTd className="text-right font-mono font-semibold">{order.total.toLocaleString("de-DE")} {order.currency}</TableTd>
                <TableTd className="text-xs max-w-[180px] truncate">{order.delivery}</TableTd>
                <TableTd>
                  <Badge variant={STATUS_VARIANT[order.status]} dot>{order.status}</Badge>
                </TableTd>
                <TableTd className="text-xs text-gov-text-muted">{order.submittedAt}</TableTd>
                <TableTd>
                  <button className="text-xs text-gov-blue hover:underline">Details</button>
                </TableTd>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gov-text-muted text-sm">
          Keine Aufträge in dieser Kategorie.
        </div>
      )}
    </div>
  );
}
