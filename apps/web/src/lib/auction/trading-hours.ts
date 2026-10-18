/**
 * Handelszeiten EUCX — einzige Quelle der Wahrheit.
 * Änderungen hier wirken auf alle Lot-Öffnungs-, Registrierungs- und Cron-Logik.
 *
 * Aktuelle Handelssitzung: Mo–Fr 13:00–15:00 Europe/Berlin
 */

export const TRADING_SLOT_START_HOUR = 13; // 13:00 Europe/Berlin
export const TRADING_SLOT_END_HOUR   = 15; // 15:00 Europe/Berlin
export const TRADING_SLOT_TIMEZONE   = "Europe/Berlin";

/**
 * Gibt den UTC-Zeitpunkt für das Sitzungsende (SLOT_END_HOUR) an einem
 * bestimmten Berliner Kalendertag zurück.
 */
export function berlinSlotEndUtc(year: number, month: number, day: number): Date {
  const midnightUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const berlinHourAtMidnight = parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TRADING_SLOT_TIMEZONE, hour: "2-digit", hour12: false,
    }).format(midnightUTC),
    10,
  );
  const utcHour = TRADING_SLOT_END_HOUR - berlinHourAtMidnight;
  return new Date(Date.UTC(year, month, day, utcHour, 0, 0));
}

/**
 * Gibt das UTC-Ende der nächsten offenen Handelssitzung zurück.
 * Sucht maximal 14 Tage voraus.
 */
export function getNextTradingSlotEnd(now: Date): Date {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TRADING_SLOT_TIMEZONE,
    year:     "numeric",
    month:    "2-digit",
    day:      "2-digit",
    hour:     "2-digit",
    hour12:   false,
  });

  for (let offset = 0; offset < 14; offset++) {
    const d     = new Date(now.getTime() + offset * 86_400_000);
    const parts = fmt.formatToParts(d);
    const get   = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const wd    = d.getUTCDay(); // 0=So, 1=Mo, …, 5=Fr, 6=Sa
    const berlinHour = parseInt(get("hour"), 10);
    const isToday    = offset === 0;

    // Nur Mo–Fr
    if (wd === 0 || wd === 6) continue;
    // Heute nach Sitzungsende → nächsten Tag
    if (isToday && berlinHour >= TRADING_SLOT_END_HOUR) continue;

    const year  = parseInt(get("year"),  10);
    const month = parseInt(get("month"), 10) - 1;
    const day   = parseInt(get("day"),   10);
    return berlinSlotEndUtc(year, month, day);
  }

  // Fallback: +2 Stunden
  return new Date(now.getTime() + 2 * 60 * 60 * 1000);
}

/**
 * Prüft ob `now` in einer aktiven Handelssitzung liegt (Mo–Fr 13:00–15:00 Berlin).
 */
export function isInTradingSlot(now: Date): boolean {
  const berlinTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: TRADING_SLOT_TIMEZONE,
    weekday:  "short",
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }).formatToParts(now);

  const wd   = berlinTime.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(berlinTime.find((p) => p.type === "hour")?.value   ?? "0", 10);
  const min  = parseInt(berlinTime.find((p) => p.type === "minute")?.value ?? "0", 10);

  const isWeekday = !["Sun", "Sat"].includes(wd);
  const mins      = hour * 60 + min;
  return isWeekday && mins >= TRADING_SLOT_START_HOUR * 60 && mins < TRADING_SLOT_END_HOUR * 60;
}
