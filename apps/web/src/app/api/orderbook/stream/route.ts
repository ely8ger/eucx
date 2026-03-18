/**
 * GET /api/orderbook/stream?sessionId=<uuid>
 *
 * Skill #1: Real-Time Messaging - Server-Sent Events (SSE).
 * Vercel-kompatibel (kein persistent WebSocket nötig).
 * Sendet alle 1,5s ein "orderbook"-Event mit frischen Daten.
 * Target-Latenz: < 50ms nach DB-Abfrage.
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
// Edge Runtime für minimale Latenz
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper: send SSE message
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      // Send initial heartbeat immediately
      send("connected", { ts: Date.now() });

      // If no session, just ping every 5s
      if (!sessionId) {
        const interval = setInterval(() => send("ping", { ts: Date.now() }), 5000);
        req.signal.addEventListener("abort", () => clearInterval(interval));
        return;
      }

      const fetch = async () => {
        try {
          const [asks, bids, deals] = await Promise.all([
            db.order.findMany({
              where: { sessionId, direction: "SELL", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
              orderBy: { pricePerUnit: "asc" },
              take: 10,
              include: { organization: { select: { name: true, country: true } } },
            }),
            db.order.findMany({
              where: { sessionId, direction: "BUY", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
              orderBy: { pricePerUnit: "desc" },
              take: 10,
              include: { organization: { select: { name: true, country: true } } },
            }),
            db.deal.findMany({
              where: { sessionId, status: { in: ["MATCHED", "CONFIRMED"] } },
              orderBy: { createdAt: "desc" },
              take: 20,
              include: { sellOrder: { select: { direction: true } } },
            }),
          ]);

          const s = (o: typeof asks[0]) => ({
            id:        o.id,
            price:     o.pricePerUnit.toString(),
            qty:       o.quantity.toString(),
            remaining: o.quantity.minus(o.filledQuantity).toString(),
            org:       o.organization.name,
            country:   o.organization.country,
          });

          send("orderbook", {
            ts:    Date.now(),
            asks:  asks.map(s),
            bids:  bids.map(s),
            deals: deals.map((d) => ({
              id:        d.id,
              price:     d.pricePerUnit.toString(),
              qty:       d.quantity.toString(),
              currency:  d.currency,
              direction: d.sellOrder.direction,
              time:      d.createdAt.toISOString(),
            })),
          });
        } catch (err) {
          send("error", { message: "DB-Fehler" });
          console.error("[SSE orderbook]", err);
        }
      };

      // Initial fetch immediately
      await fetch();

      // Poll every 1500ms
      const interval = setInterval(fetch, 1500);
      req.signal.addEventListener("abort", () => clearInterval(interval));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
