// ─── Typen ────────────────────────────────────────────────────────────────────

export interface KatalogProdukt {
  id:          string;
  name:        string;
  werkstoff:   string;
  norm:        string;
  oberflaeche: string;
  dimension:   number;    // Hauptmaß in mm (Ø, Dicke, Höhe, Seite)
  breite?:     number;    // Sekundärmaß mm (Flachstahl, Blech)
  laenge:      number;    // mm
  preisKg:     number;    // €/kg indikativ
}

export interface KatalogKategorie {
  id:         string;
  label:      string;
  dimLabel:   string;     // "Ø mm" | "Dicke mm" | "Höhe mm" | "Größe"
  dimUnit:    string;     // prefix for display: "" | "M" | "IPE " | "HEA "
  description: string;
  produkte:   KatalogProdukt[];
}

export interface SidebarSektion {
  label:      string;
  key:        string;
  kategorien: { id: string; label: string; key: string }[];
}

// ─── Sidebar Struktur (alle 42 Kategorien) ────────────────────────────────────

export const SIDEBAR: SidebarSektion[] = [
  {
    label: "Stabstahl", key: "sidebar_stabstahl",
    kategorien: [
      { id: "betonstahl",   label: "Betonstahl",          key: "kat_betonstahl" },
      { id: "rundstahl",    label: "Rundstahl",            key: "kat_rundstahl" },
      { id: "vierkant",     label: "Vierkant",             key: "kat_vierkant" },
      { id: "sechskant",    label: "Sechskant",            key: "kat_sechskant" },
      { id: "flachstahl",   label: "Flachstahl",           key: "kat_flachstahl" },
      { id: "walzdraht",    label: "Walzdraht",            key: "kat_walzdraht" },
    ],
  },
  {
    label: "Träger & Profile", key: "sidebar_traeger_profile",
    kategorien: [
      { id: "traeger",             label: "Träger (IPE/HEA/HEB)", key: "kat_traeger" },
      { id: "t-traeger",           label: "T-Träger",             key: "kat_t_traeger" },
      { id: "winkelstahl",         label: "Winkelstahl",          key: "kat_winkelstahl" },
      { id: "u-profile",           label: "U-Profile",            key: "kat_u_profile" },
      { id: "leichtstahlprofile",  label: "Leichtstahlprofile",   key: "kat_leichtstahlprofile" },
      { id: "trockenbauprofile",   label: "Trockenbauprofile",    key: "kat_trockenbauprofile" },
    ],
  },
  {
    label: "Rohre", key: "sidebar_rohre",
    kategorien: [
      { id: "nahtlosrohr",        label: "Nahtlosrohr",       key: "kat_nahtlosrohr" },
      { id: "geschweisstes-rohr", label: "Geschweißtes Rohr", key: "kat_geschweisstes_rohr" },
      { id: "quadratrohr",        label: "Quadratrohr",       key: "kat_quadratrohr" },
      { id: "rechteckrohr",       label: "Rechteckrohr",      key: "kat_rechteckrohr" },
      { id: "ovalrohr",           label: "Ovalrohr",          key: "kat_ovalrohr" },
      { id: "sonderrohre",        label: "Sonderrohre",       key: "kat_sonderrohre" },
    ],
  },
  {
    label: "Bleche & Band", key: "sidebar_bleche_band",
    kategorien: [
      { id: "blech-warmgewalzt", label: "Blech warmgewalzt", key: "kat_blech_warmgewalzt" },
      { id: "blech-kaltgewalzt", label: "Blech kaltgewalzt", key: "kat_blech_kaltgewalzt" },
      { id: "blech-verzinkt",    label: "Blech verzinkt",    key: "kat_blech_verzinkt" },
      { id: "blech-lackiert",    label: "Blech lackiert",    key: "kat_blech_lackiert" },
      { id: "lochblech",         label: "Lochblech",         key: "kat_lochblech" },
      { id: "riffelblech",       label: "Riffelblech",       key: "kat_riffelblech" },
      { id: "band-streifen",     label: "Band / Streifen",   key: "kat_band_streifen" },
    ],
  },
  {
    label: "Dach & Fassade", key: "sidebar_dach_fassade",
    kategorien: [
      { id: "trapezblech",     label: "Trapezblech",     key: "kat_trapezblech" },
      { id: "metallziegel",    label: "Metallziegel",    key: "kat_metallziegel" },
      { id: "sandwichpaneele", label: "Sandwichpaneele", key: "kat_sandwichpaneele" },
    ],
  },
  {
    label: "Draht & Seil", key: "sidebar_draht_seil",
    kategorien: [
      { id: "stahldraht",    label: "Stahldraht",    key: "kat_stahldraht" },
      { id: "schweissdraht", label: "Schweißdraht",  key: "kat_schweissdraht" },
      { id: "stahlseil",     label: "Stahlseil",     key: "kat_stahlseil" },
    ],
  },
  {
    label: "Befestigungstechnik", key: "sidebar_befestigung",
    kategorien: [
      { id: "schrauben-muttern", label: "Schrauben & Muttern", key: "kat_schrauben_muttern" },
      { id: "anker",             label: "Anker",               key: "kat_anker" },
      { id: "naegel-duebel",     label: "Nägel & Dübel",       key: "kat_naegel_duebel" },
      { id: "sonder-verbinder",  label: "Sonder-Verbinder",    key: "kat_sonder_verbinder" },
    ],
  },
  {
    label: "Spezial", key: "sidebar_spezial",
    kategorien: [
      { id: "schienen",           label: "Schienen & Zubehör",  key: "kat_schienen" },
      { id: "stahlnetze",         label: "Stahlnetze & Zäune",  key: "kat_stahlnetze" },
      { id: "schmiedeteile",      label: "Schmiedeteile",        key: "kat_schmiedeteile" },
      { id: "spundwand",          label: "Spundwand & Pfähle",   key: "kat_spundwand" },
      { id: "knueppel",           label: "Knüppel / Rohling",    key: "kat_knueppel" },
      { id: "verbrauchsmaterial", label: "Verbrauchsmaterial",   key: "kat_verbrauchsmaterial" },
      { id: "schrott",            label: "Schrott",              key: "kat_schrott" },
    ],
  },
];

// ─── Hilfsfunktion ────────────────────────────────────────────────────────────

let _uid = 0;
function p(name: string, w: string, norm: string, ofl: string, dim: number, l: number, preis: number, breite?: number): KatalogProdukt {
  return { id: `p${_uid++}`, name, werkstoff: w, norm, oberflaeche: ofl, dimension: dim, laenge: l, preisKg: preis, ...(breite != null ? { breite } : {}) };
}

// ─── Produkt-Datenbank ────────────────────────────────────────────────────────

const BETONSTAHL: KatalogProdukt[] = [
  p("Betonstahl BSt 500S","BSt 500S","EN 10080","Blank",6,6000,0.88),
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
  p("Betonstahl BSt 500S verzinkt","BSt 500S","EN 10080","Verzinkt",10,6000,1.02),
  p("Betonstahl BSt 500S verzinkt","BSt 500S","EN 10080","Verzinkt",12,6000,1.00),
  p("Betonstahl BSt 500S verzinkt","BSt 500S","EN 10080","Verzinkt",16,6000,0.98),
];

