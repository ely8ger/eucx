/**
 * Payload-Stress & Zeichensatz-Tests
 *
 * Prüft:
 *   1. Zod-Validierung: Überlange Strings → 422
 *   2. Unicode / Emojis in gültigen Feldern → kein Absturz, sauber gespeichert
 *   3. Extremwerte bei quantity (sehr große Zahlen)
 *   4. PDF-Robustheit: Unicode-Lot → PDF-Abruf liefert valides application/pdf
 *
 * Feldgrenzen (Zod-Schema in lots/route.ts):
 *   commodity:        max 120 Zeichen
 *   description:      max 2.000 Zeichen
 *   deliveryLocation: max 200 Zeichen
 *   qualityGrade:     max 120 Zeichen
 *   deliveryPeriod:   max 120 Zeichen
 *   paymentTerms:     max 120 Zeichen
 *   hsCode:           max 20 Zeichen
 *   vatTreatment:     max 120 Zeichen
 *
 * Technische Hinweise:
 *   - Die Middleware hat einen eigenen Rate-Limit-Store (Edge Runtime).
 *     resetRateLimit() löscht nur den Node.js-Store (API-Routes).
 *     Um Cross-Suite-Interferenz zu vermeiden, nutzt jede Suite eine
 *     dedizierte TEST-NET-IP (RFC 5737, 203.0.113.0/24) für alle Requests.
 *
 * Voraussetzungen:
 *   - Dev-Server auf Port 3000
 *   - Seed-Daten vorhanden (buyer@eucx-test.de, seller1@eucx-test.de, all Test1234!)
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

// Dedizierte TEST-NET-IPs (RFC 5737, 203.0.113.0/24) pro Suite
// Jede Suite nutzt max. 2 Login-Aufrufe → weit unter auth-Limit (5/min)
const IP_ZOD   = "203.0.113.10"; // Feldlängen-Validierung
const IP_UNICODE = "203.0.113.11"; // Unicode & Emoji
const IP_PDF   = "203.0.113.12"; // PDF-Generierung

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

async function login(email: string, password: string, ip: string): Promise<string> {
  const res  = await fetch(`${BASE}/api/auth/login`, {
    method:  "POST",
    headers: {
      "Content-Type":    "application/json",
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json() as { data?: { accessToken?: string } };
  const token = body.data?.accessToken;
  if (!token) throw new Error(`Login fehlgeschlagen für ${email}: ${JSON.stringify(body)}`);
  return token;
}

/** Minimaler valider Lot-Body */
function validLotBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    commodity:        "REBAR_B500B",
    quantity:         50,
    unit:             "TON",
    startPrice:       400,
    incoterms:        "DAP",
    deliveryLocation: "Frankfurt am Main",
    deliveryPeriod:   "4 Wochen",
    paymentTerms:     "30 Tage netto",
    vatTreatment:     "INLAND_19",
    hsCode:           "7214200010",
    qualityGrade:     "B500B",
    description:      "Standard-Testbeschreibung",
    greenSteel:       false,
    ...overrides,
  };
}

