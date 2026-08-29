/**
 * Rate Limiter — Upstash Redis (Sliding Window) mit In-Memory-Fallback
 *
 * Priorität:
 *   1. Upstash Redis   — wenn UPSTASH_REDIS_REST_URL + TOKEN gesetzt sind (Production)
 *   2. In-Memory       — wenn ENABLE_MEMORY_RATE_LIMIT=true (Dev/Test ohne Redis)
 *   3. Deaktiviert     — wenn beides fehlt (z.B. lokale Entwicklung ohne Konfiguration)
 *
 * .env.local für lokalen Betrieb mit aktivem Schutz:
 *   ENABLE_MEMORY_RATE_LIMIT=true
 *
 * .env.local für Production:
 *   UPSTASH_REDIS_REST_URL=https://...
 *   UPSTASH_REDIS_REST_TOKEN=...
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";

// ─── Limiter-Definitionen ─────────────────────────────────────────────────────

export type LimitBucket = "auth" | "bid" | "api";

interface LimitConfig {
  requests:      number;
  windowSeconds: number;
}

const LIMITS: Record<LimitBucket, LimitConfig> = {
  auth: { requests: 5,   windowSeconds: 60  }, // Login / Register: 5/min
  bid:  { requests: 20,  windowSeconds: 60  }, // Gebote: 20/min
  api:  { requests: 120, windowSeconds: 60  }, // Allgemeine API: 120/min
};

// ─── In-Memory-Fallback (sliding window, server-lokal) ────────────────────────
//
// Achtung: Reset bei Server-Neustart. Nicht für Multi-Instance-Deployments geeignet
// (dort immer Upstash verwenden). Ausreichend für Dev/Test und Single-Instance-Staging.

interface MemoryEntry {
  timestamps: number[]; // Sliding-Window: Unix-ms jedes Requests
}

const _memoryStore = new Map<string, MemoryEntry>();

function checkInMemory(
  key:           string,
  bucket:        LimitBucket,
): RateLimitResult {
  const { requests, windowSeconds } = LIMITS[bucket];
  const windowMs = windowSeconds * 1000;
  const now      = Date.now();
  const cutoff   = now - windowMs;

  const entry = _memoryStore.get(key) ?? { timestamps: [] };

  // Alte Timestamps außerhalb des Fensters entfernen (Sliding Window)
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const count   = entry.timestamps.length;
  const allowed = count < requests;

  if (allowed) {
    entry.timestamps.push(now);
    _memoryStore.set(key, entry);
  }

  const oldest  = entry.timestamps[0] ?? now;
  const resetAt = Math.ceil((oldest + windowMs) / 1000);

  return {
    allowed,
    remaining: Math.max(0, requests - entry.timestamps.length),
    reset:     resetAt,
  };
}

/** Für Tests: Alle In-Memory-Einträge löschen */
export function resetMemoryStore(): void {
  _memoryStore.clear();
}

// ─── Upstash-Redis ────────────────────────────────────────────────────────────

let _warnedOnce = false;
const _upstashLimiters = new Map<LimitBucket, Ratelimit>();

function getUpstashLimiter(bucket: LimitBucket): Ratelimit | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!_upstashLimiters.has(bucket)) {
    const cfg = LIMITS[bucket];
    _upstashLimiters.set(
      bucket,
      new Ratelimit({
        redis:     new Redis({ url, token }),
        limiter:   Ratelimit.slidingWindow(cfg.requests, `${cfg.windowSeconds} s`),
        prefix:    `eucx:rl:${bucket}`,
        analytics: false,
      })
    );
  }
  return _upstashLimiters.get(bucket)!;
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  reset:     number; // Unix-Timestamp (Sekunden)
}

export async function checkRateLimit(
  ip:     string,
  bucket: LimitBucket,
): Promise<RateLimitResult> {
  // 1. Upstash Redis (Production-Pfad)
  const upstash = getUpstashLimiter(bucket);
  if (upstash) {
    const r = await upstash.limit(ip);
    return { allowed: r.success, remaining: r.remaining, reset: Math.ceil(r.reset / 1000) };
  }

  // 2. In-Memory-Fallback (Dev/Staging mit ENABLE_MEMORY_RATE_LIMIT=true)
  if (process.env.ENABLE_MEMORY_RATE_LIMIT === "true") {
    return checkInMemory(ip, bucket);
  }

  // 3. Deaktiviert
  if (!_warnedOnce) {
    console.warn("[RateLimit] Weder Upstash noch ENABLE_MEMORY_RATE_LIMIT gesetzt — Rate Limiting deaktiviert.");
    _warnedOnce = true;
  }
  return { allowed: true, remaining: 999, reset: 0 };
}

// ─── Response-Helper ─────────────────────────────────────────────────────────

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset":     String(result.reset),
  };
}
