"use client";

import {
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useQuery }        from "@tanstack/react-query";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState }      from "@/components/portfolio/EmptyState";

// ─── Typen ────────────────────────────────────────────────────────────────────

interface DayStat {
  date:      string;
  volume:    string;
  fees:      string;
  dealCount: number;
}

interface AnalyticsResponse {
  days:   DayStat[];
  totals: { volume: string; fees: string; dealCount: number };
}

interface FunnelStep {
  step:   string;
  action: string;
  count:  number;
}

interface FunnelResponse {
  period:               string;
  buyerFunnel:          FunnelStep[];
  sellerFunnel:         FunnelStep[];
  cbamBlocked:          number;
  contractsSigned:      number;
  topSearchesNoResult:  { query: string; count: number }[];
  timeToFirstBidSeconds: number | null;
  lotConversionPct:     number | null;
  lotsCreated:          number;
  dealsConfirmed:       number;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/access_token=([^;]+)/)?.[1]
      ?? localStorage.getItem("access_token")
      ?? "";
}

async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch("/api/admin/analytics", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Analysen konnten nicht geladen werden");
  return res.json() as Promise<AnalyticsResponse>;
}

async function fetchFunnel(): Promise<FunnelResponse> {
  const res = await fetch("/api/admin/analytics/funnel", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Funnel-Daten konnten nicht geladen werden");
  return res.json() as Promise<FunnelResponse>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEur(val: unknown): string {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(n)) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mio €`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)} Tsd €`;
  return `${n.toFixed(2)} €`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function dropOff(from: number, to: number): string {
  if (!from) return "—";
  const pct = ((from - to) / from) * 100;
  return pct > 0 ? `-${pct.toFixed(0)} %` : "0 %";
}

// ─── KPI-Karte ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card padding="sm" highlighted>
      <p className="text-xs text-cb-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-cb-petrol mt-1 font-mono">{value}</p>
      {sub && <p className="text-xs text-cb-gray-400 mt-0.5">{sub}</p>}
    </Card>
  );
}

function ChartSkeleton() {
  return <div className="h-48 bg-cb-gray-100 rounded animate-pulse" />;
}

// ─── Funnel-Chart ─────────────────────────────────────────────────────────────

const BLUE   = "#154194";
const BLUE_L = "#4a7ad4";

