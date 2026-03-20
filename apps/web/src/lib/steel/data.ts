// ─── Stahlprodukt-Datenbank ───────────────────────────────────────────────────
// Basierend auf Kloeckner-Produktstruktur (shop.kloeckner.de)

export interface SteelProduct {
  id:      string;
  name:    string;
  form:    string;
  werkstoffe:     string[];
  herstellungsart: string[];
  oberflaechenList: string[];
  laengenMm:  number[];
  staerkenMm: number[];
  toleranz:   string[];
  beschreibung: string;
}

export type FormShape = "round" | "square" | "hexagon" | "flat" | "tube-round" | "tube-square" | "fitting" | "angle" | "u" | "t" | "beam" | "c-profile" | "plate" | "plate-holes";

export interface SteelForm {
  id:          string;
  label:       string;
  description: string;
  shape:       FormShape;
  products:    SteelProduct[];
  filters:     FormFilters;
}

export interface FormFilters {
  werkstoff:       string[];
  herstellungsart: string[];
  oberflaeche:     string[];
  laenge:          string[];
  staerke:         string[];
  toleranz:        string[];
}

export const STEEL_FORMS: SteelForm[] = [
  {
    id: "rundprofile", label: "Rund", description: "Vollmaterial · Runder Querschnitt", shape: "round",
    filters: {
      werkstoff:       ["S235JR","S355J2","E335","C45","11SMn30","42CrMo4","34CrNiMo6","1.4301 (304)","1.4404 (316L)","1.4305 (303)","1.2312","1.2316","EN AW-6060","EN AW-2017A","Ms58","SF-Cu"],
      herstellungsart: ["Gezogen","Warmgewalzt","Geschliffen","Geschält","Stranggepreßt"],
      oberflaeche:     ["Blank","Schwarz (warmgewalzt)","Gebeizt & passiviert","Eloxiert"],
      laenge:          ["1.000 mm","2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["5 mm","6 mm","8 mm","10 mm","12 mm","15 mm","16 mm","20 mm","25 mm","30 mm","40 mm","50 mm","60 mm","80 mm","100 mm"],
      toleranz:        ["h9","h11","h13","k11","IT16"],
    },
    products: [
      { id:"rund-01", name:"Blankstahl Rundstahl",          form:"rundprofile", werkstoffe:["S235JR","E335","C45","11SMn30"],             herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,8,10,12,15,16,20,25,30,40,50,60,80,100], toleranz:["h9","h11"],      beschreibung:"Kaltgezogener Blankstahl nach EN 10277. Engste Toleranzen, glatte Oberfläche." },
      { id:"rund-02", name:"Edelstahl Rund",                 form:"rundprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)","1.4305 (303)"],herstellungsart:["Gezogen","Geschliffen"],oberflaechenList:["Gebeizt & passiviert","Blank"], laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,8,10,12,16,20,25,30,40,50,60,80,100],    toleranz:["h9","h11","IT16"], beschreibung:"Nichtrostender Edelstahl-Rundstahl nach EN 10088-3. Hohe Korrosionsbeständigkeit." },
      { id:"rund-03", name:"Legierter Rundstahl",            form:"rundprofile", werkstoffe:["42CrMo4","34CrNiMo6"],                       herstellungsart:["Warmgewalzt","Geschält"],oberflaechenList:["Schwarz (warmgewalzt)"],        laengenMm:[2000,3000,4000,6000],      staerkenMm:[20,25,30,40,50,60,80,100],                 toleranz:["h13","IT16"],     beschreibung:"Vergütungsstahl nach EN 10083-3. Für hochbelastete Maschinenbauteile." },
      { id:"rund-04", name:"Werkzeugstahl Rund",             form:"rundprofile", werkstoffe:["1.2312","1.2316"],                           herstellungsart:["Gezogen","Geschliffen"],oberflaechenList:["Blank","Gebeizt & passiviert"],  laengenMm:[1000,2000,3000],           staerkenMm:[10,12,16,20,25,30,40,50,60],               toleranz:["h9","k11"],       beschreibung:"Werkzeugstahl für Formen- und Werkzeugbau. Vorgerichtet und spannungsarm geglüht." },
      { id:"rund-05", name:"Automatenstahl Rund",            form:"rundprofile", werkstoffe:["11SMn30"],                                   herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,8,10,12,15,16,20,25,30,40,50],         toleranz:["h9","h11"],       beschreibung:"Automatenstahl nach EN 10087. Optimale Zerspanbarkeit für Drehteile." },
      { id:"rund-06", name:"Edelstahl Rund geschliffen",     form:"rundprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)"],              herstellungsart:["Geschliffen"],          oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[6,8,10,12,16,20,25,30,40,50],              toleranz:["h6","h7","h8"],   beschreibung:"Geschliffener Edelstahl-Rundstahl. Engste Maßtoleranzen h6/h7 für Passungen." },
      { id:"rund-07", name:"Aluminium Rund EN AW-6060",      form:"rundprofile", werkstoffe:["EN AW-6060"],                               herstellungsart:["Stranggepreßt"],        oberflaechenList:["Blank","Eloxiert"],             laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[10,12,16,20,25,30,40,50,60,80,100],        toleranz:["h9","IT16"],      beschreibung:"Aluminiumrundstab EN AW-6060 T6 nach EN 573-3. Leicht, korrosionsbeständig." },
      { id:"rund-08", name:"Aluminium Rund EN AW-2017A",     form:"rundprofile", werkstoffe:["EN AW-2017A"],                              herstellungsart:["Stranggepreßt"],        oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000],      staerkenMm:[10,12,16,20,25,30,40,50,60,80],            toleranz:["h9","IT16"],      beschreibung:"Hochfester Aluminiumrundstab 2017A T4. Für Luftfahrt- und Maschinenbauteile." },
      { id:"rund-09", name:"Messing Rund Ms58",               form:"rundprofile", werkstoffe:["Ms58"],                                    herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,8,10,12,14,16,18,20,25,30,40,50],     toleranz:["h9","h11"],       beschreibung:"Messingstab Ms58 nach EN 12164. Für Armaturen, Buchsen und Automatenteile." },
      { id:"rund-10", name:"Kupfer Rund SF-Cu",               form:"rundprofile", werkstoffe:["SF-Cu"],                                   herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,8,10,12,16,20,25,30,40,50],           toleranz:["h9","h11"],       beschreibung:"Kupferstab SF-Cu nach EN 12163. Hohe elektrische Leitfähigkeit, gut lötbar." },
    ],
  },
  {
    id: "vierkantprofile", label: "Vierkant", description: "Vollmaterial · Quadratischer Querschnitt", shape: "square",
    filters: {
      werkstoff:       ["S235JR","E335","C45","11SMn30","42CrMo4","1.4301 (304)","1.4404 (316L)","1.4305 (303)","1.2312","1.2316","EN AW-6060","EN AW-2017A","Ms58","SF-Cu"],
      herstellungsart: ["Gezogen","Warmgewalzt","Geschliffen","Stranggepreßt"],
      oberflaeche:     ["Blank","Schwarz (warmgewalzt)","Gebeizt & passiviert","Eloxiert"],
      laenge:          ["1.000 mm","2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["4 mm","5 mm","6 mm","8 mm","10 mm","12 mm","15 mm","16 mm","20 mm","25 mm","30 mm","40 mm","50 mm","60 mm","80 mm","100 mm"],
      toleranz:        ["h6","h7","h9","h11","IT16"],
    },
    products: [
      { id:"vier-01", name:"Blankstahl Vierkant",           form:"vierkantprofile", werkstoffe:["S235JR","E335","C45","11SMn30"],             herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[4,5,6,8,10,12,15,16,20,25,30,40,50,60,80],  toleranz:["h9","h11"],      beschreibung:"Kaltgezogener Vierkant-Blankstahl nach EN 10277. Präzise Kantengeometrie, scharfe Kanten." },
      { id:"vier-02", name:"Edelstahl Vierkant",            form:"vierkantprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)","1.4305 (303)"],herstellungsart:["Gezogen"],              oberflaechenList:["Gebeizt & passiviert","Blank"], laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,8,10,12,16,20,25,30,40,50,60],          toleranz:["h9","h11","IT16"], beschreibung:"Nichtrostender Edelstahl-Vierkant nach EN 10088-3. Korrosionsbeständig, lebensmittelgeeignet." },
      { id:"vier-03", name:"Werkzeugstahl Vierkant",        form:"vierkantprofile", werkstoffe:["1.2312","1.2316"],                           herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[10,12,16,20,25,30,40,50,60,80],             toleranz:["h9","h11"],       beschreibung:"Werkzeugstahl-Vierkant für Stempel, Schnittplatten und Spritzgussformen." },
      { id:"vier-04", name:"Legierter Vierkant",            form:"vierkantprofile", werkstoffe:["42CrMo4","C45"],                             herstellungsart:["Warmgewalzt"],          oberflaechenList:["Schwarz (warmgewalzt)"],        laengenMm:[2000,3000,4000,6000],      staerkenMm:[20,25,30,40,50,60,80,100],                  toleranz:["IT16"],           beschreibung:"Vergütungsstahl-Vierkant nach EN 10083-3. Für hochbelastete Maschinenbauteile und Wellen." },
      { id:"vier-05", name:"Automatenstahl Vierkant",       form:"vierkantprofile", werkstoffe:["11SMn30"],                                   herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[4,5,6,8,10,12,15,16,20,25,30,40],           toleranz:["h9","h11"],       beschreibung:"Automatenstahl-Vierkant nach EN 10087. Optimale Zerspanbarkeit für automatische Drehmaschinen." },
      { id:"vier-06", name:"Edelstahl Vierkant geschliffen",form:"vierkantprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)"],              herstellungsart:["Geschliffen"],          oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,8,10,12,16,20,25,30,40,50],             toleranz:["h6","h7","h9"],   beschreibung:"Geschliffener Edelstahl-Vierkant. Engste Maßtoleranzen h6/h7 für Führungen und Passungen." },
      { id:"vier-07", name:"Aluminium Vierkant EN AW-6060", form:"vierkantprofile", werkstoffe:["EN AW-6060"],                               herstellungsart:["Stranggepreßt"],        oberflaechenList:["Blank","Eloxiert"],             laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[10,12,15,16,20,25,30,40,50,60,80,100],      toleranz:["h9","IT16"],      beschreibung:"Aluminium-Vierkantstab EN AW-6060 T6 nach EN 573-3. Leicht, korrosionsbeständig, eloxierbar." },
      { id:"vier-08", name:"Aluminium Vierkant EN AW-2017A",form:"vierkantprofile", werkstoffe:["EN AW-2017A"],                              herstellungsart:["Stranggepreßt"],        oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000],      staerkenMm:[10,12,16,20,25,30,40,50,60,80],             toleranz:["h9","IT16"],      beschreibung:"Hochfester Aluminium-Vierkantstab 2017A T4. Für Luftfahrt und Präzisionsmaschinenbau." },
      { id:"vier-09", name:"Messing Vierkant Ms58",          form:"vierkantprofile", werkstoffe:["Ms58"],                                    herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,8,10,12,14,16,18,20,25,30,40,50],      toleranz:["h9","h11"],       beschreibung:"Messing-Vierkantstab Ms58 nach EN 12164. Für Armaturen, Schalterkörper und Feinmechanik." },
      { id:"vier-10", name:"Kupfer Vierkant SF-Cu",          form:"vierkantprofile", werkstoffe:["SF-Cu"],                                   herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,8,10,12,16,20,25,30,40],               toleranz:["h9","h11"],       beschreibung:"Kupfer-Vierkantstab SF-Cu nach EN 12163. Für Stromschienen, Transformatoren und Schaltanlagen." },
    ],
  },
  {
    id: "sechskantprofile", label: "Sechskant", description: "Vollmaterial · Sechseckiger Querschnitt", shape: "hexagon",
    filters: {
      werkstoff:       ["S235JR","E335","C45","11SMn30","1.4301 (304)","1.4305 (303)"],
      herstellungsart: ["Gezogen","Warmgewalzt"],
      oberflaeche:     ["Blank","Gebeizt & passiviert"],
      laenge:          ["1.000 mm","2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["5 mm","6 mm","7 mm","8 mm","9 mm","10 mm","11 mm","12 mm","13 mm","14 mm","15 mm","17 mm","19 mm","22 mm","24 mm","27 mm","30 mm","36 mm","41 mm","46 mm","55 mm"],
      toleranz:        ["h9","h11","IT16"],
    },
    products: [
      { id:"sechs-01", name:"Blankstahl Sechskant",    form:"sechskantprofile", werkstoffe:["S235JR","E335","C45","11SMn30"], herstellungsart:["Gezogen"],    oberflaechenList:["Blank"],                    laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,7,8,9,10,11,12,13,14,15,17,19,22,24,27,30,36,41,46,55], toleranz:["h9","h11"], beschreibung:"Kaltgezogener Sechskant-Blankstahl nach EN 10277. Für Schrauben, Muttern und Armaturen." },
      { id:"sechs-02", name:"Edelstahl Sechskant",     form:"sechskantprofile", werkstoffe:["1.4301 (304)","1.4305 (303)"],  herstellungsart:["Gezogen"],    oberflaechenList:["Gebeizt & passiviert","Blank"], laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,8,10,12,14,17,19,22,24,27,30,36,41], toleranz:["h9","h11","IT16"], beschreibung:"Nichtrostender Edelstahl-Sechskant nach EN 10088-3." },
      { id:"sechs-03", name:"Automatenstahl Sechskant",form:"sechskantprofile", werkstoffe:["11SMn30"],                     herstellungsart:["Gezogen"],    oberflaechenList:["Blank"],                    laengenMm:[1000,2000,3000,4000], staerkenMm:[5,6,8,10,12,14,17,19,22,24,27], toleranz:["h9","h11"], beschreibung:"Automatenstahl für spanabhebende Bearbeitung. Optimale Zerspanbarkeit." },
    ],
  },
  {
    id: "flachprofile", label: "Flach", description: "Vollmaterial · Flacher Rechteckquerschnitt", shape: "flat",
    filters: {
      werkstoff:       ["S235JR","S355J2","E335","C45","1.4301 (304)","1.4404 (316L)","42CrMo4"],
      herstellungsart: ["Warmgewalzt","Kaltgewalzt","Gezogen"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Blank","Gebeizt & passiviert"],
      laenge:          ["2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["3 mm","4 mm","5 mm","6 mm","8 mm","10 mm","12 mm","15 mm","16 mm","20 mm","25 mm","30 mm","40 mm","50 mm","60 mm","80 mm","100 mm"],
      toleranz:        ["h9","h11","IT16"],
    },
    products: [
      { id:"flach-01", name:"Qualitätsstahl Flach",          form:"flachprofile", werkstoffe:["S235JR","S355J2"],             herstellungsart:["Warmgewalzt"],  oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20,25,30,40,50,60,80,100], toleranz:["IT16"], beschreibung:"Warmgewalzter Flachstahl nach EN 10058. Universeller Konstruktionsstahl." },
      { id:"flach-02", name:"Stahlprofile Breitflachstahl",  form:"flachprofile", werkstoffe:["S235JR","S355J2"],             herstellungsart:["Warmgewalzt"],  oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,3000,6000], staerkenMm:[5,6,8,10,12,15,20,25,30,40,50], toleranz:["IT16"], beschreibung:"Breitflachstahl nach EN 10058. Breite bis 150 mm, optimale Materialausnutzung." },
      { id:"flach-03", name:"Legierter Flachstahl",          form:"flachprofile", werkstoffe:["42CrMo4","E335","C45"],        herstellungsart:["Warmgewalzt","Gezogen"], oberflaechenList:["Schwarz (warmgewalzt)","Blank"], laengenMm:[2000,3000,4000,6000], staerkenMm:[6,8,10,12,15,16,20,25,30,40,50,60,80], toleranz:["h11","IT16"], beschreibung:"Vergütungsstahl-Flachprofile für hochbeanspruchte Bauteile." },
      { id:"flach-04", name:"Edelstahl Flachstahl",          form:"flachprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)"],herstellungsart:["Kaltgewalzt","Gezogen"], oberflaechenList:["Gebeizt & passiviert","Blank"], laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20,25,30,40,50], toleranz:["h9","h11","IT16"], beschreibung:"Nichtrostender Edelstahl-Flachstahl nach EN 10088-3." },
    ],
  },
  {
    id: "rundrohre", label: "Rundrohre", description: "Hohlprofil · Runder Querschnitt", shape: "tube-round",
    filters: {
      werkstoff:       ["S235JRH","S355J2H","P235GH","P265GH","1.4301 (304)","1.4404 (316L)","St37.4"],
      herstellungsart: ["Nahtlos","Geschweißt (ERW)","Präzisionsrohr"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Gebeizt & passiviert","Verzinkt"],
      laenge:          ["1.000 mm","2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["1,0 mm","1,5 mm","2,0 mm","2,5 mm","3,0 mm","4,0 mm","5,0 mm","6,3 mm","8,0 mm","10,0 mm","12,5 mm","16,0 mm"],
      toleranz:        ["D4/T3","D4/T4","IT16"],
    },
    products: [
      { id:"rrohr-01", name:"Nahtlose Stahlrohre",         form:"rundrohre", werkstoffe:["S235JRH","P235GH","P265GH"],    herstellungsart:["Nahtlos"],           oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,4000,6000], staerkenMm:[2,2.5,3,4,5,6.3,8,10,12.5,16], toleranz:["D4/T3","D4/T4"], beschreibung:"Nahtlose Stahlrohre nach EN 10210 / EN 10216. Für Druck- und Hochtemperaturanwendungen." },
      { id:"rrohr-02", name:"Geschweißte Stahlrohre",      form:"rundrohre", werkstoffe:["S235JRH","S355J2H"],           herstellungsart:["Geschweißt (ERW)"],  oberflaechenList:["Schwarz (warmgewalzt)","Verzinkt"], laengenMm:[2000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"], beschreibung:"Geschweißte Hohlprofile nach EN 10219. Für Konstruktionen und Stahlbau." },
      { id:"rrohr-03", name:"Edelstahl Rundrohr nahtlos",  form:"rundrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"],herstellungsart:["Nahtlos"],           oberflaechenList:["Gebeizt & passiviert"], laengenMm:[1000,2000,3000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3,8,10], toleranz:["D4/T3","D4/T4"], beschreibung:"Nahtlose Edelstahlrohre nach EN 10216-5. Für Lebensmittel-, Chemie- und Pharmaindustrie." },
      { id:"rrohr-04", name:"Präzisionsstahlrohr",         form:"rundrohre", werkstoffe:["St37.4","E355"],               herstellungsart:["Präzisionsrohr"],    oberflaechenList:["Blank","Gebeizt & passiviert"], laengenMm:[1000,2000,4000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3], toleranz:["D4/T3"], beschreibung:"Präzisionsstahlrohre nach EN 10305-1. Engste Maßtoleranzen für Hydraulik und Maschinenbau." },
    ],
  },
  {
    id: "vierkantrohre", label: "Vierkantrohre", description: "Hohlprofil · Quadratischer / rechteckiger Querschnitt", shape: "tube-square",
    filters: {
      werkstoff:       ["S235JRH","S355J2H","1.4301 (304)","1.4404 (316L)"],
      herstellungsart: ["Geschweißt (ERW)","Nahtlos"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Verzinkt","Gebeizt & passiviert"],
      laenge:          ["2.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["1,5 mm","2,0 mm","2,5 mm","3,0 mm","4,0 mm","5,0 mm","6,3 mm","8,0 mm","10,0 mm","12,5 mm"],
      toleranz:        ["D4/T4","IT16"],
    },
    products: [
      { id:"vrohr-01", name:"Hohlprofil Vierkant geschweißt", form:"vierkantrohre", werkstoffe:["S235JRH","S355J2H"], herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)","Verzinkt"], laengenMm:[2000,4000,6000], staerkenMm:[2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"], beschreibung:"Quadratische Hohlprofile nach EN 10219. Standard im Stahlbau und Maschinenbau." },
      { id:"vrohr-02", name:"Rechteckrohr",                   form:"vierkantrohre", werkstoffe:["S235JRH","S355J2H"], herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)","Verzinkt"], laengenMm:[2000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"], beschreibung:"Rechteckige Hohlprofile nach EN 10219. Für Rahmen, Gestelle und Tragwerke." },
      { id:"vrohr-03", name:"Edelstahl Vierkantrohr",         form:"vierkantrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"], herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Gebeizt & passiviert"], laengenMm:[1000,2000,3000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10], toleranz:["D4/T4"], beschreibung:"Edelstahl-Hohlprofile für korrosionsbelastete Anwendungen." },
    ],
  },
  {
    id: "rohrzubehoer", label: "Rohrzubehör", description: "Fittings · Flansche · Bögen", shape: "fitting",
    filters: {
      werkstoff:       ["S235JR","P235GH","1.4301 (304)","1.4404 (316L)"],
      herstellungsart: ["Geschmiedet","Geschweißt","Gegossen"],
      oberflaeche:     ["Schwarz","Verzinkt","Gebeizt & passiviert"],
      laenge:          ["DN 15","DN 20","DN 25","DN 32","DN 40","DN 50","DN 65","DN 80","DN 100","DN 125","DN 150","DN 200"],
      staerke:         ["PN 6","PN 10","PN 16","PN 25","PN 40"],
      toleranz:        ["EN 1092","DIN 2605","ISO 4144"],
    },
    products: [
      { id:"rz-01", name:"Flansche",          form:"rohrzubehoer", werkstoffe:["S235JR","P235GH","1.4301 (304)"], herstellungsart:["Geschmiedet"], oberflaechenList:["Schwarz","Verzinkt","Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["EN 1092"], beschreibung:"Vorschweißflansche, Blindflansche und Losflansche nach EN 1092-1." },
      { id:"rz-02", name:"Bögen & Krümmer",   form:"rohrzubehoer", werkstoffe:["P235GH","1.4301 (304)","1.4404 (316L)"], herstellungsart:["Geschweißt"], oberflaechenList:["Schwarz","Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["DIN 2605"], beschreibung:"Nahtlose Rohrbogen 90° und 45° nach DIN 2605. 1D und 1,5D Biegeradius." },
      { id:"rz-03", name:"Fittings & Muffen", form:"rohrzubehoer", werkstoffe:["S235JR","1.4301 (304)"],          herstellungsart:["Geschmiedet","Gegossen"], oberflaechenList:["Verzinkt","Schwarz"], laengenMm:[], staerkenMm:[], toleranz:["ISO 4144"], beschreibung:"T-Stücke, Reduzierstücke, Muffen und Übergangsstücke nach EN 10253." },
    ],
  },
  {
    id: "winkelprofile", label: "Winkel", description: "Gleichschenklig · Ungleichschenklig", shape: "angle",
    filters: {
      werkstoff:       ["S235JR","S355J2","1.4301 (304)","1.4404 (316L)"],
      herstellungsart: ["Warmgewalzt"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Gebeizt & passiviert","Verzinkt"],
      laenge:          ["2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["3 mm","4 mm","5 mm","6 mm","7 mm","8 mm","9 mm","10 mm","12 mm","15 mm","16 mm","20 mm"],
      toleranz:        ["IT16"],
    },
    products: [
      { id:"winkel-01", name:"Gleichschenkliger Winkelstahl",   form:"winkelprofile", werkstoffe:["S235JR","S355J2"], herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,7,8,9,10,12,15,16,20], toleranz:["IT16"], beschreibung:"Gleichschenkliger Winkelstahl nach EN 10056-1. Schenkelbreiten 20–200 mm." },
      { id:"winkel-02", name:"Ungleichschenkliger Winkelstahl", form:"winkelprofile", werkstoffe:["S235JR","S355J2"], herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[4,5,6,7,8,9,10,12,15,16,20], toleranz:["IT16"], beschreibung:"Ungleichschenkliger Winkelstahl nach EN 10056-1. Für asymmetrische Konstruktionen." },
      { id:"winkel-03", name:"Edelstahl Winkelstahl",           form:"winkelprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)"], herstellungsart:["Warmgewalzt"], oberflaechenList:["Gebeizt & passiviert"], laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15], toleranz:["IT16"], beschreibung:"Nichtrostender Edelstahl-Winkelstahl nach EN 10088-3. Für Lebensmittel- und Chemiebereich." },
    ],
  },
  {
    id: "u-profile", label: "U-Profile", description: "U-Stahl · UNP · UPE", shape: "u",
    filters: {
      werkstoff:       ["S235JR","S355J2","1.4301 (304)"],
      herstellungsart: ["Warmgewalzt"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Gebeizt & passiviert"],
      laenge:          ["2.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["UNP 30","UNP 40","UNP 50","UNP 60","UNP 65","UNP 80","UNP 100","UNP 120","UNP 140","UNP 160","UNP 180","UNP 200","UNP 220","UNP 240","UNP 260","UNP 280","UNP 300"],
      toleranz:        ["IT16"],
    },
    products: [
      { id:"u-01", name:"U-Stahl (UNP)",     form:"u-profile", werkstoffe:["S235JR","S355J2"], herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Warmgewalzter U-Stahl nach EN 10279. Parallelschenkel UNP 30–300." },
      { id:"u-02", name:"Edelstahl U-Profil", form:"u-profile", werkstoffe:["1.4301 (304)"],   herstellungsart:["Warmgewalzt"], oberflaechenList:["Gebeizt & passiviert"],  laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Nichtrostender Edelstahl U-Stahl nach EN 10088-3." },
    ],
  },
  {
    id: "t-profile", label: "T-Profile", description: "T-Stahl · Gleichschenklig", shape: "t",
    filters: {
      werkstoff:       ["S235JR","S355J2","1.4301 (304)"],
      herstellungsart: ["Warmgewalzt"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Gebeizt & passiviert"],
      laenge:          ["2.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["T 20","T 25","T 30","T 35","T 40","T 45","T 50","T 60","T 70","T 80","T 90","T 100","T 120"],
      toleranz:        ["IT16"],
    },
    products: [
      { id:"t-01", name:"T-Stahl",           form:"t-profile", werkstoffe:["S235JR","S355J2"], herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Warmgewalzter T-Stahl nach EN 10055. Gleichschenkliger Querschnitt T 20–120." },
      { id:"t-02", name:"Edelstahl T-Profil", form:"t-profile", werkstoffe:["1.4301 (304)"],   herstellungsart:["Warmgewalzt"], oberflaechenList:["Gebeizt & passiviert"],  laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Nichtrostender Edelstahl T-Stahl nach EN 10088-3." },
    ],
  },
  {
    id: "traeger", label: "Träger", description: "I-Träger · IPE · HEA · HEB · IPN", shape: "beam",
    filters: {
      werkstoff:       ["S235JR","S355J2","S460M"],
      herstellungsart: ["Warmgewalzt"],
      oberflaeche:     ["Schwarz (warmgewalzt)"],
      laenge:          ["4.000 mm","6.000 mm","8.000 mm","10.000 mm","12.000 mm","Zuschnitt"],
      staerke:         ["IPE 80","IPE 100","IPE 120","IPE 140","IPE 160","IPE 180","IPE 200","IPE 220","IPE 240","IPE 270","IPE 300","IPE 330","IPE 360","IPE 400","IPE 450","IPE 500","HEA 100","HEA 120","HEA 140","HEA 160","HEA 180","HEA 200","HEA 220","HEA 240","HEA 260","HEA 280","HEA 300","HEB 100","HEB 120","HEB 140","HEB 160","HEB 180","HEB 200"],
      toleranz:        ["IT16"],
    },
    products: [
      { id:"tr-01", name:"IPE-Träger",   form:"traeger", werkstoffe:["S235JR","S355J2"],        herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"I-Träger IPE nach EN 10034. Parallelstege, IPE 80 bis IPE 600." },
      { id:"tr-02", name:"HEA-Träger",  form:"traeger", werkstoffe:["S235JR","S355J2"],        herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Breit-I-Träger HEA (IPB-A) nach EN 10025. Hohe Tragfähigkeit bei geringem Gewicht." },
      { id:"tr-03", name:"HEB-Träger",  form:"traeger", werkstoffe:["S235JR","S355J2"],        herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Breit-I-Träger HEB (IPB) nach EN 10025. Standardträger für Stahlbaukonstruktionen." },
      { id:"tr-04", name:"IPN-Träger",  form:"traeger", werkstoffe:["S235JR","S355J2"],        herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Normalträger IPN (I-Profil) nach EN 10024. Klassischer Träger für leichte Konstruktionen." },
      { id:"tr-05", name:"UPE-Träger",  form:"traeger", werkstoffe:["S235JR","S355J2","S460M"],herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"U-Stahl UPE mit parallelen Flanschen nach EN 10279. Für Kranbahnschienen und Führungen." },
    ],
  },
  {
    id: "sonderprofile", label: "Sonderprofile", description: "Z · C · Omega · Kaltprofile", shape: "c-profile",
    filters: {
      werkstoff:       ["S235JR","S350GD","DX51D"],
      herstellungsart: ["Kaltgeformt","Warmgewalzt"],
      oberflaeche:     ["Schwarz","Verzinkt (Z275)","Verzinkt (Z350)"],
      laenge:          ["2.000 mm","3.000 mm","4.000 mm","6.000 mm","Zuschnitt"],
      staerke:         ["1,5 mm","2,0 mm","2,5 mm","3,0 mm","4,0 mm","5,0 mm","6,0 mm","8,0 mm"],
      toleranz:        ["EN 10162"],
    },
    products: [
      { id:"sp-01", name:"Z-Profile (Kaltprofil)",   form:"sonderprofile", werkstoffe:["S350GD","DX51D"], herstellungsart:["Kaltgeformt"], oberflaechenList:["Verzinkt (Z275)","Verzinkt (Z350)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6], toleranz:["EN 10162"], beschreibung:"Z-Profile für Dach- und Wandkonstruktionen nach EN 10162. Kontinuierlich verzinkt." },
      { id:"sp-02", name:"C-Profile (Kaltprofil)",   form:"sonderprofile", werkstoffe:["S350GD","DX51D"], herstellungsart:["Kaltgeformt"], oberflaechenList:["Verzinkt (Z275)","Verzinkt (Z350)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6], toleranz:["EN 10162"], beschreibung:"C-Profile (Sigma-Profile) für Unterkonstruktionen und Pfetten nach EN 10162." },
      { id:"sp-03", name:"Omega-Profile",             form:"sonderprofile", werkstoffe:["S235JR","S350GD"], herstellungsart:["Kaltgeformt"], oberflaechenList:["Schwarz","Verzinkt (Z275)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[2,2.5,3,4,5,6,8], toleranz:["EN 10162"], beschreibung:"Omega-Profile für Befestigungen und Installationen. Hohe Torsionssteifigkeit." },
    ],
  },
  {
    id: "bleche", label: "Bleche", description: "Kaltgewalzt · Warmgewalzt · Edelstahl · Aluminium", shape: "plate",
    filters: {
      werkstoff:       ["S235JR","S355J2","DC01","DC04","1.4301 (304)","1.4404 (316L)","EN AW-1050","EN AW-5083","DX51D"],
      herstellungsart: ["Warmgewalzt","Kaltgewalzt","Verzinkt (Feuerverzinkung)"],
      oberflaeche:     ["Schwarz (warmgewalzt)","Blank (kaltgewalzt)","Gebeizt & passiviert","Verzinkt","2B","BA"],
      laenge:          ["1.000 × 2.000 mm","1.250 × 2.500 mm","1.500 × 3.000 mm","Coil","Zuschnitt"],
      staerke:         ["0,5 mm","0,75 mm","1,0 mm","1,25 mm","1,5 mm","2,0 mm","2,5 mm","3,0 mm","4,0 mm","5,0 mm","6,0 mm","8,0 mm","10,0 mm","12,0 mm","15,0 mm","20,0 mm","25,0 mm","30,0 mm","40,0 mm","50,0 mm"],
      toleranz:        ["EN 10131","EN 10051","IT16"],
    },
    products: [
      { id:"bl-01", name:"Kaltgewalzte Bleche",  form:"bleche", werkstoffe:["DC01","DC04","S235JR"], herstellungsart:["Kaltgewalzt"], oberflaechenList:["Blank (kaltgewalzt)"], laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Kaltgewalzte Feinbleche nach EN 10130. DC01 bis DC06, Oberflächen A, B, C." },
      { id:"bl-02", name:"Warmgewalzte Bleche",  form:"bleche", werkstoffe:["S235JR","S355J2"],      herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[], staerkenMm:[], toleranz:["EN 10051"], beschreibung:"Warmgewalzte Grobbleche nach EN 10025. Stärken 3–150 mm." },
      { id:"bl-03", name:"Edelstahlbleche",       form:"bleche", werkstoffe:["1.4301 (304)","1.4404 (316L)"], herstellungsart:["Kaltgewalzt"], oberflaechenList:["2B","BA","Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Nichtrostende Edelstahlbleche nach EN 10088-2. Oberflächen 2B, BA, 2R, 1D." },
      { id:"bl-04", name:"Aluminiumbleche",       form:"bleche", werkstoffe:["EN AW-1050","EN AW-5083"], herstellungsart:["Warmgewalzt","Kaltgewalzt"], oberflaechenList:["Blank (kaltgewalzt)"], laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Aluminiumbleche nach EN 485. Legierungen 1050A, 5083, 6082 für Leichtbau." },
      { id:"bl-05", name:"Verzinkte Bleche",      form:"bleche", werkstoffe:["DX51D","S350GD"],       herstellungsart:["Verzinkt (Feuerverzinkung)"], oberflaechenList:["Verzinkt"], laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Feuerverzinkte Bleche nach EN 10327. Z100 bis Z600, für Bau und Automobilzulieferung." },
    ],
  },
  {
    id: "lochbleche", label: "Lochbleche", description: "Rundloch · Vierkantloch · Streckmetall", shape: "plate-holes",
    filters: {
      werkstoff:       ["S235JR","1.4301 (304)","EN AW-1050","DX51D"],
      herstellungsart: ["Gestanzt","Gewalzt"],
      oberflaeche:     ["Schwarz","Verzinkt","Gebeizt & passiviert","Blank"],
      laenge:          ["1.000 × 2.000 mm","1.250 × 2.500 mm","Zuschnitt"],
      staerke:         ["0,75 mm","1,0 mm","1,25 mm","1,5 mm","2,0 mm","2,5 mm","3,0 mm","4,0 mm","5,0 mm","6,0 mm","8,0 mm","10,0 mm"],
      toleranz:        ["EN 10140","IT16"],
    },
    products: [
      { id:"lb-01", name:"Rundlochblech Stahl",    form:"lochbleche", werkstoffe:["S235JR"],         herstellungsart:["Gestanzt"], oberflaechenList:["Schwarz","Verzinkt"], laengenMm:[], staerkenMm:[], toleranz:["EN 10140"], beschreibung:"Rundlochblech nach DIN 24041. Freier Querschnitt bis 77%. Für Filter, Siebe, Verkleidungen." },
      { id:"lb-02", name:"Rundlochblech Edelstahl",form:"lochbleche", werkstoffe:["1.4301 (304)"],   herstellungsart:["Gestanzt"], oberflaechenList:["Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["EN 10140"], beschreibung:"Nichtrostendes Rundlochblech für Lebensmittel-, Chemie- und Pharmaindustrie." },
      { id:"lb-03", name:"Vierkantlochblech",       form:"lochbleche", werkstoffe:["S235JR","1.4301 (304)"], herstellungsart:["Gestanzt"], oberflaechenList:["Schwarz","Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["IT16"], beschreibung:"Vierkantlochblech nach DIN 24041. Hoher freier Querschnitt für maximalen Durchfluss." },
      { id:"lb-04", name:"Streckmetall",            form:"lochbleche", werkstoffe:["S235JR","EN AW-1050"], herstellungsart:["Gewalzt"],  oberflaechenList:["Schwarz","Blank","Verzinkt"], laengenMm:[], staerkenMm:[], toleranz:["IT16"], beschreibung:"Streckmetall (Streckgitter) nach DIN 59220. Für Bodenroste, Absperrungen, Fassaden." },
    ],
  },
];

// Helper: form by ID
export function getForm(id: string): SteelForm | undefined {
  return STEEL_FORMS.find(f => f.id === id);
}

// Helper: normalized label → ID map
export const FORM_SLUG_MAP: Record<string, string> = Object.fromEntries(
  STEEL_FORMS.map(f => [f.id, f.label])
);
