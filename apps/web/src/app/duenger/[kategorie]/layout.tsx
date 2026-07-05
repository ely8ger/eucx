import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie } = await params;
  return {
    alternates: {
      canonical: `https://eucx.eu/duenger/${kategorie}`,
      languages: {
        "de-DE": `https://eucx.eu/duenger/${kategorie}`,
        "x-default": `https://eucx.eu/duenger/${kategorie}`,
      },
    },
  };
}

export default function DuengerKategorieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
