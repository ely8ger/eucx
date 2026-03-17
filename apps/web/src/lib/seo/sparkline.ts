/**
 * Sparkline-Utility für OG-Image-Generierung
 *
 * Wandelt eine Preis-Zeitreihe in einen SVG-Polyline-Pfad um.
 * Wird serverseitig in generateMetadata aufgerufen und als kompakter
 * URL-Parameter an /api/og übergeben.
 *
 * Format: "p=8420.5,8380.0,8450.2,..."  (max. 48 Werte, gerundet auf 1 Dezimale)
 */

// ── Encoding / Decoding ───────────────────────────────────────────────────────

/**
 * Kodiert Preisliste für URL-Parameter.
 * Rundet auf 1 Dezimale um URL-Länge zu minimieren.
 */
export function encodeSparklineData(prices: number[]): string {
  return prices
    .slice(-48)                              // max. 48 Datenpunkte (2 Tage × 1h)
    .map((p) => p.toFixed(1))
    .join(",");
}

/**
 * Dekodiert URL-Parameter zurück zu Zahlen-Array.
 */
export function decodeSparklineData(encoded: string): number[] {
  return encoded
    .split(",")
    .map((s) => parseFloat(s))
    .filter((n) => !isNaN(n));
}

// ── SVG-Pfad-Berechnung ───────────────────────────────────────────────────────

interface SparklinePath {
  /** SVG-Polyline-Punkte: "x1,y1 x2,y2 ..." */
  points:    string;
  /** Hintergrund-Polygon (Fläche unter der Linie) für Gradient-Fill */
  fillPath:  string;
  isPositive: boolean;
  min:       number;
  max:       number;
}

/**
 * Berechnet SVG-Koordinaten für eine Sparkline.
 *
 * @param prices   Array von Schlusskursen (chronologisch aufsteigend)
 * @param width    SVG-Breite in px
 * @param height   SVG-Höhe in px
 * @param padding  Vertikaler Padding damit Spitzen nicht abgeschnitten werden
 */
export function computeSparklinePath(
  prices:  number[],
  width:   number = 400,
  height:  number = 80,
  padding: number = 6,
): SparklinePath | null {
  if (prices.length < 2) return null;

  const min = Math.min(...prices) as number;
  const max = Math.max(...prices) as number;
  const range = max - min;

  // Wenn alle Preise gleich sind — flache Linie in der Mitte
  const effectiveRange = range === 0 ? 1 : range;

  const toX = (i: number)  => (i / (prices.length - 1)) * width;
  const toY = (price: number) =>
    height - padding - ((price - min) / effectiveRange) * (height - padding * 2);

  const points = prices
    .map((p, i) => `${toX(i).toFixed(1)},${toY(p).toFixed(1)}`)
    .join(" ");

  // Fill-Polygon: Linie + rechts-unten + links-unten schließen
  const firstX = toX(0).toFixed(1);
  const lastX  = toX(prices.length - 1).toFixed(1);
  const bottom = (height + 4).toFixed(1);
  const fillPath = `${points} ${lastX},${bottom} ${firstX},${bottom}`;

  const lastPrice  = prices[prices.length - 1] ?? 0;
  const firstPrice = prices[0] ?? 0;
  const isPositive = lastPrice >= firstPrice;

  return { points, fillPath, isPositive, min, max };
}
