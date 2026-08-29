/**
 * HaveIBeenPwned — k-Anonymity Passwort-Prüfung
 *
 * Prüft ob ein Passwort in bekannten Datenlecks vorkommt.
 * Verwendet die k-Anonymity-API: nur die ersten 5 Zeichen des SHA-1-Hashes
 * werden gesendet — das vollständige Passwort verlässt niemals den Server.
 *
 * Verhalten bei API-Ausfall: fail open (kein Block) — Registrierung darf nicht
 * an einem externen Dienst hängen. Timeout: 3 Sekunden.
 */
import { createHash } from "crypto";

export async function isPwnedPassword(password: string): Promise<boolean> {
  const sha1   = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal:  AbortSignal.timeout(3_000),
    });

    if (!res.ok) return false; // Fail open bei API-Fehler

    const text = await res.text();
    return text.split("\r\n").some((line) => line.split(":")[0] === suffix);
  } catch {
    return false; // Timeout oder Netzwerkfehler → fail open
  }
}
