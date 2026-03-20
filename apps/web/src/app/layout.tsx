import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { BASE_URL } from "@/lib/seo/metadata";
import { I18nProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: {
    default:  "EUCX - European Union Commodity Exchange",
    template: "%s | EUCX",
  },
  description:
    "Digitale B2B-Warenbörse für institutionellen Rohstoffhandel in der EU - " +
    "Metalle, Holz, Agrar, Chemie, Energie. Transparentes Orderbuch, sofortige Abwicklung.",
  keywords: [
    "European Commodity Exchange",
    "Institutional Metal Trading",
    "B2B Rohstoffhandel EU",
    "Warenbörse",
    "Metalle kaufen",
    "Agrarprodukte Börse",
    "EUCX",
    "Commodity Exchange Europe",
  ],
  authors:      [{ name: "EUCX GmbH", url: BASE_URL }],
  metadataBase: new URL(BASE_URL),
  manifest:     "/manifest.webmanifest",

  // Standard: kein Crawling außer bei explizit freigegebenen Seiten
  robots: { index: false, follow: false },

  openGraph: {
    type:     "website",
    siteName: "EUCX - European Union Commodity Exchange",
    locale:   "de_DE",
    url:      BASE_URL,
    images: [
      {
        url:    `/api/og?symbol=EUCX%20Exchange`,
        width:  1200,
        height: 630,
        alt:    "EUCX - European Union Commodity Exchange",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@eucx_exchange",
  },

  // Canonical-URL (überschrieben in Unterseiten)
  alternates: {
    canonical: BASE_URL,
    languages: {
      "de-DE":   `${BASE_URL}/`,
      "en-EU":   `${BASE_URL}/en/`,
      "x-default": BASE_URL,
    },
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   [
    { media: "(prefers-color-scheme: light)", color: "#0b1e36" },
    { media: "(prefers-color-scheme: dark)",  color: "#0b1e36" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Preconnect zu externen Ressourcen für < 200ms TTFB */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL ?? ""} />
      </head>
      <body><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
