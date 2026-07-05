import type { Metadata } from "next";
import { STEEL_FORMS } from "@/lib/steel/data";

export async function generateMetadata({ params }: { params: Promise<{ form: string }> }): Promise<Metadata> {
  const { form } = await params;
  const f     = STEEL_FORMS.find(s => s.id === form);
  const label = f?.label ?? form;
  const desc  = f?.description
    ? `${f.description} — Institutionell handeln auf EUCX.`
    : `${label} — Metallprodukte institutionell kaufen und verkaufen auf EUCX.`;

  return {
    title: `${label} | EUCX Metallmarkt`,
    description: desc.length > 155 ? desc.slice(0, 152) + "…" : desc,
    alternates: {
      canonical:  `https://eucx.eu/metalle/${form}`,
      languages: {
        "de-DE":     `https://eucx.eu/metalle/${form}`,
        "x-default": `https://eucx.eu/metalle/${form}`,
      },
    },
  };
}

export default function MetalleFormLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
