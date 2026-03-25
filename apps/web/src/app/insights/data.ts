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
    shortDef: "EU-Grenzausgleichsmechanismus für CO₂-intensive Importwaren: Stahl, Aluminium, Zement, Düngemittel, Energie. Ab 1. Januar 2026 kostenpflichtig.",
    description: "Der vollständige CBAM-Guide für Rohstoffhändler: Übergangsphase, Zertifikate, Berechnung, CN-Codes, Reporting-Pflichten, Auswirkungen auf Stahl- und Düngemittelpreise. BaFin-lizenzierter OTF EUCX erklärt.",
    category: "Regulierung",
    readMin: 14,
    published: "2026-03-01",
    updated: "2026-03-23",
    norm: "VO (EU) 2023/956",
    sections: [
      {
        id: "was-ist-cbam",
        heading: "Was ist der CBAM?",
        body: "Der Carbon Border Adjustment Mechanism (CBAM, Verordnung (EU) 2023/956) ist das bisher ehrgeizigste Klimaschutzinstrument der Europäischen Union im Außenhandel. Als CO₂-Grenzausgleich verhindert er das sogenannte Carbon Leakage — die Verlagerung emissionsintensiver Produktion in Länder mit weniger strengen Klimaschutzauflagen, nur um EU-CO₂-Kosten zu umgehen.\n\nDas Grundprinzip ist einfach: Wer emissionsintensive Güter in die EU importiert, muss denselben CO₂-Preis zahlen wie ein EU-Produzent, der dem EU-Emissionshandelssystem (EU-ETS) unterliegt. Der Preis der CBAM-Zertifikate richtet sich nach dem wöchentlichen Durchschnittspreis der EU-ETS-Emissionsrechte (European Union Allowances, EUA).\n\nCBAM ist kein Zoll im klassischen Sinne. Es ist eine Regulierung, die sicherstellt, dass der CO₂-Preis, den EU-Produzenten zahlen, nicht durch billige Importe unterlaufen wird. Für Rohstoffhändler, die auf der EUCX-Plattform aktiv sind, hat dies fundamentale Auswirkungen auf die Wettbewerbsfähigkeit europäischer gegenüber außereuropäischer Ware.",
        sub: [
          {
            id: "cbam-hintergrund",
            heading: "Hintergrund: Carbon Leakage und EU Green Deal",
            body: "Das EU-ETS (Emissionshandelssystem, seit 2005) verpflichtet EU-Produzenten dazu, für jede Tonne CO₂-Emission ein Zertifikat (EUA) zu kaufen oder zu nutzen. Mit steigendem EUA-Preis (von ca. 5 €/t CO₂ in 2018 auf über 90 €/t CO₂ im Jahr 2023, aktuell ~65 €/t) wuchs die Gefahr, dass europäische Stahl-, Zement- und Düngemittelproduzenten im globalen Wettbewerb benachteiligt werden — und Produktion abwandert.\n\nCBAM schließt diese Lücke. Er ist zentraler Bestandteil des Fit for 55-Pakets, mit dem die EU bis 2030 eine Reduktion der Treibhausgasemissionen um 55 % gegenüber 1990 anstrebt. Mit CBAM wird der CO₂-Preis erstmals konsequent auf alle Marktteilnehmer ausgedehnt — unabhängig vom Produktionsort."
          },
          {
            id: "cbam-sektoren",
            heading: "Betroffene Sektoren und CN-Codes",
            body: "Stahl und Eisen (HS 72 / CN 7206–7229): Roheisen, Ferrolegierungen, Rohblöcke, Halbzeug, Flacherzeugnisse, Langerzeugnisse (inkl. Betonstahl B500B, Walzdraht, Träger, Winkelprofile). Stahlrohre (HS 7304–7306) werden ab Phase 2 einbezogen.\n\nAluminium (HS 76 / CN 7601–7616): Primäraluminium (elektrolytisch), Sekundäraluminium, Pressbolzen, Bleche, Strangpressprofile.\n\nZement (HS 2523): Portlandzement, Tonerdezement, Schlackenzement.\n\nDüngemittel (HS 31 / CN 3102–3105): Harnstoff (Urea), Ammoniumnitrat (AN 34 %), NPK-Dünger, Kaliumnitrat.\n\nElektrischer Strom (HS 2716): Importierter Strom aus Drittstaaten über Interkonnektoren.\n\nWasserstoff (HS 2804 10): Grauer, blauer und grüner Wasserstoff.\n\nFür EUCX-Händler direkt relevant: Stahl/Eisen (primär) und Düngemittel (sekundär). Kupfer, Zink und Nickel sind derzeit nicht im Scope, werden aber für Phase 3 (ab 2030+) diskutiert."
          }
        ]
      },
      {
        id: "uebergangsphasephase",
        heading: "Übergangsphase 2023–2025: Nur Berichtspflicht",
        body: "Die CBAM-Übergangsphase lief vom 1. Oktober 2023 bis zum 31. Dezember 2025. In dieser Phase bestanden ausschließlich Berichtspflichten — es fielen keine Zahlungen an. Importeure mussten quartalsweise einen CBAM-Übergangsbericht einreichen, der folgende Angaben enthält:\n\n1. Menge der importierten CBAM-Waren in Tonnen\n2. Eingebettete direkte und indirekte CO₂-Emissionen (in tCO₂e)\n3. Produktionsland und -anlage\n4. Im Ursprungsland bereits gezahlter CO₂-Preis (falls vorhanden)\n\nBerichte wurden über das EU-CBAM-Übergangsregister (CBAM Transitional Registry) eingereicht, das von der EU-Kommission betrieben wird. Verstöße gegen die Berichtspflicht während der Übergangsphase wurden mit Bußgeldern von 10–50 EUR je nicht gemeldeter Tonne CO₂e sanktioniert (Art. 26 Abs. 1 VO (EU) 2023/956).",
        sub: [
          {
            id: "cbam-lektionen",
            heading: "Was die Übergangsphase gezeigt hat",
            body: "Die Übergangsphase lieferte wertvolle Erkenntnisse. Hauptproblem: Viele Importeure hatten keine Daten zu den eingebetteten Emissionen ihrer Lieferanten. Insbesondere bei Importen aus China, Indien und der Türkei fehlten belastbare CO₂-Intensitätsdaten.\n\nDie EU-Kommission stellte daher vorübergehend vereinfachte Standardwerte zur Verfügung (Default Values), die auf Durchschnittsemissionen der jeweiligen Ursprungsländer basieren. Ab 2026 sind nur noch tatsächlich gemessene Emissionen (verified emissions) oder offizielle nationale Defaultwerte zulässig."
          }
        ]
      },
      {
        id: "cbam-2026",
        heading: "Ab 2026: Kostenpflichtige Phase",
        body: "Am 1. Januar 2026 beginnt die vollständige, kostenpflichtige CBAM-Phase. Die wesentlichen Änderungen gegenüber der Übergangsphase:\n\nEinführung des CBAM-Zertifikatsystems: Importeure müssen CBAM-Zertifikate kaufen, die den eingebetteten Emissionen ihrer Importe entsprechen. Jedes CBAM-Zertifikat repräsentiert 1 Tonne CO₂e. Der Preis richtet sich nach dem wöchentlichen EUA-Durchschnittspreis an der ICE Endex.\n\nAnrechnung ausländischer CO₂-Preise: Falls im Ursprungsland bereits ein CO₂-Preis gezahlt wurde (z.B. Schweizer ETS, UK-ETS, South Korean ETS), kann dieser angerechnet werden. Der effektive CBAM-Aufschlag reduziert sich entsprechend. Länder ohne CO₂-Bepreisung (China, Türkei, Indien, Russland) zahlen den vollen CBAM-Preis.\n\nJährliche CBAM-Erklärung: Bis zum 31. Mai jedes Jahres muss für das Vorjahr eine CBAM-Erklärung beim nationalen CBAM-Register eingereicht und die entsprechenden Zertifikate abgegeben werden.",
        sub: [
          {
            id: "cbam-zeitplan-detail",
            heading: "Implementierungszeitplan 2026–2034",
            body: "2026: Vollständige CBAM-Einführung. EU-ETS-Freiallokationen für CBAM-Sektoren beginnen zu sinken (-2,5 % p.a.).\n2027: Erste vollständige Jahresmeldung (für 2026) fällig (31. Mai 2027).\n2028–2030: Freiallokationen sinken weiter; CBAM-Zahllast steigt proportional.\n2030: Freiallokationen auf ca. 75 % des 2025-Niveaus reduziert.\n2030–2034: Beschleunigter Abbau der Freiallokationen (-10 % p.a.).\n2034: Vollständige Implementierung. Alle Freiallokationen für CBAM-Sektoren entfallen. 100 % CBAM-Zahllast für Importeure."
          }
        ]
      },
      {
        id: "cbam-berechnung",
        heading: "CBAM-Preis: Berechnung und Formel",
        body: "Die CBAM-Zahllast errechnet sich nach folgender Formel:\n\nCBAM-Zahllast (€) = Eingebettete Emissionen (tCO₂e/t Ware) × Importmenge (t) × EUA-Wochenpreis (€/tCO₂e) − bereits im Ursprungsland gezahlter CO₂-Preis\n\nDie eingebetteten Emissionen umfassen:\n— Direkte Emissionen (Scope 1): Aus dem Produktionsprozess selbst (z.B. Hochofengas, Koksverbrennung)\n— Indirekte Emissionen (Scope 2): Aus dem verbrauchten Strom (nur für Strom, Aluminium und Stahl relevant, soweit national festgelegt)\n\nWichtig: Ab 2026 sind ausschließlich verifizierte Emissionen oder offizielle EU-Standardwerte zulässig. Die Verifizierung muss durch akkreditierte Verifizierer (nach Delegierter Verordnung (EU) 2023/1604) erfolgen.",
        sub: [
          {
            id: "cbam-beispiel-stahl",
            heading: "Rechenbeispiel: Betonstahl-Import Türkei",
            body: "Szenario: Import von 500 t Betonstahl B500B aus türkischer EAF-Produktion.\n\nCO₂-Intensität türkischer EAF-Stahl: 1,80 tCO₂/t (typischer Wert für Lichtbogenofen mit türkischem Strommix)\nEUA-Wochenpreis: 65,40 €/tCO₂ (Stand KW 12/2026)\nTürkei: Kein eigenes ETS, kein CO₂-Preis anrechenbar.\n\nCBAM-Zahllast = 1,80 × 500 × 65,40 − 0 = 58.860 EUR\nJe Tonne: 117,72 €/t Aufschlag\nBasispreis Betonstahl: 620 €/t CIF Europa\nEffektiver Importpreis inkl. CBAM: 737,72 €/t\nVergleich EU-Ware (keine CBAM): 698 €/t DAP Frankfurt\n\nErgebnis: EU-Ware ist nach CBAM preislich wettbewerbsfähig, was vorher nicht der Fall war."
          },
          {
            id: "cbam-beispiel-harnstoff",
            heading: "Rechenbeispiel: Harnstoff-Import Russland",
            body: "Szenario: Import von 200 t Harnstoff (46 % N) aus russischer Produktion.\n\nCO₂-Intensität russischer Harnstoff (Synthesegas-Route): 2,4 tCO₂/t\nEUA: 65,40 €/tCO₂\nRussland: kein CO₂-Preis anrechenbar.\n\nCBAM-Zahllast = 2,4 × 200 × 65,40 = 31.392 EUR\nJe Tonne: 156,96 €/t Aufschlag\nBasispreis Harnstoff: 485 $/t CIF Hamburg ≈ 450 €/t\nEffektiver Preis inkl. CBAM: ~607 €/t\n\nAuswirkung: Harnstoff-Importe aus Russland werden nahezu unrentabel, was EU-Produzenten (z.B. SKW Piesteritz, BASF Ludwigshafen) massiv begünstigt."
          }
        ]
      },
      {
        id: "cbam-reporting",
        heading: "Reporting-Pflichten für Importeure",
        body: "Als CBAM-Importeur (natürliche oder juristische Person mit Sitz in der EU, die CBAM-Waren aus Drittstaaten importiert) gelten ab 2026 folgende Pflichten:\n\nRegistrierung: Jeder CBAM-Importeur muss sich beim nationalen CBAM-Register registrieren (in Deutschland beim Zoll / BAFA). Die Registrierung ist Voraussetzung für den Import von CBAM-Waren.\n\nQuartalsberichte (2026 ff.): Weiterführung der Mengenmeldungen aus der Übergangsphase, jetzt aber mit verifizierten Emissionsdaten.\n\nJährliche CBAM-Erklärung: Bis 31. Mai des Folgejahres: Gesamtemissionen des Vorjahres + Abgabe entsprechender CBAM-Zertifikate. Nicht abgegebene Zertifikate werden mit 100 EUR/tCO₂e sanktioniert.\n\nAufbewahrungspflicht: Alle Emissionsnachweise, Produktionsdaten und Lieferantendokumente müssen 5 Jahre aufbewahrt werden.\n\nDrittlandsbescheinigung: Für jede CBAM-Lieferung muss der Lieferant im Drittland eine Bescheinigung über die eingebetteten Emissionen ausstellen (nach VO (EU) 2023/1773).",
      },
      {
        id: "cbam-eucx",
        heading: "CBAM und der Handel auf EUCX",
        body: "Auf der EUCX-Plattform werden ausschließlich Waren gehandelt, die sich bereits rechtmäßig im EU-Zollgebiet befinden oder bestimmungsgemäß importiert wurden. EUCX selbst ist kein Importeur und unterliegt keiner CBAM-Zahllast.\n\nFür Händler auf EUCX gilt:\n\nVerkäufer von Nicht-EU-Ursprungsware müssen beim Angebotseintrag den CBAM-Status dokumentieren. Das EUCX-System unterscheidet automatisch zwischen EU-Ursprungsware (kein CBAM) und Drittlands-Ursprungsware (CBAM-pflichtig, sofern noch nicht abgewickelt).\n\nPreistransparenz: EUCX zeigt bei CBAM-relevanten Angeboten den geschätzten CO₂-Aufschlag basierend auf dem aktuellen EUA-Wochenpreis. So können Käufer den tatsächlichen Total-Cost-of-Ownership vergleichen.\n\nCompliance-Dokumentation: EUCX stellt für jede Transaktion automatisch die notwendigen Handelsdokumente bereit, die für die CBAM-Erklärung benötigt werden (Lieferdatum, Ursprungsland, Produktbeschreibung mit CN-Code).",
        sub: [
          {
            id: "cbam-eucx-checkliste",
            heading: "Checkliste: CBAM-Compliance für EUCX-Händler",
            body: "Vor dem ersten Import: Registrierung beim nationalen CBAM-Register (BAFA für Deutschland).\nBei jedem Import: CBAM-Zertifikate kaufen (über EU-CBAM-Register: cbam.ec.europa.eu).\nBis 31. Mai: Jährliche CBAM-Erklärung einreichen und Zertifikate abgeben.\nDauerhaft: Emissionsnachweise und Lieferantendokumente 5 Jahre archivieren.\nBei EUCX-Handel: CBAM-Status im Angebot korrekt angeben (EU-Ursprung / Drittland)."
          }
        ]
      },
      {
        id: "cbam-marktauswirkungen",
        heading: "Auswirkungen auf den EU-Rohstoffmarkt",
        body: "CBAM ist eine der größten strukturellen Verschiebungen im europäischen Rohstoffhandel seit der ETS-Einführung 2005. Die Auswirkungen sind sektorspezifisch:\n\nBetonstahl: Türkische und osteuropäische (Nicht-EU) Betonstahl-Importe decken ca. 18 % des EU-Bedarfs. CBAM macht diese Importe um 100–130 €/t teurer. Dies stützt EU-Erzeugerpreise strukturell — insbesondere für EAF-Produzenten mit grünem Strommix (Skandinavien, Frankreich).\n\nFlachstahl (nicht auf EUCX): Hochofenstahl aus China (~2,1 tCO₂/t) wird mit ~137 €/t CBAM belastet. EU-Hochofenstahl erhält schrittweise weniger Freiallokationen — Kostensteigerung von 20–40 €/t bis 2030.\n\nHarnstoff und Stickstoffdünger: Importe aus Russland (ca. 35 % der EU-Importe vor 2022), Ägypten und Algerien werden massiv teurer. EU-Produzenten (SKW Piesteritz, Yara, BASF) profitieren.\n\nAluminium: Primäraluminium aus Russland, China und dem Mittleren Osten mit 8–16 tCO₂/t trägt CBAM von 520–1.040 €/t (bei EUA 65 €/t). De facto Abschottung des EU-Markts für konventionell produziertes Aluminium.",
      },
    ],
    related: ["betonstahl", "otf-eucx", "abwicklungsgarantie"],
    faq: [
      { q: "Ab wann ist CBAM kostenpflichtig?", a: "Ab 1. Januar 2026. Die Übergangsphase (Oktober 2023 – Dezember 2025) hatte nur Berichtspflichten ohne Zahlungslast." },
      { q: "Betrifft CBAM auch Stahlschrott?", a: "Nein. CBAM gilt für verarbeitete Erzeugnisse (Betonstahl, Bleche, Walzdraht), nicht für Schrott als Rohmaterial. Schrott fällt unter HS 7204 und ist explizit ausgenommen." },
      { q: "Wie kaufe ich CBAM-Zertifikate?", a: "Über das EU-CBAM-Register (cbam.ec.europa.eu). In Deutschland ist die Bundeszollverwaltung / BAFA zuständig für Registrierung und Abwicklung. Der Zertifikatspreis wird wöchentlich aus dem EUA-Durchschnitt berechnet." },
      { q: "Was ist der Unterschied zwischen CBAM und EU-ETS?", a: "EU-ETS betrifft EU-Produzenten direkt (Zertifikatspflicht für eigene Emissionen). CBAM betrifft Importeure und stellt sicher, dass Importe denselben CO₂-Preis zahlen wie EU-Erzeuger. Beide Systeme sind eng verknüpft — der CBAM-Preis basiert auf dem EUA-Preis." },
      { q: "Gilt CBAM auch für Recycling-Stahl (EAF)?", a: "Ja, aber mit deutlich niedrigerem CO₂-Faktor. EAF-Stahl aus der Türkei emittiert ca. 1,8 tCO₂/t, Hochofenstahl ca. 2,1 tCO₂/t. Bei EAF-Stahl mit erneuerbarem Strom kann die CO₂-Intensität auf 0,4–0,6 tCO₂/t sinken — CBAM-Aufschlag dann nur 26–39 €/t." },
      { q: "Muss EUCX als Handelsplattform CBAM abführen?", a: "Nein. CBAM liegt beim Importeur (der Partei, die Waren aus Drittstaaten in die EU einführt). EUCX als Handelsplattform für bereits in der EU befindliche Waren ist kein Importeur und unterliegt keiner CBAM-Zahllast." },
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
    shortDef: "Die Abwicklungsgarantie (Settlement Guarantee) sichert Handelstransaktionen ab und schützt beide Vertragsparteien vor Gegenparteiausfällen — regulatorisch vorgeschrieben nach MiFID II.",
    description: "Abwicklungsgarantie im institutionellen Rohstoffhandel: Leistung-gegen-Zahlung, Margin-Mechanismus, Ausfallfonds, Clearingstelle und rechtliche Grundlagen nach MiFID II und WpHG. Vollständiger EUCX-Guide.",
    category: "Regulierung",
    readMin: 13,
    published: "2026-03-23",
    updated: "2026-03-25",
    norm: "§ 72 WpHG · Art. 20 MiFID II",
    sections: [
      {
        id: "definition",
        heading: "Definition und rechtliche Grundlage",
        body: "Die Abwicklungsgarantie (engl. Settlement Guarantee oder Settlement Assurance) ist eine rechtsverbindliche Zusage eines Handelsplatzbetreibers oder einer Clearingstelle, dass eine Transaktion vollständig und fristgerecht abgewickelt wird — unabhängig davon, ob eine der Vertragsparteien ihren Pflichten nachkommt. Sie bildet das Fundament des institutionellen Wertpapier- und Warenhandels.\n\nIm Kontext der EUCX gilt: Jeder über die Plattform abgeschlossene Kontrakt ist durch die Abwicklungsgarantie der EUCX GmbH gesichert. Käufer erhalten ihre Ware, Verkäufer erhalten ihre Zahlung — oder der Schadensfonds der EUCX tritt ein. Dieses Prinzip schafft das Vertrauen, das für einen funktionierenden organisierten Markt unabdingbar ist.",
        sub: [
          {
            id: "definition-rechtsgrundlage",
            heading: "Rechtsgrundlagen im Detail",
            body: "§ 72 WpHG (Wertpapierhandelsgesetz): Verpflichtet OTF-Betreiber zur Einrichtung angemessener Systeme und Verfahren zur Abwicklungssicherung. Verstoss kann zum Entzug der BaFin-Lizenz führen.\n\nArt. 20 MiFID II (Richtlinie 2014/65/EU): Definiert Anforderungen an Organised Trading Facilities. Abwicklungssicherung ist explizite Betreiberpflicht.\n\nArt. 3 CSDR (Verordnung (EU) 909/2014 — Central Securities Depository Regulation): Setzt EU-weite Mindeststandards fuer Wertpapierabwicklung, analog anwendbar auf physische Warenkontrakte an OTFs.\n\nDelgierte Verordnung (EU) 2017/565: Konkretisiert organisatorische Anforderungen an OTF-Betreiber, u.a. Risikomanagement und Notfallplaene."
          },
          {
            id: "definition-pvp",
            heading: "Leistung-gegen-Zahlung (PvP) als Kernprinzip",
            body: "Das Prinzip Payment-versus-Payment (PvP) bzw. Delivery-versus-Payment (DvP) stellt sicher, dass Lieferung und Zahlung simultan oder in definierter Sequenz erfolgen. Kein Verkäufer liefert ohne Zahlungsgarantie, kein Käufer zahlt ohne Liefergarantie.\n\nAuf EUCX wird DvP wie folgt umgesetzt: (1) Zahlungsreservierung beim Käufer zum Zeitpunkt des Matchings, (2) Lieferanweisung an den Verkäufer erst nach Zahlungsbestätigung, (3) Zahlung an den Verkäufer erst nach Liefernachweis (Wiegerschein + Frachtdokumente). Bei Abweichungen greift das Ausfall- und Schlichtungsverfahren."
          }
        ]
      },
      {
        id: "mechanismus",
        heading: "Der EUCX-Abwicklungsmechanismus Schritt für Schritt",
        body: "Die Abwicklungsgarantie wirkt nicht erst bei einem Ausfall — sie ist in jeden Schritt des Handelsprozesses eingebaut. Hier der vollständige Ablauf:",
        sub: [
          {
            id: "mechanismus-phase1",
            heading: "Phase 1: Vor dem Handel — Zulassung und Margin-Hinterlegung",
            body: "Jeder neue Marktteilnehmer durchläuft vor der ersten Order eine vierstufige Prüfung:\n\n1. KYC/AML-Pruefung: Identitaetspruefung aller wirtschaftlich Berechtigten (UBOs) nach GwG.\n2. Kreditpruefung: Bonitaetsbeurteilung anhand Jahresabschluss und Bankauskunft.\n3. MiFID-II-Kategorisierung: Einstufung als Professioneller Kunde oder Geeignete Gegenpartei.\n4. Initial Margin: Einzahlung auf EUCX-Treuhandkonto (min. 10.000 EUR oder 5 % des genehmigten Jahresvolumens).\n\nOhne vollstaendige Initial Margin sind keine Orders moeglich. Das System blockiert die Ordermaske technisch."
          },
          {
            id: "mechanismus-phase2",
            heading: "Phase 2: Orderabgabe — automatische Margin-Prüfung",
            body: "Jede eingehende Order wird in Echtzeit gegen die verfuegbare Margin geprueft:\n\nVerfuegbare Margin = Eingezahlte Initial Margin − reservierte Margin aus offenen Orders\n\nBeispiel: Haendler A hat 50.000 EUR Margin. Er gibt eine Kauforder fuer 200 t Betonstahl zu 700 EUR/t ein = Orderwert 140.000 EUR. Bei 5 % Margin-Satz werden 7.000 EUR reserviert. Verfuegbare Margin nach Order: 43.000 EUR. Weitere Orders bis 43.000 EUR / 5 % = 860.000 EUR Gesamtvolumen moeglich.\n\nAbgelehnte Orders werden mit Fehlercode M001 (Insufficient Margin) zurueckgewiesen. Der Haendler erhaelt eine automatische Benachrichtigung."
          },
          {
            id: "mechanismus-phase3",
            heading: "Phase 3: Nach dem Matching — Handelsbestätigung und Settlement-Einleitung",
            body: "Nach erfolgreichem Matching (Bid >= Ask) laeuft der Settlement-Prozess automatisch an:\n\nT+0 (Handelsabschluss): Matching-Bestaetigung an beide Parteien per E-Mail und Portal. Die EUCX-Settlement-ID wird generiert. Reservierte Margin wird zu blockierter Margin.\n\nT+1 (Dokumentenaustausch): Verkäufer sendet Orderbestaetigung mit Lieferdatum, Lieferanschrift und Qualitaetszertifikat (Werksprüfzeugnis 3.1). Käufer bestätigt Lieferanschrift.\n\nT+2 (Zahlungsreservierung): EUCX reserviert den Kaufbetrag auf dem Treuhandkonto des Käufers. Betrag ist bis zur Lieferbestaetigung eingefroren.\n\nT+3 bis T+7 (physische Lieferung): Abhängig von Incoterm und Entfernung. EUCX-Logistikpartner überwacht Lieferfortschritt.\n\nT+8 (finale Abwicklung): Nach Eingang des signierten Liefernachweises (Wiegerschein, CMR-Frachtbrief) wird die Zahlung automatisch an den Verkäufer freigegeben. Margin-Reservierung beider Parteien aufgehoben."
          },
          {
            id: "mechanismus-ausfall",
            heading: "Phase 4: Ausfallverfahren bei Nichterfüllung",
            body: "Kommt eine Partei ihren Verpflichtungen nicht nach, greift das EUCX-Ausfallverfahren in drei Stufen:\n\nStufe 1 — Margin-Einzug: Die gesamte blockierte Margin der ausfallenden Partei wird eingezogen. Dies deckt in den meisten Faellen den Schaden vollstaendig.\n\nStufe 2 — Ausfallfonds: Reicht die Margin nicht aus, greift der EUCX-Ausfallfonds (Kapital: 5 Mio. EUR, gespeist aus Handelsgebühren). Maximal 2 Mio. EUR je Einzelfall.\n\nStufe 3 — Berufshaftpflicht: Darueber hinausgehende Schaeden werden durch die Berufshaftpflichtversicherung der EUCX GmbH (Allianz Global Corporate & Specialty SE, 5 Mio. EUR je Fall) gedeckt.\n\nDer Nichterfüllende Marktteilnehmer wird sofort gesperrt und erhält eine formelle Abmahnung nach BGB. Bei wiederholtem Ausfall: dauerhafter Ausschluss von der Plattform und Meldung an die BaFin."
          }
        ]
      },
      {
        id: "margin-typen",
        heading: "Margin-Typen im Detail",
        body: "Das EUCX-Marginsystem kennt drei Arten von Sicherheitsleistungen, die unterschiedliche Funktionen erfuellen:",
        sub: [
          {
            id: "margin-initial",
            heading: "Initial Margin — Die Eintrittshuerde",
            body: "Die Initial Margin ist die einmalige Grundsicherheit, die bei Kontoeröffnung hinterlegt wird. Sie richtet sich nach dem genehmigten Jahreshandelsvolumen:\n\nBis 2 Mio. EUR Jahresvolumen: 10.000 EUR Mindest-Margin (5,0 %)\n2–10 Mio. EUR: 50.000 EUR (2,5 %)\n10–50 Mio. EUR: 150.000 EUR (1,5 %)\nÜber 50 Mio. EUR: Individuell vereinbart (i.d.R. 1,0 %)\n\nDie Initial Margin liegt jederzeit auf einem segregierten Treuhandkonto bei der Deutschen Bank AG, getrennt vom EUCX-Betriebsvermögen. Sie ist damit im Insolvenzfall der EUCX GmbH vollstaendig geschützt.\n\nVerzinsung: EZB-Einlagezinssatz − 0,25 % p.a. (aktuell: ca. 3,65 % p.a.)."
          },
          {
            id: "margin-variation",
            heading: "Variation Margin — Tagesaktuelle Anpassung",
            body: "Bei offenen Terminkontrakten (Futures/Forwards auf EUCX) wird taeglich eine Mark-to-Market-Bewertung durchgefuehrt. Liegt der aktuelle Marktpreis unter dem vereinbarten Terminpreis, muss der Käufer eine Variation Margin nachschiessen.\n\nBeispiel: Kaeufer schließt Forward-Kontrakt ueber 100 t Betonstahl zu 720 EUR/t ab. Aktueller Marktpreis faellt auf 680 EUR/t. Unrealisierter Verlust: (720 − 680) × 100 = 4.000 EUR. Dieser Betrag wird als Variation Margin täglich eingefordert.\n\nVariation Margin ist nur für Terminkontrakte relevant. Kassageschaefte (Spot) haben keine Variation Margin."
          },
          {
            id: "margin-maintenance",
            heading: "Maintenance Margin — Der Sicherheitspuffer",
            body: "Die Maintenance Margin ist der Mindestbetrag, der jederzeit auf dem Marginkonto verfuegbar sein muss. Bei EUCX betraegt sie 80 % der Initial Margin.\n\nUnterschreitet die verfuegbare Margin die Maintenance Margin, loest das System automatisch einen Margin Call aus:\n1. Automatische E-Mail-Benachrichtigung an den Kontaktinhaber\n2. 24-Stunden-Frist zur Nachschusszahlung\n3. Bei Nichterfuellung: automatische Liquidation der aeltesten offenen Positionen bis zur Wiederherstellung der Initial Margin."
          }
        ]
      },
      {
        id: "vergleich-otc",
        heading: "Abwicklungsgarantie vs. OTC-Handel: Was Händler wissen müssen",
        body: "Im Over-the-Counter (OTC) Handel — also dem direkten, bilateralen Handel ausserhalb einer Boerse — gibt es keine Abwicklungsgarantie. Kaeufer und Verkäufer tragen das volle Gegenparteirisiko. Laut BIS-Statistik (Bank for International Settlements) scheitern ca. 5–8 % aller OTC-Rohstoffgeschäfte an Abwicklungsproblemen.\n\nDie Abwicklungsgarantie der EUCX eliminiert dieses Risiko vollstaendig. Fuer mittelstaendische Industrieunternehmen, die bisher OTC handelten, bedeutet der Wechsel zur EUCX:\n\n— Keine Due-Diligence-Kosten fuer jeden einzelnen Handelspartner\n— Keine bilateralen Rahmenvertraege (ISDA/Master Agreement) noetig\n— Planungssicherheit: Liefertermin und Preis sind bei Abschluss garantiert\n— Bilanziell: Gegenparteirisiko entfaellt aus dem Risikobericht\n— Regulatorisch: Reduzierter Dokumentationsaufwand nach EMIR Art. 11",
      },
      {
        id: "expertentipp",
        heading: "Expertentipp: Margin-Optimierung für aktive Händler",
        body: "Ein haeufiger Fehler neuer EUCX-Teilnehmer: Sie hinterlegen genau die Mindest-Margin und sind dann ueberrascht, wenn groessere Ordervolumina abgewiesen werden.\n\nProfi-Ansatz: Hinterlegen Sie 120–150 % der rein rechnerisch notwendigen Margin. Das gibt Ihnen Handlungsspielraum bei schnellen Marktbewegungen und verhindert Margin Calls in volatilen Phasen (z.B. waehrend CBAM-Ankuendigungen oder Zollerhoehungen).\n\nSteuertipp: Die Initial Margin ist kein Aufwand — sie bleibt Vermoegen Ihres Unternehmens. Die anfallenden Zinsertraege auf der Margin muessen als Kapitalertrag versteuert werden. Sprechen Sie mit Ihrem Steuerberater ueber die korrekte Bilanzierung nach HGB § 266 Abs. 2 B.II.4.",
      },
    ],
    related: ["otf-eucx", "cbam", "mifid-ii-otf"],
    faq: [
      {
        q: "Was passiert, wenn ein Käufer nicht zahlt?",
        a: "EUCX aktiviert das dreistufige Ausfallverfahren: (1) Margin-Einzug der ausfallenden Partei, (2) Deckung verbleibender Differenzen aus dem 5-Mio.-EUR-Ausfallfonds, (3) Darueber hinausgehende Schaeden werden durch die Berufshaftpflicht (Allianz, 5 Mio. EUR je Fall) gedeckt. Der ausfallende Teilnehmer wird sofort gesperrt und bei der BaFin gemeldet."
      },
      {
        q: "Was passiert, wenn ein Verkäufer nicht liefert?",
        a: "Bei Lieferverzug: EUCX setzt dem Verkäufer eine 48-Stunden-Nachfrist. Bei Nichterfuellung: Die reservierte Zahlung des Käufers wird freigegeben. EUCX besorgt Ersatzlieferung am Markt (Close-out). Mehrkosten traegt der ausfallende Verkäufer, gedeckt aus seiner Margin."
      },
      {
        q: "Wie hoch ist die Initial Margin bei EUCX?",
        a: "Mindestens 10.000 EUR oder 5 % des genehmigten Jahreshandelsvolumens (bei bis zu 2 Mio. EUR Volumen). Ab 2 Mio. EUR Volumen sinkt der Satz auf 2,5 %, ab 10 Mio. EUR auf 1,5 %. Fuer volatile Rohstoffe kann die BaFin-konforme Margin auf bis zu 15 % angehoben werden."
      },
      {
        q: "Ist meine Margin-Einlage sicher, wenn EUCX insolvent wird?",
        a: "Ja. Die Initial Margin liegt auf einem segregierten Treuhandkonto bei der Deutschen Bank AG — getrennt vom EUCX-Betriebsvermögen. Im Insolvenzfall der EUCX GmbH hat der Insolvenzverwalter keinen Zugriff auf diese Mittel. Sie werden unverzueglich an die Teilnehmer zurueckuebertragen."
      },
      {
        q: "Gilt die Abwicklungsgarantie auch fuer Terminkontrakte?",
        a: "Ja, sowohl fuer Kassageschaefte (Spot) als auch fuer kurzfristige Terminkontrakte (bis 6 Monate). Bei Spot-Geschäften gilt DvP (Delivery-versus-Payment). Bei Terminkontrakten kommt zusaetzlich die Variation Margin hinzu."
      },
      {
        q: "Muss ich als Käufer den vollen Kaufbetrag im Voraus einzahlen?",
        a: "Nein. Sie benoetigen nur die Margin (5 % des Kaufbetrags) zum Zeitpunkt der Orderabgabe. Der volle Kaufbetrag wird erst bei Matching reserviert (nicht abgebucht) und nach erfolgter Lieferung automatisch an den Verkäufer transferiert."
      },
    ],
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
  {
    slug: "basismetalle",
    term: "Basismetalle",
    shortDef: "Nicht-Edelmetalle wie Kupfer, Aluminium, Zink, Blei, Nickel und Zinn, die als industrielle Rohstoffe an der LME und anderen Borsen gehandelt werden.",
    category: "Metalle",
    readMin: 9,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Abgrenzung",
        body: "Basismetalle (englisch: base metals) sind nicht-edelmetallische Metalle, die in der Industrie als Konstruktions- und Funktionswerkstoffe eingesetzt werden. Die London Metal Exchange (LME) definiert sechs Kernbasismetalle: Kupfer (Copper Grade A), Aluminium (Primary Aluminium), Zink (Special High Grade), Blei (Standard Lead), Nickel (Primary Nickel) und Zinn (Tin). Diese sechs Metalle bilden das Fundament des globalen Metallhandels und sind Grundlage fur Futures-, Options- und physische Handelskontrakte. Im Gegensatz zu Edelmetallen (Gold, Silber, Platin, Palladium) werden Basismetalle primae industriell genutzt, nicht als Wertaufbewahrungsmittel oder Schmuck. Wichtiges Unterscheidungsmerkmal: Basismetalle oxidieren oder korrodieren an der Luft, was ihre Lagerung und Qualitassicherung anspruchsvoller macht.",
      },
      {
        id: "lme-kontrakte",
        heading: "LME-Kontrakte und Preisbildung",
        body: "Die LME ist der globale Leitmarkt fur Basismetallpreise. LME-Preise (Cash und 3-Monat) dienen weltweit als Referenzpreise fur physische Kaufvertrage - auch ausserhalb der Borse. Kontrakt-Spezifikationen: Kupfer 25 Tonnen, Aluminium 25 Tonnen, Zink 25 Tonnen, Blei 25 Tonnen, Nickel 6 Tonnen, Zinn 5 Tonnen. LME-Handelszeiten: Ring-Sitzungen (Praesenzhandel) und 24h-Elektronikhandel uber LMEselect. Preisformat: USD/Tonne (metrisch). Qualitaetsstandards sind prazise definiert: z.B. Kupfer Grade A muss mindestens 99,9935% Reinheit aufweisen, Aluminium Primary 99,7% Mindestreinheit. Marktpreise werden durch Angebot und Nachfrage, Bestande in LME-zertifizierten Lagerhausern, Makroekonomie und Spekulation bestimmt.",
      },
      {
        id: "einsatzgebiete",
        heading: "Industrielle Einsatzgebiete",
        body: "Kupfer: Elektroleitungen (60% des Verbrauchs), Rohre, Waermeubertrager. Haupttreiber: Elektrifizierung, Windenergie, E-Mobilitat. Aluminium: Automobilbau, Luft- und Raumfahrt, Verpackung, Bauwesen. Vorteil: Geringes Gewicht, Korrosionsbestandigkeit. Zink: Galvanisierung von Stahl (55% des Verbrauchs), Messing-Legierungen, Batterien. Blei: Blei-Saure-Batterien (80% des Verbrauchs), Strahlenschutz, Kabel. Nickel: Edelstahl (70% des Verbrauchs), Batterien (Wachstumsmarkt: NMC-Kathoden fur E-Autos), Superlegierungen. Zinn: Lote und Lotpaste (50% des Verbrauchs), Weissblech, Chemikalien. EU-Nachfrage: Die EU importiert >90% ihres Basismetallbedarfs, was CBAM (Carbon Border Adjustment Mechanism) und EU Critical Raw Materials Act besondere Bedeutung verleiht.",
      },
      {
        id: "handel-eucx",
        heading: "Handel auf EUCX",
        body: "EUCX ermoglicht physischen Spot-Handel und Terminhandel in Basismetallen. Besonderheit: Als OTF (Organised Trading Facility) mit BaFin-Zulassung konnen auch nicht-standardisierte Partien (abweichende Losgrosse, spezifische Qualitat, individuelle Lieferbedingungen) gehandelt werden. Preisreferenz: LME Cash + Praemie (Premium) oder Abschlag je nach Qualitat, Herkunft und Lieferbedingung. Lieferbedingungen: Incoterms 2020 (DAP, DDP, FCA, CIF). Abwicklung: EUCX-Abwicklungsgarantie schutzt beide Parteien. Mindestmenge: 1 Tonne; typische Transaktionen: 25-500 Tonnen. Zertifikate: Herkunftsnachweise, CO2-Fussabdruck-Berichte und Qualitaetszertifikate sind integrale Bestandteile jedes Handelsabschlusses.",
      },
      {
        id: "marktdaten",
        heading: "Marktgroessen und Preistreiber",
        body: "Globales Marktvolumen: Kupfer ca. 25 Mio. Tonnen/Jahr, Aluminium ca. 70 Mio. Tonnen/Jahr. Preisvolatilitaet: Basismetalle reagieren sensibel auf: Chinesische Industrieproduktion (China = 50-60% Weltverbrauch), USD-Kurs (inverse Korrelation), Energiepreise (Aluminium: 30-40% Produktionskosten = Energie), geopolitische Ereignisse (Minen-Streiks, Embargos). Lagerbestaende: LME-Lagerhausbestaende sind oeffentlich und beeinflussen Preise direkt. Contango vs. Backwardation: Normaler LME-Markt ist in Contango (Terminpreis > Kassakurs); Backwardation signalisiert physische Knappheit.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Was unterscheidet Basismetalle von Edelmetallen?", a: "Basismetalle werden primae industriell genutzt, korrodieren an Luft und sind in grossen Mengen verfugbar. Edelmetalle (Gold, Silber) sind selten, korrosionsbestandig und dienen auch als Wertanlage." },
          { q: "Wie werden LME-Preise als Referenz genutzt?", a: "Physische Kaufvertrage werden oft als 'LME Cash + X USD Praemie' formuliert. Die Praemie deckt Transport, Lager, Qualitat und Herkunft ab." },
          { q: "Welche Basismetalle sind auf EUCX handelbar?", a: "Kupfer, Aluminium, Zink, Blei, Nickel und Zinn in LME-konformer Qualitat sowie Sonderlegierungen nach individueller Spezifikation." },
        ],
      },
    ],
    related: ["lme-notierung", "betonstahl", "ne-metalle"],
  },
  {
    slug: "derivate-handel",
    term: "Derivate im Rohstoffhandel",
    shortDef: "Finanzinstrumente, deren Wert sich von einem Basiswert (Rohstoffpreis, Index) ableitet: Futures, Optionen, Swaps und Forwards zur Preisabsicherung und Spekulation.",
    category: "Märkte",
    readMin: 10,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Was sind Derivate?",
        body: "Derivate (lateinisch: derivare = ableiten) sind Finanzkontrakte, deren Wert von einem oder mehreren Basiswerten (Underlyings) abgeleitet wird. Im Rohstoffhandel sind die Basiswerte typischerweise Spot-Preise (LME, CME, ICE), Commodity-Indizes oder physische Rohstoffmengen. Wirtschaftliche Funktion: Derivate ermoglichen Preisabsicherung (Hedging) ohne physischen Kauf oder Verkauf des Rohstoffs. Regulatorischer Rahmen: In der EU sind Rohstoffderivate unter MiFID II/MiFIR reguliert. OTF-Derivate (nicht boersengehandelt) mussen bei einer zugelassenen Handelsplatform gehandelt werden. EUCX als Commodity OTF bietet regulierten Rahmen fur Rohstoffderivate.",
      },
      {
        id: "arten",
        heading: "Derivate-Typen im Ueberblick",
        body: "Futures: Standardisierte Borsenkontrakte zur Lieferung einer definierten Menge zu einem definierten Preis zu einem definierten Termin. LME-Kupfer-Future: 25 Tonnen, Lieferung in 3 Monaten. Vorteil: Hohe Liquiditat, taegliches Marking-to-Market. Optionen: Recht (nicht Pflicht) zum Kauf (Call) oder Verkauf (Put) eines Rohstoffs zu einem definierten Preis (Strike) bis zu einem bestimmten Datum. Preis = Praemie. Forwards: OTC-Kontrakte, individuell ausgehandelt, keine Standardisierung. Flexibel in Menge, Qualitat, Lieferort und Termin. Swaps: Austausch von Zahlungsstromen, oft Fix-gegen-Float. Rohstoff-Swap: Partei A zahlt festen Preis, Partei B zahlt variablen Marktpreis - Differenz wird ausgeglichen. CFDs (Contracts for Difference): Spekulative Kontrakte ohne physische Lieferung, reguliert unter MiFID II.",
      },
      {
        id: "hedging-mechanismus",
        heading: "Preisabsicherung mit Derivaten",
        body: "Ein Stahlwerk kauft Roheisenspezifikation fuer Q3-Produktion. Risiko: Eisenerzpreis steigt bis Lieferung. Hedging-Strategie: Long-Future auf Eisenerz-CME-Kontrakt abschliessen. Wenn Preis steigt: Verlust auf physischem Kauf wird durch Gewinn auf Future ausgeglichen. Wenn Preis faellt: Gewinn auf physischem Kauf wird durch Verlust auf Future reduziert - aber Preis war von Anfang an kalkulierbar. Basis-Risiko: Differenz zwischen abgesichertem Derivatpreis und tatsaechlichem Spot-Preis bei Lieferung. Nie Null, da physische Qualitat, Ort und Timing abweichen. Delta-Hedging: Fuer Optionspositionen wird der Delta-Wert (Sensitivitaet des Optionspreises gegenueber Basiswert) laufend ausgeglichen.",
      },
      {
        id: "regulierung",
        heading: "Regulatorischer Rahmen (EU)",
        body: "MiFID II/MiFIR: Derivate mussen auf geregelten Handelsplatzen (RM, MTF, OTF) oder als OTC mit Meldepflicht gehandelt werden. EMIR (European Market Infrastructure Regulation): Central Clearing fuer standardisierte OTC-Derivate, Trade Repository-Meldepflicht. Ausnahmen: Nicht-finanzielle Gegenparteien (NFCs) unterhalb der Clearing-Schwelle sind teilweise befreit. Position Limits: MiFID II schreibt Position Limits fuer Warenderivate vor, um Spekulation zu begrenzen. EUCX als OTF: Berichts- und Transparenzpflichten nach Art. 26 MiFIR, Positions-Reporting an BaFin.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Muss ich als Industrieunternehmen Derivate unter MiFID II melden?", a: "Als nicht-finanzielle Gegenpartei (NFC) oberhalb der Clearing-Schwelle ja. Unterhalb der Schwelle gelten vereinfachte Meldepflichten (EMIR-Refit-Ausnahmen)." },
          { q: "Was ist der Unterschied zwischen einem Future und einem Forward?", a: "Futures sind standardisiert und boersengehandelt mit taeglichem Margin-Ausgleich. Forwards sind OTC, individuell ausgehandelt, ohne taegliches Marking-to-Market." },
          { q: "Bietet EUCX Derivate-Handel an?", a: "Ja. Als Commodity OTF kann EUCX physisch hinterlegte Forwards und Warenderivate anbieten. Details im EUCX Marktmodell-Dokument." },
        ],
      },
    ],
    related: ["hedging", "termingeschaefte", "mifid-ii-otf"],
  },
  {
    slug: "esg-kriterien",
    term: "ESG-Kriterien im Rohstoffhandel",
    shortDef: "Environmental, Social and Governance - Nachhaltigkeitskriterien, die im EU-Rohstoffhandel durch CSRD, EU-Taxonomie und Lieferkettensorgfaltspflichten zunehmend verbindlich werden.",
    category: "Regulierung",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "ESG im Rohstoffkontext",
        body: "ESG steht fuer Environmental (Umwelt), Social (Soziales) und Governance (Unternehmenssteuerung). Im Rohstoffhandel gewinnen ESG-Kriterien regulatorisch und marktlich an Gewicht: Kaufer verlangen CO2-Nachweise, Konfliktmineral-Zertifikate und Herkunftsdokumentation. Regulatorischer Rahmen EU: Corporate Sustainability Reporting Directive (CSRD) - verpflichtende ESG-Berichterstattung fuer grosse Unternehmen ab 2024; EU-Lieferkettensorgfaltspflicht (CSDDD); EU-Taxonomie-Verordnung - klassifiziert nachhaltige Wirtschaftsaktivitaeten; Entwaldungsverordnung (EUDR); Conflict Minerals Regulation (fur Zinn, Wolfram, Tantal, Gold).",
      },
      {
        id: "umwelt",
        heading: "Environmental: CO2 und Ressourcenverbrauch",
        body: "Scope 1/2/3-Emissionen: Im Rohstoffhandel relevant sind insbesondere Scope 3-Emissionen (vorgelagerte Lieferkette). Graustahl vs. Gruenstahl: Konventioneller Stahl (Hochofen) emittiert ca. 1,8 t CO2/t Stahl; elektrisch erschmolzener Recycling-Stahl (EAF) ca. 0,4 t CO2/t Stahl. CO2-Zertifikate: EU-ETS verpflichtet Metallproduzenten zur Abgabe von Emissionszertifikaten. CBAM: Ab 2026 muessen Importeure CO2-Preise fuer importierten Stahl, Aluminium etc. zahlen. Rohstoff-Fussabdruck: LCA (Life Cycle Assessment) wird fuer Beschaffungsentscheidungen zunehmend vorausgesetzt.",
      },
      {
        id: "sozial-governance",
        heading: "Social & Governance: Lieferkette und Compliance",
        body: "Conflict Minerals: Dodd-Frank Section 1502 (USA) und EU Conflict Minerals Regulation verlangen Herkunftsnachweise fuer 3TG-Metalle (Zinn, Tantal, Wolfram, Gold) aus Konfliktzonen. Kinderarbeit: UN-Guiding Principles on Business and Human Rights, ILO-Kernarbeitsnormen. Praxis: Due-Diligence-Berichte, LBMA-Responsible Gold Guidance, RMI (Responsible Minerals Initiative). Governance: Anti-Korruption (FCPA, UK Bribery Act), Transparenzpflichten, whistleblower-Schutz. ESG-Ratings: Anbieter wie MSCI, Sustainalytics und EcoVadis bewerten Unternehmen - zunehmend Voraussetzung fuer institutionelle Kaufer.",
      },
      {
        id: "eucx-integration",
        heading: "ESG auf EUCX",
        body: "EUCX integriert ESG-Dokumentation in den Handelsprozess: Pflichtfelder bei Angebotserstellung: CO2-Intensitaet (t CO2/t Produkt), Herkunftsland (ISO-3166), Zertifizierungen (z.B. ResponsibleSteel, ASI fuer Aluminium). ESG-Score: EUCX berechnet automatisch einen ESG-Score auf Basis der hochgeladenen Dokumente. Premium-Preisbildung: Gruenstahl-Angebote erzielen typisch 15-40 EUR/t Preisaufschlag gegenueber konventionellem Stahl. Lieferkettendokumentation: Mill Certificate, Ursprungszeugnis, CO2-Nachweis und Zertifizierungszertifikat sind archiviert und auf Anfrage abrufbar.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Ab wann bin ich zur CSRD-Berichterstattung verpflichtet?", a: "Grosse Unternehmen (>500 MA oder boersennotiert) ab Geschaeftsjahr 2024, mittelgrosse KMU ab 2026. Pruefen Sie den genauen Anwendungsbereich mit Ihrem Wirtschaftsprufer." },
          { q: "Was ist der CBAM und wie betrifft er meinen Import?", a: "Der Carbon Border Adjustment Mechanism verpflichtet ab 2026 EU-Importeure von Stahl, Aluminium, Zemnet etc. zur Zahlung eines CO2-Preises analog zum EU-ETS. Weitere Details unter CBAM im Lexikon." },
          { q: "Werden ESG-Anforderungen auf EUCX geprueft?", a: "Ja. EUCX verifiziert hochgeladene ESG-Dokumente und kennzeichnet Angebote mit verifizierten Zertifizierungen separat." },
        ],
      },
    ],
    related: ["cbam", "reach-verordnung", "ursprungszeugnis"],
  },
  {
    slug: "force-majeure",
    term: "Force Majeure (Hoehere Gewalt)",
    shortDef: "Vertragsklausel, die eine Partei von Leistungspflichten befreit, wenn aussergewoehnliche, unvorhersehbare Ereignisse die Erfullung unmoeglich machen.",
    category: "Recht",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Rechtliche Grundlagen",
        body: "Force Majeure (franzoesisch: hoehere Gewalt) bezeichnet Ereignisse, die ausserhalb der Kontrolle beider Vertragsparteien liegen, unvorhersehbar sind und die Vertragserfullung unmoeglich oder unzumutbar machen. Im deutschen Recht: Paragraph 275 BGB (Unmoglichkeit), Paragraph 313 BGB (Wegfall der Geschaftsgrundlage). Im internationalen Rohstoffhandel: ICC Force Majeure Clause 2020 als Branchenstandard. Abgrenzung: Force Majeure entbindet von Leistungspflichten (und damit von Schadensersatz); Haerte-/Hardship-Klauseln sind dagegen Anpassungsmechanismen bei veraenderten Umstaenden ohne vollstaendige Unmoeglichkeit.",
      },
      {
        id: "tatbestand",
        heading: "Tatbestandsmerkmale",
        body: "Drei kumulativ erforderliche Kriterien: (1) Aussergewoehnlichkeit: Das Ereignis darf kein normales Geschaeftsrisiko sein (z.B. Preisanstieg allein reicht nicht). (2) Unvorhersehbarkeit: Zum Zeitpunkt des Vertragsschlusses nicht vorhersehbar. (3) Unvermeidbarkeit: Partei konnte Ereignis und seine Folgen nicht abwenden. Klassische FM-Ereignisse: Naturkatastrophen (Erdbeben, Uberschwemmungen), Kriege, Embargos, staatliche Verbote, Pandemien (COVID-19 war FM-Fall). Kein FM: Preisschwankungen, Insolvenz, Engpasse durch allgemeinen Marktmangel (ausser bei ploelichem Exportverbot).",
      },
      {
        id: "rohstoffhandel",
        heading: "Relevanz im Rohstoffhandel",
        body: "Besonders relevant bei: Hafen- und Verkehrssperrungen (Suez-Kanal 2021, COVID-Hafen-Schliessungen), Exportbeschraenkungen und Sanktionen (Russland-Embargos 2022 mit unmittelbarer FM-Wirkung), Energiekrisen (Produktionsstopps bei Aluminium durch Stromkrise), Naturkatastrophen (Minen-Uberschwemmungen, Erdbeben in Produktionslaendern). Praxis: Sofortige schriftliche FM-Notifikation an Gegenpartei (Frist: i.d.R. 3-5 Werktage nach Eintreten). Beweis durch offizielle Dokumente (Behoerdenbestaetigung, Zertifikat der Handelskammer). Rechtsfolge: Aussetzung der Leistungspflichten fuer Dauer des FM-Ereignisses; bei Dauerhindernis (>60/90 Tage): Kuendigungsrecht.",
      },
      {
        id: "eucx-klausel",
        heading: "Force Majeure in EUCX-Kontrakten",
        body: "EUCX-Mustervertrag integriert ICC Force Majeure Clause 2020. Meldepflicht: Betroffene Partei muss FM-Ereignis unverzueglich, spaetestens binnen 5 Werktagen, schriftlich anzeigen. Dokumentation: Amtliche Bescheinigung, Notariatsbescheinigung oder Handelskammer-Zertifikat als Nachweis. Abwicklung: EUCX-Abwicklungsgarantie deckt FM-Szenarien nicht ab (setzt ordnungsgemaesse Lieferbereitschaft voraus). Alternative Absicherung: Handels-/Kreditversicherungen (z.B. Euler Hermes) und Warenkreditversicherungen koennen FM-Schaden abdecken.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Reicht ein allgemeiner Lieferengpass als FM-Grund?", a: "Nein. Allgemeine Marktknappheit oder Preisanstiege sind kein FM. FM erfordert konkrete, externe, unvorhersehbare Hindernisse, die gerade diesen Kontrakt betreffen." },
          { q: "Was passiert, wenn FM laenger als 3 Monate dauert?", a: "I.d.R. entsteht ein Kuendigungsrecht fuer beide Parteien. Die genaue Frist hangt von der Vertragsklausel ab." },
          { q: "Gilt ein Sanktionsembargo als Force Majeure?", a: "In der Regel ja, wenn das Embargo nach Vertragsschluss verhaengt wurde und die Lieferung unmoeglich macht. Bei erkennbarem Embargo-Risiko bei Vertragsschluss ist FM-Berufung schwieriger." },
        ],
      },
    ],
    related: ["incoterms-2020", "abwicklungsgarantie", "zahlungsbedingungen"],
  },
  {
    slug: "gemeinsamer-zolltarif",
    term: "Gemeinsamer Zolltarif (GZT / KN)",
    shortDef: "Der EU-weit einheitliche Zolltarif auf Basis der Kombinierten Nomenklatur (KN), der Einfuhrzollsaetze und Handelsregelungen fuer alle Waren aus Drittlaendern festlegt.",
    category: "Regulierung",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Grundlagen und Struktur",
        body: "Der Gemeinsame Zolltarif (GZT) ist das zentrale Instrument der EU-Handelspolitik fuer Importe aus Drittlaendern. Rechtliche Grundlage: Verordnung (EWG) Nr. 2658/87 uber die zolltarifliche und statistische Nomenklatur. Struktur: Basiert auf dem Harmonisierten System (HS) der WZO (Weltzollorganisation) - 6-stellige internationale Basis. Kombinierte Nomenklatur (KN): EU-spezifische Erweiterung auf 8 Stellen. TARIC: Integrierter Zolltarif der EU - 10-stellige Codenummer mit allen Handelsmassnahmen. Elektronischer Zugang: TARIC-Datenbank unter ec.europa.eu/taxation_customs/dds2/taric - kostenlos und aktuell.",
      },
      {
        id: "rohstoffe",
        heading: "Relevante Kapitel fuer Rohstoffe",
        body: "Stahl und Eisen: Kapitel 72 (Eisen und Stahl) und Kapitel 73 (Waren aus Eisen oder Stahl). Betonstahl: KN 7214 (Staebe aus Eisen/Stahl, nicht weiter bearbeitet). NE-Metalle: Kapitel 74 (Kupfer), 75 (Nickel), 76 (Aluminium), 78 (Blei), 79 (Zink), 80 (Zinn). Erze: Kapitel 26 (Erze, Schlacken, Aschen). Zollsaetze Rohstoffe: Viele Rohstoffe werden mit 0% (z.B. Kupfer-Kathodenplatten) oder niedrigen Saetzen (z.B. 2,7% fuer Betonstahl aus Drittlaendern) belegt. Ausnahmen und Praeferenzen: Freihandelsabkommen (FHA) der EU reduzieren oder eliminieren Zoelle; z.B. CETA (Kanada), EU-Japan EPA, EU-UK TCA.",
      },
      {
        id: "safeguards",
        heading: "Schutzklauseln und Trade Defense",
        body: "Antidumping-Massnahmen: EU-Kommission erhebt Antidumping-Zoelle auf gedumpte Importe (z.B. Stahl aus China, Russland). Praxisrelevant: Betonstahl aus bestimmten Laendern kann Antidumping-Zuschlaege von 15-60% erhalten. Ausgleichszoelle (Countervailing Duties): Gegen subventionierte Importe. EU Steel Safeguard: Seit 2018 automatische Zollquoten auf Stahlimporte - bei Ueberschreitung der Kontingente: 25% Zollzuschlag. CBAM: Ab 2026 zahlen Importeure CO2-Kosten auf Stahl, Aluminium, Zement, Dungemittel und Elektrizitaet. Ursprungsregeln: Praeferenzielle Ursprungsregeln (im FHA) und nicht-praeferenzielle Ursprungsregeln bestimmen, welcher Zollsatz gilt.",
      },
      {
        id: "praxis",
        heading: "Praxis: Zollabwicklung bei Rohstoffen",
        body: "Zollanmeldung: Elektronisch via ATLAS (Deutschland) oder AES (EU-weit). Dokumente: Handelsrechnung, Packliste, Frachtdokument (B/L, CMR, AWB), Ursprungszeugnis, ggf. Praeferenznachweise (EUR.1, REX-Erklaerung). Zollwert: CIF-Methode (Cost, Insurance, Freight) als Bemessungsgrundlage. Besondere Verfahren: Aktive Veredelung (AV) - Rohstoffe zolle- und steuerbefreit importieren, be- oder verarbeiten, re-exportieren. Zolllager - Einlagerung ohne sofortige Verzollung. Ausfuhranmeldung: Bei Rohstoffen aus EU-ETS-Bereichen muss CO2-Preis (ETS) dokumentiert werden.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Wo finde ich den aktuellen Zollsatz fuer meinen Rohstoff?", a: "In der TARIC-Datenbank der EU-Kommission unter ec.europa.eu/taxation_customs/dds2/taric. Eingabe der KN-Warencodenummer und Ursprungsland." },
          { q: "Was ist der Unterschied zwischen KN und TARIC?", a: "KN (8-stellig) ist die Kombinierte Nomenklatur fuer Statistik und Zoelle. TARIC (10-stellig) enthaelt zusaetzlich alle Handelsmassnahmen (Antidumping, Quoten, Praeferenzen)." },
          { q: "Unterliegt Schrott-Import aus der Ukraine EU-Zoellen?", a: "Das EU-Ukraine-Freihandelsabkommen (DCFTA) sieht fuer viele Waren Praeferenzzollsaetze vor. Den exakten Satz prueft man in TARIC mit Ursprungsland UA." },
        ],
      },
    ],
    related: ["cbam", "ursprungszeugnis", "incoterms-2020"],
  },
  {
    slug: "hedging",
    term: "Hedging (Preisabsicherung)",
    shortDef: "Strategie zur Absicherung gegen Preisrisiken durch den Aufbau einer Gegenposition in Derivaten oder verwandten Instrumenten, die Verluste aus dem Kerngeschaeft ausgleicht.",
    category: "Handel",
    readMin: 9,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Grundprinzip des Hedging",
        body: "Hedging (englisch: to hedge = absichern, einzaeunen) ist die gezielte Risikoreduktion durch den Aufbau einer Gegenposition. Grundprinzip: Wenn der Kernposition Wert verliert (z.B. durch fallende Rohstoffpreise), gewinnt die Hedge-Position und gleicht den Verlust ganz oder teilweise aus. Kein Nullsummenspiel: Perfect Hedge (vollstaendiger Ausgleich) ist theoretisch; in der Praxis bleibt immer Basis-Risiko. Ziel: Planungssicherheit und Kostenstabilitaet, nicht Gewinnmaximierung. Wer hedgt: Produzenten (absichern gegen Preisverfall), Konsumenten (absichern gegen Preisanstieg), Haendler (absichern offene Positionen), Banken (absichern Kreditrisiken).",
      },
      {
        id: "instrumente",
        heading: "Hedging-Instrumente",
        body: "Futures-Hedging: Standardisiert, liquide, boersengehandelt. Short Hedge: Produzent verkauft Futures (schuetzt gegen Preisverfall). Long Hedge: Konsument kauft Futures (schuetzt gegen Preisanstieg). Optionen-Hedging: Kauf einer Put-Option (Verkaufsrecht) als 'Versicherung' - bei Preisverfall wird Option ausgeubt, bei Preissteigerung laedt man die Option verfallen. Praemie = Versicherungspraemie. Forward-Hedging: OTC, individuell, kein Margin. Geeignet fuer nicht-standardisierte Mengen und Qualitaeten. Cross-Hedging: Wenn kein exakter Kontrakt verfuegbar, wird ein korrelierbarer Rohstoff als Hedge genutzt (z.B. Nickel-Future als Hedging fuer Edelstahlpreise). Swaps: Fix-gegen-Float-Zahlung - Abnehmer zahlt fixen Preis, erhaelt Marktpreis-Ausgleich.",
      },
      {
        id: "beispiel",
        heading: "Praxisbeispiel: Stahlwerk Hedging",
        body: "Ausgangssituation: Stahlwerk hat Lieferkontrakt uber 500 t Betonstahl zu einem Festpreis in 3 Monaten abgeschlossen. Risiko: Schrottpreise steigen, Produktionskosten erhoehen sich. Hedge: Short-Hedge auf Schrott-Futures (CME) oder LME-Stahl-Futures fuer 500 t. Ergebnis bei Preisanstieg: Verlust auf physischem Einkauf (teurer Schrott) wird durch Gewinn auf Future (Short-Position im steigenden Markt) ausgeglichen. Rollover: Wenn der Futures-Kontrakt vor physischer Lieferung auslaeuft, wird er 'gerollt' - Position wird in nachsten Kontrakt ubertragen. Kosten: Rollover-Kosten, Margin-Anforderungen, Bid-Ask-Spread, Broker-Provision.",
      },
      {
        id: "bilanzierung",
        heading: "Bilanzierung von Hedges (IFRS 9)",
        body: "IFRS 9 (Financial Instruments) regelt die Bilanzierung von Sicherungsbeziehungen (Hedge Accounting). Voraussetzungen: Dokumentation der Hedging-Beziehung, Effektivitaetstest (Hedge muss zu 80-125% wirksam sein), prospektive und retrospektive Effektivitaetsbeurteilung. Fair Value Hedge: Absicherung gegen Marktwertaenderungen (z.B. Rohstoff-Bestands-Hedge). Cash Flow Hedge: Absicherung gegen variable Cash Flows (z.B. geplante Rohstoffeinkauefe). Ohne Hedge Accounting: Derivative werden zu Marktpreis bewertet, Wertaenderungen sofort erfolgswirksam - kann zu hoher GuV-Volatilitaet fuehren.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Muessen Industrieunternehmen ihren Hedge melden?", a: "Unter EMIR muss eine nicht-finanzielle Gegenpartei (NFC) oberhalb der Clearing-Schwelle OTC-Derivate an ein Trade Repository melden. EUCX unterstuetzt bei der Meldung." },
          { q: "Was ist der Unterschied zwischen Hedge und Spekulation?", a: "Ein Hedge hat eine wirtschaftliche Gegenposition im Kerngeschaeft. Spekulation ist eine offene, ungedeckte Position. MiFID II unterscheidet diese aufsichtsrechtlich." },
          { q: "Kann ich auf EUCX Hedging-Kontrakte abschliessen?", a: "Ja. EUCX als OTF bietet standardisierte und individuelle Forward-Kontrakte zur Preisabsicherung an." },
        ],
      },
    ],
    related: ["derivate-handel", "termingeschaefte", "volatilitaet"],
  },
  {
    slug: "just-in-time-logistik",
    term: "Just-in-Time-Logistik (JIT)",
    shortDef: "Beschaffungs- und Produktionsprinzip, bei dem Rohstoffe und Vorprodukte exakt zum benotigten Zeitpunkt eintreffen, um Lagerkosten zu minimieren und Kapital zu binden.",
    category: "Logistik",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Grundprinzip und Ursprung",
        body: "Just-in-Time (JIT) ist ein Produktions- und Logistikkonzept, das auf minimale Lagerbestande und praezises Timing der Materialfluse setzt. Entwickelt von Toyota (Toyota Production System, TPS) in den 1950er Jahren. Kernidee: Kein Lager = keine Kapitalbildung, keine Lagerkosten, keine Obsoleszenz. Im Rohstoffhandel: JIT-Beschaffung bedeutet, Rohstoffe (Stahl, Aluminium, Kupfer) erst zu bestellen, wenn sie produktionsseitig benoetigt werden - keine Vorratshaltung. Anforderungen: Praezise Bedarfsplanung (Demand Planning), zuverlaessige Lieferanten mit kurzen Lead-Times, redundante Logistikrouten.",
      },
      {
        id: "rohstoff-jit",
        heading: "JIT im Rohstoffhandel: Chancen und Risiken",
        body: "Chancen: Gebundenes Kapital in Lagerbestanden entfaellt (Stahl: EUR 400-800/t gebundenes Kapital). Lagerhaltungskosten entfallen (0,5-2% p.M. des Warenwerts). Kein Obsoleszenz-Risiko bei Qualitaetsaenderungen. Risiken: Lieferketten-Vulnerabilitaet: COVID-19 (2020-2021) und Ukraine-Krieg (2022) haben gezeigt, dass JIT bei globalen Krisen versagt. Single-Source-Risiko: JIT erfordert oft langfristige Lieferantenbeziehungen - Ausfall eines Lieferanten laehmt Produktion. Preisrisiko: JIT ohne Hedging bedeutet volle Preisexposition bei Spot-Kauf. Pufferloesungen: Vendor-Managed Inventory (VMI) - Lieferant verwaltet Kundenlager; Konsignationslager als Kompromiss.",
      },
      {
        id: "logistik-anforderungen",
        heading: "Logistikanforderungen fuer JIT",
        body: "Lead-Time-Management: JIT erfordert praezise Planung aller Transportzeiten. Stahl-LKW-Transport: 1-2 Tage (national), 2-5 Tage (EU-weit). Schiff/Bahn: Deutlich laenger, aber kostenguenstiger. Track and Trace: Echtzeit-Ortung von Lieferungen (GPS, RFID, EDI-Statusmeldungen). Flexible Umschlagkapazitaeten: Just-in-Sequence (JIS) - Lieferung in der Reihenfolge des Produktionsbedarfs. Warehousing-as-a-Service: Externe 3PL-Dienstleister (Third Party Logistics) als JIT-Puffer.",
      },
      {
        id: "eucx-jit",
        heading: "JIT und EUCX: Spot-Markt als JIT-Instrument",
        body: "EUCX unterstuetzt JIT-Beschaffung durch: Spot-Handel: Kurzfristige Beschaffung am Spotmarkt bei akutem Bedarf. Typische Lieferzeit ab Handelsabschluss: 2-10 Werktage (je nach Incoterm und Standort). Framework Agreements: EUCX-Rahmenkontrakdte mit definierten Lieferabrufrechten - Preis fixiert, Menge und Timing flexibel. OTF-Vorteile: Als OTF kann EUCX individuell ausgehandelte Kontrakte mit massgeschneiderten Lieferbedingungen abwickeln. Abwicklungsgarantie: EUCX-Abwicklungsgarantie sichert JIT-Lieferungen ab - Ausfall eines Lieferanten wird durch alternative Beschaffung oder Kompensation ausgeglichen.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Ist JIT bei volatilen Rohstoffpreisen sinnvoll?", a: "JIT ohne Preishedging ist risikoreich bei hoher Volatilitaet. Empfehlung: JIT-Beschaffung kombinieren mit Forward-Hedge (Preis fixieren, Liefertermin flexibel)." },
          { q: "Wie kurz kann Lead-Time bei EUCX sein?", a: "Bei vorhandenen Lagerbestaenden (physische Ware in Zolllager oder Konsignationslager) sind Lieferzeiten von 24-48h moeglich. Standardfall: 5-10 Werktage." },
        ],
      },
    ],
    related: ["incoterms-2020", "spot-markt", "abwicklungsgarantie"],
  },
  {
    slug: "kontrahentenrisiko",
    term: "Kontrahentenrisiko (Counterparty Risk)",
    shortDef: "Das Risiko, dass eine Vertragspartei ihre vertraglichen Verpflichtungen (Lieferung, Zahlung) nicht erfullt - zentrales Risikofeld im Rohstoffhandel, adressiert durch Clearinghouses und Abwicklungsgarantien.",
    category: "Handel",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Arten",
        body: "Kontrahentenrisiko (englisch: counterparty risk oder credit risk) ist das Ausfallrisiko einer Vertragspartei. Im Rohstoffhandel: Pre-Settlement Risk - Risiko vor Lieferung/Zahlung, dass Gegenpartei insolvent wird oder nicht liefert. Settlement Risk - Risiko beim Austausch von Ware gegen Zahlung (Herstie-Risiko / Lieferverzug). Replacement Risk - Risiko, dass ein ausgefallener Kontrakt nur zu schlechteren Marktbedingungen ersetzt werden kann. Konzentrationsrisiko - Zu viele Kontrakte mit einem einzigen Kontrahenten. Im physischen Rohstoffhandel tritt Kontrahentenrisiko in zwei Formen auf: Lieferausfall (Verkaeuferseitig) und Zahlungsausfall (Kaeuferseitig).",
      },
      {
        id: "bewertung",
        heading: "Risikobewertung und Due Diligence",
        body: "KYC (Know Your Customer): Identitaetspruefung, Adressverifikation, UBO-Ermittlung (Ultimate Beneficial Owner). AML (Anti-Money Laundering): Transaktion auf Geldwaeschehinweise prufen. Bonitaetspruefung: Jahresabschlussanalyse, Schufa/Creditreform, Kreditversicherungsauskunft. Rating: Externe Ratings (Moody's, S&P, Fitch) fuer grosse Gegeparteien. Interne Kreditlinien: Jeder Gegenpartei wird eine maximale Kreditlinie zugewiesen - ueberschreitet ein Kontrakt diese Linie, ist besondere Besicherung erforderlich. Trade Credit Insurance: Euler Hermes, Atradius, Coface bieten Warenkreditversicherungen.",
      },
      {
        id: "absicherung",
        heading: "Absicherungsmechanismen",
        body: "Letter of Credit (L/C): Bankgarantie, die Zahlung sicherstellt, sobald konforme Dokumente vorgelegt werden. Sicherste Methode im Aussenhandel. Bankgarantie: Unwiderrufliche Zahlungszusage der Bank des Verkaufers/Kaeufers. Advance Payment: Vorauszahlung (sicher fuer Verkaeuffer, risikoreich fuer Kaeuffer). Clearing House: Zentrale Gegenpartei (CCP) bei Boersengeschaeften - tritt als Verkaeuffer des Kaeuffers und Kaeuffer des Verkaeuffers auf. Eliminiert bilaterales Kontrahentenrisiko. EUCX-Abwicklungsgarantie: EUCX garantiert Erfullung aller auf der Plattform abgeschlossenen Kontrakte - zentralisiert und standardisiert das Kontrahentenrisiko-Management.",
      },
      {
        id: "regulierung",
        heading: "Regulatorische Anforderungen",
        body: "EMIR: Verpflichtendes Central Clearing fuer standardisierte OTC-Derivate; Margin-Anforderungen fuer bilaterale OTC-Derivate (Initial Margin + Variation Margin). Basel III/IV: Banken muessen Kontrahentenrisiken mit Eigenkapital unterlegen (CVA - Credit Valuation Adjustment). MiFID II: Pflicht zur Pruefung der Eignung von Gegenparteien; Eligible Counterparty, Professional Client, Retail Client - unterschiedliche Schutzanforderungen. KWG: Deutsche Kreditinstitute unterliegen zusaetzlichen Grosskredit-Grenzen (max. 25% des Eigenkapitals je Schuldner).",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Wie schutzt EUCX vor Kontrahentenrisiko?", a: "Die EUCX-Abwicklungsgarantie stellt sicher, dass alle auf der Plattform abgeschlossenen Kontrakte erfullt werden - unabhaengig vom Ausfall einer Gegenpartei." },
          { q: "Was ist der Unterschied zwischen Kontrahentenrisiko und Kreditrisiko?", a: "Kreditrisiko ist der Oberbegriff fuer alle Ausfallrisiken. Kontrahentenrisiko ist der spezifische Kreditrisiko-Begriff fuer Derivate und Handelskontrakdte (beidseitige Wertentwicklung)." },
          { q: "Muss ich jeden Handelspartner auf EUCX selbst bonitaetsprufen?", a: "Nein. EUCX uebernimmt das KYC/AML und die Bonitaetspruefung aller zugelassenen Marktteilnehmer." },
        ],
      },
    ],
    related: ["abwicklungsgarantie", "derivate-handel", "zahlungsbedingungen"],
  },
  {
    slug: "ne-metalle",
    term: "NE-Metalle (Nichteisenmetalle)",
    shortDef: "Alle Metalle ausser Eisen und Stahl: Kupfer, Aluminium, Blei, Zink, Nickel, Zinn, Edelmetalle und Sondermetalle - Grundlage der Elektroindustrie, E-Mobilitaet und Energiewende.",
    category: "Metalle",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Klassifikation",
        body: "Nichteisenmetalle (NE-Metalle) umfassen alle Metalle ausser Eisen (Fe) und seine Legierungen (Stahl, Gusseisen). Klassifikation: Schwermetalle (Dichte > 5 g/cm3): Kupfer, Blei, Zink, Nickel, Zinn, Kobalt, Molybdan. Leichtmetalle (Dichte < 5 g/cm3): Aluminium, Magnesium, Titan, Beryllium. Edelmetalle: Gold, Silber, Platin, Palladium, Rhodium, Iridium, Ruthenium, Osmium. Sonder- und Technologiemetalle: Lithium, Kobalt, Seltene Erden, Indium, Gallium, Germanium (kritisch fuer Energiewende und Digitalisierung). Schrott-Klassifikation: Altschrott, Neuschrott, Legierungsschrott - eigene Handelssystematik nach ISRI-Codes.",
      },
      {
        id: "maerkte",
        heading: "Maerkte und Preisbildung",
        body: "LME (London Metal Exchange): Globale Referenz fuer Kupfer, Aluminium, Zink, Blei, Nickel, Zinn, Kobalt, Molybdan. Preise in USD/t, Cash und 3-Monat. SHFE (Shanghai Futures Exchange): Chinesische Referenz; relevant da China > 50% globaler NE-Verbrauch. COMEX (CME): Relevant fuer Kupfer und Edelmetalle. Spotmaerkte: Regionale Praemien/Abschlaege gegenueber LME abhangig von Logistik, Qualitat, Herkunft. Sekundaermarkt (Recycling): Schrottpreise korrelieren mit LME, aber mit eigenem Spread. Europaischer Schrotthandel: Deutsche Schrottsortierungen nach BDSV-Schrottschluessel.",
      },
      {
        id: "energiewende",
        heading: "NE-Metalle und Energiewende",
        body: "Energiewende-Metalle: Kupfer (Windkraft: 4 t/MW), Aluminium (PV-Module), Lithium (Batterien), Kobalt (NMC-Kathoden), Nickel (NMC), Mangan (NMC), Silizium (PV), Seltene Erden (Permanentmagnete fur Windkraft und E-Motoren). Nachfrageprognose: IEA erwartet bis 2040 Verfunffachung der Nachfrage nach Energiewende-Metallen. Versorgungsrisiken: Kobalt (>60% Kongo), Lithium (Lithium-Dreieck Sudamerika), Seltene Erden (>80% China). EU Critical Raw Materials Act: Listet 34 kritische und 17 strategische Rohstoffe; zielt auf Diversifizierung und 10% Eigenforderung.",
      },
      {
        id: "recycling",
        heading: "Recycling und Kreislaufwirtschaft",
        body: "NE-Metalle sind unbegrenzt recyclierbar ohne Qualitaetsverlust (Ausnahme: Legierungskontamination). Recyclingquoten: Aluminium > 90% in Europa, Kupfer > 95% Sammelquote in DE, Blei > 99% (Fahrzeugbatterien). Sekundaer-Aluminium spart 95% Energie gegenueber Primaer-Aluminium. Schrotthandel: Grosser Markt - Deutschland exportiert ca. 10 Mio. t Metallschrott/Jahr. Recycling-NE-Metalle auf EUCX: Zertifizierter Recycling-Herkunftsnachweis, CO2-Intensitaet, REACH-Konformitaet der Schrotte.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Welche NE-Metalle sind auf EUCX handelbar?", a: "Kupfer, Aluminium, Zink, Nickel, Blei, Zinn in LME-Qualitaet sowie Recycling-Fraktionen nach BDSV/ISRI-Schluessel." },
          { q: "Was sind kritische Rohstoffe der EU und warum sind sie relevant?", a: "Die EU-Liste kritischer Rohstoffe (CRM) umfasst Materialien mit hohem Versorgungsrisiko und hoher wirtschaftlicher Bedeutung. Unternehmen, die CRMs beschaffen, mussen Sorgfaltspflichten nach CRM Act erfullen." },
          { q: "Wie wird der Preis von Recycling-Aluminium bestimmt?", a: "Recycling-Aluminium (Sekundaer-Aluminium) wird als Anteil des LME-Primaer-Aluminium-Preises gehandelt (z.B. 80-90% des LME-Preises), adjustiert um Qualitat, Legierungsanteile und Logistik." },
        ],
      },
    ],
    related: ["basismetalle", "lme-notierung", "reach-verordnung"],
  },
  {
    slug: "preisbildung",
    term: "Preisbildung im Rohstoffhandel",
    shortDef: "Die Mechanismen, durch die Rohstoffpreise entstehen: Angebot und Nachfrage, Borsenpreise, OTC-Verhandlungen, Referenzpreise und Praeamien - zentral fuer Kalkulation und Risikomanagement.",
    category: "Märkte",
    readMin: 10,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "mechanismen",
        heading: "Grundmechanismen der Rohstoffpreisbildung",
        body: "Rohstoffpreise entstehen durch das Zusammenspiel mehrerer Faktoren und Mechanismen: Boersenpreisbildung: An organisierten Handelsplatzen (LME, CME, ICE) bilden sich Preise durch Orderbuch-Matching (Angebot trifft Nachfrage). Transparent, liquide, Echtzeit. OTC-Preisbildung: Bilaterale Verhandlung zwischen Kaeufer und Verkaeuffer. Preis wird beeinflusst von aktuellen Boersenpreisen, Qualitat, Menge, Lieferort und -termin, Zahlungsbedingungen. Referenzpreissystem: Weltmarktpreise (LME Cash, Platts, Argus, ICIS) als Basis; physische Handelspreise = Referenz +/- Praemie/Abschlag.",
      },
      {
        id: "praemien",
        heading: "Praemien und Abschlaege",
        body: "Physische Praemien (Physicals Premiums) sind Auf- oder Abschlaege auf den LME-Referenzpreis und reflektieren: Qualitaet (Reinheit, Legierungszusammensetzung, Form). Herkunft (EU-Stahl erzielt Praemie gegenueber chinesischem Stahl wegen CBAM und Antidumping). Lagerort und Lieferbedingungen (Praemie fuer Lagerware vs. Produktion). Verpackung und Losgroesse (gebundelte Pakete vs. loses Schuttgut). Marktlage (Engpass-Praemie bei knappem Angebot). Beispiel Aluminium 2023: LME 3M-Preis USD 2.200/t + Rotterdamer Physische Praemie USD 290/t = tatsaechlicher Einkaufspreis USD 2.490/t, plus Fracht, Versicherung, Zoelle.",
      },
      {
        id: "marktteilnehmer",
        heading: "Einfluss der Marktteilnehmer",
        body: "Produzenten: Minen, Huttenwerke - typischerweise 'natural short' (versuchen, ihren Output vorwaerts zu verkaufen). Konsumenten: Autoindustrie, Bauwirtschaft - 'natural long' (versuchen, Einstandspreise zu sichern). Haendler: Arbitrageure, Market Maker - verbinden Produzenten und Konsumenten, stellen Liquiditaet. Finanzinvestoren: Spekulanten, ETF-Fonds - verstaerken Trends, koennen kurzfristig von Fundamentals entkoppeln. Zentralbanken: Indirekt uber Waehrungspolitik (USD-Kurse) und Wirtschaftssteuerung. Spekulation vs. Fundamentals: Kurzfristig dominiert oft Spekulation; langfristig folgen Preise Angebot-Nachfrage-Fundamentals.",
      },
      {
        id: "index-preise",
        heading: "Preisindizes und Bewertungsquellen",
        body: "LME (London Metal Exchange): Massgeblich fuer Nichteisenmetalle. Taeglich veroeffentlichte Official Prices und Settlement Prices. Platts (S&P Global): Energierohstoffe (Erdoel, Erdgas, Kohle, Strom) und Stahlprodukte. Argus Media: Alternative zu Platts, insbesondere fuer Erdoel und Stahl. ICIS (Independent Chemical Information Service): Petrochemie und Polymere. CRU (CRU Group): Stahlmarktanalysen und Preisbewertungen. Eurofer: Europaische Stahlverbands-Marktberichte. Relevanz fuer Vertraege: Langfristige Liefervertrage verweisen oft direkt auf Platts/CRU-Preisindizes als automatische Preisanpassungsformel.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Wie oft werden LME-Preise veroeffentlicht?", a: "LME veroeffentlicht Official Prices taeglich (13:00 Uhr Londoner Zeit nach Ring-Handel) und Settlement Prices (17:00 Uhr). Zudem gibt es Intraday-Echtzeit-Preise." },
          { q: "Was ist ein Physicals Premium und wie wird er verhandelt?", a: "Der Physicals Premium ist der Aufschlag auf den Borsenpreis und wird bilateral zwischen Kaeufer und Verkaeuffer verhandelt. Einflussfaktoren: Qualitat, Herkunft, Ort, Liefertermin und Marktlage." },
          { q: "Wie beeinflusst der USD-Kurs Rohstoffpreise?", a: "Rohstoffe werden global in USD bewertet. Steigt der USD, sinken Rohstoffpreise in USD (hoehere Kaufkraft fuer Nicht-USD-Laender). Faellt der USD, steigen Rohstoffpreise in USD." },
        ],
      },
    ],
    related: ["lme-notierung", "spot-markt", "volatilitaet"],
  },
  {
    slug: "qualitaetszertifikate",
    term: "Qualitaetszertifikate im Rohstoffhandel",
    shortDef: "Offizielle Dokumente, die die chemische Zusammensetzung, mechanischen Eigenschaften und Normenkonformitaet eines Rohstoffs oder Produkts bestaetigen - Basis jeder physischen Transaktion.",
    category: "Handel",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "arten",
        heading: "Arten von Qualitaetsnachweisen",
        body: "Mill Certificate (Werkzeugnis, EN 10204): Das wichtigste Dokument im Metallhandel. Bestaetigt chemische Zusammensetzung und mechanische Eigenschaften (Zugfestigkeit, Streckgrenze, Dehnung). EN 10204 Typen: 2.1 Konformitaetsbescheinigung (Hersteller bestaetigt Normenkonformitaet, keine Pruefung). 2.2 Werkszeugnis (Hersteller bestaetigt auf Basis von Werksuntersuchungen). 3.1 Abnahmezeugnis (autorisierter Werksvertreter bestaetigt auf Basis produktspezifischer Pruefung). 3.2 Abnahmezeugnis (Werksvertreter + unabhaengiger Prufer oder Behoerde). LME-Zertifizierung: LME-Marken sind registrierte Marken, die Metalle als LME-lieferbar ausweisen.",
      },
      {
        id: "normen",
        heading: "Relevante Normen",
        body: "Stahl und Eisen: EN 10025 (Warmgewalzte Erzeugnisse), EN 10080 (Betonstahl), EN 10219 (Hohlprofile), ASTM A615 (US-Norm fuer Betonstahl). Aluminium: EN 573 (Zusammensetzung Knetlegierungen), EN 1706 (Gusslegierungen), LME P1020A Specification. Kupfer: EN 1978 (Kupfer-Kathodenplatten - Cu-CATH-2), LME Grade A Specification. Normbezug in Vertraegen: Jeder EUCX-Kontrakt referenziert explizit die geltende Norm und das Zeugnis-Typ (EN 10204). Abweichungen: Ware ohne EN 10204 3.1 Zeugnis kann nicht als LME-lieferbare Ware oder nach EN-Norm gehandelt werden.",
      },
      {
        id: "pruefung",
        heading: "Pruefung und Verifikation",
        body: "Third-Party Inspection (TPI): Unabhaengige Prufer (SGS, Bureau Veritas, Intertek, TUV) prufen Ware vor Verladung. Gebuehren: Ca. 100-500 EUR je Pruefung, abhangig von Umfang. XRF-Analyse (Roentgenfluoreszenz): Mobiles Geraet zur schnellen, zerstoerungsfreien Analyse der chemischen Zusammensetzung vor Ort. Einschlagueberpruefung: Visuelle Inspektion auf Oberflachendefekte, Geometrietoleranzen. Pre-Shipment Inspection: Standardverfahren bei Langstreckenimporten (China, CIS-Staaten). Dokument-Verifikation: EUCX prueft alle hochgeladenen Zertifikate auf Echtheit und Normkonformitaet vor Handelsmatch.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Welches Zeugnis ist Mindeststandard auf EUCX?", a: "Mindestanforderung: EN 10204 Typ 3.1 Abnahmezeugnis. Fuer kritische Anwendungen (Druckbehaelter, tragende Konstruktionen) wird 3.2 empfohlen." },
          { q: "Was ist der Unterschied zwischen EN 10204 2.2 und 3.1?", a: "2.2 basiert auf allgemeinen Werkspruefungen, nicht produktspezifisch. 3.1 ist eine produktspezifische Pruefung, durchgefuhrt vom autorisierten Werksvertreter und dokumentiert auf das jeweilige Schmelzen-/Chargenzeichen." },
          { q: "Welche Fristen gelten fuer Reklamationen bei Qualitaetsmaengeln?", a: "Im EUCX-Rahmenwerk: schriftliche Maengelruge innerhalb von 5 Werktagen nach Lieferung und Moeglichkeit zur Inspektion. Verjaeehrung nach BGB: i.d.R. 2 Jahre." },
        ],
      },
    ],
    related: ["betonstahl", "basismetalle", "incoterms-2020"],
  },
  {
    slug: "reach-verordnung",
    term: "REACH-Verordnung",
    shortDef: "EU-Chemikalienverordnung (EG Nr. 1907/2006) zur Registrierung, Bewertung, Zulassung und Beschraenkung chemischer Stoffe - gilt auch fur Metalle und verpflichtet Importeure und Hersteller.",
    category: "Regulierung",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "grundlagen",
        heading: "Grundlagen und Anwendungsbereich",
        body: "REACH steht fuer Registration, Evaluation, Authorisation and Restriction of Chemicals. Rechtsgrundlage: Verordnung (EG) Nr. 1907/2006, in Kraft seit 1. Juni 2007, verwaltet von der Europaeischen Chemikalienagentur (ECHA) in Helsinki. Ziel: Schutz menschlicher Gesundheit und Umwelt vor Chemikalienrisiken; Foerderung der Substitution gefaehrlicher Stoffe. Anwendungsbereich: Alle chemischen Stoffe - also auch Metalle, Legierungen, Schlacken - sofern sie hergestellt, importiert oder in der EU genutzt werden. Ausnahmen: Radioaktive Stoffe (Euratom), Abfaelle (Abfallrahmenrichtlinie), Lebensmittel.",
      },
      {
        id: "metalle",
        heading: "REACH und Metalle",
        body: "Metalle sind Stoffe im Sinne von REACH und mussen registriert werden, wenn sie >= 1 Tonne/Jahr produziert oder importiert werden. Besonderheiten fuer Metalle: Metalle in ihrer Grundform (z.B. Kupfer-Kathoden) gelten als Stoffe. Legierungen gelten als Gemische - keine eigene Registrierungspflicht fuer die Legierung selbst, aber fuer die enthaltenen Stoffe. Kritische Metalle: Blei, Cadmium, Chrom (VI), Quecksilber, Nickel-Verbindungen unterliegen besonderen Beschraenkungen (Anhang XVII). SVHC-Liste (Substances of Very High Concern): Stoffe mit krebserregenden, erbgutveraendernden oder fortpflanzungsschaedigenden Eigenschaften - regelmaessig aktualisiert.",
      },
      {
        id: "lieferkette",
        heading: "REACH in der Rohstoff-Lieferkette",
        body: "Downstream-User (DU): Unternehmen, die REACH-registrierte Stoffe verwenden. Sie mussen Sicherheitsdatenblaetter (SDS - Safety Data Sheets) fuhren und an Kunden weitergeben. Importeur-Pflichten: Importeure aus Nicht-EU-Laendern mussen REACH-Registrierung selbst durchfuhren (nicht automatisch durch den aussereuropaeischen Hersteller). Only Representative (OR): Nicht-EU-Hersteller kann einen OR in der EU benennen, der REACH-Registrierung ubernimmt. SVHC-Informationspflicht: Ab 0,1% SVHC-Gehalt in Erzeugnissen muss Information an Kunden und ECHA gemeldet werden. Praktische Konsequenz im Rohstoffhandel: Mill Certificate reicht nicht allein; zusaetzlich SDS und ggf. SVHC-Deklaration erforderlich.",
      },
      {
        id: "buessgeld",
        heading: "Sanktionen und Compliance",
        body: "REACH-Verstoss ist eine Ordnungswidrigkeit nach ChemG (Chemikaliengesetz). Bussgeld: Bis zu 50.000 EUR pro Verstoss. Strafrechtlich: Bei vorsaetzlichem Inverkehrbringen nicht-registrierter Stoffe bis 2 Jahre Freiheitsstrafe (Paragraph 27a ChemG). Marktuberwachung: Zollbehorden pruefen REACH-Konformitaet bei Importen. Ruckruf: Nicht-konforme Ware muss aus dem Verkehr gezogen werden. EUCX-Compliance: EUCX fordert REACH-Konformitaetserklarung bei allen importierten Rohstoffen als Teil der Handelsdokumentation.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Muss ich als Stahl-Importeur REACH-Registrierung durchfuhren?", a: "Ja, wenn Sie > 1 t/Jahr eines REACH-pflichtigen Stoffs (einschl. Metalle) importieren. Pruefen Sie, ob ein Only Representative des Herstellers bereits registriert hat." },
          { q: "Was ist ein Sicherheitsdatenblatt (SDS) und wann brauche ich es?", a: "SDS (EN 16096 / GHS-Format) sind standardisierte Dokumente mit Gefahreninformationen, Handhabungshinweisen und Entsorgung. Pflicht bei gefaehrlichen Stoffen und auf Anfrage auch bei nicht-gefaehrlichen." },
          { q: "Gelten REACH-Anforderungen auch fur Schrott?", a: "Schrott, der die Abfalleigenschaft verloren hat (End-of-Waste), unterliegt REACH. Schrott als Abfall ist ausgenommen - bis zu dem Moment, wo er als Stoff in den Markt eintritt." },
        ],
      },
    ],
    related: ["cbam", "esg-kriterien", "ne-metalle"],
  },
  {
    slug: "spot-markt",
    term: "Spot-Markt (Kassahandel)",
    shortDef: "Handel von Rohstoffen zur sofortigen oder kurzfristigen Lieferung (typisch 1-5 Werktage) zum aktuellen Marktpreis (Spot-Preis), im Gegensatz zum Terminhandel.",
    category: "Märkte",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Abgrenzung",
        body: "Der Spot-Markt (auch: Kassamarkt) ist ein Markt, auf dem Waren zum aktuellen Preis (Spot-Preis oder Kassapreis) gegen sofortige oder sehr kurzfristige Lieferung und Zahlung gehandelt werden. Typische Settlement-Perioden: Devisen: T+2 (zwei Werktage nach Trade); Metalle (LME Cash): T+2; Physische Rohstoffe: je nach Incoterm und Lagerort 1-10 Werktage. Abgrenzung Terminmarkt: Termingeschaefte fixieren Preis und Menge heute fuer zukuenftige Lieferung und Zahlung. Spot ist 'jetzt', Termin ist 'spaeter'. Spot-Preis: Aktueller Gleichgewichtspreis aus Angebot und Nachfrage. LME veroeffentlicht offiziell den 'LME Cash Price' als globalen Referenz-Spot-Preis fuer Metalle.",
      },
      {
        id: "funktionen",
        heading: "Funktionen des Spot-Markts",
        body: "Preisfindung: Spot-Preise sind Ausdruck aktueller Knappheitsverhaeltnisse und Marktstimmung. Liquiditaetsversorgung: Spot-Handel ermoeglicht kurzfristige Beschaffung oder Absatz ohne Termin-Commitment. Referenzfunktion: Terminpreise werden mathematisch vom Spot-Preis abgeleitet (Spot + Cost of Carry). JIT-Beschaffung: Industrieunternehmen mit Just-in-Time-Produktion kaufen am Spot-Markt bei akutem Bedarf. Arbitrage: Preisunterschiede zwischen Spot-Markt und Terminmarkt (Basis) werden durch Arbitrageure ausgeglichen - haelt Maerkte im Gleichgewicht.",
      },
      {
        id: "contango-backwardation",
        heading: "Contango und Backwardation",
        body: "Contango (Normalfall): Terminpreise > Spot-Preis. Erklaerung: Lagerkosten, Finanzierungskosten und Convenience Yield. Bei ausreichendem Angebot und normalen Marktbedingungen. Backwardation (Sonderfall): Spot-Preis > Terminpreise. Erklaerung: Physische Knappheit - Marktteilnehmer zahlen Premium fuer sofortige Lieferung. Signal: Lagerfuer diese Ware sind knapp oder leer. Significance fuer Haendler: In Backwardation ist physische Lagerware sehr wertvoll (Cash & Carry Arbitrage unrentabel). Contango begunstigt Einlagerung und Forward-Selling. LME-Kontrakte: Spread zwischen Cash und 3-Monat zeigt Contango/Backwardation-Verhaeltnis.",
      },
      {
        id: "eucx-spot",
        heading: "Spot-Handel auf EUCX",
        body: "EUCX OTF bietet Spot-Handel fuer Metalle und Industrierohstoffe. Charakteristika: Preisfindung durch Orderbuch-Matching oder bilaterale Verhandlung (OTF-Ermessen). Settlement: T+5 Standard (5 Werktage ab Handelstag), verkurzbar auf T+2 bei Lagerware. Abwicklungsgarantie: EUCX garantiert physische Lieferung und Zahlung. Mindestmenge: 1 Tonne (Metalle), branchenabhaengig. Spot-Price-Index: EUCX veroeffentlicht eigene Spot-Preisindizes auf Basis abgeschlossener Transaktionen (Post-Trade-Transparenz gemaess MiFID II).",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Was ist der Unterschied zwischen LME Cash Price und Spot-Preis?", a: "LME Cash Price ist der offizielle LME-Settlement-Preis mit T+2-Lieferung an LME-Lagerhaus. Physischer Spot-Preis = LME Cash +/- Physicals Premium, reflektiert regionale Verhaeltnisse." },
          { q: "Wie schnell kann ich auf EUCX physische Ware kaufen?", a: "Bei Lagerware in EU-Zolllager: Handelsmatch bis Lieferbestaetigung ca. 24-48h, physische Lieferung oder Lager-Transfer T+2." },
          { q: "Ist Spot-Handel risikoreicher als Terminhandel?", a: "Spot-Handel hat kein Preisrisiko uber die Laufzeit (da sofort abgerechnet), aber auch keine Absicherung gegen zukunftige Preisaenderungen. Terminhandel fixiert den Preis, aber mit Gegenparteien- und Margin-Risiko." },
        ],
      },
    ],
    related: ["lme-notierung", "termingeschaefte", "preisbildung"],
  },
  {
    slug: "termingeschaefte",
    term: "Termingeschaefte (Forwards & Futures)",
    shortDef: "Kontrakte uber Kauf oder Verkauf eines Rohstoffs zu einem heute fixierten Preis fur eine zukunftige Lieferung - ermoglichen Preisplanung und Absicherung fuer Industrie und Handel.",
    category: "Handel",
    readMin: 9,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "grundlagen",
        heading: "Grundlagen und Abgrenzung",
        body: "Termingeschaefte sind Kontrakte, bei denen Preis, Menge und Qualitat heute vereinbart werden, Lieferung und Zahlung aber zu einem zukunftigen Datum erfolgen. Zwei Grundtypen: Forwards (OTC): Bilateral ausgehandelt, keine Standardisierung, keine Marginpflicht, hoehere Flexibilitaet. Futures (Borsengehandelt): Standardisiert (Menge, Qualitaet, Lieferort und -datum), taeglich Marking-to-Market (Variation Margin), hohe Liquiditaet. Abgrenzung zum Spot: Spot = heute gehandelt + heute (oder T+2) geliefert. Termin = heute gehandelt + spaeter geliefert. Wirtschaftliche Funktion: Preissicherung, Planung und Absicherung fuer Produzenten und Konsumenten. Spekulative Funktion: Wetten auf Preisrichtung ohne physische Lieferabsicht.",
      },
      {
        id: "pricing",
        heading: "Preisbildung bei Termingeschaeften",
        body: "Theoretischer Terminpreis: F = S * e^(r+s-y)*T. S = Spot-Preis, r = risikofreier Zinssatz, s = Lagerkosten (storage), y = Convenience Yield, T = Laufzeit. In der Praxis: F (Futures) = Spot + Cost of Carry - Convenience Yield. Cost of Carry: Finanzierungskosten + Lagerkosten + Versicherung + Transport. Convenience Yield: Nutzen aus physischem Besitz (Produktion kann sofort fortgefuhrt werden). Contango: F > S (Cost of Carry uberwiegt). Backwardation: F < S (Convenience Yield uberwiegt - physische Knappheit). Basis: Differenz zwischen Futures-Preis und physischem Spot-Preis eines spezifischen Rohstoffs.",
      },
      {
        id: "lme-kontrakte",
        heading: "LME-Terminkontrakte",
        body: "LME (London Metal Exchange) ist die globale Referenz fuer Metall-Termingeschaefte. Handelsstruktur: Daily Prompts (jeden Tag als moeglicher Liefertag) fur die ersten 3 Monate. 3-Monats-Kontrakt: Liquidester Kontrakt, Referenzpreis fuer physischen Handel. Carry Trades: Haendler kaufen physisch, lagern und verkaufen Termin (bei Contango). Lagerhausgebuhren: LME-zertifizierte Lagerhaeuser in Rotterdam, Antwerpen, Hamburg, Vlissingen. Warrant System: Warehouse Warrants sind handelbare Dokumente, die physisches Metall im LME-Lager reprasentieren. LME Clear: Clearinghouse, ubernimmt Gegenparteirisiko.",
      },
      {
        id: "eucx-forwards",
        heading: "Forwards auf EUCX",
        body: "Als Commodity OTF kann EUCX physisch-hinterlegte Forward-Kontrakte anbieten. Charakteristika: Individuelle Aushandlung: Menge, Qualitaet, Lieferort, Termin und Preis werden bilateral vereinbart. OTF-Matching: EUCX-Handelsplattform facilitated Matching, kann Ermessen ausuben. Abwicklungsgarantie: Alle EUCX-Forwards werden durch Abwicklungsgarantie abgesichert. Meldepflicht: Post-Trade-Transparenz nach MiFID II / MiFIR - EUCX uebernimmt Transaktionsmeldung an BaFin. Mindestlaufzeit: 1 Werktag bis 12 Monate. Typische Verwendung: Stahlwerk kauft Schrotttermein fur naechstes Quartal; Aluminiumhandler verkauft Produktion 3 Monate forward.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Was passiert, wenn ich einen Futures-Kontrakt bis zum Liefertag halte?", a: "Bei physisch abgewickelten Futures (wie LME) muessen Sie die Ware abnehmen und bezahlen. Bei Cash-Settled Futures (wie viele Energie-Futures) erfolgt nur Barausgleich. Haendler schliessen i.d.R. Positionen vor Faelligkeit." },
          { q: "Muss ich Margin fuer EUCX-Forwards hinterlegen?", a: "EUCX erhebt eine Performance Bond (Sicherheitsleistung) bei Kontraktabschluss. Hoehe abhaengig von Kontraktgroesse, Laufzeit und Bonitat der Gegenpartei." },
          { q: "Wie unterscheiden sich EUCX-Forwards von LME-Futures?", a: "LME-Futures: Standardisiert, borsengehandelt, taeglich Marking-to-Market. EUCX-Forwards: Individuell, OTC/OTF, flexible Spezifikation, keine taegl. Margin-Calls, aber EUCX-Abwicklungsgarantie." },
        ],
      },
    ],
    related: ["spot-markt", "derivate-handel", "hedging"],
  },
  {
    slug: "ursprungszeugnis",
    term: "Ursprungszeugnis (Certificate of Origin)",
    shortDef: "Amtliches Handelsdokument, das die wirtschaftliche Herkunft einer Ware bescheinigt - relevant fuer Zollpraeferenzen, Antidumping-Massnahmen und EU-Handelspolitik.",
    category: "Logistik",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "grundlagen",
        heading: "Grundlagen und Zweck",
        body: "Das Ursprungszeugnis (UZ, englisch: Certificate of Origin / CoO) ist ein amtliches Dokument, das die Herkunft einer Ware bescheinigt. Ausstellende Behoerde: In Deutschland: Industrie- und Handelskammern (IHKs) - ca. 79 IHKs bundesweit. EU-weit anerkannt. Zwei Arten: Nicht-praefeRENZIELLES Ursprungszeugnis: Bescheinigt wirtschaftliche Herkunft, kein Zollvorteil. Verwendet fuer: Antidumping-Pruefungen, Einfuhrquoten, Embargokontrollen, Handelsstatistik. Praeferenzielles Urspruungszeugnis: Bescheinigt Herkunft im Sinne eines Freihandelsabkommens (z.B. EUR.1, Form A, REX). Berechtigt zu Praferenz-Zollsatz.",
      },
      {
        id: "ursprungsregeln",
        heading: "Ursprungsregeln",
        body: "Vollstaendig gewonnene Waren: Naturprodukte (Erze, landwirtschaftliche Erzeugnisse) haben Ursprung des Gewinnungslands. Ausreichend be- oder verarbeitete Waren: Verarbeitungsregeln bestimmen, wann auslaendisches Vorprodukt Ursprung des Verarbeitungslandes erhaelt. Methoden: Positionswechsel (Wechsel der Zolltarifposition nach Verarbeitung), Wertschoepfungsregel (Mindestprozentsatz heimischer Wertschoepfung), Spezifischer Prozess (definierter Herstellungsprozess erforderlich). Beispiel Stahl: Betonstahl aus ukrainischem Knuppel, gewalzt in Polen = polnischer Ursprung (Positionswechsel durch Warmwalzen). Aufgepasst: Minimale Bearbeitung (Umpacken, Sortieren) reicht i.d.R. nicht fur Ursprungserwerb.",
      },
      {
        id: "handelsrelevanz",
        heading: "Bedeutung im Rohstoffhandel",
        body: "Antidumping: EU erhebt Antidumping-Zoelle auf Stahl aus bestimmten Laendern (China, Russland, Belarus). Ursprungszeugnis ist Nachweis, ob Ware betroffen ist. Embargoware: Sanktionierte Laender (z.B. Russland-Embargo nach 2022) - Ursprungszeugnis ist Pflichtdokument zur Embargo-Compliance. EU-Steel-Safeguard: Kontingent-Verwaltung pro Ursprungsland. Schadenersatzrisiko bei Falschangabe: Bewusste Falschanmeldung des Ursprungs ist Zollbetrug (Paragraph 370 AO) - strafrechtliche Konsequenzen. EUCX-Dokumentation: Ursprungszeugnis ist Pflichtdokument fuer alle importierten Rohstoffe auf EUCX.",
      },
      {
        id: "sonderfall-rex",
        heading: "REX-System und Praferenznachweis",
        body: "REX (Registered Exporter): EU-System fuer praefeRENZIELLE Ursprungserklarungen. Exporteure aus Entwicklungslaendern (APS-Lander) konnen sich als REX registrieren und selbst Ursprungserklarungen abgeben (kein IHK-Zeugnis mehr notig). EUR.1-Ursprungszeugnis: Praeferenznachweisdokument fur EU-Freihandelsabkommen. Ausgestellt von der Zollbehorde des Ausfuhrlandes. Form A: Praferenznachweis fur Allgemeines Praferenzsystem (APS) - fuer Importe aus Entwicklungslaendern. REP-Erklaerung: Kurzform fuer Sendungen bis 6.000 EUR (Ermachtigter Ausfuhrer kann selbst erklaren).",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Woher bekomme ich ein Ursprungszeugnis?", a: "In Deutschland von der zustaendigen IHK. Online-Antrag moeglich uber AHK-System. Erstellungszeit: i.d.R. 1-2 Werktage." },
          { q: "Welche Angaben enthalt ein Ursprungszeugnis?", a: "Exporteur, Empfaenger, Warenbezeichnung, Menge, Versendungsland, Ursprungsland, Referenz auf Handelsrechnung, IHK-Stempel und Unterschrift." },
          { q: "Gilt ein EUR.1 auch als nicht-praefeRENZIELLES Ursprungszeugnis?", a: "Nein. EUR.1 ist ein praefeRENZIELLES Dokument. Fuer nicht-praefeRENZIELLE Zwecke (Antidumping-Pruefung) ist ein separates Ursprungszeugnis der IHK notig." },
        ],
      },
    ],
    related: ["incoterms-2020", "cbam", "gemeinsamer-zolltarif"],
  },
  {
    slug: "volatilitaet",
    term: "Volatilitaet im Rohstoffhandel",
    shortDef: "Mass fur die Schwankungsintensitaet von Rohstoffpreisen - bestimmt Hedging-Bedarf, Marginsatze, Optionspraemien und das Risikomanagement institutioneller Marktteilnehmer.",
    category: "Märkte",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Messung",
        body: "Volatilitaet ist ein statistisches Mass fuer die Streuung von Preisaenderungen um einen Mittelwert. Historische Volatilitaet (HV): Berechnet aus vergangenen Preisbewegungen. Standardabweichung der taglichen Renditen annualisiert (mul mit Quadratwurzel aus 252 Handelstagen). Implizite Volatilitaet (IV): Aus aktuellen Optionspreisen abgeleitete Markterwartung zukuenftiger Volatilitaet. IV > HV: Markt erwartet hoehere Volatilitaet als zuletzt (typisch vor Ereignissen). CVOL (CME Commodity Volatility Index): Standardisiertes Mass fuer Commodity-Volatilitaet. Rohstoffvolatilitaeten (typisch): Kupfer: 20-30% p.a., Aluminium: 20-25% p.a., Rohoel: 25-40% p.a., Erdgas: 40-80% p.a.",
      },
      {
        id: "treiber",
        heading: "Volatilitaetstreiber im Rohstoffhandel",
        body: "Angebotsstoerungen: Minen-Streiks, Naturkatastrophen, Huttenschliessungen, Produktionsausfaelle. Wirkung: Kurzfristig starke Preisbewegungen nach oben. Nachfrageaenderungen: Wirtschaftszyklus (Rezession = Nachfrageeinbruch), China-Konjunktur, saisonale Effekte. Geopolitik: Sanktionen, Embargos, Handelskriege. Russland-Ukraine-Krieg 2022: Nickel-Volatilitaet explodierte (Nickel short squeeze LME: +250% an einem Tag). Waehrungen: USD-Schwankungen beeinflussen alle in USD notierten Rohstoffe. Energiepreise: Aluminium (energieintensiv), Dungemittel (Erdgas als Vorprodukt). Spekulation: Grossanleger (CTAs - Commodity Trading Advisors) koennen Trends verstaerken.",
      },
      {
        id: "risikomanagement",
        heading: "Risikomanagement bei hoher Volatilitaet",
        body: "Value at Risk (VaR): Maximaler erwarteter Verlust bei gegebener Wahrscheinlichkeit (99%) und Haltedauer (1 oder 10 Tage). VaR = Positionsgroesse * Volatilitaet * Quantil. CVaR (Conditional VaR / Expected Shortfall): Durchschnittlicher Verlust in den schlimmsten (1-alpha)% Szenarien. Stress-Tests: Simulation von Extremszenarien (z.B. +/- 30% Preisaenderung in einer Woche). Stop-Loss-Limits: Automatische Position-Schliessungen bei Ueberschreiten definierter Verlustschwellen. Margin-Calls: Hohe Volatilitaet = hohe Margin-Anforderungen. LME erhoehte nach Nickel short squeeze 2022 Margins massiv. Position Limits: MiFID II schreibt Position Limits vor, um exzessive Spekulation zu begrenzen.",
      },
      {
        id: "optionen",
        heading: "Volatilitaet und Optionshandel",
        body: "Optionspreis (Black-Scholes): C = S*N(d1) - K*e^(-rT)*N(d2). Entscheidender Parameter: Sigma (Volatilitaet). Hohe Volatilitaet = teure Optionen = hohere Versicherungspraemie. Volatility Smile: In der Praxis ist implizite Volatilitaet fuer tief im Geld und weit aus dem Geld liegende Optionen hoeher als fuer at-the-money Optionen. Volatility Trading: Straddle (Long Call + Long Put) profitiert von starken Preisbewegungen in beliebige Richtung. Delta-neutral. Vega: Sensitivitaet des Optionspreises gegenueber Volatilitaetsaenderungen. Wichtigster Grieche bei Volatilitaets-Positionen.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Welche Rohstoffe sind am volatilsten?", a: "Erdgas und Seltene Erden zeigen oft hoechste Volatilitaet. Unter Metallen: Nickel, Kobalt. Kupfer und Aluminium sind relativ stabiler, aber immer noch volatiler als Aktienindizes." },
          { q: "Wie reagieren Margin-Anforderungen auf Volatilitaet?", a: "Margin-Satze steigen mit Volatilitaet. Bei Extremereignissen (wie LME-Nickel 2022) koennen Margins auf das 5-10-fache erhoehen werden. Ausreichende Liquiditaet als Margin-Reserve ist kritisch." },
          { q: "Kann ich mich gegen Volatilitaet versichern?", a: "Ja, durch Optionen (Kauf von Puts oder Calls). Die Praemie ist die 'Versicherungspraemie'. Alternativ: Fixpreiskontrakte (Forwards) eliminieren Preisrisiko vollstaendig." },
        ],
      },
    ],
    related: ["derivate-handel", "hedging", "preisbildung"],
  },
  {
    slug: "warenterminboerse",
    term: "Warenterminboerse",
    shortDef: "Organisierter Handelsplatz fuer standardisierte Warentermin-Kontrakte (Futures und Optionen) auf Rohstoffe - ermoeglicht Preisfindung und Risikomanagement fur Industrie und Handel.",
    category: "Märkte",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und globale Boersen",
        body: "Eine Warenterminboerse ist ein regulierter Handelsplatz, auf dem standardisierte Kontrakte uber die zukuenftige Lieferung von Rohstoffen gehandelt werden. Globale Hauptboersen: LME (London Metal Exchange): Basismetalle (Kupfer, Aluminium, Zink, Blei, Nickel, Zinn). CME Group (Chicago Mercantile Exchange): Getreide (Weizen, Mais, Soja), Metalle (Gold, Silber, Kupfer), Energie (Erdoel, Erdgas), Vieh. ICE (Intercontinental Exchange): Energie (Brent, Erdgas, Strom), Weichware (Kakao, Kaffee, Zucker, Baumwolle). CBOT (Chicago Board of Trade, Teil der CME): Agrarrohstoffe. NYMEX (New York Mercantile Exchange, Teil der CME): Energie. SHFE (Shanghai Futures Exchange): Chinesische Basismetalle und Energie.",
      },
      {
        id: "funktion",
        heading: "Wirtschaftliche Funktionen",
        body: "Preisfindung (Price Discovery): Boersenpreise aggregieren global verteiltes Wissen uber Angebot und Nachfrage in einem Preis. Transparente, oeffentliche Information. Risikotransfer (Hedging): Produzenten und Konsumenten transferieren Preisrisiko auf Spekulanten, die es gegen Praemie tragen. Liquiditaet: Standardisierung ermoeglicht hohe Liquiditaet - Positionen koennen jederzeit geoeffnet und geschlossen werden. Preiskonvergenz: Futures-Preise laufen bei Faelligkeit gegen den Spot-Preis (Convergence). Physische Lieferung als Anker. Referenzpreissystem: Boersenpreise dienen als Basis fuer physische Handelskontrakte weltweit.",
      },
      {
        id: "regulierung",
        heading: "Regulierung von Warenterminboersen",
        body: "EU: MiFID II reguliert Warenderivate-Handel. OTF, MTF und RM als zugelassene Handelsplatze. Warenderivat-Ausnahme (Commodity Dealer Exemption) fur nicht-finanzielle Teilnehmer. Position Limits fuer Warenderivate-Kontrakte nach Art. 57 MiFID II. USA: CFTC (Commodity Futures Trading Commission) reguliert Warenderivate-Boersen. CFTC Position Limits fuer physische Rohstoff-Futures. Designated Contract Markets (DCMs) als regulierte Boersen. UK (post-Brexit): FCA (Financial Conduct Authority) reguliert LME und andere UK-Boersen mit weitgehend MiFID II-vergleichbarem Rahmen. Clearing: Alle Boersen-Futures werden uber Clearinghouses (CCPs) abgewickelt - LME Clear, CME Clearing, ICE Clear.",
      },
      {
        id: "eucx-abgrenzung",
        heading: "EUCX als OTF vs. Warenterminboerse",
        body: "EUCX ist kein Regulated Market (RM) und keine Warenterminboerse im klassischen Sinne, sondern ein Organised Trading Facility (OTF) fur physische Rohstoffe und Warenderivate. Unterschiede: EUCX kann Ermessen bei Auftragsausfuhrung ausuben (OTF-Merkmal). Keine vollautomatisierte Standardkontrakt-Ausfuhrung wie an einer Warenterminboerse. Individualkontrakte moeglich. Gemeinsamkeiten: BaFin-Regulierung, MiFID II-Transparenzpflichten, Abwicklungsgarantie als Clearinghouse-Funktion. Vorteile fur Nutzer: Physische Rohstoffe in nicht-standardisierten Mengen und Qualitaeten handelbar; keine LME-Warehouse-Zwangslagerung.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Kann ich LME-Futures direkt auf EUCX handeln?", a: "Nein. LME-Futures werden an der LME in London gehandelt. EUCX bietet physische Spot- und Forward-Kontrakte sowie OTF-Warenderivate an." },
          { q: "Was ist der Unterschied zwischen einer Boerse (RM) und einem OTF?", a: "An einer Boerse (Regulated Market) ist Auftragsausfuhrung vollautomatisiert und regelbasiert ohne Ermessen. OTF darf Ermessen ausuben - optimal fuer komplexe Rohstoffgeschaefte." },
          { q: "Welche Boersen sind fur den EU-Stahl-Handel relevant?", a: "Direkter Stahl-Futures-Handel: LME Steel Scrap (Schrottpreis), CME Steel HRC (Warmbreitband USA). Fuer Betonstahl in der EU gibt es keinen liquiden Borsen-Futures - physischer Handel dominiert." },
        ],
      },
    ],
    related: ["lme-notierung", "derivate-handel", "spot-markt"],
  },
  {
    slug: "xetra-gold",
    term: "Xetra-Gold und Edelmetall-ETCs",
    shortDef: "Xetra-Gold ist ein boersengehandeltes Wertpapier (ETC) mit physischer Golddeckung - Brucke zwischen Finanzmarkt und physischem Edelmetallmarkt, relevant fuer institutionelle Portfolios.",
    category: "Märkte",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Struktur",
        body: "Xetra-Gold ist ein Exchange Traded Commodity (ETC), emittiert von der Deutsche Boerse Commodities GmbH, vollstaendig durch physisches Gold gedeckt (1 Gramm Gold je Wertpapier). Handelsplatz: Xetra (elektronisches Handelssystem der Deutschen Boerse). ISIN: DE000A0S9GB0. ETCs (Exchange Traded Commodities): Schuldverschreibungen, die durch physische Rohstoffe oder Derivate besichert sind. Unterschied zu ETFs: ETFs sind Sondervermoegen (insolvenzgeschutzt), ETCs sind Schuldverschreibungen (Emittentenrisiko, aber bei Xetra-Gold durch physisches Gold gedeckt und damit de facto sicher). Anlieferungsrecht: Xetra-Gold-Inhaber haben das Recht auf physische Auslieferung des Goldes.",
      },
      {
        id: "vergleich",
        heading: "Edelmetall-ETCs im Vergleich",
        body: "Xetra-Gold (DE): Gold, physisch, Anlieferungsrecht, TER 0,36% p.a. iShares Physical Gold ETC (IE): Gold, physisch, Swap-basiert teils, TER 0,12% p.a. WisdomTree Physical Gold (GB/DE): Gold, physisch, Anlieferungsrecht, TER 0,39% p.a. Platin, Palladium, Silber-ETCs: Ebenfalls verfuegbar (z.B. WisdomTree Physical Silver). LME-Edelmetall-Warrants: Professioneller Weg fur Institutionelle - Lager-Warrants fur physisches Metall. XRF-Analyse: Qualitaetspruefung von Goldbarren durch Roentgenfluoreszenz-Analyse.",
      },
      {
        id: "steuer",
        heading: "Steuerliche Behandlung (Deutschland)",
        body: "Physisches Gold: Nach 1-jaehriger Haltefrist steuerfrei (Paragraph 23 EStG - kein privates Veraeusserungsgeschaeft nach Ablauf der Spekulationsfrist). Xetra-Gold: Nach BFH-Urteil (Az. IX R 56/15, 2017) wird Xetra-Gold steuerlich wie physisches Gold behandelt - Gewinne nach 1 Jahr steuerfrei fur Privatanleger. Gold-ETF (UCITS): Als Investmentfonds steuerlich wie Aktien-ETF - Abgeltungsteuer (25% + Soli) ohne Spekulationsfrist-Vorteil. Abgeltungsteuer auf Zinsen/Dividenden aus ETCs: Nicht anwendbar, da keine Ausschuttungen. Empfehlung: Steuerberatung, da individuelle Situation massgeblich.",
      },
      {
        id: "eucx-edelmetalle",
        heading: "Edelmetalle und EUCX",
        body: "EUCX fokussiert auf Industriemetalle und Basisrohstoffe. Edelmetalle sind nicht der Kernbereich von EUCX. Schnittstellen: XRF-Analyse-Unternehmen (Roentgenfluoreszenz) bieten Services fur physische Metallpruefung an - relevant fuer NE-Metalle und Edelmetalle. Goldrecycling: Goldhaltige Elektronikschrotte (E-Schrott) sind ein Wachstumsmarkt; Scheidereien kaufen goldhaltigen Schrott - Handelsmoelichkeiten auf EUCX im Bereich Recyclingrohstoffe. Platingruppenmetalle (PGM): Katalysatoren, Schmuck, Industrie - separate Marktstruktur, von EUCX nicht direkt adressiert.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Kann ich Xetra-Gold physisch ausliefern lassen?", a: "Ja. Inhaber von Xetra-Gold koennen physische Auslieferung (min. 1 kg Goldbarren) beantragen. Abwicklung uber Deutsche Boerse Commodities GmbH, Depotbank und Tresor in Frankfurt." },
          { q: "Ist Xetra-Gold sicher bei Insolvenz des Emittenten?", a: "Das physische Gold liegt separat bei Clearstream Banking Frankfurt verwahrt. Im Insolvenzfall haben Inhaber Anspruch auf das physische Gold - kein Emittentenrisiko in der Praxis." },
          { q: "Welche Boerse ist die Referenz fuer den Goldpreis?", a: "Der LBMA Gold Price (London Bullion Market Association, 10:30 und 15:00 Uhr London) ist der globale Benchmark. Xetra-Gold-Preis wird kontinuierlich aus diesem Referenzpreis abgeleitet." },
        ],
      },
    ],
    related: ["basismetalle", "lme-notierung", "ne-metalle"],
  },
  {
    slug: "yield-management",
    term: "Yield Management im Rohstoffhandel",
    shortDef: "Strategie zur Maximierung des Deckungsbeitrags durch dynamische Preissetzung, Kapazitaets- und Mengenoptimierung - ursprunglich aus Luftfahrt und Hotellerie, angewendet auf Rohstoff-Lager und -Logistik.",
    category: "Handel",
    readMin: 7,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "definition",
        heading: "Definition und Herkunft",
        body: "Yield Management (auch: Revenue Management) ist eine Methode zur Ertragoptimierung durch: Dynamische Preisgestaltung in Abhaengigkeit von Nachfrage, Zeit und Kapazitaet. Segmentierung der Nachfrage nach Zahlungsbereitschaft. Steuerung von Kapazitaeten und Mengen. Ursprung: Luftfahrtindustrie (American Airlines, 1980er), uebertragen auf Hotels, Mietwagen, Energie und Logistik. Im Rohstoffhandel: Anwendung auf Lagerkapazitaeten (Preissetzung fuer Lagerplaetze), Transportkapazitaeten, Liefertermine und Losgroessen.",
      },
      {
        id: "anwendungen",
        heading: "Anwendungen im Rohstoffhandel",
        body: "Lager-Yield-Management: Lagerkapazitaet ist begrenzt. In Contango-Markt (Terminpreise > Kassakurs) ist Einlagerung profitabel. Lagerhaus-Betreiber optimieren Belegung und Preise dynamisch. LME-Lagerhaus-Preise variieren saisonal. Logistik-Yield: Schiffsbefrachter und Reedereien (Bulk Carrier) steuern Kapazitaeten dynamisch. Baltic Dry Index (BDI) als Nachfrageindikator. Kapazitaetsengpaesse im Cape-size oder Panamax-Segment erhoehen Preise ueberproportional. Handelsvolumen-Optimierung: Produzenten variieren Verkaufsvolumen und Timing (temporal price optimization) um Durchschnittspreise zu maximieren.",
      },
      {
        id: "eucx-anwendung",
        heading: "Yield Management auf EUCX",
        body: "EUCX-Seller-Tools: Anbieter auf EUCX koennen Preise und Mengen dynamisch anpassen. Zeitliche Preisstaffelung: Preis fuer Sofortlieferung vs. Termin 30/60/90 Tage. Mengenrabatte: Groessere Abnahmemengen zu guenstigeren Konditionen. Auction vs. Fixed-Price: Wahl zwischen Auktionsformat (Preisfindung durch Bieter-Wettbewerb) und Festpreisangebot. Analytics: EUCX stellt Analyse-Tools zur Verfugung - historische Transaktionspreise, Markttiefe, Saisonalitaet - als Basis fuer optimierte Preissetzung. Demand Forecasting: KI-basierte Nachfrageprognosen helfen Anbietern, optimale Angebotszeiten und -preise zu bestimmen.",
      },
      {
        id: "kpi",
        heading: "KPIs und Erfolgsmessung",
        body: "Revenue per Available Unit (RevPAU): In der Lagerhaltung: Erloese pro verfuegbarer Lagereinheit (z.B. EUR pro t*Tag). Capacity Utilization Rate: Auslastungsgrad der Lager- und Transportkapazitaeten. Average Selling Price vs. Benchmark: Vergleich des erzielten Durchschnittspreises mit LME oder Platts-Referenzpreis. Margin per Transaction: Deckungsbeitrag je Transaktion - wichtiger als Umsatz. Time-to-Market: Durchschnittliche Zeit von Produktionsfertigung bis Handelsabschluss - je kurzer, desto geringer Preisrisiko-Exposure. Inventory Turnover: Umschlagshaeufigkeit der Lagerbestande.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Ist Yield Management im Rohstoffhandel dasselbe wie Spekulation?", a: "Nein. Yield Management optimiert Ertraege aus physischen Positionen und Kapazitaeten. Spekulation ist das Eingehen offener, ungedeckter Risikopositionen ohne physische Basis." },
          { q: "Welche Software wird fuer Commodity Yield Management genutzt?", a: "ERP-Systeme (SAP IS-Oil, Oracle Utilities), spezialisierte CTRM-Systeme (Commodity Trading and Risk Management: OpenLink, Triple Point, Brady), BI-Tools (Tableau, Power BI)." },
          { q: "Lohnt sich Einlagerung und Forward-Selling (Cash & Carry Arbitrage)?", a: "Bei ausreichendem Contango: Wenn Terminpreis minus Kassapreis groesser als Finanzierungs- plus Lagerkosten, ist Cash & Carry profitable. Wird durch Arbitrageure schnell wegarbitriert." },
        ],
      },
    ],
    related: ["spot-markt", "termingeschaefte", "hedging"],
  },
  {
    slug: "zahlungsbedingungen",
    term: "Zahlungsbedingungen im Rohstoffhandel",
    shortDef: "Vertragliche Regelungen uber Zeitpunkt, Waehrung, Zahlungsweg und Sicherheiten der Kaufpreiszahlung - kritisch fur Liquiditaet, Kreditrisiko und Compliance im internationalen Rohstoffhandel.",
    category: "Handel",
    readMin: 8,
    description: "",
    published: "2026-03-25",
    updated: "2026-03-25",
    sections: [
      {
        id: "grundlagen",
        heading: "Grundlagen und Wichtigkeit",
        body: "Zahlungsbedingungen (payment terms) regeln, wann, wie und in welcher Waehrung der Kaufpreis gezahlt wird. Im Rohstoffhandel entscheiden Zahlungsbedingungen uber: Liquiditaetsplanung (Wann fliesst Geld ein/aus?), Kreditrisiko (Zahlt der Kaeuffer?), Kapitalkosten (Wie lange ist Kapital gebunden?), Wechselkursrisiko (Waehrung und Timing der Zahlung). Variablen: Zahlungszeitpunkt (Vorauszahlung bis 180 Tage Ziel), Zahlungssicherheit (offen bis unwiderrufliches L/C), Waehrung (EUR, USD, CHF), Zahlungsweg (SWIFT, SEPA, Clearing).",
      },
      {
        id: "methoden",
        heading: "Zahlungsmethoden im Detail",
        body: "Cash in Advance (CIA) / Vorauszahlung: Kaeuffer zahlt vor Lieferung. Sicher fur Verkaeuffer, risikoreich fur Kaeuffer. Typisch bei: Neuen Gegenparteien ohne Rating, politisch instabilen Laendern. Open Account / Offene Rechnung: Kaeuffer zahlt nach Lieferung (z.B. 30/60/90 Tage netto). Risiko liegt beim Verkaeuffer. Guenstigster Weg, wenn Vertrauen besteht. Documentary Letter of Credit (L/C): Bank garantiert Zahlung gegen konforme Dokumentenvorlage. Sicher fur beide Parteien. Kostenintensiv: 0,3-1% des Kontraktwerts. Dokumenteninkasso (D/P, D/A): Bank uebermittelt Dokumente gegen Zahlung (D/P) oder Akzept (D/A). Kompromiss zwischen Risiko und Kosten. Bankgarantie: Direkte Zahlungsgarantie der Bank des Kaeuffers.",
      },
      {
        id: "waehrung",
        heading: "Waehrungsaspekte",
        body: "Waehrungswahl: USD: Globale Handelswaahrung fuer Rohstoffe. LME-Preise, Platts-Preise in USD. EUR: EU-interner Handel und zunehmend Rohstoffhandel in EUR (EUCX). CHF: Stabile Reservewaahrung, selten im Rohstoffhandel. Wechselkursrisiko: Vertrag in USD, aber Kosten in EUR - bei USD/EUR-Schwankung entsteht Waehrungsrisiko. Absicherung: FX-Forwards oder FX-Optionen via Hausbank. Natural Hedge: Wenn Einnahmen und Ausgaben in gleicher Waehrung (USD) - kein Wechselkursrisiko. EUCX EUR-Preissystem: EUCX fokussiert auf EUR-Preisnotierung, reduziert Wechselkursrisiko fuer EU-Teilnehmer.",
      },
      {
        id: "compliance",
        heading: "Compliance und Sanktionspruefung",
        body: "SWIFT-Zahlungen: Alle internationalen Ueberweisungen laufen uber SWIFT-Netzwerk. Sanktionspruefung durch Korrespondenzbanken. Sanktionierte Laender: Russland (seit 2022 weitgehend aus SWIFT ausgeschlossen), Iran, Nordkorea - keine legalen Zahlungen moeglich. OFAC (USA): U.S. Office of Foreign Assets Control verhaengt Sanktionen mit extraterritorialer Wirkung - auch EU-Firmen betroffen. EU-Sanktionen: Embargoverordnungen (z.B. VO 833/2014 gegen Russland) verbieten bestimmte Zahlungen und Transaktionen. AML-Pruefung: Zahlungen werden auf Geldwaasche-Indikatoren geprueft (Batch-Screening, Real-Time-Monitoring). EUCX: Alle Transaktionen auf EUCX unterliegen AML-Screening.",
      },
      {
        id: "faq",
        heading: "Haeufige Fragen",
        body: "",
        faq: [
          { q: "Was ist das guenstigste Zahlungsziel im Rohstoffhandel?", a: "Aus Kaeufer-Sicht: Langes Zahlungsziel (90-120 Tage), offen. Aus Verkaeuffer-Sicht: Kurzes Ziel oder Vorauszahlung. Kompromiss: 30-60 Tage netto mit Skonto-Option (z.B. 2% Skonto bei 10 Tagen). Auf EUCX: Standard 30 Tage netto." },
          { q: "Wann ist ein Letter of Credit sinnvoll?", a: "Bei neuen Gegenparteien, Laenderrisiko, grossen Transaktionswerten (>250.000 EUR) oder wenn Kaeuffer auf Dokumenten-Sicherheit besteht. Kosten: Ca. 0,5-1% des Kontraktwerts." },
          { q: "Welche Waehrung empfiehlt EUCX?", a: "EUCX-Kontrakte werden primaer in EUR abgewickelt, was Wechselkursrisiken fur EU-Marktteilnehmer minimiert. USD-basierte Referenzpreise (LME) werden taeglich konvertiert." },
        ],
      },
    ],
    related: ["kontrahentenrisiko", "abwicklungsgarantie", "incoterms-2020"],
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
