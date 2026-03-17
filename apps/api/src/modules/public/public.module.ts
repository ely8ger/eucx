/**
 * PublicModule
 *
 * Redis-Client wird optional injiziert (REDIS_CLIENT token).
 * Falls Redis nicht verfügbar → Cache-Miss, DB-Query direkt.
 * Kein Crash wenn Redis down.
 */

import { Module }        from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../config/prisma.service";
import { PublicController } from "./public.controller";
import Redis              from "ioredis";

const RedisProvider = {
  provide:    "REDIS_CLIENT",
  inject:     [ConfigService],
  useFactory: (cfg: ConfigService) => {
    try {
      return new Redis({
        host:     cfg.get("REDIS_HOST",     "localhost"),
        port:     cfg.get<number>("REDIS_PORT", 6379),
        password: cfg.get("REDIS_PASSWORD"),
        lazyConnect: true,   // Kein Crash beim Start wenn Redis offline
        enableOfflineQueue: false,
        ...(cfg.get("REDIS_TLS") === "true" ? { tls: {} } : {}),
      });
    } catch {
      return null;   // null → Optional-Injection greift
    }
  },
};

@Module({
  providers:   [PrismaService, RedisProvider],
  controllers: [PublicController],
})
export class PublicModule {}
