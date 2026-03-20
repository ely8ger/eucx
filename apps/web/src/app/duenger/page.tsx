"use client";

import React from "react";
import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { FERTILIZER_CATEGORIES } from "@/lib/fertilizer/data";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function IconKalium() {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* Kristallgitter – Kaliumchlorid-Würfelstruktur */}
    <rect x={12} y={16} width={22} height={22} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <rect x={18} y={22} width={10} height={10} fill="#c5d0de"/>
    <rect x={36} y={16} width={22} height={22} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <rect x={42} y={22} width={10} height={10} fill="#c5d0de"/>
    <rect x={24} y={6}  width={22} height={22} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <rect x={30} y={12} width={10} height={10} fill="#c5d0de"/>
    <rect x={24} y={32} width={22} height={22} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <rect x={30} y={38} width={10} height={10} fill="#c5d0de"/>
  </svg>;
}

function IconNPK() {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* Drei Granulat-Kugeln N P K */}
    <circle cx={20} cy={32} r={14} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={20} cy={32} r={8}  fill="#c5d0de"/>
    <circle cx={40} cy={20} r={14} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={40} cy={20} r={8}  fill="#c5d0de"/>
    <circle cx={60} cy={32} r={14} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={60} cy={32} r={8}  fill="#c5d0de"/>
  </svg>;
}

function IconStickstoff() {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* Prills – runde Granulate */}
    <circle cx={22} cy={22} r={11} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={22} cy={22} r={6}  fill="#c5d0de"/>
    <circle cx={46} cy={18} r={11} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={46} cy={18} r={6}  fill="#c5d0de"/>
    <circle cx={34} cy={40} r={11} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={34} cy={40} r={6}  fill="#c5d0de"/>
    <circle cx={63} cy={38} r={9}  fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <circle cx={63} cy={38} r={5}  fill="#c5d0de"/>
  </svg>;
}

function IconPhosphor() {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* Granulat – unregelmäßige Körner */}
    <polygon points="14,18 28,12 36,22 26,32 12,28" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="18,20 27,15 33,22 25,29 16,26" fill="#c5d0de"/>
    <polygon points="36,14 52,10 58,24 46,30 32,24" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="40,17 50,13 55,23 45,28 37,23" fill="#c5d0de"/>
    <polygon points="20,34 38,30 44,44 30,50 16,44" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="24,36 36,33 41,43 30,47 20,42" fill="#c5d0de"/>
    <polygon points="46,36 60,32 66,46 54,52 42,44" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="49,38 58,35 63,45 53,49 45,43" fill="#c5d0de"/>
  </svg>;
}

const ICONS: Record<string, () => React.ReactElement> = {
  "kaliumduenger":    IconKalium,
  "npk-duenger":      IconNPK,
  "stickstoffduenger":IconStickstoff,
  "phosphorduenger":  IconPhosphor,
};

export default function DuengerPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: F }}>

      {/* ── Kopfzeile ─────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: "#0b1e36", borderBottom: "1px solid #1e3352" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <EucxLogo variant="dark" size="md" />
          </Link>
          <Link href="/trading" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>
            Zum Handelsraum →
          </Link>
        </div>
      </header>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#888" }}>
          <Link href="/"       style={{ color: "#888", textDecoration: "none" }}>Startseite</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>Dünger & Agrarchemie</span>
        </div>
      </div>

      {/* ── Seitentitel ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 24, borderBottom: "1px solid #dde2ea" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: BLUE, display: "block", marginBottom: 8 }}>DÜNGER · AGRARCHEMIE</span>
            <h1 style={{ fontSize: 28, fontWeight: 300, color: "#0d1b2a", margin: 0, lineHeight: 1.2 }}>Katalog 2026</h1>
            <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>4 Produktkategorien · 10 Produkte · Institutioneller Agrarhandel auf EUCX</p>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#666" }}>
            <span>✓ BaFin-reguliert</span>
            <span>✓ EU-Verordnung 2019/1009</span>
            <span>✓ Sofortige Abwicklung</span>
          </div>
        </div>
      </div>

      {/* ── 4 Kategorien Grid ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 1,
          backgroundColor: "#dde2ea",
        }}>
          {FERTILIZER_CATEGORIES.map(cat => {
            const Icon = ICONS[cat.id] ?? IconKalium;
            const count = cat.products.length;
            return (
              <Link key={cat.id} href={`/duenger/${cat.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    backgroundColor: "#fff",
                    padding: "32px 24px 24px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                    cursor: "pointer", transition: "background .15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f0f4fb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff"; }}
                >
                  <Icon />
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0d1b2a", display: "block", marginBottom: 6 }}>{cat.label}</span>
                    <span style={{ fontSize: 11, color: "#888" }}>{count} Produkt{count !== 1 ? "e" : ""}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
