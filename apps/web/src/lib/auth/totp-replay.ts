/**
 * TOTP Replay-Schutz
 *
 * Verhindert, dass ein abgefangener TOTP-Code innerhalb seiner 30-Sekunden-Gültigkeitsdauer
 * mehrfach verwendet werden kann. Ein erfolgreicher Code wird für 90 Sekunden gesperrt
 * (2,5 × Gültigkeitsdauer, um Toleranz-Window zuverlässig zu schließen).
 *
 * Implementierung: Redis SETNX mit TTL.
 * Ohne Redis (Dev): In-Memory-Fallback wenn ENABLE_MEMORY_RATE_LIMIT=true.
 */
import { Redis } from "@upstash/redis";

const REPLAY_TTL_SECONDS = 90;

// ─── Redis-Instanz (lazy) ─────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!_redis) _redis = new Redis({ url, token });
  return _redis;
}

// ─── In-Memory-Fallback ───────────────────────────────────────────────────────

const _usedCodes = new Map<string, number>(); // key → expiresAt (Unix-ms)

function inMemoryCheck(key: string): boolean {
  const exp = _usedCodes.get(key);
  return exp !== undefined && exp > Date.now();
}

function inMemoryMark(key: string): void {
  _usedCodes.set(key, Date.now() + REPLAY_TTL_SECONDS * 1000);
}

// ─── Öffentliche API ──────────────────────────────────────────────────────────

/**
 * Prüft ob ein TOTP-Code für diesen User bereits verwendet wurde.
 * @returns true = Code wurde bereits verwendet (replay-Angriff)
 */
export async function isTotpCodeUsed(userId: string, code: string): Promise<boolean> {
  const key    = `eucx:totp:used:${userId}:${code}`;
  const redis  = getRedis();

  if (redis) {
    const exists = await redis.exists(key);
    return exists === 1;
  }

  if (process.env.ENABLE_MEMORY_RATE_LIMIT === "true") {
    return inMemoryCheck(key);
  }

  return false;
}

/**
 * Markiert einen TOTP-Code als verwendet.
 * Muss NACH erfolgreicher Validierung und VOR der Session-Ausgabe aufgerufen werden.
 */
export async function markTotpCodeUsed(userId: string, code: string): Promise<void> {
  const key   = `eucx:totp:used:${userId}:${code}`;
  const redis = getRedis();

  if (redis) {
    await redis.set(key, "1", { ex: REPLAY_TTL_SECONDS });
    return;
  }

  if (process.env.ENABLE_MEMORY_RATE_LIMIT === "true") {
    inMemoryMark(key);
  }
}
