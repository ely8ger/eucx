import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Marktanalysen – Wöchentliche Rohstoffpreisberichte | EUCX",
  description:
    "Aktuelle Preisentwicklungen für Betonstahl, Walzdraht, Kupfer, Aluminium, Weizen und Energie. Wöchentliche Marktkommentare für institutionelle Händler auf EUCX.",
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

const webPageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eucx.eu/insights/analysen",
      url: "https://eucx.eu/insights/analysen",
      name: "Marktanalysen – Wöchentliche Rohstoffpreisberichte | EUCX",
      description:
        "Aktuelle Preisentwicklungen für Betonstahl, Walzdraht, Kupfer, Aluminium, Weizen und Energie. Wöchentliche Marktkommentare für institutionelle Händler auf EUCX.",
      inLanguage: "de-DE",
      publisher: {
        "@type": "Organization",
        name: "EUCX – European Union Commodity Exchange",
        url: "https://eucx.eu",
      },
      dateModified: "2026-03-21",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Wie oft werden Marktanalysen auf EUCX veröffentlicht?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Wöchentlich, jeden Freitag bis 18:00 Uhr CET.",
          },
        },
        {
          "@type": "Question",
          name: "Sind die Marktanalysen kostenlos?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Aktuelle Ausgaben sind nur für registrierte EUCX-Mitglieder zugänglich. Die jeweils letzte Ausgabe ist 14 Tage nach Erscheinen öffentlich.",
          },
        },
        {
          "@type": "Question",
          name: "Welche Rohstoffe werden abgedeckt?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Stahl (Betonstahl, Walzdraht, Schrott), Nichteisenmetalle (Kupfer, Aluminium, Zink, Nickel), Agrar (Weizen, Raps, Harnstoff), Energie (Erdgas, Strom, CO₂-Zertifikate).",
          },
        },
        {
          "@type": "Question",
          name: "Kann ich frühere Ausgaben abrufen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ja. Das vollständige Archiv ab KW 1/2026 ist im Mitgliederportal verfügbar.",
          },
        },
        {
          "@type": "Question",
          name: "Werden die Analysen von Experten erstellt?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ja. Das EUCX Research Team besteht aus erfahrenen Rohstoff-Analysten mit Hintergrund bei Commodity-Handelshäusern und Investmentbanken.",
          },
        },
      ],
    },
  ],
};

// ── Tabellen-Hilfsstile ──────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  backgroundColor: "#f8f9fa",
  fontWeight: 600,
  padding: "10px 14px",
  textAlign: "left",
  borderBottom: "2px solid #e8e8e8",
  fontSize: 13,
  fontFamily: SANS,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 13,
  fontFamily: SANS,
};

function deltaColor(val: string | undefined) {
  if (!val) return "#666";
  if (val.startsWith("+")) return "#16a34a";
  if (val.startsWith("-")) return "#dc2626";
  return "#666";
}

function trendColor(t: string | undefined) {
  if (!t) return "#666";
  if (t === "↑") return "#16a34a";
  if (t === "↓") return "#dc2626";
  return "#666";
}

