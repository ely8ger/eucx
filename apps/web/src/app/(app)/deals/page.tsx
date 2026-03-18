import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { TableWrapper, Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";

export const metadata: Metadata = { title: "Abschlüsse — EUCX" };
export const dynamic = "force-dynamic";

const DEALS = [
  { id: "D-2026-0092", date: "18.03.2026 09:41", session: "M-2026-041", buyer: "Stahlhandel Berger GmbH", seller: "ArcelorMittal DE",    commodity: "Betonstahl Ø16 · B500B",  qty: "80 t",  price: "710 EUR/t",  total: "56.800 EUR",  status: "BESTÄTIGT"     as const },
  { id: "D-2026-0089", date: "17.03.2026 10:12", session: "M-2026-038", buyer: "Bauwerk AG",              seller: "Salzgitter AG",         commodity: "Träger HEA 200 · S355",    qty: "60 t",  price: "760 EUR/t",  total: "45.600 EUR",  status: "IN_ABWICKLUNG" as const },
  { id: "D-2026-0085", date: "15.03.2026 08:55", session: "M-2026-035", buyer: "Metallcenter GmbH",       seller: "Thyssen Röhren AG",     commodity: "Nahtlosrohr Ø76×6,3 mm",   qty: "28 t",  price: "1.240 EUR/t", total: "34.720 EUR", status: "ABGESCHLOSSEN" as const },
  { id: "D-2026-0081", date: "14.03.2026 11:07", session: "M-2026-031", buyer: "Rheinzink GmbH",          seller: "Norddeutsche Affinerie", commodity: "Zink-Draht 99,99 %",      qty: "15 t",  price: "2.890 EUR/t", total: "43.350 EUR", status: "ABGESCHLOSSEN" as const },
  { id: "D-2026-0074", date: "12.03.2026 14:22", session: "M-2026-027", buyer: "Kupferwerk Leipzig",       seller: "Aurubis AG",            commodity: "Cu-Kathoden Grade A",       qty: "10 t",  price: "8.410 EUR/t", total: "84.100 EUR", status: "IN_ABWICKLUNG" as const },
  { id: "D-2026-0070", date: "10.03.2026 09:00", session: "M-2026-025", buyer: "Aluminiumwerk Norf",       seller: "Hydro Aluminium",       commodity: "Al-Walzbarren 1050A",       qty: "40 t",  price: "2.210 EUR/t", total: "88.400 EUR", status: "ABGESCHLOSSEN" as const },
];

const STATUS_CFG = {
  BESTÄTIGT:      { variant: "blue"    as const, label: "Bestätigt"     },
  IN_ABWICKLUNG:  { variant: "warning" as const, label: "In Abwicklung" },
  ABGESCHLOSSEN:  { variant: "success" as const, label: "Abgeschlossen" },
};

export default function DealsPage() {
  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-gov-text">Abschlüsse</h1>
        <p className="text-sm text-gov-text-muted mt-1">
          Alle bestätigten Handelstransaktionen — Ausführungsstatus &amp; Gegenpartei
        </p>
      </div>

      {/* KPI-Zeile */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Gesamt heute",  value: "€ 352.970", sub: "6 Abschlüsse"           },
          { label: "In Abwicklung", value: "2",          sub: "warten auf Bestätigung" },
          { label: "Abgeschlossen", value: "4",          sub: "vollständig erfüllt"    },
          { label: "Ø Losgröße",    value: "38,8 t",     sub: "Metalle"                },
        ].map((k) => (
          <div key={k.label} className="bg-gov-white border border-gov-border-light rounded-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gov-text-muted">{k.label}</p>
            <p className="text-2xl font-bold text-gov-text mt-1">{k.value}</p>
            <p className="text-xs text-gov-text-muted mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabelle */}
      <TableWrapper>
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Abschluss-Nr.</TableTh>
              <TableTh>Datum / Zeit</TableTh>
              <TableTh>Sitzung</TableTh>
              <TableTh>Käufer</TableTh>
              <TableTh>Verkäufer</TableTh>
              <TableTh>Ware</TableTh>
              <TableTh className="text-right">Menge</TableTh>
              <TableTh className="text-right">Preis</TableTh>
              <TableTh className="text-right">Gesamtwert</TableTh>
              <TableTh>Status</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {DEALS.map((d) => (
              <TableRow key={d.id}>
                <TableTd className="font-mono text-xs text-gov-blue">{d.id}</TableTd>
                <TableTd className="text-xs">{d.date}</TableTd>
                <TableTd className="text-xs">{d.session}</TableTd>
                <TableTd>{d.buyer}</TableTd>
                <TableTd>{d.seller}</TableTd>
                <TableTd className="font-medium">{d.commodity}</TableTd>
                <TableTd className="text-right font-mono">{d.qty}</TableTd>
                <TableTd className="text-right font-mono">{d.price}</TableTd>
                <TableTd className="text-right font-mono font-semibold">{d.total}</TableTd>
                <TableTd>
                  <Badge variant={STATUS_CFG[d.status].variant} dot>
                    {STATUS_CFG[d.status].label}
                  </Badge>
                </TableTd>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

    </div>
  );
}
