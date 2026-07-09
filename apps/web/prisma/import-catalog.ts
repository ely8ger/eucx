/**
 * Einmaliger Import: 23met_produkte.csv → Neon-DB (catalog_products + product_sizes)
 * Aufruf: DATABASE_URL=... DIRECT_URL=... npx tsx prisma/import-catalog.ts
 */
import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { resolve } from "path";

const db = new PrismaClient();
const CSV_PATH = resolve(process.env.CSV_PATH ?? "/Users/ki/Desktop/23met_produkte.csv");

interface Product {
  nr:     number;
  slug:   string;
  nameEn: string;
  nameRu: string;
  norm:   string;
  sizes:  string[];
}

async function parseCsv(): Promise<Product[]> {
  const products: Product[] = [];
  let current: Product | null = null;

  const rl = createInterface({ input: createReadStream(CSV_PATH), crlfDelay: Infinity });
  let firstLine = true;

  for await (const raw of rl) {
    if (firstLine) { firstLine = false; continue; }

    // Simple CSV split — values don't contain commas
    const cols = raw.split(",");
    const typ  = cols[6]?.trim();

    if (typ === "Produkt") {
      if (current) products.push(current);
      current = {
        nr:     parseInt(cols[0]?.trim() || "0", 10),
        nameEn: cols[2]?.trim() ?? "",
        nameRu: cols[3]?.trim() ?? "",
        norm:   cols[4]?.trim() ?? "",
        slug:   cols[5]?.trim() ?? "",
        sizes:  [],
      };
    } else if (typ === "Größe" && current) {
      const val = cols[7]?.trim();
      if (val) current.sizes.push(val);
    }
  }
  if (current) products.push(current);
  return products;
}

async function main() {
  console.log(`Lese: ${CSV_PATH}`);
  const products = await parseCsv();
  console.log(`Gefunden: ${products.length} Produkte, ${products.reduce((s, p) => s + p.sizes.length, 0)} Größen`);

  // Bestehende Daten löschen (idempotenter Re-Import)
  await db.productSize.deleteMany();
  await db.catalogProduct.deleteMany();
  console.log("Alte Daten gelöscht.");

  let imported = 0;
  for (const p of products) {
    await db.catalogProduct.create({
      data: {
        nr:     p.nr,
        slug:   p.slug,
        nameEn: p.nameEn,
        nameRu: p.nameRu,
        norm:   p.norm || null,
        sizes: {
          create: p.sizes.map((value) => ({ value })),
        },
      },
    });
    imported++;
    if (imported % 10 === 0) process.stdout.write(`  ${imported}/${products.length}\r`);
  }

  console.log(`\nFertig: ${imported} Produkte importiert.`);
  const sizeCount = await db.productSize.count();
  console.log(`Größen in DB: ${sizeCount}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
