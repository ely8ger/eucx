import type { Metadata } from "next";
import Link from "next/link";
import { PriceTable } from "./PriceTable";
import { COMMODITIES } from "./data";
import { fmtEUR } from "@/lib/fmt";
import { EucxLogo } from "@/components/logo/EucxLogo";

/* ── SEO Metadata ─────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Aktuelle Rohstoffpreise 2026 — Stahl, Schrott, Dünger, Holz | EUCX",
  description:
    "Tagesaktuelle Marktpreise für Betonstahl, Walzdraht, Schrott, Harnstoff, NPK-Dünger und Holz. Direkt an der EUCX — European Union Commodity Exchange handeln. BaFin-reguliert, Frankfurt am Main.",
  keywords: [
    "Stahlpreis aktuell 2026",
    "Betonstahl Preis",
    "Schrottpreis heute",
    "Walzdraht Preis",
    "Rohstoffpreise Deutschland",
    "Düngerpreise aktuell",
    "Holzpreise aktuell",
    "Aluminiumschrott Preis",
    "Harnstoff Preis",
    "NPK Dünger Preis",
    "Stahlhandel B2B",
    "Warenbörse Deutschland",
  ],
  alternates: { canonical: "https://eucx.eu/marktpreise" },
  openGraph: {
    title: "Aktuelle Rohstoffpreise — EUCX Marktübersicht",
    description:
      "Tagesaktuelle Preise für Stahl, Schrott, Dünger und Holz. An der EUCX handeln.",
    type: "website",
    url: "https://eucx.eu/marktpreise",
    siteName: "EUCX — European Union Commodity Exchange",
  },
};

/* ── JSON-LD ──────────────────────────────────────────────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "EUCX Rohstoffpreise — Tagesaktuelle Marktübersicht",
  description:
    "Marktpreise für Industrierohstoffe: Stahl, Schrott, Dünger, Holz. Daten der European Union Commodity Exchange, Frankfurt am Main.",
  url: "https://eucx.eu/marktpreise",
  creator: {
    "@type": "Organization",
    name: "EUCX — European Union Commodity Exchange",
    url: "https://eucx.eu",
  },
  temporalCoverage: "2026",
  variableMeasured: COMMODITIES.map(c => ({
    "@type": "PropertyValue",
    name: c.name,
    value: c.price,
    unitText: `EUR/${c.unit}`,
  })),
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const BLUE  = "#154194";
const SANS  = "'IBM Plex Sans', Arial, sans-serif";
const MONO  = "'IBM Plex Mono', monospace";
const GREEN = "#166534";
const RED   = "#dc2626";

const today = new Date().toLocaleDateString("de-DE", {
  day: "2-digit", month: "long", year: "numeric",
});

/* ── Market insights copy ─────────────────────────────────────────────────── */
const INSIGHTS = [
  {
    title: "Stahlmarkt: Leichte Erholung",
    body: "Betonstahl und Walzdraht zeigen nach mehreren Wochen Preisdruck erste Stabilisierungszeichen. Die Nachfrage aus dem Bausektor bleibt verhalten, während Exportmengen aus der EU leicht zurückgehen. Analysten erwarten eine Seitwärtsbewegung im zweiten Quartal 2026.",
    tag: "Metalle",
    color: BLUE,
  },
  {
    title: "Schrottpreise unter Druck",
    body: "Shredder-Material verbilligte sich in den letzten vier Wochen um rund 8 %. Ausnahme: Aluminiumschrott, der aufgrund starker Nachfrage aus der Automobilindustrie auf ein 6-Monats-Hoch gestiegen ist. Für Schwerschrott 1A bleibt das Umfeld schwach.",
    tag: "Schrott",
    color: "#92400e",
  },
  {
    title: "Düngerpreise: Harnstoff auf Jahreshoch",
    body: "Harnstoff verteuerte sich in der laufenden Woche um über 4 %. Hintergrund sind gestiegene Gaspreise, die die Produktionskosten europäischer Stickstoffhersteller belasten. NPK-Mischungen folgen der Bewegung mit geringerer Dynamik.",
    tag: "Dünger",
    color: GREEN,
  },
  {
    title: "Holzmarkt: Strukturelle Schwäche",
    body: "Fichtenrundholz und Buchenindustrieholz sind weiterhin unter Druck, während der Wohnungsbau stockt. Kiefer-Schnittholz zeigt relative Stärke dank anhaltender Nachfrage aus dem Möbel- und Verpackungsbereich. Saison-Effekte dürften im April Entlastung bringen.",
    tag: "Holz",
    color: "#44403c",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function MarktpreisePage() {
  const risingCount  = COMMODITIES.filter(c => c.weekChangePct > 0).length;
  const fallingCount = COMMODITIES.filter(c => c.weekChangePct < 0).length;
  const flatCount    = COMMODITIES.filter(c => c.weekChangePct === 0).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <nav style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8e8e8", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <EucxLogo size="md" />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Link href="/katalog" style={{ fontSize: 13, color: "#505050", textDecoration: "none", fontWeight: 500 }}>Katalog</Link>
              <Link href="/marktpreise" style={{ fontSize: 13, color: BLUE, textDecoration: "none", fontWeight: 700 }}>Marktpreise</Link>
              <Link href="/wissen" style={{ fontSize: 13, color: "#505050", textDecoration: "none", fontWeight: 500 }}>Wissen</Link>
              <Link href="/login" style={{ fontSize: 12, color: "#505050", textDecoration: "none", padding: "6px 14px", border: "1px solid #ddd" }}>Anmelden</Link>
              <Link href="/register" style={{ fontSize: 12, color: "#fff", textDecoration: "none", padding: "6px 16px", backgroundColor: BLUE, fontWeight: 700 }}>Kostenlos registrieren</Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#0d1b2a", color: "#fff", padding: "56px 24px 52px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            {/* Breadcrumb */}
            <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 20, letterSpacing: "0.06em" }}>
              <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>
              {" "}/{" "}
              <span style={{ color: "#7aa4d4" }}>Marktpreise</span>
            </p>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 8, height: 8, backgroundColor: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,.2)" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em" }}>LIVE · WERKTÄGLICH AKTUALISIERT</span>
                </div>
                <h1 style={{ fontSize: 40, fontWeight: 300, color: "#fff", margin: "0 0 12px", lineHeight: 1.1 }}>
                  Aktuelle<br />
                  <span style={{ fontWeight: 700 }}>Rohstoffpreise</span>
                </h1>
                <p style={{ fontSize: 15, color: "#8aa8cc", maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
                  Tagesaktuelle Marktpreise für Stahl, Schrott, Dünger und Holz —
                  direkt aus den Handelssitzungen der EUCX. BaFin-reguliert,
                  Frankfurt am Main.
                </p>
              </div>

              {/* Hero-Statistik */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, backgroundColor: "#1e3a5f", flexShrink: 0 }}>
                {[
                  { label: "Rohstoffe",  value: String(COMMODITIES.length),   color: "#fff" },
                  { label: "Steigend",   value: `${risingCount} ↑`,           color: "#4ade80" },
                  { label: "Fallend",    value: `${fallingCount} ↓`,          color: "#f87171" },
                  { label: "Stand",      value: today,                        color: "#7aa4d4" },
                  { label: "Letztes Update", value: "08:00 Uhr",             color: "#7aa4d4" },
                  { label: "Sitzungen",  value: "tägl. 10–13 Uhr",          color: "#7aa4d4" },
                ].map(k => (
                  <div key={k.label} style={{ backgroundColor: "#162b46", padding: "16px 20px" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a6fa1", margin: "0 0 6px" }}>{k.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: k.color, fontFamily: MONO, margin: 0 }}>{k.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Hauptinhalt ───────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

          {/* Preistabelle (Client-Komponente) */}
          <section aria-label="Rohstoffpreise Tabelle">
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: 24 }}>
              Marktübersicht — {COMMODITIES.length} Rohstoffe
            </h2>
            <PriceTable />
          </section>

          {/* ── Marktberichte ─────────────────────────────────────────── */}
          <section aria-label="Marktberichte" style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Marktbericht KW {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000))} · 2026
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2, backgroundColor: "#e0e4ec" }}>
              {INSIGHTS.map(ins => (
                <article key={ins.tag} style={{ backgroundColor: "#fff", padding: "24px 24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 3, height: 14, backgroundColor: ins.color }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ins.color }}>{ins.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0d1b2a", margin: "0 0 10px", lineHeight: 1.3 }}>{ins.title}</h3>
                  <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.75, margin: 0 }}>{ins.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── Preisalarm CTA ────────────────────────────────────────── */}
          <section style={{ marginTop: 64, backgroundColor: "#fff", border: "1px solid #e8e8e8", padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BLUE }}>Kostenlos · Kein Abo</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 300, color: "#0d1b2a", margin: "0 0 8px" }}>
                Preisalarm & <strong>Direkt handeln</strong>
              </h2>
              <p style={{ fontSize: 14, color: "#505050", maxWidth: 480, lineHeight: 1.7, margin: 0 }}>
                Registrieren Sie sich kostenlos an der EUCX und handeln Sie direkt zu
                Börsenpreisen — ohne Mittler, ohne versteckte Gebühren. Als registriertes
                Mitglied erhalten Sie Preisalarme per E-Mail und Zugang zu allen
                Handelssitzungen.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 44, padding: "0 28px", backgroundColor: BLUE, color: "#fff",
                fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em",
              }}>
                Jetzt kostenlos registrieren →
              </Link>
              <Link href="/trading" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 44, padding: "0 28px", border: `1px solid ${BLUE}`, color: BLUE,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>
                Handelsraum ansehen
              </Link>
            </div>
          </section>

          {/* ── SEO-Textblock ─────────────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 48, alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
                  <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                    Über die EUCX Marktpreise
                  </h2>
                </div>
                <div style={{ fontSize: 14, color: "#505050", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 16 }}>
                  <p>
                    Die <strong>EUCX — European Union Commodity Exchange</strong> ist eine
                    BaFin-regulierte Handelsplattform (OTF, MiFID II) mit Sitz in Frankfurt am Main.
                    Täglich ab 10:00 Uhr finden strukturierte Handelssitzungen für Industrierohstoffe
                    statt, deren Abschlusspreise die Grundlage der hier veröffentlichten
                    Marktpreise bilden.
                  </p>
                  <p>
                    Die Preise für <strong>Betonstahl</strong>, <strong>Walzdraht</strong> und
                    Stahlprofile richten sich nach den tatsächlichen Matchingpreisen aus dem
                    Orderbuch. Für <strong>Schrottpreise</strong> — insbesondere Shredder, Schwerschrott
                    und Aluminiumschrott — geben wir gewichtete Durchschnitte der jüngsten
                    Sitzungsabschlüsse an.
                  </p>
                  <p>
                    Im Bereich <strong>Düngemittel</strong> (Harnstoff, NPK, Ammoniumnitrat, KAS)
                    orientieren sich die EUCX-Preise an europäischen Importparität und
                    Gaspreisen als primärem Kostentreiber. <strong>Holzpreise</strong> reflektieren
                    regionale Notierungen für Deutschland, Österreich und die Schweiz.
                  </p>
                </div>
              </div>

              {/* Kennzahlen-Box */}
              <div style={{ backgroundColor: "#0d1b2a", color: "#fff", padding: "28px 28px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a6fa1", marginBottom: 20 }}>EUCX auf einen Blick</p>
                {[
                  { label: "Regulierung",   value: "BaFin · MiFID II OTF" },
                  { label: "Standort",      value: "Frankfurt am Main" },
                  { label: "Handel",        value: "Mo–Fr · 10:00–13:00" },
                  { label: "Kategorien",    value: "Metalle, Schrott, Dünger, Holz" },
                  { label: "Zugang",        value: "kostenlose Registrierung" },
                  { label: "Teilnehmer",    value: "geprüfte Unternehmen (B2B)" },
                ].map(k => (
                  <div key={k.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e3a5f" }}>
                    <span style={{ fontSize: 11, color: "#4a6fa1" }}>{k.label}</span>
                    <span style={{ fontSize: 11, color: "#c8d8ec", fontWeight: 600, textAlign: "right", maxWidth: 180 }}>{k.value}</span>
                  </div>
                ))}
                <Link href="/register" style={{
                  display: "block", marginTop: 24, textAlign: "center",
                  padding: "10px 0", backgroundColor: BLUE, color: "#fff",
                  fontSize: 12, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em",
                }}>
                  Jetzt registrieren →
                </Link>
              </div>
            </div>
          </section>

        </div>{/* /main content */}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid #e8e8e8", backgroundColor: "#fff", marginTop: 80 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/" style={{ textDecoration: "none" }}><EucxLogo size="sm" /></Link>
              <span style={{ fontSize: 11, color: "#bbb" }}>© 2026 EUCX</span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Impressum",   href: "/impressum" },
                { label: "Datenschutz", href: "/datenschutz" },
                { label: "AGB",         href: "/agb" },
                { label: "Wissen",      href: "/wissen" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: 11, color: "#888", textDecoration: "none" }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
