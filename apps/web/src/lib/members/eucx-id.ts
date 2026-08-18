/**
 * EUCX Member-ID Generator
 * Format: EUCX-[LAND]-[ROLLE][JJ]-[LFDNR]-[PRÜFZIFFER]
 * Beispiel: EUCX-DE-S26-0042-7
 *
 * Prüfziffer nach Luhn-Algorithmus (ISO 7812) über die 4-stellige Sequenznummer.
 */

function luhnCheck(seq: number): number {
  const digits = seq.toString().padStart(4, "0").split("").map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[digits.length - 1 - i]!;
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

function roleCode(role: string): string {
  switch (role) {
    case "BUYER":       return "B";
    case "SELLER":      return "S";
    case "BROKER":      return "R";
    case "ADMIN":
    case "SUPER_ADMIN": return "A";
    default:            return "X";
  }
}

export function generateEucxMemberId(country: string, role: string, seq: number): string {
  const code   = roleCode(role);
  const year   = new Date().getFullYear().toString().slice(2);
  const padded = seq.toString().padStart(4, "0");
  const check  = luhnCheck(seq);
  return `EUCX-${country.toUpperCase()}-${code}${year}-${padded}-${check}`;
}

/** Extrahiert die 4-stellige Sequenznummer aus einer EUCX-ID für anonyme Anzeige */
export function seqFromEucxId(memberId: string): string {
  const parts = memberId.split("-");
  return parts[3] ?? "????";
}
