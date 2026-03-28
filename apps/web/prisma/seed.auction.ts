/**
 * Auction Seed — Test-Daten für Reverse Auction Dashboard
 *
 * Erstellt:
 *   - 1 Organisation (EUCX Test GmbH)
 *   - 1 Käufer (buyer@eucx-test.de / Test1234!)
 *   - 3 Verkäufer (seller1-3@eucx-test.de / Test1234!)
 *   - 3 Lots (verschiedene Phasen)
 *   - LotRegistrations für alle Verkäufer auf Lot 1 & 2
 *   - Bid-History auf Lot 2 (Phase REDUCTION)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Auction Seed startet...");

  // ── Organisation ──────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { id: "seed-org-eucx-test" },
    update: {},
    create: {
      id:      "seed-org-eucx-test",
      name:    "EUCX Test GmbH",
      taxId:   "DE123456789",
      country: "DE",
      city:    "Frankfurt am Main",
    },
  });
  console.log("  ✓ Organisation:", org.name);

  const pw = await bcrypt.hash("Test1234!", 10);

  // ── Test-User anlegen ─────────────────────────────────────────────
  const buyer = await prisma.user.upsert({
    where:  { email: "buyer@eucx-test.de" },
    update: {},
    create: {
      id:                 "seed-user-buyer",
      organizationId:     org.id,
      email:              "buyer@eucx-test.de",
      passwordHash:       pw,
      role:               "BUYER",
      status:             "ACTIVE",
      verificationStatus: "VERIFIED",
    },
  });

  const sellers = await Promise.all(
    [1, 2, 3].map((i) =>
      prisma.user.upsert({
        where:  { email: `seller${i}@eucx-test.de` },
        update: {},
        create: {
          id:                 `seed-user-seller-${i}`,
          organizationId:     org.id,
          email:              `seller${i}@eucx-test.de`,
          passwordHash:       pw,
          role:               "SELLER",
          status:             "ACTIVE",
          verificationStatus: "VERIFIED",
        },
      })
    )
  );
  console.log("  ✓ Käufer:", buyer.email);
  console.log("  ✓ Verkäufer:", sellers.map((s) => s.email).join(", "));

  // ── LOT 1: COLLECTION — offen für Registrierung ───────────────────
  const lot1 = await prisma.lot.upsert({
    where:  { id: "seed-lot-1" },
    update: {},
    create: {
      id:          "seed-lot-1",
      buyerId:     buyer.id,
      commodity:   "Kupferkathode Grad A (LME-zertifiziert)",
      quantity:    100,
      unit:        "TON",
      phase:       "COLLECTION",
      startPrice:  8200,
      description: "100 Tonnen Kupferkathode, LME-Grade A, Lieferung Frankfurt HBF, Incoterms DAP, Q2 2026.",
    },
  });

  // LOT 1: Alle 3 Verkäufer registriert
  for (const seller of sellers) {
    await prisma.lotRegistration.upsert({
      where:  { lotId_sellerId: { lotId: lot1.id, sellerId: seller.id } },
      update: {},
      create: { lotId: lot1.id, sellerId: seller.id },
    });
  }
  console.log("  ✓ Lot 1 (COLLECTION):", lot1.commodity);

  // ── LOT 2: REDUCTION — Auktion läuft, Gebote vorhanden ───────────
  const auctionStart = new Date(Date.now() - 60 * 60 * 1000);       // vor 1h gestartet
  const auctionEnd   = new Date(Date.now() + 60 * 60 * 1000);       // noch 1h übrig

  const lot2 = await prisma.lot.upsert({
    where:  { id: "seed-lot-2" },
    update: {
      phase:       "REDUCTION",
      currentBest: 7650,
      auctionStart,
      auctionEnd,
    },
    create: {
      id:           "seed-lot-2",
      buyerId:      buyer.id,
      commodity:    "Betonstahl BST 500S (Rebar 10mm)",
      quantity:     500,
      unit:         "TON",
      phase:        "REDUCTION",
      startPrice:   8000,
      currentBest:  7650,
      auctionStart,
      auctionEnd,
      description:  "500t Betonstahl BST 500S, Durchmesser 10mm, EN 10080, Abholung Duisburg.",
    },
  });

  // LOT 2: Alle 3 Verkäufer registriert
  for (const seller of sellers) {
    await prisma.lotRegistration.upsert({
      where:  { lotId_sellerId: { lotId: lot2.id, sellerId: seller.id } },
      update: {},
      create: { lotId: lot2.id, sellerId: seller.id },
    });
  }

  // Bid-History für LOT 2 (simuliert reale Gebotsfolge)
  const existingBids = await prisma.bid.count({ where: { lotId: lot2.id } });
  if (existingBids === 0) {
    const bidHistory = [
      { sellerId: sellers[0]!.id, price: "7950", minsAgo: 55 },
      { sellerId: sellers[1]!.id, price: "7900", minsAgo: 50 },
      { sellerId: sellers[2]!.id, price: "7820", minsAgo: 42 },
      { sellerId: sellers[0]!.id, price: "7800", minsAgo: 35 },
      { sellerId: sellers[1]!.id, price: "7750", minsAgo: 28 },
      { sellerId: sellers[2]!.id, price: "7720", minsAgo: 20 },
      { sellerId: sellers[0]!.id, price: "7690", minsAgo: 12 },
      { sellerId: sellers[1]!.id, price: "7650", minsAgo:  5 },  // aktuell beste
    ];

    for (const b of bidHistory) {
      await prisma.bid.create({
        data: {
          lotId:     lot2.id,
          sellerId:  b.sellerId,
          price:     b.price,
          createdAt: new Date(Date.now() - b.minsAgo * 60 * 1000),
        },
      });
    }
  }
  console.log("  ✓ Lot 2 (REDUCTION):", lot2.commodity, "— currentBest: 7650 €/t");

  // ── LOT 3: CONCLUSION — abgeschlossene Auktion ────────────────────
  const lot3 = await prisma.lot.upsert({
    where:  { id: "seed-lot-3" },
    update: {},
    create: {
      id:           "seed-lot-3",
      buyerId:      buyer.id,
      commodity:    "Aluminiumlegierung EN AW-6082 T6",
      quantity:     50,
      unit:         "TON",
      phase:        "CONCLUSION",
      startPrice:   3200,
      currentBest:  2980,
      winnerId:     sellers[2]!.id,
      auctionStart: new Date(Date.now() - 4 * 60 * 60 * 1000),
      auctionEnd:   new Date(Date.now() - 2 * 60 * 60 * 1000),
      lockedAt:     new Date(Date.now() - 2 * 60 * 60 * 1000),
      description:  "50t Aluminiumlegierung, EN AW-6082 T6, Halbzeug Stangen Ø30mm.",
    },
  });
  console.log("  ✓ Lot 3 (CONCLUSION):", lot3.commodity, "— Gewinner: seller3");

  console.log("\n✅ Seed abgeschlossen.");
  console.log("\nTest-Credentials:");
  console.log("  Käufer:    buyer@eucx-test.de   / Test1234!");
  console.log("  Verkäufer: seller1@eucx-test.de / Test1234!");
  console.log("  Verkäufer: seller2@eucx-test.de / Test1234!");
  console.log("  Verkäufer: seller3@eucx-test.de / Test1234!");
  console.log("\nLots:");
  console.log("  Lot 1 (seed-lot-1): COLLECTION — Kupferkathode 100t");
  console.log("  Lot 2 (seed-lot-2): REDUCTION  — Betonstahl 500t (Auktion läuft!)");
  console.log("  Lot 3 (seed-lot-3): CONCLUSION — Aluminium 50t");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
