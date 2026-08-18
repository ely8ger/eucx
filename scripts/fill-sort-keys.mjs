import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

function extractSortKey(raw) {
  const s = raw.replace(/(\d),(\d)/g, "$1.$2");
  const match = s.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

async function main() {
  const all = await p.productSize.findMany({ select: { id: true, value: true } });
  console.log(`Verarbeite ${all.length} Größen...`);

  let updated = 0;
  let nullCount = 0;
  const BATCH = 500;

  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(({ id, value }) => {
        const sortKey = extractSortKey(value);
        if (sortKey === null) nullCount++;
        return p.productSize.update({ where: { id }, data: { sortKey } });
      })
    );
    updated += chunk.length;
    process.stdout.write(`\r  ${updated}/${all.length}`);
  }

  console.log(`\nFertig. ${updated} aktualisiert, ${nullCount} ohne sortKey (rein textuell).`);

  const prod = await p.catalogProduct.findFirst({
    where: { nr: 1 },
    include: { sizes: { orderBy: [{ sortKey: "asc" }, { value: "asc" }] } },
  });
  if (prod) {
    console.log(`\nSpot-Check "${prod.nameDe}":`);
    prod.sizes.forEach(s => process.stdout.write(`${s.value}  `));
    console.log();
  }
}

main()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => p.$disconnect());
