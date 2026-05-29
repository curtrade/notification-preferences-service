import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EvaluationService } from './evaluation.service';
import { EvaluateRequestDto } from './dto/evaluate-request.dto';
import { EvaluateResponse } from './dto/evaluate-response.dto';

@ApiTags('evaluate')
@Controller('evaluate')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Проверить, можно ли отправить уведомление',
    description:
      'Возвращает решение «allow»/«deny» с учётом глобальных политик, ' +
      'пользовательских настроек и «тихих часов». При отказе указывается причина.',
  })
  @ApiOkResponse({ description: 'Решение принято.', type: EvaluateResponse })
  @ApiBadRequestResponse({ description: 'Тело запроса не прошло валидацию.' })
  evaluate(@Body() dto: EvaluateRequestDto): Promise<EvaluateResponse> {
    return this.evaluationService.evaluate(dto);
  }
}
