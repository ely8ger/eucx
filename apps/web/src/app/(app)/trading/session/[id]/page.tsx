"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, TrendingDown, Activity,
  MessageSquare, Banknote, CheckCircle2, Send, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/context";

interface OrderEntry {
  id: string; price: number; qty: number; unit: string;
  counterpart: string; delivery: string; payment: string;
  time: string; mine?: boolean;
}

const SELL: OrderEntry[] = [
  { id: "V-041-011", price: 728, qty: 120, unit: "t", counterpart: "ArcelorMittal DE",   delivery: "Franko Lager Käufer, DE", payment: "100 % VZ",       time: "09:12" },
  { id: "V-041-009", price: 720, qty: 80,  unit: "t", counterpart: "Salzgitter AG",       delivery: "DAP Hamburg",             payment: "30 % VZ + Rest", time: "09:08" },
  { id: "V-041-007", price: 715, qty: 60,  unit: "t", counterpart: "Thyssenkrupp Steel",  delivery: "Franko Lager Verkäufer",  payment: "50 % VZ",        time: "09:05" },
  { id: "V-041-005", price: 710, qty: 45,  unit: "t", counterpart: "Mein Betrieb GmbH",   delivery: "FCA Duisburg",            payment: "30 % VZ + 70 %", time: "09:02", mine: true },
  { id: "V-041-003", price: 705, qty: 30,  unit: "t", counterpart: "HKM Hüttenwerke",     delivery: "Franko Lager Käufer, AT", payment: "100 % VZ",       time: "08:58" },
];

const BUY: OrderEntry[] = [
  { id: "K-041-012", price: 695, qty: 100, unit: "t", counterpart: "Bauwerk AG",           delivery: "Franko Lager Käufer, DE", payment: "30 % VZ",        time: "09:15" },
  { id: "K-041-010", price: 692, qty: 60,  unit: "t", counterpart: "Metallcenter Nord",    delivery: "FCA Berlin",              payment: "50 % VZ",        time: "09:09", mine: true },
  { id: "K-041-008", price: 688, qty: 80,  unit: "t", counterpart: "Stahlhandel Fischer",  delivery: "Franko Lager Käufer, CH", payment: "100 % VZ",       time: "09:06" },
  { id: "K-041-004", price: 680, qty: 50,  unit: "t", counterpart: "Hegert & Söhne GmbH", delivery: "DAP München",             payment: "30 % VZ + Rest", time: "09:00" },
];

const DEALS = [
  { id: "D-041-001", price: 708, qty: 45, unit: "t", time: "09:18", buyer: "Bauwerk AG",      seller: "Salzgitter AG"       },
  { id: "D-041-002", price: 712, qty: 60, unit: "t", time: "09:31", buyer: "Metallcenter",    seller: "ArcelorMittal DE"    },
  { id: "D-041-003", price: 705, qty: 30, unit: "t", time: "09:47", buyer: "Fischer GmbH",    seller: "HKM Hüttenwerke"     },
  { id: "D-041-004", price: 715, qty: 20, unit: "t", time: "10:02", buyer: "Hegert & Söhne",  seller: "Thyssenkrupp Steel"  },
];

const MSGS = [
  { id: 1, from: "Maklerin Schmitt (EUCX)", time: "09:00", text: "Sitzung M-2026-041 ist eröffnet. Aufnahmephase läuft bis 14:00 Uhr.", system: false },
  { id: 2, from: "System",                  time: "09:05", text: "Neuer Verkaufsauftrag: 60 t Betonstahl zu 715 EUR/t eingetroffen.",   system: true  },
  { id: 3, from: "Maklerin Schmitt (EUCX)", time: "09:45", text: "Hinweis: Preisanpassungen bitte bis 13:30 Uhr vornehmen.",           system: false },
];

