import type { Metadata } from "next";
import { getForm, STEEL_FORMS } from "@/lib/steel/data";
import { buildAlternateLanguages, BASE_URL } from "@/lib/seo/metadata";
import { FormPageClient } from "./FormPageClient";

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
  return <FormPageClient formId={formId} />;
}
