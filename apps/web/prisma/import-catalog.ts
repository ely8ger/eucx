/**
 * Import: 23met_komplett.jsonl → Neon-DB (catalog_products + product_sizes)
 * Aufruf: DATABASE_URL=... DIRECT_URL=... npx tsx prisma/import-catalog.ts
 * Pfad überschreibbar: JSONL_PATH=/pfad/datei.jsonl
 */
import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { resolve } from "path";

const db = new PrismaClient();
const JSONL_PATH = resolve(process.env.JSONL_PATH ?? "/Users/ki/Desktop/23met_komplett.jsonl");

interface Product {
  nr:     number;
  slug:   string;
  nameDe: string;
  nameEn: string;
  nameRu: string;
  norm:   string;
  sizes:  string[];
}

async function parseJsonl(): Promise<Product[]> {
  const products: Product[] = [];
  const rl = createInterface({ input: createReadStream(JSONL_PATH), crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.trim()) products.push(JSON.parse(line));
  }
  return products;
}

async function main() {
  console.log(`Lese: ${JSONL_PATH}`);
  const products = await parseJsonl();
  const totalSizes = products.reduce((s, p) => s + p.sizes.length, 0);
  console.log(`Gefunden: ${products.length} Produkte, ${totalSizes} Größen`);

  await db.productSize.deleteMany();
  await db.catalogProduct.deleteMany();
  console.log("Alte Daten gelöscht.");

  let imported = 0;
  for (const p of products) {
    await db.catalogProduct.create({
      data: {
        nr:     p.nr,
        slug:   p.slug,
        nameDe: p.nameDe || null,
        nameEn: p.nameEn,
        nameRu: p.nameRu,
        norm:   p.norm || null,
        sizes: {
          create: p.sizes.map((value) => ({ value })),
        },
      },
    });
    imported++;
    if (imported % 20 === 0) process.stdout.write(`  ${imported}/${products.length}\r`);
  }

  console.log(`\nFertig: ${imported} Produkte importiert.`);
  const sizeCount = await db.productSize.count();
  console.log(`Größen in DB: ${sizeCount}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
