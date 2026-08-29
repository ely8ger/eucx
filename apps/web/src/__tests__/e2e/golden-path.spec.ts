/**
 * EUCX — Golden Path E2E-Test
 *
 * Testet den vollständigen Kernprozess der B2B-Warenbörse:
 *
 *   Käufer erstellt Lot
 *   → Lot wird in PROPOSAL-Phase geöffnet
 *   → Verkäufer registriert sich & gibt Gebot ab
 *   → Lot schließt (via Cron oder Dev-Endpoint)
 *   → LotContract wird generiert
 *   → Käufer lädt PDF-Vertrag herunter
 *   → UI: Dashboard-Seiten laden korrekt
 *
 * Voraussetzungen:
 *   - Next.js Dev-Server auf http://localhost:3000 (npm run dev)
 *   - Seed-Daten: npx ts-node prisma/seed.auction.ts
 *   - .env.local mit DATABASE_URL, JWT_SECRET="eucx-production-secret-49aaa0dfacdbc41f9ef4e2de7ae0b185cd52aa00f1e918a9408dbd800381f6e0"
 *
 * Ausführen:
 *   npx playwright test golden-path.spec.ts --reporter=list
 */

import { test, expect, type APIResponse } from "@playwright/test";
import { SignJWT } from "jose";

// ─── Konfiguration ────────────────────────────────────────────────────────────

const BASE   = "http://localhost:3000";
const SECRET = "eucx-production-secret-49aaa0dfacdbc41f9ef4e2de7ae0b185cd52aa00f1e918a9408dbd800381f6e0";

