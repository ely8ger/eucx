import type { Metadata } from "next";
import { getFertiCategory, FERTILIZER_CATEGORIES } from "@/lib/fertilizer/data";
import { buildAlternateLanguages, BASE_URL } from "@/lib/seo/metadata";
import { KategoriePageClient } from "./KategoriePageClient";

export async function generateStaticParams() {
  return FERTILIZER_CATEGORIES.map(c => ({ kategorie: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie: katId } = await params;
  const kat = getFertiCategory(katId);
  const label = kat?.label ?? katId;
  const desc  = kat?.description ?? "";
  return {
    title:       `${label} kaufen — Dünger B2B | EUCX`,
    description: `${desc} Institutioneller B2B-Düngerhandel auf EUCX. KYC-verifiziert, EU-Regularien konform, sofortige Abwicklung.`,
    alternates:  buildAlternateLanguages(`/duenger/${katId}`),
    openGraph: {
      title:       `EUCX Dünger — ${label}`,
      description: `${desc} B2B-Handel auf der europäischen Rohstoffbörse EUCX.`,
      url:         `${BASE_URL}/duenger/${katId}`,
    },
  };
}

export default async function KategoriePage({ params }: { params: Promise<{ kategorie: string }> }) {
  const { kategorie: katId } = await params;
  return <KategoriePageClient katId={katId} />;
}
