/**
 * GET /api/sessions/active
 * Returns the currently active trading session with product info.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await db.tradingSession.findFirst({
      where: {
        currentStatus: {
          in: ["PRE_TRADING", "TRADING_1", "CORRECTION_1", "TRADING_2", "CORRECTION_2"],
        },
      },
      orderBy: { scheduledStart: "desc" },
      include: {
        product: {
          select: {
            id: true,
            form: true,
            grade: true,
            diameterMm: true,
            standard: true,
            originCountry: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({
      session: {
        id:            session.id,
        status:        session.currentStatus,
        scheduledStart: session.scheduledStart,
        product: {
          id:            session.product.id,
          form:          session.product.form,
          grade:         session.product.grade,
          diameterMm:    session.product.diameterMm?.toString() ?? null,
          standard:      session.product.standard,
          originCountry: session.product.originCountry,
        },
      },
    });
  } catch (err) {
    console.error("[/api/sessions/active]", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
