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

// ─── Handelbare Produkte - einheitliche Quelle für Buyer & Seller ─────────────
// Jedes Element entspricht einem standardisierten Börsenprodukt.
// Buyer-Presets und Seller-Dropdown nutzen dieselbe Liste.

export type CbamGroupId =
  | "STEEL_PRIMARY"
  | "STEEL_PROCESSED"
  | "ALUMINIUM_UNWROUGHT"
  | "ALUMINIUM_PROCESSED";

export type TradeUnit = "TON" | "MWH" | "KG" | "LITER" | "BBL";

export interface TradeableProduct {
  id:        string;
  katId:     string;
  name:      string;        // Standardisierter Handelsname
  werkstoff: string;        // Güte / Material
  norm:      string;        // Norm(en)
  hsCode:    string;        // EU-Zollposition
  cbam:      CbamGroupId | null;
  inco:      string;        // Standard-Incoterms ("—" bei Energie/Strom)
  vat:       string;        // USt-Behandlung
  desc:      string;        // Beschreibung für Lot-Formular
  unit:      TradeUnit;     // Handelseinheit für Lot-Formular (TON | MWH | KG | LITER | BBL)
}

export const TRADEABLE_PRODUCTS: TradeableProduct[] = [
  // ── Stahl - Langprodukte ─────────────────────────────────────────────────────
  {
    id: "rebar-bst500", katId: "betonstahl",
    name: "Betonstahl BST 500 / B500B (Rebar)",
    werkstoff: "BST 500 / B500B", norm: "EN 10080 · DIN 488",
    hsCode: "7214 20 00", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Gerippter Betonstahl BST 500 / B500B, Ø 6-40 mm. Lieferung in Stäben 6 m oder 12 m. 3.1-Werkzeugnis nach EN 10204 erforderlich. Anwendung: Stahlbetonkonstruktionen, Hoch- und Tiefbau.",
  },
  {
    id: "walzdraht-sae1008", katId: "walzdraht",
    name: "Walzdraht SAE 1008 / DD11 (Wire Rod)",
    werkstoff: "SAE 1008 / DD11", norm: "EN 10016-2",
    hsCode: "7213 91 10", cbam: "STEEL_PROCESSED", inco: "EXW",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Walzdraht unlegiert, niedriggekohlter Stahl SAE 1008 / DD11. Coil, Ø 5,5-16 mm. Schmelzanalyse 3.1 nach EN 10204 erforderlich. Anwendung: Zieherei, Betonstahlproduktion, Netzherstellung.",
  },
  // ── Stahl - Flachprodukte ────────────────────────────────────────────────────
  {
    id: "blech-s235", katId: "blech-warmgewalzt",
    name: "Warmgewalztes Blech S235JR",
    werkstoff: "S235JR", norm: "EN 10025-2 · EN 10051",
    hsCode: "7208 51 20", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Warmgewalzte Bleche / Coils S235JR. Breite 600-2000 mm, Dicke 2-25 mm. 3.1-Zeugnis nach EN 10204 beizufügen. Anwendung: Konstruktionsstahl, Maschinenbau.",
  },
  {
    id: "blech-s355", katId: "blech-warmgewalzt",
    name: "Feinkornbaustahl S355JR / S355J2 (Blech)",
    werkstoff: "S355JR / S355J2", norm: "EN 10025-2",
    hsCode: "7208 51 91", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Warmgewalzte Feinkornbaustahl-Bleche S355JR / J2. Dicke 3-80 mm, Breite bis 3000 mm. 3.1-Werkzeugnis nach EN 10204. Anwendung: Brückenbau, Schweißkonstruktionen, Druckbehälter.",
  },
  {
    id: "blech-kalt-dc01", katId: "blech-kaltgewalzt",
    name: "Kaltgewalztes Blech DC01 / DC04",
    werkstoff: "DC01 / DC04", norm: "EN 10130",
    hsCode: "7209 15 00", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Kaltgewalzte Bleche / Coils DC01-DC04. Breite 600-1850 mm, Dicke 0,5-3 mm. Oberfläche A (geölt) oder B (blank). 3.1-Zeugnis nach EN 10204. Anwendung: Automobilindustrie, Haushaltsgeräte.",
  },
  {
    id: "blech-verzinkt-dx51d", katId: "blech-verzinkt",
    name: "Feuerverzinktes Blech DX51D+Z / DX53D",
    werkstoff: "DX51D+Z / DX53D", norm: "EN 10346",
    hsCode: "7210 49 00", cbam: "STEEL_PRIMARY", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Feuerverzinkte Bleche / Coils DX51D+Z oder DX53D. Zinkauflage Z100-Z275 g/m². Breite 600-1500 mm, Dicke 0,4-3 mm. 3.1-Zeugnis EN 10204. Anwendung: Bau, Lüftung, Trapezblechproduktion.",
  },
  // ── Stahl - Träger & Profile ─────────────────────────────────────────────────
  {
    id: "hea-heb-traeger", katId: "traeger",
    name: "Breitflanschträger HEA / HEB S235JR",
    werkstoff: "S235JR / S355JR", norm: "EN 10365 · EN 10025-2",
    hsCode: "7216 33 10", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Breitflanschträger HEA/HEB nach EN 10365, S235JR oder S355JR. Größen HEA 100-900, HEB 100-1000. 3.1-Werkzeugnis nach EN 10204. Anwendung: Stahlbau, Hallenkonstruktionen, Brückenbau.",
  },
  {
    id: "ipe-traeger", katId: "traeger",
    name: "IPE-Träger S235JR / S355JR",
    werkstoff: "S235JR / S355JR", norm: "EN 10365 · EN 10025-2",
    hsCode: "7216 31 10", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "I-Träger schmaler Flansch (IPE) nach EN 10365. Größen IPE 80-600, S235JR oder S355JR. 3.1-Zeugnis nach EN 10204. Anwendung: Hochbau, Kranbahnen, Industrie- und Lagerhallen.",
  },
  {
    id: "hohlprofile-s235jrh", katId: "hohlprofile",
    name: "Hohlprofile S235JRH - SHS / RHS / CHS",
    werkstoff: "S235JRH / S355J2H", norm: "EN 10219 · EN 10210",
    hsCode: "7306 61 10", cbam: "STEEL_PROCESSED", inco: "EXW",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Quadrat- (SHS), Rechteck- (RHS) und Rundhohlprofile (CHS), kalt- oder warmgefertigt. Wandstärke 2-16 mm. Normen: EN 10219, EN 10210. Anwendung: Stahlbau, Konstruktionsprofile, Maschinenbau.",
  },
  // ── Stahl - Rohre ────────────────────────────────────────────────────────────
  {
    id: "nahtlosrohr-p235gh", katId: "nahtlosrohr",
    name: "Nahtlosrohr P235GH / P265GH (Druckbehälter)",
    werkstoff: "P235GH / P265GH", norm: "EN 10216-2",
    hsCode: "7304 31 80", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Nahtlos gezogene Stahlrohre für Druckbehälter, P235GH / P265GH. Außendurchmesser 21,3-610 mm, Wandstärke 2-50 mm. Normen: EN 10216-2. 3.1-Prüfzeugnis nach EN 10204. Anwendung: Kraftwerke, Chemie, Energietechnik.",
  },
  {
    id: "nahtlosrohr-s355", katId: "nahtlosrohr",
    name: "Nahtlosrohr S355 / St52 (Konstruktion)",
    werkstoff: "S355J2H / St52", norm: "EN 10210-1",
    hsCode: "7304 39 51", cbam: "STEEL_PROCESSED", inco: "DAP",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Nahtlose Konstruktionsrohre S355J2H warm gefertigt. Außendurchmesser 33,7-610 mm. Normen: EN 10210-1. 3.1-Zeugnis nach EN 10204. Anwendung: Hochbau, Brückenbau, Maschinenbau.",
  },
  // ── Schrott ──────────────────────────────────────────────────────────────────
  {
    id: "schrott-hms12", katId: "schrott",
    name: "Stahlschrott HMS 1/2 (Heavy Melting Scrap)",
    werkstoff: "HMS 1/2", norm: "ISRI 200-212",
    hsCode: "7204 10 00", cbam: null, inco: "FOB",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Schwerer Stahlschrott HMS 1/2 nach ISRI-Spezifikation 200 / 210. Max. Abmessung 1500×500 mm. Feuchtigkeitsgehalt max. 1 %. Analyse: C ≤ 0,4 %, S ≤ 0,05 %. Sichtkontrolle bei Übernahme. Keine radioaktiven oder gefährlichen Materialien.",
  },
  {
    id: "schrott-schredder", katId: "schrott",
    name: "Schredder-Schrott (Shredded Scrap)",
    werkstoff: "Schredder / ISRI 210", norm: "ISRI 210",
    hsCode: "7204 49 10", cbam: null, inco: "FOB",
    vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)", unit: "TON",
    desc: "Aufbereiteter Schredder-Schrott ISRI 210. Schüttdichte mind. 1,0 t/m³. Kupfer ≤ 0,25 %, Chrom ≤ 0,25 %, Nickel ≤ 0,25 %. Analyse-Zertifikat beizufügen. Lieferung per Schiff, LKW oder Waggon.",
  },
  // ── NE-Metalle ───────────────────────────────────────────────────────────────
  {
    id: "kupfer-kathoden", katId: "kupfer",
    name: "Kupferkathoden Grade A (Cu-CATH-1)",
    werkstoff: "Cu-CATH-1 · min. 99,99 % Cu", norm: "EN 1978 Grade A",
    hsCode: "7403 11 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Elektrolyt-Kupferkathoden EN 1978 Grade A, Reinheit min. 99,99 % Cu. Standardkathode ca. 110-130 kg/Stück, palettiert. LME-konforme Qualität. Analysezertifikat und Ursprungsnachweis erforderlich.",
  },
  {
    id: "aluminium-p1020", katId: "aluminium",
    name: "Aluminiumbarren Primär EN AW-1050A (P1020)",
    werkstoff: "EN AW-1050A · Al min. 99,5 %", norm: "EN 573-3 · LME P1020",
    hsCode: "7601 10 00", cbam: "ALUMINIUM_UNWROUGHT", inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Primär-Aluminiumbarren EN AW-1050A (Al 99,5 %), T-Barren oder Masseln, LME-Spezifikation P1020. Analysezertifikat und Ursprungsnachweis erforderlich. CBAM-deklarationspflichtig ab 2026.",
  },
  // ── Dünger - Stickstoff ──────────────────────────────────────────────────────
  {
    id: "harnstoff-46", katId: "harnstoff",
    name: "Harnstoff 46 % N (Urea Prilled / Granular)",
    werkstoff: "CO(NH₂)₂ · 46 % N", norm: "EN 13654-1 · EU-VO 2019/1009",
    hsCode: "3102 10 10", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Harnstoff 46 % N in Prill- oder Granulat-Form. N-Gehalt min. 46 %. Biuret max. 1,2 %. Feuchtigkeitsgehalt max. 0,5 %. Lieferung in Big Bag (500/1000 kg) oder Schüttgut. Konformität mit EU-Düngemittelverordnung 2019/1009.",
  },
  {
    id: "ammoniumnitrat-34", katId: "harnstoff",
    name: "Ammoniumnitrat 34,4 % N (AN Granular)",
    werkstoff: "NH₄NO₃ · 34,4 % N", norm: "EN 13463 · EU-VO 2019/1009",
    hsCode: "3102 30 90", cbam: null, inco: "EXW",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Ammoniumnitrat-Dünger 34,4 % N, granuliert. Detonationssicherheitsprüfung nach Anhang III der Verordnung (EG) 2003/2003 erforderlich. Lieferung in Big Bag oder Schüttgut. ADR-Kennzeichnung. EU-VO 2019/1009 konform.",
  },
  // ── Dünger - Phosphor ────────────────────────────────────────────────────────
  {
    id: "dap-18-46", katId: "dap",
    name: "DAP 18-46 (Diammoniumphosphat)",
    werkstoff: "(NH₄)₂HPO₄ · 18 % N · 46 % P₂O₅", norm: "EN 13639 · EU-VO 2019/1009",
    hsCode: "3105 30 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Diammoniumphosphat DAP 18-46. N-Gehalt 18 %, P₂O₅ 46 %. Granulat, Körnung 2-5 mm. Schüttdichte ca. 0,9 t/m³. Lieferung in Big Bag 1.000 kg oder Schüttgut. EU-VO 2019/1009 konform, Herkunftsnachweis.",
  },
  // ── Dünger - Kalium ──────────────────────────────────────────────────────────
  {
    id: "mop-60", katId: "mop",
    name: "MOP / Kaliumchlorid 60 % K₂O (Muriate of Potash)",
    werkstoff: "KCl · 60 % K₂O", norm: "EN 13647 · EU-VO 2019/1009",
    hsCode: "3104 20 50", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Kaliumchlorid (MOP) mit 60 % K₂O. Granulat oder Körnung. Feuchtigkeitsgehalt max. 0,5 %. Lieferung in Big Bag (500/1000 kg) oder Schüttgut. EU-VO 2019/1009 konform. Nicht geeignet für chloridempfindliche Kulturen.",
  },
  {
    id: "kaliumnitrat-nop", katId: "mop",
    name: "Kaliumnitrat 13-0-46 (NOP - Nitrate of Potash)",
    werkstoff: "KNO₃ · 13 % N · 46 % K₂O", norm: "EN 13647 · EU-VO 2019/1009",
    hsCode: "3104 20 90", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Kaliumnitrat (NOP) 13-0-46. Chloridfreier Dünger für empfindliche Kulturen. Löslichkeit: 316 g/l bei 20 °C (geeignet für Fertigationsanlagen). Lieferung in 25 kg-Sack oder Big Bag. EU-VO 2019/1009 konform.",
  },
  // ── Dünger - NPK ────────────────────────────────────────────────────────────
  {
    id: "npk-15-15-15", katId: "npk",
    name: "NPK 15-15-15 Komplexdünger",
    werkstoff: "N-P₂O₅-K₂O 15-15-15", norm: "EN 14677 · EU-VO 2019/1009",
    hsCode: "3105 20 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "NPK-Komplexdünger 15-15-15. Granulat, Körnung 2-5 mm. Gleichmäßige Nährstoffverteilung im Granulat. Schüttdichte ca. 1,0 t/m³. Lieferung in Big Bag 500/1000 kg oder Schüttgut. EU-VO 2019/1009 konform.",
  },
  {
    id: "npk-20-10-10", katId: "npk",
    name: "NPK 20-10-10 Komplexdünger",
    werkstoff: "N-P₂O₅-K₂O 20-10-10", norm: "EN 14677 · EU-VO 2019/1009",
    hsCode: "3105 20 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "NPK-Komplexdünger 20-10-10. Stickstoffbetont für Getreide und Grünland. Granulat, Körnung 2-5 mm. Lieferung in Big Bag 1.000 kg oder Schüttgut. EU-VO 2019/1009 konform.",
  },
  {
    id: "npk-8-20-30", katId: "npk",
    name: "NPK 8-20-30 Komplexdünger",
    werkstoff: "N-P₂O₅-K₂O 8-20-30", norm: "EN 14677 · EU-VO 2019/1009",
    hsCode: "3105 20 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "NPK-Komplexdünger 8-20-30. Phosphor- und kaliumbetontes Verhältnis für Herbst-Grunddüngung. Lieferung in Big Bag 1.000 kg oder Schüttgut. EU-VO 2019/1009 konform.",
  },
  // ── Energie - Gas ────────────────────────────────────────────────────────────
  {
    id: "erdgas-ttf", katId: "erdgas",
    name: "Erdgas TTF / NCG (Natural Gas)",
    werkstoff: "Methan CH₄ ≥ 95 %", norm: "EN ISO 6976 · DVGW G 260",
    hsCode: "2711 21 00", cbam: null, inco: "TTF-Hub",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "MWH",
    desc: "Erdgas Qualität H (High Caloric), Lieferpunkt TTF (Title Transfer Facility) / NCG. Heizwert (Hi) ≥ 8,4 kWh/m³. Preis in EUR/MWh. Abwicklung über Bilanzkreisvertrag nach GasNZV. Gasbeschaffenheit nach DVGW G 260.",
  },
  {
    id: "lng-spot", katId: "erdgas",
    name: "LNG (Liquefied Natural Gas) — Spot",
    werkstoff: "Methan CH₄ verflüssigt", norm: "EN ISO 16903 · ISO 8217",
    hsCode: "2711 11 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "MWH",
    desc: "Verflüssigtes Erdgas (LNG) für Tanker-Lieferung. CH₄-Anteil ≥ 90 %, Wobbe-Index 46-56 MJ/m³. Preis in EUR/MWh. Tanker-Nomination 72h vor ETA. Herkunftszertifikat (CoO) erforderlich.",
  },
  // ── Energie - Strom ───────────────────────────────────────────────────────────
  {
    id: "strom-baseload", katId: "strom",
    name: "Baseload Strom DE/AT (Day-Ahead EPEX)",
    werkstoff: "Elektrische Energie", norm: "REMIT · MiFID II · EnWG",
    hsCode: "2716 00 00", cbam: null, inco: "EPEX-Spot",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "MWH",
    desc: "Baseload-Strom Lieferzone DE/AT. EPEX-Spot Day-Ahead, stündliche Blöcke 0-24 Uhr. Preis in EUR/MWh. Abnahme physisch oder finanziell. Bilanzkreisübergabe nach §20 StromNZV. REMIT-meldepflichtig. Mindest-Lot: 1 MWh.",
  },
  {
    id: "strom-peakload", katId: "strom",
    name: "Peakload Strom DE/AT (Mo-Fr 08-20 Uhr)",
    werkstoff: "Elektrische Energie", norm: "REMIT · MiFID II · EnWG",
    hsCode: "2716 00 00", cbam: null, inco: "EPEX-Spot",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "MWH",
    desc: "Peakload-Strom Lieferzone DE/AT, Lieferzeit Werktage Mo-Fr 08:00-20:00 Uhr. EPEX-Spot Day-Ahead. Preis in EUR/MWh. Abwicklung über Bilanzkreisvertrag §20 StromNZV. REMIT-meldepflichtig.",
  },
  // ── Energie - Kohle & Öl ─────────────────────────────────────────────────────
  {
    id: "steinkohle-steam", katId: "kohle",
    name: "Kesselkohle API 2 (Steam Coal CIF ARA)",
    werkstoff: "Kesselkohle / Dampfkohle", norm: "ASTM D3173 · ISO 11722",
    hsCode: "2701 12 10", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Thermische Kohle (Steam Coal) API 2-Index-Qualität. Heizwert NAR ≥ 6.000 kcal/kg (25,1 GJ/t). Aschegehalt ≤ 15 %, Schwefel ≤ 1 %. Lieferung CIF ARA-Häfen (Amsterdam, Rotterdam, Antwerpen). Panamax-Ladung min. 50.000 t.",
  },
  {
    id: "rohoel-brent", katId: "rohol",
    name: "Rohöl Brent Crude (ICE Dated Brent)",
    werkstoff: "Leichtes Nordseeöl", norm: "ASTM D4294 · ISO 3171",
    hsCode: "2709 00 10", cbam: null, inco: "FOB",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "BBL",
    desc: "Brent Crude Oil, Nordsee-Qualität. API-Dichte ≥ 38° API, Schwefelgehalt ≤ 0,37 % (Sweet Crude). Preis in USD/bbl, Lot min. 1.000 bbl. Lieferung FOB Sullom Voe oder Hound Point. ICE Dated Brent-Referenz. ISDA-Master-Agreement erforderlich.",
  },
  {
    id: "lpg-propan", katId: "lpg",
    name: "LPG Propan HD5 / Butan (Autogas)",
    werkstoff: "Propan C₃H₈ ≥ 95 %", norm: "EN 589 · ASTM 1835",
    hsCode: "2711 12 91", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Flüssiggas Propan HD5 (≥ 95 % C₃H₈) für Industrie und Heizung. Feuchtegehalt: trocken nach EN 589. Lieferung in Tankwagen (20 t) oder per Pipeline-Einspeisung. Preis in EUR/t. Lagerung unter Druck (8 bar bei 20°C).",
  },
  // ── Agrar - Getreide ─────────────────────────────────────────────────────────
  {
    id: "weizen-brotweizen", katId: "weizen",
    name: "Brotweizen Qualität A (Mahl-Weizen EU)",
    werkstoff: "Triticum aestivum L.", norm: "EU-VO 1272/2009 · DIN 10355",
    hsCode: "1001 99 00", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Brotweizen Qualität A. Feuchte ≤ 14,5 %, Fallzahl ≥ 220 s, Protein ≥ 12,5 %, Feuchtkleber ≥ 23 %, Sedimentationswert (Zeleniy) ≥ 22 ml. Frei von Mutterkorn (< 0,05 %). Phytosanitäres Zeugnis + HK-Bescheinigung. MATIF-Notierung Paris.",
  },
  {
    id: "weizen-futterweizen", katId: "weizen",
    name: "Futterweizen E-Qualität (Feed Wheat)",
    werkstoff: "Triticum aestivum L.", norm: "EU-VO 1272/2009",
    hsCode: "1001 99 00", cbam: null, inco: "EXW",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Futterweizen Standardqualität. Feuchte ≤ 15,5 %, Fallzahl ≥ 120 s, Besatz ≤ 2 %. Lieferung in Bulk (Lkw 24 t oder Bahn 60 t). Abnahme-Inspektion nach SGS/Bureau Veritas. MATIF-Preisorientierung.",
  },
  {
    id: "gerste-futtergerste", katId: "gerste",
    name: "Futtergerste (Feed Barley)",
    werkstoff: "Hordeum vulgare L.", norm: "EU-VO 1272/2009",
    hsCode: "1003 90 00", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Futtergerste, Standardqualität EU. Feuchte ≤ 14,5 %, Besatz ≤ 2 %, Hektolitergewicht ≥ 62 kg/hl. Lieferung in Bulk, min. 500 t. Phytosanitäres Zeugnis für Export. Preis in EUR/t CIF Nordseehafen.",
  },
  {
    id: "mais-koernermais", katId: "mais",
    name: "Körnermais (Corn / Maize EU)",
    werkstoff: "Zea mays L.", norm: "EU-VO 1272/2009 · ISTA",
    hsCode: "1005 90 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Körnermais, Standardqualität. Feuchte ≤ 14 %, Besatz ≤ 2 %, Bruchkorn ≤ 3 %. GMO-Status angabe (GVO-frei oder zugelassene GVO). CBOT-Chicago-Referenzpreis. Lieferung CIF Rotterdam/Hamburg. Phytosanitäres Zeugnis.",
  },
  {
    id: "sojabohnen-eu", katId: "soja",
    name: "Sojabohnen (Soybeans EU-Qualität)",
    werkstoff: "Glycine max (L.) Merr.", norm: "EU-VO 767/2009 · ISO 659",
    hsCode: "1201 90 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Sojabohnen, Futtermittelqualität. Feuchte ≤ 13 %, Protein ≥ 36 % (TM), Rohfett ≥ 18 % (TM), Ureasen 0,05-0,2 mg N/g·min. GVO-Zulassung nach EU-VO 1829/2003 anzugeben. CBOT-Referenz. Lieferung CIF Rotterdam.",
  },
  {
    id: "raps-rapssamen", katId: "raps",
    name: "Rapssamen (Rapeseed / Canola EU)",
    werkstoff: "Brassica napus L.", norm: "EU-VO 1272/2009 · EN ISO 658",
    hsCode: "1205 10 90", cbam: null, inco: "EXW",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Rapssamen Standardqualität. Feuchte ≤ 9 %, Erucasäure ≤ 2 %, Glucosinolate ≤ 25 µmol/g (TM). EURONEXT-Paris-Notierung (Matif Colza). Lieferung in Bulk ab Lager oder CIF Nordseehäfen. Nachhaltigkeitszertifikat (ISCC) auf Anfrage.",
  },
  // ── Agrar - Ölsaaten / Zucker ───────────────────────────────────────────────
  {
    id: "sonnenblumenoel-roh", katId: "sonnenblume",
    name: "Rohes Sonnenblumenöl (Sunflower Oil — Crude)",
    werkstoff: "Helianthus annuus L.", norm: "Codex Alimentarius Stan 23 · EU-VO 1308/2013",
    hsCode: "1512 11 91", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 7 % (Nahrungsmittel)", unit: "TON",
    desc: "Rohes Sonnenblumenöl, hoch-ölsäurehaltig (High-Oleic ≥ 82 % oder Standard). Säurezahl ≤ 2,5 mg KOH/g, Feuchte ≤ 0,1 %. Lieferung in ISO-Tank oder Flexi-Tank. Herkunft UA/RO/MD. Zertifiziertes Analysenlabor (SGS/Intertek).",
  },
  // ── Chemie - Alkohole ────────────────────────────────────────────────────────
  {
    id: "methanol-tech", katId: "methanol",
    name: "Methanol technisch (CH₃OH ≥ 99,85 %)",
    werkstoff: "Methanol CH₃OH", norm: "EN 15989 · ASTM D1152",
    hsCode: "2905 11 00", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Technisches Methanol Reinheit ≥ 99,85 % (Spezifikation nach EN 15989, Grad AA). Wasser ≤ 100 ppm, Acetongehalt ≤ 30 ppm. Lieferung in ISO-Tank 20 ft oder Kesselwagen. ADR-Klasse 3, UN 1230. Sicherheitsdatenblatt (SDS) beigestellt.",
  },
  {
    id: "ethanol-99", katId: "ethanol",
    name: "Ethanol technisch 99,5 % (Bioethanol)",
    werkstoff: "Ethanol C₂H₅OH", norm: "EN 15376 · DIN 51627-2",
    hsCode: "2207 10 00", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Bioethanol Reinheit ≥ 99,5 % Vol., konform mit EN 15376 (Kraftstoffzusatz) und DIN 51627-2. Wassergehalt ≤ 0,3 %. Lieferung in ISO-Tank oder Tankwagen. ADR Klasse 3, UN 1170. Herkunftsdokument (ISCC oder RED II) für Nachhaltigkeitsnachweis.",
  },
  // ── Chemie - Anorganik ───────────────────────────────────────────────────────
  {
    id: "schwefelsaeure-96", katId: "saeuren",
    name: "Schwefelsäure 96-98 % (H₂SO₄ — Industriequalität)",
    werkstoff: "Schwefelsäure H₂SO₄", norm: "EN ISO 2469 · DIN 19522",
    hsCode: "2807 00 10", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Technische Schwefelsäure Konzentration 96-98 %. Fe-Gehalt ≤ 50 mg/kg, Chloride ≤ 5 mg/kg. Lieferung in säurebeständigen Tankwagen (25-30 t) oder ISO-Tank. ADR-Klasse 8, UN 1830. Vorbefüllung nach Kundenspezifikation. REACH-Registrierung.",
  },
  {
    id: "natronlauge-50", katId: "laugen",
    name: "Natronlauge 50 % (NaOH — Chloralkali-Elektrolyse)",
    werkstoff: "Natriumhydroxid NaOH", norm: "EN 896 · ISO 792",
    hsCode: "2815 12 00", cbam: null, inco: "DAP",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Natronlauge (Ätznatron) 50 % NaOH. NaCl ≤ 100 mg/kg, Fe ≤ 5 mg/kg. Chloralkali-Elektrolyse-Qualität. Lieferung in Tankwagen (20-30 t) oder ISO-Tank. ADR-Klasse 8, UN 1824. Rückkaufvereinbarung leere Tanker nach Absprache.",
  },
  {
    id: "salzsaeure-32", katId: "saeuren",
    name: "Salzsäure 32-35 % (HCl — synthetisch)",
    werkstoff: "Chlorwasserstoff HCl", norm: "EN 939 · ISO 756",
    hsCode: "2806 10 00", cbam: null, inco: "EXW",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Synthetische Salzsäure 32-35 % HCl. Eisengehalt ≤ 2 mg/kg, Schwefelsäure ≤ 5 mg/kg. Einsatz: Beizereien, Lebensmittelverarbeitung, Wasseraufbereitung. Lieferung in 25/1000 L-IBC oder Tankwagen. ADR-Klasse 8, UN 1789. SDS vorhanden.",
  },
  {
    id: "ammoniak-anhydrous", katId: "ammoniak",
    name: "Ammoniak wasserfreies (NH₃ — Anhydrous Ammonia)",
    werkstoff: "Ammoniak NH₃ ≥ 99,5 %", norm: "EN 1385 · ASTM E228",
    hsCode: "2814 10 00", cbam: null, inco: "CIF",
    vat: "Umsatzsteuer 19 % (Regelbesteuerung)", unit: "TON",
    desc: "Wasserfreies Ammoniak (Anhydrous Ammonia), Reinheit ≥ 99,5 %. Wassergehalt ≤ 0,2 %, Öl ≤ 5 mg/kg. Lieferung in Drucktank-Schiffen (5.000-30.000 t) oder Drucktankwagen. ADR-Klasse 2.3, UN 1005. Seefrachtroute: Baltic/Black Sea/ARA.",
  },
];

