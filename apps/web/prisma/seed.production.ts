/**
 * Production Seed — Initiale Marktdaten
 *
 * Erstellt:
 *   1. EUCX-Operator-Organisation (für interne Handelskonten)
 *   2. Super-Admin-User
 *   3. Produkte: Kupfer (CU), Aluminium (AL), Zink (ZN), Nickel (NI)
 *   4. Erste TradingSession pro Produkt (OPEN)
 *   5. Initialer 30-Tage-MarketCandle-Verlauf (realistisch März 2026)
 *
 * Ausführung:
 *   DATABASE_URL=... npx tsx prisma/seed.production.ts
 *
 * Idempotent: kann mehrfach ausgeführt werden (upsert überall).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt           from "bcryptjs";

const db = new PrismaClient();

// ── Marktdaten (LME-Spotpreise März 2026, EUR/t) ───────────────────────────
// Quelle: Realistische Richtwerte — VOR Go-Live aktualisieren!

interface MetalSeed {
  sku:          string;
  name:         string;
  description:  string;
  basePrice:    number;   // EUR/t
  volatility:   number;   // Tägliche % Schwankung (für synthetische History)
  minLot:       number;   // Minimum Losgröße in Tonnen
}

const METALS: MetalSeed[] = [
  {
    sku:         "CU-LME-A",
    name:        "Kupfer (Grade A, LME)",
    description: "Elektrolytkupfer, Grade A nach LME-Standard. Min. 99,99% Cu. " +
                 "Einsatz in Elektrotechnik, Bauindustrie, Erneuerbare Energien.",
    basePrice:   8_820,
    volatility:  0.012,
    minLot:      5,
  },
  {
    sku:         "AL-LME-P1020",
    name:        "Aluminium (P1020A, LME)",
    description: "Primär-Aluminium P1020A nach LME-Standard. Min. 99,7% Al. " +
                 "Standard-Legierung für Fahrzeugbau, Verpackung, Bauwesen.",
    basePrice:   2_340,
    volatility:  0.009,
    minLot:      20,
  },
  {
    sku:         "ZN-LME-SHG",
    name:        "Zink (SHG, LME)",
    description: "Super High Grade Zink nach LME-Standard. Min. 99,995% Zn. " +
                 "Primär für Feuerverzinkung von Stahl und Messinglegierungen.",
    basePrice:   2_790,
    volatility:  0.015,
    minLot:      25,
  },
  {
    sku:         "NI-LME-FP",
    name:        "Nickel (Full Plate, LME)",
    description: "Primär-Nickel Full Plate nach LME-Standard. Min. 99,80% Ni. " +
                 "Einsatz in Edelstahlproduktion, Batterien (EV), Superlegierungen.",
    basePrice:   14_650,
    volatility:  0.018,
    minLot:      6,
  },
];

// ── Synthetische Preis-History (30 Tage) ──────────────────────────────────
// Erzeugt realistische OHLC-Daten mit Random-Walk + Mean-Reversion

function generateCandles(
  basePrice:  number,
  volatility: number,
  days:       number,
): Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }> {
  const candles = [];
  let price = basePrice * (0.96 + Math.random() * 0.08); // Startet ±4% vom Basis

  for (let d = days; d >= 0; d--) {
    const date   = new Date(Date.now() - d * 86_400_000);
    date.setUTCHours(0, 0, 0, 0);

    const dailyReturn = (Math.random() - 0.48) * volatility * 2;  // leicht bullisch
    const reversion   = (basePrice - price) / basePrice * 0.1;    // Mean-Reversion
    const change      = dailyReturn + reversion;

    const open  = price;
    const close = price * (1 + change);
    const high  = Math.max(open, close) * (1 + Math.abs(Math.random() * volatility * 0.5));
    const low   = Math.min(open, close) * (1 - Math.abs(Math.random() * volatility * 0.5));

    // Volumen: 500–5000 Tonnen täglich (Normaldistribution-ähnlich)
    const volume = 500 + Math.floor(Math.random() * 4500);

    candles.push({
      date,
      open:   Math.round(open * 100) / 100,
      high:   Math.round(high * 100) / 100,
      low:    Math.round(low  * 100) / 100,
      close:  Math.round(close * 100) / 100,
      volume,
    });

    price = close;
  }
  return candles;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== EUCX Production Seed ===\n");

  // 1. Kategorien sicherstellen (aus base seed)
  const metalsCat = await db.category.upsert({
    where:  { slug: "METALS" },
    update: {},
    create: {
      slug:               "METALS",
      label:              "Metalle & Legierungen",
      icon:               "⚙",
      sortOrder:          1,
      requiredAttributes: ["grade", "standard"],
    },
  });
  console.log(`Kategorie: ${metalsCat.label}`);

  // 2. EUCX-Operator-Organisation
  const operatorOrg = await db.organization.upsert({
    where:  { taxId: "DE-EUCX-EXCHANGE-0001" },
    update: {},
    create: {
      name:       "EUCX GmbH (Operator)",
      taxId:      "DE-EUCX-EXCHANGE-0001",
      country:    "DE",
      city:       "Frankfurt am Main",
      isVerified: true,
    },
  });
  console.log(`Organisation: ${operatorOrg.name}`);

  // 3. Super-Admin (Passwort VOR Go-Live ändern!)
  const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? "admin@eucx.eu";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "CHANGE_ME_before_golive_2026!";
  const passwordHash  = await bcrypt.hash(adminPassword, 12);

  const adminUser = await db.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      organizationId:    operatorOrg.id,
      email:             adminEmail,
      passwordHash,
      role:              "SUPER_ADMIN",
      status:            "ACTIVE",
      verificationStatus: "VERIFIED",
    },
  });
  console.log(`Admin: ${adminUser.email} (Passwort: ${adminPassword === "CHANGE_ME_before_golive_2026!" ? "⚠ STANDARD — JETZT ÄNDERN!" : "gesetzt"})`);

  // 4. Operator-Wallet
  await db.wallet.upsert({
    where:  { organizationId: operatorOrg.id },
    update: {},
    create: {
      organizationId: operatorOrg.id,
      currency:       "EUR",
      balance:        0,
      reservedBalance: 0,
    },
  });

  // 5. Produkte + Candles
  console.log("\nErstelle Metallprodukte und Marktdaten...");

  for (const metal of METALS) {
    // Produkt
    const product = await db.product.upsert({
      where:  { sku: metal.sku },
      update: { description: metal.description },
      create: {
        organizationId:    operatorOrg.id,
        categoryId:        metalsCat.id,
        sku:               metal.sku,
        name:              metal.name,
        description:       metal.description,
        unit:              "TON",
        quantity:          0,
        minLotQuantity:    metal.minLot,
        originCountry:     "EU",
        warehouseLocation: "Rotterdam, NL",
        hasCertificate:    true,
        isActive:          true,
        attributes: {
          grade:    metal.sku.split("-")[1],
          standard: "LME",
          exchange: "London Metal Exchange",
        },
      },
    });
    console.log(`  Produkt: ${product.name} (${product.sku})`);

    // TradingSession (OPEN)
    const sessionStart = new Date();
    sessionStart.setUTCHours(8, 0, 0, 0);  // 08:00 UTC

    await db.tradingSession.upsert({
      where: {
        // Kein unique constraint auf productId allein — suche nach aktueller offener Session
        id: (await db.tradingSession.findFirst({
          where: { productId: product.id, currentStatus: "TRADING_1" },
          select: { id: true },
        }))?.id ?? "new",
      },
      update: {},
      create: {
        productId:      product.id,
        currentStatus:  "TRADING_1",
        scheduledStart: sessionStart,
      },
    });

    // 30-Tage Candle-History (ONE_DAY)
    const candles = generateCandles(metal.basePrice, metal.volatility, 30);
    let candleCount = 0;

    for (const c of candles) {
      await db.marketCandle.upsert({
        where: {
          productId_interval_periodStart: {
            productId:   product.id,
            interval:    "ONE_DAY",
            periodStart: c.date,
          },
        },
        update: {},
        create: {
          productId:   product.id,
          interval:    "ONE_DAY",
          periodStart: c.date,
          open:        c.open,
          high:        c.high,
          low:         c.low,
          close:       c.close,
          volume:      c.volume,
          turnover:    c.close * c.volume,
          tradeCount:  Math.floor(c.volume / metal.minLot),
        },
      });
      candleCount++;
    }
    console.log(`    → ${candleCount} Tages-Kerzen erstellt (letzter Kurs: ${candles.at(-1)?.close.toFixed(2)} €/t)`);
  }

  console.log("\n✓ Production Seed abgeschlossen.");
  console.log("\n⚠ Nächste Schritte vor Go-Live:");
  console.log("  1. Admin-Passwort ändern: UPDATE users SET password_hash=... WHERE email='" + adminEmail + "'");
  console.log("  2. Reale LME-Kurse überprüfen und ggf. Candles bereinigen");
  console.log("  3. Operator-Wallet mit initialem EUR-Bestand füllen");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
