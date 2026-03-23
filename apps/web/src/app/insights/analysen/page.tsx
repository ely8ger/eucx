import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Marktanalysen — Wöchentliche Preisberichte | EUCX",
  description: "Wöchentliche EUCX-Marktanalysen: Preiskommentare für Stahl, Schrott, Düngemittel und Holz.",
  robots: { index: true, follow: true },
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

export default function AnalysenPage() {
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <SiteNav activeHref="/insights" />
      <div style={{ backgroundColor: "#0d1b2a", padding: "48px 24px 44px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>{" / "}
            <span style={{ color: "#7aa4d4" }}>Marktanalysen</span>
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: "#fff", margin: "0 0 10px" }}>
            <strong style={{ fontWeight: 700 }}>Marktanalysen</strong>
          </h1>
          <p style={{ fontSize: 14, color: "#8aa8cc", lineHeight: 1.7, margin: 0 }}>Wöchentliche Preisberichte — verfügbar für registrierte EUCX-Mitglieder.</p>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 15, color: "#888", marginBottom: 24 }}>Vollständige Marktanalysen stehen registrierten Unternehmen zur Verfügung.</p>
        <Link href="/register" style={{ display: "inline-block", padding: "12px 28px", backgroundColor: BLUE, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Jetzt registrieren →
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
