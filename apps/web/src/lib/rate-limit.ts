/**
 * Rate Limiter — Upstash Redis (Sliding Window)
 *
 * Limits per IP-Adresse. Graceful Degradation: wenn kein Redis konfiguriert
 * ist (UPSTASH_REDIS_REST_URL fehlt), wird kein Limit angewendet.
 *
 * Konfiguration in .env.local:
 *   UPSTASH_REDIS_REST_URL=https://...
 *   UPSTASH_REDIS_REST_TOKEN=...
 *
 * Ohne diese Variablen: Rate Limiting deaktiviert (Warn-Log beim ersten Aufruf).
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";

let _warnedOnce = false;

function getRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!_warnedOnce) {
      console.warn("[RateLimit] UPSTASH_REDIS_REST_URL nicht gesetzt — Rate Limiting deaktiviert.");
      _warnedOnce = true;
    }
    return null;
  }
  return new Redis({ url, token });
}

// ─── Limiter-Definitionen ─────────────────────────────────────────────────────

export type LimitBucket = "auth" | "bid" | "api";

interface LimitConfig {
  requests: number;
  windowSeconds: number;
}

const LIMITS: Record<LimitBucket, LimitConfig> = {
  auth: { requests: 5,   windowSeconds: 60  },  // Login / Register: 5/min
  bid:  { requests: 20,  windowSeconds: 60  },  // Gebote: 20/min (Auktions-Speed)
  api:  { requests: 120, windowSeconds: 60  },  // Allgemeine API: 120/min
};

// Limiter-Instanzen (lazy, einmalig pro Bucket)
const _limiters = new Map<LimitBucket, Ratelimit>();

function getLimiter(bucket: LimitBucket): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (!_limiters.has(bucket)) {
    const cfg = LIMITS[bucket];
    _limiters.set(
      bucket,
      new Ratelimit({
        redis,
        limiter:  Ratelimit.slidingWindow(cfg.requests, `${cfg.windowSeconds} s`),
        prefix:   `eucx:rl:${bucket}`,
        analytics: false,
      })
    );
  }
  return _limiters.get(bucket)!;
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  reset:     number;   // Unix-Timestamp (Sekunden) wann Limit zurückgesetzt wird
}

export async function checkRateLimit(
  ip:     string,
  bucket: LimitBucket,
): Promise<RateLimitResult> {
  const limiter = getLimiter(bucket);

  // Kein Redis → immer erlauben
  if (!limiter) return { allowed: true, remaining: 999, reset: 0 };

  const key    = `${ip}`;
  const result = await limiter.limit(key);

  return {
    allowed:   result.success,
    remaining: result.remaining,
    reset:     Math.ceil(result.reset / 1000),  // Ms → Sekunden
  };
}

// ─── Response-Helper ─────────────────────────────────────────────────────────

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset":     String(result.reset),
  };
}
