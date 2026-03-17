/**
 * SEO-Hilfsfunktionen — gemeinsam genutzte Metadata-Utilities
 *
 * Wird von allen Seiten mit dynamischen Metadaten genutzt.
 * Caching: revalidate=900s (15min) — ausreichend frisch für Crawler,
 * schont die DB und verhindert DDoS durch Bot-Traffic.
 */
import type { Metadata } from "next";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://eucx.eu";

// ── Kategorien ────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  METALS:      "Metalle & Legierungen",
  AGRICULTURE: "Agrarprodukte",
  ENERGY:      "Energie & Brennstoffe",
  WOOD:        "Holz & Baustoffe",
  CHEMICALS:   "Chemikalien",
  OTHER:       "Sonstige Rohstoffe",
};

// Bekannte `sameAs`-Identifier für Rohstoff-Kategorien (schema.org Identitätsverknüpfung)
// Zweck: Suchmaschinen erkennen, dass EUCX-"Kupfer" das gleiche Konzept wie
// Wikidata Q753 (Copper) ist — verbessert Entity-Erkennung, KEIN Ranking-Trick.
export const CATEGORY_SAME_AS: Record<string, string[]> = {
  METALS:      [
    "https://www.wikidata.org/wiki/Q753",          // Copper (generisch)
    "https://www.lme.com/en/metals/non-ferrous",   // LME Non-Ferrous
  ],
  AGRICULTURE: [
    "https://www.wikidata.org/wiki/Q11004",        // Wheat (generisch)
  ],
  ENERGY:      [
    "https://www.wikidata.org/wiki/Q12748",        // Petroleum (generisch)
  ],
};

// ── OG-Image-URL-Builder ──────────────────────────────────────────────────────

export function buildOgImageUrl(params: {
  symbol:    string;
  price?:    string;
  change?:   string;
  unit?:     string;
  high?:     string;
  low?:      string;
  vol?:      string;
  sparkline?: string;  // komma-getrennte Preise
}): string {
  const url = new URL(`${BASE_URL}/api/og`);
  url.searchParams.set("symbol", params.symbol);
  if (params.price)    url.searchParams.set("price",  params.price);
  if (params.change)   url.searchParams.set("change", params.change);
  if (params.unit)     url.searchParams.set("unit",   params.unit);
  if (params.high)     url.searchParams.set("high",   params.high);
  if (params.low)      url.searchParams.set("low",    params.low);
  if (params.vol)      url.searchParams.set("vol",    params.vol);
  if (params.sparkline) url.searchParams.set("p",     params.sparkline);
  return url.toString();
}

// ── JSON-LD Builder ───────────────────────────────────────────────────────────

interface FinancialProductJsonLd {
  productName:   string;
  sku:           string;
  categoryName:  string;
  categorySlug:  string;
  description:   string;
  currentPrice:  string;
  high24h?:      string;
  low24h?:       string;
  volume24h?:    string;
  currency:      string;
  unit:          string;
  priceDate:     string;
}

/**
 * Erstellt JSON-LD Structured Data nach schema.org.
 *
 * Typen:
 *   FinancialProduct         — Das Produkt selbst
 *   ExchangeRateSpecification — Aktueller Preis mit Zeitstempel
 *   Dataset                  — Maschinenlesbare Preis-Zeitreihe (Google Data Search)
 *   BreadcrumbList           — Navigation
 *
 * sameAs: Identitätsverknüpfung mit Wikidata/LME (semantisch korrekt, kein SEO-Trick)
 */
