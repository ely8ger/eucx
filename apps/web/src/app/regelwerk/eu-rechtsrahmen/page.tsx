import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/seo/metadata";
import { SiteNav } from "@/components/SiteNav";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "EU-Gesetzgebung & Rechtsgrundlagen – EUCX Regelwerk",
  description:
    "Vollständige Übersicht der für die EUCX maßgeblichen EU-Gesetze und Verordnungen: Handelsrecht, GwG, CBAM, DSGVO, Sanktionsrecht und Schiedsrecht.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/regelwerk/eu-rechtsrahmen` },
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const DARK = "#0b1e36";

interface Rechtsakt {
  nr: string;
  titel: string;
  datum?: string;
  hinweis?: string;
  href?: string;
}

interface Kategorie {
  id: number;
  titel: string;
  akte: Rechtsakt[];
}

const KATEGORIEN: Kategorie[] = [
  {
    id: 1,
    titel: "Handels- und Vertragsrecht",
    akte: [
      { nr: "1.1", titel: "Bürgerliches Gesetzbuch (BGB)", datum: "i.d.F. vom 2. Januar 2002 (BGBl. I S. 42)", hinweis: "§§ 433 ff. – Kaufrecht; Grundlage aller EUCX-Handelskontrakte" },
      { nr: "1.2", titel: "Handelsgesetzbuch (HGB)", datum: "i.d.F. vom 10. Mai 1897 (RGBl. S. 219)", hinweis: "§§ 343 ff. – Handelskauf; § 377 – Rügepflicht bei Lieferung" },
      { nr: "1.3", titel: "Gesetz gegen Wettbewerbsbeschränkungen (GWB)", datum: "i.d.F. vom 26. Juni 2013 (BGBl. I S. 1750)", hinweis: "Preismissbrauch, Kartellverbot, Bundeskartellamt-Aufsicht" },
      { nr: "1.4", titel: "Zivilprozessordnung (ZPO) – Schiedsrecht", datum: "§§ 1025–1066 ZPO", hinweis: "Deutsches Schiedsverfahrensrecht; Grundlage der EUCX-Schiedskommission" },
      { nr: "1.5", titel: "Verordnung (EU) Nr. 593/2008 – Rom I", datum: "17. Juni 2008", hinweis: "Anwendbares Recht auf vertragliche Schuldverhältnisse im Binnenmarkt" },
      { nr: "1.6", titel: "Verordnung (EU) Nr. 1215/2012 – Brüssel Ia", datum: "12. Dezember 2012", hinweis: "Gerichtliche Zuständigkeit und Anerkennung von Entscheidungen in Zivilsachen" },
      { nr: "1.7", titel: "Incoterms® 2020 (ICC Paris)", datum: "Fassung 2020", hinweis: "Internationale Lieferbedingungen; Standard für alle EUCX-Warenkontrakte" },
      { nr: "1.8", titel: "UN-Kaufrecht (CISG)", datum: "Wien, 11. April 1980", hinweis: "UN Convention on Contracts for the International Sale of Goods; fakultativ anwendbar" },
    ],
  },
  {
    id: 2,
    titel: "Geldwäscheprävention & KYC/AML",
    akte: [
      { nr: "2.1", titel: "Geldwäschegesetz (GwG)", datum: "i.d.F. vom 23. Juni 2017 (BGBl. I S. 1822)", hinweis: "Umsetzung der AMLD5 in deutsches Recht; Pflicht zur KYC-Prüfung, UBO-Erfassung und FIU-Meldungen" },
      { nr: "2.2", titel: "Richtlinie (EU) 2015/849 – 4. Geldwäscherichtlinie (AMLD4)", datum: "20. Mai 2015", hinweis: "Risikobasierter Ansatz, PEP-Screening, Transparenzregister" },
      { nr: "2.3", titel: "Richtlinie (EU) 2018/843 – 5. Geldwäscherichtlinie (AMLD5)", datum: "30. Mai 2018", hinweis: "Erweiterung auf Krypto, verstärkte EDD für Hochrisikodrittländer" },
      { nr: "2.4", titel: "Richtlinie (EU) 2024/1640 – 6. Geldwäscherichtlinie (AMLD6)", datum: "19. Juni 2024", hinweis: "Erweiterter Verpflichtetenkreis, zentralisierte AML-Aufsicht ab 2027" },
      { nr: "2.5", titel: "FATF-Empfehlungen (Financial Action Task Force)", datum: "Fassung 2012, aktualisiert 2023", hinweis: "Internationaler Standard; Grundlage für Länderbewertungen und EDD-Anforderungen (DOK-18)" },
      { nr: "2.6", titel: "Verordnung (EU) 2023/1113 – Geldtransfer-Verordnung (Travel Rule)", datum: "31. Mai 2023", hinweis: "Angaben zum Auftraggeber bei Geldtransfers; gilt für Zahlungsdienstleister der EUCX-Partner" },
    ],
  },
  {
    id: 3,
    titel: "EU-Sanktionsrecht & Exportkontrolle",
    akte: [
      { nr: "3.1", titel: "Verordnung (EU) Nr. 269/2014 – Restriktive Maßnahmen Ukraine/Russland", datum: "17. März 2014", hinweis: "Sanktionslisten; EUCX prüft alle Mitglieder und Transaktionen gegen diese Liste" },
      { nr: "3.2", titel: "Verordnung (EU) 2022/576 – Erweitertes Sanktionspaket Russland", datum: "8. April 2022 (6. Paket)", hinweis: "Erweitertes Güterembargo, Verbote für Stahl und Rohstoffe aus Russland" },
      { nr: "3.3", titel: "Verordnung (EU) Nr. 765/2006 – Restriktive Maßnahmen Belarus", datum: "18. Mai 2006", hinweis: "Einfuhr- und Ausfuhrverbote für bestimmte Waren und Personen" },
      { nr: "3.4", titel: "Verordnung (EU) 2021/821 – Dual-Use-Güter-Verordnung", datum: "20. Mai 2021", hinweis: "Güter mit doppeltem Verwendungszweck; gilt für bestimmte Chemie- und Technologiegüter auf EUCX" },
      { nr: "3.5", titel: "Außenwirtschaftsgesetz (AWG)", datum: "i.d.F. vom 6. Juni 2013 (BGBl. I S. 1482)", hinweis: "Deutsches Außenwirtschaftsrecht; Grundlage für Genehmigungspflichten bei bestimmten Exporten" },
      { nr: "3.6", titel: "Außenwirtschaftsverordnung (AWV)", datum: "i.d.F. vom 2. August 2013 (BGBl. I S. 2865)", hinweis: "Durchführungsbestimmungen zum AWG; Meldepflichten bei grenzüberschreitenden Zahlungen" },
    ],
  },
  {
    id: 4,
    titel: "Warenhandel, Zoll & CBAM",
    akte: [
      { nr: "4.1", titel: "Verordnung (EU) 2023/956 – Carbon Border Adjustment Mechanism (CBAM)", datum: "10. Mai 2023", hinweis: "CO₂-Grenzausgleich für Stahl, Aluminium, Zement, Dünger, Elektrizität aus Drittländern; gilt für EUCX-Käufer bei Importen" },
      { nr: "4.2", titel: "Verordnung (EU) Nr. 952/2013 – Unionszollkodex (UZK)", datum: "9. Oktober 2013", hinweis: "Zollverfahren beim Import und Export von EUCX-gehandelten Waren aus/in Drittländer" },
      { nr: "4.3", titel: "Durchführungsverordnung (EU) 2015/2447 – UZK-Durchführungsbestimmungen", datum: "24. November 2015", hinweis: "Technische Anforderungen, Zollanmeldungen, präferenzielle Ursprungsregeln" },
      { nr: "4.4", titel: "Kombinierte Nomenklatur der Europäischen Union (KN/CN)", datum: "Fassung 2026 (jährlich aktualisiert)", hinweis: "CN-Codes für alle auf EUCX zugelassenen Handelsgüter (DOK-03)" },
      { nr: "4.5", titel: "Verordnung (EU) Nr. 1025/2012 – Europäische Normung", datum: "25. Oktober 2012", hinweis: "Grundlage für Qualitätsnormen (EN 10204, EN 10025 etc.) bei Stahlprodukten auf EUCX" },
      { nr: "4.6", titel: "Richtlinie (EU) 2003/87/EG – EU-Emissionshandelssystem (EU-ETS)", datum: "13. Oktober 2003 (zuletzt geändert 2023)", hinweis: "Emissionszertifikate für CBAM-relevante Industrien; relevant für CO₂-Preisberechnung" },
    ],
  },
  {
    id: 5,
    titel: "Datenschutz & IT-Sicherheit",
    akte: [
      { nr: "5.1", titel: "Verordnung (EU) 2016/679 – Datenschutz-Grundverordnung (DSGVO)", datum: "27. April 2016", hinweis: "Verarbeitung personenbezogener Daten (KYC-Dokumente, UBO-Daten, Nutzerprofile)" },
      { nr: "5.2", titel: "Bundesdatenschutzgesetz (BDSG)", datum: "i.d.F. vom 30. Juni 2017 (BGBl. I S. 2097)", hinweis: "Deutsche Ergänzung zur DSGVO; Beschäftigtendatenschutz, behördliche Aufsicht" },
      { nr: "5.3", titel: "Richtlinie (EU) 2022/2555 – NIS2-Richtlinie", datum: "14. Dezember 2022", hinweis: "Netz- und Informationssicherheit für kritische Infrastrukturen; Orientierungsstandard für EUCX-IT" },
      { nr: "5.4", titel: "Verordnung (EU) 2022/2554 – DORA", datum: "14. Dezember 2022", hinweis: "Digital Operational Resilience Act; für EUCX freiwilliger Orientierungsstandard (kein MiFID II-Institut)" },
      { nr: "5.5", titel: "Telekommunikation-Telemedien-Datenschutz-Gesetz (TTDSG)", datum: "i.d.F. vom 23. Juni 2021 (BGBl. I S. 1982)", hinweis: "Cookie-Regelungen, Einwilligungen, Nutzertracking auf der EUCX-Webplattform" },
    ],
  },
  {
    id: 6,
    titel: "Schiedsrecht & Streitbeilegung",
    akte: [
      { nr: "6.1", titel: "ZPO §§ 1025–1066 – Deutsches Schiedsverfahrensrecht", datum: "i.d.F. Schiedsverfahrens-Neuregelungsgesetz 1998", hinweis: "Grundlage aller Schiedsverfahren vor der EUCX-Schiedskommission (DOK-12); Frankfurt am Main als Schiedsort" },
      { nr: "6.2", titel: "UN-Übereinkommen über die Anerkennung ausländischer Schiedssprüche", datum: "New York, 10. Juni 1958 (New Yorker Übereinkommen)", hinweis: "Vollstreckbarkeit von EUCX-Schiedssprüchen in 172 Vertragsstaaten weltweit" },
      { nr: "6.3", titel: "UNCITRAL-Modellgesetz über internationale Handelsschiedsgerichtsbarkeit", datum: "Fassung 2006", hinweis: "Internationaler Referenzrahmen; EUCX-Schiedsordnung angelehnt an UNCITRAL-Grundsätze" },
      { nr: "6.4", titel: "Richtlinie 2008/52/EG – EU-Mediationsrichtlinie", datum: "21. Mai 2008", hinweis: "Grenzüberschreitende Mediation als erste Stufe der EUCX-Streitbeilegung (DOK-12)" },
    ],
  },
  {
    id: 7,
    titel: "Ausdrücklich nicht anwendbar: Finanzmarktrecht",
    akte: [
      { nr: "7.1", titel: "Richtlinie 2014/65/EU – MiFID II", datum: "15. Mai 2014", hinweis: "Nicht anwendbar — gilt für Finanzinstrumente. Physische Spotware ist explizit ausgenommen (Art. 2 Abs. 1 MiFID II). EUCX ist kein OTF/MTF/RM." },
      { nr: "7.2", titel: "Verordnung (EU) Nr. 596/2014 – Marktmissbrauchsverordnung (MAR)", datum: "16. April 2014", hinweis: "Nicht anwendbar — MAR gilt für Finanzinstrumente an regulierten Märkten. Preismissbrauch auf EUCX → GWB." },
      { nr: "7.3", titel: "Verordnung (EU) Nr. 648/2012 – EMIR", datum: "4. Juli 2012", hinweis: "Nicht anwendbar — EMIR gilt für OTC-Derivate. EUCX-Kontrakte sind physische Spotgeschäfte, keine Derivate." },
      { nr: "7.4", titel: "Verordnung (EU) 2023/1114 – MiCA (Krypto-Assets)", datum: "31. Mai 2023", hinweis: "Nicht anwendbar — EUCX handelt keine digitalen Vermögenswerte oder Krypto-Assets." },
    ],
  },
];

