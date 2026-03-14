import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Commerzbank Brand Colors ──────────────────────────────────────
      colors: {
        cb: {
          // Primär-Gelb (Logo-Gelb)
          yellow:       "#FBB809",
          "yellow-light": "#FEDF33",
          "yellow-dark":  "#E5A500",
          "yellow-hover": "#E8A800",

          // Petrol / Dark
          petrol:       "#003D6B",
          "petrol-dark": "#002A4A",
          navy:         "#001F3F",

          // Grautöne (Commerzbank-typisch)
          "gray-50":    "#F7F7F7",
          "gray-100":   "#F0F0F0",
          "gray-200":   "#E0E0E0",
          "gray-300":   "#C8C8C8",
          "gray-400":   "#999999",
          "gray-500":   "#666666",
          "gray-700":   "#333333",
          "gray-900":   "#1A1A1A",

          // Semantische Farben
          success:      "#00843D",
          error:        "#E30613",
          warning:      "#F5A623",
          info:         "#0066CC",

          // Weiß
          white:        "#FFFFFF",
        },
      },

      // ─── Commerzbank Typography ────────────────────────────────────────
      fontFamily: {
        // Compatil Fact = Commerzbank Hausschrift
        // Fallback: Inter (sehr ähnlich, humanistisches Sans-Serif)
        sans: [
          "Compatil Fact",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs:    ["0.75rem",  { lineHeight: "1.125rem" }],
        sm:    ["0.875rem", { lineHeight: "1.375rem" }],
        base:  ["1rem",     { lineHeight: "1.5rem" }],
        lg:    ["1.125rem", { lineHeight: "1.75rem" }],
        xl:    ["1.25rem",  { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem",   { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem",  { lineHeight: "2.75rem" }],
      },

      fontWeight: {
        light:    "300",
        normal:   "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
      },

      // ─── Commerzbank Spacing & Sizing ──────────────────────────────────
      borderRadius: {
        none: "0",
        sm:   "2px",
        DEFAULT: "4px",
        md:   "4px",
        lg:   "6px",
        xl:   "8px",
        full: "9999px",
        // Commerzbank verwendet sehr kleine Radien — klare, eckige Formen
      },

      // ─── Shadows (Commerzbank-stil: subtil, professionell) ────────────
      boxShadow: {
        sm:   "0 1px 2px 0 rgba(0, 0, 0, 0.08)",
        DEFAULT: "0 2px 4px 0 rgba(0, 0, 0, 0.10)",
        md:   "0 4px 8px 0 rgba(0, 0, 0, 0.12)",
        lg:   "0 8px 16px 0 rgba(0, 0, 0, 0.14)",
        xl:   "0 12px 24px 0 rgba(0, 0, 0, 0.16)",
        "inner-yellow": "inset 0 0 0 2px #FBB809",
      },

      // ─── Border ───────────────────────────────────────────────────────
      borderWidth: {
        DEFAULT: "1px",
        "2": "2px",
        "3": "3px",
      },

      // ─── Transitions ──────────────────────────────────────────────────
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "100ms",
        slow: "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
