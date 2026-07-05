# EUCX — API Reference

> Version: 2026-07-05 | Basis-URL lokal: `http://localhost:3000` | Production: `https://eucx.eu`  
> Auth: `Authorization: Bearer <JWT>` (alle geschützten Routen)  
> Fehlerformat: `{ "error": "Beschreibung", "details"?: {...} }`

---

## Authentifizierung

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `POST` | `/api/auth/register` | Neues Nutzerkonto erstellen | — |
| `POST` | `/api/auth/login` | Login → `{ accessToken, refreshToken }` | — |
| `POST` | `/api/auth/logout` | Session invalidieren | Ja |
| `POST` | `/api/auth/refresh` | AccessToken per RefreshToken erneuern | — |
| `GET`  | `/api/auth/me` | Eigenes Profil abrufen | Ja |
| `POST` | `/api/auth/verify-email` | E-Mail-Adresse bestätigen (`token` im Body) | — |
| `POST` | `/api/auth/forgot-password` | Passwort-Reset anfordern | — |
| `POST` | `/api/auth/reset-password` | Neues Passwort setzen (`token` + `password`) | — |
| `POST` | `/api/auth/change-password` | Passwort ändern (eingeloggt) | Ja |
| `GET`  | `/api/auth/sessions` | Aktive Sessions auflisten | Ja |

### 2-Faktor-Authentifizierung

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET`  | `/api/auth/2fa/status` | 2FA-Status prüfen | Ja |
| `POST` | `/api/auth/2fa/setup` | TOTP-Secret generieren (QR-Code-URL) | Ja |
| `POST` | `/api/auth/2fa/verify` | TOTP beim ersten Einrichten bestätigen | Ja |
| `POST` | `/api/auth/2fa/validate` | TOTP beim Login validieren | Ja |
| `POST` | `/api/auth/2fa/disable` | 2FA deaktivieren | Ja |
| `GET`  | `/api/auth/backup-codes` | Backup-Codes abrufen/generieren | Ja |

---

## Auktionen & Lots

### Lots

| Methode | Endpunkt | Beschreibung | Rolle |
|---------|----------|--------------|-------|
| `POST` | `/api/auction/lots` | Neue Ausschreibung erstellen | BUYER |
| `GET`  | `/api/auction/lots` | Lots auflisten (`?mine=true`, `?phase=`) | Ja |
| `GET`  | `/api/auction/lots/[lotId]` | Einzelnes Lot abrufen | Ja |

**POST `/api/auction/lots` — Body:**
```json
{
  "commodity":        "Stahl-Rebar BST 500",
  "quantity":         1000,
  "unit":             "TON",
  "startPrice":       850.00,
  "description":      "...",
  "co2PerTonne":      1850.0,
  "countryOfOrigin":  "TR",
  "productionSiteId": "CBAM-TR-12345678",
  "incoterms":        "DAP"
}
```
Units: `TON | KG | CBM | LITER | PIECE | SQM | MWH`  
Incoterms: `EXW | FCA | FAS | FOB | CFR | CIF | CPT | CIP | DAP | DPU | DDP`

### Lot-Aktionen

| Methode | Endpunkt | Beschreibung | Rolle |
|---------|----------|--------------|-------|
| `POST` | `/api/auction/lots/[lotId]/open` | Auktion starten (COLLECTION → PROPOSAL) | BUYER |
| `POST` | `/api/auction/lots/[lotId]/register` | Für Lot registrieren | SELLER |
| `POST` | `/api/auction/lots/[lotId]/bids` | Gebot abgeben | SELLER |
| `GET`  | `/api/auction/lots/[lotId]/bids` | Gebote abrufen | Ja |
| `GET`  | `/api/auction/lots/[lotId]/contract` | Kaufvertrag (PDF Base64) abrufen | BUYER/SELLER (nur eigene) |
| `GET`  | `/api/auction/lots/[lotId]/stream` | SSE-Stream für Live-Updates | Ja |
| `GET`  | `/api/auction/lots/[lotId]/cbam-export` | CBAM-XML-Bericht exportieren | BUYER (nur eigene) |

**POST `/api/auction/lots/[lotId]/bids` — Body:**
```json
{
  "price": 780.00
}
```

**GET `/api/auction/lots/[lotId]/cbam-export`**  
Response: `application/xml` — CBAM-Deklarationsdatei gemäß EU DVO 2023/1773  
Dateiname: `EUCX-CBAM-<LOTID>.xml`

### Verträge & Clearing

| Methode | Endpunkt | Beschreibung | Rolle |
|---------|----------|--------------|-------|
| `GET`  | `/api/auction/contracts` | Alle eigenen Verträge | Ja |
| `GET`  | `/api/contracts` | Vertragsübersicht | Ja |
| `GET`  | `/api/contracts/[id]` | Einzelner Vertrag | Ja |
| `POST` | `/api/clearing/[dealId]` | Clearing-Prozess anstoßen | ADMIN |

---

## Orderbuch & Markt

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET`  | `/api/orderbook` | Aktuelles Orderbuch (Asks/Bids) | Ja |
| `GET`  | `/api/orderbook/stream` | SSE-Stream Orderbuch-Updates | Ja |
| `POST` | `/api/orders` | Order platzieren (BUY/SELL) | BUYER/SELLER |
| `GET`  | `/api/orders` | Eigene Orders | Ja |
| `GET`  | `/api/orders/[id]` | Einzelne Order | Ja |
| `GET`  | `/api/market/[productId]/candles` | OHLCV-Candles (`?from=&to=&interval=`) | Ja |
| `GET`  | `/api/market/export` | Marktdaten-Export (CSV/JSON) | Ja |

