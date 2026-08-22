import { NextResponse } from "next/server";
import { LEXIKON, AKADEMIE_ARTIKEL } from "@/app/insights/data";

export const revalidate = 86400; // ISR: 24h

const BASE = "https://eucx.eu";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export async function GET() {
  // Alle Artikel: Lexikon + Akademie, nach Datum absteigend sortiert
  const items: { title: string; desc: string; link: string; date: string; cat?: string }[] = [
    ...LEXIKON.map((e) => ({
      title: e.term,
      desc:  e.shortDef,
      link:  `${BASE}/insights/lexikon/${e.slug}`,
      date:  e.updated ?? e.published,
      cat:   e.category,
    })),
    ...AKADEMIE_ARTIKEL.map((a) => ({
      title: a.title,
      desc:  a.description,
      link:  `${BASE}/insights/akademie/${a.slug}`,
      date:  a.published,
      cat:   "Akademie",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastBuild = rfc822(items[0]?.date ?? new Date().toISOString());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>EUCX Insights – Rohstoff-Lexikon &amp; Marktanalysen</title>
    <link>${BASE}/insights</link>
    <description>Definitionen, Marktanalysen und Regulierungswissen für den professionellen B2B-Rohstoffhandel an der EUCX.</description>
    <language>de-DE</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <managingEditor>redaktion@eucx.eu (EUCX Research)</managingEditor>
    <webMaster>tech@eucx.eu (EUCX Tech)</webMaster>
    <image>
      <url>${BASE}/logo.png</url>
      <title>EUCX</title>
      <link>${BASE}/insights</link>
    </image>
    <atom:link href="${BASE}/insights/feed" rel="self" type="application/rss+xml"/>
${items.map((item) => `    <item>
      <title>${esc(item.title)}</title>
      <link>${esc(item.link)}</link>
      <description>${esc(item.desc)}</description>
      <pubDate>${rfc822(item.date)}</pubDate>
      <guid isPermaLink="true">${esc(item.link)}</guid>${item.cat ? `\n      <category>${esc(item.cat)}</category>` : ""}
    </item>`).join("\n")}
  </channel>
</rss>`;

  const lastModified = new Date(items[0]?.date ?? Date.now()).toUTCString();

  return new NextResponse(xml, {
    headers: {
      "Content-Type":  "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      "Last-Modified": lastModified,
    },
  });
}