async function createLot(
  buyerToken: string,
  ip:         string,
  body:       Record<string, unknown>
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res  = await fetch(`${BASE}/api/auction/lots`, {
    method:  "POST",
    headers: {
      "Content-Type":    "application/json",
      "Authorization":   `Bearer ${buyerToken}`,
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json() as Record<string, unknown>;
  return { status: res.status, json };
}

const repeat = (str: string, targetLen: number): string => {
  const full = Math.ceil(targetLen / str.length);
  return str.repeat(full).slice(0, targetLen);
};

// ─── Suite 1: Feldlängen-Validierung (Zod) ────────────────────────────────────

test.describe("Payload-Stress: Feldlängen-Validierung (Zod)", () => {
  let buyerToken: string;

  test.beforeAll(async () => {
    buyerToken = await login("buyer@eucx-test.de", "Test1234!", IP_ZOD);
  });

  // ── deliveryLocation ───────────────────────────────────────────────────────

  test("deliveryLocation 200 Zeichen (Grenzwert) → 201 akzeptiert", async () => {
    const { status } = await createLot(buyerToken, IP_ZOD, validLotBody({
      deliveryLocation: repeat("X", 200),
    }));
    expect(status).toBe(201);
  });

  test("deliveryLocation 201 Zeichen → 422 (max 200)", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      deliveryLocation: repeat("X", 201),
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  test("deliveryLocation 10.000 Zeichen → 422", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      deliveryLocation: repeat("A", 10_000),
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  // ── description ────────────────────────────────────────────────────────────

  test("description 2.000 Zeichen (Grenzwert) → 201 akzeptiert", async () => {
    const { status } = await createLot(buyerToken, IP_ZOD, validLotBody({
      description: repeat("B", 2_000),
    }));
    expect(status).toBe(201);
  });

  test("description 2.001 Zeichen → 422", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      description: repeat("B", 2_001),
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  test("description 10.000 Zeichen → 422", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      description: repeat("C", 10_000),
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  // ── commodity ──────────────────────────────────────────────────────────────

  test("commodity 121 Zeichen → 422", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      commodity: repeat("A", 121), // 121 Zeichen > max 120
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  // ── qualityGrade ───────────────────────────────────────────────────────────

  test("qualityGrade 121 Zeichen → 422", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      qualityGrade: repeat("Q", 121),
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  // ── hsCode ─────────────────────────────────────────────────────────────────

  test("hsCode 21 Zeichen → 422 (max 20)", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      hsCode: repeat("7", 21),
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  // ── quantity ───────────────────────────────────────────────────────────────

  test("quantity = 1.000.000 TON → 201 (kein Max-Limit in Zod)", async () => {
    const { status } = await createLot(buyerToken, IP_ZOD, validLotBody({
      quantity:   1_000_000,
      startPrice: 0.01,
    }));
    expect(status).toBe(201);
  });

  test("quantity = -1 → 422 (muss positiv sein)", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      quantity: -1,
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });

  test("quantity = 0 → 422 (muss positiv sein)", async () => {
    const { status, json } = await createLot(buyerToken, IP_ZOD, validLotBody({
      quantity: 0,
    }));
    expect(status).toBe(422);
    expect(json["error"] ?? json["details"]).toBeTruthy();
  });
});

// ─── Suite 2: Unicode & Emoji ─────────────────────────────────────────────────

test.describe("Payload-Stress: Unicode & Emoji in Textfeldern", () => {
  let buyerToken: string;

  test.beforeAll(async () => {
    buyerToken = await login("buyer@eucx-test.de", "Test1234!", IP_UNICODE);
  });

  test("Chinesische Schriftzeichen in deliveryLocation (< 200 Zeichen) → 201", async () => {
    const { status } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      deliveryLocation: "上海自由貿易試驗區 — 中国上海市浦東新区",
    }));
    expect(status).toBe(201);
  });

  test("Arabische Schriftzeichen in deliveryLocation → 201", async () => {
    const { status } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      deliveryLocation: "منطقة دبي الصناعية — دبي، الإمارات",
    }));
    expect(status).toBe(201);
  });

  test("Emojis in description (< 2000 Zeichen) → 201, kein Server-Absturz", async () => {
    const { status, json } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      description: "Lot 🚢 für Exportlieferung 🇩🇪→🇧🇷 · Qualität: ✅ · Preis: 💰",
    }));
    expect(status).toBe(201);
    expect(json["lotId"]).toBeTruthy();
  });

  test("Null-Byte in deliveryLocation → kein 500 (Server darf nicht abstürzen)", async () => {
    const { status } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      deliveryLocation: "Frankfurt Böse",
    }));
    expect(status).not.toBe(500);
    expect(status).not.toBe(502);
  });

  test("RTL-Unicode in qualityGrade → kein 500", async () => {
    const { status } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      qualityGrade: "‮umgekehrt", // RIGHT-TO-LEFT OVERRIDE
    }));
    expect(status).not.toBe(500);
    expect(status).not.toBe(502);
  });

  test("100 Emojis (🏭) in deliveryLocation = 200 UTF-16-Einheiten → 201", async () => {
    // 🏭 = U+1F3ED = 4 Bytes UTF-8 = 2 UTF-16-Einheiten (Surrogate Pair)
    // Zod max(200) zählt JS-String-Länge = UTF-16-Einheiten: 100 × 🏭 = 200 → OK
    const hundert = "🏭".repeat(100);
    const { status } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      deliveryLocation: hundert,
    }));
    expect(status).toBe(201);
  });

  test("101 Emojis (🏭) in deliveryLocation = 202 UTF-16-Einheiten → 422", async () => {
    const hundertEins = "🏭".repeat(101); // 101 × 2 = 202 > 200
    const { status } = await createLot(buyerToken, IP_UNICODE, validLotBody({
      deliveryLocation: hundertEins,
    }));
    expect(status).toBe(422);
  });
});

