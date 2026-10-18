/**
 * Sendet nach erfolgreichem Cron-Lauf einen Fire-and-Forget-Ping an HEALTHCHECK_CRON_URL.
 * Dienste wie BetterUptime, UptimeRobot oder Healthchecks.io empfangen diesen Ping
 * und alarmieren, wenn der Cron zu lange ausbleibt (Dead-Man's-Switch-Prinzip).
 *
 * Die Funktion blockiert nie — Fehler werden geloggt, aber das Cron-Ergebnis bleibt unberührt.
 */
export function pingCronHealthcheck(cronName: string): void {
  const url = process.env.HEALTHCHECK_CRON_URL;
  if (!url) return;

  void fetch(url, { method: "GET", signal: AbortSignal.timeout(5_000) })
    .catch((err) => {
      console.error(`[healthcheck] Ping für ${cronName} fehlgeschlagen:`, err);
    });
}
