"use client";
import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1180, margin: "0 auto", padding: "0 40px" },
  label:     { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:        { fontSize: 28, fontWeight: 300, color: "#1a1a1a", lineHeight: 1.2, margin: "0 0 20px" },
  h3:        { fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: "32px 0 10px" },
  p:         { fontSize: 15, color: "#505050", lineHeight: 1.75, margin: "0 0 12px" },
  li:        { fontSize: 15, color: "#505050", lineHeight: 1.75, marginBottom: 6 },
};

export default function ImpressumPage() {
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
            Impressum
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: 0 }}>
            Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 2 Dienstleistungs-Informationspflichten-Verordnung (DL-InfoV)
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ padding: "64px 0 96px" }}>
        <div style={{ ...S.container, maxWidth: 860, display: "grid", gridTemplateColumns: "1fr", gap: 48 }}>

          {/* Anbieter */}
          <div style={{ borderLeft: "3px solid #154194", paddingLeft: 28 }}>
            <span style={S.label}>Diensteanbieter</span>
            <h2 style={S.h2}>EUCX GmbH</h2>
            <p style={S.p}>
              <strong>Unternehmensform:</strong> Gesellschaft mit beschränkter Haftung (GmbH)<br/>
              <strong>Handelsregister:</strong> HRB 123456, Amtsgericht Frankfurt am Main<br/>
              <strong>Gründungsjahr:</strong> 2025
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 style={S.h3}>Anschrift und Kontakt</h3>
            <p style={S.p}>
              EUCX GmbH<br/>
              Taunusanlage 18<br/>
              60325 Frankfurt am Main<br/>
              Deutschland
            </p>
            <p style={S.p}>
              <strong>Telefon:</strong> +49 (0) 69 / 123 456-0<br/>
              <strong>Telefax:</strong> +49 (0) 69 / 123 456-99<br/>
              <strong>E-Mail:</strong> <a href="mailto:info@eucx.eu" style={{ color: "#154194", textDecoration: "none" }}>info@eucx.eu</a><br/>
              <strong>Internet:</strong> <a href="https://www.eucx.eu" style={{ color: "#154194", textDecoration: "none" }}>www.eucx.eu</a>
            </p>
          </div>

          {/* Geschäftsführung */}
          <div>
            <h3 style={S.h3}>Vertretungsberechtigte Geschäftsführer</h3>
            <p style={S.p}>
              Die EUCX GmbH wird vertreten durch die Geschäftsführer:<br/>
              <strong>Dr. Markus Steinhardt</strong> (Vorsitzender der Geschäftsführung, CEO)<br/>
              <strong>Katharina Brenner</strong> (Chief Operating Officer, COO)<br/>
              <strong>Prof. Dr. Johannes Falk</strong> (Chief Risk Officer, CRO)
            </p>
          </div>

          {/* Steuer */}
          <div>
            <h3 style={S.h3}>Steuerliche Angaben</h3>
            <p style={S.p}>
              <strong>Umsatzsteuer-Identifikationsnummer (§ 27a UStG):</strong> DE 345 678 901<br/>
              <strong>Steuernummer:</strong> 045/123/45678, Finanzamt Frankfurt am Main III
            </p>
          </div>

          {/* Aufsicht BaFin */}
          <div style={{ backgroundColor: "#f0f4ff", padding: "24px 28px", borderLeft: "3px solid #154194" }}>
            <span style={S.label}>Regulierungsangaben</span>
            <h3 style={{ ...S.h3, marginTop: 0 }}>Aufsichtsbehörde und Erlaubnis</h3>
            <p style={S.p}>
              Die EUCX GmbH ist bei der Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin) als Betreiberin eines
              <strong> Organisierten Handelssystems (OTF)</strong> im Sinne des § 72 Wertpapierhandelsgesetz (WpHG) i.V.m.
              Art. 18–20 der Richtlinie 2014/65/EU (MiFID II) zugelassen.
            </p>
            <p style={S.p}>
              <strong>Erlaubnis-Nummer:</strong> 10155.IV.7.0001/2025<br/>
              <strong>Erlaubnis erteilt am:</strong> 12. März 2025<br/>
              <strong>Registerführende Behörde:</strong> Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)
            </p>
            <p style={S.p}>
              <strong>Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)</strong><br/>
              Marie-Curie-Str. 24–28 · 60439 Frankfurt am Main<br/>
              Graurheindorfer Str. 108 · 53117 Bonn<br/>
              Telefon: +49 (0) 228 / 4108-0<br/>
              Internet: <a href="https://www.bafin.de" target="_blank" rel="noopener noreferrer" style={{ color: "#154194", textDecoration: "none" }}>www.bafin.de</a>
            </p>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Die EUCX GmbH ist im öffentlichen Unternehmensregister der BaFin und im
              europäischen MiFID-Register der ESMA (European Securities and Markets Authority) eingetragen.
              Das öffentliche Register ist einsehbar unter:{" "}
              <a href="https://registers.esma.europa.eu" target="_blank" rel="noopener noreferrer" style={{ color: "#154194", textDecoration: "none" }}>registers.esma.europa.eu</a>
            </p>
          </div>

          {/* Berufsrechtliche Angaben */}
          <div>
            <h3 style={S.h3}>Berufsrechtliche Angaben (§ 2 Abs. 1 Nr. 8 DL-InfoV)</h3>
            <p style={S.p}>
              <strong>Berufsbezeichnung:</strong> Betreiberin eines Organisierten Handelssystems (OTF) nach § 72 WpHG<br/>
              <strong>Staat der Verleihung:</strong> Bundesrepublik Deutschland<br/>
              <strong>Zuständige Aufsichtsbehörde:</strong> BaFin, Frankfurt am Main / Bonn (s.o.)
            </p>
            <p style={S.p}>
              Maßgebliche berufsrechtliche Regelungen:
            </p>
            <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
              {[
                "Wertpapierhandelsgesetz (WpHG), insbesondere §§ 63–92 und §§ 72–75",
                "Wertpapierinstitutsgesetz (WpIG)",
                "Richtlinie 2014/65/EU (MiFID II), Delegierte Verordnung (EU) 2017/565",
                "Verordnung (EU) Nr. 600/2014 (MiFIR), insbesondere Art. 26 (Transaktionsmeldepflicht)",
                "Verordnung (EU) Nr. 596/2014 (Marktmissbrauchsverordnung, MAR)",
                "Verordnung (EU) Nr. 648/2012 (EMIR) für OTC-Derivate",
                "Geldwäschegesetz (GwG)",
                "Börsengesetz (BörsG) soweit anwendbar",
              ].map(text => (
                <li key={text} style={S.li}>{text}</li>
              ))}
            </ul>
            <p style={S.p}>
              Die berufsrechtlichen Regelungen sind abrufbar unter:
              <a href="https://www.gesetze-im-internet.de" target="_blank" rel="noopener noreferrer" style={{ color: "#154194", textDecoration: "none" }}> www.gesetze-im-internet.de</a>
            </p>
          </div>

          {/* Berufshaftpflicht */}
          <div>
            <h3 style={S.h3}>Berufshaftpflichtversicherung</h3>
            <p style={S.p}>
              <strong>Versicherer:</strong> Allianz Global Corporate &amp; Specialty SE, München<br/>
              <strong>Räumlicher Geltungsbereich:</strong> Europäischer Wirtschaftsraum (EWR) und Schweiz<br/>
              <strong>Mindestversicherungssumme:</strong> 5.000.000 EUR je Versicherungsfall
            </p>
          </div>

          {/* Streitbeilegung */}
          <div>
            <h3 style={S.h3}>Online-Streitbeilegung (OS-Plattform)</h3>
            <p style={S.p}>
              Die Europäische Kommission stellt unter folgendem Link eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "#154194", textDecoration: "none" }}>
                ec.europa.eu/consumers/odr
              </a>
            </p>
            <p style={S.p}>
              Hinweis: Die EUCX GmbH ist eine reine B2B-Plattform. Ihre Dienstleistungen richten sich ausschließlich an
              Unternehmen und akkreditierte Marktteilnehmer. Verbraucher im Sinne des § 13 BGB sind von der Nutzung
              ausgeschlossen. Die EUCX GmbH ist nicht zur Teilnahme an einem Verbraucherschlichtungsverfahren
              verpflichtet und nimmt hieran nicht teil (§ 36 VSBG).
            </p>
          </div>

          {/* Redaktionelle Verantwortung */}
          <div>
            <h3 style={S.h3}>Inhaltlich Verantwortlicher gemäß § 18 Abs. 2 MStV</h3>
            <p style={S.p}>
              Dr. Markus Steinhardt<br/>
              EUCX GmbH, Taunusanlage 18, 60325 Frankfurt am Main
            </p>
          </div>

          {/* Haftungshinweis */}
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 32 }}>
            <h3 style={{ ...S.h3, marginTop: 0 }}>Haftungshinweis</h3>
            <p style={S.p}>
              Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
              Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
            </p>
            <p style={S.p}>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung
              und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers.
            </p>
            <p style={{ ...S.p, marginBottom: 0 }}>
              Stand: März 2026 | Die EUCX GmbH behält sich vor, die Angaben in diesem Impressum jederzeit ohne
              vorherige Ankündigung zu ändern.
            </p>
          </div>

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
