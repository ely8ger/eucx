import type { Metadata } from "next";
import { getForm, STEEL_FORMS } from "@/lib/steel/data";
import { buildAlternateLanguages, BASE_URL } from "@/lib/seo/metadata";
import { FormPageClient } from "./FormPageClient";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  return STEEL_FORMS.map(f => ({ form: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ form: string }> }): Promise<Metadata> {
  const { form: formId } = await params;
  const form = getForm(formId);
  const label = form?.label ?? formId;
  const desc  = form?.description ?? "";
  return {
    title:       `${label}profile kaufen — Stahl B2B | EUCX`,
    description: `${desc} Institutioneller B2B-Handel auf EUCX. KYC-verifizierte Händler, reguliertes Orderbuch, sofortige Abwicklung.`,
    alternates:  buildAlternateLanguages(`/metalle/${formId}`),
    openGraph: {
      title:       `EUCX Metalle — ${label}profile`,
      description: `${desc} B2B-Handel auf der europäischen Rohstoffbörse EUCX.`,
      url:         `${BASE_URL}/metalle/${formId}`,
    },
  };
}

export default async function FormPage({ params }: { params: Promise<{ form: string }> }) {
  const { form: formId } = await params;
  const form = getForm(formId);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "EUCX",    item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Metalle", item: `${BASE_URL}/metalle` },
      { "@type": "ListItem", position: 3, name: form?.label ?? formId, item: `${BASE_URL}/metalle/${formId}` },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BASE_URL}/metalle/${formId}#list`,
    name: `${form?.label ?? formId} — EUCX Metallkatalog`,
    description: form?.description,
    url: `${BASE_URL}/metalle/${formId}`,
    numberOfItems: form?.products?.length ?? 0,
    itemListElement: (form?.products ?? []).slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      description: p.beschreibung,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemList} />
      <FormPageClient formId={formId} />
    </>
  );
}
