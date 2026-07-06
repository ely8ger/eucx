# EUCX — Testmodus-Deaktivierungen

Alle Punkte müssen vor Produktionsstart wieder aktiviert werden.

| ID | Datei | Was ist deaktiviert | Wiederaktivieren wenn |
|----|-------|--------------------|-----------------------|
| TESTMODE-01 | `app/api/auction/lots/[lotId]/bids/route.ts` | KYC-Verifizierungspflicht für Gebote (`checkBidEligibility`) | Admin-KYC-Freischaltungsflow fertig getestet |
| TESTMODE-02 | `app/api/auction/lots/[lotId]/bids/route.ts` | CBAM-Precheck (SellerCharge-Pflicht bei CO₂-Lots) | Chargen-Verwaltungsflow fertig getestet |
| TESTMODE-03 | `app/api/auction/lots/[lotId]/open/route.ts` | Handelsslot-Zeiten: 19:00–22:00 statt 14:00–16:00 Berlin | Nach Testbetrieb zurück auf 14:00–16:00 |
| TESTMODE-04 | `app/api/auth/login/route.ts` | 2FA-Pflicht beim Login (`if (user.totpEnabled)` Block entfernt) | Nach TOTP-Bibliotheksproblem gelöst (otplib verifySync) |

## Hinweise

- TESTMODE-03: Das bestehende Lot (StahlMAR) hat `auctionEnd = 07.07.26 16:00` in der DB.
  Gebote sind bis dahin möglich. Für einen früheren Abschluss muss das Lot neu gestartet
  oder `concludeLot()` manuell getriggert werden.
- TESTMODE-04: Die 2FA-Logik (otplib `verifySync`) ist technisch korrekt implementiert.
  Nur der Login-Guard wurde deaktiviert. Die Setup- und Verify-Routen funktionieren weiterhin.
