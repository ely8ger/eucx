import type { Metadata } from "next";
import Link from "next/link";
import { PriceTable } from "./PriceTable";
import { COMMODITIES } from "./data";
import { fmtEUR } from "@/lib/fmt";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

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

/* ── FAQ JSON-LD ──────────────────────────────────────────────────────────── */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Was kostet Betonstahl aktuell in Deutschland?", acceptedAnswer: { "@type": "Answer", text: "Betonstahl der Güte B500B (Ø 10–16 mm) notiert aktuell bei 698,00 €/t (frei Lager Deutschland, netto). Die EUCX veröffentlicht täglich um 08:00 Uhr aktualisierte Sitzungspreise." } },
    { "@type": "Question", name: "Wie entwickeln sich die Stahlpreise 2026?", acceptedAnswer: { "@type": "Answer", text: "Stahlpreise stehen 2026 unter strukturellem Druck durch Importe und schwache Baukonjunktur. CO₂-Grenzausgleich (CBAM) und EU-Antidumping-Maßnahmen wirken stützend. Analysten erwarten Seitwärtsbewegung im Q2 2026." } },
    { "@type": "Question", name: "Welche Faktoren beeinflussen den Schrottpreis?", acceptedAnswer: { "@type": "Answer", text: "Schrottpreise hängen direkt von der Stahlproduktion, Elektrizitätspreisen, Schrottexporten (v.a. Türkei) und saisonalen Sammelmengen ab." } },
    { "@type": "Question", name: "Warum ist Harnstoff so teuer geworden?", acceptedAnswer: { "@type": "Answer", text: "Harnstoff-Preise stiegen seit 2021 stark, weil Erdgas den größten Produktionskostenanteil ausmacht. Nach der Energiekrise 2022 blieb Gas in Europa dauerhaft teurer als in Konkurrenzregionen." } },
    { "@type": "Question", name: "Kann ich an der EUCX als kleines Unternehmen handeln?", acceptedAnswer: { "@type": "Answer", text: "Ja. Die EUCX ist für alle geprüften gewerblichen Teilnehmer (B2B) zugänglich. Nach kostenfreier Registrierung und Unternehmensverifikation ist der Handel in täglichen Sitzungen (Mo–Fr, 10–13 Uhr) möglich." } },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>

        <SiteNav activeHref="/marktpreise" />

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

          {/* ── Preisbildung ──────────────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Wie entstehen Rohstoffpreise?
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2, backgroundColor: "#e0e4ec" }}>
              {[
                {
                  title: "Angebot & Nachfrage",
                  body: "Der wichtigste Preistreiber: Überschreitet die Nachfrage das Angebot, steigen die Preise — und umgekehrt. Baukonjunktur, Industrieproduktion und Exportmengen sind für Stahlpreise entscheidend. Bei Düngemitteln bestimmen Anbauzyklen und Ernteschätzungen die saisonale Nachfrage.",
                  icon: "⚖",
                },
                {
                  title: "Energie & Rohstoffkosten",
                  body: "Erdgas ist ein Schlüsselkostenfaktor für Stickstoffdünger (Harnstoff, KAS, Ammoniumnitrat). Koks- und Kohlepreise beeinflussen Stahl-Produktionskosten. Steigende Energiepreise übersetzen sich oft direkt in höhere Rohstoffpreise am Markt.",
                  icon: "⚡",
                },
                {
                  title: "Handelsströme & Import",
                  body: "Einfuhrzölle, Antidumping-Maßnahmen und Handelsabkommen verändern die Wettbewerbssituation. Günstige Importe aus Drittländern drücken heimische Preise. Die EU hat zuletzt für mehrere Stahlprodukte Schutzmaßnahmen verlängert.",
                  icon: "🚢",
                },
                {
                  title: "Währungen & Spekulation",
                  body: "Rohstoffe werden international in USD gehandelt. Ein schwacher Euro macht Importe teurer. Auf internationalen Terminmärkten (LME, CME) verstärken spekulative Positionen kurzfristige Preisbewegungen, die an physischen Märkten wie der EUCX nachhallen.",
                  icon: "💱",
                },
                {
                  title: "Saisonalität",
                  body: "Holzpreise steigen traditionell im Frühjahr mit dem Baubeginn. Düngemittelnachfrage konzentriert sich auf Feb–April (Frühjahrsbestellung) und Sep–Okt (Herbstbestellung). Stahlpreise schwächeln oft im Sommer, wenn Bauaktivität und Industrieproduktion zurückgehen.",
                  icon: "📅",
                },
                {
                  title: "Regulierung & Zertifizierung",
                  body: "Normen wie EN 10080 (Betonstahl) oder ISRI-Klassifikationen (Schrott) definieren Qualitätsstandards und damit unterschiedliche Preisstufen. Neue Umweltauflagen erhöhen Produktionskosten — besonders für energieintensive Prozesse wie Stahlerzeugung.",
                  icon: "📋",
                },
              ].map(item => (
                <div key={item.title} style={{ backgroundColor: "#fff", padding: "24px 24px 28px" }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px" }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.75, margin: 0 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Kategorie-Tiefen ──────────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Rohstoffkategorien im Detail
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e0e4ec" }}>

              {/* Metalle & Stahl */}
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, backgroundColor: BLUE }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>Metalle & Stahl</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 40, alignItems: "start" }}>
                  <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 12 }}>
                    <p><strong>Betonstahl (Bewehrungsstahl)</strong> ist das weltweit meistgehandelte Stahlprodukt. Er wird für Stahlbeton in Hochbauten, Brücken und Infrastrukturprojekten eingesetzt. Der EUCX-Preis bezieht sich auf die Güte B500B (Streckgrenze 500 N/mm²), Stabdurchmesser 10–16 mm, frei Lager Deutschland.</p>
                    <p><strong>Walzdraht</strong> (SAE 1006, Ø 5,5 mm) ist Ausgangsmaterial für Schrauben, Nägel, Federn und Gittermatten. Er wird in Coils geliefert und ist ein wichtiger Indikator für die Nachfrage der metallverarbeitenden Industrie.</p>
                    <p><strong>HEA/HEB-Träger</strong> (Breitflanschträger) sind Strukturprofile für den Stahlbau. Ihre Preisentwicklung korreliert eng mit Hochbauprojekten und ist ein guter Frühindikator für die Baukonjunktur.</p>
                    <p>Wichtige Einflussfaktoren auf Stahlpreise 2026: europäische Antidumping-Maßnahmen gegen chinesische Importe, CO₂-Grenzausgleichsmechanismus (CBAM), Schrottpreise als Vorprodukt der Elektrostahlroute sowie die Gaspreise in Europa.</p>
                  </div>
                  <div style={{ backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>Wichtige Normen</p>
                    {[
                      ["EN 10080", "Betonstahl"],
                      ["EN 10025", "Baustahl"],
                      ["SAE 1006", "Walzdraht"],
                      ["S235JR", "Strukturstahl"],
                      ["S355J2", "Hochfester Stahl"],
                    ].map(([norm, desc]) => (
                      <div key={norm} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 11, fontFamily: MONO, color: BLUE, fontWeight: 600 }}>{norm}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schrott & Recycling */}
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, backgroundColor: "#92400e" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>Schrott & Recycling</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 40, alignItems: "start" }}>
                  <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 12 }}>
                    <p>Stahlschrott ist das wichtigste Sekundärrohstoff Europas. Über 80 % des deutschen Stahls werden heute in Elektrolichtbogenöfen aus Schrott erschmolzen — ein entscheidender Vorteil gegenüber der energieintensiven Hochofenroute.</p>
                    <p><strong>Shredder-Schrott</strong> (ISRI 210) stammt aus der Zerkleinerung von PKW-Karosserien und Konsumgütern. Seine Qualität ist standardisiert und er ist an Elektrostahlwerken besonders gefragt. Schrottpreise korrelieren stark mit dem weltweiten Stahlproduktionsvolumen.</p>
                    <p><strong>Schwerschrott 1A</strong> (ISRI 200, Wandstärke ≥ 6 mm) umfasst schwere Stahlteile aus Maschinenbau und Schwerindustrie. Er hat einen höheren Schrottanteil und ist häufig günstiger als Shredder-Material zu beschaffen.</p>
                    <p><strong>Aluminiumschrott</strong> ist ein besonders wertvoller Sekundärrohstoff. Aluminium-Recycling benötigt nur 5 % der Energie der Primärproduktion. Der EN AW-6082 Standard (Knetlegierung) ist für die Automobilindustrie besonders relevant.</p>
                  </div>
                  <div style={{ backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>ISRI-Klassifikationen</p>
                    {[
                      ["ISRI 200", "Schwerschrott"],
                      ["ISRI 210", "Shredder"],
                      ["ISRI 211", "Neuschrott"],
                      ["ISRI 206", "Bauschrott"],
                      ["EN AW-6082", "Alu-Knetleg."],
                    ].map(([code, desc]) => (
                      <div key={code} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 11, fontFamily: MONO, color: "#92400e", fontWeight: 600 }}>{code}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dünger */}
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, backgroundColor: GREEN }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>Dünger & Agrarchemie</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 40, alignItems: "start" }}>
                  <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 12 }}>
                    <p>Stickstoffdünger sind der bedeutendste Kostenfaktor in der modernen Landwirtschaft. Sie werden aus Ammoniak (NH₃) synthetisiert, dessen Produktion über das Haber-Bosch-Verfahren rund 1–2 % des weltweiten Erdgasverbrauchs ausmacht.</p>
                    <p><strong>Harnstoff</strong> (CO(NH₂)₂, 46 % N) ist der am häufigsten eingesetzte feste Stickstoffdünger weltweit. Er ist besonders effizient, erfordert aber exaktes Ausbringen (Harnstoffinhibitoren bei hohen Temperaturen). Hauptproduzenten: Russland, Ägypten, Katar, China.</p>
                    <p><strong>NPK-Komplexdünger</strong> (15-15-15) enthalten Stickstoff, Phosphor und Kalium in einem Granulat. Sie vereinfachen die Düngung bei Kulturen mit ausgewogenem Nährstoffbedarf (Getreide, Mais, Zuckerrüben).</p>
                    <p>Die EU-Düngemittelversorgung ist stark von Importen abhängig. Lieferverzögerungen oder Exportrestriktionen aus Russland (größter Exporteur für Stickstoff- und Kalidünger) können den europäischen Markt innerhalb weniger Wochen stark beeinflussen.</p>
                  </div>
                  <div style={{ backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>Nährstoffe</p>
                    {[
                      ["N", "Stickstoff — Wachstum"],
                      ["P", "Phosphor — Wurzeln"],
                      ["K", "Kalium — Festigkeit"],
                      ["S", "Schwefel — Protein"],
                      ["Mg", "Magnesium — Chloro."],
                    ].map(([elem, desc]) => (
                      <div key={elem} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 13, fontFamily: MONO, color: GREEN, fontWeight: 700 }}>{elem}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Holz */}
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, backgroundColor: "#44403c" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>Holz & Forst</h3>
                </div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 12 }}>
                  <p>Der europäische Holzmarkt hat seit der Borkenkäfer-Krise (2018–2021) und dem COVID-Bauboom strukturelle Veränderungen erfahren. Überangebote durch Schadholz haben die Preise für Rundholz belastet, während Schnittholzpreise eine hohe Volatilität zeigen.</p>
                  <p><strong>Fichte Rundholz</strong> ist das mengenmäßig wichtigste Sortiment in Deutschland, Österreich und Tschechien. Qualitätsstufen (A/B/C-Holz) bestimmen die Verwendung (Sägewerk, Furnier, Industrieholz). Die Preise werden regional zwischen Waldeigentümern und Sägewerken frei verhandelt — die EUCX gibt gewichtete Durchschnitte für die DACH-Region an.</p>
                  <p><strong>Kiefer KVH (Konstruktionsvollholz)</strong> ist ein industriell gefertigtes Schnittholz mit definiertem Restfeuchtegehalt (≤ 20 %). Es wird im Holzrahmenbau, für Dachstuhlkonstruktionen und im Zimmerei-Bereich eingesetzt.</p>
                  <p>Aktuell: Die Belebung im Wohnungsbau steht aus — Zinsniveau und Baukostenentwicklung bremsen neue Projekte. Erst wenn die Baugenehmigungen wieder steigen, ist mit einer Preisstabilisierung bei Schnittholz zu rechnen.</p>
                </div>
              </div>

            </div>
          </section>

          {/* ── Historische Preisübersicht ─────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Preisentwicklung — Ausgewählte Rohstoffe 2025–2026
              </h2>
            </div>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                    {["Rohstoff", "Okt 25", "Nov 25", "Dez 25", "Jan 26", "Feb 26", "Mär 26", "Trend"].map((h, i) => (
                      <th key={i} style={{
                        padding: "10px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", color: "#888", textAlign: i === 0 ? "left" : "right",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Betonstahl B500B", unit: "€/t", data: [748, 739, 728, 715, 705, 698], trend: -6.7 },
                    { name: "Walzdraht SAE 1006", unit: "€/t", data: [638, 645, 650, 660, 667, 672], trend: +5.3 },
                    { name: "Shredder ISRI 210", unit: "€/t", data: [355, 350, 342, 335, 326, 318], trend: -10.4 },
                    { name: "Aluminiumschrott", unit: "€/t", data: [1340, 1360, 1390, 1410, 1435, 1450], trend: +8.2 },
                    { name: "Harnstoff N 46 %", unit: "€/t", data: [410, 425, 445, 461, 474, 485], trend: +18.3 },
                    { name: "Fichte Rundholz", unit: "€/m³", data: [119, 117, 116, 115, 113, 112], trend: -5.9 },
                  ].map(row => {
                    const up = row.trend > 0;
                    return (
                      <tr key={row.name} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px 14px", fontFamily: SANS, fontWeight: 600, fontSize: 12, color: "#0d1b2a", whiteSpace: "nowrap" }}>{row.name}</td>
                        {row.data.map((v, i) => (
                          <td key={i} style={{ padding: "10px 14px", textAlign: "right", color: "#505050" }}>
                            {fmtEUR(v)}
                          </td>
                        ))}
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: up ? GREEN : RED }}>
                          {up ? "+" : ""}{row.trend.toFixed(1)} %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: "#bbb", padding: "10px 14px", margin: 0 }}>Preise in EUR (netto), frei Lager DE. Quelle: EUCX-Sitzungsabschlüsse.</p>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Häufige Fragen zu Rohstoffpreisen
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e0e4ec" }}>
              {[
                {
                  q: "Was kostet Betonstahl aktuell in Deutschland?",
                  a: "Betonstahl der Güte B500B (Ø 10–16 mm) notiert aktuell bei 698,00 €/t (frei Lager Deutschland, netto). Im Jahresvergleich liegt der Preis damit etwa 6–7 % unter dem Niveau von Herbst 2025. Die EUCX veröffentlicht täglich um 08:00 Uhr aktualisierte Sitzungspreise.",
                },
                {
                  q: "Wie entwickeln sich die Stahlpreise 2026?",
                  a: "Stahlpreise stehen 2026 unter strukturellem Druck: Hohe Importe aus Asien, schwache Baukonjunktur und ein verhaltener Außenhandel der EU belasten die Nachfrageseite. Gegenläufig wirken CO₂-Grenzausgleich (CBAM) und EU-Antidumping-Maßnahmen, die heimische Produzenten schützen. Analysten erwarten eine Seitwärtsbewegung im Q2 2026.",
                },
                {
                  q: "Welche Faktoren beeinflussen den Schrottpreis?",
                  a: "Schrottpreise hängen direkt von der Stahlproduktion ab: Mehr Rohstahlerzeugung bedeutet mehr Nachfrage nach Schrott als Einsatzstoff. Weitere Faktoren: Elektrizitätspreise (Energiebedarf der Elektrolichtbogenöfen), Schrottexporte in Drittländer (z.B. Türkei als größter Schrott-Importeur) sowie saisonale Sammelmengen.",
                },
                {
                  q: "Warum ist Harnstoff so teuer geworden?",
                  a: "Harnstoff-Preise sind seit 2021 stark gestiegen, weil Erdgas den größten Kostenanteil in der Produktion ausmacht. Nach dem Ukraine-Krieg und der Energiekrise blieb Erdgas in Europa deutlich teurer als in den USA oder dem Nahen Osten. Dies zwingt europäische Hersteller, mit importiertem, günstigerem Harnstoff aus Nordafrika oder dem Persischen Golf zu konkurrieren.",
                },
                {
                  q: "Was bedeuten die ISRI-Codes beim Schrott?",
                  a: "Die ISRI-Codes (Institute of Scrap Recycling Industries) sind internationale Standards für die Klassifikation von Schrott. ISRI 200 bezeichnet Schwerschrott (Wandstärke ≥ 6 mm), ISRI 210 Shredder-Material aus Pkw-Karosserien. Diese Codes sind Basis für Handelsverträge und Preisvereinbarungen weltweit.",
                },
                {
                  q: "Wo werden Holzpreise in Deutschland notiert?",
                  a: "Holzpreise werden in Deutschland dezentral zwischen Waldeigentümern (Bundesforst, Landesforst, Privatwald) und Abnehmern (Sägewerke, Zellstoffwerke) vereinbart. Offizielle Preiserhebungen publizieren das Thünen-Institut und die Bundesforst. Die EUCX-Preise basieren auf gewichteten Durchschnitten für die DACH-Region (DE/AT/CH).",
                },
                {
                  q: "Kann ich an der EUCX als kleines Unternehmen handeln?",
                  a: "Ja. Die EUCX ist für gewerbliche Teilnehmer (B2B) aller Größenklassen zugänglich. Nach einer kostenfreien Registrierung und Unternehmensverifikation können Sie direkt an täglichen Handelssitzungen (Mo–Fr, 10–13 Uhr) teilnehmen. Mindestlosgröße, Gebührenstruktur und Zahlungsbedingungen entnehmen Sie den AGB und dem Handelsreglement.",
                },
                {
                  q: "Wie werden EUCX-Preise berechnet?",
                  a: "EUCX-Preise sind gewichtete Durchschnittspreise der Sitzungsabschlüsse (Matching-Preise aus dem zentralen Orderbuch). Sie werden täglich nach Sitzungsende um ca. 13:30 Uhr ermittelt und um 08:00 Uhr des Folgetags veröffentlicht. Es handelt sich um Netto-Marktpreise (ohne MwSt.), frei Lager Deutschland.",
                },
                {
                  q: "Wann ist der beste Zeitpunkt für den Rohstoffkauf?",
                  a: "Generell empfiehlt sich ein kontizyklisches Vorgehen: Einkäufe in Schwächephasen (saisonale Tiefs, konjunkturelle Dellenperioden) können Beschaffungskosten senken. Für Düngemittel bieten sich Sommer-/Herbstkontrakte an, wenn die Saisonspitze vorbei ist. Bei Stahl sind Q3-Einkäufe oft günstiger als Q1. Professionelle Absicherung über Terminkontrakte ist für größere Mengen empfehlenswert.",
                },
                {
                  q: "Gibt es Preisgarantien oder Festpreisverträge an der EUCX?",
                  a: "Nein — die EUCX ist ein Spot-Markt mit tagesaktuellen Preisen. Festpreisverträge (Forwards) werden bilateral zwischen den Parteien vereinbart, nicht über das EUCX-Orderbuch. Für Preisabsicherung empfehlen wir, mit einem zugelassenen Rohstoff-Broker zu sprechen oder die EUCX-Beratungshotline zu kontaktieren.",
                },
              ].map(({ q, a }, i) => (
                <details key={i} style={{ backgroundColor: "#fff" }}>
                  <summary style={{
                    padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#0d1b2a",
                    cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    {q}
                    <span style={{ fontSize: 18, color: "#bbb", flexShrink: 0, marginLeft: 16 }}>+</span>
                  </summary>
                  <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.8, margin: 0, padding: "4px 24px 20px", borderTop: "1px solid #f5f5f5" }}>
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Glossar ───────────────────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 3, height: 16, backgroundColor: BLUE }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Rohstoff-Glossar
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2, backgroundColor: "#e0e4ec" }}>
              {[
                { term: "Betonstahl / Bewehrungsstahl", def: "Stahlstäbe oder -matten (Güte B500B) zum Bewehren von Beton. Maßgebliche Norm: EN 10080. Preis in €/t frei Lager." },
                { term: "Walzdraht", def: "In Coils gewalzter Stahldraht (Ø 5,5–16 mm). Ausgangsmaterial für Drähte, Schrauben, Nägel. Hauptgüte: SAE 1006 (kohlenstoffarm)." },
                { term: "HEA / HEB (Breitflanschträger)", def: "Warmgewalzte H-Profile für den Stahlbau. HEA hat schmalere Flansche als HEB. Basis-Werkstoff meist S235JR oder S355J2." },
                { term: "Shredder-Schrott (ISRI 210)", def: "Shreddermaterial aus zerkleinerten PKW-Karosserien. Homogene Zusammensetzung, ideal für Elektrostahlwerke. Chlor- und Kupfergehalt entscheidend für Qualität." },
                { term: "Schwerschrott 1A (ISRI 200)", def: "Schwere Stahlteile mit Wandstärke ≥ 6 mm. Häufig aus dem Maschinenbau. Enthält oft einen höheren Anteil legierter Bestandteile." },
                { term: "Harnstoff (Urea)", def: "Stickstoffdünger mit 46 % N. Synthetisiert über das Haber-Bosch-Verfahren aus Ammoniak und CO₂. Größter Kostentreiber: Erdgas." },
                { term: "NPK-Dünger", def: "Komplexdünger mit Stickstoff (N), Phosphor (P) und Kalium (K). Verhältnis z.B. 15-15-15. In einem Granulatkorn, für gleichmäßige Nährstoffverteilung." },
                { term: "KAS (Kalkammonsalpeter)", def: "Stickstoffdünger aus Ammoniumnitrat + Kalkstein (27 % N). Gute Verträglichkeit für Boden und Pflanze. Häufigstes Stickstoffdüngemittel in Deutschland." },
                { term: "Ammoniumnitrat", def: "Stickstoffdünger mit 34 % N. Wegen hoher Sprengfähigkeit besonders reglementiert. In der EU beschränkter Verkauf; im Agrarsektor als Granulat eingesetzt." },
                { term: "KVH (Konstruktionsvollholz)", def: "Kalibriertes Schnittholz mit definiertem Restfeuchtegehalt (≤ 20 %). Standard für tragende Holzkonstruktionen im Zimmerei-Bereich. DIN 4074-1 konform." },
                { term: "CBAM (Carbon Border Adjustment Mechanism)", def: "EU-Grenzausgleich für CO₂-intensive Importe (Stahl, Aluminium, Zement etc.). Ab 2026 in voller Höhe wirksam. Soll CO₂-Leakage verhindern und heimische Produzenten entlasten." },
                { term: "OTF (Organised Trading Facility)", def: "Regulierter Handelsplatz nach MiFID II für Nicht-Eigenkapitalinstrumente. EUCX betreibt eine zugelassene OTF für physischen Rohstoffhandel, reguliert durch die BaFin." },
              ].map(({ term, def }) => (
                <div key={term} style={{ backgroundColor: "#fff", padding: "20px 22px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a", margin: "0 0 6px" }}>{term}</p>
                  <p style={{ fontSize: 12, color: "#606060", lineHeight: 1.7, margin: 0 }}>{def}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Erweiterte SEO-Texte ───────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, backgroundColor: "#e0e4ec" }}>
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 14px" }}>Stahlpreise Deutschland 2026</h3>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p>Die deutschen Stahlpreise werden durch das Zusammenspiel von Produktionskosten (Energie, Schrott, CO₂-Zertifikate) und der Nachfrage aus Bau, Maschinenbau und Automobilindustrie bestimmt. Deutschland ist Europas größter Stahlproduzent und -verbraucher.</p>
                  <p>Für 2026 erwarten Branchenexperten eine allmähliche Stabilisierung nach dem Preisrückgang von 2023–2025. Entscheidend werden der Baustart im zweiten Quartal und die Entwicklung der Autoverkäufe in der EU sein. Der CBAM-Grenzausgleich dürfte Importe aus China und Indien verteuern und heimische Produzenten stärken.</p>
                </div>
              </div>
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 14px" }}>Schrottpreise aktuell</h3>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p>Schrottpreise in Deutschland werden monatlich von den Verbänden (bvse, BDSV) als Orientierungspreise veröffentlicht. An der EUCX erfolgt die Preisbildung täglich durch das Orderbuchmatching zwischen zertifizierten Händlern und Abnehmern.</p>
                  <p>Der Schrottmarkt reagiert schnell auf externe Schocks: Exportrestriktionen der Türkei, Produktionsausfälle bei deutschen Elektrostahlwerken oder abrupte Veränderungen bei den Schiffsfrachtkosten können den Preis innerhalb einer Woche um 5–10 % bewegen.</p>
                </div>
              </div>
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 14px" }}>Düngemittelpreise Europa</h3>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p>Europäische Düngemittelpreise sind eng mit dem Gasmarkt (TTF) verknüpft. Seit der Energiekrise 2022 haben viele europäische Stickstoffdüngerwerke ihre Kapazität dauerhaft zurückgefahren — mit dem Ergebnis höherer Importabhängigkeit und tendenziell erhöhter Preisniveaus gegenüber dem Vor-2022-Schnitt.</p>
                  <p>Landwirtschaftliche Genossenschaften sichern sich Jahresmengen oft per Festpreisvertrag (Sommer-Eindeckung). Freie Händler, die auf Spotmärkte setzen, profitieren von Preisdellen — tragen aber das volle Preisänderungsrisiko.</p>
                </div>
              </div>
              <div style={{ backgroundColor: "#fff", padding: "28px 32px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 14px" }}>Holzpreise DACH-Region</h3>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p>Der Holzmarkt der DACH-Region (Deutschland, Österreich, Schweiz) ist durch eine hohe Fragmentierung geprägt. Neben staatlichen Forstbetrieben prägen Kommunalwälder und Privatwälder das Angebot. Die Einschlagsmengen werden durch Forstpläne, Borkenkäferbefall und extreme Wetterereignisse beeinflusst.</p>
                  <p>Für 2026 deutet sich eine vorsichtige Markterholung an: Sägeindustrie-Kapazitäten wurden in den Vorjahren angepasst, das Schadholzaufkommen normalisiert sich. Langfristig stützt der Trend zum nachhaltigen Bauen (Massivholz, CLT) die Nachfrage nach Qualitätsschnittholz.</p>
                </div>
              </div>
            </div>
          </section>

        </div>{/* /main content */}

        <SiteFooter />

      </div>
    </>
  );
}
