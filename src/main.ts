import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  const config = app.get(AppConfig);
  await app.listen(config.port);
  Logger.log(`Notification Preferences Service listening on port ${config.port}`, 'Bootstrap');
}

void bootstrap();
