/**
 * POST /api/kyc/upload
 *
 * Lädt eine KYC-Datei in den Vercel Blob-Store hoch.
 * Gibt die öffentliche URL zurück, die dann beim Submit mitgesendet wird.
 *
 * Body: multipart/form-data
 *   file    - die Datei (PDF, JPG, PNG, WEBP)
 *   docType - DocType-Enum-Wert (z. B. "TRADE_REGISTER")
 */
import { NextRequest, NextResponse } from "next/server";
import { put }                       from "@vercel/blob";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { apiRoute }                  from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES     = 15 * 1024 * 1024; // 15 MB

const VALID_DOC_TYPES = new Set([
  "TRADE_REGISTER", "VAT_CONFIRMATION", "ID_DOCUMENT", "UBO_DOCUMENT",
  "BANK_CONFIRMATION", "SOLVENCY_PROOF", "POWER_OF_ATTORNEY",
  "EORI_CERTIFICATE", "ISO_CERTIFICATE", "CBAM_REGISTRATION", "OTHER",
]);

async function _POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  let token: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // ── FormData ──────────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const file    = formData.get("file") as File | null;
  const docType = formData.get("docType") as string | null;

  if (!file || typeof file.name !== "string") {
    return NextResponse.json({ error: "Keine Datei übermittelt" }, { status: 400 });
  }
  if (!docType || !VALID_DOC_TYPES.has(docType)) {
    return NextResponse.json({ error: "Ungültiger Dokumenttyp" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Nur PDF, JPG, PNG und WEBP erlaubt" }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Maximale Dateigröße: 15 MB" }, { status: 422 });
  }

  // ── Dateiname bereinigen ──────────────────────────────────────────────────
  const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const timestamp = Date.now();
  const blobPath  = `kyc/${token.userId}/${docType}/${timestamp}-${safeName}`;

  // ── Blob-Upload ───────────────────────────────────────────────────────────
  let blob: Awaited<ReturnType<typeof put>>;
  try {
    blob = await put(blobPath, file, {
      access:      "public",
      contentType: file.type,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("[POST /api/kyc/upload] Blob-Fehler:", msg);
    return NextResponse.json(
      { error: `Upload-Fehler: ${msg}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    url:    blob.url,
    name:   file.name,
    sizeMb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
  });
}

export const POST = apiRoute(_POST);
