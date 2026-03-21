"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { FERTILIZER_CATEGORIES, getFertiProduct, getFertiCategory } from "@/lib/fertilizer/data";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";
const fill2  = "#dce3ed";
const fill   = "#c5d0de";
const stroke = "#9aabbc";

// ─── Produkt-Thumbnails (groß, 180×180) ──────────────────────────────────────

function ThumbGranulatLg() {
  return <svg width={180} height={180} viewBox="0 0 180 180">
    <circle cx={50}  cy={55}  r={32} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={50}  cy={55}  r={18} fill={fill}/>
    <circle cx={115} cy={45}  r={32} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={115} cy={45}  r={18} fill={fill}/>
    <circle cx={82}  cy={115} r={32} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={82}  cy={115} r={18} fill={fill}/>
    <circle cx={148} cy={120} r={25} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={148} cy={120} r={14} fill={fill}/>
    <circle cx={30}  cy={130} r={25} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={30}  cy={130} r={14} fill={fill}/>
  </svg>;
}

function ThumbPulverLg() {
  return <svg width={180} height={180} viewBox="0 0 180 180">
    <ellipse cx={90} cy={140} rx={75} ry={20} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <path d="M15,140 Q22,70 90,48 Q158,70 165,140 Z" fill={fill2} stroke={stroke} strokeWidth={2}/>
    <path d="M35,140 Q42,80 90,62 Q138,80 145,140 Z" fill={fill}/>
    <circle cx={48}  cy={42} r={5} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={132} cy={34} r={4} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={155} cy={60} r={4} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={24}  cy={72} r={3} fill={fill2} stroke={stroke} strokeWidth={1.2}/>
  </svg>;
}

function ThumbPrillsLg() {
  return <svg width={180} height={180} viewBox="0 0 180 180">
    {[
      [38,30],[88,22],[138,30],
      [62,72],[112,68],[158,78],
      [30,112],[80,106],[130,112],[168,118],
      [48,152],[100,148],[152,152],
    ].map(([cx,cy],i) => {
      const r = i < 3 ? 24 : i < 7 ? 22 : 20;
      return <g key={i}>
        <circle cx={cx} cy={cy} r={r} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
        <circle cx={cx} cy={cy} r={r*0.55} fill={fill}/>
      </g>;
    })}
  </svg>;
}

function ThumbKristalleIg() {
  return <svg width={180} height={180} viewBox="0 0 180 180">
    {/* Kristall 1 */}
    <polygon points="20,30 60,20 80,52 40,62"  fill={fill2} stroke={stroke} strokeWidth={2}/>
    <polygon points="40,62 80,52 80,90 40,100" fill={fill}  stroke={stroke} strokeWidth={1.5}/>
    <polygon points="20,30 40,62 40,100 20,68"  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    {/* Kristall 2 */}
    <polygon points="90,15 140,5  160,42 110,52" fill={fill2} stroke={stroke} strokeWidth={2}/>
    <polygon points="110,52 160,42 160,80 110,90" fill={fill}  stroke={stroke} strokeWidth={1.5}/>
    <polygon points="90,15 110,52 110,90 90,53"  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    {/* Kristall 3 */}
    <polygon points="30,110 75,100 95,130 50,140"  fill={fill2} stroke={stroke} strokeWidth={2}/>
    <polygon points="50,140 95,130 95,165 50,175"  fill={fill}  stroke={stroke} strokeWidth={1.5}/>
    <polygon points="30,110 50,140 50,175 30,145"  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    {/* Kristall 4 */}
    <polygon points="105,95 150,85 168,118 123,128" fill={fill2} stroke={stroke} strokeWidth={2}/>
    <polygon points="123,128 168,118 168,155 123,165" fill={fill}  stroke={stroke} strokeWidth={1.5}/>
    <polygon points="105,95 123,128 123,165 105,132"  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
  </svg>;
}

function ThumbNPKLg() {
  return <svg width={180} height={180} viewBox="0 0 180 180">
    <circle cx={55}  cy={80}  r={42} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={55}  cy={80}  r={24} fill={fill}/>
    <circle cx={130} cy={60}  r={36} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={130} cy={60}  r={20} fill={fill}/>
    <circle cx={118} cy={132} r={36} fill={fill2} stroke={stroke} strokeWidth={2}/>
    <circle cx={118} cy={132} r={20} fill={fill}/>
  </svg>;
}

function ProductThumbLg({ physForm, id }: { physForm: string[]; id: string }) {
  if (id.startsWith("npk-"))                                           return <ThumbNPKLg />;
  if (id === "dap-18-46" || id === "harnstoff-46" || id === "ammoniumnitrat") return <ThumbPrillsLg />;
  if (physForm.includes("Kristalle"))                                  return <ThumbKristalleIg />;
  if (physForm.includes("Pulver") && !physForm.includes("Granulat"))  return <ThumbPulverLg />;
  if (physForm.includes("Prills"))                                     return <ThumbPrillsLg />;
  return <ThumbGranulatLg />;
}

