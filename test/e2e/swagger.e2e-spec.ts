import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupSwagger } from '../../src/swagger/setup-swagger';

// Boots the full application and verifies the OpenAPI document is built from the
// real route metadata: tags, paths, and response schemas of every controller.
describe('Swagger (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the Swagger UI at /docs', () => {
    return request(app.getHttpServer())
      .get('/docs')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('swagger-ui');
      });
  });

  it('exposes Russian metadata in the OpenAPI JSON', () => {
    return request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect((res) => {
        expect(res.body.openapi).toMatch(/^3\./);
        expect(res.body.info.title).toBe('Сервис настроек уведомлений');
        expect(res.body.info.description).toContain('единый источник истины');
      });
  });

  it('documents every endpoint with its schema', () => {
    return request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect((res) => {
        expect(res.body.paths['/health']).toBeDefined();
        expect(res.body.paths['/evaluate'].post).toBeDefined();
        expect(res.body.paths['/users/{id}/preferences'].get).toBeDefined();
        expect(res.body.paths['/users/{id}/preferences'].post).toBeDefined();

        // Response DTOs were converted to classes, so their schemas are emitted.
        expect(res.body.components.schemas.EvaluateResponse).toBeDefined();
        expect(res.body.components.schemas.PreferencesResponse).toBeDefined();
      });
  });
});
