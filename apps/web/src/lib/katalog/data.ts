// ─── Typen ────────────────────────────────────────────────────────────────────

export interface KatalogProdukt {
  id:          string;
  name:        string;
  werkstoff:   string;
  norm:        string;
  oberflaeche: string;
  dimension:   number;
  breite?:     number;
  laenge:      number;
  preisKg:     number;
}

export interface KatalogKategorie {
  id:          string;
  label:       string;
  dimLabel:    string;
  dimUnit:     string;
  description: string;
  produkte:    KatalogProdukt[];
}

export interface SidebarSektion {
  label:      string;
  key:        string;
  kategorien: { id: string; label: string; key: string }[];
}

// ─── Handelbare Produkte — einheitliche Quelle für Buyer & Seller ─────────────
// Jedes Element entspricht einem standardisierten Börsenprodukt.
// Buyer-Presets und Seller-Dropdown nutzen dieselbe Liste.

export type CbamGroupId =
  | "STEEL_PRIMARY"
  | "STEEL_PROCESSED"
  | "ALUMINIUM_UNWROUGHT"
  | "ALUMINIUM_PROCESSED";

export interface TradeableProduct {
  id:        string;
  katId:     string;
  name:      string;        // Standardisierter Handelsname
  werkstoff: string;        // Güte / Material
  norm:      string;        // Norm(en)
  hsCode:    string;        // EU-Zollposition
  cbam:      CbamGroupId | null;
  inco:      string;        // Standard-Incoterms
  vat:       string;        // USt-Behandlung
  desc:      string;        // Beschreibung für Lot-Formular
}

