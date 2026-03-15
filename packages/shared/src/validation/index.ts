/**
 * @eucx/shared — Kategorie-spezifische Zod-Validierung
 *
 * Jede Warengruppe hat eigene Pflichtfelder und physikalische Grenzen.
 * Prinzip: "Parse, don't validate" — falscher Input wird abgelehnt bevor er die DB erreicht.
 */

import { z } from "zod";

// ─── Basis-Typen ──────────────────────────────────────────────────────────────

/** Dezimalzahl als String — schützt vor Float-Rundungsfehlern (0.1 + 0.2 ≠ 0.3) */
const decimalStr = (label: string) =>
  z.string()
    .regex(/^\d{1,15}(\.\d{1,8})?$/, `${label}: Format z.B. "100.500"`)
    .refine((v) => parseFloat(v) > 0, `${label} muss > 0 sein`);

const countryCode = z.string().length(2).toUpperCase();
const currency    = z.enum(["EUR", "PLN", "USD", "GBP", "CZK", "CHF"]);
const orderType   = z.enum(["LIMIT", "MARKET"]);

// ─── Kategorie-Attribute: METALLE ─────────────────────────────────────────────
// Pflicht: grade, standard
// Physikalische Grenzen: DIN 488, EN 10080

export const metalAttributesSchema = z.object({
  grade:    z.string().min(1).max(50),    // "BSt 500S", "B500B", "A615 Gr.60"
  standard: z.enum(["EN_10080", "ASTM_A615", "GOST_5781", "DIN_488", "BS_4449"]),

  diameterMm:   z.number().min(4).max(100).multipleOf(0.5).optional(),
  lengthMm:     z.number().min(500).max(24_000).optional(),
  thicknessMm:  z.number().min(0.3).max(500).optional(),
  widthMm:      z.number().min(10).max(5_000).optional(),

  carbonPct:    z.number().min(0).max(2.0).optional(),
  manganesePct: z.number().min(0).max(2.5).optional(),

  yieldStrengthMpa:   z.number().min(200).max(2_000).optional(),
  tensileStrengthMpa: z.number().min(300).max(3_000).optional(),
  elongationPct:      z.number().min(0).max(50).optional(),

  // Pflicht für Börsenhandel
  certificateRequired: z.literal(true).default(true),
});

// ─── Kategorie-Attribute: AGRAR ───────────────────────────────────────────────
// Pflicht: harvestYear, moistureContent

export const agricultureAttributesSchema = z.object({
  harvestYear:      z.number()
    .int()
    .min(2000)
    .max(new Date().getFullYear() + 1, "Erntejahr darf nicht in der Zukunft liegen"),
  moistureContent:  z.number().min(0).max(100, "Feuchtigkeitsgehalt 0–100%"),
  proteinContent:   z.number().min(0).max(50).optional(),
  glutenContent:    z.number().min(0).max(60).optional(),
  ashContent:       z.number().min(0).max(5).optional(),
  pesticidesFreePpm: z.number().min(0).optional(),
  organicCertified: z.boolean().default(false),
  storageType:      z.enum(["SILO", "WAREHOUSE", "REFRIGERATED", "OPEN"]).optional(),
});

// ─── Kategorie-Attribute: ENERGIE ────────────────────────────────────────────
// Pflicht: calorificValueMj (Heizwert)

export const energyAttributesSchema = z.object({
  calorificValueMj:   z.number()
    .min(5,  "Heizwert min. 5 MJ/kg")
    .max(35, "Heizwert max. 35 MJ/kg"),
  ashContentPct:      z.number().min(0).max(50).optional(),
  sulfurPct:          z.number().min(0).max(5).optional(),
  moisturePct:        z.number().min(0).max(60).optional(),
  volatilesContentPct: z.number().min(0).max(100).optional(),
  energyType:         z.enum(["COAL", "COKE", "PELLETS", "BRIQUETTES", "BIOMASS"]),
});

// ─── Kategorie-Attribute: HOLZ ────────────────────────────────────────────────

export const timberAttributesSchema = z.object({
  woodSpecies:  z.string().min(1).max(100),   // "Fichte", "Oak", "Pine"
  qualityClass: z.enum(["A", "B", "C", "INDUSTRIAL"]),
  dryingMethod: z.enum(["AIR_DRIED", "KILN_DRIED", "GREEN"]),
  moisturePct:  z.number().min(0).max(80),
  lengthMm:     z.number().min(100).max(30_000).optional(),
  diameterCm:   z.number().min(5).max(200).optional(),
});

// ─── Kategorie-Attribute: CHEMIE ──────────────────────────────────────────────

