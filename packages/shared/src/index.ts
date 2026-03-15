/**
 * @eucx/shared — Zod-Validierungsschemas
 *
 * Einzige Source of Truth für alle Eingabe-Validierungen.
 * Wird von apps/web (Frontend) UND apps/api (Backend) genutzt.
 *
 * Pattern: "Parse, don't validate" — niemals rohe Eingaben ins System lassen.
 */

import { z } from "zod";

// ─── Konstanten ───────────────────────────────────────────────────────────────

export const COMMODITY_CATEGORIES = [
  "METALS", "SCRAP", "TIMBER", "AGRICULTURE",
  "CHEMICALS", "ENERGY", "CONSTRUCTION", "INDUSTRIALS",
] as const;

export const COMMODITY_UNITS = [
  "TON", "KG", "CBM", "LITER", "PIECE", "SQM",
] as const;

export const CURRENCIES = ["EUR", "PLN", "USD", "GBP", "CZK"] as const;

export const USER_ROLES = ["ADMIN", "SELLER", "BUYER", "BROKER", "OBSERVER"] as const;

export const STEEL_STANDARDS = [
  "EN_10080", "ASTM_A615", "GOST_5781", "DIN_488", "BS_4449",
] as const;

// ─── Hilfs-Schemas ────────────────────────────────────────────────────────────

/** Dezimalzahl als String — schützt vor Float-Rundungsfehlern */
const decimalString = (field: string) =>
  z.string()
    .regex(/^\d{1,12}(\.\d{1,6})?$/, `${field}: ungültiges Dezimalformat (z.B. "100.500")`)
    .refine((v) => parseFloat(v) > 0, `${field} muss positiv sein`);

/** Preis: max 12 Stellen, 2 Nachkommastellen */
const priceDecimal = z
  .string()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, "Preis: ungültiges Format (z.B. '850.00')")
  .refine((v) => parseFloat(v) > 0, "Preis muss größer als 0 sein")
  .refine((v) => parseFloat(v) < 100_000_000, "Preis überschreitet Maximum");

/** ISO 3166-1 alpha-2 Ländercode */
const countryCode = z
  .string()
  .length(2, "Ländercode muss 2 Buchstaben haben (z.B. DE, PL)")
  .toUpperCase();

// ─── Auth-Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Mindestens 8 Zeichen"),
  totpCode: z.string().length(6).optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(10, "Mindestens 10 Zeichen")
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe")
    .regex(/[0-9]/, "Mindestens eine Zahl")
    .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen"),
  organizationName: z.string().min(2).max(100),
  taxId:            z.string().min(5).max(30),
  country:          countryCode,
  city:             z.string().min(2).max(100),
  role:             z.enum(["SELLER", "BUYER"]),
});

// ─── Metall-spezifische Spezifikation ─────────────────────────────────────────
//
// Physikalische Grenzen aus DIN 488 / EN 10080:
// Bewehrungsstahl: Ø 6–40 mm, Länge 6.000–18.000 mm, Gewicht 0,222–9,865 kg/m

export const metalSpecSchema = z.object({
  grade:    z.string().min(1).max(50),        // z.B. "BSt 500S", "B500B"
  standard: z.enum(STEEL_STANDARDS),

  // Abmessungen (alle in mm)
  diameterMm: z
    .number()
    .positive()
    .min(4,  "Durchmesser min. 4 mm")
    .max(100, "Durchmesser max. 100 mm")
    .multipleOf(0.5, "Schritte: 0,5 mm")
    .optional(),

  lengthMm: z
    .number()
    .positive()
    .min(1_000,  "Länge min. 1.000 mm")
    .max(24_000, "Länge max. 24.000 m")
    .optional(),

  thicknessMm: z
    .number()
    .positive()
    .min(0.5, "Dicke min. 0,5 mm")
    .max(500,  "Dicke max. 500 mm")
    .optional(),

  widthMm: z
    .number()
    .positive()
    .min(10,   "Breite min. 10 mm")
    .max(5_000, "Breite max. 5.000 mm")
    .optional(),

  // Legierung (Gewichts-%)
  carbonPct: z.number().min(0).max(2.0).optional(),       // C ≤ 2,0%
  manganesePct: z.number().min(0).max(2.5).optional(),    // Mn ≤ 2,5%
  phosphorusPct: z.number().min(0).max(0.1).optional(),   // P ≤ 0,1%
  sulfurPct: z.number().min(0).max(0.1).optional(),       // S ≤ 0,1%

  // Mechanische Eigenschaften
  yieldStrengthMpa: z
    .number()
    .positive()
    .min(200,  "Re min. 200 MPa")
    .max(2_000, "Re max. 2.000 MPa")
    .optional(),

  tensileStrengthMpa: z
    .number()
    .positive()
    .min(300,  "Rm min. 300 MPa")
    .max(3_000, "Rm max. 3.000 MPa")
    .optional(),

  elongationPct: z.number().min(0).max(50).optional(),    // Bruchdehnung
});

// ─── Produkt-Schema (universell) ─────────────────────────────────────────────

export const productSchema = z.object({
  category:          z.enum(COMMODITY_CATEGORIES),
  subcategory:       z.string().min(1).max(100),
  name:              z.string().min(2).max(200),
  description:       z.string().max(2000).optional(),
  unit:              z.enum(COMMODITY_UNITS).default("TON"),

  // Menge als String → kein Float-Fehler
  quantity:          decimalString("Menge"),
  minLotQuantity:    decimalString("Mindestabnahme"),

  originCountry:     countryCode,
  warehouseLocation: z.string().min(2).max(200),

  hasCertificate:    z.boolean().default(false),
  certificateNumber: z.string().min(3).max(50).optional(),

  // Kategorie-spezifisch: bei METALS wird metalSpecSchema validiert
  specifications:    z.record(z.string(), z.unknown()).optional(),
});

/** Vollständiges Metall-Produkt mit Pflicht-Spezifikation */
export const metalProductSchema = productSchema.extend({
  category:       z.literal("METALS"),
  specifications: metalSpecSchema,
});

// ─── Order-Schema ─────────────────────────────────────────────────────────────

export const submitOrderSchema = z.object({
  sessionId:      z.string().uuid("Ungültige Session-ID"),
  productId:      z.string().uuid("Ungültige Produkt-ID"),
  direction:      z.enum(["BUY", "SELL"]),

  // Preis als String — NIEMALS float für Geld!
  pricePerUnit:   priceDecimal,
  currency:       z.enum(CURRENCIES).default("EUR"),

  // Menge mit 3 Nachkommastellen (Tonnen exakt)
  quantity:       decimalString("Menge"),

  // Idempotency-Key verhindert Doppel-Submissions
  idempotencyKey: z.string().uuid("Idempotency-Key muss UUID sein"),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason:  z.string().max(500).optional(),
});

// ─── Typen ────────────────────────────────────────────────────────────────────

export type LoginInput         = z.infer<typeof loginSchema>;
export type RegisterInput      = z.infer<typeof registerSchema>;
export type ProductInput       = z.infer<typeof productSchema>;
export type MetalProductInput  = z.infer<typeof metalProductSchema>;
export type MetalSpec          = z.infer<typeof metalSpecSchema>;
export type SubmitOrderInput   = z.infer<typeof submitOrderSchema>;
export type CancelOrderInput   = z.infer<typeof cancelOrderSchema>;
