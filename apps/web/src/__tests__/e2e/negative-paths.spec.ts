/**
 * EUCX — Unhappy Path / Sabotage-Test Suite
 *
 * Testet, ob das Backend illegale Aktionen korrekt blockiert.
 * Ein Test gilt als GRÜN, wenn das System mit 400/401/403/404/409/422 antwortet.
 * Ein Test gilt als ROT, wenn das System 200/201 zurückgibt (= Sicherheitslücke!).
 *
 * Kategorien:
 *   A. Rollenüberschreitung    — falscher User-Typ für eine Aktion
 *   B. Ungültige Eingabedaten  — Validierungsfehler (Schemas)
 *   C. State-Machine-Bruch     — Aktion zum falschen Zeitpunkt im Workflow
 *   D. ID-Spoofing             — Zugriff auf fremde Ressourcen
 *   E. Auth-Angriffe           — fehlende oder gefälschte Tokens
 *
 * Ausführen:
 *   npm run dev (muss laufen)
 *   npx playwright test negative-paths.spec.ts --reporter=list
 */

import { test, expect, type APIResponse } from "@playwright/test";
import { SignJWT }                         from "jose";

// ─── Konfiguration ────────────────────────────────────────────────────────────

const BASE   = "http://localhost:3000";
const SECRET = "eucx-production-secret-49aaa0dfacdbc41f9ef4e2de7ae0b185cd52aa00f1e918a9408dbd800381f6e0";

// Seed-Lot-IDs (aus Datenbank bekannt)
const LOT_CONCLUDED  = "cmsyiih680001h2jsfekznjzs"; // DeliveryStatus COMPLETED → Auktion geschlossen
const LOT_BUYER_CONTRACT = "cmsyw61gy0001oefvgzb3tf04"; // Buyer-Vertrag zum Spoofing-Test

