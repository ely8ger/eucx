import type { Metadata } from "next";
import { getFertiCategory, getFertiProduct } from "@/lib/fertilizer/data";

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string; produkt: string }> }): Promise<Metadata> {
  const { kategorie, produkt } = await params;
  const kat  = getFertiCategory(kategorie);
  const prod = getFertiProduct(kategorie, produkt);
  const label = prod?.name ?? produkt;
  const katLabel = kat?.label ?? kategorie;
  const desc = `${label} — ${katLabel} institutionell kaufen auf EUCX. B2B-Handel für verifizierte Händler in der EU.`;

  return {
    title: `${label} | EUCX Düngemittelmarkt`,
    description: desc.length > 155 ? desc.slice(0, 152) + "…" : desc,
    alternates: {
      canonical:  `https://eucx.eu/duenger/${kategorie}/${produkt}`,
      languages: {
        "de-DE":     `https://eucx.eu/duenger/${kategorie}/${produkt}`,
        "x-default": `https://eucx.eu/duenger/${kategorie}/${produkt}`,
      },
    },
  };
}

export default function DuengerProduktLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
