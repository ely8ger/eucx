import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AKADEMIE_ARTIKEL } from "../../data";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export async function generateStaticParams() {
  return AKADEMIE_ARTIKEL.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AKADEMIE_ARTIKEL.find(x => x.slug === slug);
  if (!a) return {};
  return {
    title: `${a.title} | EUCX Händler-Akademie`,
    description: a.description,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://eucx.eu/insights/akademie/${slug}` },
  };
}

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

export default async function AkademieArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artikel = AKADEMIE_ARTIKEL.find(a => a.slug === slug);
  if (!artikel) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.title,
    description: artikel.description,
    datePublished: artikel.published,
    author: { "@type": "Organization", name: "EUCX", url: "https://eucx.eu" },
    publisher: { "@type": "Organization", name: "EUCX", url: "https://eucx.eu" },
  };

  const faqJsonLd = artikel.faq ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: artikel.faq.map(({ q, a }) => ({
      "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a }
    })),
  } : null;

  const toc = artikel.sections.flatMap(s => [
    { id: s.id, label: s.heading, level: 1 as const },
    ...(s.sub || []).map(sub => ({ id: sub.id, label: sub.heading, level: 2 as const }))
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>
        <SiteNav activeHref="/insights" />

        <div style={{ backgroundColor: "#0d1b2a", padding: "48px 24px 44px" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 16, letterSpacing: "0.06em" }}>
              <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
              <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>{" / "}
              <Link href="/insights/akademie" style={{ color: "#4a6fa1", textDecoration: "none" }}>Akademie</Link>
            </p>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#c8a46a", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 10, display: "block" }}>
              Händler-Akademie · Leitfaden · {artikel.readMin} min Lesezeit
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.2, maxWidth: 820 }}>{artikel.title}</h1>
            <p style={{ fontSize: 14, color: "#8aa8cc", maxWidth: 640, lineHeight: 1.7, margin: 0 }}>{artikel.description}</p>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 48, alignItems: "start" }}>

          <aside style={{ position: "sticky", top: 88 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#888", marginBottom: 14 }}>Inhalt</p>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {toc.map(item => (
                <a key={item.id} href={`#${item.id}`} style={{
                  fontSize: item.level === 1 ? 13 : 12,
                  fontWeight: item.level === 1 ? 600 : 400,
                  color: item.level === 1 ? "#3a3a3a" : "#888",
                  padding: item.level === 1 ? "7px 0" : "3px 0 3px 12px",
                  borderLeft: item.level === 2 ? "2px solid #e8e8e8" : "none",
                  textDecoration: "none", display: "block", lineHeight: 1.4,
                }}>
                  {item.label}
                </a>
              ))}
              {artikel.faq && (
                <a href="#faq" style={{ fontSize: 13, fontWeight: 600, color: "#3a3a3a", padding: "7px 0", textDecoration: "none", display: "block" }}>Häufige Fragen</a>
              )}
            </nav>
          </aside>

          <article style={{ minWidth: 0, maxWidth: 800 }}>
            {artikel.sections.map(section => (
              <section key={section.id} id={section.id} style={{ marginBottom: 52, scrollMarginTop: 100 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 16px", paddingBottom: 12, borderBottom: "2px solid #e8e8e8" }}>
                  {section.heading}
                </h2>
                {section.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontSize: 15, color: "#3a3a3a", lineHeight: 1.85, margin: "0 0 14px", whiteSpace: "pre-line" }}>{para}</p>
                ))}
                {section.sub?.map(sub => (
                  <div key={sub.id} id={sub.id} style={{ marginTop: 32, paddingLeft: 24, borderLeft: `3px solid ${BLUE}`, scrollMarginTop: 100 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: "0 0 10px" }}>{sub.heading}</h3>
                    {sub.body.split("\n\n").map((para, i) => (
                      <p key={i} style={{ fontSize: 14, color: "#505050", lineHeight: 1.85, margin: "0 0 10px", whiteSpace: "pre-line" }}>{para}</p>
                    ))}
                  </div>
                ))}
              </section>
            ))}
            {artikel.faq && (
              <section id="faq" style={{ marginBottom: 52, scrollMarginTop: 100 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 16px", paddingBottom: 12, borderBottom: "2px solid #e8e8e8" }}>Häufige Fragen</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e0e4ec" }}>
                  {artikel.faq.map(({ q, a }) => (
                    <div key={q} style={{ backgroundColor: "#fff", padding: "18px 22px" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 6px" }}>{q}</p>
                      <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.75, margin: 0 }}>{a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
