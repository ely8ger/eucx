export type InsightCategory = "lexikon" | "analysen" | "akademie" | "regulatorik";

export interface LexikonSection {
  id: string;
  heading: string;
  body: string;
  sub?: { id: string; heading: string; body: string }[];
  faq?: { q: string; a: string }[];
}

export interface LexikonEntry {
  slug: string;
  term: string;
  shortDef: string;
  description: string;
  category: string;
  readMin: number;
  published: string;
  updated: string;
  sections: LexikonSection[];
  related: string[];
  faq?: { q: string; a: string }[];
  hasPriceChart?: boolean;
  priceData?: { month: string; price: number }[];
  norm?: string;
  unit?: string;
}

export interface AkademieArtikel {
  slug: string;
  title: string;
  description: string;
  readMin: number;
  published: string;
  sections: LexikonSection[];
  faq?: { q: string; a: string }[];
}

export const SECTIONS_META = [
  { key: "lexikon",     label: "Rohstoff-Lexikon",   desc: "Definitionen, Normen und Preishintergründe für alle gehandelten Rohstoffe.", href: "/insights/lexikon",     color: "#154194" },
  { key: "analysen",   label: "Marktanalysen",       desc: "Wöchentliche Preiskommentare und Trendanalysen aus EUCX-Handelssitzungen.",  href: "/insights/analysen",   color: "#166534" },
  { key: "akademie",   label: "Händler-Akademie",    desc: "Praxiswissen für den professionellen B2B-Rohstoffhandel an der Börse.",       href: "/insights/akademie",   color: "#92400e" },
  { key: "regulatorik",label: "EU-Regulatorik",      desc: "MiFID II, OTF-Zulassung, EMIR, CBAM und alle relevanten EU-Regelwerke.",      href: "/insights/regulatorik",color: "#44403c" },
] as const;

