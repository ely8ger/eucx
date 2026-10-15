/**
 * EUCX VIES-Integration (EU-Kommission REST-API)
 *
 * Validiert EU-USt-IdNrn. über die offizielle EU-Kommissions-API.
 * Kein API-Schlüssel nötig, öffentlich zugänglich.
 *
 * API: https://ec.europa.eu/taxation_customs/vies/rest-api/ms/{country}/vat/{number}
 * Docs: https://ec.europa.eu/taxation_customs/vies/#/technical-information
 *
 * Graceful Degradation: bei Timeout / API-Fehler wird die Anfrage
 * nicht blockiert — nur echte "INVALID"-Antworten blockieren.
 */

export interface ViesResult {
  valid:        boolean;
  companyName?: string;
  address?:     string;
  /** true wenn VIES-API nicht erreichbar war — kein Fehler, nur ungeprüft */
  unchecked?:   boolean;
}

const VIES_BASE =
  "https://ec.europa.eu/taxation_customs/vies/rest-api/ms";

// EU-Mitgliedsstaaten ISO-2-Codes
const EU_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI",
  "FR","GR","HR","HU","IE","IT","LT","LU","LV","MT",
  "NL","PL","PT","RO","SE","SI","SK",
]);

/**
 * Prüft eine USt-IdNr. gegen VIES.
 *
 * @param country ISO-2-Ländercode (z.B. "DE")
 * @param vatNumber Reine Zahlenkette ohne Länderpräfix (z.B. "811228810")
 */
export async function checkVatId(
  country:   string,
  vatNumber: string,
): Promise<ViesResult> {
  const cc = country.toUpperCase();

  // Nicht-EU-Länder: kein VIES
  if (!EU_COUNTRIES.has(cc)) {
    return { valid: true, unchecked: true };
  }

  // Präfix entfernen falls mitgegeben (z.B. "DE811228810" → "811228810")
  const normalized = vatNumber.toUpperCase().replace(cc, "").replace(/\s/g, "");

  const url = `${VIES_BASE}/${cc}/vat/${encodeURIComponent(normalized)}`;

  try {
    const res = await fetch(url, {
      signal:  AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      // VIES gibt 404 bei ungültiger Nr. zurück
      if (res.status === 404) {
        return { valid: false };
      }
      // Andere Fehler → ungeprüft (API-Problem)
      return { valid: true, unchecked: true };
    }

    const data = await res.json() as {
      isValid:     boolean;
      name?:       string;
      address?:    string;
      requestDate: string;
    };

    return {
      valid:       data.isValid,
      companyName: data.name    ?? undefined,
      address:     data.address ?? undefined,
    };
  } catch {
    // Timeout, Netzfehler → ungeprüft, Registrierung nicht blockieren
    return { valid: true, unchecked: true };
  }
}
