/**
 * OpenSanctions Entity-Matching API
 *
 * Prüft Firmennamen und Länder gegen die OpenSanctions-Datenbank (OFAC SDN,
 * EU-Konsolidierte-Liste, UN-Sanktionen, etc.).
 *
 * API: https://api.opensanctions.org/match/default
 * Docs: https://www.opensanctions.org/docs/api/
 *
 * Graceful Degradation:
 * - Wenn OPENSANCTIONS_API_KEY nicht gesetzt → kein Check (kein Fehler)
 * - Bei Timeout / API-Fehler → unchecked (kein Block)
 * - Nur klare Treffer (score >= 0.8) blockieren
 *
 * Kosten: ~$0.10 / 1000 Abfragen (Pay-as-you-go).
 * Aktivierung: OPENSANCTIONS_API_KEY in Vercel Environment Variables setzen.
 */

export interface SanctionsMatchResult {
  hit:       boolean;
  score:     number;
  entity?:   string;
  dataset?:  string;
  /** true wenn API nicht erreichbar oder kein API-Key */
  unchecked?: boolean;
}

const OPENSANCTIONS_BASE = "https://api.opensanctions.org";
const HIT_THRESHOLD = 0.8;

/**
 * Prüft einen Firmennamen + Land gegen OpenSanctions.
 *
 * @param name    Firmenname (z.B. "EUCX GmbH")
 * @param country ISO 3166-1 alpha-2 Ländercode (z.B. "DE")
 */
export async function checkOpenSanctions(
  name:    string,
  country: string,
): Promise<SanctionsMatchResult> {
  const apiKey = process.env.OPENSANCTIONS_API_KEY;

  if (!apiKey) {
    return { hit: false, score: 0, unchecked: true };
  }

  try {
    const res = await fetch(`${OPENSANCTIONS_BASE}/match/default`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `ApiKey ${apiKey}`,
      },
      body: JSON.stringify({
        queries: {
          q: {
            schema: "Organization",
            properties: {
              name:    [name],
              country: [country.toLowerCase()],
            },
          },
        },
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { hit: false, score: 0, unchecked: true };
    }

    const data = await res.json() as {
      responses: {
        q: {
          results: Array<{
            id:       string;
            caption:  string;
            score:    number;
            datasets: string[];
          }>;
        };
      };
    };

    const results = data.responses?.q?.results ?? [];
    if (results.length === 0) {
      return { hit: false, score: 0 };
    }

    const top = results[0]!;
    const hit = top.score >= HIT_THRESHOLD;

    return {
      hit,
      score:   top.score,
      entity:  hit ? top.caption  : undefined,
      dataset: hit ? top.datasets[0] : undefined,
    };
  } catch {
    return { hit: false, score: 0, unchecked: true };
  }
}
