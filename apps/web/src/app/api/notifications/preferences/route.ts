/**
 * GET  /api/notifications/preferences  → Aktuelle Präferenzen des Users
 * PATCH /api/notifications/preferences → Präferenzen aktualisieren
 *
 * Wird angelegt (upsert) falls noch nicht vorhanden.
 *
 * Felder:
 *   emailOnOutbid:       boolean  (E-Mail bei Überbietung)
 *   emailOnAuctionEnd:   boolean  (E-Mail bei Auktionsabschluss + Siegerbenachrichtigung)
 *   emailOnAuctionStart: boolean  (E-Mail wenn Auktion für registrierte Verkäufer startet)
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

  const pref = await db.notificationPreference.upsert({
    where:  { userId: token.userId },
    create: { userId: token.userId },
    update: {},
    select: {
      emailOnOutbid:       true,
      emailOnAuctionEnd:   true,
      emailOnAuctionStart: true,
    },
  });

  return NextResponse.json(pref);
}

export async function PATCH(req: NextRequest) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    emailOnOutbid?:       boolean;
    emailOnAuctionEnd?:   boolean;
    emailOnAuctionStart?: boolean;
  };

  const pref = await db.notificationPreference.upsert({
    where:  { userId: token.userId },
    create: {
      userId:              token.userId,
      emailOnOutbid:       body.emailOnOutbid       ?? true,
      emailOnAuctionEnd:   body.emailOnAuctionEnd   ?? true,
      emailOnAuctionStart: body.emailOnAuctionStart ?? true,
    },
    update: {
      ...(typeof body.emailOnOutbid       === "boolean" && { emailOnOutbid:       body.emailOnOutbid }),
      ...(typeof body.emailOnAuctionEnd   === "boolean" && { emailOnAuctionEnd:   body.emailOnAuctionEnd }),
      ...(typeof body.emailOnAuctionStart === "boolean" && { emailOnAuctionStart: body.emailOnAuctionStart }),
    },
    select: {
      emailOnOutbid:       true,
      emailOnAuctionEnd:   true,
      emailOnAuctionStart: true,
    },
  });

  return NextResponse.json(pref);
}