const RUNDSTAHL: KatalogProdukt[] = [
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",5,3000,1.38),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",6,3000,1.36),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",8,3000,1.34),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",10,3000,1.33),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",12,6000,1.32),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",16,6000,1.30),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",20,6000,1.28),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",25,6000,1.26),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",30,6000,1.25),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",40,6000,1.23),
  p("Blankstahl Rund S235JR","S235JR","EN 10277","Blank",50,6000,1.22),
  p("Blankstahl Rund S355J2","S355J2","EN 10277","Blank",10,3000,1.55),
  p("Blankstahl Rund S355J2","S355J2","EN 10277","Blank",12,6000,1.52),
  p("Blankstahl Rund S355J2","S355J2","EN 10277","Blank",16,6000,1.50),
  p("Blankstahl Rund S355J2","S355J2","EN 10277","Blank",20,6000,1.48),
  p("Blankstahl Rund S355J2","S355J2","EN 10277","Blank",25,6000,1.46),
  p("Blankstahl Rund S355J2","S355J2","EN 10277","Blank",40,6000,1.44),
  p("Blankstahl Rund C45","C45","EN 10083-1","Blank",20,3000,1.82),
  p("Blankstahl Rund C45","C45","EN 10083-1","Blank",25,3000,1.80),
  p("Blankstahl Rund C45","C45","EN 10083-1","Blank",40,6000,1.76),
  p("Edelstahl Rund 1.4301","1.4301 (304)","EN 10088-3","Blank",10,3000,4.85),
  p("Edelstahl Rund 1.4301","1.4301 (304)","EN 10088-3","Blank",16,3000,4.80),
  p("Edelstahl Rund 1.4301","1.4301 (304)","EN 10088-3","Blank",20,3000,4.75),
  p("Edelstahl Rund 1.4301","1.4301 (304)","EN 10088-3","Blank",25,3000,4.70),
  p("Edelstahl Rund 1.4404","1.4404 (316L)","EN 10088-3","Blank",10,3000,6.20),
  p("Edelstahl Rund 1.4404","1.4404 (316L)","EN 10088-3","Blank",20,3000,6.10),
  p("Edelstahl Rund 1.4404","1.4404 (316L)","EN 10088-3","Blank",25,3000,6.05),
  p("Aluminium Rund EN AW-6060","EN AW-6060","EN 573-3","Blank",20,3000,3.95),
  p("Aluminium Rund EN AW-6060","EN AW-6060","EN 573-3","Blank",30,4000,3.90),
  p("Aluminium Rund EN AW-6060","EN AW-6060","EN 573-3","Blank",50,4000,3.85),
];

const VIERKANT: KatalogProdukt[] = [
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",6,3000,1.42),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",8,3000,1.40),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",10,3000,1.38),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",12,3000,1.36),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",16,6000,1.34),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",20,6000,1.32),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",25,6000,1.30),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",30,6000,1.28),
  p("Blankstahl Vierkant S235JR","S235JR","EN 10277","Blank",40,6000,1.26),
  p("Blankstahl Vierkant S355J2","S355J2","EN 10277","Blank",16,6000,1.56),
  p("Blankstahl Vierkant S355J2","S355J2","EN 10277","Blank",20,6000,1.52),
  p("Blankstahl Vierkant S355J2","S355J2","EN 10277","Blank",25,6000,1.50),
  p("Edelstahl Vierkant 1.4301","1.4301 (304)","EN 10088-3","Blank",10,3000,5.10),
  p("Edelstahl Vierkant 1.4301","1.4301 (304)","EN 10088-3","Blank",20,3000,5.00),
  p("Edelstahl Vierkant 1.4301","1.4301 (304)","EN 10088-3","Blank",30,3000,4.95),
  p("Aluminium Vierkant EN AW-6060","EN AW-6060","EN 573-3","Blank",20,3000,4.10),
  p("Aluminium Vierkant EN AW-6060","EN AW-6060","EN 573-3","Blank",30,4000,4.05),
  p("Aluminium Vierkant EN AW-6060","EN AW-6060","EN 573-3","Blank",40,4000,4.00),
];

const SECHSKANT: KatalogProdukt[] = [
  p("Sechskant S235JR","S235JR","EN 10278","Blank",6,3000,1.50),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",8,3000,1.48),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",10,3000,1.46),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",12,3000,1.44),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",14,3000,1.42),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",17,3000,1.40),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",19,3000,1.38),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",22,3000,1.36),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",27,3000,1.34),
  p("Sechskant S235JR","S235JR","EN 10278","Blank",32,3000,1.32),
  p("Sechskant 1.4301","1.4301 (304)","EN 10088-3","Blank",8,3000,5.40),
  p("Sechskant 1.4301","1.4301 (304)","EN 10088-3","Blank",10,3000,5.30),
  p("Sechskant 1.4301","1.4301 (304)","EN 10088-3","Blank",12,3000,5.20),
  p("Sechskant 1.4301","1.4301 (304)","EN 10088-3","Blank",17,3000,5.10),
  p("Messing Sechskant Ms58","Ms58","EN 12164","Blank",6,1000,8.20),
  p("Messing Sechskant Ms58","Ms58","EN 12164","Blank",10,1000,8.00),
  p("Messing Sechskant Ms58","Ms58","EN 12164","Blank",14,1000,7.90),
  p("Messing Sechskant Ms58","Ms58","EN 12164","Blank",19,1000,7.80),
  p("Messing Sechskant Ms58","Ms58","EN 12164","Blank",27,1000,7.70),
];

const FLACHSTAHL: KatalogProdukt[] = [
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",3,6000,1.30,20),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",4,6000,1.28,20),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",5,6000,1.26,30),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",6,6000,1.25,30),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",8,6000,1.24,40),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",10,6000,1.22,40),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",10,6000,1.22,50),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",12,6000,1.20,50),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",12,6000,1.20,60),
  p("Flachstahl S235JR","S235JR","EN 10058","Blank",15,6000,1.18,60),
  p("Flachstahl S235JR verzinkt","S235JR","EN 10058","Verzinkt",5,6000,1.48,30),
  p("Flachstahl S235JR verzinkt","S235JR","EN 10058","Verzinkt",8,6000,1.44,40),
  p("Flachstahl S235JR verzinkt","S235JR","EN 10058","Verzinkt",10,6000,1.42,50),
  p("Flachstahl S355J2","S355J2","EN 10058","Blank",10,6000,1.45,40),
  p("Flachstahl S355J2","S355J2","EN 10058","Blank",15,6000,1.42,60),
  p("Flachstahl S355J2","S355J2","EN 10058","Blank",20,6000,1.40,80),
];

const WALZDRAHT: KatalogProdukt[] = [
  p("Walzdraht S235JR","S235JR","EN 10016","Blank",5.5,coil(),0.72),
  p("Walzdraht S235JR","S235JR","EN 10016","Blank",6,coil(),0.70),
  p("Walzdraht S235JR","S235JR","EN 10016","Blank",6.5,coil(),0.70),
  p("Walzdraht S235JR","S235JR","EN 10016","Blank",8,coil(),0.68),
  p("Walzdraht S235JR","S235JR","EN 10016","Blank",10,coil(),0.66),
  p("Walzdraht S355J2","S355J2","EN 10016","Blank",6,coil(),0.80),
  p("Walzdraht S355J2","S355J2","EN 10016","Blank",8,coil(),0.78),
  p("Walzdraht S355J2","S355J2","EN 10016","Blank",10,coil(),0.76),
  p("Walzdraht C15","C15","EN 10016","Blank",6,coil(),0.82),
  p("Walzdraht C15","C15","EN 10016","Blank",8,coil(),0.80),
];

function coil() { return 0; } // Coil = keine fixe Länge, 0 = "Coil"

const TRAEGER: KatalogProdukt[] = [
  p("IPE 80","S235JR","EN 10025","Blank",80,6000,1.32),
  p("IPE 100","S235JR","EN 10025","Blank",100,6000,1.30),
  p("IPE 120","S235JR","EN 10025","Blank",120,6000,1.28),
  p("IPE 140","S235JR","EN 10025","Blank",140,6000,1.28),
  p("IPE 160","S235JR","EN 10025","Blank",160,6000,1.26),
  p("IPE 180","S235JR","EN 10025","Blank",180,6000,1.26),
  p("IPE 200","S235JR","EN 10025","Blank",200,6000,1.24),
  p("IPE 220","S235JR","EN 10025","Blank",220,6000,1.24),
  p("IPE 240","S235JR","EN 10025","Blank",240,6000,1.22),
  p("IPE 270","S235JR","EN 10025","Blank",270,6000,1.22),
  p("IPE 300","S235JR","EN 10025","Blank",300,6000,1.20),
  p("IPE 360","S235JR","EN 10025","Blank",360,6000,1.18),
  p("HEA 100","S235JR","EN 10025","Blank",100,6000,1.35),
  p("HEA 120","S235JR","EN 10025","Blank",120,6000,1.33),
  p("HEA 140","S235JR","EN 10025","Blank",140,6000,1.31),
  p("HEA 160","S235JR","EN 10025","Blank",160,6000,1.30),
  p("HEA 180","S235JR","EN 10025","Blank",180,6000,1.28),
  p("HEA 200","S235JR","EN 10025","Blank",200,6000,1.26),
  p("HEB 100","S355J2","EN 10025","Blank",100,6000,1.50),
  p("HEB 120","S355J2","EN 10025","Blank",120,6000,1.48),
  p("HEB 140","S355J2","EN 10025","Blank",140,6000,1.46),
  p("HEB 160","S355J2","EN 10025","Blank",160,6000,1.44),
  p("HEB 200","S355J2","EN 10025","Blank",200,6000,1.42),
];

