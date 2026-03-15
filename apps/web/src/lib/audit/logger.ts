/**
 * Audit Logger — Skill #3: Event Sourcing & Audit Logs.
 * In einer Börse ist "Löschen" verboten. Jeder Klick wird als
 * unveränderlicher Zeitstempel gespeichert.
 */
import { db } from "@/lib/db/client";

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGIN_FAILED"
  | "USER_REGISTER"
  | "USER_LOGOUT"
  | "ORDER_SUBMITTED"
  | "ORDER_CANCELLED"
  | "ORDER_MATCHED"
  | "DEAL_MATCHED"
  | "DEAL_CONFIRMED"
  | "DEAL_DISPUTED"
  | "SESSION_OPENED"
  | "SESSION_CLOSED"
  | "PRODUCT_CREATED"
  | "CONTRACT_GENERATED"
  | "CONTRACT_SIGNED"
  | "CONTRACT_SIGN_FAILED"
  | "ADMIN_ACTION";

export type AuditEntityType =
  | "User"
  | "Order"
  | "Deal"
  | "Contract"
  | "TradingSession"
  | "SteelProduct"
  | "Organization";

interface AuditParams {
  userId?:    string;
  action:     AuditAction;
  entityType: AuditEntityType;
  entityId?:  string;
  ipAddress?: string;
  userAgent?: string;
  meta?:      Record<string, unknown>;
}

/**
 * Write an immutable audit log entry.
 * Never throws — audit must not break the main flow.
 */
export async function audit(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId:     params.userId,
        action:     params.meta
          ? `${params.action} ${JSON.stringify(params.meta)}`
          : params.action,
        entityType: params.entityType,
        entityId:   params.entityId,
        ipAddress:  params.ipAddress,
        userAgent:  params.userAgent,
      },
    });
  } catch {
    // Audit failures are silent — never block business logic
    console.error("[audit] Failed to write audit log:", params.action);
  }
}