// ── Archiv-Daten ─────────────────────────────────────────────────────────────
const archiv = [
  { kw: "KW 11 / 2026", datum: "14. März 2026", headline: "Schrottpreise brechen ein — Betonstahl unter Druck" },
  { kw: "KW 10 / 2026", datum: "7. März 2026", headline: "Kupfer auf 3-Monats-Hoch: Elektrifizierungseffekt oder Spekulation?" },
  { kw: "KW 9 / 2026", datum: "28. Feb. 2026", headline: "CBAM-Übergangsphase: Importstahl aus der Türkei vor dem Preisanstieg" },
  { kw: "KW 8 / 2026", datum: "21. Feb. 2026", headline: "Erdgas (TTF) fällt auf 6-Monats-Tief — Energieintensive Industrie atmet auf" },
  { kw: "KW 7 / 2026", datum: "14. Feb. 2026", headline: "Weizen: Schwarzmeer-Export bricht Preisrekord" },
  { kw: "KW 6 / 2026", datum: "7. Feb. 2026", headline: "Nickel-Korrektur: -11 % seit Jahresbeginn — LME-Lageraufbau dominiert" },
  { kw: "KW 5 / 2026", datum: "31. Jan. 2026", headline: "Stahlmarkt Q1 2026: Saisonaler Aufschwung oder strukturelle Wende?" },
  { kw: "KW 4 / 2026", datum: "24. Jan. 2026", headline: "Düngemittel: Harnstoff-Preise steigen vor Frühjahrsbestellung" },
];

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export default function AnalysenPage() {
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <SiteNav activeHref="/insights/analysen" />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#0d1b2a", padding: "52px 24px 48px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>
            {" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>
            {" / "}
            <span style={{ color: "#7aa4d4" }}>Marktanalysen</span>
          </p>

          <h1 style={{ fontSize: 38, fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
            Marktanalysen
          </h1>
          <p style={{ fontSize: 15, color: "#8aa8cc", margin: "0 0 24px", fontWeight: 300 }}>
            Wöchentliche Preisberichte &amp; Kommentare — KW 12 / 2026
          </p>

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              "Aktualisiert: 21. März 2026",
              "Wöchentlich",
              "Nur für registrierte Mitglieder",
            ].map((badge) => (
              <span
                key={badge}
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  border: "1px solid #2a4a7a",
                  color: "#7aa4d4",
                  fontSize: 11,
                  letterSpacing: "0.04em",
                  fontWeight: 500,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── 2. MARKTKOMMENTAR DER WOCHE ─────────────────────────────── */}
        <div
          style={{
            borderLeft: `4px solid ${BLUE}`,
            backgroundColor: "#fff",
            padding: "32px 36px",
            marginBottom: 56,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 6px" }}>
            Marktkommentar KW 12 / 2026
          </h2>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 24px", letterSpacing: "0.04em" }}>
            21. März 2026 — EUCX Research Team
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333", margin: "0 0 18px" }}>
            Der Betonstahl-Markt zeigt sich nach dem scharfen Rückgang im Februar deutlich stabilisiert
            (+3,2 % WoW auf 698 €/t DAP Frankfurt). Als Haupttreiber sind die gestiegene Bauaktivität
            in Deutschland und Polen sowie rückläufige Schrottpreise in der Türkei zu nennen — dem
            größten EAF-Stahlproduzenten Europas. Türkische Werke haben ihre Schrottbeschaffungskosten
            signifikant reduziert, was kurzfristig zu wettbewerbsfähigeren Exportpreisen führt, jedoch
            gleichzeitig die Preisdurchsetzungskraft bei Endabnehmern begrenzt.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333", margin: "0 0 18px" }}>
            Die Notierungen für Walzdraht bleiben hingegen unter Druck: Überkapazitäten aus
            osteuropäischen Werken — insbesondere aus Rumänien und der Ukraine — drücken die Spotpreise
            auf 672 €/t DAP Duisburg (-0,6 % WoW). Im Agrarsektor sorgt ein angespanntes
            Wettergeschehen in der Schwarzmeerregion für spürbaren Preisdruck bei MATIF-Weizen
            (+1,8 % WoW auf 218 €/t). Analysten beobachten die ukrainischen Winterweizenbestände
            genau; erste Satellitendaten deuten auf punktuelle Frostschäden hin.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333", margin: "0 0 18px" }}>
            Kupfer notiert auf einem 3-Monats-Hoch von 9.847 $/t, getrieben durch anhaltende Nachfrage
            aus dem Elektrifizierungssektor und geringere Lagerbestände an der LME (aktuelle LME-Stocks:
            87.450 t, -12 % vs. Vorwoche). Energie: Erdgas (TTF) verliert 4,1 % WoW auf 34,20 €/MWh
            nach einem milden Wetterverlauf in Nordeuropa und überdurchschnittlich hohen Speicherständen
            in Deutschland (aktuell 62 % Füllstand).
          </p>

          <blockquote
            style={{
              margin: "24px 0 0",
              padding: "18px 24px",
              backgroundColor: "#f0f4fb",
              borderLeft: `3px solid ${BLUE}`,
              fontSize: 14,
              fontStyle: "italic",
              color: "#154194",
              lineHeight: 1.7,
            }}
          >
            „Ausblick: Wir erwarten für KW 13 eine Seitwärtsbewegung bei Baustahl. CBAM-Effekte werden
            ab Q3 2026 die Importpreise spürbar anheben — langfristig bullisch für EU-Produzenten."
            <br />
            <span style={{ fontStyle: "normal", fontSize: 12, color: "#666", display: "block", marginTop: 8 }}>
              — EUCX Research Team, 21. März 2026
            </span>
          </blockquote>
        </div>

        {/* ── 3. PREISENTWICKLUNGS-TABELLEN ───────────────────────────── */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px" }}>
          Aktuelle Marktpreise KW 12 / 2026
        </h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 32px", lineHeight: 1.6 }}>
          Alle Preisangaben sind Richtwerte auf Basis von EUCX-Plattformdaten und öffentlich verfügbaren
          Börsenpreisen. Δ WoW = Veränderung gegenüber Vorwoche, Δ MoM = gegenüber Vormonat.
        </p>

        {/* Tabelle 1 — Stahl & Eisen */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: BLUE, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Stahl &amp; Eisen
        </h3>
        <div style={{ overflowX: "auto", marginBottom: 40, backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Rohstoff", "Spezifikation", "Preis KW 12", "Δ WoW", "Δ MoM", "Trend"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Betonstahl", "B500B, 12 mm, DAP Frankfurt", "698 €/t", "+3,2 %", "-1,4 %", "↑"],
                ["Walzdraht", "SAE 1008, 5,5 mm, DAP Duisburg", "672 €/t", "-0,6 %", "-3,1 %", "→"],
                ["Warmband", "S235JR, 3 mm, EXW Ruhrgebiet", "734 €/t", "+1,1 %", "+0,4 %", "↑"],
                ["Schrott", "HMS 1/2, EXW Hafen Hamburg", "385 €/t", "-2,3 %", "-5,7 %", "↓"],
                ["Stranggussbramme", "Q235B, 200 mm, CIF ARA", "542 €/t", "+0,8 %", "+2,1 %", "↑"],
              ].map(([rohstoff, spec, preis, wow, mom, trend]) => (
                <tr key={rohstoff}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{rohstoff}</td>
                  <td style={{ ...tdStyle, color: "#555" }}>{spec}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{preis}</td>
                  <td style={{ ...tdStyle, color: deltaColor(wow), fontWeight: 600 }}>{wow}</td>
                  <td style={{ ...tdStyle, color: deltaColor(mom), fontWeight: 600 }}>{mom}</td>
                  <td style={{ ...tdStyle, color: trendColor(trend), fontWeight: 700, fontSize: 16 }}>{trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabelle 2 — Nichteisenmetalle */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: BLUE, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Nichteisenmetalle
        </h3>
        <div style={{ overflowX: "auto", marginBottom: 40, backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Rohstoff", "Basis", "Preis KW 12", "Δ WoW", "Δ MoM", "Trend"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Kupfer", "LME Cash, $/t", "9.847 $/t", "+2,7 %", "+5,2 %", "↑"],
                ["Aluminium", "LME Cash, $/t", "2.419 $/t", "+0,4 %", "-2,1 %", "→"],
                ["Zink", "LME Cash, $/t", "2.756 $/t", "-1,2 %", "-0,9 %", "→"],
                ["Nickel", "LME Cash, $/t", "15.340 $/t", "-3,1 %", "-8,4 %", "↓"],
              ].map(([rohstoff, basis, preis, wow, mom, trend]) => (
                <tr key={rohstoff}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{rohstoff}</td>
                  <td style={{ ...tdStyle, color: "#555" }}>{basis}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{preis}</td>
                  <td style={{ ...tdStyle, color: deltaColor(wow), fontWeight: 600 }}>{wow}</td>
                  <td style={{ ...tdStyle, color: deltaColor(mom), fontWeight: 600 }}>{mom}</td>
                  <td style={{ ...tdStyle, color: trendColor(trend), fontWeight: 700, fontSize: 16 }}>{trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabelle 3 — Agrar & Düngemittel */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: BLUE, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Agrar &amp; Düngemittel
        </h3>
        <div style={{ overflowX: "auto", marginBottom: 40, backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Rohstoff", "Basis", "Preis KW 12", "Δ WoW", "Δ MoM"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Weizen", "MATIF, €/t", "218 €/t", "+1,8 %", "+3,4 %"],
                ["Raps", "MATIF, €/t", "492 €/t", "-0,3 %", "+1,1 %"],
                ["Harnstoff", "CIF Hamburg, $/t", "485 $/t", "+0,9 %", "-1,7 %"],
                ["Ammoniumnitrat", "CIF ARA, €/t", "368 €/t", "+1,4 %", "+2,6 %"],
              ].map(([rohstoff, basis, preis, wow, mom]) => (
                <tr key={rohstoff}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{rohstoff}</td>
                  <td style={{ ...tdStyle, color: "#555" }}>{basis}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{preis}</td>
                  <td style={{ ...tdStyle, color: deltaColor(wow), fontWeight: 600 }}>{wow}</td>
                  <td style={{ ...tdStyle, color: deltaColor(mom), fontWeight: 600 }}>{mom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabelle 4 — Energie & CO₂ */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: BLUE, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Energie &amp; CO₂
        </h3>
        <div style={{ overflowX: "auto", marginBottom: 60, backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Rohstoff", "Basis", "Preis KW 12", "Δ WoW"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Erdgas TTF", "€/MWh", "34,20 €/MWh", "-4,1 %"],
                ["Strom EEX Base", "€/MWh", "89,50 €/MWh", "+2,3 %"],
                ["EU-ETS (EUA)", "€/tCO₂", "65,40 €/tCO₂", "-0,8 %"],
                ["Brent Crude", "$/bbl", "74,30 $/bbl", "+1,2 %"],
              ].map(([rohstoff, basis, preis, wow]) => (
                <tr key={rohstoff}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{rohstoff}</td>
                  <td style={{ ...tdStyle, color: "#555" }}>{basis}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{preis}</td>
                  <td style={{ ...tdStyle, color: deltaColor(wow), fontWeight: 600 }}>{wow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 4. TIEFENANALYSEN ────────────────────────────────────────── */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 32px" }}>
          Markt-Tiefenanalysen KW 12
        </h2>

        {/* 4.1 Betonstahl */}
        <div style={{ backgroundColor: "#fff", padding: "32px 36px", marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: BLUE, margin: "0 0 20px" }}>
            4.1 Betonstahl: Stabilisierung nach Winter-Delle
          </h3>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            Nach einem turbulenten Februar — geprägt von sinkenden Spotpreisen infolge schwacher
            Baunachfrage und hoher Lagerbestände bei deutschen Händlern — zeichnet sich zum Ende
            von KW 12 eine deutliche Stabilisierung ab. Der Preis für{" "}
            <Link href="/insights/lexikon/betonstahl" style={{ color: BLUE, textDecoration: "underline" }}>
              Betonstahl
            </Link>{" "}
            (B500B, 12 mm, DAP Frankfurt) notiert bei 698 €/t — ein Zuwachs von 3,2 % gegenüber
            der Vorwoche. Damit liegt das Material wieder nahe am Jahresauftaktsniveau von Anfang Januar
            (706 €/t).
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>Angebotsseite — Türkei dominiert das EAF-Segment:</strong> Die Türkei ist mit einer
            Jahresproduktion von über 40 Mio. Tonnen der wichtigste EAF-Stahlproduzent Europas. In den
            vergangenen Wochen sind die lokalen Schrottpreise in türkischen Häfen um rund 15 $/t
            gefallen — ein Effekt des geringeren Angebots aus den USA (Exportdrosselung wegen Binnenpreisen)
            und steigender europäischer Schrottsammlung. Diese Kostenentlastung auf der Inputseite erlaubt
            türkischen Exporteuren, ihre Angebote leicht zu senken, ohne Margen zu gefährden. Der
            resultierende Wettbewerbsdruck auf EU-Hersteller ist real, wird aber durch steigende{" "}
            <Link href="/insights/lexikon/cbam" style={{ color: BLUE, textDecoration: "underline" }}>
              CBAM-Kosten
            </Link>{" "}
            mittelfristig abgefedert.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>Nachfrageseite — Deutschland, Polen, Frankreich:</strong> Im deutschen Bausektor
            signalisieren aktuelle Auftragseingänge eine vorsichtige Erholung nach dem langen Frosteinbruch
            im Januar/Februar. Der Rückstau an verschobenen Projekten — insbesondere im sozialen Wohnungsbau
            und im Infrastrukturbereich — stützt die Nachfrage für Q2 2026. In Polen setzt die fortgesetzte
            EU-Kohäsionsfondförderung neue Impulse: Mehrere Großprojekte in der Transportinfrastruktur
            (Autobahnen A1 Erweiterung, S7 Lückenschluss) benötigen signifikante Betonstahl-Volumina.
            Frankreich bleibt verhalten; die angespannte Haushaltslage bremst staatliche Bauprojekte.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>CBAM-Erwartungseffekte:</strong> Die vollständige CBAM-Implementierungsphase beginnt
            Anfang Q3 2026. Importeure von Betonstahl aus Drittstaaten müssen dann CBAM-Zertifikate
            vorweisen, deren Preis an den EU-ETS-Kurs (aktuell 65,40 €/tCO₂) gekoppelt ist. Bei einem
            CO₂-Intensitätswert von rund 1,6 tCO₂/t für türkischen EAF-Stahl ergibt sich ein
            theoretischer CBAM-Aufschlag von ca. 100–105 €/t — ein erheblicher Wettbewerbsvorteil für
            EU-integrierte Hochofenproduzenten. Die Markterwartung dieser Verschiebung ist bereits
            partiell in den Futures eingepreist.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 24px" }}>
            <strong>Energiekosten bleiben entscheidender Faktor:</strong> EAF-Stahlwerke benötigen
            je nach Effizienz 380–480 kWh Strom pro Tonne Rohstahl. Bei einem EEX-Base-Preis von
            89,50 €/MWh entspricht das Energiekosten von 34–43 €/t allein für Strom — ein wesentlicher
            Kostentreiber, der die Produktionsmengenentscheidungen prägt. Werke mit langfristigen
            PPA-Verträgen (Power Purchase Agreements) sind hier klar im Vorteil.
          </p>

          {/* Regionale Preisunterschiede */}
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#444", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Regionale Preisunterschiede — Betonstahl B500B, KW 12
          </h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Lieferort", "Preis €/t", "Δ vs. Frankfurt"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Frankfurt (DE)", "698 €/t", "—"],
                  ["Paris (FR)", "704 €/t", "+0,9 %"],
                  ["Warschau (PL)", "682 €/t", "-2,3 %"],
                  ["Madrid (ES)", "718 €/t", "+2,9 %"],
                ].map(([ort, preis, delta]) => (
                  <tr key={ort}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{ort}</td>
                    <td style={tdStyle}>{preis}</td>
                    <td style={{ ...tdStyle, color: delta === "—" ? "#666" : deltaColor(delta), fontWeight: 600 }}>
                      {delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4.2 Kupfer */}
        <div style={{ backgroundColor: "#fff", padding: "32px 36px", marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: BLUE, margin: "0 0 20px" }}>
            4.2 Kupfer: Elektrifizierungsnachfrage treibt Notierungen
          </h3>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            Kupfer notiert in KW 12 auf dem höchsten Stand seit drei Monaten: 9.847 $/t an der{" "}
            <Link href="/insights/lexikon/lme-notierung" style={{ color: BLUE, textDecoration: "underline" }}>
              LME (Cash Settlement)
            </Link>
            . Der Anstieg von 2,7 % gegenüber der Vorwoche setzt eine Erholung fort, die Anfang März
            nach den Tiefständen infolge chinesischer Konjunktursorgen einsetzte. Entscheidend ist dabei
            das strukturelle Ungleichgewicht zwischen einer Nachfrage, die durch die Energiewende
            langfristig wächst, und einem Angebot, das durch geopolitische und geologische Restriktionen
            begrenzt bleibt.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>LME-Lagerbestände auf Mehrmonatstief:</strong> Die offiziellen LME-Lagerbestände
            lagen per 21. März bei 87.450 Tonnen — ein Rückgang von 12 % gegenüber der Vorwoche und der
            niedrigste Stand seit Oktober 2025. Sinkende Warehousebestände signalisieren, dass physisches
            Metall zunehmend für industrielle Verarbeitung abgezogen wird, statt spekulativ eingelagert
            zu bleiben. Der Spread zwischen Cash und 3-Monats-Future (Backwardation) beträgt aktuell
            ca. 48 $/t — ein Zeichen physischer Marktanspannung.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>Nachfrageseite — Elektrifizierung als struktureller Treiber:</strong> Ein modernes
            Elektrofahrzeug (BEV) benötigt im Durchschnitt 83 kg Kupfer — gegenüber nur 23 kg bei
            einem konventionellen Verbrenner. Mit europaweit über 2,8 Mio. verkauften BEV in 2025 und
            weiter steigender Tendenz wächst der automobile Kupferbedarf erheblich. Hinzu kommt der
            Stromnetzausbau: Der europäische Netzentwicklungsplan 2026–2035 sieht Investitionen von
            über 380 Mrd. EUR vor — ein wesentlicher Teil davon in kupferintensive Kabelsysteme und
            Transformatoren. Windkraftanlagen (Offshore wie Onshore) benötigen je MW installierter
            Leistung rund 3,6 t Kupfer.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>Angebotsseite — Produktionsausfälle in Chile und Peru:</strong> Chile ist mit einem
            Weltmarktanteil von ca. 27 % der mit Abstand größte Kupferproduzent. Codelco — der
            staatliche chilenische Konzern — meldete in Q1 2026 einen produktionsbedingten Ausfall von
            rund 18.000 t aufgrund von Wartungsarbeiten an der Chuquicamata-Mine sowie anhaltender
            Wasserknappheit im Hochland. In Peru führten soziale Unruhen rund um das Cerro-Verde-Projekt
            (Freeport-McMoRan) zu vorübergehenden Betriebsunterbrechungen. Kombiniert ergibt sich
            ein angebotseitiger Druck, der die Preisstärke fundamental untermauert.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 0" }}>
            <strong>Ausblick:</strong> Der Konsens unter EUCX-Analysten liegt für KW 13 bei einer
            Konsolidierung im Bereich 9.750–9.950 $/t. Ein Unterschreiten der 9.600 $/t-Marke gilt
            als unwahrscheinlich, solange die LME-Lagerbestände auf diesem Niveau bleiben. Mittelfristig
            (Q3/Q4 2026) werden Analysten im Schnitt einen Kurs von 10.200–10.500 $/t erwarten.
          </p>
        </div>

        {/* 4.3 Agrar */}
        <div style={{ backgroundColor: "#fff", padding: "32px 36px", marginBottom: 60, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: BLUE, margin: "0 0 20px" }}>
            4.3 Agrarsektor: Schwarzmeer-Wetter unter Beobachtung
          </h3>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            Der MATIF-Weizenkontrakt (Front-Month, Lieferung Mai 2026) schloss KW 12 bei 218 €/t —
            ein Wochenplus von 1,8 %. Auslöser ist eine Lage, die Getreidehändler seit Jahren kennen
            und fürchten: unberechenbare Witterungsverhältnisse in der Schwarzmeerregion zu einem
            kritischen Zeitpunkt im Vegetationszyklus. Die Ukraine, drittgrößter Weizen-Exporteur der
            Welt nach Russland und der EU, verzeichnete in der zweiten Märzdekade ungewöhnlich starke
            Kälterückfälle (-8 bis -12 °C nachts) nach einer frühen Warmphase im Februar, die bereits
            das Bestockungswachstum angeregt hatte. Erste Satellitenbilder zeigen unregelmäßige
            Verfärbungen in der Vegetationsbedeckung in der Zentralukraine.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>MATIF-Futures-Positionierung:</strong> Das CFTC-Äquivalent der EU (ESMA-Daten)
            zeigt, dass spekulativer Netto-Long bei MATIF-Weizen auf den höchsten Stand seit
            Oktober 2025 gestiegen ist. Managed Money baute in KW 11 und KW 12 kombiniert rund
            12.400 Kontrakte Long auf. Dies deutet auf eine zunehmend bullische Markterwartung hin,
            die über das aktuelle Wetterrisiko hinausgeht und fundamentale Angebotssorgen für die
            Ernte 2026 widerspiegelt.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: "0 0 16px" }}>
            <strong>Harnstoff — Frühjahrsbestellungseffekt:</strong> Harnstoff (CIF Hamburg) stieg
            auf 485 $/t (+0,9 % WoW). Die Frühjahrsbestellsaison setzt typischerweise ab Mitte März
            ein: Landwirte in Deutschland, Frankreich und Polen decken ihren Stickstoffdüngerbedarf
            für die anstehende Vegetationsperiode ein. Dieser saisonale Nachfrageimpuls trifft auf ein
            Angebot, das durch anhaltend hohe Erdgaspreise in Europa (Produktionskosten für
            Stickstoffdünger direkt an Gaspreise geknüpft) und gedrosselte russische Exportmengen
            beschränkt bleibt. Russland, historisch größter Harnstoffexporteur Europas, hat seine
            Exportquoten für Q1 2026 erneut verlängert.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", margin: 0 }}>
            <strong>Ammoniumnitrat</strong> folgt dem Trend mit +1,4 % WoW auf 368 €/t (CIF ARA). Das
            Produkt ist in der EU durch strenge Sicherheitsvorschriften (UN 2067, REACH) reguliert,
            was die Importmöglichkeiten aus Russland und Belarus faktisch einschränkt und die
            Preissensitivität gegenüber europäischen Produktionskosten erhöht.
          </p>
        </div>

        {/* ── 5. ARCHIV ────────────────────────────────────────────────── */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px" }}>
          Frühere Ausgaben
        </h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>
          Das vollständige Archiv ab KW 1/2026 ist im Mitgliederportal verfügbar.
        </p>
        <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflowX: "auto", marginBottom: 60 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Ausgabe", "Datum", "Headline", "Zugang"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {archiv.map(({ kw, datum, headline }) => (
                <tr key={kw}>
                  <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: "nowrap" }}>{kw}</td>
                  <td style={{ ...tdStyle, color: "#888", whiteSpace: "nowrap" }}>{datum}</td>
                  <td style={{ ...tdStyle, color: "#aaa", fontStyle: "italic" }}>{headline}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        backgroundColor: "#f0f0f0",
                        color: "#999",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.03em",
                      }}
                    >
                      Registrierte Mitglieder
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 6. FAQ ───────────────────────────────────────────────────── */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 24px" }}>
          Häufige Fragen
        </h2>
        <div style={{ marginBottom: 60 }}>
          {[
            {
              q: "Wie oft werden Marktanalysen auf EUCX veröffentlicht?",
              a: "Wöchentlich, jeden Freitag bis 18:00 Uhr CET. Bei außerordentlichen Marktbewegungen (z. B. Flash-Events an der LME oder geopolitische Schocks) publiziert das EUCX Research Team zusätzliche Kurzkommentare.",
            },
            {
              q: "Sind die Marktanalysen kostenlos?",
              a: "Aktuelle Ausgaben sind nur für registrierte EUCX-Mitglieder zugänglich. Die jeweils letzte Ausgabe ist 14 Tage nach Erscheinen öffentlich und frei zugänglich. Das vollständige Archiv bleibt Mitgliedern vorbehalten.",
            },
            {
              q: "Welche Rohstoffe werden abgedeckt?",
              a: "Stahl (Betonstahl, Walzdraht, Warmband, Schrott), Nichteisenmetalle (Kupfer, Aluminium, Zink, Nickel), Agrar (Weizen, Raps, Harnstoff, Ammoniumnitrat), Energie (Erdgas TTF, Strom EEX, EU-ETS/EUA, Brent Crude).",
            },
            {
              q: "Kann ich frühere Ausgaben abrufen?",
              a: "Ja. Das vollständige Archiv ab KW 1/2026 ist im Mitgliederportal verfügbar. Ältere Ausgaben können auf Anfrage beim EUCX Research Team angefordert werden.",
            },
            {
              q: "Werden die Analysen von Experten erstellt?",
              a: "Ja. Das EUCX Research Team besteht aus erfahrenen Rohstoff-Analysten mit Hintergrund bei Commodity-Handelshäusern, Investmentbanken und europäischen Energieunternehmen. Alle Preisangaben werden auf Basis von Plattformdaten, Börsen-Feeds und Marktgesprächen mit Handelsteilnehmern erstellt.",
            },
          ].map(({ q, a }, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#fff",
                padding: "22px 28px",
                marginBottom: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px" }}>{q}</p>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>

        {/* ── 7. CTA-BLOCK ─────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: BLUE,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0, textAlign: "center" }}>
            Vollständige Berichte lesen
          </h2>
          <p style={{ fontSize: 14, color: "#a8c0e8", margin: 0, textAlign: "center", maxWidth: 520, lineHeight: 1.7 }}>
            Registrierte EUCX-Mitglieder erhalten jede Woche den vollständigen Marktbericht inklusive
            aller Tiefenanalysen, regionaler Preisgrafiken und Research-Notizen direkt nach Veröffentlichung.
          </p>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              backgroundColor: "#fff",
              color: BLUE,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            Jetzt registrieren →
          </Link>
        </div>

      </div>

      <SiteFooter />
    </div>
  );
}
