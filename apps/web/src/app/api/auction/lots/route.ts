/**
 * POST /api/auction/lots
 *
 * Käufer erstellt ein neues Lot (Ausschreibung).
 * Phase startet mit COLLECTION — Verkäufer können sich registrieren.
 *
 * Auth: Bearer JWT (role === BUYER)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createLotSchema = z.object({
  commodity:   z.string().min(3).max(120),
  quantity:    z.number().positive(),
  unit:        z.enum(["TON", "KG", "CBM", "LITER", "PIECE", "SQM", "MWH"]),
  startPrice:  z.number().positive().optional(),
  description: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // ── Validation ────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 }); }

  const parsed = createLotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  // ── Role-Check ────────────────────────────────────────────────────
  const user = await db.user.findUnique({
    where:  { id: token.userId },
    select: { id: true, role: true, status: true, verificationStatus: true },
  });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }
  if (!["BUYER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Nur Käufer können Lots erstellen" }, { status: 403 });
  }
  if (user.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "KYC-Verifizierung erforderlich" }, { status: 403 });
  }

  // ── Lot anlegen ───────────────────────────────────────────────────
  const { commodity, quantity, unit, startPrice, description } = parsed.data;
  const lot = await db.lot.create({
    data: {
      buyerId:    user.id,
      commodity,
      quantity:   quantity.toString(),
      unit,
      startPrice: startPrice?.toString(),
      description,
    },
  });

  return NextResponse.json({ lotId: lot.id, phase: lot.phase }, { status: 201 });
}

/**
 * GET /api/auction/lots
 *
 * Listet offene Lots (COLLECTION, PROPOSAL, REDUCTION).
 * Öffentlich lesbar für registrierte Verkäufer.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: { userId: string };
  try { tokenPayload = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const userId = tokenPayload.userId;
  const { searchParams } = new URL(req.url);
  const phase   = searchParams.get("phase");
  const mine    = searchParams.get("mine") === "true";

  const lots = await db.lot.findMany({
    where: mine
      // Käufer sieht nur eigene Lots — alle Phasen inkl. CONCLUSION
      ? { buyerId: userId, ...(phase ? { phase: phase as never } : {}) }
      // Alle anderen sehen offene Lots (COLLECTION/PROPOSAL/REDUCTION)
      : phase
        ? { phase: phase as never }
        : { phase: { in: ["COLLECTION", "PROPOSAL", "REDUCTION"] } },
    orderBy: { createdAt: "desc" },
    take:    100,
    select: {
      id:          true,
      commodity:   true,
      quantity:    true,
      unit:        true,
      phase:       true,
      startPrice:  true,
      currentBest: true,
      auctionEnd:  true,
      createdAt:   true,
      winnerId:    true,
      buyer: {
        select: { id: true, organizationId: true },
      },
      _count: {
        select: { bids: true, registrations: true },
      },
      registrations: {
        where:  { sellerId: userId },
        select: { id: true },
      },
    },
  });

  const result = lots.map(({ registrations, ...lot }) => ({
    ...lot,
    isRegistered: registrations.length > 0,
  }));

  return NextResponse.json({ lots: result });
}
