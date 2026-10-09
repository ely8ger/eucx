import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db/client";
import { verifyAccessToken, requireAuth } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // A4 — Auth (Middleware ist primärer Schutz, Defense-in-depth)
  let token;
  try { token = await requireAuth(req); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nicht autorisiert" }, { status: 401 }); }
  try {
    const session = await db.tradingSession.findFirst({
      where: {
        currentStatus: { in: ["PRE_TRADING", "TRADING_1", "CORRECTION_1", "TRADING_2", "CORRECTION_2"] },
      },
      orderBy: { scheduledStart: "desc" },
      include: {
        product: {
          select: {
            id:                true,
            categoryId:        true,
            name:              true,
            unit:              true,
            originCountry:     true,
          },
        },
      },
    });

    if (!session) return NextResponse.json({ session: null });

    return NextResponse.json({
      session: {
        id:             session.id,
        status:         session.currentStatus,
        scheduledStart: session.scheduledStart,
        product:        session.product,
      },
    });
  } catch (err) {
    console.error("[/api/sessions/active]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
