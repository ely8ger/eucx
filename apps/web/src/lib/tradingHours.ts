/**
 * EUCX Handelszeiten: Montag–Freitag 10:00–13:00 MEZ/MESZ (Europe/Berlin)
 */

export interface TradingStatus {
  isOpen:        boolean;
  secondsLeft:   number;   // bis Schließung (isOpen) oder bis Öffnung (geschlossen)
  opensAt:       Date;     // nächste Öffnung
  closesAt:      Date;     // heutige/aktuelle Schließung
  isTodayTrading: boolean; // ist heute ein Handelstag (Mo-Fr)?
  tzLabel:       string;   // "MEZ" oder "MESZ"
}

const OPEN_HOUR  = 10;
const CLOSE_HOUR = 13;

/** Gibt Datum+Uhrzeit in der Europe/Berlin-Zeitzone zurück */
function berlinerzeit(date: Date): { h: number; m: number; s: number; weekday: number } {
  const f = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour:     "numeric",
    minute:   "numeric",
    second:   "numeric",
    weekday:  "long",
    hour12:   false,
  });
  const parts = f.formatToParts(date);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);

  const wdString = parts.find((p) => p.type === "weekday")?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4, Freitag: 5, Samstag: 6, Sonntag: 0,
  };
  return { h: get("hour"), m: get("minute"), s: get("second"), weekday: weekdayMap[wdString] ?? 0 };
}

function isTradingDay(weekday: number) {
  return weekday >= 1 && weekday <= 5; // Mo=1 … Fr=5
}

/** MEZ = UTC+1, MESZ = UTC+2  (grobe Prüfung via Offset-Differenz) */
function tzLabel(date: Date): string {
  const offsetMin = -date.getTimezoneOffset(); // im Browser
  // Alternativ: parse Berlin-Offset aus Intl
  const berlinStr = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin", timeZoneName: "short",
  }).formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "MEZ";
  return berlinStr; // "MEZ" oder "MESZ"
}

/** Berechnet nächste Öffnungszeit (UTC) */
function nextOpenUTC(now: Date): Date {
  // Suche nächsten Handelstag ab morgen früh
  const candidate = new Date(now);
  for (let day = 1; day <= 7; day++) {
    candidate.setUTCDate(now.getUTCDate() + day);
    const bz = berlinerzeit(candidate);
    if (isTradingDay(bz.weekday)) {
      // Setze auf 10:00:00 Berlin — näherungsweise: wir suchen UTC-Zeitpunkt
      // Einfacher Ansatz: nutze Date.UTC + Zeitzone-Offset
      const approx = new Date(
        candidate.toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" }) +
        `T${String(OPEN_HOUR).padStart(2, "0")}:00:00`,
      );
      // Das erzeugt lokale Zeit, daher korrekter Ansatz via Intl:
      const berlinMidnight = new Date(
        new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(candidate) +
        "T00:00:00",
      );
      // Offset Europe/Berlin in Minuten ermitteln
      const utcMs = berlinMidnight.getTime();
      // Gib UTC-Zeitpunkt für 10:00 Berlin zurück
      const openUtc = new Date(utcMs + OPEN_HOUR * 3600 * 1000);
      return openUtc;
    }
  }
  return candidate; // Fallback
}

export function getTradingStatus(now: Date = new Date()): TradingStatus {
  const bz      = berlinerzeit(now);
  const isToday = isTradingDay(bz.weekday);

  // Sekunden seit Mitternacht Berlin
  const secInDay = bz.h * 3600 + bz.m * 60 + bz.s;
  const openSec  = OPEN_HOUR  * 3600;
  const closeSec = CLOSE_HOUR * 3600;

  const isOpen = isToday && secInDay >= openSec && secInDay < closeSec;

  // closesAt: heute 13:00 Uhr Berlin → UTC approx
  const berlinDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
  const closesAt = new Date(`${berlinDateStr}T${String(CLOSE_HOUR).padStart(2, "0")}:00:00`);
  closesAt.setTime(closesAt.getTime() - closesAt.getTimezoneOffset() * 60000 +
    (new Date(berlinDateStr + "T00:00:00").getTimezoneOffset() * 60000));

  // Korrektere Berechnung: einfach Offset aus Now ableiten
  // Berlin-Offset in Millisekunden:
  const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const berlinOffset = now.getTime() - berlinNow.getTime(); // ms

  const closesAtUTC = new Date(
    new Date(berlinDateStr + "T13:00:00").getTime() + berlinOffset,
  );
  const opensAtUTC = new Date(
    new Date(berlinDateStr + "T10:00:00").getTime() + berlinOffset,
  );

  let secondsLeft: number;
  let opensAt: Date;

  if (isOpen) {
    secondsLeft = Math.max(0, Math.floor((closesAtUTC.getTime() - now.getTime()) / 1000));
    opensAt = opensAtUTC; // heutige Öffnung (bereits vergangen, aber als Referenz)
  } else if (isToday && secInDay < openSec) {
    // Noch nicht geöffnet heute
    secondsLeft = Math.max(0, Math.floor((opensAtUTC.getTime() - now.getTime()) / 1000));
    opensAt = opensAtUTC;
  } else {
    // Geschlossen — nächsten Handelstag suchen
    opensAt = nextOpenUTC(now);
    secondsLeft = Math.max(0, Math.floor((opensAt.getTime() - now.getTime()) / 1000));
  }

  return {
    isOpen,
    secondsLeft,
    opensAt,
    closesAt: closesAtUTC,
    isTodayTrading: isToday,
    tzLabel: tzLabel(now),
  };
}

export function fmtCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