// ─── Suite 3: PDF-Robustheit mit Unicode-Feldern ──────────────────────────────

test.describe("Payload-Stress: PDF-Generierung mit Unicode-Inhalt", () => {
  let buyerToken:  string;
  let sellerToken: string;

  test.beforeAll(async () => {
    buyerToken  = await login("buyer@eucx-test.de",   "Test1234!", IP_PDF);
    sellerToken = await login("seller1@eucx-test.de", "Test1234!", IP_PDF);
  });

  test("Vollständiger Auktionszyklus mit Emoji-Feldern → PDF abrufbar (kein 500)", async () => {
    // Lot mit Unicode/Emojis erstellen
    const { status: cs, json: cj } = await createLot(buyerToken, IP_PDF, validLotBody({
      deliveryLocation: "Werk Köln 🏭 — Bayerwerk-Allee",
      qualityGrade:     "B500B ✅ nach DIN 488",
      description:      "Bewehrungsstahl 📦 für Bauprojekt 🏗️ Hamburg",
      deliveryPeriod:   "4 Wochen 📅",
      paymentTerms:     "30 Tage netto 💳",
    }));
    expect(cs).toBe(201);
    const lotId = cj["lotId"] as string;

    // Lot durch Auction-Flow führen
    await fetch(`${BASE}/api/auction/lots/${lotId}/publish`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${buyerToken}`, "X-Forwarded-For": IP_PDF },
    });
    await fetch(`${BASE}/api/auction/lots/${lotId}/register`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${sellerToken}`, "X-Forwarded-For": IP_PDF },
    });
    await fetch(`${BASE}/api/auction/lots/${lotId}/open`, {
      method:  "POST",
      headers: {
        "Content-Type":    "application/json",
        "Authorization":   `Bearer ${buyerToken}`,
        "X-Forwarded-For": IP_PDF,
      },
      body: JSON.stringify({ auctionEnd: new Date(Date.now() + 30 * 60_000).toISOString() }),
    });

    // Bid (Seller)
    const bidRes = await fetch(`${BASE}/api/auction/lots/${lotId}/bids`, {
      method:  "POST",
      headers: {
        "Content-Type":    "application/json",
        "Authorization":   `Bearer ${sellerToken}`,
        "X-Forwarded-For": IP_PDF,
      },
      body: JSON.stringify({ price: 380 }),
    });
    expect(bidRes.status).toBe(201);
    const bidBody = await bidRes.json() as { bidId?: string };
    const bidId   = bidBody.bidId!;

    // Contract akzeptieren (Buyer)
    const acceptRes = await fetch(`${BASE}/api/auction/lots/${lotId}/contract`, {
      method:  "POST",
      headers: {
        "Content-Type":    "application/json",
        "Authorization":   `Bearer ${buyerToken}`,
        "X-Forwarded-For": IP_PDF,
      },
      body: JSON.stringify({ bidId }),
    });

    // Server darf unter keinen Umständen abstürzen (kein 500/502)
    expect(acceptRes.status).not.toBe(500);
    expect(acceptRes.status).not.toBe(502);

    // PDF testen (falls Contract angelegt wurde)
    if ([200, 201].includes(acceptRes.status)) {
      const acceptBody = await acceptRes.json() as { contractId?: string; contract?: { id?: string } };
      const contractId  = acceptBody.contractId ?? acceptBody.contract?.id;

      if (contractId) {
        const pdfRes = await fetch(
          `${BASE}/api/auction/contracts/${contractId}/pdf`,
          {
            headers: {
              "Authorization":   `Bearer ${buyerToken}`,
              "X-Forwarded-For": IP_PDF,
            },
          }
        );

        // Kein unkontrollierter Fehler
        expect(pdfRes.status).not.toBe(500);

        if (pdfRes.status === 200) {
          const ct = pdfRes.headers.get("content-type") ?? "";
          expect(ct).toContain("application/pdf");

          const buf    = await pdfRes.arrayBuffer();
          const header = new Uint8Array(buf.slice(0, 4));
          // Magic-Bytes: %PDF
          expect(header[0]).toBe(0x25); // %
          expect(header[1]).toBe(0x50); // P
          expect(header[2]).toBe(0x44); // D
          expect(header[3]).toBe(0x46); // F
        }
      }
    }
  });
});
