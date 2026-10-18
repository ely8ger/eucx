import type { Metadata }  from "next";
import Link               from "next/link";
import { BASE_URL }       from "@/lib/seo/metadata";
import { SiteNav }        from "@/components/SiteNav";
import { JsonLd }         from "@/components/seo/JsonLd";
import { KontaktForm }    from "./KontaktForm";

export const metadata: Metadata = {
  title: "Kontakt — EUCX",
  description:
    "Kontaktieren Sie das EUCX-Team für Handelsanfragen, KYC/Compliance, technischen Support oder Partnerschaftsanfragen. Antwort innerhalb von 1–2 Werktagen.",
  keywords: [
    "EUCX Kontakt", "Rohstoffbörse Anfrage", "B2B Warenbörse Support",
    "EUCX Compliance", "Handelsanfrage Rohstoffe", "EUCX Frankfurt",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/kontakt` },
  openGraph: {
    title: "Kontakt — EUCX European Union Commodity Exchange",
    description: "Handelsanfragen, Support und Partnerschaftsanfragen direkt an das EUCX-Team.",
    url: `${BASE_URL}/kontakt`,
  },
};

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const NAVY = "#0b1e36";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "EUCX Kontakt",
  "url": `${BASE_URL}/kontakt`,
  "description": "Kontaktseite der EUCX GmbH, Frankfurt am Main",
  "mainEntity": {
    "@type": "Organization",
    "name": "EUCX GmbH",
    "email": "info@eucx.eu",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Frankfurt am Main",
      "addressCountry": "DE",
    },
  },
};

const INFO_ITEMS = [
  {
    label: "Allgemeine Anfragen",
    value: "info@eucx.eu",
    href:  "mailto:info@eucx.eu",
    sub:   "Handelsanfragen, Registrierung, allgemeine Fragen",
  },
  {
    label: "Compliance & KYC",
    value: "compliance@eucx.eu",
    href:  "mailto:compliance@eucx.eu",
    sub:   "Identitätsprüfung, AML, regulatorische Fragen",
  },
  {
    label: "Standort",
    value: "Frankfurt am Main",
    href:  null,
    sub:   "Deutschland",
  },
  {
    label: "Reaktionszeit",
    value: "1–2 Werktage",
    href:  null,
    sub:   "Montag – Freitag, 09:00 – 17:00 Uhr CET",
  },
];

export default function KontaktPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div style={{ backgroundColor: "#f7f9fc", minHeight: "100vh", fontFamily: F }}>

        <SiteNav activeHref="/kontakt" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: NAVY, padding: "0 32px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 0 52px" }}>
            <nav style={{ marginBottom: 24 }}>
              <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>
                EUCX
              </Link>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)", margin: "0 8px" }}>›</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Kontakt</span>
            </nav>
            <div style={{
              display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: BLUE, backgroundColor: "rgba(21,65,148,.2)",
              padding: "4px 10px", marginBottom: 20,
            }}>
              Kontakt
            </div>
            <h1 style={{
              fontSize: 40, fontWeight: 300, color: "#fff",
              lineHeight: 1.15, margin: "0 0 20px", maxWidth: 560,
            }}>
              Sprechen Sie uns an.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.7, maxWidth: 540, margin: 0 }}>
              Unser Team steht Ihnen für Handelsanfragen, Compliance-Fragen,
              technischen Support und Partnerschaftsanfragen zur Verfügung.
            </p>
          </div>
        </div>

        {/* ── Hauptbereich: Info + Formular ─────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", padding: "0 32px" }}>
          <div style={{
            maxWidth: 960, margin: "0 auto", padding: "56px 0 48px",
            display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 56, alignItems: "start",
          }}>

            {/* Linke Spalte: Kontaktinformationen */}
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", color: BLUE, marginBottom: 8,
              }}>
                Kontaktdaten
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 300, color: "#1a1a1a", margin: "0 0 28px", lineHeight: 1.3 }}>
                Direkter Draht<br />zum EUCX-Team
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {INFO_ITEMS.map(({ label, value, href, sub }, i) => (
                  <div key={label} style={{
                    padding: "18px 0",
                    borderBottom: i < INFO_ITEMS.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      {label}
                    </div>
                    {href ? (
                      <a href={href} style={{ fontSize: 15, fontWeight: 600, color: BLUE, textDecoration: "none", display: "block", marginBottom: 2 }}>
                        {value}
                      </a>
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
                        {value}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#888" }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* BaFin-Hinweis */}
              <div style={{
                marginTop: 28, padding: "14px 16px",
                backgroundColor: "#f0f4ff", borderLeft: `3px solid ${BLUE}`,
                fontSize: 12, color: "#3a4a6b", lineHeight: 1.7,
              }}>
                <strong>Regulierter Marktbetreiber:</strong> Die EUCX GmbH ist als
                OTF gemäß MiFID II bei der BaFin (Frankfurt am Main) registriert.
                Compliance-Anfragen werden ausschließlich über den offiziellen
                E-Mail-Kanal bearbeitet.
              </div>
            </div>

            {/* Rechte Spalte: Kontaktformular */}
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", color: BLUE, marginBottom: 8,
              }}>
                Kontaktformular
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 300, color: "#1a1a1a", margin: "0 0 24px", lineHeight: 1.3 }}>
                Ihre Anfrage direkt<br />an uns
              </h2>
              <KontaktForm />
            </div>

          </div>
        </div>

        {/* ── Hinweis-Block ─────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#f7f9fc", padding: "0 32px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 0" }}>
            <div style={{
              display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center",
            }}>
              {[
                {
                  title:  "Häufige Fragen?",
                  text:   "Über 60 Antworten zu Gebühren, KYC, Handel und Regulierung finden Sie in unserem FAQ.",
                  label:  "FAQ öffnen",
                  href:   "/faq",
                },
                {
                  title:  "Direkt handeln?",
                  text:   "Registrieren Sie sich kostenlos. KYC-Prüfung in 48 Stunden, dann sofortiger Handelszugang.",
                  label:  "Jetzt registrieren",
                  href:   "/register",
                },
                {
                  title:  "Gebühren prüfen?",
                  text:   "Transparente Transaktionsgebühren und High-Volume-Konditionen auf einen Blick.",
                  label:  "Preise ansehen",
                  href:   "/preise",
                },
              ].map(({ title, text, label, href }) => (
                <div key={href} style={{
                  flex: "1 1 240px", padding: "24px 20px",
                  backgroundColor: "#fff", border: "1px solid #e4e8ef",
                  borderTop: `3px solid ${BLUE}`,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                    {title}
                  </div>
                  <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.7, margin: "0 0 16px" }}>
                    {text}
                  </p>
                  <Link href={href}
                    style={{ fontSize: 13, color: BLUE, fontWeight: 600, textDecoration: "none" }}>
                    {label} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: NAVY, padding: "0 32px" }}>
          <div style={{
            maxWidth: 960, margin: "0 auto",
            padding: "24px 0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 8,
            borderTop: "1px solid rgba(255,255,255,.08)",
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.28)" }}>
              © 2026 EUCX GmbH · Frankfurt am Main
            </span>
            <div style={{ display: "flex", gap: 20 }}>
              {([ ["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["AGB", "/agb"], ["Preise", "/preise"] ] as [string, string][]).map(([label, href]) => (
                <Link key={href} href={href}
                  style={{ fontSize: 11, color: "rgba(255,255,255,.28)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 720px) {
          .kontakt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