const T_TRAEGER: KatalogProdukt[] = [
  p("T-Träger 30×30×3","S235JR","EN 10055","Blank",30,6000,1.40),
  p("T-Träger 40×40×4","S235JR","EN 10055","Blank",40,6000,1.38),
  p("T-Träger 50×50×5","S235JR","EN 10055","Blank",50,6000,1.36),
  p("T-Träger 60×60×6","S235JR","EN 10055","Blank",60,6000,1.34),
  p("T-Träger 70×70×7","S235JR","EN 10055","Blank",70,6000,1.32),
  p("T-Träger 80×80×8","S235JR","EN 10055","Blank",80,6000,1.30),
  p("T-Träger 100×100×10","S235JR","EN 10055","Blank",100,6000,1.28),
  p("T-Träger 50×50×5","S355J2","EN 10055","Blank",50,6000,1.55),
  p("T-Träger 80×80×8","S355J2","EN 10055","Blank",80,6000,1.50),
];

const WINKELSTAHL: KatalogProdukt[] = [
  p("Winkelstahl 20×20×3","S235JR","EN 10056","Blank",20,6000,1.42),
  p("Winkelstahl 25×25×3","S235JR","EN 10056","Blank",25,6000,1.40),
  p("Winkelstahl 30×30×3","S235JR","EN 10056","Blank",30,6000,1.38),
  p("Winkelstahl 40×40×4","S235JR","EN 10056","Blank",40,6000,1.36),
  p("Winkelstahl 50×50×5","S235JR","EN 10056","Blank",50,6000,1.35),
  p("Winkelstahl 60×60×6","S235JR","EN 10056","Blank",60,6000,1.33),
  p("Winkelstahl 70×70×7","S235JR","EN 10056","Blank",70,6000,1.32),
  p("Winkelstahl 80×80×8","S235JR","EN 10056","Blank",80,6000,1.30),
  p("Winkelstahl 100×100×10","S235JR","EN 10056","Blank",100,6000,1.28),
  p("Winkelstahl 120×120×12","S235JR","EN 10056","Blank",120,6000,1.26),
  p("Winkelstahl 50×50×5 verzinkt","S235JR","EN 10056","Verzinkt",50,6000,1.58),
  p("Winkelstahl 80×80×8 verzinkt","S235JR","EN 10056","Verzinkt",80,6000,1.52),
  p("Winkelstahl 100×100×10 verzinkt","S235JR","EN 10056","Verzinkt",100,6000,1.48),
  p("Edelstahl Winkel 1.4301","1.4301 (304)","EN 10088-3","Blank",30,3000,6.20),
  p("Edelstahl Winkel 1.4301","1.4301 (304)","EN 10088-3","Blank",40,3000,6.10),
  p("Edelstahl Winkel 1.4301","1.4301 (304)","EN 10088-3","Blank",50,3000,6.00),
];

const U_PROFILE: KatalogProdukt[] = [
  p("U-Profil 30","S235JR","EN 10279","Blank",30,6000,1.38),
  p("U-Profil 40","S235JR","EN 10279","Blank",40,6000,1.36),
  p("U-Profil 50","S235JR","EN 10279","Blank",50,6000,1.35),
  p("U-Profil 60","S235JR","EN 10279","Blank",60,6000,1.33),
  p("U-Profil 80","S235JR","EN 10279","Blank",80,6000,1.32),
  p("U-Profil 100","S235JR","EN 10279","Blank",100,6000,1.30),
  p("U-Profil 120","S235JR","EN 10279","Blank",120,6000,1.28),
  p("U-Profil 140","S235JR","EN 10279","Blank",140,6000,1.26),
  p("U-Profil 160","S235JR","EN 10279","Blank",160,6000,1.24),
  p("U-Profil 180","S235JR","EN 10279","Blank",180,6000,1.22),
  p("U-Profil 200","S235JR","EN 10279","Blank",200,6000,1.20),
  p("U-Profil 80 verzinkt","S235JR","EN 10279","Verzinkt",80,6000,1.52),
  p("U-Profil 100 verzinkt","S235JR","EN 10279","Verzinkt",100,6000,1.50),
  p("U-Profil 120 verzinkt","S235JR","EN 10279","Verzinkt",120,6000,1.48),
];

const LEICHTSTAHLPROFILE: KatalogProdukt[] = [
  p("C-Profil 100×50×3","S350GD","EN 10346","Verzinkt",100,6000,1.85),
  p("C-Profil 150×65×3","S350GD","EN 10346","Verzinkt",150,6000,1.80),
  p("C-Profil 200×65×3","S350GD","EN 10346","Verzinkt",200,6000,1.78),
  p("Z-Profil 100×50×3","S350GD","EN 10346","Verzinkt",100,6000,1.88),
  p("Z-Profil 150×65×3","S350GD","EN 10346","Verzinkt",150,6000,1.82),
  p("Z-Profil 200×75×3","S350GD","EN 10346","Verzinkt",200,6000,1.80),
  p("U-Profil kaltgeformt 100","S235JR","EN 10162","Blank",100,6000,1.60),
  p("U-Profil kaltgeformt 120","S235JR","EN 10162","Blank",120,6000,1.58),
];

const TROCKENBAUPROFILE: KatalogProdukt[] = [
  p("UD-Profil 28×27","Feuerverzinkt","EN 14195","Verzinkt",27,3000,1.20),
  p("UD-Profil 50×40","Feuerverzinkt","EN 14195","Verzinkt",40,3000,1.18),
  p("CD-Profil 60×27","Feuerverzinkt","EN 14195","Verzinkt",27,3000,1.22),
  p("UA-Profil 50×40×0,6","Feuerverzinkt","EN 14195","Verzinkt",40,4000,1.28),
  p("UA-Profil 75×40×0,6","Feuerverzinkt","EN 14195","Verzinkt",75,4000,1.26),
  p("CW-Profil 50×50","Feuerverzinkt","EN 14195","Verzinkt",50,4000,1.24),
  p("CW-Profil 75×50","Feuerverzinkt","EN 14195","Verzinkt",75,4000,1.22),
];

const NAHTLOSROHR: KatalogProdukt[] = [
  p("Nahtlosrohr S235 Ø21,3×2","S235JRH","EN 10210","Blank",21,6000,2.10),
  p("Nahtlosrohr S235 Ø26,9×2","S235JRH","EN 10210","Blank",27,6000,2.08),
  p("Nahtlosrohr S235 Ø33,7×3","S235JRH","EN 10210","Blank",34,6000,2.05),
  p("Nahtlosrohr S235 Ø42,4×3","S235JRH","EN 10210","Blank",42,6000,2.02),
  p("Nahtlosrohr S235 Ø48,3×3","S235JRH","EN 10210","Blank",48,6000,2.00),
  p("Nahtlosrohr S235 Ø60,3×3","S235JRH","EN 10210","Blank",60,6000,1.98),
  p("Nahtlosrohr S235 Ø76,1×4","S235JRH","EN 10210","Blank",76,6000,1.95),
  p("Nahtlosrohr S235 Ø88,9×4","S235JRH","EN 10210","Blank",89,6000,1.92),
  p("Nahtlosrohr S235 Ø114,3×5","S235JRH","EN 10210","Blank",114,6000,1.88),
  p("Nahtlosrohr S355 Ø33,7×3","S355J2H","EN 10210","Blank",34,6000,2.28),
  p("Nahtlosrohr S355 Ø48,3×4","S355J2H","EN 10210","Blank",48,6000,2.24),
  p("Nahtlosrohr S355 Ø60,3×4","S355J2H","EN 10210","Blank",60,6000,2.20),
  p("Nahtlosrohr S355 Ø76,1×5","S355J2H","EN 10210","Blank",76,6000,2.18),
  p("Nahtlosrohr 1.4301 Ø33,7×2","1.4301 (304)","EN 10216-5","Blank",34,6000,8.50),
  p("Nahtlosrohr 1.4301 Ø48,3×2","1.4301 (304)","EN 10216-5","Blank",48,6000,8.30),
  p("Nahtlosrohr 1.4301 Ø60,3×3","1.4301 (304)","EN 10216-5","Blank",60,6000,8.10),
  p("Nahtlosrohr verzinkt Ø21,3×2","S235JRH","EN 10210","Verzinkt",21,6000,2.45),
  p("Nahtlosrohr verzinkt Ø33,7×3","S235JRH","EN 10210","Verzinkt",34,6000,2.38),
  p("Nahtlosrohr verzinkt Ø48,3×3","S235JRH","EN 10210","Verzinkt",48,6000,2.32),
];

