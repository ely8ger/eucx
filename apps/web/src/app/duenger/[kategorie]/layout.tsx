import type { Metadata } from "next";
import { FERTILIZER_CATEGORIES } from "@/lib/fertilizer/data";

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie } = await params;
  const kat   = FERTILIZER_CATEGORIES.find(c => c.id === kategorie);
  const label = kat?.label ?? kategorie;
  const desc  = kat?.description
    ? `${kat.description.slice(0, 110)} — Institutionell handeln auf EUCX.`
    : `${label} — Düngemittel institutionell kaufen und verkaufen auf EUCX.`;

  return {
    title: `${label} kaufen | EUCX Düngemittelmarkt`,
    description: desc.length > 155 ? desc.slice(0, 152) + "…" : desc,
    alternates: {
      canonical:  `https://eucx.eu/duenger/${kategorie}`,
      languages: {
        "de-DE":     `https://eucx.eu/duenger/${kategorie}`,
        "x-default": `https://eucx.eu/duenger/${kategorie}`,
      },
    },
  };
}

export default function DuengerKategorieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
