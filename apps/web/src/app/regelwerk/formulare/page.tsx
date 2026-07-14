import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/seo/metadata";
import { SiteNav } from "@/components/SiteNav";
import { ClipboardList, Download, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Formulare & Anträge – EUCX Regelwerk",
  description:
    "Alle Formulare und Anträge der EUCX: Mitgliedsantrag, KYC-Selbstauskunft, Händlerzertifizierung, Schiedsklage und weitere Dokumente.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/regelwerk/formulare` },
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const DARK = "#0b1e36";

interface Formular {
  id: string;
  title: string;
  beschreibung: string;
  quelle: string;
  quellePdf: string;
  quelleHref: string;
  verwendung: string;
  frist?: string;
}

const KATEGORIEN: { title: string; color: string; hinweis?: string; formulare: Formular[] }[] = [
  {
    title: "Mitgliedschaft & Zulassung",
    color: "#154194",
    hinweis: "Diese Formulare werden im Rahmen des Onboarding-Prozesses benötigt. Der Antrag erfolgt primär online; Dokumente können vorab heruntergeladen werden.",
    formulare: [
      { id: "F-01", title: "Mitgliedsantrag", beschreibung: "Formeller Antrag auf Zulassung als Handelsteilnehmer der EUCX.", quelle: "DOK-13", quellePdf: "EUCX-DOK-13_Mitgliedschaft__KYC.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Einmalig bei Erstregistrierung. Enthält Angaben zu Rechtsform, Handelsregister, Geschäftstätigkeit und verantwortliche Ansprechpartner.", frist: "Vor Handelsaufnahme" },
      { id: "F-02", title: "KYC-Selbstauskunft", beschreibung: "Selbstauskunftsbogen für Know-Your-Customer-Verfahren gemäß GwG.", quelle: "DOK-13", quellePdf: "EUCX-DOK-13_Mitgliedschaft__KYC.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Angaben zu Gesellschafterstruktur, wirtschaftlich Berechtigten (UBO ≥25%), PEP-Status, Geschäftsfeldern und Herkunft der Finanzmittel.", frist: "Zusammen mit Mitgliedsantrag" },
      { id: "F-03", title: "UBO-Erklärung (wirtschaftlich Berechtigte)", beschreibung: "Erklärung zur Offenlegung aller wirtschaftlich Berechtigten gemäß GwG § 3.", quelle: "DOK-13", quellePdf: "EUCX-DOK-13_Mitgliedschaft__KYC.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Identifizierung aller natürlichen Personen mit ≥25% Kapital- oder Stimmrechtsanteil. Bei Änderungen unverzüglich zu aktualisieren.", frist: "Bei Antrag + bei jeder Änderung" },
      { id: "F-04", title: "Nicht-Residenten-Akkreditierungsantrag", beschreibung: "Antrag für Unternehmen aus EWR-Staaten und weiteren akkreditierungsfähigen Ländern.", quelle: "DOK-18", quellePdf: "EUCX-DOK-18_Nicht-Residenten-Akkreditierung.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Unternehmen außerhalb Deutschlands aus akkreditierungsfähigen Ländern. Zusätzliche EDD-Dokumente erforderlich.", frist: "Vor Handelsaufnahme" },
    ],
  },
  {
    title: "Händlerzertifizierung",
    color: "#6b4f12",
    hinweis: "Die Händlerzertifizierung ist für alle aktiven Börsenhändler verpflichtend. Zertifikate sind 2 Jahre gültig.",
    formulare: [
      { id: "F-05", title: "Antrag Händlerzertifizierung (Level I)", beschreibung: "Zulassung zur EUCX-Grundausbildung und Level-I-Prüfung.", quelle: "DOK-14", quellePdf: "EUCX-DOK-14_H%C3%A4ndlerzertifizierung.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Für alle natürlichen Personen, die im Namen eines EUCX-Mitglieds Orders platzieren. Pflichtschulung + schriftliche Prüfung.", frist: "Vor erster Handelsaktivität" },
      { id: "F-06", title: "Antrag Rezertifizierung", beschreibung: "Verlängerungsantrag für abgelaufene Händlerzertifikate.", quelle: "DOK-14", quellePdf: "EUCX-DOK-14_H%C3%A4ndlerzertifizierung.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Alle 2 Jahre einzureichen. Enthält Nachweis über absolvierte Fortbildungspunkte (CPD) und aktualisierte Selbstauskunft.", frist: "Spätestens 30 Tage vor Ablauf" },
    ],
  },
  {
    title: "Sicherheitsleistungen",
    color: "#1a3a5c",
    formulare: [
      { id: "F-07", title: "Bankgarantie-Formular", beschreibung: "Standardformular für Bankgarantien als Sicherheitsleistung.", quelle: "DOK-07", quellePdf: "EUCX-DOK-07_Sicherheitsleistungen.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Mitglieder, die Bankgarantie als Alternative zur Barkaution einreichen möchten. Muss von EUCX-anerkannter Bank ausgestellt sein.", frist: "Vor Handelsaufnahme / bei Limiten-Erhöhung" },
      { id: "F-08", title: "Antrag Handelsvolumen-Erhöhung", beschreibung: "Antrag auf Erhöhung des genehmigten Handelsvolumens.", quelle: "DOK-07", quellePdf: "EUCX-DOK-07_Sicherheitsleistungen.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Bei Bedarf höherer Handelslimiten. Erfordert aktualisierte Bonitätsdokumentation und ggf. erhöhte Sicherheitsleistung.", frist: "Mindestens 5 Werktage Vorlaufzeit" },
    ],
  },
  {
    title: "Streitbeilegung",
    color: "#4a235a",
    hinweis: "Alle Streitigkeiten aus EUCX-Handelsgeschäften werden gemäß DOK-12 zunächst dem Schlichtungsverfahren, dann dem Schiedsverfahren unterzogen.",
    formulare: [
      { id: "F-09", title: "Schlichtungsantrag", beschreibung: "Formloser Antrag zur Einleitung des EUCX-Schlichtungsverfahrens.", quelle: "DOK-12", quellePdf: "EUCX-DOK-12_Schiedskommission.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Erste Stufe der Streitbeilegung. Einzureichen bei der EUCX-Schiedskommission. Kostenlos, Frist: 20 Werktage nach Streitentstehung.", frist: "20 Werktage nach Streitentstehung" },
      { id: "F-10", title: "Schiedsklage", beschreibung: "Formelle Einleitung des Schiedsverfahrens nach ZPO §§ 1025 ff.", quelle: "DOK-12", quellePdf: "EUCX-DOK-12_Schiedskommission.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Falls Schlichtung scheitert. Schriftlich bei der EUCX-Schiedskommission einzureichen. Schiedsgebühr nach Streitwert.", frist: "6 Monate nach Streitentstehung (Ausschlussfrist)" },
    ],
  },
  {
    title: "Handelskontrakte",
    color: "#145a32",
    hinweis: "Vertragsvorlagen stehen in DOK-06 als PDF zur Verfügung. Die Verwendung der EUCX-Standardvorlagen wird dringend empfohlen.",
    formulare: [
      { id: "F-11", title: "EUCX-Standardkaufvertrag", beschreibung: "Standardkaufvertrag für physische Warenlieferungen auf der EUCX.", quelle: "DOK-06", quellePdf: "EUCX-DOK-06_Vertragsvorlagen.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Wird nach jedem Orderbuch-Abschluss automatisch generiert. Kann auch für außerbörsliche Geschäfte zwischen EUCX-Mitgliedern verwendet werden." },
      { id: "F-12", title: "Rahmenvertrag", beschreibung: "Langfristiger Rahmenvertrag für wiederkehrende Geschäftsbeziehungen.", quelle: "DOK-06", quellePdf: "EUCX-DOK-06_Vertragsvorlagen.pdf", quelleHref: "/regelwerk/normative-dokumente", verwendung: "Für EUCX-Mitglieder, die regelmäßig Geschäfte miteinander abschließen und Konditionen vorab vereinbaren möchten." },
    ],
  },
];

export default function FormularePage() {
  return (
    <>
      <SiteNav activeHref="/regelwerk" />

      <style>{`
        .rw-form-row {
          background: #fff;
          border: 1px solid #e0e4ea;
          padding: 20px 24px;
          transition: box-shadow 150ms ease;
        }
        .rw-form-row:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
        .rw-dl-btn {
          display: flex; align-items: center; gap: 7px;
          font-size: 11.5px; font-weight: 700; color: #fff;
          padding: 9px 15px; text-decoration: none; white-space: nowrap;
          transition: opacity 150ms ease;
        }
        .rw-dl-btn:hover { opacity: 0.82; }
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
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500 }}>Formulare & Anträge</span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 48, height: 48, backgroundColor: BLUE, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>
                Regelwerk — Formulare
              </p>
              <h1 style={{ fontSize: 34, fontWeight: 300, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Formulare & <span style={{ fontWeight: 700 }}>Anträge</span>
              </h1>
            </div>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 640, margin: "20px 0 0", lineHeight: 1.7, fontWeight: 300 }}>
            Alle Formulare sind Bestandteil der normativen Dokumente und werden als PDF bereitgestellt.
            Formulare sind in der jeweils gültigen Fassung zu verwenden.
          </p>
        </div>
      </section>

      <div style={{ height: 3, backgroundColor: BLUE }} />

      {/* Content */}
      <section style={{ backgroundColor: "#f7f8fa", padding: "56px 32px 80px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {KATEGORIEN.map(({ title, color, hinweis, formulare }) => (
            <div key={title} style={{ marginBottom: 52 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: hinweis ? 10 : 20, paddingBottom: 14, borderBottom: "2px solid #e0e4ea" }}>
                <div style={{ width: 4, height: 22, backgroundColor: color }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {title}
                </h2>
                <span style={{ fontSize: 12, color: "#888", backgroundColor: "#e8eaed", padding: "2px 8px" }}>
                  {formulare.length} Formular{formulare.length !== 1 ? "e" : ""}
                </span>
              </div>

              {hinweis && (
                <p style={{ fontSize: 12.5, color: "#666", margin: "0 0 20px", lineHeight: 1.65, paddingLeft: 18, borderLeft: `2px solid ${color}44` }}>
                  {hinweis}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {formulare.map((f) => (
                  <div key={f.id} className="rw-form-row" style={{ borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color, border: `1px solid ${color}`, padding: "2px 7px", letterSpacing: "0.06em", flexShrink: 0 }}>
                            {f.id}
                          </span>
                          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>{f.title}</h3>
                        </div>
                        <p style={{ fontSize: 12.5, color: "#555", margin: "0 0 10px", lineHeight: 1.6 }}>{f.beschreibung}</p>
                        <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px", lineHeight: 1.65 }}>
                          <strong style={{ color: "#333" }}>Verwendung:</strong> {f.verwendung}
                        </p>
                        {f.frist && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "#fff8e6", border: "1px solid #f0c040", padding: "3px 10px" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#7d6008", letterSpacing: "0.05em" }}>FRIST</span>
                            <span style={{ fontSize: 11, color: "#555" }}>{f.frist}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888" }}>
                          <FileText size={11} />
                          <span>Quelle:</span>
                          <Link href={f.quelleHref} style={{ color: BLUE, textDecoration: "none", fontWeight: 600 }}>
                            {f.quelle}
                          </Link>
                        </div>
                        <a href={`/downloads/regelwerk/${f.quellePdf}`} download className="rw-dl-btn" style={{ backgroundColor: color }}>
                          <Download size={12} /> Quelldokument PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ borderLeft: "3px solid rgba(21,65,148,.25)", paddingLeft: 20, paddingTop: 4, paddingBottom: 4 }}>
            <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#0d1b2a" }}>Hinweis:</strong> Alle Formulare sind in den jeweiligen normativen Dokumenten enthalten.
              Ausgefüllte Formulare sind an{" "}
              <a href="mailto:compliance@eucx.eu" style={{ color: BLUE, textDecoration: "none" }}>compliance@eucx.eu</a>
              {" "}zu übermitteln.{" "}
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
              { label: "EU-Rechtsrahmen", href: "/regelwerk/eu-rechtsrahmen" },
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