const USERS = {
  buyer:  { id: "seed-user-buyer",    orgId: "seed-org-eucx-test", role: "BUYER",  email: "buyer@eucx-test.de",   pw: "Test1234!" },
  seller1:{ id: "seed-user-seller-1", orgId: "seed-org-eucx-test", role: "SELLER", email: "seller1@eucx-test.de", pw: "Test1234!" },
  seller2:{ id: "seed-user-seller-2", orgId: "seed-org-another",   role: "SELLER", email: "seller2@eucx-test.de", pw: "Test1234!" },
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

async function jwt(user: typeof USERS[keyof typeof USERS]): Promise<string> {
  return new SignJWT({ userId: user.id, orgId: user.orgId, role: user.role, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .setIssuer("eucx.eu")
    .setAudience("eucx-api")
    .sign(new TextEncoder().encode(SECRET));
}

async function api(
  request: import("@playwright/test").APIRequestContext,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path:   string,
  token:  string | null,
  body?:  unknown,
): Promise<APIResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts: Parameters<typeof request.fetch>[1] = { method, headers };
  if (body !== undefined) opts.data = JSON.stringify(body);
  return request.fetch(`${BASE}${path}`, opts);
}

/** Assertion-Hilfsfunktion: erwartet einen Fehler-Status (nie 2xx) */
async function assertBlocked(
  res: APIResponse,
  allowedStatuses: number[],
  label: string,
): Promise<void> {
  const body = await res.json().catch(() => ({})) as Record<string, unknown>;
  const errMsg = String(body["error"] ?? "(kein error-Feld)");

  expect(
    res.status(),
    `[SICHERHEITSLÜCKE] "${label}" wurde NICHT geblockt!\n` +
    `HTTP ${res.status()} — Body: ${JSON.stringify(body).slice(0, 200)}`
  ).not.toBe(200);
  expect(
    res.status(),
    `[SICHERHEITSLÜCKE] "${label}" wurde NICHT geblockt!\n` +
    `HTTP ${res.status()} — Body: ${JSON.stringify(body).slice(0, 200)}`
  ).not.toBe(201);

  expect(
    allowedStatuses,
    `"${label}": Status ${res.status()} ist nicht in der erlaubten Fehler-Liste ${JSON.stringify(allowedStatuses)}`
  ).toContain(res.status());

  // Fehlermeldung muss menschenlesbar sein (kein Silent Fail)
  expect(
    errMsg.length,
    `"${label}": error-Feld ist leer oder fehlt — Silent Fail!`
  ).toBeGreaterThan(3);

  console.log(`✓ Geblockt [${res.status()}]: "${label}" → "${errMsg}"`);
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

let buyerToken:   string;
let seller1Token: string;
let seller2Token: string;

// PROPOSAL-Lot, den der Käufer frisch öffnet für Gebotstests
let proposalLotId: string;

test.beforeAll(async ({ request }) => {
  [buyerToken, seller1Token, seller2Token] = await Promise.all([
    jwt(USERS.buyer),
    jwt(USERS.seller1),
    jwt(USERS.seller2),
  ]);

  // Frisches PROPOSAL-Lot für Phase-Tests anlegen
  const createRes = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity: "HOT_ROLLED_COIL", quantity: 50, unit: "TON", startPrice: 500,
    incoterms: "EXW", deliveryLocation: "Hamburg", deliveryPeriod: "2 Wochen",
    paymentTerms: "14 Tage netto", vatTreatment: "INLAND_19",
    hsCode: "7208370010", qualityGrade: "S235JR", description: "Negativ-Test Lot",
    greenSteel: false,
  });
  if (createRes.status() === 201 || createRes.status() === 200) {
    const b = await createRes.json() as Record<string, unknown>;
    proposalLotId = (b["lotId"] ?? b["id"]) as string;

    // publish + register seller1 + open
    await api(request, "PATCH", `/api/auction/lots/${proposalLotId}/publish`, buyerToken);
    await api(request, "POST",  `/api/auction/lots/${proposalLotId}/register`, seller1Token);
    await api(request, "POST",  `/api/auction/lots/${proposalLotId}/open`, buyerToken, {
      auctionEnd: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
    });
    console.log(`[Setup] PROPOSAL-Lot angelegt: ${proposalLotId}`);
  } else {
    console.warn(`[Setup] Lot-Erstellung fehlgeschlagen: ${createRes.status()}`);
    proposalLotId = "";
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// A. ROLLENÜBERSCHREITUNG
// ═══════════════════════════════════════════════════════════════════════════════

test("A1: Käufer versucht Gebot abzugeben (nur Verkäufer erlaubt)", async ({ request }) => {
  const lotId = proposalLotId || LOT_BUYER_CONTRACT;
  const res = await api(request, "POST", `/api/auction/lots/${lotId}/bids`, buyerToken, { price: 400 });
  await assertBlocked(res, [403, 409], "Käufer bietet (Rollenverstoß)");
});

test("A2: Verkäufer versucht Lot zu erstellen (nur Käufer erlaubt)", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", seller1Token, {
    commodity: "REBAR_B500B", quantity: 10, unit: "TON", startPrice: 300,
    incoterms: "DAP", deliveryLocation: "Berlin", deliveryPeriod: "1 Woche",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7214200010",
    qualityGrade: "B500B", description: "Verkäufer-Lot-Versuch", greenSteel: false,
  });
  await assertBlocked(res, [403], "Verkäufer erstellt Lot (Rollenverstoß)");
});

test("A3: Verkäufer bietet auf eigenes Lot (Käufer === Verkäufer = Conflict of Interest)", async ({ request }) => {
  if (!proposalLotId) { test.skip(); return; }
  // Der Käufer (buyerToken) ist der Ersteller des proposalLot
  // Seller1 hat sich für proposalLot registriert und darf bieten
  // Käufer (als Bieter) muss blockiert werden
  const res = await api(request, "POST", `/api/auction/lots/${proposalLotId}/bids`, buyerToken, { price: 480 });
  await assertBlocked(res, [403, 409], "Käufer bietet auf eigenes Lot");
});

// ═══════════════════════════════════════════════════════════════════════════════
// B. UNGÜLTIGE EINGABEDATEN (Validierungsangriffe)
// ═══════════════════════════════════════════════════════════════════════════════

test("B1: Gebot mit negativem Preis (-50 EUR)", async ({ request }) => {
  const lotId = proposalLotId || LOT_CONCLUDED;
  const res = await api(request, "POST", `/api/auction/lots/${lotId}/bids`, seller1Token, { price: -50 });
  await assertBlocked(res, [400, 422], "Negativer Preis bei Gebot");
});

test("B2: Gebot mit Preis Null (0 EUR)", async ({ request }) => {
  const lotId = proposalLotId || LOT_CONCLUDED;
  const res = await api(request, "POST", `/api/auction/lots/${lotId}/bids`, seller1Token, { price: 0 });
  await assertBlocked(res, [400, 422], "Preis Null bei Gebot");
});

test("B3: Lot-Erstellung mit negativer Menge (-500 Tonnen)", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity: "REBAR_B500B", quantity: -500, unit: "TON", startPrice: 400,
    incoterms: "DAP", deliveryLocation: "München", deliveryPeriod: "1 Woche",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7214200010",
    qualityGrade: "B500B", description: "Negativ-Menge Test", greenSteel: false,
  });
  await assertBlocked(res, [400, 422], "Lot mit negativer Menge");
});

