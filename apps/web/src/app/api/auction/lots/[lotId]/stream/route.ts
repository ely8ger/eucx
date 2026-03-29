/**
 * GET /api/auction/lots/[lotId]/stream
 *
 * Server-Sent Events (SSE) — schickt alle 2 Sekunden:
 *   (unnamed event / default)  → aktueller Lot-Status (Phase, Preis, Timer)
 *   event: notification        → neue ungelesene Benachrichtigungen für diesen User
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
  const rawToken = req.nextUrl.searchParams.get("token");
  if (!rawToken) {
    return new Response("Nicht autorisiert", { status: 401 });
  }
  let tokenPayload;
  try {
    tokenPayload = await verifyAccessToken(rawToken);
  } catch {
    return new Response("Token ungültig", { status: 401 });
  }

  const { lotId } = params;
  const userId = tokenPayload.userId;

  // SSE-Stream aufbauen
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Hilfsfunktion: einfache state-Nachricht (default event)
      const sendState = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Hilfsfunktion: typisiertes notification-Event
      const sendNotif = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: notification\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Sofort ersten State + ausstehende Notifications senden
      await sendLotState(lotId, sendState);
      await sendPendingNotifications(userId, lotId, sendNotif);

      // Polling-Loop
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        await sendLotState(lotId, sendState);
        await sendPendingNotifications(userId, lotId, sendNotif);
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
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─── Lot-Status senden ────────────────────────────────────────────────────────

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

    const activeBidders = await db.bid.groupBy({
      by:    ["sellerId"],
      where: { lotId },
    });

    send({
      phase:             lot.phase,
      currentBest:       lot.currentBest?.toString() ?? null,
      auctionEnd:        lot.auctionEnd?.toISOString() ?? null,
      bidCount:          lot._count.bids,
      registrationCount: lot._count.registrations,
      activeBidderCount: activeBidders.length,
      updatedAt:         lot.updatedAt.toISOString(),
    });
  } catch (err) {
    send({ error: "DB-Fehler", detail: String(err) });
  }
}

// ─── Neue Notifications senden (nur ungelesene der letzten 60s) ───────────────
// Die Notifications werden NICHT hier als gelesen markiert.
// Das Frontend-Bell-Dropdown setzt isRead via PATCH /api/notifications.
// Um doppelte Toasts zu vermeiden: Frontend verwaltet bereits gezeigte IDs.

async function sendPendingNotifications(
  userId: string,
  lotId:  string,
  send:   (data: unknown) => void,
): Promise<void> {
  try {
    const since = new Date(Date.now() - 60_000); // letzten 60s

    const notifs = await db.notification.findMany({
      where: {
        userId,
        lotId,
        isRead:    false,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take:    5,
      select: {
        id:        true,
        type:      true,
        title:     true,
        message:   true,
        createdAt: true,
      },
    });

    for (const n of notifs) {
      send({
        id:        n.id,
        type:      n.type,
        title:     n.title,
        message:   n.message,
        createdAt: n.createdAt.toISOString(),
      });
    }
  } catch {
    // Notification-Fehler sollen den Lot-Stream nicht unterbrechen
  }
}