export const TRADEABLE_PRODUCTS: TradeableProduct[] = [
  // ── Stahl — Langprodukte ─────────────────────────────────────────────────────
  {
    id: "rebar-bst500", katId: "betonstahl",
    name: "Betonstahl BST 500 / B500B (Rebar)",
    werkstoff: "BST 500 / B500B", norm: "EN 10080 · DIN 488",
    hsCode: "7214 20 00", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Gerippter Betonstahl BST 500 / B500B, Ø 6–40 mm. Lieferung in Stäben 6 m oder 12 m. 3.1-Werkzeugnis nach EN 10204 erforderlich. Anwendung: Stahlbetonkonstruktionen, Hoch- und Tiefbau.",
  },
  {
    id: "walzdraht-sae1008", katId: "walzdraht",
    name: "Walzdraht SAE 1008 / DD11 (Wire Rod)",
    werkstoff: "SAE 1008 / DD11", norm: "EN 10016-2",
    hsCode: "7213 91 10", cbam: "STEEL_PROCESSED", inco: "EXW",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Walzdraht unlegiert, niedriggekohlter Stahl SAE 1008 / DD11. Coil, Ø 5,5–16 mm. Schmelzanalyse 3.1 nach EN 10204 erforderlich. Anwendung: Zieherei, Betonstahlproduktion, Netzherstellung.",
  },
  // ── Stahl — Flachprodukte ────────────────────────────────────────────────────
  {
    id: "blech-s235", katId: "blech-warmgewalzt",
    name: "Warmgewalztes Blech S235JR",
    werkstoff: "S235JR", norm: "EN 10025-2 · EN 10051",
    hsCode: "7208 51 20", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Warmgewalzte Bleche / Coils S235JR. Breite 600–2000 mm, Dicke 2–25 mm. 3.1-Zeugnis nach EN 10204 beizufügen. Anwendung: Konstruktionsstahl, Maschinenbau.",
  },
  {
    id: "blech-s355", katId: "blech-warmgewalzt",
    name: "Feinkornbaustahl S355JR / S355J2 (Blech)",
    werkstoff: "S355JR / S355J2", norm: "EN 10025-2",
    hsCode: "7208 51 91", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Warmgewalzte Feinkornbaustahl-Bleche S355JR / J2. Dicke 3–80 mm, Breite bis 3000 mm. 3.1-Werkzeugnis nach EN 10204. Anwendung: Brückenbau, Schweißkonstruktionen, Druckbehälter.",
  },
  {
    id: "blech-kalt-dc01", katId: "blech-kaltgewalzt",
    name: "Kaltgewalztes Blech DC01 / DC04",
    werkstoff: "DC01 / DC04", norm: "EN 10130",
    hsCode: "7209 15 00", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Kaltgewalzte Bleche / Coils DC01–DC04. Breite 600–1850 mm, Dicke 0,5–3 mm. Oberfläche A (geölt) oder B (blank). 3.1-Zeugnis nach EN 10204. Anwendung: Automobilindustrie, Haushaltsgeräte.",
  },
  {
    id: "blech-verzinkt-dx51d", katId: "blech-verzinkt",
    name: "Feuerverzinktes Blech DX51D+Z / DX53D",
    werkstoff: "DX51D+Z / DX53D", norm: "EN 10346",
    hsCode: "7210 49 00", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Feuerverzinkte Bleche / Coils DX51D+Z oder DX53D. Zinkauflage Z100–Z275 g/m². Breite 600–1500 mm, Dicke 0,4–3 mm. 3.1-Zeugnis EN 10204. Anwendung: Bau, Lüftung, Trapezblechproduktion.",
  },
  // ── Stahl — Träger & Profile ─────────────────────────────────────────────────
  {
    id: "hea-heb-traeger", katId: "traeger",
    name: "Breitflanschträger HEA / HEB S235JR",
    werkstoff: "S235JR / S355JR", norm: "EN 10365 · EN 10025-2",
    hsCode: "7216 33 10", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Breitflanschträger HEA/HEB nach EN 10365, S235JR oder S355JR. Größen HEA 100–900, HEB 100–1000. 3.1-Werkzeugnis nach EN 10204. Anwendung: Stahlbau, Hallenkonstruktionen, Brückenbau.",
  },
  {
    id: "ipe-traeger", katId: "traeger",
    name: "IPE-Träger S235JR / S355JR",
    werkstoff: "S235JR / S355JR", norm: "EN 10365 · EN 10025-2",
    hsCode: "7216 31 10", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "I-Träger schmaler Flansch (IPE) nach EN 10365. Größen IPE 80–600, S235JR oder S355JR. 3.1-Zeugnis nach EN 10204. Anwendung: Hochbau, Kranbahnen, Industrie- und Lagerhallen.",
  },
  {
    id: "hohlprofile-s235jrh", katId: "hohlprofile",
    name: "Hohlprofile S235JRH — SHS / RHS / CHS",
    werkstoff: "S235JRH / S355J2H", norm: "EN 10219 · EN 10210",
    hsCode: "7306 61 10", cbam: "STEEL_PROCESSED", inco: "EXW",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Quadrat- (SHS), Rechteck- (RHS) und Rundhohlprofile (CHS), kalt- oder warmgefertigt. Wandstärke 2–16 mm. Normen: EN 10219, EN 10210. Anwendung: Stahlbau, Konstruktionsprofile, Maschinenbau.",
  },
  // ── Stahl — Rohre ────────────────────────────────────────────────────────────
  {
    id: "nahtlosrohr-p235gh", katId: "nahtlosrohr",
    name: "Nahtlosrohr P235GH / P265GH (Druckbehälter)",
    werkstoff: "P235GH / P265GH", norm: "EN 10216-2",
    hsCode: "7304 31 80", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Nahtlos gezogene Stahlrohre für Druckbehälter, P235GH / P265GH. Außendurchmesser 21,3–610 mm, Wandstärke 2–50 mm. Normen: EN 10216-2. 3.1-Prüfzeugnis nach EN 10204. Anwendung: Kraftwerke, Chemie, Energietechnik.",
  },
  {
    id: "nahtlosrohr-s355", katId: "nahtlosrohr",
    name: "Nahtlosrohr S355 / St52 (Konstruktion)",
    werkstoff: "S355J2H / St52", norm: "EN 10210-1",
    hsCode: "7304 39 51", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Nahtlose Konstruktionsrohre S355J2H warm gefertigt. Außendurchmesser 33,7–610 mm. Normen: EN 10210-1. 3.1-Zeugnis nach EN 10204. Anwendung: Hochbau, Brückenbau, Maschinenbau.",
  },
  // ── Schrott ──────────────────────────────────────────────────────────────────
  {
    id: "schrott-hms12", katId: "schrott",
    name: "Stahlschrott HMS 1/2 (Heavy Melting Scrap)",
    werkstoff: "HMS 1/2", norm: "ISRI 200–212",
    hsCode: "7204 10 00", cbam: null, inco: "FOB",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Schwerer Stahlschrott HMS 1/2 nach ISRI-Spezifikation 200 / 210. Max. Abmessung 1500×500 mm. Feuchtigkeitsgehalt max. 1 %. Analyse: C ≤ 0,4 %, S ≤ 0,05 %. Sichtkontrolle bei Übernahme. Keine radioaktiven oder gefährlichen Materialien.",
  },
  {
    id: "schrott-schredder", katId: "schrott",
    name: "Schredder-Schrott (Shredded Scrap)",
    werkstoff: "Schredder / ISRI 210", norm: "ISRI 210",
    hsCode: "7204 49 10", cbam: null, inco: "FOB",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",
    desc: "Aufbereiteter Schredder-Schrott ISRI 210. Schüttdichte mind. 1,0 t/m³. Kupfer ≤ 0,25 %, Chrom ≤ 0,25 %, Nickel ≤ 0,25 %. Analyse-Zertifikat beizufügen. Lieferung per Schiff, LKW oder Waggon.",
  },
  // ── NE-Metalle ───────────────────────────────────────────────────────────────
  {
    id: "kupfer-kathoden", katId: "kupfer",
    name: "Kupferkathoden Grade A (Cu-CATH-1)",
    werkstoff: "Cu-CATH-1 · min. 99,99 % Cu", norm: "EN 1978 Grade A",
    hsCode: "7403 11 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Elektrolyt-Kupferkathoden EN 1978 Grade A, Reinheit min. 99,99 % Cu. Standardkathode ca. 110–130 kg/Stück, palettiert. LME-konforme Qualität. Analysezertifikat und Ursprungsnachweis erforderlich.",
  },
  {
    id: "aluminium-p1020", katId: "aluminium",
    name: "Aluminiumbarren Primär EN AW-1050A (P1020)",
    werkstoff: "EN AW-1050A · Al min. 99,5 %", norm: "EN 573-3 · LME P1020",
    hsCode: "7601 10 00", cbam: "ALUMINIUM_UNWROUGHT", inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Primär-Aluminiumbarren EN AW-1050A (Al 99,5 %), T-Barren oder Masseln, LME-Spezifikation P1020. Analysezertifikat und Ursprungsnachweis erforderlich. CBAM-deklarationspflichtig ab 2026.",
  },
  // ── Dünger — Stickstoff ──────────────────────────────────────────────────────
  {
    id: "harnstoff-46", katId: "harnstoff",
    name: "Harnstoff 46 % N (Urea Prilled / Granular)",
    werkstoff: "CO(NH₂)₂ · 46 % N", norm: "EN 13654-1 · EU-VO 2019/1009",
    hsCode: "3102 10 10", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Harnstoff 46 % N in Prill- oder Granulat-Form. N-Gehalt min. 46 %. Biuret max. 1,2 %. Feuchtigkeitsgehalt max. 0,5 %. Lieferung in Big Bag (500/1000 kg) oder Schüttgut. Konformität mit EU-Düngemittelverordnung 2019/1009.",
  },
  {
    id: "ammoniumnitrat-34", katId: "harnstoff",
    name: "Ammoniumnitrat 34,4 % N (AN Granular)",
    werkstoff: "NH₄NO₃ · 34,4 % N", norm: "EN 13463 · EU-VO 2019/1009",
    hsCode: "3102 30 90", cbam: null, inco: "EXW",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Ammoniumnitrat-Dünger 34,4 % N, granuliert. Detonationssicherheitsprüfung nach Anhang III der Verordnung (EG) 2003/2003 erforderlich. Lieferung in Big Bag oder Schüttgut. ADR-Kennzeichnung. EU-VO 2019/1009 konform.",
  },
  // ── Dünger — Phosphor ────────────────────────────────────────────────────────
  {
    id: "dap-18-46", katId: "dap",
    name: "DAP 18-46 (Diammoniumphosphat)",
    werkstoff: "(NH₄)₂HPO₄ · 18 % N · 46 % P₂O₅", norm: "EN 13639 · EU-VO 2019/1009",
    hsCode: "3105 30 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Diammoniumphosphat DAP 18-46. N-Gehalt 18 %, P₂O₅ 46 %. Granulat, Körnung 2–5 mm. Schüttdichte ca. 0,9 t/m³. Lieferung in Big Bag 1.000 kg oder Schüttgut. EU-VO 2019/1009 konform, Herkunftsnachweis.",
  },
  // ── Dünger — Kalium ──────────────────────────────────────────────────────────
  {
    id: "mop-60", katId: "mop",
    name: "MOP / Kaliumchlorid 60 % K₂O (Muriate of Potash)",
    werkstoff: "KCl · 60 % K₂O", norm: "EN 13647 · EU-VO 2019/1009",
    hsCode: "3104 20 50", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Kaliumchlorid (MOP) mit 60 % K₂O. Granulat oder Körnung. Feuchtigkeitsgehalt max. 0,5 %. Lieferung in Big Bag (500/1000 kg) oder Schüttgut. EU-VO 2019/1009 konform. Nicht geeignet für chloridempfindliche Kulturen.",
  },
  {
    id: "kaliumnitrat-nop", katId: "mop",
    name: "Kaliumnitrat 13-0-46 (NOP — Nitrate of Potash)",
    werkstoff: "KNO₃ · 13 % N · 46 % K₂O", norm: "EN 13647 · EU-VO 2019/1009",
    hsCode: "3104 20 90", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "Kaliumnitrat (NOP) 13-0-46. Chloridfreier Dünger für empfindliche Kulturen. Löslichkeit: 316 g/l bei 20 °C (geeignet für Fertigationsanlagen). Lieferung in 25 kg-Sack oder Big Bag. EU-VO 2019/1009 konform.",
  },
  // ── Dünger — NPK ────────────────────────────────────────────────────────────
  {
    id: "npk-15-15-15", katId: "npk",
    name: "NPK 15-15-15 Komplexdünger",
    werkstoff: "N-P₂O₅-K₂O 15-15-15", norm: "EN 14677 · EU-VO 2019/1009",
    hsCode: "3105 20 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "NPK-Komplexdünger 15-15-15. Granulat, Körnung 2–5 mm. Gleichmäßige Nährstoffverteilung im Granulat. Schüttdichte ca. 1,0 t/m³. Lieferung in Big Bag 500/1000 kg oder Schüttgut. EU-VO 2019/1009 konform.",
  },
  {
    id: "npk-20-10-10", katId: "npk",
    name: "NPK 20-10-10 Komplexdünger",
    werkstoff: "N-P₂O₅-K₂O 20-10-10", norm: "EN 14677 · EU-VO 2019/1009",
    hsCode: "3105 20 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "NPK-Komplexdünger 20-10-10. Stickstoffbetont für Getreide und Grünland. Granulat, Körnung 2–5 mm. Lieferung in Big Bag 1.000 kg oder Schüttgut. EU-VO 2019/1009 konform.",
  },
  {
    id: "npk-8-20-30", katId: "npk",
    name: "NPK 8-20-30 Komplexdünger",
    werkstoff: "N-P₂O₅-K₂O 8-20-30", norm: "EN 14677 · EU-VO 2019/1009",
    hsCode: "3105 20 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)",
    desc: "NPK-Komplexdünger 8-20-30. Phosphor- und kaliumbetontes Verhältnis für Herbst-Grunddüngung. Lieferung in Big Bag 1.000 kg oder Schüttgut. EU-VO 2019/1009 konform.",
  },
];

