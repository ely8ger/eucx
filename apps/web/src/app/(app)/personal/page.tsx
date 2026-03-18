import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { TableWrapper, Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";

export const metadata: Metadata = { title: "Mein Bereich — EUCX" };

const CONTRACT_MONITOR = [
  { id: "D-2026-0089", date: "17.03.2026", commodity: "Träger HEA 200",   qty: "60 t",   total: "45.600 EUR", role: "Käufer",   payStatus: "AUSSTEHEND" as const,  delivStatus: "AUSSTEHEND" as const,  deadline: "27.03.2026" },
  { id: "D-2026-0085", date: "15.03.2026", commodity: "Nahtlosrohr Ø76",  qty: "28 t",   total: "34.720 EUR", role: "Verkäufer",payStatus: "BEZAHLT"    as const,  delivStatus: "GELIEFERT"  as const,  deadline: "25.03.2026" },
  { id: "D-2026-0074", date: "12.03.2026", commodity: "Cu-Kathoden",      qty: "10 t",   total: "84.100 EUR", role: "Käufer",   payStatus: "TEILZAHLUNG" as const, delivStatus: "IN_TRANSIT"  as const, deadline: "22.03.2026" },
  { id: "D-2026-0070", date: "10.03.2026", commodity: "Al-Walzbarren",    qty: "40 t",   total: "88.400 EUR", role: "Käufer",   payStatus: "BEZAHLT"    as const,  delivStatus: "GELIEFERT"  as const,  deadline: "20.03.2026" },
];

const PAY_CFG = {
  AUSSTEHEND:  { variant: "error"   as const, label: "Ausstehend"  },
  TEILZAHLUNG: { variant: "warning" as const, label: "Teilzahlung" },
  BEZAHLT:     { variant: "success" as const, label: "Bezahlt"     },
};
const DELIV_CFG = {
  AUSSTEHEND:  { variant: "error"   as const, label: "Ausstehend"    },
  IN_TRANSIT:  { variant: "warning" as const, label: "Unterwegs"     },
  GELIEFERT:   { variant: "success" as const, label: "Geliefert"     },
};

const ACCREDITATIONS = [
  { section: "Metalle",             status: "AKTIV" as const,    validUntil: "31.12.2026", broker: "EUCX Intern"       },
  { section: "Schrott & Sekundär",  status: "AKTIV" as const,    validUntil: "31.12.2026", broker: "EUCX Intern"       },
  { section: "Holz & Forst",        status: "BEANTRAGT" as const,validUntil: "—",          broker: "—"                 },
  { section: "Agrar",               status: "INAKTIV" as const,  validUntil: "31.03.2026", broker: "Broker Meyer GmbH" },
];

const ACCR_CFG = {
  AKTIV:     { variant: "success" as const, label: "Aktiv"     },
  BEANTRAGT: { variant: "warning" as const, label: "Beantragt" },
  INAKTIV:   { variant: "error"   as const, label: "Inaktiv"   },
};

export default function PersonalPage() {
  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-bold text-gov-text">Mein Bereich</h1>
        <p className="text-sm text-gov-text-muted mt-1">
          Vertragserfüllung, Akkreitierungen und Kontoübersicht
        </p>
      </div>

      {/* ── Profil-Karte ──────────────────────────────────────────────────── */}
      <div className="bg-gov-white border border-gov-border-light rounded-sm p-5 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs text-gov-text-muted uppercase tracking-wider mb-1">Teilnehmer</p>
          <p className="text-lg font-bold text-gov-text">Metallcenter Nord GmbH</p>
          <p className="text-sm text-gov-text-muted">Bieter-Nr. TN-2024-00841 · Registriert 12.02.2024</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="success" dot>Akkreditiert</Badge>
            <Badge variant="blue">KYC verifiziert</Badge>
            <Badge variant="blue">2FA aktiv</Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5 text-sm">
          <div>
            <p className="text-xs text-gov-text-muted uppercase tracking-wider">Kaution gesamt</p>
            <p className="text-xl font-bold text-gov-text">50.000 EUR</p>
          </div>
          <div>
            <p className="text-xs text-gov-text-muted uppercase tracking-wider">Gesperrt</p>
            <p className="text-xl font-bold text-gov-error">14.200 EUR</p>
          </div>
          <div>
            <p className="text-xs text-gov-text-muted uppercase tracking-wider">Frei</p>
            <p className="text-xl font-bold text-gov-success">35.800 EUR</p>
          </div>
        </div>
      </div>

      {/* ── Vertragserfüllung ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gov-text mb-3">
          Vertragserfüllung — Laufende Abschlüsse
        </h2>
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Abschluss-Nr.</TableTh>
                <TableTh>Datum</TableTh>
                <TableTh>Ware</TableTh>
                <TableTh className="text-right">Menge</TableTh>
                <TableTh className="text-right">Gesamtwert</TableTh>
                <TableTh>Meine Rolle</TableTh>
                <TableTh>Zahlung</TableTh>
                <TableTh>Lieferung</TableTh>
                <TableTh>Frist</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {CONTRACT_MONITOR.map((c) => (
                <TableRow key={c.id}>
                  <TableTd className="font-mono text-xs text-gov-blue">{c.id}</TableTd>
                  <TableTd className="text-xs">{c.date}</TableTd>
                  <TableTd className="font-medium">{c.commodity}</TableTd>
                  <TableTd className="text-right font-mono">{c.qty}</TableTd>
                  <TableTd className="text-right font-mono font-semibold">{c.total}</TableTd>
                  <TableTd>
                    <span className={"text-xs font-semibold " + (c.role === "Käufer" ? "text-gov-success" : "text-gov-error")}>
                      {c.role}
                    </span>
                  </TableTd>
                  <TableTd><Badge variant={PAY_CFG[c.payStatus].variant}>{PAY_CFG[c.payStatus].label}</Badge></TableTd>
                  <TableTd><Badge variant={DELIV_CFG[c.delivStatus].variant}>{DELIV_CFG[c.delivStatus].label}</Badge></TableTd>
                  <TableTd className="text-xs text-gov-text-muted">{c.deadline}</TableTd>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </section>

      {/* ── Akkreditierungen ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gov-text mb-3">
          Akkreditierungen je Warengruppe
        </h2>
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Warengruppe</TableTh>
                <TableTh>Status</TableTh>
                <TableTh>Gültig bis</TableTh>
                <TableTh>Broker / Verwalter</TableTh>
                <TableTh />
              </TableRow>
            </TableHead>
            <TableBody>
              {ACCREDITATIONS.map((a) => (
                <TableRow key={a.section}>
                  <TableTd className="font-medium">{a.section}</TableTd>
                  <TableTd><Badge variant={ACCR_CFG[a.status].variant} dot>{ACCR_CFG[a.status].label}</Badge></TableTd>
                  <TableTd className="text-xs">{a.validUntil}</TableTd>
                  <TableTd className="text-xs text-gov-text-muted">{a.broker}</TableTd>
                  <TableTd>
                    {a.status === "INAKTIV" && (
                      <button className="text-xs text-gov-blue hover:underline">Erneuern</button>
                    )}
                    {a.status === "BEANTRAGT" && (
                      <span className="text-xs text-gov-text-muted">In Prüfung</span>
                    )}
                  </TableTd>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </section>

    </div>
  );
}