**POST `/api/orders` — Body:**
```json
{
  "direction": "BUY",
  "quantity":  100,
  "price":     850.00,
  "productId": "rebar-de"
}
```
**Rollenregel**: BUYER → nur `BUY`, SELLER → nur `SELL`

---

## Portfolio & Wallet

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET`  | `/api/portfolio/balance` | Wallet-Guthaben und Positionen | Ja |

---

## KYC & Verifikation

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `POST` | `/api/kyc/submit` | KYC-Antrag einreichen | Ja |
| `POST` | `/api/kyc/documents` | Dokumente hochladen | Ja |
| `GET`  | `/api/validate-vat` | USt-IdNr. validieren (`?vatId=DE...`) | Ja |
| `GET`  | `/api/validate-lei` | LEI-Kennung prüfen (`?lei=...`) | Ja |
| `GET`  | `/api/lookup-hrb` | HRB-Handelsregisternummer prüfen | Ja |
| `POST` | `/api/enrich-company` | Firmendaten aus externen Quellen anreichern | Ja |

---

## Benachrichtigungen

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET`  | `/api/notifications` | Eigene Benachrichtigungen | Ja |
| `GET`  | `/api/notifications/preferences` | Benachrichtigungseinstellungen | Ja |
| `POST` | `/api/notifications/preferences` | Einstellungen aktualisieren | Ja |

---

## Sicherheit & Sessions

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET`  | `/api/security/log` | Sicherheits-Aktivitätsprotokoll | Ja |
| `GET`  | `/api/sessions/active` | Aktive Sessions auflisten | Ja |

### API-Keys

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET`  | `/api/settings/api-keys` | Eigene API-Keys | Ja |
| `POST` | `/api/settings/api-keys` | Neuen API-Key erstellen | Ja |
| `DELETE` | `/api/settings/api-keys/[id]` | API-Key löschen | Ja |

---

## Admin-Bereich

> Alle Admin-Routen: Rolle `ADMIN` oder `SUPER_ADMIN` erforderlich.

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `GET`  | `/api/admin/analytics` | Plattform-Statistiken |
| `POST` | `/api/admin/halt` | Handelsunterbrechung (Circuit Breaker) |
| `GET`  | `/api/admin/users` | Alle Nutzer |
| `GET`  | `/api/admin/users/[id]` | Einzelner Nutzer |
| `PATCH`| `/api/admin/users/[id]` | Nutzer-Status/Rolle ändern |
| `POST` | `/api/admin/verify-user` | Nutzer KYC-Status setzen |
| `GET`  | `/api/admin/kyc` | KYC-Anträge auflisten |
| `GET`  | `/api/admin/kyc/[id]` | KYC-Antrag Details |
| `PATCH`| `/api/admin/kyc/[id]` | KYC genehmigen/ablehnen |
| `GET`  | `/api/admin/orders` | Alle Plattform-Orders |
| `GET`  | `/api/admin/registrations` | Lot-Registrierungen |
| `GET`  | `/api/admin/registrations/[id]` | Einzelne Registrierung |

---

## Rollen & Berechtigungen

| Rolle | Beschreibung | Lot erstellen | Gebot abgeben | Admin |
|-------|-------------|:---:|:---:|:---:|
| `BUYER` | Kaufende Organisation | ✓ | — | — |
| `SELLER` | Verkaufende Organisation | — | ✓ | — |
| `BROKER` | Vermittler | ✓ | ✓ | — |
| `ADMIN` | Plattform-Administrator | ✓ | ✓ | ✓ |
| `SUPER_ADMIN` | Vollzugriff | ✓ | ✓ | ✓ |
| `COMPLIANCE` | Compliance-Officer | — | — | Lesen |

---

## HTTP-Statuscodes

| Code | Bedeutung |
|------|-----------|
| `200` | OK |
| `201` | Erstellt (POST erfolgreich) |
| `400` | Ungültiger Request |
| `401` | Nicht autorisiert (kein/ungültiger Token) |
| `403` | Verboten (falsche Rolle oder Status) |
| `404` | Nicht gefunden |
| `409` | Konflikt (z.B. Duplikat) |
| `422` | Validierungsfehler |
| `429` | Rate Limit überschritten |
| `500` | Interner Serverfehler |

---

## CBAM — Carbon Border Adjustment Mechanism

Ab 2026 sind CBAM-Angaben bei grenzüberschreitendem Handel mit CBAM-Waren (Stahl, Aluminium, Zement, Düngemittel, Strom, Wasserstoff) Pflicht.

**Pflichtfelder bei CBAM-Lots:**
- `countryOfOrigin` — ISO 3166-1 alpha-2 (z.B. `"TR"`)
- `co2PerTonne` — kg CO₂-Äq. pro Tonne (Verkäufer-Angabe)
- `productionSiteId` — EU-CBAM-Registry-ID der Produktionsstätte
- `incoterms` — Lieferbedingungen (INCOTERMS® 2020)

**Export**: `GET /api/auction/lots/[lotId]/cbam-export` → XML-Datei für EU-Zollmeldung

Rechtsbasis: EU-Verordnung 2023/956 i.V.m. Durchführungsverordnung (EU) 2023/1773
