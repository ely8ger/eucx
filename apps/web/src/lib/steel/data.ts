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
      { id:"sechs-01", name:"Blankstahl Sechskant",          form:"sechskantprofile", werkstoffe:["S235JR","E335","C45","11SMn30"],             herstellungsart:["Gezogen"],           oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,7,8,9,10,11,12,13,14,15,17,19,22,24,27,30,36,41,46,55], toleranz:["h9","h11"],      beschreibung:"Kaltgezogener Sechskant-Blankstahl nach EN 10277. Für Schrauben, Muttern und Armaturen." },
      { id:"sechs-02", name:"Edelstahl Sechskant",           form:"sechskantprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)","1.4305 (303)"],herstellungsart:["Gezogen"],           oberflaechenList:["Gebeizt & passiviert","Blank"], laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[5,6,8,10,12,14,17,19,22,24,27,30,36,41],             toleranz:["h9","h11","IT16"], beschreibung:"Nichtrostender Edelstahl-Sechskant nach EN 10088-3. Für Armaturen und Chemietechnik." },
      { id:"sechs-03", name:"Automatenstahl Sechskant",      form:"sechskantprofile", werkstoffe:["11SMn30","11SMnPb30"],                        herstellungsart:["Gezogen"],           oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000],      staerkenMm:[5,6,8,10,12,14,17,19,22,24,27,30,36],               toleranz:["h9","h11"],       beschreibung:"Automatenstahl-Sechskant nach EN 10087. Optimale Zerspanbarkeit für Drehautomaten." },
      { id:"sechs-04", name:"Legierter Sechskant",           form:"sechskantprofile", werkstoffe:["42CrMo4","C45"],                             herstellungsart:["Warmgewalzt"],       oberflaechenList:["Schwarz (warmgewalzt)"],        laengenMm:[2000,3000,4000,6000],      staerkenMm:[19,22,24,27,30,36,41,46,55],                        toleranz:["IT16"],           beschreibung:"Vergütungsstahl-Sechskant nach EN 10083-3. Für Sechskantschrauben und Passschrauben." },
      { id:"sechs-05", name:"Werkzeugstahl Sechskant",       form:"sechskantprofile", werkstoffe:["1.2312"],                                    herstellungsart:["Gezogen"],           oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[10,12,14,17,19,22,24,27,30,36],                     toleranz:["h9","h11"],       beschreibung:"Werkzeugstahl-Sechskant für Werkzeugaufnahmen und Spannmittel." },
      { id:"sechs-06", name:"Aluminium Sechskant EN AW-6060",form:"sechskantprofile", werkstoffe:["EN AW-6060"],                               herstellungsart:["Stranggepreßt"],     oberflaechenList:["Blank","Eloxiert"],             laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[8,10,12,14,17,19,22,24,27,30,36,41,46,55],          toleranz:["h9","IT16"],      beschreibung:"Aluminium-Sechskantstab EN AW-6060 T6 nach EN 573-3. Leicht, korrosionsbeständig." },
      { id:"sechs-07", name:"Aluminium Sechskant EN AW-2017A",form:"sechskantprofile",werkstoffe:["EN AW-2017A"],                              herstellungsart:["Stranggepreßt"],     oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000],      staerkenMm:[10,12,14,17,19,22,24,27,30,36,41],                  toleranz:["h9","IT16"],      beschreibung:"Hochfester Aluminium-Sechskantstab 2017A T4. Für Luftfahrt und Feinmechanik." },
      { id:"sechs-08", name:"Messing Sechskant Ms58",         form:"sechskantprofile", werkstoffe:["Ms58"],                                    herstellungsart:["Gezogen"],           oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,7,8,9,10,11,12,13,14,17,19,22,24,27,30,36],    toleranz:["h9","h11"],       beschreibung:"Messing-Sechskantstab Ms58 nach EN 12164. Standard für Automatenarmaturen." },
      { id:"sechs-09", name:"Kupfer Sechskant SF-Cu",         form:"sechskantprofile", werkstoffe:["SF-Cu"],                                   herstellungsart:["Gezogen"],           oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000],           staerkenMm:[5,6,8,10,12,14,17,19,22,24,27],                     toleranz:["h9","h11"],       beschreibung:"Kupfer-Sechskantstab SF-Cu nach EN 12163. Für Stromschienen und elektrische Kontakte." },
      { id:"sechs-10", name:"Titan Sechskant Grade 5",        form:"sechskantprofile", werkstoffe:["Ti-6Al-4V (Grade 5)"],                     herstellungsart:["Gezogen"],           oberflaechenList:["Blank"],                        laengenMm:[500,1000,2000],            staerkenMm:[6,8,10,12,14,17,19,22,24,27],                       toleranz:["h9","IT16"],      beschreibung:"Titan-Sechskantstab Grade 5 nach ASTM B348. Höchste Festigkeit bei geringstem Gewicht." },
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
      { id:"flach-01", name:"Qualitätsstahl Flach",           form:"flachprofile", werkstoffe:["S235JR","S355J2"],                herstellungsart:["Warmgewalzt"],          oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,3000,4000,6000],      staerkenMm:[3,4,5,6,8,10,12,15,16,20,25,30,40,50,60,80,100], toleranz:["IT16"],           beschreibung:"Warmgewalzter Flachstahl nach EN 10058. Universeller Konstruktionsstahl für Stahlbau." },
      { id:"flach-02", name:"Stahlprofile Breitflachstahl",   form:"flachprofile", werkstoffe:["S235JR","S355J2"],                herstellungsart:["Warmgewalzt"],          oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,3000,6000],           staerkenMm:[5,6,8,10,12,15,20,25,30,40,50],            toleranz:["IT16"],           beschreibung:"Breitflachstahl nach EN 10058. Breite bis 150 mm, optimale Materialausnutzung." },
      { id:"flach-03", name:"Legierter Flachstahl",           form:"flachprofile", werkstoffe:["42CrMo4","E335","C45"],           herstellungsart:["Warmgewalzt","Gezogen"],oberflaechenList:["Schwarz (warmgewalzt)","Blank"],  laengenMm:[2000,3000,4000,6000],      staerkenMm:[6,8,10,12,15,16,20,25,30,40,50,60,80],    toleranz:["h11","IT16"],     beschreibung:"Vergütungsstahl-Flachprofile nach EN 10083-3 für hochbeanspruchte Maschinenbauteile." },
      { id:"flach-04", name:"Edelstahl Flachstahl",           form:"flachprofile", werkstoffe:["1.4301 (304)","1.4404 (316L)"],   herstellungsart:["Kaltgewalzt","Gezogen"],oberflaechenList:["Gebeizt & passiviert","Blank"],   laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20,25,30,40,50],    toleranz:["h9","h11","IT16"], beschreibung:"Nichtrostender Edelstahl-Flachstahl nach EN 10088-3. Für Chemie- und Lebensmitteltechnik." },
      { id:"flach-05", name:"Blankstahl Flach",               form:"flachprofile", werkstoffe:["S235JR","E235","C45"],            herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                         laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20,25,30,40,50],    toleranz:["h9","h11"],       beschreibung:"Kaltgezogener Flach-Blankstahl nach EN 10277. Engste Toleranzen, glatte Oberfläche." },
      { id:"flach-06", name:"Federstahl Flach",               form:"flachprofile", werkstoffe:["C75S","51CrV4"],                  herstellungsart:["Kaltgewalzt"],          oberflaechenList:["Blank","Phosphatiert"],           laengenMm:[1000,2000,3000],           staerkenMm:[0.5,1,1.5,2,2.5,3,4,5,6,8,10,12],         toleranz:["h9","h11"],       beschreibung:"Federstahl-Flachband nach EN 10132-4. Für Federn, Klingen und Spannelemente." },
      { id:"flach-07", name:"Aluminium Flachstahl EN AW-6060",form:"flachprofile", werkstoffe:["EN AW-6060"],                    herstellungsart:["Stranggepreßt"],        oberflaechenList:["Blank","Eloxiert"],               laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20,25,30,40,50],    toleranz:["h9","IT16"],      beschreibung:"Aluminium-Flachstab EN AW-6060 T6 nach EN 573-3. Leicht und korrosionsbeständig." },
      { id:"flach-08", name:"Aluminium Flachstahl EN AW-5083",form:"flachprofile", werkstoffe:["EN AW-5083"],                    herstellungsart:["Warmgewalzt"],          oberflaechenList:["Blank"],                         laengenMm:[1000,2000,3000,4000],      staerkenMm:[5,6,8,10,12,15,16,20,25,30,40,50],         toleranz:["IT16"],           beschreibung:"Seewasserbeständiger Aluminium-Flachstab 5083 H111. Für Schiff- und Meerestechnik." },
      { id:"flach-09", name:"Messing Flach Ms58",              form:"flachprofile", werkstoffe:["Ms58"],                          herstellungsart:["Gezogen"],              oberflaechenList:["Blank"],                         laengenMm:[1000,2000,3000],           staerkenMm:[2,3,4,5,6,8,10,12,15,16,20,25,30,40],     toleranz:["h9","h11"],       beschreibung:"Messing-Flachstab Ms58 nach EN 12164. Für Dekorations- und Präzisionsteile." },
      { id:"flach-10", name:"Kupfer Flach SF-Cu",              form:"flachprofile", werkstoffe:["SF-Cu","E-Cu"],                  herstellungsart:["Gezogen","Warmgewalzt"],oberflaechenList:["Blank"],                         laengenMm:[1000,2000,3000],           staerkenMm:[2,3,4,5,6,8,10,12,15,16,20,25,30,40,50],  toleranz:["h9","h11"],       beschreibung:"Kupfer-Flachstab / Stromschiene nach EN 13601. Für Schaltanlagen und Sammelschienen." },
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
      { id:"rrohr-01", name:"Nahtlose Stahlrohre",              form:"rundrohre", werkstoffe:["S235JRH","P235GH","P265GH"],       herstellungsart:["Nahtlos"],          oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,4000,6000],      staerkenMm:[2,2.5,3,4,5,6.3,8,10,12.5,16],  toleranz:["D4/T3","D4/T4"], beschreibung:"Nahtlose Stahlrohre nach EN 10210 / EN 10216. Für Druck- und Hochtemperaturanwendungen." },
      { id:"rrohr-02", name:"Geschweißte Stahlrohre",           form:"rundrohre", werkstoffe:["S235JRH","S355J2H"],               herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)","Verzinkt"],laengenMm:[2000,4000,6000],      staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"],  beschreibung:"Geschweißte Hohlprofile nach EN 10219. Standard für Konstruktionen und Stahlbau." },
      { id:"rrohr-03", name:"Edelstahl Rundrohr nahtlos",       form:"rundrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"],    herstellungsart:["Nahtlos"],          oberflaechenList:["Gebeizt & passiviert"],          laengenMm:[1000,2000,3000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3,8,10],    toleranz:["D4/T3","D4/T4"], beschreibung:"Nahtlose Edelstahlrohre nach EN 10216-5. Für Lebensmittel-, Chemie- und Pharmaindustrie." },
      { id:"rrohr-04", name:"Präzisionsstahlrohr",              form:"rundrohre", werkstoffe:["St37.4","E355"],                   herstellungsart:["Präzisionsrohr"],   oberflaechenList:["Blank","Gebeizt & passiviert"],  laengenMm:[1000,2000,4000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3],         toleranz:["D4/T3"],        beschreibung:"Präzisionsstahlrohre nach EN 10305-1. Engste Maßtoleranzen für Hydraulik und Maschinenbau." },
      { id:"rrohr-05", name:"Edelstahl Rundrohr geschweißt",    form:"rundrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"],    herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Gebeizt & passiviert","2B"],     laengenMm:[1000,2000,3000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3,8,10],    toleranz:["D4/T4"],        beschreibung:"Geschweißte Edelstahlrohre nach EN 10217-7. Kostengünstige Lösung für korrosive Umgebungen." },
      { id:"rrohr-06", name:"Hydraulikrohr nahtlos",            form:"rundrohre", werkstoffe:["E355","St52.4"],                   herstellungsart:["Nahtlos"],          oberflaechenList:["Phosphatiert","Blank"],          laengenMm:[1000,2000,4000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3,8,10],    toleranz:["D4/T3"],        beschreibung:"Hydraulikrohre nach EN 10305-4. Innen phosphatiert für Hydraulikanlagen bis 400 bar." },
      { id:"rrohr-07", name:"Verzinktes Stahlrohr",             form:"rundrohre", werkstoffe:["S235JRH"],                         herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Verzinkt"],                      laengenMm:[2000,4000,6000],      staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["IT16"],         beschreibung:"Feuerverzinktes Stahlrohr nach EN 10255. Für Wasser- und Gasleitungen." },
      { id:"rrohr-08", name:"Aluminium Rundrohr EN AW-6060",    form:"rundrohre", werkstoffe:["EN AW-6060"],                     herstellungsart:["Stranggepreßt"],    oberflaechenList:["Blank","Eloxiert"],              laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3,8,10], toleranz:["IT16"],     beschreibung:"Aluminium-Rundrohr EN AW-6060 T6. Leicht, korrosionsbeständig, gut schweißbar." },
      { id:"rrohr-09", name:"Kupferrohr halbhart",              form:"rundrohre", werkstoffe:["SF-Cu","CU-DHP"],                  herstellungsart:["Gezogen"],          oberflaechenList:["Blank"],                         laengenMm:[1000,2000,3000,5000], staerkenMm:[0.8,1,1.2,1.5,2,2.5,3,3.5,4,5], toleranz:["D4/T3"],        beschreibung:"Kupferrohr halbhart nach EN 1057. Für Sanitär-, Heizungs- und Kälteanlagen." },
      { id:"rrohr-10", name:"Chrom-Rohr poliert",               form:"rundrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"],    herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Poliert (600 Korn)","Poliert (320 Korn)"], laengenMm:[1000,2000,3000,6000], staerkenMm:[1,1.5,2,2.5,3,4,5,6.3], toleranz:["D4/T4"], beschreibung:"Edelstahl-Chromrohr spiegelpoliert. Für Geländer, Handläufe und Designanwendungen." },
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
      { id:"vrohr-01", name:"Hohlprofil Vierkant S235",         form:"vierkantrohre", werkstoffe:["S235JRH"],                       herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)","Verzinkt"],  laengenMm:[2000,4000,6000],      staerkenMm:[2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"], beschreibung:"Quadratische Hohlprofile S235 nach EN 10219. Standard für Stahlbau und Maschinenbau." },
      { id:"vrohr-02", name:"Hohlprofil Vierkant S355",         form:"vierkantrohre", werkstoffe:["S355J2H"],                       herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)"],             laengenMm:[2000,4000,6000],      staerkenMm:[2.5,3,4,5,6.3,8,10,12.5],   toleranz:["D4/T4","IT16"], beschreibung:"Hochfeste quadratische Hohlprofile S355 nach EN 10219. Für tragende Stahlkonstruktionen." },
      { id:"vrohr-03", name:"Rechteckrohr S235",                form:"vierkantrohre", werkstoffe:["S235JRH"],                       herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)","Verzinkt"],  laengenMm:[2000,4000,6000],      staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"], beschreibung:"Rechteckige Hohlprofile nach EN 10219. Für Rahmen, Gestelle und Tragwerke." },
      { id:"vrohr-04", name:"Rechteckrohr S355",                form:"vierkantrohre", werkstoffe:["S355J2H"],                       herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Schwarz (warmgewalzt)"],             laengenMm:[2000,4000,6000],      staerkenMm:[2,2.5,3,4,5,6.3,8,10,12.5], toleranz:["D4/T4","IT16"], beschreibung:"Hochfeste Rechteck-Hohlprofile S355. Für anspruchsvolle Stahlbaukonstruktionen." },
      { id:"vrohr-05", name:"Edelstahl Vierkantrohr geschweißt",form:"vierkantrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"],  herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Gebeizt & passiviert","2B"],        laengenMm:[1000,2000,3000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10],  toleranz:["D4/T4"],        beschreibung:"Edelstahl-Hohlprofile nach EN 10219-2. Für korrosive und hygienische Anwendungen." },
      { id:"vrohr-06", name:"Edelstahl Rechteckrohr geschweißt",form:"vierkantrohre", werkstoffe:["1.4301 (304)","1.4404 (316L)"],  herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Gebeizt & passiviert"],             laengenMm:[1000,2000,3000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8],     toleranz:["D4/T4"],        beschreibung:"Rechteckige Edelstahl-Hohlprofile. Für Geländer, Maschinen und Lebensmittelindustrie." },
      { id:"vrohr-07", name:"Verzinktes Vierkantrohr",          form:"vierkantrohre", werkstoffe:["S235JRH"],                       herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Verzinkt (Feuerverzinkung)"],       laengenMm:[2000,4000,6000],      staerkenMm:[2,2.5,3,4,5,6.3,8,10],      toleranz:["IT16"],         beschreibung:"Feuerverzinktes Vierkant-Hohlprofil nach EN 10219. Langzeitkorrosionsschutz." },
      { id:"vrohr-08", name:"Aluminium Vierkantrohr EN AW-6060",form:"vierkantrohre", werkstoffe:["EN AW-6060"],                    herstellungsart:["Stranggepreßt"],    oberflaechenList:["Blank","Eloxiert"],                 laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8,10], toleranz:["IT16"],     beschreibung:"Aluminium-Vierkantrohre EN AW-6060 T6. Leicht, steif, für Rahmen und Fassaden." },
      { id:"vrohr-09", name:"Aluminium Rechteckrohr EN AW-6060",form:"vierkantrohre", werkstoffe:["EN AW-6060"],                    herstellungsart:["Stranggepreßt"],    oberflaechenList:["Blank","Eloxiert"],                 laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8],    toleranz:["IT16"],     beschreibung:"Aluminium-Rechteckrohre EN AW-6060 T6. Für Fahrzeugbau, Fensterrahmen und Anlagenbau." },
      { id:"vrohr-10", name:"Edelstahl Vierkantrohr poliert",   form:"vierkantrohre", werkstoffe:["1.4301 (304)"],                  herstellungsart:["Geschweißt (ERW)"], oberflaechenList:["Poliert (320 Korn)","Poliert (600 Korn)"], laengenMm:[1000,2000,3000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6.3,8], toleranz:["D4/T4"], beschreibung:"Hochglanzpoliertes Edelstahl-Vierkantrohr. Für Geländer, Handläufe und Designmöbel." },
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
      { id:"rz-01", name:"Vorschweißflansch",       form:"rohrzubehoer", werkstoffe:["S235JR","P235GH","1.4301 (304)"],    herstellungsart:["Geschmiedet"], oberflaechenList:["Schwarz","Verzinkt","Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["EN 1092"],  beschreibung:"Vorschweißflansche nach EN 1092-1. DN 15–DN 600, PN 6 bis PN 40." },
      { id:"rz-02", name:"Blindflansch",             form:"rohrzubehoer", werkstoffe:["S235JR","P235GH","1.4301 (304)"],    herstellungsart:["Geschmiedet"], oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["EN 1092"],  beschreibung:"Blindflansche nach EN 1092-1 zum Abschließen von Rohrenden. DN 15–DN 600." },
      { id:"rz-03", name:"Rohrbogen 90°",            form:"rohrzubehoer", werkstoffe:["P235GH","1.4301 (304)","1.4404 (316L)"],herstellungsart:["Nahtlos"],   oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["DIN 2605"], beschreibung:"Nahtlose Rohrbogen 90° nach DIN 2605. Biegeradius 1D und 1,5D, DN 15–DN 300." },
      { id:"rz-04", name:"Rohrbogen 45°",            form:"rohrzubehoer", werkstoffe:["P235GH","1.4301 (304)","1.4404 (316L)"],herstellungsart:["Nahtlos"],   oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["DIN 2605"], beschreibung:"Nahtlose Rohrbogen 45° nach DIN 2605. Kurzer und langer Bogen, DN 15–DN 300." },
      { id:"rz-05", name:"T-Stück nahtlos",          form:"rohrzubehoer", werkstoffe:["P235GH","1.4301 (304)","1.4404 (316L)"],herstellungsart:["Geschmiedet"],oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["EN 10253"], beschreibung:"Nahtlose T-Stücke nach EN 10253-2. Gleich- und reduziert, DN 15–DN 300." },
      { id:"rz-06", name:"Reduzierstück",            form:"rohrzubehoer", werkstoffe:["P235GH","1.4301 (304)"],            herstellungsart:["Geschmiedet"], oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["EN 10253"], beschreibung:"Konzentrisches und exzentrisches Reduzierstück nach EN 10253-2. DN 25–DN 300." },
      { id:"rz-07", name:"Muffe / Gewindemuffe",     form:"rohrzubehoer", werkstoffe:["S235JR","1.4301 (304)"],            herstellungsart:["Gegossen"],    oberflaechenList:["Verzinkt","Schwarz"],                        laengenMm:[], staerkenMm:[], toleranz:["ISO 4144"], beschreibung:"Gewindegutmuffen nach DIN 2982. Für Gewinderohrverbindungen G 1/4 bis G 4." },
      { id:"rz-08", name:"Schweißnippel",            form:"rohrzubehoer", werkstoffe:["S235JR","1.4301 (304)"],            herstellungsart:["Gedreht"],     oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["DIN 2982"], beschreibung:"Schweißnippel nach DIN 2986. Für Schweißanschlüsse an Behältern und Apparaten." },
      { id:"rz-09", name:"Losflansch mit Vorschweißbund",form:"rohrzubehoer", werkstoffe:["S235JR","1.4301 (304)"],       herstellungsart:["Geschmiedet"], oberflaechenList:["Schwarz","Gebeizt & passiviert"],            laengenMm:[], staerkenMm:[], toleranz:["EN 1092"],  beschreibung:"Losflansch mit Vorschweißbund nach EN 1092-1. Für drehbar zu montierende Verbindungen." },
      { id:"rz-10", name:"Verschlussstopfen",        form:"rohrzubehoer", werkstoffe:["S235JR","1.4301 (304)"],            herstellungsart:["Gedreht"],     oberflaechenList:["Verzinkt","Gebeizt & passiviert"],           laengenMm:[], staerkenMm:[], toleranz:["DIN 906"],  beschreibung:"Innensechskant-Verschlussstopfen nach DIN 906. G 1/8 bis G 4 für temporären Abschluss." },
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
      { id:"winkel-01", name:"Gleichschenkliger Winkelstahl S235",   form:"winkelprofile", werkstoffe:["S235JR"],                       herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,7,8,9,10,12,15,16,20], toleranz:["IT16"], beschreibung:"Gleichschenkliger Winkelstahl S235 nach EN 10056-1. Schenkelbreiten 20–200 mm." },
      { id:"winkel-02", name:"Gleichschenkliger Winkelstahl S355",   form:"winkelprofile", werkstoffe:["S355J2"],                       herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[4,5,6,7,8,9,10,12,15,16,20],   toleranz:["IT16"], beschreibung:"Hochfester Winkelstahl S355 nach EN 10056-1. Für tragende Konstruktionen." },
      { id:"winkel-03", name:"Ungleichschenkliger Winkelstahl",      form:"winkelprofile", werkstoffe:["S235JR","S355J2"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[4,5,6,7,8,9,10,12,15,16,20],   toleranz:["IT16"], beschreibung:"Ungleichschenkliger Winkelstahl nach EN 10056-1. Für asymmetrische Konstruktionen." },
      { id:"winkel-04", name:"Edelstahl Winkelstahl 1.4301",         form:"winkelprofile", werkstoffe:["1.4301 (304)"],                 herstellungsart:["Warmgewalzt"], oberflaechenList:["Gebeizt & passiviert"],          laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15],           toleranz:["IT16"], beschreibung:"Nichtrostender Edelstahl-Winkelstahl 1.4301 nach EN 10088-3. Für Lebensmitteltechnik." },
      { id:"winkel-05", name:"Edelstahl Winkelstahl 1.4404",         form:"winkelprofile", werkstoffe:["1.4404 (316L)"],                herstellungsart:["Warmgewalzt"], oberflaechenList:["Gebeizt & passiviert"],          laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15],           toleranz:["IT16"], beschreibung:"Säurebeständiger Edelstahl-Winkelstahl 1.4404 nach EN 10088-3. Für Chloridumgebungen." },
      { id:"winkel-06", name:"Verzinkter Winkelstahl",               form:"winkelprofile", werkstoffe:["S235JR"],                       herstellungsart:["Warmgewalzt"], oberflaechenList:["Verzinkt (Feuerverzinkung)"],    laengenMm:[2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20],     toleranz:["IT16"], beschreibung:"Feuerverzinkter Winkelstahl nach EN 10056-1. Dauerhafter Korrosionsschutz." },
      { id:"winkel-07", name:"Aluminium Winkelstahl EN AW-6060",     form:"winkelprofile", werkstoffe:["EN AW-6060"],                  herstellungsart:["Stranggepreßt"],oberflaechenList:["Blank","Eloxiert"],              laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[2,3,4,5,6,8,10,12,15], toleranz:["IT16"], beschreibung:"Aluminium-Winkelstahl EN AW-6060 T6. Leicht und korrosionsbeständig für Leichtbau." },
      { id:"winkel-08", name:"Aluminium Winkelstahl EN AW-6082",     form:"winkelprofile", werkstoffe:["EN AW-6082"],                  herstellungsart:["Stranggepreßt"],oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[3,4,5,6,8,10,12,15,16,20], toleranz:["IT16"], beschreibung:"Hochfester Aluminium-Winkelstahl EN AW-6082 T6. Für Maschinenbau und Fahrzeugbau." },
      { id:"winkel-09", name:"Kaltgeformter Edelstahl-Winkel",       form:"winkelprofile", werkstoffe:["1.4301 (304)"],                 herstellungsart:["Kaltgeformt"],  oberflaechenList:["2B","Gebeizt & passiviert"],     laengenMm:[1000,2000,3000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6,8,10],       toleranz:["EN 10162"], beschreibung:"Kaltgeformter Edelstahl-Winkel nach EN 10162. Dünne Wandstärken für Leichtbauanwendungen." },
      { id:"winkel-10", name:"Konstruktionsstahl Winkel S460",       form:"winkelprofile", werkstoffe:["S460M"],                        herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[6,8,10,12,15,16,20],            toleranz:["IT16"], beschreibung:"Hochfester Winkelstahl S460 nach EN 10025-4. Für Brücken- und Kranbau." },
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
      { id:"u-01", name:"U-Stahl S235 (UNP)",            form:"u-profile", werkstoffe:["S235JR"],             herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Warmgewalzter U-Stahl S235 nach EN 10279. Parallelschenkel UNP 30–300. Für Stahlbau." },
      { id:"u-02", name:"U-Stahl S355 (UNP)",            form:"u-profile", werkstoffe:["S355J2"],             herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Hochfester U-Stahl S355 nach EN 10279. Für tragende Konstruktionen und Kranbahnschienen." },
      { id:"u-03", name:"Edelstahl U-Profil 1.4301",     form:"u-profile", werkstoffe:["1.4301 (304)"],       herstellungsart:["Warmgewalzt"],   oberflaechenList:["Gebeizt & passiviert"],          laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Nichtrostender Edelstahl U-Stahl 1.4301 nach EN 10088-3. Für Lebensmittel- und Chemietechnik." },
      { id:"u-04", name:"Edelstahl U-Profil 1.4404",     form:"u-profile", werkstoffe:["1.4404 (316L)"],      herstellungsart:["Warmgewalzt"],   oberflaechenList:["Gebeizt & passiviert"],          laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Säurebeständiger Edelstahl U-Stahl 1.4404 für Chlorid- und Meeresumgebungen." },
      { id:"u-05", name:"UPE-Profil (Parallelschenkel)", form:"u-profile", werkstoffe:["S235JR","S355J2"],    herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"U-Profil UPE mit parallelen Flanschen nach EN 10279. Für Kranbahnschienen und Führungen." },
      { id:"u-06", name:"Aluminium U-Profil EN AW-6060", form:"u-profile", werkstoffe:["EN AW-6060"],         herstellungsart:["Stranggepreßt"], oberflaechenList:["Blank","Eloxiert"],              laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Aluminium-U-Profil EN AW-6060 T6. Leicht, korrosionsbeständig, für Verkleidungen." },
      { id:"u-07", name:"Aluminium U-Profil EN AW-6082", form:"u-profile", werkstoffe:["EN AW-6082"],         herstellungsart:["Stranggepreßt"], oberflaechenList:["Blank"],                        laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Hochfestes Aluminium-U-Profil EN AW-6082 T6. Für Maschinenbau und Fahrzeugrahmen." },
      { id:"u-08", name:"Verzinkter U-Stahl",            form:"u-profile", werkstoffe:["S235JR"],             herstellungsart:["Warmgewalzt"],   oberflaechenList:["Verzinkt (Feuerverzinkung)"],    laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Feuerverzinkter U-Stahl nach EN 10279. Dauerhafter Witterungsschutz ohne Nachbehandlung." },
      { id:"u-09", name:"Kaltgeformter U-Stahl",         form:"u-profile", werkstoffe:["S350GD","DX51D"],     herstellungsart:["Kaltgeformt"],   oberflaechenList:["Verzinkt (Z275)"],               laengenMm:[2000,3000,4000,6000], staerkenMm:[], toleranz:["EN 10162"], beschreibung:"Kaltgeformter, verzinkter U-Stahl nach EN 10162. Für Dach- und Wandkonstruktionen." },
      { id:"u-10", name:"U-Stahl S460",                  form:"u-profile", werkstoffe:["S460M"],              herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Hochfester U-Stahl S460 nach EN 10025-4. Für Krane, Brücken und Offshore-Konstruktionen." },
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
      { id:"t-01", name:"T-Stahl S235 gleichschenklig",   form:"t-profile", werkstoffe:["S235JR"],          herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],      laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Warmgewalzter T-Stahl S235 nach EN 10055. Gleichschenklig T 20–120. Für Stahlbau." },
      { id:"t-02", name:"T-Stahl S355 gleichschenklig",   form:"t-profile", werkstoffe:["S355J2"],          herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],      laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Hochfester T-Stahl S355 nach EN 10055. Für tragende Konstruktionen und Maschinenbau." },
      { id:"t-03", name:"Edelstahl T-Profil 1.4301",      form:"t-profile", werkstoffe:["1.4301 (304)"],    herstellungsart:["Warmgewalzt"],   oberflaechenList:["Gebeizt & passiviert"],       laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Nichtrostender Edelstahl T-Stahl 1.4301 nach EN 10088-3. Für Hygieneanwendungen." },
      { id:"t-04", name:"Edelstahl T-Profil 1.4404",      form:"t-profile", werkstoffe:["1.4404 (316L)"],   herstellungsart:["Warmgewalzt"],   oberflaechenList:["Gebeizt & passiviert"],       laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Säurebeständiger Edelstahl T-Stahl 1.4404 für Chloridumgebungen und Offshore." },
      { id:"t-05", name:"Aluminium T-Profil EN AW-6060",  form:"t-profile", werkstoffe:["EN AW-6060"],      herstellungsart:["Stranggepreßt"], oberflaechenList:["Blank","Eloxiert"],           laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Aluminium-T-Profil EN AW-6060 T6. Leicht für Verkleidungen und Führungsschienen." },
      { id:"t-06", name:"Aluminium T-Profil EN AW-6082",  form:"t-profile", werkstoffe:["EN AW-6082"],      herstellungsart:["Stranggepreßt"], oberflaechenList:["Blank"],                     laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Hochfestes Aluminium-T-Profil EN AW-6082 T6 für Maschinenbau und Fahrzeugbau." },
      { id:"t-07", name:"Verzinkter T-Stahl",             form:"t-profile", werkstoffe:["S235JR"],          herstellungsart:["Warmgewalzt"],   oberflaechenList:["Verzinkt (Feuerverzinkung)"], laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Feuerverzinkter T-Stahl nach EN 10055. Für den Außeneinsatz ohne Nachbehandlung." },
      { id:"t-08", name:"T-Stahl ungleichschenklig",      form:"t-profile", werkstoffe:["S235JR","S355J2"], herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],      laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Ungleichschenkliger T-Stahl. Für asymmetrische Konstruktionslösungen im Maschinenbau." },
      { id:"t-09", name:"Kaltgeformtes T-Profil",         form:"t-profile", werkstoffe:["S350GD"],          herstellungsart:["Kaltgeformt"],   oberflaechenList:["Verzinkt (Z275)"],            laengenMm:[2000,3000,4000,6000], staerkenMm:[], toleranz:["EN 10162"], beschreibung:"Kaltgeformtes T-Profil nach EN 10162. Verzinkt für Dach- und Deckensysteme." },
      { id:"t-10", name:"T-Stahl S460",                   form:"t-profile", werkstoffe:["S460M"],           herstellungsart:["Warmgewalzt"],   oberflaechenList:["Schwarz (warmgewalzt)"],      laengenMm:[2000,4000,6000], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Hochfester T-Stahl S460 nach EN 10025-4. Für Kran- und Brückenkonstruktionen." },
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
      { id:"tr-01", name:"IPE-Träger S235",       form:"traeger", werkstoffe:["S235JR"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"I-Träger IPE S235 nach EN 10034. Parallelstege, IPE 80 bis IPE 600. Standardträger im Stahlbau." },
      { id:"tr-02", name:"IPE-Träger S355",       form:"traeger", werkstoffe:["S355J2"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Hochfester IPE-Träger S355 nach EN 10034. Für tragende Konstruktionen und Industriehallen." },
      { id:"tr-03", name:"HEA-Träger S235",       form:"traeger", werkstoffe:["S235JR"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Breit-I-Träger HEA S235 nach EN 10025. Hohe Tragfähigkeit bei geringem Gewicht." },
      { id:"tr-04", name:"HEA-Träger S355",       form:"traeger", werkstoffe:["S355J2"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Hochfester HEA-Träger S355. Für Hallen, Brücken und Krankonstruktionen." },
      { id:"tr-05", name:"HEB-Träger S235",       form:"traeger", werkstoffe:["S235JR"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Breit-I-Träger HEB S235 nach EN 10025. Standardträger für schwere Stahlbaukonstruktionen." },
      { id:"tr-06", name:"HEB-Träger S355",       form:"traeger", werkstoffe:["S355J2"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Hochfester HEB-Träger S355. Für schwere tragende Konstruktionen und Industrieanlagen." },
      { id:"tr-07", name:"HEM-Träger",            form:"traeger", werkstoffe:["S235JR","S355J2"],     herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Schwerer Breit-I-Träger HEM nach EN 10034. Für maximal belastete Stützen und Rahmen." },
      { id:"tr-08", name:"IPN-Träger",            form:"traeger", werkstoffe:["S235JR","S355J2"],     herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Normalträger IPN nach EN 10024. Geneigte Flanschinnenseiten, IPN 80 bis IPN 600." },
      { id:"tr-09", name:"IPE-Träger S460",       form:"traeger", werkstoffe:["S460M"],               herstellungsart:["Warmgewalzt"], oberflaechenList:["Schwarz (warmgewalzt)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Höchstfester IPE-Träger S460 nach EN 10025-4. Für Krane, Offshore und Sonderanwendungen." },
      { id:"tr-10", name:"Verzinkter IPE-Träger", form:"traeger", werkstoffe:["S235JR"],              herstellungsart:["Warmgewalzt"], oberflaechenList:["Verzinkt (Feuerverzinkung)"], laengenMm:[4000,6000,8000,10000,12000], staerkenMm:[], toleranz:["IT16"], beschreibung:"Feuerverzinkter IPE-Träger. Dauerhafter Korrosionsschutz für Außenanwendungen." },
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
      { id:"sp-01", name:"Z-Pfetten verzinkt",        form:"sonderprofile", werkstoffe:["S350GD"],         herstellungsart:["Kaltgeformt"], oberflaechenList:["Verzinkt (Z275)","Verzinkt (Z350)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6],    toleranz:["EN 10162"], beschreibung:"Z-Pfetten für Dach- und Wandkonstruktionen nach EN 10162. Kontinuierlich verzinkt Z275." },
      { id:"sp-02", name:"C-Pfetten verzinkt",        form:"sonderprofile", werkstoffe:["S350GD"],         herstellungsart:["Kaltgeformt"], oberflaechenList:["Verzinkt (Z275)","Verzinkt (Z350)"], laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6],    toleranz:["EN 10162"], beschreibung:"C-Pfetten (Sigma-Profile) für Unterkonstruktionen nach EN 10162. Für Hallen und Dächer." },
      { id:"sp-03", name:"Omega-Profile",             form:"sonderprofile", werkstoffe:["S235JR","S350GD"],herstellungsart:["Kaltgeformt"], oberflaechenList:["Schwarz","Verzinkt (Z275)"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[2,2.5,3,4,5,6,8],       toleranz:["EN 10162"], beschreibung:"Omega-Profile für Befestigungen, Installationen und Unterkonstruktionen." },
      { id:"sp-04", name:"Hutprofil (Stützprofil)",   form:"sonderprofile", werkstoffe:["DX51D","S350GD"], herstellungsart:["Kaltgeformt"], oberflaechenList:["Verzinkt (Z275)","Schwarz"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5],       toleranz:["EN 10162"], beschreibung:"Hutprofile (35 mm / 15 mm DIN) für Reihenklemmen, Kabelkanäle und Elektroinstallation." },
      { id:"sp-05", name:"Rinnenprofil",              form:"sonderprofile", werkstoffe:["S235JR","S350GD"],herstellungsart:["Kaltgeformt"], oberflaechenList:["Schwarz","Verzinkt (Z275)"],         laengenMm:[2000,3000,4000,6000], staerkenMm:[2,2.5,3,4,5,6,8],       toleranz:["EN 10162"], beschreibung:"U-förmige Rinnenprofile für Entwässerung, Kabelführung und Schalungssysteme." },
      { id:"sp-06", name:"Hut-Distanzprofil",         form:"sonderprofile", werkstoffe:["S350GD"],         herstellungsart:["Kaltgeformt"], oberflaechenList:["Verzinkt (Z275)"],                   laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4],         toleranz:["EN 10162"], beschreibung:"Distanzprofile für Fassadensysteme und Wärmedämmverbundsysteme (WDVS)." },
      { id:"sp-07", name:"Edelstahl C-Profil",        form:"sonderprofile", werkstoffe:["1.4301 (304)"],   herstellungsart:["Kaltgeformt"], oberflaechenList:["2B","Gebeizt & passiviert"],         laengenMm:[1000,2000,3000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6],    toleranz:["EN 10162"], beschreibung:"Kaltgeformtes Edelstahl-C-Profil nach EN 10162. Für Lebensmittel- und Pharmaindustrie." },
      { id:"sp-08", name:"L-Profil ungleichschenklig kalt",form:"sonderprofile", werkstoffe:["S235JR","DX51D"],herstellungsart:["Kaltgeformt"],oberflaechenList:["Schwarz","Verzinkt (Z275)"],  laengenMm:[2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4,5,6,8],  toleranz:["EN 10162"], beschreibung:"Kaltgeformtes L-Profil ungleichschenklig. Dünnwandige Ausführung für Leichtbau." },
      { id:"sp-09", name:"Sockelleistenprofil",       form:"sonderprofile", werkstoffe:["EN AW-6060"],     herstellungsart:["Stranggepreßt"],oberflaechenList:["Blank","Eloxiert","Pulverbeschichtet"],laengenMm:[1000,2000,3000,4000,6000], staerkenMm:[1.5,2,2.5,3,4],  toleranz:["IT16"],     beschreibung:"Aluminium-Sockelleistenprofile für Fußbodenbereich, eloxiert oder pulverbeschichtet." },
      { id:"sp-10", name:"T-Nutenprofil",             form:"sonderprofile", werkstoffe:["EN AW-6060","EN AW-6082"],herstellungsart:["Stranggepreßt"],oberflaechenList:["Blank","Eloxiert"], laengenMm:[500,1000,2000,3000,4000,6000], staerkenMm:[],              toleranz:["IT16"],     beschreibung:"Aluminium-T-Nutenprofile (Bosch-Raster) für Maschinentische, Vorrichtungen und Messmittel." },
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
      { id:"bl-01", name:"Kaltgewalzte Bleche DC01",      form:"bleche", werkstoffe:["DC01"],                      herstellungsart:["Kaltgewalzt"],              oberflaechenList:["Blank (kaltgewalzt)"],           laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Kaltgewalztes Feinblech DC01 nach EN 10130. Tiefziehqualität, Oberflächen A/B/C." },
      { id:"bl-02", name:"Kaltgewalzte Bleche DC04",      form:"bleche", werkstoffe:["DC04"],                      herstellungsart:["Kaltgewalzt"],              oberflaechenList:["Blank (kaltgewalzt)"],           laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Kaltgewalztes Tiefziehblech DC04 nach EN 10130. Gute Umformbarkeit für komplexe Teile." },
      { id:"bl-03", name:"Warmgewalzte Bleche S235",      form:"bleche", werkstoffe:["S235JR"],                    herstellungsart:["Warmgewalzt"],              oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[], staerkenMm:[], toleranz:["EN 10051"], beschreibung:"Warmgewalztes Grobblech S235 nach EN 10025. Stärken 3–150 mm für allgemeinen Stahlbau." },
      { id:"bl-04", name:"Warmgewalzte Bleche S355",      form:"bleche", werkstoffe:["S355J2"],                    herstellungsart:["Warmgewalzt"],              oberflaechenList:["Schwarz (warmgewalzt)"],         laengenMm:[], staerkenMm:[], toleranz:["EN 10051"], beschreibung:"Hochfestes Warmblech S355 nach EN 10025. Für tragende Konstruktionen und Maschinenbau." },
      { id:"bl-05", name:"Edelstahlblech 1.4301 (2B)",    form:"bleche", werkstoffe:["1.4301 (304)"],              herstellungsart:["Kaltgewalzt"],              oberflaechenList:["2B"],                           laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Edelstahlblech 1.4301 Oberfläche 2B nach EN 10088-2. Standardqualität für Industrie." },
      { id:"bl-06", name:"Edelstahlblech 1.4404 (2B)",    form:"bleche", werkstoffe:["1.4404 (316L)"],             herstellungsart:["Kaltgewalzt"],              oberflaechenList:["2B","Gebeizt & passiviert"],     laengenMm:[], staerkenMm:[], toleranz:["EN 10131"], beschreibung:"Säurebeständiges Edelstahlblech 1.4404 nach EN 10088-2. Für Chlorid- und Meeresumgebungen." },
      { id:"bl-07", name:"Aluminiumblech EN AW-1050",     form:"bleche", werkstoffe:["EN AW-1050"],                herstellungsart:["Warmgewalzt","Kaltgewalzt"],oberflaechenList:["Blank (kaltgewalzt)"],           laengenMm:[], staerkenMm:[], toleranz:["EN 485"],  beschreibung:"Reinaluminiumblech EN AW-1050 H14 nach EN 485. Höchste Leitfähigkeit, gut umformbar." },
      { id:"bl-08", name:"Aluminiumblech EN AW-5083",     form:"bleche", werkstoffe:["EN AW-5083"],                herstellungsart:["Warmgewalzt"],              oberflaechenList:["Blank (kaltgewalzt)"],           laengenMm:[], staerkenMm:[], toleranz:["EN 485"],  beschreibung:"Seewasserbeständiges Aluminiumblech 5083 H111. Für Schiffbau und Meerestechnik." },
      { id:"bl-09", name:"Verzinktes Blech Z275",         form:"bleche", werkstoffe:["DX51D"],                     herstellungsart:["Verzinkt (Feuerverzinkung)"],oberflaechenList:["Verzinkt"],                    laengenMm:[], staerkenMm:[], toleranz:["EN 10346"], beschreibung:"Schmelztauchveredeltes Stahlblech Z275 nach EN 10346. Für Bau, Automobil und Lüftungstechnik." },
      { id:"bl-10", name:"Quarto-Grobblech",              form:"bleche", werkstoffe:["S235JR","S355J2","S460M"],   herstellungsart:["Warmgewalzt"],              oberflaechenList:["Schwarz (warmgewalzt)","Gestrahlt"],laengenMm:[], staerkenMm:[], toleranz:["EN 10029"], beschreibung:"Quarto-Grobblech nach EN 10025 und EN 10029. Stärken 8–300 mm für Sonder- und Anlagenbau." },
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
      { id:"lb-01", name:"Rundlochblech Stahl",          form:"lochbleche", werkstoffe:["S235JR"],                   herstellungsart:["Gestanzt"], oberflaechenList:["Schwarz","Verzinkt"],             laengenMm:[], staerkenMm:[], toleranz:["EN 10140"], beschreibung:"Rundlochblech Stahl nach DIN 24041. Freier Querschnitt bis 77%. Für Filter und Siebe." },
      { id:"lb-02", name:"Rundlochblech Edelstahl",      form:"lochbleche", werkstoffe:["1.4301 (304)"],             herstellungsart:["Gestanzt"], oberflaechenList:["Gebeizt & passiviert","2B"],       laengenMm:[], staerkenMm:[], toleranz:["EN 10140"], beschreibung:"Nichtrostendes Rundlochblech 1.4301 für Lebensmittel-, Chemie- und Pharmaindustrie." },
      { id:"lb-03", name:"Rundlochblech Aluminium",      form:"lochbleche", werkstoffe:["EN AW-1050"],               herstellungsart:["Gestanzt"], oberflaechenList:["Blank","Eloxiert"],               laengenMm:[], staerkenMm:[], toleranz:["EN 10140"], beschreibung:"Aluminium-Rundlochblech EN AW-1050. Leicht, für Lüftungsgitter und Schutzgitter." },
      { id:"lb-04", name:"Vierkantlochblech Stahl",      form:"lochbleche", werkstoffe:["S235JR"],                   herstellungsart:["Gestanzt"], oberflaechenList:["Schwarz","Verzinkt"],             laengenMm:[], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Vierkantlochblech Stahl nach DIN 24041. Hoher freier Querschnitt für maximalen Durchfluss." },
      { id:"lb-05", name:"Vierkantlochblech Edelstahl",  form:"lochbleche", werkstoffe:["1.4301 (304)"],             herstellungsart:["Gestanzt"], oberflaechenList:["Gebeizt & passiviert"],           laengenMm:[], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Edelstahl-Vierkantlochblech für hygienische Anwendungen und Reinraumtechnik." },
      { id:"lb-06", name:"Langlochblech",                form:"lochbleche", werkstoffe:["S235JR","1.4301 (304)"],    herstellungsart:["Gestanzt"], oberflaechenList:["Schwarz","Gebeizt & passiviert"], laengenMm:[], staerkenMm:[], toleranz:["IT16"],     beschreibung:"Langlochblech nach DIN 24041. Für Lüftungen, Siebe und Designverkleidungen." },
      { id:"lb-07", name:"Streckmetall Stahl",           form:"lochbleche", werkstoffe:["S235JR"],                   herstellungsart:["Gewalzt"],  oberflaechenList:["Schwarz","Verzinkt"],             laengenMm:[], staerkenMm:[], toleranz:["DIN 59220"], beschreibung:"Streckmetall (Streckgitter) Stahl nach DIN 59220. Für Bodenroste und Absperrungen." },
      { id:"lb-08", name:"Streckmetall Edelstahl",       form:"lochbleche", werkstoffe:["1.4301 (304)"],             herstellungsart:["Gewalzt"],  oberflaechenList:["Gebeizt & passiviert"],           laengenMm:[], staerkenMm:[], toleranz:["DIN 59220"], beschreibung:"Edelstahl-Streckmetall für Fassaden, Geländer und Dekorationsanwendungen." },
      { id:"lb-09", name:"Streckmetall Aluminium",       form:"lochbleche", werkstoffe:["EN AW-1050","EN AW-3003"],  herstellungsart:["Gewalzt"],  oberflaechenList:["Blank","Eloxiert"],               laengenMm:[], staerkenMm:[], toleranz:["DIN 59220"], beschreibung:"Aluminium-Streckmetall. Leicht für Verkleidungen, Sonnenschutz und Architektur." },
      { id:"lb-10", name:"Lochblech Rauten- / Ziermuster",form:"lochbleche", werkstoffe:["S235JR","1.4301 (304)","EN AW-1050"],herstellungsart:["Gestanzt"],oberflaechenList:["Schwarz","Gebeizt & passiviert","Blank"], laengenMm:[], staerkenMm:[], toleranz:["IT16"], beschreibung:"Dekorative Lochbleche mit Rauten- und Ziermuster. Für Fassaden, Innenausbau und Design." },
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
