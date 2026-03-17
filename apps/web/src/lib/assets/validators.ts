/**
 * EUCX Asset-Validatoren — Deep Validation für physische Commodities
 *
 * Jede Warengruppe hat eigene Pflichtfelder und Grenzwerte.
 * Diese Validatoren laufen ZWEIMAL:
 *   1. Bei Einlieferung: prüft ob Attribute vollständig sind
 *   2. Bei Verifikation: prüft ob Werte in erlaubten Bereichen liegen
 *
 * Pflichtdokumente je Kategorie:
 *   METALS:       CoA + Wiegeschein, optional LME-Warrant wenn registriert
 *   SCRAP:        CoA + Wiegeschein
 *   AGRICULTURE:  CoA + Herkunftsnachweis, optional Phytosanitar
 *   TIMBER:       Herkunftsnachweis + Qualitätsprüfung
 *   CHEMICALS:    CoA + Zollanmeldung
 *   ENERGY:       Qualitätsprüfung
 *   CONSTRUCTION: CoA + Wiegeschein
 *   INDUSTRIALS:  CoA
 */

import { z } from "zod";

// ─── Metalle (Kupfer, Aluminium, Stahl, Rebar, etc.) ─────────────────────────

export const metalAttributesSchema = z.object({
  // Reinheitsgrad: 0–100%, maximal 3 Nachkommastellen (z.B. 99.995 für Kathoden)
  purityPct: z
    .number()
    .min(50, "Reinheitsgrad muss ≥ 50% sein")
    .max(100)
    .refine((v) => Number(v.toFixed(3)) === v, "Max. 3 Nachkommastellen"),

  // Güte / Grade: z.B. "CU-CATH-1", "BSt500S", "AA1100"
  grade: z.string().min(2).max(50),

  // Norm: z.B. "EN 10080", "ASTM B115", "LME Grade A"
  standard: z.string().min(2).max(100),

  // LME-Registrierung (wichtig für Preisfeststellung)
  lmeRegistered:    z.boolean().default(false),
  lmeWarrantNumber: z.string().max(50).optional(),

  // Gewichtstoleranz in Prozent (Branche: ≤ 0,5%)
  weightTolerancePct: z.number().min(0).max(5).optional(),

  // Geometrie (optional, je nach Produkt)
  diameterMm: z.number().min(4).max(1500).optional(),
  lengthMm:   z.number().positive().optional(),
  thicknessMm: z.number().positive().optional(),
}).refine(
  (d) => !d.lmeRegistered || !!d.lmeWarrantNumber,
  { message: "LME-Warrant-Nummer erforderlich wenn LME-registriert", path: ["lmeWarrantNumber"] }
);

// ─── Landwirtschaft (Getreide, Hülsenfrüchte, Ölsaaten, etc.) ────────────────

export const agricultureAttributesSchema = z.object({
  // Feuchtigkeitsgehalt — Qualitätskriterium #1
  // Weizen: max 14%, Mais: max 14%, Raps: max 9%
  moistureContentPct: z
    .number()
    .min(0)
    .max(30, "Feuchtigkeitsgehalt > 30% — Ware nicht handelbar")
    .refine((v) => Number(v.toFixed(1)) === v, "Max. 1 Nachkommastelle"),

  // Proteingehalt (pflanzliche Nahrungsmittel)
  proteinContentPct: z.number().min(0).max(50).optional(),

  // Erntejahr — Ware älter als 2 Jahre in der Regel nicht handelbar
  harvestYear: z
    .number()
    .int()
    .min(2020, "Erntejahr zu alt")
    .max(new Date().getFullYear() + 1, "Erntejahr in der Zukunft"),

  // Fallzahl (Backqualität Weizen, Roggen)
  fallingNumberSec: z.number().min(60).max(500).optional(),

  // Gluten (Weizen)
  glutenPct: z.number().min(0).max(50).optional(),

  // Hektolitergewicht (Dichte, kg/hl)
  specificWeightKgPerHl: z.number().min(60).max(90).optional(),

  // Ursprungshof / Betrieb
  originFarm: z.string().max(200).optional(),

  // EU-Öko-Zertifikat
  isOrganic: z.boolean().default(false),
});

