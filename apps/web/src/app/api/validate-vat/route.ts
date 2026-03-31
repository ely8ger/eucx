import { NextRequest, NextResponse } from "next/server";

// ── Typen ─────────────────────────────────────────────────────────────────────
interface ViesResponse {
  isValid?:       boolean;
  name?:          string;
  address?:       string;
  userError?:     string;
  errorWrappers?: { error: string }[];
}

interface SourceResult {
  valid:        boolean;
  unavailable?: boolean;
  name?:        string | null;
  address?:     string | null;
  source?:      string;
}

// VIES-Fehlercodes = Service-Ausfall, nicht ungültige Nummer
const VIES_UNAVAILABLE = new Set([
  "MS_UNAVAILABLE", "MS_MAX_CONCURRENT_REQ",
  "GLOBAL_MAX_CONCURRENT_REQ", "SERVICE_UNAVAILABLE",
  "SERVER_BUSY", "TIMEOUT",
]);

// BZSt-Fehlercodes = Service-Ausfall
const BZST_UNAVAILABLE = new Set(["213", "214", "215", "999"]);

// ── VIES ─────────────────────────────────────────────────────────────────────
async function queryVies(country: string, vatNumber: string): Promise<SourceResult> {
  try {
    const res = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vatNumber}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { valid: false, unavailable: true, source: "vies" };

    const data = await res.json() as ViesResponse;

    // userError-Feld prüfen (z.B. "MS_UNAVAILABLE" für Deutschland)
    if (data.userError && VIES_UNAVAILABLE.has(data.userError)) {
      return { valid: false, unavailable: true, source: "vies" };
    }
    if (data.errorWrappers?.length) {
      const unavailable = data.errorWrappers.some((e) => VIES_UNAVAILABLE.has(e.error));
      return { valid: false, unavailable, source: "vies" };
    }

    return {
      valid:       data.isValid ?? false,
      unavailable: false,
      name:        data.isValid && data.name    && data.name    !== "---" ? data.name    : null,
      address:     data.isValid && data.address && data.address !== "---" ? data.address : null,
      source:      "vies",
    };
  } catch {
    return { valid: false, unavailable: true, source: "vies" };
  }
}

// ── BZSt eVatR (nur DE) ───────────────────────────────────────────────────────
async function queryBzst(vatNumber: string): Promise<SourceResult> {
  // Eigene USt-IdNr. aus ENV — ohne diese kann BZSt nicht abgefragt werden
  const ownId = process.env.EUCX_VAT_ID;
  if (!ownId) return { valid: false, unavailable: true, source: "bzst" };

  try {
    const url = `https://evatr.bff-online.de/evatrRPC?UstId_1=${encodeURIComponent(ownId)}&UstId_2=${encodeURIComponent("DE" + vatNumber)}`;
    const res  = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { valid: false, unavailable: true, source: "bzst" };

    const xml    = await res.text();
    // XML-Werte extrahieren: [UstId_1, UstId_2, ErrorCode, Name, Ort, PLZ, Strasse, ...]
    const values = [...xml.matchAll(/<string>([^<]*)<\/string>/g)].map((m) => m[1] ?? "");
    const code   = values[2] ?? "";

    if (BZST_UNAVAILABLE.has(code)) return { valid: false, unavailable: true, source: "bzst" };

    if (code === "200") {
      const name   = values[3] && values[3] !== "---" ? values[3] : null;
      const city   = values[4] && values[4] !== "---" ? values[4] : null;
      const plz    = values[5] && values[5] !== "---" ? values[5] : null;
      const street = values[6] && values[6] !== "---" ? values[6] : null;
      const address = [street, plz && city ? `${plz} ${city}` : city].filter(Boolean).join("\n") || null;
      return { valid: true, name, address, source: "bzst" };
    }

    return { valid: false, unavailable: false, source: "bzst" };
  } catch {
    return { valid: false, unavailable: true, source: "bzst" };
  }
}

