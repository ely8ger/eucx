"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabTrigger, TabContent } from "@/components/ui/Tabs";
import { TableWrapper, Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/Table";

// ─── Mock-Orderbuch-Daten ─────────────────────────────────────────────────
interface OrderEntry {
  id: string;
  price: number;
  qty: number;
  unit: string;
  seller?: string;
  buyer?: string;
  delivery: string;
  paymentTerms: string;
  submittedAt: string;
  mine?: boolean;
}

const SELL_ORDERS: OrderEntry[] = [
  { id: "V-041-011", price: 728, qty: 120, unit: "t", seller: "ArcelorMittal DE",         delivery: "Franko Lager Käufer, DE", paymentTerms: "100 % VZ",        submittedAt: "09:12", mine: false },
  { id: "V-041-009", price: 720, qty: 80,  unit: "t", seller: "Salzgitter AG",             delivery: "DAP Hamburg",             paymentTerms: "30 % VZ + Rest",  submittedAt: "09:08", mine: false },
  { id: "V-041-007", price: 715, qty: 60,  unit: "t", seller: "Thyssenkrupp Steel",        delivery: "Franko Lager Verkäufer",  paymentTerms: "50 % VZ",         submittedAt: "09:05", mine: false },
  { id: "V-041-005", price: 710, qty: 45,  unit: "t", seller: "Mein Betrieb GmbH",         delivery: "FCA Duisburg",            paymentTerms: "30 % VZ + 70 %",  submittedAt: "09:02", mine: true  },
  { id: "V-041-003", price: 705, qty: 30,  unit: "t", seller: "HKM Hüttenwerke Krupp",     delivery: "Franko Lager Käufer, AT", paymentTerms: "100 % VZ",        submittedAt: "08:58", mine: false },
];

const BUY_ORDERS: OrderEntry[] = [
  { id: "K-041-012", price: 695, qty: 100, unit: "t", buyer: "Bauwerk AG",                 delivery: "Franko Lager Käufer, DE", paymentTerms: "30 % VZ",         submittedAt: "09:15", mine: false },
  { id: "K-041-010", price: 692, qty: 60,  unit: "t", buyer: "Metallcenter Nord GmbH",     delivery: "FCA Berlin",             paymentTerms: "50 % VZ",         submittedAt: "09:09", mine: true  },
  { id: "K-041-008", price: 688, qty: 80,  unit: "t", buyer: "Stahlhandel Fischer",        delivery: "Franko Lager Käufer, CH", paymentTerms: "100 % VZ",        submittedAt: "09:06", mine: false },
  { id: "K-041-004", price: 680, qty: 50,  unit: "t", buyer: "Hegert & Söhne GmbH",       delivery: "DAP München",            paymentTerms: "30 % VZ + Rest",  submittedAt: "09:00", mine: false },
];

const DEALS_MADE = [
  { id: "D-041-001", price: 708, qty: 45, unit: "t", time: "09:18", buyer: "Bauwerk AG",     seller: "Salzgitter AG"       },
  { id: "D-041-002", price: 712, qty: 60, unit: "t", time: "09:31", buyer: "Metallcenter", seller: "ArcelorMittal DE"     },
  { id: "D-041-003", price: 705, qty: 30, unit: "t", time: "09:47", buyer: "Fischer GmbH",  seller: "HKM Hüttenwerke"     },
  { id: "D-041-004", price: 715, qty: 20, unit: "t", time: "10:02", buyer: "Hegert & Söhne",seller: "Thyssenkrupp Steel"   },
];

const MESSAGES = [
  { id: 1, from: "Maklerin Schmitt (EUCX)", time: "09:00", text: "Sitzung M-2026-041 ist eröffnet. Aufnahmephase läuft bis 14:00 Uhr." },
  { id: 2, from: "System",                  time: "09:05", text: "Neuer Verkaufsauftrag eingetroffen: 60 t Betonstahl zu 715 EUR/t." },
  { id: 3, from: "Maklerin Schmitt (EUCX)", time: "09:45", text: "Hinweis: Bitte Preisanpassungen bis 13:30 Uhr vornehmen." },
];

import { use } from "react";

export default function TradingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const [newMsg, setNewMsg] = useState("");

  const bestSell = Math.min(...SELL_ORDERS.map((o) => o.price));
  const bestBuy  = Math.max(...BUY_ORDERS.map((o) => o.price));
  const spread   = bestSell - bestBuy;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Session-Header ────────────────────────────────────────────────── */}
      <div className="bg-gov-white border border-gov-border-light rounded-sm p-4">
        <nav className="text-xs text-gov-text-muted mb-2">
          <Link href="/trading" className="hover:text-gov-blue">Handelssitzungen</Link>
          <span className="mx-2">›</span>
          <span>M-2026-041</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-gov-text-muted">M-2026-041</span>
              <span className="text-xs text-gov-text-muted">· 18.03.2026 · 09:00–14:00 Uhr</span>
              <span className="text-xs font-medium text-gov-blue bg-gov-blue-light px-2 py-0.5 rounded-sm">Metalle</span>
            </div>
            <h1 className="text-xl font-bold text-gov-text">Betonstahl / Walzdraht Spotmarkt</h1>
            <p className="text-xs text-gov-text-muted mt-1">
              Maklerin: E. Schmitt · EUCX · Handelsplatz Frankfurt am Main
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" dot>Offen — Aufträge möglich</Badge>
            <Link href="/orders/new">
              <Button size="sm">+ Auftrag einreichen</Button>
            </Link>
          </div>
        </div>

        {/* KPI-Zeile */}
        <div className="grid grid-cols-5 gap-3 mt-4 pt-4 border-t border-gov-border-light">
          {[
            { label: "Bestes Angebot",  value: `${bestSell.toLocaleString("de-DE")} EUR/t`, color: "text-gov-error"   },
            { label: "Bestes Gebot",    value: `${bestBuy.toLocaleString("de-DE")} EUR/t`,  color: "text-gov-success" },
            { label: "Spread",          value: `${spread.toFixed(0)} EUR/t`,                color: "text-gov-text"    },
            { label: "Abschlüsse",      value: `${DEALS_MADE.length}`,                      color: "text-gov-text"    },
            { label: "Aufträge gesamt", value: `${SELL_ORDERS.length + BUY_ORDERS.length}`, color: "text-gov-text"    },
          ].map((k) => (
            <div key={k.label}>
              <p className="text-xs text-gov-text-muted uppercase tracking-wider">{k.label}</p>
              <p className={"text-base font-bold tabular-nums " + k.color}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4-Tab-Interface ───────────────────────────────────────────────── */}
      <Tabs defaultValue="trading">
        <TabsList>
          <TabTrigger value="trading">Handelssitzung</TabTrigger>
          <TabTrigger value="deals">Abschlüsse ({DEALS_MADE.length})</TabTrigger>
          <TabTrigger value="deposit">Kautionskonto</TabTrigger>
          <TabTrigger value="messages">Nachrichten ({MESSAGES.length})</TabTrigger>
        </TabsList>

        {/* ── Tab 1: Order Book ──────────────────────────────────────────── */}
        <TabContent value="trading">
          <div className="grid grid-cols-2 gap-5">

            {/* Verkaufsaufträge */}
            <div>
              <h3 className="text-sm font-semibold text-gov-error mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gov-error" />
                Verkaufsaufträge ({SELL_ORDERS.length})
              </h3>
              <TableWrapper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableTh>Nr.</TableTh>
                      <TableTh className="text-right">Preis EUR/t</TableTh>
                      <TableTh className="text-right">Menge</TableTh>
                      <TableTh>Lieferbedingung</TableTh>
                      <TableTh>Zeit</TableTh>
                      <TableTh />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {SELL_ORDERS.map((o) => (
                      <TableRow key={o.id} data-selected={o.mine}>
                        <TableTd className="font-mono text-xs">{o.id}</TableTd>
                        <TableTd className="text-right font-mono font-semibold text-gov-error">
                          {o.price.toLocaleString("de-DE")}
                        </TableTd>
                        <TableTd className="text-right font-mono">{o.qty} {o.unit}</TableTd>
                        <TableTd className="text-xs">{o.delivery}</TableTd>
                        <TableTd className="text-xs text-gov-text-muted">{o.submittedAt}</TableTd>
                        <TableTd>
                          {o.mine ? (
                            <span className="text-xs text-gov-blue font-semibold">Mein</span>
                          ) : (
                            <button className="text-xs text-gov-blue hover:underline">Details</button>
                          )}
                        </TableTd>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </div>

            {/* Kaufaufträge */}
            <div>
              <h3 className="text-sm font-semibold text-gov-success mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gov-success" />
                Kaufaufträge ({BUY_ORDERS.length})
              </h3>
              <TableWrapper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableTh>Nr.</TableTh>
                      <TableTh className="text-right">Preis EUR/t</TableTh>
                      <TableTh className="text-right">Menge</TableTh>
                      <TableTh>Lieferbedingung</TableTh>
                      <TableTh>Zeit</TableTh>
                      <TableTh />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {BUY_ORDERS.map((o) => (
                      <TableRow key={o.id} data-selected={o.mine}>
                        <TableTd className="font-mono text-xs">{o.id}</TableTd>
                        <TableTd className="text-right font-mono font-semibold text-gov-success">
                          {o.price.toLocaleString("de-DE")}
                        </TableTd>
                        <TableTd className="text-right font-mono">{o.qty} {o.unit}</TableTd>
                        <TableTd className="text-xs">{o.delivery}</TableTd>
                        <TableTd className="text-xs text-gov-text-muted">{o.submittedAt}</TableTd>
                        <TableTd>
                          {o.mine ? (
                            <span className="text-xs text-gov-blue font-semibold">Mein</span>
                          ) : (
                            <button className="text-xs text-gov-blue hover:underline">Details</button>
                          )}
                        </TableTd>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </div>
          </div>
        </TabContent>

        {/* ── Tab 2: Abschlüsse ──────────────────────────────────────────── */}
        <TabContent value="deals">
          <TableWrapper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Abschluss-Nr.</TableTh>
                  <TableTh>Zeit</TableTh>
                  <TableTh className="text-right">Preis EUR/t</TableTh>
                  <TableTh className="text-right">Menge</TableTh>
                  <TableTh>Käufer</TableTh>
                  <TableTh>Verkäufer</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEALS_MADE.map((d) => (
                  <TableRow key={d.id}>
                    <TableTd className="font-mono text-xs text-gov-blue">{d.id}</TableTd>
                    <TableTd className="font-mono text-xs">{d.time}</TableTd>
                    <TableTd className="text-right font-mono font-semibold">{d.price.toLocaleString("de-DE")}</TableTd>
                    <TableTd className="text-right font-mono">{d.qty} {d.unit}</TableTd>
                    <TableTd>{d.buyer}</TableTd>
                    <TableTd>{d.seller}</TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        </TabContent>

        {/* ── Tab 3: Kautionskonto ───────────────────────────────────────── */}
        <TabContent value="deposit">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Gesamtkaution",      value: "50.000,00 EUR", sub: "hinterlegt",           color: "text-gov-text"    },
              { label: "Gesperrt (aktiv)",   value: "14.200,00 EUR", sub: "durch offene Aufträge", color: "text-gov-error"   },
              { label: "Frei verfügbar",     value: "35.800,00 EUR", sub: "für neue Aufträge",     color: "text-gov-success" },
            ].map((k) => (
              <div key={k.label} className="bg-gov-white border border-gov-border-light rounded-sm p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gov-text-muted">{k.label}</p>
                <p className={"text-2xl font-bold mt-2 tabular-nums " + k.color}>{k.value}</p>
                <p className="text-xs text-gov-text-muted mt-1">{k.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gov-text-muted mt-4">
            Bei unzureichendem freiem Kautionsguthaben werden neue Aufträge automatisch gesperrt.
            Bitte rechtzeitig aufstocken.
          </p>
        </TabContent>

        {/* ── Tab 4: Nachrichten ─────────────────────────────────────────── */}
        <TabContent value="messages">
          <div className="flex flex-col gap-3 max-w-2xl">
            {MESSAGES.map((m) => (
              <div key={m.id} className="bg-gov-white border border-gov-border-light rounded-sm p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gov-blue">{m.from}</span>
                  <span className="text-xs text-gov-text-muted font-mono">{m.time}</span>
                </div>
                <p className="text-sm text-gov-text">{m.text}</p>
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Nachricht an Maklerin …"
                className="flex-1 h-10 rounded-sm border border-gov-border text-sm px-3 focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20 focus:outline-none"
              />
              <Button size="sm" onClick={() => setNewMsg("")} disabled={!newMsg.trim()}>
                Senden
              </Button>
            </div>
          </div>
        </TabContent>
      </Tabs>

    </div>
  );
}
