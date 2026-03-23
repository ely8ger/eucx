import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { AKADEMIE_ARTIKEL } from "@/app/insights/data";

export const metadata = {
  title: "Händler-Akademie | EUCX",
  description:
    "Das vollständige Onboarding-Manual für neue EUCX-Teilnehmer: Registrierung & KYC, Sicherheitenhinterlegung, Auktionsverfahren, Logistik & Abwicklung.",
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

export default function AkademiePage() {
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
            <span style={{ color: "#7aa4d4" }}>Händler-Akademie</span>
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 300, color: "#fff", margin: "0 0 12px" }}>
            Händler-<strong style={{ fontWeight: 700 }}>Akademie</strong>
          </h1>
          <p style={{ fontSize: 15, color: "#8aa8cc", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 620 }}>
            Von der Registrierung zum ersten Trade — alles was Sie als neuer Marktteilnehmer wissen müssen
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <span style={{ backgroundColor: "rgba(21,65,148,0.35)", color: "#a8c4f0", fontSize: 12, fontWeight: 700, padding: "6px 14px", letterSpacing: "0.06em" }}>
              Schritt-für-Schritt
            </span>
            <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#8aa8cc", fontSize: 12, padding: "6px 14px" }}>
              Für neue Teilnehmer
            </span>
            <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#8aa8cc", fontSize: 12, padding: "6px 14px" }}>
              Kostenlos
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── KAPITEL 1: Registrierung & KYC ── */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 26, fontWeight: 700, color: BLUE,
              borderBottom: "2px solid #e8e8e8", paddingBottom: 10,
              margin: "0 0 28px",
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#aaa", fontWeight: 400, display: "block", marginBottom: 4 }}>Kapitel 1</span>
            Registrierung &amp; Verifizierung (KYC/AML)
          </h2>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Was ist KYC im Finanzmarktkontext?
          </h3>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 820 }}>
            Know Your Customer (KYC) ist eine regulatorische Pflicht gemäß § 10 GwG (Geldwäschegesetz) und Art. 13 AMLD5 (5. Anti-Geldwäsche-Richtlinie). Als BaFin-lizenzierter OTF ist die EUCX GmbH verpflichtet, die Identität aller Marktteilnehmer zu verifizieren, bevor Handelsaktivitäten erlaubt werden.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
            Schritt-für-Schritt-Übersicht
          </h3>
          <ol style={{ fontSize: 14, color: "#444", lineHeight: 2, margin: "0 0 28px", paddingLeft: 24, maxWidth: 820 }}>
            <li>Online-Formular ausfüllen unter eucx.eu/register (ca. 15 Min)</li>
            <li>Unternehmenstyp wählen: Händler/Importeur · Produzent · Finanzinstitut · Industrieabnehmer</li>
            <li>Pflichtdokumente hochladen (siehe Tabelle unten)</li>
            <li>Digitale Identitätsprüfung der UBOs via IDnow (Videoident, ca. 10 Min je Person)</li>
            <li>Bestätigungs-E-Mail + Prüfung durch EUCX Compliance (1–2 Werktage)</li>
            <li>Freigabe und Zugang zum EUCX-Kundenportal</li>
          </ol>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
            Erforderliche Dokumente nach Unternehmenstyp
          </h3>
          <div style={{ overflowX: "auto" as const, marginBottom: 28 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: BLUE, color: "#fff" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Dokument</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" as const, fontWeight: 600 }}>GmbH/AG</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" as const, fontWeight: 600 }}>KG/OHG</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" as const, fontWeight: 600 }}>Ausländische Gesellschaft</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Handelsregisterauszug (< 3 Monate)", "Pflicht", "Pflicht", "Pflicht (apostilliert)"],
                  ["Gesellschafterliste (direkte UBOs > 25 %)", "Pflicht", "Pflicht", "Pflicht"],
                  ["Transparenzregistereintrag", "Pflicht", "Pflicht", "Äquivalent"],
                  ["Jahresabschluss (letztes Geschäftsjahr)", "Pflicht", "Pflicht", "Pflicht"],
                  ["Ausweis aller UBOs > 25 %", "Pflicht", "Pflicht", "Pflicht"],
                  ["LEI-Nummer", "Empfohlen", "Empfohlen", "Empfohlen"],
                  ["CBAM-Compliance-Nachweis (bei Importeuren)", "ggf.", "ggf.", "ggf."],
                ].map(([doc, a, b, c], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f7f8fb" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#1a1a1a" }}>{doc}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", textAlign: "center" as const, color: "#444" }}>{a}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", textAlign: "center" as const, color: "#444" }}>{b}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", textAlign: "center" as const, color: "#444" }}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: "#eef2fb", borderLeft: `4px solid ${BLUE}`, padding: "16px 20px", maxWidth: 820 }}>
            <p style={{ fontSize: 13, color: "#2d4a8a", lineHeight: 1.7, margin: 0 }}>
              <strong>Tipp:</strong> Bereiten Sie alle Dokumente digital (PDF) vor der Registrierung vor. Unvollständige Einreichungen verlängern die Bearbeitungszeit um durchschnittlich 3 Werktage.
            </p>
          </div>
        </section>

        {/* ── KAPITEL 2: Hinterlegung von Sicherheiten ── */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 26, fontWeight: 700, color: BLUE,
              borderBottom: "2px solid #e8e8e8", paddingBottom: 10,
              margin: "0 0 28px",
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#aaa", fontWeight: 400, display: "block", marginBottom: 4 }}>Kapitel 2</span>
            Hinterlegung von Sicherheiten (Initial Margin)
          </h2>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Warum Sicherheiten?
          </h3>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 820 }}>
            Sicherheiten (Margins) sind das Fundament der EUCX-{" "}
            <Link href="/insights/lexikon/abwicklungsgarantie" style={{ color: BLUE, fontWeight: 600 }}>
              Abwicklungsgarantie
            </Link>
            . Sie stellen sicher, dass beide Handelsparteien ihren vertraglichen Pflichten nachkommen können. Das Margin-System schützt die gesamte Marktintegrität.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Margin-Typen
          </h3>
          <ul style={{ fontSize: 14, color: "#444", lineHeight: 2, margin: "0 0 20px", paddingLeft: 24, maxWidth: 820 }}>
            <li><strong>Initial Margin:</strong> Einmalige Hinterlegung bei Kontoeröffnung auf Basis des zugelassenen Jahresvolumens</li>
            <li><strong>Variation Margin:</strong> Tägliche Anpassung der Sicherheit basierend auf Marktpreisveränderungen offener Positionen</li>
            <li><strong>Maintenance Margin:</strong> Mindestpegel (80 % der Initial Margin) — bei Unterschreitung erfolgt automatisch ein Margin Call</li>
          </ul>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Berechnungsbeispiel
          </h3>
          <div style={{ backgroundColor: "#f7f8fb", border: "1px solid #e0e4ec", padding: "16px 20px", marginBottom: 24, maxWidth: 600, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
            <p style={{ margin: "0 0 6px", color: "#888" }}>// Händler mit 500 t Jahresvolumen @ 700 €/t</p>
            <p style={{ margin: "0 0 6px", color: "#1a1a1a" }}>Handelsvolumen = 500 × 700 = 350.000 €</p>
            <p style={{ margin: "0 0 6px", color: "#1a1a1a" }}>Margin-Satz = 5,0 %</p>
            <p style={{ margin: 0, color: BLUE, fontWeight: 700 }}>Initial Margin = 350.000 × 0,05 = 17.500 €</p>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
            Margin-Staffeln nach Handelsvolumen
          </h3>
          <div style={{ overflowX: "auto" as const, marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: BLUE, color: "#fff" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Zugelassenes Jahresvolumen</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" as const, fontWeight: 600 }}>Initial Margin (Mindest)</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" as const, fontWeight: 600 }}>Margin-Satz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["bis 2 Mio. EUR", "10.000 EUR", "5,0 %"],
                  ["2–10 Mio. EUR", "50.000 EUR", "2,5 %"],
                  ["10–50 Mio. EUR", "150.000 EUR", "1,5 %"],
                  ["> 50 Mio. EUR", "Individuell", "1,0 %"],
                ].map(([vol, margin, satz], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f7f8fb" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#1a1a1a" }}>{vol}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", textAlign: "right" as const, color: "#444" }}>{margin}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", textAlign: "right" as const, fontWeight: 700, color: BLUE }}>{satz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 8px", maxWidth: 820 }}>
            <strong>Einzahlungsprozess:</strong> SEPA-Überweisung auf EUCX-Treuhandkonto. Gutschrift und Freigabe innerhalb 1 Werktag.
          </p>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 8px", maxWidth: 820 }}>
            <strong>Verzinsung:</strong> EZB-Einlagezinssatz − 0,25 % p.a. auf hinterlegte Beträge.
          </p>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
            <strong>Margin Call:</strong> Automatische Benachrichtigung per E-Mail und Portal bei Unterschreitung des Maintenance Level (80 % der Initial Margin). Auffüllung innerhalb von 24 Stunden erforderlich.
          </p>
        </section>

        {/* ── KAPITEL 3: Auktionsverfahren ── */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 26, fontWeight: 700, color: BLUE,
              borderBottom: "2px solid #e8e8e8", paddingBottom: 10,
              margin: "0 0 28px",
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#aaa", fontWeight: 400, display: "block", marginBottom: 4 }}>Kapitel 3</span>
            Das Auktionsverfahren
          </h2>

          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 24px", maxWidth: 820 }}>
            EUCX nutzt drei Handelsformate, die je nach Warentyp und Handelsziel eingesetzt werden.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
            {/* English Auction */}
            <div style={{ border: "1px solid #e8e8e8", borderTop: `4px solid ${BLUE}`, padding: "20px 22px", backgroundColor: "#fff" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 10px" }}>English Auction</h3>
              <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", fontWeight: 600, letterSpacing: "0.06em" }}>AUFWÄRTSAUKTION</p>
              <ul style={{ fontSize: 13, color: "#444", lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
                <li><strong>Einsatz:</strong> Käufer bieten nach oben (knappe Liefermengen)</li>
                <li><strong>Ablauf:</strong> Startpreis → offene Bietphase → höchstes Gebot gewinnt</li>
                <li><strong>Typisch für:</strong> Seltene Rohstoffe, Sonderqualitäten, kleine Losgrößen</li>
              </ul>
            </div>
            {/* Dutch Auction */}
            <div style={{ border: "1px solid #e8e8e8", borderTop: "4px solid #166534", padding: "20px 22px", backgroundColor: "#fff" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 10px" }}>Dutch Auction</h3>
              <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", fontWeight: 600, letterSpacing: "0.06em" }}>ABWÄRTSAUKTION</p>
              <ul style={{ fontSize: 13, color: "#444", lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
                <li><strong>Einsatz:</strong> Verkäufer wollen schnell Ware platzieren</li>
                <li><strong>Ablauf:</strong> Startpreis (hoch) → automatisch fallend → erster Bieter gewinnt</li>
                <li><strong>Typisch für:</strong> Standardware in großen Mengen (100+ Tonnen)</li>
              </ul>
            </div>
            {/* CLOB */}
            <div style={{ border: "1px solid #e8e8e8", borderTop: "4px solid #7c3aed", padding: "20px 22px", backgroundColor: "#fff" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 10px" }}>CLOB</h3>
              <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", fontWeight: 600, letterSpacing: "0.06em" }}>CONTINUOUS LIMIT ORDER BOOK</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.9, margin: 0 }}>
                Klassisches Order-Buch: Käufer stellen Bid-Preise ein, Verkäufer stellen Ask-Preise ein. Das System matched automatisch bei Bid ≥ Ask.
              </p>
            </div>
          </div>

          {/* Ablaufdiagramm */}
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
            Order-Ablauf (CLOB)
          </h3>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 0, marginBottom: 32, maxWidth: 900 }}>
            {[
              "Order eingeben",
              "Margin-Prüfung",
              "Order im Buch",
              "Matching",
              "Handelsbestätigung",
              "Settlement (T+2)",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    backgroundColor: i === 5 ? BLUE : "#f0f4fc",
                    color: i === 5 ? "#fff" : "#1a1a1a",
                    border: `1px solid ${i === 5 ? BLUE : "#d0daf5"}`,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {step}
                </div>
                {i < 5 && (
                  <div style={{ color: BLUE, fontWeight: 700, fontSize: 14, padding: "0 4px" }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Ordertypen-Tabelle */}
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
            Ordertypen im Vergleich
          </h3>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: BLUE, color: "#fff" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Ordertyp</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Beschreibung</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Vorteil</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Risiko</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Limit Order", "Fixer Preis, wartet auf Gegenpartei", "Preissicherheit", "Evtl. keine Ausführung"],
                  ["Market Order", "Sofortige Ausführung zum besten Preis", "Schnelle Ausführung", "Kein Preisschutz"],
                  ["Stop Order", "Wird aktiv bei Erreichen eines Triggerpreises", "Verlustbegrenzung", "Slippage möglich"],
                  ["Iceberg Order", "Nur Teilmenge sichtbar", "Marktimpact reduzieren", "Komplexer"],
                ].map(([typ, desc, vorteil, risiko], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f7f8fb" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", fontWeight: 600, color: "#1a1a1a" }}>{typ}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#444" }}>{desc}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#166534" }}>{vorteil}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#b45309" }}>{risiko}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── KAPITEL 4: Logistik & Abwicklung ── */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 26, fontWeight: 700, color: BLUE,
              borderBottom: "2px solid #e8e8e8", paddingBottom: 10,
              margin: "0 0 28px",
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#aaa", fontWeight: 400, display: "block", marginBottom: 4 }}>Kapitel 4</span>
            Logistik &amp; Abwicklung
          </h2>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Lieferbedingungen auf EUCX
          </h3>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 820 }}>
            Standard ist <strong>DAP (Delivered At Place)</strong> Empfängeranschrift. Alternativen: EXW, FCA, CPT.
            Alle Lieferbedingungen basieren auf{" "}
            <Link href="/insights/lexikon/incoterms-2020" style={{ color: BLUE, fontWeight: 600 }}>
              Incoterms 2020
            </Link>
            .
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Warenprüfung
          </h3>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 20px", maxWidth: 820 }}>
            Alle auf EUCX gehandelten Waren unterliegen einer optionalen, aber empfohlenen Qualitätsprüfung durch akkreditierte Prüfinstitute (SGS, Bureau Veritas, TÜV SÜD). Die Kosten trägt der Verkäufer — bei EXW-Geschäften der Käufer.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
            Typische Abwicklungsfristen
          </h3>
          <div style={{ overflowX: "auto" as const, marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: BLUE, color: "#fff" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Phase</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Beschreibung</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 }}>Frist</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["T+0", "Handelsabschluss (Matching)", "Sofort"],
                  ["T+1", "Handelsbestätigung und Dokumentenaustausch", "1 Werktag"],
                  ["T+2", "Zahlungsabwicklung (SEPA/SWIFT)", "2 Werktage"],
                  ["T+3–7", "Physische Lieferung (abhängig von Incoterm/Entfernung)", "3–7 Werktage"],
                  ["T+8", "Abschlussbestätigung und Margin-Freigabe", "8. Werktag"],
                ].map(([phase, desc, frist], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f7f8fb" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", fontWeight: 700, color: BLUE, fontFamily: "'IBM Plex Mono', monospace" }}>{phase}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#1a1a1a" }}>{desc}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #e8e8e8", color: "#444" }}>{frist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>
            Transportmittel nach Warengruppe
          </h3>
          <ul style={{ fontSize: 14, color: "#444", lineHeight: 2, margin: "0 0 24px", paddingLeft: 24, maxWidth: 820 }}>
            <li><strong>Stahl/Metalle:</strong> LKW (&lt; 100 t), Bahn/Binnenschiff (&gt; 100 t)</li>
            <li><strong>Agrar:</strong> Silo-LKW, Binnenschiff</li>
            <li><strong>Holz:</strong> Flachbett-LKW, kein Spezialtransport erforderlich</li>
          </ul>

          <div style={{ backgroundColor: "#eef2fb", borderLeft: `4px solid ${BLUE}`, padding: "16px 20px", maxWidth: 820 }}>
            <p style={{ fontSize: 13, color: "#2d4a8a", lineHeight: 1.7, margin: 0 }}>
              <strong>EUCX Settlement-Garantie:</strong> Jeder an der EUCX abgeschlossene Handel ist durch den Settlement-Garantiefonds abgesichert.{" "}
              <Link href="/insights/lexikon/abwicklungsgarantie" style={{ color: BLUE, fontWeight: 700 }}>
                Mehr zur Abwicklungsgarantie →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Vertiefende Artikel aus data.ts ── */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 22, fontWeight: 700, color: "#1a1a1a",
              borderBottom: "2px solid #e8e8e8", paddingBottom: 10,
              margin: "0 0 28px",
            }}
          >
            Vertiefende Artikel
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {AKADEMIE_ARTIKEL.map((artikel) => (
              <Link
                key={artikel.slug}
                href={`/insights/akademie/${artikel.slug}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  border: "1px solid #e8e8e8",
                  borderLeft: "4px solid #92400e",
                  padding: "22px 24px",
                  backgroundColor: "#fff",
                }}
              >
                <span style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: "0.06em" }}>
                  LEITFADEN · {artikel.readMin} MIN
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1a1a1a", margin: "8px 0 10px", lineHeight: 1.4 }}>
                  {artikel.title}
                </h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
                  {artikel.description}
                </p>
                <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>Artikel lesen →</span>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Wie lange dauert die KYC-Prüfung?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "1–2 Werktage bei vollständigen Unterlagen. Unvollständige Einreichungen können die Bearbeitungszeit um bis zu 3 Werktage verlängern.",
                },
              },
              {
                "@type": "Question",
                name: "Wie hoch ist die Mindest-Margin?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "10.000 EUR für Teilnehmer mit einem zugelassenen Jahresvolumen bis 2 Mio. EUR (Margin-Satz: 5,0 %).",
                },
              },
              {
                "@type": "Question",
                name: "Kann ich als Einzelunternehmer handeln?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Nein, EUCX ist ausschließlich B2B (Business-to-Business). Zugelassen werden Unternehmen (GmbH, AG, KG, OHG und ausländische Gesellschaftsformen) sowie institutionelle Marktteilnehmer.",
                },
              },
              {
                "@type": "Question",
                name: "Was ist der Unterschied zwischen English Auction und Dutch Auction?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Bei der English Auction (Aufwärtsauktion) steigt der Preis — der höchste Bieter gewinnt. Bei der Dutch Auction (Abwärtsauktion) fällt der Preis automatisch ab einem Startpreis — der erste Bieter, der den aktuellen Preis akzeptiert, gewinnt. Die Dutch Auction wird typischerweise bei großen Standardwarenmengen eingesetzt.",
                },
              },
              {
                "@type": "Question",
                name: "Wann wird meine Margin freigegeben?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Nach vollständiger Abwicklung der Transaktion — typisch am 8. Werktag (T+8), sobald Zahlung eingegangen und physische Lieferung bestätigt ist.",
                },
              },
            ],
          }),
        }}
      />

      <SiteFooter />
    </div>
  );
}