// ─── Sidebar Struktur ─────────────────────────────────────────────────────────

export const SIDEBAR: SidebarSektion[] = [
  {
    label: "Stahl — Langprodukte", key: "sidebar_stahl_lang",
    kategorien: [
      { id: "betonstahl",       label: "Betonstahl",            key: "kat_betonstahl"       },
      { id: "walzdraht",        label: "Walzdraht",             key: "kat_walzdraht"        },
    ],
  },
  {
    label: "Stahl — Flachprodukte", key: "sidebar_stahl_flach",
    kategorien: [
      { id: "blech-warmgewalzt", label: "Blech warmgewalzt",   key: "kat_blech_warmgewalzt" },
      { id: "blech-kaltgewalzt", label: "Blech kaltgewalzt",   key: "kat_blech_kaltgewalzt" },
      { id: "blech-verzinkt",    label: "Blech verzinkt",      key: "kat_blech_verzinkt"    },
    ],
  },
  {
    label: "Stahl — Träger & Profile", key: "sidebar_stahl_traeger",
    kategorien: [
      { id: "traeger",      label: "Träger (HEA/HEB/IPE)", key: "kat_traeger"      },
      { id: "hohlprofile",  label: "Hohlprofile",          key: "kat_hohlprofile"  },
    ],
  },
  {
    label: "Stahl — Rohre", key: "sidebar_stahl_rohre",
    kategorien: [
      { id: "nahtlosrohr", label: "Nahtlosrohr", key: "kat_nahtlosrohr" },
    ],
  },
  {
    label: "Schrott", key: "sidebar_schrott_kat",
    kategorien: [
      { id: "schrott", label: "Schrott (HMS / Schredder)", key: "kat_schrott" },
    ],
  },
  {
    label: "NE-Metalle", key: "sidebar_ne_metalle",
    kategorien: [
      { id: "kupfer",    label: "Kupferkathoden",  key: "kat_kupfer"    },
      { id: "aluminium", label: "Aluminiumbarren", key: "kat_aluminium" },
    ],
  },
  {
    label: "Dünger", key: "sidebar_duenger_kat",
    kategorien: [
      { id: "harnstoff", label: "Harnstoff / Stickstoff",  key: "kat_harnstoff" },
      { id: "dap",       label: "Phosphordünger (DAP)",     key: "kat_dap"       },
      { id: "mop",       label: "Kaliumdünger (MOP)",       key: "kat_mop"       },
      { id: "npk",       label: "NPK-Komplexdünger",        key: "kat_npk"       },
    ],
  },
];

