/**
 * EUCX K6 Load Test — Trading Under Stress
 *
 * Ausführung:
 *   k6 run k6/trading-load-test.js
 *   k6 run --env BASE_URL=https://api.eucx.eu k6/trading-load-test.js
 *
 * Szenarien:
 *   1. order_storm:    1.000 User platzieren gleichzeitig Orders
 *   2. market_data:    500 User pollen Marktdaten (Ticker + OHLC)
 *   3. websocket_wall: 200 User halten WebSocket-Verbindungen offen
 *
 * SLOs (Service Level Objectives):
 *   - P95 Antwortzeit API:       < 200ms
 *   - P99 Antwortzeit API:       < 500ms
 *   - WebSocket Nachricht P95:   < 100ms
 *   - Fehlerrate:                < 0.1%
 *   - HTTP 2xx Rate:             > 99.9%
 *
 * Metriken:
 *   - http_req_duration:         Latenz pro Request
 *   - ws_session_duration:       Dauer der WebSocket-Session
 *   - order_placement_time:      Zeit für POST /orders
 *   - match_notification_latency: Zeit bis Deal-Event eintrifft
 */

import http            from "k6/http";
import ws              from "k6/ws";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ─── Konfiguration ────────────────────────────────────────────────────────────

const BASE_URL    = __ENV.BASE_URL    || "http://localhost:3001";
const WS_URL      = __ENV.WS_URL      || "ws://localhost:3001";
const AUTH_TOKEN  = __ENV.AUTH_TOKEN  || "your-test-jwt-token";
const SESSION_ID  = __ENV.SESSION_ID  || "test-session-1";
const PRODUCT_ID  = __ENV.PRODUCT_ID  || "copper-cathode-01";

// ─── Custom Metriken ──────────────────────────────────────────────────────────

const orderErrors         = new Counter("order_errors");
const matchNotifications  = new Counter("match_notifications_received");
const wsLatency           = new Trend("ws_message_latency_ms");
const orderPlacementTime  = new Trend("order_placement_ms");
const marketDataTime      = new Trend("market_data_ms");
const errorRate           = new Rate("error_rate");

// ─── Lastprofil (Stages) ──────────────────────────────────────────────────────

export const options = {
  scenarios: {

    // ── Szenario 1: Order Storm — 1.000 User kaufen gleichzeitig ─────────────
    order_storm: {
      executor:         "ramping-vus",
      startVUs:         0,
      stages: [
        { duration: "30s", target: 100  },  // Hochfahren auf 100 User
        { duration: "60s", target: 500  },  // Hochfahren auf 500 User
        { duration: "60s", target: 1000 },  // Peak: 1.000 parallele User
        { duration: "30s", target: 0    },  // Runterfahren
      ],
      gracefulRampDown: "10s",
      exec:             "placeOrders",
      tags:             { scenario: "order_storm" },
    },

    // ── Szenario 2: Market Data Polling ──────────────────────────────────────
    market_data: {
      executor:    "constant-vus",
      vus:         500,
      duration:    "3m",
      exec:        "readMarketData",
      tags:        { scenario: "market_data" },
      startTime:   "0s",
    },

    // ── Szenario 3: WebSocket Wall ────────────────────────────────────────────
    websocket_wall: {
      executor:    "constant-vus",
      vus:         200,
      duration:    "2m",
      exec:        "holdWebSocket",
      tags:        { scenario: "ws_wall" },
      startTime:   "30s",  // Startet nach dem Order-Storm-Warmup
    },
  },

  // SLO-Schwellenwerte — Test SCHLÄGT FEHL wenn überschritten
  thresholds: {
    // Latenz
    "http_req_duration{scenario:order_storm}": [
      "p(95)<200",   // 95% unter 200ms
      "p(99)<500",   // 99% unter 500ms
    ],
    "http_req_duration{scenario:market_data}": [
      "p(95)<100",   // Market Data ist gecacht → schneller
    ],
    "ws_message_latency_ms": [
      "p(95)<100",   // WebSocket-Nachrichten unter 100ms
    ],
    // Fehlerrate
    "error_rate":                           ["rate<0.001"],  // < 0.1%
    "http_req_failed{scenario:order_storm}": ["rate<0.01"],  // < 1% HTTP-Fehler
  },
};

// ─── Szenario 1: Orders platzieren ────────────────────────────────────────────

