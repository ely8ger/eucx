/**
 * NotificationService — zentrale Schnittstelle für alle Benachrichtigungen
 *
 * Erstellt Notification-Datensätze in der DB und löst bei Bedarf
 * E-Mail-Versand aus (abhängig von NotificationPreference des Users).
 *
 * Aufrufpunkte:
 *   • bids/route.ts     → notifyOutbid, notifyLeading, notifyDepositWarn
 *   • auction-timer.ts  → notifyUrgency10m, notifyUrgency5m, notifyAuctionClosed
 */

import { db } from "@/lib/db/client";
import type { NotifType } from "@prisma/client";
import { sendAuctionMail } from "./mailer";

// ─── Öffentliche API ──────────────────────────────────────────────────────────

/**
 * Verkäufer wurde überboten — neues Bestgebot liegt unter seinem Gebot.
 * @param outbidSellerId  User-ID des überbotenen Verkäufers
 * @param lotId
 * @param newBestPrice    Neuer Bestpreis (€/Einheit) als String
 * @param previousRank    Vorheriger Rang des Verkäufers (war 1 = Führender)
 */
export async function notifyOutbid(
  outbidSellerId: string,
  lotId: string,
  newBestPrice:   string,
  previousRank:   number,
): Promise<void> {
  if (previousRank !== 1) return; // Nur relevante Benachrichtigung wenn Führender überboten

  const notif = await createNotification({
    userId:  outbidSellerId,
    lotId,
    type:    "OUTBID",
    title:   "Sie wurden überboten!",
    message: `Neuer Bestpreis: ${formatEur(newBestPrice)} — Reagieren Sie jetzt.`,
  });

  // E-Mail wenn Präferenz aktiv (fire-and-forget)
  sendMailIfEnabled(outbidSellerId, "emailOnOutbid", {
    subject: "Achtung: Sie wurden überboten — EUCX Auktion",
    template: "outbid",
    data: { newBestPrice, lotId, notifId: notif.id },
  }).catch(console.error);
}

/**
 * Verkäufer führt jetzt (hat gerade das beste Gebot abgegeben).
 */
export async function notifyLeading(sellerId: string, lotId: string, price: string): Promise<void> {
  await createNotification({
    userId:  sellerId,
    lotId,
    type:    "LEADING",
    title:   "Ihr Gebot führt!",
    message: `${formatEur(price)} ist aktuell das beste Angebot in dieser Auktion.`,
  });
  // Kein E-Mail für LEADING (nicht in Präferenz-Schema)
}

/**
 * Depot-Warnung: Wallet-Saldo unter 110% der 5%-Schwelle.
 */
export async function notifyDepositWarn(
  sellerId:       string,
  lotId:          string,
  currentBalance: string,
  required:       string,
): Promise<void> {
  // Dedup: Max 1 Warnung pro Lot pro Seller
  const existing = await db.notification.findFirst({
    where: { userId: sellerId, lotId, type: "DEPOSIT_WARN" },
    select: { id: true },
  });
  if (existing) return;

  await createNotification({
    userId:  sellerId,
    lotId,
    type:    "DEPOSIT_WARN",
    title:   "Depot-Warnung",
    message: `Ihr Guthaben (${formatEur(currentBalance)}) nähert sich der erforderlichen 5%-Sicherheitsleistung von ${formatEur(required)}.`,
  });
}

/**
 * 10 Minuten vor Auktionsende — für alle registrierten Teilnehmer + Käufer.
 * Idempotent: erstellt max. eine URGENCY_10M-Notification pro User+Lot.
 */
export async function notifyUrgency10m(lotId: string): Promise<void> {
  await notifyUrgency(lotId, "URGENCY_10M", "Finale Phase beginnt!", "Noch 10 Minuten bis Auktionsende — reagieren Sie jetzt.");
}

/**
 * 5 Minuten vor Auktionsende.
 */
export async function notifyUrgency5m(lotId: string): Promise<void> {
  await notifyUrgency(lotId, "URGENCY_5M", "Nur noch 5 Minuten!", "Letzte Chance — Auktion endet in 5 Minuten.");
}

/**
 * Auktion abgeschlossen — Gewinner, Verlierer und Käufer benachrichtigen.
 */
