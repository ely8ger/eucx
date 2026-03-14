import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  totpCode: z.string().length(6).optional(),
});

export const registerSchema = z.object({
  email:    z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(10, "Mindestens 10 Zeichen")
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe")
    .regex(/[0-9]/, "Mindestens eine Zahl")
    .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen"),
  organizationName: z.string().min(2).max(100),
  taxId:            z.string().min(5).max(30),
  country:          z.string().length(2, "2-Buchstaben Ländercode (z.B. DE, PL)"),
  city:             z.string().min(2).max(100),
  role:             z.enum(["SELLER", "BUYER"]),
});

// ─── Produkte ─────────────────────────────────────────────────────────────────

export const steelProductSchema = z.object({
  form: z.enum(["REBAR", "WIRE_ROD", "BEAM", "PIPE", "SHEET", "COIL"]),
  grade:             z.string().min(1).max(50),
  diameterMm:        z.number().positive().optional(),
  standard:          z.enum(["EN_10080", "ASTM_A615", "GOST_5781", "DIN_488", "BS_4449"]),
  quantityTons:      z.number().positive().max(100000),
  minLotTons:        z.number().positive().default(1.0),
  originCountry:     z.string().length(2),
  productionYear:    z.number().int().min(2000).max(2030),
  warehouseLocation: z.string().min(2).max(200),
  hasCertificate:    z.boolean().default(false),
  certificateNumber: z.string().optional(),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const submitOrderSchema = z.object({
  sessionId:      z.string().uuid(),
  productId:      z.string().uuid(),
  direction:      z.enum(["BUY", "SELL"]),
  pricePerUnit:   z.number().positive().multipleOf(0.01),
  currency:       z.enum(["EUR", "PLN", "USD"]).default("EUR"),
  quantityTons:   z.number().positive().multipleOf(0.001),
  idempotencyKey: z.string().uuid("Idempotency-Key muss eine UUID sein"),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason:  z.string().max(500).optional(),
});

// ─── Abgeleitete Typen ────────────────────────────────────────────────────────

export type LoginInput         = z.infer<typeof loginSchema>;
export type RegisterInput      = z.infer<typeof registerSchema>;
export type SteelProductInput  = z.infer<typeof steelProductSchema>;
export type SubmitOrderInput   = z.infer<typeof submitOrderSchema>;
export type CancelOrderInput   = z.infer<typeof cancelOrderSchema>;