// ─── Hilfsfunktion für einzelne Produktzeilen ─────────────────────────────────

let _uid = 0;
function p(name: string, w: string, norm: string, ofl: string, dim: number, l: number, preis: number, breite?: number): KatalogProdukt {
  return { id: `p${_uid++}`, name, werkstoff: w, norm, oberflaeche: ofl, dimension: dim, laenge: l, preisKg: preis, ...(breite != null ? { breite } : {}) };
}

// ─── Produkt-Datenbank ────────────────────────────────────────────────────────

const BETONSTAHL: KatalogProdukt[] = [
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",8,6000,0.88),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",10,6000,0.87),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",12,6000,0.86),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",14,6000,0.86),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",16,6000,0.85),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",20,6000,0.84),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",25,6000,0.84),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",28,6000,0.83),
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",32,6000,0.83),
  p("Betonstahl B500B","B500B","DIN 488","Blank",10,6000,0.86),
  p("Betonstahl B500B","B500B","DIN 488","Blank",12,6000,0.85),
  p("Betonstahl B500B","B500B","DIN 488","Blank",16,6000,0.84),
  p("Betonstahl B500B","B500B","DIN 488","Blank",20,6000,0.83),
  p("Betonstahl B500B","B500B","DIN 488","Blank",25,12000,0.84),
  p("Betonstahl B500B","B500B","DIN 488","Blank",32,12000,0.83),
];

