import { headers } from "next/headers";

interface Props {
  data: Record<string, unknown>;
}

/**
 * Server Component für JSON-LD Structured Data.
 * Liest den CSP-Nonce aus dem Request-Header und setzt ihn automatisch.
 * Escaped </script> im JSON um HTML-Parser-Breaks zu verhindern.
 */
export async function JsonLd({ data }: Props) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const safe  = JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
