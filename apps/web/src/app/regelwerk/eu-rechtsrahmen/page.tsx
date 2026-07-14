import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/seo/metadata";
import { SiteNav } from "@/components/SiteNav";
import { Scale, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "EU-Rechtsrahmen – EUCX Regelwerk",
  description:
    "Überblick über den anwendbaren EU-Rechtsrahmen für die EUCX: GwG, BGB/HGB, CBAM, DSGVO, GWB und weitere Gesetze.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/regelwerk/eu-rechtsrahmen` },
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const DARK = "#0b1e36";
const GREEN = "#145a32";
const RED = "#7b241c";
const AMBER = "#784212";

type Status = "anwendbar" | "nicht-anwendbar" | "freiwillig";

interface Gesetz {
  kuerzel: string;
  name: string;
  status: Status;
  begruendung: string;
  eucx: string;
}

const RECHTSGEBIETE: { title: string; beschreibung: string; gesetze: Gesetz[] }[] = [
  {
    title: "Kernrecht: Handels- und Vertragsrecht",
    beschreibung: "Primäre Rechtsgrundlage des EUCX-Handelsbetriebs",
    gesetze: [
      { kuerzel: "BGB", name: "Bürgerliches Gesetzbuch", status: "anwendbar", begruendung: "Alle Kauf- und Rahmenverträge auf der EUCX basieren auf BGB §§ 433 ff. (Kaufrecht). Schuldrechtliche Beziehungen zwischen Käufer und Verkäufer.", eucx: "Grundlage aller Handelskontrakte, Mängelrüge, Rücktrittsrechte, Gewährleistung" },
      { kuerzel: "HGB", name: "Handelsgesetzbuch", status: "anwendbar", begruendung: "Beide Parteien sind Kaufleute (§§ 1–7 HGB). Handelsbrauch, Rügepflicht (§ 377 HGB), Handelskauf, Kommissionsrecht.", eucx: "Rügepflicht bei Lieferung, Handelsbräuche, Orderbuch-Abschlüsse als Handelsgeschäfte" },
      { kuerzel: "ZPO §§ 1025 ff.", name: "Zivilprozessordnung – Schiedsrecht", status: "anwendbar", begruendung: "EUCX-Schiedsklauseln in allen Kontrakten. Schiedssprüche vollstreckbar wie gerichtliche Urteile.", eucx: "Grundlage der EUCX-Schiedskommission (DOK-12); Frankfurt als Schiedsort" },
      { kuerzel: "GWB", name: "Gesetz gegen Wettbewerbsbeschränkungen", status: "anwendbar", begruendung: "Preisbildung auf der EUCX muss wettbewerbskonform sein. Bundeskartellamt überwacht marktbeherrschende Stellung.", eucx: "Preisüberwachung, Verbot von Preisabsprachen, Meldepflichten bei Marktkonzentration" },
    ],
  },
  {
    title: "Geldwäscheprävention & Compliance",
    beschreibung: "Regulatorische Compliance-Anforderungen für den Plattformbetrieb",
    gesetze: [
      { kuerzel: "GwG", name: "Geldwäschegesetz (AMLD6-Umsetzung)", status: "anwendbar", begruendung: "EUCX betreibt einen organisierten Marktplatz mit regelmäßigen Transaktionen. KYC-Pflichten, Verdachtsmeldungen an FIU, Transaktionsmonitoring.", eucx: "Vollständige KYC/AML-Prüfung aller Mitglieder, UBO-Erfassung, FIU-Meldungen, Enhanced Due Diligence für Hochrisikoländer" },
      { kuerzel: "EU 2015/849", name: "Geldwäscherichtlinie 5 (AMLD5)", status: "anwendbar", begruendung: "Als Grundlage des deutschen GwG direkt relevant. Anforderungen an Risikobewertung, PEP-Screening, UBO-Register.", eucx: "Umgesetzt über GwG; EUCX-Mitgliedschaft setzt AMLD5-konforme Due Diligence voraus" },
      { kuerzel: "EU 2021/1160", name: "FATF-Empfehlungen (EU-Umsetzung)", status: "anwendbar", begruendung: "Länderspezifische Risikobewertung. FATF-Hochrisikoländer unterliegen Enhanced Due Diligence (EDD) bei EUCX.", eucx: "Länderrisikokategorien NR-1/NR-2/NR-3 in DOK-18 (Nicht-Residenten-Akkreditierung)" },
    ],
  },
  {
    title: "Nicht anwendbar: Finanzmarktrecht",
    beschreibung: "Die EUCX handelt ausschließlich physische Spotware — kein Finanzinstrument, kein Derivat",
    gesetze: [
      { kuerzel: "MiFID II", name: "Markets in Financial Instruments Directive II (EU 2014/65)", status: "nicht-anwendbar", begruendung: "MiFID II gilt für Finanzinstrumente (Aktien, Derivate, strukturierte Produkte). Physische Spotware-Lieferverträge sind explizit ausgenommen (Art. 2 Abs. 1 lit. d–f MiFID II). Die EUCX ist kein OTF/MTF/RM.", eucx: "EUCX handelt nicht als regulierter Handelsplatz gemäß MiFID II. Keine BaFin-Lizenz als OTF erforderlich." },
      { kuerzel: "MAR", name: "Market Abuse Regulation (EU 596/2014)", status: "nicht-anwendbar", begruendung: "MAR gilt für Finanzinstrumente an geregelten Märkten. Physische Waren sind keine Finanzinstrumente i.S.d. MAR.", eucx: "Marktmissbrauch auf EUCX wird über GWB (Kartellrecht) und GwG adressiert, nicht über MAR" },
      { kuerzel: "EMIR", name: "European Market Infrastructure Regulation (EU 648/2012)", status: "nicht-anwendbar", begruendung: "EMIR gilt für OTC-Derivate und deren Clearing. Physische Spotgeschäfte sind keine Derivate.", eucx: "Clearing auf EUCX erfolgt bilateral nach BGB/HGB-Treuhandrecht (DOK-19), nicht nach EMIR" },
    ],
  },
  {
    title: "EU-Handelsrecht & Warenverkehr",
    beschreibung: "Warenspezifische Anforderungen für den grenzüberschreitenden Handel",
    gesetze: [
      { kuerzel: "CBAM (EU 2023/956)", name: "Carbon Border Adjustment Mechanism", status: "anwendbar", begruendung: "CBAM betrifft physische Warenimporte bestimmter CO₂-intensiver Güter (Stahl, Aluminium, Zement, Dünger, Elektrizität) aus Nicht-EU-Ländern. Gilt für Käufer, die Waren importieren.", eucx: "EUCX-Mitglieder, die CBAM-Waren aus Drittländern kaufen, unterliegen CBAM-Meldepflichten. EUCX weist in Sektionsreglements darauf hin (DOK-02)." },
      { kuerzel: "EU 269/2014 ff.", name: "EU-Sanktionsverordnungen (Russland, Belarus, Iran etc.)", status: "anwendbar", begruendung: "EU-Sanktionen verbieten Warenlieferungen an sanktionierte Personen/Länder. EUCX muss Sanktionsscreening durchführen.", eucx: "Vollständiges Sanktionsscreening aller Mitglieder und Transaktionen. Transaktionen mit sanktionierten Parteien werden blockiert." },
      { kuerzel: "Incoterms 2020", name: "International Commercial Terms (ICC)", status: "anwendbar", begruendung: "Branchenstandard für Lieferbedingungen im internationalen Warenhandel. EUCX-Kontrakte verwenden Incoterms 2020 als Standard.", eucx: "Alle Lieferkontrakte auf EUCX definieren Incoterms 2020 (EXW, FCA, CIF, DAP, DDP etc.)" },
    ],
  },
  {
    title: "Datenschutz & IT",
    beschreibung: "Datenschutzrechtliche Anforderungen für den Plattformbetrieb",
    gesetze: [
      { kuerzel: "DSGVO (EU 2016/679)", name: "Datenschutz-Grundverordnung", status: "anwendbar", begruendung: "EUCX verarbeitet personenbezogene Daten (KYC-Dokumente, UBO-Daten, Handelshistorie). DSGVO-Konformität ist Pflicht.", eucx: "Datenschutzerklärung, Data Processing Agreements, Löschkonzept, DSGVO-konforme KYC-Datenspeicherung" },
      { kuerzel: "DORA (freiwillig)", name: "Digital Operational Resilience Act (EU 2022/2554)", status: "freiwillig", begruendung: "DORA ist für regulierte Finanzinstitute verpflichtend. Da EUCX kein MiFID II-reguliertes Institut ist, gilt DORA nicht direkt.", eucx: "EUCX orientiert sich freiwillig an DORA-Standards für IT-Sicherheit und Business Continuity (DOK-11)" },
    ],
  },
];

const STATUS_CONFIG: Record<Status, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  "anwendbar":         { color: GREEN, bg: "#d4edda", icon: CheckCircle, label: "Anwendbar" },
  "nicht-anwendbar":   { color: RED,   bg: "#f8d7da", icon: XCircle,     label: "Nicht anwendbar" },
  "freiwillig":        { color: AMBER, bg: "#fdebd0", icon: AlertCircle, label: "Freiwillig" },
};

