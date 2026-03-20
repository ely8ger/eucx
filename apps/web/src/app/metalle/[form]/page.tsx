"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { STEEL_FORMS, getForm, type FormShape } from "@/lib/steel/data";

function ProductThumb({ shape }: { shape: FormShape }) {
  const bg = "#f4f6f9", stroke = "#9aabbc", fill = "#c5d0de", fill2 = "#dce3ed";
  const s = { width: 72, height: 72 } as const;
  switch (shape) {
    case "round":      return <svg {...s} viewBox="0 0 72 72"><circle cx={36} cy={36} r={26} fill={fill2} stroke={stroke} strokeWidth={1.5}/><circle cx={36} cy={36} r={16} fill={fill}/></svg>;
    case "square":     return <svg {...s} viewBox="0 0 72 72"><rect x={10} y={10} width={52} height={52} fill={fill2} stroke={stroke} strokeWidth={1.5}/><rect x={20} y={20} width={32} height={32} fill={fill}/></svg>;
    case "hexagon":    return <svg {...s} viewBox="0 0 72 72"><polygon points="36,6 62,21 62,51 36,66 10,51 10,21" fill={fill2} stroke={stroke} strokeWidth={1.5}/><polygon points="36,16 52,26 52,46 36,56 20,46 20,26" fill={fill}/></svg>;
    case "flat":       return <svg {...s} viewBox="0 0 72 72"><rect x={4} y={24} width={64} height={24} fill={fill2} stroke={stroke} strokeWidth={1.5}/><rect x={12} y={30} width={48} height={12} fill={fill}/></svg>;
    case "tube-round": return <svg {...s} viewBox="0 0 72 72"><circle cx={36} cy={36} r={26} fill={fill2} stroke={stroke} strokeWidth={1.5}/><circle cx={36} cy={36} r={16} fill="#fff" stroke={stroke} strokeWidth={1}/></svg>;
    case "tube-square":return <svg {...s} viewBox="0 0 72 72"><rect x={8} y={8} width={56} height={56} fill={fill2} stroke={stroke} strokeWidth={1.5}/><rect x={20} y={20} width={32} height={32} fill="#fff" stroke={stroke} strokeWidth={1}/></svg>;
    case "fitting":    return <svg {...s} viewBox="0 0 72 72"><rect x={24} y={2} width={14} height={32} fill={fill2} stroke={stroke} strokeWidth={1.5}/><rect x={27} y={4} width={8} height={28} fill="#fff" stroke={stroke} strokeWidth={0.8}/><rect x={32} y={28} width={30} height={14} fill={fill2} stroke={stroke} strokeWidth={1.5}/><rect x={34} y={31} width={26} height={8} fill="#fff" stroke={stroke} strokeWidth={0.8}/><rect x={24} y={28} width={14} height={14} fill={fill2}/></svg>;
    case "angle":      return <svg {...s} viewBox="0 0 72 72"><polygon points="8,64 8,8 22,8 22,50 64,50 64,64" fill={fill2} stroke={stroke} strokeWidth={1.5}/><polygon points="14,58 14,14 16,14 16,44 58,44 58,58" fill={fill}/></svg>;
    case "u":          return <svg {...s} viewBox="0 0 72 72"><path d="M8,8 L8,64 L22,64 L22,24 L50,24 L50,64 L64,64 L64,8 Z" fill={fill2} stroke={stroke} strokeWidth={1.5}/><path d="M16,16 L16,56 L20,56 L20,30 L52,30 L52,56 L56,56 L56,16 Z" fill={fill}/></svg>;
    case "t":          return <svg {...s} viewBox="0 0 72 72"><polygon points="4,4 68,4 68,18 42,18 42,68 30,68 30,18 4,18" fill={fill2} stroke={stroke} strokeWidth={1.5}/><polygon points="12,10 60,10 60,14 39,14 39,62 33,62 33,14 12,14" fill={fill}/></svg>;
    case "beam":       return <svg {...s} viewBox="0 0 72 72"><polygon points="4,4 68,4 68,18 42,18 42,54 68,54 68,68 4,68 4,54 30,54 30,18 4,18" fill={fill2} stroke={stroke} strokeWidth={1.5}/><polygon points="12,11 60,11 60,14 39,14 39,57 60,57 60,61 12,61 12,57 33,57 33,14 12,14" fill={fill}/></svg>;
    case "c-profile":  return <svg {...s} viewBox="0 0 72 72"><path d="M12,4 L52,4 L52,18 L26,18 L26,54 L52,54 L52,68 L12,68 Z" fill={fill2} stroke={stroke} strokeWidth={1.5}/><path d="M20,12 L46,12 L46,14 L32,14 L32,58 L46,58 L46,60 L20,60 Z" fill={fill}/></svg>;
    case "plate":      return <svg {...s} viewBox="0 0 72 72"><polygon points="6,48 66,48 66,60 6,60" fill={fill2} stroke={stroke} strokeWidth={1.5}/><polygon points="6,48 18,22 78,22 66,48" fill={fill} stroke={stroke} strokeWidth={1}/><line x1="66" y1="48" x2="78" y2="22" stroke={stroke} strokeWidth={1}/><line x1="66" y1="60" x2="78" y2="34" stroke={stroke} strokeWidth={1}/><polygon points="78,22 78,34 66,60 66,48" fill="#b0bfcf" stroke={stroke} strokeWidth={1}/></svg>;
    case "plate-holes":return <svg {...s} viewBox="0 0 72 72"><polygon points="6,48 66,48 66,60 6,60" fill={fill2} stroke={stroke} strokeWidth={1.5}/><polygon points="6,48 18,22 78,22 66,48" fill={fill} stroke={stroke} strokeWidth={1}/><line x1="66" y1="48" x2="78" y2="22" stroke={stroke} strokeWidth={1}/>{[26,40,54].map(x=>[29,37].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#9aabbc" opacity={0.8}/>))}</svg>;
    default:           return <svg {...s} viewBox="0 0 72 72"><rect x={10} y={20} width={52} height={32} fill={fill2} stroke={stroke} strokeWidth={1.5}/></svg>;
  }
}

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
                {/* Produkt-Bild */}
                <div style={{ width: 80, height: 80, backgroundColor: "#f4f6f9", border: "1px solid #e8eaef", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ProductThumb shape={form.shape} />
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
