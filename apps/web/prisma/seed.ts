import { PrismaClient } from "@prisma/client";
import bcrypt           from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "METALS",       label: "Metalle & Legierungen",       icon: "⚙",  sortOrder: 1, requiredAttributes: ["grade", "standard"] },
  { slug: "SCRAP",        label: "Schrott & Sekundärrohstoffe", icon: "♻",  sortOrder: 2, requiredAttributes: [] },
  { slug: "TIMBER",       label: "Holz & Forstprodukte",        icon: "🌲", sortOrder: 3, requiredAttributes: ["woodSpecies", "moisturePct"] },
  { slug: "AGRICULTURE",  label: "Agrar & Lebensmittel",        icon: "🌾", sortOrder: 4, requiredAttributes: ["harvestYear", "moistureContent"] },
  { slug: "CHEMICALS",    label: "Chemie & Petrochemie",        icon: "⚗",  sortOrder: 5, requiredAttributes: ["casNumber", "purity"] },
  { slug: "ENERGY",       label: "Energie & Brennstoffe",       icon: "⚡", sortOrder: 6, requiredAttributes: ["calorificValueMj", "energyType"] },
  { slug: "CONSTRUCTION", label: "Baustoffe",                   icon: "🏗",  sortOrder: 7, requiredAttributes: [] },
  { slug: "INDUSTRIALS",  label: "Industriegüter & Maschinen",  icon: "🔧", sortOrder: 8, requiredAttributes: [] },
];

async function main() {
  // ── 1. Kategorien ─────────────────────────────────────────────────────────
  console.log("Seeding Kategorien...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: { ...cat, requiredAttributes: cat.requiredAttributes },
    });
  }
  console.log(`  ${CATEGORIES.length} Kategorien erstellt.`);

  // ── 2. EUCX-Operator-Organisation (Admin gehört hierzu) ───────────────────
  console.log("Seeding Admin-Organisation...");
  const operatorOrg = await prisma.organization.upsert({
    where:  { taxId: "DE-EUCX-DEV-0001" },
    update: {},
    create: {
      name:       "EUCX GmbH (Operator)",
      taxId:      "DE-EUCX-DEV-0001",
      country:    "DE",
      city:       "Frankfurt am Main",
      isVerified: true,
    },
  });

  // Wallet für die Operator-Organisation
  await prisma.wallet.upsert({
    where:  { organizationId: operatorOrg.id },
    update: {},
    create: {
      organizationId:  operatorOrg.id,
      currency:        "EUR",
      balance:         0,
      reservedBalance: 0,
    },
  });

  // ── 3. Super-Admin (nur für Entwicklung — in Prod seed.production.ts nutzen) ──
  console.log("Seeding Super-Admin...");
  const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? "admin@eucx.eu";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
  const passwordHash  = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      organizationId:     operatorOrg.id,
      email:              adminEmail,
      passwordHash,
      role:               "SUPER_ADMIN",
      status:             "ACTIVE",
      emailVerified:      true,
      verificationStatus: "VERIFIED",
    },
  });

  console.log(`  Admin: ${adminEmail}`);
  console.log(`  Passwort: ${adminPassword}`);
  console.log("  ⚠  Dev-Zugangsdaten — niemals in Produktion verwenden!\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
