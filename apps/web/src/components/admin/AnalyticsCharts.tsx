"use client";

/**
 * AnalyticsCharts — Tägliches Handelsvolumen & Plattform-Gebühren
 *
 * Recharts:
 *   - BarChart: tägliches Volumen (30 Tage)
 *   - AreaChart: kumulierte Plattform-Gebühren
 *   - KPI-Karten: Gesamtvolumen, Gebühren, Abschlüsse
 */

import {
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery }          from "@tanstack/react-query";
import { Card, CardTitle }   from "@/components/ui/Card";
import { EmptyState }        from "@/components/portfolio/EmptyState";

// ─── Typen ────────────────────────────────────────────────────────────────────

interface DayStat {
  date:       string;  // "2026-03-01"
  volume:     string;
  fees:       string;
  dealCount:  number;
}

interface AnalyticsResponse {
  days:    DayStat[];
  totals:  { volume: string; fees: string; dealCount: number };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/access_token=([^;]+)/)?.[1] ?? localStorage.getItem("access_token") ?? "";
}

async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch("/api/admin/analytics", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Analysen konnten nicht geladen werden");
  return res.json() as Promise<AnalyticsResponse>;
}

// ─── Tooltip Formatter ───────────────────────────────────────────────────────

function fmtEur(val: unknown): string {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mio €`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)} Tsd €`;
  return `${n.toFixed(2)} €`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="h-48 bg-cb-gray-100 rounded animate-pulse" />
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function AnalyticsCharts() {
  const { data, isLoading, isError } = useQuery({
    queryKey:  ["admin", "analytics"],
    queryFn:   fetchAnalytics,
    staleTime: 120_000,   // 2min — Historische Daten ändern sich selten
    gcTime:    300_000,
  });

  // Chart-Daten aufbereiten: nur letzte 30 Tage, Werte als number
  const chartData = data?.days.map((d) => ({
    date:       fmtDate(d.date),
    fullDate:   d.date,
    volume:     parseFloat(d.volume),
    fees:       parseFloat(d.fees),
    dealCount:  d.dealCount,
  })) ?? [];

  // Kumulierte Gebühren-Linie berechnen
  let cumulativeFees = 0;
  const feesData = chartData.map((d) => {
    cumulativeFees += d.fees;
    return { ...d, cumulativeFees };
  });

  const totals = data?.totals;

  return (
    <div className="space-y-5">
      {/* KPI-Karten */}
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

      {/* Bar Chart: Tägliches Volumen */}
      <Card
        header={<CardTitle>Tägliches Handelsvolumen</CardTitle>}
        padding="md"
      >
        {isError && (
          <EmptyState icon="⚠" title="Daten nicht verfügbar" size="sm" />
        )}
        {isLoading && <ChartSkeleton />}
        {!isLoading && !isError && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => fmtEur(v)}
                width={68}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [fmtEur(value as unknown), "Volumen"]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) => `Tag: ${String(label)}`}
                contentStyle={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="volume"
                fill="#004B7F"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Area Chart: Kumulierte Gebühren */}
      <Card
        header={<CardTitle>Kumulierte Plattform-Gebühren</CardTitle>}
        padding="md"
      >
        {isError && (
          <EmptyState icon="⚠" title="Daten nicht verfügbar" size="sm" />
        )}
        {isLoading && <ChartSkeleton />}
        {!isLoading && !isError && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={feesData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FBB809" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FBB809" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => fmtEur(v)}
                width={68}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  fmtEur(value as unknown),
                  name === "cumulativeFees" ? "Kumuliert" : "Tagesgebühr",
                ]}
                contentStyle={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeFees"
                stroke="#FBB809"
                strokeWidth={2}
                fill="url(#feesGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