function FunnelChart({ steps, title }: { steps: FunnelStep[]; title: string }) {
  const max = steps[0]?.count ?? 1;
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 14 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s, i) => {
          const pct     = max > 0 ? Math.round((s.count / max) * 100) : 0;
          const dropPct = i > 0 ? dropOff(steps[i - 1]?.count ?? 0, s.count) : null;
          return (
            <div key={s.action}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#374151" }}>
                  <span style={{ fontWeight: 600, color: BLUE, marginRight: 6, fontFamily: "monospace" }}>
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  {s.step}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {dropPct !== null && (
                    <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "monospace" }}>{dropPct}</span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>
                    {s.count.toLocaleString("de-DE")}
                  </span>
                </span>
              </div>
              <div style={{ background: "#e8edf8", borderRadius: 2, height: 8, overflow: "hidden" }}>
                <div style={{
                  width:      `${pct}%`,
                  height:     "100%",
                  background: i === 0 ? BLUE : BLUE_L,
                  borderRadius: 2,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function AnalyticsCharts() {
  const { data, isLoading, isError } = useQuery({
    queryKey:  ["admin", "analytics"],
    queryFn:   fetchAnalytics,
    staleTime: 120_000,
    gcTime:    300_000,
  });

  const { data: funnel, isLoading: funnelLoading } = useQuery({
    queryKey:  ["admin", "analytics", "funnel"],
    queryFn:   fetchFunnel,
    staleTime: 120_000,
    gcTime:    300_000,
  });

  const chartData = data?.days.map((d) => ({
    date:      fmtDate(d.date),
    fullDate:  d.date,
    volume:    parseFloat(d.volume),
    fees:      parseFloat(d.fees),
    dealCount: d.dealCount,
  })) ?? [];

  let cumulativeFees = 0;
  const feesData = chartData.map((d) => {
    cumulativeFees += d.fees;
    return { ...d, cumulativeFees };
  });

  const totals = data?.totals;

  return (
    <div className="space-y-5">

      {/* ── KPI-Karten ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Gesamtvolumen (30 Tage)"
          value={isLoading ? "…" : fmtEur(totals?.volume ?? 0)}
          sub="Handelsvolumen"
        />
        <KpiCard
          label="Plattform-Gebühren"
          value={isLoading ? "…" : fmtEur(totals?.fees ?? 0)}
          sub="EUCX Revenue"
        />
        <KpiCard
          label="Abschlüsse"
          value={isLoading ? "…" : (totals?.dealCount ?? 0).toLocaleString("de-DE")}
          sub="in 30 Tagen"
        />
      </div>

      {/* ── Matching-KPIs ───────────────────────────────────────── */}
      {!funnelLoading && funnel && (
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            label="Ø Zeit bis erstes Gebot"
            value={
              funnel.timeToFirstBidSeconds != null
                ? funnel.timeToFirstBidSeconds < 3600
                  ? `${Math.round(funnel.timeToFirstBidSeconds / 60)} min`
                  : `${(funnel.timeToFirstBidSeconds / 3600).toFixed(1)} h`
                : "—"
            }
            sub="LOT_CREATED → erstes BID_SUBMITTED"
          />
          <KpiCard
            label="Lot-zu-Deal Conversion"
            value={funnel.lotConversionPct != null ? `${funnel.lotConversionPct} %` : "—"}
            sub={`${funnel.dealsConfirmed} Deals / ${funnel.lotsCreated} Lots`}
          />
        </div>
      )}

      {/* ── Funnel-Sektion ──────────────────────────────────────── */}
      <Card
        header={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle>Conversion-Funnel (30 Tage)</CardTitle>
            {funnel?.cbamBlocked !== undefined && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#b45309",
                background: "#fef3c7", border: "1px solid #fde68a",
                padding: "3px 10px", borderRadius: 2,
              }}>
                {funnel.cbamBlocked} Deal-Limit-Sperren
              </span>
            )}
          </div>
        }
        padding="md"
      >
        {funnelLoading ? (
          <ChartSkeleton />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <FunnelChart steps={funnel?.buyerFunnel ?? []} title="Käufer-Pfad" />
            <FunnelChart steps={funnel?.sellerFunnel ?? []} title="Verkäufer-Pfad" />
          </div>
        )}
      </Card>

      {/* ── Top-Suchanfragen ohne Ergebnis ──────────────────────── */}
      {!funnelLoading && (funnel?.topSearchesNoResult?.length ?? 0) > 0 && (
        <Card
          header={<CardTitle>Suchanfragen ohne Treffer — Produktlücken</CardTitle>}
          padding="md"
        >
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>
            Was Nutzer suchen, das es im Katalog (noch) nicht gibt. Zeigt Marktbedarf.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {funnel!.topSearchesNoResult.map((s, i) => (
              <div key={s.query} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "7px 12px",
                background: i % 2 === 0 ? "#f8f9fb" : "#fff",
                border: "1px solid #e8edf8",
              }}>
                <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", minWidth: 20 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: "#111", fontFamily: "monospace" }}>
                  {s.query}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#154194", fontFamily: "monospace" }}>
                  {s.count}×
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Tägliches Handelsvolumen ─────────────────────────────── */}
      <Card
        header={<CardTitle>Tägliches Handelsvolumen</CardTitle>}
        padding="md"
      >
        {isError && <EmptyState icon="⚠" title="Daten nicht verfügbar" size="sm" />}
        {isLoading && <ChartSkeleton />}
        {!isLoading && !isError && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtEur(v)} width={68} />
              <Tooltip
                formatter={(value) => [fmtEur(value as unknown), "Volumen"]}
                labelFormatter={(label) => `Tag: ${String(label)}`}
                contentStyle={{ border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              />
              <Bar dataKey="volume" fill="#154194" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={(chartData[i]?.dealCount ?? 0) > 0 ? "#154194" : "#d1daf0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Kumulierte Gebühren ──────────────────────────────────── */}
      <Card
        header={<CardTitle>Kumulierte Plattform-Gebühren</CardTitle>}
        padding="md"
      >
        {isError && <EmptyState icon="⚠" title="Daten nicht verfügbar" size="sm" />}
        {isLoading && <ChartSkeleton />}
        {!isLoading && !isError && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={feesData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FBB809" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FBB809" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtEur(v)} width={68} />
              <Tooltip
                formatter={(value, name) => [fmtEur(value as unknown), name === "cumulativeFees" ? "Kumuliert" : "Tagesgebühr"]}
                contentStyle={{ border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="cumulativeFees" stroke="#FBB809" strokeWidth={2} fill="url(#feesGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
