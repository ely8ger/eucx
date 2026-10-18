/**
 * Sitemap — /sitemap.xml
 *
 * Statische Marketing-Seiten + dynamische Produkt-/Insights-Seiten.
 * ISR: alle 15 Minuten neu gebaut.
 */
import type { MetadataRoute } from "next";
import { db }                 from "@/lib/db/client";
import { LEXIKON, AKADEMIE_ARTIKEL } from "@/app/insights/data";
import { STEEL_FORMS }        from "@/lib/steel/data";
import { FERTILIZER_CATEGORIES } from "@/lib/fertilizer/data";

export const revalidate = 900;

const BASE = "https://eucx.eu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { sku: string; updatedAt: Date }[] = [];
  try {
    products = await db.product.findMany({
      where:   { isActive: true },
      select:  { sku: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB nicht erreichbar → nur statische Seiten
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                     lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/katalog`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/metalle`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/duenger`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/marktpreise`,          lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/faq`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/preise`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/kontakt`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/wissen`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/insights`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/insights/lexikon`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE}/insights/akademie`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE}/insights/analysen`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE}/insights/regulatorik`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8  },
    { url: `${BASE}/agb`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/impressum`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/datenschutz`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const metalleFormPages: MetadataRoute.Sitemap = STEEL_FORMS.map(f => ({
    url:             `${BASE}/metalle/${f.id}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  const duengerKatPages: MetadataRoute.Sitemap = FERTILIZER_CATEGORIES.map(c => ({
    url:             `${BASE}/duenger/${c.id}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  const duengerProduktPages: MetadataRoute.Sitemap = FERTILIZER_CATEGORIES.flatMap(c =>
    c.products.map(p => ({
      url:             `${BASE}/duenger/${c.id}/${p.id}`,
      lastModified:    new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.75,
    }))
  );

  const lexikonPages: MetadataRoute.Sitemap = LEXIKON.map((entry) => ({
    url:             `${BASE}/insights/lexikon/${entry.slug}`,
    lastModified:    new Date(entry.updated),
    changeFrequency: "monthly" as const,
    priority:        0.75,
  }));

  const akademiePages: MetadataRoute.Sitemap = AKADEMIE_ARTIKEL.map((a) => ({
    url:             `${BASE}/insights/akademie/${a.slug}`,
    lastModified:    new Date(a.published),
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE}/katalog/${p.sku.toLowerCase()}`,
    lastModified:    p.updatedAt,
    changeFrequency: "daily" as const,
    priority:        0.85,
  }));

  return [
    ...staticPages,
    ...metalleFormPages,
    ...duengerKatPages,
    ...duengerProduktPages,
    ...lexikonPages,
    ...akademiePages,
    ...productPages,
  ];
}