export async function notifyAuctionClosed(
  lotId:          string,
  winnerId:       string,
  buyerId:        string,
  commodity:      string,
  finalPrice:     string,
  contractNumber: string,
): Promise<void> {
  // Alle registrierten Verkäufer laden
  const registrations = await db.lotRegistration.findMany({
    where:  { lotId },
    select: { sellerId: true },
  });

  const allSellerIds = registrations.map((r) => r.sellerId);

  for (const sellerId of allSellerIds) {
    const isWinner = sellerId === winnerId;

    const notif = await createNotification({
      userId:  sellerId,
      lotId,
      type:    isWinner ? "WON" : "LOST",
      title:   isWinner ? `Gewonnen: ${commodity}` : `Auktion beendet: ${commodity}`,
      message: isWinner
        ? `Ihr Siegergebot von ${formatEur(finalPrice)} wurde akzeptiert. Vertrag: ${contractNumber}`
        : `Die Auktion wurde abgeschlossen. Siegergebot: ${formatEur(finalPrice)}`,
    });

    // E-Mail an Gewinner + Verlierer (emailOnAuctionEnd-Präferenz)
    sendMailIfEnabled(sellerId, "emailOnAuctionEnd", {
      subject: isWinner
        ? `Glückwunsch — Sie haben gewonnen: ${commodity}`
        : `Auktion beendet: ${commodity}`,
      template: isWinner ? "auction_won" : "auction_lost",
      data: { commodity, finalPrice, contractNumber, lotId, notifId: notif.id },
    }).catch(console.error);
  }

  // Käufer benachrichtigen
  const buyerNotif = await createNotification({
    userId:  buyerId,
    lotId,
    type:    "CLOSED_BUYER",
    title:   `Auktion abgeschlossen: ${commodity}`,
    message: `Siegergebot: ${formatEur(finalPrice)} — Kaufvertrag ${contractNumber} wurde generiert.`,
  });

  sendMailIfEnabled(buyerId, "emailOnAuctionEnd", {
    subject: `Auktionsergebnis: ${commodity} — EUCX`,
    template: "auction_closed_buyer",
    data: { commodity, finalPrice, contractNumber, lotId, notifId: buyerNotif.id },
  }).catch(console.error);
}

// ─── Interne Hilfsfunktionen ──────────────────────────────────────────────────

async function notifyUrgency(
  lotId:   string,
  type:    "URGENCY_10M" | "URGENCY_5M",
  title:   string,
  message: string,
): Promise<void> {
  // Alle Teilnehmer (registrierte Verkäufer + Käufer)
  const lot = await db.lot.findUnique({
    where:  { id: lotId },
    select: {
      buyerId:       true,
      registrations: { select: { sellerId: true } },
    },
  });
  if (!lot) return;

  const participantIds = [
    lot.buyerId,
    ...lot.registrations.map((r) => r.sellerId),
  ];

  for (const userId of participantIds) {
    // Dedup: max 1 pro Typ+User+Lot
    const existing = await db.notification.findFirst({
      where: { userId, lotId, type },
      select: { id: true },
    });
    if (existing) continue;

    await createNotification({ userId, lotId, type, title, message });
  }
}

interface NotifInput {
  userId:  string;
  lotId?:  string;
  type:    NotifType;
  title:   string;
  message: string;
}

async function createNotification(input: NotifInput) {
  return db.notification.create({
    data: {
      userId:  input.userId,
      lotId:   input.lotId,
      type:    input.type,
      title:   input.title,
      message: input.message,
    },
  });
}

interface MailParams {
  subject:  string;
  template: string;
  data:     Record<string, string>;
}

async function sendMailIfEnabled(
  userId:   string,
  prefKey:  "emailOnOutbid" | "emailOnAuctionEnd" | "emailOnAuctionStart",
  mail:     MailParams,
): Promise<void> {
  const [user, pref] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { email: true } }),
    db.notificationPreference.findUnique({ where: { userId }, select: { [prefKey]: true } }),
  ]);

  if (!user) return;

  // Default: E-Mail aktiv wenn keine Präferenz gespeichert
  const enabled = pref ? (pref as Record<string, boolean>)[prefKey] !== false : true;
  if (!enabled) return;

  await sendAuctionMail({
    to:       user.email,
    subject:  mail.subject,
    template: mail.template,
    data:     mail.data,
  });
}

function formatEur(value: string): string {
  return parseFloat(value).toLocaleString("de-DE", {
    style:                 "currency",
    currency:              "EUR",
    minimumFractionDigits: 2,
  });
}