const GESCHWEISSTES_ROHR: KatalogProdukt[] = [
  p("ERW-Rohr S235 Ø21,3×2","S235JRH","EN 10219","Blank",21,6000,1.65),
  p("ERW-Rohr S235 Ø26,9×2","S235JRH","EN 10219","Blank",27,6000,1.62),
  p("ERW-Rohr S235 Ø33,7×2","S235JRH","EN 10219","Blank",34,6000,1.60),
  p("ERW-Rohr S235 Ø42,4×2","S235JRH","EN 10219","Blank",42,6000,1.58),
  p("ERW-Rohr S235 Ø48,3×2","S235JRH","EN 10219","Blank",48,6000,1.55),
  p("ERW-Rohr S235 Ø60,3×3","S235JRH","EN 10219","Blank",60,6000,1.52),
  p("ERW-Rohr S235 Ø76,1×3","S235JRH","EN 10219","Blank",76,6000,1.50),
  p("ERW-Rohr S235 Ø88,9×3","S235JRH","EN 10219","Blank",89,6000,1.48),
  p("ERW-Rohr S235 Ø114,3×4","S235JRH","EN 10219","Blank",114,6000,1.45),
  p("ERW-Rohr verzinkt Ø33,7×2","S235JRH","EN 10219","Verzinkt",34,6000,1.90),
  p("ERW-Rohr verzinkt Ø48,3×2","S235JRH","EN 10219","Verzinkt",48,6000,1.85),
  p("ERW-Rohr verzinkt Ø60,3×3","S235JRH","EN 10219","Verzinkt",60,6000,1.80),
  p("ERW-Rohr 1.4301 Ø33,7×2","1.4301 (304)","EN 10217-7","Blank",34,6000,7.20),
  p("ERW-Rohr 1.4301 Ø48,3×2","1.4301 (304)","EN 10217-7","Blank",48,6000,7.00),
];

const QUADRATROHR: KatalogProdukt[] = [
  p("Quadratrohr 20×2","S235JRH","EN 10219","Blank",20,6000,1.72),
  p("Quadratrohr 25×2","S235JRH","EN 10219","Blank",25,6000,1.70),
  p("Quadratrohr 30×2","S235JRH","EN 10219","Blank",30,6000,1.68),
  p("Quadratrohr 40×2","S235JRH","EN 10219","Blank",40,6000,1.65),
  p("Quadratrohr 40×3","S235JRH","EN 10219","Blank",40,6000,1.62),
  p("Quadratrohr 50×2","S235JRH","EN 10219","Blank",50,6000,1.62),
  p("Quadratrohr 50×3","S235JRH","EN 10219","Blank",50,6000,1.60),
  p("Quadratrohr 60×3","S235JRH","EN 10219","Blank",60,6000,1.58),
  p("Quadratrohr 80×4","S235JRH","EN 10219","Blank",80,6000,1.55),
  p("Quadratrohr 100×4","S235JRH","EN 10219","Blank",100,6000,1.52),
  p("Quadratrohr 120×5","S235JRH","EN 10219","Blank",120,6000,1.50),
  p("Quadratrohr verzinkt 40×2","S235JRH","EN 10219","Verzinkt",40,6000,1.95),
  p("Quadratrohr verzinkt 50×3","S235JRH","EN 10219","Verzinkt",50,6000,1.88),
  p("Quadratrohr verzinkt 60×3","S235JRH","EN 10219","Verzinkt",60,6000,1.85),
];

const RECHTECKROHR: KatalogProdukt[] = [
  p("Rechteckrohr 30×20×2","S235JRH","EN 10219","Blank",30,6000,1.75),
  p("Rechteckrohr 40×20×2","S235JRH","EN 10219","Blank",40,6000,1.72),
  p("Rechteckrohr 50×30×2","S235JRH","EN 10219","Blank",50,6000,1.70),
  p("Rechteckrohr 60×40×2","S235JRH","EN 10219","Blank",60,6000,1.68),
  p("Rechteckrohr 80×40×3","S235JRH","EN 10219","Blank",80,6000,1.65),
  p("Rechteckrohr 100×50×3","S235JRH","EN 10219","Blank",100,6000,1.62),
  p("Rechteckrohr 120×60×4","S235JRH","EN 10219","Blank",120,6000,1.60),
  p("Rechteckrohr 150×100×5","S235JRH","EN 10219","Blank",150,6000,1.58),
  p("Rechteckrohr verzinkt 50×30×2","S235JRH","EN 10219","Verzinkt",50,6000,1.98),
  p("Rechteckrohr verzinkt 80×40×3","S235JRH","EN 10219","Verzinkt",80,6000,1.92),
];

const OVALROHR: KatalogProdukt[] = [
  p("Ovalrohr 30×15×1,5","S235JRH","EN 10219","Blank",30,6000,1.90),
  p("Ovalrohr 40×20×2","S235JRH","EN 10219","Blank",40,6000,1.88),
  p("Ovalrohr 50×25×2","S235JRH","EN 10219","Blank",50,6000,1.85),
  p("Ovalrohr 70×40×3","S235JRH","EN 10219","Blank",70,6000,1.82),
  p("Ovalrohr verzinkt 40×20×2","S235JRH","EN 10219","Verzinkt",40,6000,2.20),
];

const SONDERROHRE: KatalogProdukt[] = [
  p("Dreieckrohr 40×1,5","S235JRH","EN 10219","Blank",40,6000,2.40),
  p("Gussrohr SML DN 50","EN-GJL-200","EN 877","Blank",50,3000,3.20),
  p("Gussrohr SML DN 100","EN-GJL-200","EN 877","Blank",100,3000,3.00),
  p("Gussrohr VCHSHG DN 80","EN-GJS-500-7","EN 545","Blank",80,6000,2.80),
  p("Bohrrohr Ø 42,4×4","S135","API 5D","Blank",42,9140,4.50),
  p("Kernbohrrohr Ø 46×3","S355JR","DIN 8035","Blank",46,3000,3.80),
  p("NKT Ø 60,3×5","P110","API 5CT","Blank",60,9000,5.20),
];

const BLECH_WK: KatalogProdukt[] = [
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",2,2000,1.25,1000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",3,2000,1.22,1000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",4,2000,1.20,1000),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",5,2000,1.18,1250),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",6,2000,1.16,1250),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",8,2000,1.15,1250),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",10,2000,1.14,1500),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",12,2000,1.13,1500),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",15,2000,1.12,1500),
  p("Blech warmgewalzt S235JR","S235JR","EN 10025","Blank",20,2000,1.11,2000),
  p("Blech warmgewalzt S355J2","S355J2","EN 10025","Blank",4,2000,1.40,1000),
  p("Blech warmgewalzt S355J2","S355J2","EN 10025","Blank",6,2000,1.38,1250),
  p("Blech warmgewalzt S355J2","S355J2","EN 10025","Blank",10,2000,1.36,1500),
  p("Blech warmgewalzt S355J2","S355J2","EN 10025","Blank",15,2000,1.34,1500),
];

const BLECH_KK: KatalogProdukt[] = [
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",0.5,2000,1.35,1000),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",0.75,2000,1.32,1000),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",1,2000,1.30,1000),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",1.25,2000,1.28,1250),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",1.5,2000,1.26,1250),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",2,2000,1.24,1250),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",2.5,2000,1.22,1500),
  p("Blech kaltgewalzt DC01","DC01","EN 10130","Blank",3,2000,1.20,1500),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Blank",1,2000,1.40,1000),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Blank",1.5,2000,1.36,1250),
  p("Blech kaltgewalzt DC04","DC04","EN 10130","Blank",2,2000,1.34,1250),
];

