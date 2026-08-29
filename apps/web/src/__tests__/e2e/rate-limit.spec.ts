/**
 * Rate-Limit-Test: In-Memory Sliding Window
 *
 * Testet die In-Memory-Rate-Limit-Implementierung auf zwei Ebenen:
 *
 * Ebene 1 — Bid-Route direkt (bypass Middleware via Public-Endpunkt):
 *   - /api/test/rate-limit-check ruft checkRateLimit() direkt auf
 *   - Kein Middleware-Interference, reine Logik-Tests
 *
 * Ebene 2 — E2E durch echte Bids:
 *   - Gebot Nr. 21 muss 429 liefern (entweder Middleware-api oder Bid-Route-bid)
 *   - Beide Formate werden akzeptiert (Middleware: code, Route: error)
 *
 * Voraussetzungen:
 *   - .env.local enthält ENABLE_MEMORY_RATE_LIMIT=true
 *   - Dev-Server läuft auf Port 3000
 *   - Seed-Daten vorhanden
 */
import { test, expect } from "@playwright/test";

const BASE       = "http://localhost:3000";
const TEST_IP    = "198.51.100.42"; // TEST-NET (RFC 5737) — für Bids
const IP_RL_E2E  = "198.51.100.50"; // TEST-NET (RFC 5737) — exklusiv für E2E-Logins

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

async function login(email: string, password: string, ip?: string): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (ip) headers["X-Forwarded-For"] = ip;
  const res  = await fetch(`${BASE}/api/auth/login`, {
    method:  "POST",
    headers,
    body:    JSON.stringify({ email, password }),
  });
  const body = await res.json() as { data?: { accessToken?: string } };
  const token = body.data?.accessToken;
  if (!token) throw new Error(`Login fehlgeschlagen: ${JSON.stringify(body)}`);
  return token;
}

async function checkRateLimit(
  ip:     string,
  bucket: "auth" | "bid" | "api"
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const res  = await fetch(`${BASE}/api/test/rate-limit-check`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ ip, bucket }),
  });
  return res.json() as Promise<{ allowed: boolean; remaining: number; reset: number }>;
}

