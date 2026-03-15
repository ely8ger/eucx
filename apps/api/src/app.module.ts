import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { AuthModule }     from "./modules/auth/auth.module";
import { UsersModule }    from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule }   from "./modules/orders/orders.module";
import { TradingModule }  from "./modules/trading/trading.module";
import { AuditModule }    from "./modules/audit/audit.module";
import { HealthModule }   from "./modules/health/health.module";
import { EucxThrottlerGuard } from "./common/guards/throttler.guard";
import { pinoLoggerConfig }   from "./config/logger.config";

@Module({
  imports: [
    // ─── Konfiguration aus .env ──────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ─── Pino Structured Logger (JSON in Prod, pretty in Dev) ───────────────
    LoggerModule.forRoot(pinoLoggerConfig),

    // ─── Rate Limiting — Default: 100/min (anonym), 1000/min (auth) ─────────
    // EucxThrottlerGuard überschreibt das Limit dynamisch je nach JWT-Status
    ThrottlerModule.forRoot([
      {
        name:  "global",
        ttl:   60_000,  // 1 Minute
        limit: 100,     // Basis-Limit für anonyme IPs
      },
    ]),

    // ─── Feature Module ──────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    TradingModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    // Globaler Rate-Limiter Guard — für ALLE Routen aktiv
    {
      provide:  APP_GUARD,
      useClass: EucxThrottlerGuard,
    },
  ],
})
export class AppModule {}
