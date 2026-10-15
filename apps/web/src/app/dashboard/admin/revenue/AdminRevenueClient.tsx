"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { EucxHeader } from "@/components/layout/EucxHeader";

const BLUE  = "#154194";
const DARK  = "#0d1b2a";
const LIGHT = "#f7f9fc";
const F     = "'IBM Plex Sans', Arial, sans-serif";

const MONTHS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

interface MonthBreakdown {
  month:             string; // "2026-01"
  revenue:           string;
  vat:               string;
  netRevenue:        string;
  tradeCount:        number;
  lotCount:          number;
  totalTransactions: number;
}

interface RevenueData {
  period:            { year?: number; month?: string; start: string; end: string };
  totalRevenue:      string;
  vatCollected:      string;
  netRevenue:        string;
  tradeCount:        number;
  lotCount:          number;
  totalTransactions: number;
  breakdown?:        MonthBreakdown[];
}

function fmt(v: string): string {
  const n = parseFloat(v);
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthLabel(m: string): string {
  const parts = m.split("-");
  const idx   = parseInt(parts[1] ?? "1", 10) - 1;
  return MONTHS[idx] ?? m;
}

export function AdminRevenueClient() {
  const currentYear = new Date().getFullYear();
  const [year, setYear]   = useState(currentYear);
  const [data, setData]   = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async (y: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/clearing/revenue?year=${y}`);
      if (!res.ok) {
        setError(`Fehler ${res.status}`);
        return;
      }
      const json = await res.json() as RevenueData;
      setData(json);
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(year); }, [year, load]);

  const chartData = data?.breakdown?.map((m) => ({
    label:   monthLabel(m.month),
    revenue: parseFloat(m.revenue),
    vat:     parseFloat(m.vat),
    net:     parseFloat(m.netRevenue),
  })) ?? [];

  const availableYears = Array.from(
    { length: currentYear - 2024 + 1 },
    (_, i) => 2025 + i,
  );

  const exportCsv = () => {
    window.location.href = `/api/admin/clearing/revenue/export?year=${year}`;
  };

  return (
    <>
      <style>{`
        .rev { background: ${LIGHT}; min-height: 100vh; font-family: ${F}; color: ${DARK}; }

        .rev-stripe {
          background: ${BLUE}; height: 4px;
        }

        .rev-page {
          max-width: 1100px; margin: 0 auto; padding: 36px 24px 80px;
        }

        .rev-header-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 28px;
        }

        .rev-title { font-size: 22px; font-weight: 700; color: ${DARK}; }
        .rev-sub   { font-size: 13px; color: #6b7280; margin-top: 2px; }

        .rev-controls {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }

        .rev-select {
          border: 1px solid #d1d5db; border-radius: 4px; padding: 6px 12px;
          font-family: ${F}; font-size: 14px; color: ${DARK}; background: #fff;
          cursor: pointer;
        }

        .rev-btn-csv {
          padding: 7px 16px; background: #fff; border: 1px solid ${BLUE};
          border-radius: 4px; color: ${BLUE}; font-family: ${F}; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: background .15s;
        }
        .rev-btn-csv:hover { background: #eef2ff; }

        .rev-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1px; background: #e5e7eb; border: 1px solid #e5e7eb;
          border-radius: 6px; overflow: hidden; margin-bottom: 28px;
        }

        .rev-kpi {
          background: #fff; padding: 20px 22px;
        }
        .rev-kpi-num {
          font-size: 26px; font-weight: 700; letter-spacing: -.5px;
          font-variant-numeric: tabular-nums;
        }
        .rev-kpi-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: .5px; margin-top: 4px;
        }

        .rev-section {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
          margin-bottom: 20px; overflow: hidden;
        }

        .rev-section-head {
          padding: 14px 22px; border-bottom: 1px solid #f3f4f6;
          font-size: 13px; font-weight: 600; color: #374151;
          text-transform: uppercase; letter-spacing: .4px;
        }

        .rev-chart-wrap { padding: 18px 22px 10px; }

        .rev-table { width: 100%; border-collapse: collapse; }
        .rev-table th {
          text-align: left; padding: 11px 16px; font-size: 11px; font-weight: 600;
          color: #6b7280; text-transform: uppercase; letter-spacing: .4px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        }
        .rev-table td {
          padding: 11px 16px; font-size: 13px; border-bottom: 1px solid #f3f4f6;
          font-variant-numeric: tabular-nums;
        }
        .rev-table tr:last-child td { border-bottom: none; }
        .rev-table tr:hover td { background: #f9fafb; }
        .rev-table .num { text-align: right; font-family: 'IBM Plex Mono', monospace; }

        .rev-loading {
          text-align: center; padding: 60px 24px; color: #6b7280; font-size: 14px;
        }
        .rev-error {
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;
          padding: 14px 18px; color: #b91c1c; font-size: 14px; margin-bottom: 20px;
        }

        @media (max-width: 520px) {
          .rev-kpi-num { font-size: 20px; }
          .rev-page    { padding: 20px 16px 60px; }
        }
      `}</style>

      <div className="rev">
        <EucxHeader />
        <div className="rev-stripe" />

        <div className="rev-page">
          <div className="rev-header-row">
            <div>
              <div className="rev-title">Revenue Dashboard</div>
              <div className="rev-sub">Plattformgebühren & Umsatzübersicht</div>
            </div>
            <div className="rev-controls">
              <select
                className="rev-select"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button className="rev-btn-csv" onClick={exportCsv}>
                CSV Export
              </button>
            </div>
          </div>

          {error && <div className="rev-error">{error}</div>}

          {loading ? (
            <div className="rev-loading">Daten werden geladen…</div>
          ) : data && (
            <>
              {/* KPI-Kacheln */}
              <div className="rev-kpis">
                <div className="rev-kpi" style={{ borderTop: `3px solid ${BLUE}` }}>
                  <div className="rev-kpi-num" style={{ color: BLUE }}>
                    € {fmt(data.totalRevenue)}
                  </div>
                  <div className="rev-kpi-label">Gesamtumsatz</div>
                </div>
                <div className="rev-kpi" style={{ borderTop: "3px solid #6b7280" }}>
                  <div className="rev-kpi-num" style={{ color: "#374151" }}>
                    € {fmt(data.vatCollected)}
                  </div>
                  <div className="rev-kpi-label">MwSt. (19%)</div>
                </div>
                <div className="rev-kpi" style={{ borderTop: "3px solid #059669" }}>
                  <div className="rev-kpi-num" style={{ color: "#059669" }}>
                    € {fmt(data.netRevenue)}
                  </div>
                  <div className="rev-kpi-label">Nettoumsatz</div>
                </div>
                <div className="rev-kpi" style={{ borderTop: "3px solid #d97706" }}>
                  <div className="rev-kpi-num" style={{ color: "#d97706" }}>
                    {data.totalTransactions.toLocaleString("de-DE")}
                  </div>
                  <div className="rev-kpi-label">Transaktionen</div>
                </div>
              </div>

              {/* Balken-Chart */}
              {chartData.length > 0 && (
                <div className="rev-section">
                  <div className="rev-section-head">Monatsübersicht {year}</div>
                  <div className="rev-chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            fontFamily: F,
                            fontSize: "13px",
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(v: any) => [`€ ${(v as number).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`, "Umsatz"]}
                        />
                        <Bar dataKey="revenue" fill={BLUE} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Monats-Detail-Tabelle */}
              {data.breakdown && data.breakdown.length > 0 && (
                <div className="rev-section">
                  <div className="rev-section-head">Monatsdetails</div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="rev-table">
                      <thead>
                        <tr>
                          <th>Monat</th>
                          <th className="num">Umsatz</th>
                          <th className="num">MwSt.</th>
                          <th className="num">Netto</th>
                          <th className="num">Trades</th>
                          <th className="num">Lots</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.breakdown.map((m) => (
                          <tr key={m.month}>
                            <td>{monthLabel(m.month)} {m.month.slice(0, 4)}</td>
                            <td className="num">€ {fmt(m.revenue)}</td>
                            <td className="num">€ {fmt(m.vat)}</td>
                            <td className="num">€ {fmt(m.netRevenue)}</td>
                            <td className="num">{m.tradeCount}</td>
                            <td className="num">{m.lotCount}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ fontWeight: 700, borderTop: `2px solid ${BLUE}` }}>
                          <td>Gesamt {year}</td>
                          <td className="num" style={{ color: BLUE }}>€ {fmt(data.totalRevenue)}</td>
                          <td className="num">€ {fmt(data.vatCollected)}</td>
                          <td className="num" style={{ color: "#059669" }}>€ {fmt(data.netRevenue)}</td>
                          <td className="num">{data.tradeCount}</td>
                          <td className="num">{data.lotCount}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
