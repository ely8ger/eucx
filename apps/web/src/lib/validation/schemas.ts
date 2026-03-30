import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  totpCode: z.string().length(6).optional(),
});

export const registerSchema = z.object({
  email:            z.string().email("Ungültige E-Mail-Adresse"),
  password:         z.string()
    .min(10, "Mindestens 10 Zeichen")
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe")
    .regex(/[0-9]/, "Mindestens eine Zahl")
    .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen"),
  organizationName: z.string().min(2).max(100),
  taxId:            z.string().min(5).max(30),
  lei:              z.string().length(20, "LEI muss genau 20 Zeichen lang sein").regex(/^[A-Z0-9]{20}$/, "Ungültiges LEI-Format"),
  country:          z.string().length(2, "2-Buchstaben Ländercode (z.B. DE, PL)"),
  city:             z.string().min(2).max(100),
  street:           z.string().min(2).max(200).optional(),
  postalCode:       z.string().max(10).optional(),
  phone:            z.string().min(5).max(30).optional(),
  hrb:              z.string().max(50).optional(),
  legalForm:        z.string().max(100).optional(),
  foundedAt:        z.string().optional(),
  naceCode:         z.string().max(10).optional(),
  role:             z.enum(["SELLER", "BUYER"]),
});

// ─── Warengruppen ─────────────────────────────────────────────────────────────

export const COMMODITY_CATEGORIES = [
  "METALS",
  "SCRAP",
  "TIMBER",
  "AGRICULTURE",
  "CHEMICALS",
  "ENERGY",
  "CONSTRUCTION",
  "INDUSTRIALS",
] as const;

export const COMMODITY_UNITS = ["TON", "KG", "CBM", "LITER", "PIECE", "SQM"] as const;

export const CURRENCIES = ["EUR", "PLN", "USD", "GBP", "CZK"] as const;

// ─── Produkt (universell) ─────────────────────────────────────────────────────

export const productSchema = z.object({
  category:         z.enum(COMMODITY_CATEGORIES),
  subcategory:      z.string().min(1).max(100),
  name:             z.string().min(2).max(200),
  description:      z.string().max(2000).optional(),
  unit:             z.enum(COMMODITY_UNITS).default("TON"),
  quantity:         z.number().positive().max(10_000_000, "Menge zu groß"),
  minLotQuantity:   z.number().positive().default(1.0),
  originCountry:    z.string().length(2),
  warehouseLocation: z.string().min(2).max(200),
  hasCertificate:   z.boolean().default(false),
  certificateNumber: z.string().optional(),
  specifications:   z.record(z.string(), z.unknown()).optional(), // freie Felder je Kategorie
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const submitOrderSchema = z.object({
  sessionId:      z.string().uuid(),
  productId:      z.string().uuid(),
  direction:      z.enum(["BUY", "SELL"]),
  pricePerUnit:   z.number().positive().multipleOf(0.01),
  currency:       z.enum(CURRENCIES).default("EUR"),
  quantity:       z.number().positive().multipleOf(0.001),
  idempotencyKey: z.string().uuid("Idempotency-Key muss eine UUID sein"),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason:  z.string().max(500).optional(),
});

// ─── Abgeleitete Typen ────────────────────────────────────────────────────────

export type LoginInput       = z.infer<typeof loginSchema>;
export type RegisterInput    = z.infer<typeof registerSchema>;
export type ProductInput     = z.infer<typeof productSchema>;
export type SubmitOrderInput = z.infer<typeof submitOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
