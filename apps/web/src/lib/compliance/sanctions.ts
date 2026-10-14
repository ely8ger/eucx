/**
 * Sanktionsscreening — EU/OFAC/UN Embargo-Länder
 *
 * Quellen:
 *   - EU-Sanktionsverordnungen (VO 833/2014, VO 765/2006, VO 267/2012, etc.)
 *   - OFAC SDN / Country-Based Sanctions
 *   - UN Security Council Resolutions
 *
 * Zwei Stufen:
 *   EMBARGOED  — Registrierung blockiert (vollständige Handelssanktionen)
 *   FATF_GREY  — Registrierung erlaubt, aber +30 Risikopunkte (erhöhte Sorgfalt)
 *
 * Stand: 2025 — muss bei Änderungen der EU/OFAC-Listen aktualisiert werden.
 */

// Vollständig sanktionierte / embargierte Länder (ISO 3166-1 alpha-2)
// Registrierung wird blockiert.
export const EMBARGOED_COUNTRIES: ReadonlySet<string> = new Set([
  "RU", // Russland — VO (EU) 833/2014, umfassende Sanktionen
  "BY", // Belarus — VO (EU) 765/2006
  "IR", // Iran — VO (EU) 267/2012, OFAC ITSR
  "KP", // Nordkorea — VO (EU) 765/2006, UN SCR 1718
  "SY", // Syrien — VO (EU) 36/2012
  "CU", // Kuba — OFAC CACR
  "SD", // Sudan — OFAC SDN, VO (EU) 131/2004
  "SO", // Somalia — UN Waffenembargo, OFAC
  "LY", // Libyen — VO (EU) 204/2011
  "MM", // Myanmar/Burma — VO (EU) 401/2013
  "CF", // Zentralafrikanische Republik — VO (EU) 224/2014
  "SS", // Südsudan — VO (EU) 2015/735
  "CD", // DR Kongo — Waffenembargo UN SCR 1533
  "ML", // Mali — VO (EU) 2017/1770
  "NI", // Nicaragua — OFAC NICA, EU-Sanktionen
  "ZW", // Simbabwe — VO (EU) 314/2004
  "HT", // Haiti — UN SCR 2653 (2022)
  "VE", // Venezuela — OFAC Exec. Order 13884
]);

// FATF Grey-Liste (erhöhte Geldwäsche-Risiken, Stand 2024)
// Erlaubt, aber Risk-Score +30.
export const FATF_GREYLIST: ReadonlySet<string> = new Set([
  "BF", // Burkina Faso
  "CM", // Kamerun
  "CG", // Kongo (Brazzaville)
  "HT", // Haiti (auch embargiert)
  "JM", // Jamaika
  "KE", // Kenia
  "MG", // Madagaskar
  "ML", // Mali (auch embargiert)
  "MZ", // Mosambik
  "NA", // Namibia
  "NG", // Nigeria
  "PH", // Philippinen
  "SN", // Senegal
  "TZ", // Tansania
  "VN", // Vietnam
  "YE", // Jemen
]);

export type SanctionResult =
  | { blocked: false; fatfGrey: boolean }
  | { blocked: true; reason: string };

export function checkSanctions(country: string): SanctionResult {
  const code = country.toUpperCase().trim();

  if (EMBARGOED_COUNTRIES.has(code)) {
    return {
      blocked: true,
      reason:  `Registrierungen aus ${code} sind aufgrund internationaler Sanktionen (EU/OFAC/UN) nicht möglich.`,
    };
  }

  return {
    blocked:  false,
    fatfGrey: FATF_GREYLIST.has(code),
  };
}