export function buildFinancialProductJsonLd(p: FinancialProductJsonLd): Record<string, unknown> {
  const productUrl   = `${BASE_URL}/trading/${p.sku.toLowerCase()}`;
  const sameAsLinks  = CATEGORY_SAME_AS[p.categorySlug] ?? [];

  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── FinancialProduct ───────────────────────────────────────────────────
      {
        "@type":        "FinancialProduct",
        "@id":          `${productUrl}#product`,
        name:           p.productName,
        identifier:     p.sku,
        category:       p.categoryName,
        description:    p.description,
        ...(sameAsLinks.length > 0 && { sameAs: sameAsLinks }),
        provider: {
          "@type": "Organization",
          "@id":   `${BASE_URL}#organization`,
          name:    "EUCX — European Union Commodity Exchange",
          url:     BASE_URL,
          logo: {
            "@type":  "ImageObject",
            url:      `${BASE_URL}/icon.png`,
            width:    "512",
            height:   "512",
          },
        },
        offers: {
          "@type":         "Offer",
          price:           p.currentPrice,
          priceCurrency:   p.currency,
          priceValidUntil: new Date(Date.now() + 900_000).toISOString(),
          availability:    "https://schema.org/InStock",
          url:             productUrl,
          priceSpecification: {
            "@type":        "UnitPriceSpecification",
            price:          p.currentPrice,
            priceCurrency:  p.currency,
            unitText:       p.unit,
            validFrom:      p.priceDate,
          },
        },
      },

      // ── ExchangeRateSpecification ──────────────────────────────────────────
      {
        "@type":    "ExchangeRateSpecification",
        "@id":      `${productUrl}#rate`,
        currency:   p.currency,
        currentExchangeRate: {
          "@type":        "UnitPriceSpecification",
          price:          p.currentPrice,
          priceCurrency:  p.currency,
          unitText:       p.unit,
          validFrom:      p.priceDate,
        },
      },

      // ── Dataset (24h Preisdaten — Google Data Search Indexierung) ──────────
      {
        "@type":       "Dataset",
        "@id":         `${productUrl}#dataset`,
        name:          `${p.productName} — 24h Marktdaten`,
        description:   `Echtzeit-Marktdaten für ${p.productName} auf EUCX. Spot-Preis, Hoch, Tief, Volumen.`,
        url:           productUrl,
        creator: {
          "@type": "Organization",
          "@id":   `${BASE_URL}#organization`,
        },
        license:     "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: false,
        variableMeasured: [
          { "@type": "PropertyValue", name: "Spot-Preis",     value: p.currentPrice,  unitText: p.unit },
          ...(p.high24h  ? [{ "@type": "PropertyValue", name: "24h-Hoch",    value: p.high24h,    unitText: p.unit }] : []),
          ...(p.low24h   ? [{ "@type": "PropertyValue", name: "24h-Tief",    value: p.low24h,     unitText: p.unit }] : []),
          ...(p.volume24h ? [{ "@type": "PropertyValue", name: "24h-Volumen", value: p.volume24h,  unitText: "t"     }] : []),
        ],
        temporalCoverage: `${new Date(Date.now() - 86_400_000).toISOString()}/${new Date().toISOString()}`,
        dateModified: new Date().toISOString(),
      },

      // ── BreadcrumbList ─────────────────────────────────────────────────────
      {
        "@type": "BreadcrumbList",
        "@id":   `${productUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EUCX",   item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Handel", item: `${BASE_URL}/trading` },
          { "@type": "ListItem", position: 3, name: p.productName, item: productUrl },
        ],
      },
    ],
  };
}

// ── hreflang (7 EU-Kernmärkte) ────────────────────────────────────────────────
// Sprachvarianten zeigen auf dieselbe URL — die Plattform ist einsprachig Deutsch,
// EN dient als europäischer Fallback. Wenn i18n hinzukommt, werden die Pfade ersetzt.

export function buildAlternateLanguages(path: string): Metadata["alternates"] {
  return {
    canonical: `${BASE_URL}${path}`,
    languages: {
      "de-DE": `${BASE_URL}${path}`,
      "de-AT": `${BASE_URL}${path}`,
      "de-CH": `${BASE_URL}${path}`,
      "en-EU": `${BASE_URL}${path}`,       // EU-weiter EN-Fallback
      "fr-FR": `${BASE_URL}${path}`,       // Aktuell gleiche URL — für späteres i18n
      "pl-PL": `${BASE_URL}${path}`,
      "it-IT": `${BASE_URL}${path}`,
      "es-ES": `${BASE_URL}${path}`,
      "nl-NL": `${BASE_URL}${path}`,
      "x-default": `${BASE_URL}${path}`,   // Fallback für unbekannte Sprachen
    },
  };
}