// ─── Sidebar Struktur ─────────────────────────────────────────────────────────

export const SIDEBAR: SidebarSektion[] = [
  {
    label: "Stahl - Langprodukte", key: "sidebar_stahl_lang",
    kategorien: [
      { id: "betonstahl",       label: "Betonstahl",            key: "kat_betonstahl"       },
      { id: "walzdraht",        label: "Walzdraht",             key: "kat_walzdraht"        },
    ],
  },
  {
    label: "Stahl - Flachprodukte", key: "sidebar_stahl_flach",
    kategorien: [
      { id: "blech-warmgewalzt", label: "Blech warmgewalzt",   key: "kat_blech_warmgewalzt" },
      { id: "blech-kaltgewalzt", label: "Blech kaltgewalzt",   key: "kat_blech_kaltgewalzt" },
      { id: "blech-verzinkt",    label: "Blech verzinkt",      key: "kat_blech_verzinkt"    },
    ],
  },
  {
    label: "Stahl - Träger & Profile", key: "sidebar_stahl_traeger",
    kategorien: [
      { id: "traeger",      label: "Träger (HEA/HEB/IPE)", key: "kat_traeger"      },
      { id: "hohlprofile",  label: "Hohlprofile",          key: "kat_hohlprofile"  },
    ],
  },
  {
    label: "Stahl - Rohre", key: "sidebar_stahl_rohre",
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
  {
    label: "Energie", key: "sidebar_energie",
    kategorien: [
      { id: "erdgas", label: "Erdgas / LNG",          key: "kat_erdgas" },
      { id: "strom",  label: "Strom (Baseload/Peak)", key: "kat_strom"  },
      { id: "kohle",  label: "Kesselkohle (API 2)",   key: "kat_kohle"  },
      { id: "rohol",  label: "Rohöl (Brent)",         key: "kat_rohol"  },
      { id: "lpg",    label: "LPG / Autogas",         key: "kat_lpg"    },
    ],
  },
  {
    label: "Agrar", key: "sidebar_agrar",
    kategorien: [
      { id: "weizen",       label: "Weizen",            key: "kat_weizen"       },
      { id: "gerste",       label: "Gerste",            key: "kat_gerste"       },
      { id: "mais",         label: "Mais",              key: "kat_mais"         },
      { id: "soja",         label: "Sojabohnen",        key: "kat_soja"         },
      { id: "raps",         label: "Rapssamen",         key: "kat_raps"         },
      { id: "sonnenblume",  label: "Sonnenblumenöl",    key: "kat_sonnenblume"  },
    ],
  },
  {
    label: "Chemikalien", key: "sidebar_chemie",
    kategorien: [
      { id: "methanol",  label: "Methanol",       key: "kat_methanol"  },
      { id: "ethanol",   label: "Ethanol",        key: "kat_ethanol"   },
      { id: "saeuren",   label: "Säuren (H₂SO₄/HCl)", key: "kat_saeuren" },
      { id: "laugen",    label: "Laugen (NaOH)",  key: "kat_laugen"    },
      { id: "ammoniak",  label: "Ammoniak (NH₃)", key: "kat_ammoniak"  },
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

const ERDGAS: KatalogProdukt[] = [
  // preisKg = EUR/MWh (Referenzpreis; Label in KATALOG: "EUR/MWh")
  p("Erdgas H-Gas (TTF)", "CH₄ ≥ 95 %", "DVGW G 260", "TTF-Hub", 0, 0, 32.0),
  p("LNG Spot-Lieferung", "CH₄ verflüssigt", "EN ISO 16903", "CIF ARA", 0, 0, 38.0),
];

const STROM: KatalogProdukt[] = [
  // preisKg = EUR/MWh (Referenzpreis; Label in KATALOG: "EUR/MWh")
  p("Baseload DE/AT (0-24 Uhr)", "Elektrische Energie", "REMIT · EnWG", "EPEX-Spot", 0, 0, 90.0),
  p("Peakload DE/AT (8-20 Uhr)", "Elektrische Energie", "REMIT · EnWG", "EPEX-Spot", 0, 0, 110.0),
];

const KOHLE: KatalogProdukt[] = [
  p("Kesselkohle API 2 CIF ARA", "Dampfkohle NAR 6000", "ASTM D3173", "Bulk", 0, 0, 0.128),
  p("Kokskohle Premium Hard (HCC)", "Kokskohle CSR ≥ 68", "ISO 18283", "Bulk", 0, 0, 0.245),
];

const ROHOL: KatalogProdukt[] = [
  p("Rohöl Brent Crude FOB", "API ≥ 38°, S ≤ 0,37 %", "ASTM D4294", "Tankschiff", 0, 0, 0.560),
  p("Rohöl Urals (ESPO) CIF", "API 31-33°, S 1,7 %", "GOST 51858", "Tankschiff", 0, 0, 0.520),
];

const LPG: KatalogProdukt[] = [
  p("Propan HD5 (≥ 95 % C₃H₈)", "C₃H₈ ≥ 95 %", "EN 589", "Drucktank", 0, 0, 0.620),
  p("Butan (n-Butan C₄H₁₀)", "C₄H₁₀ ≥ 97 %", "EN 589", "Drucktank", 0, 0, 0.600),
];

const WEIZEN: KatalogProdukt[] = [
  p("Brotweizen A-Qualität (Ø)", "Triticum aestivum", "EU-VO 1272/2009", "Bulk", 0, 0, 0.248),
  p("Futterweizen E-Qualität", "Triticum aestivum", "EU-VO 1272/2009", "Bulk", 0, 0, 0.218),
  p("Durumweizen (Hartweizen)", "Triticum durum", "Codex Stan 178", "Bulk", 0, 0, 0.310),
];

const GERSTE: KatalogProdukt[] = [
  p("Futtergerste Standardqualität", "Hordeum vulgare", "EU-VO 1272/2009", "Bulk", 0, 0, 0.205),
  p("Braugerste (Sommergerste)", "Hordeum distichon", "MEBAK · EBC", "Bulk", 0, 0, 0.265),
];

const MAIS: KatalogProdukt[] = [
  p("Körnermais (GMO-frei Zertif.)", "Zea mays L.", "EU-VO 1272/2009", "Bulk", 0, 0, 0.225),
  p("Körnermais (zugelassene GVO)", "Zea mays L.", "EU-VO 1272/2009", "Bulk", 0, 0, 0.212),
];

const SOJA: KatalogProdukt[] = [
  p("Sojabohnen (GMO-frei Zertif.)", "Glycine max L.", "ISO 659", "Bulk", 0, 0, 0.492),
  p("Sojaschrot 44 % Protein (Toasted)", "Sojaextraktionsschrot", "EU-VO 767/2009", "Bulk", 0, 0, 0.410),
];

const RAPS: KatalogProdukt[] = [
  p("Rapssamen (000-Qualität)", "Brassica napus L.", "EN ISO 658", "Bulk", 0, 0, 0.488),
  p("Rapsöl (Rohöl, Crude)", "Rapsöl", "Codex Stan 123", "Bulk", 0, 0, 1.050),
];

const SONNENBLUME: KatalogProdukt[] = [
  p("Rohes Sonnenblumenöl", "Helianthus annuus", "Codex Stan 23", "ISO-Tank", 0, 0, 0.978),
  p("Raffiniertes Sonnenblumenöl", "Helianthus annuus", "Codex Stan 23", "ISO-Tank", 0, 0, 1.150),
];

const METHANOL: KatalogProdukt[] = [
  p("Methanol Grade AA (≥ 99,85 %)", "CH₃OH", "EN 15989", "ISO-Tank", 0, 0, 0.385),
  p("Methanol tech. Grade (≥ 99,5 %)", "CH₃OH", "ASTM D1152", "Tankwagen", 0, 0, 0.365),
];

const ETHANOL: KatalogProdukt[] = [
  p("Bioethanol 99,5 % (EN 15376)", "C₂H₅OH", "EN 15376", "ISO-Tank", 0, 0, 0.680),
  p("Ethanol 96 % (Lebensmittelgrade)", "C₂H₅OH", "EU-VO 178/2002", "IBC", 0, 0, 0.720),
];

const SAEUREN: KatalogProdukt[] = [
  p("Schwefelsäure 96-98 %", "H₂SO₄", "EN ISO 2469", "Säuretank", 0, 0, 0.095),
  p("Schwefelsäure 98 % (Oleum)", "H₂SO₄ + SO₃", "EN ISO 2469", "Säuretank", 0, 0, 0.110),
  p("Salzsäure 32-35 %", "HCl", "EN 939", "IBC/Tankwagen", 0, 0, 0.140),
];

const LAUGEN: KatalogProdukt[] = [
  p("Natronlauge 50 % (Chloralkali)", "NaOH", "EN 896", "Tankwagen", 0, 0, 0.235),
  p("Natronlauge 32 % (techn.)", "NaOH", "EN 896", "IBC", 0, 0, 0.195),
  p("Kalilauge 45-50 % (KOH)", "KOH", "ISO 7108", "Tankwagen", 0, 0, 0.480),
];

const AMMONIAK: KatalogProdukt[] = [
  p("Ammoniak wasserfreies (99,5 %)", "NH₃", "EN 1385", "Drucktank", 0, 0, 0.310),
  p("Ammoniaklösung 25 % (tech.)", "NH₃ · H₂O", "EN 939", "IBC/Tankwagen", 0, 0, 0.165),
];

// ─── Katalog-Map ──────────────────────────────────────────────────────────────

export const KATALOG: Record<string, KatalogKategorie> = {
  "betonstahl":      { id: "betonstahl",      label: "Betonstahl",            dimLabel: "Ø mm",    dimUnit: "",      description: "Gerippter Bewehrungsstahl BSt 500S und B500B nach EN 10080 / DIN 488. Für Stahlbetonkonstruktionen und Hochbau.", produkte: BETONSTAHL },
  "walzdraht":       { id: "walzdraht",       label: "Walzdraht",             dimLabel: "Ø mm",    dimUnit: "",      description: "Walzdraht SAE 1008 / DD11 in Coil. Ausgangsmaterial für Zieherei, Netzherstellung und Betonstahlproduktion.", produkte: WALZDRAHT },
  "blech-warmgewalzt": { id: "blech-warmgewalzt", label: "Blech warmgewalzt", dimLabel: "Dicke mm", dimUnit: "",     description: "Warmgewalzte Bleche und Coils S235JR / S355JR nach EN 10025-2. Für Konstruktionsstahl, Maschinenbau, Schweißkonstruktionen.", produkte: BLECH_WK },
  "blech-kaltgewalzt": { id: "blech-kaltgewalzt", label: "Blech kaltgewalzt", dimLabel: "Dicke mm", dimUnit: "",    description: "Kaltgewalzte Bleche und Coils DC01-DC04 nach EN 10130. Für Automobilindustrie, Haushaltsgeräte und Verpackung.", produkte: BLECH_KK },
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
  "erdgas":          { id: "erdgas",          label: "Erdgas / LNG",           dimLabel: "EUR/MWh", dimUnit: "MWh",  description: "Erdgas TTF/NCG H-Gas und LNG Spot-Lieferung. Qualität nach DVGW G 260 und EN ISO 16903. Preis in EUR/MWh.", produkte: ERDGAS },
  "strom":           { id: "strom",           label: "Strom Baseload/Peakload", dimLabel: "EUR/MWh", dimUnit: "MWh", description: "Baseload- und Peakload-Strom Lieferzone DE/AT. EPEX-Spot Day-Ahead. Physische Lieferung nach StromNZV. REMIT-meldepflichtig.", produkte: STROM },
  "kohle":           { id: "kohle",           label: "Kesselkohle / Kokskohle", dimLabel: "EUR/t",  dimUnit: "t",    description: "Thermische Kohle (API 2 CIF ARA) und Kokskohle Hard Coking Quality. Lieferung in Bulk, Panamax-Lots.", produkte: KOHLE },
  "rohol":           { id: "rohol",           label: "Rohöl (Brent / Urals)",  dimLabel: "EUR/bbl", dimUnit: "bbl",  description: "Rohöl Brent Crude (ICE Dated Brent) und Urals. Lieferung FOB / CIF. Preis in EUR/bbl.", produkte: ROHOL },
  "lpg":             { id: "lpg",             label: "LPG / Flüssiggas",       dimLabel: "Güte",    dimUnit: "",      description: "Flüssiggas Propan HD5 und Butan in Drucktanklieferung. Spezifikation nach EN 589.", produkte: LPG },
  "weizen":          { id: "weizen",          label: "Weizen",                 dimLabel: "Qualität", dimUnit: "",     description: "Brot- und Futterweizen EU-Standardqualität nach EU-VO 1272/2009. Preis in EUR/t. MATIF-Referenznotierung Paris.", produkte: WEIZEN },
  "gerste":          { id: "gerste",          label: "Gerste",                 dimLabel: "Qualität", dimUnit: "",     description: "Futter- und Braugerste EU-Qualität. Lieferung in Bulk. EURONEXT Paris Matif-Referenz.", produkte: GERSTE },
  "mais":            { id: "mais",            label: "Mais / Körnermais",      dimLabel: "Qualität", dimUnit: "",     description: "Körnermais (GMO-frei oder zugelassene GVO) EU-Standardqualität. CBOT Chicago-Referenz. Lieferung CIF Nordseehäfen.", produkte: MAIS },
  "soja":            { id: "soja",            label: "Sojabohnen / Sojaschrot", dimLabel: "Qualität", dimUnit: "",    description: "Sojabohnen und Sojaextraktionsschrot 44 % Protein. CBOT-Referenz. Phytosanitäres Zeugnis + GVO-Nachweis.", produkte: SOJA },
  "raps":            { id: "raps",            label: "Rapssamen / Rapsöl",     dimLabel: "Qualität", dimUnit: "",     description: "Rapssamen 000-Qualität (niedrige Erucasäure) und Rohöl. EURONEXT Matif Colza-Referenz. ISCC-Nachhaltigkeitszertifikat.", produkte: RAPS },
  "sonnenblume":     { id: "sonnenblume",     label: "Sonnenblumenöl",         dimLabel: "Güte",    dimUnit: "",      description: "Rohes und raffiniertes Sonnenblumenöl (High-Oleic). Lieferung in ISO-Tank. Herkunft UA/RO/MD. Analysenzertifikat SGS.", produkte: SONNENBLUME },
  "methanol":        { id: "methanol",        label: "Methanol",               dimLabel: "Güte",    dimUnit: "",      description: "Technisches Methanol Grade AA (≥ 99,85 %) nach EN 15989. ISO-Tank oder Tankwagen. ADR Klasse 3.", produkte: METHANOL },
  "ethanol":         { id: "ethanol",         label: "Ethanol / Bioethanol",   dimLabel: "Güte",    dimUnit: "",      description: "Bioethanol 99,5 % (EN 15376) und Lebensmittelgrade 96 %. Nachhaltigkeitsnachweis RED II / ISCC möglich.", produkte: ETHANOL },
  "saeuren":         { id: "saeuren",         label: "Säuren (H₂SO₄/HCl)",    dimLabel: "Konz.",   dimUnit: "%",     description: "Schwefelsäure 96-98 % (EN ISO 2469) und Salzsäure 32-35 % (EN 939). ADR-Klasse 8. Lieferung in Säuretankwagen.", produkte: SAEUREN },
  "laugen":          { id: "laugen",          label: "Laugen (NaOH/KOH)",     dimLabel: "Konz.",   dimUnit: "%",     description: "Natronlauge 50 % und 32 % (EN 896) sowie Kalilauge 45-50 % (ISO 7108). Chloralkali-Elektrolyse-Qualität.", produkte: LAUGEN },
  "ammoniak":        { id: "ammoniak",        label: "Ammoniak (NH₃)",         dimLabel: "Güte",    dimUnit: "",      description: "Wasserfreies Ammoniak 99,5 % (EN 1385) und Ammoniaklösung 25 % tech. ADR 2.3. Tankschiff oder Drucktankwagen.", produkte: AMMONIAK },
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function getKategorie(id: string): KatalogKategorie | null {
  return KATALOG[id] ?? null;
}

export function formatPreis(kg: number): string {
  return kg === 0 ? "-" : new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(kg);
}

export function formatTonne(kg: number): string {
  if (kg === 0) return "-";
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(kg * 1000);
}

export function formatDim(d: number, unit: string): string {
  if (d === 0) return "-";
  return unit ? `${unit}${d}` : `${d}`;
}

export function formatLaenge(l: number): string {
  if (l === 0)        return "-";
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