// ─── Seite ────────────────────────────────────────────────────────────────────

export default function ProduktPage() {
  const params    = useParams();
  const katId     = typeof params.kategorie === "string" ? params.kategorie : "";
  const produktId = typeof params.produkt   === "string" ? params.produkt   : "";
  const kategorie = getFertiCategory(katId);
  const produkt   = getFertiProduct(katId, produktId);

  if (!produkt || !kategorie) {
    return (
      <div style={{ fontFamily: F, padding: 64, textAlign: "center", color: "#666" }}>
        Produkt nicht gefunden. <Link href="/duenger" style={{ color: BLUE }}>Zurück zur Übersicht</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: F }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
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

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#888", flexWrap: "wrap" }}>
          <Link href="/"                          style={{ color: "#888", textDecoration: "none" }}>Startseite</Link>
          <span>›</span>
          <Link href="/duenger"                   style={{ color: "#888", textDecoration: "none" }}>Dünger & Agrarchemie</Link>
          <span>›</span>
          <Link href={`/duenger/${katId}`}        style={{ color: "#888", textDecoration: "none" }}>{kategorie.label}</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>{produkt.name}</span>
        </div>
      </div>

      {/* ── Hauptinhalt ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "32px auto 64px", padding: "0 32px" }}>

        {/* ── Oberer Block: Bild + Technisches Datenblatt ─────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32, marginBottom: 32, alignItems: "start" }}>

          {/* Produkt-Illustration */}
          <div>
            <div style={{
              backgroundColor: "#fff", border: "1px solid #dde2ea",
              padding: 24, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <ProductThumbLg physForm={produkt.physForm} id={produkt.id} />
            </div>
            {/* Handeln-Button */}
            <Link href="/trading" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 44, backgroundColor: BLUE, color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: F,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0f3070"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = BLUE; }}
            >
              Jetzt handeln →
            </Link>
          </div>

          {/* Technisches Datenblatt */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #dde2ea", backgroundColor: "#f8f9fb" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>
                Technisches Datenblatt
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {produkt.technischeDaten.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f2f5" }}>
                    <td style={{
                      padding: "12px 24px", fontSize: 13, fontWeight: 600, color: "#333",
                      width: "55%", verticalAlign: "top",
                      backgroundColor: i % 2 === 0 ? "#fafbfc" : "#fff",
                    }}>
                      {row.label}
                    </td>
                    <td style={{
                      padding: "12px 24px", fontSize: 13, color: "#0d1b2a",
                      backgroundColor: i % 2 === 0 ? "#fafbfc" : "#fff",
                    }}>
                      {row.wert}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Produktbeschreibung ──────────────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea", marginBottom: 24 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #dde2ea", backgroundColor: "#f8f9fb" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>
              Produktbeschreibung
            </span>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 400, color: "#0d1b2a", margin: 0 }}>{produkt.name}</h1>
              <span style={{ fontSize: 14, color: "#888", fontStyle: "italic" }}>{produkt.formel}</span>
              <span style={{ fontSize: 13, color: BLUE, fontWeight: 600 }}>{produkt.naehrstoffe}</span>
            </div>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: 0, maxWidth: 800 }}>
              {produkt.beschreibung}
            </p>
          </div>
        </div>

        {/* ── Verpackung ───────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea", marginBottom: 24 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #dde2ea", backgroundColor: "#f8f9fb" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>
              Verpackung
            </span>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {produkt.verpackung.map(v => (
              <div key={v} style={{
                display: "flex", alignItems: "center", gap: 10,
                border: "1px solid #dde2ea", padding: "12px 18px",
                backgroundColor: "#fafbfc",
              }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth={1.5}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <span style={{ fontSize: 13, color: "#0d1b2a", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Zertifizierungen ─────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea", marginBottom: 40 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #dde2ea", backgroundColor: "#f8f9fb" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>
              Normen & Zertifizierungen
            </span>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
            {produkt.zertifizierung.map(z => (
              <span key={z} style={{
                fontSize: 12, padding: "6px 14px", fontWeight: 600,
                border: "1px solid #154194", color: BLUE, backgroundColor: "#eef2fb",
              }}>{z}</span>
            ))}
          </div>
        </div>

        {/* ── Zurück-Link ──────────────────────────────────────────────── */}
        <Link href={`/duenger/${katId}`} style={{
          fontSize: 13, color: BLUE, textDecoration: "none", fontWeight: 500,
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          ← Zurück zu {kategorie.label}
        </Link>
      </div>
    </div>
  );
}
