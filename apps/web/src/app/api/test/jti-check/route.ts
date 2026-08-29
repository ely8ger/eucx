import { NextRequest, NextResponse } from "next/server";
import { isJtiBlacklisted }          from "@/lib/auth/token-blacklist";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nur in Dev/Test verfügbar" }, { status: 403 });
  }
  const jti = req.nextUrl.searchParams.get("jti");
  if (!jti) return NextResponse.json({ blacklisted: false });
  const blacklisted = await isJtiBlacklisted(jti);
  return NextResponse.json({ blacklisted });
}
