"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { COMMODITIES, CATEGORIES, type Category, type Commodity } from "./data";
import { fmtEUR } from "@/lib/fmt";

const BLUE  = "#154194";
const GREEN = "#166534";
const RED   = "#dc2626";
const MONO  = "'IBM Plex Mono', monospace";
const SANS  = "'IBM Plex Sans', Arial, sans-serif";

function Sparkline({ data, up }: { data: number[]; up: boolean | null }) {
  const w = 96, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 6) - 3,
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = [...pts, [w, h + 2] as [number, number], [0, h + 2] as [number, number]].map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
  const color = up === null ? "#aaa" : up ? GREEN : RED;
  const gid = `g${data[0]}${data[data.length - 1]}`;
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DeltaBadge({ pct, abs }: { pct: number; abs: number }) {
  const up = pct > 0, flat = pct === 0;
  const color = flat ? "#888" : up ? GREEN : RED;
  const bg    = flat ? "#f5f5f5" : up ? "#f0fdf4" : "#fff1f1";
  const Icon  = flat ? Minus : up ? TrendingUp : TrendingDown;
  const sign  = pct > 0 ? "+" : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color, backgroundColor: bg, padding: "2px 7px" }}>
        <Icon size={10} /> {sign}{pct.toFixed(2)} %
      </span>
      <span style={{ fontSize: 10, color, fontFamily: MONO }}>{sign}{abs > 0 ? "+" : ""}{abs.toLocaleString("de-DE")} €</span>
    </div>
  );
}

function CategoryCard({ cat, items }: { cat: typeof CATEGORIES[number]; items: Commodity[] }) {
  if (cat.key === "alle") return null;
  const catItems = items.filter(c => c.category === cat.key);
  if (!catItems.length) return null;
  const avg   = catItems.reduce((s, c) => s + c.price, 0) / catItems.length;
  const avgPct = catItems.reduce((s, c) => s + c.weekChangePct, 0) / catItems.length;
  const rising = catItems.filter(c => c.weekChangePct > 0).length;
  const falling = catItems.filter(c => c.weekChangePct < 0).length;
  const up = avgPct > 0.05;
  const dn = avgPct < -0.05;

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", padding: "20px 24px", borderTop: `3px solid ${cat.color}`, flex: "1 1 220px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: "0 0 12px" }}>{cat.label}</p>
      <p style={{ fontSize: 26, fontWeight: 300, color: "#0d1b2a", fontFamily: MONO, margin: "0 0 4px", lineHeight: 1 }}>
        Ø {fmtEUR(avg)} €
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: up ? GREEN : dn ? RED : "#888" }}>
          {avgPct > 0 ? "+" : ""}{avgPct.toFixed(2)} % Woche
        </span>
        <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
        <span style={{ fontSize: 10, color: GREEN }}>{rising} ↑</span>
        <span style={{ fontSize: 10, color: RED }}>{falling} ↓</span>
      </div>
    </div>
  );
}

export function PriceTable() {
  const [active, setActive] = useState<Category | "alle">("alle");

  const filtered = active === "alle" ? COMMODITIES : COMMODITIES.filter(c => c.category === active);

  return (
    <div style={{ fontFamily: SANS }}>

      {/* ── Kategorie-KPI ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, backgroundColor: "#e0e4ec", marginBottom: 32 }}>
        {CATEGORIES.filter(c => c.key !== "alle").map(cat => (
          <CategoryCard key={cat.key} cat={cat} items={COMMODITIES} />
        ))}
      </div>

      {/* ── Filter-Tabs ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "2px solid #f0f0f0", marginBottom: 0 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setActive(cat.key as Category | "alle")}
            style={{
              padding: "11px 18px", fontSize: 12, fontWeight: active === cat.key ? 700 : 400,
              color: active === cat.key ? BLUE : "#505050",
              borderBottom: active === cat.key ? `2px solid ${BLUE}` : "2px solid transparent",
              backgroundColor: "transparent", border: "none",
              cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.02em", marginBottom: -2,
            }}>
            {cat.label}
            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: active === cat.key ? BLUE : "#bbb", backgroundColor: active === cat.key ? "#eef2fb" : "transparent", padding: "1px 5px" }}>
              {cat.key === "alle" ? COMMODITIES.length : COMMODITIES.filter(c => c.category === cat.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Preistabelle ─────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", borderTop: "none", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS }}>
          <thead>
            <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
              {["Rohstoff", "Spezifikation", "Preis", "Woche Δ", "30-Tage-Chart", "Monat H / T", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "11px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.1em", color: "#888",
                  textAlign: i >= 2 && i <= 4 ? "right" : i === 5 ? "center" : "left",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => {
              const up = c.weekChangePct > 0.05;
              const dn = c.weekChangePct < -0.05;
              const CAT = CATEGORIES.find(k => k.key === c.category)!;
              return (
                <tr key={c.id}
                  style={{ borderBottom: "1px solid #f5f5f5", transition: "background .1s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafbff")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

                  {/* Rohstoff */}
                  <td style={{ padding: "14px 16px", minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 30, backgroundColor: CAT.color, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{c.name}</p>
                        <p style={{ fontSize: 10, color: "#aaa", margin: "2px 0 0", letterSpacing: "0.04em" }}>{CAT.label}</p>
                      </div>
                    </div>
                  </td>

                  {/* Spezifikation */}
                  <td style={{ padding: "14px 16px", fontSize: 11, color: "#888", fontFamily: MONO, minWidth: 160 }}>{c.spec}</td>

                  {/* Preis */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#0d1b2a", fontFamily: MONO, margin: 0, lineHeight: 1 }}>
                      {fmtEUR(c.price)} €
                    </p>
                    <p style={{ fontSize: 10, color: "#aaa", margin: "3px 0 0", fontFamily: MONO }}>/{c.unit}</p>
                  </td>

                  {/* Woche Δ */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <DeltaBadge pct={c.weekChangePct} abs={c.weekChange} />
                  </td>

                  {/* Sparkline */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Sparkline data={c.history} up={c.weekChangePct > 0.05 ? true : c.weekChangePct < -0.05 ? false : null} />
                  </td>

                  {/* Monat H/T */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 11, fontFamily: MONO, color: GREEN, margin: 0, fontWeight: 600 }}>H {fmtEUR(c.monthHigh)}</p>
                    <p style={{ fontSize: 11, fontFamily: MONO, color: RED,   margin: "3px 0 0", fontWeight: 600 }}>T {fmtEUR(c.monthLow)}</p>
                  </td>

                  {/* CTA */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Link href="/register" style={{
                      display: "inline-flex", alignItems: "center", height: 28, padding: "0 12px",
                      backgroundColor: BLUE, color: "#fff", fontSize: 11, fontWeight: 700,
                      textDecoration: "none", letterSpacing: "0.04em", whiteSpace: "nowrap",
                    }}>
                      Handeln →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Hinweis ──────────────────────────────────────────────────────── */}
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 12, lineHeight: 1.6 }}>
        Alle Preise in EUR (netto), frei Lager Deutschland. Richtpreise auf Basis der letzten EUCX-Sitzungen.
        Aktualisierung: werktäglich 08:00 Uhr. Keine Anlageberatung.
      </p>
    </div>
  );
}
