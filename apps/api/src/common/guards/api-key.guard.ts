/**
 * ApiKeyGuard — Authentifiziert eingehende Requests via X-EUCX-API-KEY Header
 *
 * Verwendung:
 *   @UseGuards(ApiKeyGuard)
 *   @ApiScope("trade:write")    ← optional: welcher Scope erforderlich
 *   async placeOrder(...)
 *
 * Ohne @ApiScope() → jeder aktive Key mit beliebigem Scope hat Zugriff.
 *
 * Request-Enrichment:
 *   Setzt req.apiKeyOrg = { id, name } und req.apiKeyScopes = ["market:read", ...]
 *   Downstream-Handler können darauf zugreifen.
 *
 * IP-Whitelist:
 *   Wenn key.ipWhitelist.length > 0, muss req.ip in der Liste stehen.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector }    from "@nestjs/core";
import { ApiKeyService, type ApiScope } from "../../modules/api-keys/api-key.service";

export const API_SCOPE_KEY    = "apiScope";
export const RequireApiScope  = (scope: ApiScope) => SetMetadata(API_SCOPE_KEY, scope);

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector:     Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers:    Record<string, string | string[] | undefined>;
      ip?:        string;
      ips?:       string[];
      apiKeyOrg?:    { id: string; name: string };
      apiKeyScopes?: string[];
    }>();

    const rawKey = req.headers["x-eucx-api-key"];
    if (!rawKey || typeof rawKey !== "string") {
      throw new UnauthorizedException("X-EUCX-API-KEY Header fehlt");
    }

    const requiredScope = this.reflector.getAllAndOverride<ApiScope | undefined>(
      API_SCOPE_KEY,  // gesetzt durch @RequireApiScope()
      [context.getHandler(), context.getClass()],
    );

    const keyRecord = await this.apiKeyService.validateKey(rawKey, requiredScope);

    // IP-Whitelist prüfen
    if (keyRecord.ipWhitelist.length > 0) {
      const clientIp = req.ips?.[0] ?? req.ip ?? "";
      if (!keyRecord.ipWhitelist.includes(clientIp)) {
        throw new UnauthorizedException(`IP ${clientIp} nicht in Whitelist`);
      }
    }

    // Request enrichen — Downstream-Handler sehen org + scopes
    req.apiKeyOrg    = { id: keyRecord.organization.id, name: keyRecord.organization.name };
    req.apiKeyScopes = keyRecord.scopes;

    return true;
  }
}
