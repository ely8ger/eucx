import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GleifAddress {
  addressLines?: string[];
  city?:         string;
  postalCode?:   string;
  country?:      string;
}

interface GleifRecord {
  attributes?: {
    lei?: string;
    entity?: {
      legalName?:          { name?: string };
      legalAddress?:       GleifAddress;
      registeredAddress?:  GleifAddress;
      legalForm?:          { id?: string; other?: string };
      status?:             string;
      creationDate?:       string;
    };
  };
}

interface GleifResponse {
  data?: GleifRecord[];
}

function parseAddress(addr?: GleifAddress): { street?: string; postalCode?: string; city?: string } {
  if (!addr) return {};
  const street = addr.addressLines?.filter(Boolean).join(", ") ?? undefined;
  return { street, postalCode: addr.postalCode ?? undefined, city: addr.city ?? undefined };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lei = searchParams.get("lei")?.trim().toUpperCase();

  if (!lei || lei.length !== 20) {
    return NextResponse.json({ valid: false, error: "LEI muss 20 Zeichen lang sein." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.gleif.org/api/v1/lei-records/${lei}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000), headers: { Accept: "application/vnd.api+json" } }
    );

    if (res.status === 404) return NextResponse.json({ valid: false });
    if (!res.ok)            return NextResponse.json({ valid: false, unavailable: true });

    const data   = await res.json() as GleifResponse;
    const record = data.data?.[0] ?? (data as unknown as GleifRecord);
    const entity = (record as GleifRecord).attributes?.entity;

    if (!entity) return NextResponse.json({ valid: false });

    const isActive = entity.status === "ACTIVE";
    const addr     = parseAddress(entity.registeredAddress ?? entity.legalAddress);

    return NextResponse.json({
      valid:     isActive,
      inactive:  !isActive,
      name:      entity.legalName?.name ?? null,
      street:    addr.street     ?? null,
      postalCode: addr.postalCode ?? null,
      city:      addr.city       ?? null,
      legalForm: entity.legalForm?.other ?? null,
      foundedAt: entity.creationDate     ?? null,
    });
  } catch {
    return NextResponse.json({ valid: false, unavailable: true });
  }
}
