/**
 * WebhookController — /api/v1/webhooks
 *
 *   POST   /webhooks              — Neuen Endpunkt registrieren
 *   GET    /webhooks              — Alle Endpunkte der Org
 *   DELETE /webhooks/:id          — Endpunkt deaktivieren
 *   GET    /webhooks/:id/deliveries  — Delivery-Log (letzte 100)
 *   POST   /webhooks/:id/deliveries/:deliveryId/redeliver — Erneut senden
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { JwtAuthGuard }   from "../../common/guards/jwt-auth.guard";
import type { WebhookEvent } from "@prisma/client";

type AuthRequest = { user: { userId: string; organizationId: string } };

@Controller("webhooks")
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createEndpoint(
    @Body() body: { url: string; events: WebhookEvent[]; description?: string },
    @Request() req: AuthRequest,
  ) {
    return this.webhookService.createEndpoint(req.user.organizationId, body);
  }

  @Get()
  listEndpoints(@Request() req: AuthRequest) {
    return this.webhookService.listEndpoints(req.user.organizationId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  deleteEndpoint(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.webhookService.deleteEndpoint(id, req.user.organizationId);
  }

  @Get(":id/deliveries")
  listDeliveries(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.webhookService.listDeliveries(id, req.user.organizationId);
  }

  @Post(":id/deliveries/:deliveryId/redeliver")
  @HttpCode(HttpStatus.ACCEPTED)
  redeliver(
    @Param("deliveryId") deliveryId: string,
    @Request() req: AuthRequest,
  ) {
    return this.webhookService.redelivery(deliveryId, req.user.organizationId);
  }
}