export const LEXIKON: LexikonEntry[] = [
  {
    slug: "betonstahl",
    term: "Betonstahl (Bewehrungsstahl)",
    shortDef: "Gerippter Stahl zur Bewehrung von Stahlbeton, Güte B500B nach EN 10080.",
    description: "Alles über Betonstahl: Definition, Normen (EN 10080, B500B), Preisbildung, Einflussfaktoren und aktuelle Marktpreise an der EUCX.",
    category: "Metalle",
    readMin: 10,
    published: "2026-03-01",
    updated: "2026-03-23",
    norm: "EN 10080 · B500B",
    unit: "€/t",
    hasPriceChart: true,
    priceData: [
      { month: "Apr 25", price: 755 }, { month: "Mai 25", price: 748 },
      { month: "Jun 25", price: 741 }, { month: "Jul 25", price: 735 },
      { month: "Aug 25", price: 732 }, { month: "Sep 25", price: 728 },
      { month: "Okt 25", price: 721 }, { month: "Nov 25", price: 714 },
      { month: "Dez 25", price: 710 }, { month: "Jan 26", price: 706 },
      { month: "Feb 26", price: 702 }, { month: "Mär 26", price: 698 },
    ],
    sections: [
      {
        id: "definition",
        heading: "Definition und Eigenschaften",
        body: "Betonstahl (Bewehrungsstahl) ist ein gerippter Stahlstab, der zur Bewehrung von Stahlbeton eingesetzt wird. Er überträgt Zugkräfte im Verbundbaustoff Stahlbeton, während der Beton die Druckkräfte übernimmt. Ohne Bewehrung wäre moderner Hoch- und Ingenieurbau nicht möglich.\n\nDie gängigste Handelsform ist Betonstahl BSt 500S (europäische Bezeichnung: B500B nach EN 10080) mit einer charakteristischen Streckgrenze von 500 N/mm². Lieferbar in Stangen (6–18 m) oder als Coil. Die gerippte Oberfläche sorgt für optimalen Verbund mit dem Beton.",
        sub: [
          {
            id: "definition-abmessungen",
            heading: "Nenndurchmesser und Stabgewichte",
            body: "Genormte Durchmesser: Ø 6, 8, 10, 12, 14, 16, 20, 25, 28, 32, 40 mm. Das theoretische Gewicht ergibt sich aus: G = d² × 0,00617 kg/m. Für Ø 12 mm: 12² × 0,00617 = 0,888 kg/m. Im Handel und an der EUCX wird Betonstahl grundsätzlich in metrischen Tonnen (t) gehandelt."
          },
          {
            id: "definition-normen",
            heading: "Relevante Normen und Zertifizierungen",
            body: "EN 10080: Europäische Norm für Betonstahl. Ersetzt nationale Normen wie DIN 488 (Deutschland).\n\nAlle an der EUCX gehandelten Mengen müssen mit gültigem Werksprüfzeugnis 3.1 nach EN 10204 geliefert werden. CE-Konformitätserklärung (DoP) nach BauPVO ist Pflicht."
          }
        ]
      },
      {
        id: "preisbildung",
        heading: "Preisbildung und Kostentreiber",
        body: "Der Betonstahl-Preis hängt von mehreren Faktoren ab, die sich gegenseitig beeinflussen.",
        sub: [
          {
            id: "preisbildung-schrott",
            heading: "Stahlschrott als Primärkostenfaktor",
            body: "Über 80 % des deutschen Betonstahlvolumens stammt aus Elektrolichtbogenöfen (EAF), die Stahlschrott verwenden. Ein Anstieg des Schrottpreises um 10 €/t erhöht die Produktionskosten für Betonstahl um ca. 8–9 €/t."
          },
          {
            id: "preisbildung-energie",
            heading: "Energiekosten und CO₂",
            body: "EAF-Betriebe benötigen je Tonne Rohstahl ca. 350–400 kWh Strom. Bei einem Strompreis von 80 €/MWh entspricht das 28–32 €/t. CO₂-Zertifikate (EUA) kosten 2026 ca. 60–70 €/t CO₂ — bei 0,4–0,6 t CO₂/t Stahl summiert sich das auf 25–40 €/t."
          },
          {
            id: "preisbildung-import",
            heading: "Importe und Handelsschutz",
            body: "Die EU hat für Betonstahl Schutzmaßnahmen eingeführt (Safeguard-Zölle nach VO (EU) 2019/159, verlängert 2024). Der CBAM-Grenzausgleichsmechanismus (ab 2026 voll wirksam) belastet importierten Betonstahl zusätzlich."
          }
        ]
      },
      {
        id: "handel",
        heading: "Handel und Lieferbedingungen",
        body: "An der EUCX wird Betonstahl in Standardlosen von 25 t (1 Lot) gehandelt. Mindesthandelsmenge: 25 t. Maximale Losgröße: 500 t. Preisstellung in EUR/t (netto), frei Lager Deutschland.",
        sub: [
          {
            id: "handel-incoterms",
            heading: "Incoterms und Lieferkonditionen",
            body: "Der EUCX-Standardkontrakt basiert auf FCA (Free Carrier) ab Lager Deutschland. Lieferzeiten: Lagerware 2–5 Werktage, Werksdirektlieferung 3–6 Wochen."
          },
          {
            id: "handel-qualitaet",
            heading: "Qualitätssicherung und Dokumente",
            body: "Jede EUCX-Transaktion erfordert: Werksprüfzeugnis 3.1 nach EN 10204, CE-Konformitätserklärung (DoP) nach BauPVO, Lieferschein mit exakten Gewichtsangaben."
          }
        ]
      },
      {
        id: "markt-2026",
        heading: "Marktlage 2026",
        body: "Betonstahl-Preise stehen 2026 unter strukturellem Druck. Nach dem Rückgang von Herbst 2024 bis Frühjahr 2026 (-7,5 %) zeichnet sich eine vorsichtige Stabilisierung ab.\n\nEntscheidend sind Baukonjunktur, Schrottpreise, CBAM-Effekt auf Importe und die saisonale Nachfrageerholung ab April."
      },
    ],
    related: ["otf-eucx", "cbam"],
    faq: [
      { q: "Was ist der aktuelle Betonstahl-Preis 2026?", a: "Betonstahl B500B notiert aktuell an der EUCX bei 698,00 €/t (frei Lager Deutschland, netto). Aktualisierung täglich um 08:00 Uhr." },
      { q: "Was bedeutet B500B beim Betonstahl?", a: "B500B bezeichnet die Güte nach EN 10080: B = Betonstahl, 500 = Streckgrenze 500 N/mm², B = hohe Duktilität (Klasse B)." },
      { q: "Wie wird Betonstahl gehandelt?", a: "An der EUCX in Losen à 25 t. Preise in EUR/t (netto), frei Lager Deutschland. Handel täglich Mo–Fr 10–13 Uhr." },
      { q: "Was treibt den Betonstahl-Preis?", a: "Die wichtigsten Faktoren: Schrottpreis, Strompreise, CO₂-Zertifikate, Importvolumen und Baukonjunktur in der EU." },
    ],
  },
  {
    slug: "otf-eucx",
    term: "OTF — Organised Trading Facility",
    shortDef: "Regulierter Handelsplatz nach MiFID II für Nicht-Eigenkapitalinstrumente, insbesondere physische Rohstoffkontrakte.",
    description: "Was ist eine OTF nach MiFID II? Unterschiede zu MTF und RM, BaFin-Zulassung und Handelsmechanismus der EUCX.",
    category: "Regulierung",
    readMin: 8,
    published: "2026-03-01",
    updated: "2026-03-23",
    norm: "MiFID II · Art. 20 RL 2014/65/EU",
    sections: [
      {
        id: "definition",
        heading: "Definition nach MiFID II",
        body: "Eine Organised Trading Facility (OTF) ist eine der drei Kategorien regulierter Handelsplätze nach MiFID II (Richtlinie 2014/65/EU). Sie wurde speziell für Nicht-Eigenkapitalinstrumente konzipiert — Anleihen, strukturierte Finanzprodukte, Emissionszertifikate und Derivate auf physische Waren.\n\nDie EUCX betreibt eine BaFin-zugelassene OTF für physische Industrierohstoffe. Als OTF darf die EUCX das Matching diskretionär durchführen — im Gegensatz zu RM oder MTF.",
        sub: [
          {
            id: "definition-unterschiede",
            heading: "OTF vs. MTF vs. RM — die drei Handelsplatztypen",
            body: "Regulated Market (RM): Klassische Börse. Strikt nicht-diskretionäres Matching. Hauptsächlich Aktien.\n\nMultilateral Trading Facility (MTF): Elektronisches Handelssystem. Nicht-diskretionäres Matching. Aktien, ETFs, Anleihen.\n\nOrganised Trading Facility (OTF): Einzige Kategorie mit diskretionärem Element. Betreiber darf Aufträge ablehnen — muss Interessenkonfliktregeln einhalten. Geeignet für illiquide Märkte wie physische Rohstoffe."
          }
        ]
      },
      {
        id: "zulassung",
        heading: "BaFin-Zulassung und Aufsicht",
        body: "Die EUCX wurde von der BaFin als OTF nach § 2 Abs. 23 WpHG zugelassen. Die Zulassung umfasst Transaktionsreporting nach Art. 26 MiFIR, Pre- und Post-Trade-Transparenzpflichten sowie organisatorische Anforderungen (Compliance, Risikomanagement, IT-Sicherheit nach DORA)."
      },
    ],
    related: ["betonstahl", "cbam"],
    faq: [
      { q: "Was ist der Unterschied zwischen OTF und MTF?", a: "Beim MTF ist das Matching strikt automatisch. Die OTF erlaubt diskretionäres Matching mit strengen Interessenkonfliktregeln." },
      { q: "Ist die EUCX BaFin-reguliert?", a: "Ja. Die EUCX ist eine von der BaFin zugelassene OTF nach § 2 Abs. 23 WpHG i.V.m. Art. 20 MiFID II." },
    ],
  },
  {
    slug: "cbam",
    term: "CBAM — Carbon Border Adjustment Mechanism",
    shortDef: "EU-Grenzausgleichsmechanismus für CO₂-intensive Importwaren: Stahl, Aluminium, Zement, Düngemittel, Energie.",
    description: "Der EU CBAM ab 2026: Wer zahlt? Was sind CBAM-Zertifikate? Welche Auswirkungen hat CBAM auf Stahlpreise und Düngemittelpreise?",
    category: "Regulierung",
    readMin: 7,
    published: "2026-03-01",
    updated: "2026-03-23",
    norm: "VO (EU) 2023/956",
    sections: [
      {
        id: "was-ist-cbam",
        heading: "Was ist der CBAM?",
        body: "Der Carbon Border Adjustment Mechanism (CBAM, VO (EU) 2023/956) ist ein CO₂-Grenzausgleich der EU. Ziel: Carbon Leakage verhindern. Ab 1. Januar 2026 müssen Importeure aus CBAM-Sektoren Zertifikate kaufen — entsprechend den CO₂-Emissionen bei der Herstellung.",
        sub: [
          {
            id: "cbam-sektoren",
            heading: "Betroffene Sektoren ab 2026",
            body: "Stahl/Eisen (HS 72, 73): Betonstahl, Walzdraht, Träger, Bleche\nAluminium (HS 76)\nZement (HS 2523)\nDüngemittel (HS 31): Harnstoff, Ammoniumnitrat, NPK\nStrom, Wasserstoff\n\nFür EUCX-Händler relevant: Stahl und Düngemittel."
          },
          {
            id: "cbam-preis",
            heading: "CBAM-Preis und Berechnung",
            body: "CBAM-Zertifikatspreis = wöchentlicher EUA-Durchschnitt. Bei EUA 65 €/t CO₂ und 1,8 t CO₂/t Rohstahl: CBAM-Aufschlag 117 €/t für importierten Stahl ohne CO₂-Bepreisung im Ursprungsland. Das entspricht ca. 15–17 % Aufschlag auf den aktuellen Betonstahl-Preis."
          }
        ]
      },
      {
        id: "auswirkungen",
        heading: "Auswirkungen auf den Rohstoffmarkt",
        body: "CBAM verändert die Wettbewerbslandschaft. Importeure aus China, Indien, Türkei, Ukraine werden belastet. EU-Erzeuger mit niedrigem CO₂-Fußabdruck (Elektrostahl) profitieren.\n\nBetonstahl: Importdruck sinkt — stützend für EU-Preise. Harnstoff/AN: Importe aus Russland, Ägypten teurer. Schrott: Als CO₂-armer Einsatzstoff wertvoller."
      },
    ],
    related: ["betonstahl", "otf-eucx"],
    faq: [
      { q: "Ab wann gilt CBAM vollständig?", a: "Ab 1. Januar 2026. Übergangsphase (nur Berichtspflicht) lief Oktober 2023 bis Dezember 2025." },
      { q: "Betrifft CBAM auch Stahlschrott?", a: "Nein. CBAM gilt für verarbeitete Erzeugnisse (Betonstahl, Bleche), nicht für Schrott als Rohmaterial." },
    ],
  },
  // --- Neue Einträge ---
  {
    slug: "lme-notierung",
    term: "LME-Notierung",
    shortDef: "Die London Metal Exchange (LME) ist die weltweit wichtigste Terminbörse für Nichteisenmetalle. Ihre täglichen Official Prices gelten als globale Referenzkurse.",
    description: "LME Official Price, Settlement Price, Ring Trading und Relevanz für EUCX-Händler erklärt.",
    category: "Märkte",
    readMin: 6,
    published: "2026-03-23",
    updated: "2026-03-23",
    sections: [
      {
        id: "was-ist-lme",
        heading: "Was ist die LME?",
        body: "Die London Metal Exchange (LME) wurde 1877 gegründet und ist heute Teil der Hong Kong Exchanges and Clearing (HKEX). Sie betreibt Terminmärkte für Aluminium, Kupfer, Zink, Blei, Nickel, Zinn und weitere Metalle. Der tägliche LME Official Price entsteht durch das sogenannte Ring Trading – ein physisches Auktionsverfahren, das auch im digitalen Zeitalter beibehalten wurde.",
      },
      {
        id: "official-price",
        heading: "Official Price vs. Settlement Price",
        body: "Der LME Official Price wird zweimal täglich im Ring festgestellt (Vormittag/Nachmittag). Der Cash Settlement Price gilt für Kassageschäfte (Lieferung in 2 Werktagen). Für Terminkontrakte existieren standardisierte Laufzeiten: 3 Monate, 15 Monate und bis zu 63 Monate (abhängig vom Metall).",
      },
      {
        id: "relevanz-eucx",
        heading: "Relevanz für EUCX-Handelspreise",
        body: "Auf der EUCX-Plattform werden Stahlprodukte wie Betonstahl (Rebar) und Walzdraht (Wire Rod) nicht direkt über die LME gehandelt. Dennoch dienen LME-Kupfer- und Aluminiumpreise als wichtige Korrekturfaktoren für Legierungszuschläge bei Stahlprodukten. Händler nutzen LME-Kurse zur Absicherung (Hedging) ihrer Rohstoffpositionen.",
      },
      {
        id: "faq",
        heading: "Häufige Fragen",
        body: "",
        faq: [
          { q: "Wie oft werden LME-Preise veröffentlicht?", a: "Zweimal täglich: um 12:30 Uhr (Kerb-Notierung) und 16:00 Uhr GMT (Official Price und Settlement Price)." },
          { q: "Sind LME-Preise in Euro oder USD?", a: "LME-Notierungen erfolgen primär in USD/t. Die EUCX zeigt Äquivalente in EUR/t basierend auf dem EZB-Referenzkurs." },
          { q: "Kann ich über EUCX direkt LME-Kontrakte handeln?", a: "Nein. EUCX ist ein OTF für physische Rohstoffe in der EU. Für LME-Futures benötigen Sie einen LME-zugelassenen Broker." },
        ],
      },
    ],
    related: ["otf-eucx", "betonstahl"],
  },
  {
    slug: "incoterms-2020",
    term: "Incoterms 2020",
    shortDef: "Die Incoterms 2020 der ICC regeln Lieferbedingungen im internationalen Warenhandel. Sie definieren, wer Kosten, Risiko und Transportverantwortung trägt.",
    description: "Incoterms 2020 kompakt: alle 11 Klauseln, Praxisrelevanz im Stahlhandel und Bedeutung auf der EUCX-Plattform.",
    category: "Handel",
    readMin: 8,
    published: "2026-03-23",
    updated: "2026-03-23",
    sections: [
      {
        id: "einfuehrung",
        heading: "Was sind Incoterms?",
        body: "International Commercial Terms (Incoterms) sind standardisierte Lieferklauseln der Internationalen Handelskammer (ICC, Paris). Die aktuelle Version Incoterms 2020 (in Kraft seit 1. Januar 2020) umfasst 11 Klauseln, die in zwei Gruppen unterteilt sind: Klauseln für alle Verkehrsmittel und Klauseln ausschließlich für See- und Binnenschifffahrt.",
      },
      {
        id: "klauseln-alle",
        heading: "Klauseln für alle Transportmittel",
        body: "EXW (Ex Works): Verkäufer stellt Ware bereit, Käufer trägt alle Kosten und Risiken ab Werk. FCA (Free Carrier): Verkäufer liefert an benannten Ort/Spediteur. CPT (Carriage Paid To): Verkäufer zahlt Fracht bis Bestimmungsort. CIP (Carriage and Insurance Paid To): Wie CPT, aber mit erhöhter Versicherungspflicht (ICC-A). DAP (Delivered At Place): Verkäufer trägt alle Risiken bis Bestimmungsort. DPU (Delivered at Place Unloaded): Neu in 2020, Verkäufer trägt auch Entladekosten. DDP (Delivered Duty Paid): Maximale Verpflichtung des Verkäufers inkl. Zoll.",
      },
      {
        id: "klauseln-see",
        heading: "Klauseln für See/Binnenschiff",
        body: "FAS (Free Alongside Ship): Ware neben Schiff am Verladehafen. FOB (Free on Board): Gefahrübergang mit Überschreiten der Schiffsreling – der Klassiker im Rohstoffhandel. CFR (Cost and Freight): Verkäufer zahlt Fracht, Gefahr geht mit FOB über. CIF (Cost, Insurance and Freight): Wie CFR, aber mit Mindestversicherung (ICC-C).",
      },
      {
        id: "eucx-praxis",
        heading: "Praxisrelevanz auf EUCX",
        body: "Auf der EUCX-Plattform werden Angebote standardmäßig mit DAP Empfängeranschrift (Deutschland/EU) quotiert. Verkäufer können alternativ EXW Werksabgabe oder FCA Bahnhof/Hafen wählen. Die Klausel beeinflusst direkt den Vergleichspreis: Ein DAP-Angebot zu 710 €/t ist bei gleicher Qualität teurer als EXW 695 €/t, wenn die Transportkosten 10 €/t betragen.",
      },
      {
        id: "faq",
        heading: "Häufige Fragen",
        body: "",
        faq: [
          { q: "Welche Incoterm-Klausel ist im Stahlhandel am gebräuchlichsten?", a: "DAP (Delivered At Place) und EXW (Ex Works) dominieren den innereuropäischen Stahlhandel. FOB wird hauptsächlich für Überseetransporte verwendet." },
          { q: "Sind Incoterms rechtlich verbindlich?", a: "Nur wenn sie ausdrücklich im Vertrag vereinbart werden. Die ICC empfiehlt den Zusatz 'Incoterms 2020' zur Klarstellung der Regelversion." },
          { q: "Was hat sich in Incoterms 2020 geändert?", a: "Hauptänderungen: DPU ersetzt DAT; FCA erlaubt nun Bordkonnossement; CIP wurde auf ICC-A-Versicherungsstandard angehoben." },
        ],
      },
    ],
    related: ["betonstahl", "otf-eucx"],
  },
  {
    slug: "abwicklungsgarantie",
    term: "Abwicklungsgarantie",
    shortDef: "Die Abwicklungsgarantie (Settlement Guarantee) sichert Handelstransaktionen ab und schützt beide Vertragsparteien vor Gegenparteiausfällen.",
    description: "Wie funktioniert die Abwicklungsgarantie auf EUCX? Margin-Typen, Ausfallfonds und rechtliche Grundlagen erklärt.",
    category: "Regulierung",
    readMin: 5,
    published: "2026-03-23",
    updated: "2026-03-23",
    norm: "§ 72 WpHG · Art. 20 MiFID II",
    sections: [
      {
        id: "definition",
        heading: "Definition und rechtliche Grundlage",
        body: "Die Abwicklungsgarantie (engl. Settlement Guarantee) ist eine rechtsverbindliche Zusage, dass eine Transaktion auf einem organisierten Handelssystem (OTF) vollständig abgewickelt wird – unabhängig davon, ob eine der Vertragsparteien ihren Verpflichtungen nachkommt. Rechtsgrundlage: § 72 WpHG i.V.m. Art. 20 MiFID II. Die EUCX GmbH als OTF-Betreiberin ist verpflichtet, geeignete Mechanismen zur Sicherung der Handelsabwicklung vorzuhalten.",
      },
      {
        id: "mechanismus",
        heading: "Funktionsweise auf EUCX",
        body: "Vor Handelszulassung: Jeder Marktteilnehmer hinterlegt eine Sicherheitsleistung (Initial Margin) in Höhe von min. 5 % des zugelassenen Handelsvolumens. Bei Ordereingabe: Das System prüft automatisch die verfügbare Margin. Kontrakte ohne ausreichende Deckung werden abgewiesen. Bei Vertragsabschluss: Eine Abwicklungsbestätigung wird bilateral versendet. Die Lieferverpflichtung wird im EUCX-Settlement-System hinterlegt. Bei Ausfall einer Partei: Der Ausfallfonds der EUCX deckt Schäden bis 2 Mio. EUR je Einzelfall. Darüber hinaus greift die Berufshaftpflichtversicherung (Allianz, 5 Mio. EUR je Fall).",
      },
      {
        id: "margin-typen",
        heading: "Initial Margin vs. Variation Margin",
        body: "Initial Margin: Einmalige Sicherheitsleistung bei Kontoeröffnung. Variation Margin: Tägliche Mark-to-Market-Anpassung bei offenen Positionen (nur für Terminkontrakte). Maintenance Margin: Unterschreitung löst automatischen Margin Call aus.",
      },
      {
        id: "faq",
        heading: "Häufige Fragen",
        body: "",
        faq: [
          { q: "Was passiert, wenn ein Käufer nicht zahlt?", a: "EUCX aktiviert das Ausfallverfahren: Margin wird eingezogen, offene Position wird über den Markt geschlossen, Differenz wird aus dem Ausfallfonds gedeckt." },
          { q: "Wie hoch ist die Initial Margin bei EUCX?", a: "Standardmäßig 5 % des genehmigten Handelsvolumens, mindestens jedoch 10.000 EUR. Für volatile Rohstoffe kann die Margin auf bis zu 15 % angehoben werden." },
          { q: "Ist meine Margin-Einlage verzinst?", a: "Ja. EUCX verzinst Margin-Einlagen zum aktuellen EZB-Einlagezinssatz abzüglich 0,25 %." },
        ],
      },
    ],
    related: ["otf-eucx", "cbam"],
  },
  {
    slug: "cbam-detail",
    term: "CBAM – Carbon Border Adjustment Mechanism (vertieft)",
    shortDef: "Der CO₂-Grenzausgleichsmechanismus (CBAM) der EU ab 2026 macht Kohlenstoffemissionen bei importierten Waren bepreisbar.",
    description: "CBAM vertieft: Betroffene Warengruppen, Berechnung, Zeitplan und Bedeutung für den EUCX-Handel.",
    category: "Regulierung",
    readMin: 10,
    published: "2026-03-23",
    updated: "2026-03-23",
    norm: "VO (EU) 2023/956",
    sections: [
      {
        id: "ueberblick",
        heading: "Was ist CBAM?",
        body: "Der Carbon Border Adjustment Mechanism (CBAM) ist ein EU-Instrument, das ab dem 1. Januar 2026 (Übergangsphase seit Oktober 2023) CO₂-Preise auf importierte Waren erhebt, die in der EU keinem vergleichbaren CO₂-Preis unterliegen. Ziel: Verhinderung von 'Carbon Leakage' – also der Verlagerung emissionsintensiver Produktion in Länder mit geringeren Klimaschutzauflagen. Rechtsgrundlage: Verordnung (EU) 2023/956.",
      },
      {
        id: "betroffene-waren",
        heading: "Betroffene Warengruppen",
        body: "Sektor 1 – Stahl und Eisen: CN-Codes 7206–7229, inkl. Betonstahl, Walzdraht, Stahlbrammen. Sektor 2 – Aluminium: Primär- und Sekundäraluminium, Aluminiumprodukte. Sektor 3 – Zement: Alle Portlandzementvarianten. Sektor 4 – Düngemittel: Stickstoffdünger, Ammoniumnitrat, Harnstoff. Sektor 5 – Strom: Importierter Strom aus Nicht-EU-Ländern. Sektor 6 – Wasserstoff: Grauer und blauer Wasserstoff. Erweiterung bis 2030: Kommission prüft Ausweitung auf weitere energieintensive Sektoren.",
      },
      {
        id: "berechnung",
        heading: "Berechnung des CBAM-Preises",
        body: "CBAM-Preis = Eingebettete Emissionen (tCO₂e/t Ware) × EUA-Wochenpreis (€/tCO₂e). Beispiel Betonstahl (Import aus der Türkei): Durchschnittliche Emissionen Türkei: ca. 1,8 tCO₂/t Stahl. EU-ETS-Preis (EUA): ca. 65 €/tCO₂ (Stand Q1 2026). CBAM-Aufschlag: 1,8 × 65 = 117 €/t. Bei einem Importpreis von 620 €/t entspricht das einem Aufschlag von ca. +18,9 %. Dies verschiebt die Wettbewerbssituation deutlich zugunsten EU-produzierter Ware.",
      },
      {
        id: "zeitplan",
        heading: "Implementierungszeitplan",
        body: "Oktober 2023 – Dezember 2025: Übergangsphase (nur Berichtspflicht, keine Zahlungen). Ab 1. Januar 2026: CBAM-Zertifikate werden kostenpflichtig. 2026–2034: Parallele Phase – EU-ETS-Freiallokationen werden schrittweise abgebaut. Ab 2034: Vollständige CBAM-Implementierung, Ende der Freiallokationen für betroffene Sektoren.",
      },
      {
        id: "eucx-relevanz",
        heading: "Bedeutung für den EUCX-Handel",
        body: "Auf EUCX werden ausschließlich Waren gehandelt, die bereits in der EU produziert oder ordnungsgemäß importiert (inkl. CBAM-Zertifikat) wurden. CBAM-Pflichten liegen beim Importeur, nicht bei EUCX. Händler, die Nicht-EU-Stahl auf EUCX anbieten, müssen beim Angebotseintrag den CBAM-Compliance-Status dokumentieren. Das System markiert CBAM-pflichtige Angebote automatisch und zeigt den geschätzten CO₂-Aufschlag im Preisvergleich.",
      },
      {
        id: "faq",
        heading: "Häufige Fragen",
        body: "",
        faq: [
          { q: "Gilt CBAM auch für EU-interne Transporte?", a: "Nein. CBAM betrifft ausschließlich Waren, die aus Drittstaaten in die EU importiert werden. Intra-EU-Handel unterliegt dem EU-ETS, nicht CBAM." },
          { q: "Wie erhalte ich CBAM-Zertifikate?", a: "CBAM-Zertifikate werden über das EU-CBAM-Register (cbam.ec.europa.eu) erworben. Der Preis richtet sich nach dem wöchentlichen EUA-Durchschnittspreis." },
          { q: "Was droht bei Verstößen gegen CBAM-Berichtspflichten?", a: "Während der Übergangsphase: Verwarnungen. Ab 2026: Sanktionen von 10–50 EUR je nicht gemeldeter tCO₂e (Verordnung (EU) 2023/956, Art. 26)." },
          { q: "Betrifft CBAM auch Recycling-Stahl (EAF)?", a: "Ja, aber mit reduziertem CO₂-Faktor. Elektrostahlwerke (EAF) haben typischerweise 0,3–0,6 tCO₂/t gegenüber 1,6–2,2 tCO₂/t bei Hochofenroute." },
        ],
      },
    ],
    related: ["otf-eucx", "abwicklungsgarantie", "betonstahl"],
  },
  {
    slug: "mifid-ii-otf",
    term: "MiFID II & OTF – Regulierung organisierter Handelssysteme",
    shortDef: "MiFID II definiert OTF als dritte Kategorie organisierter Handelsplätze neben Regulated Markets und MTFs. EUCX operiert als BaFin-lizenzierter OTF.",
    description: "MiFID II, OTF-Definition, Pflichten des OTF-Betreibers und Unterschiede zu RM und MTF kompakt erklärt.",
    category: "Regulierung",
    readMin: 9,
    published: "2026-03-23",
    updated: "2026-03-23",
    norm: "RL 2014/65/EU · MiFIR (EU) 600/2014",
    sections: [
      {
        id: "mifid-ueberblick",
        heading: "MiFID II im Überblick",
        body: "Die Richtlinie 2014/65/EU (MiFID II, Markets in Financial Instruments Directive II) ist seit 3. Januar 2018 in Kraft und gilt als umfassendstes Regelwerk für Finanzmärkte in der EU. Kernziele: Marktintegrität, Anlegerschutz, Transparenz und Effizienz. Ergänzt durch MiFIR (Verordnung (EU) 600/2014) für Transparenzpflichten und Transaktionsmeldungen.",
      },
      {
        id: "otf-definition",
        heading: "Was ist ein OTF?",
        body: "Organised Trading Facility (OTF) ist eine durch MiFID II neu geschaffene, dritte Kategorie organisierter Handelsplätze (Art. 4 Abs. 1 Nr. 23 MiFID II). Kernmerkmal: Ermessensspielraum des Betreibers bei der Auftragsausführung (im Gegensatz zu Regulated Markets und MTFs). Zulässige Instrumente: Anleihen, strukturierte Finanzprodukte, Emissionszertifikate und Derivate – sowie physische Rohstoffe (Commodity OTF nach § 72 WpHG). EUCX operiert als Commodity OTF mit BaFin-Erlaubnis Nr. 10155.IV.7.0001/2025.",
      },
      {
        id: "pflichten-betreiber",
        heading: "Pflichten des OTF-Betreibers",
        body: "Transparenzpflichten: Pre-Trade (Veröffentlichung von Quotes/Order-Buch) und Post-Trade (Meldung aller Transaktionen). Transaktionsmeldung: Alle Geschäfte müssen gemäß Art. 26 MiFIR an die BaFin gemeldet werden. Best Execution: Pflicht zur bestmöglichen Ausführung von Kundenaufträgen. Interessenkonflikt-Management: OTF-Betreiber darf nicht eigenes Kapital einsetzen. Organisationspflichten: Compliance-Funktion, Risikomanagement, IT-Sicherheit nach DORA.",
      },
      {
        id: "unterschiede",
        heading: "OTF vs. RM vs. MTF",
        body: "Regulated Market (RM): Vollständig automatisiertes Matching, kein Ermessen, z.B. XETRA. Multilateral Trading Facility (MTF): Ähnlich RM, aber flexibler, z.B. Tradegate. Organised Trading Facility (OTF): Ermessen bei Ausführung erlaubt, ideal für weniger liquide oder komplexe Rohstoffmärkte. EUCX nutzt den OTF-Rahmen, weil physische Rohstoffmengen oft individuell ausgehandelt werden und keine vollautomatisierte Ausführung ermöglichen.",
      },
      {
        id: "faq",
        heading: "Häufige Fragen",
        body: "",
        faq: [
          { q: "Benötige ich als Händler eine eigene MiFID-II-Lizenz?", a: "Nein, wenn Sie ausschließlich als Kunde/Marktteilnehmer auf EUCX handeln und nicht systematisch Eigenhandel betreiben. Die MiFID-II-Lizenz liegt beim OTF-Betreiber (EUCX GmbH)." },
          { q: "Was ist der Unterschied zwischen MiFID II und MiFIR?", a: "MiFID II ist eine Richtlinie (muss in nationales Recht umgesetzt werden), MiFIR ist eine Verordnung (gilt unmittelbar in der EU). Beide Rechtsakte ergänzen sich." },
          { q: "Welche Pflichten habe ich als Marktteilnehmer auf EUCX?", a: "Sie müssen sich registrieren, KYC/AML-Prüfung absolvieren, Handelsvolumengrenzen einhalten und auf Anfrage Transaktionsnachweise bereitstellen." },
          { q: "Gilt auf EUCX Best Execution?", a: "Ja. EUCX ist verpflichtet, für jeden Auftrag die bestmögliche Ausführung sicherzustellen und die Ausführungsqualität regelmäßig zu überwachen (Art. 27 MiFID II)." },
        ],
      },
    ],
    related: ["otf-eucx", "abwicklungsgarantie", "cbam"],
  },
];

