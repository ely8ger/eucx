import type { Metadata } from "next";
import { KATALOG } from "@/lib/katalog/data";

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie } = await params;
  const kat = KATALOG[kategorie];
  const label = kat?.label ?? kategorie;
  const desc  = kat?.description
    ? `${kat.description} — Institutionell handeln auf EUCX.`
    : `${label} — Stahlprodukte institutionell kaufen und verkaufen auf EUCX.`;

  return {
    title: `${label} kaufen | EUCX Stahlkatalog`,
    description: desc.length > 155 ? desc.slice(0, 152) + "…" : desc,
    alternates: {
      canonical:  `https://eucx.eu/katalog/${kategorie}`,
      languages: {
        "de-DE":     `https://eucx.eu/katalog/${kategorie}`,
        "x-default": `https://eucx.eu/katalog/${kategorie}`,
      },
    },
  };
}

export default function KatalogKategorieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
