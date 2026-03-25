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
