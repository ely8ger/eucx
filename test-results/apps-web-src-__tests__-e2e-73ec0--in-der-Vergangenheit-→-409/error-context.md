# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web/src/__tests__/e2e/timing-edges.spec.ts >> Timing Edge-Cases >> A1: Gebot auf Auktion mit auctionEnd 1 Sekunde in der Vergangenheit → 409
- Location: apps/web/src/__tests__/e2e/timing-edges.spec.ts:146:7

# Error details

```
Error: Login fehlgeschlagen für buyer@eucx-test.de: {"code":"INTERNAL_ERROR","message":"Serverfehler"}
```

# Test source

```ts
  1   | /**
  2   |  * Timing Edge-Case Tests
  3   |  *
  4   |  * Szenario A: Gebot auf Auktion mit abgelaufenem auctionEnd
  5   |  *   → Erwartung: 409 "Auktionsfenster ist abgelaufen"
  6   |  *   → Auktion wird automatisch in CONCLUSION überführt
  7   |  *
  8   |  * Szenario B: Lot in COLLECTION-Phase (noch nicht geöffnet) → 409
  9   |  *
  10  |  * Szenario C: Preis-Grenzwerte (startPrice, currentBest)
  11  |  *
  12  |  * Technische Eigenheit: /open ignoriert den Body-Parameter auctionEnd und setzt
  13  |  * ihn server-seitig via getNextSlotEnd(). Der Test nutzt daher den Dev-Endpunkt
  14  |  * PATCH /api/test/set-lot-auction-end um auctionEnd direkt in der DB zu setzen.
  15  |  *
  16  |  * Voraussetzungen:
  17  |  *   - Dev-Server auf Port 3000
  18  |  *   - Seed-Daten vorhanden (seller1@eucx-test.de, buyer@eucx-test.de, Test1234!)
  19  |  */
  20  | import { test, expect } from "@playwright/test";
  21  | 
  22  | const BASE = "http://localhost:3000";
  23  | 
  24  | // ─── Hilfsfunktionen ──────────────────────────────────────────────────────────
  25  | 
  26  | async function resetRateLimit(): Promise<void> {
  27  |   await fetch(`${BASE}/api/test/reset-rate-limit`, { method: "DELETE" });
  28  | }
  29  | 
  30  | async function login(email: string, password: string): Promise<string> {
  31  |   const res  = await fetch(`${BASE}/api/auth/login`, {
  32  |     method:  "POST",
  33  |     headers: { "Content-Type": "application/json" },
  34  |     body:    JSON.stringify({ email, password }),
  35  |   });
  36  |   const body = await res.json() as { data?: { accessToken?: string } };
  37  |   const token = body.data?.accessToken;
> 38  |   if (!token) throw new Error(`Login fehlgeschlagen für ${email}: ${JSON.stringify(body)}`);
      |                     ^ Error: Login fehlgeschlagen für buyer@eucx-test.de: {"code":"INTERNAL_ERROR","message":"Serverfehler"}
  39  |   return token;
  40  | }
  41  | 
  42  | async function createLot(buyerToken: string): Promise<string> {
  43  |   const res = await fetch(`${BASE}/api/auction/lots`, {
  44  |     method:  "POST",
  45  |     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buyerToken}` },
  46  |     body: JSON.stringify({
  47  |       commodity:        "REBAR_B500B",
  48  |       quantity:         10,
  49  |       unit:             "TON",
  50  |       startPrice:       400,
  51  |       incoterms:        "DAP",
  52  |       deliveryLocation: "Timing-Test-Ort",
  53  |       deliveryPeriod:   "2 Wochen",
  54  |       paymentTerms:     "14 Tage netto",
  55  |       vatTreatment:     "INLAND_19",
  56  |       hsCode:           "7214200010",
  57  |       qualityGrade:     "B500B",
  58  |       description:      "Timing-Edge-Lot",
  59  |       greenSteel:       false,
  60  |     }),
  61  |   });
  62  |   expect(res.status).toBe(201);
  63  |   const { lotId } = await res.json() as { lotId: string };
  64  |   return lotId;
  65  | }
  66  | 
  67  | async function publishLot(lotId: string, buyerToken: string): Promise<void> {
  68  |   const res = await fetch(`${BASE}/api/auction/lots/${lotId}/publish`, {
  69  |     method: "PATCH", headers: { "Authorization": `Bearer ${buyerToken}` },
  70  |   });
  71  |   expect([200, 204]).toContain(res.status);
  72  | }
  73  | 
  74  | async function registerSeller(lotId: string, sellerToken: string): Promise<void> {
  75  |   const res = await fetch(`${BASE}/api/auction/lots/${lotId}/register`, {
  76  |     method: "POST", headers: { "Authorization": `Bearer ${sellerToken}` },
  77  |   });
  78  |   expect([200, 201]).toContain(res.status);
  79  | }
  80  | 
  81  | async function openLot(lotId: string, buyerToken: string): Promise<void> {
  82  |   // Open setzt auctionEnd server-seitig via getNextSlotEnd() — Body-Parameter wird ignoriert.
  83  |   // Daher: erst öffnen (Pflicht für Phasenwechsel COLLECTION→PROPOSAL),
  84  |   // dann auctionEnd via Test-Endpunkt in der DB überschreiben.
  85  |   const res = await fetch(`${BASE}/api/auction/lots/${lotId}/open`, {
  86  |     method:  "POST",
  87  |     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buyerToken}` },
  88  |     body:    JSON.stringify({ auctionEnd: new Date(Date.now() + 60 * 60_000).toISOString() }),
  89  |   });
  90  |   expect([200, 201]).toContain(res.status);
  91  | }
  92  | 
  93  | async function setAuctionEnd(lotId: string, auctionEndIso: string): Promise<void> {
  94  |   const res = await fetch(`${BASE}/api/test/set-lot-auction-end`, {
  95  |     method:  "PATCH",
  96  |     headers: { "Content-Type": "application/json" },
  97  |     body:    JSON.stringify({ lotId, auctionEnd: auctionEndIso }),
  98  |   });
  99  |   expect(res.status).toBe(200);
  100 |   const body = await res.json() as { ok?: boolean };
  101 |   expect(body.ok).toBe(true);
  102 | }
  103 | 
  104 | async function bid(
  105 |   lotId:   string,
  106 |   token:   string,
  107 |   price:   number
  108 | ): Promise<{ status: number; body: Record<string, unknown> }> {
  109 |   const res  = await fetch(`${BASE}/api/auction/lots/${lotId}/bids`, {
  110 |     method:  "POST",
  111 |     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  112 |     body:    JSON.stringify({ price }),
  113 |   });
  114 |   const body = await res.json() as Record<string, unknown>;
  115 |   return { status: res.status, body };
  116 | }
  117 | 
  118 | // ─── Setup helper ──────────────────────────────────────────────────────────────
  119 | 
  120 | async function setupOpenLot(
  121 |   buyerToken:  string,
  122 |   sellerToken: string
  123 | ): Promise<string> {
  124 |   const lotId = await createLot(buyerToken);
  125 |   await publishLot(lotId, buyerToken);
  126 |   await registerSeller(lotId, sellerToken);
  127 |   await openLot(lotId, buyerToken);
  128 |   return lotId;
  129 | }
  130 | 
  131 | // ─── Test-Suite ───────────────────────────────────────────────────────────────
  132 | 
  133 | test.describe("Timing Edge-Cases", () => {
  134 |   let buyerToken:  string;
  135 |   let sellerToken: string;
  136 | 
  137 |   test.beforeAll(async () => {
  138 |     // Rate-Limit zuerst zurücksetzen — verhindert 429 bei Logins nach anderen Test-Suites
```