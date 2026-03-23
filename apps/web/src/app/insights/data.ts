export type InsightCategory = "lexikon" | "analysen" | "akademie" | "regulatorik";

export interface LexikonSection {
  id: string;
  heading: string;
  body: string;
  sub?: { id: string; heading: string; body: string }[];
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
];
