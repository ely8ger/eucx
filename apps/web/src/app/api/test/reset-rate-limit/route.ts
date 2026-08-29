/**
 * DELETE /api/test/reset-rate-limit
 *
 * Nur in Dev/Test-Umgebung aktiv. Setzt den In-Memory-Rate-Limit-Speicher zurück.
 * Wird von E2E-Tests genutzt, um einen sauberen Zustand vor Rate-Limit-Tests herzustellen.
 *
 * In Production (NODE_ENV=production) wird immer 403 zurückgegeben.
 */
import { NextResponse } from "next/server";
import { resetMemoryStore } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nicht verfügbar" }, { status: 403 });
  }
  resetMemoryStore();
  return NextResponse.json({ ok: true, message: "In-Memory-Rate-Limit-Speicher zurückgesetzt" });
}
