/**
 * GET  /api/notifications       → Letzte 50 Notifications des eingeloggten Users
 * PATCH /api/notifications      → Notification(s) als gelesen markieren
 *
 * GET Query-Params:
 *   ?unreadOnly=true   → nur ungelesene
 *   ?limit=10          → max. Anzahl (default 50)
 *
 * PATCH Body:
 *   { ids: string[] }  → spezifische IDs als gelesen markieren
 *   { markAllRead: true } → alle als gelesen markieren
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit      = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const notifications = await db.notification.findMany({
    where: {
      userId: token.userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take:    limit,
    select: {
      id:        true,
      type:      true,
      title:     true,
      message:   true,
      lotId:     true,
      isRead:    true,
      createdAt: true,
    },
  });

  const unreadCount = await db.notification.count({
    where: { userId: token.userId, isRead: false },
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH(req: NextRequest) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { ids?: string[]; markAllRead?: boolean };

  if (body.markAllRead) {
    await db.notification.updateMany({
      where: { userId: token.userId, isRead: false },
      data:  { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    await db.notification.updateMany({
      where: { userId: token.userId, id: { in: body.ids } },
      data:  { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "ids oder markAllRead erforderlich" }, { status: 400 });
}