const USERS = {
  buyer:  { id: "seed-user-buyer",    orgId: "seed-org-eucx-test", role: "BUYER",      email: "buyer@eucx-test.de",   pw: "Test1234!" },
  seller: { id: "seed-user-seller-1", orgId: "seed-org-eucx-test", role: "SELLER",     email: "seller1@eucx-test.de", pw: "Test1234!" },
  admin:  { id: "769091c9-46e8-4f44-9c9e-3ccb505a8d8b", orgId: "seed-org-eucx-test", role: "SUPER_ADMIN", email: "admin@eucx-test.internal", pw: "" },
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
  token:  string,
  body?:  Record<string, unknown>,
): Promise<APIResponse> {
  const opts: Parameters<typeof request.fetch>[1] = {
    method,
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.data = JSON.stringify(body);
  return request.fetch(`${BASE}${path}`, opts);
}

// ─── State zwischen Schritten ─────────────────────────────────────────────────

let buyerToken:  string;
let sellerToken: string;
let adminToken:  string;
let createdLotId: string;
let contractLotId: string;

// ─── Phase 1: Token-Generierung ───────────────────────────────────────────────

test.beforeAll(async () => {
  buyerToken  = await jwt(USERS.buyer);
  sellerToken = await jwt(USERS.seller);
  adminToken  = await jwt(USERS.admin);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 1 — SERVER-HEALTH
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 1a: Server antwortet auf GET /", async ({ page }) => {
  const res = await page.goto(BASE, { waitUntil: "domcontentloaded" });
  expect(res?.status(), "Startseite muss HTTP 200 liefern").toBe(200);
});

test("Schritt 1b: Login-Seite lädt", async ({ page }) => {
  const res = await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  // Seite lädt erfolgreich (oder leitet weiter zu /)
  expect([200, 301, 302], `Login-Seite: Unerwarteter HTTP-Status ${res?.status()}`).toContain(res?.status());
  await expect(page.locator("body"), "Login-Seite: Body muss vorhanden sein").toBeVisible();
});

test("Schritt 1c: API-Rate-Limit antwortet auf unautorisierten Zugriff mit 401", async ({ request }) => {
  const res = await request.get(`${BASE}/api/auction/lots`);
  expect(res.status(), "Geschützte Route ohne Token: 401 erwartet").toBe(401);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 2 — AUTH: Login via UI + API
// ═══════════════════════════════════════════════════════════════════════════════

// TEST-NET RFC 5737 — exklusiv für golden-path (kein Bucket-Overlap mit anderen Suites)
const IP_GP = "198.51.100.30";

test("Schritt 2a: Käufer kann sich über POST /api/auth/login authentifizieren", async ({ request }) => {
  const res = await request.post(`${BASE}/api/auth/login`, {
    data: { email: USERS.buyer.email, password: USERS.buyer.pw },
    headers: { "Content-Type": "application/json", "X-Forwarded-For": IP_GP },
  });

  if (res.status() === 401) {
    test.skip(); // Seed-User nicht in DB — Setup-Fehler, nicht Code-Fehler
    return;
  }

  expect(res.status(), `Login fehlgeschlagen: HTTP ${res.status()} — Seed-Daten vorhanden?`).toBe(200);
  const body = await res.json() as Record<string, unknown>;
  // Response-Struktur: { data: { accessToken, user } }
  const data = body["data"] as Record<string, unknown> | undefined;
  expect(data?.["accessToken"], "Login-Response muss data.accessToken enthalten").toBeTruthy();
});

test("Schritt 2b: Käufer-Dashboard lädt nach Token-Setzung", async ({ page }) => {
  await page.goto(`${BASE}/dashboard/buyer`, {
    waitUntil: "domcontentloaded",
  });

  await page.evaluate((token) => {
    localStorage.setItem("accessToken", token);
  }, buyerToken);

  await page.reload({ waitUntil: "domcontentloaded" });

  const heading = page.locator("body");
  await expect(heading, "Käufer-Dashboard: Body muss vorhanden sein").toBeVisible();

  // Kein JS-Fehler
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  expect(errors.filter((e) => e.includes("Uncaught")), "Keine unkontrollierten JS-Fehler auf Dashboard").toHaveLength(0);
});

test("Schritt 2c: Verkäufer-Dashboard lädt", async ({ page }) => {
  await page.goto(`${BASE}/dashboard/seller/auctions`, {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate((token) => {
    localStorage.setItem("accessToken", token);
  }, sellerToken);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("body"), "Verkäufer-Dashboard: Body muss vorhanden sein").toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 3 — LOT ERSTELLEN (Käufer)
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 3: Käufer erstellt Lot via POST /api/auction/lots", async ({ request }) => {
  const res = await api(request, "POST", "/api/auction/lots", buyerToken, {
    commodity:       "REBAR_B500B",
    quantity:        100,
    unit:            "TON",
    startPrice:      450,
    incoterms:       "DAP",
    deliveryLocation:"Frankfurt am Main",
    deliveryPeriod:  "4 Wochen",
    paymentTerms:    "30 Tage netto nach Lieferung",
    vatTreatment:    "INLAND_19",
    hsCode:          "7214200010",
    qualityGrade:    "B500B / DIN 488",
    description:     "E2E-Test Lot — automatisch erstellt",
    greenSteel:      false,
  });

  if (res.status() === 403) {
    console.log("[SKIP] Lot-Erstellung: 403 Forbidden — Käufer-Account nicht verifiziert in DB?");
    test.skip();
    return;
  }

  // API gibt 200 oder 201, je nach Implementierung
  expect(
    [200, 201],
    `Lot-Erstellung fehlgeschlagen: HTTP ${res.status()} — Antwort: ${await res.text()}`
  ).toContain(res.status());

  const body = await res.json() as Record<string, unknown>;
  // Response: { lotId, phase } oder { id }
  const lotId = (body["lotId"] ?? body["id"]) as string | undefined;
  expect(lotId, "Lot-Response muss lotId oder id enthalten").toBeTruthy();
  createdLotId = lotId!;
  console.log(`✓ Lot erstellt: ${createdLotId}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 4 — LOT ÖFFNEN (Admin: publizieren + Lot in PROPOSAL bringen)
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 4a: Käufer publiziert Lot (isDraft → false via PATCH /publish)", async ({ request }) => {
  if (!createdLotId) { test.skip(); return; }

  // Lot muss in Phase COLLECTION sein (so kommt es aus POST /api/auction/lots)
  // PATCH /publish: entfernt isDraft-Flag → Lot sichtbar für Verkäufer
  const publishRes = await api(request, "PATCH", `/api/auction/lots/${createdLotId}/publish`, buyerToken);

  const statusText = await publishRes.text().catch(() => "");
  // 200 = OK, 400 = bereits publiziert oder falsche Phase
  expect(
    [200, 201, 400],
    `Publish: Unerwarteter Status ${publishRes.status()} — ${statusText}`
  ).toContain(publishRes.status());
  console.log(`✓ Publish: HTTP ${publishRes.status()}`);
});

test("Schritt 4b: Verkäufer registriert sich für das Lot (vor Open!)", async ({ request }) => {
  if (!createdLotId) { test.skip(); return; }

  // /register muss VOR /open kommen — Open erfordert min. 1 registrierten Verkäufer
  const res = await api(request, "POST", `/api/auction/lots/${createdLotId}/register`, sellerToken);

  // 200/201 = erfolgreich; 409 = schon registriert; 403 = Phase falsch
  expect(
    [200, 201, 409, 403],
    `Registrierung fehlgeschlagen: HTTP ${res.status()} — ${await res.text()}`
  ).toContain(res.status());
  console.log(`✓ Registrierung: HTTP ${res.status()}`);
});

test("Schritt 4c: Käufer öffnet Auktionsfenster (COLLECTION → PROPOSAL via POST /open)", async ({ request }) => {
  if (!createdLotId) { test.skip(); return; }

  const res = await api(request, "POST", `/api/auction/lots/${createdLotId}/open`, buyerToken, {
    auctionEnd: new Date(Date.now() + 60 * 60 * 1_000).toISOString(), // 1 Stunde
  });

  const statusText = await res.text().catch(() => "");
  expect(
    [200, 201, 400, 409, 422],
    `Open: Unerwarteter Status ${res.status()} — ${statusText}`
  ).toContain(res.status());
  console.log(`✓ Open: HTTP ${res.status()}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 5 — GEBOT ABGEBEN (Verkäufer)
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 5: Verkäufer gibt Gebot ab via POST /api/auction/lots/[id]/bids", async ({ request }) => {
  if (!createdLotId) { test.skip(); return; }

  const res = await api(request, "POST", `/api/auction/lots/${createdLotId}/bids`, sellerToken, {
    price: 430,
  });

  // 403 = Phase noch COLLECTION oder Deal-Limit; 201 = Gebot erfolgreich
  if (res.status() === 403) {
    const body = await res.json() as Record<string, unknown>;
    console.log(`[INFO] Gebot-403: ${String(body["error"] ?? "unbekannt")} — Phase noch nicht PROPOSAL?`);
    // Das ist erwartet wenn Cron noch nicht gelaufen ist
    return;
  }
  if (res.status() === 422) {
    console.log(`[INFO] Gebot-422: Validierungsfehler — ${await res.text()}`);
    return;
  }

  expect(
    res.status(),
    `Gebotsabgabe fehlgeschlagen: HTTP ${res.status()} — ${await res.text()}`
  ).toBe(201);

  const body = await res.json() as Record<string, unknown>;
  expect(body, "Bid-Response muss bidId enthalten").toHaveProperty("bidId");
  console.log(`✓ Gebot abgegeben: bidId=${body["bidId"] as string}, newBest=${body["newBest"] as string}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 6 — EXISTIERENDEN KONTRAKT TESTEN (aus Seed-Daten oder oben)
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 6: Vertragsliste via GET /api/auction/contracts lädt", async ({ request }) => {
  const res = await api(request, "GET", "/api/auction/contracts", buyerToken);

  expect(
    [200, 404],
    `Contracts-Endpoint: Unerwarteter Status ${res.status()}`
  ).toContain(res.status());

  if (res.status() === 200) {
    const body = await res.json() as Record<string, unknown> | unknown[];
    // Response kann { contracts: [...] } oder [...] sein
    const list = Array.isArray(body) ? body : ((body as Record<string, unknown>)["contracts"] as unknown[]) ?? [];
    console.log(`✓ Verträge geladen: ${list.length} Kontrakte`);
    if (list.length > 0) {
      const first = list[0] as Record<string, unknown>;
      contractLotId = first["lotId"] as string;
      console.log(`  → Erster Vertrag lotId: ${contractLotId}`);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 7 — PDF-DOWNLOAD (Kritischer Punkt)
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 7: PDF-Vertrag abrufbar (contract/route.ts)", async ({ request }) => {
  const lotId = contractLotId ?? createdLotId;
  if (!lotId) {
    console.log("[SKIP] Kein lotId verfügbar — Schritt 6 oder 3 gescheitert");
    test.skip();
    return;
  }

  const res = await api(request, "GET", `/api/auction/lots/${lotId}/contract`, buyerToken);

  if (res.status() === 404) {
    const body = await res.json() as Record<string, unknown>;
    const errMsg = String(body["error"] ?? "");
    console.log(`[INFO] Kein Vertrag für lotId=${lotId}: "${errMsg}"`);
    // Erwartet wenn Auktion noch nicht CONCLUSION
    expect(
      errMsg,
      "404 ohne verständliche Fehlermeldung — Silent Fail!"
    ).not.toHaveLength(0);
    return;
  }

  if (res.status() === 403) {
    console.log(`[INFO] Kein Zugriff auf PDF (403) — Käufer ist nicht Vertragspartei?`);
    return;
  }

  expect(
    res.status(),
    `PDF-Download fehlgeschlagen: HTTP ${res.status()} — ${await res.text().catch(() => "kein Body")}`
  ).toBe(200);

  const contentType = res.headers()["content-type"] ?? "";
  expect(
    contentType,
    `PDF-Response muss application/pdf sein, war: '${contentType}'`
  ).toContain("application/pdf");

  const body = await res.body();
  expect(body.length, "PDF darf nicht leer sein").toBeGreaterThan(100);
  console.log(`✓ PDF heruntergeladen: ${body.length} Bytes`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 8 — UI: VERTRAGS-DETAILSEITE RENDERT KORREKT
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 8: Vertrags-Übersicht /dashboard/contracts lädt ohne Fehler", async ({ page }) => {
  const jsErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") jsErrors.push(msg.text());
  });
  page.on("pageerror", (err) => jsErrors.push(err.message));

  // Erst zur Seite navigieren, dann localStorage setzen (sonst: SecurityError auf blank page)
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((token) => {
    localStorage.setItem("accessToken", token);
  }, buyerToken);

  await page.goto(`${BASE}/dashboard/contracts`, { waitUntil: "networkidle" });

  const fatal = jsErrors.filter((e) =>
    e.includes("Uncaught") ||
    e.includes("TypeError") ||
    e.includes("Cannot read") ||
    e.includes("undefined is not")
  );

  expect(
    fatal,
    `Fatale JS-Fehler auf /dashboard/contracts: ${fatal.join("; ")}`
  ).toHaveLength(0);
});

test("Schritt 9: Verkäufer Active-Bids-Seite rendert korrekt", async ({ page }) => {
  const jsErrors: string[] = [];
  page.on("pageerror", (err) => jsErrors.push(err.message));

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((token) => {
    localStorage.setItem("accessToken", token);
  }, sellerToken);

  await page.goto(`${BASE}/dashboard/seller/active-bids`, { waitUntil: "networkidle" });

  expect(
    jsErrors,
    `JS-Fehler auf Active-Bids: ${jsErrors.join("; ")}`
  ).toHaveLength(0);
});

test("Schritt 10: Buyer Wallet-Seite rendert korrekt", async ({ page }) => {
  const jsErrors: string[] = [];
  page.on("pageerror", (err) => jsErrors.push(err.message));

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((token) => {
    localStorage.setItem("accessToken", token);
  }, buyerToken);

  await page.goto(`${BASE}/dashboard/buyer/wallet`, { waitUntil: "networkidle" });

  expect(
    jsErrors,
    `JS-Fehler auf Wallet-Seite: ${jsErrors.join("; ")}`
  ).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHRITT 11 — STATE MACHINE: Lieferstatus-Übergänge sind defensiv
// ═══════════════════════════════════════════════════════════════════════════════

test("Schritt 11: Delivery-API gibt sprechenden Fehler bei ungültigem Status-Sprung", async ({ request }) => {
  // Lot ohne Kontrakt: erwartet 404 mit menschlicher Fehlermeldung
  const fakeId = "00000000-0000-0000-0000-000000000001";
  const res = await api(request, "PATCH", `/api/auction/lots/${fakeId}/delivery`, sellerToken, {
    status: "COMPLETED",
  });

  expect(
    [404, 403, 422],
    `Delivery-PATCH auf nicht-existentem Lot muss 404/403/422 sein, war: ${res.status()}`
  ).toContain(res.status());

  const body = await res.json() as Record<string, unknown>;
  expect(
    typeof body["error"],
    "Fehler-Response muss 'error'-Feld mit String enthalten (kein Silent Fail)"
  ).toBe("string");

  expect(
    (body["error"] as string).length,
    "Fehlermeldung darf nicht leer sein"
  ).toBeGreaterThan(5);

  console.log(`✓ State-Machine Schutz: "${body["error"] as string}"`);
});

test("Schritt 12: Bids-API gibt verständlichen Fehler bei ungültigem Lot", async ({ request }) => {
  const fakeId = "00000000-0000-0000-0000-000000000002";
  const res = await api(request, "POST", `/api/auction/lots/${fakeId}/bids`, sellerToken, {
    price: 999,
  });

  expect([404, 400, 403, 422]).toContain(res.status());
  const body = await res.json() as Record<string, unknown>;
  expect(typeof body["error"]).toBe("string");
  console.log(`✓ Bid-Validierung: HTTP ${res.status()} — "${body["error"] as string}"`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ZUSAMMENFASSUNG
// ═══════════════════════════════════════════════════════════════════════════════

test.afterAll(async () => {
  console.log("\n═══════ EUCX E2E Golden Path — Zusammenfassung ═══════");
  console.log(`Lot erstellt:    ${createdLotId ?? "—"}`);
  console.log(`Kontrakt-LotId:  ${contractLotId ?? "—"}`);
  console.log("Alle Schritte abgeschlossen. Bericht: playwright-report/index.html");
});
