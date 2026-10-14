import { Module }        from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService }  from "../../config/prisma.service";
import { MarketDataService } from "./market.service";
import Redis              from "ioredis";

// Redis-Provider identisch zu PublicModule — ermöglicht Cache-Invalidierung nach Deal
const RedisProvider = {
  provide:    "REDIS_CLIENT",
  inject:     [ConfigService],
  useFactory: (cfg: ConfigService) => {
    try {
      return new Redis({
        host:               cfg.get("REDIS_HOST",     "localhost"),
        port:               cfg.get<number>("REDIS_PORT", 6379),
        password:           cfg.get("REDIS_PASSWORD"),
        lazyConnect:        true,
        enableOfflineQueue: false,
        ...(cfg.get("REDIS_TLS") === "true" ? { tls: {} } : {}),
      });
    } catch {
      return null;
    }
  },
};

@Module({
  imports:   [ConfigModule],
  providers: [PrismaService, RedisProvider, MarketDataService],
  exports:   [MarketDataService],
})
export class MarketModule {}
