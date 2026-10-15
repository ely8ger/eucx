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
 *   emailOnContract:     boolean  (E-Mail bei Kaufvertragserstellung)
 *   emailOnKyc:          boolean  (E-Mail bei KYC-Statusänderung)
 *   emailOnDispute:      boolean  (E-Mail bei Streitfalleröffnung)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let token;
  try {
    token = await requireAuth(req);
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
      emailOnContract:     true,
      emailOnKyc:          true,
      emailOnDispute:      true,
    },
  });

  return NextResponse.json(pref);
}

export async function PATCH(req: NextRequest) {
  let token;
  try {
    token = await requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    emailOnOutbid?:       boolean;
    emailOnAuctionEnd?:   boolean;
    emailOnAuctionStart?: boolean;
    emailOnContract?:     boolean;
    emailOnKyc?:          boolean;
    emailOnDispute?:      boolean;
  };

  const pref = await db.notificationPreference.upsert({
    where:  { userId: token.userId },
    create: {
      userId:              token.userId,
      emailOnOutbid:       body.emailOnOutbid       ?? true,
      emailOnAuctionEnd:   body.emailOnAuctionEnd   ?? true,
      emailOnAuctionStart: body.emailOnAuctionStart ?? true,
      emailOnContract:     body.emailOnContract     ?? true,
      emailOnKyc:          body.emailOnKyc          ?? true,
      emailOnDispute:      body.emailOnDispute       ?? true,
    },
    update: {
      ...(typeof body.emailOnOutbid       === "boolean" && { emailOnOutbid:       body.emailOnOutbid }),
      ...(typeof body.emailOnAuctionEnd   === "boolean" && { emailOnAuctionEnd:   body.emailOnAuctionEnd }),
      ...(typeof body.emailOnAuctionStart === "boolean" && { emailOnAuctionStart: body.emailOnAuctionStart }),
      ...(typeof body.emailOnContract     === "boolean" && { emailOnContract:     body.emailOnContract }),
      ...(typeof body.emailOnKyc          === "boolean" && { emailOnKyc:          body.emailOnKyc }),
      ...(typeof body.emailOnDispute      === "boolean" && { emailOnDispute:      body.emailOnDispute }),
    },
    select: {
      emailOnOutbid:       true,
      emailOnAuctionEnd:   true,
      emailOnAuctionStart: true,
      emailOnContract:     true,
      emailOnKyc:          true,
      emailOnDispute:      true,
    },
  });

  return NextResponse.json(pref);
}
