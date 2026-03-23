import type { Metadata } from "next";
import Link from "next/link";
import { LEXIKON } from "../data";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Rohstoff-Lexikon — Definitionen, Normen, Preise | EUCX",
  description: "Das Rohstoff-Lexikon der EUCX: Definitionen, Normen und Preishintergründe für Stahl, Schrott, Düngemittel, Holz und EU-Regulatorik.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://eucx.eu/insights/lexikon" },
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

export default function LexikonPage() {
  const byCategory = LEXIKON.reduce<Record<string, typeof LEXIKON>>((acc, e) => {
    acc[e.category] = [...(acc[e.category] || []), e];
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>
      <SiteNav activeHref="/insights" />
      <div style={{ backgroundColor: "#0d1b2a", padding: "48px 24px 44px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>{" / "}
            <span style={{ color: "#7aa4d4" }}>Rohstoff-Lexikon</span>
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: "#fff", margin: "0 0 10px" }}>
            Rohstoff-<strong style={{ fontWeight: 700 }}>Lexikon</strong>
          </h1>
          <p style={{ fontSize: 14, color: "#8aa8cc", maxWidth: 500, lineHeight: 1.7, margin: 0 }}>
            {LEXIKON.length} Einträge · Definitionen, Normen und Preishintergründe.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px" }}>
        {Object.entries(byCategory).map(([cat, entries]) => (
          <section key={cat} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 3, height: 14, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#888", margin: 0 }}>{cat}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2, backgroundColor: "#e0e4ec" }}>
              {entries.map(entry => (
                <Link key={entry.slug} href={`/insights/lexikon/${entry.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <article style={{ backgroundColor: "#fff", padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>{entry.term}</h3>
                      <span style={{ fontSize: 11, color: "#bbb" }}>{entry.readMin} min</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#666", lineHeight: 1.65, margin: 0 }}>{entry.shortDef}</p>
                    {entry.norm && <p style={{ fontSize: 10, fontFamily: MONO, color: BLUE, margin: "8px 0 0", fontWeight: 600 }}>{entry.norm}</p>}
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <SiteFooter />
    </div>
  );
}
