/**
 * robots.txt - /robots.txt
 *
 * Schützt sensible API- und Auth-Routen vor Crawler-Indexierung.
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/", "/faq", "/preise", "/kontakt", "/wissen/", "/insights/", "/marktpreise", "/katalog", "/metalle", "/duenger", "/regelwerk", "/agb", "/datenschutz", "/impressum", "/cookie-richtlinie"],
        disallow:  [
          "/api/",
          "/settings/",
          "/portfolio/",
          "/kyc/",
          "/dashboard/",
          "/deals/",
          "/reports/",
          "/login",
          "/register",
          "/2fa-setup",
        ],
      },
      // Spezielle Crawler-Regeln für SEO-Tools
      {
        userAgent: "Googlebot",
        allow:     "/",
        disallow:  ["/api/"],
        crawlDelay: undefined,
      },
    ],
    sitemap:  "https://eucx.eu/sitemap.xml",
    host:     "https://eucx.eu",
  };
}
