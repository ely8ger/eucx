import type { Metadata } from "next";
import { BASE_URL }      from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "FAQ – Häufig gestellte Fragen | EUCX European Union Commodity Exchange",
  description:
    "Antworten auf alle Fragen zur EUCX-Handelsplattform: Registrierung, KYC, Rohstoffhandel, Orderbuch, Regulierung, Incoterms, Margin, ESG und mehr. Über 60 Fragen und Antworten.",
  keywords: [
    "FAQ Rohstoffbörse", "Fragen EUCX", "B2B Rohstoffhandel Fragen", "Commodity Exchange FAQ",
    "Stahlhandel FAQ", "OTF MiFID II Fragen", "KYC Börse", "Incoterms Handel",
    "BaFin reguliert FAQ", "institutioneller Rohstoffhandel", "Warenbörse EU Fragen",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/faq` },
  openGraph: {
    title: "FAQ – Alle Antworten zur EUCX-Handelsplattform",
    description: "Über 60 Fragen und Antworten zu Registrierung, Handel, Regulierung, Rohstoffen und mehr.",
    url: `${BASE_URL}/faq`,
  },
};

// ── Daten ──────────────────────────────────────────────────────────────────────

interface Faq { q: string; a: string }
interface Category { title: string; icon: string; items: Faq[] }

const CATEGORIES: Category[] = [
  {
    title: "Allgemeines zur EUCX",
    icon: "🏛️",
    items: [
      {
        q: "Was ist die EUCX – European Union Commodity Exchange?",
        a: "Die EUCX ist eine digitale B2B-Warenbörse für institutionellen Rohstoffhandel innerhalb der Europäischen Union. Sie ermöglicht Unternehmen den direkten, transparenten Kauf und Verkauf von Rohstoffen wie Metallen, Betonstahl, Holz, Agrarprodukten, Chemiegütern und Energie über ein elektronisches Orderbuch mit sofortiger Abwicklung.",
      },
      {
        q: "Für wen ist die EUCX gedacht?",
        a: "Die EUCX richtet sich ausschließlich an institutionelle Marktteilnehmer: Industrieunternehmen, Stahlhändler, Rohstoffproduzenten, Importeure/Exporteure, Verarbeitungsbetriebe und andere gewerbliche Akteure mit Sitz in der Europäischen Union. Privatpersonen und Verbraucher sind nicht zugelassen.",
      },
      {
        q: "In welchen Ländern ist die EUCX zugelassen?",
        a: "Die EUCX ist als OTF (Organisiertes Handelssystem) gemäß MiFID II bei der BaFin (Frankfurt am Main) registriert und damit EU-weit zugelassen. Unternehmen aus allen 27 EU-Mitgliedsstaaten können nach erfolgreicher KYC/AML-Prüfung Mitglied werden.",
      },
      {
        q: "Welche Rohstoffe werden auf der EUCX gehandelt?",
        a: "Derzeit sind vier Handelssektionen aktiv: (1) Metalle & Stahl – Betonstahl (Rebar), Walzdraht, Träger, Bleche, Aluminium, Kupfer; (2) Holz & Baustoffe – Schnittholz, Konstruktionsvollholz, Bauholz; (3) Agrarprodukte – Weizen, Mais, Raps, Zuckerrüben; (4) Industrie & Energie – Chemievorprodukte, Energieträger. Das Sortiment wird kontinuierlich erweitert.",
      },
      {
        q: "Was unterscheidet die EUCX von einer klassischen Rohstoffbörse?",
        a: "Anders als Terminbörsen wie LME oder CBOT fokussiert sich die EUCX auf den physischen Spotmarkt: Es werden tatsächliche Warenmengen gehandelt, nicht Derivate oder Futures. Das Orderbuch zeigt Kauf- und Verkaufsangebote in Echtzeit, Abschlüsse werden sofort bestätigt und die Lieferung über Incoterms-basierte Kontrakte geregelt. Die Plattform ersetzt klassische bilaterale Verhandlungen durch einen transparenten, multilateralen Marktplatz.",
      },
      {
        q: "Hat die EUCX einen physischen Handelsplatz?",
        a: "Nein. Die EUCX ist eine rein digitale Plattform (Electronic Organized Trading System). Sitz der Gesellschaft ist Frankfurt am Main. Der gesamte Handelsbetrieb erfolgt über das Online-Portal – zugänglich via Webbrowser oder API-Anbindung.",
      },
      {
        q: "Zu welchen Zeiten kann auf der EUCX gehandelt werden?",
        a: "Die Handelssitzungen laufen Montag bis Freitag von 09:00 bis 17:30 Uhr MEZ, analog zum Frankfurter Börsenkalender. An deutschen Feiertagen ist kein Handel möglich. Außerhalb der Handelszeiten können Orders vorerfasst werden, die dann zum nächsten Sitzungsbeginn aktiv werden.",
      },
      {
        q: "Wie groß ist das durchschnittliche Handelsvolumen der EUCX?",
        a: "Die EUCX befindet sich im Aufbau und wächst kontinuierlich. Ziel ist ein jährliches Handelsvolumen von über 2 Milliarden Euro bis 2027. Aktuelle Volumeninformationen werden monatlich im Marktbericht veröffentlicht.",
      },
    ],
  },
  {
    title: "Registrierung & Zulassung",
    icon: "📋",
    items: [
      {
        q: "Wie registriere ich mein Unternehmen auf der EUCX?",
        a: "Die Registrierung erfolgt über das Online-Formular unter eucx.eu/register. Erforderlich sind: Unternehmensname, Rechtsform, Handelsregisternummer (HRB), USt-IdNr./VAT-ID (wird automatisch via EU-VIES geprüft), Geschäftsadresse, Name des verantwortlichen Ansprechpartners, geschäftliche E-Mail-Adresse und Telefonnummer für die Zwei-Faktor-Authentifizierung. Nach Einreichung prüft unser Compliance-Team den Antrag.",
      },
      {
        q: "Welche Unterlagen benötige ich für die KYC-Prüfung?",
        a: "Im Rahmen der Know-Your-Customer-Prüfung (KYC) gemäß EU-GeldwäscheRL (AMLD6) werden folgende Dokumente benötigt: aktueller Handelsregisterauszug (max. 3 Monate alt), Gesellschaftsvertrag/Satzung, Transparenzregister-Auszug (wirtschaftlich Berechtigte ≥25%), Ausweis der Geschäftsführer und aller UBOs, ggf. Konzernstrukturdiagramm bei komplexen Strukturen, sowie eine ausgefüllte Selbstauskunft zur Geschäftstätigkeit.",
      },
      {
        q: "Wie lange dauert der Zulassungsprozess?",
        a: "Die Standard-KYC-Prüfung dauert 3–7 Werktage nach Einreichung aller vollständigen Unterlagen. Für Unternehmen aus Hochrisikostaaten oder mit komplexen Eigentümerstrukturen kann eine Enhanced Due Diligence (EDD) erforderlich sein, die bis zu 4 Wochen in Anspruch nehmen kann. Sie werden per E-Mail über den Status Ihres Antrags informiert.",
      },
      {
        q: "Muss mein Unternehmen einen Mindestjahresumsatz nachweisen?",
        a: "Ja. Für die Zulassung als aktiver Marktteilnehmer ist ein nachweisbarer Jahresumsatz im Rohstoffbereich von mindestens 500.000 Euro erforderlich. Dieser Schwellenwert stellt sicher, dass die EUCX ein rein institutioneller Marktplatz bleibt. Nachweise können durch Bilanzen, Umsatzsteuerbescheide oder Lieferverträge erbracht werden.",
      },
      {
        q: "Können auch nicht-EU-Unternehmen auf der EUCX handeln?",
        a: "Unternehmen aus EWR-Staaten (Norwegen, Island, Liechtenstein) und der Schweiz können unter bestimmten Voraussetzungen zugelassen werden. Unternehmen aus Drittländern außerhalb des EWR/der Schweiz sind derzeit nicht zugelassen, da die EUCX als EU-OTF ausschließlich im europäischen Binnenmarkt operiert.",
      },
      {
        q: "Was kostet die Mitgliedschaft auf der EUCX?",
        a: "Die Registrierung und KYC-Prüfung sind kostenfrei. Die EUCX finanziert sich über handelsbezogene Gebühren (Transaktionsgebühren je abgeschlossenem Kontrakt). Es gibt keine monatlichen Grundgebühren für Basismitglieder. Premium-Zugänge mit API-Anbindung und erweiterten Analysewerkzeugen sind als kostenpflichtige Zusatzoption verfügbar.",
      },
      {
        q: "Kann ich mein Konto als Käufer und Verkäufer gleichzeitig nutzen?",
        a: "Ja. Bei der Registrierung wählen Sie eine primäre Rolle (Käufer oder Verkäufer), können aber nach Genehmigung durch das Compliance-Team auch die zweite Rolle freischalten lassen. Voraussetzung ist eine Erklärung zur Vermeidung von Interessenkonflikten und ggf. getrennte Konten für unterschiedliche Handelssparten.",
      },
      {
        q: "Was passiert, wenn mein Unternehmen die Zulassung verliert?",
        a: "Die EUCX kann die Zulassung widerrufen bei: Verstoß gegen Handelsregeln, Nichterfüllung von Zahlungspflichten, wesentlichen Änderungen in der Gesellschaftsstruktur ohne Meldung, behördlicher Anweisung oder Insolvenzantrag. Offene Positionen werden in diesem Fall geordnet abgewickelt.",
      },
    ],
  },
  {
    title: "Handel & Auftragsabwicklung",
    icon: "📊",
    items: [
      {
        q: "Wie funktioniert das Orderbuch der EUCX?",
        a: "Das EUCX-Orderbuch ist ein zentrales Limit-Orderbuch (Central Limit Order Book, CLOB). Käufer und Verkäufer geben Kauf- bzw. Verkaufsorders mit Preis, Menge und optionaler Gültigkeitsdauer ein. Das System matched automatisch kompatible Orders nach dem Preis-Zeit-Prinzip: Beste Preise zuerst, bei Gleichpreisigkeit zuerst eingegangene Orders bevorzugt. Alle aktuellen Gebote und Angebote sind für zugelassene Mitglieder in Echtzeit sichtbar.",
      },
      {
        q: "Was ist der Unterschied zwischen Market Order und Limit Order?",
        a: "Eine Market Order wird sofort zum besten verfügbaren Marktpreis ausgeführt, ohne Preislimit. Sie eignet sich bei hoher Liquidität und dringendem Handelsbedarf. Eine Limit Order wird nur ausgeführt, wenn der Marktpreis das gesetzte Limit erreicht oder unterschreitet (Kauf) bzw. überschreitet (Verkauf). Limit Orders verbleiben im Orderbuch bis zur Ausführung oder Ablauf.",
      },
      {
        q: "Welche Mindesthandelsmengen gelten?",
        a: "Die Mindesthandelsmengen variieren je Produkt. Als Richtwerte: Betonstahl/Rebar: 1 Tonne (ein Lot = 1 t), Walzdraht: 1 Tonne, Aluminium: 500 kg, Kupfer: 250 kg, Schnittholz: 1 m³, Weizen/Mais: 1 Tonne. Die exakten Lot-Größen je Produkt sind im Produktkatalog auf der Plattform einsehbar.",
      },
      {
        q: "Wie lange ist eine Order gültig?",
        a: "Orders können mit verschiedenen Gültigkeiten eingestellt werden: GTC (Good till Cancelled) – bis zur manuellen Stornierung, gültig maximal 90 Handelstage; DAY – nur für die aktuelle Handelssitzung; GTD (Good till Date) – bis zu einem frei wählbaren Datum; IOC (Immediate or Cancel) – sofortige Teilausführung, Rest wird storniert; FOK (Fill or Kill) – vollständige Ausführung oder sofortige Stornierung.",
      },
      {
        q: "Wann wird ein Handel verbindlich?",
        a: "Ein Handel wird im Moment des elektronischen Matchings verbindlich (Trade Confirmation). Beide Parteien erhalten sofort eine automatische Handelsbestätigung per E-Mail und über das Portal. Ab diesem Zeitpunkt gelten die EUCX-Handelsregeln (Market Rules), und beide Parteien sind zur Vertragserfüllung verpflichtet.",
      },
      {
        q: "Kann ich eine Order stornieren?",
        a: "Nicht ausgeführte Orders können jederzeit während der Handelszeit storniert werden. Bereits gematchte Trades können nach dem Matching grundsätzlich nicht mehr einseitig storniert werden. Ausnahmen gelten nur bei technischen Handelsfehlern (Erroneous Trades) – hierfür existiert ein gesondertes Beschwerdeverfahren gemäß EUCX Market Rules §14.",
      },
      {
        q: "Wie funktioniert die Zahlungsabwicklung?",
        a: "Die Zahlungsabwicklung erfolgt über das EUCX Settlement-System. Nach Trade-Bestätigung wird eine Rechnung generiert. Die Zahlung muss innerhalb der vereinbarten Valutatage (Standard: T+2, d.h. 2 Werktage nach Handel) auf das EUCX-Treuhandkonto eingehen. Nach Zahlungseingang beider Parteien erfolgt die gegenseitige Freigabe. Die EUCX fungiert dabei nicht als Käufer/Verkäufer, sondern als Abwicklungsstelle.",
      },
      {
        q: "Was passiert bei Nichterfüllung eines Handels?",
        a: "Bei Zahlungsverzug greift das EUCX-Margin-System: Hinterlegte Sicherheitsleistungen werden einbehalten. Bei vollständiger Nichterfüllung wird der Trade als Default gemeldet, das Compliance-Team leitet ein Sanktionsverfahren ein, und der Marktteilnehmer kann von der Plattform ausgeschlossen werden. Zusätzlich können zivilrechtliche Schritte eingeleitet werden.",
      },
      {
        q: "Gibt es eine API für automatisierten Handel?",
        a: "Ja. Die EUCX bietet eine REST-API und eine WebSocket-API für Echtzeit-Marktdaten und Order-Management. Die API-Dokumentation ist unter /api/docs verfügbar. Für den API-Zugang ist eine separate Genehmigung und ggf. eine Algorithmic Trading Policy erforderlich. Hochfrequenzhandel (HFT) ist derzeit nicht zugelassen.",
      },
      {
        q: "Kann ich Preisalarme und Benachrichtigungen einrichten?",
        a: "Ja. Im Teilnehmerportal können Preisalarme für einzelne Produkte eingerichtet werden. Bei Erreichen eines definierten Preisniveaus erfolgt eine Benachrichtigung per E-Mail und/oder Push-Notification (mobil). Darüber hinaus können automatische Order-Trigger (Stop-Limit-Orders) hinterlegt werden.",
      },
    ],
  },
  {
    title: "Rohstoffe & Produkte",
    icon: "⚙️",
    items: [
      {
        q: "Was ist Betonstahl (Rebar) und wie wird er gehandelt?",
        a: "Betonstahl (Rebar, kurz für Reinforcing Bar) ist gerippter Stahl, der zur Bewehrung von Stahlbetonkonstruktionen eingesetzt wird. Er wird nach EN 10080 in Güte BSt 500S (Streckgrenze ≥500 N/mm²) geliefert. Auf der EUCX wird Betonstahl in Losen von mindestens 1 Tonne gehandelt, in Stablängen von 6 m, 9 m oder 12 m, in Durchmessern von 8 mm bis 40 mm. Der Preis wird in Euro je Tonne (EUR/t) angegeben.",
      },
      {
        q: "Welche Qualitätsnormen gelten für Stahlprodukte auf der EUCX?",
        a: "Alle Stahlprodukte auf der EUCX müssen den einschlägigen EN-Normen entsprechen: Betonstahl EN 10080, Walzdraht EN 10016/10017, Träger EN 10025, Rohre EN 10210/10219. Jeder Trade muss mit einem Werksprüfzeugnis 3.1 gemäß EN 10204 belegt sein. Ohne Prüfzeugnis ist keine Lieferung über die EUCX möglich.",
      },
      {
        q: "Werden auf der EUCX auch Edelmetalle gehandelt?",
        a: "Derzeit nicht. Die EUCX fokussiert sich auf Industriemetalle und -rohstoffe. Edelmetalle (Gold, Silber, Platin) sind klassische Finanzinstrumente und fallen unter andere Regulierungsregimes. Eine Erweiterung des Produktangebots wird für 2027 evaluiert.",
      },
      {
        q: "Was sind die wichtigsten Preisfaktoren für Metalle?",
        a: "Die Metallpreise werden von mehreren Faktoren beeinflusst: (1) Rohstoffkosten (Eisenerz, Kokskohle, Bauxit, Kupfererz), (2) Energiepreise (Strom für Elektrolichtbogenöfen, Erdgas), (3) Schrottpreise (Recyclinganteil), (4) USD/EUR-Wechselkurs (Rohstoffe werden global in USD gehandelt), (5) Nachfragesignale aus Bau und Automobil, (6) Chinesische Produktions- und Exportmengen, (7) CO₂-Zertifikatspreise (EU-ETS), (8) Logistikkosten und Frachtpreise.",
      },
      {
        q: "Wie werden Holzprodukte auf der EUCX gehandelt?",
        a: "Holzprodukte werden in Kubikmetern (m³) gehandelt. Gelistet sind Nadelschnittholz (Fichte/Kiefer), Konstruktionsvollholz (KVH), Brettschichtholz (BSH) und Leimholz nach EN 14081 bzw. EN 14080. Qualitätssortierung nach EN 1611-1. Mengeneinheit: 1 m³ = 1 Lot. Angabe: EUR/m³ inkl. oder exkl. Umsatzsteuer (je nach Lieferkonditionen).",
      },
      {
        q: "Welche Agrarprodukte sind auf der EUCX handelbar?",
        a: "In der Agrarsektion werden gelistet: Weichweizen (Mahlqualität A/B/C nach EU-Interventionsstandard), Mais (Trocken, Standard-Qualität nach EU-VO), Raps (Qualität nach UFOP-Norm), Zuckerrüben (nur im Rahmen von EU-Quotenmengen). Alle Agrarprodukte werden als physische Warenmengen gehandelt, keine Futures.",
      },
      {
        q: "Wie werden Preise auf der EUCX angezeigt – inkl. oder exkl. MwSt.?",
        a: "Alle Preise auf der EUCX werden netto, d.h. ohne Mehrwertsteuer, angegeben. Da es sich um B2B-Transaktionen zwischen USt-registrierten Unternehmen handelt, gilt das Reverse-Charge-Verfahren für grenzüberschreitende EU-Lieferungen. Die Mehrwertsteuerbehandlung richtet sich nach den jeweiligen nationalen und EU-Regeln.",
      },
    ],
  },
  {
    title: "Regulierung & Compliance",
    icon: "⚖️",
    items: [
      {
        q: "Wie ist die EUCX reguliert?",
        a: "Die EUCX GmbH ist als Betreiber eines Organisierten Handelssystems (OTF) gemäß MiFID II (Richtlinie 2014/65/EU) bei der Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin) mit Sitz in Frankfurt am Main lizenziert. Als OTF unterliegt die EUCX strengen Transparenz-, Melde- und Wohlverhaltensregeln. Die Zulassung gilt kraft EU-Pass EU-weit.",
      },
      {
        q: "Was bedeutet OTF (Organisiertes Handelssystem)?",
        a: "Ein OTF ist eine von MiFID II eingeführte Handelskategorie für den multilateralen Handel mit Non-Equity-Instrumenten (d.h. keine Aktien). OTFs dürfen eigenes Kapital einsetzen, um Liquidität bereitzustellen (Market Making), unterliegen aber strengen Interessenkonflikt-Regeln. Die EUCX nutzt die OTF-Lizenz für den Rohstoffhandel, der als physisch-kommerzielle Transaktion organisiert ist.",
      },
      {
        q: "Welche Geldwäschepflichten bestehen?",
        a: "Die EUCX unterliegt als Finanzinstitution dem Geldwäschegesetz (GwG) und der 6. EU-Geldwäscherichtlinie (AMLD6). Jeder neue Teilnehmer durchläuft eine vollständige KYC-Prüfung: Identifizierung des Unternehmens, Feststellung der wirtschaftlich Berechtigten (UBO ≥25%), Risikoklassifizierung, laufendes Transaction-Monitoring und ggf. Enhanced Due Diligence (EDD) für Hochrisikokonstellationen.",
      },
      {
        q: "Was ist Transaction Reporting und gilt es auch für die EUCX?",
        a: "Gemäß MiFID II Artikel 26 müssen Handelsplätze Transaktionsdaten an die zuständige Behörde (BaFin) und ESMA melden. Die EUCX übernimmt diese Meldepflicht für alle Teilnehmer automatisch. Jeder gematchte Trade wird am Handelstag über das ESMA-Meldeverfahren (FIRDS/ESAP) reportiert. Teilnehmer müssen eigenständig keine Transaction Reports einreichen.",
      },
      {
        q: "Welche Regeln gelten für Insider-Handel und Marktmissbrauch?",
        a: "Die EUCX unterliegt der EU-Marktmissbrauchsverordnung (MAR, Verordnung (EU) Nr. 596/2014). Verboten sind: Insiderhandel, Marktmanipulation (Spoofing, Layering, Wash Trading), unerlaubte Offenlegung von Insiderinformationen. Die EUCX betreibt ein automatisiertes Marktüberwachungssystem und meldet Verdachtsfälle unverzüglich an die BaFin.",
      },
      {
        q: "Muss ich als Teilnehmer eigene Compliance-Strukturen vorhalten?",
        a: "Ja. Jeder institutionelle Teilnehmer muss über geeignete interne Kontrollen und Compliance-Strukturen verfügen. Dazu gehören: Vier-Augen-Prinzip für große Orders, interne Handelsrichtlinien, Schulungen für Händler, Interessenkonflikt-Management und ein Notfallplan (Business Continuity Plan). Details sind in den EUCX Mitgliedschaftsregeln (Market Rules) dokumentiert.",
      },
      {
        q: "Welche Datenschutzregeln gelten auf der EUCX?",
        a: "Die EUCX verarbeitet personenbezogene Daten ausschließlich auf Grundlage der DSGVO (EU-Datenschutz-Grundverordnung, VO (EU) 2016/679). Als Verantwortliche gilt die EUCX GmbH, Frankfurt. Rechtsgrundlagen der Verarbeitung: Vertragserfüllung (Art. 6 Abs. 1 lit. b), gesetzliche Verpflichtung (Art. 6 Abs. 1 lit. c), berechtigte Interessen (Art. 6 Abs. 1 lit. f). Daten werden ausschließlich in der EU verarbeitet und gespeichert.",
      },
      {
        q: "Was passiert bei einer Beschwerde gegen die EUCX oder ein Mitglied?",
        a: "Beschwerden können schriftlich an compliance@eucx.eu oder postalisch an die EUCX GmbH, Frankfurt, gerichtet werden. Die EUCX hat ein formelles Beschwerdeverfahren (Complaint Handling Procedure): Eingangsbestätigung binnen 24h, Prüfung durch unabhängige Compliance-Funktion, Antwort innerhalb von 20 Werktagen. Bei Streitigkeiten zwischen Mitgliedern steht ein Schiedsverfahren nach DIS-Schiedsordnung offen.",
      },
    ],
  },
  {
    title: "Preise, Gebühren & Margin",
    icon: "💰",
    items: [
      {
        q: "Wie hoch sind die Transaktionsgebühren auf der EUCX?",
        a: "Die EUCX erhebt eine Transaktionsgebühr von 0,08–0,15% des Kontraktwerts je abgeschlossenem Trade (Maker-Taker-Modell: Maker 0,05%, Taker 0,12%). Bei einem Handelsvolumen von 100.000 EUR beträgt die Gesamtgebühr damit maximal 150 EUR. Höhere Volumina qualifizieren für Mengenrabatte. Für Market Maker gelten Sonderkonditionen.",
      },
      {
        q: "Was ist eine Margin und wozu dient sie?",
        a: "Die Margin (Sicherheitsleistung) ist ein Betrag, den Marktteilnehmer als Kaution hinterlegen, um ihre Handelsverpflichtungen abzusichern. Sie schützt die Gegenpartei und die EUCX vor Ausfallrisiken. Die Initial Margin beträgt je nach Produkt und Volatilität 3–10% des Kontraktwerts. Bei Marktschwankungen kann eine Variation Margin (Nachschusspflicht) entstehen.",
      },
      {
        q: "In welcher Form kann Margin hinterlegt werden?",
        a: "Margin kann in folgenden Formen hinterlegt werden: (1) Barmittel in EUR auf dem EUCX-Margin-Konto, (2) erstrangige Bankbürgschaft einer EU-Geschäftsbank (Rating ≥A-), (3) EU-Staatsanleihen mit Rating ≥AA- (Haircut gemäß EUCX-Haircut-Tabelle). Kryptowährungen und andere illiquide Assets werden nicht akzeptiert.",
      },
      {
        q: "Was passiert, wenn meine Margin nicht ausreicht?",
        a: "Bei Unterschreitung der Mindest-Margin (Maintenance Margin) erhält der Teilnehmer einen automatischen Margin Call. Er hat dann 2 Stunden Zeit, die Margin aufzufüllen. Erfolgt dies nicht, können offene Positionen durch die EUCX zwangsweise geschlossen werden (Forced Liquidation). Wiederholte Margin Calls können zur temporären Handelssperrung führen.",
      },
      {
        q: "Gibt es Kosten für die Hinterlegung und Rückgabe von Margin?",
        a: "Die Hinterlegung von Barmitteln ist kostenfrei. Für Bankbürgschaften fällt eine Prüfgebühr von einmalig 150 EUR an. Barmittel-Margins werden mit dem aktuellen EZB-Einlagensatz verzinst (kann auch negativ sein). Die Rückgabe von Margin nach Handelsabschluss und Zahlung erfolgt innerhalb von 2 Werktagen.",
      },
      {
        q: "Wie wird der Preis bei einem Abschluss festgestellt?",
        a: "Der Handelspreis ergibt sich automatisch aus dem Matching im Orderbuch. Bei Limit-Order-Matching gilt der Preis der zuerst eingegangenen Order (Maker-Preis). Der festgestellte Preis ist bindend und wird beiden Parteien in der Trade Confirmation angezeigt. Eine Anfechtung des Preises ist nur im Rahmen des Erroneous-Trade-Verfahrens möglich.",
      },
    ],
  },
  {
    title: "Incoterms & Lieferung",
    icon: "🚚",
    items: [
      {
        q: "Welche Incoterms werden auf der EUCX verwendet?",
        a: "Auf der EUCX kommen ausschließlich Incoterms® 2020 der ICC (International Chamber of Commerce) zur Anwendung. Standardmäßig werden folgende Klauseln verwendet: EXW (Ab Werk) – Käufer übernimmt alle Kosten und Risiken ab Verkäuferwerk; FCA (Frei Frachtführer) – Verkäufer liefert an benannten Ort; DAP (Geliefert benannter Ort) – Verkäufer trägt alle Kosten bis zum Bestimmungsort; DDP (Geliefert verzollt) – Vollständiger Lieferservice inkl. Zoll.",
      },
      {
        q: "Wer ist für die Logistik und den Transport verantwortlich?",
        a: "Die Verantwortung hängt von den vereinbarten Incoterms ab. Bei EXW/FCA liegt die Transportverantwortung beim Käufer; bei DAP/DDP beim Verkäufer. Die EUCX vermittelt auf Wunsch zugelassene Logistikpartner, haftet jedoch nicht für den Transport. Transportschäden und -risiken sind über die Incoterms klar geregelt.",
      },
      {
        q: "Was passiert mit dem Eigentumsübergang bei einem EUCX-Trade?",
        a: "Der Eigentumsübergang richtet sich nach den vereinbarten Lieferkonditionen (Incoterms) und dem anwendbaren nationalen Recht. In Deutschland gilt: Eigentum geht mit Übergabe der Ware über (§929 BGB), sofern kein Eigentumsvorbehalt vereinbart wurde. Die EUCX empfiehlt, Eigentumsübergang und Gefahrtragung ausdrücklich in den Trade Terms zu spezifizieren.",
      },
      {
        q: "Wie lange hat der Verkäufer Zeit, die Ware zu liefern?",
        a: "Die Lieferfrist wird bei Ordereinstellung festgelegt. Standard-Lieferfristen auf der EUCX: Spot (S) = Lieferung innerhalb von 5 Werktagen; Forward (F) = Lieferung zu einem spezifizierten Datum. Bei Überschreitung der Lieferfrist ohne beidseitige Einigung gilt dies als Lieferverzug nach EUCX Market Rules §18, der Strafzahlungen und Handelssperrung nach sich ziehen kann.",
      },
      {
        q: "Werden auch internationale Lieferungen außerhalb der EU abgewickelt?",
        a: "Grundsätzlich ist die EUCX auf innereuropäischen Warenhandel ausgerichtet. Exporte in Drittstaaten außerhalb der EU sind über die Plattform nicht direkt möglich, da sie eigene Zoll-, Export- und Sanktionsrechtsprüfungen erfordern, die der Verkäufer eigenverantwortlich durchzuführen hat. Die EUCX bietet hierfür keine Unterstützung.",
      },
    ],
  },
  {
    title: "Nachhaltigkeit & ESG",
    icon: "🌱",
    items: [
      {
        q: "Unterstützt die EUCX nachhaltige Rohstoffbeschaffung?",
        a: "Ja. Die EUCX hat ESG-Kriterien (Environmental, Social, Governance) in ihre Plattform integriert: Anbieter können freiwillig Nachhaltigkeitszertifikate (z.B. FSC für Holz, ResponsibleSteel für Stahl, RSPO für Palmöl) hinterlegen. Diese werden im Produktprofil angezeigt, sodass Käufer gezielt nach zertifizierten Waren filtern können.",
      },
      {
        q: "Gibt es einen CO₂-Fußabdruck für gehandelte Waren?",
        a: "Für Stahlprodukte bietet die EUCX optional die Angabe des Product Carbon Footprint (PCF) in kg CO₂-Äquivalent pro Tonne an, basierend auf ISO 14067. Dieser PCF-Wert kann vom Verkäufer hinterlegt und durch einen akkreditierten Prüfer bestätigt werden. Ab 2027 wird die Angabe des CO₂-Fußabdrucks für Stahlprodukte verpflichtend, in Vorbereitung auf das EU-Lieferkettensorgfaltspflichtengesetz.",
      },
      {
        q: "Wie verhält sich die EUCX zum EU Green Deal und CBAM?",
        a: "Die EUCX bereitet sich aktiv auf das Carbon Border Adjustment Mechanism (CBAM) der EU vor, das seit Oktober 2023 in der Übergangsphase ist. Ab 2026 müssen importierte CO₂-intensive Waren (u.a. Stahl, Aluminium) CBAM-Zertifikate vorweisen. Die EUCX integriert CBAM-relevante Dokumentation in ihren Abwicklungsprozess, um Mitgliedern die Einhaltung zu erleichtern.",
      },
      {
        q: "Gibt es Einschränkungen für Rohstoffe aus bestimmten Herkunftsländern?",
        a: "Ja. Die EUCX überwacht aktiv EU-Sanktionslisten (EU-Ratsverordnungen) und OFAC-Listen. Rohstoffe aus sanktionierten Ländern oder von sanktionierten Unternehmen können nicht auf der EUCX gehandelt werden. Darüber hinaus prüft die EUCX Einhaltung der EU-Holzhandelsverordnung (EUTR), der EU-Entwaldungsverordnung (EUDR) und des Konfliktmineralien-Gesetzes.",
      },
    ],
  },
  {
    title: "Technik & Plattform",
    icon: "💻",
    items: [
      {
        q: "Welche technischen Anforderungen gibt es für die Nutzung der EUCX?",
        a: "Die EUCX-Webplattform läuft in jedem modernen Browser (Chrome, Firefox, Safari, Edge – jeweils aktuelle Version). Es ist keine Software-Installation erforderlich. Für die API-Anbindung wird ein Server mit REST-/WebSocket-Unterstützung benötigt. Empfohlene Internetverbindung: ≥10 Mbit/s, latenzoptimiert. Mobile Nutzung über Tablet ist möglich, für aktiven Handel wird ein Desktop empfohlen.",
      },
      {
        q: "Wie sicher ist die EUCX-Plattform?",
        a: "Die EUCX ist nach ISO 27001 zertifiziert. Alle Verbindungen sind mit TLS 1.3 verschlüsselt. Jeder Login erfordert Zwei-Faktor-Authentifizierung (TOTP oder SMS). Handels-Sessions laufen automatisch nach 15 Minuten Inaktivität ab. Serverinfrastruktur liegt ausschließlich in ISO-zertifizierten EU-Rechenzentren. Penetrationstests werden halbjährlich durch externe Prüfer durchgeführt.",
      },
      {
        q: "Wie erfolgt die Zwei-Faktor-Authentifizierung?",
        a: "Nach Eingabe von E-Mail und Passwort wird ein 6-stelliger Einmalcode (TOTP) über eine Authenticator-App (Google Authenticator, Authy, Microsoft Authenticator) abgefragt. Alternativ kann ein SMS-Code an die hinterlegte Mobilnummer gesendet werden. Die 2FA kann nicht deaktiviert werden – sie ist für alle Konten verpflichtend.",
      },
      {
        q: "Gibt es ein Demo-Konto zum Ausprobieren?",
        a: "Ja. Zugelassene Mitglieder erhalten nach dem Onboarding Zugang zu einem Paper-Trading-Modus (Sandbox), in dem sie mit simuliertem Kapital und echten Marktdaten handeln können, ohne reale Verpflichtungen einzugehen. Dieser Modus ist ideal zur Einarbeitung und für Tests der API-Anbindung.",
      },
      {
        q: "Was passiert bei einem technischen Ausfall der Plattform?",
        a: "Die EUCX betreibt redundante Systeme mit automatischem Failover. Bei einem ungeplanten Ausfall werden alle aktiven Orders in einen 'Suspended'-Status versetzt (kein automatisches Matching). Nach Wiederherstellung werden offene Orders reaktiviert. Für Notfall-Handelsabschlüsse steht während des Ausfalls ein telefonischer Notfall-Desk zur Verfügung.",
      },
    ],
  },
];

// ── JSON-LD ────────────────────────────────────────────────────────────────────

const allFaqs = CATEGORIES.flatMap((c) => c.items);
const jsonLd = {
  "@context": "https://schema.org",
  "@type":    "FAQPage",
  mainEntity: allFaqs.map((f) => ({
    "@type": "Question",
    name:    f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text:    f.a,
    },
  })),
};

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ backgroundColor: "#f7f9fc", minHeight: "100vh", fontFamily: F }}>

        {/* ── Topbar ── */}
        <div style={{ backgroundColor: "#0b1e36", borderBottom: "3px solid #154194", padding: "0 40px", height: 56, display: "flex", alignItems: "center" }}>
          <a href="/" style={{ color: "#fff", textDecoration: "none", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            EUCX
          </a>
          <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            European Union Commodity Exchange
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 24 }}>
            <a href="/wissen" style={{ fontSize: 13, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Wissen</a>
            <a href="/login"  style={{ fontSize: 13, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Anmelden</a>
            <a href="/register" style={{ fontSize: 13, color: "#fff", fontWeight: 600, textDecoration: "none", backgroundColor: BLUE, padding: "5px 14px" }}>
              Registrieren
            </a>
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ backgroundColor: "#0b1e36", padding: "52px 40px 48px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <nav style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 16 }}>
              <a href="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>EUCX</a>
              {" / "}
              <span style={{ color: "rgba(255,255,255,.7)" }}>FAQ</span>
            </nav>
            <h1 style={{ fontSize: 38, fontWeight: 300, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Häufig gestellte Fragen
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginTop: 12, marginBottom: 0, lineHeight: 1.6, fontWeight: 300 }}>
              Über {allFaqs.length} Antworten zu Registrierung, Handel, Regulierung, Rohstoffen, Incoterms, Margin und mehr.
            </p>
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {CATEGORIES.map((c) => (
                <a
                  key={c.title}
                  href={`#${c.title.replace(/\s+/g, "-").toLowerCase()}`}
                  style={{
                    fontSize: 12, color: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.2)",
                    padding: "4px 12px", textDecoration: "none", letterSpacing: "0.01em",
                  }}
                >
                  {c.icon} {c.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Inhalt ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 40px 80px" }}>

          {CATEGORIES.map((cat) => (
            <section
              key={cat.title}
              id={cat.title.replace(/\s+/g, "-").toLowerCase()}
              style={{ marginBottom: 56 }}
            >
              {/* Kategorie-Kopf */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${BLUE}` }}>
                <span style={{ fontSize: 22 }}>{cat.icon}</span>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0d1b2a", margin: 0, fontFamily: F }}>
                  {cat.title}
                </h2>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
                  {cat.items.length} Fragen
                </span>
              </div>

              {/* FAQ-Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {cat.items.map((faq, i) => (
                  <details
                    key={i}
                    style={{ backgroundColor: "#fff", border: "1px solid #e4e8ef" }}
                  >
                    <summary
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#0d1b2a",
                        fontFamily: F,
                        lineHeight: 1.4,
                        listStyle: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                        userSelect: "none" as const,
                      }}
                    >
                      <span style={{ flex: 1 }}>{faq.q}</span>
                      {/* Plus-Icon */}
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%",
                        backgroundColor: "#eef2fb", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 1,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <line x1="5" y1="1" x2="5" y2="9" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="1" y1="5" x2="9" y2="5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                    </summary>

                    <div style={{
                      padding: "0 20px 20px",
                      fontSize: 14,
                      color: "#444",
                      lineHeight: 1.7,
                      fontFamily: F,
                      borderTop: "1px solid #f0f2f5",
                      marginTop: 0,
                    }}>
                      <div style={{ paddingTop: 14 }}>
                        {faq.a}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* ── CTA ── */}
          <div style={{
            backgroundColor: BLUE, padding: "36px 40px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap" as const, gap: 20,
          }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0, fontFamily: F }}>
                Ihre Frage nicht gefunden?
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", margin: "4px 0 0", fontFamily: F }}>
                Unser Compliance-Team beantwortet alle weiteren Fragen zur Mitgliedschaft und zum Handel.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="mailto:compliance@eucx.eu" style={{
                padding: "10px 22px", border: "1px solid rgba(255,255,255,.4)",
                color: "#fff", textDecoration: "none", fontSize: 14, fontFamily: F,
              }}>
                compliance@eucx.eu
              </a>
              <a href="/register" style={{
                padding: "10px 22px", backgroundColor: "#fff",
                color: BLUE, textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: F,
              }}>
                Jetzt registrieren
              </a>
            </div>
          </div>

          {/* ── Wissen-Link ── */}
          <div style={{ marginTop: 32, padding: "20px 24px", backgroundColor: "#fff", border: "1px solid #e4e8ef", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0d1b2a", margin: 0, fontFamily: F }}>Tiefergehende Artikel im Wissenszentrum</p>
              <p style={{ fontSize: 13, color: "#888", margin: "3px 0 0", fontFamily: F }}>8 ausführliche Artikel über Stahlhandel, Rohstoffmärkte, OTF-Regulierung, Incoterms und mehr.</p>
            </div>
            <a href="/wissen" style={{
              fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5, fontFamily: F, whiteSpace: "nowrap" as const,
            }}>
              Zum Wissenszentrum
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke={BLUE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>

        {/* ── Footer ── */}
        <div style={{ backgroundColor: "#0b1e36", borderTop: "3px solid #154194", padding: "28px 40px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", margin: 0, fontFamily: F }}>
              © 2026 EUCX GmbH — Frankfurt am Main — BaFin-regulierter OTF gemäß MiFID II
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {[["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["FAQ", "/faq"], ["Wissen", "/wissen"]].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* CSS für details/summary open-state */}
      <style>{`
        details[open] > summary > span:last-child svg line:first-child {
          display: none;
        }
        details > summary::-webkit-details-marker { display: none; }
        details > summary::marker { display: none; }
        details[open] { border-color: #154194 !important; }
        details[open] > summary { color: #154194 !important; }
      `}</style>
    </>
  );
}
