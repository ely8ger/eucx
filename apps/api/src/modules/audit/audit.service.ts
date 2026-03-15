import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

interface AuditEntry {
  userId:     string;
  action:     string;
  entityType?: string;
  entityId?:  string;
  meta?:      Record<string, unknown>;
}

/**
 * EUCX Audit Service — Event Sourcing & unveränderliche Logs.
 * Skill 3: Event Sourcing & Audit Logs
 *
 * Pattern: Jede Aktion wird als immutabler Zeitstempel gespeichert.
 * Löschen ist nicht erlaubt (Revisionssicherheit).
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId:     entry.userId,
        action:     entry.action,
        entityType: entry.entityType ?? "System",
        entityId:   entry.entityId,
        meta:       entry.meta ? (entry.meta as import("@prisma/client").Prisma.InputJsonObject) : undefined,
        createdAt:  new Date(),
      },
    });
  }
}
