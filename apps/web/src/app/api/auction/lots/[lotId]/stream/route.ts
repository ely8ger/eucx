/**
 * GET /api/auction/lots/[lotId]/stream
 *
 * Server-Sent Events (SSE) — schickt alle 2 Sekunden den aktuellen
 * Lot-Status an verbundene Clients. Kein WebSocket-Server nötig.
 *
 * Payload: { phase, currentBest, auctionEnd, bidCount, updatedAt }
 *
 * Auth: Bearer im URL-Parameter ?token=... (SSE kann keine Header senden)
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 2000;

export async function GET(
  req: NextRequest,
  { params }: { params: { lotId: string } }
) {
  // Auth via URL-Parameter (SSE-Limitation — kein Authorization-Header möglich)
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new Response("Nicht autorisiert", { status: 401 });
  }
  try {
    await verifyAccessToken(token);
  } catch {
    return new Response("Token ungültig", { status: 401 });
  }

  const { lotId } = params;

  // SSE-Stream aufbauen
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Sofort ersten State senden
      await sendLotState(lotId, send);

      // Polling-Loop
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        await sendLotState(lotId, send);
      }, POLL_INTERVAL_MS);

      // Cleanup wenn Client trennt
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
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

async function sendLotState(lotId: string, send: (data: unknown) => void) {
  try {
    const lot = await db.lot.findUnique({
      where:  { id: lotId },
      select: {
        phase:       true,
        currentBest: true,
        auctionEnd:  true,
        updatedAt:   true,
        _count: { select: { bids: true, registrations: true } },
      },
    });

    if (!lot) {
      send({ error: "Lot nicht gefunden" });
      return;
    }

    // Anzahl eindeutiger aktiver Bieter (Verkäufer die min. 1 Gebot abgegeben haben)
    const activeBidders = await db.bid.groupBy({
      by:    ["sellerId"],
      where: { lotId },
    });

    send({
      phase:              lot.phase,
      currentBest:        lot.currentBest?.toString() ?? null,
      auctionEnd:         lot.auctionEnd?.toISOString() ?? null,
      bidCount:           lot._count.bids,
      registrationCount:  lot._count.registrations,
      activeBidderCount:  activeBidders.length,
      updatedAt:          lot.updatedAt.toISOString(),
    });
  } catch (err) {
    send({ error: "DB-Fehler", detail: String(err) });
  }
}
