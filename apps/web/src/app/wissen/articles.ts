export interface Section {
  heading: string;
  body:     string;
  sub?:     { heading: string; body: string }[];
}

export interface Article {
  slug:        string;
  title:       string;
  description: string;
  category:    string;
  readMin:     number;
  published:   string;
  sections:    Section[];
  cta?:        string;
}

export const ARTICLES: Article[] = [
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "stahlhandel-b2b",
    title:       "B2B-Stahlhandel in Europa: Marktstruktur, Preisbildung und digitale Handelsplattformen",
    description: "Umfassender Leitfaden zum institutionellen Stahlhandel in der EU - Marktakteure, Preistreiber, Qualitaetsstandards und die Rolle digitaler Borsen.",
    category:    "Markt",
    readMin:     12,
    published:   "2026-03-01",
    sections: [
      {
        heading: "Der europaeische Stahlmarkt im Ueberblick",
        body: "Der europaeische Stahlmarkt zaehlt mit einem jaehrlichen Umsatz von ueber 200 Milliarden Euro zu den bedeutendsten Industriesegmenten der EU. Deutschland ist mit einer Rohstahlproduktion von rund 35 Millionen Tonnen jaehrlich der groesste Produzent, gefolgt von Italien, Frankreich und Spanien. Die gesamte EU produziert ca. 130-140 Millionen Tonnen Rohstahl pro Jahr und liegt damit weltweit auf Platz zwei hinter China.\n\nDer Markt ist durch eine komplexe Wertschoepfungskette gekennzeichnet: Erzeuger (Huettenwerke), Stahlhaendler und Service-Center, Weiterverarbeiter sowie Endabnehmer aus Bau, Automobil, Maschinenbau und Energie. Jede Stufe dieser Kette hat eigene Anforderungen an Qualitaet, Liefermengen und Preiskonditionen.",
        sub: [
          {
            heading: "Marktakteure und ihre Rollen",
            body: "Integrierte Huettenwerke (z.B. ArcelorMittal, thyssenkrupp, Salzgitter) produzieren Rohstahl aus Eisenerz und Kokskohle im Hochofenverfahren oder aus Stahlschrott im Elektrolichtbogenofen. Sie liefern Brammen, Knueppel, Bloecke und gewalzte Produkte.\n\nStahlhaendler und Service-Center kaufen Grossmengen direkt vom Erzeuger und bieten Lagerhaltung, Konfektionierung (Brennschneiden, Saegen, Biegen) sowie kleinere Lose fuer den Mittelstand an. Ihr Mehrwert liegt in der Verfuegbarkeit, Flexibilitaet und regionalen Naehe.\n\nEndabnehmer aus der Baubranche (Bewehrungsstahl/Rebar), dem Maschinenbau (Stabstahl, Bleche) und der Automobilindustrie (Feinblech, hochfeste Staehle) bilden die Nachfrageseite."
          },
          {
            heading: "Produktkategorien im Stahlhandel",
            body: "Langprodukte umfassen Betonstahl (Rebar, BSt 500S), Traeger (HEB, IPE, UPE), Winkelstahl, Rundstahl und Stabstahl. Sie werden vorwiegend im Bauwesen und Maschinenbau eingesetzt.\n\nFlachprodukte beinhalten Warmband, Kaltband, Grobblech, Verzinktes Band und Edelstahlblech. Sie sind Grundlage fuer Fahrzeugkarosserien, Hausgeraete und Industrieanlagen.\n\nRohrprodukte (nahtlos und geschweisst) bedienen den Energie-, Pipeline- und Maschinenbausektor mit strengen Druckbehaeltervorschriften nach DIN EN 10210/10219."
          }
        ]
      },
      {
        heading: "Preisbildung und Preistreiber im Stahlmarkt",
        body: "Der Stahlpreis ist das Ergebnis eines komplexen Zusammenspiels globaler und regionaler Faktoren. Ein Verstaendnis dieser Treiber ist fuer jeden Marktteilnehmer essentiell, um Einkaufsrisiken zu minimieren und Marktchancen zu nutzen.",
        sub: [
          {
            heading: "Rohstoffkosten: Eisenerz und Kokskohle",
            body: "Rund 60-70% der Produktionskosten eines Hochofenwerks entfallen auf Rohstoffe. Eisenerz wird ueberwiegend aus Australien (Rio Tinto, BHP) und Brasilien (Vale) importiert und an der Terminboerse in Singapur (SGX) gehandelt. Kokskohle stammt hauptsaechlich aus Australien, USA und Kanada. Preissteigerungen bei diesen Rohstoffen schlagen sich mit 4-8 Wochen Verzoegerung im Stahlpreis nieder."
          },
          {
            heading: "Energiepreise und CO2-Zertifikate",
            body: "Elektrolichtbogenoefen verbrauchen ca. 400-600 kWh pro Tonne Stahl. Bei europaeischen Strompreisen von 80-150 EUR/MWh entstehen allein Energiekosten von 32-90 EUR/t. Das EU-Emissionshandelssystem (ETS) belastet Hochofenwerke zusaetzlich mit CO2-Kosten von 50-90 EUR/t CO2. Beides macht europaeischen Stahl teurer als asiatische Importe, sichert aber Qualitaets- und Nachhaltigkeitsstandards."
          },
          {
            heading: "Nachfragezyklen und saisonale Effekte",
            body: "Das Bauwesen - der groesste Stahlverbraucher - unterliegt ausgepraegten Saisonalitaeten. Im Winter sinkt die Nachfrage nach Bewehrungsstahl deutlich, waehrend die Fruehjahrssaison ab Maerz zu Preissteigerungen fuehrt. Grosse Infrastrukturprojekte (Bruecken, Windkraftanlagen, Hochhaeuser) erzeugen periodische Nachfragespitzen, die regionale Preisverwerfungen ausloesen koennen."
          }
        ]
      },
      {
        heading: "Qualitaetsstandards und Normen",
        body: "Im europaeischen Stahlhandel sind Normen nicht optional, sondern rechtlich verpflichtend. Die Bauproduktenverordnung (EU) 305/2011 schreibt CE-Kennzeichnung fuer Bewehrungsstahl vor. Falsche oder fehlende Zertifikate koennen zu Baustopp, Rueckbau und strafrechtlicher Haftung fuehren.",
        sub: [
          {
            heading: "Massgebliche Normen im Ueberblick",
            body: "DIN EN 10080: Betonstahl - Schweissbarer Betonstahl. Definiert Streckgrenze (Re >= 500 N/mm2), Zugfestigkeit (Rm/Re >= 1,15), Bruchdehnung und Biege-/Rueckbiegeeigenschaften.\n\nDIN EN 10025: Warmgewalzte Erzeugnisse aus Baustahlen - in sechs Teile untergliedert fuer verschiedene Guetegruppen (S235, S275, S355, S420, S460).\n\nDIN EN 10219 / 10210: Kaltgefertigte und warmprofil-gefertigte Hohlprofile fuer den Stahlbau.\n\nDIN EN 10088: Nichtrostende Staehle - definiert chemische Zusammensetzung und mechanische Eigenschaften der gaengigen Edelstahlgueten (1.4301, 1.4401, 1.4571)."
          }
        ]
      },
      {
        heading: "Digitalisierung des Stahlhandels",
        body: "Der traditionell beziehungsbasierte und telefongetriebene Stahlhandel befindet sich in einem strukturellen Wandel. Digitale Handelsplattformen bieten Transparenz, Effizienz und Zugang zu einem breiteren Lieferantennetzwerk.\n\nOrganisierte Handelsplattformen (OTF) nach MiFID II ermoglichen den regulierten elektronischen Handel von Rohstoffen mit standardisierten Vertragen, zentraler Clearingfunktion und aufsichtsrechtlicher Ueberwachung durch BaFin und ESMA. Die EUCX bietet diesen regulierten Rahmen fuer den B2B-Stahlhandel in der EU - mit Echtzeit-Orderbuch, transparenter Preisfindung und sofortiger elektronischer Vertragsabwicklung."
      }
    ],
    cta: "Jetzt als Marktteilnehmer registrieren"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "rohstoffmarkt-eu",
    title:       "Rohstoffmaerkte in der EU: Struktur, Teilnehmer und Handelsmechanismen",
    description: "Wie funktionieren europaeische Rohstoffmaerkte? Ein vollstaendiger Ueberblick ueber Spot- und Terminmaerkte, Marktakteure, Clearing und regulatorische Rahmenbedingungen.",
    category:    "Markt",
    readMin:     10,
    published:   "2026-03-05",
    sections: [
      {
        heading: "Was ist ein Rohstoffmarkt?",
        body: "Ein Rohstoffmarkt ist ein organisierter Handelsplatz, an dem standardisierte Rohstoffe (Commodities) gekauft und verkauft werden. Die wichtigste Unterscheidung liegt zwischen Spotmaerkten (sofortige physische Lieferung) und Terminmaerkten (zukunftige Lieferung zu heute fixierten Preisen).\n\nAuf europaeischer Ebene existieren spezialisierte Rohstoffboersen: Die London Metal Exchange (LME) ist fuer Basismetalle (Kupfer, Aluminium, Zink, Nickel, Blei, Zinn) massgeblich. Die EEX (European Energy Exchange) in Leipzig dominiert den Energiehandel (Strom, Gas, CO2). Die MATIF in Paris ist fuehrend im Agrarrohstoffhandel (Weizen, Mais, Raps).\n\nFuer Industrierohstoffe im B2B-Direkthandel - insbesondere Stahl, Holz, Chemikalien - fehlte bislang eine regulierte europaische Handelsplattform. Diese Luecke schliesst die EUCX als BaFin-zugelassener OTF."
      },
      {
        heading: "Spotmarkt vs. Terminmarkt: Grundlegende Unterschiede",
        body: "Der Spotmarkt (auch Kassamarkt) bezeichnet den sofortigen Kauf oder Verkauf einer Ware zu einem aktuellen Marktpreis (Spotpreis) mit Lieferung in der Regel innerhalb von 1-2 Werktagen. Spotpreise spiegeln die aktuelle Angebots- und Nachfragesituation unmittelbar wider.",
        sub: [
          {
            heading: "Termingeschaefte (Forwards und Futures)",
            body: "Forwards sind nicht standardisierte Vereinbarungen zwischen zwei Parteien ueber die zukunftige Lieferung einer Ware zu einem heute festgelegten Preis. Sie werden ausserboerslich (OTC - Over the Counter) gehandelt und koennen individuell gestaltet werden. Das Gegenparteirisiko traegt jeder Handelspartner selbst.\n\nFutures sind standardisierte Terminkontrakte, die an einer organisierten Boerse gehandelt werden. Menge, Qualitaet, Lieferzeitpunkt und -ort sind vorab definiert. Eine zentrale Gegenpartei (Central Counterparty, CCP) uebernimmt das Ausfallrisiko beider Seiten - das sogenannte Clearing."
          },
          {
            heading: "Hedging: Preisrisiken absichern",
            body: "Stahlhersteller, die in 3 Monaten 1.000 Tonnen Rebar liefern muessen, sichern sich durch den Verkauf entsprechender Terminkontrakte gegen Preisrueckgaenge ab. Einkaufsabteilungen grosser Bautraeger hedgen ihren Stahlbedarf fuer laufende Projekte gegen Preissteigerungen. Diese Hedging-Strategie reduziert Volatilitaetsrisiken und ermoeg-licht eine verlaessl-iche Kalkulation."
          }
        ]
      },
      {
        heading: "Rohstoffkategorien im europaeischen B2B-Handel",
        body: "",
        sub: [
          {
            heading: "Metalle",
            body: "Eisenmetalle: Stahlerzeugnisse (Rebar, Coils, Bleche, Profile), Roheisen, Gusseisen, Stahlschrott. Weltmarktpreise werden durch LME-Metallpreise, Frachtkosten und regionale Angebots-/Nachfragesituationen beeinflusst.\n\nNE-Metalle (Nichteisenmetalle): Kupfer, Aluminium, Messing, Bronze, Zink, Blei, Nickel. Werden taeglich an der LME quotiert. Starke Korrelation mit globalen Konjunkturzyklen und chinesischer Industrieproduktion.\n\nEdelmetalle: Gold, Silber, Platin, Palladium. Dienen sowohl industriellen Zwecken (Katalysatoren, Elektronik) als auch als Wertanlage. Gehandelt am LBMA (London Bullion Market Association)."
          },
          {
            heading: "Holz und Forstwirtschaft",
            body: "Schnittholz (Fichte, Kiefer, Laerche, Eiche), Furnierholz, Holzwerkstoffe (OSB, MDF, Spanplatte) und Pellets sind die bedeutendsten Handelsgueter. Der europaeische Schnittholzmarkt wurde 2021-2023 durch Borkenkaefer-Schaeden, Exportbeschraenkungen und Post-Covid-Bauboom stark beeinflusst. Referenzpreise liefern die Finnish Forest Industries und der Verband der Deutschen Saege- und Holzindustrie."
          },
          {
            heading: "Chemikalien und Kunststoffe",
            body: "Grundchemikalien (Ethylen, Propylen, Methanol, Ammoniak), technische Kunststoffe (PE, PP, PVC, PET) und Spezialchemikalien werden ueberwiegend auf Basis von ICIS-Preisindizes gehandelt. Starke Abhaengigkeit von Energiepreisen und petrochemischen Rohstoffen (Naphtha, Erdgas)."
          }
        ]
      },
      {
        heading: "Clearing und Settlement: Wie Transaktionen abgewickelt werden",
        body: "Clearing bezeichnet den Prozess der Berechnung gegenseitiger Forderungen und Verbindlichkeiten nach Handelsabschluss, bevor die eigentliche Abwicklung (Settlement) stattfindet. Eine Central Counterparty (CCP) wie die Eurex Clearing tritt als Kaeufer gegenueber jedem Verkaeufer und als Verkaeufer gegenueber jedem Kaeufer auf.\n\nDies eliminiert das bilaterale Gegenparteirisiko: Selbst wenn eine Handelspartei ausfaellt, erhaelt die Gegenseite ihre Ware oder Zahlung. Voraussetzung ist die Hinterlegung von Sicherheitsleistungen (Initial Margin) durch alle Marktteilnehmer. Taeglich werden Gewinne und Verluste verrechnet (Variation Margin), sodass keine Risiken aufgebaut werden koennen."
      }
    ],
    cta: "Rohstoffhandel auf der EUCX starten"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "otf-regulierung-mifid",
    title:       "OTF-Regulierung unter MiFID II: Was bedeutet das fuer den Rohstoffhandel?",
    description: "Alles ueber Organised Trading Facilities (OTF) nach MiFID II und MiFIR: Zulassungspflicht, Handelstransparenz, Best Execution und Pflichten der Plattformbetreiber.",
    category:    "Regulierung",
    readMin:     14,
    published:   "2026-03-08",
    sections: [
      {
        heading: "Was ist eine Organised Trading Facility (OTF)?",
        body: "Mit der Umsetzung von MiFID II (Markets in Financial Instruments Directive II) im Januar 2018 wurde in der EU eine neue Kategorie von Handelsplattformen eingefuehrt: die Organised Trading Facility (OTF). Rechtsgrundlage ist Art. 4 Abs. 1 Nr. 23 MiFID II sowie die nationalen Umsetzungsgesetze - in Deutschland §72 WpHG (Wertpapierhandelsgesetz).\n\nDie OTF ergaenzt die bestehenden Handelsplatztypen Geregelter Markt (Regulated Market) und Multilaterales Handelssystem (MTF) um eine dritte Kategorie, die speziell fuer den Handel mit Nichtkapitalinstrumenten - also Anleihen, strukturierten Finanzprodukten, Emissionszertifikaten und Derivaten - konzipiert ist. Anders als geregelter Markt und MTF erlaubt die OTF dem Betreiber ein gewisses Ermessen bei der Ausfuehrung von Auftraegen (discretionary execution), sofern keine Interessenkonflikte entstehen.",
        sub: [
          {
            heading: "Abgrenzung: OTF vs. geregelter Markt vs. MTF",
            body: "Geregelter Markt (z.B. Frankfurter Boerse): Vollstaendig automatisierter, nicht-diskretionaerer Handel. Handelsregeln sind vorab verpflichtend fuer alle. Geeignet fuer Aktien und standardisierte Derivate.\n\nMTF (Multilaterales Handelssystem): Ebenfalls nicht-diskretionaer, aber flexibler als geregelter Markt. Geeignet fuer weniger liquide Instrumente und OTC-aehnliche Strukturen.\n\nOTF: Ermoeg-licht Ermessensspielraum des Betreibers bei der Zusammenfuehrung von Auftraegen. Geeignet fuer Rohstoffe, Industriegueter und massgeschneiderte Handelsstrukturen mit institutionellen Teilnehmern."
          }
        ]
      },
      {
        heading: "Zulassungsvoraussetzungen fuer OTF-Betreiber",
        body: "Der Betrieb einer OTF erfordert in Deutschland eine Zulassung durch die BaFin (Bundesanstalt fuer Finanzdienstleistungsaufsicht) gemaess §72 WpHG. Die wesentlichen Anforderungen:",
        sub: [
          {
            heading: "Organisatorische Anforderungen",
            body: "Nachweis eines angemessenen Eigenkapitals (nach CRD/CRR). Etablierung eines effektiven Risikomanagement-Rahmens. Trennung der Handelsfunktion von proprietary trading (Eigenhandel). Benennung einer Compliance-Funktion, internen Revision und eines Risikomanagers. Implementierung eines Business Continuity Plans."
          },
          {
            heading: "Technische Anforderungen",
            body: "Robuste, resiliente Handelssysteme mit dokumentierten Failover-Mechanismen. Kapazitaetsplanung auch fuer Stressszenarien (mindestens 10x Normalvolumen). Algorithmic Trading Controls (Circuit Breaker, Kill Switch). Vollstaendige Aufzeichnung aller Transaktionen (Transaction Reporting nach MiFIR Art. 26) und Orderbuch-Daten (mindestens 5 Jahre Aufbewahrung)."
          },
          {
            heading: "Transparenzpflichten",
            body: "Pre-Trade-Transparenz: Verpflichtende Veroeff-entlichung von Geld- und Briefkursen fuer liquide Instrumente vor Handelsabschluss (Art. 8 MiFIR). Waiver moeglich fuer grosse Auftraege (Large-in-Scale) und RFQ-Systeme.\n\nPost-Trade-Transparenz: Veroeff-entlichung von Preis, Volumen und Transaktionszeitpunkt so zeitnah wie moeglich nach Handelsabschluss (Art. 10 MiFIR), spaetestens am naechsten Handelstag (T+1)."
          }
        ]
      },
      {
        heading: "Best Execution Pflicht",
        body: "OTF-Betreiber muessen sicherstellen, dass Kundenauftraege zum bestmoeglichen Ergebnis ausgefuehrt werden (Best Execution, Art. 27 MiFID II). Kriterien hierfuer sind Preis, Kosten, Geschwindigkeit, Wahrscheinlichkeit der Ausfuehrung, Ordervolumen und -art sowie sonstige relevante Ausfuehrungskriterien.\n\nFuer Nichtfinanzinstrumente (wie Industrierohstoffe) koennen OTF-Betreiber vereinfachte Best-Execution-Regelungen anwenden, sofern die Gegenpartei ein professioneller Kunde ist. Dennoch muessen Ausfuehrungsrichtlinien dokumentiert, den Kunden mitgeteilt und jaehrlich ueberprueft werden."
      },
      {
        heading: "Marktmissbrauchsverbote nach MAR",
        body: "Alle auf einer OTF-Plattform gehandelten Instrumente unterliegen der EU-Marktmissbrauchsverordnung (MAR, Regulation (EU) 596/2014). Verbotene Praktiken sind Insiderhandel (Art. 8 MAR), Marktmanipulation (Art. 12 MAR) und die unrechtmaessige Weitergabe von Insiderinformationen (Art. 10 MAR).\n\nVerstoeße werden von BaFin und anderen nationalen Aufsichtsbeh-oerden verfolgt. In Deutschland drohen gemaess §38 WpHG Freiheitsstrafen von bis zu 5 Jahren fuer schwere Faelle von Marktmanipulation oder Insiderhandel. Zivilrechtlich haften Verursacher fuer saemtliche Schaeden der Gegenparteien."
      }
    ],
    cta: "EUCX - Der regulierte OTF fuer EU-Rohstoffe"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "betonstahl-rebar",
    title:       "Betonstahl (Rebar) im Handel: Normen, Preisfaktoren und Marktdynamik",
    description: "Alles ueber Bewehrungsstahl BSt 500S: Normkonforme Anforderungen, europaische Preistreiber, Handelsstrukturen und Beschaffungsstrategien fuer Bauunternehmen und Handler.",
    category:    "Produkte",
    readMin:     9,
    published:   "2026-03-10",
    sections: [
      {
        heading: "Was ist Betonstahl (Rebar)?",
        body: "Betonstahl, international als Rebar (Reinforcing Bar) bezeichnet, ist das Rueckgrat des modernen Stahlbetonbaus. Eingebettet in Beton kompensiert er dessen mangelnde Zugfestigkeit und ermoeglicht so die Konstruktion von Fundamenten, Decken, Stiegen, Stuetzmauern und Hochhaeusern.\n\nIn der EU muss Betonstahl zwingend der Norm DIN EN 10080 entsprechen und traegt die CE-Kennzeichnung. Der meistverwendete Typ ist BSt 500S (B500B nach EN): Streckgrenze 500 N/mm2, Zugfestigkeit mindestens 575 N/mm2, Bruchdehnung mindestens 5%. Die geriefelte (profilierte) Oberflaeche sichert optimalen Verbund mit dem umgebenden Beton."
      },
      {
        heading: "Produktvarianten und Lieferformen",
        body: "",
        sub: [
          {
            heading: "Staebstahl (Mattenstahl in Stangen)",
            body: "Lieferung in Stangen von 6, 8, 10, 12, 14, 16, 20, 25, 28 und 32 mm Durchmesser, standard 12 Meter Laenge. Wird auf der Baustelle von Armierern zugeschnitten und gebogen. Fuer groessere Projekte mit variierendem Bewehrungsplan optimal."
          },
          {
            heading: "Betonstahlmatten",
            body: "Vorgefertigte Schweissmatten in Standardformaten (meist 6x2,4 m) aus Laengs- und Querdraehten. Stark rationalisierend fuer Bodenplatten, Decken und Waende mit gleichmaessigem Bewehrungsabstand. Spart erhebliche Arbeitszeit auf der Baustelle."
          },
          {
            heading: "Betonstahlringe (Coils)",
            body: "Kleinere Durchmesser (6-12 mm) werden als Ringe (Coils) von 500-2.000 kg geliefert und auf mobilen Richtanlagen verarbeitet. Vorteil: weniger Schnittverluste, platzsparend, kontinuierliche Produktion auf Schneidmaschinen."
          }
        ]
      },
      {
        heading: "Preistreiber im Rebar-Markt",
        body: "Der Rebar-Preis in Europa bewegt sich typischerweise zwischen 450 und 750 EUR/Tonne (frei Rampe), mit starken Schwankungen in Abhaengigkeit folgender Faktoren:",
        sub: [
          {
            heading: "Stahlschrottpreise",
            body: "Rebar wird ueberwiegend in Elektrolichtbogenoefen (EAF) aus Stahlschrott erschmolzen. Schrottpreise - quotiert als HMS 1+2 (Heavy Melting Scrap) oder Schredder-Schrott - bestimmen direkt 50-65% der Herstellkosten. Der europaeische Schrottindex (z.B. CFR Tuerkei) ist die wichtigste Referenz."
          },
          {
            heading: "Tuerkische Produktion und Export",
            body: "Die Tuerkei ist der weltgroesste Rebar-Exporteur und EAF-Produzent. Tuerkische Hersteller liefern signifikante Mengen in die EU, vor allem nach Suedeuropa und durch den Hamburger Hafen nach Nordeuropa. Wechselkurs TRY/EUR, tuerkische Gaspreisentwicklung und EU-Antidumping-Massnahmen beeinflussen die Importsituation stark."
          },
          {
            heading: "Baukonjunktur und Saisonalitaet",
            body: "Der europaeische Bausektor bestimmt 85-90% der Rebar-Nachfrage. Baubeginn und Baugenehmigungen (Vorlaufzeit 3-6 Monate) sind fruehzeitige Indikatoren. Saisonaler Preisanstieg typischerweise Februar-April (Bausaisonstart), Preisrueckgang Oktober-Dezember."
          }
        ]
      },
      {
        heading: "Beschaffungsstrategien fuer Unternehmen",
        body: "Groessere Bautraeger und Handler entwickeln zunehmend strukturierte Beschaffungsstrategien anstatt reaktiven Spotmarkt-Einkaufs. Wesentliche Ansaetze:\n\nJahresrahmenvertraege mit Herstellern oder grossen Haendlern sichern Verfuegbarkeit und Rabattkonditionen, lassen aber Preisanpassungsklauseln offen.\n\nSplit-Purchase-Strategie: 60-70% des Bedarfs ueber Rahmenvertrag, 30-40% opportunistisch am Spotmarkt bei guenstigen Preisfenstern.\n\nPreisgleitklauseln (Escalation Clauses) in Bauvertraegen koppeln den Materialpreis an offizielle Indizes (z.B. Statistisches Bundesamt, ifo-Index), wodurch Preisrisiken fair verteilt werden."
      }
    ],
    cta: "Rebar jetzt auf der EUCX handeln"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "incoterms-rohstoffhandel",
    title:       "Incoterms im Rohstoffhandel: EXW, FCA, DAP, CIF und mehr",
    description: "Die wichtigsten Incoterms 2020 im Ueberblick: Wer traegt welche Kosten und Risiken? Praxisbeispiele fuer den Stahl- und Rohstoffhandel mit EU-Lieferanten.",
    category:    "Praxis",
    readMin:     8,
    published:   "2026-03-12",
    sections: [
      {
        heading: "Was sind Incoterms?",
        body: "Incoterms (International Commercial Terms) sind von der Internationalen Handelskammer (ICC) herausgegebene Standardklauseln, die den Uebergang von Kosten und Risiken zwischen Kaeufer und Verkaeufer in internationalen Kaufvertraegen regeln. Die aktuelle Version ist Incoterms 2020.\n\nSie regeln: (1) Ab welchem Punkt traegtder Kaeufer das Risiko des zufaelligen Untergangs der Ware. (2) Welche Partei fuer Fracht, Versicherung, Verpackung, Be- und Entladung und Zollformalitaeten aufkommt. Sie regeln nicht: Eigentumsuebergang, Zahlungsbedingungen, Vertragsstrafe oder Gewaehrleistung.\n\nDie Incoterms 2020 umfassen 11 Klauseln, aufgeteilt in zwei Gruppen: Multimodale Klauseln (fuer alle Transportarten) und Seeklauseln (nur Seetransport)."
      },
      {
        heading: "Die wichtigsten Klauseln im Stahlhandel",
        body: "",
        sub: [
          {
            heading: "EXW - Ex Works (ab Werk)",
            body: "Der Verkaeufer stellt die Ware an seinem Lager/Werk bereit. Alle weiteren Kosten und Risiken traegt der Kaeufer: Verladung auf LKW, Inlandtransport, Export-/Importzoll, Seefracht, Einklarierung, Lieferung zum Endbestimmungsort.\n\nVorteil fuer Kaeufer: maximale Kostenkontrolle und Flexibilitat bei der Logistikwahl. Nachteil: Kaeufer benoetigt eigene Spediteursbeziehungen und Exportlizenz. Im EU-Binnenmarkt weit verbreitet, da kein Zoll anfaellt."
          },
          {
            heading: "FCA - Free Carrier (frei Frachtfuehrer)",
            body: "Der Verkaeufer liefert die Ware dem vom Kaeufer benannten Frachtfuehrer an einem vereinbarten Uebergabeort. Risikoubergang beim Uebergabe. Der Kaeufer uebernimmt ab diesem Punkt alle Frachtkosten.\n\nFCA ist die praxistauglichste Klausel fuer den Containerhandel und Strassentransport. Sie loeste in vielen Faellen das problematische FOB (Free on Board) fuer Stahltransporte ab, da FOB den Risikouebergang an die Schiffsreling knuepft - ein operativ schwer definierbarer Zeitpunkt bei modernem Containerumschlag."
          },
          {
            heading: "DAP - Delivered at Place (geliefert benannter Ort)",
            body: "Der Verkaeufer traegt alle Kosten und Risiken bis zur Anlieferung am vereinbarten Bestimmungsort (z.B. Baustelle, Lager des Kaeufers). Der Kaeufer uebernimmt Entladekosten und ggf. Einfuhrabgaben.\n\nDAP ist fuer den innereuropaeischen Stahlhandel bei Lieferung frei Baustelle oder frei Lager des Kaeufers sehr gebrauchlich. Der Verkaeufer organisiert und bezahlt den Transport vollstaendig."
          },
          {
            heading: "DDP - Delivered Duty Paid (geliefert verzollt)",
            body: "Maximale Verpflichtung des Verkaeufers: Lieferung frei Haus inklusive Einfuhrzoll und -steuer. Kaeufer hat keine logistischen Pflichten. Im EU-Binnenmarkt aufgrund fehlender Zollgrenzen oft identisch mit DAP. Bei Importen aus Drittlaendern (UK, Tuerkei) klar von DAP zu unterscheiden: DDP schliess Verkaeuferrisiko fuer Zollabwicklung ein."
          },
          {
            heading: "CIF - Cost, Insurance and Freight (Kosten, Versicherung, Fracht)",
            body: "Reine Seeklausel. Der Verkaeufer bezahlt Fracht und Versicherung bis zum Bestimmungshafen. Risikouebergang liegt jedoch bereits bei Verladen im Abgangshafen. Dadurch eine logische Inkonsistenz: Der Verkaeufer bezahlt die Versicherung fuer eine Strecke, auf der der Kaeufer bereits das Risiko traegt.\n\nFuer grosse Stahl-Importe per Seefracht (z.B. aus der Tuerkei, Ukraine, Indien) gebraeuchlich. Kaeufer sollten beachten, dass CIF-Versicherungsdeckung oft minimal ist (110% des Warenwertes, Institute Cargo Clauses C - nur Totalverlust) und eigene Versicherung erwaegen."
          }
        ]
      },
      {
        heading: "Praxisbeispiel: Rebar-Import aus der Tuerkei nach Deutschland",
        body: "Angenommen, ein deutsches Bauunternehmen kauft 500 Tonnen Rebar von einem tuerkischen Hersteller:\n\nUnter CIF Hamburg: Tuerkischer Verkaeufer organisiert Verladung in Izmir, Seefracht nach Hamburg und Grundversicherung. Deutsche Importpartei zahlt Entladung in Hamburg, 25% EU-Antidumping-Zoll auf tuerkischen Rebar (wenn anwendbar), Inlandtransport zur Baustelle.\n\nUnter DDP Baustelle Berlin: Tuerkischer Verkaeufer traegt alle Kosten und Risiken bis zur Entladestelle in Berlin. Preisaufschlag reflektiert Logistikkosten, Zollabwicklung und Risikopraemie. Einfacher fuer den Kaeufer, weniger Kontrolle ueber Transportkette."
      }
    ],
    cta: "EU-Rohstoffhandel auf der EUCX - einfach und transparent"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "kyc-aml-b2b-handel",
    title:       "KYC und AML im B2B-Rohstoffhandel: Pflichten, Prozesse und Praxistipps",
    description: "Know Your Customer (KYC) und Anti-Money-Laundering (AML) Pflichten fuer institutionelle Rohstoffhaendler: Regulatorischer Rahmen, Dokumentenanforderungen und Umsetzung.",
    category:    "Regulierung",
    readMin:     10,
    published:   "2026-03-14",
    sections: [
      {
        heading: "Warum KYC und AML im Rohstoffhandel?",
        body: "Der Rohstoffhandel - insbesondere mit Metallen und Mineralien - ist historisch anfaellig fuer Geldwaesche, Sanktionsumgehung und Terrorismusfinanzierung. Grosse Transaktionsvolumina, komplexe Lieferketten und internationaler Handel mit Drittlaendern machen ihn zu einem bevorzugten Vehikel fuer illegale Finanzstroeme.\n\nDer FATF (Financial Action Task Force) stuft den Handel mit hochwertigen Guetern und Rohstoffen als Hochrisikobereich ein. Die EU-Geldwaescherichtlinien (5. und 6. AMLD) und das deutsche GeldwaescheGesetz (GwG) verpflichten Handelsteilnehmer und Plattformbetreiber zu umfassenden Sorgfaltspflichten."
      },
      {
        heading: "Regulatorischer Rahmen",
        body: "",
        sub: [
          {
            heading: "GwG - Geldwaeschegesetz (Deutschland)",
            body: "Das GwG verpflichtet sogenannte Verpflichtete - darunter Gueterhhaendler bei Barzahlungen ab 10.000 EUR und Finanzdienstleister - zur Identifizierung von Vertragspartnern, Feststellung des wirtschaftlich Berechtigten (Ultimate Beneficial Owner, UBO) und Meldung verdaechtiger Transaktionen an die Financial Intelligence Unit (FIU) bei der Zollverwaltung."
          },
          {
            heading: "EU-Sanktionsrecht",
            body: "EU-Verordnungen (insb. bezueglich Russland, Belarus, Iran, Nordkorea) verbieten den Handel mit bestimmten Personen, Unternehmen und Waren. Handelsteilnehmer muessen Gegenparteien gegen EU-, UN- und US-OFAC-Sanktionslisten screenen. Verstoeße sind strafbar (bis 5 Jahre Freiheitsstrafe) und fuehren zu Reputationsschaeden und behordlichen Sanktionen."
          },
          {
            heading: "MiFID II und EMIR",
            body: "OTF-Betreiber wie die EUCX unterliegen zus-aetzlich den MiFID-II-Suitability- und Appropriateness-Anforderungen: Vor Handelsbeginn muss geprueft werden, ob der Kunde die noetigen Kenntnisse und Erfahrungen besitzt (Appropriateness Test fuer Professionelle Kunden vereinfacht). Klassifizierung als Retail Client, Professional Client oder Eligible Counterparty bestimmt den Umfang der Schutzanforderungen."
          }
        ]
      },
      {
        heading: "KYC-Prozess fuer neue Handelsteilnehmer",
        body: "Ein rechtskonformer KYC-Prozess umfasst typischerweise drei Stufen:",
        sub: [
          {
            heading: "1. Identitaet und Unternehmensverifizierung",
            body: "Handelsregisterauszug (nicht aelter als 3 Monate), aktueller Gesellschaftervertrag / Satzung, Ausweis-/Passdokumente aller Geschaeftsfuehrer und wirtschaftlich Berechtigten (UBO ab 25% Anteil), Nachweis der Unternehmensanschrift, USt-IdNr. (VIES-Verifizierung) und Gewerbeanmeldung bzw. Erlaubnisbescheid."
          },
          {
            heading: "2. Wirtschaftlich Berechtigte (UBO)",
            body: "Fuer jede natuerliche Person, die direkt oder indirekt mehr als 25% der Kapital- oder Stimmrechtsanteile haelt, sind Ausweiskopie und Wohnsitznachweis einzuholen. Bei komplexen Holdingstrukturen muss der UBO durch die gesamte Beteiligungskette nachgewiesen werden. EU-Transparenzregister-Eintraege sind zu pruefen und bei Abweichungen zu klaeren."
          },
          {
            heading: "3. Sanktionsscreening und PEP-Pruefung",
            body: "Alle identifizierten Personen und Unternehmen werden gegen EU-Konsolidierte Sanktionsliste, UN-Sicherheitsratsliste, US-OFAC SDN-Liste und nationale Listen (z.B. Deutsche Bundesbank) gescreent. Politisch exponierte Personen (PEP) unterliegen verscharfter Sorgfaltspflicht (Enhanced Due Diligence). Screening ist bei Onboarding und laufend bei Treffer-Ereignissen zu wiederholen."
          }
        ]
      },
      {
        heading: "Pflichten des Handelsplattformbetreibers",
        body: "Organisierte Handelsplattformen (OTF) wie die EUCX haben als regulierte Finanzdienstleister besonders umfangreiche KYC/AML-Pflichten. Kein Teilnehmer darf den Handel aufnehmen, bevor KYC vollstaendig abgeschlossen und genehmigt ist. Laufendes Transaktionsmonitoring detektiert ungewoehnliche Handelsmuster (Volumen, Gegenpartei, Herkunftsland). Verda-echtige Transaktionen werden unverzueglich der FIU gemeldet (Verdachtsmeldung nach §43 GwG). Vollstaendige KYC-Unterlagen muessen 5 Jahre nach Beziehungsende aufbewahrt werden (§8 GwG)."
      }
    ],
    cta: "Reguliert und sicher handeln auf der EUCX"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "orderbuch-preisfindung",
    title:       "Wie funktioniert ein Orderbuch? Preisfindung, Market Depth und Order-Typen",
    description: "Von der Orderaufgabe bis zur Ausfuehrung: Wie elektronische Orderbucher funktionieren, wie Preise entstehen und welche Order-Typen professionelle Handler nutzen.",
    category:    "Handel",
    readMin:     8,
    published:   "2026-03-15",
    sections: [
      {
        heading: "Das elektronische Orderbuch",
        body: "Das Orderbuch (Order Book) ist das Herzstuck jeder elektronischen Handelsplattform. Es ist eine geordnete Liste aller offenen Kauf- und Verkaufsauftraege fuer ein bestimmtes Instrument, sortiert nach Preis. Auf der Geldseite (Bid) stehen Kaufinteressenten mit ihren Preislimits und Mengen, auf der Briefseite (Ask/Offer) Verkaufsinteressenten.\n\nDer Spread - die Differenz zwischen bestem Kaufkurs (Best Bid) und bestem Verkaufskurs (Best Ask/Offer) - ist ein direktes Mass fuer die Liquiditaet eines Marktes. Enge Spreads signalisieren hohe Liquiditaet und geringe Transaktionskosten, weite Spreads das Gegenteil.\n\nEin Match (Ausfuehrung) findet statt, wenn ein Kaufauftrag zu einem Preis aufgegeben wird, der gleich oder hoeher ist als ein bestehender Verkaufsauftrag. Die Ausfuehrungs-Engine prueft in Millisekunden alle eingehenden Orders gegen den bestehenden Orderbestand."
      },
      {
        heading: "Order-Typen im professionellen Handel",
        body: "",
        sub: [
          {
            heading: "Market Order (Marktauftrag)",
            body: "Sofortige Ausfuehrung zum besten verfuegbaren Gegenpreis, unabhaengig vom Preis. Garantiert Ausfuehrung, nicht aber einen bestimmten Preis. Risiko: Bei geringer Liquiditaet kann die Order Preisbewegungen ausloesen (Market Impact) oder zu schlechtem Durchschnittspreis ausgefuehrt werden."
          },
          {
            heading: "Limit Order (Limitierter Auftrag)",
            body: "Ausfuehrung nur zu einem bestimmten Preis oder besser. Kauflimit: maximal zu diesem Preis kaufen. Verkauflimit: mindestens zu diesem Preis verkaufen. Garantiert Preis, nicht Ausfuehrung. Nicht ausgefuehrte Teile bleiben im Orderbuch als Liquiditaet fuer andere Teilnehmer sichtbar."
          },
          {
            heading: "Stop Order (Stoppauftrag)",
            body: "Wird erst aktiv, wenn ein bestimmter Trigger-Preis erreicht wird. Stop-Loss: Automatischer Verkauf wenn Kurs faellt (Verlustbegrenzung). Stop-Buy: Automatischer Kauf wenn Kurs steigt (Ausbruch-Strategie). Nach Trigger-Ausloesung wird die Order als Market Order weitergeleitet."
          },
          {
            heading: "IOC / FOK Orders",
            body: "Immediate-or-Cancel (IOC): Sofortige Teilausfuehrung, nicht ausgefuehrter Rest wird storniert. Fill-or-Kill (FOK): Entweder vollstaendige Ausfuehrung oder sofortige Stornierung - kein Teilfill. Beide Typen werden von professionellen Haendlern eingesetzt, die keine Teilpositionen im Orderbuch hinterlassen moechten."
          }
        ]
      },
      {
        heading: "Market Depth und Liquiditaet",
        body: "Market Depth (Markttiefe) bezeichnet die Faehigkeit des Marktes, grosse Orders aufzunehmen ohne den Preis wesentlich zu bewegen. Eine hohe Markttiefe zeigt sich daran, dass auch auf Preisniveaus unterhalb des Best Bid und oberhalb des Best Ask substanzielle Ordervolumina vorhanden sind.\n\nFuer grosse Transaktionen (z.B. 1.000 Tonnen Stahl) ist Market Depth entscheidend: Wird eine solch grosse Order auf einen duennen Markt getroffen, kann sie mehrere Preisniveaus im Orderbuch abgrasen (Slippage), was den Durchschnittspreis erheblich verschlechtert. Institutionelle Handler nutzen daher Algorithmen (z.B. VWAP - Volume Weighted Average Price), um grosse Orders in kleine Teile aufzuspalten und ueber Zeit zu verteilen."
      },
      {
        heading: "Auktionsverfahren und Handelsunterbrechungen",
        body: "Viele organisierte Handelsplaetze nutzen Eroeffnungs- und Schlussauktionen (Call Auctions) um den Handel zu starten und zu beenden. Im Auktionszeitraum werden Orders gesammelt, aber nicht sofort ausgefuehrt. Der Auktionspreis wird so bestimmt, dass das maximale Handelsvolumen ausgefuehrt werden kann (Price Discovery).\n\nWaehrend des laufenden Handels koennen Circuit Breaker (Handelsunterbrechungen) ausgeloest werden, wenn der Preis innerhalb kurzer Zeit um einen bestimmten Prozentsatz schwankt. Ziel: Marktteilnehmer Zeit geben, ungewoehnliche Preisbewegungen zu bewerten und Panikverkaufe oder algorithmisch verstaerkte Kursausschlaege zu begrenzen."
      }
    ],
    cta: "Echtzeit-Orderbuch auf der EUCX"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "margin-sicherheitsleistungen",
    title:       "Margin und Sicherheitsleistungen im Rohstoffhandel: Initial Margin, Variation Margin, Margin Calls",
    description: "Wie Sicherheitsleistungen im organisierten Rohstoffhandel funktionieren: Initial Margin Berechnung, Variation Margin, Margin Calls und Liquidation in der Praxis.",
    category:    "Handel",
    readMin:     9,
    published:   "2026-03-16",
    sections: [
      {
        heading: "Wozu dienen Sicherheitsleistungen?",
        body: "Im organisierten Handel uebernimmt eine zentrale Gegenpartei (CCP) das Ausfallrisiko beider Handelsparteien. Um selbst gegen Verluste geschuetzt zu sein, verlangt die CCP von allen Teilnehmern Sicherheitsleistungen - sogenannte Margins.\n\nDie Grundlogik: Wenn ein Teilnehmer ausfaellt (Insolvenz, Zahlungsverweigerung), muss die CCP die offenen Positionen des ausgefallenen Teilnehmers im Markt glattstellen (Schliessen). Die hinterlegte Margin muss diese Verluste bis zum Glattstellen vollstaendig absichern. Ohne ausreichende Margins wuerde das Ausfallrisiko auf andere Marktteilnehmer oder den Betreiber uebergehen."
      },
      {
        heading: "Initial Margin: Die Einschuss-Sicherheitsleistung",
        body: "Initial Margin (Ersteinschuss) ist eine Sicherheitsleistung, die bei Eroffnung einer Position hinterlegt werden muss. Sie berechnet sich typischerweise als prozentualer Anteil des Positionswertes, basierend auf historischen Preisschwankungen (Value at Risk, VaR).\n\nBeispiel: Ein Teilnehmer kauft 100 Tonnen Rebar zu 600 EUR/t = 60.000 EUR Positionswert. Bei 5% Initial Margin: 3.000 EUR Sicherheitsleistung. Bei einem Tageslimit von +/- 3% Preisschwankung betraegt das maximale Tagesverlustrisiko 1.800 EUR, das deutlich unterhalb der hinterlegten Margin liegt.\n\nDie EUCX verlangt eine Kaution von 20.000 EUR als Eintrittsvoraussetzung, die als Pool fuer Initial-Margin-Anforderungen dient.",
        sub: [
          {
            heading: "Margin-Berechnung nach SPAN",
            body: "Das branchenstandard SPAN-System (Standard Portfolio Analysis of Risk) berechnet Margin-Anforderungen auf Portfolioebene. Es beruecksichtigt dabei Korrelationen zwischen Positionen: Wenn ein Teilnehmer gleichzeitig Long in Rebar und Short in Stahlschrott ist (natuerliche Hedge-Position), reduziert SPAN die Gesamtmargin gegenueber der Summe der Einzelmargins. Diversifizierte Portfolios erfordern so weniger Kapital als undiversifizierte Positionen."
          }
        ]
      },
      {
        heading: "Variation Margin: Taegl-iche Gewinn- und Verlustverrechnung",
        body: "Am Ende jeden Handelstages werden alle offenen Positionen zum aktuellen Marktpreis bewertet (Mark-to-Market). Gewinner erhalten ihren Tagesgewinn als Variation Margin gutgeschrieben, Verlierer muessen ihren Tagesverlust einzahlen.\n\nDieses taegl-iche Settlement verhindert die Akkumulation grosser unrealisierter Verluste. Selbst wenn ein Teilnehmer irgendwann ausfaellt, ist sein maximales Ausfallrisiko auf den Tagesverlust begrenzt - nicht auf gesamte unrealisierte Verluste seit Positionseröffnung."
      },
      {
        heading: "Margin Call: Nachschusspflicht",
        body: "Wenn die hinterlegte Margin unter einen Mindestschwellenwert (Maintenance Margin) faellt - beispielsweise durch Marktverluste - ergeht ein Margin Call. Der Teilnehmer muss innerhalb der vorgeschriebenen Frist (auf der EUCX: 24 Stunden) zusaetzliche Mittel einzahlen, um die Initial Margin wieder herzustellen.\n\nWird der Margin Call nicht bedient, ist der Plattformbetreiber berechtigt und verpflichtet, die Position des Teilnehmers zwangsweise glattzustellen (Liquidation). Die Liquidationskosten werden aus der hinterlegten Margin gedeckt. Entstehende Fehlbetraege werden zivilrechtlich geltend gemacht."
      },
      {
        heading: "Praxistipps: Margin-Management fuer Unternehmen",
        body: "Liquiditaetsreserve einplanen: Initial Margin ist nur der Mindestbetrag. Preis-volatilitaet kann Margin-Anforderungen schnell erhoehen. Reservieren Sie mindestens das 1,5-fache der erwarteten Initial Margin als Liquiditaetsreserve.\n\nMargin-Effizienz durch Hedging: Gegenlaeufi-ge Positionen reduzieren netto Margin-Anforderungen. Wer sowohl kauft als auch verkauft, zahlt weniger Margin als jemand mit rein einseitigen Positionen.\n\nMargin-Kalender fuer Lieferpositionen: Naert sich ein Kontrakt dem Lieferzeitpunkt, steigt die Margin typischerweise stark an (Delivery Margin). Planen Sie Kapital oder rechtzeitigen Kontraktswechsel (Roll-over) ein."
      }
    ],
    cta: "EUCX-Handelsbedingungen und Margin-Anforderungen einsehen"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "nachhaltigkeit-rohstoffhandel",
    title:       "Nachhaltigkeit im Rohstoffhandel: ESG, CBAM und gruener Stahl",
    description: "Wie veraendern ESG-Anforderungen, der CO2-Grenzausgleich (CBAM) und gruene Stahlproduktion den europaeischen Rohstoffhandel? Anforderungen, Chancen und Strategien.",
    category:    "ESG",
    readMin:     10,
    published:   "2026-03-17",
    sections: [
      {
        heading: "ESG im Rohstoffhandel: Ein struktureller Wandel",
        body: "Environmental, Social and Governance (ESG) ist laengst kein Marketingbegriff mehr, sondern ein regulatorischer und wirtschaftlicher Faktor, der den Rohstoffhandel grundlegend veraendert. Grosse Abnehmer - Automobilhersteller, Energieversorger, staatliche Bautraeger - verlangen zunehmend Nachhaltigkeitsnachweise ihrer Lieferketten.\n\nDie EU-Lieferkettensorgfaltspflichtenverordnung (CSDDD, Corporate Sustainability Due Diligence Directive) verpflichtet ab 2027 grosse Unternehmen, Menschenrechts- und Umweltstandards entlang der gesamten Lieferkette zu pruefen und zu dokumentieren. Rohstoffhandelsunternehmen muessen nachweisen koennen, woher ihre Materialien stammen und unter welchen Bedingungen sie produziert wurden."
      },
      {
        heading: "CBAM: Der CO2-Grenzausgleich",
        body: "Das Carbon Border Adjustment Mechanism (CBAM, Verordnung (EU) 2023/956) ist eines der bedeutendsten Handelspolitikinstrumente der EU. Es trat im Oktober 2023 in der Uebergangsphase in Kraft und wird ab 2026 vollstaendig angewandt.\n\nZiel: Verhinderung von Carbon Leakage - also der Verlagerung von CO2-intensiver Produktion in Laender ausserhalb des EU-ETS, um Regulierung zu umgehen.",
        sub: [
          {
            heading: "CBAM und Stahl: Konkrete Auswirkungen",
            body: "Stahl und Eisen sind von Beginn an CBAM-pflichtig. Importeure muessen bei der Einfuhr CBAM-Zertifikate erwerben, die dem eingebetteten CO2-Gehalt des importierten Produktes entsprechen. Der Preis je CBAM-Zertifikat entspricht dem wochentlichen Durchschnittspreis der EU-ETS-Zertifikate.\n\nFuer einen Hochofenstahl mit ca. 2,0 t CO2/t Stahl und einem ETS-Preis von 65 EUR/t CO2: CBAM-Kosten von 130 EUR/t Stahl zusaetzlich zum Stahlpreis. Elektrisch erschmolzener Stahl (EAF) mit ca. 0,5 t CO2/t profitiert deutlich: nur 32,50 EUR/t CBAM-Aufschlag."
          },
          {
            heading: "Reporting-Pflichten in der Uebergangsphase",
            body: "Von Oktober 2023 bis Dezember 2025 mussten Importeure CBAM-pflichtige Waren lediglich melden (quartalsweise Berichte an Zollbeh-oerden). Ab Januar 2026 beginnt die vollstaendige Anwendung mit Zertifikatspflicht. Importeure benoetigen eine CBAM-Anmeldernummer und muessen Zertifikate (CBAM certificates) kaufen und bis 31. Mai des Folgejahres abgeben."
          }
        ]
      },
      {
        heading: "Gruener Stahl: Technologien und Marktentwicklung",
        body: "Die Stahlindustrie steht unter massivem Druck, ihre CO2-Emissionen zu reduzieren. Verschiedene Technologiepfade werden verfolgt:",
        sub: [
          {
            heading: "Direktreduktion mit Wasserstoff (H2-DRI)",
            body: "Statt Kokskohle wird gruener Wasserstoff (aus erneuerbarer Energie elektrolysiert) zur Reduktion von Eisenerz verwendet. thyssenkrupp plant vollstaendige Umstellung auf H2-DRI bis 2045. Pilotanlage tkH2Steel in Duisburg laeuft seit 2024. Noch deutlich teurer als konventioneller Stahl (Aufpreis 100-300 EUR/t), aber Preisluecke schliesst sich mit sinkenden H2-Kosten."
          },
          {
            heading: "Carbon Capture and Storage (CCS/CCUS)",
            body: "Abscheidung von CO2 direkt an Hochofenabgasen und geologische Speicherung oder industrielle Nutzung. ArcelorMittal verfolgt diesen Weg in Belgien (Ghent). Weniger CO2-reduzierend als H2-DRI, aber schneller skalierbar und mit bestehender Infrastruktur kombinierbar."
          },
          {
            heading: "Schrottbasierter EAF-Stahl",
            body: "Bereits heute die nachhaltigste Massenstahl-Technologie: ca. 0,4-0,6 t CO2/t Stahl vs. 2,0-2,2 t bei Hochofen. Mit zunehmendem Anteil erneuerbarer Energie im Stromnetz sinken die indirekten Emissionen weiter. Qualitative Grenzen: Schrott-basierter Stahl enthaelt hoehere Spurelemente (Kupfer, Zinn) und ist nur eingeschraenkt fuer Premium-Flachprodukte geeignet."
          }
        ]
      },
      {
        heading: "Strategien fuer Handelsunternehmen",
        body: "Dokumentation des CO2-Fussabdrucks: Einkauf von Stahl mit Produktpass (Environmental Product Declaration, EPD nach EN 15804) erleichtert eigenes Reporting und Kundennachweise.\n\nLieferantendiversifizierung nach CO2-Intensitaet: Niedrig-CO2-Lieferanten (EAF-Basis, H2-DRI-Piloten) koennen kuenftig hoeheren Preis erzielen, entlasten aber CBAM-Kosten bei Wiederverkaeufen.\n\nFruehzeitige CBAM-Registrierung: Auch kleine und mittelgrosse Importeure benoetigen ab 2026 CBAM-Anmeldernummer. Beratung durch Zollspezialist empfohlen, da Nichtmeldung zu empfindlichen Bussgeldern fuehrt."
      }
    ],
    cta: "Nachhaltiger Rohstoffhandel auf der EUCX"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "kupfermarkt-eu",
    title:       "Kupfermarkt: Globale Preisfaktoren, EU-Nachfrage und institutioneller Handel",
    description: "Kupfer ist das Leitmetall der Energiewende. Dieser Artikel erklaert Preisbildung, Qualitaetsklassen und Handelsstrukturen fuer institutionelle Kaeufer und Verkaeufer.",
    category:    "Markt",
    readMin:     10,
    published:   "2026-03-10",
    sections: [
      {
        heading: "Kupfer als strategisches Industriemetall",
        body: "Kupfer (Cu) ist nach Aluminium das weltweit meistgehandelte Nichteisenmetall. Mit einer globalen Jahresproduktion von ca. 22 Millionen Tonnen ist es unverzichtbar fuer Elektrotechnik, Energieinfrastruktur, Maschinenbau und Bauwesen. Die EU importiert rund 60% ihres Bedarfs, hauptsaechlich aus Chile, Peru und der Demokratischen Republik Kongo.",
        sub: [
          {
            heading: "Einsatzbereiche und Nachfragetreiber",
            body: "Etwa 65% des globalen Kupferverbrauchs entfallen auf elektrische Anwendungen: Leitungen, Transformatoren, Elektromotoren und Ladekabel fuer Elektrofahrzeuge. Die Energiewende ist der stärkste Nachfragetreiber: Eine Windkraftanlage (5 MW) benoetigt bis zu 6 Tonnen Kupfer, ein Elektrofahrzeug 3-5-mal mehr als ein Verbrenner. Bis 2030 erwartet die EU einen Mehrbedarf von 35% gegenueber 2023."
          },
          {
            heading: "Preisbildung und Referenzmaerkte",
            body: "Der globale Kupferpreis wird an der London Metal Exchange (LME) festgestellt und in USD/t notiert. Fuer EU-Kaeufer ist der EUR/USD-Wechselkurs damit ein wesentlicher Preisfaktor. Zusaetzliche Aufschlaege (Premia) entstehen durch Verarbeitungsqualitaet, regionale Lagerkosten und Raffinationsgebühren (TC/RC). Auf der EUCX werden Kupferprodukte in EUR/kg und EUR/t ohne Wechselkursrisiko fuer EU-interne Transaktionen gehandelt."
          }
        ]
      },
      {
        heading: "Qualitaetsklassen und Normen",
        body: "Kupfer wird nach Reinheitsgrad und Verarbeitungszustand klassifiziert. Elektrolyt-Kupfer (Cu-ETP, EN 1977) mit >= 99,9% Reinheit ist Standard fuer Leitungsanwendungen. Phosphordesoxidiertes Kupfer (Cu-DHP) wird bevorzugt fuer Rohre und Klimaanlagen eingesetzt. Alle EUCX-Produkte werden mit Werkspruefeugnis 3.1 nach EN 10204 geliefert.",
        sub: [
          {
            heading: "Produktformen im Handel",
            body: "Katheodenkupfer (Blechform, 99,99% Reinheit) ist das Basisprodukt fuer Schmelzbetriebe. Kupferdrahtbarren (8mm Walzdraht) sind Vorprodukt fuer die Kabelindustrie. Kupferrohre (nahtlos, EN 1057) und Kupferbaender (EN 1652) bedienen Sanitaer-, Kaelte- und Elektroindustrie."
          }
        ]
      },
      {
        heading: "Handelsstrategien fuer institutionelle Teilnehmer",
        body: "Grossabnehmer aus der Kabelindustrie oder dem Maschinenbau sichern typischerweise 3-6 Monate Bedarf auf Vorrat, um Preisspitzen zu vermeiden. Spot-Kaeufe ueber die EUCX ermoeglichen flexible Zukaeuf bei Kapazitaetsauslastung. Die transparente Preisfindung im Orderbuch vermeidet die branchenoeblichen Informationsasymmetrien des telefonischen OTC-Handels.",
      }
    ],
    cta: "Kupfer und NE-Metalle auf der EUCX handeln"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "walzdraht-stabstahl",
    title:       "Walzdraht und Stabstahl: Qualitaetsnormen, Einsatzbereiche und Handelsusancen",
    description: "Von der Zieherei bis zur Automobilindustrie: Walzdraht und Stabstahl sind Schluessel-Halbzeuge. Dieser Leitfaden erklaert Normen, Haerteklassen und Handelsbedingungen.",
    category:    "Produkte",
    readMin:     8,
    published:   "2026-03-12",
    sections: [
      {
        heading: "Walzdraht: Einsatz und Spezifikation",
        body: "Walzdraht ist ein warmgewalztes Langprodukt mit kreisrundem Querschnitt, das in Ringen (Coils) geliefert wird. Der Durchmesser liegt typischerweise zwischen 5,5 mm und 52 mm. Er ist Ausgangsprodukt fuer Kaltziehereien (Stahldraht, Naegel, Schrauben, Federn) und die Betonstahlproduktion. Die massgebliche Norm ist EN 10016/10017 fuer unlegierte Stahle und EN 10264 fuer Drahte.",
        sub: [
          {
            heading: "Verguetungsstaehle und Sondergueten",
            body: "Fuer die Automobilindustrie sind Verguetungsstaehle nach EN 10083 (z.B. 42CrMo4, 38MnB5) von zentraler Bedeutung. Sie erzielen nach Waermebehandlung Festigkeitswerte von 900-1400 N/mm2 und werden fuer Getriebewellen, Kurbelwellen und Fahrwerkskomponenten eingesetzt. Einkaufsabteilungen grosser OEMs schreiben diese Gueten mit strengen Werkstoffzertifikaten aus."
          }
        ]
      },
      {
        heading: "Stabstahl: Toleranzen und Praxisanforderungen",
        body: "Stabstahl wird als Einzelstab in Laengen von 6m, 9m oder 12m gehandelt. Rundstahl, Vierkantstahl und Sechskantstahl bedienen Maschinenbau, Landwirtschaftstechnik und allgemeinen Metallbau. Toleranzen richten sich nach EN 10060 (Rundstahl), EN 10058 (Flachstahl) und EN 10061 (Vierkantstahl). Auf der EUCX sind Staebe mit Pruefeugnis 3.1 handelbar, was Qualitaetssicherung fuer weiterverarbeitende Betriebe sicherstellt.",
      },
      {
        heading: "Handelsbedingungen und Mindestmengen",
        body: "Walzdraht wird in der Regel in Coils ab 2 Tonnen gehandelt; auf digitalen Plattformen wie der EUCX sind auch kleinere Lots ab 500 kg handelbar. Stabstahl wird buendelweise (ca. 2-3 t/Buendel) oder als Einzelpaket abgerufen. Lieferzeiten ab Lager betragen 2-5 Werktage, ab Werk 3-6 Wochen. Standardlieferkonditionen auf der EUCX: DAP (Delivered at Place) Empfaengerwerk, Zahlung T+2.",
      }
    ],
    cta: "Walzdraht und Stabstahl auf der EUCX beschaffen"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "zahlungsabwicklung-rohstoffhandel",
    title:       "Zahlungsabwicklung im B2B-Rohstoffhandel: Akkreditive, Bankgarantien und Settlement",
    description: "Wie sichern Kaeufer und Verkaeufer ihre Zahlungsansprueche? Ein Praxisleitfaden zu Akkreditiven, Bankgarantien, Vorkasse und elektronischem Settlement auf regulierten Plattformen.",
    category:    "Praxis",
    readMin:     9,
    published:   "2026-03-14",
    sections: [
      {
        heading: "Zahlungsrisiken im Rohstoffhandel",
        body: "Im internationalen und pan-europaeischen Rohstoffhandel ist das Zahlungsrisiko eines der zentralen operativen Risiken. Lieferant und Kaeufer befinden sich haeufig in verschiedenen Laendern, Rechtssystemen und Waehrungsraeumen. Ohne geeignete Absicherungsinstrumente drohen Zahlungsausfaelle nach erfolgter Lieferung oder Nichtlieferung trotz geleisteter Vorkasse.",
        sub: [
          {
            heading: "Dokumentenakkreditiv (Letter of Credit, L/C)",
            body: "Das Dokumentenakkreditiv ist das klassische Absicherungsinstrument im Aussenhandel. Die Bank des Kaefers verpflichtet sich zur Zahlung, sobald der Verkaeufer festgelegte Dokumente (Handelsrechnung, Packiste, Frachtdokument, Zertifikate) fristgerecht einreicht. Fuer den Stahlhandel typische Dokumente: Werkspruefeugnis 3.1, CMR-Frachtbrief, Ursprungszeugnis. Kosten: 0,1-0,3% des Warenwertes als Akkreditivprovision."
          },
          {
            heading: "Bankgarantie und Anzahlungsgarantie",
            body: "Bei Rahmenvertraegen oder Langzeitlieferbeziehungen werden Bankgarantien bevorzugt. Die Anzahlungsgarantie (Advance Payment Bond) sichert den Kaeufer bei geleisteter Vorkasse. Die Erfuellungsgarantie (Performance Bond, typisch 5-10% des Auftragswertes) sichert gegen Nichtlieferung ab. In Deutschland stellt die KfW fuer mittelstaendische Unternehmen Garantien mit vereinfachtem Verfahren bereit."
          }
        ]
      },
      {
        heading: "Settlement auf der EUCX",
        body: "Die EUCX nutzt ein zentrales Settlement-System, das als Treuhandstelle zwischen Kaeufer und Verkaeufer fungiert. Nach Trade-Confirmation wird die Kaufsumme auf ein Treuhandkonto der EUCX transferiert (T+2, SEPA Instant oder SWIFT). Nach beidseitiger Lieferbestaetigung und Dokumentenpruefung erfolgt die Auszahlung an den Verkaeufer. Dieses Verfahren eliminiert bilaterales Gegenparteirisiko und ersetzt in vielen Faellen teure Akkreditive.",
        sub: [
          {
            heading: "Vorteile des zentralen Settlements",
            body: "Eliminierung des Gegenparteirisikos durch Treuhandprinzip. Standardisierte Zahlungsfristen (T+2) fuer alle Transaktionen. Automatische Rechnungsstellung und Buchungsbeleg fuer beide Parteien. DSGVO-konforme Dokumentenarchivierung fuer 10 Jahre (Handelsrecht). Kostenersparnis gegenueber bankbasierten Akkreditiven von durchschnittlich 0,25% des Transaktionswertes."
          }
        ]
      },
      {
        heading: "Umsatzsteuer und Reverse-Charge im EU-Handel",
        body: "Bei grenzueberschreitenden B2B-Lieferungen innerhalb der EU gilt das Reverse-Charge-Verfahren: Der Empfaenger schuldet die Umsatzsteuer, nicht der Lieferant. Voraussetzung: Beide Parteien sind in der EU umsatzsteuerregistriert und die Lieferung ist innergemeinschaftlich. Auf der EUCX werden alle Rechnungen netto ausgestellt; Kaeufer melden die Umsatzsteuer in ihrer Steuererklarung selbst an.",
      }
    ],
    cta: "Sicher und transparent handeln auf der EUCX"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "preisabsicherung-hedging",
    title:       "Preisabsicherung im Rohstoffhandel: Hedging-Strategien fuer Einkauf und Verkauf",
    description: "Rohstoffpreise schwanken stark. Dieser Artikel erklaert praktische Hedging-Methoden fuer B2B-Unternehmen: von Preisfixierungen ueber Rahmenvertraege bis zu strukturierten Absicherungen.",
    category:    "Handel",
    readMin:     11,
    published:   "2026-03-16",
    sections: [
      {
        heading: "Warum Rohstoffpreise absichern?",
        body: "Stahlpreise koennen innerhalb eines Jahres um 30-60% schwanken. Kupfer und Aluminium sind noch volatiler, da sie an globalen Terminboersen gehandelt werden und stark auf geopolitische Ereignisse, Wechselkurse und chinesische Nachfragesignale reagieren. Fuer produzierende Unternehmen mit langen Lieferketten oder Festpreisvertraegen mit Endkunden ist unkontrollierte Rohstoffpreisvolatilitaet ein erhebliches Ergebnisrisiko.",
        sub: [
          {
            heading: "Physische Preisfixierung und Rahmenvertraege",
            body: "Die einfachste Form der Absicherung ist der Abschluss langfristiger Liefervertraege mit fixierten Preisen. Jahresrahmenvertraege mit Stahlhaendlern oder Erzeuger sichern den Preis fuer definierten Zeitraum und Menge. Nachteil: Keine Partizipation an Preisrueckgaengen, Poenalen bei Nichtabruf. Auf der EUCX koennen Kaeufer Forward-Orders aufgeben, die erst zu einem definierten zukuenftigen Lieferzeitpunkt abgerechnet werden."
          },
          {
            heading: "Index-basierte Preisklauseln",
            body: "Professionelle Einkaufsabteilungen vereinbaren index-basierte Preisanpassungsklauseln: Der Basispreis wird an einen offiziellen Marktindex (z.B. Steel Orbis Rebar EU, LME Cash Copper) gekoppelt. Bei Preisanstieg um mehr als X% wird der Vertragspreis automatisch angepasst, bei Rueckgang ebenso. Dies verteilt das Preisrisiko fair zwischen Kaeufer und Verkaeufer."
          }
        ]
      },
      {
        heading: "Finanzielle Absicherungsinstrumente",
        body: "Groessere Unternehmen nutzen Derivate zur Preisabsicherung. Commodity Swaps tauschen variablen Marktpreis gegen fixen Referenzpreis aus. Optionen (Calls und Puts) sichern gegen extreme Preisbewegungen ohne Pflicht zur Ausuebung. Diese Instrumente unterliegen EMIR-Meldepflichten; ab bestimmten Schwellenwerten ist ein zentrales Clearing ueber eine CCP (z.B. LCH, Eurex Clearing) vorgeschrieben.",
        sub: [
          {
            heading: "Hedging fuer KMU: Praxisempfehlungen",
            body: "Kleinere Unternehmen sollten zunaechst physische Absicherungsstrategien nutzen: Lageraufbau bei niedrigen Preisen, Rahmenvertraege mit guenstigen Preisklauseln, Diversifizierung der Lieferantenbasis. Fuer den Grossteil des deutschen Mittelstands genuegen diese Instrumente, um 80% des Preisrisikos abzufedern. Derivate erfordern Finanzexpertise, Bankkreditlinien und EMIR-Compliance und sind erst ab jaehrlichen Beschaffungsvolumina von ca. 5 Mio. EUR wirtschaftlich."
          }
        ]
      },
      {
        heading: "Preisabsicherung mit der EUCX",
        body: "Die EUCX unterstuetzt institutionelle Teilnehmer bei der Preisabsicherung durch transparente Spotpreise in Echtzeit, Forward-Ordertypen fuer definierte zukuenftige Lieferdaten, Preisalarme bei Erreichen von Zielwerten sowie historische Preisauswertungen als Grundlage fuer Beschaffungsentscheidungen. Im Gegensatz zu OTC-Maerkten ist die Preisfindung auf der EUCX vollstaendig transparent und auditierbar.",
      }
    ],
    cta: "Rohstoffe planbar und transparent beschaffen"
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug:        "gruener-stahl",
    title:       "Gruener Stahl: Wasserstoffreduktion, Elektrostahlwerke und EU-Klimaziele 2050",
    description: "Die Stahlindustrie ist fuer 7% der globalen CO2-Emissionen verantwortlich. Dieser Artikel erklaert Technologiepfade, Marktentwicklung und Auswirkungen auf den Rohstoffhandel.",
    category:    "ESG",
    readMin:     11,
    published:   "2026-03-18",
    sections: [
      {
        heading: "Warum gruener Stahl entscheidend ist",
        body: "Die EU-Stahlindustrie muss bis 2050 klimaneutral sein - so sieht es der European Green Deal vor. Das erfordert eine fundamentale Transformation der Produktionsprozesse. Hochoefen emittieren durchschnittlich 1,85 Tonnen CO2 pro Tonne Rohstahl; Elektrolichtbogenoefen auf Schrottbasis nur 0,4-0,6 t CO2/t. Wasserstoffbasierte Direktreduktion (H2-DRI + EAF) kann auf unter 0,05 t CO2/t sinken.",
        sub: [
          {
            heading: "Technologiepfade zur Klimaneutralitaet",
            body: "H2-DRI: Direktreduktion von Eisenerz mit gruenem Wasserstoff statt Kokskohle erzeugt Eisenschwamm (DRI/HBI), der anschliessend im EAF zu Stahl verarbeitet wird. Pilotanlagen: thyssenkrupp tkH2Steel, H2GS (SSAB), ArcelorMittal Sponge Iron. Schrottbasierter EAF-Stahl: Mit 100% Strom aus erneuerbaren Energien nahezu klimaneutral. Skalierbar mit vorhandenem Schrottaufkommen. Limitierung: Schrottqualitaet reicht fuer viele Flachstahlgueten noch nicht aus.\n\nCCS/CCU: Carbon Capture an Hochofengasen als Brueckentechnologie bis 2035. Technisch moeglich, aber energieintensiv und regulatorisch noch nicht vollstaendig geklart."
          },
          {
            heading: "Preispremia fuer gruenen Stahl",
            body: "Gruener Stahl kostet derzeit 150-300 EUR/t mehr als konventioneller Stahl. Automobilhersteller (Volvo, BMW, Mercedes-Benz) haben bereits langfristige Abnahmevertraege fuer gruenen Stahl unterzeichnet und kommunizieren die Mehrkosten als Marketingvorteil. Mit steigenden CO2-Zertifikatspreisen und fallendem Gruenstrrompreis wird die Preisuecke bis 2030 auf unter 80 EUR/t sinken, prognostizieren BloombergNEF und Wood Mackenzie."
          }
        ]
      },
      {
        heading: "EU-Regulierung und CBAM als Treiber",
        body: "Der Carbon Border Adjustment Mechanism (CBAM) macht Stahl mit hohem CO2-Fussabdruck aus Drittlaendern ab 2026 teurer. Gleichzeitig steigen EU-ETS-Zertifikatspreise auf prognostizierte 100-150 EUR/t CO2 bis 2030. Beide Mechanismen verteuern konventionellen Stahl relativ zum gruenen Stahl und beschleunigen die Transformation. Handelsteilnehmer, die Stahl mit EPD (Environmental Product Declaration) und CO2-Zertifikat liefern koennen, erzielen bereits heute Preispremia.",
        sub: [
          {
            heading: "Praktische Schritte fuer Einkaufsabteilungen",
            body: "CO2-Fussabdruck in Beschaffungsanfragen (RFQ) als Pflichtangabe aufnehmen. EPD (ISO 14025/EN 15804) als Lieferbedingung definieren. Stufenweise Erhoehung des gruenen Stahlanteils im Einkaufsmix (z.B. 20% bis 2027, 50% bis 2030). Preeimbereitschaft interner Stakeholder fruehzeitig klaeren. Foerderantrag bei BAFA (Dekarbonisierungsprogramme) und EU-Innovationsfonds pruefen."
          }
        ]
      },
      {
        heading: "Gruener Stahl auf der EUCX",
        body: "Die EUCX plant fuer 2026 die Einfuehrung eines separaten Handelssegments fuer zertifizierten gruenen Stahl mit EPD-Nachweis und verifizierten CO2-Emissionen unter 500 kg/t. Kaeufer erhalten damit Planungssicherheit fuer ihre eigenen ESG-Reportingpflichten (CSRD, ESRS E1). Das Segment wird mit dem europaeischen Gruenstahl-Register verknuepft und ist CBAM-konform dokumentiert.",
      }
    ],
    cta: "Zukunftssichere Beschaffung auf der EUCX"
  },
];

export const CATEGORIES = [...new Set(ARTICLES.map((a) => a.category))];
