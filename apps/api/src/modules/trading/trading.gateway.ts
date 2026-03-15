import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger, UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";

/**
 * EUCX Trading Gateway — Echtzeit-WebSocket für Orderbuch-Updates.
 * Skill 1: Real-Time Messaging (Socket.io)
 *
 * Pattern (aus LMAX Disruptor / IEX Cloud Research):
 * - Clients subscriben auf Session-Rooms (sessionId)
 * - Server broadcast bei jedem Orderbuch-Update
 * - Latenz-Ziel: < 50ms vom Matching bis zum Client
 */
@WebSocketGateway({
  namespace: "/trading",
  cors: { origin: process.env.FRONTEND_URL ?? "https://eucx.eu", credentials: true },
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client verbunden: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client getrennt: ${client.id}`);
  }

  /** Client tritt einer Handelssitzung bei */
  @SubscribeMessage("join_session")
  handleJoin(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`session:${data.sessionId}`);
    client.emit("joined", { sessionId: data.sessionId });
  }

  /** Orderbuch-Update an alle Teilnehmer einer Session senden */
  broadcastOrderBook(sessionId: string, orderBook: unknown) {
    this.server.to(`session:${sessionId}`).emit("orderbook_update", {
      type:      "orderbook_snapshot",
      payload:   orderBook,
      timestamp: new Date().toISOString(),
    });
  }

  /** Deal-Benachrichtigung senden */
  broadcastDeal(sessionId: string, deal: unknown) {
    this.server.to(`session:${sessionId}`).emit("deal_matched", {
      type:      "deal_matched",
      payload:   deal,
      timestamp: new Date().toISOString(),
    });
  }
}