// ─── Energie (Strom, Gas, Kohle, Biomasse) ───────────────────────────────────

export const energyAttributesSchema = z.object({
  // Lieferzeitraum — Pflicht für alle Energieprodukte
  deliveryStart: z.string().datetime({ message: "ISO 8601 Datum erforderlich" }),
  deliveryEnd:   z.string().datetime({ message: "ISO 8601 Datum erforderlich" }),

  // Einspeisepunkt / Lieferzone
  feedInPoint: z
    .string()
    .min(2)
    .max(100)
    .describe("z.B. 'DE-HH-GRID-01', 'GASPOOL', 'NCG', 'TTF'"),

  // Strom: Leistung in MW
  powerMw: z.number().positive().optional(),

  // Kohle/Biomasse: Heizwert
  calorificValueMjPerKg: z.number().positive().optional(),

  // Kohle: Aschegehalt
  ashContentPct: z.number().min(0).max(50).optional(),

  // Kohle: Schwefelgehalt (Umwelt-Compliance)
  sulfurPct: z.number().min(0).max(10).optional(),

  // Gas: Brennwert (kWh/m³)
  grossCalorificValueKwhPerM3: z.number().positive().optional(),
}).refine(
  (d) => new Date(d.deliveryStart) < new Date(d.deliveryEnd),
  { message: "deliveryStart muss vor deliveryEnd liegen", path: ["deliveryEnd"] }
).refine(
  (d) => new Date(d.deliveryStart) >= new Date(new Date().toDateString()),
  { message: "Lieferzeitraum darf nicht in der Vergangenheit liegen", path: ["deliveryStart"] }
);

// ─── Schrott (Metall-Schrott, Shredderschrott, etc.) ─────────────────────────

export const scrapAttributesSchema = z.object({
  // Schrottsorte nach ISRI-Code oder EN-Norm
  scrapGrade:      z.string().min(1).max(50),       // z.B. "HMS 1&2", "Zorba", "Twitch"
  contaminationPct: z.number().min(0).max(30),       // Verunreinigungen
  ironContentPct:  z.number().min(0).max(100).optional(),
  // Radioaktivitätsmessung (Pflicht bei Schrotthandel)
  radiologyCleared: z.boolean(),
  radiologyCertNumber: z.string().optional(),
}).refine(
  (d) => !d.radiologyCleared || !!d.radiologyCertNumber,
  { message: "Radiologie-Zertifikat-Nummer erforderlich wenn freigegeben", path: ["radiologyCertNumber"] }
);

// ─── Holz/Timber ─────────────────────────────────────────────────────────────

export const timberAttributesSchema = z.object({
  woodSpecies:    z.string().min(2).max(100),       // z.B. "Fichte", "Eiche", "Pine"
  dryingMethod:   z.enum(["AIR_DRIED", "KILN_DRIED", "FRESH"]),
  moisturePct:    z.number().min(0).max(80),
  gradeClass:     z.string().max(20).optional(),    // z.B. "C24", "C16"
  // FSC- oder PEFC-Zertifizierung (Nachhaltigkeit)
  sustainabilityCert: z.enum(["FSC", "PEFC", "NONE"]).default("NONE"),
  certNumber:     z.string().optional(),
});

// ─── Chemikalien ─────────────────────────────────────────────────────────────

export const chemicalsAttributesSchema = z.object({
  casNumber:      z.string().regex(/^\d{2,7}-\d{2}-\d$/, "Ungültige CAS-Nummer"),
  purityPct:      z.number().min(0).max(100),
  // UN-Gefahrgut-Nummer
  unNumber:       z.string().regex(/^UN\d{4}$/).optional(),
  hazardClass:    z.string().max(20).optional(),    // z.B. "Class 3", "Class 8"
  flashPointC:    z.number().optional(),            // Flammpunkt
});

// ─── Discriminated Union — alle Kategorien ────────────────────────────────────

