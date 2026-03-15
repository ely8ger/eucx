import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  // ─── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "https://eucx.eu",
    credentials: true,
  });

  // ─── Global Validation (class-validator) ──────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Felder ohne Decorator entfernen
      forbidNonWhitelisted: true,
      transform: true,        // Auto-Casting (string→number etc.)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger / OpenAPI Dokumentation ──────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle("EUCX API")
    .setDescription("European Union Commodity Exchange — REST & WebSocket API")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth",     "Authentifizierung")
    .addTag("products", "Rohstoffprodukte")
    .addTag("trading",  "Handelssitzungen & Orderbuch")
    .addTag("orders",   "Order-Management")
    .addTag("deals",    "Abschlüsse")
    .addTag("audit",    "Audit-Log")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`EUCX API läuft auf Port ${port}`);
  logger.log(`Swagger Docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch(console.error);
