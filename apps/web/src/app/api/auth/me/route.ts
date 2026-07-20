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
      totpEnabled:        true,
      phoneVerified:      true,
      organization: {
        select: {
          id:                  true,
          name:                true,
          isVerified:          true,
          taxId:               true,
          lei:                 true,
          country:             true,
          city:                true,
          street:              true,
          postalCode:          true,
          phone:               true,
          hrb:                 true,
          legalForm:           true,
          foundedAt:           true,
          contactName:         true,
          contactPosition:     true,
          isGeschaeftsfuehrer: true,
          eoriNumber:          true,
          cbamAccountNumber:   true,
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
    totpEnabled:        user.totpEnabled,
    phoneVerified:      user.phoneVerified,
    organization: {
      id:                  user.organization.id,
      name:                user.organization.name,
      isVerified:          user.organization.isVerified,
      taxId:               user.organization.taxId,
      lei:                 user.organization.lei ?? null,
      country:             user.organization.country,
      city:                user.organization.city,
      street:              user.organization.street ?? null,
      postalCode:          user.organization.postalCode ?? null,
      phone:               user.organization.phone ?? null,
      hrb:                 user.organization.hrb ?? null,
      legalForm:           user.organization.legalForm ?? null,
      foundedAt:           user.organization.foundedAt?.toISOString() ?? null,
      contactName:         user.organization.contactName ?? null,
      contactPosition:     user.organization.contactPosition ?? null,
      isGeschaeftsfuehrer: user.organization.isGeschaeftsfuehrer ?? null,
      eoriNumber:          user.organization.eoriNumber ?? null,
      cbamAccountNumber:   user.organization.cbamAccountNumber ?? null,
    },
    walletBalance:  user.organization.wallet?.balance?.toString()         ?? "0",
    walletReserved: user.organization.wallet?.reservedBalance?.toString() ?? "0",
  });
}
