import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LEXIKON } from "@/app/insights/data";

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

export const metadata = {
  title: "EU-Regulatorik: MiFID II, CBAM, MAR, EMIR | EUCX",
  description: "Vollständiger Regulatorik-Guide für institutionellen Rohstoffhandel: MiFID II OTF, CBAM ab 2026, Marktmissbrauch MAR, EMIR-Derivate. BaFin-lizenziert.",
};

export default function RegulatoriePage() {
  const regulierung = LEXIKON.filter(e => e.category === "Regulierung");

  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fff", color: "#1a1a1a" }}>
      <style>{`
        .reg-card {
          transition: transform 200ms ease, box-shadow 200ms ease, border-top-width 150ms ease;
        }
        .reg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          border-top-width: 4px !important;
        }
        .reg-lex-card {
          transition: background-color 200ms ease, box-shadow 200ms ease, border-left-width 150ms ease;
        }
        .reg-lex-card:hover {
          background-color: #f0f4ff !important;
          box-shadow: 0 4px 16px rgba(21,65,148,0.10);
          border-left: 4px solid #154194 !important;
        }
        .reg-lex-card:hover h3 { color: #154194; }
        .reg-tag {
          transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
          cursor: default;
        }
        .reg-tag:hover {
          background-color: rgba(255,255,255,0.16) !important;
          transform: translateY(-1px);
        }
        .reg-stat {
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .reg-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(21,65,148,0.12);
        }
        .reg-check {
          transition: background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
        }
        .reg-check:hover {
          background-color: #f0f4ff !important;
          box-shadow: 0 2px 8px rgba(21,65,148,0.08);
          transform: translateX(3px);
        }
        .reg-faq {
          transition: background-color 180ms ease;
          cursor: default;
        }
        .reg-faq:hover {
          background-color: #f8faff !important;
        }
        .reg-cta {
          transition: background-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
        }
        .reg-cta:hover {
          background-color: #0f2d6b !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(21,65,148,0.30);
        }
        .reg-link {
          transition: letter-spacing 150ms ease, opacity 150ms ease;
        }
        .reg-link:hover {
          opacity: 0.75;
          letter-spacing: 0.01em;
        }
      `}</style>
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
          <div className="r-reg-tags" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["MiFID II", "OTF § 72 WpHG", "CBAM (EU) 2023/956", "MAR (EU) 596/2014", "EMIR (EU) 648/2012", "GwG"].map(tag => (
              <span key={tag} className="reg-tag" style={{
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
      <section className="r-reg-section" style={{ padding: "64px 0 96px" }}>
        <div className="r-container">

          {/* Regelwerks-Übersicht */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", margin: "0 0 8px" }}>
              Maßgebliche Rechtsgrundlagen
            </h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px" }}>
              Alle Regelwerke, denen EUCX als BaFin-lizenzierter OTF-Betreiber unterliegt.
            </p>

            <div className="r-reg-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
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
                  href: "/insights/lexikon/mar-marktmissbrauch",
                },
                {
                  kuerzel: "EMIR",
                  name: "Verordnung (EU) 648/2012",
                  beschreibung: "Regulierung von OTC-Derivaten. Meldepflichten für Derivatgeschäfte, zentrale Clearing-Pflicht für standardisierte Kontrakte. Relevant für EUCX-Termingeschäfte.",
                  farbe: "#92400e",
                  href: "/insights/lexikon/emir-derivate",
                },
                {
                  kuerzel: "GwG",
                  name: "Geldwäschegesetz (DE)",
                  beschreibung: "Sorgfaltspflichten zur Verhinderung von Geldwäsche. EUCX prüft alle Teilnehmer nach KYC/AML-Standards. Suspicious Activity Reports (SAR) werden automatisch generiert.",
                  farbe: "#44403c",
                  href: "/insights/lexikon/gwg-geldwaesche",
                },
              ].map(item => (
                <div key={item.kuerzel} className="reg-card" style={{
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
                    <Link href={item.href} className="reg-link" style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: "none", marginTop: "auto" }}>
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
                    className="reg-lex-card"
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
                    <div key={row.label} className="reg-stat" style={{ backgroundColor: "#fff", padding: "14px 16px", border: "1px solid #dbeafe" }}>
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

          {/* ── CBAM in der Praxis ─────────────────────────────────── */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", margin: "0 0 8px" }}>
              CBAM in der Praxis — Was Händler wissen müssen
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 24px", maxWidth: 780 }}>
              Der Carbon Border Adjustment Mechanism (CBAM) — Verordnung (EU) 2023/956 — tritt ab{" "}
              <strong>1. Januar 2026</strong> in seiner kostenpflichtigen Phase in Kraft. Die Übergangsphase
              (Oktober 2023 – Dezember 2025) verpflichtete Importeure bereits zur Quartalsberichterstattung
              ohne Zahlungspflicht. Ab 2026 müssen CBAM-Importeure (definiert als in der EU ansässige
              natürliche oder juristische Personen, die CBAM-Waren in das Zollgebiet einführen)
              CBAM-Zertifikate erwerben und vorhalten. Jedes Zertifikat entspricht einer Tonne CO₂e und
              wird zu einem Preis veräußert, der dem wöchentlichen Durchschnittspreis der EU-ETS-Zertifikate
              (EUA) entspricht.
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 24px", maxWidth: 780 }}>
              Die praktischen Konsequenzen für Importeure sind erheblich: Sie müssen sich beim nationalen
              Zollregister als CBAM-Anmelder registrieren, bis zum 31. Mai jedes Jahres eine Jahreserklärung
              über die im Vorjahr eingeführten Waren und deren eingebettete Emissionen einreichen und eine
              ausreichende Anzahl von CBAM-Zertifikaten auf ihrem Konto vorhalten. Händler, die auf EUCX
              Waren importieren, sind unmittelbar betroffen — die Kosten fließen direkt in die Preiskalkulation
              ein und beeinflussen die Wettbewerbsfähigkeit gegenüber EU-produzierter Ware.
            </p>

            {/* CN-Code-Tabelle */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: "0 0 16px" }}>
              Betroffene Warengruppen auf EUCX
            </h3>
            <div style={{ overflowX: "auto", marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: SANS }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f4ff" }}>
                    {["Warengruppe", "Beispiele", "Ø CO₂-Intensität", "CBAM-Aufschlag (EUA 65 €)"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, borderBottom: "2px solid #c7d7f5" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { gruppe: "Stahl/Eisen (HS 72)", beispiele: "Betonstahl, Walzdraht, Brammen", co2: "1,6–2,0 tCO₂/t", aufschlag: "104–130 €/t" },
                    { gruppe: "Aluminium (HS 76)", beispiele: "Primäraluminium, Pressbolzen", co2: "6,5–16 tCO₂/t", aufschlag: "423–1.040 €/t" },
                    { gruppe: "Düngemittel (HS 31)", beispiele: "Harnstoff, Ammoniumnitrat", co2: "1,4–2,8 tCO₂/t", aufschlag: "91–182 €/t" },
                    { gruppe: "Strom (HS 2716)", beispiele: "Elektrischer Strom", co2: "variabel", aufschlag: "variabel" },
                  ].map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                      <td style={{ padding: "10px 16px", borderBottom: "1px solid #eef0f8", fontWeight: 600, color: "#1a1a1a" }}>{row.gruppe}</td>
                      <td style={{ padding: "10px 16px", borderBottom: "1px solid #eef0f8", color: "#555" }}>{row.beispiele}</td>
                      <td style={{ padding: "10px 16px", borderBottom: "1px solid #eef0f8", color: "#555", fontFamily: "'IBM Plex Mono', monospace" }}>{row.co2}</td>
                      <td style={{ padding: "10px 16px", borderBottom: "1px solid #eef0f8", fontWeight: 700, color: BLUE, fontFamily: "'IBM Plex Mono', monospace" }}>{row.aufschlag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CBAM-Zeitplan */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: "0 0 16px" }}>
              CBAM-Zeitplan
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
              {[
                { datum: "Okt 2023", text: "Übergangsphase beginnt — nur Berichtspflicht (quartalsweise), keine Zahlungspflicht", aktiv: false },
                { datum: "Jan 2026", text: "Kostenpflichtige Phase: CBAM-Zertifikate werden Pflicht. Preis orientiert sich am EU-ETS.", aktiv: true },
                { datum: "2026–2034", text: "EU-ETS-Freiallokationen für betroffene Sektoren werden schrittweise abgebaut (ca. −10 % p.a.)", aktiv: false },
                { datum: "Ab 2034", text: "Vollimplementierung: 100 % kostenpflichtig, keine Freiallokationen mehr für CBAM-Waren", aktiv: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: item.aktiv ? BLUE : "#c7d7f5", marginTop: 14, flexShrink: 0 }} />
                    {i < 3 && <div style={{ width: 2, flex: 1, backgroundColor: "#e0e8f4" }} />}
                  </div>
                  <div style={{ padding: "10px 0 18px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: item.aktiv ? BLUE : "#888", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                      {item.datum}
                    </span>
                    <p style={{ fontSize: 13, color: "#505050", margin: 0, lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/insights/lexikon/cbam" className="reg-link" style={{ fontSize: 13, color: BLUE, fontWeight: 600, textDecoration: "none" }}>
              &rarr; Ausführliche CBAM-Erklärung im Lexikon
            </Link>
          </div>

          {/* ── ESG-Reporting ──────────────────────────────────────────── */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", margin: "0 0 8px" }}>
              ESG-Reporting für Rohstoffhändler
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 780 }}>
              Mit der <strong>CSRD (Corporate Sustainability Reporting Directive)</strong> — Richtlinie
              2022/2464/EU — hat die EU eine umfassende Berichtspflicht für Nachhaltigkeitsinformationen
              eingeführt. Für große Unternehmen (mehr als 500 Mitarbeiter) gilt die Pflicht seit dem
              Geschäftsjahr 2024, für kapitalmarktorientierte KMU stufenweise ab 2026–2027. Unternehmen,
              die auf EUCX handeln und in diese Schwellenwerte fallen, müssen ihren Nachhaltigkeitsbericht
              nach den European Sustainability Reporting Standards (ESRS) erstellen.
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 780 }}>
              Die <strong>SFDR (Sustainable Finance Disclosure Regulation)</strong> — Verordnung
              (EU) 2019/2088 — betrifft primär Finanzmarktteilnehmer und Finanzberater. Wer
              Rohstoff-Fonds oder strukturierte Produkte auf Rohstoffbasis anbietet, muss die
              Nachhaltigkeitseigenschaften seiner Produkte offenlegen (Artikel-6-, 8- oder
              9-Produkte gemäß SFDR-Klassifizierung).
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 780 }}>
              Im Rohstoffhandel sind die <strong>Scope-Emissionen</strong> besonders relevant:
              Scope 1 umfasst direkte Emissionen aus eigenen Anlagen (z.B. Lagerhaltung, Fuhrpark),
              Scope 2 die indirekten Emissionen aus eingekaufter Energie. Für Rohstoffhändler
              entscheidend ist Scope 3 — die vor- und nachgelagerten Emissionen entlang der
              Lieferkette. Beim Kauf und Verkauf von Stahl, Dünger oder Aluminium entstehen die
              größten CO₂-Äquivalente in Produktion und Transport, die dem Händler als Scope-3-Emissionen
              zuzurechnen sind.
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 24px", maxWidth: 780 }}>
              <strong>Praktische Anforderungen für EUCX-Teilnehmer:</strong> Dokumentieren Sie für
              jeden Kauf die Herkunft der Ware (Ursprungsland, Produktionsweg), erfassen Sie die
              eingebetteten Emissionen (embedded emissions) für CBAM-pflichtige Waren und führen Sie
              ein Transaktionsregister, das für die CSRD-Berichterstattung verwendet werden kann.
              Auf Basis der EUCX-Handelsdaten lassen sich CO₂-Äquivalente pro Transaktion berechnen.
            </p>

            {/* ESG Infobox */}
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 4, backgroundColor: "#166534", flexShrink: 0, alignSelf: "stretch" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#166534", margin: "0 0 8px" }}>
                    EUCX CO₂-Tracking
                  </p>
                  <p style={{ fontSize: 13, color: "#14532d", lineHeight: 1.7, margin: 0 }}>
                    Das Handelssystem berechnet automatisch die geschätzten Scope-3-Emissionen jeder
                    Transaktion auf Basis von Produktkategorie, Herkunftsland und Handelsvolumen. Die
                    aggregierten Emissionsdaten stehen EUCX-Teilnehmern im Mitgliederbereich als
                    strukturierter Export (CSV/PDF) für das ESG-Reporting zur Verfügung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── MAR — Marktmissbrauch ──────────────────────────────────── */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", margin: "0 0 8px" }}>
              MAR — Marktmissbrauch im Rohstoffhandel
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 780 }}>
              Die <strong>Marktmissbrauchsverordnung (MAR)</strong> — Verordnung (EU) 596/2014 —
              verbietet Insiderhandel, Marktmanipulation und die unrechtmäßige Weitergabe von
              Insiderinformationen. Im Rohstoffhandel gilt: Wer über nicht-öffentliche Informationen
              verfügt, die den Preis eines an der EUCX gehandelten Rohstoffs erheblich beeinflussen
              könnten — etwa Ernteausfälle, bevorstehende Antidumping-Entscheidungen oder
              Produktionsausfälle — und auf Basis dieser Informationen handelt, begeht Insiderhandel
              im Sinne von Art. 8 MAR.
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 780 }}>
              Verbotene Praktiken der <strong>Marktmanipulation</strong> umfassen unter anderem:
              <strong> Spoofing</strong> (Eingabe großer Orders ohne Ausführungsabsicht, um den Preis
              zu bewegen), <strong>Layering</strong> (schichtweise Ordereingabe zur Täuschung über
              die Markttiefe) und <strong>Wash Trading</strong> (künstliche Umsätze durch koordinierten
              Kauf und Verkauf zwischen verbundenen Parteien). Diese Praktiken sind nach Art. 12 MAR
              verboten und werden von der EUCX-Handelssüberwachung in Echtzeit detektiert.
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 780 }}>
              Alle EUCX-Teilnehmer sind verpflichtet, verdächtige Transaktionen oder Orders dem
              Betreiber zu melden. EUCX als OTF-Betreiber ist seinerseits nach Art. 16 MAR
              verpflichtet, <strong>STORs (Suspicious Transaction and Order Reports)</strong> an die
              BaFin zu erstatten, wenn ein begründeter Verdacht auf Marktmissbrauch besteht.
              Meldungen an die Aufsichtsbehörde erfolgen elektronisch über das TREM-System (Transaction
              Reporting Exchange Mechanism).
            </p>
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "20px 24px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", margin: "0 0 6px" }}>Sanktionsrahmen MAR</p>
              <p style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.7, margin: 0 }}>
                Bei Verstößen gegen die MAR drohen strafrechtliche Sanktionen sowie Bußgelder von bis zu
                <strong> 5 Mio. EUR</strong> für natürliche Personen bzw. <strong>15 % des jährlichen
                Gesamtumsatzes</strong> für juristische Personen (Art. 30 MAR). Zusätzlich kann die
                BaFin die Zulassung zum Handel widerrufen und ein öffentliches Statement veröffentlichen.
              </p>
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
                <div key={item.schritt} className="reg-check" style={{
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
              <Link href="/register" className="reg-cta" style={{
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

      {/* FAQ-Sektion */}
      <section style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e8e8e8", padding: "64px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", margin: "0 0 8px" }}>
            Häufige Fragen — Regulatorik
          </h2>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 36px" }}>
            Die wichtigsten Fragen zum regulatorischen Rahmen des EUCX-Handels.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e8e8e8" }}>
            {[
              {
                q: "Was ist CBAM und wen betrifft es?",
                a: "CBAM (Carbon Border Adjustment Mechanism) ist ein EU-Grenzausgleichsmechanismus für CO₂-Kosten, der auf Importe von Stahl, Aluminium, Zement, Düngemitteln und Strom aus Drittstaaten erhoben wird. Betroffen sind alle in der EU ansässigen Unternehmen und Personen, die diese Waren einführen — unabhängig von der Unternehmensgröße.",
              },
              {
                q: "Ab wann ist CBAM kostenpflichtig?",
                a: "Ab 1. Januar 2026 ist CBAM in seiner kostenpflichtigen Phase in Kraft. Importeure müssen ab diesem Zeitpunkt CBAM-Zertifikate erwerben, die dem EUA-Preis des EU-Emissionshandelssystems entsprechen. Die vorangehende Übergangsphase (Oktober 2023 – Dezember 2025) umfasste lediglich Berichtspflichten ohne Zahlungsverpflichtung.",
              },
              {
                q: "Benötige ich als Händler auf EUCX eine eigene BaFin-Lizenz?",
                a: "Nein. EUCX betreibt als zugelassener OTF-Betreiber die regulierte Handelsinfrastruktur. Für die reine Teilnahme als Käufer oder Verkäufer physischer Waren benötigen Sie keine eigene BaFin-Zulassung. Wer jedoch im eigenen Namen Handelsdienstleistungen für Dritte erbringt oder Finanzinstrumente handelt, kann einer eigenständigen Erlaubnispflicht unterliegen.",
              },
              {
                q: "Was ist der Unterschied zwischen MiFID II und MiFIR?",
                a: "MiFID II (Richtlinie 2014/65/EU) ist eine EU-Richtlinie, die von den Mitgliedstaaten in nationales Recht umgesetzt wird — in Deutschland als WpHG. MiFIR (Verordnung 600/2014) ist eine EU-Verordnung, die unmittelbar und einheitlich in allen Mitgliedstaaten gilt. MiFIR regelt insbesondere die Transparenzpflichten (Pre-Trade, Post-Trade) und die Transaktionsmeldepflichten an die Aufsichtsbehörden.",
              },
              {
                q: "Welche ESG-Reportingpflichten habe ich als Rohstoffhändler?",
                a: "Die Pflichten richten sich nach Unternehmensgröße und Kapitalmarktzugang. Große Unternehmen (>500 Mitarbeiter) unterliegen seit Geschäftsjahr 2024 der CSRD und müssen nach ESRS berichten. KMU folgen stufenweise ab 2026–2027. Auch ohne formelle Berichtspflicht sollten Händler Scope-3-Emissionen ihrer Transaktionen erfassen, da Geschäftspartner im Rahmen ihrer eigenen CSRD-Pflichten entsprechende Daten einfordern werden.",
              },
            ].map(({ q, a }, i) => (
              <div key={i} className="reg-faq" style={{ backgroundColor: "#fff", padding: "24px 28px", borderBottom: "1px solid #f5f5f5" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", margin: "0 0 10px", lineHeight: 1.4 }}>{q}</h3>
                <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.75, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Was ist CBAM und wen betrifft es?",
                acceptedAnswer: { "@type": "Answer", text: "CBAM (Carbon Border Adjustment Mechanism) ist ein EU-Grenzausgleichsmechanismus für CO₂-Kosten, der auf Importe von Stahl, Aluminium, Zement, Düngemitteln und Strom aus Drittstaaten erhoben wird. Betroffen sind alle in der EU ansässigen Unternehmen und Personen, die diese Waren einführen." }
              },
              {
                "@type": "Question",
                name: "Ab wann ist CBAM kostenpflichtig?",
                acceptedAnswer: { "@type": "Answer", text: "Ab 1. Januar 2026 ist CBAM in seiner kostenpflichtigen Phase in Kraft. Importeure müssen CBAM-Zertifikate erwerben, die dem EUA-Preis des EU-ETS entsprechen. Die Übergangsphase (Oktober 2023 – Dezember 2025) umfasste nur Berichtspflichten." }
              },
              {
                "@type": "Question",
                name: "Benötige ich als Händler auf EUCX eine eigene BaFin-Lizenz?",
                acceptedAnswer: { "@type": "Answer", text: "Nein. EUCX betreibt als zugelassener OTF-Betreiber die regulierte Handelsinfrastruktur. Für die reine Teilnahme als Käufer oder Verkäufer physischer Waren benötigen Sie keine eigene BaFin-Zulassung." }
              },
              {
                "@type": "Question",
                name: "Was ist der Unterschied zwischen MiFID II und MiFIR?",
                acceptedAnswer: { "@type": "Answer", text: "MiFID II (Richtlinie 2014/65/EU) wird in nationales Recht umgesetzt (in Deutschland als WpHG). MiFIR (Verordnung 600/2014) gilt unmittelbar in allen Mitgliedstaaten und regelt insbesondere Pre-/Post-Trade-Transparenz und Transaktionsmeldepflichten." }
              },
              {
                "@type": "Question",
                name: "Welche ESG-Reportingpflichten habe ich als Rohstoffhändler?",
                acceptedAnswer: { "@type": "Answer", text: "Große Unternehmen (>500 Mitarbeiter) unterliegen seit Geschäftsjahr 2024 der CSRD und müssen nach ESRS berichten. KMU folgen stufenweise ab 2026–2027. Auch ohne formelle Pflicht sollten Händler Scope-3-Emissionen erfassen, da Geschäftspartner im Rahmen ihrer CSRD-Pflichten entsprechende Daten einfordern." }
              },
            ],
          }),
        }}
      />

      <SiteFooter />
    </div>
  );
}
