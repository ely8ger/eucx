import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/seo/metadata";
import { SiteNav } from "@/components/SiteNav";
import { FileText, Scale, ClipboardList, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Regelwerk – Normative Dokumente & Rechtsrahmen",
  description:
    "Das vollständige Regelwerk der EUCX: Handelsordnung, normative Dokumente, EU-Rechtsrahmen und Formulare für Mitglieder.",
  keywords: [
    "EUCX Regelwerk", "Handelsordnung", "Normative Dokumente", "Physische Warenbörse",
    "EU-Rechtsrahmen Rohstoffhandel", "GwG Compliance", "BGB HGB Warenhandel",
    "CBAM Compliance", "EUCX Formulare",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/regelwerk` },
  openGraph: {
    title: "Regelwerk der EUCX – Normative Dokumente & Rechtsrahmen",
    description: "Alle normativen Dokumente, EU-Rechtsgrundlagen und Formulare der EUCX auf einen Blick.",
    url: `${BASE_URL}/regelwerk`,
  },
};

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const DARK = "#0b1e36";

const SECTIONS = [
  {
    icon: FileText,
    href: "/regelwerk/normative-dokumente",
    number: "15",
    unit: "Dokumente",
    title: "Normative Dokumente",
    description:
      "Handelsordnung, Sektionsreglements, Vertragsvorlagen, Clearing-Regeln und alle weiteren verbindlichen Regelwerke der EUCX als PDF-Download.",
    color: "#154194",
    items: ["Handelsordnung (DOK-01)", "Sektionsreglements (DOK-02)", "Vertragsvorlagen (DOK-06)", "Clearing-Regeln (DOK-19)", "12 weitere Dokumente"],
  },
  {
    icon: Scale,
    href: "/regelwerk/eu-rechtsrahmen",
    number: "8",
    unit: "Rechtsgebiete",
    title: "EU-Rechtsrahmen",
    description:
      "Überblick über die für die EUCX maßgeblichen Gesetze und Verordnungen: GwG, BGB/HGB, CBAM, DSGVO und weitere anwendbare EU-Rechtsnormen.",
    color: "#1a5276",
    items: ["GwG (Geldwäschegesetz)", "BGB / HGB", "CBAM (EU 2023/956)", "DSGVO (EU 2016/679)", "4 weitere Rechtsgebiete"],
  },
  {
    icon: ClipboardList,
    href: "/regelwerk/formulare",
    number: "12",
    unit: "Formulare",
    title: "Formulare & Anträge",
    description:
      "Alle wesentlichen Formulare für Mitgliedschaft, KYC-Verfahren, Händlerzertifizierung, Streitbeilegung und nicht-residente Akkreditierung.",
    color: "#145a32",
    items: ["Mitgliedsantrag", "KYC-Selbstauskunft", "Händlerzertifizierungsantrag", "Schiedsklage", "Nicht-Residenten-Akkreditierung"],
  },
];

export default function RegelwerkPage() {
  return (
    <>
      <SiteNav activeHref="/regelwerk" />

      <style>{`
        .rw-card {
          border: 1px solid #e8e8e8;
          padding: 36px 32px 32px;
          height: 100%;
          box-sizing: border-box;
          transition: box-shadow 200ms ease, transform 200ms ease;
          display: block;
          text-decoration: none;
        }
        .rw-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .rw-footer-link {
          font-size: 12px;
          color: rgba(255,255,255,.3);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .rw-footer-link:hover { color: rgba(255,255,255,.65); }
      `}</style>

      {/* Hero */}
      <section style={{ backgroundColor: DARK, padding: "56px 32px 48px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.38)", fontSize: 12, textDecoration: "none" }}>EUCX</Link>
            <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>›</span>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500 }}>Regelwerk</span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, backgroundColor: BLUE, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>
                EUCX — Regelwerk & Rechtsdokumentation
              </p>
              <h1 style={{ fontSize: 34, fontWeight: 300, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Normative Dokumente &<br />
                <span style={{ fontWeight: 700 }}>Rechtsrahmen</span>
              </h1>
            </div>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 640, margin: "20px 0 0", lineHeight: 1.7, fontWeight: 300 }}>
            Die EUCX betreibt eine physische Spot-Warenhandelsplattform auf Basis von BGB/HGB und
            EU-Handelsrecht. Alle verbindlichen Regelwerke, Rechtsgrundlagen und Formulare sind hier
            transparent zugänglich.
          </p>

        </div>
      </section>

      <div style={{ height: 3, backgroundColor: BLUE }} />

      {/* Sections */}
      <section style={{ backgroundColor: "#fff", padding: "64px 32px 80px", fontFamily: SANS }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 2 }}>
            {SECTIONS.map(({ icon: Icon, href, number, unit, title, description, color, items }) => (
              <Link key={href} href={href} className="rw-card" style={{ borderTop: `3px solid ${color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{
                    width: 44, height: 44, backgroundColor: color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{number}</div>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{unit}</div>
                  </div>
                </div>

                <h2 style={{ fontSize: 19, fontWeight: 700, color: "#0d1b2a", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                  {title}
                </h2>
                <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.65, margin: "0 0 24px" }}>
                  {description}
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                  {items.map((item, i) => (
                    <li key={i} style={{
                      fontSize: 12.5, color: "#444", padding: "6px 0",
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ width: 3, height: 14, backgroundColor: color, flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>

                <div style={{ display: "flex", alignItems: "center", gap: 6, color, fontSize: 13, fontWeight: 600 }}>
                  Öffnen <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>

          <div style={{
            marginTop: 56, borderLeft: "3px solid rgba(21,65,148,.25)",
            paddingLeft: 20, paddingTop: 4, paddingBottom: 4,
          }}>
            <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#0d1b2a" }}>Verbindlichkeit:</strong> Alle normativen Dokumente sind für zugelassene Mitglieder der EUCX
              rechtsverbindlich. Änderungen werden mindestens 30 Tage vor Inkrafttreten angekündigt.
              Die jeweils aktuelle Fassung ist maßgebend. Stand: 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: DARK, borderTop: `3px solid ${BLUE}`,
        padding: "48px 32px", fontFamily: SANS,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", margin: "0 0 8px" }}>EUCX — European Union Commodity Exchange</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)", margin: 0 }}>Physische Spot-Warenhandelsplattform · Frankfurt am Main</p>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Impressum", href: "/impressum" },
              { label: "Datenschutz", href: "/datenschutz" },
              { label: "AGB", href: "/agb" },
              { label: "FAQ", href: "/faq" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="rw-footer-link">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
