import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from "@nestjs/websockets";
import { Logger, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";

/**
 * EUCX TradingGateway — Socket.io Real-Time Engine
 *
 * Architektur (aus "Scalable WebSocket architecture for trading" Research):
 *
 * ROOMS:
 *   session:{sessionId}   — Alle Händler einer konkreten Sitzung
 *   category:{slug}       — Alle Beobachter einer Warengruppe (z.B. "METALS")
 *   user:{userId}         — Private Notifications (Order-Status, Deal)
 *
 * SCALING:
 *   Redis Adapter (socket.io-adapter-redis) erlaubt horizontales Skalieren
 *   auf N API-Server. Jeder Server published zu Redis, alle anderen empfangen.
 *   → Latenz bleibt < 10ms auch bei 10.000 gleichzeitigen Verbindungen.
 *
 * RACE CONDITIONS:
 *   Nicht der Gateway, sondern die MatchingService-Transaktion (PostgreSQL
 *   SELECT FOR UPDATE + Advisory Lock) ist der Serialisierungspunkt.
 *   Der Gateway nur broadcastet — er matched nicht selbst.
 *
 * JWT AUTH:
 *   Jede Verbindung wird beim "connection"-Event durch den Token geprüft.
 *   Ungültige Tokens → Socket sofort trennen.
 */
@WebSocketGateway({
  namespace: "/trading",
  cors: {
    origin:      process.env.FRONTEND_URL ?? "https://eucx.eu",
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradingGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  // ─── Connection Auth ────────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    // JWT aus Handshake-Header oder Query-Parameter
    const token =
      (client.handshake.auth["token"] as string | undefined) ??
      (client.handshake.query["token"] as string | undefined);

    if (!token) {
      this.logger.warn(`[WS] Verbindung ohne Token: ${client.id}`);
      client.emit("error", { code: "UNAUTHORIZED", message: "JWT fehlt" });
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{
        sub: string; email: string; role: string; orgId: string;
      }>(token);

      // User-Daten am Socket speichern für spätere Events
      client.data["userId"] = payload.sub;
      client.data["orgId"]  = payload.orgId;
      client.data["role"]   = payload.role;

      // Automatisch in privaten User-Room
      await client.join(`user:${payload.sub}`);

      this.logger.log(`[WS] ${payload.email} (${payload.role}) verbunden`);
    } catch {
      client.emit("error", { code: "INVALID_TOKEN", message: "Token ungültig oder abgelaufen" });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WS] Client getrennt: ${client.id}`);
  }

  // ─── Client Events ──────────────────────────────────────────────────────────

  /**
   * Client tritt einer Handelssitzung bei.
   * → Empfängt alle Orderbuch-Updates für genau diese Session.
   */
  @SubscribeMessage("join_session")
  async handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.sessionId) throw new WsException("sessionId fehlt");

    await client.join(`session:${data.sessionId}`);
    client.emit("joined", { room: `session:${data.sessionId}`, ts: Date.now() });
    this.logger.log(`[WS] ${client.id} joined session:${data.sessionId}`);
  }

  /**
   * Client subscribt auf eine Warengruppe.
   * → Empfängt Preis-Ticker für die gesamte Kategorie (z.B. alle Metallpreise).
   * Wichtig für Performance: Kupfer-Händler sieht nur Metall-Events, keine Agrar-Events.
   */
  @SubscribeMessage("subscribe_category")
  async handleSubscribeCategory(
    @MessageBody() data: { categorySlug: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.categorySlug) throw new WsException("categorySlug fehlt");

    await client.join(`category:${data.categorySlug}`);
    client.emit("subscribed", { room: `category:${data.categorySlug}` });
  }

  @SubscribeMessage("leave_session")
  async handleLeaveSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`session:${data.sessionId}`);
  }

  // ─── Server → Client Broadcasts ────────────────────────────────────────────

  /**
   * Neues Gebot (Bid/Ask) eingegangen.
   * → Sofort an alle Teilnehmer der Session broadcasten.
   * Latenz-Ziel: < 50ms nach DB-Write.
   */
  broadcastNewBid(sessionId: string, bid: BidPayload) {
    this.server.to(`session:${sessionId}`).emit("new_bid", {
      type:      "new_bid",
      payload:   bid,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Vollständiger Orderbuch-Snapshot.
   * Wird nach jeder Matching-Runde gesendet.
   */
  broadcastOrderBook(sessionId: string, orderBook: OrderBookPayload) {
    this.server.to(`session:${sessionId}`).emit("orderbook_update", {
      type:      "orderbook_snapshot",
      payload:   orderBook,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Deal abgeschlossen (Kauf = Verkauf Match).
   * → An Session-Room + private User-Rooms beider Parteien.
   */
  broadcastDeal(sessionId: string, deal: DealPayload) {
    // An alle Teilnehmer der Session
    this.server.to(`session:${sessionId}`).emit("deal_matched", {
      type:      "deal_matched",
      payload:   deal,
      timestamp: new Date().toISOString(),
    });

    // Private Benachrichtigung an Käufer und Verkäufer
    if (deal.buyerUserId) {
      this.server.to(`user:${deal.buyerUserId}`).emit("your_deal", { ...deal, yourSide: "BUY" });
    }
    if (deal.sellerUserId) {
      this.server.to(`user:${deal.sellerUserId}`).emit("your_deal", { ...deal, yourSide: "SELL" });
    }
  }

  /**
   * Order-Status-Update (z.B. PARTIALLY_FILLED → FILLED).
   * → Nur an den betroffenen User.
   */
  notifyOrderUpdate(userId: string, order: OrderUpdatePayload) {
    this.server.to(`user:${userId}`).emit("order_update", {
      type:      "order_update",
      payload:   order,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Preis-Ticker für Kategorie-Beobachter.
   * → An category:{slug} Room.
   */
  broadcastPriceTick(categorySlug: string, tick: PriceTickPayload) {
    this.server.to(`category:${categorySlug}`).emit("price_tick", tick);
  }

  /**
   * Session-Status-Wechsel (z.B. TRADING_1 → CORRECTION_1).
   */
  broadcastSessionStatus(sessionId: string, status: string) {
    this.server.to(`session:${sessionId}`).emit("session_status", {
      type:    "session_period_changed",
      status,
      ts:      Date.now(),
    });
  }
}

// ─── Payload-Typen ────────────────────────────────────────────────────────────

export interface BidPayload {
  orderId:      string;
  direction:    "BUY" | "SELL";
  pricePerUnit: string;  // Decimal-String
  quantity:     string;
  currency:     string;
  orgId:        string;
}

export interface OrderBookPayload {
  asks: PriceLevelPayload[];
  bids: PriceLevelPayload[];
  spread?: string;
  ts:     number;
}

export interface PriceLevelPayload {
  price:      string;
  quantity:   string;
  orderCount: number;
}

export interface DealPayload {
  dealId:       string;
  pricePerUnit: string;
  quantity:     string;
  totalValue:   string;
  currency:     string;
  buyerUserId?:  string;
  sellerUserId?: string;
}

export interface OrderUpdatePayload {
  orderId:       string;
  status:        string;
  filledQty:     string;
  remainingQty:  string;
}

export interface PriceTickPayload {
  categorySlug: string;
  lastPrice:    string;
  change24h:    string;
  volume24h:    string;
  ts:           number;
}
