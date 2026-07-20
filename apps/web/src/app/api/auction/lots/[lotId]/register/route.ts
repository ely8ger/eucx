/**
 * POST /api/auction/lots/[lotId]/register
 *
 * Verkäufer meldet sich für eine Auktion an.
 * Nur in Phase COLLECTION möglich.
 *
 * Auth: Bearer JWT (role === SELLER oder BROKER)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(authHeader.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  // ── User + Lot prüfen ─────────────────────────────────────────────
  const [user, lot] = await Promise.all([
    db.user.findUnique({
      where:  { id: token.userId },
      select: { id: true, role: true, status: true, verificationStatus: true },
    }),
    db.lot.findUnique({
      where:  { id: lotId },
      select: { id: true, phase: true, buyerId: true, buyerIp: true },
    }),
  ]);

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto nicht aktiv" }, { status: 403 });
  }
  if (!["SELLER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Nur Verkäufer können sich registrieren" }, { status: 403 });
  }
  if (user.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "KYC-Verifizierung erforderlich" }, { status: 403 });
  }
  if (!lot) {
    return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });
  }
  if (lot.buyerId === token.userId) {
    return NextResponse.json({ error: "Käufer kann sich nicht als Verkäufer registrieren" }, { status: 409 });
  }

  // ── IP-Sperre: Käufer und Verkäufer dürfen nicht dieselbe IP haben ──
  const sellerIp = req.headers.get("x-forwarded-for")?.split(",").at(0)?.trim()
                ?? req.headers.get("x-real-ip")
                ?? null;
  if (sellerIp && lot.buyerIp && sellerIp === lot.buyerIp) {
    return NextResponse.json(
      { error: "Registrierung von dieser IP-Adresse nicht möglich (Interessenkonflikt)" },
      { status: 409 }
    );
  }
  if (lot.phase !== "COLLECTION") {
    return NextResponse.json({ error: "Registrierung nur in Phase COLLECTION möglich" }, { status: 409 });
  }

  // ── Registrierung (idempotent) ────────────────────────────────────
  const reg = await db.lotRegistration.upsert({
    where:  { lotId_sellerId: { lotId: lotId, sellerId: token.userId } },
    create: { lotId: lotId, sellerId: token.userId },
    update: {},
    select: { id: true, createdAt: true },
  });

  // ── Auto-Start: Handelssitzung 13:00–15:00 Mo–Fr Berlin aktiv? ───
  const now = new Date();
  let autoStarted = false;

  if (lot.phase === "COLLECTION" && isSlotActive(now)) {
    const auctionEnd = slotEndUTC(now);
    const affected = await db.lot.updateMany({
      where: { id: lotId, phase: "COLLECTION" }, // atomischer Guard gegen Race
      data:  { phase: "PROPOSAL", auctionStart: now, auctionEnd },
    });
    autoStarted = affected.count > 0;
  }

  return NextResponse.json({ registrationId: reg.id, registered: true, autoStarted });
}

// ── Hilfsfunktionen Handelssitzung ───────────────────────────────────
function isSlotActive(now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin", weekday: "long",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const wd  = get("weekday");
  if (wd === "Saturday" || wd === "Sunday") return false;
  const mins = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
  return mins >= 13 * 60 && mins < 15 * 60;
}

function slotEndUTC(now: Date): Date {
  const berlinDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
  }).format(now);
  // Berlin-Offset ermitteln
  const berlinNow    = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const berlinOffset = now.getTime() - berlinNow.getTime();
  return new Date(new Date(`${berlinDateStr}T15:00:00`).getTime() + berlinOffset);
}
