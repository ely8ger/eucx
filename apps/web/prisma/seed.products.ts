/**
 * Seeds CatalogProduct-Tabelle mit allen 43 EUCX TRADEABLE_PRODUCTS.
 * Ausführung: npx tsx prisma/seed.products.ts
 * Idempotent: upsert by slug → sicher mehrfach ausführbar.
 */
import { PrismaClient } from "@prisma/client";
import { TRADEABLE_PRODUCTS } from "../src/lib/katalog/data";

const db = new PrismaClient();

const SECTOR_MAP: Record<string, string> = {
  betonstahl:       "STEEL",
  walzdraht:        "STEEL",
  "blech-warmgewalzt": "STEEL",
  "blech-kaltgewalzt": "STEEL",
  "blech-verzinkt":    "STEEL",
  traeger:          "STEEL",
  hohlprofile:      "STEEL",
  nahtlosrohr:      "STEEL",
  schrott:          "SCRAP",
  kupfer:           "NON_FERROUS",
  aluminium:        "NON_FERROUS",
  harnstoff:        "FERTILIZER",
  dap:              "FERTILIZER",
  mop:              "FERTILIZER",
  npk:              "FERTILIZER",
  erdgas:           "ENERGY",
  strom:            "ENERGY",
  kohle:            "ENERGY",
  rohol:            "ENERGY",
  lpg:              "ENERGY",
  weizen:           "AGRAR",
  gerste:           "AGRAR",
  mais:             "AGRAR",
  soja:             "AGRAR",
  raps:             "AGRAR",
  sonnenblume:      "AGRAR",
  methanol:         "CHEMICALS",
  ethanol:          "CHEMICALS",
  saeuren:          "CHEMICALS",
  laugen:           "CHEMICALS",
  ammoniak:         "CHEMICALS",
};

async function main() {
  console.log("Seeding CatalogProducts …");

  const existing = await db.catalogProduct.findMany({ select: { nr: true }, orderBy: { nr: "desc" }, take: 1 });
  let nextNr = (existing[0]?.nr ?? 0) + 1;

  // Pre-assign nrs: upsert überschreibt nicht nr, deshalb erst prüfen
  const slugToNr = new Map<string, number>();
  for (const p of await db.catalogProduct.findMany({ select: { slug: true, nr: true } })) {
    slugToNr.set(p.slug, p.nr);
  }

  let created = 0;
  let updated = 0;

  for (const p of TRADEABLE_PRODUCTS) {
    const sector = SECTOR_MAP[p.katId] ?? "STEEL";
    const nameDe = p.name;
    const nameEn = p.name;
    const norm   = p.norm;
    const slug   = p.id;

    const nr = slugToNr.get(slug) ?? nextNr++;

    const result = await db.catalogProduct.upsert({
      where:  { slug },
      update: { nameDe, nameEn, norm, sector, isActive: true },
      create: { nr, slug, nameDe, nameEn, nameRu: "", norm, sector, isActive: true },
    });

    if (slugToNr.has(slug)) {
      updated++;
    } else {
      created++;
    }

    console.log(`  ${slugToNr.has(slug) ? "↺" : "✓"} [${sector}] ${slug}`);
  }

  const total = await db.catalogProduct.count({ where: { isActive: true } });
  console.log(`\nFertig: ${created} erstellt, ${updated} aktualisiert → ${total} aktive Produkte in DB`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
