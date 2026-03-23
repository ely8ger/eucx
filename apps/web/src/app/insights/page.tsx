import type { Metadata } from "next";
import Link from "next/link";
import { SECTIONS_META, LEXIKON, AKADEMIE_ARTIKEL } from "./data";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Marktwissen & Insights — Rohstoff-Lexikon, Marktanalysen | EUCX",
  description: "Rohstoff-Lexikon, wöchentliche Marktanalysen, Händler-Akademie und EU-Regulatorik — für professionelle B2B-Handelsteilnehmer.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://eucx.eu/insights" },
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

export default function InsightsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "EUCX Marktwissen & Insights",
        description: "Wissenshub für professionellen Rohstoffhandel.",
        url: "https://eucx.eu/insights",
        publisher: { "@type": "Organization", name: "EUCX", url: "https://eucx.eu" },
      })}} />
      <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>
        <SiteNav activeHref="/insights" />

        <div style={{ backgroundColor: "#0d1b2a", padding: "56px 24px 52px" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 16, letterSpacing: "0.06em" }}>
              <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
              <span style={{ color: "#7aa4d4" }}>Marktwissen & Insights</span>
            </p>
            <h1 style={{ fontSize: 42, fontWeight: 300, color: "#fff", margin: "0 0 14px", lineHeight: 1.1 }}>
              Marktwissen &<br /><strong style={{ fontWeight: 700 }}>Insights</strong>
            </h1>
            <p style={{ fontSize: 15, color: "#8aa8cc", maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
              Rohstoff-Lexikon, Marktanalysen, Händler-Akademie und EU-Regulatorik — für professionelle B2B-Handelsteilnehmer.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2, backgroundColor: "#e0e4ec", marginBottom: 64 }}>
            {SECTIONS_META.map(s => (
              <Link key={s.key} href={s.href} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ backgroundColor: "#fff", padding: "28px 28px 32px", borderTop: `3px solid ${s.color}` }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: s.color, margin: "0 0 12px" }}>{s.label}</p>
                  <p style={{ fontSize: 14, color: "#505050", lineHeight: 1.7, margin: "0 0 16px" }}>{s.desc}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: s.color, margin: 0 }}>Öffnen →</p>
                </div>
              </Link>
            ))}
          </div>

          <section style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
                <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#888", margin: 0 }}>Rohstoff-Lexikon</h2>
              </div>
              <Link href="/insights/lexikon" style={{ fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 600 }}>Alle Einträge →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2, backgroundColor: "#e0e4ec" }}>
              {LEXIKON.map(entry => (
                <Link key={entry.slug} href={`/insights/lexikon/${entry.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <article style={{ backgroundColor: "#fff", padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{entry.category}</span>
                      <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
                      <span style={{ fontSize: 10, color: "#bbb", fontFamily: MONO }}>{entry.readMin} min</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 6px" }}>{entry.term}</h3>
                    <p style={{ fontSize: 12, color: "#666", lineHeight: 1.65, margin: 0 }}>{entry.shortDef}</p>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, backgroundColor: "#92400e" }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#888", margin: 0 }}>Händler-Akademie</h2>
            </div>
            {AKADEMIE_ARTIKEL.map(a => (
              <Link key={a.slug} href={`/insights/akademie/${a.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <article style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#92400e", letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>
                      Leitfaden · {a.readMin} min
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: "0 0 6px" }}>{a.title}</h3>
                    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, margin: 0, maxWidth: 640 }}>{a.description}</p>
                  </div>
                  <span style={{ fontSize: 22, color: "#e0e4ec", flexShrink: 0 }}>→</span>
                </article>
              </Link>
            ))}
          </section>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
