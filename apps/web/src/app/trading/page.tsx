import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Handelsraum",
};

// ─── Beispiel-Daten (später aus API) ──────────────────────────────────────────
const mockAsks = [
  { id: "1", price: 545.00, qty: 120, org: "Stahlwerk Polska" },
  { id: "2", price: 548.50, qty: 200, org: "CMC Poland S.A." },
  { id: "3", price: 550.00, qty: 85,  org: "Celsa Huta" },
];

const mockBids = [
  { id: "4", price: 542.00, qty: 100, org: "Bauträger GmbH" },
  { id: "5", price: 540.00, qty: 250, org: "Beton AG" },
  { id: "6", price: 538.50, qty: 60,  org: "Stahlhandel Wien" },
];

const mockDeals = [
  { id: "1", price: 543.00, qty: 50,  time: "14:32:18", direction: "buy"  },
  { id: "2", price: 545.00, qty: 120, time: "14:31:05", direction: "sell" },
  { id: "3", price: 542.50, qty: 30,  time: "14:29:44", direction: "buy"  },
];

export default function TradingPage() {
  return (
    <div className="flex flex-col gap-5 max-w-screen-2xl">

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cb-petrol">Handelsraum</h1>
          <p className="text-sm text-cb-gray-500 mt-0.5">
            Rebar BSt 500S · EN 10080 · Ø 12mm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" dot>Handel aktiv · Periode 1</Badge>
          <span className="text-sm text-cb-gray-500 font-mono">14:32:45</span>
        </div>
      </div>

      {/* ─── Preisband ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Letzter Preis",  value: "543,00 €", change: "+1,2%",  up: true  },
          { label: "Bestes Angebot", value: "545,00 €", change: "120 t",   up: null },
          { label: "Bestes Gebot",   value: "542,00 €", change: "100 t",   up: null },
          { label: "Tagesvolumen",   value: "1.840 t",  change: "+14%",   up: true  },
        ].map((stat) => (
          <Card key={stat.label} highlighted padding="sm">
            <p className="text-xs text-cb-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-cb-petrol mt-1">{stat.value}</p>
            <p className={stat.up === true ? "price-up text-sm" : stat.up === false ? "price-down text-sm" : "text-sm text-cb-gray-500"}>
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      {/* ─── Hauptbereich: OrderBook + Order-Formular + Deals ────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Orderbook */}
        <div className="col-span-5">
          <Card
            header={<CardTitle>Auftragsbuch</CardTitle>}
            padding="none"
          >
            {/* Verkaufsangebote (Asks) */}
            <div className="p-3 pb-1">
              <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
                Angebote (Verkauf)
              </p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Preis (€/t)</th>
                  <th>Menge (t)</th>
                  <th>Anbieter</th>
                </tr>
              </thead>
              <tbody>
                {mockAsks.map((ask) => (
                  <tr key={ask.id} className="cursor-pointer">
                    <td className="price-down font-mono font-semibold">
                      {ask.price.toFixed(2)}
                    </td>
                    <td className="text-cb-gray-700 font-mono">{ask.qty}</td>
                    <td className="text-cb-gray-500 text-xs">{ask.org}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Spread-Linie */}
            <div className="flex items-center gap-3 px-4 py-2 bg-cb-yellow/10 border-y border-cb-yellow/30">
              <span className="text-xs text-cb-gray-500">Spread</span>
              <span className="font-bold text-cb-petrol font-mono">3,00 €</span>
              <span className="text-xs text-cb-gray-400">· 0,55%</span>
            </div>

            {/* Kaufgebote (Bids) */}
            <div className="p-3 pb-1 pt-2">
              <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
                Gebote (Kauf)
              </p>
            </div>
            <table>
              <tbody>
                {mockBids.map((bid) => (
                  <tr key={bid.id} className="cursor-pointer">
                    <td className="price-up font-mono font-semibold">
                      {bid.price.toFixed(2)}
                    </td>
                    <td className="text-cb-gray-700 font-mono">{bid.qty}</td>
                    <td className="text-cb-gray-500 text-xs">{bid.org}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Order-Formular */}
        <div className="col-span-3">
          <Card
            header={<CardTitle>Auftrag erteilen</CardTitle>}
            padding="md"
          >
            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-1 mb-4 bg-cb-gray-100 p-1 rounded">
              <button className="py-2 text-sm font-semibold rounded bg-cb-yellow text-cb-gray-900 transition-all">
                Kaufen
              </button>
              <button className="py-2 text-sm font-medium rounded text-cb-gray-500 hover:bg-cb-gray-200 transition-all">
                Verkaufen
              </button>
            </div>

            <div className="space-y-3">
              <Input
                label="Preis"
                suffix="€/t"
                type="number"
                defaultValue="542.00"
                step="0.50"
                required
              />
              <Input
                label="Menge"
                suffix="t"
                type="number"
                defaultValue="100"
                min="1"
                required
              />

              {/* Gesamtwert */}
              <div className="bg-cb-gray-50 rounded border border-cb-gray-200 p-3">
                <p className="text-xs text-cb-gray-500 mb-0.5">Gesamtwert</p>
                <p className="text-lg font-bold text-cb-petrol">54.200,00 €</p>
                <p className="text-xs text-cb-gray-400">zzgl. MwSt.</p>
              </div>

              <Button variant="primary" fullWidth size="lg">
                Kaufauftrag erteilen
              </Button>
              <Button variant="ghost" fullWidth size="sm">
                Auftrag zurücksetzen
              </Button>
            </div>
          </Card>
        </div>

        {/* Letzte Abschlüsse */}
        <div className="col-span-4">
          <Card
            header={<CardTitle>Letzte Abschlüsse</CardTitle>}
            padding="none"
          >
            <table>
              <thead>
                <tr>
                  <th>Zeit</th>
                  <th>Preis</th>
                  <th>Menge</th>
                  <th>Dir.</th>
                </tr>
              </thead>
              <tbody>
                {mockDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td className="font-mono text-xs text-cb-gray-400">{deal.time}</td>
                    <td className={`font-mono font-semibold ${deal.direction === "buy" ? "price-up" : "price-down"}`}>
                      {deal.price.toFixed(2)}
                    </td>
                    <td className="font-mono text-cb-gray-700">{deal.qty}</td>
                    <td>
                      <Badge variant={deal.direction === "buy" ? "success" : "error"} dot>
                        {deal.direction === "buy" ? "K" : "V"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Session-Perioden-Timeline */}
          <Card className="mt-4" padding="sm">
            <p className="text-xs font-semibold text-cb-gray-400 uppercase tracking-wider mb-2">
              Sitzungsverlauf
            </p>
            <div className="flex items-center gap-1">
              {[
                { label: "Vor-Hdl.",   done: true  },
                { label: "Hdl. 1",     active: true },
                { label: "Korr. 1",    done: false },
                { label: "Hdl. 2",     done: false },
                { label: "Korr. 2",    done: false },
                { label: "Schluss",    done: false },
              ].map((period, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`h-1.5 rounded-full mb-1 ${
                    period.done   ? "bg-cb-success" :
                    period.active ? "bg-cb-yellow animate-pulse" :
                    "bg-cb-gray-200"
                  }`} />
                  <span className="text-2xs text-cb-gray-400 block">{period.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
