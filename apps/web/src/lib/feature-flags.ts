/**
 * EUCX Feature-Flags
 *
 * Steuert optionale Module über Umgebungsvariablen.
 * In Vercel: unter Environment Variables setzen (NICHT in .env.production committen).
 *
 * EUCX_SETTLEMENT_ENABLED:
 *   false (default) – Wallet-basiertes Settlement deaktiviert.
 *   Begründung: wallet.balance-Inkremente + LedgerEntry(CREDIT) könnten
 *   EUCX als Zahlungsdienstleister i.S.d. ZAG §1 Abs. 1 Nr. 6 qualifizieren
 *   und eine BaFin-Lizenz erfordern. Bis zur Klärung durch Rechtsberater: OFF.
 */

export const SETTLEMENT_ENABLED =
  process.env.EUCX_SETTLEMENT_ENABLED === "true";

/**
 * Wirft einen Fehler wenn das Settlement-Modul deaktiviert ist.
 * Am Anfang aller settlement-bezogenen Route-Handler aufrufen.
 */
export function requireSettlement(): void {
  if (!SETTLEMENT_ENABLED) {
    throw new SettlementDisabledError();
  }
}

export class SettlementDisabledError extends Error {
  readonly status = 503;
  constructor() {
    super(
      "Settlement-Modul ist deaktiviert. " +
      "Kontakt: compliance@eucx.eu"
    );
    this.name = "SettlementDisabledError";
  }
}
