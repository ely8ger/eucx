/**
 * Trading-Paar-Seite — /trading/[symbol]
 *
 * SSR + ISR (revalidate=900s).
 *
 * generateMetadata:
 *   Title:       "Kupfer Spot-Preis Echtzeit: 8.420 € (+1,2%) | EUCX"
 *   Description: 24h-Hoch, 24h-Tief, Volumen, Kategorie
 *   OG-Image:    Mit echter SVG-Sparkline der letzten 24 Stunden
 *   JSON-LD:     FinancialProduct + ExchangeRateSpecification + Dataset + Breadcrumbs
 */
import type { Metadata }           from "next";
import { notFound }                from "next/navigation";
import { db }                      from "@/lib/db/client";
import {
  buildOgImageUrl,
  buildFinancialProductJsonLd,
  buildAlternateLanguages,
  CATEGORY_LABELS,
  BASE_URL,
}                                  from "@/lib/seo/metadata";
import { encodeSparklineData }     from "@/lib/seo/sparkline";
import { TradingTerminalWrapper }  from "@/components/trading/TradingTerminalWrapper";

export const revalidate = 900;

interface Props {
  params: Promise<{ symbol: string }>;
}

// ── Daten-Fetch ───────────────────────────────────────────────────────────────

async function getProductData(symbolSlug: string) {
  const sku = symbolSlug.toUpperCase();

  const product = await db.product.findFirst({
    where:   { sku, isActive: true },
    include: { category: { select: { slug: true, label: true } } },
  });
  if (!product) return null;

  // Letzte 24 Stunden-Kerzen (ONE_HOUR) für Sparkline + Statistiken
  const candles24h = await db.marketCandle.findMany({
    where: {
      productId:   product.id,
      interval:    "ONE_HOUR",
      periodStart: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { periodStart: "asc" },
    select:  { close: true, high: true, low: true, volume: true },
  });

  // Fallback: letzte 1D-Kerze wenn keine Stunden-Kerzen
  const dayCandle = await db.marketCandle.findFirst({
    where:   { productId: product.id, interval: "ONE_DAY" },
    orderBy: { periodStart: "desc" },
    select:  { close: true, open: true, high: true, low: true, volume: true },
  });

  // Aktueller Preis
  const currentPrice = candles24h.at(-1)?.close?.toString()
    ?? dayCandle?.close?.toString()
    ?? null;

  // Referenzpreis für % Änderung (erster Kurs des 24h-Fensters oder Open)
  const referencePrice = candles24h.at(0)?.close?.toString()
    ?? dayCandle?.open?.toString()
    ?? null;

  // 24h-Statistiken
  const high24h = candles24h.length > 0
    ? Math.max(...candles24h.map((c) => parseFloat(c.high.toString()))).toFixed(2)
    : dayCandle?.high?.toString() ?? null;

  const low24h = candles24h.length > 0
    ? Math.min(...candles24h.map((c) => parseFloat(c.low.toString()))).toFixed(2)
    : dayCandle?.low?.toString() ?? null;

  const volume24h = candles24h.length > 0
    ? candles24h.reduce((s, c) => s + parseFloat(c.volume.toString()), 0).toFixed(0)
    : dayCandle?.volume?.toString() ?? null;

  // Prozentuale Änderung
  let changePercent = "0.00";
  if (currentPrice && referencePrice) {
    const cur = parseFloat(currentPrice);
    const ref = parseFloat(referencePrice);
    if (ref > 0) changePercent = (((cur - ref) / ref) * 100).toFixed(2);
  }

  // Sparkline: Schlusskurse der letzten 24h als kompakte Zahl-Liste
  const sparklineData = candles24h.length >= 2
    ? encodeSparklineData(candles24h.map((c) => parseFloat(c.close.toString())))
    : null;

  return { product, currentPrice, changePercent, high24h, low24h, volume24h, sparklineData };
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const data = await getProductData(symbol);

  if (!data) {
    return { title: "Produkt nicht gefunden", robots: { index: false, follow: false } };
  }

  const { product, currentPrice, changePercent, high24h, low24h, volume24h, sparklineData } = data;
  const categoryLabel = CATEGORY_LABELS[product.category.slug] ?? product.category.label;
  const unit          = product.unit === "TON" ? "€/t" : `€/${product.unit.toLowerCase()}`;

  // ── Dynamischer Title ──────────────────────────────────────────────────────
  const priceStr = currentPrice
    ? new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(parseFloat(currentPrice))
    : null;
  const changeNum  = parseFloat(changePercent);
  const changeSign = changeNum >= 0 ? "+" : "";

  const title = priceStr
    ? `${product.name} Spot-Preis Echtzeit: ${priceStr} ${unit} (${changeSign}${changeNum.toFixed(1)}%)`
    : `${product.name} — Live Spot-Preis & Handel`;

  // ── Reichhaltige Description mit 24h-Daten ─────────────────────────────────
  const highStr   = high24h   ? new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(parseFloat(high24h))   : null;
  const lowStr    = low24h    ? new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(parseFloat(low24h))    : null;
  const volStr    = volume24h ? new Intl.NumberFormat("de-DE").format(parseFloat(volume24h)) : null;

  const descParts = [
    `${product.name} (${product.sku}) — Institutioneller ${categoryLabel}-Handel auf EUCX.`,
    priceStr && `Aktueller Spot-Preis: ${priceStr} ${unit} (${changeSign}${changeNum.toFixed(2)}% 24h).`,
    highStr && lowStr && `24h-Spanne: ${lowStr}–${highStr} ${unit}.`,
    volStr && `Handelsvolumen 24h: ${volStr} t.`,
    "Transparentes B2B-Orderbuch · EU-konform · Sofortige Abwicklung.",
  ].filter(Boolean).join(" ");

  // ── OG-Image mit Sparkline ─────────────────────────────────────────────────
  const ogImageUrl = buildOgImageUrl({
    symbol:    product.name,
    price:     currentPrice ?? undefined,
    change:    changePercent,
    unit,
    high:      high24h    ?? undefined,
    low:       low24h     ?? undefined,
    vol:       volume24h  ?? undefined,
    sparkline: sparklineData ?? undefined,
  });

  const path = `/trading/${symbol}`;

  return {
    title,
    description: descParts,
    keywords: [
      product.name,
      `${product.name} Spot-Preis`,
      `${product.name} Echtzeit Kurs`,
      `${product.name} kaufen EU`,
      `${product.name} ${unit}`,
      product.sku,
      categoryLabel,
      "LME-Benchmark",
      "institutioneller Rohstoffhandel",
      "B2B Commodity Exchange EU",
      "EUCX",
    ],
    alternates: buildAlternateLanguages(path),
    openGraph: {
      title,
      description: descParts,
      url:         `${BASE_URL}${path}`,
      siteName:    "EUCX — European Union Commodity Exchange",
      locale:      "de_DE",
      type:        "website",
      images: [{
        url:    ogImageUrl,
        width:  1200,
        height: 630,
        alt:    `${product.name} Live Spot-Preis Echtzeit Chart — EUCX`,
      }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: descParts,
      images:      [ogImageUrl],
      site:        "@eucx_exchange",
    },
    robots: { index: true, follow: true },
  };
}

// ── Static Params (Top-100 vorab rendern) ─────────────────────────────────────

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      where:   { isActive: true },
      select:  { sku: true },
      orderBy: { updatedAt: "desc" },
      take:    100,
    });
    return products.map((p) => ({ symbol: p.sku.toLowerCase() }));
  } catch {
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TradingSymbolPage({ params }: Props) {
  const { symbol } = await params;
  const data = await getProductData(symbol);
  if (!data) notFound();

  const { product, currentPrice, changePercent, high24h, low24h, volume24h } = data;
  const categoryLabel = CATEGORY_LABELS[product.category.slug] ?? product.category.label;
  const unit          = product.unit === "TON" ? "€/t" : `€/${product.unit.toLowerCase()}`;
  const changeNum     = parseFloat(changePercent);
  const isPositive    = changeNum >= 0;

  // JSON-LD
  const jsonLd = buildFinancialProductJsonLd({
    productName:  product.name,
    sku:          product.sku,
    categoryName: categoryLabel,
    categorySlug: product.category.slug,
    description:  product.description ?? `${product.name} — institutioneller Handel auf EUCX`,
    currentPrice: currentPrice ?? "0",
    high24h:      high24h    ?? undefined,
    low24h:       low24h     ?? undefined,
    volume24h:    volume24h  ?? undefined,
    currency:     "EUR",
    unit,
    priceDate:    new Date().toISOString(),
  });

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-4">
        {/* SSR-gerendeter Produkt-Header (für Crawler vollständig lesbar) */}
        <div className="bg-cb-white border border-cb-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-cb-petrol/10 text-cb-petrol px-2 py-0.5 rounded">
                  {product.sku}
                </span>
                <span className="text-xs text-cb-gray-400">{categoryLabel}</span>
              </div>
              <h1 className="text-2xl font-bold text-cb-petrol">{product.name}</h1>
              {product.description && (
                <p className="text-sm text-cb-gray-500 mt-1 max-w-2xl">{product.description}</p>
              )}
            </div>

            {currentPrice && (
              <div className="text-right">
                <div className="text-3xl font-bold text-cb-petrol tabular-nums">
                  {new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(parseFloat(currentPrice))}
                  <span className="text-base font-normal text-cb-gray-400 ml-1">{unit}</span>
                </div>
                <div className={`text-sm font-semibold mt-0.5 ${isPositive ? "text-green-600" : "text-red-500"}`}>
                  {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}{changeNum.toFixed(2)}%
                </div>
              </div>
            )}
          </div>

          {/* 24h-Statistiken (SSR — für Crawler indexierbar) */}
          {(high24h ?? low24h ?? volume24h) && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-cb-gray-100">
              {high24h && (
                <div>
                  <div className="text-xs text-cb-gray-400 uppercase tracking-wide">24h Hoch</div>
                  <div className="text-sm font-semibold text-green-600 tabular-nums">
                    {new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(parseFloat(high24h))}
                  </div>
                </div>
              )}
              {low24h && (
                <div>
                  <div className="text-xs text-cb-gray-400 uppercase tracking-wide">24h Tief</div>
                  <div className="text-sm font-semibold text-red-500 tabular-nums">
                    {new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(parseFloat(low24h))}
                  </div>
                </div>
              )}
              {volume24h && (
                <div>
                  <div className="text-xs text-cb-gray-400 uppercase tracking-wide">24h Volumen</div>
                  <div className="text-sm font-semibold text-cb-gray-700 tabular-nums">
                    {new Intl.NumberFormat("de-DE").format(parseFloat(volume24h))} t
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trading-Terminal (Client-seitig) */}
        <TradingTerminalWrapper
          productId={product.id}
          productName={product.name}
          sku={product.sku}
        />
      </div>
    </>
  );
}