export default function EuRechtsrahmenPage() {
  return (
    <>
      <SiteNav activeHref="/regelwerk" />

      <style>{`
        .rw-law-row {
          background: #fff;
          border: 1px solid #e0e4ea;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 160px 1fr 1fr;
          gap: 24px;
          align-items: start;
          transition: box-shadow 150ms ease;
        }
        .rw-law-row:hover { box-shadow: 0 2px 12px rgba(0,0,0,.07); }
        @media (max-width: 720px) {
          .rw-law-row { grid-template-columns: 1fr; }
        }
        .rw-footer-link { font-size: 12px; color: rgba(255,255,255,.3); text-decoration: none; transition: color 150ms ease; }
        .rw-footer-link:hover { color: rgba(255,255,255,.65); }
      `}</style>

      {/* Hero */}
      <section style={{ backgroundColor: DARK, padding: "56px 32px 48px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.35)", fontSize: 12, textDecoration: "none" }}>EUCX</Link>
            <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>›</span>
            <Link href="/regelwerk" style={{ color: "rgba(255,255,255,.35)", fontSize: 12, textDecoration: "none" }}>Regelwerk</Link>
            <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>›</span>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500 }}>EU-Rechtsrahmen</span>
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
                EU-<span style={{ fontWeight: 700 }}>Rechtsrahmen</span>
              </h1>
            </div>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 680, margin: "20px 0 0", lineHeight: 1.7, fontWeight: 300 }}>
            Als physische Spot-Warenhandelsplattform operiert die EUCX im Rahmen des allgemeinen
            EU-Handels- und Vertragsrechts. Der folgende Überblick zeigt, welche Gesetze
            anwendbar sind — und welche ausdrücklich nicht.
          </p>

          <div style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
            {(["anwendbar", "nicht-anwendbar", "freiwillig"] as Status[]).map((s) => {
              const { color, bg, icon: Icon, label } = STATUS_CONFIG[s];
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color, backgroundColor: bg, padding: "3px 9px", border: `1px solid ${color}22` }}>
                    <Icon size={10} /> {label.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ height: 3, backgroundColor: BLUE }} />

      {/* Content */}
      <section style={{ backgroundColor: "#f7f8fa", padding: "56px 32px 80px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {RECHTSGEBIETE.map(({ title, beschreibung, gesetze }) => (
            <div key={title} style={{ marginBottom: 52 }}>
              <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid #e0e4ea" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {title}
                </h2>
                <p style={{ fontSize: 12.5, color: "#888", margin: 0 }}>{beschreibung}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {gesetze.map((g) => {
                  const { color, bg, icon: Icon, label } = STATUS_CONFIG[g.status];
                  return (
                    <div key={g.kuerzel} className="rw-law-row">
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0d1b2a", marginBottom: 6 }}>{g.kuerzel}</div>
                        <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4, marginBottom: 10 }}>{g.name}</div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color, backgroundColor: bg, padding: "3px 9px", border: `1px solid ${color}22` }}>
                          <Icon size={10} /> {label.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>Begründung</div>
                        <p style={{ fontSize: 12.5, color: "#444", margin: 0, lineHeight: 1.65 }}>{g.begruendung}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>Relevanz für EUCX</div>
                        <p style={{ fontSize: 12.5, color: "#444", margin: 0, lineHeight: 1.65 }}>{g.eucx}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ backgroundColor: "#e8edf5", border: "1px solid rgba(21,65,148,.2)", borderLeft: `4px solid ${BLUE}`, padding: "20px 24px", marginTop: 8 }}>
            <p style={{ fontSize: 13, color: "#333", margin: "0 0 8px", fontWeight: 600 }}>Rechtlicher Hinweis</p>
            <p style={{ fontSize: 12.5, color: "#555", margin: 0, lineHeight: 1.7 }}>
              Dieser Überblick dient der Information und ersetzt keine individuelle Rechtsberatung.
              Für verbindliche rechtliche Einschätzungen zu Ihrer spezifischen Situation konsultieren
              Sie bitte einen zugelassenen Rechtsanwalt. Änderungen der Rechtslage bleiben vorbehalten.{" "}
              <Link href="/regelwerk" style={{ color: BLUE, textDecoration: "none", fontWeight: 600 }}>← Zurück zum Regelwerk</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: DARK, borderTop: `3px solid ${BLUE}`, padding: "48px 32px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", margin: "0 0 8px" }}>EUCX — European Union Commodity Exchange</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)", margin: 0 }}>Physische Spot-Warenhandelsplattform · Frankfurt am Main</p>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Regelwerk", href: "/regelwerk" },
              { label: "Normative Dokumente", href: "/regelwerk/normative-dokumente" },
              { label: "Impressum", href: "/impressum" },
              { label: "Datenschutz", href: "/datenschutz" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="rw-footer-link">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