const BLECH_VZ: KatalogProdukt[] = [
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",0.5,coil(),1.48),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",0.6,coil(),1.45),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",0.75,coil(),1.42),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",1,2000,1.40),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",1.25,2000,1.38),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",1.5,2000,1.36),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",2,2000,1.34),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",2.5,2000,1.32),
  p("Blech verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",3,2000,1.30),
  p("Blech verzinkt S350GD","S350GD+Z275","EN 10346","Verzinkt",1,2000,1.55),
  p("Blech verzinkt S350GD","S350GD+Z275","EN 10346","Verzinkt",1.5,2000,1.52),
  p("Blech verzinkt S350GD","S350GD+Z275","EN 10346","Verzinkt",2,2000,1.50),
];

const BLECH_LK: KatalogProdukt[] = [
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",0.5,coil(),1.75),
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",0.6,coil(),1.72),
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",0.7,coil(),1.70),
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",0.75,2000,1.68),
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",1,2000,1.65),
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",1.2,2000,1.62),
  p("Blech lackiert RAL","DX51D+Z275","EN 10346","Lackiert",1.5,2000,1.60),
];

const LOCHBLECH: KatalogProdukt[] = [
  p("Lochblech Rv 5-8 S235","S235JR","DIN 24041","Blank",1.5,2000,1.85),
  p("Lochblech Rv 5-8 S235","S235JR","DIN 24041","Blank",2,2000,1.80),
  p("Lochblech Rv 8-12 S235","S235JR","DIN 24041","Blank",2,2000,1.78),
  p("Lochblech Rv 8-12 S235","S235JR","DIN 24041","Blank",3,2000,1.75),
  p("Lochblech Rv 10-14 S235","S235JR","DIN 24041","Blank",3,2000,1.72),
  p("Lochblech Rv 10-14 S235","S235JR","DIN 24041","Blank",4,2000,1.70),
  p("Lochblech verzinkt Rv 5-8","DX51D","DIN 24041","Verzinkt",1.5,2000,2.10),
  p("Lochblech verzinkt Rv 8-12","DX51D","DIN 24041","Verzinkt",2,2000,2.05),
  p("Lochblech Edelstahl 1.4301 Rv5-8","1.4301 (304)","DIN 24041","Blank",1.5,2000,9.50),
];

const RIFFELBLECH: KatalogProdukt[] = [
  p("Riffelblech 2+2 S235","S235JR","EN 10025","Blank",2,2000,1.45,1000),
  p("Riffelblech 3+2 S235","S235JR","EN 10025","Blank",3,2000,1.42,1000),
  p("Riffelblech 4+2 S235","S235JR","EN 10025","Blank",4,2000,1.40,1250),
  p("Riffelblech 5+2 S235","S235JR","EN 10025","Blank",5,2000,1.38,1250),
  p("Riffelblech 6+2 S235","S235JR","EN 10025","Blank",6,2000,1.36,1500),
  p("Riffelblech 3+2 verzinkt","DX51D","EN 10346","Verzinkt",3,2000,1.68,1000),
  p("Riffelblech Edelstahl 1.4301 3+2","1.4301 (304)","EN 10088","Blank",3,2000,9.80,1000),
];

const BAND: KatalogProdukt[] = [
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",0.45,coil(),1.30),
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",0.5,coil(),1.28),
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",0.6,coil(),1.26),
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",0.75,coil(),1.24),
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",1,coil(),1.22),
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",1.5,coil(),1.20),
  p("Band/Streifen S235JR","S235JR","EN 10139","Blank",2,coil(),1.18),
  p("Band verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",0.45,coil(),1.55),
  p("Band verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",0.6,coil(),1.52),
  p("Band verzinkt DX51D","DX51D+Z275","EN 10346","Verzinkt",1,coil(),1.48),
  p("Band lackiert DX51D","DX51D+Z275","EN 10346","Lackiert",0.5,coil(),1.78),
  p("Band lackiert DX51D","DX51D+Z275","EN 10346","Lackiert",0.7,coil(),1.75),
  p("Band perforiert verzinkt 0,6","DX51D","EN 10346","Verzinkt",0.6,coil(),1.90),
  p("Band perforiert verzinkt 1,0","DX51D","EN 10346","Verzinkt",1,coil(),1.85),
];

const TRAPEZBLECH: KatalogProdukt[] = [
  p("Trapezblech T-20 verzinkt","S250GD+Z275","EN 10346","Verzinkt",0.5,6000,2.20),
  p("Trapezblech T-20 verzinkt","S250GD+Z275","EN 10346","Verzinkt",0.6,6000,2.15),
  p("Trapezblech T-35 verzinkt","S250GD+Z275","EN 10346","Verzinkt",0.5,6000,2.22),
  p("Trapezblech T-35 verzinkt","S250GD+Z275","EN 10346","Verzinkt",0.7,6000,2.18),
  p("Trapezblech T-60 verzinkt","S250GD+Z275","EN 10346","Verzinkt",0.7,6000,2.25),
  p("Trapezblech T-20 lackiert","S250GD+Z275","EN 10346","Lackiert",0.5,6000,2.55),
  p("Trapezblech T-20 lackiert","S250GD+Z275","EN 10346","Lackiert",0.6,6000,2.50),
  p("Trapezblech T-35 lackiert","S250GD+Z275","EN 10346","Lackiert",0.6,6000,2.52),
  p("Trapezblech T-60 lackiert","S250GD+Z275","EN 10346","Lackiert",0.7,6000,2.58),
];

const METALLZIEGEL: KatalogProdukt[] = [
  p("Metallziegel Monterrey verzinkt","S250GD+Z275","EN 10346","Verzinkt",0.45,1180,3.20),
  p("Metallziegel Monterrey lackiert","S250GD+Z275","EN 10346","Lackiert",0.5,1180,3.85),
  p("Metallziegel Cascade lackiert","S250GD+Z275","EN 10346","Lackiert",0.5,1180,4.10),
];

const SANDWICHPANEELE: KatalogProdukt[] = [
  p("Sandwichpaneel Wand 60mm","S250GD","EN 14509","Lackiert",60,6000,12.50),
  p("Sandwichpaneel Wand 80mm","S250GD","EN 14509","Lackiert",80,6000,14.20),
  p("Sandwichpaneel Dach 80mm","S250GD","EN 14509","Lackiert",80,6000,15.80),
  p("Sandwichpaneel Dach 100mm","S250GD","EN 14509","Lackiert",100,6000,17.50),
  p("Sandwichpaneel Dach 120mm","S250GD","EN 14509","Lackiert",120,6000,19.20),
];

const STAHLDRAHT: KatalogProdukt[] = [
  p("Stahldraht S235 Ø0,8","S235JR","EN 10016","Blank",0.8,coil(),1.10),
  p("Stahldraht S235 Ø1,0","S235JR","EN 10016","Blank",1,coil(),1.08),
  p("Stahldraht S235 Ø1,2","S235JR","EN 10016","Blank",1.2,coil(),1.06),
  p("Stahldraht S235 Ø1,5","S235JR","EN 10016","Blank",1.5,coil(),1.04),
  p("Stahldraht S235 Ø2,0","S235JR","EN 10016","Blank",2,coil(),1.02),
  p("Stahldraht S235 Ø3,0","S235JR","EN 10016","Blank",3,coil(),1.00),
  p("Stahldraht verzinkt Ø1,2","S235JR","EN 10244","Verzinkt",1.2,coil(),1.32),
  p("Stahldraht verzinkt Ø2,0","S235JR","EN 10244","Verzinkt",2,coil(),1.28),
  p("Stahldraht verzinkt Ø3,0","S235JR","EN 10244","Verzinkt",3,coil(),1.24),
];

const SCHWEISSDRAHT: KatalogProdukt[] = [
  p("Schweißdraht MIG SG2 Ø0,8","SG2","EN 756","Blank",0.8,coil(),2.80),
  p("Schweißdraht MIG SG2 Ø1,0","SG2","EN 756","Blank",1,coil(),2.75),
  p("Schweißdraht MIG SG3 Ø1,0","SG3","EN 756","Blank",1,coil(),2.90),
  p("Schweißdraht MIG SG3 Ø1,2","SG3","EN 756","Blank",1.2,coil(),2.85),
  p("Schweißdraht TIG ER316L Ø1,6","ER316L","EN 12072","Blank",1.6,1000,8.50),
  p("Schweißdraht TIG ER308L Ø2,0","ER308L","EN 12072","Blank",2,1000,8.20),
];

