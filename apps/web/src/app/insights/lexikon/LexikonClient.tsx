"use client";

import Link from "next/link";
import { useState } from "react";
import type { LexikonEntry } from "@/app/insights/data";

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

export function LexikonClient({ entries }: { entries: LexikonEntry[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? entries.filter((e) => e.category === activeCategory)
    : entries;

  const byLetter = filtered.reduce(
    (acc, entry) => {
      const letter = (entry.term || "").charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(entry);
      return acc;
    },
    {} as Record<string, LexikonEntry[]>
  );

  const categories = [...new Set(entries.map((e) => e.category))];

  return (
    <div style={{ fontFamily: SANS }}>
      {/* Alphabet-Schnellnavigation */}
      <div className="r-alpha-bar" style={{ marginBottom: 32 }}>
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
      <div className="r-cat-bar" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
        <span style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: "0.08em", alignSelf: "center", marginRight: 4 }}>
          KATEGORIEN:
        </span>
        {activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className="lex-cat-reset"
            style={{
              border: "1px solid #aaa",
              color: "#555",
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.04em",
              background: "#f5f5f5",
            }}
          >
            ✕ Alle zeigen
          </button>
        )}
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const color = getCategoryColor(cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={`lex-cat${isActive ? " lex-cat-active" : ""}`}
              data-color={color}
              style={{
                border: `1px solid ${color}`,
                color: isActive ? "#fff" : color,
                backgroundColor: isActive ? color : "transparent",
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {cat}
            </button>
          );
        })}
        {activeCategory && (
          <span style={{ fontSize: 12, color: "#888", alignSelf: "center", marginLeft: 4 }}>
            {filtered.length} {filtered.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        )}
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
        .lex-cat {
          transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease, color 150ms ease;
        }
        .lex-cat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          opacity: 0.9;
        }
        .lex-cat-active:hover {
          opacity: 1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.22);
        }
        .lex-cat-reset {
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .lex-cat-reset:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.12);
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

      {/* Keine Ergebnisse */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#888", fontSize: 14 }}>
          Keine Einträge in dieser Kategorie.
        </div>
      )}
    </div>
  );
}
