import { Module }            from "@nestjs/common";
import { BullModule }        from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService }     from "../../config/prisma.service";
import { WebhookService, WEBHOOK_QUEUE } from "./webhook.service";
import { WebhookProcessor }  from "./webhook.processor";
import { WebhookController } from "./webhook.controller";

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: WEBHOOK_QUEUE,
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host:     cfg.get("REDIS_HOST", "localhost"),
          port:     cfg.get<number>("REDIS_PORT", 6379),
          password: cfg.get("REDIS_PASSWORD"),
          ...(cfg.get("REDIS_TLS") === "true" ? { tls: {} } : {}),
        },
        defaultJobOptions: {
          attempts: 4,
          backoff: {
            // Delays: 0 / 5min / 15min / 60min
            type:   "exponential",
            delay:  5 * 60_000,   // 5min base — BullMQ verdoppelt: 5→10→20min
                                   // Für exakt 5/15/60: custom backoff im Processor
          },
          removeOnComplete: { age: 7 * 86_400, count: 5_000 },
          removeOnFail:     { age: 30 * 86_400 },
        },
      }),
    }),
  ],
  providers:   [PrismaService, WebhookService, WebhookProcessor],
  controllers: [WebhookController],
  exports:     [WebhookService],  // Andere Module können dispatch() aufrufen
})
export class WebhookModule {}
