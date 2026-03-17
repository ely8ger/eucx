/**
 * WebhookService — Signierter Webhook-Versand mit BullMQ-Retry
 *
 * ─── Sicherheit (HMAC-SHA256) ────────────────────────────────────────────────
 *
 *   Jeder WebhookEndpoint hat ein signingSecret (32 Bytes, Hex).
 *   Vor dem Senden:
 *     signature = HMAC-SHA256(payload_json, signingSecret).hex()
 *     Header: X-EUCX-Signature: sha256={signature}
 *     Header: X-EUCX-Event: TRADE_MATCHED
 *     Header: X-EUCX-Delivery: {deliveryId}
 *     Header: X-EUCX-Timestamp: {unix_ms}
 *
 *   Der Empfänger prüft:
 *     expectedSig = HMAC-SHA256(request.body, secret).hex()
 *     assert(X-EUCX-Signature == "sha256=" + expectedSig)
 *     assert(Math.abs(Date.now() - X-EUCX-Timestamp) < 300_000)  // 5min Fenster
 *
 *   → Schutz gegen: Replay-Angriffe, Payload-Manipulation, Fake-Requests
 *
 * ─── Retry-Strategie ─────────────────────────────────────────────────────────
 *
 *   Versuch 1: sofort
 *   Versuch 2: nach 5 Minuten
 *   Versuch 3: nach 15 Minuten
 *   Versuch 4: nach 60 Minuten
 *   → FAILED (keine weiteren Versuche)
 *
 *   Implementierung: BullMQ Job mit attempts=4, backoff=custom (5/15/60 min)
 *
 * ─── Event-Typen ─────────────────────────────────────────────────────────────
 *
 *   TRADE_MATCHED          → { dealId, productName, price, quantity, ... }
 *   TRADE_SETTLEMENT_COMPLETE → { dealId, buyerOrg, sellerOrg, totalValue, ... }
 *   CONTRACT_SIGNED        → { dealId, contractId, signedAt, pdfHash }
 *   ORDER_PLACED           → { orderId, direction, price, quantity }
 *   ORDER_CANCELLED        → { orderId, reason }
 *   TRADE_CANCELLED        → { dealId, reason, stornoAt }
 *   TRADE_DISPUTED         → { dealId, reason }
 */

import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue }        from "@nestjs/bullmq";
import { Queue }              from "bullmq";
import { PrismaService }      from "../../config/prisma.service";
import { createHmac, randomBytes } from "crypto";
import type { WebhookEvent }  from "@prisma/client";

export const WEBHOOK_QUEUE = "WEBHOOK_DELIVERY";

// Shape des BullMQ-Jobs
export interface WebhookJobData {
  deliveryId: string;
  endpointId: string;
  url:        string;
  event:      WebhookEvent;
  payload:    Record<string, unknown>;
  signingSecret: string;
  attempt:    number;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma:        PrismaService,
    @InjectQueue(WEBHOOK_QUEUE)
    private readonly webhookQueue:  Queue<WebhookJobData>,
  ) {}

  // ─── Events dispatchen ────────────────────────────────────────────────────

  /**
   * Wird nach relevanten Ereignissen aufgerufen (z.B. nach Matching, Settlement).
   * Sucht alle aktiven Webhooks der betroffenen Org, die dieses Event abonniert haben.
   * Legt für jeden einen BullMQ-Job an.
   */
  async dispatch(
    event:          WebhookEvent,
    organizationId: string,
    payload:        Record<string, unknown>,
  ): Promise<void> {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        organizationId,
        isActive: true,
        events:   { has: event },
      },
    });

    if (endpoints.length === 0) return;

    for (const endpoint of endpoints) {
      // Delivery-Record anlegen (für Audit + Re-Delivery)
      const delivery = await this.prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload:    payload as Parameters<typeof this.prisma.webhookDelivery.create>[0]["data"]["payload"],
          status:     "PENDING",
        },
      });

      // BullMQ-Job — attempts=4, custom backoff
      await this.webhookQueue.add(
        `webhook:${event}`,
        {
          deliveryId:    delivery.id,
          endpointId:    endpoint.id,
          url:           endpoint.url,
          event,
          payload,
          signingSecret: endpoint.signingSecret,
          attempt:       0,
        },
        {
          attempts: 4,
          backoff: {
            type:  "custom",  // BullMQ custom backoff über Processor
            delay: 0,
          },
          jobId: `delivery:${delivery.id}`,  // Idempotenz
        }
      );
    }
  }

  // ─── Signatur-Hilfsmethode ────────────────────────────────────────────────

  static sign(payloadJson: string, secret: string): string {
    return `sha256=${createHmac("sha256", secret).update(payloadJson).digest("hex")}`;
  }

  // ─── Webhook-Endpunkte verwalten ──────────────────────────────────────────

  async createEndpoint(
    organizationId: string,
    data: {
      url:         string;
      events:      WebhookEvent[];
      description?: string;
    },
  ) {
    const signingSecret = randomBytes(32).toString("hex");  // 64 Hex-Zeichen

    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        organizationId,
        url:           data.url,
        events:        data.events,
        signingSecret,
        description:   data.description,
      },
      select: {
        id:            true,
        url:           true,
        events:        true,
        description:   true,
        isActive:      true,
        signingSecret: true,   // einmalig zurückgeben
        createdAt:     true,
      },
    });

    return endpoint;
  }

  async listEndpoints(organizationId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { organizationId },
      select: {
        id:              true,
        url:             true,
        events:          true,
        description:     true,
        isActive:        true,
        successCount:    true,
        failureCount:    true,
        lastTriggeredAt: true,
        lastStatusCode:  true,
        createdAt:       true,
        // signingSecret NICHT zurückgeben (nur bei Erstellung)
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteEndpoint(id: string, organizationId: string): Promise<void> {
    await this.prisma.webhookEndpoint.updateMany({
      where: { id, organizationId },
      data:  { isActive: false },
    });
  }

  async listDeliveries(endpointId: string, organizationId: string) {
    // Ownership prüfen
    const endpoint = await this.prisma.webhookEndpoint.findFirst({
      where: { id: endpointId, organizationId },
    });
    if (!endpoint) return [];

    return this.prisma.webhookDelivery.findMany({
      where:   { endpointId },
      orderBy: { createdAt: "desc" },
      take:    100,
      select: {
        id:            true,
        event:         true,
        status:        true,
        attemptCount:  true,
        lastStatusCode: true,
        lastError:     true,
        createdAt:     true,
        updatedAt:     true,
      },
    });
  }

  /** Manuelle Re-Delivery — für Debugging */
  async redelivery(deliveryId: string, organizationId: string): Promise<void> {
    const delivery = await this.prisma.webhookDelivery.findFirst({
      where:   { id: deliveryId, endpoint: { organizationId } },
      include: { endpoint: true },
    });
    if (!delivery) throw new Error("Delivery nicht gefunden");

    await this.webhookQueue.add(
      `webhook:redeliver`,
      {
        deliveryId:    delivery.id,
        endpointId:    delivery.endpointId,
        url:           delivery.endpoint.url,
        event:         delivery.event,
        payload:       delivery.payload as Record<string, unknown>,
        signingSecret: delivery.endpoint.signingSecret,
        attempt:       0,
      },
      { jobId: `redeliver:${deliveryId}:${Date.now()}` }
    );
  }
}
