/**
 * JTI-Blacklist — Access-Token-Revokation
 *
 * Wenn ein Nutzer sich ausloggt oder ein Admin einen Account sperrt, wird der JTI
 * (JWT ID) des aktuellen Access-Tokens in diese Blacklist eingetragen.
 * Die Middleware prüft bei jeder Anfrage, ob der JTI gesperrt ist.
 *
 * Backends:
 *   Production  — Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 *   Dev / Test  — In-Memory Map (kein Redis erforderlich)
 *
 * TTL: wird auf die verbleibende Lebensdauer des Tokens gesetzt (max. 15 Minuten).
 * Nach Ablauf der TTL gilt das Token ohnehin als abgelaufen → kein Speicherleck.
 */
import { Redis } from "@upstash/redis";

const KEY_PREFIX = "eucx:bl:jti:";

// ─── In-Memory-Fallback ───────────────────────────────────────────────────────
// Nutzt globalThis damit Edge Runtime (middleware) und Node.js (API-Routes)
// in Next.js Dev dieselbe Map-Instanz referenzieren. In Prod wird Redis verwendet.

const _g = globalThis as typeof globalThis & { __eucx_jti_bl?: Map<string, number> };
if (!_g.__eucx_jti_bl) _g.__eucx_jti_bl = new Map<string, number>();
const _store = _g.__eucx_jti_bl; // jti → expiresAtMs

function _cleanMemory() {
  const now = Date.now();
  for (const [k, exp] of _store) {
    if (exp < now) _store.delete(k);
  }
}

// ─── Redis-Singleton ──────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!_redis) _redis = new Redis({ url, token });
  return _redis;
}

// ─── Öffentliche API ─────────────────────────────────────────────────────────

/**
 * JTI in die Blacklist eintragen.
 * @param jti        JWT ID aus dem Token-Payload
 * @param expiresAt  Ablaufzeitpunkt des Tokens (ms seit Epoch)
 */
export async function blacklistJti(jti: string, expiresAt: number): Promise<void> {
  const redis = getRedis();
  if (redis) {
    const ttlSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
    await redis.setex(`${KEY_PREFIX}${jti}`, ttlSeconds, "1");
    return;
  }
  _store.set(jti, expiresAt);
  _cleanMemory();
}

/**
 * Prüft, ob ein JTI auf der Blacklist steht.
 * Gibt true zurück wenn gesperrt, false wenn gültig.
 */
export async function isJtiBlacklisted(jti: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const val = await redis.get(`${KEY_PREFIX}${jti}`);
    return val === "1";
  }
  const exp = _store.get(jti);
  if (!exp) return false;
  if (exp < Date.now()) {
    _store.delete(jti);
    return false;
  }
  return true;
}

/**
 * JTI-Check für Edge-Runtime (middleware).
 *
 * In Prod (Redis verfügbar): direkt gegen Redis.
 * In Dev (kein Redis): ruft internen Node.js-Endpunkt /api/test/jti-check auf,
 * der auf denselben In-Memory-Store zugreift wie die Logout-Route.
 */
export async function isJtiBlacklistedEdge(jti: string, origin: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const val = await redis.get(`${KEY_PREFIX}${jti}`);
    return val === "1";
  }
  // Dev-Fallback: interner HTTP-Aufruf zum Node.js-Store
  try {
    const res = await fetch(`${origin}/api/test/jti-check?jti=${encodeURIComponent(jti)}`, {
      signal: AbortSignal.timeout(500),
    });
    if (!res.ok) return false;
    const data = await res.json() as { blacklisted?: boolean };
    return data.blacklisted === true;
  } catch {
    return false; // fail-open: Token bleibt im Zweifel gültig
  }
}