const WALZDRAHT: KatalogProdukt[] = [
  p("Walzdraht SAE 1008","SAE 1008","EN 10016-2","Blank",5.5,Infinity,0.72),
  p("Walzdraht SAE 1008","SAE 1008","EN 10016-2","Blank",6.5,Infinity,0.72),
  p("Walzdraht SAE 1008","SAE 1008","EN 10016-2","Blank",8,Infinity,0.71),
  p("Walzdraht SAE 1008","SAE 1008","EN 10016-2","Blank",10,Infinity,0.71),
  p("Walzdraht SAE 1008","SAE 1008","EN 10016-2","Blank",12,Infinity,0.70),
  p("Walzdraht SAE 1008","SAE 1008","EN 10016-2","Blank",14,Infinity,0.70),
  p("Walzdraht DD11","DD11","EN 10016-2","Blank",8,Infinity,0.73),
  p("Walzdraht DD11","DD11","EN 10016-2","Blank",10,Infinity,0.73),
  p("Walzdraht DD11","DD11","EN 10016-2","Blank",12,Infinity,0.72),
];

const BLECH_WK: KatalogProdukt[] = [
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",2,2000,0.92,1000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",3,2000,0.90,1250),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",4,2000,0.89,1500),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",5,2000,0.88,1500),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",6,2000,0.87,2000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",8,2000,0.86,2000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",10,2000,0.86,2000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025-2","Walzhaut",12,2000,0.85,2000),
  p("Blech warmgewalzt S355JR","S355JR","EN 10025-2","Walzhaut",5,2000,1.02,1500),
  p("Blech warmgewalzt S355JR","S355JR","EN 10025-2","Walzhaut",8,2000,1.00,2000),
  p("Blech warmgewalzt S355JR","S355JR","EN 10025-2","Walzhaut",10,2000,0.99,2000),
  p("Blech warmgewalzt S355JR","S355JR","EN 10025-2","Walzhaut",12,2000,0.98,2000),
  p("Blech warmgewalzt S355JR","S355JR","EN 10025-2","Walzhaut",15,2000,0.97,2000),
  p("Blech warmgewalzt S355JR","S355JR","EN 10025-2","Walzhaut",20,2000,0.96,2000),
];

const BLECH_KK: KatalogProdukt[] = [
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Geölt",0.5,2500,1.08,1000),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Geölt",0.7,2500,1.06,1250),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Geölt",1.0,2500,1.05,1500),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Geölt",1.5,2500,1.04,1500),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Geölt",2.0,2500,1.03,1500),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Geölt",0.7,2500,1.18,1000),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Geölt",1.0,2500,1.16,1500),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Geölt",1.5,2500,1.14,1500),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Geölt",2.0,2500,1.12,1500),
];

const BLECH_VZ: KatalogProdukt[] = [
  p("Blech verzinkt DX51D+Z","DX51D+Z","EN 10346","Verzinkt Z100",0.5,2500,1.22,1000),
  p("Blech verzinkt DX51D+Z","DX51D+Z","EN 10346","Verzinkt Z100",0.7,2500,1.20,1250),
  p("Blech verzinkt DX51D+Z","DX51D+Z","EN 10346","Verzinkt Z100",1.0,2500,1.18,1250),
  p("Blech verzinkt DX51D+Z","DX51D+Z","EN 10346","Verzinkt Z100",1.5,2500,1.16,1500),
  p("Blech verzinkt DX51D+Z","DX51D+Z","EN 10346","Verzinkt Z100",2.0,2500,1.14,1500),
  p("Blech verzinkt DX53D","DX53D","EN 10346","Verzinkt Z140",0.7,2500,1.28,1000),
  p("Blech verzinkt DX53D","DX53D","EN 10346","Verzinkt Z140",1.0,2500,1.26,1250),
  p("Blech verzinkt DX53D","DX53D","EN 10346","Verzinkt Z275",1.5,2500,1.32,1500),
];

