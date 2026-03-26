import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LEXIKON } from "../../data";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PriceChart } from "../../components/PriceChart";

export async function generateStaticParams() {
  return LEXIKON.map(e => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = LEXIKON.find(e => e.slug === slug);
  if (!entry) return {};
  return {
    title: `${entry.term} — Definition, Preis, Normen | EUCX Lexikon`,
    description: entry.description,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://eucx.eu/insights/lexikon/${slug}` },
    openGraph: { title: entry.term, description: entry.shortDef, type: "article" },
  };
}

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

export default async function LexikonEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = LEXIKON.find(e => e.slug === slug);
  if (!entry) notFound();

  const relatedEntries = LEXIKON.filter(e => entry.related.includes(e.slug));

  const toc: { id: string; label: string; level: 1 | 2 }[] = [];
  for (const s of entry.sections) {
    toc.push({ id: s.id, label: s.heading, level: 1 });
    if (s.sub) for (const sub of s.sub) toc.push({ id: sub.id, label: sub.heading, level: 2 });
  }
  if (entry.faq?.length) toc.push({ id: "faq", label: "Häufige Fragen", level: 1 });

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.term,
    description: entry.shortDef,
    datePublished: entry.published,
    dateModified: entry.updated,
    author: { "@type": "Organization", name: "EUCX", url: "https://eucx.eu" },
    publisher: { "@type": "Organization", name: "EUCX", url: "https://eucx.eu" },
    url: `https://eucx.eu/insights/lexikon/${entry.slug}`,
  };

  const jsonLdFaq = entry.faq ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faq.map(({ q, a }) => ({
      "@type": "Question", name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}

      <div style={{ fontFamily: SANS, backgroundColor: "#fafafa", color: "#0d1b2a", minHeight: "100vh" }}>
        <SiteNav activeHref="/insights" />

        {/* Article Header */}
        <div className="r-detail-hero-wrap" style={{ backgroundColor: "#0d1b2a" }}>
          <div className="r-inner">
            <p style={{ fontSize: 11, color: "#4a6fa1", marginBottom: 16, letterSpacing: "0.06em" }}>
              <Link href="/" style={{ color: "#4a6fa1", textDecoration: "none" }}>EUCX</Link>{" / "}
              <Link href="/insights" style={{ color: "#4a6fa1", textDecoration: "none" }}>Insights</Link>{" / "}
              <Link href="/insights/lexikon" style={{ color: "#4a6fa1", textDecoration: "none" }}>Lexikon</Link>{" / "}
              <span style={{ color: "#7aa4d4" }}>{entry.term}</span>
            </p>
            <div className="r-detail-header-inner">
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#4a9fd4", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 10, display: "block" }}>
                  {entry.category} · Lexikon-Eintrag
                </span>
                <h1 className="r-detail-h1">
                  <strong style={{ fontWeight: 700 }}>{entry.term}</strong>
                </h1>
                <p style={{ fontSize: 15, color: "#8aa8cc", maxWidth: 580, lineHeight: 1.7, margin: 0 }}>{entry.shortDef}</p>
              </div>
              <div className="r-detail-meta" style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                {[
                  { label: "Lesezeit",    value: `${entry.readMin} min` },
                  { label: "Aktualisiert", value: new Date(entry.updated).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }) },
                  ...(entry.norm ? [{ label: "Norm", value: entry.norm }] : []),
                  ...(entry.unit ? [{ label: "Einheit", value: entry.unit }] : []),
                ].map(k => (
                  <div key={k.label} style={{ backgroundColor: "#162b46", padding: "10px 16px", minWidth: 200 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#4a6fa1", margin: "0 0 4px" }}>{k.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#c8d8ec", fontFamily: MONO, margin: 0 }}>{k.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="r-detail-grid r-inner" style={{ padding: "40px 24px" }}>

          {/* LEFT: Sticky TOC */}
          <aside className="r-detail-toc" style={{ position: "sticky", top: 88 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#888", marginBottom: 14 }}>Inhalt</p>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {toc.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  style={{
                    fontSize: item.level === 1 ? 13 : 12,
                    fontWeight: item.level === 1 ? 600 : 400,
                    color: item.level === 1 ? "#3a3a3a" : "#888",
                    paddingLeft: item.level === 2 ? 12 : 0,
                    padding: item.level === 1 ? "7px 0" : "3px 0 3px 12px",
                    borderLeft: item.level === 2 ? "2px solid #e8e8e8" : "none",
                    textDecoration: "none",
                    lineHeight: 1.4,
                    display: "block",
                  }}>
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* CENTER: Article */}
          <article style={{ minWidth: 0 }}>
            {entry.sections.map(section => (
              <section key={section.id} id={section.id} style={{ marginBottom: 52, scrollMarginTop: 100 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 16px", paddingBottom: 12, borderBottom: "2px solid #e8e8e8" }}>
                  {section.heading}
                </h2>
                {section.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontSize: 15, color: "#3a3a3a", lineHeight: 1.85, margin: "0 0 14px" }}>{para}</p>
                ))}
                {section.sub?.map(sub => (
                  <div key={sub.id} id={sub.id} style={{ marginTop: 32, paddingLeft: 22, borderLeft: `3px solid ${BLUE}`, scrollMarginTop: 100 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0d1b2a", margin: "0 0 10px" }}>{sub.heading}</h3>
                    {sub.body.split("\n\n").map((para, i) => (
                      <p key={i} style={{ fontSize: 14, color: "#505050", lineHeight: 1.85, margin: "0 0 10px", whiteSpace: "pre-line" }}>{para}</p>
                    ))}
                  </div>
                ))}
              </section>
            ))}

            {entry.faq && (
              <section id="faq" style={{ marginBottom: 52, scrollMarginTop: 100 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0d1b2a", margin: "0 0 16px", paddingBottom: 12, borderBottom: "2px solid #e8e8e8" }}>
                  Häufige Fragen
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#e0e4ec" }}>
                  {entry.faq.map(({ q, a }) => (
                    <div key={q} style={{ backgroundColor: "#fff", padding: "18px 22px" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", margin: "0 0 6px" }}>{q}</p>
                      <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.75, margin: 0 }}>{a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* RIGHT: Sidebar */}
          <aside className="r-detail-sidebar" style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 88 }}>
            {entry.hasPriceChart && entry.priceData && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", padding: "18px 20px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#888", margin: "0 0 4px" }}>Preisentwicklung</p>
                <p style={{ fontSize: 20, fontWeight: 300, color: "#0d1b2a", fontFamily: MONO, margin: "0 0 14px" }}>
                  {entry.priceData[entry.priceData.length - 1]?.price.toLocaleString("de-DE")} {entry.unit}
                </p>
                <PriceChart data={entry.priceData} unit={entry.unit} color={BLUE} />
                <p style={{ fontSize: 10, color: "#bbb", margin: "8px 0 0" }}>12 Monate · EUCX-Sitzungsabschlüsse</p>
              </div>
            )}

            {relatedEntries.length > 0 && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", padding: "18px 20px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#888", margin: "0 0 14px" }}>Verwandte Themen</p>
                {relatedEntries.map(rel => (
                  <Link key={rel.slug} href={`/insights/lexikon/${rel.slug}`}
                    style={{ display: "block", padding: "10px 0", borderBottom: "1px solid #f5f5f5", textDecoration: "none" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: "0 0 2px" }}>{rel.term}</p>
                    <p style={{ fontSize: 11, color: "#888", margin: 0, lineHeight: 1.5 }}>{rel.shortDef.slice(0, 72)}…</p>
                  </Link>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: "#0d1b2a", padding: "20px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#4a6fa1", margin: "0 0 10px" }}>Direkt handeln</p>
              <p style={{ fontSize: 13, color: "#8aa8cc", lineHeight: 1.6, margin: "0 0 14px" }}>Preise verfolgen und zu Börsenpreisen kaufen.</p>
              <Link href="/register" style={{
                display: "block", textAlign: "center", padding: "10px 0",
                backgroundColor: BLUE, color: "#fff", fontSize: 12, fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.04em",
              }}>
                Kostenlos registrieren →
              </Link>
            </div>
          </aside>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
