import { JsonLd } from "@/components/seo/JsonLd";
import { SIDEBAR } from "@/lib/katalog/data";
import { BASE_URL } from "@/lib/seo/metadata";

export default async function KatalogKategorieLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ kategorie: string }>;
}) {
  const { kategorie } = await params;
  const katLabel =
    SIDEBAR.flatMap(s => s.kategorien).find(k => k.id === kategorie)?.label ?? kategorie;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "EUCX",    item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Katalog", item: `${BASE_URL}/katalog` },
      { "@type": "ListItem", position: 3, name: katLabel,  item: `${BASE_URL}/katalog/${kategorie}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
