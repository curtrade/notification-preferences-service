import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { setupSwagger, SWAGGER_PATH } from './swagger/setup-swagger';

// Severity order, least → most important. A configured LOG_LEVEL enables that
// level and every more-important one (e.g. "log" → log, warn, error, fatal).
const LEVELS: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'];

function enabledLevels(level: AppConfig['logLevel']): LogLevel[] {
  return LEVELS.slice(LEVELS.indexOf(level));
}

async function bootstrap(): Promise<void> {
  // Buffer logs until the configured level is read from AppConfig (a DI
  // provider, only available after the app is created), then apply it.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(AppConfig);
  app.useLogger(enabledLevels(config.logLevel));

  // Global input validation: strip unknown properties, reject extras,
  // and transform plain payloads into DTO instances.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Drain the Prisma pool on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  // Expose the OpenAPI document and Swagger UI.
  setupSwagger(app);

  await app.listen(config.port);
  Logger.log(`Notification Preferences Service listening on port ${config.port}`, 'Bootstrap');
  Logger.log(`Swagger UI available at /${SWAGGER_PATH}`, 'Bootstrap');
}

void bootstrap();