const STAHLSEIL: KatalogProdukt[] = [
  p("Stahlseil 6×7+FC Ø4","S-Klasse","EN 12385","Blank",4,coil(),2.80),
  p("Stahlseil 6×7+FC Ø6","S-Klasse","EN 12385","Blank",6,coil(),2.70),
  p("Stahlseil 6×7+FC Ø8","S-Klasse","EN 12385","Blank",8,coil(),2.60),
  p("Stahlseil 6×19+FC Ø10","S-Klasse","EN 12385","Blank",10,coil(),2.50),
  p("Stahlseil 6×19+FC Ø12","S-Klasse","EN 12385","Blank",12,coil(),2.45),
  p("Stahlseil verzinkt 6×7 Ø4","S-Klasse","EN 12385","Verzinkt",4,coil(),3.20),
  p("Stahlseil verzinkt 6×7 Ø6","S-Klasse","EN 12385","Verzinkt",6,coil(),3.10),
  p("Bewehrungslitze 12,5mm","Y1860S7","EN 10138","Blank",13,coil(),1.45),
  p("Bewehrungslitze 15,7mm","Y1860S7","EN 10138","Blank",16,coil(),1.42),
];

const SCHRAUBEN: KatalogProdukt[] = [
  p("Sechskantschraube DIN 931 8.8","8.8","DIN 931","Verzinkt",6,60,4.20),
  p("Sechskantschraube DIN 931 8.8","8.8","DIN 931","Verzinkt",8,80,3.80),
  p("Sechskantschraube DIN 931 8.8","8.8","DIN 931","Verzinkt",10,100,3.50),
  p("Sechskantschraube DIN 931 8.8","8.8","DIN 931","Verzinkt",12,120,3.20),
  p("Sechskantschraube DIN 931 8.8","8.8","DIN 931","Verzinkt",16,160,3.00),
  p("Sechskantschraube DIN 931 8.8","8.8","DIN 931","Verzinkt",20,200,2.85),
  p("Sechskantschraube 10.9 Zn","10.9","DIN 931","Verzinkt",10,100,4.50),
  p("Sechskantschraube 10.9 Zn","10.9","DIN 931","Verzinkt",12,120,4.20),
  p("Mutter DIN 934 8.8","8.8","DIN 934","Verzinkt",6,6,3.80),
  p("Mutter DIN 934 8.8","8.8","DIN 934","Verzinkt",8,8,3.50),
  p("Mutter DIN 934 8.8","8.8","DIN 934","Verzinkt",10,10,3.20),
  p("Mutter DIN 934 8.8","8.8","DIN 934","Verzinkt",12,12,3.00),
  p("Gewindestange DIN 975 8.8","8.8","DIN 975","Verzinkt",8,1000,2.40),
  p("Gewindestange DIN 975 8.8","8.8","DIN 975","Verzinkt",10,1000,2.30),
  p("Gewindestange DIN 975 8.8","8.8","DIN 975","Verzinkt",12,1000,2.20),
];

const ANKER: KatalogProdukt[] = [
  p("Einschlaganker Zn","Stahl","DIN 7972","Verzinkt",6,40,5.50),
  p("Einschlaganker Zn","Stahl","DIN 7972","Verzinkt",8,60,5.20),
  p("Keilanker FH II","8.8","ETA-Zulassung","Verzinkt",8,75,6.80),
  p("Keilanker FH II","8.8","ETA-Zulassung","Verzinkt",10,95,6.50),
  p("Keilanker FH II","8.8","ETA-Zulassung","Verzinkt",12,115,6.20),
  p("Verbundanker M8","Stahl","ETA-Zulassung","Verzinkt",8,110,7.80),
  p("Verbundanker M10","Stahl","ETA-Zulassung","Verzinkt",10,130,7.50),
  p("Verbundanker M12","Stahl","ETA-Zulassung","Verzinkt",12,160,7.20),
  p("Rahmenanker ART","Stahl","ETA-Zulassung","Verzinkt",8,80,5.80),
  p("Ringbolzen M8","Stahl","DIN 580","Verzinkt",8,80,6.50),
  p("Ringbolzen M10","Stahl","DIN 580","Verzinkt",10,100,6.20),
];

const NAEGEL: KatalogProdukt[] = [
  p("Nagel rund DIN 1151 Ø2,5","S235JR","DIN 1151","Blank",2.5,60,1.20),
  p("Nagel rund DIN 1151 Ø3,1","S235JR","DIN 1151","Blank",3.1,80,1.18),
  p("Nagel rund DIN 1151 Ø3,4","S235JR","DIN 1151","Blank",3.4,90,1.16),
  p("Dübelnagel Ø6","Stahl","DIN 7965","Verzinkt",6,60,2.80),
  p("Dübelnagel Ø8","Stahl","DIN 7965","Verzinkt",8,80,2.70),
  p("Blechschraube DIN 7981 Ø3,5","Stahl","DIN 7981","Verzinkt",3.5,35,2.20),
  p("Blechschraube DIN 7981 Ø4,2","Stahl","DIN 7981","Verzinkt",4.2,45,2.10),
  p("Blechschraube DIN 7981 Ø4,8","Stahl","DIN 7981","Verzinkt",4.8,50,2.00),
];

const SONDER_VERBINDER: KatalogProdukt[] = [
  p("Ringmutter DIN 582 M8","8.8","DIN 582","Verzinkt",8,8,5.80),
  p("Ringmutter DIN 582 M10","8.8","DIN 582","Verzinkt",10,10,5.50),
  p("Ringmutter DIN 582 M12","8.8","DIN 582","Verzinkt",12,12,5.20),
  p("Splint DIN 94 Ø2","Stahl","DIN 94","Verzinkt",2,20,1.80),
  p("Splint DIN 94 Ø3","Stahl","DIN 94","Verzinkt",3,25,1.75),
  p("Unterlegscheibe DIN 125 M8","Stahl","DIN 125","Verzinkt",8,8,1.50),
  p("Unterlegscheibe DIN 125 M10","Stahl","DIN 125","Verzinkt",10,10,1.45),
];

const SCHIENEN: KatalogProdukt[] = [
  p("Schiene S49","S355J2","EN 13674-1","Blank",149,18000,1.45),
  p("Schiene UIC54","S355J2","EN 13674-1","Blank",159,18000,1.42),
  p("Schiene UIC60","S355J2","EN 13674-1","Blank",172,18000,1.40),
  p("Kranschiene A45","S355J2","EN 13674-3","Blank",45,6000,1.55),
  p("Kranschiene A55","S355J2","EN 13674-3","Blank",55,6000,1.52),
  p("Kranschiene A75","S355J2","EN 13674-3","Blank",75,6000,1.50),
  p("Schienenlaschen S49","S355J2","EN 13146","Blank",149,900,2.10),
  p("Schienenlaschen UIC60","S355J2","EN 13146","Blank",172,900,2.05),
];

const STAHLNETZE: KatalogProdukt[] = [
  p("Maschendraht verzinkt MW 50","S235JR","EN 10223","Verzinkt",50,2500,2.20),
  p("Maschendraht verzinkt MW 63","S235JR","EN 10223","Verzinkt",63,2500,2.15),
  p("Maschendraht PVC MW 50","S235JR","EN 10223","Lackiert",50,2500,2.80),
  p("Schweißgitter 50×50×3","S235JR","EN 10223","Verzinkt",50,2000,2.50),
  p("Schweißgitter 100×50×3","S235JR","EN 10223","Verzinkt",100,2000,2.40),
  p("Zaunpaneel 868/6-5-6","S235JR","EN 10223","Lackiert",200,2500,3.80),
  p("Doppelstab-Gitter 868","S235JR","EN 10223","Lackiert",183,2500,3.60),
];

