/**
 * GET /api/public/openapi
 *
 * OpenAPI 3.1 Spezifikation für alle öffentlichen EUCX-Endpunkte (/api/public/*).
 * Kein API-Schlüssel erforderlich.
 *
 * Cache: 1 Stunde (statische Spec)
 */
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const spec = {
  openapi: "3.1.0",
  info: {
    title:       "EUCX Public API",
    version:     "1.0.0",
    description: "Öffentliche Schnittstellen der European Union Commodity Exchange. Alle Endpunkte erfordern keine Authentifizierung. Preis- und Handelsdaten erfordern eine EUCX-Mitgliedschaft.",
    contact: {
      name:  "EUCX Developer Support",
      email: "api@eucx.eu",
      url:   "https://eucx.eu",
    },
    license: {
      name: "Proprietary",
      url:  "https://eucx.eu/nutzungsbedingungen",
    },
  },
  servers: [
    { url: "https://eucx.eu", description: "Production" },
  ],
  tags: [
    { name: "market",  description: "Marktstatistiken (ohne Preise)" },
    { name: "platform", description: "Plattformstatus" },
    { name: "docs",    description: "API-Dokumentation" },
  ],
  paths: {
    "/api/public/market/stats": {
      get: {
        tags:        ["market"],
        operationId: "getMarketStats",
        summary:     "Marktstatistiken",
        description: "Gibt anonymisierte Handelsstatistiken zurück. Enthält keine Preisdaten — nur Volumen- und Aktivitätskennzahlen.",
        responses: {
          "200": {
            description: "Marktstatistiken",
            headers: {
              "Cache-Control": {
                schema: { type: "string" },
                description: "s-maxage=60, stale-while-revalidate=120",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    activeAuctions: {
                      type:        "integer",
                      description: "Anzahl aktiver Ausschreibungen (Phase PROPOSAL)",
                    },
                    completedToday: {
                      type:        "integer",
                      description: "Heute abgeschlossene Auktionen",
                    },
                    volume7d: {
                      type:        "string",
                      description: "Handelsvolumen der letzten 7 Tage (EUR, formatiert)",
                      example:     "€ 2,3 Mio.",
                    },
                    volume7dRaw: {
                      type:        "number",
                      description: "Handelsvolumen der letzten 7 Tage (EUR, numerisch)",
                    },
                    tradeCount7d: {
                      type:        "integer",
                      description: "Anzahl Transaktionen der letzten 7 Tage",
                    },
                    categoryActivity: {
                      type:        "array",
                      description: "Auktionsaktivität nach CBAM-Warengruppe",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string", example: "Metalle & Stahl" },
                          count:    { type: "integer" },
                        },
                      },
                    },
                    marketStatus: {
                      type:        "string",
                      enum:        ["OPEN", "CLOSED", "HALT"],
                      description: "Aktueller Handelsstatus der Plattform",
                    },
                    generatedAt: {
                      type:        "string",
                      format:      "date-time",
                      description: "Zeitstempel der Datengenerierung",
                    },
                  },
                  required: ["activeAuctions", "completedToday", "tradeCount7d", "marketStatus", "generatedAt"],
                },
              },
            },
          },
        },
      },
    },
    "/api/public/status": {
      get: {
        tags:        ["platform"],
        operationId: "getPlatformStatus",
        summary:     "Plattformstatus",
        description: "Gibt den aktuellen Betriebsstatus der EUCX-Plattform zurück.",
        responses: {
          "200": {
            description: "Plattformstatus",
            headers: {
              "Cache-Control": {
                schema: { type: "string" },
                description: "s-maxage=30",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    platform: {
                      type:        "string",
                      enum:        ["operational", "degraded"],
                      description: "Betriebsstatus der Plattform",
                    },
                    market: {
                      type:        "string",
                      enum:        ["OPEN", "CLOSED", "HALT"],
                      description: "Aktueller Handelsstatus",
                    },
                    haltReason: {
                      type:        "string",
                      nullable:    true,
                      description: "Grund für Trading Halt (falls aktiv)",
                    },
                    haltUntil: {
                      type:        "string",
                      format:      "date-time",
                      nullable:    true,
                      description: "Geplantes Ende des Trading Halts",
                    },
                    maintenance: {
                      type:        "boolean",
                      description: "Wartungsmodus aktiv",
                    },
                    timestamp: {
                      type:        "string",
                      format:      "date-time",
                    },
                  },
                  required: ["platform", "market", "maintenance", "timestamp"],
                },
              },
            },
          },
        },
      },
    },
    "/api/public/openapi": {
      get: {
        tags:        ["docs"],
        operationId: "getOpenApiSpec",
        summary:     "OpenAPI Spezifikation",
        description: "Diese Spezifikation als OpenAPI 3.1 JSON-Dokument.",
        responses: {
          "200": {
            description: "OpenAPI 3.1 Dokument",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          code:  { type: "string" },
        },
        required: ["error"],
      },
    },
  },
} as const;

export async function GET() {
  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type":  "application/json",
    },
  });
}
