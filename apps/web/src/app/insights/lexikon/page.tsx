import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LEXIKON } from "@/app/insights/data";

export const metadata = {
  title: "Rohstoff-Lexikon A–Z | EUCX",
  description:
    "Das umfassende Rohstoff-Lexikon der EUCX: LME-Notierung, Incoterms 2020, CBAM, MiFID II OTF, Abwicklungsgarantie, Betonstahl und mehr. Definitionen für den institutionellen EU-Rohstoffhandel.",
};

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    Märkte: "#154194",
    Handel: "#166534",
    Regulierung: "#7c3aed",
    Rohstoffe: "#92400e",
    Logistik: "#0891b2",
    Metalle: "#154194",
    Agrar: "#166534",
    Energie: "#b45309",
    Recht: "#7c3aed",
  };
  return map[cat] || "#44403c";
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function LexikonPage() {
  const byLetter = LEXIKON.reduce(
    (acc, entry) => {
      const letter = (entry.term || "").charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(entry);
      return acc;
    },
    {} as Record<string, typeof LEXIKON>
  );

  const categories = [...new Set(LEXIKON.map((e) => e.category))];

  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>
      <SiteNav activeHref="/insights" />

      {/* Hero */}
      <div style={{ backgroundColor: "#0d1b2a", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 14, letterSpacing: "0.06em" }}>
            <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>
            {" / "}
            <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>
            {" / "}
            <span style={{ color: "#7aa4d4" }}>Rohstoff-Lexikon</span>
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 300, color: "#fff", margin: "0 0 12px" }}>
            Rohstoff-<strong style={{ fontWeight: 700 }}>Lexikon</strong>
          </h1>
          <p style={{ fontSize: 15, color: "#8aa8cc", margin: "0 0 28px", lineHeight: 1.6 }}>
            A–Z Definitionen für den institutionellen Rohstoffhandel in der EU
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <span style={{ backgroundColor: "rgba(21,65,148,0.35)", color: "#a8c4f0", fontSize: 12, fontWeight: 700, padding: "6px 14px", letterSpacing: "0.06em" }}>
              {LEXIKON.length} Einträge
            </span>
            <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#8aa8cc", fontSize: 12, padding: "6px 14px" }}>
              Laufend erweitert
            </span>
            <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#8aa8cc", fontSize: 12, padding: "6px 14px" }}>
              Fachlich geprüft
            </span>
          </div>
        </div>
      </div>

      {/* Suchhinweis-Banner */}
      <div style={{ backgroundColor: "#eef2fb", borderBottom: "1px solid #d0daf5", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", fontSize: 13, color: "#2d4a8a", lineHeight: 1.5 }}>
          Nutzen Sie <strong>Strg+F</strong> / <strong>⌘+F</strong> um nach Begriffen zu suchen. Oder navigieren Sie direkt über den Alphabet-Index.
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* Alphabet-Schnellnavigation */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginBottom: 32 }}>
          {ALPHABET.map((letter) => {
            const hasEntries = !!byLetter[letter];
            return hasEntries ? (
              <a
                key={letter}
                href={`#buchstabe-${letter}`}
                className="lex-alpha"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, fontSize: 14, fontWeight: 700,
                  color: "#fff", backgroundColor: BLUE, textDecoration: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, fontSize: 14, fontWeight: 700,
                  color: "#999", backgroundColor: "#f0f0f0", opacity: 0.3,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* Kategorien-Filter-Leiste */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 40 }}>
          <span style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: "0.08em", alignSelf: "center", marginRight: 4 }}>
            KATEGORIEN:
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              style={{
                border: `1px solid ${getCategoryColor(cat)}`,
                color: getCategoryColor(cat),
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "default",
                letterSpacing: "0.04em",
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Hover-CSS */}
        <style>{`
          .lex-alpha {
            transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
            cursor: pointer;
          }
          .lex-alpha:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(21,65,148,0.35);
            background-color: #2563eb !important;
          }
          .lex-card {
            transition: background-color 250ms ease, box-shadow 250ms ease, border-left-width 150ms ease;
            cursor: pointer;
          }
          .lex-card:hover {
            background-color: rgba(21,65,148,0.06) !important;
            box-shadow: inset 0 0 0 1px rgba(21,65,148,0.15), 0 4px 16px rgba(21,65,148,0.08);
            border-left-width: 8px !important;
          }
          .lex-card:hover .lex-title { color: #154194 !important; }
          .lex-desc {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .lex-card:hover .lex-readmin { color: #154194 !important; }
        `}</style>

        {/* Einträge nach Alphabet */}
        {ALPHABET.filter((l) => byLetter[l]).map((letter) => (
          <section key={letter} id={`buchstabe-${letter}`} style={{ marginBottom: 48, scrollMarginTop: 120 }}>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: BLUE,
                borderBottom: "2px solid #e8e8e8",
                paddingBottom: 8,
                margin: "0 0 24px",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {letter}
            </h2>

            {(byLetter[letter] ?? []).map((entry) => (
              <Link
                key={entry.slug}
                href={`/insights/lexikon/${entry.slug}`}
                className="lex-card"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  padding: "20px 24px",
                  border: "1px solid #e8e8e8",
                  textDecoration: "none",
                  marginBottom: 12,
                  borderLeft: `4px solid ${getCategoryColor(entry.category)}`,
                  backgroundColor: "#fff",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h3 className="lex-title" style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: 0, transition: "color 200ms ease" }}>
                      {entry.term}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: getCategoryColor(entry.category),
                        backgroundColor: `${getCategoryColor(entry.category)}15`,
                        padding: "2px 8px",
                      }}
                    >
                      {entry.category}
                    </span>
                  </div>
                  <p className="lex-desc" style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: 0 }}>
                    {entry.shortDef}
                  </p>
                </div>
                <div className="lex-readmin" style={{ fontSize: 11, color: "#aaa", flexShrink: 0, paddingTop: 4, transition: "color 200ms ease", whiteSpace: "nowrap" }}>
                  {entry.readMin} Min →
                </div>
              </Link>
            ))}
          </section>
        ))}

        {/* CTA */}
        <div
          style={{
            borderTop: "1px solid #e8e8e8",
            paddingTop: 32,
            marginTop: 16,
            textAlign: "center" as const,
          }}
        >
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 6px" }}>
            Vermissen Sie einen Begriff?
          </p>
          <a
            href="mailto:lexikon@eucx.eu"
            style={{ fontSize: 14, color: BLUE, fontWeight: 600, textDecoration: "none" }}
          >
            lexikon@eucx.eu
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
