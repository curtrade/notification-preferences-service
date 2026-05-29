import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Точка монтирования Swagger UI. JSON-схема OpenAPI отдаётся по адресу
 * `${SWAGGER_PATH}-json` (поведение SwaggerModule по умолчанию).
 */
export const SWAGGER_PATH = 'docs';

/**
 * Собирает документ OpenAPI и публикует Swagger UI.
 *
 * Вызывается из bootstrap после создания приложения, но до `listen`. Вынесено
 * в отдельную функцию, чтобы переиспользовать в e2e-тестах без поднятия HTTP.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Сервис настроек уведомлений')
    .setDescription(
      'HTTP API сервиса настроек уведомлений — единый источник истины о том, ' +
        'можно ли отправить пользователю конкретное уведомление. Сервис учитывает ' +
        'глобальные политики, пользовательские настройки и «тихие часы».',
    )
    .setVersion('0.1.0')
    .addTag('evaluate', 'Проверка, можно ли отправить уведомление')
    .addTag('preferences', 'Чтение и изменение настроек пользователя')
    .addTag('health', 'Проверка работоспособности сервиса')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