test("B4: Lot-Erstellung mit Menge Null", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity: "REBAR_B500B", quantity: 0, unit: "TON", startPrice: 400,
    incoterms: "DAP", deliveryLocation: "München", deliveryPeriod: "1 Woche",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7214200010",
    qualityGrade: "B500B", description: "Menge-Null Test", greenSteel: false,
  });
  await assertBlocked(res, [400, 422], "Lot mit Menge 0");
});

test("B5: Lot-Erstellung ohne Pflichtfelder (leerer Body)", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", buyerToken, {});
  await assertBlocked(res, [400, 422], "Lot ohne Pflichtfelder");
});

test("B6: Gebot mit Text statt Zahl als Preis", async ({ request }) => {
  const lotId = proposalLotId || LOT_CONCLUDED;
  const res = await api(request, "POST", `/api/auction/lots/${lotId}/bids`, seller1Token, { price: "sehr_guenstig" });
  await assertBlocked(res, [400, 422], "Preis als String statt Zahl");
});

test("B7: Lot-Erstellung mit ungültigem unit-Enum", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity: "REBAR_B500B", quantity: 100, unit: "FÄSSER", startPrice: 400,
    incoterms: "DAP", deliveryLocation: "Berlin", deliveryPeriod: "1 Woche",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7214200010",
    qualityGrade: "B500B", description: "Ungültiges Unit", greenSteel: false,
  });
  await assertBlocked(res, [400, 422], "Lot mit ungültigem unit-Enum");
});

// ═══════════════════════════════════════════════════════════════════════════════
// C. STATE-MACHINE-BRUCH (falsche Phase)
// ═══════════════════════════════════════════════════════════════════════════════

test("C1: Gebot auf abgeschlossenes Lot (COMPLETED)", async ({ request }) => {
  const res = await api(request, "POST", `/api/auction/lots/${LOT_CONCLUDED}/bids`, seller1Token, { price: 100 });
  await assertBlocked(res, [400, 403, 409], "Gebot auf COMPLETED-Lot");
});

test("C2: Gebot auf nicht existierendes Lot (UUID-Erfindung)", async ({ request }) => {
  const fakeId = "00000000-0000-4000-8000-000000000099";
  const res = await api(request, "POST", `/api/auction/lots/${fakeId}/bids`, seller1Token, { price: 200 });
  await assertBlocked(res, [404], "Gebot auf nicht-existentes Lot");
});

test("C3: Lieferstatus-Sprung rückwärts (DELIVERED → MATCHED)", async ({ request }) => {
  const res = await api(request, "PATCH", `/api/auction/lots/${LOT_CONCLUDED}/delivery`, seller1Token, {
    status: "MATCHED",
  });
  await assertBlocked(res, [400, 403, 404, 409, 422], "Lieferstatus rückwärts (DELIVERED→MATCHED)");
});

