import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
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
            category:          true,
            subcategory:       true,
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
