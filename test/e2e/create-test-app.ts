import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

/**
 * Boots the full application the same way main.ts does (same global pipe) so
 * e2e tests exercise the real validation and DI graph against Postgres.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  return app;
}

export const uniqueUserId = (): string => `test-${Math.random().toString(36).slice(2, 10)}`;
