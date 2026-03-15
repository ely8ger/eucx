/**
 * Pino Structured Logging Konfiguration
 *
 * JSON-Output: Timestamp, Level, Context, RequestId, UserId, IP
 * In Entwicklung: pino-pretty für lesbare Ausgabe
 * In Produktion:  JSON-Lines → Loki / Elasticsearch / CloudWatch
 */

import type { Params } from "nestjs-pino";
import type { IncomingMessage, ServerResponse } from "http";

const isDev = process.env.NODE_ENV !== "production";

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),

    // Entwicklung: lesbar formatiert
    ...(isDev
      ? {
          transport: {
            target:  "pino-pretty",
            options: {
              colorize:      true,
              translateTime: "SYS:HH:MM:ss.l",
              ignore:        "pid,hostname",
              singleLine:    false,
            },
          },
        }
      : {}),

    // Sensible Request-Felder herausfiltern
    serializers: {
      req(req: IncomingMessage & { socket?: { remoteAddress?: string } }) {
        const headers = req.headers as Record<string, string | string[] | undefined>;
        return {
          method: req.method,
          path:   req.url,
          ip:     (headers["x-forwarded-for"] as string) ?? req.socket?.remoteAddress,
          // Authorization-Header NIEMALS loggen
        };
      },
      res(res: ServerResponse) {
        return { statusCode: res.statusCode };
      },
    },

    // Request-ID und User-ID als Felder anhängen
    customProps: (req: IncomingMessage) => {
      const headers = req.headers as Record<string, string | undefined>;
      const user    = (req as IncomingMessage & { user?: { id?: string } }).user;
      return {
        requestId: headers["x-request-id"],
        userId:    user?.id,
        env:       process.env.NODE_ENV ?? "development",
      };
    },

    // Health-Checks aus automatischen Request-Logs heraushalten
    autoLogging: {
      ignore: (req: IncomingMessage) =>
        (req.url?.startsWith("/api/v1/health") || req.url?.startsWith("/health")) ?? false,
    },
  },
};
