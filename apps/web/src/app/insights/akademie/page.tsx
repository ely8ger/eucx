import type { Metadata } from "next";
import Link from "next/link";
import { AKADEMIE_ARTIKEL } from "../data";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Händler-Akademie — Leitfäden für B2B-Rohstoffhandel | EUCX",
  description: "Praxiswissen für den professionellen Rohstoffhandel an der EUCX: Orderbuch, Auktionen, Clearing, KYC, Margin-Systeme.",
  robots: { index: true, follow: true },
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

export default function AkademiePage() {
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <SiteNav activeHref="/insights" />
      <div style={{ backgroundColor: "#0d1b2a", padding: "48px 24px 44px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>{" / "}
            <span style={{ color: "#7aa4d4" }}>Händler-Akademie</span>
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: "#fff", margin: "0 0 10px" }}>
            Händler-<strong style={{ fontWeight: 700 }}>Akademie</strong>
          </h1>
          <p style={{ fontSize: 14, color: "#8aa8cc", maxWidth: 500, lineHeight: 1.7, margin: 0 }}>
            Praxiswissen für den professionellen B2B-Rohstoffhandel.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e0e4ec" }}>
          {AKADEMIE_ARTIKEL.map(a => (
            <Link key={a.slug} href={`/insights/akademie/${a.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <article style={{ backgroundColor: "#fff", padding: "28px 32px", borderLeft: `4px solid #92400e` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#92400e", letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>
                  Leitfaden · {a.readMin} min Lesezeit
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px" }}>{a.title}</h2>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, margin: "0 0 12px", maxWidth: 700 }}>{a.description}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>Artikel lesen →</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