export const AKADEMIE_ARTIKEL: AkademieArtikel[] = [
  {
    slug: "digitaler-rohstoffhandel-eu",
    title: "Der digitale Rohstoffhandel in der EU: Von der Ausschreibung bis zum Clearing",
    description: "Schritt-für-Schritt-Leitfaden für professionellen B2B-Rohstoffhandel an einer europäischen Warenbörse: Auktionsmodelle, Orderbuch-Mechanik, Kautionen, Vertragsschluss und Clearing.",
    readMin: 18,
    published: "2026-03-15",
    sections: [
      {
        id: "einfuehrung",
        heading: "Einführung: Warum digitale Warenbörsen?",
        body: "Der physische Rohstoffhandel in der EU war bis vor wenigen Jahren stark fragmentiert: Preise wurden bilateral verhandelt, oft telefonisch oder per E-Mail. Informationsasymmetrien begünstigten etablierte Marktteilnehmer. Kleinen und mittleren Unternehmen fehlte der Zugang zu transparenten Marktpreisen.\n\nDigitale Warenbörsen wie die EUCX lösen dieses Problem durch ein zentrales, elektronisches Orderbuch. Alle Teilnehmer sehen dieselben Preise — Käufer und Verkäufer werden automatisch zusammengeführt. Das Ergebnis: Engere Spreads, faire Preisbildung und rechtssichere Vertragsschlüsse.",
        sub: [
          {
            id: "einfuehrung-vorteile",
            heading: "Vorteile gegenüber dem OTC-Handel",
            body: "Preistransparenz: Bid/Ask für alle Teilnehmer sichtbar. Kein Informationsnachteil für kleine Käufer.\n\nRechtssicherheit: Vertragsschluss durch Matching ist unwiderruflich und durch die EUCX-AGB gedeckt.\n\nEffizienz: Matching in Millisekunden statt stundenlangen Verhandlungen.\n\nRegulatorische Sicherheit: OTF-Regulierung nach MiFID II schützt alle Teilnehmer."
          }
        ]
      },
      {
        id: "zugang",
        heading: "Zugang und Onboarding",
        body: "Nur geprüfte Unternehmen (B2B) erhalten Zugang zur EUCX. Das Onboarding-Verfahren umfasst KYC (Know Your Customer) und AML-Prüfung nach dem Geldwäschegesetz.",
        sub: [
          {
            id: "zugang-kyc",
            heading: "KYC-Anforderungen im Detail",
            body: "Für die Zulassung benötigt die EUCX:\n1. Handelsregisterauszug (nicht älter als 3 Monate)\n2. Ausweisdokument aller wirtschaftlich Berechtigten (>25 % Anteil)\n3. Nachweis der Geschäftstätigkeit im Rohstoffbereich\n4. Unterschriebene Handelsvereinbarung und AGB-Zustimmung\n5. Lastschriftmandat für Kaution und Gebühren\n\nDie Prüfung dauert in der Regel 2–5 Werktage."
          },
          {
            id: "zugang-kaution",
            heading: "Kaution und Marginsystem",
            body: "Tier 1 (bis 500.000 €/Monat): 25.000 € Kaution\nTier 2 (500.000 – 2.000.000 €/Monat): 75.000 € Kaution\nTier 3 (> 2.000.000 €/Monat): individuelle Vereinbarung\n\nDie Kaution wird auf einem Treuhandkonto gehalten (Segregation nach MiFID II)."
          }
        ]
      },
      {
        id: "orderbuch",
        heading: "Das Orderbuch: Mechanik und Auftragsarten",
        body: "Das EUCX-Orderbuch ist ein zentrales Limit Order Book (CLOB). Alle Orders werden nach Price-Time Priority abgearbeitet.",
        sub: [
          {
            id: "orderbuch-arten",
            heading: "Auftragsarten im EUCX-System",
            body: "Limit Order: Kaufe/Verkaufe X Lot zum Preis P oder besser. Bleibt im Orderbuch bis Ausführung.\n\nMarket Order: Sofortige Ausführung zum besten Preis.\n\nFill-or-Kill (FOK): Vollständige sofortige Ausführung oder Ablehnung.\n\nImmediate-or-Cancel (IOC): Sofortige Teilausführung, Rest storniert.\n\nStop-Loss: Wird zur Market Order bei Unterschreitung eines Trigger-Preises."
          },
          {
            id: "orderbuch-matching",
            heading: "Matching-Algorithmus und Price Discovery",
            body: "Price-Time-Priority: Bester Preis zuerst, bei gleichem Preis älteste Order zuerst.\n\nBeispiel Betonstahl:\nSell: 700 €/t — 50 t; 702 €/t — 100 t\nBuy: 698 €/t — 75 t\n\nMarket Order 50 t: Ausführung zu 700 €/t (bestes Angebot). Spread von 698–700 €/t = 2 €/t."
          }
        ]
      },
      {
        id: "auktion",
        heading: "Auktionsmodelle an der EUCX",
        body: "Neben dem kontinuierlichen Orderbuch-Handel bietet die EUCX strukturierte Auktionen für größere Mengen.",
        sub: [
          {
            id: "auktion-offen",
            heading: "Offene Auktion (Open Ascending Bid)",
            body: "Startpreis vom Verkäufer festgelegt. Aufsteigende Gebote (Mindestinkrement: 0,50 €/t). Dauer: 20 Minuten + Anti-Sniping-Verlängerung (+3 min bei Geboten in letzter Minute).\n\nGeeignet für: Sonderposten, Lagerräumung, Markteintritt neuer Verkäufer."
          },
          {
            id: "auktion-verdeckt",
            heading: "Verdeckte Auktion (Sealed Bid)",
            body: "Alle Bieter geben einmalig ein Gebot ab. Zuschlag an Höchstbietenden (First-Price Sealed Bid).\n\nDie EUCX nutzt für Großmengen (>1.000 t) dieses Format. Vorteil: Kein strategisches Nachbieten."
          }
        ]
      },
      {
        id: "vertragsschluss",
        heading: "Vertragsschluss und Abwicklung",
        body: "Mit dem Matching ist der Vertrag geschlossen — elektronisch und rechtlich bindend nach § 127a BGB. Die EUCX-Clearingstelle tritt als zentraler Kontrahent (CCP) auf.",
        sub: [
          {
            id: "vertragsschluss-ccp",
            heading: "Central Counterparty (CCP) Mechanismus",
            body: "Die CCP tritt in jeden Vertrag als Käufer gegenüber dem Verkäufer und als Verkäufer gegenüber dem Käufer ein (Novation). Gegenparteirisiko für beide Seiten entfällt.\n\nAbsicherung durch: Initial Margin, Variation Margin (tägl. Mark-to-Market), Default Fund und eigene Kapitalreserven."
          },
          {
            id: "vertragsschluss-lieferung",
            heading: "Lieferabwicklung und Dokumentenfluss",
            body: "T+0: Bestätigung per E-Mail, Lieferanweisung an Lager.\nT+1–T+3: Verkäufer stellt Lieferpapiere bereit (Prüfzeugnis 3.1, Lieferschein, Rechnung).\nT+2–T+5: Physische Übergabe, Wiegung, Qualitätsprüfung.\nT+3–T+7: Zahlung via SEPA. EUCX koordiniert.\n\nBei Mängeln: Einspruch innerhalb 5 Werktage. Schiedsverfahren nach DIS."
          }
        ]
      },
    ],
    faq: [
      { q: "Wie lange dauert das Onboarding an der EUCX?", a: "2–5 Werktage nach Einreichung aller Dokumente." },
      { q: "Welche Kosten entstehen beim Handel?", a: "Keine Mitgliedsbeiträge. Transaktionsgebühr: 0,15 % des Kontraktwerts. Kaution je nach Volumen-Tier." },
      { q: "Ist ein Handel auch per API möglich?", a: "Ja. REST- und WebSocket-API für automatisierte Order-Platzierung." },
      { q: "Was ist ein Lot an der EUCX?", a: "1 Lot = 25 t für Stahlprodukte und Schrott. Düngemittel: 20 t. Holz: 50 m³." },
    ],
  },
  {
    slug: "erste-schritte-eucx",
    title: "Erste Schritte auf EUCX: Registrierung und erste Gebotsabgabe",
    description: "Von der Registrierung bis zum ersten abgeschlossenen Handel – dieser Schritt-für-Schritt-Guide führt Sie durch den gesamten Onboarding-Prozess auf EUCX.",
    readMin: 18,
    published: "2026-03-23",
    sections: [
      {
        id: "ueberblick",
        heading: "Überblick: Der EUCX-Onboarding-Prozess",
        body: "Der Weg vom neuen Nutzer zum aktiven Marktteilnehmer auf EUCX umfasst 5 klar definierte Phasen: (1) Online-Registrierung und Dateneingabe, (2) KYC/AML-Identitätsprüfung, (3) Compliance-Freigabe durch das EUCX-Team, (4) Einzahlung der Initial Margin, (5) Erste Orderabgabe im Handelssystem. Die Durchlaufzeit beträgt typischerweise 3–7 Werktage.",
      },
      {
        id: "schritt-1-registrierung",
        heading: "Schritt 1: Online-Registrierung",
        body: "Rufen Sie eucx.eu/register auf und wählen Sie Ihren Unternehmenstyp: Händler/Importeur, Produzent/Hersteller, Finanzinstitut oder Industrieabnehmer. Pflichtangaben: Firmenname, Handelsregisternummer, USt-ID, LEI-Nummer (Legal Entity Identifier – sofern vorhanden), Hauptansprechpartner mit Titel und direkter Durchwahl, Geschäftsadresse (muss mit Handelsregistereintrag übereinstimmen). Tipp: Bereiten Sie Ihren Handelsregisterauszug (nicht älter als 3 Monate) und eine aktuelle Gesellschafterliste vor.",
      },
      {
        id: "schritt-2-kyc",
        heading: "Schritt 2: KYC/AML-Prüfung",
        body: "Nach der Registrierung erhalten Sie per E-Mail einen Link zur digitalen Dokumenteneinreichung (powered by IDnow). Erforderliche Dokumente für GmbH/AG: Handelsregisterauszug (< 3 Monate), Gesellschafterliste aller direkten Gesellschafter > 25 %, Transparenzregistereintrag, Ausweis aller wirtschaftlich Berechtigten (UBOs), Letzter Jahresabschluss oder Bankauskunft. Bearbeitungszeit: In der Regel 1–2 Werktage. Bei komplexen Eigentümerstrukturen oder Nicht-EU-Sitz bis zu 5 Werktage.",
      },
      {
        id: "schritt-3-compliance",
        heading: "Schritt 3: Compliance-Freigabe und MiFID-II-Einstufung",
        body: "Das EUCX-Compliance-Team prüft Ihre Unterlagen auf Vollständigkeit und Plausibilität. Parallel erfolgt die MiFID-II-Kategorisierung: Geeignete Gegenpartei (Eligible Counterparty): Kreditinstitute, Wertpapierfirmen, Versicherungsunternehmen – höchste Handelslimits, geringste Schutzvorschriften. Professioneller Kunde (Professional Client): Großunternehmen mit min. 2 von 3 Kriterien (Bilanzsumme > 20 Mio. EUR, Nettoerlöse > 40 Mio. EUR, Eigenkapital > 2 Mio. EUR). Kleinere Unternehmen erhalten standardmäßig Professioneller Kunde-Status nach Eignungsprüfung.",
      },
      {
        id: "schritt-4-margin",
        heading: "Schritt 4: Initial Margin einzahlen",
        body: "Nach der Compliance-Freigabe erhalten Sie Zugang zum EUCX-Kundenportal. Überweisen Sie die Initial Margin auf das EUCX-Treuhandkonto (IBAN wird im Portal angezeigt). Mindestbetrag: 10.000 EUR. Standard für mittelgroße Händler: 50.000–250.000 EUR. Die Margin steht Ihnen jederzeit zur Verfügung, solange keine offenen Positionen bestehen. Die Margin wird zum EZB-Einlagezinssatz − 0,25 % p.a. verzinst.",
      },
      {
        id: "schritt-5-erste-order",
        heading: "Schritt 5: Erste Order abgeben",
        body: "Loggen Sie sich unter portal.eucx.eu ein. Wählen Sie den gewünschten Rohstoff-Markt (z.B. Betonstahl B500B, Lieferung Frankfurt). Wählen Sie den Ordertyp: Limit Order (fixer Preis, wartet auf Gegenpartei) oder Market Order (sofortige Ausführung zum besten verfügbaren Preis). Geben Sie Menge (in Tonnen, Mindestlot: 25 t) und Preis (€/t) ein. Wählen Sie Lieferbedingung (DAP/EXW) und Lieferzeitraum. Bestätigen Sie die Order mit Ihrer Trading-PIN. Nach Matching erhalten Sie eine Handelsbestätigung per E-Mail und im Portal.",
      },
      {
        id: "tipps-erste-wochen",
        heading: "Tipps für die ersten Wochen",
        body: "Nutzen Sie den Testmodus: EUCX bietet eine Paper-Trading-Umgebung, in der Sie ohne echtes Kapital Orderabgabe und Matching üben können. Beobachten Sie zunächst den Markt: Verfolgen Sie 1–2 Wochen die Preisbewegungen im gewünschten Segment, bevor Sie eine große Order platzieren. Starten Sie mit Limit Orders: Im Gegensatz zu Market Orders können Sie Limit Orders jederzeit stornieren, solange kein Matching stattgefunden hat. Nutzen Sie den EUCX-Kundendienst: Ihr persönlicher Relationship Manager steht Ihnen in den ersten 3 Monaten täglich für Fragen zur Verfügung.",
      },
    ],
  },
];