export default function EuRechtsrahmenPage() {
  return (
    <>
      <SiteNav activeHref="/regelwerk" />

      <style>{`
        .rw-item {
          padding: 14px 0;
          border-bottom: 1px solid #eef0f3;
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 12px;
          align-items: baseline;
        }
        .rw-item:last-child { border-bottom: none; }
        .rw-footer-link { font-size: 12px; color: rgba(255,255,255,.3); text-decoration: none; transition: color 150ms ease; }
        .rw-footer-link:hover { color: rgba(255,255,255,.65); }
        .rw-kat { margin-bottom: 44px; }
        .rw-kat-block { background: #fff; border: 1px solid #e0e4ea; padding: 4px 28px 8px; }
        .rw-nr { font-size: 11.5px; font-weight: 700; color: #999; font-variant-numeric: tabular-nums; padding-top: 2px; }
        .rw-na .rw-nr { color: #c0392b; }
        .rw-na .rw-titel { color: #888; }
      `}</style>

      {/* Hero */}
      <section style={{ backgroundColor: DARK, padding: "56px 32px 48px", fontFamily: SANS }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.35)", fontSize: 12, textDecoration: "none" }}>EUCX</Link>
            <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>›</span>
            <Link href="/regelwerk" style={{ color: "rgba(255,255,255,.35)", fontSize: 12, textDecoration: "none" }}>Regelwerk</Link>
            <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>›</span>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500 }}>EU-Gesetzgebung</span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 48, height: 48, backgroundColor: BLUE, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scale size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>
                Regelwerk — Rechtsgrundlagen
              </p>
              <h1 style={{ fontSize: 34, fontWeight: 300, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                EU-Gesetzgebung &<br />
                <span style={{ fontWeight: 700 }}>Rechtsgrundlagen</span>
              </h1>
            </div>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 640, margin: "20px 0 0", lineHeight: 1.7, fontWeight: 300 }}>
            Vollständige Übersicht aller für den Betrieb der EUCX maßgeblichen EU-Verordnungen,
            EU-Richtlinien und nationalen Gesetze — gegliedert nach Rechtsgebieten.
          </p>
        </div>
      </section>

      <div style={{ height: 3, backgroundColor: BLUE }} />

      {/* Inhaltsverzeichnis */}
      <section style={{ backgroundColor: "#f0f3f7", borderBottom: "1px solid #dde1e8", padding: "24px 32px", fontFamily: SANS }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px", fontWeight: 600 }}>Inhalt</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 32px" }}>
            {KATEGORIEN.map(k => (
              <a key={k.id} href={`#kat-${k.id}`} style={{ fontSize: 12.5, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa" }}>{k.id}.</span>
                {k.titel}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ backgroundColor: "#f7f8fa", padding: "48px 32px 80px", fontFamily: SANS }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {KATEGORIEN.map((kat) => {
            const isNichtAnwendbar = kat.id === 7;
            return (
              <div key={kat.id} id={`kat-${kat.id}`} className="rw-kat">
                {/* Kategorie-Header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  marginBottom: 2, paddingBottom: 14,
                  borderBottom: `2px solid ${isNichtAnwendbar ? "#c0392b" : BLUE}`,
                }}>
                  <span style={{
                    fontSize: 22, fontWeight: 800,
                    color: isNichtAnwendbar ? "#c0392b" : BLUE,
                    lineHeight: 1, minWidth: 28,
                  }}>{kat.id}.</span>
                  <h2 style={{
                    fontSize: 15, fontWeight: 700,
                    color: isNichtAnwendbar ? "#c0392b" : "#0d1b2a",
                    margin: 0, letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}>{kat.titel}</h2>
                </div>

                <div className="rw-kat-block">
                  {kat.akte.map((akt) => (
                    <div key={akt.nr} className={`rw-item${isNichtAnwendbar ? " rw-na" : ""}`}>
                      <span className="rw-nr">{akt.nr}</span>
                      <div>
                        <span className="rw-titel" style={{
                          fontSize: 13.5, fontWeight: 600,
                          color: isNichtAnwendbar ? "#888" : "#0d1b2a",
                          display: "block", marginBottom: akt.datum || akt.hinweis ? 4 : 0,
                          textDecoration: isNichtAnwendbar ? "line-through" : "none",
                          textDecorationColor: "#c0392b44",
                        }}>
                          {akt.titel}
                        </span>
                        {akt.datum && (
                          <span style={{ fontSize: 11, color: "#999", display: "block", marginBottom: akt.hinweis ? 4 : 0 }}>
                            {akt.datum}
                          </span>
                        )}
                        {akt.hinweis && (
                          <span style={{ fontSize: 12, color: isNichtAnwendbar ? "#c0392b" : "#555", display: "block", lineHeight: 1.55 }}>
                            {akt.hinweis}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Hinweis */}
          <div style={{ backgroundColor: "#e8edf5", border: "1px solid rgba(21,65,148,.2)", borderLeft: `4px solid ${BLUE}`, padding: "18px 22px" }}>
            <p style={{ fontSize: 12.5, color: "#555", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#0d1b2a" }}>Hinweis:</strong> Diese Übersicht ist nicht abschließend und ersetzt keine Rechtsberatung.
              Maßgeblich ist jeweils die zum Zeitpunkt des Handelsabschlusses gültige Fassung. Änderungen der Rechtslage werden in den
              normativen Dokumenten zeitnah nachgeführt.{" "}
              <Link href="/regelwerk" style={{ color: BLUE, textDecoration: "none", fontWeight: 600 }}>← Zurück zum Regelwerk</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: DARK, borderTop: `3px solid ${BLUE}`, padding: "48px 32px", fontFamily: SANS }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", margin: "0 0 8px" }}>EUCX — European Union Commodity Exchange</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)", margin: 0 }}>Physische Spot-Warenhandelsplattform · Frankfurt am Main</p>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Regelwerk", href: "/regelwerk" },
              { label: "Normative Dokumente", href: "/regelwerk/normative-dokumente" },
              { label: "Formulare", href: "/regelwerk/formulare" },
              { label: "Impressum", href: "/impressum" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="rw-footer-link">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
