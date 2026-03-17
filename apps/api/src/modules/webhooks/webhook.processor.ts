/**
 * WebhookProcessor — BullMQ Worker für WEBHOOK_DELIVERY Queue
 *
 * Führt den eigentlichen HTTP-POST aus.
 * Retry-Delays: [0, 5min, 15min, 60min] bei attempts=4
 *
 * Nach jedem Versuch:
 *   - WebhookDelivery.attemptCount++, lastStatusCode, lastError, responseBody
 *   - WebhookEndpoint.successCount / failureCount, lastStatusCode, lastTriggeredAt
 *
 * Bei HTTP 2xx:
 *   - delivery.status = SUCCESS
 *
 * Bei Fehler (HTTP 4xx/5xx oder Netzwerk-Timeout):
 *   - letzter Versuch → delivery.status = FAILED
 *   - sonst           → delivery.status = RETRYING + nextRetryAt
 *
 * Signatur:
 *   X-EUCX-Signature: sha256={hmac}
 *   X-EUCX-Event:     TRADE_MATCHED
 *   X-EUCX-Delivery:  {deliveryId}
 *   X-EUCX-Timestamp: {unix_ms}
 */

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger }                from "@nestjs/common";
import { Job }                   from "bullmq";
import { PrismaService }         from "../../config/prisma.service";
import { WebhookService, WEBHOOK_QUEUE, type WebhookJobData } from "./webhook.service";

// Retry-Delays in Millisekunden
const RETRY_DELAYS_MS = [0, 5 * 60_000, 15 * 60_000, 60 * 60_000];

@Processor(WEBHOOK_QUEUE, { concurrency: 10 })
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<void> {
    const { deliveryId, url, event, payload, signingSecret } = job.data;
    const attemptsMade = job.attemptsMade;   // 0-based (0 = erster Versuch)
    const maxAttempts  = job.opts.attempts ?? 4;

    const payloadJson = JSON.stringify({
      event,
      timestamp: Date.now(),
      data:      payload,
    });

    const signature = WebhookService.sign(payloadJson, signingSecret);

    // HTTP-POST mit 10s Timeout
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 10_000);

    let statusCode: number | undefined;
    let responseBody = "";
    let errorMessage = "";

    try {
      const response = await fetch(url, {
        method:  "POST",
        headers: {
          "Content-Type":       "application/json",
          "X-EUCX-Signature":   signature,
          "X-EUCX-Event":       event,
          "X-EUCX-Delivery":    deliveryId,
          "X-EUCX-Timestamp":   String(Date.now()),
          "User-Agent":         "EUCX-Webhook/1.0",
        },
        body:   payloadJson,
        signal: controller.signal,
      });

      statusCode   = response.status;
      responseBody = await response.text().catch(() => "");

      if (!response.ok) {
        throw new Error(`HTTP ${statusCode}: ${responseBody.slice(0, 200)}`);
      }

      // Erfolg
      await this.prisma.$transaction([
        this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status:        "SUCCESS",
            attemptCount:  attemptsMade + 1,
            lastStatusCode: statusCode,
            responseBody:  responseBody.slice(0, 1000),
            nextRetryAt:   null,
          },
        }),
        this.prisma.webhookEndpoint.update({
          where: { id: job.data.endpointId },
          data: {
            successCount:    { increment: 1 },
            lastTriggeredAt: new Date(),
            lastStatusCode:  statusCode,
          },
        }),
      ]);

      this.logger.debug(`Webhook ${event} → ${url}: ${statusCode}`);

    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      const isLastAttempt = (attemptsMade + 1) >= maxAttempts;

      // nextRetryAt berechnen
      const nextDelay  = RETRY_DELAYS_MS[Math.min(attemptsMade + 1, RETRY_DELAYS_MS.length - 1)];
      const nextRetryAt = isLastAttempt ? null : new Date(Date.now() + nextDelay);

      await this.prisma.$transaction([
        this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status:        isLastAttempt ? "FAILED" : "RETRYING",
            attemptCount:  attemptsMade + 1,
            lastStatusCode: statusCode,
            lastError:     errorMessage,
            responseBody:  responseBody.slice(0, 1000),
            nextRetryAt,
          },
        }),
        this.prisma.webhookEndpoint.update({
          where: { id: job.data.endpointId },
          data: {
            failureCount:   { increment: 1 },
            lastTriggeredAt: new Date(),
            lastStatusCode:  statusCode,
          },
        }),
      ]);

      this.logger.warn(
        `Webhook ${event} → ${url} FAILED (attempt ${attemptsMade + 1}/${maxAttempts}): ${errorMessage}`
      );

      // BullMQ erneut werfen damit die Retry-Logik greift
      if (!isLastAttempt) {
        throw err;
      }

    } finally {
      clearTimeout(timeout);
    }
  }

  // BullMQ Custom Backoff: [0, 5min, 15min, 60min]
  // Wird in der Queue-Konfiguration als backoff.type="custom" registriert
}
