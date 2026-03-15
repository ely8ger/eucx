import { NestFactory }                         from "@nestjs/core";
import { ValidationPipe, VersioningType }       from "@nestjs/common";
import { SwaggerModule, DocumentBuilder }       from "@nestjs/swagger";
import { Logger as PinoLogger }                 from "nestjs-pino";
import helmet                                   from "helmet";
import { AppModule }                            from "./app.module";
import { RedisIoAdapter }                       from "./config/redis.adapter";
import { GlobalHttpExceptionFilter }            from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Pino übernimmt das Logging — NestJS-Default-Logger deaktivieren
    bufferLogs: true,
  });

  // ─── Pino Logger aktivieren ────────────────────────────────────────────────
  app.useLogger(app.get(PinoLogger));

  const logger = app.get(PinoLogger);

  // ─── Redis Adapter für Socket.io (Skalierung auf N Server) ────────────────
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

  // ─── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin:      process.env.FRONTEND_URL ?? "https://eucx.eu",
    credentials: true,
  });

  // ─── API Versioning: /api/v1/... ───────────────────────────────────────────
  // URI-basiertes Versioning: /api/v1/auth/login, /api/v1/trading/...
  // Default-Version "1" → alle Controller ohne @Version() sind automatisch v1
  app.enableVersioning({
    type:           VersioningType.URI,
    defaultVersion: "1",
    prefix:         "api/v",
  });

  // ─── Global ExceptionFilter (Fehler-Maskierung) ────────────────────────────
  // Muss VOR ValidationPipe registriert werden
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // ─── Global Validation (class-validator) ──────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:             true,   // Felder ohne Decorator entfernen
      forbidNonWhitelisted:  true,
      transform:             true,   // Auto-Casting (string→number etc.)
      transformOptions:      { enableImplicitConversion: true },
      stopAtFirstError:      true,   // Performance: bei erstem Fehler stoppen
    }),
  );

  // ─── Request-ID Middleware (für Log-Correlation) ───────────────────────────
  // Hängt X-Request-ID an jede Response — Client und Logs teilen dieselbe ID
  app.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    const { randomUUID } = require("crypto") as { randomUUID: () => string };
    const requestId = randomUUID();
    (res as unknown as { setHeader: (k: string, v: string) => void }).setHeader("X-Request-ID", requestId);
    next();
  });

  // ─── Swagger / OpenAPI Dokumentation ──────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle("EUCX API v1")
    .setDescription("European Union Commodity Exchange — REST & WebSocket API")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth",     "Authentifizierung")
    .addTag("products", "Rohstoffprodukte")
    .addTag("trading",  "Handelssitzungen & Orderbuch")
    .addTag("orders",   "Order-Management")
    .addTag("deals",    "Abschlüsse & Verträge")
    .addTag("health",   "System-Status")
    .addTag("audit",    "Audit-Log")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/v1/docs", app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`EUCX API v1 läuft auf Port ${port}`, "Bootstrap");
  logger.log(`Swagger Docs: http://localhost:${port}/api/v1/docs`, "Bootstrap");
  logger.log(`Health Check: http://localhost:${port}/api/v1/health`, "Bootstrap");
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
