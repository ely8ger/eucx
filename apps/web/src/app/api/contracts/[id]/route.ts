/**
 * GET  /api/contracts/[id]/pdf  → PDF-Download (via ?action=pdf)
 * POST /api/contracts/[id]      → Vertrag signieren (EDS-Token bestätigen)
 *
 * EDS-Signatur-Workflow:
 *   1. User hat Token aus POST /api/contracts erhalten (6 Ziffern)
 *   2. User gibt Token hier ein → bcrypt.compare(token, tokenHash)
 *   3. Match + nicht abgelaufen → Deal.status = CONTRACT_SIGNED
 *   4. Contract.status = SIGNED, signedAt = now()
 *   5. AuditLog: CONTRACT_SIGNED mit pdfHash
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { audit } from "@/lib/audit/logger";
import { compare as bcryptCompare } from "bcryptjs";
import { verifyContractIntegrity } from "@/lib/contracts/generator";

export const dynamic = "force-dynamic";

// ─── POST /api/contracts/[id] — Signieren ────────────────────────────────────

export async function POST(
  req:     NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await context.params;

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

  const body = await req.json().catch(() => null) as { edsToken?: string } | null;
  if (!body?.edsToken) {
    return NextResponse.json({ error: "edsToken erforderlich" }, { status: 400 });
  }

  try {
    // ── Contract laden ─────────────────────────────────────────────────────
    const contract = await db.contract.findUnique({
      where:   { id: contractId },
      include: {
        deal: {
          include: {
            buyOrder:  { select: { userId: true } },
            sellOrder: { select: { userId: true } },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 });
    }

    // ── Berechtigung ───────────────────────────────────────────────────────
    const isParty =
      contract.deal.buyOrder.userId  === tokenPayload.userId ||
      contract.deal.sellOrder.userId === tokenPayload.userId;
    if (!isParty) {
      return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
    }

    // ── Bereits signiert? ──────────────────────────────────────────────────
    if (contract.status === "SIGNED") {
      return NextResponse.json({
        status:   "SIGNED",
        signedAt: contract.signedAt,
        pdfHash:  contract.pdfHash,
        message:  "Vertrag bereits unterzeichnet",
      });
    }

    // ── Token-Status ───────────────────────────────────────────────────────
    if (!contract.edsTokenHash || !contract.edsTokenExp) {
      return NextResponse.json({ error: "Kein aktiver Signatur-Token" }, { status: 409 });
    }

    if (new Date() > contract.edsTokenExp) {
      await db.contract.update({
        where: { id: contractId },
        data:  { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "EDS-Token abgelaufen. Bitte neuen Vertrag anfordern." },
        { status: 410 }
      );
    }

    // ── Token-Verifikation (bcrypt compare) ───────────────────────────────
    const tokenValid = await bcryptCompare(body.edsToken, contract.edsTokenHash);
    if (!tokenValid) {
      await audit({
        userId:     tokenPayload.userId,
        action:     "CONTRACT_SIGN_FAILED",
        entityType: "Contract",
        entityId:   contractId,
        ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
        userAgent:  req.headers.get("user-agent") ?? "",
        meta:       { reason: "invalid_token" },
      });
      return NextResponse.json(
        { error: "Ungültiger EDS-Token. Bitte prüfen Sie den Code." },
        { status: 422 }
      );
    }

    // ── Integritätsprüfung: PDF-Hash verifizieren ──────────────────────────
    // Stellt sicher dass das gespeicherte PDF nicht verändert wurde
    const integrityOk = verifyContractIntegrity(contract.pdfBase64, contract.pdfHash);
    if (!integrityOk) {
      return NextResponse.json({ error: "PDF-Integritätsfehler — Vertrag kompromittiert" }, { status: 500 });
    }

    const now = new Date();

    // ── Atomare Transaktion: Contract + Deal gleichzeitig aktualisieren ────
    await db.$transaction([
      db.contract.update({
        where: { id: contractId },
        data: {
          status:       "SIGNED",
          signedAt:     now,
          signerUserId: tokenPayload.userId,
          edsTokenHash: null,  // Token einmalig verwendbar — nach Nutzung löschen
          edsTokenExp:  null,
        },
      }),
      db.deal.update({
        where: { id: contract.dealId },
        data:  { status: "CONTRACT_SIGNED" },
      }),
    ]);

    // ── Audit Log: unveränderlicher Beweis der Signatur ────────────────────
    await audit({
      userId:     tokenPayload.userId,
      action:     "CONTRACT_SIGNED",
      entityType: "Contract",
      entityId:   contractId,
      ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent:  req.headers.get("user-agent") ?? "",
      meta: {
        dealId:    contract.dealId,
        pdfHash:   contract.pdfHash,           // Der Hash ist jetzt der Beweis
        signedAt:  now.toISOString(),
        signerIp:  req.headers.get("x-forwarded-for") ?? "unknown",
        // Unveränderlichkeit: Dieser AuditLog-Eintrag kann nie gelöscht werden
        // pdfHash + signedAt + signerIp = rechtssichere Signatur-Chain
      },
    });

    // ── BullMQ-Job einreihen (fire-and-forget, via NestJS enqueue endpoint) ─
    // Fehler hier darf die Signatur-Antwort NICHT blockieren — async ohne await
    const nestjsUrl = process.env.NESTJS_INTERNAL_URL;
    if (nestjsUrl) {
      fetch(`${nestjsUrl}/api/v1/clearing/enqueue`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dealId: contract.dealId }),
      }).catch((e) => {
        console.error("[contracts/[id]] BullMQ-Enqueue fehlgeschlagen:", e);
      });
    }

    return NextResponse.json({
      status:   "SIGNED",
      signedAt: now.toISOString(),
      pdfHash:  contract.pdfHash,
      message:  "Vertrag erfolgreich unterzeichnet. Rechtsgültig gem. EU-eIDAS.",
    });

  } catch (err) {
    console.error("[POST /api/contracts/[id]]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

// ─── GET /api/contracts/[id]?action=pdf — PDF-Download ───────────────────────

export async function GET(
  req:     NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await context.params;

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

  const contract = await db.contract.findUnique({
    where:   { id: contractId },
    include: {
      deal: {
        select: {
          buyOrder:  { select: { userId: true } },
          sellOrder: { select: { userId: true } },
        },
      },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 });
  }

  const isParty =
    contract.deal.buyOrder.userId  === tokenPayload.userId ||
    contract.deal.sellOrder.userId === tokenPayload.userId;
  if (!isParty) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  const action = req.nextUrl.searchParams.get("action");

  if (action === "pdf") {
    // Integrität prüfen vor jedem Download
    const ok = verifyContractIntegrity(contract.pdfBase64, contract.pdfHash);
    if (!ok) {
      return NextResponse.json({ error: "PDF-Integritätsfehler" }, { status: 500 });
    }

    const pdfBytes = Buffer.from(contract.pdfBase64, "base64");
    return new Response(pdfBytes, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="eucx-vertrag-${contractId.slice(0, 8)}.pdf"`,
        "Content-Length":      String(pdfBytes.length),
        "X-PDF-Hash":          contract.pdfHash,
        "Cache-Control":       "no-store",
      },
    });
  }

  return NextResponse.json({
    contractId: contract.id,
    status:     contract.status,
    pdfHash:    contract.pdfHash,
    pdfSizeBytes: contract.pdfSizeBytes,
    signedAt:   contract.signedAt,
    createdAt:  contract.createdAt,
  });
}
