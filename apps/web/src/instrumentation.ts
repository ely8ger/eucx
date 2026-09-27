/**
 * Next.js Instrumentation Hook - läuft einmalig beim Server-Start.
 *
 * Aufgaben:
 *   1. Env-Validierung: fehlende Pflicht-Vars crashen sofort, nicht beim ersten Request
 *   2. Boot-Log: strukturierter JSON-Log mit Version und Umgebung
 *
 * Dokumentation: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Nur auf dem Server ausführen (nicht in Edge/Client-Bundles)
  if (process.env.NEXT_RUNTIME === "edge") return;

  // ── 1. Env-Validierung ────────────────────────────────────────────────────
  const { getEnv } = await import("@/lib/env");
  const e = getEnv(); // wirft FATAL bei fehlenden Pflicht-Vars

  // ── 2. Boot-Log ───────────────────────────────────────────────────────────
  const pkg = { version: process.env.npm_package_version ?? "unbekannt" };
  console.log(
    JSON.stringify({
      level:   "INFO",
      service: "eucx-web",
      event:   "SERVER_BOOT",
      env:     e.NODE_ENV,
      version: pkg.version,
      redis:   !!e.UPSTASH_REDIS_REST_URL,
      cron:    !!e.CRON_SECRET,
      ts:      new Date().toISOString(),
    })
  );
}
