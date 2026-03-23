"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { EucxLogo } from "@/components/logo/EucxLogo";
import {
  SIDEBAR,
  KATALOG,
  getKategorie,
  formatPreis,
  formatTonne,
  formatDim,
  formatLaenge,
} from "@/lib/katalog/data";

const BLUE   = "#154194";
const F      = "'IBM Plex Sans', Arial, sans-serif";
const DARK   = "#0b1e36";
const BORDER = "#dde2ea";

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ aktiv }: { aktiv: string }) {
  return (
    <nav style={{
      width: 230, flexShrink: 0, backgroundColor: "#fff",
      border: `1px solid ${BORDER}`, alignSelf: "flex-start",
      position: "sticky", top: 16,
    }}>
      {SIDEBAR.map(sektion => (
        <div key={sektion.label}>
          <div style={{
            padding: "10px 16px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#888",
            backgroundColor: "#f8f9fb",
            borderBottom: `1px solid ${BORDER}`,
          }}>
            {sektion.label}
          </div>
          {sektion.kategorien.map(k => {
            const isAktiv = k.id === aktiv;
            return (
              <Link
                key={k.id}
                href={`/katalog/${k.id}`}
                style={{
                  display: "block", padding: "9px 16px",
                  fontSize: 12.5, color: isAktiv ? "#fff" : "#333",
                  backgroundColor: isAktiv ? BLUE : "transparent",
                  textDecoration: "none",
                  borderBottom: `1px solid ${isAktiv ? BLUE : BORDER}`,
                  fontWeight: isAktiv ? 600 : 400,
                }}
              >
                {k.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

// ─── Preistabelle ─────────────────────────────────────────────────────────────

export default function KatalogPage() {
  const params  = useParams();
  const katId   = typeof params.kategorie === "string" ? params.kategorie : "";
  const kat     = getKategorie(katId);

  const [filterDim,      setFilterDim]      = useState<number | null>(null);
  const [filterWerkstoff, setFilterWerkstoff] = useState("");
  const [filterOberf,    setFilterOberf]    = useState("");

  const alleProdukte = kat?.produkte ?? [];

  // Distinct dim values sorted
  const alleDims = useMemo(() =>
    [...new Set(alleProdukte.map(p => p.dimension))].sort((a, b) => a - b),
    [alleProdukte],
  );

  // Distinct Werkstoffe
  const alleWerkstoffe = useMemo(() =>
    [...new Set(alleProdukte.map(p => p.werkstoff))].sort(),
    [alleProdukte],
  );

  // Distinct Oberflächen
  const alleOberfl = useMemo(() =>
    [...new Set(alleProdukte.map(p => p.oberflaeche))].sort(),
    [alleProdukte],
  );

  const gefiltert = useMemo(() => {
    return alleProdukte.filter(p => {
      if (filterDim !== null && p.dimension !== filterDim)    return false;
      if (filterWerkstoff  && p.werkstoff  !== filterWerkstoff) return false;
      if (filterOberf      && p.oberflaeche !== filterOberf)   return false;
      return true;
    });
  }, [alleProdukte, filterDim, filterWerkstoff, filterOberf]);

  if (!kat) {
    return (
      <div style={{ fontFamily: F, padding: 64, textAlign: "center", color: "#666" }}>
        Kategorie nicht gefunden.{" "}
        <Link href="/katalog/betonstahl" style={{ color: BLUE }}>Zum Katalog</Link>
      </div>
    );
  }

  const dimLabel = kat.dimLabel;
  const dimUnit  = kat.dimUnit;
  const showBreite = alleProdukte.some(p => p.breite != null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: F }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: DARK, borderBottom: "1px solid #1e3352" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 24px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <EucxLogo variant="dark" size="md" />
          </Link>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/metalle" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>
              Metallkatalog
            </Link>
            <Link href="/duenger" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>
              Dünger & Agrarchemie
            </Link>
            <Link href="/trading" style={{
              fontSize: 13, color: "#fff", textDecoration: "none",
              backgroundColor: BLUE, padding: "8px 16px", fontWeight: 600,
            }}>
              Handelsraum →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "14px 24px 0" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#888" }}>
          <Link href="/"        style={{ color: "#888", textDecoration: "none" }}>Startseite</Link>
          <span>›</span>
          <Link href="/katalog" style={{ color: "#888", textDecoration: "none" }}>Katalog</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>{kat.label}</span>
        </div>
      </div>

      {/* ── Seitenlayout: Sidebar + Hauptinhalt ─────────────────────────── */}
      <div style={{
        maxWidth: 1400, margin: "16px auto 64px",
        padding: "0 24px",
        display: "flex", gap: 20, alignItems: "flex-start",
      }}>
        <Sidebar aktiv={katId} />

        {/* ── Hauptinhalt ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Kategorie-Titel */}
          <div style={{
            backgroundColor: "#fff", border: `1px solid ${BORDER}`,
            padding: "16px 20px", marginBottom: 12,
          }}>
            <div style={{ fontSize: 18, fontWeight: 300, color: "#0d1b2a", marginBottom: 4 }}>
              {kat.label}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>{kat.description}</div>
          </div>

          {/* ── Dimension-Tabs ────────────────────────────────────────── */}
          {alleDims.length > 1 && (
            <div style={{
              backgroundColor: "#fff", border: `1px solid ${BORDER}`,
              padding: "12px 16px", marginBottom: 12,
              display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#888", marginRight: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {dimLabel}
              </span>
              <button
                onClick={() => setFilterDim(null)}
                style={{
                  padding: "4px 12px", fontSize: 12, border: `1px solid ${filterDim === null ? BLUE : BORDER}`,
                  backgroundColor: filterDim === null ? BLUE : "#fafbfc",
                  color: filterDim === null ? "#fff" : "#444",
                  cursor: "pointer", fontFamily: F,
                }}
              >
                Alle
              </button>
              {alleDims.map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDim(filterDim === d ? null : d)}
                  style={{
                    padding: "4px 12px", fontSize: 12,
                    border: `1px solid ${filterDim === d ? BLUE : BORDER}`,
                    backgroundColor: filterDim === d ? BLUE : "#fafbfc",
                    color: filterDim === d ? "#fff" : "#444",
                    cursor: "pointer", fontFamily: F,
                  }}
                >
                  {formatDim(d, dimUnit)}
                </button>
              ))}
            </div>
          )}

          {/* ── Filter-Zeile: Werkstoff / Oberfläche ─────────────────── */}
          <div style={{
            backgroundColor: "#fff", border: `1px solid ${BORDER}`,
            padding: "10px 16px", marginBottom: 12,
            display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          }}>
            {alleWerkstoffe.length > 1 && (
              <select
                value={filterWerkstoff}
                onChange={e => setFilterWerkstoff(e.target.value)}
                style={{
                  fontSize: 12, padding: "6px 10px", border: `1px solid ${BORDER}`,
                  fontFamily: F, color: "#333", backgroundColor: "#fafbfc",
                }}
              >
                <option value="">Alle Werkstoffe</option>
                {alleWerkstoffe.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            )}
            {alleOberfl.length > 1 && (
              <select
                value={filterOberf}
                onChange={e => setFilterOberf(e.target.value)}
                style={{
                  fontSize: 12, padding: "6px 10px", border: `1px solid ${BORDER}`,
                  fontFamily: F, color: "#333", backgroundColor: "#fafbfc",
                }}
              >
                <option value="">Alle Oberflächen</option>
                {alleOberfl.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>
              {gefiltert.length} Artikel
            </span>
          </div>

          {/* ── Preistabelle ─────────────────────────────────────────── */}
          <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f3f8", borderBottom: `2px solid ${BORDER}` }}>
                  <th style={TH}>Bezeichnung</th>
                  <th style={TH}>Werkstoff</th>
                  <th style={TH}>Norm</th>
                  <th style={{ ...TH, textAlign: "center" }}>{dimLabel}</th>
                  {showBreite && <th style={{ ...TH, textAlign: "center" }}>Breite mm</th>}
                  <th style={{ ...TH, textAlign: "center" }}>Länge</th>
                  <th style={{ ...TH, textAlign: "right" }}>€/kg</th>
                  <th style={{ ...TH, textAlign: "right" }}>€/t</th>
                  <th style={{ ...TH, textAlign: "center", width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {gefiltert.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: `1px solid #f0f2f5`, backgroundColor: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                  >
                    <td style={TD}>{p.name}</td>
                    <td style={{ ...TD, color: "#555" }}>{p.werkstoff}</td>
                    <td style={{ ...TD, color: "#777", fontSize: 11 }}>{p.norm}</td>
                    <td style={{ ...TD, textAlign: "center", fontWeight: 500, color: BLUE }}>
                      {formatDim(p.dimension, dimUnit)}
                    </td>
                    {showBreite && (
                      <td style={{ ...TD, textAlign: "center", color: "#555" }}>
                        {p.breite != null ? p.breite : "—"}
                      </td>
                    )}
                    <td style={{ ...TD, textAlign: "center", color: "#555" }}>
                      {formatLaenge(p.laenge)}
                    </td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: "#0d1b2a" }}>
                      {formatPreis(p.preisKg)}
                    </td>
                    <td style={{ ...TD, textAlign: "right", color: "#555" }}>
                      {formatTonne(p.preisKg)}
                    </td>
                    <td style={{ ...TD, textAlign: "center", padding: "8px 12px" }}>
                      <Link
                        href="/trading"
                        style={{
                          display: "inline-block",
                          fontSize: 12, fontWeight: 600,
                          color: "#fff", backgroundColor: BLUE,
                          padding: "5px 14px",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0f3070"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = BLUE; }}
                      >
                        Handeln →
                      </Link>
                    </td>
                  </tr>
                ))}
                {gefiltert.length === 0 && (
                  <tr>
                    <td colSpan={showBreite ? 9 : 8} style={{ ...TD, textAlign: "center", color: "#888", padding: 32 }}>
                      Keine Artikel für diese Filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Preis-Hinweis */}
          <div style={{ fontSize: 11, color: "#999", marginTop: 10 }}>
            * Alle Preise sind Richtpreise in EUR (ohne MwSt.) · Mindestmenge und Lieferbedingungen nach Anfrage · Preisstand {new Date().toLocaleDateString("de-DE")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tabellen-Stile ───────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#555",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "9px 14px",
  fontSize: 13,
  verticalAlign: "middle",
};