const TRAEGER: KatalogProdukt[] = [
  p("HEA 100 S235JR","S235JR","EN 10365","Walzhaut",100,12000,0.94),
  p("HEA 140 S235JR","S235JR","EN 10365","Walzhaut",140,12000,0.93),
  p("HEA 180 S235JR","S235JR","EN 10365","Walzhaut",180,12000,0.93),
  p("HEA 200 S235JR","S235JR","EN 10365","Walzhaut",200,12000,0.92),
  p("HEA 240 S235JR","S235JR","EN 10365","Walzhaut",240,12000,0.92),
  p("HEA 300 S355JR","S355JR","EN 10365","Walzhaut",300,12000,1.06),
  p("HEB 140 S235JR","S235JR","EN 10365","Walzhaut",140,12000,0.94),
  p("HEB 180 S235JR","S235JR","EN 10365","Walzhaut",180,12000,0.93),
  p("HEB 200 S235JR","S235JR","EN 10365","Walzhaut",200,12000,0.93),
  p("HEB 240 S355JR","S355JR","EN 10365","Walzhaut",240,12000,1.07),
  p("IPE 120 S235JR","S235JR","EN 10365","Walzhaut",120,12000,0.94),
  p("IPE 160 S235JR","S235JR","EN 10365","Walzhaut",160,12000,0.93),
  p("IPE 200 S235JR","S235JR","EN 10365","Walzhaut",200,12000,0.93),
  p("IPE 240 S235JR","S235JR","EN 10365","Walzhaut",240,12000,0.92),
  p("IPE 300 S355JR","S355JR","EN 10365","Walzhaut",300,12000,1.06),
  p("IPE 360 S355JR","S355JR","EN 10365","Walzhaut",360,12000,1.05),
];

const HOHLPROFILE: KatalogProdukt[] = [
  p("SHS 40×40 S235JRH","S235JRH","EN 10219","Walzhaut",40,6000,1.02),
  p("SHS 60×60 S235JRH","S235JRH","EN 10219","Walzhaut",60,6000,1.00),
  p("SHS 80×80 S235JRH","S235JRH","EN 10219","Walzhaut",80,6000,0.99),
  p("SHS 100×100 S235JRH","S235JRH","EN 10219","Walzhaut",100,6000,0.98),
  p("SHS 120×120 S355J2H","S355J2H","EN 10219","Walzhaut",120,6000,1.12),
  p("RHS 60×40 S235JRH","S235JRH","EN 10219","Walzhaut",60,6000,1.01,40),
  p("RHS 80×60 S235JRH","S235JRH","EN 10219","Walzhaut",80,6000,1.00,60),
  p("RHS 100×60 S235JRH","S235JRH","EN 10219","Walzhaut",100,6000,0.99,60),
  p("RHS 150×100 S355J2H","S355J2H","EN 10219","Walzhaut",150,12000,1.13,100),
  p("CHS 48,3 S235JRH","S235JRH","EN 10219","Walzhaut",48,6000,1.04),
  p("CHS 76,1 S235JRH","S235JRH","EN 10219","Walzhaut",76,6000,1.02),
  p("CHS 114,3 S235JRH","S235JRH","EN 10219","Walzhaut",114,6000,1.01),
];

const NAHTLOSROHR: KatalogProdukt[] = [
  p("Nahtlosrohr P235GH","P235GH","EN 10216-2","Blank",21.3,6000,1.48),
  p("Nahtlosrohr P235GH","P235GH","EN 10216-2","Blank",33.7,6000,1.45),
  p("Nahtlosrohr P235GH","P235GH","EN 10216-2","Blank",48.3,6000,1.42),
  p("Nahtlosrohr P235GH","P235GH","EN 10216-2","Blank",60.3,6000,1.40),
  p("Nahtlosrohr P235GH","P235GH","EN 10216-2","Blank",88.9,6000,1.38),
  p("Nahtlosrohr P235GH","P235GH","EN 10216-2","Blank",114.3,6000,1.36),
  p("Nahtlosrohr P265GH","P265GH","EN 10216-2","Blank",33.7,6000,1.55),
  p("Nahtlosrohr P265GH","P265GH","EN 10216-2","Blank",48.3,6000,1.52),
  p("Nahtlosrohr P265GH","P265GH","EN 10216-2","Blank",88.9,6000,1.50),
  p("Nahtlosrohr S355J2H","S355J2H","EN 10210-1","Blank",60.3,6000,1.42),
  p("Nahtlosrohr S355J2H","S355J2H","EN 10210-1","Blank",88.9,6000,1.40),
  p("Nahtlosrohr S355J2H","S355J2H","EN 10210-1","Blank",168.3,6000,1.38),
];

