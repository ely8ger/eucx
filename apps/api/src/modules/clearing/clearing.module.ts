/**
 * ClearingModule — BullMQ Queue + Processor + Controller
 *
 * Redis-Konfiguration:
 *   REDIS_HOST (Default: localhost)
 *   REDIS_PORT (Default: 6379)
 *   REDIS_PASSWORD (optional)
 *
 * Queue-Name: INVOICE_GENERATION
 * Worker-Concurrency: 5 (5 parallele Settlement-Jobs gleichzeitig)
 */

import { Module }            from "@nestjs/common";
import { BullModule }        from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService }     from "../../config/prisma.service";
import { AuditModule }       from "../audit/audit.module";
import { ClearingController } from "./clearing.controller";
import { ClearingProcessor, INVOICE_GENERATION_QUEUE } from "./clearing.processor";

@Module({
  imports: [
    ConfigModule,
    AuditModule,

    // ── BullMQ Queue registrieren ──────────────────────────────────────────
    BullModule.forRootAsync({
      imports:  [ConfigModule],
      inject:   [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host:     config.get<string>("REDIS_HOST", "localhost"),
          port:     config.get<number>("REDIS_PORT",  6379),
          password: config.get<string>("REDIS_PASSWORD"),
          // TLS in Produktion (Upstash, Redis Cloud, etc.)
          ...(config.get("REDIS_TLS") === "true"
            ? { tls: {} }
            : {}),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff:  { type: "exponential", delay: 5_000 },
        },
      }),
    }),

    BullModule.registerQueue({
      name:    INVOICE_GENERATION_QUEUE,
      // Worker-Options — nur aktiv wenn Processor registriert
      defaultJobOptions: {
        removeOnComplete: { age: 86_400, count: 1000 },
        removeOnFail:     { age: 7 * 86_400 },
      },
    }),
  ],
  providers:   [PrismaService, ClearingProcessor],
  controllers: [ClearingController],
  exports:     [BullModule],
})
export class ClearingModule {}
