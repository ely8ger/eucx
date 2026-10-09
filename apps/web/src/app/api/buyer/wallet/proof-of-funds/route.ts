/**
 * POST /api/buyer/wallet/proof-of-funds
 *
 * Nimmt einen bereits zu Vercel Blob hochgeladenen Finanznachweis entgegen
 * und speichert den Antrag im AuditLog. Der Admin sieht ihn in me8.eucx.eu
 * unter KYC → Wallet-Freigaben.
 *
 * Body: JSON
 *   blobUrl  - Vercel-Blob-URL der hochgeladenen Datei
 *   blobName - Originaldateiname
 *   amount   - Gewünschtes Trading-Limit in EUR (number)
 *   docType  - "Bankgarantie" | "Kontoauszug" | "Kapitalnachweis" | "Sonstiges"
 *
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { db }                        from "@/lib/db/client";
import { apiRoute }                  from "@/lib/api/route-handler";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  blobUrl:  z.string().url(),
  blobName: z.string().min(1).max(255),
  amount:   z.number().positive().min(10_000),
  docType:  z.string().min(1).max(50),
});

async function _POST(req: NextRequest) {
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  let body: z.infer<typeof bodySchema>;
  try {
    const raw = await req.json();
    body = bodySchema.parse(raw);
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Wallet + orgId über den eingeloggten Nutzer ermitteln
  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: { id: true, organizationId: true },
  });

  const requestId = `POF-${token.userId.slice(-6).toUpperCase()}-${Date.now()}`;

  void audit({
    userId:     token.userId,
    action:     "ADMIN_ACTION",
    entityType: "Organization",
    entityId:   wallet?.id ?? token.userId,
    meta: {
      type:             "PROOF_OF_FUNDS_SUBMITTED",
      requestId,
      orgId:            wallet?.organizationId ?? null,
      walletId:         wallet?.id ?? null,
      docType:          body.docType,
      blobUrl:          body.blobUrl,
      blobName:         body.blobName,
      requestedLimit:   body.amount,
      status:           "PENDING_ADMIN_APPROVAL",
      submittedAt:      new Date().toISOString(),
    },
  });

  return NextResponse.json({
    ok:        true,
    requestId,
    status:    "PENDING_ADMIN_APPROVAL",
    message:   `Ihr Dokument wurde eingereicht (Referenz: ${requestId}). Das EUCX-Compliance-Team prüft Ihre Unterlagen und gibt Ihr Trading-Limit frei — in der Regel innerhalb von 1–2 Werktagen.`,
  });
}

export const POST = apiRoute(_POST);
