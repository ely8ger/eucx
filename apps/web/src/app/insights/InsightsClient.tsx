"use client";

import { useState } from "react";
import { SECTIONS_META, LEXIKON, AKADEMIE_ARTIKEL } from "./data";
import { SiteNav }    from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const BLUE = "#154194";
const BLUE2 = "#0f3070";
const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const DARK = "#0d1b2a";

// ─── Section Card (4 Hauptbereiche) ──────────────────────────────────────────
function SectionCard({ s }: { s: typeof SECTIONS_META[number] }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={s.href}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        backgroundColor: hov ? s.color : "#fff",
        padding: "28px 28px 32px",
        borderTop: `3px solid ${s.color}`,
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 8px 28px rgba(0,0,0,.13)` : "none",
        transition: "background .2s, transform .2s, box-shadow .2s",
        height: "100%",
        boxSizing: "border-box" as const,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          color: hov ? "rgba(255,255,255,.7)" : s.color,
          margin: "0 0 12px",
          transition: "color .2s",
        }}>
          {s.label}
        </p>
        <p style={{
          fontSize: 14, lineHeight: 1.7, margin: "0 0 20px",
          color: hov ? "rgba(255,255,255,.85)" : "#505050",
          transition: "color .2s",
        }}>
          {s.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: hov ? "#fff" : s.color,
            transition: "color .2s, transform .2s",
            display: "inline-block",
            transform: hov ? "translateX(4px)" : "translateX(0)",
          }}>
            Öffnen →
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Lexikon Card ─────────────────────────────────────────────────────────────
function LexikonCard({ entry }: { entry: typeof LEXIKON[number] }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`/insights/lexikon/${entry.slug}`}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <article style={{
        backgroundColor: "#fff",
        padding: "20px 24px",
        borderLeft: `3px solid ${hov ? BLUE : "transparent"}`,
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov ? "0 4px 16px rgba(21,65,148,.1)" : "none",
        transition: "border-color .18s, transform .18s, box-shadow .18s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: BLUE,
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
          }}>
            {entry.category}
          </span>
          <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
          <span style={{ fontSize: 10, color: "#bbb", fontFamily: MONO }}>
            {entry.readMin} min
          </span>
        </div>
        <h3 style={{
          fontSize: 14, fontWeight: 700, margin: "0 0 6px",
          color: hov ? BLUE : DARK,
          transition: "color .18s",
        }}>
          {entry.term}
        </h3>
        <p style={{ fontSize: 12, color: "#666", lineHeight: 1.65, margin: 0 }}>
          {entry.shortDef}
        </p>
      </article>
    </a>
  );
}

// ─── Akademie Card ────────────────────────────────────────────────────────────
function AkademieCard({ a }: { a: typeof AKADEMIE_ARTIKEL[number] }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`/insights/akademie/${a.slug}`}
      style={{ textDecoration: "none", display: "block", marginBottom: 2 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <article style={{
        backgroundColor: "#fff",
        border: `1px solid ${hov ? "#d4a574" : "#e8e8e8"}`,
        borderLeft: `3px solid ${hov ? "#92400e" : "#e8e8e8"}`,
        padding: "24px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24,
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov ? "0 6px 20px rgba(146,64,14,.12)" : "none",
        transition: "border-color .18s, transform .18s, box-shadow .18s",
      }}>
        <div>
          <p style={{
            fontSize: 10, fontWeight: 700, color: "#92400e",
            letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px",
          }}>
            Leitfaden · {a.readMin} min
          </p>
          <h3 style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 6px",
            color: hov ? "#92400e" : DARK,
            transition: "color .18s",
          }}>
            {a.title}
          </h3>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, margin: 0, maxWidth: 640 }}>
            {a.description}
          </p>
        </div>
        <span style={{
          fontSize: 22, flexShrink: 0,
          color: hov ? "#92400e" : "#e0e4ec",
          transform: hov ? "translateX(6px)" : "translateX(0)",
          transition: "color .18s, transform .18s",
          display: "inline-block",
        }}>→</span>
      </article>
    </a>
  );
}

// ─── Live Ticker ──────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: "Betonstahl B500B", price: "548 €/t", change: "+1.2%", up: true },
  { label: "Walzdraht SAE1006", price: "512 €/t", change: "+0.8%", up: true },
  { label: "Harnstoff 46%", price: "312 €/t", change: "-0.4%", up: false },
  { label: "NPK 15-15-15", price: "398 €/t", change: "+0.3%", up: true },
  { label: "Kupfer LME", price: "9.214 €/t", change: "+1.9%", up: true },
  { label: "DAP 18-46", price: "541 €/t", change: "-0.7%", up: false },
  { label: "Aluminium LME", price: "2.348 €/t", change: "+0.5%", up: true },
  { label: "Schrott HMS 1/2", price: "385 €/t", change: "-1.1%", up: false },
];

function LiveTicker() {
  return (
    <div style={{
      backgroundColor: "#0d1b2a", borderBottom: "1px solid #1e3352",
      overflow: "hidden", height: 36,
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        display: "inline-flex", gap: 0,
        animation: "ticker 30s linear infinite",
        whiteSpace: "nowrap" as const,
      }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{
            padding: "0 24px", fontSize: 11, fontFamily: MONO,
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRight: "1px solid #1e3352",
          }}>
            <span style={{ color: "rgba(255,255,255,.5)" }}>{item.label}</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{item.price}</span>
            <span style={{ color: item.up ? "#34d399" : "#f87171", fontWeight: 600 }}>
              {item.up ? "▲" : "▼"} {item.change}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "32+",    label: "Lexikon-Einträge" },
    { value: "18+",    label: "Akademie-Artikel" },
    { value: "8",      label: "Rohstoffkategorien" },
    { value: "wöchentlich", label: "Marktanalysen" },
  ];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      borderBottom: "1px solid #1e3352",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: "20px 28px",
          borderRight: i < stats.length - 1 ? "1px solid #1e3352" : "none",
        }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: MONO }}>{s.value}</p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.06em" }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function InsightsClient() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "EUCX Marktwissen & Insights",
          description: "Wissenshub für professionellen Rohstoffhandel.",
          url: "https://eucx.eu/insights",
          publisher: { "@type": "Organization", name: "EUCX", url: "https://eucx.eu" },
        })}}
      />

      <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: DARK, minHeight: "100vh" }}>
        <SiteNav activeHref="/insights" />
        <LiveTicker />

        {/* Hero */}
        <div style={{ backgroundColor: DARK, padding: "52px 24px 0" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 16, letterSpacing: "0.06em" }}>
              <a href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</a>
              {" / "}
              <span style={{ color: "#7aa4d4" }}>Marktwissen & Insights</span>
            </p>
            <h1 style={{ fontSize: 42, fontWeight: 300, color: "#fff", margin: "0 0 14px", lineHeight: 1.1 }}>
              Marktwissen &<br /><strong style={{ fontWeight: 700 }}>Insights</strong>
            </h1>
            <p style={{ fontSize: 15, color: "#8aa8cc", maxWidth: 560, lineHeight: 1.7, margin: "0 0 40px" }}>
              Rohstoff-Lexikon, Marktanalysen, Händler-Akademie und EU-Regulatorik — für professionelle B2B-Handelsteilnehmer.
            </p>
            <StatsBar />
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px" }}>

          {/* 4 Hauptbereiche */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2,
            backgroundColor: "#e0e4ec",
            marginBottom: 64,
          }}>
            {SECTIONS_META.map((s) => (
              <SectionCard key={s.key} s={s} />
            ))}
          </div>

          {/* Lexikon */}
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
                <h2 style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase" as const, color: "#888", margin: 0,
                }}>
                  Rohstoff-Lexikon
                </h2>
              </div>
              <a href="/insights/lexikon" style={{
                fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 600,
                transition: "color .15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = BLUE2)}
                onMouseLeave={e => (e.currentTarget.style.color = BLUE)}
              >
                Alle Einträge →
              </a>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 2,
              backgroundColor: "#e0e4ec",
            }}>
              {LEXIKON.map((entry) => (
                <LexikonCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </section>

          {/* Akademie */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, backgroundColor: "#92400e" }} />
              <h2 style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase" as const, color: "#888", margin: 0,
              }}>
                Händler-Akademie
              </h2>
            </div>
            {AKADEMIE_ARTIKEL.map((a) => (
              <AkademieCard key={a.slug} a={a} />
            ))}
          </section>

        </div>
        <SiteFooter />
      </div>
    </>
  );
}