export const categoryAttributesSchema = z.discriminatedUnion("categorySlug", [
  z.object({ categorySlug: z.literal("METALS"),       attributes: metalAttributesSchema }),
  z.object({ categorySlug: z.literal("SCRAP"),        attributes: scrapAttributesSchema }),
  z.object({ categorySlug: z.literal("AGRICULTURE"),  attributes: agricultureAttributesSchema }),
  z.object({ categorySlug: z.literal("TIMBER"),       attributes: timberAttributesSchema }),
  z.object({ categorySlug: z.literal("CHEMICALS"),    attributes: chemicalsAttributesSchema }),
  z.object({ categorySlug: z.literal("ENERGY"),       attributes: energyAttributesSchema }),
  z.object({ categorySlug: z.literal("CONSTRUCTION"), attributes: metalAttributesSchema }),   // Stahl
  z.object({ categorySlug: z.literal("INDUSTRIALS"),  attributes: z.record(z.string(), z.unknown()) }),  // flexibel
]);

// ─── Pflichtdokumente je Kategorie ───────────────────────────────────────────

import type { DocumentType } from "@prisma/client";

export const REQUIRED_DOCS_PER_CATEGORY: Record<string, DocumentType[]> = {
  METALS:       ["CERTIFICATE_OF_ANALYSIS", "WEIGHT_CERTIFICATE"],
  SCRAP:        ["CERTIFICATE_OF_ANALYSIS", "WEIGHT_CERTIFICATE"],
  AGRICULTURE:  ["CERTIFICATE_OF_ANALYSIS", "CERTIFICATE_OF_ORIGIN"],
  TIMBER:       ["CERTIFICATE_OF_ORIGIN",   "QUALITY_INSPECTION"],
  CHEMICALS:    ["CERTIFICATE_OF_ANALYSIS", "CUSTOMS_DECLARATION"],
  ENERGY:       ["QUALITY_INSPECTION"],
  CONSTRUCTION: ["CERTIFICATE_OF_ANALYSIS", "WEIGHT_CERTIFICATE"],
  INDUSTRIALS:  ["CERTIFICATE_OF_ANALYSIS"],
};

/**
 * Prüft ob für eine gegebene Kategorie + Attribute ein LME-Warrant
 * zusätzlich als Pflichtdokument gilt.
 */
export function requiresLmeWarrant(categorySlug: string, attributes: Record<string, unknown>): boolean {
  return (
    (categorySlug === "METALS" || categorySlug === "CONSTRUCTION") &&
    attributes["lmeRegistered"] === true
  );
}

/**
 * Validiert Kategorie-Attribute mit dem passenden Zod-Schema.
 * Gibt null zurück wenn kein spezifisches Schema existiert (INDUSTRIALS).
 */
export function validateCategoryAttributes(
  categorySlug: string,
  attributes: unknown
): { success: true } | { success: false; errors: Record<string, string[]> } {
  const schemaMap: Record<string, z.ZodType> = {
    METALS:       metalAttributesSchema,
    SCRAP:        scrapAttributesSchema,
    AGRICULTURE:  agricultureAttributesSchema,
    TIMBER:       timberAttributesSchema,
    CHEMICALS:    chemicalsAttributesSchema,
    ENERGY:       energyAttributesSchema,
    CONSTRUCTION: metalAttributesSchema,
  };

  const schema = schemaMap[categorySlug];
  if (!schema) return { success: true };

  const result = schema.safeParse(attributes);
  if (result.success) return { success: true };

  return {
    success: false,
    errors:  result.error.flatten().fieldErrors as Record<string, string[]>,
  };
}

// Typen
export type MetalAttributes       = z.infer<typeof metalAttributesSchema>;
export type AgricultureAttributes = z.infer<typeof agricultureAttributesSchema>;
export type EnergyAttributes      = z.infer<typeof energyAttributesSchema>;
export type ScrapAttributes       = z.infer<typeof scrapAttributesSchema>;
export type TimberAttributes      = z.infer<typeof timberAttributesSchema>;
export type ChemicalsAttributes   = z.infer<typeof chemicalsAttributesSchema>;
