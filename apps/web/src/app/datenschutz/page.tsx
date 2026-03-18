"use client";
import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1180, margin: "0 auto", padding: "0 40px" },
  label:     { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:        { fontSize: 22, fontWeight: 600, color: "#1a1a1a", margin: "48px 0 14px", paddingTop: 16, borderTop: "1px solid #f0f0f0" },
  h3:        { fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: "28px 0 10px" },
  p:         { fontSize: 15, color: "#505050", lineHeight: 1.75, margin: "0 0 12px" },
  li:        { fontSize: 15, color: "#505050", lineHeight: 1.75, marginBottom: 6 },
  table:     { width: "100%", borderCollapse: "collapse" as const, margin: "12px 0 24px", fontSize: 14 },
};

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", backgroundColor: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "10px 14px", fontSize: 14, color: "#505050", borderBottom: "1px solid #f5f5f5", verticalAlign: "top" }}>
      {children}
    </td>
  );
}

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: 0 }}>
            Informationen gemäß Art. 13 und 14 der Datenschutz-Grundverordnung (DSGVO) — Stand: März 2026
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ padding: "64px 0 96px" }}>
        <div style={{ ...S.container, maxWidth: 860 }}>

          {/* Präambel */}
          <div style={{ backgroundColor: "#f0f4ff", padding: "24px 28px", borderLeft: "3px solid #154194", marginBottom: 40 }}>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Der Schutz Ihrer personenbezogenen Daten hat für die EUCX GmbH höchste Priorität.
              Als BaFin-regulierter Betreiber eines Organisierten Handelssystems (OTF) unterliegen wir
              strengen datenschutzrechtlichen und aufsichtsrechtlichen Anforderungen.
              Diese Datenschutzerklärung informiert Sie umfassend darüber, welche Daten wir erheben,
              wie wir diese verarbeiten und welche Rechte Ihnen zustehen.
            </p>
          </div>

          {/* §1 Verantwortlicher */}
          <h2 style={{ ...S.h2, borderTop: "none", marginTop: 0 }}>1. Verantwortlicher und Datenschutzbeauftragter</h2>

          <h3 style={S.h3}>1.1 Verantwortlicher (Art. 4 Nr. 7 DSGVO)</h3>
          <p style={S.p}>
            <strong>EUCX GmbH</strong><br/>
            Taunusanlage 18<br/>
            60325 Frankfurt am Main<br/>
            Telefon: +49 (0) 69 / 123 456-0<br/>
            E-Mail: <a href="mailto:datenschutz@eucx.eu" style={{ color: "#154194", textDecoration: "none" }}>datenschutz@eucx.eu</a>
          </p>

          <h3 style={S.h3}>1.2 Datenschutzbeauftragter (Art. 37 DSGVO)</h3>
          <p style={S.p}>
            Gemäß Art. 37 Abs. 1 lit. b DSGVO ist die EUCX GmbH zur Bestellung eines
            Datenschutzbeauftragten verpflichtet, da die Kerntätigkeit in der umfangreichen
            systematischen Verarbeitung personenbezogener Daten besteht.
          </p>
          <p style={S.p}>
            <strong>Dr. Petra Hofmann</strong>, Zertifizierte Datenschutzbeauftragte (TÜV)<br/>
            EUCX GmbH, Taunusanlage 18, 60325 Frankfurt am Main<br/>
            E-Mail: <a href="mailto:dsb@eucx.eu" style={{ color: "#154194", textDecoration: "none" }}>dsb@eucx.eu</a><br/>
            PGP-Fingerprint: A1B2 C3D4 E5F6 7890 ABCD EF01 2345 6789 ABCD EF01
          </p>

          {/* §2 Kategorien */}
          <h2 style={S.h2}>2. Kategorien personenbezogener Daten</h2>
          <p style={S.p}>Im Rahmen unserer Tätigkeit als OTF-Betreiber verarbeiten wir folgende Kategorien personenbezogener Daten:</p>

          <table style={S.table}>
            <thead>
              <tr><Th>Kategorie</Th><Th>Beispiele</Th></tr>
            </thead>
            <tbody>
              {[
                ["Identifikationsdaten", "Name, Vorname, Geburtsdatum, Staatsangehörigkeit, Lichtbildausweis (KYC)"],
                ["Kontaktdaten", "Geschäftliche Adresse, E-Mail-Adresse, Telefonnummer"],
                ["Unternehmensdaten", "Firmenname, Handelsregisternummer, Umsatzsteuer-ID, LEI-Nummer"],
                ["Finanzdaten", "Bankverbindung (IBAN/BIC), Sicherheitsleistungen, Handelsvolumina, Kreditwürdigkeit"],
                ["Handelsdaten", "Auftragshistorie, Transaktionsdaten, Positionen, Marktdaten-Nutzung"],
                ["Kommunikationsdaten", "Nachrichten über die Handelsplattform, E-Mail-Korrespondenz, Support-Anfragen"],
                ["Technische Daten", "IP-Adresse, Browser-Typ, Session-ID, Zugriffszeitpunkte, Gerätekennungen"],
                ["Compliance-Daten", "Geldwäscheverdachtsmeldungen, KYC-Unterlagen, PEP-Status, Sanktionslistenabgleich"],
              ].map(([kat, bsp]) => (
                <tr key={kat}>
                  <Td><strong>{kat}</strong></Td>
                  <Td>{bsp}</Td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* §3 Verarbeitungszwecke */}
          <h2 style={S.h2}>3. Zwecke und Rechtsgrundlagen der Verarbeitung</h2>

          <h3 style={S.h3}>3.1 Vertragserfüllung und vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO)</h3>
          <p style={S.p}>Wir verarbeiten personenbezogene Daten zur Erfüllung des Vertrages über die Nutzung der EUCX-Handelsplattform sowie zur Durchführung vorvertraglicher Maßnahmen:</p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Registrierung und Kontoeröffnung für Marktteilnehmer",
              "Akkreditierung und Zulassung zum Handelsbetrieb",
              "Auftragsannahme, -abwicklung und -bestätigung",
              "Abwicklung von Handelstransaktionen (Settlement)",
              "Verwaltung von Sicherheitsleistungen (Margin)",
              "Ausstellung von Handelsbestätigungen und Abrechnungen",
              "Kundensupport und Beschwerdemanagement",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          <h3 style={S.h3}>3.2 Rechtliche Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</h3>
          <p style={S.p}>Zahlreiche Verarbeitungen sind durch gesetzliche Pflichten als OTF-Betreiber zwingend vorgeschrieben:</p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Transaktionsmeldepflichten gemäß Art. 26 MiFIR an die BaFin und ESMA",
              "Aufzeichnung und Aufbewahrung von Aufträgen und Transaktionen (§ 83 WpHG, Art. 25 MiFID II)",
              "Identifizierung und Verifizierung von Geschäftskunden (§§ 10–17 GwG — KYC/AML)",
              "Geldwäscheverdachtsmeldungen an die Financial Intelligence Unit (FIU) gemäß § 43 GwG",
              "Abgleich mit EU-Sanktionslisten (Art. 11 VO (EU) 269/2014 etc.)",
              "Buchführungs- und Aufbewahrungspflichten (§§ 238 ff. HGB, §§ 140 ff. AO)",
              "Marktmissbrauchsüberwachung und -meldung (Art. 16 MAR, § 23 WpHG)",
              "Einhaltung der Best-Execution-Dokumentation (§ 69 WpHG, Art. 27 MiFID II)",
              "Aufzeichnung von Telefongesprächen und elektronischer Kommunikation (§ 83 Abs. 3 WpHG)",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          <h3 style={S.h3}>3.3 Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</h3>
          <p style={S.p}>Soweit keine vertragliche oder gesetzliche Grundlage besteht, stützen wir bestimmte Verarbeitungen auf unsere berechtigten Interessen:</p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "IT-Sicherheit: Protokollierung von Zugriffen zur Erkennung und Abwehr von Angriffen",
              "Betrugsprävention und Risikoüberwachung im Handelsgeschäft",
              "Verbesserung und Weiterentwicklung der Handelsplattform durch Nutzungsanalysen (anonymisiert)",
              "Durchsetzung und Verteidigung von Rechtsansprüchen",
              "Konzernweite Compliance-Überwachung und interne Revision",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          <h3 style={S.h3}>3.4 Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</h3>
          <p style={S.p}>
            Für bestimmte Verarbeitungen holen wir Ihre gesonderte Einwilligung ein, insbesondere für
            den Versand von Markt-Newsletter und produktbezogenen Informationen. Eine erteilte Einwilligung
            können Sie jederzeit ohne Angabe von Gründen widerrufen (Art. 7 Abs. 3 DSGVO), ohne dass
            die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung berührt wird.
            Widerruf per E-Mail an: <a href="mailto:datenschutz@eucx.eu" style={{ color: "#154194", textDecoration: "none" }}>datenschutz@eucx.eu</a>
          </p>

          {/* §4 Aufbewahrungsfristen */}
          <h2 style={S.h2}>4. Speicherdauer und Löschfristen</h2>
          <p style={S.p}>
            Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Verarbeitungszweck
            erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben.
          </p>

          <table style={S.table}>
            <thead>
              <tr><Th>Datenkategorie</Th><Th>Aufbewahrungsfrist</Th><Th>Rechtsgrundlage</Th></tr>
            </thead>
            <tbody>
              {[
                ["Transaktions- und Auftragsdaten", "5 Jahre nach Transaktionsdatum", "§ 83 WpHG, Art. 25 MiFID II"],
                ["Handelskommunikation (Telefon, E-Mail)", "5 Jahre", "§ 83 Abs. 3 WpHG"],
                ["KYC-/AML-Unterlagen", "5 Jahre nach Beendigung der Geschäftsbeziehung", "§ 8 Abs. 4 GwG"],
                ["Buchungsbelege, Rechnungen", "10 Jahre", "§ 257 HGB, § 147 AO"],
                ["Handelsbücher, Bilanzen", "10 Jahre", "§ 257 HGB"],
                ["Sonstige Geschäftskorrespondenz", "6 Jahre", "§ 257 HGB, § 147 AO"],
                ["Transaktionsmeldungen (MiFIR)", "5 Jahre", "Art. 26 Abs. 7 MiFIR"],
                ["Server-Logfiles (IP-Adressen)", "7 Tage (Sicherheitsprotokoll: 90 Tage)", "Art. 6 Abs. 1 lit. f DSGVO"],
                ["Einwilligungsnachweise", "3 Jahre nach Widerruf", "Art. 7 Abs. 1 DSGVO i.V.m. § 195 BGB"],
              ].map(([kat, frist, basis]) => (
                <tr key={kat}>
                  <Td><strong>{kat}</strong></Td>
                  <Td>{frist}</Td>
                  <Td>{basis}</Td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* §5 Empfänger */}
          <h2 style={S.h2}>5. Empfänger und Weitergabe personenbezogener Daten</h2>

          <h3 style={S.h3}>5.1 Pflichtmäßige Übermittlung an Behörden</h3>
          <p style={S.p}>Wir sind gesetzlich verpflichtet, Daten an folgende Behörden zu übermitteln:</p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "BaFin (Bundesanstalt für Finanzdienstleistungsaufsicht) — Transaktionsmeldungen, Marktmissbrauchsverdacht",
              "ESMA (European Securities and Markets Authority) — Handelsberichte, MiFIR Art. 26",
              "FIU (Financial Intelligence Unit) — Geldwäscheverdachtsmeldungen gem. § 43 GwG",
              "Deutsche Bundesbank — Zahlungsverkehrsmeldungen, statistisches Meldewesen",
              "Finanzämter und Steuerbehörden — bei Betriebsprüfungen und nach AO",
              "Staatsanwaltschaft und Gerichte — bei gesetzlicher Verpflichtung",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          <h3 style={S.h3}>5.2 Auftragsverarbeiter (Art. 28 DSGVO)</h3>
          <p style={S.p}>
            Wir setzen sorgfältig ausgewählte Auftragsverarbeiter ein, mit denen wir
            Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO geschlossen haben:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Cloud-Infrastruktur (Serverhosting) — ausschließlich in der EU (Deutschland)",
              "E-Mail-Versanddienstleister für transaktionale Benachrichtigungen",
              "KYC/AML-Identifizierungsdienstleister für die Kundenverifizierung",
              "IT-Sicherheitsdienstleister für Penetrationstests und Security Operations",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          <h3 style={S.h3}>5.3 Drittlandübermittlungen (Art. 44 ff. DSGVO)</h3>
          <p style={S.p}>
            Eine Übermittlung personenbezogener Daten in Drittländer (außerhalb des EWR) erfolgt nur,
            wenn ein Angemessenheitsbeschluss der EU-Kommission gemäß Art. 45 DSGVO vorliegt oder
            geeignete Garantien gemäß Art. 46 DSGVO (z.B. EU-Standardvertragsklauseln) vereinbart wurden.
            Soweit möglich, vermeiden wir Drittlandübermittlungen.
          </p>

          {/* §6 Technische Daten */}
          <h2 style={S.h2}>6. Technische Datenverarbeitung und Sicherheit</h2>

          <h3 style={S.h3}>6.1 Server-Logfiles</h3>
          <p style={S.p}>
            Beim Zugriff auf unsere Plattform erfasst der Webserver automatisch technische Daten:
            IP-Adresse, Datum und Uhrzeit, aufgerufene URL, HTTP-Statuscode, übertragene Datenmenge,
            Referrer-URL sowie Informationen über Browser und Betriebssystem.
            Diese Daten dienen der Systemsicherheit und werden nach 7 Tagen (Sicherheitsvorfälle: 90 Tage) gelöscht.
          </p>

          <h3 style={S.h3}>6.2 Cookies und Session-Management</h3>
          <p style={S.p}>
            Wir verwenden ausschließlich technisch notwendige Session-Cookies, die nach Schließen des Browsers
            gelöscht werden. Persistente Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt.
            Marketing-Cookies oder Third-Party-Tracking werden auf unserer Plattform nicht eingesetzt.
          </p>

          <h3 style={S.h3}>6.3 Technisch-organisatorische Maßnahmen (TOMs)</h3>
          <p style={S.p}>Wir haben umfangreiche Sicherheitsmaßnahmen gemäß Art. 32 DSGVO implementiert:</p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Transportverschlüsselung: TLS 1.3 für alle Datenübertragungen",
              "Datenverschlüsselung at rest: AES-256 für alle gespeicherten personenbezogenen Daten",
              "Zugangskontrolle: Rollenbasiertes Berechtigungskonzept (RBAC), Zwei-Faktor-Authentifizierung (2FA)",
              "Netzwerksicherheit: Firewall, IDS/IPS, regelmäßige Penetrationstests",
              "Verfügbarkeit: Georedundante Rechenzentren in Deutschland (Tier IV)",
              "Incident Response Plan: Meldeprozesse gemäß Art. 33 DSGVO (72-Stunden-Frist)",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>

          {/* §7 Rechte */}
          <h2 style={S.h2}>7. Ihre Rechte als betroffene Person</h2>
          <p style={S.p}>Sie haben gegenüber der EUCX GmbH folgende Rechte nach der DSGVO:</p>

          <table style={S.table}>
            <thead>
              <tr><Th>Recht</Th><Th>Rechtsgrundlage</Th><Th>Inhalt</Th></tr>
            </thead>
            <tbody>
              {[
                ["Auskunft", "Art. 15 DSGVO", "Bestätigung, ob Daten verarbeitet werden; Kopie der verarbeiteten Daten"],
                ["Berichtigung", "Art. 16 DSGVO", "Korrektur unrichtiger oder unvollständiger Daten"],
                ["Löschung", "Art. 17 DSGVO", "Löschung, sofern keine gesetzliche Aufbewahrungspflicht entgegensteht"],
                ["Einschränkung", "Art. 18 DSGVO", "Einschränkung der Verarbeitung in bestimmten Situationen"],
                ["Datenübertragbarkeit", "Art. 20 DSGVO", "Erhalt Ihrer Daten in maschinenlesbarem Format (JSON/CSV)"],
                ["Widerspruch", "Art. 21 DSGVO", "Widerspruch gegen Verarbeitungen auf Basis berechtigter Interessen"],
                ["Widerruf", "Art. 7 Abs. 3 DSGVO", "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft"],
                ["Beschwerde", "Art. 77 DSGVO", "Beschwerde bei der zuständigen Aufsichtsbehörde (s.u.)"],
              ].map(([recht, basis, inhalt]) => (
                <tr key={recht}>
                  <Td><strong>{recht}</strong></Td>
                  <Td>{basis}</Td>
                  <Td>{inhalt}</Td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={S.p}>
            Zur Geltendmachung Ihrer Rechte wenden Sie sich schriftlich oder per E-Mail an unseren Datenschutzbeauftragten:
            <a href="mailto:dsb@eucx.eu" style={{ color: "#154194", textDecoration: "none" }}> dsb@eucx.eu</a>.
            Wir beantworten Ihren Antrag binnen 30 Tagen (Art. 12 Abs. 3 DSGVO); in begründeten Ausnahmefällen
            kann diese Frist um weitere 60 Tage verlängert werden.
          </p>
          <p style={S.p}>
            Bitte beachten Sie: Das Recht auf Löschung und das Recht auf Einschränkung können durch aufsichtsrechtliche
            Aufbewahrungspflichten (WpHG, GwG, HGB, AO) begrenzt sein.
          </p>

          {/* §8 Aufsichtsbehörde */}
          <h2 style={S.h2}>8. Zuständige Datenschutz-Aufsichtsbehörde</h2>
          <p style={S.p}>
            Die für die EUCX GmbH zuständige Datenschutz-Aufsichtsbehörde ist der
            <strong> Hessische Beauftragte für Datenschutz und Informationsfreiheit (HBDI)</strong>:
          </p>
          <div style={{ backgroundColor: "#fafafa", padding: "20px 24px", border: "1px solid #e8e8e8", marginBottom: 16 }}>
            <p style={{ ...S.p, marginBottom: 6 }}>
              <strong>Der Hessische Beauftragte für Datenschutz und Informationsfreiheit</strong><br/>
              Postfach 3163 · 65021 Wiesbaden<br/>
              Telefon: +49 (0) 611 / 1408-0<br/>
              E-Mail: <a href="mailto:poststelle@datenschutz.hessen.de" style={{ color: "#154194", textDecoration: "none" }}>poststelle@datenschutz.hessen.de</a><br/>
              Internet: <a href="https://datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" style={{ color: "#154194", textDecoration: "none" }}>datenschutz.hessen.de</a>
            </p>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Sie haben das Recht, sich jederzeit ohne vorherige Kontaktaufnahme mit uns an die Aufsichtsbehörde
              zu wenden (Art. 77 DSGVO).
            </p>
          </div>

          {/* §9 Automatisierte Entscheidungen */}
          <h2 style={S.h2}>9. Automatisierte Entscheidungsfindung und Profiling</h2>
          <p style={S.p}>
            Die EUCX GmbH nimmt automatisierte Entscheidungen einschließlich Profiling im Sinne des Art. 22 DSGVO
            nur in folgenden Fällen vor:
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 16px" }}>
            {[
              "Sanktionslistenabgleich (automatisierter Abgleich mit EU- und UN-Sanktionslisten gem. Art. 22 Abs. 2 lit. b DSGVO — gesetzliche Verpflichtung)",
              "Risikobewertung im Rahmen des KYC-Prozesses (Risikoklassifizierung LOW/MEDIUM/HIGH gem. § 14 GwG — notwendig für Vertragsschluss, Art. 22 Abs. 2 lit. a DSGVO)",
            ].map(item => <li key={item} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}>
            Sie haben das Recht, eine menschliche Überprüfung automatisierter Entscheidungen zu verlangen,
            Ihren Standpunkt darzulegen und die Entscheidung anzufechten (Art. 22 Abs. 3 DSGVO).
          </p>

          {/* §10 Änderungen */}
          <h2 style={S.h2}>10. Änderungen dieser Datenschutzerklärung</h2>
          <p style={S.p}>
            Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an geänderte
            Rechtslage, geänderte Verarbeitungszwecke oder neue technische Entwicklungen anzupassen.
            Die aktuelle Version ist stets unter <a href="/datenschutz" style={{ color: "#154194", textDecoration: "none" }}>eucx.eu/datenschutz</a> abrufbar.
            Bei wesentlichen Änderungen werden aktive Marktteilnehmer per E-Mail informiert.
          </p>
          <p style={{ ...S.p, color: "#888", fontSize: 13 }}>
            Stand: März 2026 | Version 1.0
          </p>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#111", color: "#666" }}>
        <div style={{ ...S.container, padding: "48px 40px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 32, borderBottom: "1px solid #222", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ marginBottom: 12 }}><EucxLogo variant="white" size="sm" showTagline /></div>
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
