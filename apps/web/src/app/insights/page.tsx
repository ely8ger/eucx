import type { Metadata } from "next";
import { InsightsClient } from "./InsightsClient";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Marktwissen & Insights - Rohstoff-Lexikon, Marktanalysen | EUCX",
  description: "Rohstoff-Lexikon, wöchentliche Marktanalysen, Händler-Akademie und EU-Regulatorik - für professionelle B2B-Handelsteilnehmer.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://eucx.eu/insights",
    types: { "application/rss+xml": "https://eucx.eu/insights/feed" },
  },
};

const insightsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "EUCX Marktwissen & Insights",
  description: "Wissenshub für professionellen Rohstoffhandel.",
  url: "https://eucx.eu/insights",
  publisher: { "@type": "Organization", "@id": "https://eucx.eu#organization" },
};

export default function InsightsPage() {
  return (
    <>
      <JsonLd data={insightsJsonLd} />
      <InsightsClient />
    </>
  );
}
