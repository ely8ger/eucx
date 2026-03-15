import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TradingGateway } from "./trading.gateway";
import { MatchingService } from "./matching.service";
import { PrismaService } from "../../config/prisma.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>("JWT_SECRET"),
      }),
    }),
    AuditModule,
  ],
  providers: [TradingGateway, MatchingService, PrismaService],
  exports:   [TradingGateway, MatchingService],
})
export class TradingModule {}
