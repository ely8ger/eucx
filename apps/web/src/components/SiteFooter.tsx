"use client";

import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";

const SANS = "'IBM Plex Sans', Arial, sans-serif";

export function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#0d1117", color: "#555", fontFamily: SANS, marginTop: 80 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 0" }}>

        {/* Upper */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          paddingBottom: 36, borderBottom: "1px solid #1e2530",
          flexWrap: "wrap", gap: 32,
        }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ marginBottom: 14 }}>
              <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
                <EucxLogo variant="dark" size="md" showTagline />
              </Link>
            </div>
            <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.75, margin: "0 0 16px" }}>
              Digitale B2B-Warenbörse für institutionellen Rohstoffhandel in der Europäischen Union.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["BaFin-reguliert", "MiFID II OTF", "Frankfurt"].map(tag => (
                <span key={tag} style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                  color: "#2d4a6b", backgroundColor: "#111827",
                  padding: "3px 8px", textTransform: "uppercase" as const,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            {[
              {
                title: "Plattform",
                links: [
                  ["Marktpreise", "/marktpreise"],
                  ["Katalog", "/katalog"],
                  ["Anmelden", "/login"],
                  ["Registrieren", "/register"],
                ],
              },
              {
                title: "Wissen",
                links: [
                  ["Marktberichte", "/wissen"],
                  ["Preisbildung", "/wissen"],
                  ["FAQ", "/faq"],
                ],
              },
              {
                title: "Rechtliches",
                links: [
                  ["Impressum", "/impressum"],
                  ["Datenschutz", "/datenschutz"],
                  ["AGB", "/agb"],
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#2d4a6b",
                  letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 16,
                }}>
                  {title}
                </div>
                {links.map(([label, href]) => (
                  <Link key={label} href={href!}
                    style={{ display: "block", fontSize: 13, color: "#4a5568", textDecoration: "none", marginBottom: 10 }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#c8d8ec")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#4a5568")}>
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Lower */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 0", flexWrap: "wrap", gap: 8,
        }}>
          <span style={{ fontSize: 11, color: "#2d4a6b" }}>
            © 2026 EUCX GmbH · Frankfurt am Main · HRB 123456 AG Frankfurt
          </span>
          <span style={{ fontSize: 11, color: "#2d4a6b" }}>
            Reguliert durch die BaFin · MiFID II OTF-Zulassung
          </span>
        </div>

      </div>
    </footer>
  );
}
