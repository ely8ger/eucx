/**
 * Dynamische Sitemap — /sitemap.xml
 *
 * Enthält:
 *  - Statische Marketing-Seiten
 *  - Alle aktiven Produkte (ISR: alle 15 Minuten neu gebaut)
 *
 * Neue Produkte erscheinen automatisch nach dem nächsten Revalidate-Zyklus.
 */
import type { MetadataRoute } from "next";
import { db }                 from "@/lib/db/client";

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
      url:             `${BASE}/api/docs`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.6,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE}/trading/${p.sku.toLowerCase()}`,
    lastModified:    p.updatedAt,
    changeFrequency: "always" as const,
    priority:        0.85,
  }));

  return [...staticPages, ...productPages];
}
