import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LEXIKON } from "@/app/insights/data";
import { LexikonClient } from "./LexikonClient";

export const metadata = {
  title: "Rohstoff-Lexikon A–Z | EUCX",
  description:
    "Das umfassende Rohstoff-Lexikon der EUCX: LME-Notierung, Incoterms 2020, CBAM, MiFID II OTF, Abwicklungsgarantie, Betonstahl und mehr. Definitionen für den institutionellen EU-Rohstoffhandel.",
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

export default function LexikonPage() {
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>
      <SiteNav activeHref="/insights" />

      {/* Hero */}
      <div style={{ backgroundColor: "#0d1b2a", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>
            {" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>
            {" / "}
            <span style={{ color: "#7aa4d4" }}>Rohstoff-Lexikon</span>
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 300, color: "#fff", margin: "0 0 12px" }}>
            Rohstoff-<strong style={{ fontWeight: 700 }}>Lexikon</strong>
          </h1>
          <p style={{ fontSize: 15, color: "#8aa8cc", margin: "0 0 28px", lineHeight: 1.6 }}>
            A–Z Definitionen für den institutionellen Rohstoffhandel in der EU
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <span style={{ backgroundColor: "rgba(21,65,148,0.35)", color: "#a8c4f0", fontSize: 12, fontWeight: 700, padding: "6px 14px", letterSpacing: "0.06em" }}>
              {LEXIKON.length} Einträge
            </span>
            <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#8aa8cc", fontSize: 12, padding: "6px 14px" }}>
              Laufend erweitert
            </span>
            <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#8aa8cc", fontSize: 12, padding: "6px 14px" }}>
              Fachlich geprüft
            </span>
          </div>
        </div>
      </div>

      {/* Suchhinweis-Banner */}
      <div style={{ backgroundColor: "#eef2fb", borderBottom: "1px solid #d0daf5", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", fontSize: 13, color: "#2d4a8a", lineHeight: 1.5 }}>
          Nutzen Sie <strong>Strg+F</strong> / <strong>⌘+F</strong> um nach Begriffen zu suchen. Oder navigieren Sie direkt über den Alphabet-Index.
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px 64px" }}>
        <LexikonClient entries={LEXIKON} />

        {/* CTA */}
        <div
          style={{
            borderTop: "1px solid #e8e8e8",
            paddingTop: 32,
            marginTop: 16,
            textAlign: "center" as const,
          }}
        >
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 6px" }}>
            Vermissen Sie einen Begriff?
          </p>
          <a
            href="mailto:lexikon@eucx.eu"
            style={{ fontSize: 14, color: BLUE, fontWeight: 600, textDecoration: "none" }}
          >
            lexikon@eucx.eu
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
