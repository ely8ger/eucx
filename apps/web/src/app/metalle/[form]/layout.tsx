import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ form: string }> }): Promise<Metadata> {
  const { form } = await params;
  return {
    alternates: {
      canonical: `https://eucx.eu/metalle/${form}`,
      languages: {
        "de-DE": `https://eucx.eu/metalle/${form}`,
        "x-default": `https://eucx.eu/metalle/${form}`,
      },
    },
  };
}

export default function MetalleFormLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
