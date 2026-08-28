/**
 * Audit Logger — immutable event sourcing.
 * Regel: NIEMALS löschen/updaten. Nur INSERT.
 */
import { db }        from "@/lib/db/client";
import { Prisma }    from "@prisma/client";

export type AuditAction =
  // Auth
  | "USER_LOGIN"
  | "USER_LOGIN_FAILED"
  | "USER_REGISTER"
  | "USER_LOGOUT"
  // KYC
  | "KYC_STEP_COMPLETED"
  | "KYC_SUBMITTED"
  // Käufer-Funnel
  | "LOT_CREATED"
  | "LOT_PUBLISHED"
  // Verkäufer-Funnel
  | "INVENTORY_CHARGE_CREATED"
  | "BID_SUBMITTED"
  | "BID_BLOCKED_DEAL_LIMIT"
  // Katalog
  | "CATALOG_SEARCH_NO_RESULT"
  // Abschlüsse
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
  | "SETTLEMENT_COMPLETED"
  | "SETTLEMENT_FAILED"
  | "ADMIN_ACTION";

export type AuditEntityType =
  | "User"
  | "Lot"
  | "Bid"
  | "SellerCharge"
  | "Order"
  | "Deal"
  | "Contract"
  | "Settlement"
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
        action:     params.action,
        entityType: params.entityType,
        entityId:   params.entityId,
        ipAddress:  params.ipAddress,
        userAgent:  params.userAgent,
        meta:       params.meta ? (params.meta as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    console.error("[audit] Failed to write audit log:", params.action);
  }
}
