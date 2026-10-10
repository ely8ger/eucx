# EUCX Security Policy

## Responsible Disclosure

Sicherheitslücken bitte ausschließlich per E-Mail an **security@eucx.eu** melden.

Bitte **nicht** als öffentliches GitHub-Issue einstellen. Wir bestätigen den Eingang innerhalb von 48 Stunden und arbeiten gemeinsam an einem koordinierten Disclosure-Zeitplan.

Meldungen umfassen idealerweise:
- Beschreibung der Schwachstelle und betroffene Komponente
- Schritte zur Reproduktion
- Einschätzung des Schweregrades (CVSS wenn möglich)
- Optionaler Patch oder Workaround-Vorschlag

Wir honorieren verantwortungsvolles Handeln — Researcher werden nach erfolgreicher Behebung in unseren Security-Acknowledgements genannt.

## Scope

In Scope:
- `eucx.eu` und alle Subdomains
- EUCX Web-Applikation (`apps/web`)
- EUCX API (`apps/api`)
- Authentifizierungs- und Autorisierungslogik
- Clearing- und Settlement-Infrastruktur
- Vertragssignatur-Workflow

Out of Scope:
- Social Engineering / Phishing gegen Mitarbeitende
- Physische Angriffe
- DoS/DDoS-Angriffe gegen Produktionssysteme
- Drittanbieter-Infrastruktur (Vercel, Upstash, Neon)

## Aktuelle Schutzmaßnahmen

### Netzwerk & Infrastruktur
- **Vercel**: Infrastruktur-seitiger DDoS-Schutz (Layer 3/4) ist standardmäßig aktiv
- **Vercel Firewall**: Aktiviert und konfiguriert für EUCX Production
- **TLS**: Erzwungen auf allen Endpunkten (HSTS: `max-age=31536000; includeSubDomains`)

### Applikations-Ebene
- **Rate Limiting**: Upstash Redis Sliding Window
  - Auth-Endpunkte (Login, Register, Passwort-Reset): 5 Anfragen/Minute
  - Gebote: 20 Anfragen/Minute
  - Allgemeine API: 120 Anfragen/Minute
  - Auth-Bucket ist fail-closed in Production (wirft Fehler bei nicht konfiguriertem Redis)
- **CSP**: Nonce-basierte Content Security Policy (`script-src 'self' 'nonce-{nonce}'`)
  - Kein `unsafe-inline`, kein `unsafe-eval` in `script-src`
  - Per-Request-Nonce über Next.js Middleware
- **Security-Header**: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin

### Authentifizierung & Autorisierung
- **JWT**: RS256, Access-Token 15 min TTL, Refresh-Token 7 Tage
- **JTI-Blacklist**: Logout invalidiert Token serverseitig (Redis)
- **2FA**: TOTP (RFC 6238), fail-closed bei fehlender 2FA-Config
- **Account-Sperre**: Nach fehlgeschlagenen Login-Versuchen (Redis-Counter)
- **Passwörter**: bcrypt, 12 Runden

### Datensicherheit
- **Tokens**: Ausschließlich HttpOnly-Cookies + in-memory State, kein localStorage
- **Datenbankzugriff**: Ausschließlich über Prisma ORM (parametrisierte Queries, kein raw SQL mit User-Input)
- **Serializable Transactions**: Kritische Finanztransaktionen mit Serializable Isolation Level + P2034-Retry
- **Double-Entry Bookkeeping**: Alle Wallet-Bewegungen als unveränderlicher Ledger

### Vertragssignatur
- **Elektronische Signatur**: Fortgeschrittene Elektronische Signatur (FES) gemäß § 126a BGB / Art. 26 eIDAS
- **Signaturtoken**: 6-stellig, kryptographisch zufällig (`crypto.randomInt`), bcrypt-gehasht, 5-Minuten-TTL, einmalig verwendbar
- **PDF-Integrität**: SHA-256 Hash vor und nach Signatur, im AuditLog unveränderlich gespeichert
- **Hinweis**: QES (Qualifizierte Elektronische Signatur) nach Art. 3 Nr. 15 eIDAS ist für zukünftige Versionen geplant (erfordert Trust Service Provider-Integration)

### Telefon-Verifikation
- **Status**: Telefonnummern werden gespeichert, SMS-Verifikation ist in Implementierung (kein `phoneVerified: true` ohne echte SMS)
- **KYC-Blocking**: Handelsfreigabe setzt verifizierte Unternehmensdaten voraus (Adresse, Handelsregisternummer)

## Bekannte Einschränkungen (Aktueller Stand)

| Bereich | Status | Geplant |
|---------|--------|---------|
| QES (Qualifizierte ES) | FES implementiert | QES-Provider-Integration Q1 2026 |
| SMS-Verifikation | Nummer wird gespeichert, SMS ausstehend | Twilio-Integration geplant |
| Externer Penetrationstest | Intern: 25+ Red-Team-Tests (Playwright) | Externer PenTest durch akkreditierten Anbieter geplant |

## Internes Security-Testing

Das Repository enthält umfangreiche interne Security-Tests:

- **`apps/web/src/__tests__/e2e/red-team.spec.ts`**: 25+ Playwright-Tests aus Angreifer-Perspektive
  - Auth: Brute-Force, JWT alg:none, gefälschtes Secret, abgelaufener Token, Rollenerhöhung
  - IDOR: Cross-Seller-Zugriff, unregistrierter Bieter, Interessenkonflikt
  - Business Logic: Race Conditions, State-Machine-Bypass, Negativpreise
  - Injection: SQL-Injection, Path-Traversal, Oversized JSON, Prototype Pollution
  - Session: JTI-Blacklist nach Logout, Refresh-Token-Invalidierung

## Kontakt

**Security-Team:** security@eucx.eu  
**PGP:** Auf Anfrage verfügbar  
**Response-Zeit:** 48h Bestätigung, 14 Tage für initiale Einschätzung
