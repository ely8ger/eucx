"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { STEEL_FORMS, getForm } from "@/lib/steel/data";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";

function FilterDropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: "1 1 160px" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          height: 40, padding: "0 12px",
          border: "1px solid #d0d7e3", borderRadius: 0,
          fontSize: 13, color: value ? "#0d1b2a" : "#888",
          backgroundColor: "#fff", cursor: "pointer",
          fontFamily: F, appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' strokeWidth='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
          paddingRight: 32,
        }}
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function FormPage() {
  const params = useParams();
  const formId = typeof params.form === "string" ? params.form : "";
  const form   = getForm(formId);

  const [filterWerkstoff, setFilterWerkstoff]   = useState("");
  const [filterHerst,     setFilterHerst]        = useState("");
  const [filterOberf,     setFilterOberf]        = useState("");
  const [filterLaenge,    setFilterLaenge]       = useState("");
  const [filterStaerke,   setFilterStaerke]      = useState("");
  const [filterTolerance, setFilterTolerance]    = useState("");

  const filtered = useMemo(() => {
    if (!form) return [];
    return form.products.filter(p => {
      if (filterWerkstoff && !p.werkstoffe.includes(filterWerkstoff))          return false;
      if (filterHerst     && !p.herstellungsart.includes(filterHerst))         return false;
      if (filterOberf     && !p.oberflaechenList.includes(filterOberf))        return false;
      if (filterTolerance && !p.toleranz.includes(filterTolerance))            return false;
      return true;
    });
  }, [form, filterWerkstoff, filterHerst, filterOberf, filterTolerance]);

  const hasFilters = filterWerkstoff || filterHerst || filterOberf || filterLaenge || filterStaerke || filterTolerance;

  if (!form) {
    return (
      <div style={{ fontFamily: F, padding: 64, textAlign: "center", color: "#666" }}>
        Produktgruppe nicht gefunden. <Link href="/metalle" style={{ color: BLUE }}>Zurück zur Übersicht</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: F }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: "#0b1e36", borderBottom: "1px solid #1e3352" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <EucxLogo variant="dark" size="md" />
          </Link>
          <Link href="/trading" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>
            Zum Handelsraum →
          </Link>
        </div>
      </header>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#888" }}>
          <Link href="/"        style={{ color: "#888", textDecoration: "none" }}>Startseite</Link>
          <span>›</span>
          <Link href="/metalle" style={{ color: "#888", textDecoration: "none" }}>Metallprodukte</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>{form.label}profile</span>
        </div>
      </div>

      {/* ── Seitentitel ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 0" }}>
        <h1 style={{ fontSize: 26, fontWeight: 300, color: "#0d1b2a", margin: "0 0 4px" }}>{form.label}profile</h1>
        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{form.description}</p>
      </div>

      {/* ── Filter-Leiste ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "16px auto 0", padding: "0 32px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea", padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <FilterDropdown label="Werkstoff"       options={form.filters.werkstoff}       value={filterWerkstoff} onChange={setFilterWerkstoff} />
            <FilterDropdown label="Herstellungsart" options={form.filters.herstellungsart} value={filterHerst}     onChange={setFilterHerst} />
            <FilterDropdown label="Oberfläche"      options={form.filters.oberflaeche}     value={filterOberf}     onChange={setFilterOberf} />
            <FilterDropdown label="Toleranz"        options={form.filters.toleranz}        value={filterTolerance} onChange={setFilterTolerance} />
            <FilterDropdown label="Länge (mm)"      options={form.filters.laenge}          value={filterLaenge}    onChange={setFilterLaenge} />
            <FilterDropdown label="Stärke (mm)"     options={form.filters.staerke}         value={filterStaerke}   onChange={setFilterStaerke} />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setFilterWerkstoff(""); setFilterHerst(""); setFilterOberf(""); setFilterLaenge(""); setFilterStaerke(""); setFilterTolerance(""); }}
              style={{ fontSize: 12, color: BLUE, background: "none", border: "none", cursor: "pointer", fontFamily: F, padding: 0 }}
            >
              × Alle Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* ── Ergebnisse ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "#666" }}>{filtered.length} Produkt{filtered.length !== 1 ? "e" : ""}</span>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666", cursor: "pointer" }}>
            <input type="checkbox" style={{ accentColor: BLUE }} />
            Nur ab Lager verfügbare Produkte anzeigen
          </label>
        </div>
      </div>

      {/* ── Produktliste ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 64px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 32px", textAlign: "center", color: "#888" }}>
              <p style={{ fontSize: 14, marginBottom: 12 }}>Keine Produkte für die gewählten Filter gefunden.</p>
              <button
                onClick={() => { setFilterWerkstoff(""); setFilterHerst(""); setFilterOberf(""); setFilterLaenge(""); setFilterStaerke(""); setFilterTolerance(""); }}
                style={{ fontSize: 13, color: BLUE, background: "none", border: "none", cursor: "pointer", fontFamily: F }}
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            filtered.map((product, i) => (
              <div
                key={product.id}
                style={{
                  display: "flex", alignItems: "center", gap: 20,
                  padding: "20px 24px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f0f2f5" : "none",
                  cursor: "pointer",
                  transition: "background .1s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f7f9fc"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
              >
                {/* Produkt-Bild Placeholder */}
                <div style={{ width: 72, height: 72, backgroundColor: "#f4f6f9", border: "1px solid #e8eaef", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 48 48" width={48} height={48}>
                    <rect x={4} y={16} width={40} height={16} rx={2} fill="#c5d0de"/>
                    <rect x={8} y={20} width={32} height={8}  rx={1} fill="#9aabbc"/>
                  </svg>
                </div>

                {/* Name + Beschreibung */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0d1b2a", margin: "0 0 4px" }}>{product.name}</p>
                  <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px", lineHeight: 1.5 }}>{product.beschreibung}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {product.werkstoffe.slice(0, 4).map(w => (
                      <span key={w} style={{ fontSize: 11, color: "#555", backgroundColor: "#f0f2f5", padding: "2px 8px", fontWeight: 500 }}>{w}</span>
                    ))}
                    {product.werkstoffe.length > 4 && (
                      <span style={{ fontSize: 11, color: "#888", backgroundColor: "#f0f2f5", padding: "2px 8px" }}>+{product.werkstoffe.length - 4} weitere</span>
                    )}
                  </div>
                </div>

                {/* Herstellungsart */}
                <div style={{ flexShrink: 0, textAlign: "right", minWidth: 120 }}>
                  {product.herstellungsart.map(h => (
                    <div key={h} style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>{h}</div>
                  ))}
                </div>

                {/* Handeln-Button */}
                <div style={{ flexShrink: 0 }}>
                  <Link
                    href="/trading"
                    style={{
                      display: "inline-flex", alignItems: "center", height: 36, padding: "0 18px",
                      backgroundColor: BLUE, color: "#fff", textDecoration: "none",
                      fontSize: 13, fontWeight: 600, fontFamily: F, whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0f3070"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = BLUE; }}
                  >
                    Handeln →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Andere Formen ─────────────────────────────────────────────── */}
        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>Weitere Produktformen</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STEEL_FORMS.filter(f => f.id !== formId).map(f => (
              <Link key={f.id} href={`/metalle/${f.id}`} style={{
                fontSize: 12, padding: "6px 14px", backgroundColor: "#fff",
                border: "1px solid #dde2ea", color: "#444", textDecoration: "none", fontFamily: F,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f0f4fb"; (e.currentTarget as HTMLAnchorElement).style.color = BLUE; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLAnchorElement).style.color = "#444"; }}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
