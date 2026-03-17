/**
 * ApiKeyController — /api/v1/api-keys
 *
 * Alle Endpunkte sind JWT-geschützt (der eingeloggte User verwaltet seine Keys).
 *
 *   POST   /api-keys          — Neuen Key erstellen (fullKey einmalig in Response)
 *   GET    /api-keys          — Alle Keys der Org auflisten (kein secret!)
 *   DELETE /api-keys/:id      — Key deaktivieren (Revoke)
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
import { ApiKeyService, type CreateApiKeyDto } from "./api-key.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

type AuthRequest = {
  user: { userId: string; organizationId: string };
};

@Controller("api-keys")
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createKey(@Body() dto: CreateApiKeyDto, @Request() req: AuthRequest) {
    return this.apiKeyService.createKey(req.user.organizationId, req.user.userId, dto);
  }

  @Get()
  listKeys(@Request() req: AuthRequest) {
    return this.apiKeyService.listKeys(req.user.organizationId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  revokeKey(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.apiKeyService.revokeKey(id, req.user.organizationId);
  }
}
