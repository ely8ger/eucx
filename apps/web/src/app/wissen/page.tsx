import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, CATEGORIES } from "./articles";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Wissen - Rohstoffhandel, Stahl und Marktstrukturen",
  description:
    "Umfassende Wissensdatenbank zu europaeischem Rohstoffhandel: Stahl, Metalle, OTF-Regulierung, Incoterms, KYC/AML, Orderbuch-Mechanik und Nachhaltigkeit.",
  robots: { index: true, follow: true },
};

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const TEXT = "#0d1b2a";
const MUTED= "#7a8aa0";
const BG   = "#f7f9fc";
const BORDER = "#d4d8e0";

const CATEGORY_COLORS: Record<string, string> = {
  "Markt":       "#154194",
  "Regulierung": "#b45309",
  "Produkte":    "#166534",
  "Praxis":      "#7c3aed",
  "Handel":      "#0e7490",
  "ESG":         "#047857",
};

export default function WissenPage() {
  return (
    <main style={{ fontFamily: F, backgroundColor: BG, minHeight: "100vh" }}>

      {/* ── Header — Standard SiteNav ──────────────────────────────────────── */}
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: BLUE, paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", fontFamily: F, marginBottom: 14 }}>
            EUCX Wissenszentrum
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: "#fff", fontFamily: F, margin: 0, lineHeight: 1.2, maxWidth: 640 }}>
            Rohstoffhandel verstehen
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.7)", fontFamily: F, marginTop: 16, marginBottom: 0, maxWidth: 580, lineHeight: 1.6 }}>
            Fundiertes Wissen zu Maerkten, Regulierung, Produkten und Handelspraxis -
            aufbereitet fuer institutionelle Marktteilnehmer.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" as const }}>
            <div style={{ textAlign: "center" as const }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: F, margin: 0 }}>{ARTICLES.length}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: F, margin: 0 }}>Artikel</p>
            </div>
            <div style={{ width: 1, backgroundColor: "rgba(255,255,255,.15)" }} />
            <div style={{ textAlign: "center" as const }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: F, margin: 0 }}>{CATEGORIES.length}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: F, margin: 0 }}>Kategorien</p>
            </div>
            <div style={{ width: 1, backgroundColor: "rgba(255,255,255,.15)" }} />
            <div style={{ textAlign: "center" as const }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: F, margin: 0 }}>
                {ARTICLES.reduce((s, a) => s + a.readMin, 0)}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: F, margin: 0 }}>Leseminuten</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Artikel-Grid ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px" }}>

        {/* Kategorien */}
        {CATEGORIES.map((cat) => (
          <div key={cat} style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: `2px solid ${CATEGORY_COLORS[cat] ?? BLUE}`, paddingBottom: 12 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase" as const, color: CATEGORY_COLORS[cat] ?? BLUE, fontFamily: F,
              }}>
                {cat}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {ARTICLES.filter((a) => a.category === cat).map((article) => (
                <Link key={article.slug} href={`/wissen/${article.slug}`} style={{ textDecoration: "none" }}>
                  <div className="wissen-card" style={{
                    backgroundColor: "#fff",
                    border: `1px solid ${BORDER}`,
                    padding: "24px 24px 20px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column" as const,
                    cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                        textTransform: "uppercase" as const, color: CATEGORY_COLORS[cat] ?? BLUE, fontFamily: F,
                        backgroundColor: `${CATEGORY_COLORS[cat] ?? BLUE}14`,
                        padding: "2px 8px",
                      }}>
                        {cat}
                      </span>
                      <span style={{ fontSize: 11, color: MUTED, fontFamily: F }}>
                        {article.readMin} Min.
                      </span>
                    </div>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: TEXT, fontFamily: F, margin: "0 0 10px", lineHeight: 1.4 }}>
                      {article.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "#555", fontFamily: F, lineHeight: 1.6, margin: 0, flexGrow: 1 }}>
                      {article.description}
                    </p>
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, color: BLUE }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: F }}>Artikel lesen</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          backgroundColor: BLUE, padding: "40px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap" as const, gap: 24, marginTop: 16,
        }}>
          <div>
            <p style={{ fontSize: 19, fontWeight: 300, color: "#fff", fontFamily: F, margin: 0 }}>
              Bereit zum Handeln?
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", fontFamily: F, marginTop: 6, marginBottom: 0 }}>
              Institutioneller Zugang zur EUCX-Handelsplattform - reguliert, sicher, transparent.
            </p>
          </div>
          <Link href="/register" style={{
            backgroundColor: "#fff", color: BLUE,
            padding: "12px 28px", fontWeight: 700, fontFamily: F, fontSize: 14,
            textDecoration: "none", whiteSpace: "nowrap" as const,
            display: "inline-block",
          }}>
            Zugang beantragen
          </Link>
        </div>
      </div>
    </main>
  );
}
