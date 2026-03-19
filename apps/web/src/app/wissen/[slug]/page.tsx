import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ARTICLES } from "../articles";
import { BASE_URL } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title:       article.title,
    description: article.description,
    robots:      { index: true, follow: true },
    openGraph: {
      type:     "article",
      title:    article.title,
      description: article.description,
      publishedTime: article.published,
      authors:  ["EUCX GmbH"],
      url:      `${BASE_URL}/wissen/${article.slug}`,
    },
    alternates: { canonical: `${BASE_URL}/wissen/${article.slug}` },
  };
}

const F     = "'IBM Plex Sans', Arial, sans-serif";
const BLUE  = "#154194";
const TEXT  = "#0d1b2a";
const MUTED = "#7a8aa0";
const BG    = "#f7f9fc";
const BORDER= "#d4d8e0";

const CATEGORY_COLORS: Record<string, string> = {
  "Markt":       "#154194",
  "Regulierung": "#b45309",
  "Produkte":    "#166534",
  "Praxis":      "#7c3aed",
  "Handel":      "#0e7490",
  "ESG":         "#047857",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const catColor = CATEGORY_COLORS[article.category] ?? BLUE;

  // Related articles (same category, excluding current)
  const related = ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);

  // JSON-LD Schema.org Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.published,
    "dateModified": article.published,
    "author": { "@type": "Organization", "name": "EUCX GmbH" },
    "publisher": {
      "@type": "Organization",
      "name": "EUCX - European Union Commodity Exchange",
      "url": BASE_URL,
    },
    "mainEntityOfPage": `${BASE_URL}/wissen/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ fontFamily: F, backgroundColor: BG, minHeight: "100vh" }}>

        {/* ── Artikel-Header ────────────────────────────────────────────── */}
        <div style={{ backgroundColor: BLUE, paddingTop: 48, paddingBottom: 48 }}>
          <div className="r-wissen-hero" style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontFamily: F, textDecoration: "none" }}>EUCX</Link>
              <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>/</span>
              <Link href="/wissen" style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontFamily: F, textDecoration: "none" }}>Wissen</Link>
              <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>/</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontFamily: F }}>{article.category}</span>
            </div>

            {/* Kategorie-Badge */}
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#fff", backgroundColor: catColor,
              padding: "3px 10px", display: "inline-block", marginBottom: 16,
            }}>
              {article.category}
            </span>

            <h1 style={{ fontSize: 28, fontWeight: 300, color: "#fff", fontFamily: F, margin: 0, lineHeight: 1.3 }}>
              {article.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: F }}>EUCX GmbH</span>
              <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>|</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: F }}>{formatDate(article.published)}</span>
              <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>|</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: F }}>{article.readMin} Min. Lesezeit</span>
            </div>
          </div>
        </div>

        {/* ── Artikel-Body ──────────────────────────────────────────────── */}
        <div className="r-wissen-body" style={{ maxWidth: 800, margin: "0 auto", padding: "48px 32px" }}>

          {/* Abstract */}
          <p style={{
            fontSize: 16, color: "#444", fontFamily: F, lineHeight: 1.7,
            marginBottom: 40,
            backgroundColor: "#fff",
            border: `1px solid ${BORDER}`, borderLeft: `3px solid ${BLUE}`,
            padding: "16px 20px",
          }}>
            {article.description}
          </p>

          {/* Inhaltsverzeichnis */}
          <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: MUTED, fontFamily: F, margin: "0 0 12px" }}>
              Inhaltsverzeichnis
            </p>
            <ol style={{ margin: 0, padding: "0 0 0 18px" }}>
              {article.sections.map((s, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <a href={`#s${i}`} style={{ fontSize: 13, color: BLUE, fontFamily: F, textDecoration: "none" }}>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Sektionen */}
          {article.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 40 }}>
              <h2
                id={`s${i}`}
                style={{ fontSize: 20, fontWeight: 600, color: TEXT, fontFamily: F, margin: "0 0 16px", paddingTop: 8 }}
              >
                {s.heading}
              </h2>
              {s.body && s.body.split("\n\n").map((para, pi) => (
                <p key={pi} style={{ fontSize: 15, color: "#333", fontFamily: F, lineHeight: 1.75, marginBottom: 14 }}>
                  {para}
                </p>
              ))}
              {s.sub && s.sub.map((sub, si) => (
                <div key={si} style={{ marginTop: 24, paddingLeft: 20, borderLeft: `2px solid ${BORDER}` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, fontFamily: F, margin: "0 0 10px" }}>
                    {sub.heading}
                  </h3>
                  {sub.body.split("\n\n").map((para, pi) => (
                    <p key={pi} style={{ fontSize: 14, color: "#444", fontFamily: F, lineHeight: 1.75, marginBottom: 10 }}>
                      {para}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* CTA */}
          {article.cta && (
            <div style={{
              backgroundColor: BLUE, padding: "28px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap" as const, gap: 16, marginTop: 16,
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: F, margin: 0 }}>
                {article.cta}
              </p>
              <Link href="/register" style={{
                backgroundColor: "#fff", color: BLUE,
                padding: "10px 24px", fontWeight: 700, fontFamily: F, fontSize: 13,
                textDecoration: "none", whiteSpace: "nowrap" as const,
              }}>
                Zugang beantragen
              </Link>
            </div>
          )}

          {/* Zurueck */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
            <Link href="/wissen" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 13, color: BLUE, fontFamily: F, textDecoration: "none", fontWeight: 600,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 6H2M5 9L2 6l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Alle Artikel
            </Link>
          </div>

          {/* Verwandte Artikel */}
          {related.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: MUTED, fontFamily: F, marginBottom: 20 }}>
                Verwandte Artikel
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {related.map((r) => (
                  <Link key={r.slug} href={`/wissen/${r.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      backgroundColor: "#fff", border: `1px solid ${BORDER}`,
                      padding: "16px 18px", cursor: "pointer",
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F, margin: "0 0 6px", lineHeight: 1.4 }}>
                        {r.title}
                      </p>
                      <p style={{ fontSize: 11, color: MUTED, fontFamily: F, margin: 0 }}>{r.readMin} Min.</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
