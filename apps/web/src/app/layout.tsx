import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "flag-icons/css/flag-icons.min.css";
import { BASE_URL } from "@/lib/seo/metadata";
import { I18nProvider } from "@/lib/i18n/context";
import { CookieBanner } from "@/components/CookieBanner";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default:  "EUCX - European Union Commodity Exchange",
    template: "%s | EUCX",
  },
  description:
    "Institutionelle B2B-Rohstoffbörse der EU — Metalle, Stahl, Agrar, Energie. " +
    "Transparentes Orderbuch, sofortige Abwicklung für verifizierte Händler.",
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

  robots: { index: true, follow: true },

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

};

export const viewport: Viewport = {
  width:        "1280",
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
      <body><I18nProvider>{children}</I18nProvider><CookieBanner /><Toaster richColors position="top-right" /></body>
    </html>
  );
}
