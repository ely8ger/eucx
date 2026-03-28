/**
 * KYC Guard & 5%-Deposit-Prüfung für Gebotsabgabe
 *
 * Check A: verificationStatus === VERIFIED (sonst 403 + kycRequired: true)
 * Check B: isYoungCompany → Wallet.balance >= 5% des Lot-Werts (sonst 403 + depositRequired)
 *
 * Lot-Wert = quantity × (currentBest ?? startPrice)
 * — falls kein Preis gesetzt: kein Depot-Check möglich → nur KYC-Check
 */

import { db } from "@/lib/db/client";
import Decimal from "decimal.js";

type GuardResult =
  | { ok: true }
  | { ok: false; error: string; code: number; kycRequired?: boolean; depositRequired?: boolean; missingAmount?: string };

export async function checkBidEligibility(userId: string, lotId: string): Promise<GuardResult> {
  const [user, lot] = await Promise.all([
    db.user.findUnique({
      where:  { id: userId },
      select: {
        verificationStatus: true,
        isYoungCompany:     true,
        organizationId:     true,
      },
    }),
    db.lot.findUnique({
      where:  { id: lotId },
      select: { quantity: true, currentBest: true, startPrice: true },
    }),
  ]);

  if (!user) return { ok: false, error: "Nutzer nicht gefunden", code: 404 };

  // ── Check A: KYC-Verifikation ────────────────────────────────────
  if (user.verificationStatus !== "VERIFIED") {
    const statusMsg: Record<string, string> = {
      GUEST:                "Bitte schließen Sie zuerst Ihr KYC-Profil ab.",
      PENDING_VERIFICATION: "Ihre Dokumente werden geprüft. Bitte warten Sie.",
      REJECTED:             "Ihre Verifizierung wurde abgelehnt. Bitte wenden Sie sich an den Support.",
      SUSPENDED:            "Ihr Konto ist gesperrt.",
    };
    return {
      ok:          false,
      error:       statusMsg[user.verificationStatus] ?? "Verifizierung erforderlich.",
      code:        403,
      kycRequired: true,
    };
  }

  // ── Check B: Junges Unternehmen → 5%-Depot ───────────────────────
  if (user.isYoungCompany && lot) {
    const pricePerUnit = lot.currentBest ?? lot.startPrice;

    if (pricePerUnit) {
      const lotValue       = new Decimal(lot.quantity.toString()).times(pricePerUnit.toString());
      const requiredDeposit = lotValue.times("0.05").toDecimalPlaces(2);

      // Wallet über Organisation laden
      const wallet = await db.wallet.findUnique({
        where:  { organizationId: user.organizationId },
        select: { balance: true },
      });

      const walletBalance = new Decimal(wallet?.balance?.toString() ?? "0");

      if (walletBalance.lt(requiredDeposit)) {
        const missing = requiredDeposit.minus(walletBalance).toFixed(2);
        return {
          ok:               false,
          error:            `Sicherheitsleistung von 5% (${requiredDeposit.toFixed(2)} €) erforderlich. Aktuelles Depot: ${walletBalance.toFixed(2)} €. Fehlend: ${missing} €.`,
          code:             403,
          depositRequired:  true,
          missingAmount:    missing,
        };
      }
    }
  }

  return { ok: true };
}
