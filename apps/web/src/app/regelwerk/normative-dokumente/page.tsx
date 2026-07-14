import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/seo/metadata";
import { SiteNav } from "@/components/SiteNav";
import { Download, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Normative Dokumente – EUCX Regelwerk",
  description:
    "Alle 15 normativen Dokumente der EUCX als PDF: Handelsordnung, Sektionsreglements, Vertragsvorlagen, Clearing-Regeln und mehr.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/regelwerk/normative-dokumente` },
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const DARK = "#0b1e36";

interface Dok {
  id: string;
  title: string;
  subtitle: string;
  file: string;
  seiten: number;
  updated: string;
  tags: string[];
}

const KATEGORIEN: { title: string; color: string; docs: Dok[] }[] = [
  {
    title: "Handelsbetrieb",
    color: "#154194",
    docs: [
      { id: "DOK-01", title: "Handelsordnung", subtitle: "Kernregelwerk des Börsenbetriebs", file: "EUCX-DOK-01_Handelsordnung.pdf", seiten: 42, updated: "2026-07", tags: ["Handelssitzungen", "Orderbuch", "Preisregeln", "Suspenierung"] },
      { id: "DOK-08", title: "Preisbildung im Börsenhandel", subtitle: "Preismechanismus und Überwachung", file: "EUCX-DOK-08_Preisbildung.pdf", seiten: 14, updated: "2026-07", tags: ["Auktionspreisbildung", "GWB", "Preisüberwachung", "Referenzpreise"] },
      { id: "DOK-09", title: "Sanktionskatalog und Sanktionsverfahren", subtitle: "Verstöße, Sanktionen, Verfahren", file: "EUCX-DOK-09_Sanktionskatalog.pdf", seiten: 14, updated: "2026-07", tags: ["Ordnungswidrigkeiten", "Bußgelder", "Ausschluss", "GwG"] },
    ],
  },
  {
    title: "Waren & Kontrakte",
    color: "#145a32",
    docs: [
      { id: "DOK-02", title: "Sektionsreglements", subtitle: "Stahl, CBAM-Waren und weitere Sektionen", file: "EUCX-DOK-02_Sektionsreglements.pdf", seiten: 15, updated: "2026-07", tags: ["Metalle", "Agrar", "Energie", "Holz", "CBAM"] },
      { id: "DOK-03", title: "Warenliste / Zugelassene Handelsgüter", subtitle: "CN-Codes, Qualitätsnormen, Mindestmengen", file: "EUCX-DOK-03_Warenliste__CN-Codes.pdf", seiten: 14, updated: "2026-07", tags: ["CN-Codes", "EN 10204", "Incoterms 2020", "Mindestlosgrößen"] },
      { id: "DOK-06", title: "Vertragsvorlagen und Mustervereinbarungen", subtitle: "Standardkontrakte für alle Warensektionen", file: "EUCX-DOK-06_Vertragsvorlagen.pdf", seiten: 16, updated: "2026-07", tags: ["Kaufvertrag", "Rahmenvertrag", "NDA", "Geheimhaltung"] },
      { id: "DOK-10", title: "Warenprüfung und Qualitätsnachweise", subtitle: "Inspektionsregeln, Zertifikate, Mängelrüge", file: "EUCX-DOK-10_Warenpr%C3%BCfung.pdf", seiten: 14, updated: "2026-07", tags: ["EN 10204", "SGS-Inspektion", "Mängelrüge", "Ersatzlieferung"] },
    ],
  },
  {
    title: "Mitgliedschaft & Zulassung",
    color: "#6b4f12",
    docs: [
      { id: "DOK-13", title: "Mitgliedschaft / Onboarding / KYC-Verfahren", subtitle: "Zulassung, KYC, AML-Prüfung", file: "EUCX-DOK-13_Mitgliedschaft__KYC.pdf", seiten: 16, updated: "2026-07", tags: ["KYC", "AML", "GwG", "UBO", "Due Diligence"] },
      { id: "DOK-07", title: "Sicherheitsleistungen und Margin-Anforderungen", subtitle: "Garantien, Kautionen, Bonität", file: "EUCX-DOK-07_Sicherheitsleistungen.pdf", seiten: 14, updated: "2026-07", tags: ["Bankgarantie", "Barkaution", "Bonität", "Limiten"] },
      { id: "DOK-14", title: "Händlerzertifizierung", subtitle: "Zertifizierungsprogramm für Börsenhändler", file: "EUCX-DOK-14_H%C3%A4ndlerzertifizierung.pdf", seiten: 14, updated: "2026-07", tags: ["Pflichtschulungen", "Prüfung", "Rezertifizierung", "Ethik"] },
      { id: "DOK-18", title: "Nicht-Residenten-Akkreditierung", subtitle: "Drittstaaten-Teilnehmer, Enhanced Due Diligence", file: "EUCX-DOK-18_Nicht-Residenten-Akkreditierung.pdf", seiten: 14, updated: "2026-07", tags: ["EWR", "Drittstaaten", "EDD", "FATF", "Länderrisiko"] },
    ],
  },
  {
    title: "Abwicklung & IT",
    color: "#1a3a5c",
    docs: [
      { id: "DOK-16", title: "Abrechnung und Settlement", subtitle: "Treuhandkonto, Abwicklungsregeln", file: "EUCX-DOK-16_Abrechnung__Settlement.pdf", seiten: 16, updated: "2026-07", tags: ["Treuhandkonto", "T+2 Settlement", "BGB/HGB", "GwG"] },
      { id: "DOK-19", title: "Clearing-Regeln", subtitle: "Bilateral Clearing auf BGB/HGB-Basis", file: "EUCX-DOK-19_Clearing-Regeln.pdf", seiten: 14, updated: "2026-07", tags: ["Bilateral Clearing", "Aufrechnung", "Treuhandrecht", "Netting"] },
      { id: "DOK-11", title: "Systemzugang und IT-Sicherheit", subtitle: "Authentifizierung, API-Zugang, Datensicherheit", file: "EUCX-DOK-11_Systemzugang__IT-Sicherheit.pdf", seiten: 14, updated: "2026-07", tags: ["MFA", "API", "DSGVO", "ISO 27001", "Verschlüsselung"] },
    ],
  },
  {
    title: "Streitbeilegung",
    color: "#4a235a",
    docs: [
      { id: "DOK-12", title: "Schiedskommission und Streitbeilegung", subtitle: "Schiedsverfahren nach ZPO §§ 1025 ff.", file: "EUCX-DOK-12_Schiedskommission.pdf", seiten: 14, updated: "2026-07", tags: ["ZPO Schiedsrecht", "Mediation", "Schiedsklage", "Gerichtsstand"] },
    ],
  },
];

export default function NormativeDokumentePage() {
  return (
    <>
      <SiteNav activeHref="/regelwerk" />

      <style>{`
        .rw-dok-row {
          background: #fff;
          border: 1px solid #e0e4ea;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
          transition: box-shadow 150ms ease;
        }
        .rw-dok-row:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
        .rw-dl-btn {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 700; color: #fff;
          padding: 10px 16px; text-decoration: none; white-space: nowrap;
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
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500 }}>Normative Dokumente</span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 48, height: 48, backgroundColor: BLUE, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>
                Regelwerk — PDF-Dokumente
              </p>
              <h1 style={{ fontSize: 34, fontWeight: 300, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Normative <span style={{ fontWeight: 700 }}>Dokumente</span>
              </h1>
            </div>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 640, margin: "20px 0 0", lineHeight: 1.7, fontWeight: 300 }}>
            15 normative Dokumente, verbindlich für alle zugelassenen Mitglieder der EUCX.
            Alle Dokumente stehen als PDF zum Download bereit.
          </p>
        </div>
      </section>

      <div style={{ height: 3, backgroundColor: BLUE }} />

      {/* Content */}
      <section style={{ backgroundColor: "#f7f8fa", padding: "56px 32px 80px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {KATEGORIEN.map(({ title, color, docs }) => (
            <div key={title} style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid #e0e4ea" }}>
                <div style={{ width: 4, height: 22, backgroundColor: color }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {title}
                </h2>
                <span style={{ fontSize: 12, color: "#888", backgroundColor: "#e8eaed", padding: "2px 8px" }}>
                  {docs.length} Dokument{docs.length !== 1 ? "e" : ""}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {docs.map((dok) => (
                  <div key={dok.id} className="rw-dok-row" style={{ borderLeft: `3px solid ${color}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color, border: `1px solid ${color}`, padding: "2px 7px", letterSpacing: "0.08em", flexShrink: 0 }}>
                          {dok.id}
                        </span>
                        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>{dok.title}</h3>
                      </div>
                      <p style={{ fontSize: 12.5, color: "#666", margin: "0 0 12px" }}>{dok.subtitle}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {dok.tags.map(tag => (
                          <span key={tag} style={{ fontSize: 10.5, color: "#555", backgroundColor: "#f0f2f5", padding: "3px 8px", fontWeight: 500 }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0, paddingTop: 4 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{dok.seiten} Seiten</div>
                        <div style={{ fontSize: 10, color: "#bbb" }}>Stand {dok.updated}</div>
                      </div>
                      <a href={`/downloads/regelwerk/${dok.file}`} download className="rw-dl-btn" style={{ backgroundColor: color }}>
                        <Download size={13} /> PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ borderLeft: "3px solid rgba(21,65,148,.25)", paddingLeft: 20, paddingTop: 4, paddingBottom: 4 }}>
            <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#0d1b2a" }}>Versionierung:</strong> Alle Dokumente tragen das Datum ihrer letzten Revision.
              Ältere Fassungen sind auf schriftliche Anfrage bei der EUCX-Rechtsabteilung erhältlich.{" "}
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
              { label: "Impressum", href: "/impressum" },
              { label: "Datenschutz", href: "/datenschutz" },
              { label: "AGB", href: "/agb" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="rw-footer-link">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
