/**
 * POST /api/auction/lots/[lotId]/cmr-upload
 *
 * Lädt ein CMR-Dokument (Frachtbrief) für einen Kontrakt in den Vercel Blob Store hoch.
 * Setzt deliveryStatus automatisch auf IN_TRANSIT nach erfolgreichem Upload.
 *
 * Auth: Bearer JWT - Seller (Eigentümer) oder Admin
 */
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/jwt";
import { DeliveryStatus } from "@prisma/client";
import { apiRoute } from "@/lib/api/route-handler";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

async function _POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: { id: true, sellerId: true, deliveryStatus: true, contractNumber: true },
  });
  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  const isOwner = contract.sellerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(token.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  const allowedStatuses: DeliveryStatus[] = [
    DeliveryStatus.READY_FOR_PICKUP,
    DeliveryStatus.IN_TRANSIT,
  ];
  if (!allowedStatuses.includes(contract.deliveryStatus)) {
    return NextResponse.json(
      { error: `CMR-Upload nur in READY_FOR_PICKUP oder IN_TRANSIT möglich. Aktuell: '${contract.deliveryStatus}'` },
      { status: 409 }
    );
  }

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Ungültiges multipart/form-data" }, { status: 400 }); }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Pflichtfeld 'file' fehlt" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Nur PDF, JPEG oder PNG erlaubt" }, { status: 415 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: `Datei zu groß (max. ${MAX_FILE_BYTES / 1024 / 1024} MB)` }, { status: 413 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const blobPath = `cmr/${lotId}/CMR-${contract.contractNumber}-${Date.now()}-${safeName}`;

  let cmrUrl: string;
  try {
    const blob = await put(blobPath, file, { access: "public", contentType: file.type });
    cmrUrl = blob.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cmr-upload] Blob-Fehler:", msg);
    return NextResponse.json({ error: `Upload-Fehler: ${msg}` }, { status: 502 });
  }

  const autoAdvanced = contract.deliveryStatus === DeliveryStatus.READY_FOR_PICKUP;

  const updated = await db.lotContract.update({
    where: { id: contract.id },
    data:  {
      cmrUrl,
      cmrUploadedAt:  new Date(),
      deliveryStatus: autoAdvanced ? DeliveryStatus.IN_TRANSIT : contract.deliveryStatus,
    },
    select: { id: true, lotId: true, deliveryStatus: true, cmrUploadedAt: true },
  });

  return NextResponse.json({
    ...updated,
    cmrUrl,
    fileName:         safeName,
    fileSizeMb:       (file.size / 1024 / 1024).toFixed(2),
    statusAdvancedTo: autoAdvanced ? DeliveryStatus.IN_TRANSIT : null,
  }, { status: 201 });
}

export const POST = apiRoute(_POST);
