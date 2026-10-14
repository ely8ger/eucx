/**
 * POST /api/auction/lots/[lotId]/documents
 *   Lädt ein Lot-Dokument hoch (Vercel Blob).
 *   Body: multipart/form-data — Felder: file (Pflicht), docType (optional)
 *
 *   Wer darf hochladen:
 *     - Käufer des Lots: alle docTypes
 *     - Registrierter Verkäufer: nur CERTIFICATE, QUALITY_REPORT, OTHER
 *
 * GET /api/auction/lots/[lotId]/documents
 *   Listet alle Dokumente des Lots.
 *   Wer darf lesen: Käufer + registrierte Verkäufer
 *
 * Auth: Bearer JWT (requireAuth)
 */
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/jwt";
import { apiRoute } from "@/lib/api/route-handler";
import { LotDocType } from "@prisma/client";

export const dynamic = "force-dynamic";

const ALLOWED_MIME   = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
const MAX_BYTES      = 10 * 1024 * 1024; // 10 MB
const SELLER_ALLOWED = new Set<LotDocType>(["CERTIFICATE", "QUALITY_REPORT", "OTHER"]);

// Verkäufer-docTypes validieren
const ALL_DOC_TYPES  = new Set<string>(Object.values(LotDocType));

async function _POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  const { lotId } = await params;

  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  // ── Lot + Zugriffsprüfung ──────────────────────────────────────────
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      id: true, buyerId: true, phase: true,
      registrations: { where: { sellerId: token.userId }, select: { id: true } },
    },
  });
  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });

  const isBuyer    = lot.buyerId === token.userId;
  const isAdmin    = ["ADMIN", "SUPER_ADMIN"].includes(token.role);
  const isSeller   = lot.registrations.length > 0;

  if (!isBuyer && !isAdmin && !isSeller) {
    return NextResponse.json({ error: "Kein Zugriff — nur Käufer und registrierte Verkäufer" }, { status: 403 });
  }

  // ── CONCLUSION: kein Upload mehr ──────────────────────────────────
  if (lot.phase === "CONCLUSION") {
    return NextResponse.json({ error: "Lot abgeschlossen — kein Dokumenten-Upload mehr möglich" }, { status: 409 });
  }

  // ── FormData ───────────────────────────────────────────────────────
  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Ungültiges multipart/form-data" }, { status: 400 }); }

  const file        = formData.get("file");
  const docTypeRaw  = (formData.get("docType") as string | null)?.trim().toUpperCase() ?? "OTHER";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Pflichtfeld 'file' fehlt" }, { status: 400 });
  }

  const docType = ALL_DOC_TYPES.has(docTypeRaw) ? (docTypeRaw as LotDocType) : "OTHER" as LotDocType;

  // ── Berechtigungs-Check: Verkäufer darf nur bestimmte Typen hochladen ─
  if (!isBuyer && !isAdmin && !SELLER_ALLOWED.has(docType)) {
    return NextResponse.json(
      { error: `Verkäufer dürfen nur ${[...SELLER_ALLOWED].join(", ")} hochladen` },
      { status: 403 },
    );
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Nur PDF, JPG, PNG, WEBP, Word und Excel erlaubt" }, { status: 415 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `Datei zu groß (max. ${MAX_BYTES / 1024 / 1024} MB)` }, { status: 413 });
  }

  // ── Dateiname bereinigen ───────────────────────────────────────────
  const safeName = file.name
    .replace(/\.\./g, "_")
    .replace(/[^\w\s.\-()[\]]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200) || "dokument";

  const blobPath = `lot-documents/${lotId}/${docType}/${Date.now()}-${safeName}`;

  // ── Vercel Blob Upload ─────────────────────────────────────────────
  let blobUrl: string;
  try {
    const blob = await put(blobPath, file, { access: "public", contentType: file.type });
    blobUrl = blob.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[lot/documents POST] Blob-Fehler:", msg);
    return NextResponse.json({ error: `Upload-Fehler: ${msg}` }, { status: 502 });
  }

  // ── DB-Eintrag ─────────────────────────────────────────────────────
  const doc = await db.lotDocument.create({
    data: {
      lotId,
      uploaderId: token.userId,
      docType,
      url:       blobUrl,
      name:      safeName,
      sizeBytes: file.size,
      mimeType:  file.type,
    },
    select: {
      id: true, docType: true, url: true, name: true,
      sizeBytes: true, mimeType: true, createdAt: true,
    },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
}

export const POST = apiRoute(_POST);

async function _GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> },
) {
  const { lotId } = await params;

  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  // ── Zugriffsprüfung ────────────────────────────────────────────────
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      buyerId: true,
      registrations: { where: { sellerId: token.userId }, select: { id: true } },
    },
  });
  if (!lot) return NextResponse.json({ error: "Lot nicht gefunden" }, { status: 404 });

  const isBuyer  = lot.buyerId === token.userId;
  const isAdmin  = ["ADMIN", "SUPER_ADMIN"].includes(token.role);
  const isSeller = lot.registrations.length > 0;

  if (!isBuyer && !isAdmin && !isSeller) {
    return NextResponse.json({ error: "Kein Zugriff — nur Käufer und registrierte Verkäufer" }, { status: 403 });
  }

  const documents = await db.lotDocument.findMany({
    where:   { lotId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, docType: true, url: true, name: true,
      sizeBytes: true, mimeType: true, createdAt: true,
      uploader: { select: { id: true, role: true } },
    },
  });

  return NextResponse.json({ documents });
}

export const GET = apiRoute(_GET);