const SCHROTT: KatalogProdukt[] = [
  p("Stahlschrott HMS 1","HMS 1","ISRI 200","Pressiert",0,0,0.38),
  p("Stahlschrott HMS 2","HMS 2","ISRI 210","Pressiert",0,0,0.35),
  p("Schredder-Schrott ISRI 210","Schredder","ISRI 210","Geschreddert",0,0,0.36),
  p("Stahlschrott Neuschrott","Neuschrott","ISRI 240","Pressiert",0,0,0.42),
  p("Gussschrott Nr. 1","Guss","ISRI 278","Sortiert",0,0,0.32),
];

const KUPFER: KatalogProdukt[] = [
  p("Kupferkathode Grade A","Cu-CATH-1 · EN 1978","EN 1978","LME-konform",0,0,9.18),
  p("Kupferkathode Grade A (LME-Brand)","Cu-CATH-1 · EN 1978","EN 1978","LME-Registriert",0,0,9.20),
  p("Kupfer Walzdraht 8 mm (CCR)","Cu-ETP · EN 13599","EN 13599","Blank",8,0,9.45),
];

const ALUMINIUM: KatalogProdukt[] = [
  p("Aluminiumbarren EN AW-1050A (P1020)","EN AW-1050A","EN 573-3","LME-konform",0,0,2.48),
  p("Aluminiumbarren EN AW-1070A","EN AW-1070A","EN 573-3","LME-konform",0,0,2.52),
  p("Aluminiumbarren EN AW-6060 (T-Barren)","EN AW-6060","EN 573-3","Roh",0,0,2.85),
  p("Aluminium Schrottbarren (Sekundär)","Al Sek.","EN 1676","Rohblock",0,0,2.10),
];

const HARNSTOFF: KatalogProdukt[] = [
  p("Harnstoff 46% N Granulat","CO(NH₂)₂","EU-VO 2019/1009","Granulat",0,0,0.31),
  p("Harnstoff 46% N Prill","CO(NH₂)₂","EU-VO 2019/1009","Prill",0,0,0.30),
  p("Ammoniumnitrat 34,4% N","NH₄NO₃","EU-VO 2019/1009","Granulat",0,0,0.29),
];

const DAP: KatalogProdukt[] = [
  p("DAP 18-46 Granulat","(NH₄)₂HPO₄","EU-VO 2019/1009","Granulat",0,0,0.54),
  p("DAP 18-46 Big Bag","(NH₄)₂HPO₄","EU-VO 2019/1009","Granulat",0,0,0.55),
];

const MOP: KatalogProdukt[] = [
  p("Kaliumchlorid MOP 60% Granulat","KCl","EU-VO 2019/1009","Granulat",0,0,0.36),
  p("Kaliumchlorid MOP 60% Körnung","KCl","EU-VO 2019/1009","Körnung",0,0,0.37),
  p("Kaliumnitrat NOP 13-0-46","KNO₃","EU-VO 2019/1009","Granulat",0,0,0.72),
];

const NPK: KatalogProdukt[] = [
  p("NPK 15-15-15 Granulat","N-P₂O₅-K₂O","EU-VO 2019/1009","Granulat",0,0,0.41),
  p("NPK 20-10-10 Granulat","N-P₂O₅-K₂O","EU-VO 2019/1009","Granulat",0,0,0.39),
  p("NPK 8-20-30 Granulat","N-P₂O₅-K₂O","EU-VO 2019/1009","Granulat",0,0,0.44),
];

// ─── Katalog-Map ──────────────────────────────────────────────────────────────