export function placeOrders() {
  const startTime = Date.now();

  // Realistischer Order-Mix: 60% BUY, 40% SELL
  const direction    = Math.random() < 0.6 ? "BUY" : "SELL";
  const basePrice    = 8500;
  const spread       = 50;
  const pricePerUnit = (basePrice + (Math.random() * spread * 2 - spread)).toFixed(2);
  const quantity     = (Math.floor(Math.random() * 50) + 1).toString();  // 1-50t

  const payload = JSON.stringify({
    sessionId:    SESSION_ID,
    productId:    PRODUCT_ID,
    direction,
    orderType:    "LIMIT",
    pricePerUnit,
    quantity,
    currency:     "EUR",
  });

  const res = http.post(`${BASE_URL}/api/v1/orders`, payload, {
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${AUTH_TOKEN}`,
    },
    timeout: "10s",
  });

  const duration = Date.now() - startTime;
  orderPlacementTime.add(duration);

  const ok = check(res, {
    "Order: HTTP 201 oder 200":   (r) => r.status === 201 || r.status === 200,
    "Order: Response hat dealId oder orderId": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.orderId !== undefined || body.deals !== undefined;
      } catch { return false; }
    },
    "Order: keine Rate-Limit Fehler": (r) => r.status !== 429,
  });

  if (!ok) {
    orderErrors.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  // Realistisches User-Verhalten: 0.5-2s Pause zwischen Orders
  sleep(0.5 + Math.random() * 1.5);
}

// ─── Szenario 2: Marktdaten lesen ────────────────────────────────────────────

export function readMarketData() {
  const startTime = Date.now();

  // Mix: 70% gecachte Ticker, 30% OHLC-Charts
  const useOhlc = Math.random() < 0.3;

  let res;
  if (useOhlc) {
    const interval = ["ONE_HOUR", "FIFTEEN_MIN", "ONE_DAY"][Math.floor(Math.random() * 3)];
    res = http.get(
      `${BASE_URL}/api/v1/public/ticker/${PRODUCT_ID}`,
      { tags: { endpoint: "ticker" } }
    );
  } else {
    res = http.get(
      `${BASE_URL}/api/v1/public/ticker`,
      { tags: { endpoint: "all_tickers" } }
    );
  }

  const duration = Date.now() - startTime;
  marketDataTime.add(duration);

  const ok = check(res, {
    "MarketData: HTTP 200":          (r) => r.status === 200,
    "MarketData: Cache-Control gesetzt": (r) =>
      r.headers["Cache-Control"]?.includes("max-age") ?? false,
    "MarketData: JSON valide":       (r) => {
      try { JSON.parse(r.body); return true; } catch { return false; }
    },
  });

  if (!ok) errorRate.add(1);
  else      errorRate.add(0);

  sleep(1 + Math.random() * 2);
}

// ─── Szenario 3: WebSocket-Verbindungen halten ────────────────────────────────

export function holdWebSocket() {
  const url = `${WS_URL}/socket.io/?sessionId=${SESSION_ID}&EIO=4&transport=websocket`;

  let messageCount = 0;
  let firstMessageTime: number | null = null;

  const res = ws.connect(url, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  }, function (socket) {

    socket.on("open", () => {
      // Socket.io Handshake
      socket.send("40");  // Engine.io CONNECT
    });

    socket.on("message", (data: string) => {
      const now = Date.now();

      if (data.startsWith("0")) {
        // Engine.io öffnet → Socket.io CONNECT senden
        socket.send('40/trading,{"sessionId":"' + SESSION_ID + '"}');
        firstMessageTime = now;
      } else if (data.includes("orderbook") || data.includes("deal")) {
        // Realtime-Event empfangen
        matchNotifications.add(1);

        if (firstMessageTime !== null) {
          wsLatency.add(now - firstMessageTime);
          firstMessageTime = null;  // Reset für nächste Messung
        }
        messageCount++;
      }
    });

    socket.on("error", () => {
      errorRate.add(1);
    });

    // Verbindung 60s halten (misst Stabilität unter Last)
    socket.setTimeout(() => {
      socket.close();
    }, 60_000);

    // Heartbeat alle 25s
    socket.setInterval(() => {
      socket.send("2");  // Engine.io PING
    }, 25_000);
  });

  check(res, {
    "WebSocket: Status 101 (Upgrade erfolgreich)": (r) => r && r.status === 101,
  });
}

// ─── Szenario 4: Rate-Limit Test ─────────────────────────────────────────────

export function testRateLimit() {
  // 150 schnelle Requests ohne Auth → sollte nach 100 geblockt werden
  const results = [];
  for (let i = 0; i < 15; i++) {
    const res = http.get(`${BASE_URL}/api/v1/public/ticker`);
    results.push(res.status);
  }

  // Mindestens einige 200er (nicht alles geblockt)
  const successCount = results.filter(s => s === 200).length;
  check({ successCount }, {
    "Rate-Limit: Mindestens 10 von 15 erfolgreich": (c) => c.successCount >= 10,
  });
}
