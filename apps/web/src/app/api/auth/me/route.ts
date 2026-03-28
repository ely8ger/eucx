/**
 * GET /api/auth/me
 *
 * Gibt das eigene User-Profil zurück (verificationStatus, isYoungCompany, walletBalance).
 * Wird vom Frontend für Status-Badge und KYC-Overlay verwendet.
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

  const user = await db.user.findUnique({
    where:  { id: token.userId },
    select: {
      id:                 true,
      email:              true,
      role:               true,
      status:             true,
      verificationStatus: true,
      isYoungCompany:     true,
      companyFoundedAt:   true,
      organizationId:     true,
      organization: {
        select: {
          id:         true,
          name:       true,
          isVerified: true,
          wallet: {
            select: { balance: true, reservedBalance: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({
    id:                 user.id,
    email:              user.email,
    role:               user.role,
    status:             user.status,
    verificationStatus: user.verificationStatus,
    isYoungCompany:     user.isYoungCompany,
    companyFoundedAt:   user.companyFoundedAt?.toISOString() ?? null,
    organization: {
      id:         user.organization.id,
      name:       user.organization.name,
      isVerified: user.organization.isVerified,
    },
    walletBalance:  user.organization.wallet?.balance?.toString()         ?? "0",
    walletReserved: user.organization.wallet?.reservedBalance?.toString() ?? "0",
  });
}
