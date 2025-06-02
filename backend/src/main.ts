import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe, Logger } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { join } from "path"
import * as express from "express"
import * as compression from "compression"
import * as helmet from "helmet"
import * as rateLimit from "express-rate-limit"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
import { TransformInterceptor } from "./common/interceptors/transform.interceptor"
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor"

async function bootstrap() {
  const logger = new Logger("Bootstrap")
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  })

  // Security middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  )

  // Compression
  app.use(compression())

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    }),
  )

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter())

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor())

  // Serve static files
  app.use("/uploads", express.static(join(__dirname, "..", "uploads")))

  // API prefix
  app.setGlobalPrefix("api", {
    exclude: ["health", "metrics"],
  })

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("ManageAssets API")
    .setDescription("API documentation for the ManageAssets application")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management endpoints")
    .addTag("assets", "Asset management endpoints")
    .addTag("inventory", "Inventory management endpoints")
    .addTag("maintenance", "Maintenance management endpoints")
    .addTag("branches", "Branch management endpoints")
    .addTag("reports", "Reporting endpoints")
    .addTag("audit", "Audit trail endpoints")
    .addTag("certificates", "Certificate management endpoints")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)

  logger.log(`Application is running on: ${await app.getUrl()}`)
  logger.log(`Swagger documentation available at: ${await app.getUrl()}/api/docs`)
}
bootstrap()
