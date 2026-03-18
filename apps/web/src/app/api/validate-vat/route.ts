import { NextRequest, NextResponse } from "next/server";

interface ViesResponse {
  isValid?:       boolean;
  name?:          string;
  address?:       string;
  errorWrappers?: { error: string }[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.toUpperCase().trim();
  const raw     = searchParams.get("vat")?.replace(/\s/g, "").toUpperCase().trim();

  if (!country || !raw) {
    return NextResponse.json({ valid: false, error: "Parameter fehlen." }, { status: 400 });
  }

  // Strip country prefix if user typed "DE123..." instead of "123..."
  const vatNumber = raw.startsWith(country) ? raw.slice(country.length) : raw;

  try {
    const res = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vatNumber}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ valid: false, name: null });
    }

    const data = await res.json() as ViesResponse;

    if (data.errorWrappers && data.errorWrappers.length > 0) {
      return NextResponse.json({ valid: false, name: null });
    }

    return NextResponse.json({
      valid:   data.isValid ?? false,
      name:    data.isValid && data.name && data.name !== "---" ? data.name : null,
      address: data.isValid && data.address && data.address !== "---" ? data.address : null,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "VIES-Dienst nicht erreichbar." }, { status: 503 });
  }
}
