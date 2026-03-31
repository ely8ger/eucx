/**
 * GET /api/enrich-company?vat=DE321281763&country=DE
 *
 * Reichert eine validierte USt-IdNr. mit Firmendaten an:
 * - OpenCorporates: Name, Adresse, HRB, Rechtsform, Gründungsdatum
 * - GLEIF: LEI, Rechtsform
 * - BZSt eVatR (falls EUCX_VAT_ID gesetzt): Name + Adresse direkt vom BZSt
 *
 * Wird nach erfolgreicher VIES-Prüfung aufgerufen.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CompanyEnrichment {
  name?:       string | null;
  street?:     string | null;
  postalCode?: string | null;
  city?:       string | null;
  hrb?:        string | null;
  legalForm?:  string | null;
  foundedAt?:  string | null;
  lei?:        string | null;
  naceCode?:   string | null;
}

// ── BZSt eVatR ────────────────────────────────────────────────────────────────
async function queryBzst(vatFull: string): Promise<CompanyEnrichment | null> {
  const ownId = process.env.EUCX_VAT_ID;
  if (!ownId) return null;
  try {
    const url = `https://evatr.bff-online.de/evatrRPC?UstId_1=${encodeURIComponent(ownId)}&UstId_2=${encodeURIComponent(vatFull)}`;
    const res  = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const xml    = await res.text();
    const values = [...xml.matchAll(/<string>([^<]*)<\/string>/g)].map((m) => m[1] ?? "");
    const code   = values[2] ?? "";
    if (code !== "200") return null;
    const name   = values[3] && values[3] !== "---" ? values[3] : null;
    const city   = values[4] && values[4] !== "---" ? values[4] : null;
    const plz    = values[5] && values[5] !== "---" ? values[5] : null;
    const street = values[6] && values[6] !== "---" ? values[6] : null;
    if (!name && !street) return null;
    return { name, street, postalCode: plz, city };
  } catch { return null; }
}

// ── OpenCorporates ────────────────────────────────────────────────────────────
async function queryOpenCorporates(vatNumber: string, country: string): Promise<CompanyEnrichment | null> {
  try {
    // Zuerst direkt nach Steuer-/Registernummer suchen
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(vatNumber)}&jurisdiction_code=${country.toLowerCase()}&per_page=3`;
    const res  = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json() as {
      results?: {
        companies?: Array<{
          company?: {
            name?:                string;
            company_number?:      string;
            company_type?:        string;
            incorporation_date?:  string;
            registered_address?:  { street_address?: string; postal_code?: string; locality?: string };
            industry_codes?:      Array<{ code?: string }>;
          }
        }>
      }
    };

    const co = data.results?.companies?.[0]?.company;
    if (!co) return null;

    return {
      name:       co.name             ?? null,
      hrb:        co.company_number   ?? null,
      legalForm:  co.company_type     ?? null,
      foundedAt:  co.incorporation_date ?? null,
      street:     co.registered_address?.street_address ?? null,
      postalCode: co.registered_address?.postal_code    ?? null,
      city:       co.registered_address?.locality       ?? null,
      naceCode:   co.industry_codes?.[0]?.code          ?? null,
    };
  } catch { return null; }
}

// ── GLEIF (nach Firmenname) ───────────────────────────────────────────────────
async function queryGleifByName(name: string): Promise<{ lei?: string; legalForm?: string } | null> {
  try {
    const url = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName.name]=${encodeURIComponent(name)}&page[size]=1`;
    const res  = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000), headers: { Accept: "application/vnd.api+json" } });
    if (!res.ok) return null;
    const data  = await res.json() as { data?: Array<{ attributes?: { lei?: string; entity?: { legalForm?: { id?: string } } } }> };
    const first = data.data?.[0];
    if (!first) return null;
    return { lei: first.attributes?.lei ?? undefined, legalForm: first.attributes?.entity?.legalForm?.id ?? undefined };
  } catch { return null; }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.toUpperCase().trim() ?? "DE";
  const vat     = searchParams.get("vat")?.replace(/\s/g, "").toUpperCase().trim();

  if (!vat) return NextResponse.json({ error: "vat fehlt" }, { status: 400 });

  // Länderpräfix ggf. abschneiden für OC-Suche
  const vatNumber = vat.startsWith(country) ? vat.slice(country.length) : vat;

  // Alle Quellen parallel
  const [bzst, oc] = await Promise.all([
    queryBzst(vat),
    queryOpenCorporates(vatNumber, country),
  ]);

  // Bestes Ergebnis zusammenführen (BZSt hat Vorrang für Name/Adresse)
  const merged: CompanyEnrichment = {};
  merged.name       = bzst?.name       ?? oc?.name       ?? null;
  merged.street     = bzst?.street     ?? oc?.street     ?? null;
  merged.postalCode = bzst?.postalCode ?? oc?.postalCode ?? null;
  merged.city       = bzst?.city       ?? oc?.city       ?? null;
  merged.hrb        = oc?.hrb          ?? null;
  merged.legalForm  = oc?.legalForm    ?? null;
  merged.foundedAt  = oc?.foundedAt    ?? null;
  merged.naceCode   = oc?.naceCode     ?? null;

  // GLEIF nach Firmenname (falls Name bekannt)
  if (merged.name) {
    const gleif = await queryGleifByName(merged.name);
    merged.lei       = gleif?.lei       ?? null;
    merged.legalForm = merged.legalForm ?? gleif?.legalForm ?? null;
  }

  return NextResponse.json(merged);
}
