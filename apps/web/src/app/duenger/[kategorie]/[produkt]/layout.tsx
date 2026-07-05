import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string; produkt: string }> }): Promise<Metadata> {
  const { kategorie, produkt } = await params;
  return {
    alternates: {
      canonical: `https://eucx.eu/duenger/${kategorie}/${produkt}`,
      languages: {
        "de-DE": `https://eucx.eu/duenger/${kategorie}/${produkt}`,
        "x-default": `https://eucx.eu/duenger/${kategorie}/${produkt}`,
      },
    },
  };
}

export default function DuengerProduktLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
