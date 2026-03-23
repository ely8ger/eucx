"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { useI18n } from "@/lib/i18n/context";
import {
  SIDEBAR,
  KATALOG,
  KatalogProdukt,
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

// ─── Kategorie-ID → Übersetzungsschlüssel ─────────────────────────────────────

const KAT_KEY_MAP: Record<string, string> = {};
SIDEBAR.forEach(s => s.kategorien.forEach(k => { KAT_KEY_MAP[k.id] = k.key; }));

// ─── Alle Produkte aus dem gesamten Katalog ───────────────────────────────────

type ErweitertesProd = KatalogProdukt & { katId: string; katLabel: string };

const ALLE_PRODUKTE: ErweitertesProd[] = Object.values(KATALOG).flatMap(kat =>
  kat.produkte.map(p => ({ ...p, katId: kat.id, katLabel: kat.label })),
);

const ALLE_WERKSTOFFE = [...new Set(ALLE_PRODUKTE.map(p => p.werkstoff))].sort();
const ALLE_OBERFL     = [...new Set(ALLE_PRODUKTE.map(p => p.oberflaeche))].sort();
const ALLE_LAENGEN    = [...new Set(ALLE_PRODUKTE.map(p => p.laenge))].sort((a, b) => a - b);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ aktiv }: { aktiv: string }) {
  const { t } = useI18n();
  return (
    <nav style={{
      width: 226, flexShrink: 0, backgroundColor: "#fff",
      border: `1px solid ${BORDER}`, alignSelf: "flex-start",
      position: "sticky", top: 16,
    }}>
      {SIDEBAR.map(sektion => (
        <div key={sektion.key}>
          <div style={{
            padding: "9px 14px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#888",
            backgroundColor: "#f8f9fb", borderBottom: `1px solid ${BORDER}`,
          }}>
            {t(sektion.key as any)}
          </div>
          {sektion.kategorien.map(k => {
            const isAktiv = k.id === aktiv;
            return (
              <Link key={k.id} href={`/katalog/${k.id}`} style={{
                display: "block", padding: "8px 14px",
                fontSize: 12.5, color: isAktiv ? "#fff" : "#333",
                backgroundColor: isAktiv ? BLUE : "transparent",
                textDecoration: "none",
                borderBottom: `1px solid ${isAktiv ? BLUE : BORDER}`,
                fontWeight: isAktiv ? 600 : 400,
              }}>
                {t(k.key as any)}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

// ─── Suchleiste ───────────────────────────────────────────────────────────────

interface SearchState {
  text:       string;
  dim:        string;
  breite:     string;
  laenge:     string;
  werkstoff:  string;
  oberflaeche: string;
}

const EMPTY_SEARCH: SearchState = {
  text: "", dim: "", breite: "", laenge: "", werkstoff: "", oberflaeche: "",
};

const H = 36; // einheitliche Höhe aller Felder

function Suchleiste({ s, set }: { s: SearchState; set: (v: SearchState) => void }) {
  const { t } = useI18n();
  const onChange = (key: keyof SearchState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      set({ ...s, [key]: e.target.value });

  const fieldStyle: React.CSSProperties = {
    height: H, width: "100%", boxSizing: "border-box",
    fontSize: 13, padding: "0 10px",
    border: `1px solid ${BORDER}`, fontFamily: F,
    color: "#333", backgroundColor: "#fff", outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    MozAppearance: "none" as const,
  };

  return (
    <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "12px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>

        {/* Freitext */}
        <div style={{ flex: "1 1 160px", minWidth: 0 }}>
          <label style={LBL}>{t("katalog_search_label")}</label>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={2.2}>
              <circle cx={11} cy={11} r={8}/><line x1={21} y1={21} x2={16.65} y2={16.65}/>
            </svg>
            <input value={s.text} onChange={onChange("text")}
              placeholder={t("katalog_search_ph")}
              style={{ ...fieldStyle, paddingLeft: 32 }} />
          </div>
        </div>

        {/* Ø / Maß */}
        <div style={{ flex: "1 1 110px", minWidth: 0 }}>
          <label style={LBL}>{t("katalog_mass_label")}</label>
          <input value={s.dim} onChange={onChange("dim")}
            type="text" inputMode="numeric" placeholder="z.B. 60"
            style={fieldStyle} />
        </div>

        {/* Breite */}
        <div style={{ flex: "1 1 110px", minWidth: 0 }}>
          <label style={LBL}>{t("katalog_breite_label")}</label>
          <input value={s.breite} onChange={onChange("breite")}
            type="text" inputMode="numeric" placeholder="z.B. 40"
            style={fieldStyle} />
        </div>

        {/* Länge */}
        <div style={{ flex: "1 1 110px", minWidth: 0 }}>
          <label style={LBL}>{t("katalog_laenge_label")}</label>
          <div style={{ position: "relative" }}>
            <select value={s.laenge} onChange={onChange("laenge")} style={{ ...fieldStyle, paddingRight: 28 }}>
              <option value="">{t("lbl_all")}</option>
              {ALLE_LAENGEN.map(l => <option key={l} value={l}>{formatLaenge(l)}</option>)}
            </select>
            <Chevron />
          </div>
        </div>

        {/* Werkstoff */}
        <div style={{ flex: "1 1 110px", minWidth: 0 }}>
          <label style={LBL}>{t("filter_werkstoff")}</label>
          <div style={{ position: "relative" }}>
            <select value={s.werkstoff} onChange={onChange("werkstoff")} style={{ ...fieldStyle, paddingRight: 28 }}>
              <option value="">{t("lbl_all")}</option>
              {ALLE_WERKSTOFFE.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <Chevron />
          </div>
        </div>

        {/* Oberfläche */}
        <div style={{ flex: "1 1 110px", minWidth: 0 }}>
          <label style={LBL}>{t("filter_oberflaeche")}</label>
          <div style={{ position: "relative" }}>
            <select value={s.oberflaeche} onChange={onChange("oberflaeche")} style={{ ...fieldStyle, paddingRight: 28 }}>
              <option value="">{t("lbl_all")}</option>
              {ALLE_OBERFL.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <Chevron />
          </div>
        </div>

        {/* Reset */}
        <div style={{ flex: "0 0 auto" }}>
          <label style={LBL}>&nbsp;</label>
          <button onClick={() => set(EMPTY_SEARCH)} style={{
            height: H, padding: "0 14px", fontSize: 12, fontFamily: F,
            cursor: "pointer", backgroundColor: "#f0f3f8", color: "#555",
            border: `1px solid ${BORDER}`, whiteSpace: "nowrap", display: "flex",
            alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>×</span> {t("btn_reset_filters")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={2.5}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ─── Seite ────────────────────────────────────────────────────────────────────

export default function KatalogPage() {
  const params = useParams();
  const katId  = typeof params.kategorie === "string" ? params.kategorie : "";
  const kat    = getKategorie(katId);

  const { t } = useI18n();

  const [search,      setSearch]      = useState<SearchState>(EMPTY_SEARCH);
  const [filterDim,   setFilterDim]   = useState<number | null>(null);
  const [filterW,     setFilterW]     = useState("");
  const [filterO,     setFilterO]     = useState("");

  // Ist die globale Suche aktiv?
  const searchAktiv = Object.values(search).some(v => v !== "");

  // ── Globale Suche über alle 42 Kategorien ──────────────────────────────────
  const globalErgebnisse = useMemo<ErweitertesProd[]>(() => {
    if (!searchAktiv) return [];
    const txt = search.text.toLowerCase().trim();
    const dim = search.dim    ? parseInt(search.dim, 10)    : null;
    const br  = search.breite ? parseInt(search.breite, 10) : null;
    const la  = search.laenge ? parseInt(search.laenge, 10) : null;

    return ALLE_PRODUKTE.filter(p => {
      if (txt && !p.name.toLowerCase().includes(txt) && !p.werkstoff.toLowerCase().includes(txt) &&
          !p.norm.toLowerCase().includes(txt) && !p.katLabel.toLowerCase().includes(txt)) return false;
      if (dim !== null && p.dimension !== dim) return false;
      if (br  !== null && (p.breite == null || p.breite !== br)) return false;
      if (la  !== null && p.laenge !== la) return false;
      if (search.werkstoff   && p.werkstoff   !== search.werkstoff)   return false;
      if (search.oberflaeche && p.oberflaeche !== search.oberflaeche) return false;
      return true;
    });
  }, [search, searchAktiv]);

  // ── Kategorie-Ansicht (keine globale Suche) ────────────────────────────────
  const alleKatProd  = kat?.produkte ?? [];
  const alleDims     = useMemo(() => [...new Set(alleKatProd.map(p => p.dimension))].sort((a, b) => a - b), [alleKatProd]);
  const alleW        = useMemo(() => [...new Set(alleKatProd.map(p => p.werkstoff))].sort(), [alleKatProd]);
  const alleO        = useMemo(() => [...new Set(alleKatProd.map(p => p.oberflaeche))].sort(), [alleKatProd]);

  const katGefiltert = useMemo(() => {
    return alleKatProd.filter(p => {
      if (filterDim !== null && p.dimension !== filterDim) return false;
      if (filterW   && p.werkstoff   !== filterW)          return false;
      if (filterO   && p.oberflaeche !== filterO)          return false;
      return true;
    });
  }, [alleKatProd, filterDim, filterW, filterO]);

  const showBreite = (searchAktiv ? globalErgebnisse : katGefiltert).some(p => p.breite != null);
  const showKatCol = searchAktiv;
  const dimLabel   = kat?.dimLabel ?? "Maß";
  const dimUnit    = kat?.dimUnit  ?? "";

  const produkte = searchAktiv ? globalErgebnisse : katGefiltert;

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
            <Link href="/metalle" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>{t("katalog_title")}</Link>
            <Link href="/duenger" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>{t("duenger_title")}</Link>
            <Link href="/trading" style={{ fontSize: 13, color: "#fff", textDecoration: "none", backgroundColor: BLUE, padding: "8px 16px", fontWeight: 600 }}>
              {t("btn_trading_room")}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 24px 0" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#888" }}>
          <Link href="/"        style={{ color: "#888", textDecoration: "none" }}>{t("breadcrumb_home")}</Link>
          <span>›</span>
          <Link href="/katalog" style={{ color: "#888", textDecoration: "none" }}>{t("breadcrumb_catalog")}</Link>
          {!searchAktiv && kat && <><span>›</span><span style={{ color: "#333" }}>{t(KAT_KEY_MAP[katId] as any)}</span></>}
          {searchAktiv && <><span>›</span><span style={{ color: "#333" }}>{t("katalog_suchergebnisse")}</span></>}
        </div>
      </div>

      {/* ── Layout ─────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1400, margin: "14px auto 64px", padding: "0 24px",
        display: "flex", gap: 18, alignItems: "flex-start",
      }}>
        <Sidebar aktiv={searchAktiv ? "" : katId} />

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Suchleiste ─────────────────────────────────────────────── */}
          <Suchleiste s={search} set={v => { setSearch(v); setFilterDim(null); setFilterW(""); setFilterO(""); }} />

          {/* ── Kategorie-Header (nur ohne globale Suche) ─────────────── */}
          {!searchAktiv && kat && (
            <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "14px 18px", marginBottom: 10 }}>
              <div style={{ fontSize: 17, fontWeight: 300, color: "#0d1b2a", marginBottom: 3 }}>{t(KAT_KEY_MAP[katId] as any)}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{kat.description}</div>
            </div>
          )}

          {/* ── Globale Suche Header ───────────────────────────────────── */}
          {searchAktiv && (
            <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "14px 18px", marginBottom: 10 }}>
              <div style={{ fontSize: 17, fontWeight: 300, color: "#0d1b2a", marginBottom: 3 }}>
                {t("katalog_suchergebnisse")}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {globalErgebnisse.length} {t("katalog_artikel_count")} {t("katalog_in_all")}
              </div>
            </div>
          )}

          {/* ── Dimensions-Tabs (nur ohne globale Suche) ──────────────── */}
          {!searchAktiv && alleDims.length > 1 && (
            <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "10px 14px", marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#888", marginRight: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {dimLabel}
              </span>
              <Tab aktiv={filterDim === null} onClick={() => setFilterDim(null)}>{t("lbl_all")}</Tab>
              {alleDims.map(d => (
                <Tab key={d} aktiv={filterDim === d} onClick={() => setFilterDim(filterDim === d ? null : d)}>
                  {formatDim(d, dimUnit)}
                </Tab>
              ))}
            </div>
          )}

          {/* ── Werkstoff/Oberfläche (nur ohne globale Suche) ─────────── */}
          {!searchAktiv && (alleW.length > 1 || alleO.length > 1) && (
            <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "8px 14px", marginBottom: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {alleW.length > 1 && (
                <select value={filterW} onChange={e => setFilterW(e.target.value)}
                  style={{ fontSize: 12, padding: "5px 10px", border: `1px solid ${BORDER}`, fontFamily: F, color: "#333", backgroundColor: "#fafbfc" }}>
                  <option value="">{t("lbl_all")}</option>
                  {alleW.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              )}
              {alleO.length > 1 && (
                <select value={filterO} onChange={e => setFilterO(e.target.value)}
                  style={{ fontSize: 12, padding: "5px 10px", border: `1px solid ${BORDER}`, fontFamily: F, color: "#333", backgroundColor: "#fafbfc" }}>
                  <option value="">{t("lbl_all")}</option>
                  {alleO.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>{katGefiltert.length} {t("katalog_artikel_count")}</span>
            </div>
          )}

          {/* ── Preistabelle ───────────────────────────────────────────── */}
          <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f3f8", borderBottom: `2px solid ${BORDER}` }}>
                  {showKatCol && <th style={TH}>{t("katalog_col_kat")}</th>}
                  <th style={TH}>{t("katalog_col_bez")}</th>
                  <th style={TH}>{t("filter_werkstoff")}</th>
                  <th style={TH}>{t("katalog_col_norm")}</th>
                  <th style={{ ...TH, textAlign: "center" }}>{t("katalog_col_mass")}</th>
                  {showBreite && <th style={{ ...TH, textAlign: "center" }}>{t("katalog_breite_label")}</th>}
                  <th style={{ ...TH, textAlign: "center" }}>{t("katalog_col_laenge")}</th>
                  <th style={{ ...TH, textAlign: "right" }}>€/kg</th>
                  <th style={{ ...TH, textAlign: "right" }}>€/t</th>
                  <th style={{ ...TH, width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {produkte.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f0f2f5", backgroundColor: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                    {showKatCol && (
                      <td style={TD}>
                        <Link href={`/katalog/${"katId" in p ? (p as ErweitertesProd).katId : katId}`}
                          style={{ fontSize: 11, color: BLUE, textDecoration: "none", fontWeight: 500 }}>
                          {"katId" in p ? t(KAT_KEY_MAP[(p as ErweitertesProd).katId] as any) : ""}
                        </Link>
                      </td>
                    )}
                    <td style={TD}>{p.name}</td>
                    <td style={{ ...TD, color: "#555" }}>{p.werkstoff}</td>
                    <td style={{ ...TD, color: "#777", fontSize: 11 }}>{p.norm}</td>
                    <td style={{ ...TD, textAlign: "center", fontWeight: 600, color: BLUE }}>
                      {formatDim(p.dimension, showKatCol ? "" : dimUnit)}
                    </td>
                    {showBreite && (
                      <td style={{ ...TD, textAlign: "center", color: "#555" }}>
                        {p.breite != null ? `${p.breite} mm` : "—"}
                      </td>
                    )}
                    <td style={{ ...TD, textAlign: "center", color: "#555" }}>{formatLaenge(p.laenge)}</td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: "#0d1b2a" }}>{formatPreis(p.preisKg)}</td>
                    <td style={{ ...TD, textAlign: "right", color: "#555" }}>{formatTonne(p.preisKg)}</td>
                    <td style={{ ...TD, textAlign: "center", padding: "6px 10px" }}>
                      <Link href="/orders/new" style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: "#fff", backgroundColor: BLUE, padding: "5px 12px", textDecoration: "none" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0f3070"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = BLUE; }}>
                        {t("btn_trade")}
                      </Link>
                    </td>
                  </tr>
                ))}
                {produkte.length === 0 && (
                  <tr>
                    <td colSpan={showKatCol ? (showBreite ? 10 : 9) : (showBreite ? 9 : 8)}
                      style={{ ...TD, textAlign: "center", color: "#888", padding: 40 }}>
                      {t("lbl_no_items")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
            {t("katalog_preisstand")} {new Date().toLocaleDateString("de-DE")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pill-Tab ─────────────────────────────────────────────────────────────────

function Tab({ aktiv, onClick, children }: { aktiv: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "3px 12px", fontSize: 12,
      border: `1px solid ${aktiv ? BLUE : BORDER}`,
      backgroundColor: aktiv ? BLUE : "#fafbfc",
      color: aktiv ? "#fff" : "#444",
      cursor: "pointer", fontFamily: F,
    }}>
      {children}
    </button>
  );
}

// ─── Stile ────────────────────────────────────────────────────────────────────

const LBL: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700, color: "#888",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
};

const INP: React.CSSProperties = {
  fontSize: 13, padding: "7px 10px", border: `1px solid ${BORDER}`,
  fontFamily: F, color: "#333", backgroundColor: "#fff", outline: "none",
};

const TH: React.CSSProperties = {
  padding: "9px 12px", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  color: "#555", textAlign: "left", whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "8px 12px", fontSize: 13, verticalAlign: "middle",
};
