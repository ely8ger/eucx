"use client";

/**
 * MarketChart — Interaktiver OHLC-Candlestick-Chart (TradingView Lightweight Charts v5)
 *
 * ─── Daten-Architektur ────────────────────────────────────────────────────────
 *
 *   1. Initiale Daten: TanStack Query → GET /api/market/{productId}/candles
 *      staleTime: 30s, refetchInterval: 60s — automatisches Background-Refresh
 *
 *   2. Live-Updates: useMarketTicker({symbol}) via SocketProvider
 *      Wenn neuer Preis eintrifft → series.update(candle) — kein Re-Mount!
 *      Algorithmus:
 *        a) Liegt der Trade im aktuellen Kerzen-Zeitraum?
 *           → Bestehende Kerze: update(high/low/close)
 *        b) Neuer Zeitraum?
 *           → Neue Kerze: open=prev.close, high=low=close=price
 *
 * ─── Performance ─────────────────────────────────────────────────────────────
 *
 *   - Chart-Instanz wird EINMAL gemountet (kein Re-Mount bei Intervall-Wechsel)
 *   - Intervall-Wechsel → series.setData() mit neuen Daten (kein DOM-Rebuild)
 *   - ResizeObserver für responsive Breite (Höhe via Container-CSS)
 *   - liveDataRef: Ref-Shadow der aktuellen Kerzen → O(1) live Update
 *
 * ─── Responsive ───────────────────────────────────────────────────────────────
 *
 *   Höhe: 100% des Eltern-Containers (Container muss explizite Höhe haben)
 *   Breite: automatisch via ResizeObserver
 *
 * ─── Props ───────────────────────────────────────────────────────────────────
 *
 *   productId  — Produkt-UUID (Pflicht)
 *   symbol     — Trading-Symbol (z.B. "REBAR-EU") — aktiviert Live-Ticker-Updates
 *   className  — Optionale CSS-Klasse für den Wrapper
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
} from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type CandlestickData,
  type Time,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import { useOhlcQuery, INTERVAL_SECONDS, type OhlcInterval, type OhlcCandle } from "@/hooks/useOhlcQuery";
import { useMarketTicker }                                                      from "@/hooks/useMarketTicker";

// ─── Design-Tokens ────────────────────────────────────────────────────────────

const C = {
  bg:        "#0a0f1a",
  grid:      "#1a2236",
  text:      "#94a3b8",
  border:    "#1e2d45",
  up:        "#00843d",
  down:      "#e53e3e",
  upAlpha:   "rgba(0,  132, 61,  0.45)",
  downAlpha: "rgba(229, 62, 62,  0.45)",
} as const;

// ─── Intervall-Konfiguration ──────────────────────────────────────────────────

const INTERVALS: OhlcInterval[] = ["ONE_MIN", "FIFTEEN_MIN", "ONE_HOUR", "ONE_DAY"];

const INTERVAL_LABELS: Record<OhlcInterval, string> = {
  ONE_MIN:     "1M",
  FIFTEEN_MIN: "15M",
  ONE_HOUR:    "1H",
  ONE_DAY:     "1T",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MarketChartProps {
  productId:  string;
  symbol?:    string;   // optional: aktiviert WebSocket Live-Updates
  className?: string;
}

// ─── Komponente ───────────────────────────────────────────────────────────────

const MarketChart: FC<MarketChartProps> = ({ productId, symbol, className = "" }) => {
  const containerRef    = useRef<HTMLDivElement>(null);
  const chartRef        = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volSeriesRef    = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Shadow-Kopie der aktuellen Kerzen für live-update Kalkulation
  const liveDataRef = useRef<OhlcCandle[]>([]);

  const [interval, setInterval] = useState<OhlcInterval>("ONE_HOUR");

  // ── TanStack Query: Initiale + Background-Daten ──────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } =
    useOhlcQuery(productId, interval);

  // ── Live-Ticker (optional, nur wenn symbol gesetzt) ───────────────────────
  // useMarketTicker gibt "initial" source zurück wenn noch kein Socket-Event
  const ticker = useMarketTicker(symbol ?? "");

  // ── Chart initialisieren (einmalig) ────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width:  containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: C.bg },
        textColor:  C.text,
        fontSize:   12,
      },
      grid: {
        vertLines: { color: C.grid },
        horzLines: { color: C.grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor:  C.border,
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderColor:    C.border,
        timeVisible:    true,
        secondsVisible: false,
        fixLeftEdge:    false,
        fixRightEdge:   false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:         C.up,
      downColor:       C.down,
      borderUpColor:   C.up,
      borderDownColor: C.down,
      wickUpColor:     C.up,
      wickDownColor:   C.down,
    } as Partial<CandlestickSeriesOptions>);

    const volSeries = chart.addSeries(HistogramSeries, {
      color:        C.upAlpha,
      priceFormat:  { type: "volume" },
      priceScaleId: "volume",
    });

    volSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    chartRef.current        = chart;
    candleSeriesRef.current = candleSeries;
    volSeriesRef.current    = volSeries;

    // Responsive Breite + Höhe via ResizeObserver
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({
        width:  entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current        = null;
      candleSeriesRef.current = null;
      volSeriesRef.current    = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Daten → Chart setzen (bei Query-Ergebnis oder Intervall-Wechsel) ───────
  useEffect(() => {
    if (!data || !candleSeriesRef.current || !volSeriesRef.current) return;

    candleSeriesRef.current.setData(data.candles as CandlestickData[]);
    volSeriesRef.current.setData(
      data.volume.map((v) => ({ ...v, time: v.time as unknown as Time })),
    );

    // Shadow-Ref aktualisieren für live-update Berechnungen
    liveDataRef.current = [...data.candles];

    // Aktuellste Kerze anzeigen
    chartRef.current?.timeScale().scrollToRealTime();
  }, [data]);

  // ── Live-Candle-Update via WebSocket-Ticker ─────────────────────────────────
  //
  // Algorithmus:
  //   1. Neuen Preis in aktuellen Kerzen-Zeitraum einordnen
  //   2a. Zeitraum = letzter bekannter Zeitraum → OHLC der letzten Kerze updaten
  //   2b. Neuer Zeitraum → neue Kerze eröffnen (open = letzte close)
  //
  const updateLiveCandle = useCallback((
    price: number,
    qty:   number,
  ) => {
    const candleSeries = candleSeriesRef.current;
    const volSeries    = volSeriesRef.current;
    if (!candleSeries || price <= 0) return;

    const nowSec    = Math.floor(Date.now() / 1000);
    const periodSec = INTERVAL_SECONDS[interval];
    const candleTs  = Math.floor(nowSec / periodSec) * periodSec;

    const liveData  = liveDataRef.current;
    const last      = liveData.at(-1);

    let updated: OhlcCandle;

    if (last && last.time === candleTs) {
      // Bestehende Kerze im gleichen Zeitraum updaten
      updated = {
        time:  candleTs,
        open:  last.open,
        high:  Math.max(last.high, price),
        low:   Math.min(last.low,  price),
        close: price,
      };
      liveDataRef.current = [...liveData.slice(0, -1), updated];
    } else {
      // Neuer Zeitraum → neue Kerze
      updated = {
        time:  candleTs,
        open:  last?.close ?? price,
        high:  price,
        low:   price,
        close: price,
      };
      liveDataRef.current = [...liveData, updated];
    }

    // Lightweight Charts series.update() — kein Re-Mount, kein setData()
    candleSeries.update(updated as unknown as CandlestickData);

    if (volSeries && qty > 0) {
      const isUp = price >= updated.open;
      volSeries.update({
        time:  candleTs as unknown as Time,
        value: qty,
        color: isUp ? C.upAlpha : C.downAlpha,
      });
    }
  }, [interval]);

  // Ticker-Änderungen → live Candle updaten
  // Nur wenn symbol gesetzt und Quelle WebSocket oder REST (nicht "initial")
  const prevTickerPrice = useRef<string>("0");

  useEffect(() => {
    if (!symbol) return;
    if (ticker.source === "initial") return;
    if (ticker.price === prevTickerPrice.current) return;

    prevTickerPrice.current = ticker.price;

    const price = parseFloat(ticker.price);
    const qty   = parseFloat(ticker.volume24h) / 1440; // approximiertes Tick-Volumen (1/1440 of 24h)

    if (!isNaN(price) && price > 0) {
      updateLiveCandle(price, qty);
    }
  }, [ticker.price, ticker.source, ticker.volume24h, symbol, updateLiveCandle]);

  // ── Export-Handler ────────────────────────────────────────────────────────
  const handleExport = useCallback((format: "csv" | "xlsx") => {
    const token =
      typeof window !== "undefined"
        ? (localStorage.getItem("eucx_access_token") ?? localStorage.getItem("access_token"))
        : null;
    if (!token) return;

    const url = `/api/market/export?format=${format}&productId=${productId}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 204) {
          alert("Keine Trades im gewählten Zeitraum.");
          return null;
        }
        return r.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const a = Object.assign(document.createElement("a"), {
          href:     URL.createObjectURL(blob),
          download: `eucx-ohlc-${productId}-${interval}.${format}`,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch(console.error);
  }, [productId, interval]);

  // ─── Abgeleitete Ticker-Werte ─────────────────────────────────────────────
  const displayTicker = data?.ticker ?? null;
  const productName   = data?.productName ?? "";
  const unit          = data?.unit ?? "TON";

  // Live-Preis aus WebSocket überschreibt API-Ticker wenn verfügbar
  const livePrice   = symbol && ticker.source !== "initial" ? ticker.price : null;
  const displayPrice = livePrice ?? displayTicker?.lastPrice ?? null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={`flex flex-col bg-[#0a0f1a] border border-[#1e2d45] rounded-xl overflow-hidden ${className}`}
    >
      {/* ── Header: Produktname + Ticker + Controls ── */}
      <div className="flex-none flex items-center justify-between px-4 py-2.5 border-b border-[#1e2d45] gap-4">

        {/* Produktname + Preisband */}
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="text-white font-semibold text-sm truncate shrink-0">
            {productName || "Lädt…"}
          </span>

          {displayPrice && (
            <span className="text-white font-bold text-xl tabular-nums shrink-0">
              {displayPrice}
              <span className="text-[#94a3b8] text-sm font-normal ml-1">
                EUR/{unit === "TON" ? "t" : unit.toLowerCase()}
              </span>
            </span>
          )}

          {displayTicker && (
            <>
              <span className={`text-sm font-medium tabular-nums shrink-0 ${
                displayTicker.isUp ? "text-[#00843d]" : "text-[#e53e3e]"
              }`}>
                {displayTicker.change} ({displayTicker.changePct})
              </span>
              <span className="text-[#475569] text-xs hidden sm:block">
                Vol 24h:{" "}
                {parseFloat(displayTicker.volume24h).toLocaleString("de-DE")}{" "}
                {unit === "TON" ? "t" : unit}
              </span>
            </>
          )}

          {/* Live-Indikator */}
          {symbol && ticker.source === "socket" && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              LIVE
            </span>
          )}

          {/* Background-Fetch Indikator */}
          {isFetching && !isLoading && (
            <span className="text-[10px] text-[#475569] shrink-0">↺</span>
          )}
        </div>

        {/* Intervall-Umschalter + Aktionen */}
        <div className="flex items-center gap-1 shrink-0">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                interval === iv
                  ? "bg-[#00843d] text-white"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#1a2236]"
              }`}
            >
              {INTERVAL_LABELS[iv]}
            </button>
          ))}

          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="ml-1 px-2.5 py-1 rounded text-xs text-[#94a3b8] hover:text-white hover:bg-[#1a2236] disabled:opacity-40 transition-colors"
            title="Aktualisieren"
          >
            ↺
          </button>

          {/* Export-Dropdown */}
          <div className="relative ml-1 group">
            <button className="px-2.5 py-1 rounded text-xs text-[#94a3b8] hover:text-white hover:bg-[#1a2236] transition-colors">
              ↓ Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-[#0f1929] border border-[#1e2d45] rounded shadow-lg z-10 hidden group-hover:block min-w-[100px]">
              <button
                onClick={() => handleExport("csv")}
                className="block w-full text-left px-3 py-2 text-xs text-[#94a3b8] hover:text-white hover:bg-[#1a2236]"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport("xlsx")}
                className="block w-full text-left px-3 py-2 text-xs text-[#94a3b8] hover:text-white hover:bg-[#1a2236]"
              >
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart-Container (responsiv, nimmt gesamten Rest-Platz) ── */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading Overlay (initiales Laden) */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a]/90 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#00843d] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#94a3b8] text-xs">Marktdaten werden geladen…</span>
            </div>
          </div>
        )}

        {/* Fehler-Overlay */}
        {isError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a]/95 z-10">
            <div className="text-center px-8">
              <p className="text-[#e53e3e] text-sm mb-1">Ladefehler</p>
              <p className="text-[#475569] text-xs mb-4">
                {error instanceof Error ? error.message : "Unbekannter Fehler"}
              </p>
              <button
                onClick={() => void refetch()}
                className="px-4 py-1.5 bg-[#1a2236] border border-[#1e2d45] rounded text-[#94a3b8] text-xs hover:text-white transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        )}

        {/* Keine Daten */}
        {!isLoading && !isError && data && data.candleCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[#475569] text-sm">
                Keine Handelsdaten für dieses Intervall verfügbar.
              </p>
              <p className="text-[#2d3a4a] text-xs mt-1">
                Erste Trades werden automatisch angezeigt.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: Legende + Quelle ── */}
      <div className="flex-none flex items-center gap-4 px-4 py-2 border-t border-[#1e2d45] text-xs text-[#475569]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: C.up }} />
          Steigend
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: C.down }} />
          Fallend
        </span>
        {data && (
          <span className="ml-auto tabular-nums">
            {data.candleCount} Kerzen · {INTERVAL_LABELS[interval]}
          </span>
        )}
        <span className={data ? "" : "ml-auto"}>
          EUCX · {symbol && ticker.source === "socket" ? "Live WS" : "Cache 30s"}
        </span>
      </div>
    </div>
  );
};

export default MarketChart;