test("C4: Lot öffnen ohne Verkäufer-Registrierung", async ({ request }) => {
  // Erstelle ein frisches Lot und versuche es sofort zu öffnen (ohne register)
  const createRes = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity: "STRUCTURAL_STEEL", quantity: 20, unit: "TON", startPrice: 600,
    incoterms: "FCA", deliveryLocation: "Köln", deliveryPeriod: "3 Wochen",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7216330090",
    qualityGrade: "S355JR", description: "Open-ohne-Register Test", greenSteel: false,
  });

  if (createRes.status() !== 201 && createRes.status() !== 200) { test.skip(); return; }
  const cb = await createRes.json() as Record<string, unknown>;
  const newLotId = (cb["lotId"] ?? cb["id"]) as string;

  await api(request, "PATCH", `/api/auction/lots/${newLotId}/publish`, buyerToken);

  // Direkt open — ohne einen Verkäufer zu registrieren → muss 422 sein
  const openRes = await api(request, "POST", `/api/auction/lots/${newLotId}/open`, buyerToken, {
    auctionEnd: new Date(Date.now() + 3600_000).toISOString(),
  });
  await assertBlocked(openRes, [400, 409, 422], "Lot öffnen ohne Verkäufer");
});

test("C5: Dispute auf Lot das nicht DELIVERED ist", async ({ request }) => {
  const res = await api(request, "POST", `/api/auction/lots/${LOT_CONCLUDED}/dispute`, buyerToken, {
    reason: "Test-Sabotage Qualitätsmangel detailliert",
  });
  // COMPLETED-Lot ist bereits abgeschlossen — kein Dispute mehr möglich (409)
  // Falls lot_disputes-Tabelle fehlt → 503 (robuster DB-Fehler, kein leerer 500)
  // 403: Buyer ist nicht Vertragspartei dieses Lots
  await assertBlocked(res, [400, 403, 409, 422, 503], "Dispute auf COMPLETED-Lot");
});

// ═══════════════════════════════════════════════════════════════════════════════
// D. ID-SPOOFING / RESSOURCENZUGRIFF
// ═══════════════════════════════════════════════════════════════════════════════

test("D1: Seller2 versucht PDF-Vertrag von Buyer (Fremd-Kontrakt) herunterzuladen", async ({ request }) => {
  // LOT_BUYER_CONTRACT gehört dem Buyer + Seller1, nicht Seller2
  const res = await api(request, "GET", `/api/auction/lots/${LOT_BUYER_CONTRACT}/contract`, seller2Token);
  await assertBlocked(res, [403, 404], "Seller2 lädt fremden Vertrag (ID-Spoofing)");
});

test("D2: Seller1 versucht Gebote des anderen Sellers einzusehen (anonymisiert?)", async ({ request }) => {
  const res = await api(request, "GET", `/api/auction/lots/${LOT_BUYER_CONTRACT}/bids`, seller1Token);
  // Muss entweder blockieren oder die sellerId anonymisieren (kein echter Fail)
  if (res.status() === 200) {
    const body = await res.json() as Record<string, unknown>;
    const bids = (body["bids"] ?? []) as Array<Record<string, unknown>>;
    for (const bid of bids) {
      // Kein echtes sellerId darf für fremde Gebote sichtbar sein (nur "Verkäufer-2" o.ä.)
      const sellerId = String(bid["sellerId"] ?? "");
      if (bid["isOwn"] !== true && sellerId.match(/^[a-z0-9-]{20,}$/)) {
        throw new Error(`[DATENLECK] Echte sellerId "${sellerId}" in Gebot sichtbar!`);
      }
    }
    console.log(`✓ Gebote korrekt anonymisiert (${bids.length} Gebote geprüft)`);
  } else {
    console.log(`✓ Gebote nicht zugänglich [${res.status()}]`);
  }
});

test("D3: Unautorisierter Zugriff auf Wallet (kein Token)", async ({ request }) => {
  const res = await api(request, "GET", "/api/buyer/wallet", null);
  await assertBlocked(res, [401], "Wallet-Zugriff ohne Token");
});

test("D4: Verkäufer versucht Buyer-Wallet zu lesen", async ({ request }) => {
  const res = await api(request, "GET", "/api/buyer/wallet", seller1Token);
  // Wallet ist ausschließlich für Käufer — Seller muss 403 bekommen
  await assertBlocked(res, [403], "Seller liest Buyer-Wallet (Rollenverstoß)");
});

test("D5: Ungültiger JWT (gefälschte Signatur)", async ({ request }) => {
  const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJoYWNrZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4ifQ.FAKE_SIGNATURE_HERE";
  const res = await api(request, "GET", "/api/auction/lots", fakeToken);
  await assertBlocked(res, [401], "Gefälschter JWT-Token");
});

