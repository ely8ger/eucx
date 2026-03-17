/**
 * RolesGuard — RBAC für EUCX Backoffice
 *
 * Funktionsweise:
 *   1. Liest @Roles(...) Metadaten von der Route
 *   2. Vergleicht mit req.user.role (aus JWT-Payload, gesetzt durch JwtAuthGuard)
 *   3. Lehnt ab wenn keine Übereinstimmung → 403 Forbidden
 *
 * Sicherheit:
 *   - Wird NACH dem JwtAuthGuard ausgeführt (req.user ist garantiert gesetzt)
 *   - SUPER_ADMIN hat immer Zugriff, unabhängig von @Roles()
 *   - Keine @Roles() → Route ist für alle authentifizierten User zugänglich
 *
 * Verwendung:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles("COMPLIANCE_OFFICER", "SUPER_ADMIN")
 *   async approveKyc(...) { ... }
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Erlaubte Rollen aus Metadaten lesen
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Keine @Roles() → kein RBAC-Check notwendig
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const userRole = request.user?.role;

    // SUPER_ADMIN hat immer Zugriff — unabhängig von @Roles()
    if (userRole === "SUPER_ADMIN") {
      return true;
    }

    if (!userRole || !requiredRoles.includes(userRole as UserRole)) {
      throw new ForbiddenException(
        `Zugriff verweigert. Erforderliche Rollen: ${requiredRoles.join(", ")}`
      );
    }

    return true;
  }
}
