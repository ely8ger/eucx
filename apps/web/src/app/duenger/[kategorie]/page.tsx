"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { FERTILIZER_CATEGORIES, getFertiCategory } from "@/lib/fertilizer/data";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";
const fill2  = "#dce3ed";
const fill   = "#c5d0de";
const stroke = "#9aabbc";

// ─── Produkt-Thumbnails ───────────────────────────────────────────────────────

function ThumbGranulat() {
  return <svg width={72} height={72} viewBox="0 0 72 72">
    <circle cx={22} cy={24} r={13} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={22} cy={24} r={7}  fill={fill}/>
    <circle cx={48} cy={20} r={13} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={48} cy={20} r={7}  fill={fill}/>
    <circle cx={34} cy={46} r={13} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={34} cy={46} r={7}  fill={fill}/>
    <circle cx={58} cy={48} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={58} cy={48} r={5}  fill={fill}/>
    <circle cx={14} cy={52} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={14} cy={52} r={5}  fill={fill}/>
  </svg>;
}

function ThumbPulver() {
  return <svg width={72} height={72} viewBox="0 0 72 72">
    {/* Pulverhaufen */}
    <ellipse cx={36} cy={54} rx={30} ry={8} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <path d="M6,54 Q10,28 36,20 Q62,28 66,54 Z" fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <path d="M14,54 Q18,33 36,26 Q54,33 58,54 Z" fill={fill}/>
    {/* Staubpartikel */}
    <circle cx={20} cy={18} r={2} fill={fill2} stroke={stroke} strokeWidth={1}/>
    <circle cx={52} cy={14} r={1.5} fill={fill2} stroke={stroke} strokeWidth={1}/>
    <circle cx={62} cy={24} r={1.5} fill={fill2} stroke={stroke} strokeWidth={1}/>
  </svg>;
}

function ThumbPrills() {
  return <svg width={72} height={72} viewBox="0 0 72 72">
    {/* Gleichmäßige runde Prills */}
    <circle cx={18} cy={20} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={18} cy={20} r={5}  fill={fill}/>
    <circle cx={38} cy={16} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={38} cy={16} r={5}  fill={fill}/>
    <circle cx={57} cy={22} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={57} cy={22} r={5}  fill={fill}/>
    <circle cx={28} cy={38} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={28} cy={38} r={5}  fill={fill}/>
    <circle cx={50} cy={42} r={10} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={50} cy={42} r={5}  fill={fill}/>
    <circle cx={16} cy={54} r={8}  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={16} cy={54} r={4}  fill={fill}/>
    <circle cx={36} cy={58} r={8}  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={36} cy={58} r={4}  fill={fill}/>
    <circle cx={58} cy={58} r={8}  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={58} cy={58} r={4}  fill={fill}/>
  </svg>;
}

function ThumbKristalle() {
  return <svg width={72} height={72} viewBox="0 0 72 72">
    {/* Kubische Kristallformen */}
    <polygon points="10,14 26,10 34,22 18,26" fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <polygon points="18,26 34,22 34,38 18,42" fill={fill}  stroke={stroke} strokeWidth={1}/>
    <polygon points="10,14 18,26 18,42 10,30" fill={fill2} stroke={stroke} strokeWidth={1}/>
    <polygon points="36,8 54,4 62,18 44,22"  fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <polygon points="44,22 62,18 62,34 44,38" fill={fill}  stroke={stroke} strokeWidth={1}/>
    <polygon points="36,8 44,22 44,38 36,24"  fill={fill2} stroke={stroke} strokeWidth={1}/>
    <polygon points="14,42 30,38 38,52 22,56" fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <polygon points="22,56 38,52 38,66 22,70" fill={fill}  stroke={stroke} strokeWidth={1}/>
    <polygon points="14,42 22,56 22,70 14,56"  fill={fill2} stroke={stroke} strokeWidth={1}/>
    <polygon points="42,34 58,30 64,44 48,48" fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <polygon points="48,48 64,44 64,58 48,62" fill={fill}  stroke={stroke} strokeWidth={1}/>
    <polygon points="42,34 48,48 48,62 42,48"  fill={fill2} stroke={stroke} strokeWidth={1}/>
  </svg>;
}

