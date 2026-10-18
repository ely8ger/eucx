import type { Metadata }  from "next";
import Link               from "next/link";
import { BASE_URL }       from "@/lib/seo/metadata";
import { SiteNav }        from "@/components/SiteNav";
import { JsonLd }         from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Preise & Gebühren — EUCX",
  description:
    "Transparente Transaktionsgebühren auf der EUCX: 0,80 % Verkäufer / 0,30 % Käufer (Standard) — reduzierte Sätze ab 500.000 € Jahresvolumen. Kein versteckter Spread, keine Listing-Gebühr.",
  keywords: [
    "EUCX Gebühren", "Transaktionsgebühren Rohstoffbörse", "Preise B2B Warenbörse",
    "Handelsgebühren Stahl", "Plattformgebühr Commodity Exchange", "MiFID II Gebühren",
    "EUCX Konditionen", "High-Volume Rabatt", "Rohstoffhandel Kosten",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/preise` },
  openGraph: {
    title: "Preise & Gebühren — EUCX European Union Commodity Exchange",
    description: "0,80 % Verkäufer · 0,30 % Käufer · Kein versteckter Spread · High-Volume-Rabatt ab 500.000 € / Jahr",
    url: `${BASE_URL}/preise`,
  },
};

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const NAVY = "#0b1e36";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "EUCX Handelsplattform",
  "url": `${BASE_URL}/preise`,
  "provider": {
    "@type": "Organization",
    "name": "EUCX GmbH",
    "url": BASE_URL,
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Standard-Tier",
      "description": "Transaktionsgebühr für alle Marktteilnehmer — Verkäufer 0,80 %, Käufer 0,30 %",
    },
    {
      "@type": "Offer",
      "name": "High-Volume-Tier",
      "description": "Reduzierte Transaktionsgebühr ab 500.000 € Handelsumsatz pro 12 Monate — Verkäufer 0,50 %, Käufer 0,15 %",
    },
  ],
};

export default function PreisePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div style={{ backgroundColor: "#f7f9fc", minHeight: "100vh", fontFamily: F }}>

        <SiteNav activeHref="/preise" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: NAVY, padding: "0 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 0 52px" }}>
            <nav style={{ marginBottom: 24 }}>
              <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>
                EUCX
              </Link>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)", margin: "0 8px" }}>›</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Preise & Gebühren</span>
            </nav>
            <div style={{
              display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: BLUE, backgroundColor: "rgba(21,65,148,.2)",
              padding: "4px 10px", marginBottom: 20,
            }}>
              Gebühren & Konditionen
            </div>
            <h1 style={{
              fontSize: 40, fontWeight: 300, color: "#fff",
              lineHeight: 1.15, margin: "0 0 20px", maxWidth: 640,
            }}>
              Transparente Gebühren.<br />
              <span style={{ color: "rgba(255,255,255,.55)" }}>Kein versteckter Spread.</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
              Die EUCX berechnet ausschließlich eine Transaktionsgebühr nach Abschluss —
              keine Listing-Gebühr, keine Margin-Gebühr, kein Bid-Ask-Spread.
              Ab einem Jahresvolumen von 500.000 € greifen automatisch reduzierte Sätze.
            </p>
          </div>
        </div>

        {/* ── Gebührenstaffel ───────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", padding: "0 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 0 48px" }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", color: BLUE, marginBottom: 8,
            }}>
              Gebührenstruktur
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 300, color: "#1a1a1a", margin: "0 0 36px", lineHeight: 1.2 }}>
              Zwei Tarif-Stufen — automatisch zugewiesen
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* Standard Tier */}
              <div style={{
                border: "1px solid #e4e8ef",
                borderTop: `3px solid ${BLUE}`,
                padding: "32px 28px",
                backgroundColor: "#fff",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#888", marginBottom: 12,
                }}>
                  Standard
                </div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.6, marginBottom: 28 }}>
                  Für alle registrierten Marktteilnehmer ab dem ersten Handelstag.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      Verkäufer
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 38, fontWeight: 300, color: BLUE, lineHeight: 1 }}>0,80</span>
                      <span style={{ fontSize: 18, color: BLUE, fontWeight: 400 }}>%</span>
                      <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>vom Handelswert</span>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 1, backgroundColor: "#f0f0f0" }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      Käufer
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 38, fontWeight: 300, color: BLUE, lineHeight: 1 }}>0,30</span>
                      <span style={{ fontSize: 18, color: BLUE, fontWeight: 400 }}>%</span>
                      <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>vom Handelswert</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Volume Tier */}
              <div style={{
                border: "1px solid #e4e8ef",
                borderTop: "3px solid #22c55e",
                padding: "32px 28px",
                backgroundColor: "#fff",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: -1, right: 20,
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#166534",
                  backgroundColor: "#dcfce7", padding: "3px 8px",
                  borderBottom: "1px solid #bbf7d0",
                }}>
                  Automatisch
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#166534", marginBottom: 12,
                }}>
                  High-Volume
                </div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.6, marginBottom: 28 }}>
                  Automatisch aktiv ab&nbsp;<strong>&gt; 500.000 € Handelsumsatz</strong> in den letzten
                  12 Monaten.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      Verkäufer
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 38, fontWeight: 300, color: "#166534", lineHeight: 1 }}>0,50</span>
                      <span style={{ fontSize: 18, color: "#166534", fontWeight: 400 }}>%</span>
                      <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>vom Handelswert</span>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 1, backgroundColor: "#f0f0f0" }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      Käufer
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 38, fontWeight: 300, color: "#166534", lineHeight: 1 }}>0,15</span>
                      <span style={{ fontSize: 18, color: "#166534", fontWeight: 400 }}>%</span>
                      <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>vom Handelswert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Individuelle Konditionen */}
            <div style={{
              marginTop: 20, padding: "16px 20px",
              backgroundColor: "#f7f9fc", border: "1px solid #e4e8ef",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <span style={{ fontSize: 13, color: "#505050" }}>
                Individuelle Konditionen und Volumen-Vereinbarungen auf Anfrage.
              </span>
              <Link href="/kontakt"
                style={{
                  fontSize: 13, color: BLUE, fontWeight: 600, textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={undefined as never}
              >
                Anfrage stellen →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Berechnungsbeispiel ───────────────────────────────────────── */}
        <div style={{ backgroundColor: "#f7f9fc", padding: "0 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 0 48px" }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", color: BLUE, marginBottom: 8,
            }}>
              Beispielrechnung
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 300, color: "#1a1a1a", margin: "0 0 36px", lineHeight: 1.2 }}>
              So werden Gebühren berechnet
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              {/* Standard Beispiel */}
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#888", marginBottom: 16,
                }}>
                  Beispiel — Standard-Tier
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    {[
                      ["Handelswert",        "100.000,00 €", false],
                      ["Verkäufergebühr",    "800,00 €",     false],
                      ["(0,80 % des Handelswerts)", null,    false],
                      ["Käufergebühr",       "300,00 €",     false],
                      ["(0,30 % des Handelswerts)", null,    false],
                      ["Gesamtgebühr",       "1.100,00 €",   true],
                    ].map(([label, value, bold], i) => (
                      value ? (
                        <tr key={i} style={{ borderBottom: "1px solid #e8e8e8" }}>
                          <td style={{
                            padding: "10px 0", color: bold ? "#1a1a1a" : "#505050",
                            fontWeight: bold ? 600 : 400,
                          }}>
                            {label as string}
                          </td>
                          <td style={{
                            padding: "10px 0", textAlign: "right",
                            color: bold ? BLUE : "#1a1a1a",
                            fontWeight: bold ? 600 : 400,
                            fontVariantNumeric: "tabular-nums",
                          }}>
                            {value as string}
                          </td>
                        </tr>
                      ) : (
                        <tr key={i}>
                          <td colSpan={2} style={{ padding: "2px 0 8px", fontSize: 11, color: "#aaa" }}>
                            {label as string}
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>

              {/* High-Volume Beispiel */}
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#166534", marginBottom: 16,
                }}>
                  Beispiel — High-Volume-Tier
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    {[
                      ["Handelswert",        "100.000,00 €",   false],
                      ["Verkäufergebühr",    "500,00 €",       false],
                      ["(0,50 % des Handelswerts)", null,      false],
                      ["Käufergebühr",       "150,00 €",       false],
                      ["(0,15 % des Handelswerts)", null,      false],
                      ["Gesamtgebühr",       "650,00 €",       true],
                    ].map(([label, value, bold], i) => (
                      value ? (
                        <tr key={i} style={{ borderBottom: "1px solid #e8e8e8" }}>
                          <td style={{
                            padding: "10px 0", color: bold ? "#1a1a1a" : "#505050",
                            fontWeight: bold ? 600 : 400,
                          }}>
                            {label as string}
                          </td>
                          <td style={{
                            padding: "10px 0", textAlign: "right",
                            color: bold ? "#166534" : "#1a1a1a",
                            fontWeight: bold ? 600 : 400,
                            fontVariantNumeric: "tabular-nums",
                          }}>
                            {value as string}
                          </td>
                        </tr>
                      ) : (
                        <tr key={i}>
                          <td colSpan={2} style={{ padding: "2px 0 8px", fontSize: 11, color: "#aaa" }}>
                            {label as string}
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#f0fdf4", borderLeft: "3px solid #22c55e", fontSize: 12, color: "#166534" }}>
                  Einsparung gegenüber Standard: <strong>450,00 €</strong> pro Transaktion
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28, padding: "14px 20px", backgroundColor: "#fff", border: "1px solid #e4e8ef", fontSize: 13, color: "#505050", lineHeight: 1.7 }}>
              <strong style={{ color: "#1a1a1a" }}>Hinweis:</strong> Gebühren werden ausschließlich nach erfolgreichem Abschluss berechnet und
              direkt vom Handelswert abgezogen. Es fallen keine Gebühren für das Einstellen von Angeboten
              oder für nicht abgeschlossene Gebote an.
            </div>
          </div>
        </div>

        {/* ── Wie wird der Tier ermittelt ───────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", padding: "0 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 0 48px" }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", color: BLUE, marginBottom: 8,
            }}>
              Tier-Einstufung
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 300, color: "#1a1a1a", margin: "0 0 36px", lineHeight: 1.2 }}>
              Automatisch — kein Antrag erforderlich
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  step: "01",
                  title: "Registrierung & KYC",
                  text: "Nach erfolgreicher Identitätsprüfung erhalten Sie automatisch den Standard-Tarif und können sofort handeln.",
                },
                {
                  step: "02",
                  title: "Fortlaufende Volumenerfassung",
                  text: "Die Plattform erfasst Ihren kumulierten Handelsumsatz über einen rollierenden 12-Monats-Zeitraum.",
                },
                {
                  step: "03",
                  title: "Automatische High-Volume-Aktivierung",
                  text: "Sobald Ihr 12-Monats-Umsatz die Schwelle von 500.000 € überschreitet, wird der günstigere Tarif ab dem nächsten Abschluss automatisch angewendet.",
                },
                {
                  step: "04",
                  title: "Individuelle Vereinbarungen",
                  text: "Für strategische Partner mit dauerhaft hohem Volumen können individuell verhandelte Konditionen vereinbart werden. Sprechen Sie uns an.",
                },
              ].map(({ step, title, text }, i, arr) => (
                <div key={step} style={{
                  display: "flex", gap: 24,
                  paddingBottom: i < arr.length - 1 ? 32 : 0,
                  borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                  paddingTop: i > 0 ? 32 : 0,
                }}>
                  <div style={{
                    flexShrink: 0, width: 44, height: 44,
                    backgroundColor: "#f0f4ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: "0.04em" }}>{step}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 14, color: "#505050", lineHeight: 1.7 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ Crosslink ─────────────────────────────────────────────── */}
        <div style={{ backgroundColor: NAVY, padding: "0 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 300, color: "#fff", margin: "0 0 10px" }}>
                  Weitere Fragen zu Gebühren und Margin?
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", margin: 0, lineHeight: 1.6 }}>
                  Über 60 Antworten zu Gebühren, Initial Margin, Margin-Calls und Settlement
                  finden Sie in unserer FAQ-Datenbank.
                </p>
              </div>
              <Link
                href="/faq"
                style={{
                  fontSize: 14, fontWeight: 600, color: BLUE,
                  backgroundColor: "#fff", padding: "13px 28px",
                  textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
                }}
              >
                FAQ öffnen →
              </Link>
            </div>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: BLUE, padding: "0 32px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 0", textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 300, color: "#fff", margin: "0 0 16px" }}>
              Jetzt Mitglied werden
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", margin: "0 0 32px", lineHeight: 1.7 }}>
              Kostenlose Registrierung. KYC-Prüfung in 48 Stunden.<br />
              Danach sofortiger Handelszugang zu allen EUCX-Märkten.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register"
                style={{
                  fontSize: 14, fontWeight: 700, color: BLUE,
                  backgroundColor: "#fff", padding: "14px 36px",
                  textDecoration: "none",
                }}>
                Kostenlos registrieren
              </Link>
              <Link href="/kontakt"
                style={{
                  fontSize: 14, fontWeight: 600, color: "#fff",
                  backgroundColor: "transparent", padding: "14px 36px",
                  textDecoration: "none", border: "1.5px solid rgba(255,255,255,.4)",
                }}>
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: NAVY, padding: "0 32px" }}>
          <div style={{
            maxWidth: 860, margin: "0 auto",
            padding: "24px 0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 8,
            borderTop: "1px solid rgba(255,255,255,.08)",
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.28)" }}>
              © 2026 EUCX GmbH · Frankfurt am Main
            </span>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                ["Impressum", "/impressum"],
                ["Datenschutz", "/datenschutz"],
                ["AGB", "/agb"],
                ["FAQ", "/faq"],
              ].map(([label, href]) => (
                <Link key={href!} href={href!}
                  style={{ fontSize: 11, color: "rgba(255,255,255,.28)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .preise-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
