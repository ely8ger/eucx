/**
 * POST /api/kyc/submit
 *
 * Setzt verificationStatus auf PENDING_VERIFICATION.
 * Speichert hochgeladene Dokumente als AssetDocument-ähnliche Einträge
 * oder als JSON-Metadaten in einem temporären KYC-Feld.
 *
 * Da das User-Modell kein direktes documents-Feld hat, wird der Status
 * auf PENDING_VERIFICATION gesetzt - Admin sieht alle solchen User im KYC-Center.
 */
import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken }         from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";
import { z }                         from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  // Dokument-Metadaten (URLs aus vorherigem Upload-Schritt)
  documents: z.array(z.object({
    name:     z.string(),
    url:      z.string().optional(),
    type:     z.string(),
    sizeMb:   z.number(),
  })).min(1, "Mindestens ein Dokument erforderlich"),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    tokenPayload = await verifyAccessToken(authHeader?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, { status: 422 });
  }

  const user = await db.user.findUnique({
    where:  { id: tokenPayload.userId },
    select: { verificationStatus: true },
  });

  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  if (user.verificationStatus === "VERIFIED") {
    return NextResponse.json({ error: "Ihr Konto ist bereits verifiziert" }, { status: 409 });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tokenPayload.userId },
      data:  { verificationStatus: "PENDING_VERIFICATION" },
    });

    // KYC-Dokumente persistieren
    for (const doc of parsed.data.documents) {
      await tx.kycDocument.create({
        data: {
          userId: tokenPayload.userId,
          name:   doc.name,
          url:    doc.url ?? null,
          type:   doc.type,
          sizeMb: doc.sizeMb,
          notes:  parsed.data.notes ?? null,
        },
      });
    }
  });

  await audit({
    userId:     tokenPayload.userId,
    action:     "ADMIN_ACTION",
    entityType: "User",
    entityId:   tokenPayload.userId,
    ipAddress:  req.headers.get("x-forwarded-for") ?? "unknown",
    userAgent:  req.headers.get("user-agent") ?? "",
    meta:       {
      kycAction:     "SUBMITTED",
      documentCount: parsed.data.documents.length,
      documents:     parsed.data.documents.map((d) => ({ name: d.name, type: d.type })),
    },
  });

  return NextResponse.json({ ok: true, message: "KYC-Antrag eingereicht. Sie werden benachrichtigt sobald Ihr Konto verifiziert ist." });
}
