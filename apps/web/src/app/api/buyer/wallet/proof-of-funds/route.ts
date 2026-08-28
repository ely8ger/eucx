/**
 * POST /api/buyer/wallet/proof-of-funds
 *
 * Käufer lädt ein Sicherheitsleistungs-Dokument hoch (Bankgarantie / Kontoauszug /
 * Kapitalnachweis). Der Upload setzt den Status auf PENDING_ADMIN_APPROVAL im AuditLog.
 * Der Admin erhöht das Trading-Limit manuell nach Prüfung.
 *
 * Body: multipart/form-data mit Feldern:
 *   file    — PDF, JPG, PNG (max. 10 MB)
 *   amount  — Gewünschtes Trading-Limit in EUR (als string)
 *   docType — "Bankgarantie" | "Kontoauszug" | "Kapitalnachweis" | "Sonstiges"
 *
 * Auth: Bearer JWT
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { db }                        from "@/lib/db/client";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Ungültige Anfrage: multipart/form-data erwartet." }, { status: 400 }); }

  const file    = formData.get("file") as File | null;
  const amount  = formData.get("amount") as string | null;
  const docType = formData.get("docType") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Kein Dokument hochgeladen." }, { status: 422 });
  }
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
    return NextResponse.json({ error: "Nur PDF, JPG und PNG erlaubt." }, { status: 422 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Maximale Dateigröße: 10 MB." }, { status: 422 });
  }

  const amountNum = amount ? parseFloat(amount) : null;
  if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "Bitte geben Sie ein gewünschtes Trading-Limit an." }, { status: 422 });
  }

  const wallet = await db.wallet.findFirst({
    where:  { organization: { users: { some: { id: token.userId } } } },
    select: { id: true },
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
      docType:          docType ?? "Sonstiges",
      fileName:         file.name,
      fileSize:         file.size,
      fileMime:         file.type,
      requestedLimit:   amountNum,
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
