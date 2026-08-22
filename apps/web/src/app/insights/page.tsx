import type { Metadata } from "next";
import { InsightsClient } from "./InsightsClient";

export const metadata: Metadata = {
  title: "Marktwissen & Insights - Rohstoff-Lexikon, Marktanalysen | EUCX",
  description: "Rohstoff-Lexikon, wöchentliche Marktanalysen, Händler-Akademie und EU-Regulatorik - für professionelle B2B-Handelsteilnehmer.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://eucx.eu/insights",
    types: { "application/rss+xml": "https://eucx.eu/insights/feed" },
  },
};

export default function InsightsPage() {
  return <InsightsClient />;
}
