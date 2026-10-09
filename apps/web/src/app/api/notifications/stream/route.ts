/**
 * GET /api/notifications/stream
 *
 * Private Server-Sent Events - User-spezifische Echtzeit-Events.
 *
 * Auth: HttpOnly Cookie (same-origin SSE sendet Cookies automatisch).
 *   Bearer-Header als Fallback für programmatischen Zugriff.
 *   Kein ?token= Query-Parameter — Tokens in URLs landen in Server-Logs.
 *
 * Events:
 *   event: order_filled          - Auftrag vollständig ausgeführt
 *   event: order_partially_filled - Teilausführung
 *   event: order_cancelled       - Stornierung
 *   event: balance_updated       - Kontostand nach Settlement geändert
 *   event: deal_matched          - Privater Abschluss
 *
 * Strategie:
 *   100ms Redis XREAD-Poll auf eucx:rt:user:{userId}
 *   Sofortiger Push bei Event, Last-Event-ID für verlustfreien Reconnect.
 *
 * Fallback (ohne Redis): leerer Stream mit Heartbeats (kein Fehler, aber keine Events).
 */
import { NextRequest }          from "next/server";
import { verifyAccessToken }     from "@/lib/auth/jwt";
import { readEvents }            from "@/lib/realtime/event-bus";
import { COOKIE_ACCESS_TOKEN }   from "@/lib/auth/cookie-names";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REDIS_POLL_MS = 100;
const HEARTBEAT_MS  = 25_000;

// Mapping event-bus Typen → SSE event names
const EVENT_NAME_MAP: Record<string, string> = {
  "order:filled":           "order_filled",
  "order:partially_filled": "order_partially_filled",
  "order:cancelled":        "order_cancelled",
  "balance:update":         "balance_updated",
  "deal:matched":           "deal_matched",
};

export async function GET(req: NextRequest) {
  // Auth: Cookie first (same-origin Browser sendet HttpOnly Cookies automatisch bei SSE),
  // Bearer-Header als Fallback für programmatischen Zugriff.
  // Kein ?token= URL-Parameter — Token in URLs landen in Server-Logs.
  const cookieToken = req.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
  const authHeader  = req.headers.get("authorization");
  const rawToken    = cookieToken ?? (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (!rawToken) {
    return new Response("Nicht autorisiert", { status: 401 });
  }

  let tokenPayload;
  try { tokenPayload = await verifyAccessToken(rawToken); }
  catch { return new Response("Token ungültig", { status: 401 }); }

  const userId      = tokenPayload.userId;
  // last-event-id Header (Browser-native Reconnect) oder Query-Param (manueller Reconnect)
  const lastEventId =
    req.headers.get("last-event-id") ??
    req.nextUrl.searchParams.get("lastEventId") ??
    "0";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let lastId = lastEventId;

      const send = (eventName: string, data: unknown, id?: string) => {
        if (closed) return;
        try {
          const idLine = id ? `id: ${id}\n` : "";
          controller.enqueue(
            encoder.encode(`${idLine}event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch { closed = true; }
      };

      const sendRaw = (raw: string) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(raw)); }
        catch { closed = true; }
      };

      // Verbindungsbestätigung
      send("connected", { userId, ts: Date.now() });

      // Heartbeat
      let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
      const scheduleHeartbeat = () => {
        heartbeatTimer && clearTimeout(heartbeatTimer);
        heartbeatTimer = setTimeout(() => {
          if (!closed) { sendRaw(": ping\n\n"); scheduleHeartbeat(); }
        }, HEARTBEAT_MS);
      };
      scheduleHeartbeat();

      req.signal.addEventListener("abort", () => {
        closed = true;
        heartbeatTimer && clearTimeout(heartbeatTimer);
        try { controller.close(); } catch { /* already closed */ }
      });

      // ── Poll-Loop ──────────────────────────────────────────────────────
      while (!closed) {
        await sleep(REDIS_POLL_MS);
        if (closed) break;

        const entries = await readEvents("user", userId, lastId);
        if (closed) break;
        if (entries.length === 0) continue;

        const lastEntry = entries[entries.length - 1];
        if (lastEntry) lastId = lastEntry.id;

        for (const entry of entries) {
          const sseEventName = EVENT_NAME_MAP[entry.event.type];
          if (sseEventName) {
            send(sseEventName, entry.event.payload, entry.id);
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
