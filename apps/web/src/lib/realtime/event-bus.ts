/**
 * EUCX Realtime Event Bus - Redis Streams
 *
 * Producer (Matching Engine, Bids, Clearing) schreibt via XADD.
 * Consumer (SSE Routes, NestJS Gateway) liest via XREAD.
 *
 * Streams:
 *   eucx:rt:session:{sessionId}  - Orderbook-Updates, Deals, Session-Status, neue Bids
 *   eucx:rt:lot:{lotId}          - Lot-Status-Änderungen für Auktions-Stream
 *   eucx:rt:user:{userId}        - Private Events: Order-Fill, Balance-Update
 *
 * Fallback: Wenn Redis nicht konfiguriert → In-Memory-Queue (Dev/Test).
 */
import { Redis } from "@upstash/redis";

// ─── Redis-Singleton ──────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!_redis) _redis = new Redis({ url, token });
  return _redis;
}

// ─── Event-Typen ─────────────────────────────────────────────────────────────

export type EucxEventType =
  | "bid:new"
  | "orderbook:update"
  | "deal:matched"
  | "order:filled"
  | "order:partially_filled"
  | "order:cancelled"
  | "balance:update"
  | "lot:update"
  | "session:status"
  | "price:tick";

export interface EucxEvent {
  type:    EucxEventType;
  ts:      number;
  payload: Record<string, unknown>;
}

export type EucxChannel = "session" | "lot" | "user" | "ticker";

// ─── In-Memory-Fallback (Dev ohne Redis) ──────────────────────────────────────

interface MemEntry { id: string; event: EucxEvent }

const _g = globalThis as typeof globalThis & {
  __eucx_rt_streams?: Map<string, MemEntry[]>;
  __eucx_rt_seq?:     number;
};
if (!_g.__eucx_rt_streams) _g.__eucx_rt_streams = new Map();
if (!_g.__eucx_rt_seq)     _g.__eucx_rt_seq = 0;

function memXadd(key: string, event: EucxEvent): void {
  const seq  = ++(_g.__eucx_rt_seq!);
  const entId = `${Date.now()}-${seq}`;
  const store = _g.__eucx_rt_streams!;
  const arr   = store.get(key) ?? [];
  arr.push({ id: entId, event });
  if (arr.length > 500) arr.splice(0, arr.length - 500);
  store.set(key, arr);
}

function memXread(key: string, lastId: string, count: number): MemEntry[] {
  const arr = _g.__eucx_rt_streams?.get(key) ?? [];
  if (!lastId || lastId === "0") return arr.slice(-count);
  const idx = arr.findIndex((e) => e.id > lastId);
  if (idx === -1) return [];
  return arr.slice(idx, idx + count);
}

// ─── Öffentliche API ─────────────────────────────────────────────────────────

/**
 * Publiziert ein Event in den entsprechenden Redis Stream.
 */
export async function publishEvent(
  channel: EucxChannel,
  id:      string,
  type:    EucxEventType,
  payload: Record<string, unknown>,
): Promise<void> {
  const key: string = `eucx:rt:${channel}:${id}`;
  const event: EucxEvent = { type, ts: Date.now(), payload };
  const serialized = JSON.stringify(event);

  const redis = getRedis();
  if (redis) {
    try {
      await redis.xadd(key, "*", { e: serialized }, {
        trim: { type: "MAXLEN", threshold: 500, comparison: "~" },
      });
    } catch (err) {
      console.error("[event-bus] XADD error:", err);
      memXadd(key, event);
    }
    return;
  }
  memXadd(key, event);
}

// ─── Event-Einträge ───────────────────────────────────────────────────────────

export interface EventEntry {
  id:    string;
  event: EucxEvent;
}

/**
 * Liest neue Events aus einem Stream.
 * @param lastId  "$" oder letzter Entry-ID - neue Events ab dieser Position
 */
export async function readEvents(
  channel: EucxChannel,
  id:      string,
  lastId:  string,
  count:   number = 50,
): Promise<EventEntry[]> {
  const key = `eucx:rt:${channel}:${id}`;

  // Initialer Connect ("0") → Stream-Tail als Startposition, damit kein History-Flood
  // Reconnect (echter Entry-ID) → ab dieser Position weiterlesen
  const readId = (!lastId || lastId === "0") ? `${Date.now()}-0` : lastId;

  const redis = getRedis();
  if (redis) {
    try {
      // xread(key: string[], id: string[], options?)
      const raw = await redis.xread([key], [readId], { count });

      if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

      // Upstash xread gibt [[streamKey, messages[]], ...] oder [{key, messages},...] zurück
      // Defensives Parsing beider Formate
      return parseXreadResult(raw);
    } catch (err) {
      console.error("[event-bus] XREAD error:", err);
      return [];
    }
  }

  return memXread(key, lastId === "$" ? "" : lastId, count).map((e) => ({
    id:    e.id,
    event: e.event,
  }));
}

/**
 * Parst XREAD-Ergebnis defensiv (Upstash gibt je nach Version unterschiedliche Formate zurück).
 */
function parseXreadResult(raw: unknown[]): EventEntry[] {
  const entries: EventEntry[] = [];

  for (const streamResult of raw) {
    let messages: unknown[] = [];

    if (Array.isArray(streamResult) && streamResult.length === 2) {
      // Format: [streamKey, [[id, fields], ...]]
      const msgs = streamResult[1];
      if (Array.isArray(msgs)) messages = msgs;
    } else if (streamResult && typeof streamResult === "object") {
      // Format: { key: string, messages: [{id, message},...] }
      const sr = streamResult as Record<string, unknown>;
      if (Array.isArray(sr["messages"])) messages = sr["messages"] as unknown[];
    }

    for (const msg of messages) {
      try {
        let entryId: string | undefined;
        let fields: Record<string, unknown> = {};

        if (Array.isArray(msg) && msg.length === 2) {
          // Format: [entryId, [field, value, ...] or {field: value}]
          entryId = String(msg[0]);
          const rawFields = msg[1];
          if (Array.isArray(rawFields)) {
            for (let i = 0; i < rawFields.length - 1; i += 2) {
              fields[String(rawFields[i])] = rawFields[i + 1];
            }
          } else if (rawFields && typeof rawFields === "object") {
            fields = rawFields as Record<string, unknown>;
          }
        } else if (msg && typeof msg === "object") {
          // Format: { id: string, message: { e: string } }
          const m = msg as Record<string, unknown>;
          entryId = String(m["id"]);
          const msgFields = m["message"];
          if (msgFields && typeof msgFields === "object") {
            fields = msgFields as Record<string, unknown>;
          }
        }

        if (!entryId) continue;

        const rawJson = fields["e"];
        if (typeof rawJson !== "string") continue;

        const event = JSON.parse(rawJson) as EucxEvent;
        entries.push({ id: entryId, event });
      } catch {
        // malformed entry - skip
      }
    }
  }

  return entries;
}

/**
 * Gibt den aktuellsten Entry-ID des Streams zurück.
 */
export async function getStreamHead(
  channel: EucxChannel,
  id:      string,
): Promise<string> {
  const key = `eucx:rt:${channel}:${id}`;
  const redis = getRedis();

  if (redis) {
    try {
      // xrevrange returns Record<entryId, fields>
      const result = await redis.xrevrange<{ e: string }>(key, "+", "-", 1);
      const ids = Object.keys(result ?? {});
      if (ids.length > 0) return ids[0]!;
    } catch {
      // ignore
    }
  }

  return `${Date.now()}-0`;
}