// ── GLEIF (LEI-Suche nach Firmenname) ─────────────────────────────────────────
async function queryGleif(companyName: string): Promise<{ lei?: string } | null> {
  try {
    const url = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName.name]=${encodeURIComponent(companyName)}&page[size]=1`;
    const res  = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000), headers: { Accept: "application/vnd.api+json" } });
    if (!res.ok) return null;
    const data = await res.json() as { data?: Array<{ attributes?: { lei?: string } }> };
    const lei  = data.data?.[0]?.attributes?.lei;
    return lei ? { lei } : null;
  } catch {
    return null;
  }
}

// ── OpenCorporates (HRB, Rechtsform, Gründungsdatum) ─────────────────────────
interface OcEnrichment {
  hrb?:       string;
  legalForm?: string;
  foundedAt?: string;
  naceCode?:  string;
}

async function queryOpenCorporates(companyName: string, country: string): Promise<OcEnrichment | null> {
  try {
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&jurisdiction_code=${country.toLowerCase()}&per_page=1`;
    const res  = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000), headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json() as { results?: { companies?: Array<{ company?: { company_number?: string; company_type?: string; incorporation_date?: string; industry_codes?: Array<{ code?: string }> } }> } };
    const co   = data.results?.companies?.[0]?.company;
    if (!co) return null;

    return {
      hrb:       co.company_number      ?? undefined,
      legalForm: co.company_type        ?? undefined,
      foundedAt: co.incorporation_date  ?? undefined,
      naceCode:  co.industry_codes?.[0]?.code ?? undefined,
    };
  } catch {
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.toUpperCase().trim();
  const raw     = searchParams.get("vat")?.replace(/\s/g, "").toUpperCase().trim();

  if (!country || !raw) {
    return NextResponse.json({ valid: false, error: "Parameter fehlen." }, { status: 400 });
  }

  // Länderpräfix ggf. abschneiden
  const vatNumber = raw.startsWith(country) ? raw.slice(country.length) : raw;

  // ── Parallele Abfragen ────────────────────────────────────────────────────
  const queries: Promise<SourceResult>[] = [queryVies(country, vatNumber)];
  if (country === "DE" && process.env.EUCX_VAT_ID) queries.push(queryBzst(vatNumber));

  const results = await Promise.all(queries);

  // Bestes Ergebnis: erstes "valid: true"
  const valid = results.find((r) => r.valid);
  if (valid) {
    // OC: zuerst nach VAT-Nummer suchen, dann nach Name (falls DE nichts gibt)
    const ocByVat  = await queryOpenCorporates(vatNumber, country);
    const ocByName = (!ocByVat?.name && valid.name)
      ? await queryOpenCorporates(valid.name, country)
      : null;
    const oc = ocByVat?.name ? ocByVat : (ocByName ?? ocByVat);

    // GLEIF nach bestem bekannten Namen
    const bestName = valid.name ?? oc?.name ?? null;
    const gleif    = bestName ? await queryGleif(bestName) : null;

    // Adresse: VIES → OC
    const addrParsed = valid.address ? parseAddress(valid.address) : {};

    return NextResponse.json({
      valid:     true,
      name:      valid.name ?? oc?.name ?? null,
      street:    addrParsed.street     ?? null,
      postalCode: addrParsed.postalCode ?? null,
      city:      addrParsed.city       ?? null,
      source:    valid.source,
      lei:       gleif?.lei    ?? null,
      hrb:       oc?.hrb       ?? null,
      legalForm: oc?.legalForm ?? null,
      foundedAt: oc?.foundedAt ?? null,
      naceCode:  oc?.naceCode  ?? null,
    });
  }

  // Alle ungültig — aber mindestens einer war nur nicht erreichbar?
  const anyUnavailable = results.some((r) => r.unavailable);
  if (anyUnavailable) {
    return NextResponse.json({ valid: false, unavailable: true });
  }

  // Alle Quellen eindeutig: Nummer ungültig
  return NextResponse.json({ valid: false, unavailable: false });
}
