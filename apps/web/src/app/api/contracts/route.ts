/**
 * POST /api/contracts
 *
 * Workflow:
 *   1. Prüfe JWT + Deal-Eigentümerschaft
 *   2. Generiere Vertrags-PDF aus Deal-Daten
 *   3. Berechne SHA-256-Hash
 *   4. Speichere Contract in DB (PENDING_SIGNATURE)
 *   5. Generiere 6-stelligen Mock-EDS-Token
 *   6. Antworte mit contractId + edsToken (User muss Token bestätigen)
 *
 * GET /api/contracts?dealId=<uuid>
 *   Gibt Contract-Status + contractId zurück (kein PDF in GET - zu groß)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { generateContract } from "@/lib/contracts/generator";
import { audit } from "@/lib/audit/logger";
import { hash as bcryptHash } from "bcryptjs";
import { randomInt } from "crypto";

export const dynamic = "force-dynamic";

// ─── POST: Vertrag generieren ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let tokenPayload: { userId: string };
  try {
    tokenPayload = await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  // ── Payload ───────────────────────────────────────────────────────────────
  const body = await req.json().catch(() => null) as { dealId?: string } | null;
  if (!body?.dealId) {
    return NextResponse.json({ error: "dealId erforderlich" }, { status: 400 });
  }

  try {
    // ── Deal laden mit allen Relationen ────────────────────────────────────
    const deal = await db.deal.findUnique({
      where: { id: body.dealId },
      include: {
        buyOrder:  { include: { user: true, organization: true } },
        sellOrder: { include: { user: true, organization: true } },
        product:   { select: { name: true, sku: true, unit: true } },
        contract:  true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal nicht gefunden" }, { status: 404 });
    }

    // Nur Käufer oder Verkäufer dürfen Vertrag generieren
    const isParty =
      deal.buyOrder.userId  === tokenPayload.userId ||
      deal.sellOrder.userId === tokenPayload.userId;
    if (!isParty) {
      return NextResponse.json({ error: "Kein Zugriff auf diesen Deal" }, { status: 403 });
    }

    // Deal muss gematchet sein
    if (!["MATCHED", "CONFIRMED"].includes(deal.status)) {
      return NextResponse.json(
        { error: `Deal-Status '${deal.status}' erlaubt keine Vertragsgenerierung` },
        { status: 409 }
      );
    }

    // Bereits signiert?
    if (deal.contract?.status === "SIGNED") {
      return NextResponse.json({
        contractId: deal.contract.id,
        status:     "SIGNED",
        pdfHash:    deal.contract.pdfHash,
        message:    "Vertrag bereits unterzeichnet",
      });
    }

    // ── PDF generieren ─────────────────────────────────────────────────────
    const { pdfBase64, pdfHash, pdfSizeBytes } = await generateContract({
      contractId:   deal.contract?.id ?? crypto.randomUUID(),
      dealId:       deal.id,
      sessionId:    deal.sessionId,
      buyerName:    deal.buyOrder.organization.name,
      buyerCountry: deal.buyOrder.organization.country,
      buyerTaxId:   deal.buyOrder.organization.taxId,
      sellerName:   deal.sellOrder.organization.name,
      sellerCountry: deal.sellOrder.organization.country,
      sellerTaxId:  deal.sellOrder.organization.taxId,
      productName:  deal.product.name,
      productSku:   deal.product.sku,
      quantity:     deal.quantity.toFixed(3),
      unit:         deal.product.unit,
      pricePerUnit: deal.pricePerUnit.toFixed(2),
      totalValue:   deal.totalValue.toFixed(2),
      currency:     deal.currency,
      dealDate:     deal.createdAt.toISOString(),
    });

    // ── Mock-EDS-Token: 6-stellig, 5 Minuten gültig ────────────────────────
    const rawToken    = String(randomInt(100_000, 999_999)); // 6 Ziffern
    const tokenHash   = await bcryptHash(rawToken, 10);
    const tokenExpiry = new Date(Date.now() + 5 * 60_000);  // +5 Minuten

    // ── Contract upsert in DB ──────────────────────────────────────────────
    const contract = await db.contract.upsert({
      where:  { dealId: deal.id },
      update: {
        pdfBase64,
        pdfHash,
        pdfSizeBytes,
        status:       "PENDING_SIGNATURE",
        edsTokenHash: tokenHash,
        edsTokenExp:  tokenExpiry,
        signedAt:     null,
      },
      create: {
        dealId:       deal.id,
        pdfBase64,
        pdfHash,
        pdfSizeBytes,
        edsTokenHash: tokenHash,
        edsTokenExp:  tokenExpiry,
      },
    });

    // ── Audit Log ──────────────────────────────────────────────────────────
    await audit({
      userId:     tokenPayload.userId,
      action:     "CONTRACT_GENERATED",
      entityType: "Contract",
      entityId:   contract.id,
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta: {
        dealId:      deal.id,
        pdfHash,
        pdfSizeBytes,
        tokenExpiry: tokenExpiry.toISOString(),
      },
    });

    return NextResponse.json({
      contractId: contract.id,
      pdfHash,
      pdfSizeBytes,
      status:     "PENDING_SIGNATURE",
      edsToken:   rawToken,          // Nur bei Generierung zurückgegeben - nie wieder
      edsTokenExp: tokenExpiry.toISOString(),
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/contracts]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

// ─── GET: Contract-Status abfragen ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    await verifyAccessToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Token ungültig" }, { status: 401 });
  }

  const dealId = req.nextUrl.searchParams.get("dealId");
  if (!dealId) {
    return NextResponse.json({ error: "dealId erforderlich" }, { status: 400 });
  }

  const contract = await db.contract.findUnique({
    where:  { dealId },
    select: { id: true, status: true, pdfHash: true, pdfSizeBytes: true, signedAt: true, createdAt: true },
  });

  if (!contract) return NextResponse.json({ contract: null });

  return NextResponse.json({ contract });
}
