import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { TradingModule } from "./modules/trading/trading.module";
import { AuditModule } from "./modules/audit/audit.module";

@Module({
  imports: [
    // ─── Konfiguration aus .env ──────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ─── Rate Limiting (Security) ────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: "short",  ttl: 1000,  limit: 10  },   // max 10 req/s
      { name: "medium", ttl: 60000, limit: 100 },   // max 100 req/min
    ]),

    // ─── Feature Module ──────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    TradingModule,
    AuditModule,
  ],
})
export class AppModule {}