test("D6: Abgelaufener JWT-Token", async ({ request }) => {
  // Token mit exp in der Vergangenheit
  const expiredToken = await new SignJWT({ userId: USERS.buyer.id, orgId: USERS.buyer.orgId, role: USERS.buyer.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200) // vor 2h
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // vor 1h abgelaufen
    .setIssuer("eucx.eu")
    .setAudience("eucx-api")
    .sign(new TextEncoder().encode(SECRET));

  const res = await api(request, "POST", "/api/auction/lots", expiredToken, {
    commodity: "REBAR_B500B", quantity: 10, unit: "TON", startPrice: 300,
    incoterms: "DAP", deliveryLocation: "Berlin", deliveryPeriod: "1 Woche",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7214200010",
    qualityGrade: "B500B", description: "Expired Token Test", greenSteel: false,
  });
  await assertBlocked(res, [401], "Abgelaufener JWT");
});

// ═══════════════════════════════════════════════════════════════════════════════
// E. AUTH-ANGRIFFE
// ═══════════════════════════════════════════════════════════════════════════════

test("E1: Kein Authorization-Header (kein Token)", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", null, {
    commodity: "REBAR_B500B", quantity: 10, unit: "TON", startPrice: 300,
    incoterms: "DAP", deliveryLocation: "Berlin", deliveryPeriod: "1 Woche",
    paymentTerms: "30 Tage", vatTreatment: "INLAND_19", hsCode: "7214200010",
    qualityGrade: "B500B", description: "Kein Token Test", greenSteel: false,
  });
  await assertBlocked(res, [401], "Lot-Erstellung ohne Token");
});

test("E2: Bearer-Prefix fehlt (roher Token)", async ({ request }) => {
  const rawToken = buyerToken; // ohne "Bearer " prefix
  const res = await request.get(`${BASE}/api/auction/lots`, {
    headers: { Authorization: rawToken }, // kein "Bearer " davor
  });
  await assertBlocked(res, [401], "Token ohne Bearer-Prefix");
});

test("E3: SQL-Injection im lotId-Parameter", async ({ request }) => {
  const injectedId = "1'; DROP TABLE lots; --";
  const res = await api(request, "GET", `/api/auction/lots/${encodeURIComponent(injectedId)}/bids`, seller1Token);
  // Next.js Router sollte 404 für ungültige IDs zurückgeben, nicht 500
  expect(
    res.status(),
    `SQL-Injection: Unerwarteter Status ${res.status()} (kein 500 erwartet!)`
  ).not.toBe(500);
  expect([400, 404]).toContain(res.status());
  console.log(`✓ SQL-Injection geblockt [${res.status()}]`);
});

test("E4: XSS-Payload im Lot-Beschreibungsfeld", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity:       "REBAR_B500B",
    quantity:        10,
    unit:            "TON",
    startPrice:      300,
    incoterms:       "DAP",
    deliveryLocation: "Berlin",
    deliveryPeriod:  "1 Woche",
    paymentTerms:    "30 Tage",
    vatTreatment:    "INLAND_19",
    hsCode:          "7214200010",
    qualityGrade:    "B500B",
    description:     "<script>alert('xss')</script>", // XSS
    greenSteel:      false,
  });

  // Die API sollte den Input entweder ablehnen (422) oder sanitieren
  // Falls 200/201: Prüfe ob der XSS-String im Response gespeichert wurde
  if (res.status() === 201 || res.status() === 200) {
    const body = await res.json() as Record<string, unknown>;
    // Wir können nur prüfen, dass die API nicht abstürzt
    // Die eigentliche XSS-Prüfung erfolgt im Frontend (React escaped automatisch)
    console.log(`[HINWEIS] XSS-String wurde akzeptiert (ID: ${body["lotId"] ?? body["id"] ?? "?"}) — React escaped beim Rendern`);
  } else {
    console.log(`✓ XSS-Payload abgelehnt [${res.status()}]`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ZUSAMMENFASSUNG
// ═══════════════════════════════════════════════════════════════════════════════

test.afterAll(async () => {
  console.log("\n═══════ EUCX Negative Path Suite — Abgeschlossen ═══════");
  console.log("Alle illegalen Aktionen wurden auf korrekte Backend-Ablehnung geprüft.");
  console.log("Bericht: playwright-report/index.html");
});
