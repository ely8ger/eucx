import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie } = await params;
  return {
    alternates: {
      canonical: `https://eucx.eu/katalog/${kategorie}`,
      languages: {
        "de-DE": `https://eucx.eu/katalog/${kategorie}`,
        "x-default": `https://eucx.eu/katalog/${kategorie}`,
      },
    },
  };
}

export default function KatalogKategorieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