async function resetRateLimit(): Promise<void> {
  const res = await fetch(`${BASE}/api/test/reset-rate-limit`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Reset fehlgeschlagen: HTTP ${res.status}`);
}

async function placeBid(lotId: string, token: string, price: number, ip = TEST_IP): Promise<Response> {
  return fetch(`${BASE}/api/auction/lots/${lotId}/bids`, {
    method:  "POST",
    headers: {
      "Content-Type":    "application/json",
      "Authorization":   `Bearer ${token}`,
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify({ price }),
  });
}

function is429Block(status: number, body: Record<string, unknown>): boolean {
  if (status !== 429) return false;
  return typeof body["error"] === "string" || body["code"] === "RATE_LIMITED";
}

// ─── Suite 1: Direkte Logik-Tests über Public-Endpunkt ───────────────────────
// Kein Middleware-Interference — testet checkRateLimit() in Isolation

test.describe("Rate Limiter — Logik-Tests (direkt, kein Middleware)", () => {
  const LOGIC_IP = "203.0.113.1"; // TEST-NET-3 (RFC 5737) — exklusiv für Logik-Tests

  test.beforeEach(async () => {
    await resetRateLimit();
  });

  test("L-1: bid-Bucket startet bei remaining=20 (frischer Zustand)", async () => {
    const result = await checkRateLimit(LOGIC_IP, "bid");
    // Erster Aufruf verbraucht 1 Slot → remaining = 19
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  test("L-2: bid-Bucket: Nach 20 Anfragen ist remaining=0 und allowed=false", async () => {
    // 20 Anfragen senden (Limit = 20/min)
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(LOGIC_IP, "bid");
    }
    // 21. Anfrage — muss abgelehnt werden
    const result = await checkRateLimit(LOGIC_IP, "bid");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test("L-3: auth-Bucket: Limit 5 — 6. Anfrage wird abgelehnt", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(LOGIC_IP, "auth");
    }
    const result = await checkRateLimit(LOGIC_IP, "auth");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test("L-4: api-Bucket: Limit 120 — nach 120 Anfragen wird abgelehnt", async () => {
    for (let i = 0; i < 120; i++) {
      await checkRateLimit(LOGIC_IP, "api");
    }
    const result = await checkRateLimit(LOGIC_IP, "api");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test("L-5: Unterschiedliche IPs haben unabhängige Zähler", async () => {
    const IP_A = "203.0.113.10";
    const IP_B = "203.0.113.20";

    // IP_A erschöpfen (20 Aufrufe)
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(IP_A, "bid");
    }
    const aBlocked = await checkRateLimit(IP_A, "bid");
    expect(aBlocked.allowed).toBe(false);

    // IP_B unberührt
    const bAllowed = await checkRateLimit(IP_B, "bid");
    expect(bAllowed.allowed).toBe(true);
    expect(bAllowed.remaining).toBe(19);
  });

  test("L-6: Reset setzt alle Zähler zurück", async () => {
    // IP erschöpfen
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(LOGIC_IP, "bid");
    }
    const blocked = await checkRateLimit(LOGIC_IP, "bid");
    expect(blocked.allowed).toBe(false);

    // Reset
    await resetRateLimit();

    // Danach wieder erlaubt
    const allowed = await checkRateLimit(LOGIC_IP, "bid");
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(19);
  });

  test("L-7: reset-Endpunkt gibt ok:true zurück", async () => {
    const res  = await fetch(`${BASE}/api/test/reset-rate-limit`, { method: "DELETE" });
    const body = await res.json() as { ok?: boolean };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});

// ─── Suite 2: E2E über echte Bid-Requests ────────────────────────────────────
// Nachweis: HTTP-429 kommt spätestens beim 21. Bid-Request von derselben IP

test.describe("Rate Limiter — E2E Bid-Request Nachweis", () => {
  let sellerToken: string;
  let buyerToken:  string;
  let lotId:       string;

  test.beforeAll(async () => {
    await resetRateLimit();

    sellerToken = await login("seller2@eucx-test.de", "Test1234!", IP_RL_E2E);
    buyerToken  = await login("buyer@eucx-test.de",   "Test1234!", IP_RL_E2E);

    const createRes = await fetch(`${BASE}/api/auction/lots`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buyerToken}` },
      body: JSON.stringify({
        commodity:        "REBAR_B500B",
        quantity:         50,
        unit:             "TON",
        startPrice:       500,
        incoterms:        "DAP",
        deliveryLocation: "E2E-Rate-Limit-Ort",
        deliveryPeriod:   "4 Wochen",
        paymentTerms:     "30 Tage netto",
        vatTreatment:     "INLAND_19",
        hsCode:           "7214200010",
        qualityGrade:     "B500B",
        description:      "Rate-Limit-E2E-Test",
        greenSteel:       false,
      }),
    });
    expect(createRes.status).toBe(201);
    const { lotId: id } = await createRes.json() as { lotId: string };
    lotId = id;

    await fetch(`${BASE}/api/auction/lots/${lotId}/publish`, {
      method: "PATCH", headers: { "Authorization": `Bearer ${buyerToken}` },
    });
    await fetch(`${BASE}/api/auction/lots/${lotId}/register`, {
      method: "POST", headers: { "Authorization": `Bearer ${sellerToken}` },
    });
    await fetch(`${BASE}/api/auction/lots/${lotId}/open`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buyerToken}` },
      body:    JSON.stringify({ auctionEnd: new Date(Date.now() + 60 * 60_000).toISOString() }),
    });
  });

  test("E2E-1: 20 Gebote von TEST_IP werden nicht rate-limited", async () => {
    const blocked: number[] = [];
    for (let i = 1; i <= 20; i++) {
      const res = await placeBid(lotId, sellerToken, 499 - i);
      if (res.status === 429) blocked.push(i);
    }
    expect(blocked, `Gebote ${blocked.join(",")} unerwartet geblockt`).toHaveLength(0);
  });

  test("E2E-2: Gebot Nr. 21 von TEST_IP erhält 429 (Bid-Route oder Middleware)", async () => {
    const res  = await placeBid(lotId, sellerToken, 300);
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(429);
    expect(
      is429Block(res.status, body),
      `429 ohne Rate-Limit-Format: ${JSON.stringify(body)}`
    ).toBe(true);
  });
});
