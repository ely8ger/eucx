/**
 * POST /api/auction/lots/[lotId]/cmr-upload
 *
 * Lädt ein CMR-Dokument (Frachtbrief) für einen Kontrakt hoch.
 * Akzeptiert multipart/form-data mit Feld "file" (PDF, max. 5 MB).
 * Setzt deliveryStatus automatisch auf IN_TRANSIT nach erfolgreichem Upload.
 *
 * Auth: Bearer JWT — Seller (Eigentümer) oder Admin
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { DeliveryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;

  // ── Auth ──────────────────────────────────────────────────────────
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  let token;
  try { token = await verifyAccessToken(auth.slice(7)); }
  catch { return NextResponse.json({ error: "Token ungültig" }, { status: 401 }); }

  const contract = await db.lotContract.findUnique({
    where:  { lotId },
    select: { id: true, sellerId: true, deliveryStatus: true },
  });
  if (!contract) {
    return NextResponse.json({ error: "Kontrakt nicht gefunden" }, { status: 404 });
  }

  const isOwner = contract.sellerId === token.userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(token.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  // CMR-Upload nur ab READY_FOR_PICKUP (Ware bereit) — nicht nach DELIVERED
  const allowedStatuses: DeliveryStatus[] = [
    DeliveryStatus.READY_FOR_PICKUP,
    DeliveryStatus.IN_TRANSIT,
  ];
  if (!allowedStatuses.includes(contract.deliveryStatus)) {
    return NextResponse.json(
      { error: `CMR-Upload nur in Status READY_FOR_PICKUP oder IN_TRANSIT möglich. Aktuell: '${contract.deliveryStatus}'` },
      { status: 409 }
    );
  }

  // ── Datei aus multipart/form-data lesen ──────────────────────────
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

  // Als Base64 in der DB speichern (Phase 2: Vercel Blob / S3)
  const arrayBuffer = await file.arrayBuffer();
  const base64      = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl     = `data:${file.type};base64,${base64}`;

  const updated = await db.lotContract.update({
    where: { id: contract.id },
    data:  {
      cmrDocument:    dataUrl,
      cmrUploadedAt:  new Date(),
      // Automatischer Übergang zu IN_TRANSIT wenn noch READY_FOR_PICKUP
      deliveryStatus: contract.deliveryStatus === DeliveryStatus.READY_FOR_PICKUP
        ? DeliveryStatus.IN_TRANSIT
        : contract.deliveryStatus,
    },
    select: {
      id:             true,
      lotId:          true,
      deliveryStatus: true,
      cmrUploadedAt:  true,
    },
  });

  return NextResponse.json({
    ...updated,
    fileName:  file.name,
    fileSizeMb: (file.size / 1024 / 1024).toFixed(2),
  }, { status: 201 });
}
