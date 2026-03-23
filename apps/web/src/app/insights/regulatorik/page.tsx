import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LEXIKON } from "@/app/insights/data";

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

export const metadata = {
  title: "EU-Regulatorik | EUCX",
  description: "MiFID II, OTF, CBAM, MAR, EMIR – alle regulatorischen Grundlagen für den institutionellen Rohstoffhandel auf EUCX kompakt erklärt.",
};

export default function RegulatoriePage() {
  const regulierung = LEXIKON.filter(e => e.category === "Regulierung");

  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fff", color: "#1a1a1a" }}>
      <SiteNav activeHref="/insights/regulatorik" />

      {/* Hero */}
      <section style={{ backgroundColor: "#0b1e36", padding: "56px 0 48px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", display: "block", marginBottom: 10 }}>
            EU-Regulatorik
          </span>
          <h1 style={{ fontSize: 42, fontWeight: 300, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>
            Regulatorischer Rahmen
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 640 }}>
            MiFID II, CBAM, MAR, EMIR – die zentralen Regelwerke, die den institutionellen
            Rohstoffhandel auf EUCX formen. Kompakt erklärt, rechtlich fundiert.
          </p>
          {/* Regulierungs-Tags */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["MiFID II", "OTF § 72 WpHG", "CBAM (EU) 2023/956", "MAR (EU) 596/2014", "EMIR (EU) 648/2012", "GwG"].map(tag => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                color: "#c8d8ec", backgroundColor: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.12)",
                padding: "4px 12px",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CBAM Alert-Banner */}
      <div style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "14px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16 }}>&#9888;&#65039;</span>
          <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
            <strong>CBAM ab 1. Januar 2026 kostenpflichtig:</strong> Importeure betroffener Waren (Stahl, Aluminium, Düngemittel) müssen CBAM-Zertifikate erwerben.{" "}
            <Link href="/insights/lexikon/cbam" style={{ color: "#154194", fontWeight: 600, textDecoration: "none" }}>Mehr zu CBAM &rarr;</Link>
          </p>
        </div>
      </div>

      {/* Hauptinhalt */}
      <section style={{ padding: "64px 0 96px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>

          {/* Regelwerks-Übersicht */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", margin: "0 0 8px" }}>
              Maßgebliche Rechtsgrundlagen
            </h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px" }}>
              Alle Regelwerke, denen EUCX als BaFin-lizenzierter OTF-Betreiber unterliegt.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
              {[
                {
                  kuerzel: "MiFID II",
                  name: "Richtlinie 2014/65/EU",
                  beschreibung: "Rahmenwerk für Finanzmärkte. Schafft OTF als dritte Handelsplatzkategorie. Verpflichtet EUCX zu Best Execution, Transparenz und Interessenkonflikt-Management.",
                  farbe: "#154194",
                  href: "/insights/lexikon/mifid-ii-otf",
                },
                {
                  kuerzel: "MiFIR",
                  name: "Verordnung (EU) 600/2014",
                  beschreibung: "Ergänzt MiFID II. Regelt Pre-/Post-Trade-Transparenz und Transaktionsmeldepflichten (Art. 26). Alle EUCX-Geschäfte werden täglich an die BaFin gemeldet.",
                  farbe: "#1e40af",
                  href: "/insights/lexikon/mifid-ii-otf",
                },
                {
                  kuerzel: "CBAM",
                  name: "Verordnung (EU) 2023/956",
                  beschreibung: "CO₂-Grenzausgleichsmechanismus. Ab 2026 kostenpflichtig für Stahl-, Aluminium- und Düngemittelimporte. Direkte Auswirkung auf Importpreise auf EUCX.",
                  farbe: "#166534",
                  href: "/insights/lexikon/cbam",
                },
                {
                  kuerzel: "MAR",
                  name: "Verordnung (EU) 596/2014",
                  beschreibung: "Marktmissbrauchsverordnung. Verbietet Insiderhandel, Marktmanipulation und unzulässige Weitergabe von Insiderinformationen. EUCX überwacht alle Handelsaktivitäten in Echtzeit.",
                  farbe: "#7c3aed",
                  href: null,
                },
                {
                  kuerzel: "EMIR",
                  name: "Verordnung (EU) 648/2012",
                  beschreibung: "Regulierung von OTC-Derivaten. Meldepflichten für Derivatgeschäfte, zentrale Clearing-Pflicht für standardisierte Kontrakte. Relevant für EUCX-Termingeschäfte.",
                  farbe: "#92400e",
                  href: null,
                },
                {
                  kuerzel: "GwG",
                  name: "Geldwäschegesetz (DE)",
                  beschreibung: "Sorgfaltspflichten zur Verhinderung von Geldwäsche. EUCX prüft alle Teilnehmer nach KYC/AML-Standards. Suspicious Activity Reports (SAR) werden automatisch generiert.",
                  farbe: "#44403c",
                  href: null,
                },
              ].map(item => (
                <div key={item.kuerzel} style={{
                  border: "1px solid #e8e8e8",
                  padding: "24px",
                  borderTop: `3px solid ${item.farbe}`,
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                      color: item.farbe, backgroundColor: `${item.farbe}14`,
                      padding: "3px 10px",
                    }}>{item.kuerzel}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{item.name}</p>
                  <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.7, margin: 0 }}>{item.beschreibung}</p>
                  {item.href && (
                    <Link href={item.href} style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: "none", marginTop: "auto" }}>
                      Ausführlich erklärt &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lexikon-Einträge Regulierung */}
          {regulierung.length > 0 && (
            <div style={{ marginBottom: 64 }}>
              <h2 style={{ fontSize: 24, fontWeight: 300, color: "#1a1a1a", margin: "0 0 24px" }}>
                Vertiefende Lexikon-Einträge
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                {regulierung.map(entry => (
                  <Link key={entry.slug} href={`/insights/lexikon/${entry.slug}`}
                    style={{ textDecoration: "none", border: "1px solid #e8e8e8", padding: "20px 24px", display: "block", backgroundColor: "#fff" }}>
                    <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
                      {entry.category.toUpperCase()} · {entry.readMin} MIN
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: "0 0 8px" }}>{entry.term}</h3>
                    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: 0 }}>{entry.shortDef}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CBAM-Rechner Infobox */}
          <div style={{ backgroundColor: "#f0f4ff", border: "1px solid #c7d7f5", padding: "32px 36px", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 4, backgroundColor: BLUE, flexShrink: 0, alignSelf: "stretch" }} />
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", margin: "0 0 12px" }}>
                  CBAM-Aufschlag Beispielrechnung: Betonstahl-Import Türkei
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                  {[
                    { label: "Emissionen (Hochofen)", wert: "1,80 tCO₂/t" },
                    { label: "EUA-Preis (Q1 2026)", wert: "65,40 €/tCO₂" },
                    { label: "CBAM-Aufschlag", wert: "117,72 €/t" },
                    { label: "Importpreis + CBAM", wert: "737,72 €/t" },
                  ].map(row => (
                    <div key={row.label} style={{ backgroundColor: "#fff", padding: "14px 16px", border: "1px solid #dbeafe" }}>
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{row.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>{row.wert}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                  * Beispielrechnung auf Basis fiktiver, aber realistischer Werte. Tatsächliche CBAM-Berechnung gemäß Verordnung (EU) 2023/956.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance-Checkliste */}
          <div style={{ border: "1px solid #e8e8e8", padding: "32px 36px" }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", margin: "0 0 20px" }}>
              Compliance-Checkliste für neue Marktteilnehmer
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {[
                { schritt: "KYC/AML-Prüfung", status: "Pflicht vor Handelsbeginn", ok: true },
                { schritt: "LEI-Nummer (Legal Entity Identifier)", status: "Pflicht für juristische Personen", ok: true },
                { schritt: "CBAM-Compliance-Nachweis", status: "Bei Import aus Drittstaaten", ok: false },
                { schritt: "Initial Margin hinterlegen", status: "Min. 10.000 EUR oder 5 % des Volumens", ok: true },
                { schritt: "Handelsvolumengrenze festlegen", status: "Durch Compliance-Team genehmigt", ok: true },
                { schritt: "MiFID-II-Kategorisierung", status: "Geeigneter Gegenpart / Professioneller Kunde", ok: true },
              ].map(item => (
                <div key={item.schritt} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px", backgroundColor: "#fafafa", border: "1px solid #f0f0f0",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.ok ? "✓" : "○"}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{item.schritt}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 13, fontWeight: 700, color: "#fff",
                backgroundColor: BLUE, padding: "12px 24px", textDecoration: "none",
              }}>
                Registrierung starten &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
