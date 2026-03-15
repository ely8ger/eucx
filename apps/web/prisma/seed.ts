import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "METALS",       label: "Metalle & Legierungen",      icon: "⚙",  sortOrder: 1, requiredAttributes: ["grade", "standard"] },
  { slug: "SCRAP",        label: "Schrott & Sekundärrohstoffe", icon: "♻", sortOrder: 2, requiredAttributes: [] },
  { slug: "TIMBER",       label: "Holz & Forstprodukte",       icon: "🌲", sortOrder: 3, requiredAttributes: ["woodSpecies", "moisturePct"] },
  { slug: "AGRICULTURE",  label: "Agrar & Lebensmittel",       icon: "🌾", sortOrder: 4, requiredAttributes: ["harvestYear", "moistureContent"] },
  { slug: "CHEMICALS",    label: "Chemie & Petrochemie",       icon: "⚗",  sortOrder: 5, requiredAttributes: ["casNumber", "purity"] },
  { slug: "ENERGY",       label: "Energie & Brennstoffe",      icon: "⚡", sortOrder: 6, requiredAttributes: ["calorificValueMj", "energyType"] },
  { slug: "CONSTRUCTION", label: "Baustoffe",                  icon: "🏗",  sortOrder: 7, requiredAttributes: [] },
  { slug: "INDUSTRIALS",  label: "Industriegüter & Maschinen", icon: "🔧", sortOrder: 8, requiredAttributes: [] },
];

async function main() {
  console.log("Seeding Kategorien...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: { ...cat, requiredAttributes: cat.requiredAttributes },
    });
  }
  console.log(`${CATEGORIES.length} Kategorien erstellt.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
