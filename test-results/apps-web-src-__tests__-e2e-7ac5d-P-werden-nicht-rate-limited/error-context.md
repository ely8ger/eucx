# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web/src/__tests__/e2e/rate-limit.spec.ts >> Rate Limiter — E2E Bid-Request Nachweis >> E2E-1: 20 Gebote von TEST_IP werden nicht rate-limited
- Location: apps/web/src/__tests__/e2e/rate-limit.spec.ts:210:7

# Error details

```
Error: Login fehlgeschlagen: {"code":"RATE_LIMITED","message":"Zu viele Anfragen. Bitte warten Sie kurz."}
```

# Test source

```ts
  1   | /**
  2   |  * Rate-Limit-Test: In-Memory Sliding Window
  3   |  *
  4   |  * Testet die In-Memory-Rate-Limit-Implementierung auf zwei Ebenen:
  5   |  *
  6   |  * Ebene 1 — Bid-Route direkt (bypass Middleware via Public-Endpunkt):
  7   |  *   - /api/test/rate-limit-check ruft checkRateLimit() direkt auf
  8   |  *   - Kein Middleware-Interference, reine Logik-Tests
  9   |  *
  10  |  * Ebene 2 — E2E durch echte Bids:
  11  |  *   - Gebot Nr. 21 muss 429 liefern (entweder Middleware-api oder Bid-Route-bid)
  12  |  *   - Beide Formate werden akzeptiert (Middleware: code, Route: error)
  13  |  *
  14  |  * Voraussetzungen:
  15  |  *   - .env.local enthält ENABLE_MEMORY_RATE_LIMIT=true
  16  |  *   - Dev-Server läuft auf Port 3000
  17  |  *   - Seed-Daten vorhanden
  18  |  */
  19  | import { test, expect } from "@playwright/test";
  20  | 
  21  | const BASE    = "http://localhost:3000";
  22  | const TEST_IP = "198.51.100.42"; // TEST-NET (RFC 5737)
  23  | 
  24  | // ─── Hilfsfunktionen ──────────────────────────────────────────────────────────
  25  | 
  26  | async function login(email: string, password: string): Promise<string> {
  27  |   const res  = await fetch(`${BASE}/api/auth/login`, {
  28  |     method:  "POST",
  29  |     headers: { "Content-Type": "application/json" },
  30  |     body:    JSON.stringify({ email, password }),
  31  |   });
  32  |   const body = await res.json() as { data?: { accessToken?: string } };
  33  |   const token = body.data?.accessToken;
> 34  |   if (!token) throw new Error(`Login fehlgeschlagen: ${JSON.stringify(body)}`);
      |                     ^ Error: Login fehlgeschlagen: {"code":"RATE_LIMITED","message":"Zu viele Anfragen. Bitte warten Sie kurz."}
  35  |   return token;
  36  | }
  37  | 
  38  | async function checkRateLimit(
  39  |   ip:     string,
  40  |   bucket: "auth" | "bid" | "api"
  41  | ): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  42  |   const res  = await fetch(`${BASE}/api/test/rate-limit-check`, {
  43  |     method:  "POST",
  44  |     headers: { "Content-Type": "application/json" },
  45  |     body:    JSON.stringify({ ip, bucket }),
  46  |   });
  47  |   return res.json() as Promise<{ allowed: boolean; remaining: number; reset: number }>;
  48  | }
  49  | 
  50  | async function resetRateLimit(): Promise<void> {
  51  |   const res = await fetch(`${BASE}/api/test/reset-rate-limit`, { method: "DELETE" });
  52  |   if (!res.ok) throw new Error(`Reset fehlgeschlagen: HTTP ${res.status}`);
  53  | }
  54  | 
  55  | async function placeBid(lotId: string, token: string, price: number, ip = TEST_IP): Promise<Response> {
  56  |   return fetch(`${BASE}/api/auction/lots/${lotId}/bids`, {
  57  |     method:  "POST",
  58  |     headers: {
  59  |       "Content-Type":    "application/json",
  60  |       "Authorization":   `Bearer ${token}`,
  61  |       "X-Forwarded-For": ip,
  62  |     },
  63  |     body: JSON.stringify({ price }),
  64  |   });
  65  | }
  66  | 
  67  | function is429Block(status: number, body: Record<string, unknown>): boolean {
  68  |   if (status !== 429) return false;
  69  |   return typeof body["error"] === "string" || body["code"] === "RATE_LIMITED";
  70  | }
  71  | 
  72  | // ─── Suite 1: Direkte Logik-Tests über Public-Endpunkt ───────────────────────
  73  | // Kein Middleware-Interference — testet checkRateLimit() in Isolation
  74  | 
  75  | test.describe("Rate Limiter — Logik-Tests (direkt, kein Middleware)", () => {
  76  |   const LOGIC_IP = "203.0.113.1"; // TEST-NET-3 (RFC 5737) — exklusiv für Logik-Tests
  77  | 
  78  |   test.beforeEach(async () => {
  79  |     await resetRateLimit();
  80  |   });
  81  | 
  82  |   test("L-1: bid-Bucket startet bei remaining=20 (frischer Zustand)", async () => {
  83  |     const result = await checkRateLimit(LOGIC_IP, "bid");
  84  |     // Erster Aufruf verbraucht 1 Slot → remaining = 19
  85  |     expect(result.allowed).toBe(true);
  86  |     expect(result.remaining).toBe(19);
  87  |   });
  88  | 
  89  |   test("L-2: bid-Bucket: Nach 20 Anfragen ist remaining=0 und allowed=false", async () => {
  90  |     // 20 Anfragen senden (Limit = 20/min)
  91  |     for (let i = 0; i < 20; i++) {
  92  |       await checkRateLimit(LOGIC_IP, "bid");
  93  |     }
  94  |     // 21. Anfrage — muss abgelehnt werden
  95  |     const result = await checkRateLimit(LOGIC_IP, "bid");
  96  |     expect(result.allowed).toBe(false);
  97  |     expect(result.remaining).toBe(0);
  98  |   });
  99  | 
  100 |   test("L-3: auth-Bucket: Limit 5 — 6. Anfrage wird abgelehnt", async () => {
  101 |     for (let i = 0; i < 5; i++) {
  102 |       await checkRateLimit(LOGIC_IP, "auth");
  103 |     }
  104 |     const result = await checkRateLimit(LOGIC_IP, "auth");
  105 |     expect(result.allowed).toBe(false);
  106 |     expect(result.remaining).toBe(0);
  107 |   });
  108 | 
  109 |   test("L-4: api-Bucket: Limit 120 — nach 120 Anfragen wird abgelehnt", async () => {
  110 |     for (let i = 0; i < 120; i++) {
  111 |       await checkRateLimit(LOGIC_IP, "api");
  112 |     }
  113 |     const result = await checkRateLimit(LOGIC_IP, "api");
  114 |     expect(result.allowed).toBe(false);
  115 |     expect(result.remaining).toBe(0);
  116 |   });
  117 | 
  118 |   test("L-5: Unterschiedliche IPs haben unabhängige Zähler", async () => {
  119 |     const IP_A = "203.0.113.10";
  120 |     const IP_B = "203.0.113.20";
  121 | 
  122 |     // IP_A erschöpfen (20 Aufrufe)
  123 |     for (let i = 0; i < 20; i++) {
  124 |       await checkRateLimit(IP_A, "bid");
  125 |     }
  126 |     const aBlocked = await checkRateLimit(IP_A, "bid");
  127 |     expect(aBlocked.allowed).toBe(false);
  128 | 
  129 |     // IP_B unberührt
  130 |     const bAllowed = await checkRateLimit(IP_B, "bid");
  131 |     expect(bAllowed.allowed).toBe(true);
  132 |     expect(bAllowed.remaining).toBe(19);
  133 |   });
  134 | 
```