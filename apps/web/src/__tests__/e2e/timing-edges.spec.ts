/**
 * Timing Edge-Case Tests
 *
 * Szenario A: Gebot auf Auktion mit abgelaufenem auctionEnd
 *   → Erwartung: 409 "Auktionsfenster ist abgelaufen"
 *   → Auktion wird automatisch in CONCLUSION überführt
 *
 * Szenario B: Lot in COLLECTION-Phase (noch nicht geöffnet) → 409
 *
 * Szenario C: Preis-Grenzwerte (startPrice, currentBest)
 *
 * Technische Eigenheit: /open ignoriert den Body-Parameter auctionEnd und setzt
 * ihn server-seitig via getNextSlotEnd(). Der Test nutzt daher den Dev-Endpunkt
 * PATCH /api/test/set-lot-auction-end um auctionEnd direkt in der DB zu setzen.
 *
 * Voraussetzungen:
 *   - Dev-Server auf Port 3000
 *   - Seed-Daten vorhanden (seller1@eucx-test.de, buyer@eucx-test.de, Test1234!)
 */
import { test, expect } from "@playwright/test";

const BASE       = "http://localhost:3000";
const IP_TIMING  = "198.51.100.10"; // TEST-NET (RFC 5737) — exklusiv für timing-edges

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

async function resetRateLimit(): Promise<void> {
  await fetch(`${BASE}/api/test/reset-rate-limit`, { method: "DELETE" });
}

async function login(email: string, password: string): Promise<string> {
  const res  = await fetch(`${BASE}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": IP_TIMING },
    body:    JSON.stringify({ email, password }),
  });
  const body = await res.json() as { data?: { accessToken?: string } };
  const token = body.data?.accessToken;
  if (!token) throw new Error(`Login fehlgeschlagen für ${email}: ${JSON.stringify(body)}`);
  return token;
}

async function createLot(buyerToken: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auction/lots`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buyerToken}` },
    body: JSON.stringify({
      commodity:        "REBAR_B500B",
      quantity:         10,
      unit:             "TON",
      startPrice:       400,
      incoterms:        "DAP",
      deliveryLocation: "Timing-Test-Ort",
      deliveryPeriod:   "2 Wochen",
      paymentTerms:     "14 Tage netto",
      vatTreatment:     "INLAND_19",
      hsCode:           "7214200010",
      qualityGrade:     "B500B",
      description:      "Timing-Edge-Lot",
      greenSteel:       false,
    }),
  });
  expect(res.status).toBe(201);
  const { lotId } = await res.json() as { lotId: string };
  return lotId;
}

async function publishLot(lotId: string, buyerToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/auction/lots/${lotId}/publish`, {
    method: "PATCH", headers: { "Authorization": `Bearer ${buyerToken}` },
  });
  expect([200, 204]).toContain(res.status);
}

async function registerSeller(lotId: string, sellerToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/auction/lots/${lotId}/register`, {
    method: "POST", headers: { "Authorization": `Bearer ${sellerToken}` },
  });
  expect([200, 201]).toContain(res.status);
}

async function openLot(lotId: string, buyerToken: string): Promise<void> {
  // Open setzt auctionEnd server-seitig via getNextSlotEnd() — Body-Parameter wird ignoriert.
  // Daher: erst öffnen (Pflicht für Phasenwechsel COLLECTION→PROPOSAL),
  // dann auctionEnd via Test-Endpunkt in der DB überschreiben.
  const res = await fetch(`${BASE}/api/auction/lots/${lotId}/open`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buyerToken}` },
    body:    JSON.stringify({ auctionEnd: new Date(Date.now() + 60 * 60_000).toISOString() }),
  });
  expect([200, 201]).toContain(res.status);
}

async function setAuctionEnd(lotId: string, auctionEndIso: string): Promise<void> {
  const res = await fetch(`${BASE}/api/test/set-lot-auction-end`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ lotId, auctionEnd: auctionEndIso }),
  });
  expect(res.status).toBe(200);
  const body = await res.json() as { ok?: boolean };
  expect(body.ok).toBe(true);
}

async function bid(
  lotId:   string,
  token:   string,
  price:   number
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res  = await fetch(`${BASE}/api/auction/lots/${lotId}/bids`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body:    JSON.stringify({ price }),
  });
  const body = await res.json() as Record<string, unknown>;
  return { status: res.status, body };
}

// ─── Setup helper ──────────────────────────────────────────────────────────────

async function setupOpenLot(
  buyerToken:  string,
  sellerToken: string
): Promise<string> {
  const lotId = await createLot(buyerToken);
  await publishLot(lotId, buyerToken);
  await registerSeller(lotId, sellerToken);
  await openLot(lotId, buyerToken);
  return lotId;
}

// ─── Test-Suite ───────────────────────────────────────────────────────────────

