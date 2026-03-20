"use client";
import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1180, margin: "0 auto", padding: "0 40px" },
  label:     { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:        { fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: "48px 0 14px", paddingTop: 20, borderTop: "1px solid #f0f0f0" },
  h3:        { fontSize: 15, fontWeight: 600, color: "#1a1a1a", margin: "24px 0 10px" },
  p:         { fontSize: 15, color: "#505050", lineHeight: 1.75, margin: "0 0 12px" },
  li:        { fontSize: 15, color: "#505050", lineHeight: 1.75, marginBottom: 6 },
};

export default function AgbPage() {
  return (
    <div style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" }}>

      {/* ── Topbar ── */}
      <div style={{ backgroundColor: "#111", height: 38, display: "flex", alignItems: "center" }}>
        <div style={{ ...S.container, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: "0.02em" }}>
            BaFin-regulierte Handelsplattform · Frankfurt am Main · MiFID II OTF
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {[["TLS 1.3", <Lock key="l" size={11}/>], ["DSGVO-konform", <ShieldCheck key="s" size={11}/>]].map(([label, icon]) => (
              <span key={label as string} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.35)" }}>{icon as React.ReactNode} {label as string}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{ backgroundColor: "#fff", borderTop: "3px solid #154194", boxShadow: "0 1px 4px rgba(0,0,0,.15)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ ...S.container, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}><EucxLogo size="md" /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{ fontSize: 13, color: "#154194", fontWeight: 500, textDecoration: "none" }}>Anmelden</Link>
            <Link href="/register"
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "9px 20px", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
              Registrieren <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Hero ── */}
      <section style={{ backgroundColor: "#0b1e36", padding: "56px 0 48px" }}>
        <div style={S.container}>
          <span style={{ ...S.label, color: "rgba(255,255,255,.35)" }}>Rechtliches</span>
          <h1 style={{ fontSize: 42, fontWeight: 300, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>
            Allgemeine Geschäftsbedingungen
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: "0 0 12px" }}>
            EUCX GmbH - Betreiberin des Organisierten Handelssystems &ldquo;EUCX - European Union Commodity Exchange&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", margin: 0 }}>
            Version 1.0 · Gültig ab 1. April 2026 · Rechtsstand: Deutschland / EU
          </p>
        </div>
      </section>

      {/* ── Inhaltsverzeichnis ── */}
      <section style={{ backgroundColor: "#f8fafc", padding: "32px 0", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ ...S.container, maxWidth: 860 }}>
          <span style={S.label}>Inhaltsübersicht</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px 32px" }}>
            {[
              "§ 1 Geltungsbereich und Vertragsgegenstand",
              "§ 2 Definitionen",
              "§ 3 Akkreditierung und Zulassung",
              "§ 4 Rechte und Pflichten der Marktteilnehmer",
              "§ 5 Handelsbetrieb und Auftragserteilung",
              "§ 6 Preisbildung, Matching und Orderausführung",
              "§ 7 Abschluss und Bestätigung",
              "§ 8 Abwicklung (Settlement) und Lieferung",
              "§ 9 Sicherheitsleistungen (Margin und Kaution)",
              "§ 10 Entgelte, Gebühren und Abgaben",
              "§ 11 Handelsunterbrechung und Marktsuspendierung",
              "§ 12 Marktmissbrauch und Compliance",
              "§ 13 Haftung und Haftungsbeschränkung",
              "§ 14 Datenschutz",
              "§ 15 Laufzeit und Kündigung",
              "§ 16 Änderungen der AGB",
              "§ 17 Schlussbestimmungen",
            ].map((item, i) => (
              <div key={item} style={{ fontSize: 13, color: "#505050", padding: "3px 0", borderBottom: "1px solid transparent" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ padding: "64px 0 96px" }}>
        <div style={{ ...S.container, maxWidth: 860 }}>

          {/* Präambel */}
          <div style={{ backgroundColor: "#f0f4ff", padding: "24px 28px", borderLeft: "3px solid #154194", marginBottom: 40 }}>
            <span style={S.label}>Präambel</span>
            <p style={{ ...S.p, marginBottom: 8 }}>
              Die EUCX GmbH (nachfolgend &ldquo;EUCX&rdquo; oder &ldquo;Betreiberin&rdquo;) betreibt die digitale Handelsplattform
              &ldquo;EUCX - European Union Commodity Exchange&rdquo; als Organisiertes Handelssystem (OTF) im Sinne
              des § 72 Wertpapierhandelsgesetz (WpHG) in Verbindung mit Art. 4 Abs. 1 Nr. 23 und Art. 18–20 der
              Richtlinie 2014/65/EU (MiFID II).
            </p>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Rechte und Pflichten zwischen der EUCX GmbH
              und den akkreditierten Marktteilnehmern. Sie bilden zusammen mit den Produktspezifikationen, der
              Handelsordnung und dem Entgeltverzeichnis die Vertragsgrundlage.
            </p>
          </div>

          {/* § 1 */}
          <h2 style={{ ...S.h2, borderTop: "none", marginTop: 0 }}>§ 1 Geltungsbereich und Vertragsgegenstand</h2>
          <p style={S.p}>
            (1) Diese AGB gelten für alle Rechtsbeziehungen zwischen der EUCX GmbH und natürlichen oder juristischen
            Personen, die auf der EUCX-Handelsplattform als Marktteilnehmer zugelassen sind oder eine Zulassung beantragen.
          </p>
          <p style={S.p}>
            (2) Gegenstand dieser AGB ist die Nutzung der EUCX-Handelsplattform zum elektronischen Abschluss von
            Kaufverträgen über Waren und Rohstoffe (insbesondere Metalle, Holz, Agrarprodukte und Industriegüter)
            sowie damit verbundene Dienstleistungen der EUCX GmbH als Plattformbetreiberin.
          </p>
          <p style={S.p}>
            (3) Die EUCX-Plattform richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB sowie an
            institutionelle Anleger und professionelle Kunden im Sinne des Anhangs II der MiFID II.
            Verbraucher im Sinne des § 13 BGB sind von der Nutzung ausgeschlossen.
          </p>
          <p style={S.p}>
            (4) Entgegenstehende oder abweichende AGB der Marktteilnehmer haben keine Gültigkeit,
            sofern die EUCX ihrer Anwendung nicht ausdrücklich schriftlich zugestimmt hat.
          </p>

          {/* § 2 */}
          <h2 style={S.h2}>§ 2 Definitionen</h2>
          <p style={S.p}>Im Sinne dieser AGB gelten folgende Definitionen:</p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              '„OTF" (Organisiertes Handelssystem): multilaterales System zum Abschluss von Kaufverträgen über Waren gemäß § 72 WpHG und Art. 4 Abs. 1 Nr. 23 MiFID II.',
              '„Marktteilnehmer": natürliche oder juristische Person, die eine gültige Akkreditierung besitzt und zur Nutzung der Handelsplattform zugelassen ist.',
              '„Auftrag" (Order): verbindliches Kauf- oder Verkaufsangebot eines Marktteilnehmers für eine bestimmte Ware zu einem bestimmten Preis und einer bestimmten Menge.',
              '„Matching": automatisierter Prozess der Zusammenführung kompatibler Kauf- und Verkaufsaufträge gemäß den Handelsregeln.',
              '„Settlement": Abwicklung des Handelsgeschäfts durch Lieferung der Ware und Zahlung des Kaufpreises.',
              '„Kaution": von Marktteilnehmern hinterlegte Sicherheitsleistung zur Absicherung offener Positionen.',
              '„Handelssitzung": von der EUCX festgelegte Zeitfenster, in denen der Handelsbetrieb stattfindet.',
              '„Matching Engine": technisches System, das Aufträge gemäß Preis-Zeit-Priorität zusammenführt.',
              '„BaFin": Bundesanstalt für Finanzdienstleistungsaufsicht, zuständige Aufsichtsbehörde.',
              '„LEI": Legal Entity Identifier, einheitlicher Unternehmensidentifikator nach ISO 17442.',
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          {/* § 3 */}
          <h2 style={S.h2}>§ 3 Akkreditierung und Zulassung</h2>
          <p style={S.p}>
            (1) Die Nutzung der EUCX-Plattform setzt eine gültige Akkreditierung voraus.
            Antragsberechtigte sind ausschließlich in der EU oder dem EWR ansässige Unternehmen
            mit gültigem Handelsregistereintrag.
          </p>
          <p style={S.p}>
            (2) Im Rahmen des Akkreditierungsverfahrens ist der Antragsteller verpflichtet:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Nachweis der Rechtspersönlichkeit (Handelsregisterauszug, nicht älter als 3 Monate)",
              "Nachweis der wirtschaftlichen Leistungsfähigkeit (aktuelle Jahresabschlüsse)",
              "Identifizierung und Verifizierung der wirtschaftlich Berechtigten (KYC gem. §§ 10–17 GwG)",
              "Nachweis eines gültigen LEI (Legal Entity Identifier, ISO 17442)",
              "Unterzeichnung dieser AGB und der EUCX-Handelsordnung",
              "Hinterlegung der Kaution gemäß § 9 dieser AGB",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            (3) Die Entscheidung über den Akkreditierungsantrag erfolgt nach pflichtgemäßem Ermessen
            der EUCX GmbH innerhalb von 10 Werktagen nach vollständiger Einreichung aller Unterlagen.
            Ein Rechtsanspruch auf Zulassung besteht nicht.
          </p>
          <p style={S.p}>
            (4) Die EUCX GmbH ist gemäß § 72 Abs. 5 WpHG i.V.m. Art. 18 MiFID II verpflichtet,
            diskriminierungsfreie, transparente Zugangsbedingungen zu gewährleisten.
            Ablehnungen bedürfen sachlicher Begründung.
          </p>
          <p style={S.p}>
            (5) Die Akkreditierung kann durch die EUCX GmbH aus wichtigem Grund widerrufen werden,
            insbesondere bei Verstoß gegen diese AGB, bei drohender Insolvenz des Marktteilnehmers,
            bei Verdacht auf Marktmissbrauch oder bei behördlicher Anordnung.
          </p>

          {/* § 4 */}
          <h2 style={S.h2}>§ 4 Rechte und Pflichten der Marktteilnehmer</h2>
          <h3 style={S.h3}>4.1 Rechte</h3>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Zugang zum Orderbuch und Echtzeit-Marktdaten während der Handelssitzungen",
              "Auftragserteilung in allen akkreditierten Warengruppen",
              "Einsicht in die eigene Handels- und Transaktionshistorie",
              "Inanspruchnahme des technischen Supports der EUCX",
              "Zugang zu Marktstatistiken und Handelsberichten",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <h3 style={S.h3}>4.2 Pflichten</h3>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Einhaltung aller anwendbaren Gesetze und Vorschriften, insbesondere WpHG, MAR, GwG",
              "Unverzügliche Meldung wesentlicher Änderungen (Firmenname, Eigentümerstruktur, Insolvenzantrag)",
              "Aufrechterhaltung der technischen Voraussetzungen für eine stabile Verbindung zur Plattform",
              "Wahrung der Zugangsdaten und sofortige Meldung bei Verdacht auf unbefugten Zugang",
              "Erfüllung aller abgeschlossenen Handelsgeschäfte in der vereinbarten Frist",
              "Aufrechterhaltung der vereinbarten Kautionshöhe (§ 9)",
              "Unterlassung jeglicher Form von Marktmanipulation, Insiderhandel oder sonstigen Marktmissbräuchen",
              "Beachtung der Positions- und Volumengrenzen gemäß Handelsordnung",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          {/* § 5 */}
          <h2 style={S.h2}>§ 5 Handelsbetrieb und Auftragserteilung</h2>
          <p style={S.p}>
            (1) Der Handelsbetrieb findet ausschließlich während der von der EUCX festgelegten Handelssitzungen
            statt (Montag bis Freitag, 09:00–17:30 Uhr MEZ, außer an gesetzlichen Feiertagen in Hessen).
            Die EUCX behält sich das Recht vor, Handelssitzungen aus betrieblichen Gründen anzupassen.
          </p>
          <p style={S.p}>
            (2) Aufträge können als Limit-Order oder als Market-Order erteilt werden.
            Alle Aufträge sind verbindlich und können nur innerhalb der technisch möglichen Reaktionszeiten
            vor einer Ausführung storniert werden.
          </p>
          <p style={S.p}>
            (3) Jeder Auftrag muss mindestens folgende Angaben enthalten: Ware (Produktbezeichnung und Spezifikation),
            Menge (in der jeweiligen Handelseinheit), Preis (bei Limit-Orders), Auftragsgültigkeit,
            sowie den Lieferort oder -bedingungen.
          </p>
          <p style={S.p}>
            (4) Die EUCX GmbH übernimmt als Betreiberin des OTF keine eigenen Positionen im Handel.
            Sie agiert als neutraler Plattformbetreiber ohne Eigenhandel (§ 72 Abs. 6 WpHG).
          </p>
          <p style={S.p}>
            (5) Aufträge dürfen nur für Waren erteilt werden, zu deren Handel der Marktteilnehmer
            akkreditiert ist. Die EUCX GmbH ist berechtigt, Aufträge zurückzuweisen,
            wenn die Akkreditierung für die betreffende Warengruppe fehlt oder die
            Sicherheitsleistungen unzureichend sind.
          </p>

          {/* § 6 */}
          <h2 style={S.h2}>§ 6 Preisbildung, Matching und Orderausführung</h2>
          <p style={S.p}>
            (1) Die Preisbildung erfolgt ausschließlich durch das Zusammenführen von Kauf- und Verkaufsaufträgen
            im elektronischen Orderbuch nach dem Prinzip der Preis-Zeit-Priorität (Price-Time-Priority).
          </p>
          <p style={S.p}>
            (2) Das Matching erfolgt vollautomatisch durch die Matching Engine der EUCX GmbH.
            Ein manueller Eingriff in den Matching-Prozess ist ausgeschlossen, sofern keine
            technische Notwendigkeit oder aufsichtsrechtliche Anordnung besteht.
          </p>
          <p style={S.p}>
            (3) Die EUCX GmbH ist gemäß § 72 WpHG i.V.m. Art. 18 Abs. 5 MiFID II verpflichtet,
            über das System der Auftragsinteraktion zu informieren und Ermessensspielräume transparent zu machen.
            Die aktuelle Handelsordnung ist jederzeit in der Plattform einsehbar.
          </p>
          <p style={S.p}>
            (4) Preisliche Unter- und Obergrenzen (Preisbänder) können von der EUCX zum Schutz
            vor extremen Preisausschlägen festgelegt werden. Aufträge außerhalb dieser Bänder
            werden automatisch zurückgewiesen.
          </p>

          {/* § 7 */}
          <h2 style={S.h2}>§ 7 Abschluss und Bestätigung</h2>
          <p style={S.p}>
            (1) Ein Handelsabschluss kommt zustande, sobald die Matching Engine kompatible Kauf-
            und Verkaufsaufträge zusammengeführt hat. In diesem Moment entsteht ein rechtsverbindlicher
            Kaufvertrag zwischen Käufer und Verkäufer.
          </p>
          <p style={S.p}>
            (2) Jeder Abschluss wird unverzüglich in Echtzeit in der Plattform angezeigt und durch eine
            elektronische Handelsbestätigung dokumentiert. Die Handelsbestätigung enthält alle
            wesentlichen Vertragsparameter gemäß § 83 WpHG.
          </p>
          <p style={S.p}>
            (3) Die EUCX GmbH meldet alle Transaktionen gemäß Art. 26 MiFIR an die zuständige Behörde (BaFin/ESMA).
            Die Marktteilnehmer sind für die Richtigkeit der von ihnen angegebenen Handelsdaten
            (insbesondere LEI) selbst verantwortlich.
          </p>
          <p style={S.p}>
            (4) Handelsabschlüsse sind unwiderruflich, sofern kein offensichtlicher technischer
            Fehler der EUCX-Matching Engine vorliegt. Reklamationen müssen unverzüglich,
            spätestens binnen 30 Minuten nach Abschluss, schriftlich bei der EUCX eingegangen sein.
          </p>

          {/* § 8 */}
          <h2 style={S.h2}>§ 8 Abwicklung (Settlement) und Lieferung</h2>
          <p style={S.p}>
            (1) Die Abwicklung von Handelsgeschäften erfolgt nach den jeweils gültigen Produktspezifikationen.
            Standardmäßig gilt die Lieferung innerhalb von T+3 Werktagen nach dem Handelstag,
            sofern in der Produktspezifikation nichts anderes bestimmt ist.
          </p>
          <p style={S.p}>
            (2) Die physische Lieferung von Waren erfolgt gemäß den vereinbarten INCOTERMS
            (in der Regel EXW, FCA, DAP oder DDP nach INCOTERMS 2020).
            Die konkrete Lieferbedingung ist in der Produktspezifikation und im Handelsauftrag zu spezifizieren.
          </p>
          <p style={S.p}>
            (3) Die Zahlung des Kaufpreises erfolgt per SEPA-Überweisung auf das Abwicklungskonto der EUCX
            oder direkt zwischen den Vertragsparteien, je nach gewähltem Abwicklungsmodell.
          </p>
          <p style={S.p}>
            (4) Bei Lieferverzug oder Zahlungsverzug gelten die gesetzlichen Regelungen des BGB (§§ 280, 286 ff. BGB).
            Die EUCX GmbH kann bei schwerem Lieferverzug die Akkreditierung des säumigen
            Marktteilnehmers vorübergehend aussetzen.
          </p>
          <p style={S.p}>
            (5) Die EUCX GmbH übernimmt keine Garantie für die Bonität der Vertragspartner.
            Das Kontrahentenrisiko verbleibt bei den jeweiligen Marktteilnehmern,
            soweit kein zentrales Clearing vereinbart ist.
          </p>

          {/* § 9 */}
          <h2 style={S.h2}>§ 9 Sicherheitsleistungen (Margin und Kaution)</h2>
          <p style={S.p}>
            (1) Jeder Marktteilnehmer ist verpflichtet, bei der EUCX GmbH eine Kaution
            (Initial Margin) in Höhe von mindestens <strong>20.000 EUR</strong> zu hinterlegen.
            Die Höhe kann durch die EUCX GmbH je nach Handelsvolumen und Risikoprofil
            angepasst werden. Anpassungen werden mit einer Frist von 5 Werktagen mitgeteilt.
          </p>
          <p style={S.p}>
            (2) Ein Teil der Kaution wird für jede offene Position gesperrt (Variation Margin).
            Der gesperrte Betrag ergibt sich aus dem aktuellen Marktwert der offenen Position
            zuzüglich eines Sicherheitspuffers von 10 %.
          </p>
          <p style={S.p}>
            (3) Unterschreitet der verfügbare (nicht gesperrte) Kautionsbetrag einen Grenzwert
            von 20 % der Gesamtkaution, ergeht ein automatischer Margin Call.
            Der Marktteilnehmer ist verpflichtet, binnen <strong>24 Stunden</strong> nachzuschießen.
          </p>
          <p style={S.p}>
            (4) Kommt ein Marktteilnehmer dem Margin Call nicht nach, ist die EUCX GmbH berechtigt,
            offene Positionen des Marktteilnehmers zwangsweise zu liquidieren und den
            Liquidationserlös mit der Kaution zu verrechnen.
          </p>
          <p style={S.p}>
            (5) Die Kaution wird zinsfrei verwahrt. Nach vollständiger Beendigung der Akkreditierung
            und Erfüllung aller offenen Verpflichtungen wird die Kaution binnen 10 Werktagen
            an den Marktteilnehmer zurücküberwiesen.
          </p>

          {/* § 10 */}
          <h2 style={S.h2}>§ 10 Entgelte, Gebühren und Abgaben</h2>
          <p style={S.p}>
            (1) Für die Nutzung der EUCX-Plattform erhebt die EUCX GmbH Gebühren
            gemäß dem jeweils aktuellen EUCX-Entgeltverzeichnis.
            Das Entgeltverzeichnis ist Bestandteil dieser AGB und auf der Plattform jederzeit einsehbar.
          </p>
          <p style={S.p}>
            (2) Es werden insbesondere folgende Gebühren erhoben:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Jahresgebühr für die Akkreditierung (Grundgebühr)",
              "Transaktionsgebühr je abgeschlossenem Handelsgeschäft (Maker/Taker-Modell)",
              "Stornierungsgebühr für Auftragsrücknahmen nach Ordereingang",
              "Gebühr für technische API-Zugänge (falls genutzt)",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            (3) Alle Gebühren verstehen sich zuzüglich der gesetzlich gültigen Umsatzsteuer.
            Sie werden monatlich im Nachhinein abgerechnet und automatisch von der Kaution
            einbehalten, sofern kein Lastschriftmandat erteilt wurde.
          </p>
          <p style={S.p}>
            (4) Änderungen des Entgeltverzeichnisses werden mit einer Ankündigungsfrist von
            <strong> 30 Tagen</strong> auf der Plattform und per E-Mail bekanntgegeben.
          </p>

          {/* § 11 */}
          <h2 style={S.h2}>§ 11 Handelsunterbrechung und Marktsuspendierung</h2>
          <p style={S.p}>
            (1) Die EUCX GmbH ist berechtigt und verpflichtet, den Handelsbetrieb zu unterbrechen oder
            auszusetzen, wenn dies zur Wahrung der Marktintegrität, zur Einhaltung aufsichtsrechtlicher
            Anforderungen oder bei technischen Störungen erforderlich ist (§ 72 Abs. 10 WpHG, Art. 48 MiFID II).
          </p>
          <p style={S.p}>
            (2) In folgenden Fällen kann die EUCX eine Handelssuspendierung anordnen:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Außergewöhnliche Marktvolatilität (Circuit-Breaker-Mechanismus)",
              "Technische Störungen der Matching Engine oder Kerninfrastruktur",
              "Anordnung der BaFin oder einer anderen zuständigen Behörde",
              "Verdacht auf koordinierten Marktmissbrauch",
              "Force Majeure (höhere Gewalt)",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            (3) Während einer Handelsunterbrechung können keine neuen Aufträge erteilt werden.
            Bestehende, noch nicht ausgeführte Aufträge bleiben im Orderbuch, sofern die EUCX
            keine anderweitige Entscheidung trifft. Die EUCX informiert die Marktteilnehmer
            unverzüglich über Art, Dauer und Grund einer Unterbrechung.
          </p>
          <p style={S.p}>
            (4) Schadensersatzansprüche aus einer ordnungsgemäßen Handelsunterbrechung
            sind ausgeschlossen (vgl. § 13 dieser AGB).
          </p>

          {/* § 12 */}
          <h2 style={S.h2}>§ 12 Marktmissbrauch und Compliance</h2>
          <p style={S.p}>
            (1) Jegliche Form von Marktmissbrauch ist strengstens untersagt, insbesondere:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Insiderhandel (Art. 8, 14 MAR, § 119 WpHG)",
              "Marktmanipulation, einschließlich Spoofing, Layering und Wash-Trading (Art. 12, 15 MAR)",
              "Unrechtmäßige Offenbarung von Insiderinformationen (Art. 10, 14 MAR)",
              "Aktionen, die geeignet sind, ein künstliches Preisniveau zu erzeugen oder aufrechtzuerhalten",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            (2) Die EUCX GmbH überwacht den Handelsbetrieb kontinuierlich auf Anzeichen von
            Marktmissbrauch und ist gemäß Art. 16 MAR und § 23 WpHG verpflichtet,
            begründete Verdachtsfälle unverzüglich der BaFin zu melden.
          </p>
          <p style={S.p}>
            (3) Marktteilnehmer sind verpflichtet, der EUCX GmbH und der BaFin auf Verlangen
            alle relevanten Auskünfte und Unterlagen zur Verfügung zu stellen.
          </p>
          <p style={S.p}>
            (4) Bei festgestelltem oder dringendem Verdacht auf Marktmissbrauch ist die EUCX
            berechtigt, die Akkreditierung des betroffenen Marktteilnehmers sofort und ohne
            Vorankündigung zu sperren. Ein Schadensersatzanspruch besteht in diesem Fall nicht.
          </p>

          {/* § 13 */}
          <h2 style={S.h2}>§ 13 Haftung und Haftungsbeschränkung</h2>
          <p style={S.p}>
            (1) Die EUCX GmbH haftet für Schäden aus der Verletzung von Leben, Körper und Gesundheit
            sowie für Vorsatz und grobe Fahrlässigkeit unbeschränkt.
          </p>
          <p style={S.p}>
            (2) Bei leichter Fahrlässigkeit haftet die EUCX GmbH nur für die Verletzung
            wesentlicher Vertragspflichten (Kardinalpflichten). In diesen Fällen ist die Haftung
            auf den typischerweise vorhersehbaren Schaden begrenzt, maximal jedoch auf
            den Jahresumsatz des Marktteilnehmers auf der EUCX im Vorjahr,
            höchstens jedoch auf <strong>500.000 EUR</strong> je Schadensereignis.
          </p>
          <p style={S.p}>
            (3) Eine Haftung der EUCX GmbH ist in folgenden Fällen ausgeschlossen:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Datenverlust durch Maßnahmen der Marktteilnehmer oder Dritter",
              "Marktverluste aus ordnungsgemäß durchgeführten Handelssuspendierungen",
              "Schäden durch Marktschwankungen oder wirtschaftliche Entwicklungen",
              "Schäden durch technische Störungen, die außerhalb des Einflussbereichs der EUCX liegen (Netzwerkausfälle, DDoS-Angriffe, Force Majeure)",
              "Entgangene Gewinne, Folgeschäden und mittelbare Schäden bei einfacher Fahrlässigkeit",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            (4) Für die Bonität der Handelspartner übernimmt die EUCX GmbH keine Haftung.
            Das Kontrahentenrisiko liegt ausschließlich bei den Marktteilnehmern.
          </p>

          {/* § 14 */}
          <h2 style={S.h2}>§ 14 Datenschutz</h2>
          <p style={S.p}>
            Die Verarbeitung personenbezogener Daten erfolgt gemäß der DSGVO und den geltenden
            deutschen Datenschutzgesetzen. Einzelheiten sind in der EUCX-Datenschutzerklärung
            geregelt, die unter{" "}
            <Link href="/datenschutz" style={{ color: "#154194", textDecoration: "none" }}>eucx.eu/datenschutz</Link>
            {" "}abrufbar ist und Bestandteil dieser AGB ist.
          </p>
          <p style={S.p}>
            Die Marktteilnehmer nehmen zur Kenntnis, dass alle Handelsdaten und Transaktionen
            gemäß Art. 26 MiFIR und § 83 WpHG aufgezeichnet, gespeichert und an Aufsichtsbehörden
            gemeldet werden.
          </p>

          {/* § 15 */}
          <h2 style={S.h2}>§ 15 Laufzeit und Kündigung</h2>
          <p style={S.p}>
            (1) Die Akkreditierungsvereinbarung wird auf unbestimmte Zeit geschlossen.
            Sie kann von beiden Parteien mit einer Kündigungsfrist von <strong>30 Tagen</strong>
            {" "}zum Monatsende schriftlich (per E-Mail oder per Einschreiben) gekündigt werden.
          </p>
          <p style={S.p}>
            (2) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            Wichtige Gründe für eine außerordentliche Kündigung durch die EUCX GmbH sind insbesondere:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Wesentlicher Verstoß gegen diese AGB oder die Handelsordnung",
              "Eröffnung eines Insolvenzverfahrens über das Vermögen des Marktteilnehmers",
              "Entzug einer behördlichen Genehmigung, die für den Handel erforderlich ist",
              "Festgestellter Marktmissbrauch im Sinne von § 12 dieser AGB",
              "Unterschreitung der Mindestkautionsanforderungen trotz Margin Call",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            (3) Mit Wirksamwerden der Kündigung erlischt die Akkreditierung.
            Alle offenen Aufträge werden storniert, alle offenen Positionen gemäß § 9 abgewickelt.
            Die Kaution wird nach vollständiger Abwicklung aller offenen Geschäfte zurückgezahlt.
          </p>

          {/* § 16 */}
          <h2 style={S.h2}>§ 16 Änderungen der AGB</h2>
          <p style={S.p}>
            (1) Die EUCX GmbH ist berechtigt, diese AGB zu ändern. Änderungen werden den
            Marktteilnehmern per E-Mail und durch Bekanntmachung auf der Plattform mit einer
            Frist von <strong>30 Tagen</strong> vor Inkrafttreten mitgeteilt.
          </p>
          <p style={S.p}>
            (2) Änderungen gelten als genehmigt, wenn der Marktteilnehmer nicht innerhalb
            von 30 Tagen nach Zugang der Mitteilung schriftlich widerspricht und die
            Plattform nach Ablauf dieser Frist weiter nutzt.
            Auf diese Genehmigungswirkung wird in der Änderungsmitteilung ausdrücklich hingewiesen.
          </p>
          <p style={S.p}>
            (3) Im Falle eines fristgerechten Widerspruchs ist die EUCX GmbH berechtigt,
            die Akkreditierung des Marktteilnehmers mit Wirkung zum Zeitpunkt des
            Inkrafttretens der geänderten AGB ordentlich zu kündigen.
          </p>

          {/* § 17 */}
          <h2 style={S.h2}>§ 17 Schlussbestimmungen</h2>
          <p style={S.p}>
            (1) <strong>Anwendbares Recht:</strong> Es gilt ausschließlich das Recht der Bundesrepublik Deutschland
            unter Ausschluss des UN-Kaufrechts (CISG) und der kollisionsrechtlichen Bestimmungen.
          </p>
          <p style={S.p}>
            (2) <strong>Gerichtsstand:</strong> Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im
            Zusammenhang mit diesen AGB ist <strong>Frankfurt am Main</strong>, sofern der Marktteilnehmer
            Kaufmann im Sinne des HGB ist oder keinen allgemeinen Gerichtsstand in Deutschland hat.
          </p>
          <p style={S.p}>
            (3) <strong>Schriftform:</strong> Änderungen oder Ergänzungen dieser AGB bedürfen der Schriftform.
            Die elektronische Form (E-Mail) gilt als Schriftform im Sinne dieser AGB.
          </p>
          <p style={S.p}>
            (4) <strong>Salvatorische Klausel:</strong> Sollten einzelne Bestimmungen dieser AGB ganz oder
            teilweise unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit
            der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt
            eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung
            am nächsten kommt.
          </p>
          <p style={S.p}>
            (5) <strong>Aufsichtsrecht:</strong> Diese AGB lassen aufsichtsrechtliche Verpflichtungen der
            EUCX GmbH gegenüber der BaFin und anderen zuständigen Behörden unberührt.
            Im Falle eines Widerspruchs zwischen diesen AGB und aufsichtsrechtlichen Vorgaben
            haben Letztere Vorrang.
          </p>

          {/* Hinweis-Box */}
          <div style={{ backgroundColor: "#f0f4ff", padding: "24px 28px", borderLeft: "3px solid #154194", marginTop: 40 }}>
            <p style={{ ...S.p, fontWeight: 600, marginBottom: 8 }}>Hinweis für Marktteilnehmer</p>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Diese AGB wurden von spezialisierten Rechtsanwälten für Kapitalmarktrecht erstellt und berücksichtigen
              die zum Zeitpunkt der Erstellung geltenden Anforderungen aus WpHG, MiFID II, MiFIR, MAR und GwG.
              Sie ersetzen keine individuelle Rechtsberatung. Bei Fragen zur Anwendung dieser AGB
              wenden Sie sich an <a href="mailto:legal@eucx.eu" style={{ color: "#154194", textDecoration: "none" }}>legal@eucx.eu</a>.
            </p>
          </div>

          <p style={{ ...S.p, color: "#888", fontSize: 13, marginTop: 32 }}>
            Fassung: Version 1.0 · Gültig ab 1. April 2026 | EUCX GmbH, Frankfurt am Main
          </p>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#111", color: "#666" }}>
        <div style={{ ...S.container, padding: "48px 40px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 32, borderBottom: "1px solid #222", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ marginBottom: 12 }}><Link href="/" style={{ textDecoration: "none", display: "inline-block" }}><EucxLogo variant="white" size="md" showTagline /></Link></div>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
                Digitale B2B-Warenbörse für institutionellen Rohstoffhandel in der Europäischen Union.
              </p>
            </div>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {[
                { title: "Rechtliches", links: [["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["AGB", "/agb"]] },
                { title: "Plattform",   links: [["Anmelden", "/login"], ["Registrieren", "/register"]] },
              ].map(({ title, links }) => (
                <div key={title}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>{title}</div>
                  {links.map(([label, href]) => (
                    <Link key={label} href={href as string} style={{ display: "block", fontSize: 13, color: "#555", textDecoration: "none", marginBottom: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.color="#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color="#555")}>
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 0", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#333" }}>© 2026 EUCX GmbH · Frankfurt am Main · HRB 123456 AG Frankfurt</span>
            <span style={{ fontSize: 11, color: "#333" }}>Reguliert durch die BaFin · MiFID II OTF-Zulassung</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
