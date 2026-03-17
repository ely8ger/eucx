import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * @Roles(Role.SUPER_ADMIN, Role.COMPLIANCE_OFFICER)
 *
 * Markiert einen Controller oder eine Route-Methode als RBAC-geschützt.
 * Zusammen mit dem RolesGuard wird geprüft, ob req.user.role in dieser Liste steht.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