test.describe("Timing Edge-Cases", () => {
  let buyerToken:  string;
  let sellerToken: string;

  test.beforeAll(async () => {
    // Rate-Limit zuerst zurücksetzen — verhindert 429 bei Logins nach anderen Test-Suites
    await resetRateLimit();
    buyerToken  = await login("buyer@eucx-test.de",   "Test1234!");
    sellerToken = await login("seller1@eucx-test.de", "Test1234!");
  });

  // ── Szenario A: auctionEnd in der Vergangenheit ────────────────────────────

  test("A1: Gebot auf Auktion mit auctionEnd 1 Sekunde in der Vergangenheit → 409", async () => {
    const lotId = await setupOpenLot(buyerToken, sellerToken);

    // auctionEnd auf 1 Sekunde in der Vergangenheit setzen (via DB-Patch)
    await setAuctionEnd(lotId, new Date(Date.now() - 1_000).toISOString());

    const { status, body } = await bid(lotId, sellerToken, 350);

    expect(status).toBe(409);
    expect(typeof body["error"]).toBe("string");
    expect(body["error"] as string).toMatch(/abgelaufen|geschlossen/i);
  });

  test("A2: Auktion wird nach abgelaufenem auctionEnd automatisch in CONCLUSION versetzt", async () => {
    const lotId = await setupOpenLot(buyerToken, sellerToken);

    // auctionEnd auf 5 Sekunden in der Vergangenheit setzen
    await setAuctionEnd(lotId, new Date(Date.now() - 5_000).toISOString());

    // Bid triggert Auto-Conclude (→ 409)
    await bid(lotId, sellerToken, 350);

    // Lot-Status abrufen
    const lotRes  = await fetch(`${BASE}/api/auction/lots/${lotId}`, {
      headers: { "Authorization": `Bearer ${buyerToken}` },
    });
    expect(lotRes.status).toBe(200);
    const lotBody = await lotRes.json() as { lot?: { phase?: string }; phase?: string };
    const phase   = lotBody.lot?.phase ?? lotBody.phase;
    expect(phase).toBe("CONCLUSION");
  });

  test("A3: Zweites Gebot nach Auto-Conclude → 409 (Auktion bereits geschlossen)", async () => {
    const lotId = await setupOpenLot(buyerToken, sellerToken);

    await setAuctionEnd(lotId, new Date(Date.now() - 2_000).toISOString());

    // Erstes Gebot: Auto-Conclude → 409
    await bid(lotId, sellerToken, 350);

    // Zweites Gebot: Lot ist CONCLUSION → 409
    const { status, body } = await bid(lotId, sellerToken, 300);
    expect(status).toBe(409);
    expect(typeof body["error"]).toBe("string");
  });

  // ── Szenario B: Lot noch nicht geöffnet ────────────────────────────────────

  test("B1: Gebot auf Lot in COLLECTION-Phase (noch nicht geöffnet) → 409", async () => {
    // Lot erstellen + veröffentlichen, aber NICHT öffnen
    const lotId = await createLot(buyerToken);
    await publishLot(lotId, buyerToken);
    await registerSeller(lotId, sellerToken);
    // Kein openLot() → Phase bleibt COLLECTION

    const { status, body } = await bid(lotId, sellerToken, 350);

    expect(status).toBe(409);
    expect(body["error"] as string).toMatch(/nicht geöffnet|COLLECTION/i);
  });

  // ── Szenario C: Preis-Grenzwerte ──────────────────────────────────────────

  test("C1: Gebot exakt auf startPrice (400) in PROPOSAL-Phase → 201", async () => {
    const lotId = await setupOpenLot(buyerToken, sellerToken);

    // Gebot genau auf startPrice (400) → in PROPOSAL erlaubt
    const { status } = await bid(lotId, sellerToken, 400);
    expect(status).toBe(201);
  });

  test("C2: Gebot 1 € über startPrice (401) → 422", async () => {
    const lotId = await setupOpenLot(buyerToken, sellerToken);

    const { status, body } = await bid(lotId, sellerToken, 401);
    expect(status).toBe(422);
    expect(body["error"] as string).toMatch(/Maximalpreis|übersteigt/i);
  });

  test("C3: Gebot in REDUCTION-Phase gleich currentBest → 422 (nicht strikt kleiner)", async () => {
    const lotId = await setupOpenLot(buyerToken, sellerToken);

    // Gebot 1: 350 → PROPOSAL → REDUCTION, currentBest = 350
    await bid(lotId, sellerToken, 350);

    // Gebot 2: exakt 350 → muss scheitern
    const { status, body } = await bid(lotId, sellerToken, 350);
    expect(status).toBe(422);
    expect(body["error"] as string).toMatch(/Bestgebot|kleiner/i);
  });
});