export const chemicalAttributesSchema = z.object({
  casNumber:   z.string().regex(/^\d{2,7}-\d{2}-\d$/, "Ungültige CAS-Nummer"),
  purity:      z.number().min(0).max(100, "Reinheit 0–100%"),
  phValue:     z.number().min(0).max(14).optional(),
  flashPointC: z.number().optional(),
  reachCompliant: z.boolean(),
  ghsHazardClass: z.string().max(50).optional(),
});

// ─── Discriminated Union: Attribute je Kategorie ─────────────────────────────
// TypeScript weiß bei category="METALS" dass attributes.grade Pflicht ist.

export const categoryAttributesSchema = z.discriminatedUnion("category", [
  z.object({ category: z.literal("METALS"),       attributes: metalAttributesSchema }),
  z.object({ category: z.literal("AGRICULTURE"),  attributes: agricultureAttributesSchema }),
  z.object({ category: z.literal("ENERGY"),       attributes: energyAttributesSchema }),
  z.object({ category: z.literal("TIMBER"),       attributes: timberAttributesSchema }),
  z.object({ category: z.literal("CHEMICALS"),    attributes: chemicalAttributesSchema }),
  z.object({ category: z.literal("SCRAP"),        attributes: z.record(z.string(), z.unknown()) }),
  z.object({ category: z.literal("CONSTRUCTION"), attributes: z.record(z.string(), z.unknown()) }),
  z.object({ category: z.literal("INDUSTRIALS"),  attributes: z.record(z.string(), z.unknown()) }),
]);

// ─── Produkt-Schema (vollständig) ────────────────────────────────────────────

const productBase = z.object({
  sku:               z.string().min(3).max(50).regex(/^[A-Z0-9-]+$/, "SKU: nur Großbuchstaben, Zahlen, Bindestrich"),
  name:              z.string().min(2).max(200),
  description:       z.string().max(2000).optional(),
  unit:              z.enum(["TON", "KG", "CBM", "LITER", "PIECE", "SQM", "MWH"]),
  quantity:          decimalStr("Menge"),
  minLotQuantity:    decimalStr("Mindestabnahme"),
  originCountry:     countryCode,
  warehouseLocation: z.string().min(2).max(200),
  hasCertificate:    z.boolean().default(false),
  certificateNumber: z.string().min(3).max(50).optional(),
  categoryId:        z.string().uuid(),
});

export const createProductSchema = productBase.and(categoryAttributesSchema);

// ─── Order-Schema ─────────────────────────────────────────────────────────────

export const submitOrderSchema = z.object({
  sessionId:      z.string().uuid(),
  productId:      z.string().uuid(),
  direction:      z.enum(["BUY", "SELL"]),
  orderType:      orderType.default("LIMIT"),
  pricePerUnit:   decimalStr("Preis"),   // String, NIEMALS float
  currency:       currency.default("EUR"),
  quantity:       decimalStr("Menge"),
  idempotencyKey: z.string().uuid("Muss UUID sein"),
  expiresAt:      z.string().datetime().optional(),
})
.refine(
  (d) => d.orderType === "MARKET" || d.pricePerUnit !== undefined,
  "LIMIT-Order braucht einen Preis",
);

// ─── Auth-Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().length(6).optional(),
});

export const registerSchema = z.object({
  email:            z.string().email(),
  password:         z.string().min(10)
    .regex(/[A-Z]/, "Großbuchstabe fehlt")
    .regex(/[0-9]/, "Zahl fehlt")
    .regex(/[^A-Za-z0-9]/, "Sonderzeichen fehlt"),
  organizationName: z.string().min(2).max(100),
  taxId:            z.string().min(5).max(30),
  country:          countryCode,
  city:             z.string().min(2).max(100),
  role:             z.enum(["SELLER", "BUYER"]),
});

// ─── Typen ────────────────────────────────────────────────────────────────────

export type MetalAttributes       = z.infer<typeof metalAttributesSchema>;
export type AgricultureAttributes = z.infer<typeof agricultureAttributesSchema>;
export type EnergyAttributes      = z.infer<typeof energyAttributesSchema>;
export type TimberAttributes      = z.infer<typeof timberAttributesSchema>;
export type ChemicalAttributes    = z.infer<typeof chemicalAttributesSchema>;
export type CreateProductInput    = z.infer<typeof createProductSchema>;
export type SubmitOrderInput      = z.infer<typeof submitOrderSchema>;
export type LoginInput            = z.infer<typeof loginSchema>;
export type RegisterInput         = z.infer<typeof registerSchema>;