const SCHMIEDETEILE: KatalogProdukt[] = [
  p("Schmiedering Ø100","S355J2","EN 10243","Blank",100,50,4.50),
  p("Schmiedering Ø150","S355J2","EN 10243","Blank",150,60,4.30),
  p("Schmiedering Ø200","S355J2","EN 10243","Blank",200,80,4.10),
  p("Schmiedestück rund Ø80","C45","EN 10243","Blank",80,200,5.20),
  p("Schmiedestück rund Ø100","C45","EN 10243","Blank",100,200,5.00),
  p("Rohrschuss Ø300","S355J2","DIN 28011","Blank",300,500,3.80),
  p("Rohrschuss Ø500","S355J2","DIN 28011","Blank",500,800,3.60),
];

const SPUNDWAND: KatalogProdukt[] = [
  p("Spundbohle AZ 13","S355GP","EN 10248","Blank",420,6000,1.60),
  p("Spundbohle AZ 18","S355GP","EN 10248","Blank",630,6000,1.58),
  p("Spundbohle AZ 26","S355GP","EN 10248","Blank",670,12000,1.55),
  p("Larssen-Profil VL 603","S355GP","EN 10248","Blank",600,6000,1.62),
  p("Schraubpfahl Ø76","S355JR","DIN EN ISO","Verzinkt",76,2000,4.80),
  p("Schraubpfahl Ø89","S355JR","DIN EN ISO","Verzinkt",89,2000,4.60),
  p("Schraubpfahl Ø108","S355JR","DIN EN ISO","Verzinkt",108,3000,4.40),
];

const KNUEPPEL: KatalogProdukt[] = [
  p("Knüppel 100×100","S235JR","EN 10060","Blank",100,6000,0.82),
  p("Knüppel 120×120","S235JR","EN 10060","Blank",120,6000,0.80),
  p("Knüppel 150×150","S235JR","EN 10060","Blank",150,6000,0.78),
  p("Knüppel 160×160","S235JR","EN 10060","Blank",160,6000,0.76),
  p("Bramme 250×1000","S235JR","EN 10025","Blank",250,6000,0.74),
  p("Bramme 300×1200","S355J2","EN 10025","Blank",300,6000,0.75),
];

const VERBRAUCHSMATERIAL: KatalogProdukt[] = [
  p("Elektrode E42 2 RC Ø2,5","E42","EN ISO 2560","Blank",2.5,350,2.80),
  p("Elektrode E42 2 RC Ø3,2","E42","EN ISO 2560","Blank",3.2,350,2.70),
  p("Elektrode E42 2 RC Ø4,0","E42","EN ISO 2560","Blank",4,350,2.60),
  p("Trennscheibe Ø115×1","A60T","EN 12413","Blank",115,1,0.45),
  p("Trennscheibe Ø125×1","A60T","EN 12413","Blank",125,1,0.50),
  p("Trennscheibe Ø230×2","A30S","EN 12413","Blank",230,1,0.90),
  p("Rundschlinge 1t 1m","Polyester","EN 1492-2","Blank",1,1000,8.50),
  p("Rundschlinge 2t 2m","Polyester","EN 1492-2","Blank",2,2000,14.50),
  p("Flachschlinge 2t 3m","Polyester","EN 1492-1","Blank",2,3000,12.80),
];

const SCHROTT: KatalogProdukt[] = [
  p("Stahlschrott Sorte 2A","Stahl","EN ISO 17225","Blank",0,1000,0.28),
  p("Stahlschrott Sorte 1","Stahl","EN ISO 17225","Blank",0,1000,0.32),
  p("Gussschrott","Grauguss","EN ISO 17225","Blank",0,1000,0.24),
  p("Edelstahlschrott 304","1.4301","EN ISO 17225","Blank",0,1000,0.95),
  p("Edelstahlschrott 316","1.4404","EN ISO 17225","Blank",0,1000,1.10),
  p("Aluschrott 6060","EN AW-6060","EN ISO 17225","Blank",0,1000,1.45),
];

// ─── Kategorien-Map ───────────────────────────────────────────────────────────

