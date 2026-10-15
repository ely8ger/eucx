/**
 * NotificationService - zentrale Schnittstelle für alle Benachrichtigungen
 *
 * Erstellt Notification-Datensätze in der DB und löst bei Bedarf
 * E-Mail-Versand aus (abhängig von NotificationPreference des Users).
 *
 * Aufrufpunkte:
 *   • bids/route.ts          → notifyOutbid, notifyLeading
 *   • auction-timer.ts       → notifyUrgency10m, notifyUrgency5m, notifyAuctionClosed
 *   • lot-phase-auto-start   → notifyAuctionStart
 *   • post-trade.ts          → notifyContractGenerated
 *   • admin/kyc/[userId]     → notifyKycInquiry, notifyKycApproved, notifyKycRejected
 *   • auction/lots/dispute   → notifyDisputeOpened
 *   • auction/payment-sent   → notifyPaymentReported
 *   • auction/buyer-delivery → notifyDeliveryConfirmed
 */

import { db } from "@/lib/db/client";
import type { NotifType } from "@prisma/client";
import { sendAuctionMail } from "./mailer";

// ─── Öffentliche API ──────────────────────────────────────────────────────────

/**
 * Verkäufer wurde überboten - neues Bestgebot liegt unter seinem Gebot.
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
    message: `Neuer Bestpreis: ${formatEur(newBestPrice)} - Reagieren Sie jetzt.`,
  });

  // E-Mail wenn Präferenz aktiv (fire-and-forget)
  sendMailIfEnabled(outbidSellerId, "emailOnOutbid", {
    subject: "Achtung: Sie wurden überboten - EUCX Auktion",
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
 * @deprecated ZAG: kein Wallet-Balance mehr — Funktion ist no-op
 */
export async function notifyDepositWarn(
  _sellerId:       string,
  _lotId:          string,
  _currentBalance: string,
  _required:       string,
): Promise<void> {
  // ZAG-Compliance: EUCX hält keine Kundengelder mehr → keine Depot-Warnung
}

/**
 * 10 Minuten vor Auktionsende - für alle registrierten Teilnehmer + Käufer.
 * Idempotent: erstellt max. eine URGENCY_10M-Notification pro User+Lot.
 */
export async function notifyUrgency10m(lotId: string): Promise<void> {
  await notifyUrgency(lotId, "URGENCY_10M", "Finale Phase beginnt!", "Noch 10 Minuten bis Auktionsende - reagieren Sie jetzt.");
}

/**
 * 5 Minuten vor Auktionsende.
 */
export async function notifyUrgency5m(lotId: string): Promise<void> {
  await notifyUrgency(lotId, "URGENCY_5M", "Nur noch 5 Minuten!", "Letzte Chance - Auktion endet in 5 Minuten.");
}

/**
 * Auktion abgeschlossen - Gewinner, Verlierer und Käufer benachrichtigen.
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
        ? `Glückwunsch - Sie haben gewonnen: ${commodity}`
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
    message: `Siegergebot: ${formatEur(finalPrice)} - Kaufvertrag ${contractNumber} wurde generiert.`,
  });

  sendMailIfEnabled(buyerId, "emailOnAuctionEnd", {
    subject: `Auktionsergebnis: ${commodity} - EUCX`,
    template: "auction_closed_buyer",
    data: { commodity, finalPrice, contractNumber, lotId, notifId: buyerNotif.id },
  }).catch(console.error);
}

/**
 * Angebotsphase geöffnet — alle registrierten Verkäufer benachrichtigen.
 */
export async function notifyAuctionStart(
  lotId:     string,
  commodity: string,
  startPrice: string,
  auctionEndIso: string,
): Promise<void> {
  const registrations = await db.lotRegistration.findMany({
    where:  { lotId },
    select: { sellerId: true },
  });

  for (const { sellerId } of registrations) {
    const existing = await db.notification.findFirst({
      where: { userId: sellerId, lotId, type: "AUCTION_START" },
      select: { id: true },
    });
    if (existing) continue;

    await createNotification({
      userId:  sellerId,
      lotId,
      type:    "AUCTION_START",
      title:   `Angebotsphase geöffnet: ${commodity}`,
      message: `Startpreis: ${formatEur(startPrice)}. Geben Sie Ihr Angebot bis ${new Date(auctionEndIso).toLocaleString("de-DE")} ab.`,
    });

    sendMailIfEnabled(sellerId, "emailOnAuctionStart", {
      subject:  `Angebotsphase geöffnet: ${commodity} - EUCX`,
      template: "auction_start",
      data:     { commodity, startPrice, auctionEnd: auctionEndIso, lotId },
    }).catch(console.error);
  }
}

/**
 * Kaufvertrag erstellt — Käufer und Verkäufer benachrichtigen.
 */
