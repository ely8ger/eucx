#!/usr/bin/env python3
"""Insert 20 new LexikonEntry objects into data.ts before the closing ]; of LEXIKON array."""

import re

DATA_FILE = "/Users/ki/.openclaw/workspace-anthropic/eucx/apps/web/src/app/insights/data.ts"

NEW_ENTRIES = r"""
  {
    slug: "basismetalle",
    term: "Basismetalle",
    shortDef: "Nicht-Edelmetalle wie Kupfer, Aluminium, Zink, Blei, Nickel und Zinn, die als industrielle Rohstoffe an der LME und anderen Borsen gehandelt werden.",
    category: "Metalle",
    readMin: 9,
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
"""

with open(DATA_FILE, "r") as f:
    content = f.read()

# Find the closing ]; of LEXIKON array
# The marker is:
# related: ["otf-eucx", "abwicklungsgarantie", "cbam"],
#   },
# ];
MARKER = '    related: ["otf-eucx", "abwicklungsgarantie", "cbam"],\n  },\n];'
REPLACEMENT = '    related: ["otf-eucx", "abwicklungsgarantie", "cbam"],\n  },' + NEW_ENTRIES + '\n];'

if MARKER not in content:
    print("ERROR: Marker not found!")
    exit(1)

new_content = content.replace(MARKER, REPLACEMENT, 1)
assert new_content != content, "Replacement did not occur!"

with open(DATA_FILE, "w") as f:
    f.write(new_content)

print("SUCCESS: Inserted all 20 new LexikonEntry objects.")
print(f"File size: {len(new_content)} chars (was {len(content)} chars)")