export const KATALOG: Record<string, KatalogKategorie> = {
  "betonstahl":         { id:"betonstahl",         label:"Betonstahl",             dimLabel:"Ø mm",      dimUnit:"",    description:"Bewehrungsstahl nach EN 10080 / DIN 488 — BSt 500S und B500B für Stahlbetonkonstruktionen",         produkte: BETONSTAHL },
  "rundstahl":          { id:"rundstahl",           label:"Rundstahl",              dimLabel:"Ø mm",      dimUnit:"",    description:"Vollmaterial Rund · Blankstahl, Vergütungsstahl, Edelstahl, Aluminium nach EN 10277 / EN 10088",    produkte: RUNDSTAHL },
  "vierkant":           { id:"vierkant",            label:"Vierkant",               dimLabel:"Seite mm",  dimUnit:"",    description:"Vollmaterial Vierkant · kaltgezogen, warmgewalzt, Edelstahl, Aluminium nach EN 10277",               produkte: VIERKANT },
  "sechskant":          { id:"sechskant",           label:"Sechskant",              dimLabel:"SW mm",     dimUnit:"",    description:"Vollmaterial Sechskant · Stahl, Edelstahl, Messing nach EN 10278 / EN 12164",                       produkte: SECHSKANT },
  "flachstahl":         { id:"flachstahl",          label:"Flachstahl",             dimLabel:"Dicke mm",  dimUnit:"",    description:"Flachstahl / Flachprofil · blank und verzinkt nach EN 10058",                                       produkte: FLACHSTAHL },
  "walzdraht":          { id:"walzdraht",           label:"Walzdraht",              dimLabel:"Ø mm",      dimUnit:"",    description:"Walzdraht · warmgewalzt, Coil nach EN 10016 — S235JR, S355J2, C15",                                 produkte: WALZDRAHT },
  "traeger":            { id:"traeger",             label:"Träger (IPE/HEA/HEB)",   dimLabel:"Höhe mm",   dimUnit:"",    description:"I-Träger · IPE, HEA, HEB nach EN 10025 — S235JR und S355J2",                                        produkte: TRAEGER },
  "t-traeger":          { id:"t-traeger",           label:"T-Träger",               dimLabel:"Höhe mm",   dimUnit:"",    description:"T-Profile nach EN 10055 — S235JR und S355J2",                                                       produkte: T_TRAEGER },
  "winkelstahl":        { id:"winkelstahl",         label:"Winkelstahl",            dimLabel:"Seite mm",  dimUnit:"",    description:"Gleichschenkliger Winkelstahl · blank, verzinkt, Edelstahl nach EN 10056",                           produkte: WINKELSTAHL },
  "u-profile":          { id:"u-profile",           label:"U-Profile",              dimLabel:"Höhe mm",   dimUnit:"",    description:"U-Profile / Schienen nach EN 10279 — S235JR, blank und verzinkt",                                    produkte: U_PROFILE },
  "leichtstahlprofile": { id:"leichtstahlprofile",  label:"Leichtstahlprofile",     dimLabel:"Höhe mm",   dimUnit:"",    description:"Kaltgeformte Profile LSTK — C, Z, Sigma, U nach EN 10346 / EN 10162",                               produkte: LEICHTSTAHLPROFILE },
  "trockenbauprofile":  { id:"trockenbauprofile",   label:"Trockenbauprofile",      dimLabel:"Höhe mm",   dimUnit:"",    description:"Stahlprofile für Trockenbau — UD, CD, UA, CW nach EN 14195",                                         produkte: TROCKENBAUPROFILE },
  "nahtlosrohr":        { id:"nahtlosrohr",         label:"Nahtlosrohr",            dimLabel:"Ø mm",      dimUnit:"",    description:"Nahtlose Stahlrohre warmgewalzt und kaltgezogen nach EN 10210 / EN 10216",                            produkte: NAHTLOSROHR },
  "geschweisstes-rohr": { id:"geschweisstes-rohr",  label:"Geschweißtes Rohr",      dimLabel:"Ø mm",      dimUnit:"",    description:"Elektrogeschweißte Rohre (ERW / WGP) nach EN 10219 / EN 10217",                                      produkte: GESCHWEISSTES_ROHR },
  "quadratrohr":        { id:"quadratrohr",         label:"Quadratrohr",            dimLabel:"Seite mm",  dimUnit:"",    description:"Quadratische Hohlprofile · blank und verzinkt nach EN 10219",                                         produkte: QUADRATROHR },
  "rechteckrohr":       { id:"rechteckrohr",        label:"Rechteckrohr",           dimLabel:"Höhe mm",   dimUnit:"",    description:"Rechteckige Hohlprofile · blank und verzinkt nach EN 10219",                                         produkte: RECHTECKROHR },
  "ovalrohr":           { id:"ovalrohr",            label:"Ovalrohr",               dimLabel:"Höhe mm",   dimUnit:"",    description:"Oval- und Flachovalrohre · blank und verzinkt nach EN 10219",                                        produkte: OVALROHR },
  "sonderrohre":        { id:"sonderrohre",         label:"Sonderrohre",            dimLabel:"Ø mm",      dimUnit:"",    description:"Sonderprofile: Dreieckrohr, Gussrohr SML/VCHSHG, Bohrrohr, NKT, Kernrohr",                           produkte: SONDERROHRE },
  "blech-warmgewalzt":  { id:"blech-warmgewalzt",   label:"Blech warmgewalzt",      dimLabel:"Dicke mm",  dimUnit:"",    description:"Warmgewalzte Bleche und Tafeln · S235JR, S355J2 nach EN 10025",                                      produkte: BLECH_WK },
  "blech-kaltgewalzt":  { id:"blech-kaltgewalzt",   label:"Blech kaltgewalzt",      dimLabel:"Dicke mm",  dimUnit:"",    description:"Kaltgewalzte Feinbleche und Coils · DC01, DC04 nach EN 10130",                                       produkte: BLECH_KK },
  "blech-verzinkt":     { id:"blech-verzinkt",      label:"Blech verzinkt",         dimLabel:"Dicke mm",  dimUnit:"",    description:"Feuerverzinkte Bleche und Coils · DX51D, S350GD nach EN 10346",                                      produkte: BLECH_VZ },
  "blech-lackiert":     { id:"blech-lackiert",      label:"Blech lackiert",         dimLabel:"Dicke mm",  dimUnit:"",    description:"Bandbeschichtete Bleche und Coils (PPGI) · DX51D nach EN 10346",                                     produkte: BLECH_LK },
  "lochblech":          { id:"lochblech",           label:"Lochblech",              dimLabel:"Dicke mm",  dimUnit:"",    description:"Lochbleche Rv und Qg · S235JR, Edelstahl, verzinkt nach DIN 24041",                                  produkte: LOCHBLECH },
  "riffelblech":        { id:"riffelblech",         label:"Riffelblech",            dimLabel:"Dicke mm",  dimUnit:"",    description:"Riffelbleche Tränenblech · S235JR, verzinkt, Edelstahl nach EN 10025",                               produkte: RIFFELBLECH },
  "band-streifen":      { id:"band-streifen",       label:"Band / Streifen",        dimLabel:"Dicke mm",  dimUnit:"",    description:"Stahlband und Streifen · blank, verzinkt, lackiert, perforiert nach EN 10139 / EN 10346",            produkte: BAND },
  "trapezblech":        { id:"trapezblech",         label:"Trapezblech",            dimLabel:"Dicke mm",  dimUnit:"",    description:"Trapezprofilbleche T-20, T-35, T-60 · verzinkt und lackiert nach EN 10346",                          produkte: TRAPEZBLECH },
  "metallziegel":       { id:"metallziegel",        label:"Metallziegel",           dimLabel:"Dicke mm",  dimUnit:"",    description:"Metallziegel / Dachpfannen · Monterrey, Cascade — verzinkt und lackiert",                            produkte: METALLZIEGEL },
  "sandwichpaneele":    { id:"sandwichpaneele",     label:"Sandwichpaneele",        dimLabel:"Dicke mm",  dimUnit:"",    description:"Sandwichpaneele für Wand und Dach · Mineralwolle- und PIR-Kern nach EN 14509",                       produkte: SANDWICHPANEELE },
  "stahldraht":         { id:"stahldraht",          label:"Stahldraht",             dimLabel:"Ø mm",      dimUnit:"",    description:"Stahldraht blank und verzinkt · Coil nach EN 10016 / EN 10244",                                      produkte: STAHLDRAHT },
  "schweissdraht":      { id:"schweissdraht",       label:"Schweißdraht",           dimLabel:"Ø mm",      dimUnit:"",    description:"MIG/MAG und WIG-Schweißdrähte · SG2, SG3, ER308L, ER316L nach EN 756 / EN 12072",                  produkte: SCHWEISSDRAHT },
  "stahlseil":          { id:"stahlseil",           label:"Stahlseil",              dimLabel:"Ø mm",      dimUnit:"",    description:"Drahtseile und Bewehrungslitzen · 6×7, 6×19 nach EN 12385 / EN 10138",                              produkte: STAHLSEIL },
  "schrauben-muttern":  { id:"schrauben-muttern",   label:"Schrauben & Muttern",    dimLabel:"Größe",     dimUnit:"M",   description:"Sechskantschrauben, Muttern, Gewindestangen · Festigkeit 8.8, 10.9 nach DIN 931 / DIN 934",         produkte: SCHRAUBEN },
  "anker":              { id:"anker",               label:"Anker",                  dimLabel:"Größe",     dimUnit:"M",   description:"Dübel und Anker · Einschlag-, Keil-, Verbund-, Rahmenanker mit ETA-Zulassung",                      produkte: ANKER },
  "naegel-duebel":      { id:"naegel-duebel",       label:"Nägel & Dübel",          dimLabel:"Ø mm",      dimUnit:"",    description:"Nägel, Dübelnägel und Blechschrauben nach DIN 1151 / DIN 7981",                                     produkte: NAEGEL },
  "sonder-verbinder":   { id:"sonder-verbinder",    label:"Sonder-Verbinder",       dimLabel:"Größe",     dimUnit:"M",   description:"Ringmuttern, Splinte, Unterlegscheiben nach DIN 582 / DIN 94 / DIN 125",                            produkte: SONDER_VERBINDER },
  "schienen":           { id:"schienen",            label:"Schienen & Zubehör",     dimLabel:"Höhe mm",   dimUnit:"",    description:"Eisenbahnschienen S49/UIC54/UIC60, Kranschienen A45–A75 nach EN 13674 · mit Laschen",              produkte: SCHIENEN },
  "stahlnetze":         { id:"stahlnetze",          label:"Stahlnetze & Zäune",     dimLabel:"Masche mm", dimUnit:"",    description:"Maschendraht, Schweißgitter, Zaunpaneele · verzinkt und lackiert nach EN 10223",                    produkte: STAHLNETZE },
  "schmiedeteile":      { id:"schmiedeteile",       label:"Schmiedeteile",          dimLabel:"Ø mm",      dimUnit:"",    description:"Schmiedringe, -stücke und Rohrschüsse · S355J2, C45 nach EN 10243",                                 produkte: SCHMIEDETEILE },
  "spundwand":          { id:"spundwand",           label:"Spundwand & Pfähle",     dimLabel:"Breite mm", dimUnit:"",    description:"Spundbohlen AZ/Larssen · S355GP nach EN 10248 · Schraubpfähle verzinkt",                            produkte: SPUNDWAND },
  "knueppel":           { id:"knueppel",            label:"Knüppel / Rohling",      dimLabel:"Seite mm",  dimUnit:"",    description:"Stranggussknüppel und Brammen · S235JR, S355J2 nach EN 10060",                                      produkte: KNUEPPEL },
  "verbrauchsmaterial": { id:"verbrauchsmaterial",  label:"Verbrauchsmaterial",     dimLabel:"Ø mm",      dimUnit:"",    description:"Schweißelektroden, Trennscheiben, Anschlagmittel nach EN ISO 2560 / EN 12413 / EN 1492",            produkte: VERBRAUCHSMATERIAL },
  "schrott":            { id:"schrott",             label:"Schrott",                dimLabel:"Sorte",     dimUnit:"",    description:"Stahlschrott, Gussschrott, Edelstahlschrott und Aluschrott nach EN ISO 17225",                     produkte: SCHROTT },
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function getKategorie(id: string): KatalogKategorie | undefined {
  return KATALOG[id];
}

export function formatPreis(eur: number): string {
  return eur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatTonne(eurKg: number): string {
  return Math.round(eurKg * 1000).toLocaleString("de-DE");
}

export function formatDim(dim: number, unit: string): string {
  if (dim === 0) return "—";
  return `${unit}${dim}`;
}

export function formatLaenge(l: number): string {
  if (l === 0) return "Coil";
  return l.toLocaleString("de-DE") + " mm";
}