function ThumbNPK() {
  return <svg width={72} height={72} viewBox="0 0 72 72">
    {/* Drei unterschiedlich große Granulatkörner für N-P-K */}
    <circle cx={20} cy={30} r={16} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={20} cy={30} r={9}  fill={fill}/>
    <circle cx={52} cy={22} r={14} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={52} cy={22} r={8}  fill={fill}/>
    <circle cx={46} cy={50} r={14} fill={fill2} stroke={stroke} strokeWidth={1.5}/>
    <circle cx={46} cy={50} r={8}  fill={fill}/>
  </svg>;
}

// Wählt Thumbnail anhand physischer Form
function FertThumb({ physForm, id }: { physForm: string[]; id: string }) {
  if (id.startsWith("npk-"))                                          return <ThumbNPK />;
  if (id === "dap-18-46" || id === "harnstoff-46" || id === "ammoniumnitrat") return <ThumbPrills />;
  if (physForm.includes("Kristalle"))                                 return <ThumbKristalle />;
  if (physForm.includes("Pulver") && !physForm.includes("Granulat")) return <ThumbPulver />;
  if (physForm.includes("Prills"))                                    return <ThumbPrills />;
  return <ThumbGranulat />;
}

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

export default function KategoriePage() {
  const params     = useParams();
  const katId      = typeof params.kategorie === "string" ? params.kategorie : "";
  const kategorie  = getFertiCategory(katId);

  const [filterAnwendung,  setFilterAnwendung]  = useState("");
  const [filterKultur,     setFilterKultur]     = useState("");
  const [filterPhysForm,   setFilterPhysForm]   = useState("");
  const [filterVerpackung, setFilterVerpackung] = useState("");
  const [filterZert,       setFilterZert]       = useState("");

  const filtered = useMemo(() => {
    if (!kategorie) return [];
    return kategorie.products.filter(p => {
      if (filterAnwendung  && !p.anwendung.includes(filterAnwendung))          return false;
      if (filterKultur     && !p.kulturpflanzen.includes(filterKultur))        return false;
      if (filterPhysForm   && !p.physForm.includes(filterPhysForm))            return false;
      if (filterVerpackung && !p.verpackung.includes(filterVerpackung))        return false;
      if (filterZert       && !p.zertifizierung.includes(filterZert))          return false;
      return true;
    });
  }, [kategorie, filterAnwendung, filterKultur, filterPhysForm, filterVerpackung, filterZert]);

  const hasFilters = filterAnwendung || filterKultur || filterPhysForm || filterVerpackung || filterZert;

  const resetFilters = () => {
    setFilterAnwendung(""); setFilterKultur(""); setFilterPhysForm("");
    setFilterVerpackung(""); setFilterZert("");
  };

  if (!kategorie) {
    return (
      <div style={{ fontFamily: F, padding: 64, textAlign: "center", color: "#666" }}>
        Kategorie nicht gefunden. <Link href="/duenger" style={{ color: BLUE }}>Zurück zur Übersicht</Link>
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
          <Link href="/duenger" style={{ color: "#888", textDecoration: "none" }}>Dünger & Agrarchemie</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>{kategorie.label}</span>
        </div>
      </div>

      {/* ── Seitentitel ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 0" }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: BLUE, display: "block", marginBottom: 8 }}>DÜNGER · AGRARCHEMIE</span>
        <h1 style={{ fontSize: 26, fontWeight: 300, color: "#0d1b2a", margin: "0 0 4px" }}>{kategorie.label}</h1>
        <p style={{ fontSize: 13, color: "#666", margin: 0, maxWidth: 720 }}>{kategorie.description}</p>
      </div>

      {/* ── Filter-Leiste ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "16px auto 0", padding: "0 32px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #dde2ea", padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: hasFilters ? 8 : 0 }}>
            <FilterDropdown label="Anwendung"      options={kategorie.filters.anwendung}      value={filterAnwendung}  onChange={setFilterAnwendung} />
            <FilterDropdown label="Kulturpflanze"  options={kategorie.filters.kulturpflanze}  value={filterKultur}     onChange={setFilterKultur} />
            <FilterDropdown label="Physische Form" options={kategorie.filters.physForm}       value={filterPhysForm}   onChange={setFilterPhysForm} />
            <FilterDropdown label="Verpackung"     options={kategorie.filters.verpackung}     value={filterVerpackung} onChange={setFilterVerpackung} />
            <FilterDropdown label="Zertifizierung" options={kategorie.filters.zertifizierung} value={filterZert}       onChange={setFilterZert} />
          </div>
          {hasFilters && (
            <button
              onClick={resetFilters}
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
              <button onClick={resetFilters} style={{ fontSize: 13, color: BLUE, background: "none", border: "none", cursor: "pointer", fontFamily: F }}>
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            filtered.map((product, i) => (
              <div
                key={product.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 24,
                  padding: "24px 24px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f0f2f5" : "none",
                  cursor: "pointer", transition: "background .1s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f7f9fc"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
              >
                {/* Produkt-Thumbnail */}
                <div style={{
                  flexShrink: 0, width: 80, height: 80,
                  backgroundColor: "#f4f6f9", border: "1px solid #e8eaef",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FertThumb physForm={product.physForm} id={product.id} />
                </div>

                {/* Name + Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>{product.name}</p>
                    <span style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>{product.formel}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px", lineHeight: 1.6 }}>{product.beschreibung}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {product.physForm.map(f => (
                      <span key={f} style={{ fontSize: 11, color: "#555", backgroundColor: "#f0f2f5", padding: "2px 8px", fontWeight: 500 }}>{f}</span>
                    ))}
                    {product.anwendung.map(a => (
                      <span key={a} style={{ fontSize: 11, color: BLUE, backgroundColor: "#eef2fb", padding: "2px 8px", fontWeight: 500 }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Kulturpflanzen */}
                <div style={{ flexShrink: 0, textAlign: "right", minWidth: 130 }}>
                  {product.kulturpflanzen.slice(0, 4).map(k => (
                    <div key={k} style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>{k}</div>
                  ))}
                  {product.kulturpflanzen.length > 4 && (
                    <div style={{ fontSize: 11, color: "#888" }}>+{product.kulturpflanzen.length - 4} weitere</div>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    href="/orders/new"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      height: 36, padding: "0 18px",
                      backgroundColor: BLUE, color: "#fff", textDecoration: "none",
                      fontSize: 13, fontWeight: 600, fontFamily: F, whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0f3070"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = BLUE; }}
                  >
                    Handeln →
                  </Link>
                  <Link
                    href={`/duenger/${katId}/${product.id}`}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      height: 36, padding: "0 18px",
                      backgroundColor: "#fff", color: BLUE, textDecoration: "none",
                      fontSize: 13, fontWeight: 600, fontFamily: F, whiteSpace: "nowrap",
                      border: `1px solid ${BLUE}`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#eef2fb"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff"; }}
                  >
                    Mehr Informationen
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Andere Kategorien ─────────────────────────────────────────── */}
        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>Weitere Kategorien</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FERTILIZER_CATEGORIES.filter(c => c.id !== katId).map(c => (
              <Link key={c.id} href={`/duenger/${c.id}`} style={{
                fontSize: 12, padding: "6px 14px", backgroundColor: "#fff",
                border: "1px solid #dde2ea", color: "#444", textDecoration: "none", fontFamily: F,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f0f4fb"; (e.currentTarget as HTMLAnchorElement).style.color = BLUE; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLAnchorElement).style.color = "#444"; }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
