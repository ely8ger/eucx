/**
 * Web App Manifest - /manifest.webmanifest
 *
 * Grundlage für "Add to Home Screen" auf Mobile und PWA-Erkennung.
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "EUCX - European Union Commodity Exchange",
    short_name:       "EUCX",
    description:      "Institutioneller B2B-Rohstoffhandel in der EU",
    start_url:        "/dashboard",
    display:          "standalone",
    background_color: "#001F3F",
    theme_color:      "#003D6B",
    orientation:      "portrait-primary",
    icons: [
      {
        src:     "/icon-192.png",
        sizes:   "192x192",
        type:    "image/png",
        purpose: "any",
      },
      {
        src:     "/icon-512.png",
        sizes:   "512x512",
        type:    "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["finance", "business"],
    lang:       "de",
    dir:        "ltr",
  };
}
