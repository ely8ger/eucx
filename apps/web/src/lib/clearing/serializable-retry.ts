/**
 * Wiederholt eine Serializable-Transaktion bei P2034 (Serialization Failure).
 *
 * Postgres bricht bei Konflikten zwischen Serializable-Transaktionen eine davon
 * mit P2034 ab — der Aufrufer muss dann die gesamte Transaktion wiederholen.
 * Ohne Retry würde jeder Konflikt als 500-Fehler beim Client ankommen.
 *
 * Strategie: max. 3 Versuche, exponentielles Backoff (50 → 100 → 200 ms).
 */

export async function withSerializableRetry<T>(
  fn:         () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== "P2034" || attempt === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 50 * 2 ** attempt));
    }
  }
  // TypeScript: Schleife endet immer via return oder throw
  throw new Error("unreachable");
}
