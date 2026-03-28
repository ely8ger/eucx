/**
 * GET /api/kyc/documents
 *
 * Gibt die eigenen KYC-Dokumente des eingeloggten Users zurück.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let token;
  try {
    token = await verifyAccessToken(req.headers.get("authorization")?.slice(7) ?? "");
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const docs = await db.kycDocument.findMany({
    where:   { userId: token.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id:        true,
      name:      true,
      type:      true,
      sizeMb:    true,
      status:    true,
      adminNote: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    documents: docs.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  });
}
