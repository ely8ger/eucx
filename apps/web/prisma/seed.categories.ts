/**
 * Seeding der Category-Tabelle für alle EUCX-Sektoren.
 * Ausführung: npx ts-node --project tsconfig.json prisma/seed.categories.ts
 * Oder via: npx tsx prisma/seed.categories.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES = [
  {
    slug: "METALS",
    label: "Metalle & Stahl",
    description: "Bewehrungsstahl, Bleche, Träger, Profile, Rohre nach EN-Normen.",
    icon: "🔩",
    sortOrder: 1,
    requiredAttributes: ["grade", "standard", "normCode"],
  },
  {
    slug: "SCRAP",
    label: "Schrott & Recycling",
    description: "Stahlschrott HMS 1/2, Schredder-Schrott nach ISRI-Spezifikation.",
    icon: "♻️",
    sortOrder: 2,
    requiredAttributes: ["scrapGrade", "isriCode"],
  },
  {
    slug: "NON_FERROUS",
    label: "NE-Metalle",
    description: "Kupferkathoden (LME), Aluminiumbarren (LME), Zink, Blei, Zinn.",
    icon: "🔋",
    sortOrder: 3,
    requiredAttributes: ["grade", "purity", "lmeRegistered"],
  },
  {
    slug: "FERTILIZER",
    label: "Düngemittel",
    description: "Stickstoff- (Harnstoff, AN), Phosphor- (DAP, MAP), Kalium- (MOP, NOP) und NPK-Komplexdünger.",
    icon: "🌱",
    sortOrder: 4,
    requiredAttributes: ["nutrientContent", "euRegulation"],
  },
  {
    slug: "ENERGY",
    label: "Energie",
    description: "Erdgas (TTF/NCG), Strom (EPEX), Steinkohle (API 2), Rohöl (Brent), LPG, LNG.",
    icon: "⚡",
    sortOrder: 5,
    requiredAttributes: ["energyUnit", "deliveryPoint"],
  },
  {
    slug: "AGRICULTURE",
    label: "Agrar & Lebensmittel",
    description: "Getreide (Weizen, Gerste, Mais), Ölsaaten (Raps, Soja, Sonnenblume), Zucker.",
    icon: "🌾",
    sortOrder: 6,
    requiredAttributes: ["harvestYear", "moistureContent", "proteinContent"],
  },
  {
    slug: "CHEMICALS",
    label: "Chemikalien",
    description: "Methanol, Ethanol, Schwefelsäure, Salzsäure, Natronlauge, Ammoniak und weitere Industriechemikalien.",
    icon: "🧪",
    sortOrder: 7,
    requiredAttributes: ["purity", "reachRegistration", "adrClass"],
  },
];

async function main() {
  console.log("Seeding categories...");
  let created = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    const result = await db.category.upsert({
      where:  { slug: cat.slug },
      update: {
        label:              cat.label,
        description:        cat.description,
        icon:               cat.icon,
        sortOrder:          cat.sortOrder,
        requiredAttributes: cat.requiredAttributes,
      },
      create: {
        slug:               cat.slug,
        label:              cat.label,
        description:        cat.description,
        icon:               cat.icon,
        sortOrder:          cat.sortOrder,
        isActive:           true,
        requiredAttributes: cat.requiredAttributes,
      },
    });
    if (result) {
      console.log(`  ✓ ${cat.slug} — ${cat.label}`);
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`\nFertig: ${created} Kategorien upserted, ${skipped} übersprungen.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
