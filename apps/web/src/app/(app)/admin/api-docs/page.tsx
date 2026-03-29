"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const SPEC = {
  openapi: "3.0.3",
  info: {
    title:       "EUCX — European Commodity Exchange API",
    description: "Interne API-Referenz. Nur für autorisierte Administratoren.",
    version:     "1.0.0",
    contact:     { name: "EUCX Platform Team", url: "https://eucx.eu" },
  },
  servers: [{ url: "https://eucx.eu/api", description: "Production" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Order: {
        type: "object",
        properties: {
          orderId:      { type: "string", format: "uuid" },
          status:       { type: "string", enum: ["ACTIVE", "PARTIALLY_FILLED", "FILLED", "CANCELLED", "EXPIRED"] },
          direction:    { type: "string", enum: ["BUY", "SELL"] },
          pricePerUnit: { type: "string", example: "545.00", description: "Preis in €/t (Decimal-String)" },
          quantityTons: { type: "string", example: "100.000" },
          totalValue:   { type: "string", example: "54500.00" },
          currency:     { type: "string", enum: ["EUR", "PLN", "USD"] },
          createdAt:    { type: "string", format: "date-time" },
        },
      },
      OrderbookEntry: {
        type: "object",
        properties: {
          id:        { type: "string", format: "uuid" },
          price:     { type: "string", example: "545.00" },
          qty:       { type: "string", example: "120.000" },
          remaining: { type: "string", example: "80.000" },
          org:       { type: "string", example: "Stahlwerk Polska" },
          country:   { type: "string", example: "PL" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error:   { type: "string" },
          details: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Nutzer & Organisation registrieren",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "organizationName", "taxId", "country", "city", "role"],
                properties: {
                  email:            { type: "string", format: "email" },
                  password:         { type: "string", minLength: 10 },
                  organizationName: { type: "string" },
                  taxId:            { type: "string" },
                  country:          { type: "string", minLength: 2, maxLength: 2, example: "DE" },
                  city:             { type: "string" },
                  role:             { type: "string", enum: ["SELLER", "BUYER"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Registrierung erfolgreich" },
          "409": { description: "E-Mail bereits vergeben" },
          "422": { description: "Validierungsfehler" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Einloggen — gibt JWT Access + Refresh Token zurück",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email:    { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login erfolgreich — accessToken + refreshToken" },
          "401": { description: "Ungültige Zugangsdaten" },
        },
      },
    },
    "/orders": {
      post: {
        summary: "Kaufs- oder Verkaufsauftrag erteilen",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId", "productId", "direction", "pricePerUnit", "quantityTons", "idempotencyKey"],
                properties: {
                  sessionId:      { type: "string", format: "uuid" },
                  productId:      { type: "string", format: "uuid" },
                  direction:      { type: "string", enum: ["BUY", "SELL"] },
                  pricePerUnit:   { type: "number", minimum: 0, example: 545.00 },
                  quantityTons:   { type: "number", minimum: 0, example: 100 },
                  currency:       { type: "string", enum: ["EUR", "PLN", "USD"], default: "EUR" },
                  idempotencyKey: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Auftrag erteilt" },
          "401": { description: "Nicht autorisiert" },
          "409": { description: "Session nicht aktiv" },
        },
      },
      get: {
        summary: "Eigene Aufträge abrufen",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "sessionId", in: "query", schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Liste eigener Aufträge" },
        },
      },
    },
    "/orderbook": {
      get: {
        summary: "Aktuelles Auftragsbuch (Snapshot)",
        tags: ["Orderbook"],
        parameters: [
          { name: "sessionId", in: "query", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Asks, Bids und letzte Abschlüsse" },
        },
      },
    },
    "/orderbook/stream": {
      get: {
        summary: "Live Orderbook via Server-Sent Events",
        tags: ["Orderbook"],
        parameters: [
          { name: "sessionId", in: "query", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "SSE Stream — orderbook Events alle 1,5s" },
        },
      },
    },
    "/sessions/active": {
      get: {
        summary: "Aktive Handelssitzung abrufen",
        tags: ["Sessions"],
        responses: {
          "200": { description: "Aktive Session mit Produktinfo oder null" },
        },
      },
    },
  },
  tags: [
    { name: "Auth",      description: "Registrierung und Authentifizierung" },
    { name: "Orders",    description: "Auftragserteilung und -verwaltung" },
    { name: "Orderbook", description: "Live Auftragsbuch" },
    { name: "Sessions",  description: "Handelssitzungen" },
  ],
};

export default function AdminApiDocsPage() {
  return (
    <div style={{ margin: "-20px -24px" }}>
      <SwaggerUI spec={SPEC} docExpansion="list" defaultModelsExpandDepth={-1} />
    </div>
  );
}
