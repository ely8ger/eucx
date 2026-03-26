/**
 * Dynamische Sitemap - /sitemap.xml
 *
 * Enthält:
 *  - Statische Marketing-Seiten
 *  - Alle aktiven Produkte (ISR: alle 15 Minuten neu gebaut)
 *
 * Neue Produkte erscheinen automatisch nach dem nächsten Revalidate-Zyklus.
 */
import type { MetadataRoute } from "next";
import { db }                 from "@/lib/db/client";
import { LEXIKON, AKADEMIE_ARTIKEL } from "@/app/insights/data";

export const revalidate = 900; // 15 Minuten

const BASE = "https://eucx.eu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Alle aktiven Produkte laden
  let products: { sku: string; updatedAt: Date }[] = [];
  try {
    products = await db.product.findMany({
      where:  { isActive: true },
      select: { sku: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB nicht erreichbar → nur statische Seiten
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              `${BASE}/`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         1.0,
      alternates: {
        languages: {
          de: `${BASE}/`,
          en: `${BASE}/en/`,
          fr: `${BASE}/fr/`,
        },
      },
    },
    {
      url:             `${BASE}/trading`,
      lastModified:    new Date(),
      changeFrequency: "hourly",
      priority:        0.9,
    },
    {
      url:             `${BASE}/products`,
      lastModified:    new Date(),
      changeFrequency: "hourly",
      priority:        0.8,
    },
    {
      url:             `${BASE}/faq`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.85,
    },
    {
      url:             `${BASE}/wissen`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    },
    {
      url:             `${BASE}/api/docs`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.6,
    },
    // ── Insights Hub ───────────────────────────────────────────────────────
    { url: `${BASE}/insights`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/insights/lexikon`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE}/insights/akademie`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE}/insights/analysen`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE}/insights/regulatorik`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/marktpreise`,          lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9  },
    { url: `${BASE}/katalog`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
  ];

  // ── Lexikon-Einträge (A–Z, alle Slugs) ─────────────────────────────────
  const lexikonPages: MetadataRoute.Sitemap = LEXIKON.map((entry) => ({
    url:             `${BASE}/insights/lexikon/${entry.slug}`,
    lastModified:    new Date(entry.updated),
    changeFrequency: "monthly" as const,
    priority:        0.75,
  }));

  // ── Akademie-Artikel ────────────────────────────────────────────────────
  const akademiePages: MetadataRoute.Sitemap = AKADEMIE_ARTIKEL.map((a) => ({
    url:             `${BASE}/insights/akademie/${a.slug}`,
    lastModified:    new Date(a.published),
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE}/trading/${p.sku.toLowerCase()}`,
    lastModified:    p.updatedAt,
    changeFrequency: "always" as const,
    priority:        0.85,
  }));

  return [...staticPages, ...lexikonPages, ...akademiePages, ...productPages];
}
