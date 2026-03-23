import type { Metadata } from "next";
import Link from "next/link";
import { LEXIKON } from "../data";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "EU-Regulatorik — MiFID II, OTF, CBAM, EMIR | EUCX",
  description: "EU-Regulatorik für den Rohstoffhandel: MiFID II OTF-Zulassung, CBAM, EMIR, DORA — erklärt für Handelsteilnehmer.",
  robots: { index: true, follow: true },
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

export default function RegulatorikPage() {
  const regulatoryEntries = LEXIKON.filter(e => e.category === "Regulierung");
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <SiteNav activeHref="/insights" />
      <div style={{ backgroundColor: "#0d1b2a", padding: "48px 24px 44px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>{" / "}
            <span style={{ color: "#7aa4d4" }}>EU-Regulatorik</span>
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: "#fff", margin: "0 0 10px" }}>
            EU-<strong style={{ fontWeight: 700 }}>Regulatorik</strong>
          </h1>
          <p style={{ fontSize: 14, color: "#8aa8cc", maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
            MiFID II, OTF-Zulassung, CBAM, EMIR und DORA — erklärt für Handelsteilnehmer.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2, backgroundColor: "#e0e4ec" }}>
          {regulatoryEntries.map(entry => (
            <Link key={entry.slug} href={`/insights/lexikon/${entry.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <article style={{ backgroundColor: "#fff", padding: "22px 26px", borderTop: "3px solid #44403c" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>{entry.term}</h2>
                  <span style={{ fontSize: 10, color: "#bbb", fontFamily: MONO }}>{entry.readMin} min</span>
                </div>
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.65, margin: "0 0 8px" }}>{entry.shortDef}</p>
                {entry.norm && <p style={{ fontSize: 10, fontFamily: MONO, color: "#44403c", margin: 0, fontWeight: 600 }}>{entry.norm}</p>}
              </article>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
