/**
 * POST /api/auction/lots
 *
 * Käufer erstellt ein neues Lot (Ausschreibung).
 * Phase startet mit COLLECTION - Verkäufer können sich registrieren.
 *
 * Auth: Bearer JWT (role === BUYER)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { CbamCategory } from "@prisma/client";
import { runAuctionTimer } from "@/lib/auction/auction-timer";

export const dynamic = "force-dynamic";

const INCOTERMS_VALUES = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"] as const;
const CBAM_CATEGORY_VALUES = Object.values(CbamCategory) as [CbamCategory, ...CbamCategory[]];

const createLotSchema = z.object({
  commodity:        z.string().min(3).max(120),
  quantity:         z.number().positive(),
  unit:             z.enum(["TON", "KG", "CBM", "LITER", "PIECE", "SQM", "MWH"]),
  startPrice:       z.number().positive().optional(),
  description:      z.string().max(2000).optional(),
  // CBAM-Felder (optional, aber empfohlen ab 2026 für grenzüberschreitenden Handel)
  cbamCategory:     z.enum(CBAM_CATEGORY_VALUES).optional(),
  co2PerTonne:      z.number().positive().optional(),
  countryOfOrigin:  z.string().max(100).optional(),
  productionSiteId: z.string().max(50).optional(),
  incoterms:        z.enum(INCOTERMS_VALUES).optional(),
  greenSteel:       z.boolean().optional(),
  // Handels- und Vertragsangaben (Pflichtfelder - vertragswesentlich nach §§ 433, 434 BGB)
  hsCode:           z.string().min(1, "HS-Code ist erforderlich").max(20),
  qualityGrade:     z.string().min(1, "Güte / Qualitätsnorm ist erforderlich").max(120),
  deliveryPeriod:   z.string().min(1, "Max. Lieferzeit ist erforderlich").max(120),
  deliveryLocation: z.string().min(1, "Lieferort ist erforderlich").max(200),
  paymentTerms:     z.string().min(1, "Zahlungsbedingungen sind erforderlich").max(120),
  vatTreatment:     z.string().min(1, "USt.-Behandlung ist erforderlich").max(120),
  publish:          z.boolean().optional(), // true = sofort veröffentlichen (isDraft=false)
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
  const { commodity, quantity, unit, startPrice, description,
          cbamCategory, co2PerTonne, countryOfOrigin, productionSiteId, incoterms, greenSteel,
          hsCode, qualityGrade, deliveryPeriod, deliveryLocation, paymentTerms, vatTreatment,
          publish } = parsed.data;

  const buyerIp = req.headers.get("x-forwarded-for")?.split(",").at(0)?.trim()
               ?? req.headers.get("x-real-ip")
               ?? null;

  let lot;
  try {
    lot = await db.lot.create({
      data: {
        buyerId:         user.id,
        buyerIp,
        commodity,
        quantity:        quantity.toString(),
        unit,
        startPrice:      startPrice?.toString(),
        description,
        cbamCategory,
        co2PerTonne:     co2PerTonne?.toString(),
        countryOfOrigin,
        productionSiteId,
        incoterms,
        hsCode,
        qualityGrade,
        deliveryPeriod,
        deliveryLocation,
        paymentTerms,
        vatTreatment,
        greenSteel:      greenSteel ?? false,
        isDraft:         publish === true ? false : true,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/auction/lots] DB error:", msg);
    return NextResponse.json({ error: "Datenbankfehler beim Erstellen des Lots", detail: msg.slice(0, 200) }, { status: 500 });
  }

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

  // Fällige Auktionen on-demand abschließen (Backup für Cron-Ausfälle)
  runAuctionTimer().catch((err) => console.error("[AuctionTimer on-demand]", err));

  const lots = await db.lot.findMany({
    where: mine
      // Käufer sieht alle eigenen Lots inkl. Entwürfe und CONCLUSION
      ? { buyerId: userId, ...(phase ? { phase: phase as never } : {}) }
      // Verkäufer sehen nur veröffentlichte Lots (isDraft=false)
      : phase
        ? { phase: phase as never, isDraft: false }
        : { phase: { in: ["COLLECTION", "PROPOSAL", "REDUCTION"] }, isDraft: false },
    orderBy: { createdAt: "desc" },
    take:    100,
    select: {
      id:               true,
      commodity:        true,
      quantity:         true,
      unit:             true,
      phase:            true,
      startPrice:       true,
      currentBest:      true,
      auctionEnd:       true,
      createdAt:        true,
      winnerId:         true,
      cbamCategory:     true,
      co2PerTonne:      true,
      countryOfOrigin:  true,
      productionSiteId: true,
      incoterms:        true,
      hsCode:           true,
      qualityGrade:     true,
      deliveryPeriod:   true,
      deliveryLocation: true,
      paymentTerms:     true,
      vatTreatment:     true,
      greenSteel:       true,
      description:      true,
      isDraft:          true,
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
      lotContract: {
        select: { id: true },
      },
    },
  });

  const result = lots.map(({ registrations, lotContract, ...lot }) => ({
    ...lot,
    contractId:   lotContract?.id ?? null,
    isRegistered: registrations.length > 0,
  }));

  return NextResponse.json({ lots: result });
}