export const KATALOG: Record<string, KatalogKategorie> = {
  "betonstahl":      { id: "betonstahl",      label: "Betonstahl",            dimLabel: "Ø mm",    dimUnit: "",      description: "Gerippter Bewehrungsstahl BSt 500S und B500B nach EN 10080 / DIN 488. Für Stahlbetonkonstruktionen und Hochbau.", produkte: BETONSTAHL },
  "walzdraht":       { id: "walzdraht",       label: "Walzdraht",             dimLabel: "Ø mm",    dimUnit: "",      description: "Walzdraht SAE 1008 / DD11 in Coil. Ausgangsmaterial für Zieherei, Netzherstellung und Betonstahlproduktion.", produkte: WALZDRAHT },
  "blech-warmgewalzt": { id: "blech-warmgewalzt", label: "Blech warmgewalzt", dimLabel: "Dicke mm", dimUnit: "",     description: "Warmgewalzte Bleche und Coils S235JR / S355JR nach EN 10025-2. Für Konstruktionsstahl, Maschinenbau, Schweißkonstruktionen.", produkte: BLECH_WK },
  "blech-kaltgewalzt": { id: "blech-kaltgewalzt", label: "Blech kaltgewalzt", dimLabel: "Dicke mm", dimUnit: "",    description: "Kaltgewalzte Bleche und Coils DC01–DC04 nach EN 10130. Für Automobilindustrie, Haushaltsgeräte und Verpackung.", produkte: BLECH_KK },
  "blech-verzinkt":  { id: "blech-verzinkt",  label: "Blech verzinkt",        dimLabel: "Dicke mm", dimUnit: "",     description: "Feuerverzinkte Bleche DX51D+Z / DX53D nach EN 10346. Für Bau, Lüftungstechnik und Trapezblechproduktion.", produkte: BLECH_VZ },
  "traeger":         { id: "traeger",         label: "Träger HEA/HEB/IPE",    dimLabel: "Höhe mm", dimUnit: "",      description: "Breitflansch- und I-Träger HEA, HEB, IPE in S235JR / S355JR nach EN 10365. Für Stahlbau und Hallenkonstruktionen.", produkte: TRAEGER },
  "hohlprofile":     { id: "hohlprofile",     label: "Hohlprofile",           dimLabel: "Höhe mm", dimUnit: "",      description: "Quadrat- (SHS), Rechteck- (RHS) und Rundhohlprofile (CHS) in S235JRH / S355J2H nach EN 10219 / EN 10210.", produkte: HOHLPROFILE },
  "nahtlosrohr":     { id: "nahtlosrohr",     label: "Nahtlosrohr",           dimLabel: "Ø mm",    dimUnit: "",      description: "Nahtlos gezogene Stahlrohre P235GH / P265GH (Druckbehälter) und S355J2H (Konstruktion) nach EN 10216-2 / EN 10210.", produkte: NAHTLOSROHR },
  "schrott":         { id: "schrott",         label: "Schrott",               dimLabel: "Größe",   dimUnit: "",      description: "Stahlschrott HMS 1/2 und Schredder-Schrott nach ISRI-Spezifikation. Für Elektrostahlwerke und Gießereien.", produkte: SCHROTT },
  "kupfer":          { id: "kupfer",          label: "Kupferkathoden",         dimLabel: "Güte",    dimUnit: "",      description: "Elektrolyt-Kupferkathoden Grade A (Cu-CATH-1) nach EN 1978. Min. 99,99 % Cu. LME-konforme Qualität.", produkte: KUPFER },
  "aluminium":       { id: "aluminium",       label: "Aluminiumbarren",        dimLabel: "Güte",    dimUnit: "",      description: "Primär-Aluminiumbarren EN AW-1050A (P1020) nach EN 573-3. LME-Spezifikation. CBAM-deklarationspflichtig ab 2026.", produkte: ALUMINIUM },
  "harnstoff":       { id: "harnstoff",       label: "Harnstoff / Stickstoff", dimLabel: "Form",    dimUnit: "",      description: "Harnstoff 46 % N (Granulat / Prill) und Ammoniumnitrat 34,4 % N. Konform mit EU-Düngemittelverordnung 2019/1009.", produkte: HARNSTOFF },
  "dap":             { id: "dap",             label: "Phosphordünger DAP",     dimLabel: "Form",    dimUnit: "",      description: "Diammoniumphosphat DAP 18-46 in Granulat. Phosphor-Stickstoff-Kombidünger. EU-VO 2019/1009 konform.", produkte: DAP },
  "mop":             { id: "mop",             label: "Kaliumdünger MOP/NOP",   dimLabel: "Form",    dimUnit: "",      description: "Kaliumchlorid MOP 60 % K₂O und Kaliumnitrat NOP 13-0-46. EU-Düngemittelverordnung 2019/1009 konform.", produkte: MOP },
  "npk":             { id: "npk",             label: "NPK-Komplexdünger",      dimLabel: "Formel",  dimUnit: "",      description: "NPK-Komplexdünger 15-15-15, 20-10-10, 8-20-30 in Granulat. Gleichmäßige Nährstoffverteilung. EU-VO 2019/1009 konform.", produkte: NPK },
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function getKategorie(id: string): KatalogKategorie | null {
  return KATALOG[id] ?? null;
}

export function formatPreis(kg: number): string {
  return kg === 0 ? "—" : new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(kg);
}

export function formatTonne(kg: number): string {
  if (kg === 0) return "—";
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(kg * 1000);
}

export function formatDim(d: number, unit: string): string {
  if (d === 0) return "—";
  return unit ? `${unit}${d}` : `${d}`;
}

export function formatLaenge(l: number): string {
  if (l === 0)        return "—";
  if (l === Infinity) return "Coil / variabel";
  return `${(l / 1000).toLocaleString("de-DE")} m`;
}

// Gruppierung nach katId für Dropdown (Key = katId, z.B. "betonstahl")
export function getTradeableByKat(): Map<string, TradeableProduct[]> {
  const map = new Map<string, TradeableProduct[]>();
  for (const p of TRADEABLE_PRODUCTS) {
    if (!map.has(p.katId)) map.set(p.katId, []);
    map.get(p.katId)!.push(p);
  }
  return map;
}
