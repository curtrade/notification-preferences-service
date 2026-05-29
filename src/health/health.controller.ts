import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Проверка работоспособности сервиса' })
  @ApiOkResponse({
    description: 'Сервис работает.',
    schema: { example: { status: 'ok' } },
  })
  check(): { status: string } {
    return { status: 'ok' };
  }
}
