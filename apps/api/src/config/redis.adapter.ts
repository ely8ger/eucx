/**
 * Redis Pub/Sub Adapter für Socket.io
 *
 * Pattern aus "Redis Pub/Sub for Socket.io scaling" Research:
 * Wenn EUCX auf 2+ API-Server skaliert, muss ein WebSocket-Event
 * von Server A auch Clients auf Server B erreichen.
 *
 * Lösung: Redis als Message Bus.
 *   Server A → Redis PUBLISH → Server B subscribt → broadcast zu lokalen Clients
 *
 * Aktivierung (in main.ts):
 *   const redisAdapter = await createRedisAdapter();
 *   if (redisAdapter) io.adapter(redisAdapter);
 *
 * Latenz: < 1ms Redis-Publish + < 1ms Socket.emit = < 2ms end-to-end (lokal)
 *         < 5ms bei Redis-Cluster über WAN
 */

import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { Logger } from "@nestjs/common";

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.warn("REDIS_URL nicht gesetzt — Socket.io ohne Redis-Adapter (single server)");
      return;
    }

    try {
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log("Redis Pub/Sub Adapter verbunden");
    } catch (err) {
      this.logger.warn(`Redis nicht erreichbar — Fallback auf In-Memory: ${String(err)}`);
    }
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
