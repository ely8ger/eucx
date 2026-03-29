import { NextRequest, NextResponse } from "next/server";

interface OcAddress {
  street_address?: string;
  locality?:       string;
  postal_code?:    string;
}

interface OcCompany {
  name:                string;
  company_number?:     string;
  registered_address?: OcAddress;
}

interface OcResponse {
  results?: {
    companies?: Array<{ company: OcCompany }>;
  };
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hrb = searchParams.get("hrb")?.trim();

  if (!hrb) {
    return NextResponse.json({ found: false, error: "HRB-Nummer fehlt." }, { status: 400 });
  }

  // Nur Ziffern für die Suche verwenden
  const hrbDigits = hrb.replace(/[^0-9]/g, "");
  if (!hrbDigits) {
    return NextResponse.json({ found: false, error: "Ungültige HRB-Nummer." }, { status: 400 });
  }

  try {
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=HRB+${hrbDigits}&jurisdiction_code=de&per_page=5`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ found: false, error: "Handelsregister nicht erreichbar." }, { status: 503 });
    }

    const data = await res.json() as OcResponse;
    const list = data.results?.companies ?? [];

    if (list.length === 0) {
      return NextResponse.json({ found: false });
    }

    const first = list[0];
    if (!first) return NextResponse.json({ found: false });
    const co = first.company;
    const addr = co.registered_address;

    return NextResponse.json({
      found:      true,
      name:       co.name ?? null,
      street:     addr?.street_address ?? null,
      postalCode: addr?.postal_code    ?? null,
      city:       addr?.locality       ?? null,
    });
  } catch {
    return NextResponse.json({ found: false, error: "Verbindungsfehler." }, { status: 503 });
  }
}
