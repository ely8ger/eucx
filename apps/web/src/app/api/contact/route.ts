import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";

const Schema = z.object({
  anrede:      z.string().max(20).optional(),
  vorname:     z.string().min(1).max(60),
  nachname:    z.string().min(1).max(60),
  unternehmen: z.string().min(1).max(120),
  email:       z.string().email().max(120),
  betreff:     z.string().min(1).max(80),
  nachricht:   z.string().min(20).max(4000),
});

function buildHtml(d: z.infer<typeof Schema>): string {
  const anrede = d.anrede ? `${d.anrede} ` : "";
  return `
    <div style="font-family:'IBM Plex Sans',Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0b1e36;padding:24px 32px;border-top:3px solid #154194">
        <p style="color:#fff;font-size:18px;font-weight:300;margin:0">EUCX — Neue Kontaktanfrage</p>
      </div>
      <div style="padding:32px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#888;width:140px">Absender</td>
              <td style="padding:8px 0;font-weight:600">${anrede}${d.vorname} ${d.nachname}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Unternehmen</td>
              <td style="padding:8px 0">${d.unternehmen}</td></tr>
          <tr><td style="padding:8px 0;color:#888">E-Mail</td>
              <td style="padding:8px 0"><a href="mailto:${d.email}" style="color:#154194">${d.email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888">Betreff</td>
              <td style="padding:8px 0;font-weight:600">${d.betreff}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e8e8e8;margin:20px 0">
        <p style="font-size:13px;color:#888;margin-bottom:8px">Nachricht:</p>
        <div style="background:#f7f9fc;padding:16px;font-size:14px;line-height:1.7;white-space:pre-wrap">${d.nachricht}</div>
      </div>
      <div style="background:#f7f9fc;padding:16px 32px;font-size:11px;color:#aaa;border-top:1px solid #e8e8e8">
        Eingang: ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} CET
        · EUCX Contact Form · eucx.eu
      </div>
    </div>
  `.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const d = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[Contact STUB] Von: ${d.vorname} ${d.nachname} <${d.email}> | ${d.unternehmen} | ${d.betreff}`
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:        "EUCX Kontakt <noreply@eucx.eu>",
        to:          ["info@eucx.eu"],
        reply_to:    d.email,
        subject:     `Kontaktanfrage: ${d.betreff} — ${d.unternehmen}`,
        html:        buildHtml(d),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[Contact] Resend error ${res.status}: ${detail}`);
      return NextResponse.json({ error: "send_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Contact] Network error:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
