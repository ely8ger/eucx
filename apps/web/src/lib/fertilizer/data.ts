// ─── Typen ────────────────────────────────────────────────────────────────────

export interface TechnischeDatenZeile {
  label: string;
  wert:  string;
}

export interface FertilizerProduct {
  id:              string;
  name:            string;
  formel:          string;
  naehrstoffe:     string;
  erscheinung:     string;           // Aussehen / Appearance
  physForm:        string[];
  anwendung:       string[];
  kulturpflanzen:  string[];
  bodentyp:        string[];
  verpackung:      string[];
  zertifizierung:  string[];
  beschreibung:    string;
  technischeDaten: TechnischeDatenZeile[];
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
        erscheinung:    "Rosa oder leicht gefärbte Granulate",
        physForm:       ["Granulat", "Körnung"],
        anwendung:      ["Bodenbehandlung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Zuckerrüben", "Mais", "Raps"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 500 kg", "Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "REACH"],
        beschreibung:   "Kaliumsalz 60 % (Kaliumchlorid mit 60 % K₂O-Gehalt) ist einer der meistverwendeten Kaliumdünger weltweit. Kalium ist einer der Hauptnährstoffe für das Pflanzenwachstum — es steigert die Fruchtbarkeit, beschleunigt die Photosynthese und erhöht die Widerstandsfähigkeit der Pflanzen gegen Krankheiten, Trockenheit und Lagerung. Nicht geeignet für chloridempfindliche Kulturen wie Tabak, Hopfen, Beeren und bestimmte Gemüsesorten.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Rosa oder leicht gefärbte Granulate" },
          { label: "Massenanteil Kalium (als K₂O), %, mind.",        wert: "60" },
          { label: "Massenanteil Wasser, %, max.",                   wert: "0,5" },
          { label: "Granulometrie > 6 mm, %",                        wert: "0" },
          { label: "Granulometrie 1–4 mm, %, mind.",                 wert: "95" },
          { label: "Granulometrie < 1 mm, %, max.",                  wert: "5" },
          { label: "Dynamische Festigkeit, %, mind.",                 wert: "80" },
          { label: "Zerfallsrate, %",                                wert: "100" },
        ],
      },
      {
        id:             "kaliumchlorid-pulver",
        name:           "Kaliumchlorid 60% Pulver",
        formel:         "KCl",
        naehrstoffe:    "60 % K₂O",
        erscheinung:    "Weißes bis leicht rosafarbenes Pulver",
        physForm:       ["Pulver"],
        anwendung:      ["Bodenbehandlung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Mais", "Gemüse", "Zuckerrüben"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "REACH"],
        beschreibung:   "Feingemahlenes Kaliumchlorid mit 60 % K₂O-Gehalt. Geeignet für alle Bodentypen und die meisten Kulturen, ausgenommen chloridempfindliche Pflanzen. Die feine Mahlung ermöglicht schnelle Auflösung im Boden und sofortige Nährstoffverfügbarkeit für die Pflanze.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Weißes bis leicht rosafarbenes Pulver" },
          { label: "Massenanteil Kalium (als K₂O), %, mind.",        wert: "60" },
          { label: "Massenanteil Kaliumchlorid (KCl), %, mind.",     wert: "96,5" },
          { label: "Massenanteil Wasser, %, max.",                   wert: "1,0" },
          { label: "Massenanteil NaCl, %, max.",                     wert: "2,5" },
          { label: "Siebung < 0,16 mm, %, mind.",                   wert: "85" },
        ],
      },
      {
        id:             "kaliumnitrat-nop",
        name:           "Kaliumnitrat (NOP)",
        formel:         "KNO₃",
        naehrstoffe:    "46,1 % K₂O · 13,6 % N",
        erscheinung:    "Weiße Kristalle mit gelblich-grauem Ton",
        physForm:       ["Granulat", "Kristalle", "Pulver"],
        anwendung:      ["Bodenbehandlung", "Blattdüngung", "Fertigation"],
        kulturpflanzen: ["Obst", "Gemüse", "Kartoffeln", "Tabak", "Zierpflanzen"],
        bodentyp:       ["Alle Bodentypen", "Sandige Böden", "Lehmige Böden"],
        verpackung:     ["25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "Kaliumnitrat (Nitrate of Potassium, NOP) ist ein hochwertiger chloridfreier Verbunddünger, der sowohl Kalium als auch Stickstoff enthält. Besonders geeignet für chloridempfindliche Kulturen und den Einsatz in Gewächshäusern. Die hohe Wasserlöslichkeit ermöglicht konzentriertere Lösungen als bei anderen Kaliumdüngern. Einsatz vor oder während der Vegetationsperiode.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Weiße Kristalle mit gelblich-grauem Ton" },
          { label: "Gesamtstickstoff (N), %, mind.",                 wert: "13,6" },
          { label: "Kaliumoxid (K₂O), %, mind.",                    wert: "46,1" },
          { label: "Chlorid-Ion (Cl⁻), %, max.",                    wert: "0,1" },
          { label: "Wasserunlöslicher Rückstand, %, max.",           wert: "0,02" },
          { label: "Wassergehalt, %, max.",                          wert: "0,2" },
        ],
      },
      {
        id:             "mop-weiss",
        name:           "Weißes MOP (Muriate of Potash)",
        formel:         "KCl",
        naehrstoffe:    "62 % K₂O",
        erscheinung:    "Kristalle in Weiß / Grauton",
        physForm:       ["Granulat", "Pulver"],
        anwendung:      ["Bodenbehandlung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Mais", "Zuckerrüben", "Raps", "Gemüse"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 500 kg", "Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "REACH"],
        beschreibung:   "Weißes MOP (Muriate of Potash) ist ein hochwertiges, feingranuliertes Kaliumchlorid in weißer Ausführung. Mit einem K₂O-Gehalt von mindestens 62 % und einem KCl-Gehalt von mindestens 98 % besonders rein. Konzipiert für den Präzisionsanbau — gleichmäßige Partikelgröße für exakte Ausbringung mit modernen Düngerstreuern.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Kristalle in Weiß / Grauton" },
          { label: "Massenanteil K₂O, %, mind.",                    wert: "62,0" },
          { label: "Massenanteil Kaliumchlorid (KCl), %, mind.",     wert: "98,0" },
          { label: "Massenanteil Wasser, %, max.",                   wert: "0,5" },
        ],
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
        erscheinung:    "Graue oder leicht gefärbte Granulate",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung", "Herbstbehandlung"],
        kulturpflanzen: ["Getreide", "Grünfutter", "Gemüse", "Mais", "Raps", "Zuckerrüben"],
        bodentyp:       ["Kaliumarme Böden", "Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "NPK 15-15-15 ist ein mehrkomponentiger fester anorganischer Mineraldünger mit ausgewogenem Verhältnis aller drei Hauptnährstoffe. Universell einsetzbar für alle Feldkulturen und Grünfutter, besonders auf kaliumarmen Böden und bei Kulturen mit hohem Nährstoffbedarf. Dosierung je nach Boden-P- und Boden-K-Gehalt gemäß Laboranalyse.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Graue oder leicht gefärbte Granulate" },
          { label: "Gesamtstickstoff (N), %",                        wert: "15,0" },
          { label: "Phosphorpentoxid (P₂O₅), %",                    wert: "15,0" },
          { label: "Kaliumoxid (K₂O), %",                           wert: "15,0" },
          { label: "Granulometrie 2–5 mm, %, mind.",                 wert: "90" },
          { label: "Granulometrie > 6 mm, %, max.",                  wert: "3" },
          { label: "Granulometrie < 1 mm, %, max.",                  wert: "3" },
          { label: "Dynamische Festigkeit, %, mind.",                 wert: "80" },
        ],
      },
      {
        id:             "npk-20-10-10",
        name:           "NPK 20-10-10",
        formel:         "N-P₂O₅-K₂O",
        naehrstoffe:    "20 % N · 10 % P₂O₅ · 10 % K₂O",
        erscheinung:    "Graue oder leicht gefärbte Granulate",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung"],
        kulturpflanzen: ["Getreide", "Grünfutter", "Mais", "Raps", "Zuckerrüben"],
        bodentyp:       ["Kaliumarme Böden", "Alle Bodentypen"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "NPK 20-10-10 ist ein stickstoffbetonter mehrkomponentiger Mineraldünger. Geeignet für alle Feldkulturen und Grünfutter, besonders wirksam auf kaliumarmen Böden und bei stickstoffintensiven Kulturen wie Getreide und Raps. Dosierung gemäß Bodenanalyse.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Graue oder leicht gefärbte Granulate" },
          { label: "Gesamtstickstoff (N), %",                        wert: "20,0" },
          { label: "Phosphorpentoxid (P₂O₅), %",                    wert: "10,0" },
          { label: "Kaliumoxid (K₂O), %",                           wert: "10,0" },
          { label: "Granulometrie 2–5 mm, %, mind.",                 wert: "90" },
          { label: "Granulometrie > 6 mm, %, max.",                  wert: "3" },
          { label: "Granulometrie < 1 mm, %, max.",                  wert: "3" },
          { label: "Dynamische Festigkeit, %, mind.",                 wert: "80" },
        ],
      },
      {
        id:             "npk-8-20-30",
        name:           "NPK 8-20-30",
        formel:         "N-P₂O₅-K₂O",
        naehrstoffe:    "8 % N · 20 % P₂O₅ · 30 % K₂O",
        erscheinung:    "Graue oder leicht gefärbte Granulate",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Herbstbehandlung"],
        kulturpflanzen: ["Getreide", "Grünfutter", "Kartoffeln", "Zuckerrüben", "Gemüse"],
        bodentyp:       ["Kaliumarme Böden", "Phosphorarme Böden"],
        verpackung:     ["Big Bag 600 kg", "Big Bag 1.000 kg", "25 kg Sack", "50 kg Sack", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "NPK 8-20-30 ist ein phosphor- und kaliumreicher Mehrkomponentendünger für Kulturen mit hohem P- und K-Bedarf. Optimal für Herbstanwendung zur Bodenvorratsdüngung auf phosphor- und kaliumarmen Böden. Dosierung abhängig von der Bodenanalyse.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Graue oder leicht gefärbte Granulate" },
          { label: "Gesamtstickstoff (N), %",                        wert: "8,0" },
          { label: "Phosphorpentoxid (P₂O₅), %",                    wert: "20,0" },
          { label: "Kaliumoxid (K₂O), %",                           wert: "30,0" },
          { label: "Granulometrie 2–5 mm, %, mind.",                 wert: "90" },
          { label: "Granulometrie > 6 mm, %, max.",                  wert: "3" },
          { label: "Granulometrie < 1 mm, %, max.",                  wert: "3" },
          { label: "Dynamische Festigkeit, %, mind.",                 wert: "80" },
        ],
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
        erscheinung:    "Rosa oder leicht gefärbte Granulate (Prills)",
        physForm:       ["Prills", "Granulat"],
        anwendung:      ["Bodenbehandlung", "Blattdüngung", "Fertigation"],
        kulturpflanzen: ["Getreide", "Mais", "Raps", "Grünfutter", "Gemüse", "Rasen"],
        bodentyp:       ["Alle Bodentypen", "Sandige Böden", "Lehmige Böden", "Tonböden"],
        verpackung:     ["Big Bag 500 kg", "Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13657", "REACH"],
        beschreibung:   "Harnstoff 46 % enthält 46 % Stickstoff in Amidform — dem höchsten Stickstoffgehalt aller festen Mineraldünger. Nach Auflösung im Boden wird der Stickstoff zunächst in Ammonium und dann in Nitrat umgewandelt und steht der Pflanze optimal zur Verfügung. Einsetzbar zur Boden- und Blattbehandlung auf allen Bodentypen außer stark alkalischen oder sauren Böden. Wirtschaftlichster Stickstoffträger im Ackerbau.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Rosa oder leicht gefärbte Granulate (Prills)" },
          { label: "Stickstoffgehalt (N), %, mind. (Trockenmasse)",  wert: "46,2" },
          { label: "Biuret-Gehalt, %, max.",                         wert: "0,6" },
          { label: "Wassergehalt (hygroskopisch), %, max.",          wert: "0,3" },
          { label: "Wassergehalt (gesamt), %, max.",                 wert: "0,5" },
          { label: "Granulometrie 1–4 mm, %",                        wert: "95 ± 1,0" },
          { label: "Kornfestigkeit, kgf/Korn, mind.",                wert: "7" },
          { label: "Zerfallsrate, %",                                wert: "100" },
        ],
      },
      {
        id:             "ammoniumnitrat",
        name:           "Ammoniumnitrat",
        formel:         "NH₄NO₃",
        naehrstoffe:    "34,4 % N (Nitrat- + Ammoniumform)",
        erscheinung:    "Granulate in Weiß oder leicht gefärbt, ohne mechanische Verunreinigungen",
        physForm:       ["Prills", "Granulat"],
        anwendung:      ["Bodenbehandlung", "Frühjahrsbehandlung"],
        kulturpflanzen: ["Getreide", "Mais", "Raps", "Gemüse", "Grünfutter", "Zierpflanzen"],
        bodentyp:       ["Alle Bodentypen"],
        verpackung:     ["Big Bag 500 kg", "Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13657", "REACH"],
        beschreibung:   "Ammoniumnitrat ist einer der meistverwendeten Stickstoffdünger, ideal für Kultur- und Zierpflanzen. Enthält Stickstoff in Nitrat- und Ammoniumform für schnelle Pflanzenaufnahme. Fördert Wachstum, Fruchtbarkeit und verlängerte Vegetationsperioden. Behandelt mit einem Antibackmittel zur Verhinderung von Wasseraufnahme und Verklumpung. Empfohlen für Frühjahrs- und Sommereinsatz.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Weiße oder leicht gefärbte Granulate" },
          { label: "Gesamtstickstoff (Nitrat + Ammonium), %, mind.", wert: "34,4" },
          { label: "Wassergehalt (hygroskopisch), %, max.",          wert: "0,3" },
          { label: "Wassergehalt (gesamt), %, max.",                 wert: "0,6" },
          { label: "pH-Wert (10 % wässrige Lösung), mind.",          wert: "5,0" },
          { label: "Granulometrie 2–5 mm, %, mind.",                 wert: "92" },
          { label: "Granulometrie < 1 mm, %, max.",                  wert: "3" },
          { label: "Granulometrie > 6,3 mm, %",                     wert: "0" },
          { label: "Statische Kornfestigkeit, N, mind.",             wert: "8 (0,8 kgf)" },
          { label: "Zerfallsrate, %",                                wert: "100" },
        ],
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
        erscheinung:    "Weiße Kristalle mit gelblich-grauem Ton",
        physForm:       ["Granulat"],
        anwendung:      ["Bodenbehandlung", "Saatbettdüngung", "Herbstbehandlung"],
        kulturpflanzen: ["Getreide", "Gemüse", "Mais", "Raps", "Zuckerrüben", "Kartoffeln"],
        bodentyp:       ["Alle Bodentypen", "Phosphorarme Böden"],
        verpackung:     ["Big Bag 500 kg", "Big Bag 1.000 kg", "Schüttgut"],
        zertifizierung: ["EU-Verordnung 2019/1009", "EN 13647", "REACH"],
        beschreibung:   "DAP 18-46 (Diammoniumphosphat) ist ein hochwertiger Phosphordünger mit 18 % Stickstoff und 46 % P₂O₅. Fördert eine kräftige Wurzelentwicklung und steigert den Ernteertrag durch die Bereitstellung essentieller Nährstoffe. Besonders für Kulturen mit hohem Phosphorbedarf und für die Saatbettdüngung geeignet, da Phosphor die Jugendentwicklung der Pflanze unterstützt.",
        technischeDaten: [
          { label: "Erscheinungsbild",                               wert: "Weiße Kristalle mit gelblich-grauem Ton" },
          { label: "Gesamtstickstoff (N), %",                        wert: "18,0" },
          { label: "Ammoniumstickstoff (NH₄-N), %",                 wert: "18,0" },
          { label: "Phosphorpentoxid (P₂O₅), %",                    wert: "46,0" },
          { label: "Wasserlösliches Schwefeltrioxid (SO₃), %",      wert: "5,0" },
        ],
      },
    ],
  },
];

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function getFertiCategory(id: string): FertiCategory | undefined {
  return FERTILIZER_CATEGORIES.find(c => c.id === id);
}

export function getFertiProduct(katId: string, produktId: string): FertilizerProduct | undefined {
  return getFertiCategory(katId)?.products.find(p => p.id === produktId);
}