export default function TradingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const LOCALE_BCP: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES", pl: "pl-PL", ru: "ru-RU" };
  const bcp = LOCALE_BCP[locale] ?? "de-DE";
  const [msg, setMsg] = useState("");

  const bestSell = Math.min(...SELL.map((o) => o.price));
  const bestBuy  = Math.max(...BUY.map((o) => o.price));
  const spread   = bestSell - bestBuy;
  const totalVol = DEALS.reduce((a, d) => a + d.qty * d.price, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/trading" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
          <ArrowLeft size={14} />
          {t("trading_title")}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t("trading_session_nr")} #{id}</span>
      </div>

      {/* Session Header Card */}
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{t("session_product_betonstahl")}</h1>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  ● OFFEN
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{t("trading_session_nr")} M-2026-{id} · {t("session_warengruppe")} {t("cat_badge_metalle")} · 18. März 2026</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5">
                <Clock size={14} />
                <span className="font-mono font-medium text-gray-900">02:28:14</span>
                <span>{t("trading_remaining")}</span>
              </div>
              <Link href="/orders/new" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 36, padding: "0 18px",
                backgroundColor: "#154194", color: "#fff", fontSize: 13, fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.02em", whiteSpace: "nowrap",
              }}>
                {t("btn_submit_order")}
              </Link>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* KPI Bar */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: t("trading_best_offer"), value: `${bestSell.toLocaleString(bcp)} €/t`, cls: "text-red-500"     },
              { label: t("trading_best_bid"),   value: `${bestBuy.toLocaleString(bcp)} €/t`,  cls: "text-emerald-600" },
              { label: t("trading_spread"),     value: `${spread.toFixed(0)} €/t`,                cls: "text-gray-700"    },
              { label: t("trading_deals"),      value: `${DEALS.length}`,                         cls: "text-gray-700"    },
              { label: t("trading_volume"),     value: `${totalVol.toLocaleString(bcp, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`, cls: "text-gray-700"    },
            ].map((k) => (
              <div key={k.label}>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{k.label}</p>
                <p className={`text-lg font-bold tabular-nums ${k.cls}`}>{k.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4-Tab Interface */}
      <Tabs defaultValue="trading">
        <TabsList className="h-10 bg-gray-100/70">
          <TabsTrigger value="trading" className="gap-1.5 text-sm">
            <Activity size={14} />
            {t("trading_order_book")}
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5 text-sm">
            <CheckCircle2 size={14} />
            {t("trading_deals_tab")} ({DEALS.length})
          </TabsTrigger>
          <TabsTrigger value="deposit" className="gap-1.5 text-sm">
            <Banknote size={14} />
            {t("session_tab_deposit")}
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5 text-sm">
            <MessageSquare size={14} />
            {t("trading_messages")} ({MSGS.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Orderbuch ── */}
        <TabsContent value="trading" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Verkauf */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-500">
                  <TrendingDown size={15} />
                  {t("trading_sell_orders")} ({SELL.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="text-xs text-gray-400 pl-0 font-semibold uppercase tracking-wider">Nr.</TableHead>
                      <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">{t("session_col_price")}</TableHead>
                      <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">{t("session_col_qty")}</TableHead>
                      <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t("session_col_time")}</TableHead>
                      <TableHead className="pr-0" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SELL.map((o) => (
                      <TableRow
                        key={o.id}
                        className={`border-gray-100 transition-colors ${o.mine ? "bg-blue-50/60" : "hover:bg-gray-50/50"}`}
                      >
                        <TableCell className="pl-0">
                          <span className="text-xs font-mono text-gray-500">{o.id}</span>
                          {o.mine && <span className="ml-1.5 text-[10px] font-bold text-[#154194] bg-blue-100 px-1.5 py-0.5 rounded">{t("session_mine")}</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-bold font-mono text-red-500">{o.price.toLocaleString(bcp)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono text-gray-700">{o.qty} {o.unit}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-gray-400">{o.time}</span>
                        </TableCell>
                        <TableCell className="pr-0 text-right">
                          {!o.mine && (
                            <button className="text-xs text-[#154194] hover:text-[#0E2D6B] font-semibold">{t("session_btn_buy")}</button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Kauf */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <TrendingUp size={15} />
                  {t("session_buy_orders")} ({BUY.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="text-xs text-gray-400 pl-0 font-semibold uppercase tracking-wider">Nr.</TableHead>
                      <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">{t("session_col_price")}</TableHead>
                      <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">{t("session_col_qty")}</TableHead>
                      <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t("session_col_time")}</TableHead>
                      <TableHead className="pr-0" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BUY.map((o) => (
                      <TableRow
                        key={o.id}
                        className={`border-gray-100 transition-colors ${o.mine ? "bg-blue-50/60" : "hover:bg-gray-50/50"}`}
                      >
                        <TableCell className="pl-0">
                          <span className="text-xs font-mono text-gray-500">{o.id}</span>
                          {o.mine && <span className="ml-1.5 text-[10px] font-bold text-[#154194] bg-blue-100 px-1.5 py-0.5 rounded">{t("session_mine")}</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-bold font-mono text-emerald-600">{o.price.toLocaleString(bcp)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono text-gray-700">{o.qty} {o.unit}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-gray-400">{o.time}</span>
                        </TableCell>
                        <TableCell className="pr-0 text-right">
                          {!o.mine && (
                            <button className="text-xs text-[#154194] hover:text-[#0E2D6B] font-semibold">{t("session_btn_details")}</button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Abschlüsse ── */}
        <TabsContent value="deals" className="mt-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="pt-5">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    {[t("session_col_deal_nr"), t("session_col_time"), t("session_col_price"), t("session_col_qty"), t("session_col_buyer"), t("session_col_seller")].map((h, i) => (
                      <TableHead key={h} className={`text-xs font-semibold uppercase tracking-wider text-gray-400 ${i >= 2 && i <= 3 ? "text-right" : ""} ${i === 0 ? "pl-0" : ""}`}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEALS.map((d) => (
                    <TableRow key={d.id} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell className="pl-0 font-mono text-xs font-semibold text-[#154194]">{d.id}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{d.time}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-gray-900">{d.price.toLocaleString(bcp)}</TableCell>
                      <TableCell className="text-right font-mono text-gray-700">{d.qty} {d.unit}</TableCell>
                      <TableCell className="text-sm text-gray-700">{d.buyer}</TableCell>
                      <TableCell className="text-sm text-gray-700">{d.seller}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Kaution ── */}
        <TabsContent value="deposit" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t("session_deposit_total"),  value: "€ 50.000", sub: t("session_deposit_total_sub"),  cls: "text-gray-900"    },
              { label: t("session_deposit_locked"), value: "€ 14.200", sub: t("session_deposit_locked_sub"), cls: "text-red-500"     },
              { label: t("session_deposit_free"),   value: "€ 35.800", sub: t("session_deposit_free_sub"),   cls: "text-emerald-600" },
            ].map((k) => (
              <Card key={k.label} className="border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{k.label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${k.cls}`}>{k.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            {t("session_deposit_warning")}
          </p>
        </TabsContent>

        {/* ── Tab 4: Nachrichten ── */}
        <TabsContent value="messages" className="mt-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 mb-4">
                {MSGS.map((m) => (
                  <div key={m.id} className={`rounded-lg p-3.5 ${m.system ? "bg-gray-50 border border-gray-200" : "bg-blue-50 border border-blue-100"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-semibold ${m.system ? "text-gray-500" : "text-[#154194]"}`}>{m.from}</span>
                      <span className="text-xs font-mono text-gray-400">{m.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={t("session_msg_placeholder")}
                  className="flex-1 h-10 rounded-lg border border-gray-200 text-sm px-3 focus:border-[#154194] focus:ring-2 focus:ring-[#154194]/15 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setMsg("")}
                  disabled={!msg.trim()}
                  className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#154194] text-white text-sm font-semibold rounded-lg hover:bg-[#0E2D6B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                  {t("session_btn_send")}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