export async function notifyContractGenerated(
  buyerUserId:    string,
  sellerUserId:   string,
  contractNumber: string,
  commodity:      string,
  totalValue:     string,
  feeAmount:      string,
  lotId:          string,
): Promise<void> {
  await createNotification({
    userId:  buyerUserId,
    lotId,
    type:    "CONTRACT_GENERATED",
    title:   `Kaufvertrag ${contractNumber} erstellt`,
    message: `Ihr Kaufvertrag für ${commodity} (Gesamtwert: ${formatEur(totalValue)}) steht zum Download bereit.`,
  });

  await createNotification({
    userId:  sellerUserId,
    lotId,
    type:    "CONTRACT_GENERATED",
    title:   `Kaufvertrag ${contractNumber} erstellt`,
    message: `Ihr Verkaufsvertrag für ${commodity} (Gesamtwert: ${formatEur(totalValue)}) steht zum Download bereit.`,
  });

  sendMailIfEnabled(buyerUserId, "emailOnContract", {
    subject:  `Kaufvertrag ${contractNumber} - EUCX`,
    template: "contract_buyer",
    data:     { contractNumber, commodity, totalValue, feeAmount, lotId },
  }).catch(console.error);

  sendMailIfEnabled(sellerUserId, "emailOnContract", {
    subject:  `Kaufvertrag ${contractNumber} - EUCX`,
    template: "contract_seller",
    data:     { contractNumber, commodity, totalValue, feeAmount, lotId },
  }).catch(console.error);
}

/**
 * KYC-Rückfrage — Nutzer in-app benachrichtigen (E-Mail läuft separat in admin route).
 */
export async function notifyKycInquiry(
  userId:  string,
  orgName: string,
  message: string,
): Promise<void> {
  const existing = await db.notification.findFirst({
    where: { userId, type: "KYC_INQUIRY" },
    select: { id: true },
  });
  if (existing) {
    await db.notification.update({ where: { id: existing.id }, data: { isRead: false, message } });
    return;
  }

  await createNotification({
    userId,
    type:    "KYC_INQUIRY",
    title:   "KYC-Rückfrage",
    message: `Compliance hat eine Rückfrage zu den Unterlagen von ${orgName}.`,
  });
}

/**
 * KYC genehmigt.
 */
export async function notifyKycApproved(userId: string, orgName: string): Promise<void> {
  await createNotification({
    userId,
    type:    "KYC_APPROVED",
    title:   "KYC genehmigt",
    message: `Die Verifizierung für ${orgName} wurde erfolgreich abgeschlossen. Sie haben vollen Handelszugang.`,
  });

  sendMailIfEnabled(userId, "emailOnKyc", {
    subject:  "KYC genehmigt - EUCX",
    template: "registration_approved",
    data:     { orgName, email: "", role: "Teilnehmer" },
  }).catch(console.error);
}

/**
 * KYC abgelehnt.
 */
export async function notifyKycRejected(userId: string, orgName: string, reason: string): Promise<void> {
  await createNotification({
    userId,
    type:    "KYC_REJECTED",
    title:   "KYC abgelehnt",
    message: `Die Verifizierung für ${orgName} wurde abgelehnt. Bitte wenden Sie sich an support@eucx.eu.`,
  });

  sendMailIfEnabled(userId, "emailOnKyc", {
    subject:  "KYC-Entscheidung - EUCX",
    template: "registration_rejected",
    data:     { orgName, reason },
  }).catch(console.error);
}

/**
 * Streitfall eröffnet — beide Parteien benachrichtigen.
 */
export async function notifyDisputeOpened(
  buyerUserId:  string,
  sellerUserId: string,
  disputeId:    string,
  contractId:   string,
  lotId:        string,
  reason:       string,
  raisedByRole: string,
): Promise<void> {
  const msg = `Streitfall zu Kontrakt ${contractId.slice(0, 8).toUpperCase()} eröffnet: ${reason.slice(0, 80)}`;

  await createNotification({
    userId:  buyerUserId,
    lotId,
    type:    "DISPUTE_OPENED",
    title:   "Streitfall eröffnet",
    message: msg,
  });

  await createNotification({
    userId:  sellerUserId,
    lotId,
    type:    "DISPUTE_OPENED",
    title:   "Streitfall eröffnet",
    message: msg,
  });

  const notifyParty = raisedByRole === "BUYER" ? sellerUserId : buyerUserId;
  sendMailIfEnabled(notifyParty, "emailOnDispute", {
    subject:  `Streitfall eröffnet - Kontrakt ${contractId.slice(0, 8).toUpperCase()} - EUCX`,
    template: "dispute_opened_admin",
    data:     { disputeId, contractId, lotId, reason, raisedByRole, openedAt: new Date().toISOString() },
  }).catch(console.error);
}

/**
 * Zahlung gemeldet — Verkäufer in-app + E-Mail.
 */
export async function notifyPaymentReported(
  sellerUserId:   string,
  contractNumber: string,
  lotId:          string,
  totalValue:     string,
  reportedAt:     string,
): Promise<void> {
  await createNotification({
    userId:  sellerUserId,
    lotId,
    type:    "PAYMENT_REPORTED",
    title:   "Zahlung gemeldet",
    message: `Käufer hat Zahlung für Kontrakt ${contractNumber} (${formatEur(totalValue)}) als angewiesen gemeldet.`,
  });
}

/**
 * Wareneingang bestätigt — Verkäufer in-app.
 */
export async function notifyDeliveryConfirmed(
  sellerUserId:   string,
  contractNumber: string,
  lotId:          string,
  deliveredAt:    string,
): Promise<void> {
  await createNotification({
    userId:  sellerUserId,
    lotId,
    type:    "DELIVERY_CONFIRMED",
    title:   "Wareneingang bestätigt",
    message: `Käufer hat Wareneingang für Kontrakt ${contractNumber} bestätigt (${new Date(deliveredAt).toLocaleDateString("de-DE")}).`,
  });
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
  prefKey:  "emailOnOutbid" | "emailOnAuctionEnd" | "emailOnAuctionStart" | "emailOnContract" | "emailOnKyc" | "emailOnDispute",
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
