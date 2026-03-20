// ─── Typen ────────────────────────────────────────────────────────────────────

export interface FertilizerProduct {
  id:              string;
  name:            string;
  formel:          string;       // chemische Formel
  naehrstoffe:     string;       // z.B. "60 % K₂O"
  physForm:        string[];     // Granulat, Pulver, Prills …
  anwendung:       string[];     // Bodenbehandlung, Blattdüngung …
  kulturpflanzen:  string[];
  bodentyp:        string[];
  verpackung:      string[];
  zertifizierung:  string[];
  beschreibung:    string;
}

export interface FertilizerFilters {
  anwendung:      string[];
  kulturpflanze:  string[];
  physForm:       string[];
  verpackung:     string[];
  zertifizierung: string[];
}

export interface FertiCategory {
  id:          string;
  label:       string;
  description: string;
  filters:     FertilizerFilters;
  products:    FertilizerProduct[];
}

// ─── Kategorien ───────────────────────────────────────────────────────────────

export const FERTILIZER_CATEGORIES: FertiCategory[] = [

  // ── 1. Kaliumdünger ─────────────────────────────────────────────────────────
  {
    id:          "kaliumduenger",
    label:       "Kaliumdünger",
    description: "Kaliumdünger steigern die Photosynthese, verbessern die Wasseraufnahme und erhöhen die Widerstandsfähigkeit der Pflanzen. Geeignet für nahezu alle Kulturpflanzen außer chloridempfindlichen Sorten.",
    filters: {
      anwendung:      ["Bodenbehandlung", "Fertigation", "Blattdüngung"],
      kulturpflanze:  ["Getreide", "Gemüse", "Obst", "Zuckerrüben", "Kartoffeln", "Mais", "Raps"],
      physForm:       ["Granulat", "Pulver", "Kristalle"],
      verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
      zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
    },
    products: [
      {
        id:             "kaliumsalz-60",
        name:           "Kaliumsalz 60%",
        formel:         "KCl",
        naehrstoffe:    "60 % K₂O",
        physForm:       ["Granulat", "Körnung"],
        anwendung:      ["Bodenbehandlung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Zuckerrüben", "Mais", "Raps"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "REACH"],
        beschreibung:   "Einer der meistverwendeten Kaliumdünger weltweit. Kaliumsalz 60 % beschleunigt die Photosynthese, steigert die Ernteerträge und verbessert die Qualität der Kulturfrüchte. Besonders geeignet für Böden mit Kaliummangel.",
      },
      {
        id:             "kaliumchlorid-pulver",
        name:           "Kaliumchlorid 60% Pulver",
        formel:         "KCl",
        naehrstoffe:    "60 % K₂O",
        physForm:       ["Pulver"],
        anwendung:      ["Bodenbehandlung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Mais", "Gemüse", "Zuckerrüben"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "REACH"],
        beschreibung:   "Feingemahlenes Kaliumchlorid mit 60 % K₂O-Gehalt. Geeignet für alle Bodentypen und die meisten Kulturen, ausgenommen chloridempfindliche Pflanzen. Schnelle Auflösung im Boden für sofortige Nährstoffverfügbarkeit.",
      },
      {
        id:             "kaliumnitrat-nop",
        name:           "Kaliumnitrat (NOP)",
        formel:         "KNO₃",
        naehrstoffe:    "46 % K₂O · 13 % N",
        physForm:       ["Granulat", "Kristalle", "Pulver"],
        anwendung:      ["Bodenbehandlung", "Blattdüngung", "Fertigation"],
        kulturpflanzen: ["Obst", "Gemüse", "Kartoffeln", "Tabak", "Zierpflanzen"],
        bodentyp:       ["Alle Bodentypen", "Sandige Böden", "Lehmige Böden"],
        verpackung:     ["25 kg Sack", "Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "Kaliumnitrat (Nitrate of Potassium) kombiniert Kalium und Stickstoff in einer chloridfreien Formulierung. Breit einsetzbar in der Landwirtschaft, im Gartenbau und in der Industrie. Ideal für chloridempfindliche Kulturen und Präzisionsdüngung.",
      },
      {
        id:             "mop-weiss",
        name:           "Weißes MOP (Muriate of Potash)",
        formel:         "KCl",
        naehrstoffe:    "60 % K₂O",
        physForm:       ["Granulat", "Pulver"],
        anwendung:      ["Bodenbehandlung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Mais", "Zuckerrüben", "Raps", "Gemüse"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "REACH"],
        beschreibung:   "Hochwertiges, feingranuliertes Kaliumchlorid in weißer Ausführung. Besonders rein und für den Präzisionsanbau konzipiert. Gleichmäßige Partikelgröße ermöglicht exakte Ausbringung mit modernen Düngerstreuern.",
      },
    ],
  },

  // ── 2. NPK-Dünger ───────────────────────────────────────────────────────────
  {
    id:          "npk-duenger",
    label:       "NPK-Dünger",
    description: "Mehrkomponentige Mineraldünger, die Stickstoff, Phosphor und Kalium in einer ausgewogenen Formulierung vereinen. Ideal für alle Feldkulturen und Grünfutter auf kaliumarmen Böden.",
    filters: {
      anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung", "Herbstbehandlung"],
      kulturpflanze:  ["Getreide", "Grünfutter", "Raps", "Mais", "Gemüse", "Zuckerrüben"],
      physForm:       ["Granulat", "Prills"],
      verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
      zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
    },
    products: [
      {
        id:             "npk-15-15-15",
        name:           "NPK 15-15-15",
        formel:         "N-P₂O₅-K₂O",
        naehrstoffe:    "15 % N · 15 % P₂O₅ · 15 % K₂O",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung", "Herbstbehandlung"],
        kulturpflanzen: ["Getreide", "Grünfutter", "Gemüse", "Mais", "Raps", "Zuckerrüben"],
        bodentyp:       ["Kaliumarme Böden", "Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "NPK 15-15-15 ist ein mehrkomponentiger fester anorganischer Mikronährstoffdünger mit ausgewogenem Verhältnis aller drei Hauptnährstoffe. Universell einsetzbar für alle Feldkulturen und Grünfutter, besonders auf kaliumarmen Böden und bei Kulturen mit hohem Kaliumbedarf.",
      },
      {
        id:             "npk-20-10-10",
        name:           "NPK 20-10-10",
        formel:         "N-P₂O₅-K₂O",
        naehrstoffe:    "20 % N · 10 % P₂O₅ · 10 % K₂O",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung"],
        kulturpflanzen: ["Getreide", "Grünfutter", "Mais", "Raps", "Zuckerrüben"],
        bodentyp:       ["Kaliumarme Böden", "Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "NPK 20-10-10 ist ein stickstoffbetonter mehrkomponentiger Mineraldünger. Geeignet für alle Feldkulturen und Grünfutter, besonders wirksam auf kaliumarmen Böden und bei stickstoffintensiven Kulturen. Dosierung gemäß Bodenanalyse.",
      },
      {
        id:             "npk-8-20-30",
        name:           "NPK 8-20-30",
        formel:         "N-P₂O₅-K₂O",
        naehrstoffe:    "8 % N · 20 % P₂O₅ · 30 % K₂O",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Herbstbehandlung"],
        kulturpflanzen: ["Getreide", "Grünfutter", "Kartoffeln", "Zuckerrüben", "Gemüse"],
        bodentyp:       ["Kaliumarme Böden", "Phosphorarme Böden"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "NPK 8-20-30 ist ein phosphor- und kaliumreicher Mehrkomponentendünger für Kulturen mit hohem P- und K-Bedarf. Optimal für Herbstanwendung zur Bodenvorratsdüngung. Dosierung abhängig von Boden-P- und Boden-K-Gehalt gemäß Laboranalyse.",
      },
    ],
  },

  // ── 3. Stickstoffdünger ──────────────────────────────────────────────────────
  {
    id:          "stickstoffduenger",
    label:       "Stickstoffdünger",
    description: "Stickstoffdünger fördern das Pflanzenwachstum und die Blattentwicklung. Geeignet für Frühjahrs- und Sommerdüngung von Kulturpflanzen und Zierpflanzen.",
    filters: {
      anwendung:      ["Bodenbehandlung", "Blattdüngung", "Fertigation"],
      kulturpflanze:  ["Getreide", "Grünfutter", "Mais", "Raps", "Gemüse", "Zierpflanzen", "Rasen"],
      physForm:       ["Prills", "Granulat", "Kristalle"],
      verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
      zertifizierung: ["EU-Verordnung 2019/1009", "EN 13657", "REACH"],
    },
    products: [
      {
        id:             "harnstoff-46",
        name:           "Harnstoff 46%",
        formel:         "CO(NH₂)₂",
        naehrstoffe:    "46 % N (Amidform)",
        physForm:       ["Prills", "Granulat"],
        anwendung:      ["Bodenbehandlung", "Blattdüngung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Mais", "Raps", "Grünfutter", "Gemüse", "Rasen"],
        bodentyp:       ["Alle Bodentypen", "Sandige Böden", "Lehmige Böden", "Tonböden"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13657", "REACH"],
        beschreibung:   "Harnstoff 46 % ist ein pflanzenaufnehmbarer Stickstoffdünger mit 46 % Stickstoff in Amidform — dem höchsten Stickstoffgehalt aller festen Mineraldünger. Vielseitig einsetzbar für Boden- und Blattbehandlung auf allen Bodentypen. Wirtschaftlichster Stickstoffträger im Ackerbau.",
      },
      {
        id:             "ammoniumnitrat",
        name:           "Ammoniumnitrat",
        formel:         "NH₄NO₃",
        naehrstoffe:    "34 % N (je 50 % Ammonium- und Nitratform)",
        physForm:       ["Prills", "Granulat"],
        anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung"],
        kulturpflanzen: ["Getreide", "Mais", "Raps", "Gemüse", "Grünfutter", "Zierpflanzen"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13657", "REACH"],
        beschreibung:   "Ammoniumnitrat ist ein bewährter Stickstoffdünger, ideal für die Düngung von Kulturpflanzen und Zierpflanzen. Empfohlen für Frühjahrs- und Sommereinsatz. Fördert gesundes Pflanzenwachstum durch sofort verfügbares Nitratstickstoff und nachhaltiger Ammoniumform.",
      },
    ],
  },

  // ── 4. Phosphordünger ────────────────────────────────────────────────────────
  {
    id:          "phosphorduenger",
    label:       "Phosphordünger",
    description: "Phosphordünger fördern die Wurzelentwicklung und steigern die Ernteerträge. Besonders geeignet für Getreide und Gemüse sowie phosphorarme Böden.",
    filters: {
      anwendung:      ["Bodenbehandlung", "Saatbettdüngung", "Herbstbehandlung"],
      kulturpflanze:  ["Getreide", "Gemüse", "Mais", "Raps", "Zuckerrüben", "Kartoffeln"],
      physForm:       ["Granulat", "Prills"],
      verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
      zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
    },
    products: [
      {
        id:             "dap-18-46",
        name:           "DAP 18-46",
        formel:         "(NH₄)₂HPO₄",
        naehrstoffe:    "18 % N · 46 % P₂O₅",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Saatbettdüngung", "Herbstbehandlung"],
        kulturpflanzen: ["Getreide", "Gemüse", "Mais", "Raps", "Zuckerrüben", "Kartoffeln"],
        bodentyp:       ["Alle Bodentypen", "Phosphorarme Böden"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "DAP 18-46 (Diammoniumphosphat) ist ein hochwertiger Phosphordünger mit 18 % Stickstoff und 46 % P₂O₅. Fördert eine kräftige Wurzelentwicklung und steigert den Ernteertrag durch die Bereitstellung essentieller Nährstoffe. Empfohlen für Getreide, Gemüse und alle Kulturen mit hohem Phosphorbedarf.",
      },
    ],
  },
];

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function getFertiCategory(id: string): FertiCategory | undefined {
  return FERTILIZER_CATEGORIES.find(c => c.id === id);
}
