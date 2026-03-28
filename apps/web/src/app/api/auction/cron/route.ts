/**
 * POST /api/auction/cron
 *
 * Interner Endpunkt — wird von einem Cron-Job (z.B. Vercel Cron, GitHub Actions,
 * oder externem Scheduler) jede Minute aufgerufen.
 *
 * Schließt alle Auktionen, deren auctionEnd in der Vergangenheit liegt.
 *
 * Authentifizierung: CRON_SECRET (Bearer Header)
 * → In Vercel: automatisch gesetzt wenn "vercel.json" Cron konfiguriert ist.
 * → Sonst: env-Variable CRON_SECRET setzen.
 */
import { NextRequest, NextResponse } from "next/server";
import { runAuctionTimer } from "@/lib/auction/auction-timer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || secret !== expected) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const result = await runAuctionTimer();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[AuctionCron] Fehler:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

// Vercel Cron: GET wird für Cron-Aufrufe von Vercel genutzt (kein Bearer möglich)
export async function GET(req: NextRequest) {
  // Vercel setzt automatisch den Authorization-Header bei Cron-Jobs
  return POST(req);
}
